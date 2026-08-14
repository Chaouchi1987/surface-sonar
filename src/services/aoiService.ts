import { apiFetch } from "@/lib/api/client";
import type { AoiRequest, AoiResponse } from "@/lib/api/types";

/**
 * POST /aoi — the backend validates geometry and returns the authoritative AOI.
 * Full coordinate precision is transmitted; nothing is rounded client-side.
 */
export const aoiService = {
  create: (payload: AoiRequest) =>
    apiFetch<AoiResponse>("/aoi", { method: "POST", body: JSON.stringify(payload) }),
};
