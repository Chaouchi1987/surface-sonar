import { useState } from "react";
import { CircleX, RotateCcw } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";

export function AnalysisErrorCard({ onRetry }: { onRetry: () => void }) {
  const { errors, analysisMessage, apiLog } = useAnalysisStore();
  const [showDetails, setShowDetails] = useState(false);

  const reason = errors[0] ?? analysisMessage;
  if (!reason) return null;

  const lastFailure = apiLog.find((e) => !e.ok);

  return (
    <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-destructive">
        <CircleX className="h-3.5 w-3.5" /> Analysis failed
      </p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-secondary-foreground">{reason}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">No scientific results were generated.</p>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11.5px] text-secondary-foreground hover:bg-elevated hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Retry
        </button>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="rounded-md border border-border px-2.5 py-1.5 text-[11.5px] text-secondary-foreground hover:bg-elevated hover:text-foreground"
        >
          {showDetails ? "Hide" : "View"} Technical Details
        </button>
      </div>

      {showDetails && (
        <pre className="mono-coord mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded border border-border bg-background/60 p-2 text-[10px] text-muted-foreground">
          {JSON.stringify(lastFailure ?? { note: "No failed HTTP request recorded." }, null, 2)}
        </pre>
      )}
    </div>
  );
}
