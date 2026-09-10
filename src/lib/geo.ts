/** Geodesic helpers. Pure geometry only — no scientific values are invented. */

const EARTH_R = 6378137;

export function metresToDegLat(m: number): number {
  return (m / EARTH_R) * (180 / Math.PI);
}

export function metresToDegLon(m: number, lat: number): number {
  return (m / (EARTH_R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
}

/** Axis-aligned box of `size` metres centred on the coordinate. */
export function boxAround(
  lat: number,
  lon: number,
  sizeM: number,
): [[number, number], [number, number]] {
  const dLat = metresToDegLat(sizeM / 2);
  const dLon = metresToDegLon(sizeM / 2, lat);
  return [
    [lat - dLat, lon - dLon],
    [lat + dLat, lon + dLon],
  ];
}

export function formatCoord(value: number, axis: "lat" | "lon"): string {
  const hemi = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(6)}° ${hemi}`;
}

export function formatArea(m2: number): string {
  if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toFixed(3)} km²`;
  if (m2 >= 10_000) return `${(m2 / 10_000).toFixed(3)} ha`;
  return `${m2.toFixed(0)} m²`;
}

export const INVESTIGATION_SCALES_M = [10, 20, 50, 100, 200, 300, 500] as const;

/**
 * Real processing time only: the backend-reported duration_seconds, or the
 * span between real started_at/completed_at timestamps. Never estimated.
 */
export function processingSeconds(
  durationSeconds: number | undefined,
  startedAt: string | null | undefined,
  completedAt: string | null | undefined,
): number | null {
  if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) {
    return durationSeconds;
  }
  if (startedAt && completedAt) {
    const a = Date.parse(startedAt);
    const b = Date.parse(completedAt);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) return (b - a) / 1000;
  }
  return null;
}
