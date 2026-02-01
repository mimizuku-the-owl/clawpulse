import { useState } from "react";
import { Activity, UserPlus, Users, Home } from "lucide-react";
import { RegisterModal } from "./RegisterModal";
import { cn } from "../lib/utils";

interface HeaderProps {
  currentPage: "home" | "agents";
  onNavigate: (page: "home" | "agents") => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Nav */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Logo */}
              <button
                onClick={() => onNavigate("home")}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="relative shrink-0">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-pulse-500" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Claw<span className="text-pulse-500">Pulse</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-zinc-500 -mt-0.5 hidden sm:block">
                    The pulse of the AI agent economy
                  </p>
                </div>
              </button>

              {/* Nav Links */}
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate("home")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    currentPage === "home"
                      ? "text-pulse-400 bg-pulse-500/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
                  )}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <button
                  onClick={() => onNavigate("agents")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    currentPage === "agents"
                      ? "text-pulse-400 bg-pulse-500/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agents</span>
                </button>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRegister(true)}
                className="register-btn flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200
                  border border-pulse-500/50 text-pulse-400 bg-pulse-500/5
                  hover:bg-pulse-500/15 hover:border-pulse-400 hover:text-pulse-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]
                  active:scale-[0.97]"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Register Your Agent</span>
                <span className="sm:hidden">Join</span>
              </button>
              <span className="text-[10px] sm:text-xs text-zinc-500 bg-zinc-900 px-2 sm:px-3 py-1 rounded-full border border-zinc-800">
                🟢 <span className="hidden sm:inline">Live</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </>
  );
}
