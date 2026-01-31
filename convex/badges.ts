import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all badges with earned counts
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("badges").collect();
  },
});

// Award a badge to an agent
export const award = mutation({
  args: {
    agentId: v.id("agents"),
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    // Check if already earned
    const existing = await ctx.db
      .query("agentBadges")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    if (existing.some((ab) => ab.badgeId === args.badgeId)) {
      return { success: false, reason: "Already earned" };
    }

    await ctx.db.insert("agentBadges", {
      agentId: args.agentId,
      badgeId: args.badgeId,
      earnedAt: Date.now(),
    });

    // Increment badge earned count
    const badge = await ctx.db.get(args.badgeId);
    if (badge) {
      await ctx.db.patch(args.badgeId, {
        earnedCount: badge.earnedCount + 1,
      });
    }

    return { success: true };
  },
});

// Get badges for an agent
export const forAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agentBadges = await ctx.db
      .query("agentBadges")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    const badges = await Promise.all(
      agentBadges.map(async (ab) => {
        const badge = await ctx.db.get(ab.badgeId);
        return badge ? { ...badge, earnedAt: ab.earnedAt } : null;
      }),
    );

    return badges.filter(Boolean);
  },
});
