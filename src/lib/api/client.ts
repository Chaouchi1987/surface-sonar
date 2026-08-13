/**
 * Thin HTTP client for the external Python/FastAPI scientific backend.
 * The base URL is configured via VITE_API_BASE_URL (e.g. http://localhost:8000).
 * No scientific value is ever fabricated here — failures surface as errors.
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const BACKEND_UNCONFIGURED =
  "Backend unavailable — no scientific analysis can be performed.";

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  if (!API_BASE_URL) throw new ApiError(BACKEND_UNCONFIGURED);

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

    if (!response.ok) {
      throw new ApiError(
        extractDetail(payload) ?? `Backend returned ${response.status}`,
        response.status,
        payload,
      );
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Backend request timed out — analysis state unknown.");
    }
    throw new ApiError(BACKEND_UNCONFIGURED);
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
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return undefined;
}
