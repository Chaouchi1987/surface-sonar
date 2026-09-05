import { apiFetch } from "@/lib/api/client";
import type {
  AnalysisStartRequest,
  AnalysisStartResponse,
  AnalysisStatusResponse,
  DatasetManifestResponse,
  SamplesResponse,
} from "@/lib/api/types";

/**
 * All analysis routes require the backend-issued bearer token; the shared
 * client attaches it. No value returned here is ever synthesised.
 */
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

  /** GET /analysis/{id}/samples — sampled grid cells plus run metadata. */
  samples: (analysisId: string) =>
    apiFetch<SamplesResponse>(`/analysis/${analysisId}/samples`, { timeoutMs: 30000 }),

  /** GET /analysis/{id}/debug — raw run record including any traceback. */
  debug: (analysisId: string) =>
    apiFetch<AnalysisStatusResponse>(`/analysis/${analysisId}/debug`),
};
