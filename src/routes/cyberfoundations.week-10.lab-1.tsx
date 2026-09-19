import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { Panel } from "@/components/week10/ui";
import { Lab1 } from "@/components/week10/Lab1";
import { RoomBoard } from "@/components/week10/RoomBoard";
import { Week10Toolbar } from "@/components/week10/Week10Toolbar";
import { useWeek10 } from "@/lib/week10/useWeek10";
import { WEEK10_ROUTES } from "@/lib/week10/case-packet";

const description =
  "Week 10 Lab 1: walk the Cloud Heights Family Clinic, gather evidence, build five risk scenarios, and analyse a suspicious email.";

export const Route = createFileRoute("/cyberfoundations/week-10/lab-1")({
  head: () => ({
    meta: [
      { title: "Week 10 Lab 1 — Investigate What Needs Protection | CVI Demo Lab" },
      { name: "description", content: description },
      { property: "og:title", content: "Week 10 Lab 1 — Investigate What Needs Protection" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lab1Page,
});

function Lab1Page() {
  const store = useWeek10();
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8">
        <Panel eyebrow="Module 4 · Week 10 · Lab 1 · about 45–60 minutes">
          <h1 className="font-display text-3xl text-foreground">
            Investigate What Needs Protection
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground">
            Your job is to understand the clinic before judging it. Read the rooms, collect
            the evidence, then describe five situations where something could go wrong —
            each one anchored to evidence you can point at.
          </p>
          <p className="mt-3 text-sm text-foreground">
            <strong>You are finished when</strong> five scenarios each have evidence, a
            threat, a vulnerability, a consequence and at least one CIA concern, and the
            email analysis has three warning signs plus a safe reporting step.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link
              to={WEEK10_ROUTES.overview}
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Back to overview
            </Link>
            <Link
              to={WEEK10_ROUTES.lab2}
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Continue to Lab 2
            </Link>
          </div>
        </Panel>

        <Panel title="The clinic">
          <RoomBoard store={store} />
        </Panel>

        <Lab1 store={store} />
        <Week10Toolbar store={store} />
      </div>
    </DemoLabShell>
  );
}
