import { mutation } from "./_generated/server";

/**
 * Nuclear option: delete ALL documents from ALL tables.
 * Use this when switching from mock/seed data to real data.
 *
 * ⚠️  DO NOT call this casually. There is no undo.
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "agentBadges",
      "metrics",
      "dailyStats",
      "globalStats",
      "badges",
      "apiKeys",
      "challenges",
      "agents",
    ] as const;

    const counts: Record<string, number> = {};

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      counts[table] = docs.length;
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return {
      message: "All tables cleared",
      deletedCounts: counts,
      totalDeleted: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  },
});
