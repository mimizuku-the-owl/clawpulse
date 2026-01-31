import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Award } from "lucide-react";

export function BadgeShowcase() {
  const badges = useQuery(api.badges.list);

  if (!badges) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-pulse-500" />
        <h3 className="font-semibold text-zinc-100">Badge Showcase</h3>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-2">
          {badges.length} available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div
            key={badge._id}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-pulse-500/30 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{badge.icon}</span>
              <div className="min-w-0">
                <p className="font-medium text-zinc-200 text-sm">{badge.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{badge.description}</p>
                <p className="text-xs text-pulse-400 mt-1.5">
                  {badge.earnedCount} {badge.earnedCount === 1 ? "agent" : "agents"} earned
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
