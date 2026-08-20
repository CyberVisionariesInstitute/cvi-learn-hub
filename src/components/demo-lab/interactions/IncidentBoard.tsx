import { useState } from "react";
import { IvyNote, PlacementBoard, SurfaceHeading } from "./parts";
import type { EvidenceSortInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/** Incident board: separate what was observed, assumed, and still unverified. */
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

  const placement = sceneState.answers;
  const done = interaction.items.every((i) => placement[i.id] === i.correctBucketId);

  const last = interaction.items.find((i) => i.id === lastId);
  const lastBucket = last ? placement[last.id] : undefined;
  const lastCorrect = last ? lastBucket === last.correctBucketId : false;
  const lastChallenge =
    last && lastBucket && !lastCorrect
      ? (last.challenge?.[lastBucket] ?? last.challenge?.["*"])
      : undefined;

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Incident response room"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      {interaction.report ? (
        <section className="rounded-md border border-amber/40 bg-amber/10 p-4">
          <p className="text-[0.65rem] tracking-[0.2em] text-foreground uppercase">
            Reported by {interaction.report.from}
          </p>
          <p className="mt-1 text-sm text-foreground">“{interaction.report.text}”</p>
        </section>
      ) : null}

      <PlacementBoard
        items={interaction.items.map((i) => ({ id: i.id, label: i.label }))}
        buckets={interaction.buckets}
        placement={placement}
        selectedId={selected}
        onSelect={setSelected}
        onPlace={(itemId, bucketId) => {
          answer(itemId, bucketId);
          setSelected(null);
          setLastId(itemId);
          const item = interaction.items.find((i) => i.id === itemId);
          setCharacterState(
            item && item.correctBucketId === bucketId ? "ivy-nod" : "ivy-thinking",
          );
        }}
        onUnplace={(itemId) => {
          clearAnswers((k) => k === itemId);
          setSelected(itemId);
        }}
        statusOf={(itemId) => {
          const item = interaction.items.find((i) => i.id === itemId);
          if (!item || !placement[itemId]) return undefined;
          return placement[itemId] === item.correctBucketId ? "correct" : "incorrect";
        }}
        trayLabel="Evidence cards"
      />

      <div aria-live="polite" className="space-y-3">
        {last && lastBucket ? (
          <IvyNote
            headline={lastCorrect ? "That belongs there" : "Ivy questions that placement"}
            tone={lastCorrect ? "proven" : "attention"}
          >
            <p>{lastCorrect ? last.explanation : lastChallenge}</p>
          </IvyNote>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a card, then choose the column it belongs in. Cards can be moved
            at any time.
          </p>
        )}
        {done ? (
          <IvyNote headline={interaction.completion.headline} tone="proven">
            <p>{interaction.completion.body}</p>
          </IvyNote>
        ) : null}
      </div>
    </div>
  );
}
