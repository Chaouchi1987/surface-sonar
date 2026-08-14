import { apiFetch } from "@/lib/api/client";
import type { LayersResponse } from "@/lib/api/types";

/** GET /analysis/{id}/layers — only real, backend-produced layers. */
export const layerService = {
  list: (analysisId: string) => apiFetch<LayersResponse>(`/analysis/${analysisId}/layers`),
};
