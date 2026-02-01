import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ─── Crypto Helpers ──────────────────────────────────────────────────

/** SHA-256 hash a string, return hex */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a cryptographically strong API key: cpk_ + 32 random hex chars */
function generateApiKey(): string {
  const bytes = new Uint8Array(16); // 16 bytes = 32 hex chars
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `cpk_${hex}`;
}

/** Generate a random nonce string */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── 1. Registration ────────────────────────────────────────────────

export const register = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    model: v.string(),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.name.trim()) throw new Error("Name is required");
    if (args.name.length > 64) throw new Error("Name must be 64 characters or fewer");
    if (!args.description.trim()) throw new Error("Description is required");
    if (args.description.length > 256) throw new Error("Description must be 256 characters or fewer");

    // Rate limit: max 5 registrations per hour per name prefix (first 4 chars)
    const namePrefix = args.name.trim().toLowerCase().slice(0, 4);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentAgents = await ctx.db
      .query("agents")
      .withIndex("by_name")
      .collect();
    const recentWithPrefix = recentAgents.filter(
      (a) =>
        a.name.toLowerCase().startsWith(namePrefix) && a.createdAt > oneHourAgo,
    );
    if (recentWithPrefix.length >= 5) {
      throw new Error(
        "Rate limit exceeded: too many registrations with similar names. Try again later.",
      );
    }

    // Check for exact name duplicate
    const existingByName = recentAgents.find(
      (a) => a.name.toLowerCase() === args.name.trim().toLowerCase(),
    );
    if (existingByName) {
      throw new Error(`Agent name "${args.name}" is already taken`);
    }

    const now = Date.now();

    // Generate the API key
    const apiKey = generateApiKey();
    const keyHash = await sha256(apiKey);
    const prefix = apiKey.slice(0, 8); // "cpk_XXXX"

    // Create the agent
    const agentId = await ctx.db.insert("agents", {
      name: args.name.trim(),
      description: args.description.trim(),
      model: args.model,
      provider: args.provider,
      createdAt: now,
      lastSeen: now,
      isActive: true,
      isVerified: false,
      totalSpend: 0,
      totalTokens: 0,
      totalSessions: 0,
      daysActive: 1,
      streak: 1,
    });

    // Store the API key hash
    await ctx.db.insert("apiKeys", {
      agentId,
      keyHash,
      prefix,
      createdAt: now,
      lastUsed: now,
      isActive: true,
    });

    return {
      agentId,
      apiKey,
      message: "Store this key — it won't be shown again",
    };
  },
});

// ─── 2. Key Validation ──────────────────────────────────────────────

/** Internal query to validate an API key and return agent info */
export const validateKeyInternal = internalQuery({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .first();

    if (!keyRecord || !keyRecord.isActive) return null;

    const agent = await ctx.db.get(keyRecord.agentId);
    if (!agent || !agent.isActive) return null;

    return { agent, keyRecord };
  },
});

/** Internal mutation to update lastUsed on key */
export const touchKey = internalMutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keyId, { lastUsed: Date.now() });
  },
});

/** Public query to validate a key — returns agent info or null */
export const validateKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const keyHash = await sha256(args.apiKey);

    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!keyRecord || !keyRecord.isActive) return null;

    const agent = await ctx.db.get(keyRecord.agentId);
    if (!agent || !agent.isActive) return null;

    return {
      agentId: agent._id,
      name: agent.name,
      model: agent.model,
      provider: agent.provider,
      isVerified: agent.isVerified,
      totalSpend: agent.totalSpend,
      totalTokens: agent.totalTokens,
    };
  },
});

// ─── 3. Authenticated Metrics Push ──────────────────────────────────

export const pushMetrics = mutation({
  args: {
    apiKey: v.string(),
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
    // Validate the API key
    const keyHash = await sha256(args.apiKey);

    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!keyRecord || !keyRecord.isActive) {
      throw new Error("Invalid or inactive API key");
    }

    const agent = await ctx.db.get(keyRecord.agentId);
    if (!agent || !agent.isActive) {
      throw new Error("Agent not found or inactive");
    }

    // Update key last used
    await ctx.db.patch(keyRecord._id, { lastUsed: Date.now() });

    const now = Date.now();

    // Insert the metrics
    await ctx.db.insert("metrics", {
      agentId: keyRecord.agentId,
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
    const totalTokens =
      args.inputTokens + args.outputTokens + (args.cacheReadTokens ?? 0);
    await ctx.db.patch(keyRecord.agentId, {
      totalSpend: agent.totalSpend + args.cost,
      totalTokens: agent.totalTokens + totalTokens,
      totalSessions: agent.totalSessions + (args.sessionCount ?? 0),
      lastSeen: now,
      model: args.model,
      provider: args.provider,
    });

    return { success: true, agentId: keyRecord.agentId };
  },
});

// ─── 4. Inference Challenge ─────────────────────────────────────────

export const getChallenge = mutation({
  args: {},
  handler: async (ctx) => {
    const nonce = generateNonce();
    const expectedHash = await sha256(nonce);
    const now = Date.now();
    const expiresAt = now + 60 * 1000; // 60 seconds

    const challengeId = await ctx.db.insert("challenges", {
      nonce,
      expectedHash,
      createdAt: now,
      expiresAt,
      used: false,
    });

    return {
      challengeId,
      task: `Compute SHA-256 of: ${nonce}`,
      nonce,
      expiresAt,
    };
  },
});

// ─── 5. Verify Challenge ────────────────────────────────────────────

export const verifyChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
    answer: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the challenge
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    if (challenge.used) {
      throw new Error("Challenge already used");
    }
    if (Date.now() > challenge.expiresAt) {
      throw new Error("Challenge expired");
    }

    // Verify the answer
    if (args.answer.toLowerCase() !== challenge.expectedHash.toLowerCase()) {
      throw new Error("Incorrect answer");
    }

    // Mark challenge as used
    await ctx.db.patch(args.challengeId, { used: true });

    // Validate the API key to find the agent
    const keyHash = await sha256(args.apiKey);
    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!keyRecord || !keyRecord.isActive) {
      throw new Error("Invalid API key");
    }

    const agent = await ctx.db.get(keyRecord.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Mark agent as verified
    await ctx.db.patch(keyRecord.agentId, { isVerified: true });

    return {
      success: true,
      agentId: keyRecord.agentId,
      message: "Agent verified successfully",
    };
  },
});
