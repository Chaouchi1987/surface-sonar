/**
 * Thin HTTP client for the external Python/FastAPI scientific backend.
 * The base URL is configured via VITE_API_BASE_URL (e.g. http://localhost:8000).
 * No scientific value is ever fabricated here — failures surface as errors.
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

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
  "VITE_API_BASE_URL is not configured. Point it at your FastAPI server (e.g. http://localhost:8000).";

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
  const startedAt = performance.now();
  const base = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method,
    endpoint: path,
    url: `${API_BASE_URL}${path}`,
    at: new Date().toISOString(),
  };

  if (!API_BASE_URL) {
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
      : `Cannot reach backend at ${API_BASE_URL}${path}. ${BACKEND_UNCONFIGURED}`;
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
