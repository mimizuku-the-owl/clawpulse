import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import { providerColor, formatDollars } from "../lib/utils";

export function ProviderChart() {
  const stats = useQuery(api.metrics.globalStats);

  if (!stats) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  const { providerBreakdown } = stats;
  const total = Object.values(providerBreakdown).reduce((sum, v) => sum + v, 0);

  const data = Object.entries(providerBreakdown)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percent: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-pulse-500" />
        <h3 className="font-semibold text-zinc-100">Provider Market Share</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={providerColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.name}</p>
                    <p className="text-zinc-400">{formatDollars(d.value)} ({d.percent}%)</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: providerColor(entry.name) }} />
              <span className="text-zinc-300">{entry.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">{formatDollars(entry.value)}</span>
              <span className="text-zinc-500 text-xs w-12 text-right">{entry.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
