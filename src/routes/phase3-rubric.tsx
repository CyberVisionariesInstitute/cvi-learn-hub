import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import { rubricCohort } from "@/lib/capstone/defense.functions";

export const Route = createFileRoute("/phase3-rubric")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 Capstone Rubric — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Instructor view of the approved 100-point Phase 3 PKI Architect Capstone rubric: nine categories mapped to Stage 1–4 checkpoints, with a scored row for every student.",
      },
      { property: "og:title", content: "Phase 3 Capstone Rubric — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "The approved 100-point rubric, scored per student from project evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RubricConsole,
});

function RubricConsole() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const fetchCohort = useServerFn(rubricCohort);
  const [showTest, setShowTest] = useState(false);

  const cohort = useQuery({
    queryKey: ["phase3", "rubric"],
    queryFn: () => fetchCohort({}),
    enabled: Boolean(session),
    retry: false,
  });

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth", search: { redirect: "/phase3-rubric" }, replace: true });
    }
  }, [loading, session, navigate]);

  const rows = useMemo(
    () => (cohort.data?.rows ?? []).filter((r) => (showTest ? true : !r.isTest)),
    [cohort.data, showTest],
  );

  const rubric = cohort.data?.rubric;

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <header>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor only</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Capstone Rubric</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            The approved 100-point capstone rubric — the same nine categories and weights students
            see in the Student Guide. Stage 1–4 evidence pre-fills each category; the defense panel
            can override any category up to its maximum. Defense quality is scored inside Evidence
            &amp; presentation and Professional practice &amp; milestones, never on top of 100.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/phase3-grading" className="text-primary underline">
              Grading console
            </Link>
            <Link to="/phase3-defense" className="text-primary underline">
              Defense stage
            </Link>
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={showTest}
                onChange={(e) => setShowTest(e.target.checked)}
                className="size-4"
              />
              Include QA/test assignments
            </label>
          </div>
        </header>

        {cohort.isError ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-foreground">
            This console is limited to instructor accounts.
          </p>
        ) : null}
        {cohort.isLoading ? <p className="text-sm text-muted-foreground">Loading rubric…</p> : null}

        {cohort.data ? (
          <section className="space-y-3" aria-label="Cohort rubric scores">
            <h2 className="font-display text-xl text-foreground">
              Cohort scoring ({rubric?.maxPoints} points total)
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments to score yet.</p>
            ) : null}
            {rows.map((row) => (
              <article
                key={row.assignmentId}
                className="rounded-xl border border-border bg-surface/80 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-foreground">
                      {row.studentName}
                      {row.isTest ? (
                        <span className="ml-2 rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          QA
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.scenarioCode} · v{row.scenarioVersion} ·{" "}
                      {row.started ? "in progress" : "not started"} · defense{" "}
                      {row.outcome.replace(/_/g, " ")}
                    </p>
                  </div>
                  <p className="font-display text-2xl text-foreground">
                    {row.score ? `${row.score.total} / ${row.score.maxPoints}` : "—"}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {row.score ? `${row.score.percent}%` : ""}
                    </span>
                  </p>
                </div>

                {row.score ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {row.score.byCategory.map((c) => {
                      const label =
                        rubric?.categories.find((x) => x.key === c.category)?.area ?? c.category;
                      return (
                        <div key={c.category} className="rounded-lg border border-border/70 p-3">
                          <p className="text-xs text-primary">{label}</p>
                          <p className="mt-1 text-sm text-foreground">
                            {c.points} / {c.maxPoints} pts
                          </p>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-border">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.round((c.points / c.maxPoints) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No project yet — scoring begins at the student's first save.
                  </p>
                )}
              </article>
            ))}
          </section>
        ) : null}

        {rubric ? (
          <section className="space-y-3" aria-label="Rubric definition">
            <h2 className="font-display text-xl text-foreground">
              Rubric definition ({rubric.maxPoints} points)
            </h2>
            <ul className="space-y-3">
              {rubric.criteria.map((c) => (
                <li key={c.id} className="rounded-xl border border-border bg-surface/70 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base text-foreground">{c.label}</h3>
                    <p className="text-sm text-muted-foreground">{c.points} pts</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.checkpoint}</p>
                  <p className="mt-2 text-sm text-foreground/80">{c.descriptor}</p>
                  {c.defenseWeighted ? (
                    <p className="mt-2 text-xs text-primary">Scored live at the defense</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </DemoLabShell>
  );
}
