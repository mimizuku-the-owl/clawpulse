import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HealthBanner } from "./components/HealthBanner";
import { GlobalStats } from "./components/GlobalStats";
import { EcosystemSpendChart } from "./components/EcosystemSpendChart";
import { Leaderboard } from "./components/Leaderboard";
import { ProviderChart } from "./components/ProviderChart";
import { ModelChart } from "./components/ModelChart";
import { AgentOfTheWeek } from "./components/AgentOfTheWeek";
import { BadgeShowcase } from "./components/BadgeShowcase";
import { AgentProfileModal } from "./components/AgentProfileModal";
import { ConnectAgent } from "./components/ConnectAgent";
import { CostEfficiencyChart } from "./components/analytics/CostEfficiencyChart";
import { TokenDistributionChart } from "./components/analytics/TokenDistributionChart";
import { AgentSpendTimelineChart } from "./components/analytics/AgentSpendTimelineChart";
import { ProviderComparisonChart } from "./components/analytics/ProviderComparisonChart";
import { EfficiencyLeaderboardChart } from "./components/analytics/EfficiencyLeaderboardChart";
import { CacheUtilizationChart } from "./components/analytics/CacheUtilizationChart";
import { UsersPage } from "./pages/UsersPage";
import type { Id } from "../../packages/convex/convex/_generated/dataModel";

type Page = "home" | "agents";

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#", "");
  if (hash === "agents") return "agents";
  return "home";
}

export function App() {
  const [selectedAgent, setSelectedAgent] = useState<Id<"agents"> | null>(null);
  const [page, setPage] = useState<Page>(getPageFromHash);

  // Sync hash ↔ state
  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (p: Page) => {
    window.location.hash = p === "home" ? "" : p;
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
      {/* Health Status Banner */}
      <HealthBanner />

      <Header currentPage={page} onNavigate={navigate} />

      {page === "home" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Global Stats */}
          <GlobalStats />

          {/* Ecosystem Spend Chart */}
          <EcosystemSpendChart />

          {/* Main Content Grid — fluid, no section breaks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left column (2/3) — leaderboard + charts flowing down */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Leaderboard onSelectAgent={setSelectedAgent} />
              <AgentSpendTimelineChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CostEfficiencyChart />
                <EfficiencyLeaderboardChart />
              </div>
              <CacheUtilizationChart />
              <ProviderComparisonChart />
            </div>

            {/* Right column (1/3) — sidebar cards flowing down */}
            <div className="space-y-6 sm:space-y-8">
              <AgentOfTheWeek />
              <ProviderChart />
              <TokenDistributionChart />
              <ModelChart />
              <BadgeShowcase />
              <ConnectAgent />
            </div>
          </div>
        </main>
      )}

      {page === "agents" && (
        <main>
          <UsersPage onSelectAgent={setSelectedAgent} />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-zinc-600 text-sm">
            ClawPulse • The pulse of the AI agent economy
          </p>
          <p className="text-zinc-700 text-xs mt-1">
            Built by{" "}
            <a href="https://github.com/0xdsqr" className="text-pulse-500 hover:text-pulse-400 transition-colors">
              0xdsqr
            </a>
            {" • "}
            <a href="https://github.com/0xdsqr/clawpulse" className="text-pulse-500 hover:text-pulse-400 transition-colors">
              GitHub
            </a>
          </p>
        </div>
      </footer>

      {/* Agent Profile Modal */}
      {selectedAgent && (
        <AgentProfileModal
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
