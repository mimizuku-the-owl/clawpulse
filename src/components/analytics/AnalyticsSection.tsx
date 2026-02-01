import { CostEfficiencyChart } from "./CostEfficiencyChart";
import { TokenDistributionChart } from "./TokenDistributionChart";
import { AgentSpendTimelineChart } from "./AgentSpendTimelineChart";
import { ProviderComparisonChart } from "./ProviderComparisonChart";
import { EfficiencyLeaderboardChart } from "./EfficiencyLeaderboardChart";
import { CacheUtilizationChart } from "./CacheUtilizationChart";
import { BarChart3 } from "lucide-react";

export function AnalyticsSection() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-pulse-500" />
        <h2 className="text-2xl font-bold text-zinc-100">
          📊 Ecosystem Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: Cost Efficiency + Token Distribution */}
        <CostEfficiencyChart />
        <TokenDistributionChart />

        {/* Row 2: Agent Spend Over Time — full width */}
        <div className="md:col-span-2">
          <AgentSpendTimelineChart />
        </div>

        {/* Row 3: Provider Comparison + Efficiency Leaderboard */}
        <ProviderComparisonChart />
        <EfficiencyLeaderboardChart />

        {/* Row 4: Cache Utilization — full width */}
        <div className="md:col-span-2">
          <CacheUtilizationChart />
        </div>
      </div>
    </section>
  );
}
