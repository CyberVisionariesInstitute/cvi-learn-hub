import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Plus, Save, Trash2, History } from "lucide-react";
import { useRefreshWorkspace, useWorkspace } from "@/lib/capstone/useWorkspace";
import {
  addEvidence,
  completeCheckpoint,
  listRevisions,
  restoreRevision,
  saveProject,
  submitCapstone,
} from "@/lib/capstone/capstone.functions";
import {
  STAGES,
  getStage,
  isStageKey,
  stageOf,
  type ProjectState,
  type StageItem,
  type StageKey,
} from "@/lib/capstone/model";

export const Route = createFileRoute("/pki/capstone/$stage")({
  params: {
    parse: (raw: Record<string, string>) => {
      if (!isStageKey(raw['stage'] ?? "")) throw notFound();
      return { stage: raw['stage'] as StageKey };
    },
    stringify: (params: { stage: StageKey }) => ({ stage: params.stage }),
  },
  component: StagePage,
});

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function StagePage() {
  const { stage: stageKey } = Route.useParams();
  const stage = getStage(stageKey);
  const { data } = useWorkspace(true);
  const refresh = useRefreshWorkspace();

  const runSave = useServerFn(saveProject);
  const runCheckpoint = useServerFn(completeCheckpoint);
  const runEvidence = useServerFn(addEvidence);
  const runRevisions = useServerFn(listRevisions);
  const runRestore = useServerFn(restoreRevision);
  const runSubmit = useServerFn(submitCapstone);

  const project = data?.project;
  const serverState = (project?.state ?? {}) as ProjectState;

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<StageItem[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<
    { id: string; revision: number; note: string | null; created_at: string }[] | null
  >(null);
  const [defenseNotes, setDefenseNotes] = useState("");

  useEffect(() => {
    const s = stageOf(serverState, stageKey);
    setNotes(s.notes);
    setItems(s.items);
    setStatus(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageKey, project?.revision]);

  const checkpoint = useMemo(
    () => (data?.checkpoints ?? []).find((c) => c.stage === stageKey),
    [data, stageKey],
  );

  const index = STAGES.findIndex((s) => s.key === stageKey);
  const prev = index > 0 ? STAGES[index - 1] : null;
  const next = index < STAGES.length - 1 ? STAGES[index + 1] : null;

  if (!data?.assignment || !project) {
    return (
      <p className="text-sm text-muted-foreground">
        Your workspace opens once your instructor activates your assignment.
      </p>
    );
  }

  async function persist(nextNotes: string, nextItems: StageItem[], note?: string) {
    setError(null);
    const nextState: ProjectState = {
      ...serverState,
      [stageKey]: { notes: nextNotes, items: nextItems },
    };
    try {
      await runSave({
        data: { projectId: project!.id, state: nextState as never, ...(note ? { note } : {}) },
      });
      await refresh();
      setStatus("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  function addItem() {
    const title = (draft['title'] ?? "").trim();
    if (!title) {
      setError(`Give the ${stage.itemNoun.toLowerCase()} a name first.`);
      return;
    }
    const item: StageItem = { id: newId(), ...draft };
    const nextItems = [...items, item];
    setItems(nextItems);
    setDraft({});
    void persist(notes, nextItems, `Added ${stage.itemNoun.toLowerCase()}`);
  }

  function removeItem(id: string) {
    const nextItems = items.filter((i) => i.id !== id);
    setItems(nextItems);
    void persist(notes, nextItems, `Removed ${stage.itemNoun.toLowerCase()}`);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Week {stage.week} · {stage.label}
        </p>
        <h2 className="mt-1 font-display text-2xl text-foreground">{stage.headline}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{stage.objective}</p>
      </header>

      <section className="rounded-xl border border-border bg-surface/80 p-6">
        <label className="block">
          <span className="text-sm text-muted-foreground">{stage.notesPrompt}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => persist(notes, items, "Updated notes")}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Save className="size-4" aria-hidden="true" />
            Save work
          </button>
          <button
            type="button"
            onClick={async () => {
              await runCheckpoint({
                data: {
                  projectId: project.id,
                  stage: stageKey,
                  week: stage.week,
                  done: checkpoint?.student_state !== "complete",
                },
              });
              await refresh();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            <Check className="size-4" aria-hidden="true" />
            {checkpoint?.student_state === "complete"
              ? "Reopen this checkpoint"
              : "Mark checkpoint complete"}
          </button>
          <button
            type="button"
            onClick={async () => setRevisions(await runRevisions({ data: { projectId: project.id } }))}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <History className="size-4" aria-hidden="true" />
            Revision history
          </button>
          {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>

        {checkpoint?.reviewer_notes ? (
          <p className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground/90">
            Instructor feedback: {checkpoint.reviewer_notes}
          </p>
        ) : null}

        {revisions ? (
          <ul className="mt-4 space-y-2">
            {revisions.map((rev) => (
              <li
                key={rev.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <span className="text-muted-foreground">
                  r{rev.revision} · {new Date(rev.created_at).toLocaleString()}
                  {rev.note ? ` · ${rev.note}` : ""}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await runRestore({ data: { projectId: project.id, revisionId: rev.id } });
                    await refresh();
                    setRevisions(null);
                  }}
                  className="min-h-9 rounded-md border border-border px-3 text-xs text-foreground hover:border-primary/60"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-surface/80 p-6">
        <h3 className="font-display text-lg text-foreground">{stage.itemNoun} register</h3>

        <ul className="mt-4 space-y-3">
          {items.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              Nothing recorded yet for this stage.
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface-raised/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base text-foreground">{item['title']}</p>
                    <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                      {stage.fields
                        .filter((f) => f.key !== "title" && item[f.key])
                        .map((f) => (
                          <div key={f.key} className="flex gap-2">
                            <dt className="text-muted-foreground">{f.label}:</dt>
                            <dd className="text-foreground/90">{item[f.key]}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await runEvidence({
                          data: {
                            projectId: project.id,
                            stage: stageKey,
                            week: stage.week,
                            title: item['title'] ?? stage.itemNoun,
                            body: stage.fields
                              .filter((f) => f.key !== "title" && item[f.key])
                              .map((f) => `${f.label}: ${item[f.key]}`)
                              .join("\n"),
                          },
                        });
                        await refresh();
                        setStatus("Added to evidence locker.");
                      }}
                      className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Capture as evidence
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item['title']}`}
                      className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6 grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
          {stage.fields.map((field) => (
            <label key={field.key} className="block text-sm sm:col-span-1">
              <span className="text-muted-foreground">{field.label}</span>
              {field.kind === "textarea" ? (
                <textarea
                  rows={3}
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-foreground"
                />
              ) : field.kind === "select" ? (
                <select
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={draft[field.key] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
                />
              )}
            </label>
          ))}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add {stage.itemNoun.toLowerCase()}
            </button>
          </div>
        </div>
      </section>

      {stageKey === "defend" ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-display text-lg text-foreground">Submit your defense</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Submitting freezes a snapshot of your project and evidence for review. You can keep
            working afterwards, but the snapshot your instructor reviews will not change.
          </p>
          <textarea
            rows={5}
            value={defenseNotes}
            onChange={(e) => setDefenseNotes(e.target.value)}
            placeholder="Your closing defense statement"
            className="mt-3 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
          />
          <button
            type="button"
            onClick={async () => {
              try {
                await runSubmit({ data: { projectId: project.id, defenseNotes } });
                await refresh();
                setStatus("Defense submitted.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Submission failed.");
              }
            }}
            className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Submit for review
          </button>
          {data.submission ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Last submitted {new Date(data.submission.submitted_at).toLocaleString()} · status{" "}
              {data.submission.review_state}
            </p>
          ) : null}
        </section>
      ) : null}

      <nav className="flex flex-wrap justify-between gap-3">
        {prev ? (
          <Link
            to="/pki/capstone/$stage"
            params={{ stage: prev.key }}
            className="min-h-11 rounded-md border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            ← {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/pki/capstone/$stage"
            params={{ stage: next.key }}
            className="min-h-11 rounded-md border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            {next.label} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
