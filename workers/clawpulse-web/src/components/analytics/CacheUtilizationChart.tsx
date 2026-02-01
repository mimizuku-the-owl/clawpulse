import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { providerColor } from "../../lib/utils";

export function CacheUtilizationChart() {
  const data = useQuery(api.analytics.cacheRates);

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Cache Utilization
        </h3>
        <p className="text-xs text-zinc-500">
          Cache read ratio per agent — higher means more cache hits
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {data.map((agent) => {
          const barColor = providerColor(agent.provider);
          const rateNum = agent.cacheRate;
          // Determine label color
          const labelColor =
            rateNum >= 50
              ? "text-emerald-400"
              : rateNum >= 30
                ? "text-amber-400"
                : "text-red-400";

          return (
            <div key={agent.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">
                    {agent.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {agent.provider}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${labelColor}`}>
                  {rateNum.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, rateNum)}%`,
                    backgroundColor: barColor,
                    opacity: 0.85,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-zinc-600">
                <span>
                  Cache: {(agent.cacheTokens / 1000).toFixed(1)}K tokens
                </span>
                <span>
                  Input: {(agent.inputTokens / 1000).toFixed(1)}K tokens
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
