import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToolBench } from "./interactions/ToolBench";
import { LadderBoard } from "./interactions/LadderBoard";
import { AccessChain } from "./interactions/AccessChain";
import { Investigation } from "./interactions/Investigation";
import { SshDiagnostic } from "./interactions/SshDiagnostic";
import { IncidentBoard } from "./interactions/IncidentBoard";
import { BriefingBoard } from "./interactions/BriefingBoard";
import { InvestigationRequestBoard } from "./interactions/InvestigationRequestBoard";
import { RuleEvaluationBoard } from "./interactions/RuleEvaluationBoard";
import { TestComparisonPanel } from "./interactions/TestComparisonPanel";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";
import type {
  ClassifyInteraction,
  Interaction,
  SelectObjectInteraction,
  TerminalInteraction,
} from "@/lib/demo-lab/types";

/* ------------------------------------------------------------------ */
/* Classify: select an object, then choose how it behaves.             */
/* Works with mouse, keyboard and touch — no drag required.            */
/* ------------------------------------------------------------------ */

function ClassifyRenderer({
  interaction,
  controller,
}: {
  interaction: ClassifyInteraction;
  controller: ExperienceController;
}) {
  const [selectedItem, setSelectedItem] = useState<string | null>(
    interaction.items[0]?.id ?? null,
  );
  const { sceneState, answer, revealEvidenceIds } = controller;

  const active = interaction.items.find((i) => i.id === selectedItem) ?? null;
  const activeAnswer = active ? sceneState.answers[active.id] : undefined;
  const response = active && activeAnswer ? active.responses[activeAnswer] : undefined;

  function choose(optionId: string) {
    if (!active) return;
    answer(active.id, optionId);
    const reveals = active.responses[optionId]?.revealsEvidenceIds ?? [];
    revealEvidenceIds(reveals);
  }

  return (
    <div>
      <h2 className="font-display text-lg text-foreground">{interaction.prompt}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{interaction.instruction}</p>
      {interaction.scopeNote ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
          {interaction.scopeNote}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 @2xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <ul className="space-y-2" aria-label="Destinations">
          {interaction.items.map((item) => {
            const chosen = sceneState.answers[item.id];
            const chosenOption = interaction.options.find((o) => o.id === chosen);
            const isSelected = item.id === selectedItem;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(item.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-h-14 w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/15"
                      : "border-border bg-surface-raised/50 hover:border-primary/60",
                  )}
                >
                  <span className="block font-mono text-sm text-foreground">
                    {item.label}
                  </span>
                  {item.detail ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {chosenOption ? `Answer: ${chosenOption.label}` : "Not answered yet"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div>
          {active ? (
            <fieldset className="rounded-md border border-border bg-surface-raised/40 p-4">
              <legend className="px-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {active.label}
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {interaction.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-pressed={activeAnswer === option.id}
                    className={cn(
                      "min-h-14 rounded-md border px-3 py-2.5 text-left transition-colors",
                      activeAnswer === option.id
                        ? "border-primary bg-primary/15"
                        : "border-border hover:border-primary/60",
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div aria-live="polite" className="mt-4">
            {response ? (
              <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
                <p className="font-display text-sm text-foreground">
                  {response.headline}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {response.body}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pick an answer to see what it would actually do.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SelectObjectRenderer({
  interaction,
  controller,
}: {
  interaction: SelectObjectInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed } = controller;
  const last = interaction.objects.find(
    (o) => o.id === sceneState.used[sceneState.used.length - 1],
  );
  return (
    <div>
      <h2 className="font-display text-lg text-foreground">{interaction.prompt}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{interaction.instruction}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {interaction.objects.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => markUsed(o.id)}
            className="min-h-14 rounded-md border border-border px-4 py-2.5 text-left hover:border-primary/60"
          >
            <span className="block text-sm text-foreground">{o.label}</span>
            {o.detail ? (
              <span className="block text-xs text-muted-foreground">{o.detail}</span>
            ) : null}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 text-sm text-foreground">
        {last?.result ?? ""}
      </p>
    </div>
  );
}

function TerminalRenderer({
  interaction,
  controller,
}: {
  interaction: TerminalInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed } = controller;
  return (
    <div>
      <h2 className="font-display text-lg text-foreground">{interaction.prompt}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{interaction.instruction}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {interaction.commands.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => markUsed(c.id)}
            className="min-h-11 rounded-md border border-border px-3 py-2 font-mono text-sm hover:border-primary/60"
          >
            {c.command}
          </button>
        ))}
      </div>
      <pre
        aria-live="polite"
        className="mt-4 overflow-x-auto rounded-md bg-terminal p-4 font-mono text-sm text-terminal-foreground"
      >
        {interaction.commands
          .filter((c) => sceneState.used.includes(c.id))
          .flatMap((c) => [`$ ${c.command}`, ...c.output, ""])
          .join("\n")}
      </pre>
    </div>
  );
}

/**
 * Renderer registry — add new interaction patterns here.
 * `route-choice` is not listed: it owns the whole environment stage and is
 * mounted directly by SceneRenderer.
 */
export function InteractionLayer({
  interaction,
  controller,
}: {
  interaction: Interaction;
  controller: ExperienceController;
}) {
  switch (interaction.kind) {
    case "classify":
      return <ClassifyRenderer interaction={interaction} controller={controller} />;
    case "select-object":
      return <SelectObjectRenderer interaction={interaction} controller={controller} />;
    case "terminal":
      return <TerminalRenderer interaction={interaction} controller={controller} />;
    case "tool-terminal":
      return <ToolBench interaction={interaction} controller={controller} />;
    case "sequence":
      return <LadderBoard interaction={interaction} controller={controller} />;
    case "evidence-select":
      return <AccessChain interaction={interaction} controller={controller} />;
    case "investigation":
      return <Investigation interaction={interaction} controller={controller} />;
    case "three-state":
      return <SshDiagnostic interaction={interaction} controller={controller} />;
    case "evidence-sort":
      return <IncidentBoard interaction={interaction} controller={controller} />;
    case "briefing":
      return <BriefingBoard interaction={interaction} controller={controller} />;
    case "investigation-request":
      return (
        <InvestigationRequestBoard interaction={interaction} controller={controller} />
      );
    case "rule-evaluation":
      return <RuleEvaluationBoard interaction={interaction} controller={controller} />;
    case "test-comparison":
      return <TestComparisonPanel interaction={interaction} controller={controller} />;
    default:
      return null;
  }
}

