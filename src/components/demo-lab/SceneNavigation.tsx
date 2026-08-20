import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Persistent scene navigation. Reset only ever affects the current scene —
 * there is no global reset required to recover from a mistake.
 */
export function SceneNavigation({ controller }: { controller: ExperienceController }) {
  const { sceneIndex, sceneCount, complete, scene } = controller;

  return (
    <nav
      aria-label="Scene navigation"
      className="glass-panel sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-lg p-3"
    >
      <button
        type="button"
        onClick={controller.previous}
        disabled={sceneIndex === 0}
        className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-primary/60 disabled:opacity-40"
      >
        Back
      </button>
      <button
        type="button"
        onClick={controller.resetScene}
        className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-primary/60"
      >
        Reset this scene
      </button>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        Scene {sceneIndex + 1} of {sceneCount}
        {complete ? " — objective met" : ""}
      </p>

      <button
        type="button"
        onClick={controller.next}
        disabled={sceneIndex >= sceneCount - 1}
        className="ml-auto min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {scene.continueLabel ?? "Continue"}
      </button>
    </nav>
  );
}
