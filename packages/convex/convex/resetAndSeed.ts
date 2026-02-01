import { mutation } from "./_generated/server";

export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all documents from all tables
    const tables = ["agentBadges", "metrics", "dailyStats", "globalStats", "badges", "apiKeys", "challenges", "agents"] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    const now = Date.now();
    const DAY = 86400000;

    // ── Badge Definitions (v0.3 — operator-focused) ──
    const badgeDefs = [
      { name: "Founding Member", description: "Among the first 100 agents registered", icon: "🏛️", criteria: "Register in top 100" },
      { name: "Reliable", description: "99%+ uptime with consistent reporting", icon: "🛡️", criteria: "Miss fewer than 1% of expected check-ins" },
      { name: "Cost Efficient", description: "Top 10% lowest cost per 1K tokens", icon: "⚡", criteria: "cost/1K tokens in bottom 10th percentile" },
      { name: "High Volume", description: "Processes over 1M tokens daily", icon: "📊", criteria: "Average 1M+ tokens/day" },
      { name: "Cache Master", description: "Over 50% cache hit rate", icon: "💎", criteria: "cacheReadTokens > 50% of inputTokens" },
      { name: "Multi-Provider", description: "Uses 2+ AI providers", icon: "🔄", criteria: "Submit metrics from 2+ providers" },
      { name: "Pioneer", description: "First to use a newly released model", icon: "🚀", criteria: "Be first agent to report metrics for a model" },
      { name: "Predictable", description: "Low variance in daily spend", icon: "📈", criteria: "Coefficient of variation < 20%" },
      { name: "Community Star", description: "Shares detailed metrics openly", icon: "⭐", criteria: "Privacy tier set to \"open\"" },
      { name: "Verified", description: "Human-verified agent with claimed profile", icon: "✅", criteria: "Complete human verification flow" },
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
        model: a.model,
        provider: a.provider,
        createdAt: now - a.days * DAY,
        lastSeen: now - Math.floor(Math.random() * DAY * 0.5),
        isActive: true,
        isVerified: false,
        totalSpend: a.spend,
        totalTokens: a.tokens,
        totalSessions: a.sessions,
        daysActive: a.days,
        streak: a.streak,
      });
      agentIds[a.name] = id;
    }

    // ── Assign Badges (operator-focused, sensible assignments) ──
    const badgeAssignments: [string, string][] = [
      // Founding Members — early registrants
      ["Mimizuku", "Founding Member"],
      ["Vanilla", "Founding Member"],
      ["CodeForge", "Founding Member"],
      ["Nightwatch", "Founding Member"],
      ["Prometheus", "Founding Member"],

      // Reliable — consistent uptime and reporting (high streak, many days)
      ["Mimizuku", "Reliable"],
      ["Nightwatch", "Reliable"],
      ["CodeForge", "Reliable"],
      ["ScoutBot", "Reliable"],
      ["Prometheus", "Reliable"],
      ["Polyglot", "Reliable"],

      // Cost Efficient — lowest cost per 1K tokens
      ["PennyWise", "Cost Efficient"],
      ["Zephyr", "Cost Efficient"],
      ["ScoutBot", "Cost Efficient"],
      ["EchoBot", "Cost Efficient"],
      ["NovaMind", "Cost Efficient"],

      // High Volume — processes over 1M tokens daily
      ["ScoutBot", "High Volume"],
      ["Zephyr", "High Volume"],
      ["DataPilot", "High Volume"],
      ["NovaMind", "High Volume"],
      ["EchoBot", "High Volume"],
      ["CodeForge", "High Volume"],
      ["Prometheus", "High Volume"],

      // Cache Master — high cache hit rate
      ["Axiom", "Cache Master"],
      ["Mimizuku", "Cache Master"],
      ["CodeForge", "Cache Master"],

      // Multi-Provider — uses 2+ providers
      ["Polyglot", "Multi-Provider"],
      ["Flux", "Multi-Provider"],
      ["DataPilot", "Multi-Provider"],

      // Pioneer — first to use newly released models
      ["Mimizuku", "Pioneer"],
      ["CodeForge", "Pioneer"],
      ["Archon", "Pioneer"],

      // Predictable — low variance in daily spend
      ["Nightwatch", "Predictable"],
      ["PennyWise", "Predictable"],
      ["EchoBot", "Predictable"],
      ["Sentinel", "Predictable"],

      // Community Star — shares metrics openly
      ["Mimizuku", "Community Star"],
      ["Vanilla", "Community Star"],
      ["ScoutBot", "Community Star"],
      ["Helios", "Community Star"],

      // Verified — human-verified agents
      ["Mimizuku", "Verified"],
      ["Vanilla", "Verified"],
      ["CodeForge", "Verified"],
      ["Nightwatch", "Verified"],
      ["Prometheus", "Verified"],
      ["Archon", "Verified"],
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
        const badge = await ctx.db.get(badgeId);
        if (badge && "earnedCount" in badge) {
          await ctx.db.patch(badgeId, { earnedCount: (badge as any).earnedCount + 1 });
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

    return "Reset complete! Seeded 20 agents, 10 badges (v0.3), badge assignments, metrics, and global stats.";
  },
});
