import { create } from "zustand";
import type { ApiLogEntry } from "@/lib/api/client";
import type {
  AnalysisMetadata,
  AnalysisStatusResponse,
  AoiGeometryType,
  AoiResponse,
  BackendHealth,
  BackendStage,
  DatasetInfo,
  EarthEngineHealth,
  FeatureQuality,
  LayerDescriptor,
  PipelineStage,
  StageStatus,
  Target,
} from "@/lib/api/types";

export interface AoiDraft {
  name: string;
  geometryType: AoiGeometryType;
  centerLat: number | null;
  centerLon: number | null;
  /** Backend constraint: 0 < radius_m <= 500. */
  radiusM: number;
  /** Backend constraint: one of 10/20/30/40/50. */
  scaleM: number;
  startDate: string;
  endDate: string;
  cloudPct: number;
}

export interface MapLayerState {
  id: string;
  name: string;
  group: "basemap" | "result";
  kind: "basemap" | "raster" | "vector";
  visible: boolean;
  opacity: number;
  /** Result layers only exist once the backend reports real content. */
  available: boolean;
  /** Vector layers: feature count reported by the backend. */
  count?: number;
  /** Raster layers: the Earth Engine tile template returned by the backend. */
  tileUrl?: string;
  min?: number;
  max?: number;
  resolutionM?: number;
  statistics?: Record<string, number | string | null>;
}


/**
 * The pipeline the backend worker actually executes
 * (backend/api/analysis.py::_run), in the order it writes the stage field.
 * Nothing here is invented and no stage is animated client-side.
 */
export const PIPELINE_STAGES: { id: BackendStage; label: string }[] = [
  { id: "acquisition", label: "Data Acquisition" },
  { id: "spectral_dem", label: "Spectral + DEM" },
  { id: "spatial_sampling", label: "Spatial Sampling" },
  { id: "anomaly_ensemble", label: "Anomaly Ensemble" },
  { id: "legacy_scientific_audit", label: "Scientific Audit" },
  { id: "geology", label: "Geology" },
  { id: "multiscale", label: "Multi-scale" },
  { id: "temporal", label: "Temporal" },
  { id: "thermal", label: "Thermal" },
  { id: "artifact_suppression", label: "Artifact Suppression" },
  { id: "ranking", label: "Target Ranking" },
];

export const DEFAULT_STAGES: PipelineStage[] = PIPELINE_STAGES.map((s) => ({
  ...s,
  status: "pending" as StageStatus,
}));

/**
 * Artefacts the backend actually returned for a run. A stage is only marked
 * complete when one of these explicitly supports it — a run-level "completed"
 * status alone is NOT evidence that every stage executed.
 */
export interface StageEvidence {
  /** Free-form dataset statuses from /analysis/{id}/datasets. */
  datasets: DatasetInfo[];
  /** Feature keys present in quality.by_feature and the returned sample rows. */
  featureKeys: string[];
  /** metadata.optional_modules — backend module -> status string. */
  optionalModules: Record<string, string>;
  /** /analysis/{id}/targets responded and returned at least one target. */
  hasTargets: boolean;
}

const EMPTY_EVIDENCE: StageEvidence = {
  datasets: [],
  featureKeys: [],
  optionalModules: {},
  hasTargets: false,
};

/** Keywords that tie a backend stage to real returned feature/module names. */
const STAGE_KEYWORDS: Record<BackendStage, string[]> = {
  queued: [],
  acquisition: [],
  spectral_dem: ["ndvi", "ndwi", "ndmi", "band", "reflect", "elevation", "slope", "aspect", "curvature", "dem", "terrain"],
  anomaly_ensemble: ["zscore", "z_score", "isolation", "iforest", "lof", "pca", "ensemble", "anomaly", "outlier"],
  legacy_scientific_audit: ["audit", "scientific_audit", "consensus"],
  geology: ["geolog", "iron", "clay", "ferric", "ferrous", "hydroxyl", "alteration", "mineral", "oxide"],
  multiscale: ["multiscale", "multi_scale", "scale_"],
  temporal: ["temporal", "trend", "stability", "persistence", "change", "season"],
  thermal: ["thermal", "lst", "temperature", "tir", "emissiv"],
  artifact_suppression: ["artifact", "artefact", "suppress", "mask"],
  ranking: [],
  completed: [],
  failed: [],
};

/** Explicit "not executed" markers used in backend status strings. */
function isNegativeStatus(value: string): boolean {
  const v = value.toLowerCase();
  return (
    v.includes("not_run") ||
    v.includes("not run") ||
    v.includes("unavailable") ||
    v.includes("skipped") ||
    v.includes("disabled")
  );
}

/**
 * Returns "complete" only with explicit backend evidence for that stage,
 * otherwise "skipped" (rendered as not reported by the backend).
 */
export function stageOutcome(stage: BackendStage, ev: StageEvidence): StageStatus {
  const keywords = STAGE_KEYWORDS[stage] ?? [];

  // 1. An explicitly reported optional-module status wins.
  for (const [name, value] of Object.entries(ev.optionalModules)) {
    const n = name.toLowerCase();
    if (n === stage || keywords.some((k) => n.includes(k))) {
      return isNegativeStatus(String(value)) ? "skipped" : "complete";
    }
  }

  // 2. Stage-specific artefacts.
  if (stage === "acquisition") {
    return ev.datasets.some((d) => !isNegativeStatus(d.status)) ? "complete" : "skipped";
  }
  if (stage === "ranking") return ev.hasTargets ? "complete" : "skipped";

  // 3. Feature keys the backend actually produced.
  if (keywords.length > 0) {
    const hit = ev.featureKeys.some((key) => {
      const k = key.toLowerCase();
      return keywords.some((w) => k.includes(w));
    });
    if (hit) return "complete";
  }

  // 4. A reported dataset entry naming this stage as a producing module.
  const named = ev.datasets.some(
    (d) =>
      (d.modules ?? []).some((m) => m.toLowerCase().includes(stage)) && !isNegativeStatus(d.status),
  );
  if (named) return "complete";

  return "skipped";
}

const NOT_REPORTED = "No backend artefact reported for this stage in this run.";

/** Derives the pipeline bar strictly from what the backend reported. */
export function stagesFromBackend(
  status: AnalysisStatusResponse,
  evidence: StageEvidence = EMPTY_EVIDENCE,
): PipelineStage[] {
  if (status.status === "queued") return DEFAULT_STAGES;

  const index = PIPELINE_STAGES.findIndex((s) => s.id === status.stage);

  if (status.status === "completed") {
    return DEFAULT_STAGES.map((s) => {
      const outcome = stageOutcome(s.id, evidence);
      return {
        ...s,
        status: outcome,
        ...(outcome === "skipped" ? { message: NOT_REPORTED } : {}),
      };
    });
  }

  if (status.status === "failed") {
    const failedAt = Math.max(index, 0);
    return DEFAULT_STAGES.map((s, i) => ({
      ...s,
      status: (i < failedAt
        ? stageOutcome(s.id, evidence)
        : i === failedAt
          ? "failed"
          : "pending") as StageStatus,
      ...(i === failedAt && (status.error ?? status.message)
        ? { message: status.error ?? status.message ?? "" }
        : {}),
    }));
  }

  return DEFAULT_STAGES.map((s, i) => ({
    ...s,
    status: (index < 0
      ? "pending"
      : i < index
        ? stageOutcome(s.id, evidence)
        : i === index
          ? "running"
          : "pending") as StageStatus,
    ...(i === index && status.message ? { message: status.message } : {}),
  }));
}

const BASEMAP_LAYERS: MapLayerState[] = [
  {
    id: "satellite",
    name: "Satellite imagery",
    group: "basemap",
    kind: "basemap",
    visible: true,
    opacity: 1,
    available: true,
  },
  {
    id: "terrain",
    name: "Dark terrain",
    group: "basemap",
    kind: "basemap",
    visible: false,
    opacity: 1,
    available: true,
  },
];


const initialLayers = (): MapLayerState[] => BASEMAP_LAYERS.map((l) => ({ ...l }));

/** Backend rank is authoritative; ties fall back to the fused evidence score. */
export function sortTargets(targets: Target[]): Target[] {
  return [...targets].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0);
  });
}

interface AnalysisState {
  health: BackendHealth | null;
  healthError: string | null;
  healthChecking: boolean;
  lastHealthCheck: string | null;

  earthEngine: EarthEngineHealth | null;
  earthEngineError: string | null;

  backendUsername: string | null;

  aoi: AoiDraft;
  serverAoi: AoiResponse | null;

  analysisId: string | null;
  analysisStatus: "idle" | AnalysisStatusResponse["status"];
  analysisStage: BackendStage | "idle";
  analysisMessage: string | null;
  progress: number | null;
  startedAt: string | null;
  completedAt: string | null;
  stages: PipelineStage[];
  /** Last raw status record, so stages can be re-derived as artefacts arrive. */
  lastStatus: AnalysisStatusResponse | null;

  datasets: DatasetInfo[];
  layers: MapLayerState[];
  targets: Target[];
  targetsReported: boolean;
  selectedTargetId: string | null;
  metadata: AnalysisMetadata | null;
  quality: FeatureQuality | null;
  /** Raw sample rows returned by GET /analysis/{id}/samples. */
  samples: Record<string, unknown>[];
  /** Artefacts the backend did NOT return for a completed run. */
  resultIssues: string[];

  errors: string[];
  apiLog: ApiLogEntry[];

  setHealth: (h: BackendHealth | null, error: string | null) => void;
  setHealthChecking: (v: boolean) => void;
  setEarthEngine: (h: EarthEngineHealth | null, error: string | null) => void;
  setBackendUsername: (name: string | null) => void;
  patchAoi: (patch: Partial<AoiDraft>) => void;
  setServerAoi: (aoi: AoiResponse | null) => void;
  setAnalysisError: (message: string) => void;
  clearErrors: () => void;
  setAnalysisId: (id: string) => void;
  applyStatus: (status: AnalysisStatusResponse) => void;
  setDatasets: (datasets: DatasetInfo[]) => void;
  applyBackendLayers: (layers: LayerDescriptor[]) => void;
  setTargets: (targets: Target[]) => void;
  setSamples: (
    metadata: AnalysisMetadata,
    quality: FeatureQuality,
    samples?: Record<string, unknown>[],
  ) => void;
  setResultIssues: (issues: string[]) => void;
  selectTarget: (id: string | null) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  pushLog: (entry: ApiLogEntry) => void;
  clearLog: () => void;
  resetAnalysis: () => void;
}

/** Collects the artefacts the backend actually returned for the current run. */
function evidenceFrom(s: AnalysisState): StageEvidence {
  const keys = new Set<string>(Object.keys(s.quality?.by_feature ?? {}));
  for (const row of s.samples) for (const k of Object.keys(row)) keys.add(k);
  const modules = s.metadata?.optional_modules;
  return {
    datasets: s.datasets,
    featureKeys: Array.from(keys),
    optionalModules: modules && typeof modules === "object" ? modules : {},
    hasTargets: s.targets.length > 0,
  };
}

/** Re-derives the pipeline bar from the last backend status plus artefacts. */
function restage(s: AnalysisState, patch: Partial<AnalysisState>): PipelineStage[] {
  const next = { ...s, ...patch } as AnalysisState;
  if (!next.lastStatus) return next.stages;
  return stagesFromBackend(next.lastStatus, evidenceFrom(next));
}

function defaultWindow(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  health: null,
  healthError: null,
  healthChecking: false,
  lastHealthCheck: null,

  earthEngine: null,
  earthEngineError: null,

  backendUsername: null,

  aoi: {
    name: "Untitled AOI",
    geometryType: "circle",
    centerLat: null,
    centerLon: null,
    radiusM: 250,
    scaleM: 10,
    cloudPct: 20,
    ...defaultWindow(),
  },
  serverAoi: null,

  analysisId: null,
  analysisStatus: "idle",
  analysisStage: "idle",
  analysisMessage: null,
  progress: null,
  startedAt: null,
  completedAt: null,
  stages: DEFAULT_STAGES,
  lastStatus: null,

  datasets: [],
  layers: initialLayers(),
  targets: [],
  targetsReported: false,
  selectedTargetId: null,
  metadata: null,
  quality: null,
  samples: [],
  resultIssues: [],


  errors: [],
  apiLog: [],

  setHealth: (health, healthError) =>
    set({
      health,
      healthError,
      healthChecking: false,
      lastHealthCheck: new Date().toISOString(),
    }),
  setHealthChecking: (healthChecking) => set({ healthChecking }),
  setEarthEngine: (earthEngine, earthEngineError) => set({ earthEngine, earthEngineError }),
  setBackendUsername: (backendUsername) => set({ backendUsername }),
  patchAoi: (patch) => set((s) => ({ aoi: { ...s.aoi, ...patch }, serverAoi: null })),
  setServerAoi: (serverAoi) => set({ serverAoi }),
  setAnalysisError: (message) =>
    set((s) => ({ errors: [message, ...s.errors].slice(0, 5), analysisStatus: "failed" })),
  clearErrors: () => set({ errors: [] }),
  setAnalysisId: (analysisId) =>
    set({ analysisId, analysisStatus: "queued", analysisStage: "queued" }),
  applyStatus: (status) =>
    set((s) => ({
      analysisId: status.analysis_id,
      analysisStatus: status.status,
      analysisStage: status.stage,
      analysisMessage: status.message ?? status.error ?? null,
      progress: status.progress ?? null,
      startedAt: status.started_at ?? null,
      completedAt: status.completed_at ?? null,
      lastStatus: status,
      stages: stagesFromBackend(status, evidenceFrom(s)),
    })),
  setDatasets: (datasets) => set((s) => ({ datasets, stages: restage(s, { datasets }) })),
  applyBackendLayers: (backendLayers) =>
    set((s) => {
      const basemaps = s.layers.filter((l) => l.group === "basemap");
      const results: MapLayerState[] = backendLayers.map((b) => {
        const existing = s.layers.find((l) => l.id === b.id);
        const tileUrl = typeof b.tile_url === "string" && b.tile_url ? b.tile_url : undefined;
        const isRaster = tileUrl !== undefined;
        // Raster layers are usable when the backend supplied a real tile URL;
        // vector layers when the backend reported at least one feature.
        const available = isRaster ? true : (b.count ?? 0) > 0;
        return {
          id: b.id,
          name: b.name || b.id,
          group: "result" as const,
          kind: (isRaster ? "raster" : "vector") as MapLayerState["kind"],
          visible: existing?.visible ?? available,
          opacity: existing?.opacity ?? (typeof b.opacity === "number" ? b.opacity : 1),
          available,
          ...(b.count !== undefined ? { count: b.count } : {}),
          ...(tileUrl ? { tileUrl } : {}),
          ...(typeof b.min === "number" ? { min: b.min } : {}),
          ...(typeof b.max === "number" ? { max: b.max } : {}),
          ...(typeof b.resolution_m === "number" ? { resolutionM: b.resolution_m } : {}),
          ...(b.statistics ? { statistics: b.statistics } : {}),
        };
      });
      return { layers: [...basemaps, ...results] };
    }),

  setTargets: (targets) =>
    set((s) => {
      const sorted = sortTargets(targets);
      return {
        targets: sorted,
        targetsReported: true,
        selectedTargetId: sorted[0]?.target_id ?? null,
        stages: restage(s, { targets: sorted }),
      };
    }),
  setSamples: (metadata, quality, samples) =>
    set((s) => {
      const patch = { metadata, quality, ...(samples ? { samples } : {}) };
      return { ...patch, stages: restage(s, patch) };
    }),
  setResultIssues: (resultIssues) => set({ resultIssues }),

  selectTarget: (selectedTargetId) => set({ selectedTargetId }),
  toggleLayer: (id) =>
    set((s) => {
      const layer = s.layers.find((l) => l.id === id);
      if (!layer || !layer.available) return s;
      if (layer.group === "basemap") {
        return {
          layers: s.layers.map((l) =>
            l.group === "basemap" ? { ...l, visible: l.id === id } : l,
          ),
        };
      }
      return { layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) };
    }),
  setLayerOpacity: (id, opacity) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, opacity } : l)) })),
  pushLog: (entry) => set((s) => ({ apiLog: [entry, ...s.apiLog].slice(0, 50) })),
  clearLog: () => set({ apiLog: [] }),
  resetAnalysis: () =>
    set({
      analysisId: null,
      analysisStatus: "idle",
      analysisStage: "idle",
      analysisMessage: null,
      progress: null,
      startedAt: null,
      completedAt: null,
      stages: DEFAULT_STAGES,
      lastStatus: null,
      datasets: [],
      targets: [],
      targetsReported: false,
      selectedTargetId: null,
      metadata: null,
      quality: null,
      samples: [],
      resultIssues: [],
      errors: [],

      layers: initialLayers(),
    }),
}));
