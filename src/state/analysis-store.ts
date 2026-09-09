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

/** Derives the pipeline bar strictly from the stage the backend reported. */
export function stagesFromBackend(status: AnalysisStatusResponse): PipelineStage[] {
  if (status.status === "queued") return DEFAULT_STAGES;
  if (status.status === "completed")
    return DEFAULT_STAGES.map((s) => ({ ...s, status: "complete" as StageStatus }));

  const index = PIPELINE_STAGES.findIndex((s) => s.id === status.stage);

  if (status.status === "failed") {
    const failedAt = Math.max(index, 0);
    return DEFAULT_STAGES.map((s, i) => ({
      ...s,
      status: (i < failedAt ? "complete" : i === failedAt ? "failed" : "pending") as StageStatus,
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
        ? "complete"
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

  datasets: [],
  layers: initialLayers(),
  targets: [],
  targetsReported: false,
  selectedTargetId: null,
  metadata: null,
  quality: null,

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
    set({
      analysisId: status.analysis_id,
      analysisStatus: status.status,
      analysisStage: status.stage,
      analysisMessage: status.message ?? status.error ?? null,
      progress: status.progress ?? null,
      startedAt: status.started_at ?? null,
      completedAt: status.completed_at ?? null,
      stages: stagesFromBackend(status),
    }),
  setDatasets: (datasets) => set({ datasets }),
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
    set(() => {
      const sorted = sortTargets(targets);
      return {
        targets: sorted,
        targetsReported: true,
        selectedTargetId: sorted[0]?.target_id ?? null,
      };
    }),
  setSamples: (metadata, quality) => set({ metadata, quality }),
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
      datasets: [],
      targets: [],
      targetsReported: false,
      selectedTargetId: null,
      metadata: null,
      quality: null,
      errors: [],
      layers: initialLayers(),
    }),
}));
