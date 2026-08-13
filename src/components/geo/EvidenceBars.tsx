import type { Target } from "@/lib/api/types";

const CHANNELS: { key: keyof Target; label: string; color: string }[] = [
  { key: "anomaly_score", label: "Anomaly", color: "var(--color-anomaly)" },
  { key: "geological_score", label: "Geology", color: "var(--color-geological)" },
  { key: "temporal_score", label: "Temporal", color: "var(--color-temporal)" },
  { key: "thermal_score", label: "Thermal", color: "var(--color-thermal)" },
  { key: "structural_score", label: "Structural", color: "var(--color-structural)" },
];

const SEGMENTS = 10;

function qualitative(value: number): string {
  if (value >= 0.8) return "Very high";
  if (value >= 0.6) return "High";
  if (value >= 0.4) return "Moderate";
  if (value >= 0.2) return "Low";
  return "Very low";
}

export function EvidenceBars({ target }: { target: Target }) {
  return (
    <div>
      <p className="label-tech">Evidence breakdown</p>
      <ul className="mt-1.5 space-y-1.5">
        {CHANNELS.map(({ key, label, color }) => {
          const raw = target[key];
          const value = typeof raw === "number" ? Math.max(0, Math.min(1, raw)) : null;
          const filled = value === null ? 0 : Math.round(value * SEGMENTS);
          return (
            <li key={String(key)} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</span>
              <span className="flex flex-1 gap-0.5" aria-hidden>
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-[1px]"
                    style={{
                      backgroundColor: i < filled ? color : "var(--color-elevated)",
                    }}
                  />
                ))}
              </span>
              <span className="mono-coord w-20 shrink-0 text-right text-[10.5px] text-secondary-foreground">
                {value === null ? "No data" : qualitative(value)}
              </span>
            </li>
          );
        })}
      </ul>
      {target.model_agreement !== undefined && (
        <p className="mono-coord mt-1.5 text-[10.5px] text-muted-foreground">
          Model agreement {(target.model_agreement * 100).toFixed(0)}% · score, confidence and
          data quality are reported separately.
        </p>
      )}
    </div>
  );
}
