import { apiFetch } from "@/lib/api/client";
import type {
  AnalysisStartRequest,
  AnalysisStartResponse,
  AnalysisStatusResponse,
  DatasetManifestResponse,
  Sentinel2TestResponse,
} from "@/lib/api/types";

export const analysisService = {
  /** POST /analysis/start */
  start: (payload: AnalysisStartRequest) =>
    apiFetch<AnalysisStartResponse>("/analysis/start", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 30000,
    }),

  /** GET /analysis/{id}/status */
  status: (analysisId: string) =>
    apiFetch<AnalysisStatusResponse>(`/analysis/${analysisId}/status`, { timeoutMs: 10000 }),

  /** GET /analysis/{id}/datasets */
  datasets: (analysisId: string) =>
    apiFetch<DatasetManifestResponse>(`/analysis/${analysisId}/datasets`),

  /**
   * POST /analysis/test/sentinel2 — first scientific integration milestone.
   * Every returned statistic originates from Earth Engine.
   */
  sentinel2Test: (payload: { aoi_id: string }) =>
    apiFetch<Sentinel2TestResponse>("/analysis/test/sentinel2", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),
};
