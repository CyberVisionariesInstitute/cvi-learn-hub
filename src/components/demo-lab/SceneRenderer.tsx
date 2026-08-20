import { DialogueLayer } from "./DialogueLayer";
import { EnvironmentLayer } from "./EnvironmentLayer";
import { EvidencePanel } from "./EvidencePanel";
import { InteractionLayer } from "./InteractionLayer";
import { NeighborhoodRoute } from "./interactions/NeighborhoodRoute";
import { charactersById } from "@/lib/demo-lab/characters";
import type { Environment } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";


/** Renders exactly one scene: environment, character, dialogue, interaction. */
export function SceneRenderer({
  controller,
  environments,
}: {
  controller: ExperienceController;
  environments: Environment[];
}) {
  const { scene, sceneState, complete, experience } = controller;
  const environment =
    environments.find((e) => e.id === scene.environmentId) ?? environments[0]!;
  const character = charactersById[experience.characterIds[0] ?? "ivy"];

  const baseEvidence = scene.evidence ?? [];
  const visibleEvidence = controller.evidenceRevealedByInstructor
    ? baseEvidence
    : baseEvidence.filter(
        (e) => !e.hiddenUntilRevealed || sceneState.revealedEvidence.includes(e.id),
      );


  return (
    <article className="space-y-4">
      <header>
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {experience.title}
        </p>
        <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">
          {scene.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{scene.objective}</p>
      </header>

      {character ? (
        <DialogueLayer
          character={character}
          characterState={controller.characterState}
          lines={scene.intro}
          visible={controller.dialogueVisible}
        />
      ) : null}

      {scene.interaction?.kind === "route-choice" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          <NeighborhoodRoute
            interaction={scene.interaction}
            controller={controller}
            environment={environment}
            character={character}
          />
          <aside className="space-y-3">
            <EvidencePanel items={visibleEvidence} title="Field notes" />
            {scene.retryPrompt ? (
              <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                {scene.retryPrompt}
              </p>
            ) : null}
          </aside>
        </div>
      ) : (
        <EnvironmentLayer
          environment={environment}
          character={character}
          characterState={controller.characterState}
          aside={
            <>
              <EvidencePanel items={visibleEvidence} title="On screen" />
              {scene.retryPrompt ? (
                <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                  {scene.retryPrompt}
                </p>
              ) : null}
            </>
          }
        >
          {scene.interaction ? (
            <InteractionLayer interaction={scene.interaction} controller={controller} />
          ) : (
            <p className="text-sm text-muted-foreground">
              This scene is defined in the experience configuration; its interaction is
              authored in a later pass.
            </p>
          )}
        </EnvironmentLayer>
      )}



      <div aria-live="polite" className="space-y-3">
        {complete && scene.successSummary ? (
          <p className="rounded-lg border border-evidence/40 bg-evidence/10 p-4 text-sm text-foreground">
            {scene.successSummary}
          </p>
        ) : null}
      </div>

      {scene.explanation ? (
        <div>
          {controller.explanationRevealed ? (
            <p className="rounded-lg border border-border p-4 text-sm leading-relaxed text-foreground">
              {scene.explanation}
            </p>
          ) : (
            <button
              type="button"
              onClick={controller.revealExplanation}
              className="min-h-11 rounded-md border border-border px-4 text-sm text-muted-foreground hover:border-primary/60 hover:text-foreground"
            >
              Show the reasoning
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}
