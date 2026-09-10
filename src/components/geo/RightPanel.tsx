import {
  Copy,
  Database,
  Layers,
  ScanLine,
  Target as TargetIcon,
  TriangleAlert,
} from "lucide-react";
import type { Target } from "@/lib/api/types";
import { useAnalysisStore } from "@/state/analysis-store";
import { boxAround, formatCoord, processingSeconds } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { EvidenceBars } from "./EvidenceBars";

export function RightPanel() {
  const {
    targets,
    selectedTargetId,
    selectTarget,
    analysisStatus,
    analysisStage,
    layers,
    datasets,
    metadata,
    startedAt,
    completedAt,
    targetsReported,
  } = useAnalysisStore();
  const selected = targets.find((t) => t.target_id === selectedTargetId) ?? targets[0] ?? null;
  const activeLayers = layers.filter((l) => l.visible);
  const processingTimeS = processingSeconds(metadata?.duration_seconds, startedAt, completedAt);

  return (
    <aside
      aria-label="Analysis context panel"
      className="flex w-[340px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4"
    >
      <section>
        <h2 className="label-tech">Analysis status</h2>
        <p className="mt-1 text-[13px] capitalize text-secondary-foreground">
          {analysisStatus.replace(/_/g, " ")}
          {analysisStage !== "idle" && ` · ${analysisStage.replace(/_/g, " ")}`}
        </p>
        {typeof processingTimeS === "number" && (
          <p className="mono-coord mt-0.5 text-[11px] text-muted-foreground">
            {processingTimeS.toFixed(1)} s reported processing time
          </p>
        )}
        {completedAt && (
          <p className="mono-coord mt-0.5 text-[11px] text-muted-foreground">
            Completed {new Date(completedAt).toLocaleString()}
          </p>
        )}
      </section>

      <section>
        <h2 className="label-tech flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5" /> Datasets
        </h2>
        {datasets.length === 0 ? (
          <p className="mt-1 text-[12px] text-muted-foreground">
            No dataset status reported. The backend has not returned an acquisition manifest.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {datasets.map((d) => (
              <li key={d.name} className="flex items-start justify-between gap-2 text-[12px]">
                <span className="text-secondary-foreground">{d.name}</span>
                <span className="mono-coord text-right text-[10.5px] uppercase text-muted-foreground">
                  {d.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="label-tech flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" /> Active layers ({activeLayers.length})
        </h2>
        <p className="mt-1 text-[12px] text-secondary-foreground">
          {activeLayers.map((l) => l.name).join(", ")}
        </p>
      </section>

      <section className="flex-1">
        <h2 className="label-tech flex items-center gap-1.5">
          <TargetIcon className="h-3.5 w-3.5" /> Target ranking
        </h2>
        {targets.length === 0 ? (
          <EmptyTargets reported={targetsReported} />
        ) : (
          <>
            <ul className="mt-2 space-y-1.5">
              {targets.map((t) => (
                <li key={t.target_id}>
                  <button
                    type="button"
                    onClick={() => selectTarget(t.target_id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors",
                      t.target_id === selected?.target_id
                        ? "border-target/60 bg-target/10"
                        : "border-border hover:bg-elevated",
                    )}
                  >
                    <span
                      className={cn(
                        "mono-coord text-[13px] font-semibold",
                        t.rank === 1 ? "text-target" : "text-accent",
                      )}
                    >
                      {String(t.rank).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px]">
                        Evidence {t.strength_percent?.toFixed(0) ?? "—"}%
                      </span>
                      <span className="mono-coord block truncate text-[10.5px] text-muted-foreground">
                        {formatCoord(t.latitude, "lat")} {formatCoord(t.longitude, "lon")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {selected && <TargetDetail target={selected} />}
          </>
        )}
      </section>
    </aside>
  );
}

function EmptyTargets({ reported }: { reported: boolean }) {
  return (
    <div className="mt-3 rounded-md border border-dashed border-border p-4 text-center">
      <ScanLine className="mx-auto h-5 w-5 text-muted-foreground" />
      <p className="mt-2 text-[12.5px] text-secondary-foreground">
        {reported ? "No scientifically supported target zones identified" : "No analysis available"}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {reported
          ? "The backend completed the run and returned zero evidence-supported zones. An empty result is a valid scientific outcome."
          : "Define an AOI and run an analysis. Targets appear only when the backend returns evidence-supported zones."}
      </p>
    </div>
  );
}

function TargetDetail({ target }: { target: Target }) {
  const size = target.box_size_m || 10;
  const [[minLat, minLon], [maxLat, maxLon]] = boxAround(target.latitude, target.longitude, size);
  const interpretation = target.type_interpretation;

  return (
    <div className="mt-4 space-y-3 rounded-md border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold">Zone #{target.rank}</h3>
        <span className="mono-coord rounded border border-anomaly/60 px-1.5 py-0.5 text-[10px] uppercase text-anomaly">
          measured anomaly
        </span>
      </div>

      {interpretation && (
        <div className="rounded border border-warning/40 bg-warning/5 p-2">
          <p className="mono-coord text-[11px] uppercase text-warning">
            hypothesis · {interpretation.label}
          </p>
          <p className="mono-coord mt-0.5 text-[10.5px] text-secondary-foreground">
            Hypothesis fit {interpretation.fit_percent?.toFixed(0)}% (not a probability)
          </p>
          {interpretation.alternatives?.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {interpretation.alternatives.map((a) => (
                <li key={a.label} className="mono-coord text-[10.5px] text-muted-foreground">
                  {a.label} · {a.fit_percent?.toFixed(0)}%
                </li>
              ))}
            </ul>
          )}
          {interpretation.scientific_note && (
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              {interpretation.scientific_note}
            </p>
          )}
        </div>
      )}

      <div className="mono-coord space-y-0.5 text-[11.5px] text-secondary-foreground">
        <div>{formatCoord(target.latitude, "lat")}</div>
        <div>{formatCoord(target.longitude, "lon")}</div>
        <div className="text-[10.5px] text-muted-foreground">
          {target.latitude}, {target.longitude}
        </div>
        {target.utm?.easting !== undefined && target.utm?.northing !== undefined && (
          <div className="text-[10.5px] text-muted-foreground">
            UTM {target.utm.zone}
            {target.utm.hemisphere} {Number(target.utm.easting).toFixed(1)} E{" "}
            {Number(target.utm.northing).toFixed(1)} N
          </div>
        )}
      </div>

      <dl className="space-y-1 rounded border border-border bg-background/40 p-2">
        <ScoreRow label="Evidence strength" value={target.strength_percent} suffix="%" />
        <ScoreRow label="Fused score" value={target.anomaly_score} />
        <ScoreRow label="Consensus" value={target.consensus_score} />
        <ScoreRow label="Geology" value={target.geological_score} />
        <ScoreRow label="Temporal" value={target.temporal_score} />
        <ScoreRow label="Thermal" value={target.thermal_score} />
        <ScoreRow label="Surface artifact risk" value={target.surface_artifact_risk} />
      </dl>

      <div className="rounded border border-target/40 bg-target/5 p-2">
        <p className="label-tech">
          {size} m × {size} m investigation box
        </p>
        <p className="mono-coord mt-1 text-[10.5px] leading-relaxed text-secondary-foreground">
          {minLat.toFixed(6)}, {minLon.toFixed(6)}
          <br />
          {maxLat.toFixed(6)}, {maxLon.toFixed(6)}
        </p>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard?.writeText(`${target.latitude},${target.longitude}`)
          }
          className="mt-2 inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-secondary-foreground hover:bg-elevated"
        >
          <Copy className="h-3 w-3" /> Copy coordinates
        </button>
      </div>

      <EvidenceBars target={target} />

      <EvidenceList items={target.evidence} />

      <p className="mono-coord text-[10.5px] text-muted-foreground">
        Depth estimate: not supported by satellite data alone
        {target.depth_estimate_m === null ? "" : ` (${target.depth_estimate_m} m)`}
      </p>

      {target.trace_id && (
        <p className="mono-coord text-[10.5px] text-muted-foreground">
          Score trace {target.trace_id}
        </p>
      )}

      <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
        <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
        Interpretation is a hypothesis only and requires independent field verification.
      </p>
    </div>
  );
}

function EvidenceList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="label-tech">Evidence reported by the backend</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li key={item} className="text-[11px] leading-relaxed text-secondary-foreground">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value?: number | null | undefined;
  suffix?: string | undefined;
}) {

  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label-tech">{label}</dt>
      <dd className="mono-coord text-[11px] text-secondary-foreground">
        {typeof value === "number" ? `${value.toFixed(suffix === "%" ? 0 : 3)}${suffix}` : "—"}
      </dd>
    </div>
  );
}
