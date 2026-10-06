import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { Week12App, STAGES } from "@/components/week12/Week12App";
import { useWeek12 } from "@/lib/week12/useWeek12";
import { supabase } from "@/integrations/supabase/client";

interface Search { stage?: number | undefined }
const description = "Week 12 — the final CyberFoundations Communications Capstone. Turn your own Week 11 IAM Investigation Case File into a Technical Incident Report plus a written or video executive communication (Portfolio Deliverable 5).";

export const Route = createFileRoute("/cyberfoundations/week-12/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Week 12 Communications Capstone — Technical Report & Executive Briefing | CVI" },
      { name: "description", content: description },
      { property: "og:title", content: "Week 12 Communications Capstone — CyberFoundations" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => {
    const n = Number(s['stage']);
    return { stage: Number.isInteger(n) && n >= 1 && n <= STAGES.length ? n : undefined };
  },
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: location.href } as never });
  },
  component: Week12Page,
});

function Week12Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cyberfoundations/week-12/" });
  const store = useWeek12();
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      {store.loadError ? <p role="alert" className="mx-auto max-w-3xl p-8 text-sm">Could not open Week 12: {store.loadError}. Refresh to try again; nothing was changed.</p>
        : store.blocked ? (
          <div className="mx-auto max-w-2xl space-y-3 p-8 text-sm" role="alert">
            <h1 className="font-display text-xl">Week 12 starts from your Week 11 case file</h1>
            <p>We couldn't find a Week 11 attempt for your account. Week 12 turns your own Week 11 Lab 06 IAM Investigation Case File into your final report, so open Week 11 first and work through the missions.</p>
            <Link to="/cyberfoundations/week-11" className="inline-block rounded-md border border-primary/70 bg-primary/20 px-4 py-2 font-medium">Open Week 11</Link>
          </div>
        )
        : !store.view || !store.content ? <p className="mx-auto max-w-3xl p-8 text-sm" role="status">Opening your Week 12 Communications Capstone…</p>
        : <Week12App store={store} stage={search.stage ?? 1} onStage={(n) => navigate({ search: { stage: n } })} />}
    </DemoLabShell>
  );
}
