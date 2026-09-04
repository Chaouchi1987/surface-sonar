/**
 * VERIFIED API contract for the GeoAnomaly Pro Python/FastAPI scientific
 * backend.
 *
 * Every type in this file was derived by reading the actual backend source
 * (backend/main.py, backend/api/*.py, backend/models/schemas.py,
 * backend/models/targeting.py, backend/reporting/report.py) rather than from
 * assumption. Nothing here is speculative, and the frontend never synthesises
 * a value for any of these structures.
 *
 * Backend routers (backend/main.py):
 *   GET  /health
 *   GET  /health/earth-engine
 *   POST /auth/signup            POST /auth/login          GET /auth/me
 *   GET  /auth/earth-engine/status
 *   POST /auth/earth-engine/local-connect
 *   GET  /auth/earth-engine/start
 *   POST /aoi
 *   POST /analysis/start
 *   GET  /analysis/{id}/status   /datasets  /layers  /targets  /samples  /debug
 *   GET  /reports/{id}           GET /reports/{id}/pdf
 *
 * All routes except /health, /auth/signup and /auth/login require a
 * `Authorization: Bearer <jwt>` header issued by the backend itself
 * (backend/core/auth.py::create_token).
 */

/* ------------------------------------------------------------------ health */

/** GET /health — backend/api/health.py */
export interface BackendHealth {
  status: "ok" | "degraded" | "error";
  service?: string;
  version?: string;
}

/**
 * GET /health/earth-engine and GET /auth/earth-engine/status —
 * backend/gee/auth.py::earth_engine_status. Earth Engine is authorised
 * per user, so "login_required" is a real, expected state.
 */
export interface EarthEngineHealth {
  status: "ready" | "error" | "login_required" | "not_connected" | "unknown";
  connected?: boolean;
  mode?: "oauth" | "local" | string;
  project?: string;
  user_scoped?: boolean;
  message?: string;
  /** Only present on /auth/earth-engine/status. */
  oauth_configured?: boolean;
  local_dev_available?: boolean;
}

/* -------------------------------------------------------------------- auth */

/** POST /auth/signup and POST /auth/login — backend/api/auth.py */
export interface BackendAuthResponse {
  access_token: string;
  username: string;
}

/** GET /auth/me */
export interface BackendUser {
  user_id: string;
  username: string;
}

/** GET /auth/earth-engine/start */
export interface EarthEngineAuthStart {
  authorization_url: string;
}

/** POST /auth/earth-engine/local-connect */
export interface EarthEngineLocalConnect {
  connected: boolean;
  mode: string;
  project?: string;
  message?: string;
}

/* --------------------------------------------------------------------- AOI */

/** The backend only accepts these two geometries (schemas.AOIRequest). */
export type AoiGeometryType = "circle" | "square";

/** POST /aoi request — backend/models/schemas.py::AOIRequest */
export interface AoiRequest {
  /** Full precision, never rounded client-side. */
  latitude: number;
  longitude: number;
  /** Backend constraint: 0 < radius_m <= 500. */
  radius_m: number;
  /** Requested investigation/sample scale in metres. */
  scale_m: number;
  geometry_type: AoiGeometryType;
}

/** POST /aoi response — backend/models/schemas.py::AOIResponse */
export interface AoiResponse {
  aoi_id: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  scale_m: number;
  area_m2: number;
  /** [min_lon, min_lat, max_lon, max_lat] as produced by make_aoi_bbox. */
  bbox: number[];
}

/* ---------------------------------------------------------------- analysis */

/**
 * POST /analysis/start request — backend/models/schemas.py.
 * The route additionally rejects any scale_m outside {10,20,30,40,50}.
 */
export interface AnalysisStartRequest {
  aoi_id: string;
  scale_m: number;
  start_date: string;
  end_date: string;
  cloud_pct: number;
}

export interface AnalysisStartResponse {
  analysis_id: string;
}

/** Scales the backend actually accepts (backend/api/analysis.py::start). */
export const SUPPORTED_SCALES_M = [10, 20, 30, 40, 50] as const;
export type SupportedScaleM = (typeof SUPPORTED_SCALES_M)[number];

/** Run-level status held in backend/core/store.py::RUNS. */
export type AnalysisRunStatus = "queued" | "running" | "completed" | "failed";

/**
 * Stage identifiers emitted by backend/api/analysis.py::_run — these are the
 * literal strings the worker writes, in execution order. The UI never invents
 * a stage that the backend did not report.
 */
export type BackendStage =
  | "queued"
  | "acquisition"
  | "spectral_dem"
  | "anomaly_ensemble"
  | "legacy_scientific_audit"
  | "geology"
  | "multiscale"
  | "temporal"
  | "thermal"
  | "artifact_suppression"
  | "ranking"
  | "completed"
  | "failed";

export type StageStatus = "pending" | "running" | "complete" | "failed" | "skipped";

export interface PipelineStage {
  id: BackendStage;
  label: string;
  status: StageStatus;
  message?: string;
  /** 0–1 as reported by the backend. Never interpolated client-side. */
  progress?: number;
}

/** GET /analysis/{id}/status and /debug — the raw RUNS record. */
export interface AnalysisStatusResponse {
  analysis_id: string;
  user_id?: string;
  status: AnalysisRunStatus;
  stage: BackendStage;
  progress?: number | null;
  message?: string | null;
  error?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  /** Present only on failure / debug. */
  traceback?: string;
}

/* ---------------------------------------------------------------- datasets */

/**
 * GET /analysis/{id}/datasets. The backend reports free-form status strings
 * such as "available", "available_per_cell", "not_run",
 * "isolated_pending_validation" or "unavailable: <reason>".
 */
export interface DatasetInfo {
  name: string;
  status: string;
  resolution_m?: number;
  scenes?: number;
  note?: string;
  modules?: string[];
}

export interface DatasetManifestResponse {
  datasets: DatasetInfo[];
}

/* ------------------------------------------------------------------ layers */

/**
 * GET /analysis/{id}/layers. The backend returns vector/point result layers
 * with counts — it does not serve raster tile templates.
 */
export interface LayerDescriptor {
  id: string;
  name: string;
  type: "points" | "geojson" | string;
  count: number;
}

export interface LayersResponse {
  layers: LayerDescriptor[];
}

/* ----------------------------------------------------------------- targets */

/** backend/science/utm.py::wgs84_to_utm */
export interface UtmCoordinate {
  zone?: number;
  hemisphere?: string;
  easting?: number;
  northing?: number;
  epsg?: string | number;
  [key: string]: string | number | undefined;
}

export interface TypeInterpretation {
  class: string;
  label: string;
  /** Hypothesis-fit percentage — explicitly NOT a probability. */
  fit_percent: number;
  alternatives: { label: string; fit_percent: number }[];
  scientific_note: string;
}

export interface ScoreTraceComponent {
  value: number;
  weight: number;
  weighted: number;
}

/** Immutable audit trace attached to every target by the backend. */
export interface ScoreTrace {
  cell_id: string;
  components: Record<string, ScoreTraceComponent>;
  available_weight: number;
  pre_suppression_score: number | null;
  artifact_penalty_factor: number | null;
  final_evidence_score: number | null;
  trace_id: string;
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

/**
 * GET /analysis/{id}/targets — backend/models/targeting.py::build_targets.
 * Scores are relative evidence rankings inside the analysed AOI, not
 * probabilities, and never a claim about a buried object or its depth.
 */
export interface Target {
  target_id: string;
  rank: number;
  cell_id: string;
  latitude: number;
  longitude: number;
  utm?: UtmCoordinate;
  box_geojson?: GeoJsonFeature;
  box_size_m: number;

  /** Fused final evidence score (0–1). */
  anomaly_score: number;
  strength_percent: number;

  zscore_score?: number;
  isolation_forest_score?: number;
  geological_score?: number;
  consensus_score?: number;
  temporal_score?: number;
  temporal_disturbance_score?: number;
  temporal_stability_score?: number;
  thermal_score?: number;

  ndvi?: number;
  ndmi?: number;
  ndwi?: number;
  ndbi?: number;
  iron_oxide?: number;
  clay_ratio?: number;

  human_surface_change_signal?: number;
  surface_artifact_risk?: number;
  built_surface_risk?: number;
  water_surface_risk?: number;
  vegetation_mask_risk?: number;
  landcover_boundary_risk?: number;

  estimated_surface_length_m?: number;
  estimated_surface_width_m?: number;
  /** Always null: satellite data alone cannot support a depth estimate. */
  depth_estimate_m: number | null;

  type_interpretation?: TypeInterpretation;
  evidence: string[];
  data_quality?: { source?: string; synthetic?: boolean; [key: string]: unknown };
  score_trace?: ScoreTrace;
  trace_id?: string;
}

export interface TargetsResponse {
  targets: Target[];
}

/* ----------------------------------------------------------------- samples */

/** GET /analysis/{id}/samples — every sampled grid cell plus run metadata. */
export interface SamplesResponse {
  samples: Record<string, unknown>[];
  metadata: AnalysisMetadata;
  quality: FeatureQuality;
}

/** backend/api/analysis.py RESULTS[...]["metadata"] */
export interface AnalysisMetadata {
  synthetic?: boolean;
  analysis_scale_m?: number;
  start_date?: string;
  end_date?: string;
  cloud_pct?: number;
  sample_count?: number;
  target_candidate_count?: number;
  context_radius_m?: number;
  observation_count?: number;
  duration_seconds?: number;
  optional_modules?: Record<string, string>;
  score_semantics?: string;
  score_calibration?: string;
  scientific_interpretation_policy?: string;
  method?: string;
  centre_utm?: UtmCoordinate;
  aoi_center?: { latitude: number; longitude: number };
  aoi_radius_m?: number;
  target_box_m?: number;
  thermal_effective_resolution_m?: number;
  spectral_proxy_effective_resolution_m?: number;
  landcover_source?: string;
  [key: string]: unknown;
}

/** backend/science/features.py::feature_quality */
export interface FeatureQuality {
  sample_count?: number;
  feature_count?: number;
  overall_completeness?: number;
  by_feature?: Record<string, number>;
  finite_rows?: number;
}

/* ----------------------------------------------------------------- reports */

/** GET /reports/{id} — backend/reporting/report.py::build_report */
export interface ScientificReport {
  title: string;
  generated_at: string;
  scientific_boundary: string;
  methodology: string[];
  metadata: AnalysisMetadata;
  datasets: DatasetInfo[];
  targets: Target[];
  score_trace_policy?: string;
  quality?: FeatureQuality;
  limitations: string[];
  [key: string]: unknown;
}

/* ------------------------------------------------------------ UI envelopes */

/** Generic four-state resource envelope used across the UI. */
export type RemoteState<T> =
  | { state: "unavailable"; reason: string }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; message: string; status?: number };
