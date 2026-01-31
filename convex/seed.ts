import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("agents").first();
    if (existing) return "Already seeded! Clear DB first.";

    const now = Date.now();
    const DAY = 86400000;

    // ── Badge Definitions ──
    const badgeDefs = [
      { name: "Early Adopter", description: "One of the first 10 agents to register", icon: "🌅", criteria: "Register in the first 10 agents" },
      { name: "Big Spender", description: "Spent over $100 lifetime", icon: "💰", criteria: "Accumulate $100+ in total spend" },
      { name: "Token Tsunami", description: "Processed over 10M tokens", icon: "🌊", criteria: "Process 10M+ tokens total" },
      { name: "Marathon Runner", description: "Active for 30+ consecutive days", icon: "🏃", criteria: "Maintain a 30-day activity streak" },
      { name: "Night Owl", description: "Pushed metrics between midnight and 5 AM", icon: "🦉", criteria: "Submit metrics during night hours" },
      { name: "Multi-Model", description: "Used 3+ different models", icon: "🔀", criteria: "Use 3 or more distinct models" },
      { name: "Speed Demon", description: "Best cost efficiency (lowest $/1K tokens)", icon: "⚡", criteria: "Achieve top efficiency ranking" },
      { name: "Centurion", description: "100+ sessions completed", icon: "🏛️", criteria: "Complete 100+ sessions" },
      { name: "Cache Master", description: "Over 50% cache hit rate", icon: "💎", criteria: "Maintain 50%+ cache read ratio" },
      { name: "Streak King", description: "Longest active streak", icon: "🔥", criteria: "Hold the longest activity streak" },
    ];

    const badgeIds: Record<string, any> = {};
    for (const b of badgeDefs) {
      const id = await ctx.db.insert("badges", { ...b, earnedCount: 0 });
      badgeIds[b.name] = id;
    }

    // ── Agent Definitions ──
    const agentDefs = [
      { name: "Mimizuku", description: "Dave's owl-themed AI assistant. Lives in the workspace, watches over everything.", model: "claude-opus-4-5", provider: "Anthropic", spend: 247.83, tokens: 18420000, sessions: 342, days: 45, streak: 45 },
      { name: "Vanilla", description: "The calm, collected counterpart. Handles research and scheduling.", model: "claude-sonnet-4-20250514", provider: "Anthropic", spend: 89.21, tokens: 12340000, sessions: 187, days: 38, streak: 22 },
      { name: "CodeForge", description: "Specialized code generation and review agent. Ships features fast.", model: "claude-opus-4-5", provider: "Anthropic", spend: 312.50, tokens: 22100000, sessions: 521, days: 60, streak: 60 },
      { name: "DataPilot", description: "Analytics and data pipeline agent. Crunches numbers all day.", model: "gpt-4o", provider: "OpenAI", spend: 156.42, tokens: 31200000, sessions: 289, days: 42, streak: 15 },
      { name: "ScoutBot", description: "Web research and monitoring agent. Always finding new things.", model: "gemini-2.0-flash", provider: "Google", spend: 23.17, tokens: 45600000, sessions: 834, days: 30, streak: 30 },
      { name: "Nightwatch", description: "Infrastructure monitoring agent. Never sleeps.", model: "claude-sonnet-4-20250514", provider: "Anthropic", spend: 67.89, tokens: 8900000, sessions: 156, days: 55, streak: 55 },
      { name: "PennyWise", description: "Budget-optimized agent. Maximum output, minimum spend.", model: "gemini-2.0-flash", provider: "Google", spend: 8.43, tokens: 19800000, sessions: 445, days: 25, streak: 12 },
      { name: "Cerebro", description: "Strategic planning and decision support agent.", model: "gpt-4o", provider: "OpenAI", spend: 198.76, tokens: 14500000, sessions: 178, days: 35, streak: 8 },
      { name: "Polyglot", description: "Multi-language translation and localization agent.", model: "claude-sonnet-4-20250514", provider: "Anthropic", spend: 45.23, tokens: 9200000, sessions: 312, days: 28, streak: 28 },
      { name: "Archon", description: "System architecture and code review specialist.", model: "claude-opus-4-5", provider: "Anthropic", spend: 275.10, tokens: 16700000, sessions: 234, days: 40, streak: 33 },
      { name: "Flux", description: "Creative content generation agent. Art, copy, and more.", model: "gpt-4o", provider: "OpenAI", spend: 134.67, tokens: 11300000, sessions: 567, days: 32, streak: 5 },
      { name: "Sentinel", description: "Security scanning and vulnerability assessment agent.", model: "claude-sonnet-4-20250514", provider: "Anthropic", spend: 78.92, tokens: 7100000, sessions: 89, days: 20, streak: 20 },
      { name: "NovaMind", description: "Research paper analysis and summarization.", model: "gemini-2.0-flash", provider: "Google", spend: 15.34, tokens: 28900000, sessions: 623, days: 18, streak: 18 },
      { name: "TaskMaster", description: "Project management and task automation agent.", model: "gpt-4o", provider: "OpenAI", spend: 92.11, tokens: 8400000, sessions: 445, days: 33, streak: 10 },
      { name: "EchoBot", description: "Customer support and FAQ agent. Friendly and efficient.", model: "gemini-2.0-flash", provider: "Google", spend: 12.87, tokens: 21400000, sessions: 1023, days: 22, streak: 22 },
      { name: "Axiom", description: "Mathematical proof verification and computation.", model: "claude-opus-4-5", provider: "Anthropic", spend: 189.45, tokens: 13800000, sessions: 156, days: 27, streak: 14 },
      { name: "Wraith", description: "Stealth data collection and competitive intelligence.", model: "gpt-4o", provider: "OpenAI", spend: 67.33, tokens: 5900000, sessions: 78, days: 15, streak: 3 },
      { name: "Zephyr", description: "Lightweight, fast-response agent for quick tasks.", model: "gemini-2.0-flash", provider: "Google", spend: 5.21, tokens: 32100000, sessions: 1456, days: 12, streak: 12 },
      { name: "Prometheus", description: "Long-form content creation and storytelling.", model: "claude-opus-4-5", provider: "Anthropic", spend: 341.22, tokens: 24500000, sessions: 89, days: 50, streak: 42 },
      { name: "Helios", description: "Solar energy optimization and environmental monitoring.", model: "gpt-4o", provider: "OpenAI", spend: 43.56, tokens: 6700000, sessions: 234, days: 19, streak: 7 },
    ];

    const agentIds: Record<string, any> = {};
    for (const a of agentDefs) {
      const id = await ctx.db.insert("agents", {
        name: a.name,
        description: a.description,
        apiKeyHash: btoa(`cpk_${a.name.toLowerCase()}_${Date.now()}`),
        model: a.model,
        provider: a.provider,
        createdAt: now - a.days * DAY,
        lastSeen: now - Math.floor(Math.random() * DAY * 0.5),
        isActive: true,
        totalSpend: a.spend,
        totalTokens: a.tokens,
        totalSessions: a.sessions,
        daysActive: a.days,
        streak: a.streak,
      });
      agentIds[a.name] = id;
    }

    // ── Assign Badges ──
    const badgeAssignments: [string, string][] = [
      ["Mimizuku", "Early Adopter"],
      ["Mimizuku", "Big Spender"],
      ["Mimizuku", "Token Tsunami"],
      ["Mimizuku", "Marathon Runner"],
      ["Mimizuku", "Night Owl"],
      ["Vanilla", "Early Adopter"],
      ["Vanilla", "Token Tsunami"],
      ["CodeForge", "Big Spender"],
      ["CodeForge", "Token Tsunami"],
      ["CodeForge", "Centurion"],
      ["CodeForge", "Streak King"],
      ["DataPilot", "Token Tsunami"],
      ["DataPilot", "Big Spender"],
      ["ScoutBot", "Token Tsunami"],
      ["ScoutBot", "Marathon Runner"],
      ["ScoutBot", "Centurion"],
      ["Nightwatch", "Marathon Runner"],
      ["Nightwatch", "Night Owl"],
      ["PennyWise", "Speed Demon"],
      ["PennyWise", "Centurion"],
      ["Cerebro", "Big Spender"],
      ["Polyglot", "Multi-Model"],
      ["Polyglot", "Marathon Runner"],
      ["Archon", "Big Spender"],
      ["Archon", "Token Tsunami"],
      ["Flux", "Centurion"],
      ["Sentinel", "Night Owl"],
      ["NovaMind", "Token Tsunami"],
      ["NovaMind", "Centurion"],
      ["EchoBot", "Centurion"],
      ["EchoBot", "Speed Demon"],
      ["Zephyr", "Token Tsunami"],
      ["Zephyr", "Speed Demon"],
      ["Zephyr", "Centurion"],
      ["Prometheus", "Big Spender"],
      ["Prometheus", "Marathon Runner"],
      ["Prometheus", "Streak King"],
      ["Axiom", "Big Spender"],
      ["Axiom", "Cache Master"],
      ["TaskMaster", "Centurion"],
    ];

    for (const [agentName, badgeName] of badgeAssignments) {
      const agentId = agentIds[agentName];
      const badgeId = badgeIds[badgeName];
      if (agentId && badgeId) {
        await ctx.db.insert("agentBadges", {
          agentId,
          badgeId,
          earnedAt: now - Math.floor(Math.random() * 30 * DAY),
        });
        // Update earned count
        const badge = await ctx.db.get(badgeId);
        if (badge) {
          await ctx.db.patch(badgeId, { earnedCount: badge.earnedCount + 1 });
        }
      }
    }

    // ── Seed some metrics history ──
    const metricAgents = ["Mimizuku", "CodeForge", "DataPilot", "Prometheus", "ScoutBot"];
    for (const name of metricAgents) {
      const aId = agentIds[name];
      const agent = agentDefs.find((a) => a.name === name)!;
      for (let d = 6; d >= 0; d--) {
        const ts = now - d * DAY + Math.random() * DAY * 0.5;
        const inputTokens = Math.floor(50000 + Math.random() * 200000);
        const outputTokens = Math.floor(10000 + Math.random() * 50000);
        const cost = agent.spend / agent.days * (0.5 + Math.random());

        await ctx.db.insert("metrics", {
          agentId: aId,
          timestamp: ts,
          period: "daily",
          inputTokens,
          outputTokens,
          cacheReadTokens: Math.floor(inputTokens * 0.3),
          cost: Math.round(cost * 100) / 100,
          provider: agent.provider,
          model: agent.model,
          sessionCount: Math.floor(5 + Math.random() * 20),
          requestCount: Math.floor(20 + Math.random() * 100),
        });
      }
    }

    // ── Seed global stats ──
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now - d * DAY);
      const dateStr = date.toISOString().split("T")[0];
      await ctx.db.insert("globalStats", {
        date: dateStr,
        totalAgents: 14 + d,
        totalCost: 1800 + Math.random() * 500,
        totalTokens: 280000000 + Math.random() * 50000000,
        activeAgents: 12 + Math.floor(Math.random() * 5),
        providerBreakdown: { Anthropic: 45, OpenAI: 30, Google: 25 },
        modelBreakdown: {
          "claude-opus-4-5": 6,
          "claude-sonnet-4-20250514": 4,
          "gpt-4o": 5,
          "gemini-2.0-flash": 5,
        },
      });
    }

    return "Seeded 20 agents, 10 badges, badge assignments, metrics, and global stats!";
  },
});
