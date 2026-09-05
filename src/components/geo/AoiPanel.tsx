import { Crosshair, LocateFixed, Play, TriangleAlert } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";
import { formatArea, formatCoord } from "@/lib/geo";
import { SUPPORTED_SCALES_M, type AoiGeometryType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** The backend accepts only these two geometries (schemas.AOIRequest). */
const SHAPES: { id: AoiGeometryType; label: string }[] = [
  { id: "circle", label: "Circle (radius)" },
  { id: "square", label: "Square" },
];

export function AoiPanel({
  onRunAnalysis,
  running,
}: {
  onRunAnalysis: () => void;
  running: boolean;
}) {
  const { aoi, patchAoi } = useAnalysisStore();
  const hasCenter = aoi.centerLat !== null && aoi.centerLon !== null;
  const area =
    aoi.geometryType === "circle" ? Math.PI * aoi.radiusM ** 2 : (aoi.radiusM * 2) ** 2;

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-accent" />
        <h2 className="text-[13px] font-semibold tracking-tight">Area of Interest</h2>
      </header>

      <div>
        <label className="label-tech" htmlFor="aoi-name">
          Name (local label)
        </label>
        <input
          id="aoi-name"
          value={aoi.name}
          onChange={(e) => patchAoi({ name: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-primary"
        />
      </div>

      <div>
        <span className="label-tech">Geometry</span>
        <div className="mt-1 grid grid-cols-2 gap-1 rounded-md border border-border bg-background p-1">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => patchAoi({ geometryType: s.id })}
              className={cn(
                "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                aoi.geometryType === s.id
                  ? "bg-primary/18 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Click the map to set the AOI centre, or enter coordinates below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-tech" htmlFor="aoi-lat">
            Latitude
          </label>
          <input
            id="aoi-lat"
            inputMode="decimal"
            placeholder="—"
            value={aoi.centerLat ?? ""}
            onChange={(e) =>
              patchAoi({ centerLat: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="mono-coord mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="label-tech" htmlFor="aoi-lon">
            Longitude
          </label>
          <input
            id="aoi-lon"
            inputMode="decimal"
            placeholder="—"
            value={aoi.centerLon ?? ""}
            onChange={(e) =>
              patchAoi({ centerLon: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="mono-coord mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label-tech" htmlFor="aoi-radius">
            AOI radius
          </label>
          <span className="mono-coord text-[12px] text-accent">{aoi.radiusM} m</span>
        </div>
        <input
          id="aoi-radius"
          type="range"
          min={10}
          max={500}
          step={5}
          value={aoi.radiusM}
          onChange={(e) =>
            patchAoi({ radiusM: Math.min(500, Math.max(10, Number(e.target.value))) })
          }
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
        <p className="mt-1 text-[10.5px] text-muted-foreground">
          Backend limit: 10–500 m.
        </p>
      </div>

      <div>
        <span className="label-tech">Analysis scale (backend supported)</span>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {SUPPORTED_SCALES_M.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => patchAoi({ scaleM: s })}
              className={cn(
                "mono-coord rounded border px-2 py-1 text-[11px] transition-colors",
                aoi.scaleM === s
                  ? "border-accent/60 bg-accent/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s} m
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-tech" htmlFor="aoi-start">
            Start date
          </label>
          <input
            id="aoi-start"
            type="date"
            value={aoi.startDate}
            onChange={(e) => patchAoi({ startDate: e.target.value })}
            className="mono-coord mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[12px] outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="label-tech" htmlFor="aoi-end">
            End date
          </label>
          <input
            id="aoi-end"
            type="date"
            value={aoi.endDate}
            onChange={(e) => patchAoi({ endDate: e.target.value })}
            className="mono-coord mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[12px] outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label-tech" htmlFor="aoi-cloud">
            Max cloud cover
          </label>
          <span className="mono-coord text-[12px] text-accent">{aoi.cloudPct}%</span>
        </div>
        <input
          id="aoi-cloud"
          type="range"
          min={0}
          max={100}
          step={1}
          value={aoi.cloudPct}
          onChange={(e) => patchAoi({ cloudPct: Number(e.target.value) })}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
      </div>

      <dl className="space-y-1.5 rounded-md border border-border bg-background/60 p-3 text-[12px]">
        <Row
          label="Centre"
          value={
            hasCenter
              ? `${formatCoord(aoi.centerLat as number, "lat")}  ${formatCoord(aoi.centerLon as number, "lon")}`
              : "Not defined"
          }
        />
        <Row label="Extent" value={`${aoi.radiusM * 2} m across`} />
        <Row label="Area" value={formatArea(area)} />
        <Row label="CRS" value="EPSG:4326 (WGS 84)" />
      </dl>

      <button
        type="button"
        disabled={!hasCenter || running}
        onClick={onRunAnalysis}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play className="h-3.5 w-3.5" />
        {running ? "Submitting…" : "Start Analysis"}
      </button>

      {!hasCenter && (
        <p className="flex items-start gap-2 text-[11px] text-warning">
          <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Define an AOI centre before requesting an analysis.
        </p>
      )}

      <p className="flex items-start gap-2 rounded-md border border-border bg-background/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        GeoAnomaly Pro identifies statistically unusual geospatial signatures from
        remote-sensing and terrain datasets. It does not detect underground objects.
        Target interpretations are hypotheses requiring independent field verification.
      </p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label-tech">{label}</dt>
      <dd className="mono-coord text-right text-[11.5px] text-secondary-foreground">{value}</dd>
    </div>
  );
}
