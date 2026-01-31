import { Header } from "./components/Header";
import { GlobalStats } from "./components/GlobalStats";
import { Leaderboard } from "./components/Leaderboard";
import { ProviderChart } from "./components/ProviderChart";
import { ModelChart } from "./components/ModelChart";
import { AgentOfTheWeek } from "./components/AgentOfTheWeek";
import { BadgeShowcase } from "./components/BadgeShowcase";

export function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Global Stats */}
        <GlobalStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <Leaderboard />
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-8">
            <AgentOfTheWeek />
            <ProviderChart />
            <ModelChart />
            <BadgeShowcase />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-zinc-600 text-sm">
            ClawPulse • The pulse of the AI agent economy •{" "}
            <a href="https://github.com/0xdsqr/clawpulse" className="text-pulse-500 hover:text-pulse-400 transition-colors">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
