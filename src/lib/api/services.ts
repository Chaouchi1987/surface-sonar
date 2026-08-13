import { apiFetch } from "./client";
import type {
  Aoi,
  AnalysisRun,
  HealthResponse,
  LayerDescriptor,
  Target,
} from "./types";

/**
 * Service layer. Components never call fetch directly.
 * TODO(backend): endpoints below are the agreed contract with the external
 * Python/FastAPI service; they are not assumed to exist yet.
 */

export const healthService = {
  check: () => apiFetch<HealthResponse>("/health", { method: "GET", timeoutMs: 6000 }),
};

export const aoiService = {
  create: (aoi: Aoi) =>
    apiFetch<Aoi>("/aoi", { method: "POST", body: JSON.stringify(aoi) }),
};

export const analysisService = {
  start: (payload: { aoi: Aoi; scales_m: number[] }) =>
    apiFetch<AnalysisRun>("/analysis/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  get: (id: string) => apiFetch<AnalysisRun>(`/analysis/${id}`),
  status: (id: string) => apiFetch<AnalysisRun>(`/analysis/${id}/status`),
};

export const layerService = {
  list: (id: string) => apiFetch<LayerDescriptor[]>(`/analysis/${id}/layers`),
  heatmap: (id: string) => apiFetch<unknown>(`/analysis/${id}/heatmap`),
  contours: (id: string) => apiFetch<unknown>(`/analysis/${id}/contours`),
};

export const targetService = {
  list: (id: string) => apiFetch<Target[]>(`/analysis/${id}/targets`),
  get: (id: string, targetId: string) =>
    apiFetch<Target>(`/analysis/${id}/targets/${targetId}`),
};

export const reportService = {
  get: (id: string) => apiFetch<unknown>(`/analysis/${id}/report`),
};
