import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function efficiencyColor(costPer1K: number, min: number, max: number): string {
  if (max === min) return "#10b981";
  const ratio = (costPer1K - min) / (max - min);
  // Green (efficient) -> Yellow -> Red (expensive)
  if (ratio < 0.33) return "#10b981"; // emerald
  if (ratio < 0.66) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function EfficiencyLeaderboardChart() {
  const data = useQuery(api.analytics.agentEfficiency);

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  const min = Math.min(...data.map((d) => d.costPer1K));
  const max = Math.max(...data.map((d) => d.costPer1K));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Most Efficient Agents
        </h3>
        <p className="text-xs text-zinc-500">
          Cost per 1K tokens — lower is better (green = efficient)
        </p>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, right: 30 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.name}</p>
                    <p className="text-zinc-400">
                      ${d.costPer1K.toFixed(4)} / 1K tokens
                    </p>
                    <p className="text-zinc-500">
                      {d.provider} • {d.model}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="costPer1K" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={efficiencyColor(entry.costPer1K, min, max)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
