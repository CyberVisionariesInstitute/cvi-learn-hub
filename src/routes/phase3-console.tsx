import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";
import { useSession } from "@/hooks/useSession";
import {
  activateHiddenEvent,
  assignScenario,
  createHiddenEvent,
  instructorOverview,
  readAuditLog,
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
  const runCreateEvent = useServerFn(createHiddenEvent);
  const runActivate = useServerFn(activateHiddenEvent);
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
  const [eventAssignment, setEventAssignment] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventBrief, setEventBrief] = useState("");
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

            <section className="rounded-xl border border-border bg-surface/80 p-6">
              <h2 className="font-display text-lg text-foreground">Change &amp; incident events</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Events stay invisible to the student until you activate them.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-muted-foreground">Assignment</span>
                  <select
                    value={eventAssignment}
                    onChange={(e) => setEventAssignment(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    <option value="">Select…</option>
                    {overview.data.assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {nameOf(a.user_id)} · {a.scenario_code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Title</span>
                  <input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Student brief</span>
                  <textarea
                    rows={3}
                    value={eventBrief}
                    onChange={(e) => setEventBrief(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background p-3 text-foreground"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={!eventAssignment || !eventTitle || !eventBrief}
                    onClick={async () => {
                      await runCreateEvent({
                        data: {
                          assignmentId: eventAssignment,
                          eventKey: eventTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 60),
                          title: eventTitle,
                          studentBrief: eventBrief,
                        },
                      });
                      setEventTitle("");
                      setEventBrief("");
                      await overview.refetch();
                    }}
                    className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60 disabled:opacity-50"
                  >
                    Stage event (inactive)
                  </button>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {overview.data.events.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                  >
                    <span className="text-foreground">{e.title}</span>
                    {e.activated_at ? (
                      <span className="text-muted-foreground">
                        Released {new Date(e.activated_at).toLocaleString()}
                        {e.acknowledged_at ? " · acknowledged" : ""}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          await runActivate({ data: { id: e.id } });
                          await overview.refetch();
                        }}
                        className="min-h-9 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
                      >
                        Release to student
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>

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
