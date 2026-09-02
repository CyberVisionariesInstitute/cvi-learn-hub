import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { useRefreshWorkspace, useWorkspace } from "@/lib/capstone/useWorkspace";
import { addEvidence, deleteEvidence } from "@/lib/capstone/capstone.functions";
import { STAGES, type StageKey } from "@/lib/capstone/model";

export const Route = createFileRoute("/pki/capstone/evidence")({
  component: EvidencePage,
});

function EvidencePage() {
  const { data } = useWorkspace(true);
  const refresh = useRefreshWorkspace();
  const runAdd = useServerFn(addEvidence);
  const runDelete = useServerFn(deleteEvidence);

  const [stage, setStage] = useState<StageKey>("analyze");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const project = data?.project;
  if (!project) {
    return (
      <p className="text-sm text-muted-foreground">
        Your evidence locker opens once your assignment is active.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl text-foreground">Evidence locker</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Evidence is what turns a design into a defensible one. Capture what you observed, when,
          and what it proves. Everything here is included in your submission snapshot.
        </p>
      </header>

      <section className="grid gap-3 rounded-xl border border-border bg-surface/80 p-6 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted-foreground">Stage</span>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as StageKey)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2 text-foreground"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                Week {s.week} — {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted-foreground">What it shows</span>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background p-3 text-foreground"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={async () => {
              if (!title.trim()) {
                setError("Give the evidence a title.");
                return;
              }
              setError(null);
              const week = STAGES.find((s) => s.key === stage)?.week;
              await runAdd({
                data: {
                  projectId: project.id,
                  stage,
                  ...(week ? { week } : {}),
                  title: title.trim(),
                  body,
                },
              });
              setTitle("");
              setBody("");
              await refresh();
            }}
            className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Add evidence
          </button>
          {error ? <span className="ml-3 text-sm text-destructive">{error}</span> : null}
        </div>
      </section>

      <ul className="space-y-3">
        {(data?.evidence ?? []).length === 0 ? (
          <li className="text-sm text-muted-foreground">No evidence captured yet.</li>
        ) : (
          (data?.evidence ?? []).map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    {item.week ? `Week ${item.week} · ` : ""}
                    {item.stage}
                  </p>
                  <h3 className="mt-1 font-display text-base text-foreground">{item.title}</h3>
                  {item.body ? (
                    <p className="mt-2 text-sm whitespace-pre-line text-foreground/90">
                      {item.body}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  onClick={async () => {
                    await runDelete({ data: { id: item.id } });
                    await refresh();
                  }}
                  className="min-h-9 rounded-md border border-border px-3 text-xs text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
