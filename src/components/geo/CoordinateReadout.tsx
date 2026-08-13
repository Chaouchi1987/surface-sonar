import { LocateFixed } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";
import { formatCoord } from "@/lib/geo";

export function CoordinateReadout() {
  const aoi = useAnalysisStore((s) => s.aoi);
  const hasCenter = aoi.centerLat !== null && aoi.centerLon !== null;

  return (
    <div className="panel-glass absolute bottom-3 left-3 z-[500] flex items-center gap-2 rounded-lg px-3 py-1.5">
      <LocateFixed className="h-3.5 w-3.5 text-accent" />
      <span className="mono-coord text-[11px] text-secondary-foreground">
        {hasCenter
          ? `${formatCoord(aoi.centerLat as number, "lat")}  ${formatCoord(aoi.centerLon as number, "lon")}`
          : "AOI centre not defined"}
      </span>
      <span className="mono-coord text-[10px] text-muted-foreground">EPSG:4326</span>
    </div>
  );
}
