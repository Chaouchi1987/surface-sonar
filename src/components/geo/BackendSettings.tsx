import { useState } from "react";
import { Plug, RefreshCw, Save, TriangleAlert } from "lucide-react";
import {
  ApiError,
  DEMO_MODE,
  ENV_API_BASE_URL,
  getApiBaseUrl,
  setApiBaseUrl,
} from "@/lib/api/client";
import { healthService } from "@/services";
import { useAnalysisStore } from "@/state/analysis-store";

/**
 * Backend connection settings. The FastAPI base URL is configurable at
 * runtime; no credential or secret is ever stored in the browser.
 */
export function BackendSettings() {
  const {
    health,
    healthError,
    earthEngine,
    earthEngineError,
    lastHealthCheck,
    setHealth,
    setHealthChecking,
    setEarthEngine,
  } = useAnalysisStore();

  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setApiBaseUrl(url);
    setUrl(getApiBaseUrl());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const test = async () => {
    setTesting(true);
    setHealthChecking(true);
    try {
      const result = await healthService.check();
      setHealth(result, null);
    } catch (error) {
      setHealth(null, error instanceof ApiError ? error.message : "Backend unreachable.");
    }
    try {
      const ee = await healthService.earthEngine();
      setEarthEngine(ee, null);
    } catch (error) {
      setEarthEngine(
        null,
        error instanceof ApiError ? error.message : "Earth Engine status unverified.",
      );
    }
    setTesting(false);
  };

  const rows: [string, string][] = [
    ["Effective base URL", getApiBaseUrl() || "Not configured"],
    ["Env VITE_API_BASE_URL", ENV_API_BASE_URL || "Not set"],
    [
      "Backend status",
      healthError ? "Offline" : health ? `Connected (${health.status})` : "Unknown",
    ],
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

      <div>
        <label className="label-tech" htmlFor="api-base-url">
          FastAPI base URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="api-base-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="mono-coord min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] text-secondary-foreground hover:bg-elevated hover:text-foreground"
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Stored locally in this browser only, overriding VITE_API_BASE_URL. Leave empty to
          use the environment value.
        </p>
      </div>

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
        onClick={() => void test()}
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
