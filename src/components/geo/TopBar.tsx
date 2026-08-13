import { Bell, Settings, UserRound, RefreshCw } from "lucide-react";
import { Logo } from "./Logo";
import { StatusDot } from "./StatusDot";
import { useAnalysisStore } from "@/state/analysis-store";
import { API_BASE_URL } from "@/lib/api/client";

export function TopBar({ onRefreshHealth }: { onRefreshHealth: () => void }) {
  const { health, healthError, healthChecking, aoi } = useAnalysisStore();

  const backendOnline = !!health && !healthError;
  const eeReady = !!health?.earth_engine;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <Logo />
        <div className="leading-tight">
          <h1 className="text-sm font-semibold tracking-tight">GeoAnomaly Pro</h1>
          <p className="label-tech">Geospatial Intelligence</p>
        </div>
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
            tone={eeReady ? "success" : "muted"}
            label={eeReady ? "Earth Engine Ready" : "Earth Engine Unverified"}
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
        <div className="flex items-center gap-1">
          {[
            { Icon: Bell, label: "Notifications" },
            { Icon: Settings, label: "Settings" },
            { Icon: UserRound, label: "User profile" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
