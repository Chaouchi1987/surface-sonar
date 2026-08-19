import { Crosshair, LocateFixed, Play, Upload, TriangleAlert } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";
import { INVESTIGATION_SCALES_M, formatArea, formatCoord } from "@/lib/geo";
import { cn } from "@/lib/utils";

const SHAPES: { id: "circle" | "rectangle" | "polygon"; label: string }[] = [
  { id: "circle", label: "Radius" },
  { id: "rectangle", label: "Rectangle" },
  { id: "polygon", label: "Polygon" },
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
  const area = Math.PI * aoi.radiusM ** 2;

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-accent" />
        <h2 className="text-[13px] font-semibold tracking-tight">Area of Interest</h2>
      </header>

      <div>
        <label className="label-tech" htmlFor="aoi-name">
          Name
        </label>
        <input
          id="aoi-name"
          value={aoi.name}
          onChange={(e) => patchAoi({ name: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-primary"
        />
      </div>

      <div>
        <span className="label-tech">Definition method</span>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-1">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => patchAoi({ shape: s.id })}
              className={cn(
                "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                aoi.shape === s.id
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
          onChange={(e) => patchAoi({ radiusM: Math.min(500, Math.max(10, Number(e.target.value))) })}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
      </div>

      <div>
        <span className="label-tech">Target investigation scale</span>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {INVESTIGATION_SCALES_M.map((s) => (
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

      <dl className="space-y-1.5 rounded-md border border-border bg-background/60 p-3 text-[12px]">
        <Row
          label="Centre"
          value={
            hasCenter
              ? `${formatCoord(aoi.centerLat as number, "lat")}  ${formatCoord(aoi.centerLon as number, "lon")}`
              : "Not defined"
          }
        />
        <Row label="Extent" value={`${aoi.radiusM * 2} m diameter`} />
        <Row label="Area" value={formatArea(area)} />
        <Row label="CRS" value="EPSG:4326 (WGS 84)" />
      </dl>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasCenter || running}
          onClick={onRunAnalysis}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Submitting…" : "Start Analysis"}
        </button>
        <button
          type="button"
          aria-label="Upload GeoJSON AOI"
          title="Upload GeoJSON (requires backend)"
          className="rounded-md border border-border px-2.5 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>

      {!hasCenter && (
        <p className="flex items-start gap-2 text-[11px] text-warning">
          <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Define an AOI centre before requesting an analysis.
        </p>
      )}

      <p className="flex items-start gap-2 rounded-md border border-border bg-background/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        GeoAnomaly Pro identifies statistically unusual geospatial signatures from
        remote-sensing and terrain datasets. It does not directly detect underground
        objects. Target interpretations require independent field verification and
        appropriate geophysical measurements.
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
