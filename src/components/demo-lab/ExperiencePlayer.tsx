import { SceneNavigation } from "./SceneNavigation";
import { SceneRenderer } from "./SceneRenderer";
import { useExperienceState } from "@/lib/demo-lab/useExperienceState";
import type { Environment, Experience } from "@/lib/demo-lab/types";

/** Student-facing player. No instructor controls are rendered here. */
export function ExperiencePlayer({
  experience,
  environments,
}: {
  experience: Experience;
  environments: Environment[];
}) {
  const controller = useExperienceState(experience);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-5 py-8 sm:px-8">
      <SceneRenderer controller={controller} environments={environments} />
      <SceneNavigation controller={controller} />
    </div>
  );
}
