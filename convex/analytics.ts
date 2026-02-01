import { query } from "./_generated/server";

// Average cost per 1K tokens per provider
export const providerEfficiency = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await ctx.db.query("metrics").collect();
    const providerData: Record<
      string,
      { totalCost: number; totalTokens: number }
    > = {};

    for (const m of metrics) {
      const p = m.provider;
      if (!providerData[p]) providerData[p] = { totalCost: 0, totalTokens: 0 };
      providerData[p].totalCost += m.cost;
      providerData[p].totalTokens +=
        m.inputTokens + m.outputTokens + m.cacheReadTokens;
    }

    return Object.entries(providerData)
      .map(([provider, data]) => ({
        provider,
        costPer1K:
          data.totalTokens > 0
            ? Math.round((data.totalCost / (data.totalTokens / 1000)) * 10000) /
              10000
            : 0,
        totalCost: Math.round(data.totalCost * 100) / 100,
        totalTokens: data.totalTokens,
      }))
      .sort((a, b) => a.costPer1K - b.costPer1K);
  },
});

// Ecosystem-wide token breakdown: input vs output vs cache
export const tokenBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await ctx.db.query("metrics").collect();
    let totalInput = 0;
    let totalOutput = 0;
    let totalCache = 0;

    for (const m of metrics) {
      totalInput += m.inputTokens;
      totalOutput += m.outputTokens;
      totalCache += m.cacheReadTokens;
    }

    return { input: totalInput, output: totalOutput, cache: totalCache };
  },
});

// Daily spend per agent for last 30 days (for stacked area chart)
export const agentSpendTimeline = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const dailyStats = await ctx.db.query("dailyStats").collect();

    // Build a map: date -> { agentName: cost }
    const dateMap: Record<string, Record<string, number>> = {};
    const agentNames = agents.map((a) => a.name);
    const agentIdToName: Record<string, string> = {};
    for (const a of agents) {
      agentIdToName[a._id] = a.name;
    }

    for (const ds of dailyStats) {
      const name = agentIdToName[ds.agentId];
      if (!name) continue;
      if (!dateMap[ds.date]) {
        dateMap[ds.date] = {};
        for (const n of agentNames) dateMap[ds.date][n] = 0;
      }
      dateMap[ds.date][name] =
        Math.round(ds.totalCost * 100) / 100;
    }

    const sorted = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30);

    return {
      agentNames,
      data: sorted.map(([date, agents]) => ({
        date,
        ...agents,
      })),
    };
  },
});

// Aggregate stats per provider
export const providerComparison = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const dailyStats = await ctx.db.query("dailyStats").collect();

    const providerData: Record<
      string,
      {
        totalSpend: number;
        totalTokens: number;
        agentCount: number;
        dayCount: number;
      }
    > = {};

    // Count agents per provider
    for (const a of agents) {
      if (!providerData[a.provider])
        providerData[a.provider] = {
          totalSpend: 0,
          totalTokens: 0,
          agentCount: 0,
          dayCount: 0,
        };
      providerData[a.provider].agentCount++;
      providerData[a.provider].totalSpend += a.totalSpend;
      providerData[a.provider].totalTokens += a.totalTokens;
    }

    // Count day entries for avg tokens/day
    for (const ds of dailyStats) {
      const agent = agents.find((a) => a._id === ds.agentId);
      if (!agent) continue;
      const p = agent.provider;
      if (providerData[p]) {
        providerData[p].dayCount++;
      }
    }

    return Object.entries(providerData)
      .map(([provider, data]) => ({
        provider,
        totalSpend: Math.round(data.totalSpend * 100) / 100,
        avgTokensPerDay:
          data.dayCount > 0
            ? Math.round(data.totalTokens / data.dayCount)
            : 0,
        agentCount: data.agentCount,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  },
});

// Agents ranked by cost per 1K tokens (lower = more efficient)
export const agentEfficiency = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();

    return agents
      .map((a) => ({
        name: a.name,
        provider: a.provider,
        model: a.model,
        costPer1K:
          a.totalTokens > 0
            ? Math.round(
                (a.totalSpend / (a.totalTokens / 1000)) * 10000,
              ) / 10000
            : 0,
        totalSpend: Math.round(a.totalSpend * 100) / 100,
        totalTokens: a.totalTokens,
      }))
      .sort((a, b) => a.costPer1K - b.costPer1K);
  },
});

// Cache hit rate per agent
export const cacheRates = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const metrics = await ctx.db.query("metrics").collect();

    const agentMetrics: Record<
      string,
      { input: number; cache: number; name: string; provider: string }
    > = {};

    for (const a of agents) {
      agentMetrics[a._id] = {
        input: 0,
        cache: 0,
        name: a.name,
        provider: a.provider,
      };
    }

    for (const m of metrics) {
      if (agentMetrics[m.agentId]) {
        agentMetrics[m.agentId].input += m.inputTokens;
        agentMetrics[m.agentId].cache += m.cacheReadTokens;
      }
    }

    return Object.values(agentMetrics)
      .map((a) => ({
        name: a.name,
        provider: a.provider,
        cacheRate:
          a.input + a.cache > 0
            ? Math.round((a.cache / (a.input + a.cache)) * 1000) / 10
            : 0,
        cacheTokens: a.cache,
        inputTokens: a.input,
      }))
      .sort((a, b) => b.cacheRate - a.cacheRate);
  },
});
