import {
  Clock,
  Copy,
  Database,
  Download,
  Layers,
  ScanLine,
  Target as TargetIcon,
  TriangleAlert,
} from "lucide-react";
import type { Target } from "@/lib/api/types";
import { useAnalysisStore } from "@/state/analysis-store";
import { boxAround, formatCoord } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { EvidenceBars } from "./EvidenceBars";

export function RightPanel() {
  const {
    targets,
    selectedTargetId,
    selectTarget,
    analysisStatus,
    layers,
    datasets,
    processingTimeS,
    completedAt,
    targetsReported,
  } = useAnalysisStore();
  const selected = targets.find((t) => t.target_id === selectedTargetId) ?? targets[0] ?? null;
  const activeLayers = layers.filter((l) => l.visible);

  return (
    <aside
      aria-label="Analysis context panel"
      className="flex w-[340px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4"
    >
      <section>
        <h2 className="label-tech">Analysis status</h2>
        <p className="mt-1 text-[13px] capitalize text-secondary-foreground">
          {analysisStatus.replace(/_/g, " ")}
        </p>
        {processingTimeS !== null && (
          <p className="mono-coord mt-0.5 text-[11px] text-muted-foreground">
            {processingTimeS.toFixed(1)} s processing time
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
            No dataset status reported. Backend has not returned an acquisition manifest.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {datasets.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-[12px]">
                <span className="text-secondary-foreground">{d.name}</span>
                <span className="mono-coord text-[10.5px] uppercase text-muted-foreground">
                  {d.status.replace("_", " ")}
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
                      <span className="block text-[12.5px]">Target #{t.rank}</span>
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
          : "Define an AOI and run a scientific analysis. Targets appear only when the backend returns evidence-supported zones."}
      </p>
    </div>
  );
}


function TargetDetail({ target }: { target: Target }) {
  const [[minLat, minLon], [maxLat, maxLon]] = boxAround(
    target.latitude,
    target.longitude,
    10,
  );

  return (
    <div className="mt-4 space-y-3 rounded-md border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold">Target #{target.rank}</h3>
        <div className="flex flex-wrap justify-end gap-1">
          {target.evidence_class && (
            <span
              className={cn(
                "mono-coord rounded border px-1.5 py-0.5 text-[10px] uppercase",
                target.evidence_class === "anomaly"
                  ? "border-anomaly/60 text-anomaly"
                  : "border-warning/60 text-warning",
              )}
            >
              {target.evidence_class === "anomaly" ? "measured anomaly" : "hypothesis"}
            </span>
          )}
          <span className="mono-coord rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
            {target.interpretation.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {target.category && (
        <p className="mono-coord text-[11px] text-secondary-foreground">
          Category: {target.category.replace(/_/g, " ")}
        </p>
      )}

      <div className="mono-coord space-y-0.5 text-[11.5px] text-secondary-foreground">
        <div>{formatCoord(target.latitude, "lat")}</div>
        <div>{formatCoord(target.longitude, "lon")}</div>
        <div className="text-[10.5px] text-muted-foreground">
          {target.latitude}, {target.longitude}
        </div>
      </div>

      <dl className="space-y-1 rounded border border-border bg-background/40 p-2">
        <ScoreRow label="Intelligence" value={target.intelligence_score ?? target.scores?.intelligence} />
        <ScoreRow label="Geology" value={target.geological_score ?? target.scores?.geological} />
        <ScoreRow label="Temporal" value={target.temporal_score ?? target.scores?.temporal} />
        <ScoreRow label="Thermal" value={target.thermal_score ?? target.scores?.thermal} />
        <ScoreRow label="Structural" value={target.structural_score ?? target.scores?.structural} />
        <ScoreRow label="Confidence" value={target.confidence} />
      </dl>


      <div className="rounded border border-target/40 bg-target/5 p-2">
        <p className="label-tech">10 m × 10 m investigation box</p>
        <p className="mono-coord mt-1 text-[10.5px] leading-relaxed text-secondary-foreground">
          {minLat.toFixed(6)}, {minLon.toFixed(6)}
          <br />
          {maxLat.toFixed(6)}, {maxLon.toFixed(6)}
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() =>
              void navigator.clipboard?.writeText(
                `${target.latitude},${target.longitude}`,
              )
            }
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-secondary-foreground hover:bg-elevated"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-secondary-foreground hover:bg-elevated"
          >
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      <EvidenceBars target={target} />

      <Block title="Supporting evidence" items={target.supporting_features} />
      <Block title="Data sources" items={target.data_sources} />
      <Block title="Methodology" items={target.methodology} />
      <Block title="Known limitations" items={target.limitations} tone="warning" />

      <p className="mono-coord flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        <Clock className="h-3 w-3" /> {target.analysis_timestamp}
      </p>

      <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
        <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
        Interpretation is a hypothesis only and requires independent field verification.
      </p>
    </div>
  );
}

function Block({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning";
}) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="label-tech">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "text-[11.5px] leading-relaxed",
              tone === "warning" ? "text-warning" : "text-secondary-foreground",
            )}
          >
            {tone === "warning" ? "• " : "✓ "}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value?: number | undefined }) {
  if (typeof value !== "number") return null;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label-tech">{label}</dt>
      <dd className="mono-coord text-[11px] text-secondary-foreground">{value.toFixed(3)}</dd>
    </div>
  );
}

function EvidenceList({ items }: { items?: Target["evidence"] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="label-tech">Evidence records (backend)</p>
      <ul className="mt-1 space-y-1.5">
        {items.map((e, i) => (
          <li key={`${e.channel}-${i}`} className="rounded border border-border p-2">
            <p className="mono-coord text-[10px] uppercase text-accent">
              {String(e.channel).replace(/_/g, " ")}
              {e.strength ? ` · ${e.strength}` : ""}
              {typeof e.score === "number" ? ` · ${e.score.toFixed(3)}` : ""}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-secondary-foreground">
              {e.description}
            </p>
            {e.source && (
              <p className="mono-coord mt-0.5 text-[10px] text-muted-foreground">{e.source}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
