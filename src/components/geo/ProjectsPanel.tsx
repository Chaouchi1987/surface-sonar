import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisStore } from "@/state/analysis-store";

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  aoi_lat: number | null;
  aoi_lon: number | null;
  aoi_radius_m: number | null;
  scale_m: number | null;
  created_at: string;
  updated_at: string;
}

export function ProjectsPanel() {
  const { user, loading } = useAuth();
  const { aoi, patchAoi } = useAnalysisStore();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error: loadError } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setProjects((data ?? []) as ProjectRow[]);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="label-tech">Checking session…</p>;

  if (!user) {
    return (
      <section className="space-y-3">
        <Header />
        <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-[11.5px] leading-relaxed text-warning">
          Not signed in — projects are unavailable. Sign in to create and save analysis
          projects.
        </p>
        <Link
          to="/auth"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-[12.5px] font-medium text-primary-foreground"
        >
          Sign In
        </Link>
      </section>
    );
  }

  async function createProject() {
    if (!user || !name.trim()) return;
    setBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from("projects").insert({
      owner_id: user.id,
      name: name.trim(),
      aoi_lat: aoi.centerLat,
      aoi_lon: aoi.centerLon,
      aoi_radius_m: aoi.radiusM,
      scale_m: aoi.scaleM,
    });
    if (insertError) setError(insertError.message);
    else setName("");
    await load();
    setBusy(false);
  }

  async function renameProject(project: ProjectRow) {
    const next = window.prompt("Project name", project.name);
    if (!next || next === project.name) return;
    const { error: updateError } = await supabase
      .from("projects")
      .update({ name: next })
      .eq("id", project.id);
    if (updateError) setError(updateError.message);
    await load();
  }

  async function deleteProject(project: ProjectRow) {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", project.id);
    if (deleteError) setError(deleteError.message);
    await load();
  }

  function openProject(project: ProjectRow) {
    patchAoi({
      name: project.name,
      centerLat: project.aoi_lat,
      centerLon: project.aoi_lon,
      ...(project.aoi_radius_m ? { radiusM: project.aoi_radius_m } : {}),
      ...(project.scale_m ? { scaleM: project.scale_m } : {}),
    });
  }

  return (
    <section className="space-y-3">
      <Header />

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => void createProject()}
          disabled={busy || !name.trim()}
          aria-label="Create project"
          className="rounded-md bg-primary px-2.5 text-primary-foreground disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-[11px] text-destructive">
          {error}
        </p>
      )}

      {projects.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-[11.5px] text-muted-foreground">
          No projects yet. Create one to save the current AOI and scale.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2"
            >
              <button
                type="button"
                onClick={() => openProject(p)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-[12.5px] text-secondary-foreground">
                  {p.name}
                </span>
                <span className="mono-coord block text-[10px] text-muted-foreground">
                  {p.aoi_lat !== null && p.aoi_lon !== null
                    ? `${p.aoi_lat}, ${p.aoi_lon}`
                    : "No AOI saved"}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Rename ${p.name}`}
                onClick={() => void renameProject(p)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                onClick={() => void deleteProject(p)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-2">
      <FolderTree className="h-4 w-4 text-accent" />
      <h2 className="text-[13px] font-semibold tracking-tight">Projects</h2>
    </header>
  );
}
