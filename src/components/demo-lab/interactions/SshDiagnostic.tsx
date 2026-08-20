import { useState } from "react";
import { IvyNote, StatusPill, SurfaceHeading, TerminalView } from "./parts";
import { cn } from "@/lib/utils";
import type { ThreeStateInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Two diagnostic dimensions, three states each, rendered as a diagnostic
 * monitor panel. Door 22 is a display metaphor, never a place.
 */
export function SshDiagnostic({
  interaction,
  controller,
}: {
  interaction: ThreeStateInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, setCharacterState } = controller;
  const { answers } = sceneState;

  const scenarioDone = (id: string) => {
    const s = interaction.scenarios.find((x) => x.id === id)!;
    return interaction.dimensions.every(
      (d) => answers[`${id}:${d.id}`] === s.correct[d.id],
    );
  };

  const firstOpen = interaction.scenarios.findIndex((s) => !scenarioDone(s.id));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const active = interaction.scenarios[Math.min(index, interaction.scenarios.length - 1)]!;
  const activeDone = scenarioDone(active.id);
  const allDone = interaction.scenarios.every((s) => scenarioDone(s.id));

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="SSH diagnostic monitor"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="scene-depth grid min-w-0 gap-4 @3xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <nav className="min-w-0" aria-label="Evidence scenarios">
          <h3 className="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            Captured messages
          </h3>
          <ul className="mt-2 space-y-2">
            {interaction.scenarios.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={i === index}
                  className={cn(
                    "tactile-control min-h-14 w-full rounded-sm border px-3 py-2 text-left",
                    i === index
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <span className="block font-mono text-xs text-foreground">
                    {s.output}
                  </span>
                  <span className="mt-1 block text-[0.65rem] text-muted-foreground">
                    {scenarioDone(s.id) ? "Classified" : "Not classified yet"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <TerminalView key={active.id} className="screen-refresh origin-bottom-left @3xl:rotate-y-2" lines={[`analyst@cf-jump:~$ ssh analyst@cf-student-07`, active.output]} />

          <section
            className="monitor-surface origin-bottom-right rounded-md p-4 @3xl:-rotate-y-2"
            aria-label={interaction.monitorTitle}
          >
            <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
              {interaction.monitorTitle}
            </h3>
              <div className="relative mt-3 space-y-4 before:absolute before:top-10 before:bottom-10 before:left-3 before:w-px before:bg-primary/40">
              {interaction.dimensions.map((dim) => {
                const chosen = answers[`${active.id}:${dim.id}`];
                const isCorrect = chosen === active.correct[dim.id];
                return (
                    <fieldset key={dim.id} className="relative pl-7 before:absolute before:top-2 before:left-1.5 before:size-3 before:rounded-full before:border before:border-primary before:bg-terminal">
                    <legend className="font-display text-sm text-foreground">
                      {dim.label}
                    </legend>
                    <p className="text-xs text-muted-foreground">{dim.question}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interaction.states.map((state) => (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => {
                            answer(`${active.id}:${dim.id}`, state.id);
                            setCharacterState(
                              state.id === active.correct[dim.id]
                                ? "ivy-nod"
                                : "ivy-thinking",
                            );
                          }}
                          aria-pressed={chosen === state.id}
                          className={cn(
                              "tactile-control min-h-11 rounded-sm border px-3 py-2 text-sm",
                            chosen === state.id
                              ? isCorrect
                                ? "border-evidence/70 bg-evidence/10 text-foreground"
                                : "border-amber/70 bg-amber/10 text-foreground"
                              : "border-border text-foreground hover:border-primary/60",
                          )}
                        >
                          <span aria-hidden="true" className="mr-1.5">
                            {state.glyph}
                          </span>
                          {state.label}
                        </button>
                      ))}
                    </div>
                    <p aria-live="polite" className="mt-2 text-sm text-foreground">
                      {chosen ? (
                        <>
                          <StatusPill tone={isCorrect ? "proven" : "attention"}>
                            {isCorrect ? "Matches the evidence" : "Read it again"}
                          </StatusPill>{" "}
                          {isCorrect ? "" : active.hints[dim.id]}
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Not classified yet.
                        </span>
                      )}
                    </p>
                  </fieldset>
                );
              })}
            </div>
          </section>

          <div aria-live="polite" className="space-y-3">
            {activeDone ? (
              <IvyNote headline="What had to be true for this message to appear" tone="proven">
                <p>{active.explanation}</p>
              </IvyNote>
            ) : null}
            {allDone ? (
              <>
                <IvyNote headline={interaction.completion.headline} tone="proven">
                  <p>{interaction.completion.body}</p>
                </IvyNote>
                <TerminalView
                  lines={interaction.completion.shell}
                  label="Remote shell — open"
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
