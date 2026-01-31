import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Trophy, ChevronDown, Flame, Medal } from "lucide-react";
import { formatDollars, formatTokens, providerBg, cn } from "../lib/utils";

type SortField = "totalSpend" | "totalTokens" | "totalSessions" | "efficiency" | "streak";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "totalSpend", label: "Total Spend" },
  { value: "totalTokens", label: "Total Tokens" },
  { value: "totalSessions", label: "Sessions" },
  { value: "efficiency", label: "Efficiency" },
  { value: "streak", label: "Streak" },
];

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return "border-l-4 border-l-amber-400 bg-amber-400/5";
    case 2:
      return "border-l-4 border-l-zinc-300 bg-zinc-300/5";
    case 3:
      return "border-l-4 border-l-amber-600 bg-amber-600/5";
    default:
      return "border-l-4 border-l-transparent";
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return <span className="text-amber-400 font-bold text-lg">🥇</span>;
    case 2:
      return <span className="text-zinc-300 font-bold text-lg">🥈</span>;
    case 3:
      return <span className="text-amber-600 font-bold text-lg">🥉</span>;
    default:
      return <span className="text-zinc-500 font-mono text-sm">#{rank}</span>;
  }
}

export function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortField>("totalSpend");
  const [showAll, setShowAll] = useState(false);

  const agents = useQuery(api.agents.listLeaderboard, { sortBy, limit: 50 });

  if (!agents) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayed = showAll ? agents : agents.slice(0, 10);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-pulse-500" />
          <h2 className="text-lg font-semibold">Agent Leaderboard</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-2">
            {agents.length} agents
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-pulse-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[3rem_1fr_7rem_7rem_6rem_6rem_5rem_5rem_auto] gap-2 px-6 py-2 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 font-medium">
        <span>Rank</span>
        <span>Agent</span>
        <span>Provider</span>
        <span>Model</span>
        <span className="text-right">Spend</span>
        <span className="text-right">Tokens</span>
        <span className="text-right">Days</span>
        <span className="text-right">Streak</span>
        <span>Badges</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/50">
        {displayed.map((agent, i) => {
          const rank = i + 1;
          const efficiency = agent.totalTokens > 0
            ? (agent.totalSpend / (agent.totalTokens / 1000)).toFixed(4)
            : "N/A";

          return (
            <div
              key={agent._id}
              className={cn(
                "grid grid-cols-1 md:grid-cols-[3rem_1fr_7rem_7rem_6rem_6rem_5rem_5rem_auto] gap-2 px-6 py-3 items-center hover:bg-zinc-800/30 transition-colors",
                getRankStyle(rank),
              )}
            >
              {/* Rank */}
              <div className="flex items-center">{getRankBadge(rank)}</div>

              {/* Agent name + description */}
              <div className="min-w-0">
                <p className="font-semibold text-zinc-100 truncate">{agent.name}</p>
                <p className="text-xs text-zinc-500 truncate hidden lg:block">{agent.description}</p>
              </div>

              {/* Provider */}
              <div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", providerBg(agent.provider))}>
                  {agent.provider}
                </span>
              </div>

              {/* Model */}
              <div>
                <span className="text-xs text-zinc-400 font-mono">{agent.model.split("-").slice(0, 2).join("-")}</span>
              </div>

              {/* Spend */}
              <div className="text-right">
                <span className={cn("font-semibold", rank <= 3 ? "text-emerald-400" : "text-zinc-200")}>
                  {formatDollars(agent.totalSpend)}
                </span>
              </div>

              {/* Tokens */}
              <div className="text-right text-zinc-300">{formatTokens(agent.totalTokens)}</div>

              {/* Days active */}
              <div className="text-right text-zinc-400">{agent.daysActive}d</div>

              {/* Streak */}
              <div className="text-right flex items-center justify-end gap-1">
                {agent.streak >= 20 && <Flame className="w-3 h-3 text-orange-400" />}
                <span className={cn("text-sm", agent.streak >= 20 ? "text-orange-400 font-semibold" : "text-zinc-400")}>
                  {agent.streak}
                </span>
              </div>

              {/* Badges */}
              <div className="flex gap-1 flex-wrap">
                {agent.badges.slice(0, 3).map((badge: any) => (
                  <span
                    key={badge._id}
                    title={`${badge.name}: ${badge.description}`}
                    className="text-sm cursor-help"
                  >
                    {badge.icon}
                  </span>
                ))}
                {agent.badges.length > 3 && (
                  <span className="text-xs text-zinc-500">+{agent.badges.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {agents.length > 10 && !showAll && (
        <div className="px-6 py-3 border-t border-zinc-800">
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-center text-sm text-pulse-400 hover:text-pulse-300 transition-colors py-1"
          >
            Show all {agents.length} agents ↓
          </button>
        </div>
      )}
    </div>
  );
}
