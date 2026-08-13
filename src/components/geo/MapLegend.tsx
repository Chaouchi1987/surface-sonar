const RAMP = [
  { label: "Low", color: "#3B82F6" },
  { label: "Moderate", color: "#22D3EE" },
  { label: "High", color: "#FBBF24" },
  { label: "Very high", color: "#F97316" },
];

export function MapLegend() {
  return (
    <div className="panel-glass absolute bottom-16 right-3 z-[500] w-48 rounded-lg px-3 py-2">
      <p className="label-tech">Anomaly strength</p>
      <div className="mt-1.5 flex h-2 overflow-hidden rounded-sm" aria-hidden>
        {RAMP.map((s) => (
          <span key={s.label} className="flex-1" style={{ backgroundColor: s.color }} />
        ))}
      </div>
      <ul className="mt-1 flex justify-between text-[9.5px] text-muted-foreground">
        {RAMP.map((s) => (
          <li key={s.label}>{s.label}</li>
        ))}
      </ul>
      <p className="mt-2 text-[9.5px] leading-relaxed text-muted-foreground">
        Ramp applies to backend-supplied anomaly rasters only. No values are rendered until
        an analysis returns data.
      </p>
    </div>
  );
}
