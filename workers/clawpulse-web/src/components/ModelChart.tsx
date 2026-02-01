import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const MODEL_COLORS: Record<string, string> = {
  "claude-opus-4-5": "#d97706",
  "claude-sonnet-4-20250514": "#f59e0b",
  "gpt-4o": "#10b981",
  "gemini-2.0-flash": "#3b82f6",
};

function shortModelName(model: string): string {
  const map: Record<string, string> = {
    "claude-opus-4-5": "Opus 4.5",
    "claude-sonnet-4-20250514": "Sonnet 4",
    "gpt-4o": "GPT-4o",
    "gemini-2.0-flash": "Gemini Flash",
  };
  return map[model] ?? model;
}

export function ModelChart() {
  const stats = useQuery(api.metrics.globalStats);

  if (!stats) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  const { modelBreakdown } = stats;

  const data = Object.entries(modelBreakdown)
    .map(([model, count]) => ({
      model,
      shortName: shortModelName(model),
      count,
      color: MODEL_COLORS[model] ?? "#a855f7",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-pulse-500" />
        <h3 className="font-semibold text-zinc-100">Model Popularity</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.model}</p>
                    <p className="text-zinc-400">{d.count} agents</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((entry) => (
                <Cell key={entry.model} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
