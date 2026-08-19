import {
  Activity,
  CircleX,
  Database,
  FileText,
  History,
  Mountain,
  ScanLine,
  Settings as SettingsIcon,
  Target as TargetIcon,
} from "lucide-react";
import type { SectionId } from "./Sidebar";
import { AoiPanel } from "./AoiPanel";
import { useAnalysisStore } from "@/state/analysis-store";
import { getApiBaseUrl } from "@/lib/api/client";
import { BackendSettings } from "./BackendSettings";
import { ProjectsPanel } from "./ProjectsPanel";
import { DebugPanel } from "./DebugPanel";
import { AnalysisErrorCard } from "./AnalysisErrorCard";

const CATALOG: { group: string; items: { name: string; badge: string }[] }[] = [
  {
    group: "Optical",
    items: [
      { name: "Sentinel-2", badge: "Optical" },
      { name: "Landsat 8", badge: "Optical" },
      { name: "Landsat 9", badge: "Optical" },
    ],
  },
  { group: "SAR", items: [{ name: "Sentinel-1", badge: "SAR" }] },
  {
    group: "DEM",
    items: [
      { name: "Copernicus DEM", badge: "Terrain" },
      { name: "SRTM", badge: "Terrain" },
      { name: "NASADEM", badge: "Terrain" },
    ],
  },
  {
    group: "Thermal",
    items: [
      { name: "ASTER", badge: "Thermal" },
      { name: "Landsat Thermal", badge: "Thermal" },
      { name: "MODIS", badge: "Thermal" },
    ],
  },
  { group: "Hyperspectral", items: [{ name: "EMIT", badge: "Coming soon" }] },
];

export function SectionPanel({
  section,
  onRunAnalysis,
  running,
}: {
  section: SectionId;
  onRunAnalysis: () => void;
  running: boolean;
}) {
  const { datasets, errors, analysisId, analysisStatus, completedAt, processingTimeS, health } =
    useAnalysisStore();

  return (
    <div className="w-[320px] shrink-0 overflow-y-auto border-r border-border bg-panel p-4">
      {errors.length > 0 && <AnalysisErrorCard onRetry={onRunAnalysis} />}


      {section === "aoi" && <AoiPanel onRunAnalysis={onRunAnalysis} running={running} />}

      {section === "project" && (
        <Stack
          icon={FileText}
          title="Project"
          rows={[
            ["Project", "Untitled project"],
            ["Backend", getApiBaseUrl() || "VITE_API_BASE_URL not set"],
            ["Analysis ID", analysisId ?? "—"],
            ["Status", analysisStatus],
            ["Last analysis", completedAt ?? "No analysis available"],
            [
              "Processing time",
              processingTimeS !== null ? `${processingTimeS}s` : "No analysis available",
            ],
          ]}
        />
      )}

      {section === "project" && <div className="mt-4"><ProjectsPanel /></div>}

      {section === "data" && (
        <section className="space-y-4">
          <Header icon={Database} title="Data Sources" />
          {CATALOG.map((g) => (
            <div key={g.group}>
              <p className="label-tech">{g.group}</p>
              <ul className="mt-1 space-y-1">
                {g.items.map((item) => {
                  const live = datasets.find((d) => d.name === item.name);
                  return (
                    <li
                      key={item.name}
                      className="flex items-center justify-between rounded border border-border px-2 py-1.5"
                    >
                      <span className="text-[12px] text-secondary-foreground">{item.name}</span>
                      <span className="mono-coord text-[9.5px] uppercase text-muted-foreground">
                        {live ? live.status.replace("_", " ") : item.badge === "Coming soon" ? "Coming soon" : "Unavailable"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <Note>
            Dataset availability is reported by the analysis backend. Nothing is marked
            retrieved unless Earth Engine confirms coverage.
          </Note>
        </section>
      )}

      {section === "analysis" && (
        <Stack
          icon={Activity}
          title="Analysis"
          rows={[
            ["Engine", "External Python / FastAPI"],
            ["Earth Engine", health?.earth_engine ? "Connected" : "Unverified"],
            ["EE project", health?.earth_engine_project ?? "—"],
            ["Ensemble", "Isolation Forest · LOF · Z-Score · PCA distance"],
            ["Clustering", "DBSCAN (spatial zones)"],
            ["Multi-scale", "10 / 20 / 50 / 100 / 200 / 300 / 500 m"],
          ]}
          note="Weights are defined and applied by the backend methodology and are configurable there."
        />
      )}

      {section === "geology" && (
        <Stack
          icon={Mountain}
          title="Geological Intelligence"
          rows={[
            ["Iron Oxide", "Awaiting analysis"],
            ["Clay Minerals", "Awaiting analysis"],
            ["Hydrothermal Alteration", "Awaiting analysis"],
            ["Lineament density", "Awaiting analysis"],
            ["Terrain / slope", "Awaiting analysis"],
          ]}
          note="Every geological result must be accompanied by supporting features returned by the backend."
        />
      )}

      {section === "anomaly" && (
        <Stack
          icon={ScanLine}
          title="Anomaly Detection"
          rows={[
            ["Z-Score", "Not run"],
            ["Isolation Forest", "Not run"],
            ["Local Outlier Factor", "Not run"],
            ["PCA distance", "Not run"],
            ["Ensemble", "Not run"],
          ]}
          note="LOF is skipped by the backend when n_neighbors exceeds the valid sample count; this is reported, not hidden."
        />
      )}

      {section === "targets" && (
        <Stack
          icon={TargetIcon}
          title="Targets"
          rows={[["Detected targets", "No analysis available"]]}
          note="Targets appear in the right-hand panel only when the backend returns evidence-supported zones."
        />
      )}

      {section === "temporal" && (
        <Stack
          icon={History}
          title="Temporal Analysis"
          rows={[
            ["NDVI series", "No valid data available"],
            ["NDMI series", "No valid data available"],
            ["SAR series", "No valid data available"],
            ["Thermal series", "No valid data available"],
          ]}
          note="Mean, variance, trend, stability and persistence are computed from real historical observations only."
        />
      )}

      {section === "reports" && (
        <Stack
          icon={FileText}
          title="Reports"
          rows={[["Report", "No analysis available"]]}
          note="Exports (PDF / JSON / CSV / GeoJSON) contain analysis results only. Nothing is exported without a completed run."
        />
      )}

      {section === "settings" && (
        <div className="space-y-5">
          <BackendSettings />
          <DebugPanel />
        </div>
      )}

      {section === "settings" && (
        <Stack
          icon={SettingsIcon}
          title="Settings"
          rows={[
            ["API base URL", getApiBaseUrl() || "Not configured"],
            ["Credential storage", "Backend only"],
            ["CRS", "EPSG:4326"],
          ]}
          note="Earth Engine credentials never reach the browser; authentication is handled by the FastAPI service."
        />
      )}
    </div>
  );
}

function Header({ icon: Icon, title }: { icon: typeof Database; title: string }) {
  return (
    <header className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" />
      <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
    </header>
  );
}

function Stack({
  icon,
  title,
  rows,
  note,
}: {
  icon: typeof Database;
  title: string;
  rows: [string, string][];
  note?: string;
}) {
  return (
    <section className="space-y-3">
      <Header icon={icon} title={title} />
      <dl className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="label-tech">{k}</dt>
            <dd className="mono-coord max-w-[60%] truncate text-right text-[11px] text-secondary-foreground">
              {v}
            </dd>
          </div>
        ))}
      </dl>
      {note && <Note>{note}</Note>}
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-border bg-background/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
