import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Panel, Btn, Field, inputClass, Badge, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { addEvidence, submitCapstone } from "@/lib/capstone/capstone.functions";
import { useRefreshWorkspace, type Workspace } from "@/lib/capstone/useWorkspace";
import { COMPETENCIES, RUBRIC, type ScenarioPublic } from "@/lib/capstone/scenario-types";
import { validateArchitecture } from "@/lib/capstone/validation";

export function DefendWorkspace({
  scenario,
  workspace,
}: {
  scenario: ScenarioPublic;
  workspace: Workspace;
}) {
  const { draft, update, save, projectId } = useDraft();
  const runSubmit = useServerFn(submitCapstone);
  const runEvidence = useServerFn(addEvidence);
  const refresh = useRefreshWorkspace();
  const [defenseNotes, setDefenseNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findings = useMemo(() => validateArchitecture(draft, scenario), [draft, scenario]);
  const requirements = draft.analysis.filter((a) => a.kind === "requirement");
  const runs = draft.workloads.runs;
  const passing = draft.workloads.instances.filter((i) => {
    const r = runs.filter((x) => x.workloadInstanceId === i.id);
    return r[r.length - 1]?.result === "PASS";
  }).length;

  const readiness = [
    { label: "Requirements traced", ok: requirements.length > 0, detail: `${requirements.length} recorded` },
    {
      label: "No unresolved critical findings",
      ok: findings.filter(
        (f) =>
          f.severity === "Critical" &&
          (draft.architecture.dispositions.find((d) => d.findingId === f.id)?.disposition ?? "open") ===
            "open",
      ).length === 0,
      detail: `${findings.filter((f) => f.severity === "Critical").length} critical finding(s)`,
    },
    {
      label: "Every workload executed",
      ok:
        draft.workloads.instances.length > 0 &&
        draft.workloads.instances.every((i) => runs.some((r) => r.workloadInstanceId === i.id)),
      detail: `${passing}/${draft.workloads.instances.length} passing`,
    },
    {
      label: "Ownership resolved",
      ok: draft.operations.assets.every((a) => a.ownerState !== "Unknown"),
      detail: `${draft.operations.assets.filter((a) => a.ownerState === "Unknown").length} unknown owner(s)`,
    },
    {
      label: "Status distribution defined",
      ok: draft.operations.publications.length > 0,
      detail: `${draft.operations.publications.length} path(s)`,
    },
    {
      label: "Change response recorded",
      ok: workspace.events.length === 0 || draft.change.timeline.some((t) => t.kind === "event"),
      detail: `${workspace.events.length} released change(s)`,
    },
  ];

  const notReady = readiness.filter((r) => !r.ok);

  return (
    <div className="space-y-6">
      <Panel
        title="Defense readiness"
        description="What a reviewer will look for. This is a checklist, not a score."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {readiness.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="text-foreground">{r.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.detail}</span>
                <Badge tone={r.ok ? "good" : "warn"}>{r.ok ? "Ready" : "Open"}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Rubric" description="How the defense is assessed. Weighting is fixed across all scenarios.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {RUBRIC.map((r) => (
            <li key={r.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <span className="text-foreground">{r.label}</span>
              <span className="text-muted-foreground">{r.points} pts</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Competencies assessed: {COMPETENCIES.join(" · ")}
        </p>
      </Panel>

      <Panel
        title="Decision record"
        description="Your defense is judged on reasoning. Explain the decisions a reviewer will ask about."
      >
        <div className="space-y-3">
          {[
            ["trust", "Why this trust model and CA hierarchy?"],
            ["keys", "How are signing keys protected, and why is that proportionate?"],
            ["lifecycle", "How does a certificate get renewed or replaced without an outage?"],
            ["status", "How does every relying zone learn that a certificate is no longer valid?"],
            ["change", "What changed mid-project, and how did you respond?"],
            ["risk", "What did you accept as risk, and on what basis?"],
          ].map(([key, prompt]) => (
            <Field key={key} label={prompt as string}>
              <textarea
                rows={3}
                className={inputClass}
                value={draft.notes[key as string] ?? ""}
                onChange={(e) =>
                  update((s) => {
                    s.notes[key as string] = e.target.value;
                  })
                }
              />
            </Field>
          ))}
        </div>
        <div className="mt-3">
          <Btn onClick={() => void save("Decision record updated")}>Save decision record</Btn>
        </div>
      </Panel>

      <Panel title="Evidence attached to your defense" description="Captured artifacts from every stage.">
        {workspace.evidence.length === 0 ? (
          <Empty>No evidence captured yet. Capture evidence from the Evidence locker.</Empty>
        ) : (
          <ul className="space-y-2">
            {workspace.evidence.slice(0, 12).map((e) => (
              <li key={e.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <span className="text-foreground">{e.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">{e.stage}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Submit for defense"
        description="Submitting snapshots your project. You keep working, but the reviewed record is fixed at submission."
      >
        {workspace.submission ? (
          <div className="rounded-md border border-primary/40 bg-primary/5 p-4 text-sm">
            <p className="text-foreground">
              Submitted {new Date(workspace.submission.submitted_at).toLocaleString()} · status{" "}
              {workspace.submission.review_state}
            </p>
            {workspace.submission.reviewer_notes ? (
              <p className="mt-2 text-foreground/90">{workspace.submission.reviewer_notes}</p>
            ) : null}
          </div>
        ) : (
          <>
            {notReady.length > 0 ? (
              <p className="mb-3 text-sm text-muted-foreground">
                {notReady.length} readiness item(s) still open. You may still submit — be ready to defend
                the gaps.
              </p>
            ) : null}
            <Field label="Defense summary">
              <textarea
                rows={5}
                className={inputClass}
                value={defenseNotes}
                onChange={(e) => setDefenseNotes(e.target.value)}
              />
            </Field>
            <div className="mt-3">
              <Btn
                variant="primary"
                disabled={busy || defenseNotes.trim().length < 20}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    await save("Pre-submission save");
                    await runEvidence({
                      data: {
                        projectId,
                        stage: "defend",
                        title: "Defense summary",
                        body: defenseNotes,
                      },
                    });
                    await runSubmit({ data: { projectId, defenseNotes } });
                    await refresh();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Submission failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Submitting…" : "Submit capstone"}
              </Btn>
            </div>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </>
        )}
      </Panel>
    </div>
  );
}
