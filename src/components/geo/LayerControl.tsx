import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<string, string> = {
  basemap: "Basemap",
  spectral: "Spectral",
  terrain: "Terrain",
  radar: "Radar",
  thermal: "Thermal",
  analysis: "Analysis",
  vector: "Vector",
};

export function LayerControl() {
  const [open, setOpen] = useState(true);
  const { layers, toggleLayer, setLayerOpacity } = useAnalysisStore();

  const groups = Array.from(new Set(layers.map((l) => l.group)));

  return (
    <div className="panel-glass absolute right-3 top-3 z-[500] w-60 overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-medium"
      >
        <span className="inline-flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-accent" /> Layers
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
      </button>

      {open && (
        <div className="max-h-[52vh] space-y-2 overflow-y-auto border-t border-border px-3 py-2">
          {groups.map((group) => (
            <div key={group}>
              <p className="label-tech">{GROUP_LABELS[group] ?? group}</p>
              <ul className="mt-1 space-y-1">
                {layers
                  .filter((l) => l.group === group)
                  .map((l) => (
                    <li key={l.id}>
                      <div className="flex items-center justify-between gap-2">
                        <label
                          className={cn(
                            "flex min-w-0 items-center gap-2 text-[11.5px]",
                            l.available ? "text-secondary-foreground" : "text-muted-foreground",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={l.visible && l.available}
                            disabled={!l.available}
                            onChange={() => toggleLayer(l.id)}
                            className="h-3 w-3 accent-[var(--color-primary)]"
                          />
                          <span className="truncate">{l.name}</span>
                        </label>
                        {!l.available && (
                          <span className="mono-coord shrink-0 text-[9.5px] uppercase text-muted-foreground">
                            No data
                          </span>
                        )}
                      </div>
                      {l.available && l.visible && l.group !== "vector" && (
                        <input
                          type="range"
                          aria-label={`${l.name} opacity`}
                          min={0}
                          max={1}
                          step={0.05}
                          value={l.opacity}
                          onChange={(e) => setLayerOpacity(l.id, Number(e.target.value))}
                          className="mt-1 h-1 w-full accent-[var(--color-primary)]"
                        />
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
