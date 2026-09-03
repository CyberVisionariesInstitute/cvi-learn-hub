import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Download, Upload, FileCheck2, BookOpen, Printer, Github } from "lucide-react";
import { useWorkspace, useRefreshWorkspace } from "@/lib/capstone/useWorkspace";
import { exportProject, importProject } from "@/lib/capstone/capstone.functions";
import { exportPortfolio } from "@/lib/capstone/portfolio.functions";
import { STAGES } from "@/lib/capstone/model";
import { Panel, Btn, Badge, Empty } from "@/components/capstone/ui";
import { useDraft } from "@/lib/capstone/draft";
import { MARK_LABEL, STAGE_GROUPS, type Mark } from "@/lib/capstone/grading";

export const Route = createFileRoute("/pki/capstone/")({
  component: CapstoneOverview,
});


function StudentGuideCard() {
  return (
    <section
      aria-labelledby="student-guide"
      className="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6"
    >
      <h2
        id="student-guide"
        className="flex items-center gap-2 font-display text-lg text-foreground"
      >
        <BookOpen className="size-4 text-primary" aria-hidden="true" />
        Student Guide
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        How the Phase 3 PKI Architect Capstone works: your role, each stage, the weekly roadmap,
        checkpoints and evidence, the 100-point rubric, defense expectations, and a glossary.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/pki/capstone/guide"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Read Online
        </Link>
        <Link
          to="/pki/capstone/guide"
          search={{ print: true }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
        >
          <Printer className="size-4" aria-hidden="true" />
          Print / Save as PDF
        </Link>
      </div>
    </section>
  );
}

function CapstoneOverview() {
  const { data } = useWorkspace(true);
  const refresh = useRefreshWorkspace();
  const runExport = useServerFn(exportProject);
  const runImport = useServerFn(importProject);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!data) return null;

  if (!data.assignment || !data.scenario || !data.project) {
    return (
      <section className="rounded-xl border border-border bg-surface/80 p-8">
        <h2 className="font-display text-xl text-foreground">No active assignment yet</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your instructor assigns one scenario per student. Once your assignment is active, your
          scenario brief and workspace appear here automatically. There is no scenario catalog to
          browse.
        </p>
        <div className="mt-6">
          <StudentGuideCard />
        </div>
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
  const project = data.project;

  async function handleExport() {
    setError(null);
    try {
      const payload = await runExport({ data: { projectId: project.id } });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cvi-phase3-${project.scenario_code}-r${payload.body.revision}.json`;
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
      <StudentGuideCard />
      {data.events.length > 0 ? (
        <section aria-labelledby="events" className="space-y-3">
          <h2 id="events" className="flex items-center gap-2 font-display text-lg text-foreground">
            <AlertTriangle className="size-4 text-primary" aria-hidden="true" />
            Released change &amp; incident briefs
          </h2>
          {data.events.map((event) => {
            const row = data.eventRows.find((r) => r.key === event.key);
            return (
              <article key={event.key} className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <h3 className="font-display text-base text-foreground">{event.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{event.studentBrief}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {row?.acknowledged_at
                    ? "Acknowledged — respond in Adapt."
                    : "Not yet acknowledged. Open Adapt to capture your baseline and respond."}
                </p>
                <Link
                  to="/pki/capstone/$stage"
                  params={{ stage: "adapt" }}
                  className="mt-3 inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
                >
                  Open Adapt
                </Link>
              </article>
            );
          })}
        </section>
      ) : null}

      <Panel
        id="brief"
        title={`${scenario.organization} — ${scenario.title}`}
        description={`${scenario.industry} · your role: ${scenario.role} · ${scenario.durationWeeks}`}
      >
        <p className="max-w-3xl text-sm leading-relaxed text-foreground/90">{scenario.situation}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/90">
          <strong className="text-foreground">Mission:</strong> {scenario.mission}
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <BriefList title="Design constraints" items={scenario.constraints} />
          <BriefList title="Required outcomes" items={scenario.requiredOutcomes} />
          <BriefList title="Open questions" items={scenario.openQuestions} />
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Scenario {scenario.code} · version {scenario.version} — locked to your assignment.
        </p>
      </Panel>

      {data.feedback && data.feedback.length > 0 ? (
        <Panel
          id="feedback"
          title="Instructor feedback"
          description="Written by your instructor about your work. Only you can see this."
        >
          <ul className="space-y-3">
            {data.feedback.map((f) => {
              const group = STAGE_GROUPS.find((g) => g.key === f.stage_group);
              return (
                <li key={f.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-sm text-foreground">
                      {group ? `${group.label} — ${group.headline}` : "Overall"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {MARK_LABEL[f.mark as Mark]} ·{" "}
                      {new Date(f.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {f.body ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {f.body}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

      <ProgressSection />

      <section aria-labelledby="stages">
        <h2 id="stages" className="font-display text-lg text-foreground">
          Workflow
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revision {project.revision} · last saved {new Date(project.updated_at).toLocaleString()}
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const checkpoint = data.checkpoints.find((c) => c.stage === stage.key);
            return (
              <li key={stage.key}>
                <Link
                  to="/pki/capstone/$stage"
                  params={{ stage: stage.key }}
                  className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface/70 p-5 transition-colors hover:border-primary/50"
                >
                  <span className="flex items-center justify-between text-xs tracking-wider text-muted-foreground uppercase">
                    Week {stage.week}
                    {checkpoint ? <Badge tone="warn">{checkpoint.review_state}</Badge> : null}
                  </span>
                  <span className="font-display text-base text-foreground">{stage.label}</span>
                  <span className="text-sm text-muted-foreground">{stage.headline}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <Panel
        id="portability"
        title="Backup & restore"
        description="Exports are signed and locked to your account, assignment, and scenario version. A file from another student, scenario, or version is rejected on import."
      >
        <div className="flex flex-wrap gap-3">
          <Btn onClick={handleExport}>
            <Download className="size-4" aria-hidden="true" />
            Export my project
          </Btn>
          <Btn onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Import a project file
          </Btn>
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
      </Panel>

      <PortfolioPanel projectId={project.id} submitted={Boolean(data.submission)} />


      {data.submission ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-foreground">
            <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
            Submission recorded
          </h2>
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

/**
 * Sanitized, public-shareable portfolio package. Deliberately separate from
 * the signed backup above: this zip cannot be imported to restore work.
 */
function PortfolioPanel({ projectId, submitted }: { projectId: string; submitted: boolean }) {
  const runPortfolio = useServerFn(exportPortfolio);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { files, filename } = await runPortfolio({ data: { projectId } });
      const { zipSync, strToU8 } = await import("fflate");
      const entries: Record<string, Uint8Array> = {};
      for (const [path, content] of Object.entries(files)) entries[path] = strToU8(content);
      const zipped = zipSync(entries, { level: 6 });
      const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setConfirming(false);
      setNotice("Portfolio package downloaded. Review every file before publishing it publicly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portfolio export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      id="portfolio"
      title="Portfolio package for GitHub"
      description="A sanitized, public-safe copy of your capstone work formatted as a GitHub repository. This is NOT the file used to restore your capstone project."
    >
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        The package contains a portfolio README, architecture and operations write-ups, a workload
        testing summary, and an evidence index built from your saved work. It contains no account,
        assignment, or project identifiers, no signatures, and no instructor-only material.
        {submitted
          ? " Your capstone is submitted, so this is your final portfolio artifact."
          : " Until you submit and defend, this is an in-progress portfolio snapshot."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Btn variant="primary" onClick={() => setConfirming(true)} disabled={busy}>
          <Github className="size-4" aria-hidden="true" />
          Download Portfolio Package
        </Btn>
      </div>
      {confirming ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="portfolio-confirm"
          className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4"
        >
          <h3 id="portfolio-confirm" className="font-display text-sm text-foreground">
            Before you publish this publicly
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Open the package and read every file first. Anything you wrote in your notes and
            evidence will appear in the portfolio. Remove anything you do not want to be public.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Btn variant="primary" onClick={() => void download()} disabled={busy}>
              <Download className="size-4" aria-hidden="true" />
              {busy ? "Preparing…" : "Generate & download .zip"}
            </Btn>
            <Btn onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : null}
      {notice ? <p className="mt-3 text-sm text-foreground">{notice}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </Panel>
  );
}

function ProgressSection() {
  const { draft } = useDraft();
  const stats = [
    { label: "Requirements", value: draft.analysis.filter((a) => a.kind === "requirement").length },
    { label: "Components", value: draft.architecture.nodes.length },
    { label: "Certificates", value: draft.operations.assets.length },
    { label: "Workload runs", value: draft.workloads.runs.length },
    { label: "Timeline entries", value: draft.change.timeline.length },
  ];
  return (
    <Panel title="Project at a glance" description="Live counts from your saved project state.">
      {stats.every((s) => s.value === 0) ? (
        <Empty>Nothing recorded yet. Start in Analyze.</Empty>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-xl text-foreground">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
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
