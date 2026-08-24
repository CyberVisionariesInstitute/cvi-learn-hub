import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SequenceInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

const SLOT_PREFIX = "slot:";

/**
 * Mission 03 — the whiteboard as a real object on a real wall.
 *
 * The board sits on a wall plane with a frame and a marker tray; the tray
 * holds the unplaced cards. Feedback happens on the board: the questioned
 * transition is circled in marker, and a correct ladder draws its connecting
 * line. Drag, tap-to-place, and keyboard select → place all work.
 */
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
  const pointerDrag = useRef<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const slots = interaction.correctOrder.map((_, i) => answers[`${SLOT_PREFIX}${i}`]);
  const placedIds = slots.filter(Boolean) as string[];
  const tray = interaction.steps.filter((s) => !placedIds.includes(s.id));
  const checked = answers["__checked"] === "yes";
  const correct = checked && interaction.correctOrder.every((id, i) => slots[i] === id);

  function invalidateCheck() {
    if (answers["__checked"]) clearAnswers((k) => k === "__checked");
  }

  function place(stepId: string, slotIndex: number) {
    slots.forEach((v, i) => {
      if (v === stepId) clearAnswers((k) => k === `${SLOT_PREFIX}${i}`);
    });
    answer(`${SLOT_PREFIX}${slotIndex}`, stepId);
    setSelected(null);
    invalidateCheck();
  }

  function finishPointerDrag(e: React.PointerEvent<HTMLElement>) {
    const drag = pointerDrag.current;
    pointerDrag.current = null;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
    if (!moved) return;

    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-ladder-slot]");
    const slotIndex = Number(target?.dataset["ladderSlot"]);
    if (target && Number.isInteger(slotIndex)) place(drag.id, slotIndex);
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

  const firstWrongIndex = interaction.correctOrder.findIndex(
    (id, i) => slots[i] && slots[i] !== id,
  );
  const challengedStep = firstWrongIndex >= 0 ? slots[firstWrongIndex] : undefined;
  const challenge = challengedStep
    ? (interaction.challenges[challengedStep] ?? interaction.challenges["*"])
    : undefined;

  const full = placedIds.length === interaction.correctOrder.length;

  return (
    <div className="scene-depth relative">
      {/* Wall plane: the board is mounted, not floating. */}
      <div className="board-plane relative mx-auto max-w-4xl">
        <div className="board-frame relative rounded-[0.35rem] p-2">
          <section
            className="relative rounded-[0.2rem] bg-[var(--board-surface)] px-4 pt-4 pb-5 text-[var(--board-ink)] shadow-[inset_0_1px_0_oklch(1_0_0_/_35%),var(--shadow-screen)]"
            aria-label={interaction.boardTitle}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[color-mix(in_oklab,var(--board-ink)_22%,transparent)] pb-2">
              <h2 className="font-display text-sm tracking-[0.2em] text-[var(--board-ink)] uppercase">
                {interaction.boardTitle}
              </h2>
              <p className="max-w-md text-xs text-[color-mix(in_oklab,var(--board-ink)_70%,transparent)]">
                {interaction.prompt}
              </p>
            </div>

            <p className="mt-2 text-xs text-[color-mix(in_oklab,var(--board-ink)_68%,transparent)]">
              {interaction.instruction}
            </p>

            <ol className="relative mt-4 space-y-1">
              {/* Marker line, drawn only once the ladder reads correctly. */}
              {correct ? (
                <span
                  aria-hidden="true"
                  className="marker-line pointer-events-none absolute top-4 bottom-8 left-1.5 w-[3px] rounded-full bg-[color-mix(in_oklab,var(--evidence)_75%,var(--board-ink))]"
                />
              ) : null}

              {interaction.correctOrder.map((_, i) => {
                const stepId = slots[i];
                const step = interaction.steps.find((s) => s.id === stepId);
                const rungCorrect =
                  correct || (checked && stepId === interaction.correctOrder[i]);
                const questioned = checked && firstWrongIndex === i;
                return (
                  <li key={i} className="relative pl-6">
                    <div>
                      <button
                        type="button"
                        data-ladder-slot={i}
                        onDragEnter={(e) => e.preventDefault()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const id = e.dataTransfer.getData("text/plain") || selected;
                          if (id) place(id, i);
                        }}
                        onClick={() => {
                          if (selected) place(selected, i);
                          else if (stepId) removeSlot(i);
                        }}
                        className={cn(
                          "pinned-card settle-in relative min-h-14 w-full rounded-[0.15rem] border px-3 py-2 text-left [--card-tilt:0.4deg] even:[--card-tilt:-0.5deg]",
                          step
                            ? rungCorrect
                              ? "border-evidence/70 bg-[oklch(1_0_0_/_72%)]"
                              : questioned
                                ? "marker-circle border-amber/80 bg-[oklch(1_0_0_/_72%)]"
                                : "border-[color-mix(in_oklab,var(--board-ink)_28%,transparent)] bg-[oklch(1_0_0_/_66%)]"
                            : "border-dashed border-[color-mix(in_oklab,var(--board-ink)_30%,transparent)] bg-transparent",
                        )}
                      >
                        <span className="font-mono text-xs text-[color-mix(in_oklab,var(--board-ink)_62%,transparent)]">
                          Rung {i + 1}
                        </span>
                        <span className="mt-0.5 block font-display text-sm tracking-wide text-[var(--board-ink)] uppercase">
                          {step
                            ? step.label
                            : selected
                              ? "Place the selected card here"
                              : "Empty rung"}
                        </span>
                        {step ? (
                          <span className="block text-xs text-[color-mix(in_oklab,var(--board-ink)_72%,transparent)]">
                            {step.detail}
                            {checked
                              ? rungCorrect
                                ? " · in order"
                                : questioned
                                  ? " · questioned"
                                  : ""
                              : ""}
                          </span>
                        ) : null}
                      </button>
                    </div>

                    {/* In-place marker annotation — no detached error panel. */}
                    {questioned && challenge ? (
                      <p
                        aria-live="polite"
                        className="settle-in mt-1 ml-2 max-w-xl rotate-[-0.6deg] border-l-2 border-amber pl-3 font-mono text-xs leading-relaxed text-[color-mix(in_oklab,var(--board-ink)_88%,transparent)]"
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
            </ol>

            {correct ? (
              <p
                aria-live="polite"
                className="settle-in mt-4 border-l-2 border-evidence pl-3 text-sm text-[color-mix(in_oklab,var(--board-ink)_90%,transparent)]"
              >
                <span className="block font-display text-sm tracking-wide uppercase">
                  {interaction.completion.headline}
                </span>
                {interaction.completion.body}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearBoard}
                className="tactile-control min-h-11 rounded-[0.15rem] border border-[color-mix(in_oklab,var(--board-ink)_35%,transparent)] px-4 text-sm text-[var(--board-ink)]"
              >
                Wipe the board
              </button>
              <button
                type="button"
                onClick={check}
                disabled={!full}
                className="tactile-control min-h-11 rounded-[0.15rem] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                Check the ladder
              </button>
            </div>
          </section>
        </div>

        {/* Marker tray: holds the cards that are not yet on the board. */}
        <div className="marker-tray relative -mt-1 rounded-b-[0.3rem] px-3 py-3">
          <h3 className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
            Marker tray
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {tray.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                All five cards are on the board.
              </li>
            ) : null}
            {tray.map((step) => (
              <li key={step.id}>
                <div
                  role="button"
                  tabIndex={0}
                  draggable
                   onPointerDown={(e) => {
                     if (!e.isPrimary || e.button !== 0) return;
                     pointerDrag.current = {
                       id: step.id,
                       pointerId: e.pointerId,
                       startX: e.clientX,
                       startY: e.clientY,
                     };
                     e.currentTarget.setPointerCapture(e.pointerId);
                   }}
                   onPointerUp={finishPointerDrag}
                   onPointerCancel={() => {
                     pointerDrag.current = null;
                   }}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", step.id);
                  }}
                  onClick={() => setSelected(selected === step.id ? null : step.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(selected === step.id ? null : step.id);
                    }
                  }}
                  aria-pressed={selected === step.id}
                  className={cn(
                    "pinned-card min-h-14 max-w-64 rounded-[0.15rem] border px-3 py-2 text-left [--card-tilt:-0.9deg] odd:[--card-tilt:0.8deg]",
                    selected === step.id
                      ? "border-primary bg-primary/15"
                      : "border-border bg-surface-raised/70 hover:border-primary/60",
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {correct && interaction.transitionMessage ? (
        <section
          aria-live="polite"
          className="settle-in mx-auto mt-4 max-w-4xl border-l-2 border-primary/60 bg-background/55 px-4 py-3"
        >
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
    </div>
  );
}
