import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { Panel } from "@/components/week10/ui";
import { Lab2 } from "@/components/week10/Lab2";
import { Week10Toolbar } from "@/components/week10/Week10Toolbar";
import { ClinicIllustration } from "@/components/week10/ClinicIllustration";
import { CompletionSummary } from "@/components/week10/CompletionSummary";
import { useWeek10 } from "@/lib/week10/useWeek10";
import { WEEK10_ROUTES } from "@/lib/week10/case-packet";
import { clinicEntranceIllustration } from "@/lib/week10/clinic-art";

const description =
  "Week 10 Lab 2: rate the clinic's risks for likelihood and impact, place them on a 3x3 matrix, choose priorities, recommend controls, and brief the practice manager.";

export const Route = createFileRoute("/cyberfoundations/week-10/lab-2")({
  head: () => ({
    meta: [
      { title: "Week 10 Lab 2 — Prioritize Risks and Recommend Controls | CVI Demo Lab" },
      { name: "description", content: description },
      {
        property: "og:title",
        content: "Week 10 Lab 2 — Prioritize Risks and Recommend Controls",
      },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lab2Page,
});

function Lab2Page() {
  const store = useWeek10();
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8">
        <Panel eyebrow="Module 4 · Week 10 · Lab 2 · about 45–60 minutes">
          <ClinicIllustration illustration={clinicEntranceIllustration} priority className="mb-5" />
          <h1 className="font-display text-3xl text-foreground">
            Prioritize Risks and Recommend Controls
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground">
            Everything cannot be first. This lab is about deciding what the clinic should do
            next, and being able to explain why to someone who is not technical.
          </p>
          <p className="mt-3 text-sm text-foreground">
            <strong>You are finished when</strong> every risk has a likelihood and an impact
            with reasons, two priorities are chosen and explained, each priority has a
            control with its remaining risk described, and the owner briefing is written.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link
              to={WEEK10_ROUTES.lab1}
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Back to Lab 1
            </Link>
            <Link
              to={WEEK10_ROUTES.overview}
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Overview
            </Link>
          </div>
        </Panel>

        <Lab2 store={store} />
        <CompletionSummary store={store} />
        <Week10Toolbar store={store} />
      </div>
    </DemoLabShell>
  );
}
