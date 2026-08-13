import {
  Activity,
  Crosshair,
  Database,
  FileText,
  FolderTree,
  History,
  Layers,
  Mountain,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Settings,
  Target as TargetIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionId =
  | "project"
  | "aoi"
  | "data"
  | "analysis"
  | "geology"
  | "anomaly"
  | "targets"
  | "temporal"
  | "reports"
  | "settings";

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "project", label: "Project", icon: FolderTree },
  { id: "aoi", label: "AOI", icon: Crosshair },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "analysis", label: "Analysis", icon: Activity },
  { id: "geology", label: "Geological Intelligence", icon: Mountain },
  { id: "anomaly", label: "Anomaly Detection", icon: ScanLine },
  { id: "targets", label: "Targets", icon: TargetIcon },
  { id: "temporal", label: "Temporal Analysis", icon: History },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <nav
      aria-label="Workstation sections"
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[272px]",
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && <span className="label-tech">Workspace</span>}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                  isActive
                    ? "bg-primary/12 text-foreground"
                    : "text-secondary-foreground hover:bg-elevated hover:text-foreground",
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent"
                    aria-hidden
                  />
                )}
                <Icon
                  className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "text-muted-foreground")}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {!collapsed && (
        <div className="border-t border-border px-3 py-3">
          <p className="label-tech">Layers</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Managed from the map panel
          </p>
        </div>
      )}
    </nav>
  );
}
