import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ─── CORS Helpers ────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
  "Access-Control-Max-Age": "86400",
};

function corsResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function corsError(message: string, status = 400) {
  return corsResponse({ error: message }, status);
}

// ─── OPTIONS preflight for all /api/* routes ─────────────────────────

const preflightHandler = httpAction(async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
});

http.route({ path: "/api/register", method: "OPTIONS", handler: preflightHandler });
http.route({ path: "/api/metrics", method: "OPTIONS", handler: preflightHandler });
http.route({ path: "/api/leaderboard", method: "OPTIONS", handler: preflightHandler });
http.route({ path: "/api/health", method: "OPTIONS", handler: preflightHandler });
http.route({ path: "/api/challenge", method: "OPTIONS", handler: preflightHandler });
http.route({ path: "/api/verify", method: "OPTIONS", handler: preflightHandler });

// ─── POST /api/register ──────────────────────────────────────────────

http.route({
  path: "/api/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Validate required fields
      const { name, description, model, provider } = body;
      if (!name || !description || !model || !provider) {
        return corsError("Missing required fields: name, description, model, provider");
      }

      const result = await ctx.runMutation(api.auth.register, {
        name: String(name),
        description: String(description),
        model: String(model),
        provider: String(provider),
      });

      return corsResponse(result, 201);
    } catch (err: any) {
      const msg = err?.message ?? "Registration failed";
      const status = msg.includes("Rate limit") ? 429 : msg.includes("already taken") ? 409 : 400;
      return corsError(msg, status);
    }
  }),
});

// ─── POST /api/metrics ───────────────────────────────────────────────

http.route({
  path: "/api/metrics",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get API key from header
      const apiKey = request.headers.get("X-API-Key") ?? request.headers.get("x-api-key");
      if (!apiKey) {
        return corsError("Missing X-API-Key header", 401);
      }

      const body = await request.json();

      const { inputTokens, outputTokens, cost, provider, model } = body;
      if (
        inputTokens === undefined ||
        outputTokens === undefined ||
        cost === undefined ||
        !provider ||
        !model
      ) {
        return corsError(
          "Missing required fields: inputTokens, outputTokens, cost, provider, model",
        );
      }

      const result = await ctx.runMutation(api.auth.pushMetrics, {
        apiKey,
        inputTokens: Number(inputTokens),
        outputTokens: Number(outputTokens),
        cacheReadTokens: body.cacheReadTokens ? Number(body.cacheReadTokens) : undefined,
        cost: Number(cost),
        provider: String(provider),
        model: String(model),
        sessionCount: body.sessionCount ? Number(body.sessionCount) : undefined,
        requestCount: body.requestCount ? Number(body.requestCount) : undefined,
        period: body.period ? String(body.period) : undefined,
      });

      return corsResponse(result);
    } catch (err: any) {
      const msg = err?.message ?? "Metrics push failed";
      const status = msg.includes("Invalid") || msg.includes("inactive") ? 401 : 400;
      return corsError(msg, status);
    }
  }),
});

// ─── GET /api/leaderboard ────────────────────────────────────────────

http.route({
  path: "/api/leaderboard",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const sortBy = url.searchParams.get("sortBy") ?? "totalSpend";
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

      const agents = await ctx.runQuery(api.agents.listLeaderboard, {
        sortBy,
        limit,
      });

      // Strip internal fields for API response
      const sanitized = agents.map((a: any) => ({
        id: a._id,
        name: a.name,
        description: a.description,
        model: a.model,
        provider: a.provider,
        totalSpend: a.totalSpend,
        totalTokens: a.totalTokens,
        totalSessions: a.totalSessions,
        daysActive: a.daysActive,
        streak: a.streak,
        isVerified: a.isVerified,
        badges: a.badges?.map((b: any) => ({
          name: b.name,
          icon: b.icon,
        })),
      }));

      return corsResponse({ agents: sanitized, count: sanitized.length });
    } catch (err: any) {
      return corsError(err?.message ?? "Failed to fetch leaderboard", 500);
    }
  }),
});

// ─── GET /api/health ─────────────────────────────────────────────────

http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const health = await ctx.runQuery(api.metrics.healthCheck, {});
      return corsResponse({
        status: "ok",
        ...health,
        version: "0.4.0",
      });
    } catch (err: any) {
      return corsResponse(
        { status: "degraded", error: err?.message },
        503,
      );
    }
  }),
});

// ─── POST /api/challenge ─────────────────────────────────────────────

http.route({
  path: "/api/challenge",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const challenge = await ctx.runMutation(api.auth.getChallenge, {});
      return corsResponse(challenge);
    } catch (err: any) {
      return corsError(err?.message ?? "Failed to generate challenge", 500);
    }
  }),
});

// ─── POST /api/verify ────────────────────────────────────────────────

http.route({
  path: "/api/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const apiKey = request.headers.get("X-API-Key") ?? request.headers.get("x-api-key");
      if (!apiKey) {
        return corsError("Missing X-API-Key header", 401);
      }

      const body = await request.json();
      const { challengeId, answer } = body;
      if (!challengeId || !answer) {
        return corsError("Missing required fields: challengeId, answer");
      }

      const result = await ctx.runMutation(api.auth.verifyChallenge, {
        challengeId,
        answer: String(answer),
        apiKey,
      });

      return corsResponse(result);
    } catch (err: any) {
      const msg = err?.message ?? "Verification failed";
      return corsError(msg, msg.includes("expired") ? 410 : 400);
    }
  }),
});

export default http;
