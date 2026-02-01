import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Trophy, ChevronDown, Flame } from "lucide-react";
import { formatDollars, formatTokens, providerBg, providerColor, cn } from "../lib/utils";
import { AgentSparkline } from "./AgentSparkline";
import type { Id } from "../../convex/_generated/dataModel";

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

function getGlowClass(rank: number): string {
  switch (rank) {
    case 1:
      return "shadow-[inset_0_0_20px_rgba(251,191,36,0.06)]";
    case 2:
      return "shadow-[inset_0_0_16px_rgba(212,212,216,0.04)]";
    case 3:
      return "shadow-[inset_0_0_16px_rgba(217,119,6,0.05)]";
    default:
      return "";
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

interface LeaderboardProps {
  onSelectAgent?: (agentId: Id<"agents">) => void;
}

export function Leaderboard({ onSelectAgent }: LeaderboardProps) {
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
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-5 h-5 text-pulse-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold truncate">Agent Leaderboard</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-1 shrink-0 hidden sm:inline-block">
            {agents.length} agents
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-pulse-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Desktop table header (lg+) */}
      <div className="hidden lg:grid grid-cols-[3rem_1fr_7rem_7rem_4rem_6rem_6rem_5rem_5rem_auto] gap-2 px-6 py-2 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 font-medium">
        <span>Rank</span>
        <span>Agent</span>
        <span>Provider</span>
        <span>Model</span>
        <span>Trend</span>
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

          return (
            <div key={agent._id}>
              {/* ── Desktop row (lg+) ── */}
              <div
                className={cn(
                  "hidden lg:grid grid-cols-[3rem_1fr_7rem_7rem_4rem_6rem_6rem_5rem_5rem_auto] gap-2 px-6 py-3 items-center transition-all duration-200 cursor-pointer",
                  "hover:bg-zinc-800/40 hover:shadow-md",
                  getRankStyle(rank),
                  getGlowClass(rank),
                )}
                onClick={() => onSelectAgent?.(agent._id)}
              >
                <div className="flex items-center">{getRankBadge(rank)}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-100 truncate hover:text-pulse-400 transition-colors">
                    {agent.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{agent.description}</p>
                </div>
                <div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", providerBg(agent.provider))}>
                    {agent.provider}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-mono">{agent.model.split("-").slice(0, 2).join("-")}</span>
                </div>
                <div>
                  <AgentSparkline agentId={agent._id} color={providerColor(agent.provider)} />
                </div>
                <div className="text-right">
                  <span className={cn("font-semibold", rank <= 3 ? "text-emerald-400" : "text-zinc-200")}>
                    {formatDollars(agent.totalSpend)}
                  </span>
                </div>
                <div className="text-right text-zinc-300">{formatTokens(agent.totalTokens)}</div>
                <div className="text-right text-zinc-400">{agent.daysActive}d</div>
                <div className="text-right flex items-center justify-end gap-1">
                  {agent.streak >= 20 && <Flame className="w-3 h-3 text-orange-400" />}
                  <span className={cn("text-sm", agent.streak >= 20 ? "text-orange-400 font-semibold" : "text-zinc-400")}>
                    {agent.streak}
                  </span>
                </div>
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

              {/* ── Mobile/Tablet card (< lg) ── */}
              <div
                className={cn(
                  "lg:hidden px-4 py-3 transition-all duration-200 cursor-pointer",
                  "hover:bg-zinc-800/40",
                  getRankStyle(rank),
                  getGlowClass(rank),
                )}
                onClick={() => onSelectAgent?.(agent._id)}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="shrink-0 w-8 text-center">{getRankBadge(rank)}</div>

                  {/* Name + provider */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-zinc-100 truncate">{agent.name}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", providerBg(agent.provider))}>
                        {agent.provider}
                      </span>
                    </div>
                  </div>

                  {/* Spend */}
                  <div className="text-right shrink-0">
                    <span className={cn("font-semibold text-sm", rank <= 3 ? "text-emerald-400" : "text-zinc-200")}>
                      {formatDollars(agent.totalSpend)}
                    </span>
                  </div>
                </div>

                {/* Second row: streak + badges */}
                <div className="flex items-center gap-3 mt-1.5 ml-11">
                  <div className="flex items-center gap-1 text-xs">
                    {agent.streak >= 20 && <Flame className="w-3 h-3 text-orange-400" />}
                    <span className={cn(agent.streak >= 20 ? "text-orange-400 font-semibold" : "text-zinc-500")}>
                      {agent.streak}d streak
                    </span>
                  </div>

                  <span className="text-zinc-700">•</span>

                  <span className="text-xs text-zinc-500">{formatTokens(agent.totalTokens)} tokens</span>

                  {/* Badges */}
                  {agent.badges.length > 0 && (
                    <div className="flex gap-0.5 ml-auto">
                      {agent.badges.slice(0, 4).map((badge: any) => (
                        <span
                          key={badge._id}
                          title={`${badge.name}: ${badge.description}`}
                          className="text-xs cursor-help"
                        >
                          {badge.icon}
                        </span>
                      ))}
                      {agent.badges.length > 4 && (
                        <span className="text-[10px] text-zinc-500">+{agent.badges.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {agents.length > 10 && !showAll && (
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-800">
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
