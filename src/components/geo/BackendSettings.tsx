import { Plug, RefreshCw, TriangleAlert } from "lucide-react";
import { API_BASE_URL, DEMO_MODE } from "@/lib/api/client";
import { useAnalysisStore } from "@/state/analysis-store";

export function BackendSettings({
  onTestConnection,
  testing,
}: {
  onTestConnection: () => void;
  testing: boolean;
}) {
  const { health, healthError, earthEngine, earthEngineError, lastHealthCheck } =
    useAnalysisStore();

  const rows: [string, string][] = [
    ["API base URL", API_BASE_URL || "Not configured (VITE_API_BASE_URL)"],
    ["Backend status", healthError ? "Offline" : health ? `Connected (${health.status})` : "Unknown"],
    [
      "Earth Engine",
      earthEngine?.status === "ready"
        ? "Ready"
        : earthEngine?.status === "error"
          ? `Error: ${earthEngine.message ?? "initialisation failed"}`
          : (earthEngineError ?? "Unverified"),
    ],
    ["EE project", earthEngine?.project ?? "Reported by backend only"],
    ["Backend version", health?.version ?? "—"],
    ["Last health check", lastHealthCheck ? new Date(lastHealthCheck).toLocaleString() : "Never"],
    ["Demo mode", DEMO_MODE ? "ENABLED — results are not scientific" : "Disabled"],
    ["CRS", "EPSG:4326 (WGS 84)"],
  ];

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Plug className="h-4 w-4 text-accent" />
        <h2 className="text-[13px] font-semibold tracking-tight">Backend</h2>
      </header>

      <dl className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="label-tech">{k}</dt>
            <dd className="mono-coord max-w-[58%] break-words text-right text-[11px] text-secondary-foreground">
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onTestConnection}
        disabled={testing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-[12.5px] text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={testing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        Test Connection
      </button>

      {(healthError || earthEngineError) && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-[11px] leading-relaxed text-destructive">
          {healthError ?? earthEngineError}
        </p>
      )}

      <p className="flex items-start gap-2 rounded-md border border-border bg-background/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        Earth Engine service-account keys, OAuth secrets and tokens are never stored or
        displayed in the browser. They belong exclusively to the FastAPI service.
      </p>
    </section>
  );
}
