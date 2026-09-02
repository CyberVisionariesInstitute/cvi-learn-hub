import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Student Sign In — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Sign in to reach your CyberVisionaries Institute Phase 3 PKI Architect Capstone workspace.",
      },
      { property: "og:title", content: "Student Sign In — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "Sign in to reach your Phase 3 PKI Architect Capstone workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/pki/capstone";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stored, setStored] = useState<string | undefined>(undefined);
  useEffect(() => {
    setStored(sessionStorage.getItem("cvi:post-auth") ?? undefined);
  }, []);
  const target = safePath(search.redirect ?? stored);

  useEffect(() => {
    if (!loading && session) void navigate({ to: target, replace: true });
  }, [loading, session, navigate, target]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await navigate({ to: target, replace: true });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
            data: { display_name: displayName || email },
          },
        });
        if (err) throw err;
        setMessage("Account created. Check your email if confirmation is required, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      sessionStorage.setItem("cvi:post-auth", target);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) {
        setError("Google sign-in failed. Try email and password.");
        return;
      }
      if (result.redirected) return;
      await navigate({ to: target, replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-16 sm:px-8">
        <div>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">
            CyberVisionaries Institute
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground">Student sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your capstone workspace, assigned scenario, and saved project live behind this sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface/80 p-6">
          {mode === "signup" ? (
            <label className="block text-sm">
              <span className="text-muted-foreground">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-foreground">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="min-h-11 w-full rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>

        <Link to="/pki" className="text-xs text-muted-foreground hover:text-foreground">
          Back to the PKI Demo Lab
        </Link>
      </div>
    </DemoLabShell>
  );
}
