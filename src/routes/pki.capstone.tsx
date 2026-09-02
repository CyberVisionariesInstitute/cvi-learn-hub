import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useWorkspace } from "@/lib/capstone/useWorkspace";
import { STAGES } from "@/lib/capstone/model";

export const Route = createFileRoute("/pki/capstone")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "The CyberVisionaries Institute Phase 3 PKI Architect Capstone workspace: your assigned scenario, design work, evidence, and defense.",
      },
      {
        property: "og:title",
        content: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute",
      },
      {
        property: "og:description",
        content:
          "Your assigned scenario, architecture work, evidence, and final defense — all inside the CVI portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://cvi-learn-hub.lovable.app/pki/capstone" }],
  }),
  component: CapstoneWorkspaceLayout,
});

function CapstoneWorkspaceLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useSession();
  const workspace = useWorkspace(Boolean(session));

  useEffect(() => {
    if (!loading && !session) {
      void navigate({
        to: "/auth",
        search: { redirect: "/pki/capstone" },
        replace: true,
      });
    }
  }, [loading, session, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  if (loading || !session) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-sm text-muted-foreground sm:px-8">
        Checking your session…
      </div>
    );
  }

  const data = workspace.data;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">
            CyberVisionaries Institute • Phase 3
          </p>
          <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">
            PKI Architect Capstone
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.assignment
              ? `Assigned scenario ${data.assignment.scenario_code} · version ${data.assignment.scenario_version}`
              : "Design. Defend. Operate. Adapt."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.isStaff ? (
            <Link
              to="/phase3-console"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-xs tracking-[0.14em] text-muted-foreground uppercase hover:border-primary/60 hover:text-foreground"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Phase 3 Console
            </Link>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-xs tracking-[0.14em] text-muted-foreground uppercase hover:border-primary/60 hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      {data?.assignment ? (
        <nav
          aria-label="Capstone workflow"
          className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface/70 p-2"
        >
          <Link
            to="/pki/capstone"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary/15 text-foreground border-primary/50" }}
            inactiveProps={{ className: "text-muted-foreground border-transparent" }}
            className="min-h-10 rounded-md border px-3 py-2 text-xs tracking-[0.1em] uppercase hover:text-foreground"
          >
            Overview
          </Link>
          {STAGES.map((stage) => (
            <Link
              key={stage.key}
              to="/pki/capstone/$stage"
              params={{ stage: stage.key }}
              activeProps={{ className: "bg-primary/15 text-foreground border-primary/50" }}
              inactiveProps={{ className: "text-muted-foreground border-transparent" }}
              className="min-h-10 rounded-md border px-3 py-2 text-xs tracking-[0.1em] uppercase hover:text-foreground"
            >
              {stage.label}
            </Link>
          ))}
          <Link
            to="/pki/capstone/evidence"
            activeProps={{ className: "bg-primary/15 text-foreground border-primary/50" }}
            inactiveProps={{ className: "text-muted-foreground border-transparent" }}
            className="min-h-10 rounded-md border px-3 py-2 text-xs tracking-[0.1em] uppercase hover:text-foreground"
          >
            Evidence
          </Link>
        </nav>
      ) : null}

      <div className="mt-6">
        {workspace.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        ) : workspace.isError ? (
          <p className="text-sm text-destructive">
            We could not load your workspace. Refresh, or contact your instructor if this persists.
          </p>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
