import type { Target } from "@/lib/api/types";

/**
 * Score-scale handling for both backend contracts.
 *
 * v0.4.0 emits `anomaly_score` as a 0–1 fused evidence score.
 * v0.5.x may emit it as a 0–100 screening percentage, described by
 * `score_type`. Neither is a probability or a confidence, and neither is
 * rescaled unless the backend's own contract says which scale it used.
 */

export function isPercentScale(target: Target): boolean {
  const type = target.score_type;
  if (typeof type === "string" && /percent|screening|0\s*[-–]\s*100/i.test(type)) return true;
  return typeof target.anomaly_score === "number" && target.anomaly_score > 1;
}

/** Percentage form of the backend's own score. Null when not reported. */
export function screeningPercent(target: Target): number | null {
  if (typeof target.strength_percent === "number") return target.strength_percent;
  if (typeof target.anomaly_score !== "number" || !Number.isFinite(target.anomaly_score)) {
    return null;
  }
  return isPercentScale(target) ? target.anomaly_score : target.anomaly_score * 100;
}

/** 0–1 form for bar rendering only. Null when the value was not reported. */
export function unitValue(raw: unknown, percentScale = false): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  const v = percentScale || raw > 1 ? raw / 100 : raw;
  return Math.max(0, Math.min(1, v));
}

/** Label describing what the backend's score actually is. */
export function scoreTypeLabel(target: Target): string {
  if (typeof target.score_type === "string" && target.score_type)
    return target.score_type.replace(/_/g, " ");
  return isPercentScale(target) ? "screening percentage" : "fused evidence score";
}
