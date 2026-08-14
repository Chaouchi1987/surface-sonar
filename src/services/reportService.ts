import { apiFetch } from "@/lib/api/client";

/** GET /analysis/{id}/report — reports exist only for completed backend runs. */
export const reportService = {
  get: (analysisId: string) => apiFetch<unknown>(`/analysis/${analysisId}/report`),
};
