import { useMemo } from "react";
import { useAnalysisStore } from "@/state/analysis-store";
import {
  DOMAIN_LABELS,
  formatNumber,
  groupFeatures,
  humanise,
  type FeatureDomain,
  type FeatureStat,
} from "@/lib/feature-groups";
import type { Target } from "@/lib/api/types";

/**
 * Renders one scientific domain strictly from backend output:
 * the feature keys present in GET /analysis/{id}/samples and the score fields
 * present on GET /analysis/{id}/targets. Nothing is generated locally.
 */
export function FeatureDomainSection({
  domains,
  title,
  targetScoreKeys,
  note,
}: {
  domains: FeatureDomain[];
  title: string;
  /** Target score fields belonging to this domain, when the backend sent them. */
  targetScoreKeys?: (keyof Target)[];
  note?: string;
}) {
  const { quality, samples, targets, analysisStatus, targetsReported } = useAnalysisStore();

  const grouped = useMemo(
    () => groupFeatures(quality?.by_feature, samples),
    [quality?.by_feature, samples],
  );

  const rows = domains.flatMap((d) => grouped[d].map((f) => ({ ...f, domain: d })));

  const scoreRows = (targetScoreKeys ?? [])
    .map((key) => {
      const values = targets
        .map((t) => t[key])
        .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      return { key: String(key), values };
    })
    .filter((r) => r.values.length > 0);

  const nothing = rows.length === 0 && scoreRows.length === 0;

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>

      {nothing ? (
        <p className="rounded-md border border-border bg-background/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {analysisStatus === "completed" || targetsReported
            ? "The completed run returned no features for this domain. The backend did not produce them — no values are shown."
            : "No analysis available. This panel only shows values returned by the analysis backend."}
        </p>
      ) : (
        <>
          {rows.length > 0 && (
            <div className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
              <p className="label-tech">Backend features ({rows.length})</p>
              <ul className="space-y-1">
                {rows.map((f) => (
                  <FeatureRow key={f.key} stat={f} />
                ))}
              </ul>
            </div>
          )}

          {scoreRows.length > 0 && (
            <div className="space-y-1.5 rounded-md border border-border bg-background/60 p-3">
              <p className="label-tech">Target scores in this domain</p>
              {scoreRows.map((r) => {
                const max = Math.max(...r.values);
                const mean = r.values.reduce((a, b) => a + b, 0) / r.values.length;
                return (
                  <div key={r.key} className="flex items-baseline justify-between gap-3">
                    <dt className="label-tech">{humanise(r.key)}</dt>
                    <dd className="mono-coord text-[10.5px] text-secondary-foreground">
                      max {formatNumber(max)} · mean {formatNumber(mean)} · n {r.values.length}
                    </dd>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!nothing && (
        <p className="rounded-md border border-border bg-background/40 p-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
          Ranges are plain aggregates over the sample cells the backend returned. Completeness is
          reported by the backend. Values are relative evidence, not probabilities, and never a
          claim about a buried object.
        </p>
      )}

      {note && (
        <p className="rounded-md border border-border bg-background/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}

      {rows.length > 0 && (
        <p className="label-tech">
          Domains shown: {domains.map((d) => DOMAIN_LABELS[d]).join(", ")}
        </p>
      )}
    </section>
  );
}

function FeatureRow({ stat }: { stat: FeatureStat }) {
  return (
    <li className="rounded border border-border/70 px-2 py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] text-secondary-foreground">{humanise(stat.key)}</span>
        <span className="mono-coord text-[10px] uppercase text-muted-foreground">
          {stat.completeness !== undefined
            ? `${(stat.completeness * 100).toFixed(0)}% complete`
            : "coverage not reported"}
        </span>
      </div>
      {stat.min !== undefined && stat.max !== undefined && stat.mean !== undefined && (
        <p className="mono-coord mt-0.5 text-[10px] text-muted-foreground">
          min {formatNumber(stat.min)} · mean {formatNumber(stat.mean)} · max{" "}
          {formatNumber(stat.max)} · n {stat.count}
        </p>
      )}
    </li>
  );
}
