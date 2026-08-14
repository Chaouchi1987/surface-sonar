import { useState } from "react";
import { Bug, Copy, Trash2 } from "lucide-react";
import { useAnalysisStore } from "@/state/analysis-store";
import { API_BASE_URL } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function DebugPanel() {
  const { apiLog, clearLog, analysisId, analysisStatus, analysisMessage } = useAnalysisStore();
  const [copied, setCopied] = useState(false);

  const technicalDetails = JSON.stringify(
    {
      api_base_url: API_BASE_URL || null,
      analysis_id: analysisId,
      analysis_status: analysisStatus,
      analysis_message: analysisMessage,
      requests: apiLog,
    },
    null,
    2,
  );

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-accent" />
          <h2 className="text-[13px] font-semibold tracking-tight">Technical Debug</h2>
        </span>
        <span className="flex gap-1">
          <button
            type="button"
            aria-label="Copy technical details"
            onClick={() => {
              void navigator.clipboard.writeText(technicalDetails);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Clear request log"
            onClick={clearLog}
            className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </header>

      {copied && <p className="text-[11px] text-success">Technical details copied.</p>}

      {apiLog.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-[11.5px] text-muted-foreground">
          No API requests recorded in this session.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {apiLog.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                "rounded-md border p-2",
                entry.ok ? "border-border" : "border-destructive/50 bg-destructive/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="mono-coord truncate text-[11px] text-secondary-foreground">
                  {entry.method} {entry.endpoint}
                </span>
                <span
                  className={cn(
                    "mono-coord shrink-0 text-[10.5px]",
                    entry.ok ? "text-success" : "text-destructive",
                  )}
                >
                  {entry.status ?? "ERR"} · {entry.durationMs} ms
                </span>
              </div>
              {entry.error && (
                <p className="mt-1 text-[10.5px] leading-relaxed text-destructive">{entry.error}</p>
              )}
              {entry.responsePreview && (
                <pre className="mono-coord mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all text-[10px] text-muted-foreground">
                  {entry.responsePreview}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10.5px] leading-relaxed text-muted-foreground">
        Request log is local to this browser session and contains no credentials.
      </p>
    </section>
  );
}
