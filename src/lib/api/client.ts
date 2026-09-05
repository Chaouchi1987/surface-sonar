/**
 * Thin HTTP client for the external Python/FastAPI scientific backend.
 * The base URL comes from VITE_API_BASE_URL and can be overridden at runtime
 * (Settings → Backend). No secret is ever stored in the browser and no
 * scientific value is ever fabricated here — failures surface as errors.
 */

const ENV_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

const OVERRIDE_KEY = "geoanomaly.api_base_url";

function readOverride(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(OVERRIDE_KEY)?.replace(/\/$/, "") ?? "";
  } catch {
    return "";
  }
}

let override = readOverride();

/** Current effective base URL (runtime override wins over the env value). */
export function getApiBaseUrl(): string {
  return override || ENV_BASE_URL;
}

/** Persist a runtime base URL. Pass an empty string to fall back to the env. */
export function setApiBaseUrl(url: string): string {
  override = url.trim().replace(/\/$/, "");
  try {
    if (override) window.localStorage.setItem(OVERRIDE_KEY, override);
    else window.localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    /* storage unavailable — keep the in-memory value only */
  }
  return getApiBaseUrl();
}

export const ENV_API_BASE_URL = ENV_BASE_URL;

/** @deprecated prefer getApiBaseUrl() so runtime overrides are respected. */
export const API_BASE_URL: string = ENV_BASE_URL;

/* --------------------------------------------------------- backend session */

const TOKEN_KEY = "geoanomaly.backend_token";

/**
 * The FastAPI service issues its own JWT (backend/core/auth.py). Every route
 * except /health and the auth endpoints requires it as a bearer token.
 */
function readToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

let backendToken = readToken();

export function getBackendToken(): string {
  return backendToken;
}

export function setBackendToken(token: string | null): void {
  backendToken = token ?? "";
  try {
    if (backendToken) window.localStorage.setItem(TOKEN_KEY, backendToken);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — keep the in-memory value only */
  }
}

export const BACKEND_AUTH_REQUIRED =
  "Backend authentication required. Sign in to the analysis service in Settings → Backend.";

/** True when the backend rejected the request for missing/expired credentials. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/** Demo mode is opt-in and never enabled in production builds by default. */
export const DEMO_MODE: boolean =
  (import.meta.env["VITE_ENABLE_DEMO_MODE"] as string | undefined) === "true";


export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly detail?: unknown,
    readonly endpoint?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const BACKEND_UNCONFIGURED =
  "Backend unavailable — no scientific analysis can be performed.";

export const BACKEND_NOT_SET =
  "Backend base URL is not configured. Set VITE_API_BASE_URL or enter it in Settings → Backend (e.g. http://localhost:8000).";

/** True when a request failed because the endpoint does not exist yet. */
export function isNotImplemented(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 501);
}

export interface ApiLogEntry {
  id: string;
  method: string;
  endpoint: string;
  url: string;
  status: number | null;
  durationMs: number;
  at: string;
  ok: boolean;
  error?: string;
  responsePreview?: string;
}

type LogListener = (entry: ApiLogEntry) => void;
const listeners = new Set<LogListener>();

export function onApiLog(listener: LogListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(entry: ApiLogEntry) {
  for (const l of listeners) l(entry);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const baseUrl = getApiBaseUrl();
  const startedAt = performance.now();
  const base = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method,
    endpoint: path,
    url: `${baseUrl}${path}`,
    at: new Date().toISOString(),
  };

  if (!baseUrl) {
    emit({
      ...base,
      status: null,
      durationMs: 0,
      ok: false,
      error: BACKEND_NOT_SET,
    });
    throw new ApiError(BACKEND_NOT_SET, undefined, undefined, path);
  }

  const { timeoutMs = 20000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(rest.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload: unknown = text ? safeJson(text) : null;
    const durationMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      const message = extractDetail(payload) ?? `Backend returned ${response.status}`;
      emit({
        ...base,
        status: response.status,
        durationMs,
        ok: false,
        error: message,
        responsePreview: text.slice(0, 800),
      });
      throw new ApiError(message, response.status, payload, path);
    }

    emit({
      ...base,
      status: response.status,
      durationMs,
      ok: true,
      responsePreview: text.slice(0, 800),
    });
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const durationMs = Math.round(performance.now() - startedAt);
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    const message = timedOut
      ? "Backend request timed out — analysis state unknown."
      : `Cannot reach backend at ${baseUrl}${path}. ${BACKEND_UNCONFIGURED}`;
    emit({ ...base, status: null, durationMs, ok: false, error: message });
    throw new ApiError(message, undefined, undefined, path);
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractDetail(payload: unknown): string | undefined {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["detail", "message", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return undefined;
}
