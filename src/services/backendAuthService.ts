import { apiFetch, setBackendToken } from "@/lib/api/client";
import type {
  BackendAuthResponse,
  BackendUser,
  EarthEngineAuthStart,
  EarthEngineHealth,
  EarthEngineLocalConnect,
} from "@/lib/api/types";

/**
 * The FastAPI service issues its own JWT (POST /auth/login). Every analysis
 * route requires it, so the token is stored client-side and attached by the
 * shared API client. No password is ever persisted.
 */
export const backendAuthService = {
  login: async (username: string, password: string) => {
    const result = await apiFetch<BackendAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setBackendToken(result.access_token);
    return result;
  },

  signup: async (username: string, password: string) => {
    const result = await apiFetch<BackendAuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setBackendToken(result.access_token);
    return result;
  },

  me: () => apiFetch<BackendUser>("/auth/me", { timeoutMs: 8000 }),

  logout: () => setBackendToken(null),

  /** GET /auth/earth-engine/status — Earth Engine is authorised per user. */
  earthEngineStatus: () =>
    apiFetch<EarthEngineHealth>("/auth/earth-engine/status", { timeoutMs: 15000 }),

  /** GET /auth/earth-engine/start — returns the Google authorisation URL. */
  earthEngineStart: () => apiFetch<EarthEngineAuthStart>("/auth/earth-engine/start"),

  /** POST /auth/earth-engine/local-connect — local development credentials. */
  earthEngineLocalConnect: () =>
    apiFetch<EarthEngineLocalConnect>("/auth/earth-engine/local-connect", {
      method: "POST",
      timeoutMs: 30000,
    }),
};
