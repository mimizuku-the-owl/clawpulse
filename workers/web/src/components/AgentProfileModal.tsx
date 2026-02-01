import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { X, Flame, Calendar, Cpu, DollarSign } from "lucide-react";
import { formatDollars, formatTokens, providerBg, providerColor, cn, timeAgo } from "../lib/utils";
import type { Id } from "../../../../packages/convex/convex/_generated/dataModel";

interface AgentProfileModalProps {
  agentId: Id<"agents">;
  onClose: () => void;
}

export function AgentProfileModal({ agentId, onClose }: AgentProfileModalProps) {
  const profile = useQuery(api.agents.getProfile, { agentId });
  const timeline = useQuery(api.metrics.agentTimeline, { agentId });

  if (!profile) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-8 animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/3 mb-4" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  // Token breakdown data for stacked bar
  const tokenData = [
    {
      name: "Tokens",
      input: profile.tokenBreakdown.input,
      output: profile.tokenBreakdown.output,
      cache: profile.tokenBreakdown.cache,
    },
  ];

  // If no metrics data, show estimated token breakdown from total
  const hasMetrics = profile.tokenBreakdown.input + profile.tokenBreakdown.output + profile.tokenBreakdown.cache > 0;
  const tokenChartData = hasMetrics
    ? tokenData
    : [
        {
          name: "Tokens",
          input: Math.round(profile.totalTokens * 0.5),
          output: Math.round(profile.totalTokens * 0.35),
          cache: Math.round(profile.totalTokens * 0.15),
        },
      ];

  // Format timeline data
  const chartData = (timeline ?? []).map((d) => ({
    ...d,
    displayDate: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-12 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl mb-12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-pulse-500/20 border border-pulse-500/30 flex items-center justify-center text-2xl shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-zinc-100">{profile.name}</h2>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", providerBg(profile.provider))}>
                  {profile.provider}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{profile.description}</p>
              <p className="text-xs text-zinc-500 mt-1 font-mono">{profile.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-zinc-800/50">
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-zinc-100">{formatDollars(profile.totalSpend)}</p>
            <p className="text-xs text-zinc-500">Total Spend</p>
          </div>
          <div className="text-center">
            <Cpu className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-zinc-100">{formatTokens(profile.totalTokens)}</p>
            <p className="text-xs text-zinc-500">Tokens</p>
          </div>
          <div className="text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-zinc-100">{profile.streak}d</p>
            <p className="text-xs text-zinc-500">Streak</p>
          </div>
          <div className="text-center">
            <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-zinc-100">{profile.daysActive}d</p>
            <p className="text-xs text-zinc-500">Active</p>
          </div>
        </div>

        {/* Cost History Chart */}
        {chartData.length > 1 && (
          <div className="px-6 py-4 border-b border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Cost History (30 days)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={providerColor(profile.provider)} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={providerColor(profile.provider)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor(chartData.length / 5)}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                          <p className="font-semibold text-zinc-100">{d.displayDate}</p>
                          <p className="text-emerald-400">{formatDollars(d.cost)}</p>
                          <p className="text-zinc-400">{d.sessions} sessions</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke={providerColor(profile.provider)}
                    strokeWidth={2}
                    fill="url(#profileGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Token Usage Breakdown */}
        <div className="px-6 py-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Token Usage Breakdown</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                        {payload.map((p: any) => (
                          <p key={p.name} style={{ color: p.fill }}>
                            {p.name}: {formatTokens(p.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="input" stackId="tokens" fill="#3b82f6" radius={[4, 0, 0, 4]} name="Input" />
                <Bar dataKey="output" stackId="tokens" fill="#10b981" name="Output" />
                <Bar dataKey="cache" stackId="tokens" fill="#a855f7" radius={[0, 4, 4, 0]} name="Cache" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-zinc-400">Input: {formatTokens(tokenChartData[0].input)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-zinc-400">Output: {formatTokens(tokenChartData[0].output)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span className="text-zinc-400">Cache: {formatTokens(tokenChartData[0].cache)}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="px-6 py-4 border-b border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Badges Earned ({profile.badges.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge: any) => (
                <div
                  key={badge._id}
                  className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5"
                >
                  <span className="text-base">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{badge.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {badge.earnedAt ? timeAgo(badge.earnedAt) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="p-4 flex justify-center">
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-pulse-400 transition-colors px-4 py-2 rounded-lg hover:bg-zinc-800/50"
          >
            ← Back to Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
