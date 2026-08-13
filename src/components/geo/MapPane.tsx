import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { LayerControl } from "./LayerControl";
import { MapLegend } from "./MapLegend";
import { CoordinateReadout } from "./CoordinateReadout";

const MapCanvas = lazy(() => import("./MapCanvas"));

function MapSkeleton() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden grid-backdrop">
      <div className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-geo-scan" />
      <div className="text-center">
        <Radar className="mx-auto h-6 w-6 animate-spin text-accent" />
        <p className="label-tech mt-2">Initialising cartographic engine</p>
      </div>
    </div>
  );
}

export function MapPane() {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <MapCanvas />
        </Suspense>
      </ClientOnly>
      <LayerControl />
      <MapLegend />
      <CoordinateReadout />
    </div>
  );
}
