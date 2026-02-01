import { mutation } from "./_generated/server";

export const seedTimeSeries = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 86400000;

    // Clean existing time-series data
    const existingGlobal = await ctx.db.query("globalStats").collect();
    for (const g of existingGlobal) {
      await ctx.db.delete(g._id);
    }
    const existingDaily = await ctx.db.query("dailyStats").collect();
    for (const d of existingDaily) {
      await ctx.db.delete(d._id);
    }
    // Clean existing metrics too so analytics queries work
    const existingMetrics = await ctx.db.query("metrics").collect();
    for (const m of existingMetrics) {
      await ctx.db.delete(m._id);
    }

    // Get all real agents
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) return "No agents found.";

    // Realistic daily averages based on actual totals spread over 30 days
    // We'll generate 30 days then update the agent totals to match
    const agentTotals: Record<
      string,
      {
        spend: number;
        tokens: number;
        sessions: number;
        inputTokens: number;
        outputTokens: number;
        cacheTokens: number;
      }
    > = {};

    for (const a of agents) {
      agentTotals[a._id] = {
        spend: 0,
        tokens: 0,
        sessions: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheTokens: 0,
      };
    }

    // Base daily cost for each agent (from their known totalSpend)
    const baseDailyCost: Record<string, number> = {};
    for (const a of agents) {
      baseDailyCost[a._id] = a.totalSpend / 30;
    }

    // Simple seeded random for reproducibility
    let seed = 42;
    function rand() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    // Generate 30 days
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now - d * DAY);
      const dateStr = date.toISOString().split("T")[0];
      const timestamp = date.getTime();

      let dayTotalCost = 0;
      let dayTotalTokens = 0;
      let dayActiveAgents = 0;
      const providerSpend: Record<string, number> = {};
      const modelCount: Record<string, number> = {};

      for (const agent of agents) {
        dayActiveAgents++;

        // Cost with ±30% variance and slight upward trend
        const trendMultiplier = 0.85 + (30 - d) * 0.01;
        const variance = 0.7 + rand() * 0.6; // 0.7 to 1.3
        const dayCost =
          Math.round(
            baseDailyCost[agent._id] * variance * trendMultiplier * 100,
          ) / 100;

        // Token breakdown: ~40% input, ~25% output, ~35% cache read
        const totalDayTokens = Math.round(
          dayCost * (50000 + rand() * 30000),
        );
        const inputRatio = 0.35 + rand() * 0.1;
        const outputRatio = 0.2 + rand() * 0.1;
        const cacheRatio = 1 - inputRatio - outputRatio;
        const inputTokens = Math.round(totalDayTokens * inputRatio);
        const outputTokens = Math.round(totalDayTokens * outputRatio);
        const cacheTokens = Math.round(totalDayTokens * cacheRatio);

        const sessions = Math.max(
          1,
          Math.floor(
            (agent.totalSessions / 30) * (0.5 + rand()),
          ),
        );

        dayTotalCost += dayCost;
        dayTotalTokens += totalDayTokens;

        providerSpend[agent.provider] =
          (providerSpend[agent.provider] ?? 0) + dayCost;
        modelCount[agent.model] = (modelCount[agent.model] ?? 0) + 1;

        // Track totals
        agentTotals[agent._id].spend += dayCost;
        agentTotals[agent._id].tokens += totalDayTokens;
        agentTotals[agent._id].sessions += sessions;
        agentTotals[agent._id].inputTokens += inputTokens;
        agentTotals[agent._id].outputTokens += outputTokens;
        agentTotals[agent._id].cacheTokens += cacheTokens;

        // Insert dailyStats
        await ctx.db.insert("dailyStats", {
          agentId: agent._id,
          date: dateStr,
          totalCost: Math.max(0.01, dayCost),
          totalTokens: totalDayTokens,
          sessionCount: sessions,
          primaryModel: agent.model,
          primaryProvider: agent.provider,
        });

        // Insert metrics entry (for token breakdown queries)
        await ctx.db.insert("metrics", {
          agentId: agent._id,
          timestamp,
          period: "daily",
          inputTokens,
          outputTokens,
          cacheReadTokens: cacheTokens,
          cost: Math.max(0.01, dayCost),
          provider: agent.provider,
          model: agent.model,
          sessionCount: sessions,
          requestCount: Math.round(sessions * (3 + rand() * 5)),
        });
      }

      // Round provider spend
      for (const k of Object.keys(providerSpend)) {
        providerSpend[k] = Math.round(providerSpend[k] * 100) / 100;
      }

      // Insert globalStats
      await ctx.db.insert("globalStats", {
        date: dateStr,
        totalAgents: agents.length,
        totalCost: Math.round(dayTotalCost * 100) / 100,
        totalTokens: dayTotalTokens,
        activeAgents: dayActiveAgents,
        providerBreakdown: providerSpend,
        modelBreakdown: modelCount,
      });
    }

    // Update agent records to match generated totals
    for (const agent of agents) {
      const t = agentTotals[agent._id];
      await ctx.db.patch(agent._id, {
        totalSpend: Math.round(t.spend * 100) / 100,
        totalTokens: t.tokens,
        totalSessions: t.sessions,
        daysActive: 30,
        streak: 30,
        lastSeen: now,
      });
    }

    return `Seeded 30 days of time-series data for ${agents.length} agents. Metrics, dailyStats, and globalStats all populated.`;
  },
});
