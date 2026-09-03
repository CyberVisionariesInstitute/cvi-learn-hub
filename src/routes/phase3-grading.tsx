import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import {
  cohortGrading,
  studentDossier,
  upsertStageFeedback,
} from "@/lib/capstone/instructor.functions";
import {
  MARK_LABEL,
  STAGE_GROUPS,
  type FeedbackGroup,
  type Mark,
} from "@/lib/capstone/grading";

export const Route = createFileRoute("/phase3-grading")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 Grading Console — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Instructor grading console for the Phase 3 PKI Architect Capstone: Stage 1–4 progress, evidence review, and written feedback.",
      },
      { property: "og:title", content: "Phase 3 Grading Console — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "Stage 1–4 progress, evidence review, and written feedback for each student.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GradingConsole,
});

type Row = Awaited<ReturnType<typeof cohortGrading>>[number];

function GradingConsole() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const fetchCohort = useServerFn(cohortGrading);
  const [selected, setSelected] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);

  const cohort = useQuery({
    queryKey: ["phase3", "grading"],
    queryFn: () => fetchCohort({}),
    enabled: Boolean(session),
    retry: false,
  });

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth", search: { redirect: "/phase3-grading" }, replace: true });
    }
  }, [loading, session, navigate]);

  const rows = useMemo(
    () => (cohort.data ?? []).filter((r) => (showTest ? true : !r.isTest)),
    [cohort.data, showTest],
  );
  const active = rows.find((r) => r.projectId === selected) ?? null;

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <header>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor only</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Phase 3 Grading</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Stage 1–4 progress for every student, their evidence, and the feedback you leave them.
            Students see only the feedback written about their own project.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/phase3-console" className="text-primary underline">
              Phase 3 Console
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
          <section className="space-y-3" aria-label="Cohort progress">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No production assignments yet.</p>
            ) : null}
            {rows.map((row) => (
              <CohortRow
                key={row.assignmentId}
                row={row}
                expanded={Boolean(row.projectId) && row.projectId === selected}
                onToggle={() =>
                  setSelected(row.projectId === selected ? null : (row.projectId ?? null))
                }
              />
            ))}
          </section>
        ) : null}

        {active?.projectId ? (
          <DossierPanel row={active} onSaved={() => void cohort.refetch()} />
        ) : null}
      </div>
    </DemoLabShell>
  );
}

function CohortRow({
  row,
  expanded,
  onToggle,
}: {
  row: Row;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-foreground">
            {row.studentName}
            {row.isTest ? (
              <span className="ml-2 rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                QA
              </span>
            ) : null}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {row.scenarioCode} · v{row.scenarioVersion} ·{" "}
            {row.started ? `revision ${row.revision}` : "not started"}
            {row.updatedAt ? ` · updated ${new Date(row.updatedAt).toLocaleString()}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={!row.projectId}
          className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60 disabled:opacity-50"
          aria-expanded={expanded}
        >
          {expanded ? "Close review" : "Review evidence & feedback"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAGE_GROUPS.map((group) => {
          const p = row.progress.find((x) => x.key === group.key);
          const fb = row.feedback.find((f) => f.stage_group === group.key);
          const percent = p?.percent ?? 0;
          return (
            <div key={group.key} className="rounded-lg border border-border/70 p-3">
              <p className="text-xs tracking-[0.18em] text-primary uppercase">{group.label}</p>
              <p className="mt-1 text-sm text-foreground">{group.headline}</p>
              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded bg-border"
                role="img"
                aria-label={`${group.label} ${percent}% complete`}
              >
                <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {p ? `${percent}% · ${p.metrics.map((m) => `${m.label} ${m.value}`).join(" · ")}` : "Not started"}
              </p>
              {fb ? (
                <p className="mt-2 text-xs text-foreground">
                  Marked {MARK_LABEL[fb.mark as Mark]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Evidence {row.evidenceCount} · Checkpoints {row.checkpoints.length} · Events released{" "}
        {row.eventsActivated} (acknowledged {row.eventsAcknowledged}) · Submission{" "}
        {row.submission ? row.submission.review_state : "none"}
      </p>
    </article>
  );
}

function DossierPanel({ row, onSaved }: { row: Row; onSaved: () => void }) {
  const fetchDossier = useServerFn(studentDossier);
  const saveFeedback = useServerFn(upsertStageFeedback);
  const projectId = row.projectId!;

  const dossier = useQuery({
    queryKey: ["phase3", "dossier", projectId],
    queryFn: () => fetchDossier({ data: { projectId } }),
    retry: false,
  });

  const [group, setGroup] = useState<FeedbackGroup>("stage1");
  const [mark, setMark] = useState<Mark>("on_track");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const existing = dossier.data?.feedback.find((f) => f.stage_group === group);
    setMark((existing?.mark as Mark) ?? "on_track");
    setBody(existing?.body ?? "");
  }, [group, dossier.data]);

  return (
    <section
      className="rounded-xl border border-primary/30 bg-surface-raised/70 p-6"
      aria-label={`Review for ${row.studentName}`}
    >
      <h2 className="font-display text-xl text-foreground">Reviewing {row.studentName}</h2>

      {dossier.isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading student work…</p>
      ) : null}

      {dossier.data ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <Block title={`Evidence (${dossier.data.evidence.length})`}>
              {dossier.data.evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground">No evidence recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {dossier.data.evidence.map((e) => (
                    <li key={e.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="text-foreground">{e.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {e.stage} · {new Date(e.created_at).toLocaleString()}
                      </p>
                      {e.body ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">
                          {e.body}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title={`Decisions (${dossier.data.decisions.length})`}>
              {dossier.data.decisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {dossier.data.decisions.map((d) => (
                    <li key={d.id} className="border-t border-border/70 pt-2">
                      <p className="text-foreground">{d.title}</p>
                      {d.detail ? (
                        <p className="text-xs text-muted-foreground">{d.detail}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title={`Workload runs (${dossier.data.runs.length})`}>
              {dossier.data.runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No runs yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {dossier.data.runs.slice(0, 12).map((r) => (
                    <li key={r.id} className="flex flex-wrap justify-between gap-2">
                      <span className="text-foreground">
                        {r.definitionId} · {r.result}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.failures.length ? r.failures.join(", ") : "all checks passed"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <Block title={`Checkpoints (${dossier.data.checkpoints.length})`}>
              {dossier.data.checkpoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">No checkpoints submitted.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {dossier.data.checkpoints.map((c) => (
                    <li key={c.id} className="flex flex-wrap justify-between gap-2">
                      <span className="text-foreground">{c.stage}</span>
                      <span className="text-xs text-muted-foreground">{c.review_state}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Block>
          </div>

          <div>
            <Block title="Leave feedback">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-muted-foreground">Stage</span>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as FeedbackGroup)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    {STAGE_GROUPS.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label} — {g.headline}
                      </option>
                    ))}
                    <option value="overall">Overall</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Mark</span>
                  <select
                    value={mark}
                    onChange={(e) => setMark(e.target.value as Mark)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    {(Object.keys(MARK_LABEL) as Mark[]).map((m) => (
                      <option key={m} value={m}>
                        {MARK_LABEL[m]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="text-muted-foreground">Feedback to the student</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
                  placeholder="What is strong, what to strengthen, what to prove next."
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setStatus(null);
                    try {
                      await saveFeedback({
                        data: {
                          projectId,
                          assignmentId: row.assignmentId,
                          ownerId: row.studentId,
                          stageGroup: group,
                          mark,
                          body,
                        },
                      });
                      setStatus("Feedback saved. The student can see it in their workspace.");
                      await dossier.refetch();
                      onSaved();
                    } catch (err) {
                      setStatus(err instanceof Error ? err.message : "Save failed.");
                    }
                  }}
                  className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Save feedback
                </button>
                {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
              </div>
            </Block>
          </div>
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
