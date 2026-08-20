import { useState } from "react";
import { IvyNote, SurfaceHeading } from "./parts";
import { cn } from "@/lib/utils";
import type { SequenceInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

const SLOT_PREFIX = "slot:";

/** Whiteboard ordering. Drag, tap-to-place, or keyboard select → place. */
export function LadderBoard({
  interaction,
  controller,
}: {
  interaction: SequenceInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, clearAnswers, setCharacterState } = controller;
  const { answers } = sceneState;
  const [selected, setSelected] = useState<string | null>(null);

  const slots = interaction.correctOrder.map((_, i) => answers[`${SLOT_PREFIX}${i}`]);
  const placedIds = slots.filter(Boolean) as string[];
  const tray = interaction.steps.filter((s) => !placedIds.includes(s.id));
  const checked = answers["__checked"] === "yes";
  const correct =
    checked && interaction.correctOrder.every((id, i) => slots[i] === id);

  function invalidateCheck() {
    if (answers["__checked"]) clearAnswers((k) => k === "__checked");
  }

  function place(stepId: string, slotIndex: number) {
    // remove the card from any slot it already occupies
    slots.forEach((v, i) => {
      if (v === stepId) clearAnswers((k) => k === `${SLOT_PREFIX}${i}`);
    });
    answer(`${SLOT_PREFIX}${slotIndex}`, stepId);
    setSelected(null);
    invalidateCheck();
  }

  function removeSlot(slotIndex: number) {
    clearAnswers((k) => k === `${SLOT_PREFIX}${slotIndex}`);
    invalidateCheck();
  }

  function clearBoard() {
    clearAnswers((k) => k.startsWith(SLOT_PREFIX) || k === "__checked");
    setSelected(null);
  }

  function check() {
    answer("__checked", "yes");
    const ok = interaction.correctOrder.every((id, i) => slots[i] === id);
    setCharacterState(ok ? "ivy-nod" : "ivy-thinking");
  }

  // First questionable transition: the earliest slot holding the wrong card.
  const firstWrongIndex = interaction.correctOrder.findIndex(
    (id, i) => slots[i] && slots[i] !== id,
  );
  const challengedStep = firstWrongIndex >= 0 ? slots[firstWrongIndex] : undefined;
  const challenge = challengedStep
    ? (interaction.challenges[challengedStep] ?? interaction.challenges["*"])
    : undefined;

  const full = placedIds.length === interaction.correctOrder.length;

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Team room whiteboard"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div>
          <h3 className="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Marker cards
          </h3>
          <ul className="mt-2 space-y-2">
            {tray.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                All five cards are on the board.
              </li>
            ) : null}
            {tray.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", step.id);
                    setSelected(step.id);
                  }}
                  onClick={() => setSelected(selected === step.id ? null : step.id)}
                  aria-pressed={selected === step.id}
                  className={cn(
                    "min-h-14 w-full rounded-md border px-3 py-2 text-left transition-colors",
                    selected === step.id
                      ? "border-primary bg-primary/15"
                      : "border-border bg-surface-raised/50 hover:border-primary/60",
                  )}
                >
                  <span className="block font-display text-sm tracking-wide text-foreground uppercase">
                    {step.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {step.detail}
                  </span>
                  {selected === step.id ? (
                    <span className="mt-1 block text-xs text-primary">
                      Selected — choose a rung
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <section
          className="rounded-lg border border-border/70 bg-[color-mix(in_oklab,var(--surface-raised)_70%,transparent)] p-4"
          aria-label={interaction.boardTitle}
        >
          <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
            {interaction.boardTitle}
          </h3>
          <ol className="mt-3 space-y-1">
            {interaction.correctOrder.map((_, i) => {
              const stepId = slots[i];
              const step = interaction.steps.find((s) => s.id === stepId);
              const rungCorrect = correct || (checked && stepId === interaction.correctOrder[i]);
              return (
                <li key={i}>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) place(id, i);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (selected) place(selected, i);
                        else if (stepId) removeSlot(i);
                      }}
                      className={cn(
                        "min-h-14 w-full rounded-md border px-3 py-2 text-left transition-colors",
                        step
                          ? rungCorrect
                            ? "border-evidence/60 bg-evidence/10"
                            : checked && firstWrongIndex === i
                              ? "border-amber/70 bg-amber/10"
                              : "border-border bg-surface/70"
                          : "border-dashed border-border text-muted-foreground",
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        Rung {i + 1}
                      </span>
                      <span className="mt-0.5 block font-display text-sm tracking-wide text-foreground uppercase">
                        {step ? step.label : selected ? "Place the selected card here" : "Empty rung"}
                      </span>
                      {step ? (
                        <span className="block text-xs text-muted-foreground">
                          {step.detail}
                          {checked
                            ? rungCorrect
                              ? " · in order"
                              : firstWrongIndex === i
                                ? " · questioned"
                                : ""
                            : ""}
                        </span>
                      ) : null}
                    </button>
                  </div>
                  {i < interaction.correctOrder.length - 1 ? (
                    <p
                      aria-hidden="true"
                      className={cn(
                        "py-0.5 pl-4 font-mono text-sm",
                        correct ? "text-evidence" : "text-muted-foreground/50",
                      )}
                    >
                      ↓
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearBoard}
              className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
            >
              Clear board
            </button>
            <button
              type="button"
              onClick={check}
              disabled={!full}
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Check the ladder
            </button>
          </div>
        </section>
      </div>

      <div aria-live="polite" className="space-y-3">
        {checked && !correct && challenge ? (
          <IvyNote headline="Ivy stops at the first rung she'd argue with" tone="attention">
            <p>{challenge}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing was wiped — move that one card and check again.
            </p>
          </IvyNote>
        ) : null}
        {correct ? (
          <>
            <IvyNote headline={interaction.completion.headline} tone="proven">
              <p>{interaction.completion.body}</p>
            </IvyNote>
            {interaction.transitionMessage ? (
              <section className="rounded-md border border-primary/40 bg-surface-raised/60 p-4">
                <p className="text-[0.65rem] tracking-[0.2em] text-primary uppercase">
                  Incoming message · {interaction.transitionMessage.from}
                </p>
                <p className="mt-1 font-display text-sm text-foreground">
                  {interaction.transitionMessage.subject}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {interaction.transitionMessage.body}
                </p>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
