import { Bell, RefreshCw } from "lucide-react";
import { Logo } from "./Logo";
import { StatusDot } from "./StatusDot";
import { UserMenu } from "./UserMenu";
import { useAnalysisStore } from "@/state/analysis-store";
import { API_BASE_URL, DEMO_MODE } from "@/lib/api/client";

export function TopBar({
  onRefreshHealth,
  onOpenSection,
}: {
  onRefreshHealth: () => void;
  onOpenSection: (id: "project" | "settings") => void;
}) {
  const { health, healthError, healthChecking, earthEngine, aoi } = useAnalysisStore();

  const backendOnline = !!health && !healthError;
  const eeReady = earthEngine?.status === "ready";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <Logo />
        <div className="leading-tight">
          <h1 className="text-sm font-semibold tracking-tight">GeoAnomaly Pro</h1>
          <p className="label-tech">Geospatial Intelligence</p>
        </div>
        {DEMO_MODE && (
          <span className="rounded border border-warning/60 bg-warning/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-warning">
            Demo mode — not scientific results
          </span>
        )}
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 md:flex">
        <span className="label-tech">AOI</span>
        <span className="mono-coord truncate text-xs text-secondary-foreground">
          {aoi.name} · scale {aoi.scaleM} m
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden flex-col items-end gap-0.5 sm:flex">
          <StatusDot
            tone={backendOnline ? "success" : healthChecking ? "warning" : "error"}
            pulse={healthChecking}
            label={
              healthChecking
                ? "Checking backend…"
                : backendOnline
                  ? "Backend Connected"
                  : "Backend Offline"
            }
          />
          <StatusDot
            tone={eeReady ? "success" : earthEngine?.status === "error" ? "error" : "muted"}
            label={
              eeReady
                ? "Earth Engine Ready"
                : earthEngine?.status === "error"
                  ? "Earth Engine Error"
                  : "Earth Engine Unverified"
            }
          />
        </div>
        <button
          type="button"
          onClick={onRefreshHealth}
          aria-label="Re-check backend connection"
          title={API_BASE_URL ? `API: ${API_BASE_URL}` : "VITE_API_BASE_URL not configured"}
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          <RefreshCw className={healthChecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <UserMenu onOpenSection={onOpenSection} />
      </div>
    </header>
  );
}
