import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import { defensePanel, rubricCohort, saveDefenseRecord } from "@/lib/capstone/defense.functions";
import { reviewSubmission } from "@/lib/capstone/instructor.functions";

export const Route = createFileRoute("/phase3-defense")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 Capstone Defense — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Instructor defense stage for the Phase 3 PKI Architect Capstone: review the submission, run the defense presentation, and record the final rubric grade.",
      },
      { property: "og:title", content: "Phase 3 Capstone Defense — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "Submission review, defense presentation record, and the final grading panel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DefenseConsole,
});

const OUTCOMES = [
  { value: "pending", label: "Pending" },
  { value: "pass", label: "Pass" },
  { value: "pass_with_conditions", label: "Pass with conditions" },
  { value: "revise", label: "Revise and re-defend" },
  { value: "fail", label: "Fail" },
] as const;

type Outcome = (typeof OUTCOMES)[number]["value"];

function DefenseConsole() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const fetchCohort = useServerFn(rubricCohort);
  const [showTest, setShowTest] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const cohort = useQuery({
    queryKey: ["phase3", "defense-cohort"],
    queryFn: () => fetchCohort({}),
    enabled: Boolean(session),
    retry: false,
  });

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth", search: { redirect: "/phase3-defense" }, replace: true });
    }
  }, [loading, session, navigate]);

  const rows = useMemo(
    () => (cohort.data?.rows ?? []).filter((r) => (showTest ? true : !r.isTest)),
    [cohort.data, showTest],
  );
  const active = rows.find((r) => r.projectId === selected) ?? null;

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <header>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor only</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Capstone Defense</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Submission review, the live defense presentation record, and the final rubric grade.
            Nothing on this page is visible to students; return written feedback through the
            grading console.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/phase3-cohort" className="text-primary underline">
              Cohort console
            </Link>
            <Link to="/phase3-rubric" className="text-primary underline">
              Rubric
            </Link>
            <Link to="/phase3-grading" className="text-primary underline">
              Grading console
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
          <section className="space-y-3" aria-label="Defense queue">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : null}
            {rows.map((row) => (
              <article
                key={row.assignmentId}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-surface/80 p-5"
              >
                <div>
                  <h2 className="font-display text-lg text-foreground">{row.studentName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.scenarioCode} · v{row.scenarioVersion} · submission{" "}
                    {row.submission ? row.submission.review_state : "not submitted"} · defense{" "}
                    {row.outcome.replace(/_/g, " ")}
                    {row.finalizedAt ? " (finalized)" : ""}
                  </p>
                  {row.score ? (
                    <p className="mt-1 text-sm text-foreground">
                      Rubric {row.score.total} / {row.score.maxPoints} ({row.score.percent}%)
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!row.projectId}
                  onClick={() =>
                    setSelected(row.projectId === selected ? null : (row.projectId ?? null))
                  }
                  aria-expanded={Boolean(row.projectId) && row.projectId === selected}
                  className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60 disabled:opacity-50"
                >
                  {Boolean(row.projectId) && row.projectId === selected
                    ? "Close panel"
                    : "Open defense panel"}
                </button>
              </article>
            ))}
          </section>
        ) : null}

        {active?.projectId ? (
          <Panel
            key={active.projectId}
            projectId={active.projectId}
            studentName={active.studentName}
            onSaved={() => void cohort.refetch()}
          />
        ) : null}
      </div>
    </DemoLabShell>
  );
}

function Panel({
  projectId,
  studentName,
  onSaved,
}: {
  projectId: string;
  studentName: string;
  onSaved: () => void;
}) {
  const fetchPanel = useServerFn(defensePanel);
  const save = useServerFn(saveDefenseRecord);
  const review = useServerFn(reviewSubmission);

  const panel = useQuery({
    queryKey: ["phase3", "defense", projectId],
    queryFn: () => fetchPanel({ data: { projectId } }),
    retry: false,
  });

  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [questions, setQuestions] = useState<Array<{ question: string; response: string }>>([]);
  const [outcome, setOutcome] = useState<Outcome>("pending");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const d = panel.data;
    if (!d) return;
    setScores(d.record?.scores ?? {});
    setNotes(d.record?.presentationNotes ?? "");
    setScheduledAt(d.record?.scheduledAt ? d.record.scheduledAt.slice(0, 16) : "");
    setQuestions(d.record?.panelQuestions ?? []);
    setOutcome((d.record?.outcome as Outcome) ?? "pending");
  }, [panel.data]);

  const rubric = panel.data?.rubric;
  const score = panel.data?.score;

  const effective = (id: string, points: number) => {
    if (typeof scores[id] === "number") return scores[id];
    const auto = score?.criteria.find((c) => c.id === id)?.autoPoints;
    return typeof auto === "number" ? auto : 0;
  };

  const total = useMemo(() => {
    if (!rubric) return 0;
    return rubric.criteria.reduce((sum, c) => sum + effective(c.id, c.points), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rubric, scores, score]);

  async function persist(finalize: boolean) {
    setStatus(null);
    const d = panel.data;
    if (!d) return;
    try {
      const res = await save({
        data: {
          projectId,
          assignmentId: d.project.assignmentId,
          ownerId: d.project.ownerId,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          presentationNotes: notes,
          panelQuestions: questions.filter((q) => q.question.trim() || q.response.trim()),
          scores,
          outcome,
          finalize,
        },
      });
      setStatus(
        finalize
          ? `Defense finalized at ${res.total} / ${res.maxPoints} (${res.percent}%).`
          : `Saved. Current total ${res.total} / ${res.maxPoints}.`,
      );
      await panel.refetch();
      onSaved();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <section
      className="rounded-xl border border-primary/30 bg-surface-raised/70 p-6"
      aria-label={`Defense panel for ${studentName}`}
    >
      <h2 className="font-display text-xl text-foreground">Defense panel — {studentName}</h2>
      {panel.isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading defense record…</p>
      ) : null}

      {panel.data ? (
        <div className="mt-5 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Block title="Submission">
              {panel.data.submission ? (
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    Submitted {new Date(panel.data.submission.submitted_at).toLocaleString()} ·
                    state {panel.data.submission.review_state}
                  </p>
                  {panel.data.submission.defense_notes ? (
                    <p className="whitespace-pre-wrap text-foreground/85">
                      {panel.data.submission.defense_notes}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">No defense notes from the student.</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(["in_review", "returned", "accepted"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={async () => {
                          setStatus(null);
                          try {
                            await review({
                              data: { id: panel.data!.submission!.id, reviewState: s },
                            });
                            await panel.refetch();
                            onSaved();
                          } catch (err) {
                            setStatus(err instanceof Error ? err.message : "Update failed.");
                          }
                        }}
                        className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:border-primary/60"
                      >
                        Mark {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The student has not submitted yet. Revision {panel.data.project.revision} ·{" "}
                  {panel.data.evidenceCount} evidence items on file.
                </p>
              )}
            </Block>

            <Block title="Defense presentation">
              <label className="block text-sm">
                <span className="text-muted-foreground">Scheduled</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="text-muted-foreground">Presentation notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="How the walkthrough went, what was demonstrated live, what was missing."
                  className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>

              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">Panel questions</p>
                {questions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <input
                      value={q.question}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)),
                        )
                      }
                      placeholder="Question asked"
                      aria-label={`Question ${i + 1}`}
                      className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
                    />
                    <textarea
                      value={q.response}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, response: e.target.value } : x)),
                        )
                      }
                      rows={2}
                      placeholder="How the student answered"
                      aria-label={`Response ${i + 1}`}
                      className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))}
                      className="mt-2 min-h-11 text-xs text-muted-foreground underline"
                    >
                      Remove question
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => [...prev, { question: "", response: "" }])}
                  className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
                >
                  Add question
                </button>
              </div>
            </Block>
          </div>

          <Block title={`Final grading panel — ${total} / ${rubric?.maxPoints ?? 0}`}>
            <p className="text-sm text-muted-foreground">
              The approved 100-point rubric. Each category is pre-filled from the evidence in the
              student's project; override any category with the panel's judgement, capped at its
              approved maximum. Defense presentation quality is scored inside Evidence &amp;
              presentation and Professional practice &amp; milestones — no points are added beyond
              100.
            </p>
            <ul className="mt-4 space-y-3">
              {(rubric?.criteria ?? []).map((c) => {
                const auto = score?.criteria.find((x) => x.id === c.id)?.autoPoints ?? null;
                return (
                  <li key={c.id} className="rounded-lg border border-border/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-[16rem] flex-1">
                        <p className="text-sm text-foreground">
                          {c.label}
                          {c.defenseWeighted ? (
                            <span className="ml-2 rounded border border-primary/40 px-2 py-0.5 text-xs text-primary">
                              defense
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.checkpoint} · {c.descriptor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">
                          <span className="sr-only">{c.label} points</span>
                          <input
                            type="number"
                            min={0}
                            max={c.points}
                            value={effective(c.id, c.points)}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [c.id]: Math.max(0, Math.min(c.points, Number(e.target.value) || 0)),
                              }))
                            }
                            className="min-h-11 w-20 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                          />
                        </label>
                        <span className="text-xs text-muted-foreground">
                          / {c.points}
                          {auto !== null ? ` · auto ${auto}` : ""}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>


            <div className="mt-5 flex flex-wrap items-end gap-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">Outcome</span>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as Outcome)}
                  className="mt-1 min-h-11 rounded-md border border-border bg-background px-2 text-foreground"
                >
                  {OUTCOMES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void persist(false)}
                className="min-h-11 rounded-md border border-border px-5 text-sm text-foreground hover:border-primary/60"
              >
                Save defense record
              </button>
              <button
                type="button"
                onClick={() => void persist(true)}
                className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Finalize grade
              </button>
              {panel.data.record?.finalizedAt ? (
                <p className="text-sm text-muted-foreground">
                  Finalized {new Date(panel.data.record.finalizedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            {status ? <p className="mt-3 text-sm text-foreground">{status}</p> : null}
          </Block>
        </div>
      ) : null}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-4">
      <h3 className="font-display text-base text-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
