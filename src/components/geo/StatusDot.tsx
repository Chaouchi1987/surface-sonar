import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "error" | "muted" | "primary";

const toneClass: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  muted: "bg-muted-foreground",
  primary: "bg-primary",
};

export function StatusDot({
  tone,
  label,
  pulse = false,
  className,
}: {
  tone: Tone;
  label: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-secondary-foreground",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (
          <span
            className={cn("absolute h-2 w-2 rounded-full animate-geo-pulse", toneClass[tone])}
            aria-hidden
          />
        )}
        <span className={cn("h-1.5 w-1.5 rounded-full", toneClass[tone])} aria-hidden />
      </span>
      {label}
    </span>
  );
}
