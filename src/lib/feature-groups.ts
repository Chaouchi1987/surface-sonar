/**
 * Groups the feature keys the backend ACTUALLY returned (from
 * GET /analysis/{id}/samples: `quality.by_feature` and the sample rows) into
 * scientific domains for display.
 *
 * Nothing here generates a value. Every number shown to the user is either a
 * completeness figure reported by the backend or a plain aggregate (min / mean
 * / max) over the real sample rows the backend returned. If a domain has no
 * matching feature, the UI reports it as not produced by the backend.
 */

export type FeatureDomain =
  | "anomaly"
  | "temporal"
  | "thermal"
  | "sar"
  | "structural"
  | "terrain"
  | "geology"
  | "spectral"
  | "other";

/** Ordered: the first matching domain wins, so specific groups come first. */
const MATCHERS: { domain: FeatureDomain; keywords: string[] }[] = [
  {
    domain: "anomaly",
    keywords: [
      "zscore", "z_score", "isolation", "iforest", "lof", "local_outlier",
      "pca", "mahalanobis", "ensemble", "anomaly", "consensus", "outlier",
    ],
  },
  {
    domain: "temporal",
    keywords: [
      "temporal", "trend", "stability", "persistence", "variance", "change",
      "season", "series", "disturb",
    ],
  },
  { domain: "thermal", keywords: ["thermal", "lst", "temperature", "tir", "emissiv", "bt_"] },
  { domain: "sar", keywords: ["sar", "_vv", "vv_", "_vh", "vh_", "backscatter", "coheren", "s1_"] },
  {
    domain: "structural",
    keywords: ["lineament", "edge", "gradient", "texture", "entropy", "structur", "ridge", "canny"],
  },
  {
    domain: "terrain",
    keywords: [
      "elevation", "slope", "aspect", "curvature", "relief", "tpi", "tri",
      "roughness", "hillshade", "dem", "terrain",
    ],
  },
  {
    domain: "geology",
    keywords: [
      "iron", "clay", "ferrous", "ferric", "hydroxyl", "alteration", "mineral",
      "carbonate", "silica", "geolog", "oxide", "gossan",
    ],
  },
  {
    domain: "spectral",
    keywords: ["ndvi", "ndmi", "ndwi", "ndbi", "savi", "bsi", "band", "reflect", "albedo", "b1", "b2"],
  },
];

export const DOMAIN_LABELS: Record<FeatureDomain, string> = {
  anomaly: "Anomaly detection",
  temporal: "Temporal",
  thermal: "Thermal",
  sar: "SAR / radar",
  structural: "Structural & lineament",
  terrain: "Terrain / DEM derivatives",
  geology: "Geological / mineral",
  spectral: "Spectral indices",
  other: "Other backend features",
};

export function domainOf(key: string): FeatureDomain {
  const k = key.toLowerCase();
  for (const { domain, keywords } of MATCHERS) {
    if (keywords.some((w) => k.includes(w))) return domain;
  }
  return "other";
}

export interface FeatureStat {
  key: string;
  /** Backend-reported completeness (0–1) for this feature, when available. */
  completeness?: number;
  /** Aggregates over the real sample rows returned by the backend. */
  count?: number;
  min?: number;
  max?: number;
  mean?: number;
}

/** Numeric keys present in the returned sample rows. */
function numericStats(
  samples: Record<string, unknown>[],
  key: string,
): { count: number; min: number; max: number; mean: number } | null {
  let count = 0;
  let sum = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const row of samples) {
    const v = row[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      count += 1;
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (count === 0) return null;
  return { count, min, max, mean: sum / count };
}

const SKIP_KEYS = new Set(["cell_id", "latitude", "longitude", "lat", "lon", "row", "col", "index"]);

/**
 * Builds the per-domain feature table from real backend output only.
 * `byFeature` is `quality.by_feature`; `samples` are the returned sample rows.
 */
export function groupFeatures(
  byFeature: Record<string, number> | undefined,
  samples: Record<string, unknown>[],
): Record<FeatureDomain, FeatureStat[]> {
  const keys = new Set<string>();
  for (const k of Object.keys(byFeature ?? {})) keys.add(k);
  for (const row of samples) for (const k of Object.keys(row)) keys.add(k);

  const grouped = Object.fromEntries(
    (Object.keys(DOMAIN_LABELS) as FeatureDomain[]).map((d) => [d, [] as FeatureStat[]]),
  ) as Record<FeatureDomain, FeatureStat[]>;

  for (const key of Array.from(keys).sort()) {
    if (SKIP_KEYS.has(key.toLowerCase())) continue;
    const stats = numericStats(samples, key);
    const completeness = byFeature?.[key];
    if (stats === null && completeness === undefined) continue;
    const entry: FeatureStat = { key };
    if (completeness !== undefined) entry.completeness = completeness;
    if (stats) Object.assign(entry, stats);
    grouped[domainOf(key)].push(entry);
  }
  return grouped;
}

export function formatNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toFixed(0);
  if (abs >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

/** Turns a raw backend feature key into a readable label without renaming it. */
export function humanise(key: string): string {
  return key.replace(/_/g, " ");
}
