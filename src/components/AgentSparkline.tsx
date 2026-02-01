import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { Id } from "../../convex/_generated/dataModel";

interface AgentSparklineProps {
  agentId: Id<"agents">;
  color?: string;
}

export function AgentSparkline({ agentId, color = "#a855f7" }: AgentSparklineProps) {
  const timeline = useQuery(api.metrics.agentTimeline, { agentId });

  if (!timeline || timeline.length < 2) {
    return (
      <div className="w-[60px] h-[28px] flex items-center justify-center">
        <div className="w-full h-px bg-zinc-700" />
      </div>
    );
  }

  return (
    <div className="w-[60px] h-[28px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeline} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${agentId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="cost"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${agentId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
