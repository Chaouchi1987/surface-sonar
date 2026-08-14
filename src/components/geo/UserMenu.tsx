import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FolderTree, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu({ onOpenSection }: { onOpenSection: (id: "project" | "settings") => void }) {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return <span className="label-tech px-2">Checking session…</span>;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground"
      >
        <UserRound className="h-3.5 w-3.5" /> Sign In
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="User menu"
        className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground"
      >
        <UserRound className="h-3.5 w-3.5" />
        <span className="max-w-[140px] truncate">{user.email}</span>
      </button>

      {open && (
        <div className="panel-glass absolute right-0 top-[110%] z-[900] w-52 overflow-hidden rounded-md border border-border">
          <p className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
            Signed in as
            <span className="mono-coord block truncate text-secondary-foreground">
              {user.email}
            </span>
          </p>
          <MenuItem
            icon={FolderTree}
            label="Projects"
            onClick={() => {
              onOpenSection("project");
              setOpen(false);
            }}
          />
          <MenuItem
            icon={Settings}
            label="Settings"
            onClick={() => {
              onOpenSection("settings");
              setOpen(false);
            }}
          />
          <MenuItem
            icon={LogOut}
            label="Sign Out"
            onClick={async () => {
              setOpen(false);
              await signOut();
              void navigate({ to: "/auth" });
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserRound;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
