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

// Ecosystem spend timeline (last 30 days)
export const ecosystemTimeline = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("globalStats").collect();
    // Sort by date ascending
    stats.sort((a, b) => a.date.localeCompare(b.date));
    // Return last 30 entries
    return stats.slice(-30).map((s) => ({
      date: s.date,
      cost: Math.round(s.totalCost * 100) / 100,
      tokens: s.totalTokens,
      activeAgents: s.activeAgents,
    }));
  },
});

// Agent daily stats for sparklines and profile charts
export const agentTimeline = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("dailyStats")
      .withIndex("by_agent_date", (q) => q.eq("agentId", args.agentId))
      .collect();

    stats.sort((a, b) => a.date.localeCompare(b.date));

    return stats.slice(-30).map((s) => ({
      date: s.date,
      cost: Math.round(s.totalCost * 100) / 100,
      tokens: s.totalTokens,
      sessions: s.sessionCount,
    }));
  },
});

// Health check — returns basic system status
export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    const agentCount = (await ctx.db.query("agents").collect()).length;
    const latestGlobal = await ctx.db.query("globalStats").order("desc").first();
    return {
      dbOk: true,
      agentCount,
      latestDate: latestGlobal?.date ?? null,
      timestamp: Date.now(),
    };
  },
});
