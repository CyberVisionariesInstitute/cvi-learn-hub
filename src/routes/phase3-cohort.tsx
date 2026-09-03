import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import { rubricCohort } from "@/lib/capstone/defense.functions";

export const Route = createFileRoute("/phase3-cohort")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 Cohort Console — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Instructor cohort console: every production Phase 3 capstone assignment with rubric score, defense submission state, and pending grading work.",
      },
      { property: "og:title", content: "Phase 3 Cohort Console — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "All capstone assignments, rubric scores, defense submissions, and pending grades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CohortConsole,
});

type Row = Awaited<ReturnType<typeof rubricCohort>>["rows"][number];

function submissionLabel(row: Row): { text: string; tone: "muted" | "warn" | "ok" } {
  if (!row.submission) return { text: "Not submitted", tone: "muted" };
  const state = row.submission.review_state ?? "submitted";
  if (state === "approved") return { text: "Submission approved", tone: "ok" };
  if (state === "changes_requested") return { text: "Changes requested", tone: "warn" };
  return { text: "Awaiting review", tone: "warn" };
}

function gradeLabel(row: Row): { text: string; tone: "muted" | "warn" | "ok" } {
  if (row.finalizedAt) return { text: `Finalized · ${row.outcome.replace(/_/g, " ")}`, tone: "ok" };
  if (row.scheduledAt) return { text: "Defense scheduled · grade pending", tone: "warn" };
  if (row.submission) return { text: "Grade pending", tone: "warn" };
  return { text: "Not yet gradable", tone: "muted" };
}

const toneClass = {
  muted: "border-border text-muted-foreground",
  warn: "border-primary/50 bg-primary/10 text-foreground",
  ok: "border-emerald-500/50 bg-emerald-500/10 text-foreground",
} as const;

function CohortConsole() {
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
      void navigate({ to: "/auth", search: { redirect: "/phase3-cohort" }, replace: true });
    }
  }, [loading, session, navigate]);

  const rows = useMemo(
    () => (cohort.data?.rows ?? []).filter((r) => (showTest ? true : !r.isTest)),
    [cohort.data, showTest],
  );

  const maxPoints = cohort.data?.rubric.maxPoints ?? 100;
  const started = rows.filter((r) => r.started).length;
  const submitted = rows.filter((r) => r.submission).length;
  const pending = rows.filter((r) => !r.finalizedAt && (r.submission || r.scheduledAt)).length;
  const finalized = rows.filter((r) => r.finalizedAt).length;

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <header>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor only</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Cohort Console</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Every capstone assignment in one place: assigned scenario, current 100-point rubric
            score, defense submission state, and what is still waiting on a grade.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/phase3-console" className="text-primary underline">
              Instructor console
            </Link>
            <Link to="/phase3-grading" className="text-primary underline">
              Grading console
            </Link>
            <Link to="/phase3-rubric" className="text-primary underline">
              Rubric
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
        {cohort.isLoading ? <p className="text-sm text-muted-foreground">Loading cohort…</p> : null}

        {cohort.data ? (
          <>
            <section
              aria-label="Cohort summary"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              {[
                { label: "Assignments", value: rows.length },
                { label: "Started", value: started },
                { label: "Submitted", value: submitted },
                { label: "Pending grades", value: pending },
                { label: "Finalized", value: finalized },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-surface/80 p-4">
                  <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-2xl text-foreground">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3" aria-label="Assignments">
              <h2 className="font-display text-xl text-foreground">Assignments</h2>
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No assignments yet.</p>
              ) : null}
              {rows.map((row) => {
                const sub = submissionLabel(row);
                const grade = gradeLabel(row);
                return (
                  <article
                    key={row.assignmentId}
                    className="rounded-xl border border-border bg-surface/80 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
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
                          {row.started ? "in progress" : "not started"}
                          {row.updatedAt
                            ? ` · last saved ${new Date(row.updatedAt).toLocaleDateString()}`
                            : ""}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full border px-3 py-1 ${toneClass[sub.tone]}`}>
                            {sub.text}
                          </span>
                          <span className={`rounded-full border px-3 py-1 ${toneClass[grade.tone]}`}>
                            {grade.text}
                          </span>
                          {row.scheduledAt ? (
                            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                              Defense {new Date(row.scheduledAt).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-2xl text-foreground">
                          {row.score ? `${row.score.total} / ${row.score.maxPoints}` : `— / ${maxPoints}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {row.score ? `${row.score.percent}%` : "not scored"}
                        </p>
                        {row.projectId ? (
                          <div className="mt-2 flex flex-wrap justify-end gap-3 text-sm">
                            <Link to="/phase3-grading" className="text-primary underline">
                              Review
                            </Link>
                            <Link to="/phase3-defense" className="text-primary underline">
                              Defense
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {row.score ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {row.score.byCategory.map((c) => {
                          const label =
                            cohort.data.rubric.categories.find((x) => x.key === c.category)?.area ??
                            c.category;
                          return (
                            <div key={c.category} className="rounded-lg border border-border/70 p-2">
                              <p className="text-xs text-primary">{label}</p>
                              <p className="text-sm text-foreground">
                                {c.points} / {c.maxPoints}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {row.submission?.defense_notes ? (
                      <p className="mt-3 rounded-lg border border-border/70 p-3 text-sm text-foreground/80">
                        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                          Student defense notes
                        </span>
                        <br />
                        {row.submission.defense_notes}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </section>
          </>
        ) : null}
      </div>
    </DemoLabShell>
  );
}
