import { useState } from "react";
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
import type { Id } from "../convex/_generated/dataModel";

export function App() {
  const [selectedAgent, setSelectedAgent] = useState<Id<"agents"> | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
      {/* Health Status Banner */}
      <HealthBanner />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Global Stats */}
        <GlobalStats />

        {/* Ecosystem Spend Chart */}
        <EcosystemSpendChart />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Leaderboard (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Leaderboard onSelectAgent={setSelectedAgent} />
          </div>

          {/* Sidebar (1/3 width on desktop) */}
          <div className="space-y-6 sm:space-y-8">
            <AgentOfTheWeek />

            {/* Charts: side by side on tablet, stacked in sidebar on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
              <ProviderChart />
              <ModelChart />
            </div>

            <BadgeShowcase />
          </div>
        </div>

        {/* Connect Your Agent */}
        <ConnectAgent />
      </main>

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
