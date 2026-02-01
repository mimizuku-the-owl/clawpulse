import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import { Users, DollarSign, Cpu, Zap } from "lucide-react";
import { formatDollars, formatTokens } from "../lib/utils";
import { useAnimatedCount } from "../hooks/useAnimatedCount";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  formatter: (n: number) => string;
  sub?: string;
  accent?: string;
}

function StatCard({ icon, label, value, formatter, sub, accent }: StatCardProps) {
  const animated = useAnimatedCount(value);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/50">
      <div className={`p-2.5 rounded-lg ${accent ?? "bg-pulse-500/10 text-pulse-500"}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 tabular-nums">{formatter(animated)}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
    </div>
  );
}

export function GlobalStats() {
  const stats = useQuery(api.metrics.globalStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Total Agents"
        value={stats.totalAgents}
        formatter={(n) => Math.round(n).toString()}
        sub="registered in ecosystem"
        accent="bg-blue-500/10 text-blue-400"
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Ecosystem Spend"
        value={stats.totalCost}
        formatter={formatDollars}
        sub="lifetime total"
        accent="bg-emerald-500/10 text-emerald-400"
      />
      <StatCard
        icon={<Cpu className="w-5 h-5" />}
        label="Tokens Processed"
        value={stats.totalTokens}
        formatter={formatTokens}
        sub="across all agents"
        accent="bg-purple-500/10 text-purple-400"
      />
      <StatCard
        icon={<Zap className="w-5 h-5" />}
        label="Active (24h)"
        value={stats.activeAgents}
        formatter={(n) => Math.round(n).toString()}
        sub="agents pushing metrics"
        accent="bg-amber-500/10 text-amber-400"
      />
    </div>
  );
}
