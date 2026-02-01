import { query } from "./_generated/server";
import { v } from "convex/values";

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

// List ALL agents for the public directory page
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();

    // Enrich each agent with badges + API key prefix
    const enriched = await Promise.all(
      agents.map(async (agent) => {
        // Badges
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

        // API key prefix (for display)
        const keyRecord = await ctx.db
          .query("apiKeys")
          .withIndex("by_agentId", (q) => q.eq("agentId", agent._id))
          .first();

        return {
          ...agent,
          badges: badges.filter(Boolean),
          apiKeyPrefix: keyRecord?.prefix ?? null,
        };
      }),
    );

    // Sort newest first
    enriched.sort((a, b) => b.createdAt - a.createdAt);

    return enriched;
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
