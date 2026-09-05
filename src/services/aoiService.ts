import { apiFetch } from "@/lib/api/client";
import type { AoiRequest, AoiResponse } from "@/lib/api/types";

/**
 * POST /aoi — the backend validates geometry and owns the AOI id.
 * Full coordinate precision is transmitted; nothing is rounded client-side.
 */
export const aoiService = {
  create: (payload: AoiRequest) =>
    apiFetch<AoiResponse>("/aoi", { method: "POST", body: JSON.stringify(payload) }),
};
