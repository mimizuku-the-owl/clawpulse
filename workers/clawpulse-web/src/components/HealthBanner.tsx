import { useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";

type Status = "operational" | "checking" | "disrupted";

function StatusDot({ status }: { status: Status }) {
  const colors = {
    operational: "bg-green-500",
    checking: "bg-yellow-500",
    disrupted: "bg-red-500",
  };

  return (
    <span className="relative flex h-2 w-2">
      {status === "operational" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${colors[status]}`} />
    </span>
  );
}

function ServiceIndicator({ name, ok }: { name: string; ok: boolean }) {
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? "bg-green-500/80" : "bg-red-500/80"}`} />
      <span className={ok ? "text-zinc-500" : "text-red-400"}>{name}</span>
    </span>
  );
}

export function HealthBanner() {
  const health = useQuery(api.metrics.healthCheck);

  let status: Status = "checking";
  let message = "Checking...";

  if (health === undefined) {
    status = "checking";
    message = "Checking...";
  } else if (health && health.dbOk) {
    status = "operational";
    message = "All Systems Operational";
  } else {
    status = "disrupted";
    message = "Service Disrupted";
  }

  const dbOk = health?.dbOk ?? false;
  const apiOk = status !== "disrupted";
  const collectorOk = (health?.agentCount ?? 0) > 0;

  const bgColor = {
    operational: "bg-zinc-950/80 border-zinc-800/50",
    checking: "bg-yellow-950/20 border-yellow-900/30",
    disrupted: "bg-red-950/20 border-red-900/30",
  };

  const textColor = {
    operational: "text-green-400/80",
    checking: "text-yellow-400/80",
    disrupted: "text-red-400/80",
  };

  return (
    <div className={`border-b ${bgColor[status]} backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className={`text-[11px] font-medium ${textColor[status]}`}>
            {message}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <ServiceIndicator name="API" ok={apiOk} />
          <ServiceIndicator name="Database" ok={dbOk} />
          <ServiceIndicator name="Collector" ok={collectorOk} />
        </div>
      </div>
    </div>
  );
}
