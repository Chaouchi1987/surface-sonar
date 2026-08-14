import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/geo/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — GeoAnomaly Pro Workstation Access" },
      {
        name: "description",
        content:
          "Sign in or create an account to save AOIs, manage geospatial analysis projects and track Earth Engine analysis runs in GeoAnomaly Pro.",
      },
      { property: "og:title", content: "Sign In — GeoAnomaly Pro" },
      {
        property: "og:description",
        content: "Authenticated access to GeoAnomaly Pro analysis projects and saved AOIs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        void navigate({ to: "/" });
      } else if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Check your inbox if email confirmation is required.");
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (resetError) throw resetError;
        setNotice("Password reset email sent if that address exists.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">GeoAnomaly Pro</h1>
            <p className="label-tech">Workstation access</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label-tech" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-2 text-[13px] outline-none focus:border-primary"
            />
          </div>

          {mode !== "reset" && (
            <div>
              <label className="label-tech" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-2 text-[13px] outline-none focus:border-primary"
              />
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-[11.5px] text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-md border border-border bg-background/60 p-2 text-[11.5px] text-secondary-foreground">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11.5px]">
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-accent hover:underline"
          >
            {mode === "signup" ? "Have an account? Sign In" : "Create Account"}
          </button>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="text-muted-foreground hover:text-foreground"
          >
            Forgot password
          </button>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-md border border-border bg-background/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Authentication and project storage run on the app backend. Earth Engine credentials
          are never handled in the browser — they stay on the FastAPI service.
        </p>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to workstation
        </Link>
      </div>
    </main>
  );
}
