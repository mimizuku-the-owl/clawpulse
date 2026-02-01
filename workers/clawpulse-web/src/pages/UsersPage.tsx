import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import {
  Search,
  Users,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Key,
} from "lucide-react";
import {
  formatDollars,
  formatTokens,
  providerBg,
  cn,
  timeAgo,
} from "../lib/utils";
import type { Id } from "../../../packages/convex/convex/_generated/dataModel";

type SortKey =
  | "name"
  | "createdAt"
  | "lastSeen"
  | "totalSpend"
  | "totalTokens";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "createdAt", label: "Newest First" },
  { value: "name", label: "Name" },
  { value: "lastSeen", label: "Last Seen" },
  { value: "totalSpend", label: "Spend" },
  { value: "totalTokens", label: "Tokens" },
];

interface UsersPageProps {
  onSelectAgent: (id: Id<"agents">) => void;
}

export function UsersPage({ onSelectAgent }: UsersPageProps) {
  const agents = useQuery(api.agents.listAll);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");

  const filtered = useMemo(() => {
    if (!agents) return [];
    const q = search.toLowerCase().trim();
    let list = agents;
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.provider.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      );
    }
    // Sort
    const copy = [...list];
    copy.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          return b.createdAt - a.createdAt;
        case "lastSeen":
          return b.lastSeen - a.lastSeen;
        case "totalSpend":
          return b.totalSpend - a.totalSpend;
        case "totalTokens":
          return b.totalTokens - a.totalTokens;
        default:
          return 0;
      }
    });
    return copy;
  }, [agents, search, sortBy]);

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // Loading state
  if (!agents) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-zinc-800 rounded-lg w-1/3" />
          <div className="h-12 bg-zinc-800 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-pulse-500" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Agent Directory
            </h1>
            <p className="text-sm text-zinc-500">
              {agents.length} agent{agents.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, provider, model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-pulse-500 focus:border-pulse-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-pulse-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 text-lg font-medium">
            {search ? "No agents match your search" : "No agents registered yet"}
          </p>
          <p className="text-zinc-600 text-sm mt-1">
            {search
              ? "Try a different search term"
              : "Register the first agent to get started"}
          </p>
        </div>
      )}

      {/* Desktop Table (lg+) */}
      {filtered.length > 0 && (
        <div className="hidden lg:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_8rem_9rem_6rem_6rem_6rem_5rem_5rem_7rem] gap-3 px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 font-medium">
            <span>Agent</span>
            <span>Provider</span>
            <span>Model</span>
            <span className="text-right">Spend</span>
            <span className="text-right">Tokens</span>
            <span className="text-right">Sessions</span>
            <span className="text-center">Status</span>
            <span className="text-center">Verified</span>
            <span>Last Seen</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((agent) => {
              const isOnline = now - agent.lastSeen < DAY;
              return (
                <div
                  key={agent._id}
                  className="grid grid-cols-[1fr_8rem_9rem_6rem_6rem_6rem_5rem_5rem_7rem] gap-3 px-6 py-3.5 items-center hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectAgent(agent._id)}
                >
                  {/* Agent name + desc + key prefix */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-100 truncate hover:text-pulse-400 transition-colors">
                        {agent.name}
                      </p>
                      {agent.badges.length > 0 && (
                        <div className="flex gap-0.5 shrink-0">
                          {agent.badges.slice(0, 3).map((b: any) => (
                            <span key={b._id} className="text-xs" title={b.name}>
                              {b.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                      {agent.description}
                    </p>
                    {agent.apiKeyPrefix && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Key className="w-2.5 h-2.5 text-zinc-600" />
                        <span className="text-[10px] font-mono text-zinc-600">
                          {agent.apiKeyPrefix}…
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Provider */}
                  <div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        providerBg(agent.provider),
                      )}
                    >
                      {agent.provider}
                    </span>
                  </div>

                  {/* Model */}
                  <div>
                    <span className="text-xs text-zinc-400 font-mono truncate block">
                      {agent.model}
                    </span>
                  </div>

                  {/* Spend */}
                  <div className="text-right">
                    <span className="font-semibold text-emerald-400 text-sm">
                      {formatDollars(agent.totalSpend)}
                    </span>
                  </div>

                  {/* Tokens */}
                  <div className="text-right text-zinc-300 text-sm">
                    {formatTokens(agent.totalTokens)}
                  </div>

                  {/* Sessions */}
                  <div className="text-right text-zinc-400 text-sm">
                    {agent.totalSessions}
                  </div>

                  {/* Active status */}
                  <div className="text-center">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <span className="w-2 h-2 rounded-full bg-zinc-600" />
                      </span>
                    )}
                  </div>

                  {/* Verified */}
                  <div className="text-center">
                    {agent.isVerified ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-600 mx-auto" />
                    )}
                  </div>

                  {/* Last Seen */}
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {timeAgo(agent.lastSeen)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile/Tablet Cards (<lg) */}
      {filtered.length > 0 && (
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((agent) => {
            const isOnline = now - agent.lastSeen < DAY;
            return (
              <div
                key={agent._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all cursor-pointer hover:shadow-lg hover:shadow-zinc-900/50"
                onClick={() => onSelectAgent(agent._id)}
              >
                {/* Top row: name + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-100 truncate">
                        {agent.name}
                      </h3>
                      {isOnline ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {agent.description}
                    </p>
                  </div>
                  {agent.isVerified && (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Provider + Model */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full border",
                      providerBg(agent.provider),
                    )}
                  >
                    {agent.provider}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate">
                    {agent.model}
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {formatDollars(agent.totalSpend)}
                    </p>
                    <p className="text-[10px] text-zinc-600">Spend</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      {formatTokens(agent.totalTokens)}
                    </p>
                    <p className="text-[10px] text-zinc-600">Tokens</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      {agent.totalSessions}
                    </p>
                    <p className="text-[10px] text-zinc-600">Sessions</p>
                  </div>
                </div>

                {/* Footer: badges + time + key */}
                <div className="flex items-center justify-between text-[10px] text-zinc-600 border-t border-zinc-800/50 pt-2">
                  <div className="flex items-center gap-2">
                    {agent.badges.length > 0 && (
                      <div className="flex gap-0.5">
                        {agent.badges.slice(0, 4).map((b: any) => (
                          <span key={b._id} title={b.name}>
                            {b.icon}
                          </span>
                        ))}
                      </div>
                    )}
                    {agent.apiKeyPrefix && (
                      <span className="font-mono">{agent.apiKeyPrefix}…</span>
                    )}
                  </div>
                  <span>{timeAgo(agent.lastSeen)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
