import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { EvidenceSortInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Mission 07 — incident response room.
 *
 * The report lives on the ticket monitor mounted in the room, the evidence
 * starts as printouts on the table, and the sorting board is a pinned board
 * on part of the wall. Challenges happen on the card, in place.
 */
export function IncidentBoard({
  interaction,
  controller,
}: {
  interaction: EvidenceSortInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, clearAnswers, setCharacterState } = controller;
  const [selected, setSelected] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    if (!rejecting) return;
    const t = window.setTimeout(() => setRejecting(null), 500);
    return () => window.clearTimeout(t);
  }, [rejecting]);

  const placement = sceneState.answers;
  const placedCount = interaction.items.filter((i) => placement[i.id]).length;
  const done = interaction.items.every((i) => placement[i.id] === i.correctBucketId);
  const tray = interaction.items.filter((i) => !placement[i.id]);

  const last = interaction.items.find((i) => i.id === lastId);
  const lastBucket = last ? placement[last.id] : undefined;
  const lastCorrect = last ? lastBucket === last.correctBucketId : false;

  function statusOf(itemId: string) {
    const item = interaction.items.find((i) => i.id === itemId);
    if (!item || !placement[itemId]) return undefined;
    return placement[itemId] === item.correctBucketId ? "correct" : "incorrect";
  }

  function place(itemId: string, bucketId: string) {
    const item = interaction.items.find((i) => i.id === itemId);
    answer(itemId, bucketId);
    setSelected(null);
    setLastId(itemId);
    const ok = item?.correctBucketId === bucketId;
    if (!ok) setRejecting(itemId);
    setCharacterState(ok ? "ivy-nod" : "ivy-point");
  }

  return (
    <div className="scene-depth space-y-4">
      {/* Ticket monitor mounted in the room carries the report. */}
      {interaction.report ? (
        <section className="monitor-surface screen-refresh mx-auto max-w-3xl rounded-[0.2rem] px-4 py-3">
          <p className="text-[0.6rem] tracking-[0.24em] text-primary uppercase">
            Incident ticket · reported by {interaction.report.from}
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed text-terminal-foreground">
            “{interaction.report.text}”
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Reported status — not yet evidence. {placedCount} of{" "}
            {interaction.items.length} items filed.
          </p>
        </section>
      ) : null}

      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        {/* Evidence sources on the table */}
        <div className="min-w-0 rounded-[0.15rem] border-t-2 border-primary/40 bg-background/45 p-3">
          <h2 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
            Printouts on the table
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{interaction.instruction}</p>
          <ul className="mt-3 space-y-2">
            {tray.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Every item is on the board.
              </li>
            ) : null}
            {tray.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item.id);
                    setSelected(item.id);
                  }}
                  onClick={() => setSelected(selected === item.id ? null : item.id)}
                  aria-pressed={selected === item.id}
                  className={cn(
                    "pinned-card lift-on-select min-h-14 w-full rounded-[0.12rem] border px-3 py-2 text-left text-sm",
                    index % 2 ? "[--card-tilt:0.8deg]" : "[--card-tilt:-0.7deg]",
                    rejecting === item.id && "card-reject",
                    selected === item.id
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-surface-raised/70 text-foreground hover:border-primary/60",
                  )}
                >
                  <span className="block">{item.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {selected === item.id
                      ? "Selected — choose a column"
                      : "Select to file it"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Pinned board on the wall */}
        <div className="board-plane min-w-0">
          <div className="board-frame rounded-[0.3rem] p-2">
            <div className="rounded-[0.15rem] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] p-3">
              <h2 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
                {interaction.prompt}
              </h2>
              <div className="mt-3 grid gap-3 @2xl:grid-cols-3">
                {interaction.buckets.map((bucket) => {
                  const placed = interaction.items.filter(
                    (i) => placement[i.id] === bucket.id,
                  );
                  return (
                    <section
                      key={bucket.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        if (id) place(id, bucket.id);
                      }}
                      aria-label={bucket.label}
                      className="min-h-44 min-w-0 border-t-2 border-border/70 pt-2"
                    >
                      <h3 className="font-display text-[0.7rem] tracking-[0.18em] text-foreground uppercase">
                        {bucket.label}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {bucket.description}
                      </p>
                      <button
                        type="button"
                        disabled={!selected}
                        onClick={() => selected && place(selected, bucket.id)}
                        className="tactile-control mt-3 min-h-11 w-full rounded-[0.12rem] border border-dashed border-border px-2 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground disabled:opacity-40"
                      >
                        {selected ? "Pin here" : "Select an item first"}
                      </button>
                      <ul className="mt-3 space-y-2">
                        {placed.map((item, index) => {
                          const status = statusOf(item.id);
                          const challenge =
                            status === "incorrect"
                              ? (item.challenge?.[bucket.id] ?? item.challenge?.["*"])
                              : undefined;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  clearAnswers((k) => k === item.id);
                                  setSelected(item.id);
                                }}
                                className={cn(
                                  "pinned-card settle-in w-full rounded-[0.12rem] border px-3 py-2 text-left text-sm",
                                  index % 2 ? "[--card-tilt:-0.9deg]" : "[--card-tilt:0.7deg]",
                                  rejecting === item.id && "card-reject",
                                  status === "correct"
                                    ? "border-evidence/60 bg-evidence/10"
                                    : "border-amber/70 bg-amber/10",
                                )}
                              >
                                <span className="block text-foreground">{item.label}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {status === "correct"
                                    ? "Filed — select to move"
                                    : "Questioned — select to move"}
                                </span>
                              </button>
                              {challenge ? (
                                <p
                                  aria-live="polite"
                                  className="settle-in mt-1 ml-2 border-l-2 border-amber pl-2 text-xs leading-relaxed text-foreground"
                                >
                                  <span className="mr-1 font-display tracking-wide uppercase">
                                    Ivy ↝
                                  </span>
                                  {challenge}
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="space-y-2">
        {last && lastBucket && lastCorrect ? (
          <p className="border-l-2 border-evidence/60 pl-3 text-sm text-foreground">
            {last.explanation}
          </p>
        ) : null}
        {done ? (
          <p className="settle-in border-l-2 border-evidence pl-3 text-sm text-foreground">
            <span className="block font-display text-sm tracking-wide uppercase">
              {interaction.completion.headline}
            </span>
            {interaction.completion.body}
          </p>
        ) : null}
      </div>
    </div>
  );
}
