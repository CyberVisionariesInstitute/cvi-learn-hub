import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { SceneRenderer } from "@/components/demo-lab/SceneRenderer";
import {
  experienceTypeLabels,
  getExperiencesForProgram,
  programs,
  statusLabels,
} from "@/lib/demo-lab/programs";
import { useExperienceState } from "@/lib/demo-lab/useExperienceState";
import type { Experience, Program, ProgramId } from "@/lib/demo-lab/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/instructor")({
  head: () => ({
    meta: [
      { title: "Instructor Console — CVI Demo Lab" },
      {
        name: "description",
        content:
          "Facilitation controls for running CVI Demo Lab experiences during live instruction.",
      },
      { property: "og:title", content: "Instructor Console — CVI Demo Lab" },
      {
        property: "og:description",
        content:
          "Facilitation controls for running CVI Demo Lab experiences during live instruction.",
      },
    ],
  }),
  component: InstructorConsole,
});

function InstructorConsole() {
  const [programId, setProgramId] = useState<ProgramId>("cyberfoundations");
  const program = programs.find((p) => p.id === programId)!;
  const available = getExperiencesForProgram(programId);
  const [experienceId, setExperienceId] = useState<string | null>(
    available[0]?.id ?? null,
  );
  const experience = available.find((e) => e.id === experienceId) ?? null;

  return (
    <DemoLabShell themeClass={program.themeClass} bare={false}>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Instructor mode</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
          Instructor Console
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Facilitation controls operate on this browser only. Student browsers are not
          synchronised and never see these controls.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Selectors
            programs={programs}
            program={program}
            onProgram={(id) => {
              setProgramId(id);
              setExperienceId(getExperiencesForProgram(id)[0]?.id ?? null);
            }}
            experiences={available}
            experienceId={experienceId}
            onExperience={setExperienceId}
          />
          {experience ? (
            <ExperienceConsole key={experience.id} experience={experience} />
          ) : (
            <p className="glass-panel rounded-lg p-6 text-sm text-muted-foreground">
              No experiences are published for this program yet.
            </p>
          )}
        </div>
      </div>
    </DemoLabShell>
  );
}

function Selectors({
  programs: allPrograms,
  program,
  onProgram,
  experiences,
  experienceId,
  onExperience,
}: {
  programs: Program[];
  program: Program;
  onProgram: (id: ProgramId) => void;
  experiences: Experience[];
  experienceId: string | null;
  onExperience: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <fieldset className="glass-panel rounded-lg p-4">
        <legend className="px-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Program
        </legend>
        <div className="mt-2 flex flex-col gap-2">
          {allPrograms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onProgram(p.id)}
              aria-pressed={p.id === program.id}
              className={cn(
                "min-h-11 rounded-md border px-3 text-left text-sm",
                p.id === program.id
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="glass-panel rounded-lg p-4">
        <legend className="px-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Experience
        </legend>
        <div className="mt-2 flex flex-col gap-2">
          {experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">None published yet.</p>
          ) : (
            experiences.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => onExperience(e.id)}
                aria-pressed={e.id === experienceId}
                className={cn(
                  "min-h-11 rounded-md border px-3 py-2 text-left text-sm",
                  e.id === experienceId
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="block">{e.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {experienceTypeLabels[e.type]} · {statusLabels[e.status]}
                </span>
              </button>
            ))
          )}
        </div>
      </fieldset>
    </div>
  );
}

function ExperienceConsole({ experience }: { experience: Experience }) {
  const controller = useExperienceState(experience);
  const [presenting, setPresenting] = useState(false);
  const program = programs.find((p) => p.id === experience.programId)!;

  const controls = [
    { label: "Previous", onClick: controller.previous },
    { label: "Next", onClick: controller.next },
    { label: "Reset scene", onClick: controller.resetScene },
    { label: "Reveal evidence", onClick: controller.revealEvidence },
    { label: "Reveal explanation", onClick: controller.revealExplanation },
    {
      label: controller.dialogueVisible ? "Hide dialogue" : "Show dialogue",
      onClick: controller.toggleDialogue,
    },
    { label: "Restart experience", onClick: controller.restart },
    {
      label: presenting ? "Exit present mode" : "Present",
      onClick: () => setPresenting((p) => !p),
    },
  ];

  return (
    <div className={cn("space-y-6", presenting && "fixed inset-0 z-50 overflow-auto bg-background p-3 sm:p-5")}>
      <section className={cn("glass-panel rounded-lg p-4", presenting && "sticky top-2 z-50 ml-auto w-fit border-primary/40 bg-background/90 p-2")}>
        <div className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-1", presenting && "sr-only")}>
          <h2 className="font-display text-lg text-foreground">{experience.title}</h2>
          <p className="text-xs text-muted-foreground">
            {experienceTypeLabels[experience.type]} · {statusLabels[experience.status]} ·
            ~{experience.estimatedMinutes} min
          </p>
        </div>
        <div className={cn("mt-4 flex flex-wrap gap-2", presenting && "mt-0")}>
          {controls.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.onClick}
              className={cn("min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:border-primary/60", presenting && !["Previous", "Next", "Exit present mode"].includes(c.label) && "hidden")}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className={cn("mt-3 text-xs text-muted-foreground", presenting && "sr-only")} aria-live="polite">
          Scene {controller.sceneIndex + 1} of {controller.sceneCount} · Evidence{" "}
          {controller.evidenceRevealedByInstructor ? "revealed" : "hidden"} · Explanation{" "}
          {controller.explanationRevealed ? "revealed" : "hidden"} · Dialogue{" "}
          {controller.dialogueVisible ? "shown" : "hidden"} ·{" "}
          {presenting ? "Presenting" : "Console view"}
        </p>
      </section>

      <div className={cn("grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]", presenting && "block")}>
        <nav className={cn("glass-panel rounded-lg p-4", presenting && "hidden")} aria-label="Jump to scene">
          <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Scenes
          </h3>
          <ol className="mt-3 space-y-2">
            {experience.scenes.map((scene, index) => (
              <li key={scene.id}>
                <button
                  type="button"
                  onClick={() => controller.jumpTo(index)}
                  aria-current={index === controller.sceneIndex ? "true" : undefined}
                  className={cn(
                    "min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm",
                    index === controller.sceneIndex
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="block">
                    {index + 1}. {scene.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {controller.sceneCompletion[index] ? "Complete" : "In progress"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {controller.scene.instructorNotes?.length ? (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Notes for this scene
              </h3>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {controller.scene.instructorNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {experience.instructorNotes?.length ? (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Mission notes
              </h3>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {experience.instructorNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </nav>

        <div className={cn(presenting && "mx-auto max-w-[110rem]")}>
          <SceneRenderer controller={controller} environments={program.environments} />
        </div>
      </div>
    </div>
  );
}
