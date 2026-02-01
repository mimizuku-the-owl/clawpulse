import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Registered agents in the ecosystem
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    model: v.string(),
    provider: v.string(),
    createdAt: v.number(),
    lastSeen: v.number(),
    isActive: v.boolean(),
    isVerified: v.boolean(),
    totalSpend: v.number(),
    totalTokens: v.number(),
    totalSessions: v.number(),
    daysActive: v.number(),
    streak: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_provider", ["provider"])
    .index("by_totalSpend", ["totalSpend"])
    .index("by_totalTokens", ["totalTokens"])
    .index("by_streak", ["streak"])
    .index("by_isActive", ["isActive"]),

  // API keys for agent authentication (separate from agents table)
  apiKeys: defineTable({
    agentId: v.id("agents"),
    keyHash: v.string(), // SHA-256 hex of the full key
    prefix: v.string(), // first 8 chars for identification (e.g. "cpk_ab12")
    createdAt: v.number(),
    lastUsed: v.number(),
    isActive: v.boolean(),
  })
    .index("by_keyHash", ["keyHash"])
    .index("by_agentId", ["agentId"]),

  // Inference challenges for bot verification
  challenges: defineTable({
    nonce: v.string(),
    expectedHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_nonce", ["nonce"]),

  // Periodic metric snapshots pushed by agents
  metrics: defineTable({
    agentId: v.id("agents"),
    timestamp: v.number(),
    period: v.string(), // "hourly" | "daily"
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheReadTokens: v.number(),
    cost: v.number(),
    provider: v.string(),
    model: v.string(),
    sessionCount: v.number(),
    requestCount: v.number(),
  })
    .index("by_agent_time", ["agentId", "timestamp"])
    .index("by_period", ["period", "timestamp"]),

  // Pre-aggregated daily stats per agent
  dailyStats: defineTable({
    agentId: v.id("agents"),
    date: v.string(), // "YYYY-MM-DD"
    totalCost: v.number(),
    totalTokens: v.number(),
    sessionCount: v.number(),
    primaryModel: v.string(),
    primaryProvider: v.string(),
  })
    .index("by_agent_date", ["agentId", "date"])
    .index("by_date", ["date"]),

  // Ecosystem-wide aggregates
  globalStats: defineTable({
    date: v.string(), // "YYYY-MM-DD"
    totalAgents: v.number(),
    totalCost: v.number(),
    totalTokens: v.number(),
    activeAgents: v.number(),
    providerBreakdown: v.record(v.string(), v.number()),
    modelBreakdown: v.record(v.string(), v.number()),
  }).index("by_date", ["date"]),

  // Badge definitions
  badges: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(), // emoji or icon name
    criteria: v.string(),
    earnedCount: v.number(),
  }).index("by_name", ["name"]),

  // Junction table: agent <-> badge
  agentBadges: defineTable({
    agentId: v.id("agents"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_badge", ["badgeId"]),
});
