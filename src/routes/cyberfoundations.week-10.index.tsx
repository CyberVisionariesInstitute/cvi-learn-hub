import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { Panel } from "@/components/week10/ui";
import { RoomBoard } from "@/components/week10/RoomBoard";
import { Week10Toolbar } from "@/components/week10/Week10Toolbar";
import { ClinicIllustration } from "@/components/week10/ClinicIllustration";
import { CompletionSummary } from "@/components/week10/CompletionSummary";
import { useWeek10 } from "@/lib/week10/useWeek10";
import { clinicEntranceIllustration } from "@/lib/week10/clinic-art";
import {
  assets,
  clinicProfile,
  scenarioDate,
  threatEvents,
  WEEK10_ROUTES,
} from "@/lib/week10/case-packet";

const description =
  "Week 10 interactive investigation: walk a small clinic room by room, collect evidence, and turn what you find into risk scenarios, ratings and practical recommendations.";

export const Route = createFileRoute("/cyberfoundations/week-10/")({
  head: () => ({
    meta: [
      { title: "Cloud Heights Family Clinic — Risk & Threat Investigation | CVI Demo Lab" },
      { name: "description", content: description },
      {
        property: "og:title",
        content: "Cloud Heights Family Clinic — Risk & Threat Investigation",
      },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Week10Overview,
});

const btn =
  "min-h-11 rounded-md border border-primary/60 bg-primary/15 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/25";

function Week10Overview() {
  const store = useWeek10();

  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8">
        <Panel eyebrow="Module 4 · Week 10 · Two labs · about 45–60 minutes each">
          <ClinicIllustration illustration={clinicEntranceIllustration} priority className="mb-5" />
          <h1 className="font-display text-3xl text-foreground">
            Cloud Heights Family Clinic — Risk &amp; Threat Investigation
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground">
            You have spent earlier weeks at the keyboard: commands, networks and firewalls,
            encryption and SSH keys, certificates and trust. This week asks the question a
            security professional is actually paid to answer — what does any of that mean for
            a real business, and what should it do first?
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Scenario date: {scenarioDate}. Nothing here is timed and nothing is scored
            automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={WEEK10_ROUTES.lab1} className={btn}>
              Start Lab 1 — Investigate what needs protection
            </Link>
            <Link to={WEEK10_ROUTES.lab2} className={btn}>
              Go to Lab 2 — Prioritize risks and recommend controls
            </Link>
          </div>
        </Panel>

        <Panel title="How this works">
          <ol className="space-y-2 text-sm leading-relaxed text-foreground">
            <li>
              1. Walk the five rooms below. Read each staff statement and open the evidence
              cards.
            </li>
            <li>
              2. Add the evidence you think matters to your findings. The lab never writes
              your interpretation for you.
            </li>
            <li>
              3. In Lab 1, turn your findings into five risk scenarios and analyse the
              suspicious email.
            </li>
            <li>
              4. In Lab 2, rate each risk, pick your top two, recommend a control for each,
              and brief the practice manager.
            </li>
            <li>
              5. Download your report and submit it in the CVI Tracker.
            </li>
          </ol>
          <p className="mt-4 text-sm text-foreground">
            You can stop at any point and come back — your work is saved on this browser and
            restored when you return.
          </p>
        </Panel>

        <Panel title="Safety boundaries">
          <ul className="space-y-1 text-sm leading-relaxed text-foreground">
            {clinicProfile.boundaries.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="The clinic at a glance">
          <SystemDiagram />
          <div className="mt-4 grid gap-3 @3xl:grid-cols-2">
            {assets.map((a) => (
              <div key={a.id} className="rounded-md border border-border bg-background p-3">
                <p className="font-mono text-xs text-primary">{a.id}</p>
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.purpose}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-5 font-display text-sm text-foreground">
            Things that could go wrong here
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {threatEvents.map((t) => (
              <li key={t.id}>
                <span className="font-mono text-xs text-primary">{t.id}</span> {t.name} —{" "}
                {t.plain}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Investigate the clinic">
          <RoomBoard store={store} />
        </Panel>

        <CompletionSummary store={store} />

        <Week10Toolbar store={store} />
      </div>
    </DemoLabShell>
  );
}

/** Simple native system diagram. Described in text for screen readers. */
function SystemDiagram() {
  const boxes = [
    { x: 4, y: 10, label: "Staff laptops (9)" },
    { x: 37, y: 10, label: "Appointment system" },
    { x: 70, y: 10, label: "Public website" },
    { x: 20, y: 60, label: "Patient records" },
    { x: 56, y: 60, label: "Backup drive" },
  ];
  return (
    <figure>
      <svg
        viewBox="0 0 100 85"
        className="w-full rounded-md border border-border bg-background"
        role="img"
        aria-label="Diagram: staff laptops connect to the appointment system and to patient records. The patient records system copies to one backup drive attached to the reception workstation. The public website stands on its own and is not connected to patient records."
      >
        <line x1="17" y1="24" x2="49" y2="24" className="stroke-primary" strokeWidth="0.5" />
        <line x1="17" y1="24" x2="33" y2="60" className="stroke-primary" strokeWidth="0.5" />
        <line x1="33" y1="66" x2="69" y2="66" className="stroke-primary" strokeWidth="0.5" />
        {boxes.map((b) => (
          <g key={b.label}>
            <rect
              x={b.x}
              y={b.y}
              width="26"
              height="14"
              rx="1.5"
              className="fill-surface-raised stroke-border"
              strokeWidth="0.5"
            />
            <text
              x={b.x + 13}
              y={b.y + 8.5}
              textAnchor="middle"
              fontSize="3"
              className="fill-foreground"
            >
              {b.label}
            </text>
          </g>
        ))}
        <text x="83" y="34" textAnchor="middle" fontSize="2.6" className="fill-muted-foreground">
          no link to records
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Staff laptops reach the appointment system and patient records. Records copy to one
        attached backup drive. The public website is separate and holds no patient data.
      </figcaption>
    </figure>
  );
}
