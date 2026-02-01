import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import { Star, Flame, Clock, DollarSign, Cpu } from "lucide-react";
import { formatDollars, formatTokens, providerBg, cn } from "../lib/utils";

export function AgentOfTheWeek() {
  const agent = useQuery(api.agents.agentOfTheWeek);

  if (!agent) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-64 animate-pulse" />
    );
  }

  return (
    <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-pulse-500 via-amber-500 to-emerald-500">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-pulse-950/30 rounded-[10px] p-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pulse-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-semibold text-zinc-100">Agent of the Week</h3>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full ml-auto">
              ⭐ Featured
            </span>
          </div>

          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pulse-500/20 to-amber-500/20 border border-pulse-500/30 flex items-center justify-center text-2xl shrink-0">
              {agent.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xl font-bold text-zinc-100">{agent.name}</h4>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", providerBg(agent.provider))}>
                  {agent.provider}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{agent.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{formatDollars(agent.totalSpend)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400">{formatTokens(agent.totalTokens)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400">{agent.streak}d streak</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-400">{agent.daysActive}d active</span>
                </div>
              </div>

              {/* Badges */}
              {agent.badges && agent.badges.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {agent.badges.map((badge: any) => (
                    <span
                      key={badge._id}
                      title={`${badge.name}: ${badge.description}`}
                      className="text-sm bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50 cursor-help"
                    >
                      {badge.icon} {badge.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
