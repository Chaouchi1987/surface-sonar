import { apiFetch } from "@/lib/api/client";
import type { BackendHealth, EarthEngineHealth } from "@/lib/api/types";

/** GET /health — real backend reachability. Never assume success. */
export const healthService = {
  check: () => apiFetch<BackendHealth>("/health", { method: "GET", timeoutMs: 8000 }),
  /** GET /health/earth-engine — backend must actually verify EE initialisation. */
  earthEngine: () =>
    apiFetch<EarthEngineHealth>("/health/earth-engine", { method: "GET", timeoutMs: 15000 }),
};
