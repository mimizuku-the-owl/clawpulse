import { mutation } from "./_generated/server";

export const seedTimeSeries = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 86400000;

    // Check if we already have 30 days of globalStats
    const existingGlobal = await ctx.db.query("globalStats").collect();
    if (existingGlobal.length >= 25) {
      return "Already have enough time-series data.";
    }

    // Remove existing globalStats and dailyStats to re-seed cleanly
    for (const g of existingGlobal) {
      await ctx.db.delete(g._id);
    }
    const existingDaily = await ctx.db.query("dailyStats").collect();
    for (const d of existingDaily) {
      await ctx.db.delete(d._id);
    }

    // Get all agents
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) return "No agents found. Run seedAll first.";

    // Base daily spend per agent (derived from their totalSpend / daysActive)
    const agentBaseCost: Record<string, number> = {};
    for (const a of agents) {
      agentBaseCost[a._id] = a.daysActive > 0 ? a.totalSpend / a.daysActive : 1;
    }

    // Generate 30 days of data
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now - d * DAY);
      const dateStr = date.toISOString().split("T")[0];

      let dayTotalCost = 0;
      let dayTotalTokens = 0;
      let dayActiveAgents = 0;
      const providerSpend: Record<string, number> = {};
      const modelCount: Record<string, number> = {};

      for (const agent of agents) {
        // Not all agents active every day — probability based on their streak/activity
        const activityProb = Math.min(0.95, (agent.daysActive / 60) * 0.8 + 0.2);
        if (Math.random() > activityProb && d > 5) continue;

        dayActiveAgents++;

        // Cost with some variance + slight upward trend over time
        const trendMultiplier = 0.7 + (30 - d) * 0.015; // grows ~1.5% per day
        const variance = 0.4 + Math.random() * 1.2;
        const dayCost = Math.round(agentBaseCost[agent._id] * variance * trendMultiplier * 100) / 100;

        const dayTokens = Math.round(dayCost * (40000 + Math.random() * 80000));
        const sessions = Math.floor(2 + Math.random() * (agent.totalSessions / agent.daysActive) * 1.5);

        dayTotalCost += dayCost;
        dayTotalTokens += dayTokens;

        providerSpend[agent.provider] = (providerSpend[agent.provider] ?? 0) + dayCost;
        modelCount[agent.model] = (modelCount[agent.model] ?? 0) + 1;

        // Insert dailyStats for this agent
        await ctx.db.insert("dailyStats", {
          agentId: agent._id,
          date: dateStr,
          totalCost: dayCost,
          totalTokens: dayTokens,
          sessionCount: sessions,
          primaryModel: agent.model,
          primaryProvider: agent.provider,
        });
      }

      // Round provider spend
      for (const k of Object.keys(providerSpend)) {
        providerSpend[k] = Math.round(providerSpend[k] * 100) / 100;
      }

      // Insert globalStats for the day
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

    return `Seeded 30 days of dailyStats and globalStats for ${agents.length} agents.`;
  },
});
