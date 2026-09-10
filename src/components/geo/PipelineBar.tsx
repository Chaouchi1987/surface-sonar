import { CircleCheck, CircleX, Circle, Loader2, MinusCircle } from "lucide-react";
import type { PipelineStage, StageStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICONS: Record<StageStatus, typeof Circle> = {
  pending: Circle,
  running: Loader2,
  complete: CircleCheck,
  failed: CircleX,
  skipped: MinusCircle,
};

const TONE: Record<StageStatus, string> = {
  pending: "text-muted-foreground",
  running: "text-accent",
  complete: "text-success",
  failed: "text-destructive",
  skipped: "text-warning",
};

export function PipelineBar({ stages }: { stages: PipelineStage[] }) {
  return (
    <section
      aria-label="Analysis pipeline status"
      className="flex h-16 shrink-0 items-center gap-1 overflow-x-auto border-t border-border bg-surface px-4"
    >
      <span className="label-tech mr-3 shrink-0">Pipeline</span>
      {stages.map((stage, i) => {
        const Icon = ICONS[stage.status];
        return (
          <div key={stage.id} className="flex shrink-0 items-center">
            <div
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-1.5",
                stage.status === "running"
                  ? "border-accent/50 bg-accent/10"
                  : "border-border bg-background/50",
              )}
              title={stage.message ?? `${stage.label}: ${stage.status}`}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  TONE[stage.status],
                  stage.status === "running" && "animate-spin",
                )}
              />
              <span
                className={cn(
                  "text-[11.5px] text-secondary-foreground",
                  stage.status === "skipped" && "text-muted-foreground",
                )}
              >
                {stage.label}
                {stage.status === "skipped" && (
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-warning">
                    not reported
                  </span>
                )}
              </span>
            </div>
            {i < stages.length - 1 && (
              <span className="mx-1 h-px w-4 bg-border" aria-hidden />
            )}
          </div>
        );
      })}
    </section>
  );
}
