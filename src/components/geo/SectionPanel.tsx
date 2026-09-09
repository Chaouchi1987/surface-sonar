import {
  Activity,
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
import { FeatureDomainSection } from "./FeatureDomainSection";
import { ReportsPanel } from "./ReportsPanel";
import { formatCoord } from "@/lib/geo";

/**
 * Reference catalogue of the sources the platform can consume. It is only used
 * to say "not reported by the backend" for a source the backend did not
 * mention — it never supplies a status of its own.
 */
const REFERENCE_SOURCES = [
  "Sentinel-2",
  "Sentinel-1",
  "Landsat 8",
  "Landsat 9",
  "Copernicus DEM",
  "SRTM",
  "NASADEM",
  "ASTER",
  "MODIS",
  "EMIT",
];

function statusTone(status: string): string {
  const s = status.toLowerCase();
  if (s.startsWith("unavailable") || s.includes("error") || s === "not_run") return "text-muted-foreground";
  if (s.includes("pending") || s.includes("partial")) return "text-warning";
  return "text-accent";
}

export function SectionPanel({
  section,
  onRunAnalysis,
  running,
}: {
  section: SectionId;
  onRunAnalysis: () => void;
  running: boolean;
}) {
  const {
    datasets,
    errors,
    analysisId,
    analysisStatus,
    completedAt,
    metadata,
    quality,
    earthEngine,
    layers,
    targets,
    targetsReported,
    resultIssues,
    samples,
  } = useAnalysisStore();
  const processingTimeS = metadata?.duration_seconds;
  const resultLayers = layers.filter((l) => l.group === "result");
  const reportedNames = new Set(datasets.map((d) => d.name.toLowerCase()));

  return (
    <div className="w-[320px] shrink-0 overflow-y-auto border-r border-border bg-panel p-4">
      {errors.length > 0 && <AnalysisErrorCard onRetry={onRunAnalysis} />}

      {resultIssues.length > 0 && (
        <div className="mb-4 rounded-md border border-warning/50 bg-warning/10 p-2.5">
          <p className="label-tech text-warning">Incomplete backend result</p>
          <ul className="mt-1 space-y-0.5">
            {resultIssues.map((issue) => (
              <li key={issue} className="text-[11px] leading-relaxed text-secondary-foreground">
                · {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

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
              typeof processingTimeS === "number"
                ? `${processingTimeS.toFixed(1)}s`
                : "No analysis available",
            ],
          ]}
        />
      )}

      {section === "project" && (
        <div className="mt-4">
          <ProjectsPanel />
        </div>
      )}

      {section === "data" && (
        <section className="space-y-4">
          <Header icon={Database} title="Data Sources" />

          {datasets.length === 0 ? (
            <Note>
              No acquisition manifest reported. Run an analysis — dataset availability comes only
              from <span className="mono-coord">/analysis/&#123;id&#125;/datasets</span>.
            </Note>
          ) : (
            <ul className="space-y-1">
              {datasets.map((d) => (
                <li key={d.name} className="rounded border border-border px-2 py-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] text-secondary-foreground">{d.name}</span>
                    <span
                      className={`mono-coord text-right text-[9.5px] uppercase ${statusTone(d.status)}`}
                    >
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mono-coord mt-0.5 text-[10px] text-muted-foreground">
                    {[
                      typeof d.resolution_m === "number" ? `${d.resolution_m} m` : null,
                      typeof d.scenes === "number" ? `${d.scenes} scenes` : null,
                      d.modules?.length ? d.modules.join(", ") : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "no additional detail reported"}
                  </p>
                  {d.note && (
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                      {d.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {datasets.length > 0 && (
            <div>
              <p className="label-tech">Not reported by this run</p>
              <ul className="mt-1 space-y-1">
                {REFERENCE_SOURCES.filter((n) => !reportedNames.has(n.toLowerCase())).map((n) => (
                  <li
                    key={n}
                    className="flex items-center justify-between rounded border border-border px-2 py-1"
                  >
                    <span className="text-[11.5px] text-muted-foreground">{n}</span>
                    <span className="mono-coord text-[9.5px] uppercase text-muted-foreground">
                      Unavailable
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="label-tech">Backend map layers ({resultLayers.length})</p>
            {resultLayers.length === 0 ? (
              <Note>No result layers returned for this run.</Note>
            ) : (
              <ul className="mt-1 space-y-1">
                {resultLayers.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded border border-border px-2 py-1"
                  >
                    <span className="truncate text-[11.5px] text-secondary-foreground">
                      {l.name}
                    </span>
                    <span className="mono-coord shrink-0 text-[9.5px] uppercase text-muted-foreground">
                      {l.kind}
                      {typeof l.resolutionM === "number" ? ` · ${l.resolutionM} m` : ""}
                      {l.available ? "" : " · no data"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Note>
            Dataset availability is reported by the analysis backend. Nothing is marked retrieved
            unless Earth Engine confirms coverage.
          </Note>
        </section>
      )}

      {section === "analysis" && (
        <div className="space-y-4">
          <Stack
            icon={Activity}
            title="Analysis"
            rows={[
              ["Engine", "External Python / FastAPI"],
              ["Earth Engine", earthEngine?.status ?? "Unverified"],
              ["EE project", earthEngine?.project ?? "—"],
              ["Analysis ID", analysisId ?? "—"],
              ["Status", analysisStatus],
              ["Scale", metadata?.analysis_scale_m ? `${metadata.analysis_scale_m} m` : "—"],
              ["Sampled cells", numberOr(metadata?.sample_count)],
              ["Candidate cells", numberOr(metadata?.target_candidate_count)],
              ["Observations", numberOr(metadata?.observation_count)],
              ["Feature count", numberOr(quality?.feature_count)],
              [
                "Feature completeness",
                typeof quality?.overall_completeness === "number"
                  ? `${(quality.overall_completeness * 100).toFixed(1)}%`
                  : "—",
              ],
              ["Method", String(metadata?.method ?? "—")],
            ]}
          />
          {metadata?.optional_modules && (
            <div className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
              <p className="label-tech">Optional modules reported</p>
              {Object.entries(metadata.optional_modules).map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="label-tech">{k.replace(/_/g, " ")}</dt>
                  <dd className="mono-coord text-[10.5px] text-secondary-foreground">{v}</dd>
                </div>
              ))}
            </div>
          )}
          {metadata?.score_semantics && <Note>{String(metadata.score_semantics)}</Note>}
          {metadata?.scientific_interpretation_policy && (
            <Note>{String(metadata.scientific_interpretation_policy)}</Note>
          )}
        </div>
      )}

      {section === "geology" && (
        <FeatureDomainSection
          title="Geological Intelligence"
          domains={["geology", "terrain", "structural", "spectral"]}
          targetScoreKeys={["geological_score", "iron_oxide", "clay_ratio"]}
          note="Mineral, terrain-derivative and lineament/edge evidence are shown only when the backend produced the corresponding features."
        />
      )}

      {section === "anomaly" && (
        <FeatureDomainSection
          title="Anomaly Detection"
          domains={["anomaly"]}
          targetScoreKeys={[
            "anomaly_score",
            "zscore_score",
            "isolation_forest_score",
            "consensus_score",
          ]}
          note="Detector outputs (Z-score, Isolation Forest, LOF, PCA distance, ensemble) appear only for detectors the backend actually ran; a skipped detector is reported, not filled in."
        />
      )}

      {section === "temporal" && (
        <FeatureDomainSection
          title="Temporal, Thermal & SAR"
          domains={["temporal", "thermal", "sar"]}
          targetScoreKeys={[
            "temporal_score",
            "temporal_disturbance_score",
            "temporal_stability_score",
            "thermal_score",
          ]}
          note="Series statistics are computed by the backend from real historical observations only."
        />
      )}

      {section === "targets" && (
        <section className="space-y-3">
          <Header icon={TargetIcon} title="Targets" />
          <dl className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
            <Row
              k="Detected targets"
              v={targetsReported ? String(targets.length) : "No analysis available"}
            />
            <Row k="Sampled cells" v={numberOr(metadata?.sample_count)} />
            <Row k="Candidate cells" v={numberOr(metadata?.target_candidate_count)} />
            <Row
              k="Investigation box"
              v={metadata?.target_box_m ? `${metadata.target_box_m} m` : "—"}
            />
          </dl>
          {targets.length > 0 && (
            <ul className="space-y-1">
              {targets.slice(0, 12).map((t) => (
                <li
                  key={t.target_id}
                  className="rounded border border-border px-2 py-1.5 text-[11.5px]"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="mono-coord text-accent">#{t.rank}</span>
                    <span className="mono-coord text-[10.5px] text-secondary-foreground">
                      evidence {t.strength_percent?.toFixed(0) ?? "—"}%
                    </span>
                  </div>
                  <p className="mono-coord mt-0.5 text-[10px] text-muted-foreground">
                    {formatCoord(t.latitude, "lat")} {formatCoord(t.longitude, "lon")}
                    {t.type_interpretation ? ` · ${t.type_interpretation.label}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Note>
            Targets are evidence-ranked unusual zones requiring field verification — never a claim
            of a detected underground object. Full detail is in the right-hand panel.
          </Note>
        </section>
      )}

      {section === "reports" && <ReportsPanel />}

      {section === "settings" && (
        <div className="space-y-5">
          <BackendSettings />
          <DebugPanel />
          <Stack
            icon={SettingsIcon}
            title="Settings"
            rows={[
              ["API base URL", getApiBaseUrl() || "Not configured"],
              ["Credential storage", "Backend only"],
              ["CRS", "EPSG:4326"],
              ["Sample rows held", String(samples.length)],
            ]}
            note="Earth Engine credentials never reach the browser; authentication is handled by the FastAPI service."
          />
        </div>
      )}
    </div>
  );
}

function numberOr(value: unknown): string {
  return typeof value === "number" ? String(value) : "—";
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label-tech">{k}</dt>
      <dd className="mono-coord max-w-[60%] truncate text-right text-[11px] text-secondary-foreground">
        {v}
      </dd>
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
          <Row key={k} k={k} v={v} />
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
