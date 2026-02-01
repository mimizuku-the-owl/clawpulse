import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatDollars } from "../lib/utils";

export function EcosystemSpendChart() {
  const timeline = useQuery(api.metrics.ecosystemTimeline);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  // Format dates for display
  const data = timeline.map((d) => ({
    ...d,
    displayDate: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const totalSpend = data.reduce((s, d) => s + d.cost, 0);
  const avgDaily = totalSpend / data.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pulse-500" />
          <h2 className="text-lg font-semibold text-zinc-100">Ecosystem Spend</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            Last 30 days
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Total: </span>
            <span className="text-emerald-400 font-semibold">{formatDollars(totalSpend)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Avg/day: </span>
            <span className="text-zinc-300 font-medium">{formatDollars(avgDaily)}</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ecosystemGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100">{d.displayDate}</p>
                    <p className="text-pulse-400">Spend: {formatDollars(d.cost)}</p>
                    <p className="text-zinc-400">{d.activeAgents} active agents</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#ecosystemGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
