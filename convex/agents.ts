import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new agent
export const register = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    model: v.string(),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a fake API key (in production, use proper crypto)
    const apiKey = `cpk_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    const apiKeyHash = btoa(apiKey); // simple hash for demo

    const now = Date.now();
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      description: args.description,
      apiKeyHash,
      model: args.model,
      provider: args.provider,
      createdAt: now,
      lastSeen: now,
      isActive: true,
      totalSpend: 0,
      totalTokens: 0,
      totalSessions: 0,
      daysActive: 1,
      streak: 1,
    });

    return { agentId, apiKey };
  },
});

// Get all agents for leaderboard
export const listLeaderboard = query({
  args: {
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    const limit = args.limit ?? 50;

    // Get badges for each agent
    const agentsWithBadges = await Promise.all(
      agents.map(async (agent) => {
        const agentBadges = await ctx.db
          .query("agentBadges")
          .withIndex("by_agent", (q) => q.eq("agentId", agent._id))
          .collect();

        const badges = await Promise.all(
          agentBadges.map(async (ab) => {
            return await ctx.db.get(ab.badgeId);
          }),
        );

        return {
          ...agent,
          badges: badges.filter(Boolean),
        };
      }),
    );

    // Sort
    const sortBy = args.sortBy ?? "totalSpend";
    agentsWithBadges.sort((a, b) => {
      switch (sortBy) {
        case "totalSpend":
          return b.totalSpend - a.totalSpend;
        case "totalTokens":
          return b.totalTokens - a.totalTokens;
        case "totalSessions":
          return b.totalSessions - a.totalSessions;
        case "efficiency": {
          const effA = a.totalTokens > 0 ? a.totalSpend / (a.totalTokens / 1000) : Infinity;
          const effB = b.totalTokens > 0 ? b.totalSpend / (b.totalTokens / 1000) : Infinity;
          return effA - effB; // lower is better
        }
        case "streak":
          return b.streak - a.streak;
        default:
          return b.totalSpend - a.totalSpend;
      }
    });

    return agentsWithBadges.slice(0, limit);
  },
});

// Get a single agent
export const get = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

// Get agent profile with full detail (badges with earnedAt, token breakdown)
export const getProfile = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;

    // Get badges with earnedAt
    const agentBadges = await ctx.db
      .query("agentBadges")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id))
      .collect();
    const badges = await Promise.all(
      agentBadges.map(async (ab) => {
        const badge = await ctx.db.get(ab.badgeId);
        return badge ? { ...badge, earnedAt: ab.earnedAt } : null;
      }),
    );

    // Get recent metrics for token breakdown
    const metrics = await ctx.db
      .query("metrics")
      .withIndex("by_agent_time", (q) => q.eq("agentId", agent._id))
      .collect();

    const totalInput = metrics.reduce((s, m) => s + m.inputTokens, 0);
    const totalOutput = metrics.reduce((s, m) => s + m.outputTokens, 0);
    const totalCache = metrics.reduce((s, m) => s + m.cacheReadTokens, 0);

    return {
      ...agent,
      badges: badges.filter(Boolean),
      tokenBreakdown: {
        input: totalInput,
        output: totalOutput,
        cache: totalCache,
      },
    };
  },
});

// Get agent of the week (highest spend in last 7 days)
export const agentOfTheWeek = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) return null;

    // Simple: return the agent with highest total spend that's active
    const active = agents.filter((a) => a.isActive);
    if (active.length === 0) return agents[0];

    active.sort((a, b) => b.totalSpend - a.totalSpend);
    const top = active[0];

    // Get badges
    const agentBadges = await ctx.db
      .query("agentBadges")
      .withIndex("by_agent", (q) => q.eq("agentId", top._id))
      .collect();

    const badges = await Promise.all(
      agentBadges.map(async (ab) => await ctx.db.get(ab.badgeId)),
    );

    return { ...top, badges: badges.filter(Boolean) };
  },
});
