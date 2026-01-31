import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Push metrics for an agent
export const push = mutation({
  args: {
    agentId: v.id("agents"),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheReadTokens: v.optional(v.number()),
    cost: v.number(),
    provider: v.string(),
    model: v.string(),
    sessionCount: v.optional(v.number()),
    requestCount: v.optional(v.number()),
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("metrics", {
      agentId: args.agentId,
      timestamp: now,
      period: args.period ?? "hourly",
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      cacheReadTokens: args.cacheReadTokens ?? 0,
      cost: args.cost,
      provider: args.provider,
      model: args.model,
      sessionCount: args.sessionCount ?? 0,
      requestCount: args.requestCount ?? 0,
    });

    // Update agent aggregates
    const agent = await ctx.db.get(args.agentId);
    if (agent) {
      const totalTokens = args.inputTokens + args.outputTokens + (args.cacheReadTokens ?? 0);
      await ctx.db.patch(args.agentId, {
        totalSpend: agent.totalSpend + args.cost,
        totalTokens: agent.totalTokens + totalTokens,
        totalSessions: agent.totalSessions + (args.sessionCount ?? 0),
        lastSeen: now,
        model: args.model,
        provider: args.provider,
      });
    }

    return { success: true };
  },
});

// Get global ecosystem stats
export const globalStats = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const totalAgents = agents.length;
    const totalCost = agents.reduce((sum, a) => sum + a.totalSpend, 0);
    const totalTokens = agents.reduce((sum, a) => sum + a.totalTokens, 0);
    const activeAgents = agents.filter((a) => a.lastSeen > oneDayAgo).length;

    // Provider breakdown by spend
    const providerBreakdown: Record<string, number> = {};
    for (const agent of agents) {
      providerBreakdown[agent.provider] = (providerBreakdown[agent.provider] ?? 0) + agent.totalSpend;
    }

    // Model breakdown by count
    const modelBreakdown: Record<string, number> = {};
    for (const agent of agents) {
      modelBreakdown[agent.model] = (modelBreakdown[agent.model] ?? 0) + 1;
    }

    return {
      totalAgents,
      totalCost,
      totalTokens,
      activeAgents,
      providerBreakdown,
      modelBreakdown,
    };
  },
});
