import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import {
  assignScenario,
  instructorOverview,
  listCheckpoints,
  listScenarioEvents,
  readAuditLog,
  releaseScenarioEvent,
  reviewCheckpoint,
  reviewSubmission,
} from "@/lib/capstone/instructor.functions";

export const Route = createFileRoute("/phase3-console")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Phase 3 Instructor Console — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Instructor controls for the Phase 3 PKI Architect Capstone: assignments, change events, reviews, and audit trail.",
      },
      { property: "og:title", content: "Phase 3 Instructor Console — CyberVisionaries Institute" },
      {
        property: "og:description",
        content: "Assignments, change events, reviews, and audit trail for Phase 3.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Phase3Console,
});

function Phase3Console() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const fetchOverview = useServerFn(instructorOverview);
  const fetchAudit = useServerFn(readAuditLog);
  const runAssign = useServerFn(assignScenario);
  const runReview = useServerFn(reviewSubmission);

  const overview = useQuery({
    queryKey: ["phase3", "instructor"],
    queryFn: () => fetchOverview({}),
    enabled: Boolean(session),
    retry: false,
  });
  const audit = useQuery({
    queryKey: ["phase3", "audit"],
    queryFn: () => fetchAudit({}),
    enabled: Boolean(session) && overview.isSuccess,
    retry: false,
  });

  const [studentId, setStudentId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth", search: { redirect: "/phase3-console" }, replace: true });
    }
  }, [loading, session, navigate]);

  const nameOf = (id: string) => {
    const p = overview.data?.profiles.find((x) => x.id === id);
    return p?.display_name || p?.email || id.slice(0, 8);
  };

  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <header>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor only</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Phase 3 Console</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Assignments, change events, submission review, and the audit trail.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/phase3-cohort" className="text-primary underline">
              Cohort console
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
          </div>
        </header>

        {overview.isError ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-foreground">
            This console is limited to instructor accounts.{" "}
            <Link to="/pki/capstone" className="underline">
              Back to the capstone workspace
            </Link>
            .
          </p>
        ) : null}

        {overview.data ? (
          <>
            <section className="rounded-xl border border-border bg-surface/80 p-6">
              <h2 className="font-display text-lg text-foreground">Assign a scenario</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One active scenario per student. Version is locked at assignment time.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className="text-muted-foreground">Student</span>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    <option value="">Select…</option>
                    {overview.data.profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name || p.email || p.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Released scenario</span>
                  <select
                    value={scenarioId}
                    onChange={(e) => setScenarioId(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    <option value="">Select…</option>
                    {overview.data.scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.title} · v{s.version}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      try {
                        await runAssign({
                          data: { studentId, scenarioPackageId: scenarioId },
                        });
                        await overview.refetch();
                        setStudentId("");
                        setScenarioId("");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Assignment failed.");
                      }
                    }}
                    disabled={!studentId || !scenarioId}
                    className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

              <ul className="mt-6 space-y-2">
                {overview.data.assignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                  >
                    <span className="text-foreground">{nameOf(a.user_id)}</span>
                    <span className="text-muted-foreground">
                      {a.scenario_code} · v{a.scenario_version} · {a.state}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <EventsSection
              assignments={overview.data.assignments}
              nameOf={nameOf}
              onChanged={() => void overview.refetch()}
            />

            <CheckpointsSection nameOf={nameOf} />


            <section className="rounded-xl border border-border bg-surface/80 p-6">
              <h2 className="font-display text-lg text-foreground">Submissions</h2>
              <ul className="mt-4 space-y-3">
                {overview.data.submissions.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No submissions yet.</li>
                ) : (
                  overview.data.submissions.map((s) => (
                    <li key={s.id} className="rounded-lg border border-border p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-foreground">{nameOf(s.owner_id)}</span>
                        <span className="text-muted-foreground">
                          {new Date(s.submitted_at).toLocaleString()} · {s.review_state}
                        </span>
                      </div>
                      {s.defense_notes ? (
                        <p className="mt-2 whitespace-pre-line text-foreground/90">
                          {s.defense_notes}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(["in_review", "returned", "accepted"] as const).map((next) => (
                          <button
                            key={next}
                            type="button"
                            onClick={async () => {
                              await runReview({ data: { id: s.id, reviewState: next } });
                              await overview.refetch();
                            }}
                            className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Mark {next.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-surface/80 p-6">
              <h2 className="font-display text-lg text-foreground">Audit trail</h2>
              <ul className="mt-4 space-y-1 text-sm">
                {(audit.data ?? []).map((entry) => (
                  <li key={entry.id} className="flex flex-wrap gap-3 text-muted-foreground">
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                    <span className="text-foreground">{entry.action}</span>
                    <span>{entry.actor_id ? nameOf(entry.actor_id) : "system"}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </DemoLabShell>
  );
}

function EventsSection({
  assignments,
  nameOf,
  onChanged,
}: {
  assignments: { id: string; user_id: string; scenario_code: string; state: string }[];
  nameOf: (id: string) => string;
  onChanged: () => void;
}) {
  const [assignmentId, setAssignmentId] = useState("");
  const fetchEvents = useServerFn(listScenarioEvents);
  const runRelease = useServerFn(releaseScenarioEvent);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const events = useQuery({
    queryKey: ["phase3", "events", assignmentId],
    queryFn: () => fetchEvents({ data: { assignmentId } }),
    enabled: Boolean(assignmentId),
    retry: false,
  });

  return (
    <section className="rounded-xl border border-border bg-surface/80 p-6">
      <h2 className="font-display text-lg text-foreground">Change &amp; incident events</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Events come from the authored scenario package at the student&apos;s pinned version. They
        stay invisible to the student until you release them.
      </p>

      <label className="mt-4 block max-w-md text-sm">
        <span className="text-muted-foreground">Assignment</span>
        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
        >
          <option value="">Select…</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {nameOf(a.user_id)} · {a.scenario_code} · {a.state}
            </option>
          ))}
        </select>
      </label>

      {err ? <p className="mt-3 text-sm text-destructive">{err}</p> : null}

      <ul className="mt-5 space-y-3">
        {(events.data ?? []).map((e) => (
          <li key={e.key} className="rounded-lg border border-border p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-foreground">
                  {e.title}{" "}
                  <span className="text-xs tracking-wider text-muted-foreground uppercase">
                    {e.kind}
                  </span>
                </p>
                <p className="mt-1 max-w-2xl text-muted-foreground">{e.studentBrief}</p>
              </div>
              {e.activatedAt ? (
                <span className="text-xs text-muted-foreground">
                  Released {new Date(e.activatedAt).toLocaleString()}
                  {e.acknowledgedAt ? " · acknowledged" : ""}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy === e.key}
                  onClick={async () => {
                    setBusy(e.key);
                    setErr(null);
                    try {
                      await runRelease({ data: { assignmentId, eventKey: e.key } });
                      await events.refetch();
                      onChanged();
                    } catch (error) {
                      setErr(error instanceof Error ? error.message : "Release failed.");
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className="min-h-9 shrink-0 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  Release to student
                </button>
              )}
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs tracking-wider text-primary uppercase">
                Instructor notes (never student-visible)
              </summary>
              <p className="mt-2 text-muted-foreground">{e.instructorNotes}</p>
              <p className="mt-2 text-muted-foreground">
                <span className="text-foreground">Valid solution families:</span>{" "}
                {e.validSolutionFamilies.join("; ")}
              </p>
              <p className="mt-1 text-muted-foreground">
                <span className="text-foreground">Invalid moves:</span> {e.invalidMoves.join("; ")}
              </p>
            </details>
          </li>
        ))}
        {assignmentId && events.data && events.data.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            This scenario version has no authored events.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function CheckpointsSection({ nameOf }: { nameOf: (id: string) => string }) {
  const fetchCheckpoints = useServerFn(listCheckpoints);
  const runReview = useServerFn(reviewCheckpoint);
  const checkpoints = useQuery({
    queryKey: ["phase3", "checkpoints"],
    queryFn: () => fetchCheckpoints({}),
    retry: false,
  });

  const submitted = (checkpoints.data ?? []).filter((c) => c.student_state === "complete");

  return (
    <section className="rounded-xl border border-border bg-surface/80 p-6">
      <h2 className="font-display text-lg text-foreground">Checkpoint review</h2>
      <ul className="mt-4 space-y-2">
        {submitted.length === 0 ? (
          <li className="text-sm text-muted-foreground">No checkpoints submitted yet.</li>
        ) : (
          submitted.map((c) => (
            <li key={c.id} className="rounded-lg border border-border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-foreground">
                  {nameOf(c.owner_id)} · Week {c.week} · {c.stage}
                </span>
                <span className="text-muted-foreground">{c.review_state}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["in_review", "needs_revision", "accepted"] as const).map((next) => (
                  <button
                    key={next}
                    type="button"
                    onClick={async () => {
                      await runReview({ data: { id: c.id, reviewState: next } });
                      await checkpoints.refetch();
                    }}
                    className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mark {next.replace("_", " ")}
                  </button>
                ))}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
