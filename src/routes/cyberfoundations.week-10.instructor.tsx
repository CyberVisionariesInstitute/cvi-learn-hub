import { createFileRoute, isRedirect, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/week10/ui";
import { RoomBoard } from "@/components/week10/RoomBoard";
import { Lab1 } from "@/components/week10/Lab1";
import { Lab2 } from "@/components/week10/Lab2";
import { Week10Toolbar } from "@/components/week10/Week10Toolbar";
import { useWeek10 } from "@/lib/week10/useWeek10";
import { getWeek10InstructorKey } from "@/lib/week10/week10-instructor.functions";
import { roomById, WEEK10_ROUTES } from "@/lib/week10/case-packet";
import type { Week10InstructorKey } from "@/lib/week10/instructor-key.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cyberfoundations/week-10/instructor")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Week 10 Instructor View — CVI Demo Lab" },
      {
        name: "description",
        content:
          "Facilitation guide and answer register for the Cloud Heights Family Clinic risk investigation.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const toAuth = () =>
      redirect({ to: "/auth", search: { redirect: location.href }, replace: true });

    // A protected server function without a bearer token throws before the
    // page can render, so confirm a client session exists first.
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw toAuth();
    try {
      await getWeek10InstructorKey({});
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw toAuth();
    }
  },
  component: Week10InstructorPage,
});

const tabs = [
  { id: "run", label: "Run of show" },
  { id: "rooms", label: "Room guide & presentation" },
  { id: "answers", label: "Answer register" },
  { id: "rubric", label: "Rubric & misconceptions" },
  { id: "demo", label: "My demonstration workspace" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Week10InstructorPage() {
  const [key, setKey] = useState<Week10InstructorKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("run");

  useEffect(() => {
    let active = true;
    void getWeek10InstructorKey({})
      .then((data) => active && setKey(data))
      .catch(() => active && setError("Instructor material could not be loaded."));
    return () => {
      active = false;
    };
  }, []);

  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8">
        <Panel eyebrow="Instructor view · Module 4 · Week 10">
          <h1 className="font-display text-3xl text-foreground">
            Cloud Heights Family Clinic — facilitation
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground">
            Everything on this page is served only after a server-side check of your
            instructor role. It is not included in any student download and is not reachable
            without a signed-in staff session.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link
              to={WEEK10_ROUTES.overview}
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Student overview
            </Link>
            <Link
              to="/instructor"
              className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
            >
              Instructor Console
            </Link>
          </div>
        </Panel>

        <nav aria-label="Instructor sections" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                tab === t.id
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {error ? (
          <Panel title="Instructor material unavailable">
            <p className="text-sm text-foreground">{error}</p>
          </Panel>
        ) : !key ? (
          <Panel>
            <p role="status" className="text-sm text-muted-foreground">
              Loading instructor material…
            </p>
          </Panel>
        ) : tab === "run" ? (
          <RunOfShow data={key} />
        ) : tab === "rooms" ? (
          <RoomGuides data={key} />
        ) : tab === "answers" ? (
          <AnswerRegister data={key} />
        ) : tab === "rubric" ? (
          <RubricView data={key} />
        ) : (
          <DemoWorkspace />
        )}
      </div>
    </DemoLabShell>
  );
}

function RunOfShow({ data }: { data: Week10InstructorKey }) {
  return (
    <>
      <Panel title="Grading stance">
        <ul className="space-y-1 text-sm leading-relaxed text-foreground">
          {data.gradingStance.map((g, i) => (
            <li key={i}>• {g}</li>
          ))}
        </ul>
      </Panel>
      <Panel title="Run of show">
        <ol className="space-y-3">
          {data.runOfShow.map((seg) => (
            <li key={seg.segment} className="rounded-md border border-border bg-background p-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {seg.minutes} min
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{seg.segment}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{seg.detail}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}

/** Presentation mode: reveal evidence interpretations one room at a time. */
function RoomGuides({ data }: { data: Week10InstructorKey }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const toggle = (id: string) =>
    setRevealed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      <Panel title="Presentation mode">
        <p className="text-sm text-muted-foreground">
          Reveals are deliberate: ask for a prediction first, then open the interpretation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRevealed([])}
            className="min-h-11 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-primary/60"
          >
            Hide all reveals
          </button>
          <button
            type="button"
            onClick={() =>
              setRevealed(data.rooms.flatMap((r) => r.reveals.map((x) => x.evidenceId)))
            }
            className="min-h-11 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-primary/60"
          >
            Reveal everything
          </button>
        </div>
      </Panel>

      {data.rooms.map((guide) => {
        const room = roomById(guide.roomId as never);
        return (
          <Panel key={guide.roomId} eyebrow="Room" title={room.name}>
            <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Ask before revealing
              </p>
              <p className="mt-1 text-sm text-foreground">{guide.facilitatorPrompt}</p>
            </div>
            <div className="mt-3 rounded-md border border-border bg-background p-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Say this
              </p>
              <p className="mt-1 text-sm text-foreground">{guide.sayThis}</p>
            </div>

            <h3 className="mt-4 font-display text-sm text-foreground">
              Evidence → interpretation
            </h3>
            <ul className="mt-2 space-y-2">
              {guide.reveals.map((r) => {
                const open = revealed.includes(r.evidenceId);
                return (
                  <li key={r.evidenceId} className="rounded-md border border-border bg-background p-3">
                    <button
                      type="button"
                      onClick={() => toggle(r.evidenceId)}
                      aria-expanded={open}
                      className="min-h-11 text-left font-mono text-xs text-primary"
                    >
                      {r.evidenceId} — {open ? "hide interpretation" : "reveal interpretation"}
                    </button>
                    {open ? (
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        {r.interpretation}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-sm text-foreground">
              <strong>CIA link:</strong> {guide.ciaLink}
            </p>

            <h3 className="mt-4 font-display text-sm text-foreground">
              Common wrong answers and corrections
            </h3>
            <ul className="mt-2 space-y-2">
              {guide.misconceptions.map((m, i) => (
                <li key={i} className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm">
                  <p className="font-medium text-foreground">{m.wrong}</p>
                  <p className="mt-1 text-foreground">{m.correction}</p>
                </li>
              ))}
            </ul>

            <h3 className="mt-4 font-display text-sm text-foreground">Ready to advance when</h3>
            <ul className="mt-1 space-y-1 text-sm text-foreground">
              {guide.readyToAdvance.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </>
  );
}

function AnswerRegister({ data }: { data: Week10InstructorKey }) {
  return (
    <>
      <Panel title="Worked answer register">
        <p className="text-sm text-muted-foreground">
          Model answers, not the only answers. Grade the reasoning.
        </p>
        <div className="mt-3 space-y-4">
          {data.answerRegister.map((row) => (
            <div key={row.scenarioId} className="rounded-lg border border-border bg-background p-4">
              <p className="font-display text-sm text-foreground">
                <span className="font-mono text-xs text-primary">{row.scenarioId}</span>{" "}
                {row.asset}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Evidence: {row.evidenceIds.join(", ")}
              </p>
              <dl className="mt-3 space-y-2 text-sm text-foreground">
                {(
                  [
                    ["Threat / event", row.threat],
                    ["Vulnerability", row.vulnerability],
                    ["Consequence", row.consequence],
                    ["CIA", row.cia],
                    ["Unknown", row.unknown],
                    [`Likelihood ${row.likelihood.value}`, row.likelihood.why],
                    [`Impact ${row.impact.value}`, row.impact.why],
                    ["Control", row.control],
                    ["How it helps", row.howItHelps],
                    ["Residual risk", row.residual],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-medium">{label}</dt>
                    <dd className="leading-relaxed">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 rounded-md border border-primary/40 bg-primary/10 p-3">
                <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Also acceptable
                </p>
                <ul className="mt-1 space-y-1 text-sm text-foreground">
                  {row.acceptableAlternatives.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Email analysis — answer">
        <ol className="space-y-1 text-sm text-foreground">
          {data.emailAnswer.signs.map((s, i) => (
            <li key={i}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-foreground">
          <strong>Safe step:</strong> {data.emailAnswer.safeStep}
        </p>
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
          <strong>What it does not prove:</strong> {data.emailAnswer.proofBoundary}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-foreground">
          {data.emailAnswer.acceptableAlternatives.map((a, i) => (
            <li key={i}>• {a}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Sample owner briefing">
        <p className="text-sm leading-relaxed text-foreground">{data.sampleBriefing}</p>
      </Panel>
    </>
  );
}

function RubricView({ data }: { data: Week10InstructorKey }) {
  return (
    <>
      <Panel title="Rubric">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr>
                {["Criterion", "Look for", "Strong", "Developing"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border border-border p-2 text-left text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rubric.map((r) => (
                <tr key={r.criterion}>
                  <th scope="row" className="border border-border p-2 text-left text-foreground">
                    {r.criterion}
                  </th>
                  <td className="border border-border p-2 text-foreground">{r.lookFor}</td>
                  <td className="border border-border p-2 text-foreground">{r.strong}</td>
                  <td className="border border-border p-2 text-foreground">{r.developing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Misconceptions by room">
        {data.rooms.map((room) => (
          <div key={room.roomId} className="mt-3 first:mt-0">
            <h3 className="font-display text-sm text-foreground">
              {roomById(room.roomId as never).name}
            </h3>
            <ul className="mt-1 space-y-2">
              {room.misconceptions.map((m, i) => (
                <li key={i} className="rounded-md border border-border bg-background p-3 text-sm">
                  <p className="font-medium text-foreground">{m.wrong}</p>
                  <p className="mt-1 text-foreground">{m.correction}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Panel>
    </>
  );
}

/** Instructor demonstration workspace — stored in its own slot. */
function DemoWorkspace() {
  const store = useWeek10(true);
  return (
    <>
      <Panel title="Demonstration workspace">
        <p className="text-sm text-foreground">
          This is the student experience, saved to an instructor demonstration slot. Nothing
          typed here can reach or overwrite a student's saved work, and resetting here clears
          only this slot.
        </p>
      </Panel>
      <RoomBoard store={store} />
      <Lab1 store={store} />
      <Lab2 store={store} />
      <Week10Toolbar store={store} />
    </>
  );
}
