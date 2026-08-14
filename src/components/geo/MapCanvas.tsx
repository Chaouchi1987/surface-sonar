import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Rectangle, ScaleControl, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useAnalysisStore } from "@/state/analysis-store";
import { boxAround } from "@/lib/geo";

const BASEMAPS: Record<string, { url: string; attribution: string }> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
  },
  terrain: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
  },
};

function ClickHandler() {
  const patchAoi = useAnalysisStore((s) => s.patchAoi);
  useMapEvents({
    click(e) {
      patchAoi({ centerLat: e.latlng.lat, centerLon: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lon !== null) map.panTo([lat, lon], { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function MapCanvas() {
  const { aoi, layers, targets, selectTarget } = useAnalysisStore();
  const base = layers.find((l) => l.group === "basemap" && l.visible)?.id ?? "satellite";
  const basemap = BASEMAPS[base] ?? BASEMAPS["satellite"]!;
  const targetsVisible = layers.find((l) => l.id === "targets")?.visible ?? false;
  const boxesVisible = layers.find((l) => l.id === "target_boxes")?.visible ?? false;

  return (
    <MapContainer
      center={[aoi.centerLat ?? 30, aoi.centerLon ?? 5]}
      zoom={aoi.centerLat === null ? 3 : 15}
      className="h-full w-full"
      zoomControl
      preferCanvas
    >
      <TileLayer url={basemap.url} attribution={basemap.attribution} maxZoom={19} />
      <ScaleControl position="bottomleft" imperial={false} />
      <ClickHandler />
      <Recenter lat={aoi.centerLat} lon={aoi.centerLon} />

      {aoi.centerLat !== null && aoi.centerLon !== null && (
        <Circle
          center={[aoi.centerLat, aoi.centerLon]}
          radius={aoi.radiusM}
          pathOptions={{
            color: "#22D3EE",
            weight: 1.5,
            fillColor: "#22D3EE",
            fillOpacity: 0.06,
          }}
        />
      )}

      {targetsVisible &&
        targets.map((t) => (
          <Circle
            key={t.target_id}
            center={[t.latitude, t.longitude]}
            radius={Math.max(6, (t.size_m ?? 10) / 2)}
            eventHandlers={{ click: () => selectTarget(t.target_id) }}
            pathOptions={{
              color: t.rank === 1 ? "#F59E0B" : "#19B5FE",
              weight: t.rank === 1 ? 2.5 : 1.8,
              fillOpacity: 0.15,
            }}
          />
        ))}

      {boxesVisible &&
        targets.map((t) => (
          <Rectangle
            key={`${t.target_id}-box`}
            bounds={boxAround(t.latitude, t.longitude, 10)}
            pathOptions={{ color: "#22D3EE", weight: 1, fill: false, dashArray: "3 3" }}
          />
        ))}
    </MapContainer>
  );
}
