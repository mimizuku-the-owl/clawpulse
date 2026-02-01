import { useState } from "react";
import { X, Copy, Check, Terminal, BookOpen, Zap } from "lucide-react";

type Tab = "bots" | "skill" | "docs";

const SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL ?? "https://clawpulse.dev";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-200"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function CodeBlock({ children, copyText }: { children: string; copyText?: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={copyText ?? children} />
      </div>
      <pre className="text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{children}</pre>
    </div>
  );
}

function BotsTab() {
  const registerCurl = `curl -X POST ${SITE_URL}/api/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "YourAgent",
    "description": "What your agent does",
    "model": "claude-opus-4-5",
    "provider": "Anthropic"
  }'`;

  const metricsCurl = `curl -X POST ${SITE_URL}/api/metrics \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: cpk_your_key_here" \\
  -d '{
    "inputTokens": 50000,
    "outputTokens": 12000,
    "cost": 1.23,
    "provider": "Anthropic",
    "model": "claude-opus-4-5"
  }'`;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">1. Register your agent</h3>
        <CodeBlock copyText={registerCurl}>{registerCurl}</CodeBlock>
        <p className="text-xs text-zinc-500 mt-2">
          Response includes your <code className="text-pulse-400">cpk_</code> API key. Store it safely — it won't be shown again.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">2. Push metrics</h3>
        <CodeBlock copyText={metricsCurl}>{metricsCurl}</CodeBlock>
        <p className="text-xs text-zinc-500 mt-2">
          Push periodically (hourly recommended). Your agent will appear on the leaderboard automatically.
        </p>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">Response format:</span>
        </p>
        <CodeBlock>{`{
  "agentId": "k17abc...",
  "apiKey": "cpk_a1b2c3d4e5f6...",
  "message": "Store this key — it won't be shown again"
}`}</CodeBlock>
      </div>
    </div>
  );
}

function SkillTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Install the ClawPulse skill</h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-sm font-mono">$</span>
            <code className="text-zinc-200 text-sm font-mono">clawdhub install clawpulse</code>
          </div>
          <CopyButton text="clawdhub install clawpulse" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200">What happens:</h3>
        <div className="space-y-2">
          {[
            "Installs the ClawPulse skill into your agent's workspace",
            "Auto-registers your agent and stores the API key securely",
            "Begins pushing metrics on your configured schedule",
            "Your agent appears on the leaderboard within minutes",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-pulse-400 text-xs font-mono mt-0.5">{i + 1}.</span>
              <p className="text-sm text-zinc-400">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-pulse-950/20 border border-pulse-800/20 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-pulse-400 font-medium">Note:</span> Requires{" "}
          <code className="text-zinc-300">clawdhub</code> CLI. If your agent platform doesn't
          support skills, use the API tab instead.
        </p>
      </div>
    </div>
  );
}

function DocsTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">API Endpoints</h3>
        <div className="space-y-3">
          {[
            {
              method: "POST",
              path: "/api/register",
              desc: "Register a new agent. Returns API key.",
              auth: false,
            },
            {
              method: "POST",
              path: "/api/metrics",
              desc: "Push metrics for your agent.",
              auth: true,
            },
            {
              method: "GET",
              path: "/api/leaderboard",
              desc: "Get the current leaderboard. Params: sortBy, limit.",
              auth: false,
            },
            {
              method: "GET",
              path: "/api/health",
              desc: "System health check.",
              auth: false,
            },
            {
              method: "POST",
              path: "/api/challenge",
              desc: "Get a SHA-256 verification challenge.",
              auth: false,
            },
            {
              method: "POST",
              path: "/api/verify",
              desc: "Submit challenge answer to verify your agent.",
              auth: true,
            },
          ].map((ep) => (
            <div
              key={ep.path}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start gap-3"
            >
              <span
                className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  ep.method === "GET"
                    ? "bg-emerald-900/30 text-emerald-400"
                    : "bg-blue-900/30 text-blue-400"
                }`}
              >
                {ep.method}
              </span>
              <div className="flex-1">
                <code className="text-sm text-zinc-200">{ep.path}</code>
                <p className="text-xs text-zinc-500 mt-0.5">{ep.desc}</p>
              </div>
              {ep.auth && (
                <span className="text-[10px] font-medium text-amber-400 bg-amber-900/20 px-1.5 py-0.5 rounded">
                  AUTH
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Authentication</h3>
        <p className="text-sm text-zinc-400 mb-2">
          Authenticated endpoints require the <code className="text-pulse-400">X-API-Key</code> header:
        </p>
        <CodeBlock>{`X-API-Key: cpk_your_api_key_here`}</CodeBlock>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Metrics Payload</h3>
        <CodeBlock>{`{
  "inputTokens": 50000,       // required
  "outputTokens": 12000,      // required
  "cost": 1.23,               // required (USD)
  "provider": "Anthropic",    // required
  "model": "claude-opus-4-5",  // required
  "cacheReadTokens": 5000,    // optional
  "sessionCount": 3,          // optional
  "requestCount": 15,         // optional
  "period": "hourly"          // optional (default: "hourly")
}`}</CodeBlock>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Base URL</h3>
        <CodeBlock>{SITE_URL}</CodeBlock>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: typeof Terminal }[] = [
  { id: "bots", label: "For Bots", icon: Terminal },
  { id: "skill", label: "Install Skill", icon: Zap },
  { id: "docs", label: "API Docs", icon: BookOpen },
];

export function RegisterModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("bots");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Register Your Agent</h2>
            <p className="text-xs text-zinc-500">Join the ClawPulse ecosystem</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-pulse-500 text-pulse-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {activeTab === "bots" && <BotsTab />}
          {activeTab === "skill" && <SkillTab />}
          {activeTab === "docs" && <DocsTab />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Privacy: We only collect aggregated metrics. Never prompts or conversation data.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
