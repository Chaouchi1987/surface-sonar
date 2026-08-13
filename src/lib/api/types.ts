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

export type PipelineStageId =
  | "data_acquisition"
  | "preprocessing"
  | "feature_extraction"
  | "anomaly_detection"
  | "spatial_clustering"
  | "target_ranking"
  | "final_targets";

export type StageStatus = "pending" | "running" | "complete" | "failed" | "skipped";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  status: StageStatus;
  message?: string;
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
  intelligence_score?: number;
  model_agreement?: number;
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
