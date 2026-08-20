import { useCallback, useMemo, useState } from "react";
import type { CharacterState, Experience, Interaction, Scene } from "./types";

/** Interaction state for one scene. Keyed per scene so a reset is local. */
export interface SceneState {
  /** classify: itemId -> optionId · route-choice: requestId -> hotspotId */
  answers: Record<string, string>;
  /** evidence ids surfaced by the learner's own actions */
  revealedEvidence: string[];
  /** terminal / select-object: ids of things the learner has run */
  used: string[];
  /** learner-requested explanation */
  explanationRevealed: boolean;
  /** in-scene character state, driven by the interaction */
  characterState?: CharacterState;
}

const emptySceneState: SceneState = {
  answers: {},
  revealedEvidence: [],
  used: [],
  explanationRevealed: false,
};

export function isSceneComplete(scene: Scene, state: SceneState): boolean {
  const interaction: Interaction | undefined = scene.interaction;
  if (!interaction) return true;
  if (interaction.kind === "classify") {
    return interaction.items.every(
      (item) => state.answers[item.id] === item.correctOptionId,
    );
  }
  if (interaction.kind === "route-choice") {
    return interaction.requests.every(
      (request) => state.answers[request.id] === request.correctHotspotId,
    );
  }
  if (interaction.kind === "select-object") {
    return interaction.objects.some((o) => state.used.includes(o.id));
  }
  if (interaction.kind === "terminal") {
    return state.used.length > 0;
  }
  return true;
}


export interface ExperienceController {
  experience: Experience;
  scene: Scene;
  sceneIndex: number;
  sceneCount: number;
  sceneState: SceneState;
  complete: boolean;
  dialogueVisible: boolean;
  evidenceRevealedByInstructor: boolean;
  explanationRevealed: boolean;
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  resetScene: () => void;
  restart: () => void;
  toggleDialogue: () => void;
  revealEvidence: () => void;
  revealExplanation: () => void;
  answer: (itemId: string, optionId: string) => void;
  markUsed: (id: string) => void;
  revealEvidenceIds: (ids: string[]) => void;
  /** Effective character state for the current scene. */
  characterState: CharacterState;
  setCharacterState: (state: CharacterState) => void;

}

export function useExperienceState(experience: Experience): ExperienceController {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [states, setStates] = useState<Record<string, SceneState>>({});
  const [dialogueVisible, setDialogueVisible] = useState(true);
  const [instructorEvidence, setInstructorEvidence] = useState(false);

  const scene = experience.scenes[sceneIndex]!;
  const sceneState = states[scene.id] ?? emptySceneState;

  const patch = useCallback(
    (sceneId: string, fn: (prev: SceneState) => SceneState) => {
      setStates((prev) => ({
        ...prev,
        [sceneId]: fn(prev[sceneId] ?? emptySceneState),
      }));
    },
    [],
  );

  const answer = useCallback(
    (itemId: string, optionId: string) => {
      patch(scene.id, (prev) => ({
        ...prev,
        answers: { ...prev.answers, [itemId]: optionId },
      }));
    },
    [patch, scene.id],
  );

  const revealEvidenceIds = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      patch(scene.id, (prev) => ({
        ...prev,
        revealedEvidence: Array.from(new Set([...prev.revealedEvidence, ...ids])),
      }));
    },
    [patch, scene.id],
  );

  const markUsed = useCallback(
    (id: string) => {
      patch(scene.id, (prev) => ({
        ...prev,
        used: prev.used.includes(id) ? prev.used : [...prev.used, id],
      }));
    },
    [patch, scene.id],
  );

  /** Resets only the current scene. Other scenes keep their state. */
  const resetScene = useCallback(() => {
    setStates((prev) => {
      const nextStates = { ...prev };
      delete nextStates[scene.id];
      return nextStates;
    });
    setInstructorEvidence(false);
  }, [scene.id]);

  const restart = useCallback(() => {
    setStates({});
    setSceneIndex(0);
    setInstructorEvidence(false);
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      setInstructorEvidence(false);
      setSceneIndex(Math.min(Math.max(index, 0), experience.scenes.length - 1));
    },
    [experience.scenes.length],
  );

  const complete = useMemo(() => isSceneComplete(scene, sceneState), [scene, sceneState]);

  const setCharacterState = useCallback(
    (next: CharacterState) => {
      patch(scene.id, (prev) => ({ ...prev, characterState: next }));
    },
    [patch, scene.id],
  );

  return {
    experience,
    scene,
    sceneIndex,
    sceneCount: experience.scenes.length,
    sceneState,
    complete,
    dialogueVisible,
    evidenceRevealedByInstructor: instructorEvidence,
    explanationRevealed: sceneState.explanationRevealed,
    next: () => jumpTo(sceneIndex + 1),
    previous: () => jumpTo(sceneIndex - 1),
    jumpTo,
    resetScene,
    restart,
    toggleDialogue: () => setDialogueVisible((v) => !v),
    revealEvidence: () => setInstructorEvidence(true),
    revealExplanation: () =>
      patch(scene.id, (prev) => ({ ...prev, explanationRevealed: true })),
    answer,
    markUsed,
    revealEvidenceIds,
    characterState: sceneState.characterState ?? scene.characterState,
    setCharacterState,
  };

}
