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

const AGENT_COLORS = [
  "#a855f7", // purple
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export function AgentSpendTimelineChart() {
  const timeline = useQuery(api.analytics.agentSpendTimeline);

  if (!timeline || timeline.data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-80 animate-pulse" />
    );
  }

  const { agentNames, data } = timeline;

  const formatted = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="mb-1">
        <h3 className="text-lg font-semibold text-zinc-100">
          Agent Spend Over Time
        </h3>
        <p className="text-xs text-zinc-500">
          Who&apos;s driving ecosystem cost — stacked daily spend
        </p>
      </div>

      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {agentNames.map((name, i) => (
                <linearGradient
                  key={name}
                  id={`agentGrad-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={AGENT_COLORS[i % AGENT_COLORS.length]}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={AGENT_COLORS[i % AGENT_COLORS.length]}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(formatted.length / 6)}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={50}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                    <p className="font-semibold text-zinc-100 mb-1">
                      {payload[0]?.payload?.displayDate}
                    </p>
                    {payload
                      .slice()
                      .reverse()
                      .map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-zinc-400"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>
                            {p.dataKey}: ${Number(p.value).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                );
              }}
            />
            {agentNames.map((name, i) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stackId="1"
                stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
                strokeWidth={1.5}
                fill={`url(#agentGrad-${i})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {agentNames.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: AGENT_COLORS[i % AGENT_COLORS.length],
              }}
            />
            <span className="text-zinc-400">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
