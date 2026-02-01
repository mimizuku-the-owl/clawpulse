import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatTokens } from "../../lib/utils";

export function ProviderComparisonChart() {
  const data = useQuery(api.analytics.providerComparison);

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  // Normalize avgTokensPerDay to K for cleaner display
  const formatted = data.map((d) => ({
    ...d,
    avgTokensK: Math.round(d.avgTokensPerDay / 1000),
    spendScaled: d.totalSpend,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Provider Comparison
        </h3>
        <p className="text-xs text-zinc-500">
          Total spend, avg tokens/day, and agent count per provider
        </p>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formatted}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis
              dataKey="provider"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.provider}</p>
                    <p className="text-purple-400">
                      Total Spend: ${d.totalSpend.toFixed(2)}
                    </p>
                    <p className="text-amber-400">
                      Avg Tokens/Day: {formatTokens(d.avgTokensPerDay)}
                    </p>
                    <p className="text-emerald-400">
                      Agents: {d.agentCount}
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="spendScaled"
              name="Total Spend ($)"
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="agentCount"
              name="Agent Count"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
