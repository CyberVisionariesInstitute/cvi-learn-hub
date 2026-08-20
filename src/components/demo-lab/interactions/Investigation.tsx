import { IvyNote, StatusPill, SurfaceHeading, TerminalView } from "./parts";
import { cn } from "@/lib/utils";
import type {
  InvestigationInteraction,
  InvestigationStep,
  TopologyStatus,
} from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";
import type { SceneState } from "@/lib/demo-lab/useExperienceState";

const statusLabel: Record<TopologyStatus, string> = {
  unknown: "Not tested",
  healthy: "Responding",
  "no-response": "No response",
  degraded: "Degraded",
};

const statusTone: Record<TopologyStatus, "neutral" | "proven" | "failed" | "attention"> =
  {
    unknown: "neutral",
    healthy: "proven",
    "no-response": "failed",
    degraded: "attention",
  };

function stepComplete(step: InvestigationStep, state: SceneState): boolean {
  if (step.kind === "choice") {
    return step.options.find((o) => o.id === state.answers[step.id])?.correct === true;
  }
  return step.commands.every((c) => state.used.includes(c.id));
}

/** Stepped reasoning: interpret, choose the next question, gather, conclude. */
export function Investigation({
  interaction,
  controller,
}: {
  interaction: InvestigationInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, markUsed, setCharacterState } = controller;

  const activeIndex = interaction.steps.findIndex((s) => !stepComplete(s, sceneState));
  const visibleSteps = interaction.steps.slice(
    0,
    activeIndex === -1 ? interaction.steps.length : activeIndex + 1,
  );

  const topology = interaction.topology.map((node) => {
    let status = node.initialStatus;
    let reading = node.initialReading;
    for (const step of interaction.steps) {
      if (step.kind !== "diagnostic") continue;
      for (const c of step.commands) {
        if (c.topologyUpdate?.nodeId === node.id && sceneState.used.includes(c.id)) {
          status = c.topologyUpdate.status;
          reading = c.topologyUpdate.reading;
        }
      }
    }
    return { ...node, status, reading };
  });

  const terminalLines: string[] = [
    `analyst@cf-student-07:~$ ${interaction.opening.command}`,
    ...interaction.opening.output,
    "",
  ];
  for (const step of interaction.steps) {
    if (step.kind !== "diagnostic") continue;
    for (const c of step.commands) {
      if (!sceneState.used.includes(c.id)) continue;
      terminalLines.push(`analyst@cf-student-07:~$ ${c.command}`, ...c.output, "");
    }
  }

  const done = activeIndex === -1;

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Network operations center"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="scene-depth space-y-4">
        <aside
          className="monitor-surface relative overflow-hidden rounded-md p-4 @4xl:min-h-72"
          aria-label="Topology wall"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49.8%,var(--color-border)_50%,transparent_50.2%)] opacity-30" />
          <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
            Live topology wall
          </h3>
          <ul className="relative mt-6 grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-4" aria-live="polite">
            {topology.map((node, index) => (
              <li key={node.id} className="relative flex min-h-28 flex-col justify-center rounded-sm border border-border/70 bg-terminal/80 p-3 text-center shadow-[var(--shadow-object)]">
                {index > 0 ? <span aria-hidden="true" className="absolute top-1/2 -left-4 hidden h-px w-4 bg-primary/60 @4xl:block" /> : null}
                <p className="text-sm text-foreground">{node.label}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{node.reading}</p>
                <p className="mt-2"><StatusPill tone={statusTone[node.status]}>{statusLabel[node.status]}</StatusPill></p>
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-4">
          <p className="border-l-2 border-destructive bg-destructive/10 p-3 text-sm text-foreground">
            {interaction.opening.caption}
          </p>
          <TerminalView key={sceneState.used.join(":")} lines={terminalLines} label="Telemetry console — cf-student-07" className="screen-refresh" />

          <div className="space-y-4">
            {visibleSteps.map((step, i) => {
              const isActive = i === visibleSteps.length - 1 && !done;
              return (
                <section
                  key={step.id}
                  className={cn(
                    "rounded-sm border p-4 shadow-[var(--shadow-object)]",
                    isActive
                      ? "border-primary/50 bg-surface-raised/60"
                      : "border-border bg-surface-raised/30",
                  )}
                  aria-label={step.prompt}
                >
                  <p className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                    Step {i + 1} of {interaction.steps.length}
                  </p>
                  <h3 className="mt-1 font-display text-sm text-foreground">
                    {step.prompt}
                  </h3>
                  {step.instruction ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.instruction}
                    </p>
                  ) : null}

                  {step.kind === "choice" ? (
                    <ChoiceStep
                      step={step}
                      chosenId={sceneState.answers[step.id]}
                      onChoose={(optionId, correct) => {
                        answer(step.id, optionId);
                        setCharacterState(correct ? "ivy-nod" : "ivy-thinking");
                      }}
                    />
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {step.commands.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              markUsed(c.id);
                              setCharacterState("ivy-read-screen");
                            }}
                            aria-pressed={sceneState.used.includes(c.id)}
                            className={cn(
                              "tactile-control min-h-11 rounded-sm border px-3 py-2 font-mono text-sm",
                              sceneState.used.includes(c.id)
                                ? "border-evidence/60 bg-evidence/10 text-foreground"
                                : "border-border text-foreground hover:border-primary/60",
                            )}
                          >
                            {c.command}
                            <span className="ml-2 font-sans text-[0.65rem] text-muted-foreground">
                              {sceneState.used.includes(c.id) ? "run" : "not run"}
                            </span>
                          </button>
                        ))}
                      </div>
                      <ul aria-live="polite" className="space-y-2">
                        {step.commands
                          .filter((c) => sceneState.used.includes(c.id))
                          .map((c) => (
                            <li key={c.id} className="text-sm text-foreground">
                              <span className="font-mono text-primary">{c.command}</span>
                              {" — "}
                              {c.proves}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {done ? (
            <IvyNote headline={interaction.completion.headline} tone="proven">
              <p>{interaction.completion.body}</p>
            </IvyNote>
          ) : null}
        </div>

          </div>
          <div className="space-y-4">{done ? <IvyNote headline={interaction.completion.headline} tone="proven"><p>{interaction.completion.body}</p></IvyNote> : <p className="border-l-2 border-primary/60 pl-3 text-sm text-muted-foreground">Work the active question beside the topology wall. New evidence stays visible so contradictions can be compared.</p>}</div>
        </div>
      </div>
    </div>
  );
}

function ChoiceStep({
  step,
  chosenId,
  onChoose,
}: {
  step: Extract<InvestigationStep, { kind: "choice" }>;
  chosenId?: string | undefined;
  onChoose: (optionId: string, correct: boolean) => void;
}) {
  const chosen = step.options.find((o) => o.id === chosenId);
  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-col gap-2">
        {step.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChoose(option.id, option.correct)}
            aria-pressed={chosenId === option.id}
            className={cn(
              "tactile-control min-h-14 rounded-sm border px-3 py-2.5 text-left text-sm",
              chosenId === option.id
                ? option.correct
                  ? "border-evidence/70 bg-evidence/10"
                  : "border-amber/70 bg-amber/10"
                : "border-border hover:border-primary/60",
            )}
          >
            <span className="block text-foreground">{option.label}</span>
            {chosenId === option.id ? (
              <span className="mt-1 block">
                <StatusPill tone={option.correct ? "proven" : "attention"}>
                  {option.correct
                    ? "Supported by evidence"
                    : option.assumption
                      ? "Unproven assumption"
                      : "Not supported yet"}
                </StatusPill>
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {chosen ? (
        <p aria-live="polite" className="text-sm leading-relaxed text-foreground">
          {chosen.response}
        </p>
      ) : null}
    </div>
  );
}
