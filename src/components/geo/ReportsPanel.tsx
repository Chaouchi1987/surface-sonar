import { useCallback, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import { reportService } from "@/services";
import { ApiError, BACKEND_UNCONFIGURED } from "@/lib/api/client";
import { useAnalysisStore } from "@/state/analysis-store";
import type { ScientificReport, Target } from "@/lib/api/types";

/**
 * Reports come exclusively from GET /reports/{id} on a completed backend run.
 * Exports serialise that payload verbatim — no value is computed or invented
 * in the browser.
 */
export function ReportsPanel() {
  const { analysisId, analysisStatus, targets, metadata } = useAnalysisStore();
  const [report, setReport] = useState<ScientificReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** null = not probed yet. The PDF action stays disabled once the backend 404s. */
  const [pdfAvailable, setPdfAvailable] = useState<boolean | null>(null);
  const [pdfChecking, setPdfChecking] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");

  const openPdf = useCallback(async () => {
    if (!analysisId) return;
    const url = reportService.pdfUrl(analysisId);
    setPdfChecking(true);
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        setPdfAvailable(false);
        setPdfError(`HTTP ${res.status}`);
        return;
      }
      setPdfAvailable(true);
      const blobUrl = URL.createObjectURL(await res.blob());
      window.open(blobUrl, "_blank", "noopener");
    } catch (e) {
      setPdfAvailable(false);
      setPdfError(e instanceof Error ? e.message : "request failed");
    } finally {
      setPdfChecking(false);
    }
  }, [analysisId]);

  const load = useCallback(async () => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await reportService.get(analysisId));
    } catch (e) {
      setReport(null);
      setError(e instanceof ApiError ? e.message : BACKEND_UNCONFIGURED);
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  const ready = analysisStatus === "completed" && !!analysisId;

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" />
        <h2 className="text-[13px] font-semibold tracking-tight">Reports</h2>
      </header>

      {!ready ? (
        <p className="rounded-md border border-border bg-background/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          No completed analysis. A report exists only once the backend finishes a run.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 text-[12px] text-secondary-foreground hover:bg-elevated disabled:opacity-50"
          >
            <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            {loading ? "Loading report…" : report ? "Reload report" : "Load scientific report"}
          </button>

          {error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-[11px] text-destructive-foreground">
              {error}
            </p>
          )}

          {report && (
            <div className="space-y-2 rounded-md border border-border bg-background/60 p-3">
              <p className="text-[12.5px] font-medium">{report.title}</p>
              <p className="mono-coord text-[10.5px] text-muted-foreground">
                Generated {report.generated_at}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {report.scientific_boundary}
              </p>
              {report.methodology?.length > 0 && (
                <ul className="space-y-0.5">
                  {report.methodology.map((m) => (
                    <li key={m} className="text-[11px] text-secondary-foreground">
                      · {m}
                    </li>
                  ))}
                </ul>
              )}
              {report.limitations?.length > 0 && (
                <ul className="space-y-0.5">
                  {report.limitations.map((m) => (
                    <li key={m} className="text-[10.5px] text-muted-foreground">
                      ! {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            <ExportButton
              label="JSON"
              disabled={!report}
              onClick={() =>
                report && download(`${analysisId}-report.json`, "application/json", JSON.stringify(report, null, 2))
              }
            />
            <ExportButton
              label="CSV"
              disabled={targets.length === 0}
              onClick={() => download(`${analysisId}-targets.csv`, "text/csv", targetsCsv(targets))}
            />
            <ExportButton
              label="GeoJSON"
              disabled={targets.length === 0}
              onClick={() =>
                download(
                  `${analysisId}-targets.geojson`,
                  "application/geo+json",
                  JSON.stringify(targetsGeoJson(targets), null, 2),
                )
              }
            />
            <ExportButton
              label={pdfChecking ? "Checking PDF…" : "PDF"}
              disabled={pdfChecking || pdfAvailable === false}
              onClick={() => void openPdf()}
            />
          </div>

          {pdfAvailable === false && (
            <p className="rounded-md border border-border bg-background/40 p-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
              The backend does not serve a PDF for this run ({pdfError}). PDF export is disabled;
              use the JSON, CSV or GeoJSON exports above.
            </p>
          )}


          <p className="rounded-md border border-border bg-background/40 p-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
            Exports contain backend results only ({targets.length} target
            {targets.length === 1 ? "" : "s"}
            {typeof metadata?.sample_count === "number"
              ? `, ${metadata.sample_count} sampled cells`
              : ""}
            ). The PDF is rendered by the backend.
          </p>
        </>
      )}
    </section>
  );
}

function ExportButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11.5px] text-secondary-foreground hover:bg-elevated disabled:opacity-40"
    >
      <Download className="h-3 w-3" /> {label}
    </button>
  );
}

function download(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CSV_FIELDS: (keyof Target)[] = [
  "target_id", "rank", "cell_id", "latitude", "longitude", "box_size_m",
  "anomaly_score", "strength_percent", "zscore_score", "isolation_forest_score",
  "geological_score", "consensus_score", "temporal_score", "thermal_score",
  "surface_artifact_risk", "depth_estimate_m",
];

function targetsCsv(targets: Target[]): string {
  const head = [...CSV_FIELDS.map(String), "evidence", "interpretation"].join(",");
  const rows = targets.map((t) => {
    const cells = CSV_FIELDS.map((f) => {
      const v = t[f];
      return v === null || v === undefined ? "" : String(v);
    });
    cells.push(`"${(t.evidence ?? []).join("; ").replace(/"/g, '""')}"`);
    cells.push(`"${(t.type_interpretation?.label ?? "").replace(/"/g, '""')}"`);
    return cells.join(",");
  });
  return [head, ...rows].join("\n");
}

function targetsGeoJson(targets: Target[]) {
  return {
    type: "FeatureCollection" as const,
    features: targets.map((t) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [t.longitude, t.latitude] },
      properties: { ...t },
    })),
  };
}
