import { apiFetch, getApiBaseUrl } from "@/lib/api/client";
import type { ScientificReport } from "@/lib/api/types";

/** GET /reports/{id} — reports exist only for completed backend runs. */
export const reportService = {
  get: (analysisId: string) =>
    apiFetch<ScientificReport>(`/reports/${analysisId}`, { timeoutMs: 30000 }),

  /** GET /reports/{id}/pdf — served by the backend, never generated here. */
  pdfUrl: (analysisId: string) => `${getApiBaseUrl()}/reports/${analysisId}/pdf`,
};
