import { apiFetch } from "@/lib/api/client";
import type { Target, TargetsResponse } from "@/lib/api/types";

/** GET /analysis/{id}/targets — an empty array is a valid scientific result. */
export const targetService = {
  list: (analysisId: string) => apiFetch<TargetsResponse>(`/analysis/${analysisId}/targets`),
  get: (analysisId: string, targetId: string) =>
    apiFetch<Target>(`/analysis/${analysisId}/targets/${targetId}`),
};
