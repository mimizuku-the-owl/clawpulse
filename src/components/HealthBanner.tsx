import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { timeAgo } from "../lib/utils";

export function HealthBanner() {
  const health = useQuery(api.metrics.healthCheck);

  // Determine status
  let status: "operational" | "degraded" | "outage" = "operational";
  let message = "All Systems Operational";

  if (health === undefined) {
    // Still loading — show connecting state
    status = "degraded";
    message = "Connecting to Convex...";
  } else if (!health.dbOk || health.agentCount === 0) {
    status = "outage";
    message = "System Outage Detected";
  }

  const dotColor =
    status === "operational"
      ? "bg-green-500"
      : status === "degraded"
        ? "bg-yellow-500"
        : "bg-red-500";

  const textColor =
    status === "operational"
      ? "text-green-400"
      : status === "degraded"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="h-10 bg-zinc-800/80 border-b border-zinc-700/50 flex items-center justify-center gap-6 px-4 text-xs">
      <div className="flex items-center gap-2">
        <span className={`relative flex h-2.5 w-2.5`}>
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
          />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
        </span>
        <span className={`font-medium ${textColor}`}>{message}</span>
      </div>

      {health && (
        <div className="hidden sm:flex items-center gap-4 text-zinc-500">
          <span>
            API:{" "}
            <span className={health.dbOk ? "text-green-400" : "text-red-400"}>
              {health.dbOk ? "OK" : "Down"}
            </span>
          </span>
          <span className="text-zinc-700">•</span>
          <span>
            Database:{" "}
            <span className={health.agentCount > 0 ? "text-green-400" : "text-red-400"}>
              {health.agentCount > 0 ? "OK" : "Empty"}
            </span>
          </span>
          <span className="text-zinc-700">•</span>
          <span>
            Last Data:{" "}
            <span className="text-zinc-400">{health.latestDate ?? "N/A"}</span>
          </span>
        </div>
      )}
    </div>
  );
}
