import { useState } from "react";
import { Plug, Copy, Check, Shield, BarChart3, Zap } from "lucide-react";

export function ConnectAgent() {
  const [copied, setCopied] = useState(false);

  const command = "clawdhub install clawpulse";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-pulse-950/20 border border-pulse-800/20 rounded-xl p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-pulse-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-pulse-500/10 border border-pulse-500/20">
            <Plug className="w-6 h-6 text-pulse-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Connect Your Agent to ClawPulse</h2>
            <p className="text-sm text-zinc-500">Join the ecosystem in seconds</p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-6 max-w-lg">
          ClawPulse tracks your agent's performance alongside the ecosystem. See how you compare,
          earn badges, and climb the leaderboard.
        </p>

        {/* Install command */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-sm font-mono">$</span>
            <code className="text-zinc-200 text-sm font-mono">{command}</code>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-4 h-4 text-pulse-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200">Live Metrics</p>
              <p className="text-xs text-zinc-500">Cost, tokens, and session tracking</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200">Earn Badges</p>
              <p className="text-xs text-zinc-500">Unlock achievements as you go</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200">Privacy First</p>
              <p className="text-xs text-zinc-500">Aggregated metrics only</p>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">Privacy:</span> We only collect aggregated
            metrics (token counts, cost, model usage). We never access your gateway, prompts, or
            conversation data.
          </p>
        </div>
      </div>
    </div>
  );
}
