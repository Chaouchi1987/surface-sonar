import { create } from "zustand";
import type { ApiLogEntry } from "@/lib/api/client";
import type {
  AoiResponse,
  AnalysisStatusResponse,
  BackendHealth,
  BackendStage,
  DatasetInfo,
  EarthEngineHealth,
  LayerDescriptor,
  PipelineStage,
  PipelineStageId,
  Sentinel2TestResponse,
  Target,
} from "@/lib/api/types";

export interface AoiDraft {
  name: string;
  shape: "circle" | "rectangle" | "polygon";
  centerLat: number | null;
  centerLon: number | null;
  radiusM: number;
  scaleM: number;
}

export interface MapLayerState {
  id: string;
  name: string;
  group: LayerDescriptor["group"];
  visible: boolean;
  opacity: number;
  /** Data-backed layers only become renderable once the backend supplies them. */
  available: boolean;
  tileUrl?: string;
}

export const DEFAULT_STAGES: PipelineStage[] = [
  { id: "data_acquisition", label: "Data Acquisition", status: "pending" },
  { id: "preprocessing", label: "Preprocessing", status: "pending" },
  { id: "feature_extraction", label: "Feature Extraction", status: "pending" },
  { id: "anomaly_detection", label: "Anomaly Detection", status: "pending" },
  { id: "spatial_clustering", label: "Spatial Clustering", status: "pending" },
  { id: "target_ranking", label: "Target Ranking", status: "pending" },
  { id: "final_targets", label: "Final Targets", status: "pending" },
];

/** Backend stage → pipeline stage id. Nothing is animated locally. */
const STAGE_OF: Partial<Record<BackendStage, PipelineStageId>> = {
  acquiring_data: "data_acquisition",
  preprocessing: "preprocessing",
  feature_extraction: "feature_extraction",
  geological_analysis: "feature_extraction",
  temporal_analysis: "feature_extraction",
  thermal_analysis: "feature_extraction",
  anomaly_detection: "anomaly_detection",
  spatial_clustering: "spatial_clustering",
  target_ranking: "target_ranking",
  final_targets: "final_targets" as PipelineStageId,
};

/** Derives the pipeline bar strictly from the state the backend reported. */
export function stagesFromBackend(status: AnalysisStatusResponse): PipelineStage[] {
  if (status.stages?.length) return status.stages;

  if (status.status === "queued") return DEFAULT_STAGES;
  if (status.status === "completed")
    return DEFAULT_STAGES.map((s) => ({ ...s, status: "complete" as const }));

  const currentId = STAGE_OF[status.status];
  const currentIndex = DEFAULT_STAGES.findIndex((s) => s.id === currentId);

  if (status.status === "failed") {
    return DEFAULT_STAGES.map((s, i) => ({
      ...s,
      status: i === Math.max(currentIndex, 0) ? ("failed" as const) : ("pending" as const),
      message: i === Math.max(currentIndex, 0) ? status.message : undefined,
    }));
  }

  return DEFAULT_STAGES.map((s, i) => ({
    ...s,
    status:
      currentIndex < 0
        ? ("pending" as const)
        : i < currentIndex
          ? ("complete" as const)
          : i === currentIndex
            ? ("running" as const)
            : ("pending" as const),
  }));
}

/** Catalog is a menu of possible layers — availability comes from the backend only. */
export const CATALOG_LAYERS: Omit<MapLayerState, "visible" | "opacity">[] = [
  { id: "satellite", name: "Satellite", group: "basemap", available: true },
  { id: "terrain", name: "Terrain", group: "basemap", available: true },
  { id: "sentinel2", name: "Sentinel-2", group: "spectral", available: false },
  { id: "sentinel1", name: "Sentinel-1 (SAR)", group: "radar", available: false },
  { id: "dem", name: "DEM", group: "terrain", available: false },
  { id: "ndvi", name: "NDVI", group: "spectral", available: false },
  { id: "ndmi", name: "NDMI", group: "spectral", available: false },
  { id: "ndbi", name: "NDBI", group: "spectral", available: false },
  { id: "iron_oxide", name: "Iron Oxide", group: "spectral", available: false },
  { id: "clay", name: "Clay Minerals", group: "spectral", available: false },
  { id: "hydrothermal", name: "Hydrothermal Alteration", group: "spectral", available: false },
  { id: "thermal", name: "Thermal", group: "thermal", available: false },
  { id: "lineaments", name: "Lineaments", group: "analysis", available: false },
  { id: "anomaly", name: "Anomaly", group: "analysis", available: false },
  { id: "targets", name: "Targets", group: "vector", available: false },
  { id: "target_boxes", name: "Target Boxes (10 m)", group: "vector", available: false },
];

const initialLayers: MapLayerState[] = CATALOG_LAYERS.map((l) => ({
  ...l,
  // Only the basemap is genuinely available before any backend result exists.
  visible: l.id === "satellite",
  opacity: 1,
}));

interface AnalysisState {
  health: BackendHealth | null;
  healthError: string | null;
  healthChecking: boolean;
  lastHealthCheck: string | null;

  earthEngine: EarthEngineHealth | null;
  earthEngineError: string | null;

  aoi: AoiDraft;
  serverAoi: AoiResponse | null;

  analysisId: string | null;
  analysisStatus: BackendStage | "idle";
  analysisMessage: string | null;
  processingTimeS: number | null;
  stages: PipelineStage[];
  datasets: DatasetInfo[];
  layers: MapLayerState[];
  targets: Target[];
  targetsReported: boolean;
  selectedTargetId: string | null;
  ndviTest: Sentinel2TestResponse | null;
  errors: string[];
  apiLog: ApiLogEntry[];

  setHealth: (h: BackendHealth | null, error: string | null) => void;
  setHealthChecking: (v: boolean) => void;
  setEarthEngine: (h: EarthEngineHealth | null, error: string | null) => void;
  patchAoi: (patch: Partial<AoiDraft>) => void;
  setServerAoi: (aoi: AoiResponse | null) => void;
  setAnalysisError: (message: string) => void;
  clearErrors: () => void;
  setAnalysisId: (id: string) => void;
  applyStatus: (status: AnalysisStatusResponse) => void;
  setDatasets: (datasets: DatasetInfo[]) => void;
  applyBackendLayers: (layers: LayerDescriptor[]) => void;
  setTargets: (targets: Target[]) => void;
  setNdviTest: (result: Sentinel2TestResponse | null) => void;
  selectTarget: (id: string | null) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  pushLog: (entry: ApiLogEntry) => void;
  clearLog: () => void;
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  health: null,
  healthError: null,
  healthChecking: false,
  lastHealthCheck: null,

  earthEngine: null,
  earthEngineError: null,

  aoi: {
    name: "Untitled AOI",
    shape: "circle",
    centerLat: null,
    centerLon: null,
    radiusM: 250,
    scaleM: 10,
  },
  serverAoi: null,

  analysisId: null,
  analysisStatus: "idle",
  analysisMessage: null,
  processingTimeS: null,
  stages: DEFAULT_STAGES,
  datasets: [],
  layers: initialLayers,
  targets: [],
  targetsReported: false,
  selectedTargetId: null,
  ndviTest: null,
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
  patchAoi: (patch) => set((s) => ({ aoi: { ...s.aoi, ...patch }, serverAoi: null })),
  setServerAoi: (serverAoi) => set({ serverAoi }),
  setAnalysisError: (message) =>
    set((s) => ({ errors: [message, ...s.errors].slice(0, 5), analysisStatus: "failed" })),
  clearErrors: () => set({ errors: [] }),
  setAnalysisId: (analysisId) => set({ analysisId, analysisStatus: "queued" }),
  applyStatus: (status) =>
    set({
      analysisId: status.analysis_id,
      analysisStatus: status.status,
      analysisMessage: status.message ?? null,
      processingTimeS: status.processing_time_s ?? null,
      stages: stagesFromBackend(status),
    }),
  setDatasets: (datasets) => set({ datasets }),
  applyBackendLayers: (backendLayers) =>
    set((s) => ({
      layers: s.layers.map((l) => {
        const match = backendLayers.find((b) => b.id === l.id);
        if (!match) return l.group === "basemap" ? l : { ...l, available: false, visible: false };
        return { ...l, available: true, name: match.name || l.name, tileUrl: match.tile_url };
      }),
    })),
  setTargets: (targets) =>
    set((s) => ({
      targets,
      targetsReported: true,
      selectedTargetId: targets[0]?.target_id ?? null,
      layers: s.layers.map((l) =>
        l.group === "vector"
          ? { ...l, available: targets.length > 0, visible: targets.length > 0 }
          : l,
      ),
    })),
  setNdviTest: (ndviTest) => set({ ndviTest }),
  selectTarget: (selectedTargetId) => set({ selectedTargetId }),
  toggleLayer: (id) =>
    set((s) => {
      const target = s.layers.find((l) => l.id === id);
      if (!target || !target.available) return s;
      if (target.group === "basemap") {
        return {
          layers: s.layers.map((l) =>
            l.group === "basemap" ? { ...l, visible: l.id === id } : l,
          ),
        };
      }
      return {
        layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
      };
    }),
  setLayerOpacity: (id, opacity) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, opacity } : l)) })),
  pushLog: (entry) => set((s) => ({ apiLog: [entry, ...s.apiLog].slice(0, 50) })),
  clearLog: () => set({ apiLog: [] }),
  resetAnalysis: () =>
    set({
      analysisId: null,
      analysisStatus: "idle",
      analysisMessage: null,
      processingTimeS: null,
      stages: DEFAULT_STAGES,
      datasets: [],
      targets: [],
      targetsReported: false,
      selectedTargetId: null,
      ndviTest: null,
      errors: [],
      layers: initialLayers,
    }),
}));
