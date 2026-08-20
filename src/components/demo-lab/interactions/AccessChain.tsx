import { IvyNote, StatusPill, SurfaceHeading, TerminalView } from "./parts";
import { cn } from "@/lib/utils";
import type { EvidenceSelectInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/** Evidence selection that illuminates an access chain on the monitor. */
export function AccessChain({
  interaction,
  controller,
}: {
  interaction: EvidenceSelectInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, setCharacterState } = controller;
  const selected = (id: string) => sceneState.answers[id] === "selected";

  const provenChainIds = interaction.options
    .filter((o) => o.supported && o.chainId && selected(o.id))
    .map((o) => o.chainId!);

  const lastTouched = interaction.options.find(
    (o) => sceneState.used[sceneState.used.length - 1] === o.id,
  );

  const done = interaction.options
    .filter((o) => o.supported)
    .every((o) => selected(o.id));

  function toggle(id: string, supported: boolean) {
    answer(id, selected(id) ? "cleared" : "selected");
    controller.markUsed(id);
    setCharacterState(supported ? "ivy-point" : "ivy-thinking");
  }

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Access workstation"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="scene-depth grid gap-4 @3xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {interaction.terminal ? (
          <TerminalView lines={interaction.terminal.lines} label="Lobby workstation · remote shell" className="origin-bottom-left @3xl:rotate-y-2" />
        ) : null}

        <section
        className="monitor-surface origin-bottom-right rounded-md p-4 @3xl:-rotate-y-2"
        aria-label="Access path status display"
        >
        <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
          Access path
        </h3>
        <ol className="mt-3 flex flex-wrap items-stretch gap-2">
          {interaction.chain.map((node, i) => {
            const lit = provenChainIds.includes(node.id);
            return (
              <li key={node.id} className="flex items-center gap-2">
                <div
                  className={cn(
                     "rounded-sm border px-3 py-2 text-center transition-[background-color,box-shadow,transform] duration-300",
                    lit
                       ? "screen-refresh border-evidence/70 bg-evidence/15 shadow-[0_0_18px_color-mix(in_oklab,var(--evidence)_30%,transparent)]"
                      : "border-border bg-surface/60",
                  )}
                >
                  <span className="block text-xs text-foreground">{node.label}</span>
                  <span className="mt-1 block text-[0.65rem] text-muted-foreground">
                    {lit ? "Proven ✓" : "Not shown yet"}
                  </span>
                </div>
                {i < interaction.chain.length - 1 ? (
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        </section>
      </div>

      <fieldset>
        <legend className="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
          What does this shell already prove?
        </legend>
          <div className="mt-3 grid gap-2 @2xl:grid-cols-2">
          {interaction.options.map((option) => {
            const isOn = selected(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id, option.supported)}
                aria-pressed={isOn}
                className={cn(
                  "tactile-control min-h-14 rounded-sm border px-3 py-2.5 text-left font-mono",
                  isOn
                    ? option.supported
                      ? "border-evidence/70 bg-evidence/10"
                      : "border-amber/70 bg-amber/10"
                    : "border-border hover:border-primary/60",
                )}
              >
                <span className="block text-sm text-foreground">{option.label}</span>
                <span className="mt-1 block">
                  {isOn ? (
                    <StatusPill tone={option.supported ? "proven" : "attention"}>
                      {option.supported ? "Supported by the shell" : "Not shown by this evidence"}
                    </StatusPill>
                  ) : (
                    <StatusPill tone="unproven">Not selected</StatusPill>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="space-y-3">
        {lastTouched ? (
          <IvyNote
            headline={lastTouched.supported ? "That one holds" : "That one isn't in evidence"}
            tone={lastTouched.supported ? "proven" : "attention"}
          >
            <p>{lastTouched.response}</p>
          </IvyNote>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select every claim the shell prompt already supports.
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
