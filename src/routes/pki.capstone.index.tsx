import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Download, Upload, FileCheck2 } from "lucide-react";
import { useWorkspace, useRefreshWorkspace } from "@/lib/capstone/useWorkspace";
import {
  acknowledgeEvent,
  exportProject,
  importProject,
} from "@/lib/capstone/capstone.functions";
import { STAGES, stageProgress, type ProjectState } from "@/lib/capstone/model";

export const Route = createFileRoute("/pki/capstone/")({
  component: CapstoneOverview,
});

function CapstoneOverview() {
  const { data } = useWorkspace(true);
  const refresh = useRefreshWorkspace();
  const runExport = useServerFn(exportProject);
  const runImport = useServerFn(importProject);
  const runAck = useServerFn(acknowledgeEvent);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!data) return null;

  if (!data.assignment) {
    return (
      <section className="rounded-xl border border-border bg-surface/80 p-8">
        <h2 className="font-display text-xl text-foreground">No active assignment yet</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your instructor assigns one scenario per student. Once your assignment is active, your
          scenario brief and workspace appear here automatically. There is no scenario catalog to
          browse.
        </p>
        <Link
          to="/pki"
          className="mt-6 inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
        >
          Back to the PKI Demo Lab
        </Link>
      </section>
    );
  }

  const scenario = data.scenario;
  const project = data.project!;
  const state = (project.state ?? {}) as ProjectState;
  const checkpoints = data.checkpoints;

  async function handleExport() {
    setError(null);
    try {
      const payload = await runExport({ data: { projectId: project.id } });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cvi-phase3-${project.scenario_code ?? "project"}-r${payload.body.revision}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Project exported.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    }
  }

  async function handleImport(file: File) {
    setError(null);
    setNotice(null);
    try {
      const text = await file.text();
      await runImport({ data: { projectId: project.id, file: text } });
      await refresh();
      setNotice("Project imported and saved as a new revision.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <div className="space-y-8">
      {data.events.length > 0 ? (
        <section aria-labelledby="events" className="space-y-3">
          <h2 id="events" className="flex items-center gap-2 font-display text-lg text-foreground">
            <AlertTriangle className="size-4 text-primary" aria-hidden="true" />
            Released change &amp; incident briefs
          </h2>
          {data.events.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-primary/30 bg-primary/5 p-5"
            >
              <h3 className="font-display text-base text-foreground">{event.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {event.student_brief}
              </p>
              {event.acknowledged_at ? (
                <p className="mt-3 text-xs text-muted-foreground">Acknowledged.</p>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await runAck({ data: { id: event.id } });
                    await refresh();
                  }}
                  className="mt-3 min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
                >
                  Acknowledge and respond in Adapt
                </button>
              )}
            </article>
          ))}
        </section>
      ) : null}

      <section aria-labelledby="brief" className="rounded-xl border border-border bg-surface/80 p-6 sm:p-8">
        <h2 id="brief" className="font-display text-xl text-foreground">
          {scenario?.organization ?? data.assignment.scenario_code}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
          {scenario?.brief ?? "Your scenario brief will appear once your instructor releases it."}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <BriefList title="Constraints" items={asStrings(scenario?.constraints)} />
          <BriefList title="Requirements" items={asStrings(scenario?.requirements)} />
          <BriefList title="Workloads" items={asStrings(scenario?.workloads)} />
        </div>
      </section>

      <section aria-labelledby="progress">
        <h2 id="progress" className="font-display text-lg text-foreground">
          Workflow progress
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revision {project.revision} · last saved{" "}
          {new Date(project.updated_at).toLocaleString()}
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const checkpoint = checkpoints.find((c) => c.stage === stage.key);
            const started = stageProgress(state, stage.key) === "started";
            return (
              <li key={stage.key}>
                <Link
                  to="/pki/capstone/$stage"
                  params={{ stage: stage.key }}
                  className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface/70 p-5 transition-colors hover:border-primary/50"
                >
                  <span className="flex items-center justify-between text-xs tracking-wider text-muted-foreground uppercase">
                    Week {stage.week}
                    <span
                      className={
                        checkpoint?.student_state === "complete"
                          ? "rounded-full bg-primary/15 px-2 py-0.5 text-primary"
                          : started
                            ? "rounded-full bg-surface-raised px-2 py-0.5 text-foreground/80"
                            : "rounded-full px-2 py-0.5 text-muted-foreground"
                      }
                    >
                      {checkpoint?.student_state === "complete"
                        ? "Complete"
                        : started
                          ? "In progress"
                          : "Not started"}
                    </span>
                  </span>
                  <span className="font-display text-base text-foreground">{stage.label}</span>
                  <span className="text-sm text-muted-foreground">{stage.headline}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="portability"
        className="rounded-xl border border-border bg-surface/80 p-6"
      >
        <h2 id="portability" className="flex items-center gap-2 font-display text-lg text-foreground">
          <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
          Backup &amp; restore
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Exports are signed and locked to your account, assignment, and scenario version. A file
          from another student, scenario, or version is rejected on import.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            <Download className="size-4" aria-hidden="true" />
            Export my project
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            <Upload className="size-4" aria-hidden="true" />
            Import a project file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
        {notice ? <p className="mt-3 text-sm text-foreground">{notice}</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </section>

      {data.submission ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-display text-lg text-foreground">Submission recorded</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {new Date(data.submission.submitted_at).toLocaleString()} · status{" "}
            {data.submission.review_state}
          </p>
          {data.submission.reviewer_notes ? (
            <p className="mt-3 text-sm text-foreground/90">{data.submission.reviewer_notes}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
  return [];
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">Not provided.</li>
        ) : (
          items.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-foreground/90">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
