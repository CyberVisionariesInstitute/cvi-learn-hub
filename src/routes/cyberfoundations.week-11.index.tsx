import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { Simulator, VIEWS, type View } from "@/components/week11/Simulator";
import { useWeek11 } from "@/lib/week11/useWeek11";
import { supabase } from "@/integrations/supabase/client";

interface Search { view?: View | undefined; mission?: string | undefined }
const description = "Week 11 browser-based simulated AD/IAM administration: six connected missions in the fictional Cloud Heights Identity Center, ending in the IAM Investigation Case File (Portfolio Deliverable 4). Week 12 turns it into the final incident report and presentation.";

export const Route = createFileRoute("/cyberfoundations/week-11/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cloud Heights Identity Center — Week 11 IAM & Active Directory | CVI Demo Lab" },
      { name: "description", content: description },
      { property: "og:title", content: "Cloud Heights Identity Center — Week 11" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    view: typeof s['view'] === "string" && (VIEWS as readonly string[]).includes(s['view']) ? (s['view'] as View) : undefined,
    mission: typeof s['mission'] === "string" && /^M0[1-6]$/.test(s['mission']) ? s['mission'] : undefined,
  }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: location.href } as never });
  },
  component: Week11Page,
});

function Week11Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cyberfoundations/week-11/" });
  const store = useWeek11();
  const view = search.view ?? "dashboard";
  const mission = search.mission ?? "M01";
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      {store.loadError ? <p role="alert" className="mx-auto max-w-3xl p-8 text-sm">Could not open your Week 11 attempt: {store.loadError}. Refresh to try again; nothing was changed.</p>
        : !store.view ? <p className="mx-auto max-w-3xl p-8 text-sm" role="status">Opening your Cloud Heights Identity Center attempt…</p>
        : <Simulator store={store} view={view} mission={mission} onView={(v) => navigate({ search: (p: Search) => ({ ...p, view: v }) })} onMission={(m) => navigate({ search: (p: Search) => ({ ...p, mission: m }) })} />}
    </DemoLabShell>
  );
}
