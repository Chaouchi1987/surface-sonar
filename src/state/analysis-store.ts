import { create } from "zustand";
import type {
  Aoi,
  AnalysisRun,
  AnalysisStatus,
  DatasetInfo,
  HealthResponse,
  LayerDescriptor,
  PipelineStage,
  Target,
} from "@/lib/api/types";

export interface AoiDraft {
  name: string;
  shape: Aoi["shape"];
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
}

interface AnalysisState {
  health: HealthResponse | null;
  healthError: string | null;
  healthChecking: boolean;

  aoi: AoiDraft;
  committedAoi: Aoi | null;

  analysisId: string | null;
  analysisStatus: AnalysisStatus;
  stages: PipelineStage[];
  datasets: DatasetInfo[];
  layers: MapLayerState[];
  targets: Target[];
  selectedTargetId: string | null;
  showTargetBoxes: boolean;
  lastRun: AnalysisRun | null;
  errors: string[];

  setHealth: (h: HealthResponse | null, error: string | null) => void;
  setHealthChecking: (v: boolean) => void;
  patchAoi: (patch: Partial<AoiDraft>) => void;
  setAnalysisError: (message: string) => void;
  clearErrors: () => void;
  applyRun: (run: AnalysisRun) => void;
  setTargets: (targets: Target[]) => void;
  selectTarget: (id: string | null) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setShowTargetBoxes: (v: boolean) => void;
  resetAnalysis: () => void;
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

export const CATALOG_LAYERS: Omit<MapLayerState, "visible" | "opacity">[] = [
  { id: "satellite", name: "Satellite", group: "basemap", available: true },
  { id: "terrain", name: "Terrain", group: "basemap", available: true },
  { id: "ndvi", name: "NDVI", group: "spectral", available: false },
  { id: "ndmi", name: "NDMI", group: "spectral", available: false },
  { id: "iron_oxide", name: "Iron Oxide", group: "spectral", available: false },
  { id: "clay", name: "Clay Minerals", group: "spectral", available: false },
  { id: "hydrothermal", name: "Hydrothermal Alteration", group: "spectral", available: false },
  { id: "sar", name: "SAR (S1 VV/VH)", group: "radar", available: false },
  { id: "thermal", name: "Thermal", group: "thermal", available: false },
  { id: "lineaments", name: "Lineaments", group: "analysis", available: false },
  { id: "anomaly", name: "Anomaly", group: "analysis", available: false },
  { id: "heatmap", name: "Heatmap", group: "analysis", available: false },
  { id: "contours", name: "Contours", group: "analysis", available: false },
  { id: "landcover", name: "Land Cover", group: "analysis", available: false },
  { id: "targets", name: "Targets", group: "vector", available: true },
  { id: "target_boxes", name: "Target Boxes (10 m)", group: "vector", available: true },
];

const initialLayers: MapLayerState[] = CATALOG_LAYERS.map((l) => ({
  ...l,
  visible: l.group === "basemap" ? l.id === "satellite" : l.group === "vector",
  opacity: 1,
}));

export const useAnalysisStore = create<AnalysisState>((set) => ({
  health: null,
  healthError: null,
  healthChecking: false,

  aoi: {
    name: "Untitled AOI",
    shape: "circle",
    centerLat: null,
    centerLon: null,
    radiusM: 250,
    scaleM: 10,
  },
  committedAoi: null,

  analysisId: null,
  analysisStatus: "idle",
  stages: DEFAULT_STAGES,
  datasets: [],
  layers: initialLayers,
  targets: [],
  selectedTargetId: null,
  showTargetBoxes: true,
  lastRun: null,
  errors: [],

  setHealth: (health, healthError) => set({ health, healthError, healthChecking: false }),
  setHealthChecking: (healthChecking) => set({ healthChecking }),
  patchAoi: (patch) => set((s) => ({ aoi: { ...s.aoi, ...patch } })),
  setAnalysisError: (message) =>
    set((s) => ({ errors: [message, ...s.errors].slice(0, 5), analysisStatus: "failed" })),
  clearErrors: () => set({ errors: [] }),
  applyRun: (run) =>
    set({
      analysisId: run.analysis_id,
      analysisStatus: run.status,
      stages: run.stages?.length ? run.stages : DEFAULT_STAGES,
      datasets: run.datasets ?? [],
      committedAoi: run.aoi ?? null,
      lastRun: run,
    }),
  setTargets: (targets) => set({ targets }),
  selectTarget: (selectedTargetId) => set({ selectedTargetId }),
  toggleLayer: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id
          ? { ...l, visible: !l.visible }
          : l.group === "basemap" && !s.layers.find((x) => x.id === id)?.visible
            ? { ...l, visible: false }
            : l,
      ),
    })),
  setLayerOpacity: (id, opacity) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, opacity } : l)) })),
  setShowTargetBoxes: (showTargetBoxes) => set({ showTargetBoxes }),
  resetAnalysis: () =>
    set({
      analysisId: null,
      analysisStatus: "idle",
      stages: DEFAULT_STAGES,
      datasets: [],
      targets: [],
      selectedTargetId: null,
      lastRun: null,
      errors: [],
    }),
}));
