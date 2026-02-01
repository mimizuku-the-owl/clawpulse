import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { providerColor } from "../../lib/utils";

export function CostEfficiencyChart() {
  const data = useQuery(api.analytics.providerEfficiency);

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Cost Efficiency by Provider
        </h3>
        <p className="text-xs text-zinc-500">
          Average cost per 1K tokens — lower is better
        </p>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              tickFormatter={(v: number) => `$${v}`}
              width={55}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.provider}</p>
                    <p className="text-zinc-400">
                      ${d.costPer1K.toFixed(4)} / 1K tokens
                    </p>
                    <p className="text-zinc-500">
                      Total: ${d.totalCost.toFixed(2)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="costPer1K" radius={[6, 6, 0, 0]} barSize={48}>
              {data.map((entry) => (
                <Cell
                  key={entry.provider}
                  fill={providerColor(entry.provider)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
