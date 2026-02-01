import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatTokens } from "../../lib/utils";

const COLORS = {
  input: "#a855f7", // purple
  output: "#f59e0b", // amber
  cache: "#10b981", // emerald
};

const LABELS: Record<string, string> = {
  input: "Input Tokens",
  output: "Output Tokens",
  cache: "Cache Read",
};

export function TokenDistributionChart() {
  const breakdown = useQuery(api.analytics.tokenBreakdown);

  if (!breakdown) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  const total = breakdown.input + breakdown.output + breakdown.cache;
  const data = [
    { name: "input", value: breakdown.input, label: "Input Tokens" },
    { name: "output", value: breakdown.output, label: "Output Tokens" },
    { name: "cache", value: breakdown.cache, label: "Cache Read" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Token Distribution
        </h3>
        <p className="text-xs text-zinc-500">
          Ecosystem-wide split of compute usage
        </p>
      </div>

      <div className="h-52 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct =
                  total > 0
                    ? ((d.value / total) * 100).toFixed(1)
                    : "0";
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.label}</p>
                    <p className="text-zinc-400">
                      {formatTokens(d.value)} ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.map((entry) => {
          const pct =
            total > 0
              ? ((entry.value / total) * 100).toFixed(1)
              : "0";
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[entry.name as keyof typeof COLORS],
                  }}
                />
                <span className="text-zinc-300">{entry.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  {formatTokens(entry.value)}
                </span>
                <span className="text-zinc-500 text-xs w-12 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
