import { useState } from "react";
import { IvyNote, PlacementBoard, SurfaceHeading } from "./parts";
import type { BriefingInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/** Build a defensible analyst statement out of placed evidence. */
export function BriefingBoard({
  interaction,
  controller,
}: {
  interaction: BriefingInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, clearAnswers, setCharacterState } = controller;
  const [selected, setSelected] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  const placement = sceneState.answers;
  const placedRight = interaction.items.every(
    (i) => placement[i.id] === i.correctSectionId,
  );
  const confirmed = placement["__confirmed"] === "yes";

  const last = interaction.items.find((i) => i.id === lastId);
  const lastCorrect = last ? placement[last.id] === last.correctSectionId : false;

  const statement = interaction.sections
    .flatMap((section) =>
      interaction.items
        .filter((i) => i.correctSectionId === section.id)
        .map((i) => i.statementFragment),
    )
    .join(" ");

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Operations briefing"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <PlacementBoard
        items={interaction.items.map((i) => ({ id: i.id, label: i.label }))}
        buckets={interaction.sections}
        placement={placement}
        selectedId={selected}
        onSelect={setSelected}
        onPlace={(itemId, sectionId) => {
          answer(itemId, sectionId);
          setSelected(null);
          setLastId(itemId);
          const item = interaction.items.find((i) => i.id === itemId);
          setCharacterState(
            item && item.correctSectionId === sectionId ? "ivy-nod" : "ivy-thinking",
          );
          if (placement["__confirmed"]) clearAnswers((k) => k === "__confirmed");
        }}
        onUnplace={(itemId) => {
          clearAnswers((k) => k === itemId || k === "__confirmed");
          setSelected(itemId);
        }}
        statusOf={(itemId) => {
          const item = interaction.items.find((i) => i.id === itemId);
          if (!item || !placement[itemId]) return undefined;
          return placement[itemId] === item.correctSectionId ? "correct" : "incorrect";
        }}
        trayLabel="Evidence to brief"
      />

      <div aria-live="polite" className="space-y-3">
        {last && placement[last.id] ? (
          <IvyNote
            headline={lastCorrect ? "That reads correctly on the display" : "Ivy would move that one"}
            tone={lastCorrect ? "proven" : "attention"}
          >
            <p>{last.explanation}</p>
          </IvyNote>
        ) : null}

        {placedRight ? (
          <section className="rounded-lg border border-primary/50 bg-surface-raised/60 p-4">
            <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
              Assembled analyst statement
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{statement}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {interaction.confirm.prompt}
            </p>
            <button
              type="button"
              onClick={() => {
                answer("__confirmed", "yes");
                setCharacterState("ivy-briefing");
              }}
              aria-pressed={confirmed}
              className="mt-3 min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {interaction.confirm.action}
            </button>
          </section>
        ) : null}

        {confirmed ? (
          <>
            <IvyNote headline={interaction.completion.headline} tone="proven">
              <p>{interaction.completion.body}</p>
              <p className="mt-2 text-sm text-foreground">
                “{interaction.completion.finalLine}”
              </p>
            </IvyNote>
            <p className="rounded-lg border border-evidence/50 bg-evidence/10 p-4 text-center font-display text-sm tracking-[0.2em] text-foreground uppercase">
              {interaction.completion.banner}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
