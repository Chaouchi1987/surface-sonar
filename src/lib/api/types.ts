/**
 * API contract types for the external GeoAnomaly Pro Python/FastAPI
 * scientific backend. These describe the wire format only — the frontend
 * never synthesises values for any of these structures.
 */

export type AoiShape = "circle" | "rectangle" | "polygon";

export interface AoiGeometry {
  type: "Polygon" | "Point";
  coordinates: number[] | number[][][];
}

export interface Aoi {
  aoi_id?: string;
  name: string;
  shape: AoiShape;
  /** Decimal degrees, full precision preserved (no 4-decimal rounding). */
  center_lat: number;
  center_lon: number;
  /** Metres. Present for circle AOIs. */
  radius_m?: number;
  /** Metres. Present for rectangle AOIs. */
  width_m?: number;
  height_m?: number;
  geometry?: AoiGeometry;
  crs: string;
  /** Target investigation scale in metres. */
  scale_m: number;
}

export type DatasetStatus =
  | "available"
  | "unavailable"
  | "processing"
  | "no_coverage"
  | "auth_required"
  | "unknown";

export interface DatasetInfo {
  id: string;
  name: string;
  family: "optical" | "sar" | "dem" | "thermal" | "hyperspectral";
  provider: string;
  status: DatasetStatus;
  resolution_m?: number;
  note?: string;
}

/**
 * Full pipeline as orchestrated by the backend:
 * acquisition → preprocessing → features → geology → temporal → thermal →
 * structural → evidence → intelligence → ranking → final targets.
 */
export type PipelineStageId =
  | "data_acquisition"
  | "preprocessing"
  | "feature_extraction"
  | "geology"
  | "temporal"
  | "thermal"
  | "structural"
  | "evidence"
  | "intelligence"
  | "target_ranking"
  | "final_targets"
  // legacy ids still accepted from older backend builds
  | "anomaly_detection"
  | "spatial_clustering";

export type StageStatus = "pending" | "running" | "complete" | "failed" | "skipped";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  status: StageStatus;
  message?: string;
  /** 0–1, reported by the backend only. Never interpolated client-side. */
  progress?: number;
  started_at?: string;
  completed_at?: string;
}

export type AnalysisStatus =
  | "idle"
  | "queued"
  | "running"
  | "complete"
  | "failed"
  | "no_targets";

export interface DataQuality {
  coverage_pct?: number;
  cloud_pct?: number;
  missing_pixels_pct?: number;
  spatial_resolution_m?: number;
  temporal_coverage?: string;
  flags?: string[];
}

export interface AnalysisRun {
  analysis_id: string;
  aoi: Aoi;
  status: AnalysisStatus;
  stages: PipelineStage[];
  datasets: DatasetInfo[];
  data_quality?: DataQuality;
  started_at?: string;
  completed_at?: string;
  processing_time_s?: number;
  error?: string;
}

export type EvidenceChannel =
  | "anomaly"
  | "geological"
  | "thermal"
  | "temporal"
  | "structural"
  | "statistical"
  | "intelligence";

export type Interpretation =
  | "natural_geological"
  | "anthropogenic"
  | "mixed_uncertain"
  | "insufficient_evidence";

/** Single evidence record produced by one of the scientific pipelines. */
export interface EvidenceItem {
  channel: EvidenceChannel | string;
  /** Human readable statement produced by the backend. */
  description: string;
  /** 0–1 as scored by the backend. Optional — absence means "not scored". */
  score?: number;
  /** Which dataset / feature backs this statement. */
  source?: string;
  /** Backend-declared strength; never derived in the browser. */
  strength?: "weak" | "moderate" | "strong";
}

/** Normalised score bundle. Missing keys mean the pipeline did not run. */
export interface TargetScores {
  anomaly?: number;
  statistical?: number;
  geological?: number;
  thermal?: number;
  temporal?: number;
  structural?: number;
  intelligence?: number;
}

export interface Target {
  target_id: string;
  rank: number;
  latitude: number;
  longitude: number;
  bounding_box: [number, number, number, number];
  size_m?: number;
  anomaly_score?: number;
  statistical_score?: number;
  geological_score?: number;
  thermal_score?: number;
  temporal_score?: number;
  structural_score?: number;
  /** Composite score produced by the AI / intelligence pipeline. */
  intelligence_score?: number;
  /** Optional structured bundle; falls back to the flat *_score fields. */
  scores?: TargetScores;
  model_agreement?: number;
  /** 0–1 confidence reported by the backend, if it computes one. */
  confidence?: number;
  /** Backend classification label, e.g. "structural_lineament". */
  category?: string;
  /** Explicit distinction between a measured anomaly and an interpretation. */
  evidence_class?: "anomaly" | "hypothesis";
  evidence?: EvidenceItem[];
  data_quality?: DataQuality;
  interpretation: Interpretation;
  supporting_features: string[];
  data_sources: string[];
  analysis_timestamp: string;
  methodology: string[];
  limitations: string[];
}

export interface LayerDescriptor {
  id: string;
  name: string;
  group: "basemap" | "spectral" | "terrain" | "radar" | "thermal" | "analysis" | "vector";
  /** Tile template served by the backend. Absent = layer has no data yet. */
  tile_url?: string;
  legend?: { label: string; ramp: string[] };
  metadata?: Record<string, string | number>;
}

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  earth_engine: boolean;
  earth_engine_project?: string;
  version?: string;
}

/** GET /health */
export interface BackendHealth {
  status: "ok" | "degraded" | "error";
  version?: string;
  /** Some builds report EE inline on /health. Both shapes are tolerated. */
  earth_engine?: boolean;
  earth_engine_project?: string;
}

/** GET /health/earth-engine */
export interface EarthEngineHealth {
  status: "ready" | "error" | "unknown";
  project?: string;
  message?: string;
}

/** POST /aoi */
export interface AoiRequest {
  latitude: number;
  longitude: number;
  radius_m: number;
  name?: string;
  scale_m?: number;
  shape?: AoiShape;
  geometry?: AoiGeometry;
}

export interface AoiResponse {
  aoi_id: string;
  center: { lat: number; lon: number };
  radius_m: number;
  area_m2: number;
}

/** POST /analysis/start */
export interface AnalysisStartRequest {
  aoi_id: string;
  scale_m: number;
  datasets: string[];
  /** Optional orchestrator hints — the backend decides what actually runs. */
  pipelines?: PipelineName[];
  scales_m?: number[];
}

export interface AnalysisStartResponse {
  analysis_id: string;
}

export type PipelineName =
  | "geology"
  | "temporal"
  | "thermal"
  | "structural"
  | "intelligence";

export type BackendStage =
  | "queued"
  | "acquiring_data"
  | "preprocessing"
  | "feature_extraction"
  | "anomaly_detection"
  | "spatial_clustering"
  | "geological_analysis"
  | "temporal_analysis"
  | "thermal_analysis"
  | "structural_analysis"
  | "evidence_fusion"
  | "intelligence_analysis"
  | "target_ranking"
  | "completed"
  | "failed";

/** GET /analysis/{id}/status */
export interface AnalysisStatusResponse {
  analysis_id: string;
  status: BackendStage;
  message?: string;
  stages?: PipelineStage[];
  started_at?: string;
  completed_at?: string;
  processing_time_s?: number;
  error?: string;
}

/** GET /analysis/{id} — full orchestrator result, when the backend exposes it. */
export interface AnalysisResult {
  analysis_id: string;
  status: BackendStage;
  aoi?: AoiResponse;
  stages?: PipelineStage[];
  datasets?: DatasetInfo[];
  layers?: LayerDescriptor[];
  targets?: Target[];
  data_quality?: DataQuality;
  methodology?: string[];
  limitations?: string[];
  started_at?: string;
  completed_at?: string;
  processing_time_s?: number;
}

/** Result envelope shared by the geology / temporal / intelligence pipelines. */
export interface PipelineResult {
  analysis_id: string;
  pipeline: PipelineName;
  status: "complete" | "failed" | "skipped" | "running";
  message?: string;
  layers?: LayerDescriptor[];
  evidence?: EvidenceItem[];
  metrics?: Record<string, number | string>;
  limitations?: string[];
}

/** GET /analysis/{id}/datasets */
export interface DatasetManifestResponse {
  datasets: (Omit<DatasetInfo, "id" | "family" | "provider"> &
    Partial<Pick<DatasetInfo, "id" | "family" | "provider">>)[];
}

/** GET /analysis/{id}/layers */
export interface LayersResponse {
  layers: LayerDescriptor[];
}

/** GET /analysis/{id}/targets */
export interface TargetsResponse {
  targets: Target[];
}

/** POST /analysis/test/sentinel2 */
export interface Sentinel2TestResponse {
  dataset: string;
  feature: string;
  statistics: { mean: number; min: number; max: number };
  image_count?: number;
  date_range?: string;
  cloud_filter_pct?: number;
}

/** Generic four-state resource envelope used across the UI. */
export type RemoteState<T> =
  | { state: "unavailable"; reason: string }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; message: string; status?: number };
