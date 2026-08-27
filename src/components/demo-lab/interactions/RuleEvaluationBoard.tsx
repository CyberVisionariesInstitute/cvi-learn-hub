import { IvyNote, StatusPill, SurfaceHeading } from "./parts";
import { cn } from "@/lib/utils";
import type { FirewallRule, RuleEvaluationInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Reusable ordered rule ledger + traffic evaluation.
 *
 * Predict → evaluate lowest priority number first → first match wins → later
 * rules stay visibly UNEVALUATED → choose the narrowest defensible fix.
 * State is carried by text labels, never by colour alone.
 */
export function RuleEvaluationBoard({
  interaction,
  controller,
}: {
  interaction: RuleEvaluationInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, markUsed, setCharacterState } = controller;

  const predictionId = sceneState.answers[`${interaction.id}:prediction`];
  const prediction = interaction.prediction.options.find((o) => o.id === predictionId);
  const evaluated = sceneState.used.includes(`${interaction.id}:evaluate`);
  const remediationId = sceneState.answers[`${interaction.id}:remediation`];
  const remediation = interaction.remediation.options.find((o) => o.id === remediationId);
  const fixed = remediation?.correct === true;

  const matchedIndex = interaction.evaluation.steps.findIndex((s) =>
    s.result.toUpperCase().includes("MATCH"),
  );

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow={interaction.directionLabel}
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <ul className="flex flex-wrap gap-2" aria-label="Evaluation principles">
        {interaction.principles.map((p) => (
          <li
            key={p}
            className="rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1 font-display text-[0.68rem] tracking-[0.16em] text-foreground uppercase"
          >
            {p}
          </li>
        ))}
      </ul>

      <div className="grid min-w-0 gap-4 @4xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="min-w-0 space-y-4">
          <Ledger
            title={interaction.ledgerTitle}
            rules={interaction.rules}
            stepFor={(ruleId) => {
              if (!evaluated) return undefined;
              const index = interaction.evaluation.steps.findIndex(
                (s) => s.ruleId === ruleId,
              );
              if (index === -1) return { result: "Not in this evaluation", note: "" };
              const step = interaction.evaluation.steps[index]!;
              return { result: step.result, note: step.note };
            }}
            dimAfterIndex={evaluated ? matchedIndex : -1}
          />

          {fixed ? (
            <Ledger
              title={interaction.remediation.correctedTitle}
              rules={interaction.remediation.correctedRules}
              stepFor={() => undefined}
              dimAfterIndex={-1}
              corrected
            />
          ) : null}
          {fixed ? (
            <p className="border-l-2 border-evidence bg-evidence/10 p-3 text-sm text-foreground">
              {interaction.remediation.note}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <section
            className="rounded-sm border border-border bg-surface-raised/50 p-4 shadow-[var(--shadow-object)]"
            aria-label="Traffic under evaluation"
          >
            <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
              Traffic under evaluation
            </p>
            <p className="mt-1 text-sm text-foreground">{interaction.packet.label}</p>
            <p className="mt-2 font-mono text-xs break-words text-foreground">
              {interaction.packet.source} → {interaction.packet.destination} ·{" "}
              {interaction.packet.protocol} {interaction.packet.port}
            </p>
          </section>

          <Question
            step="1"
            prompt={interaction.prediction.prompt}
            options={interaction.prediction.options}
            chosenId={predictionId}
            onChoose={(id, correct) => {
              answer(`${interaction.id}:prediction`, id);
              setCharacterState(correct ? "ivy-nod" : "ivy-thinking");
            }}
          />

          <section
            className="rounded-sm border border-border bg-surface-raised/85 p-4 backdrop-blur-sm"
            aria-label="Run the evaluation"
          >
            <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
              Step 2 · Walk the ledger
            </p>
            <button
              type="button"
              onClick={() => {
                markUsed(`${interaction.id}:evaluate`);
                setCharacterState("ivy-point");
              }}
              aria-pressed={evaluated}
              className={cn(
                "tactile-control mt-3 min-h-11 w-full rounded-sm border px-3 text-sm",
                evaluated
                  ? "border-evidence/60 bg-evidence/10 text-foreground"
                  : "border-border text-foreground hover:border-primary/60",
              )}
            >
              {evaluated ? "Evaluation shown" : "Evaluate this traffic"}
            </button>
            <div aria-live="polite" className="mt-3 space-y-2">
              {evaluated ? (
                <>
                  <ol className="space-y-2">
                    {interaction.evaluation.steps.map((s, i) => {
                      const rule = interaction.rules.find((r) => r.id === s.ruleId);
                      return (
                        <li
                          key={s.ruleId}
                          className="rounded-sm border border-border bg-terminal/70 p-2.5"
                        >
                          <p className="font-mono text-xs text-foreground">
                            {i + 1}. Priority {rule?.priority} — {rule?.name}
                          </p>
                          <p className="mt-1">
                            <StatusPill
                              tone={
                                s.result.toUpperCase().includes("UNEVALUATED")
                                  ? "unproven"
                                  : s.result.toUpperCase().includes("DENY")
                                    ? "failed"
                                    : "attention"
                              }
                            >
                              {s.result}
                            </StatusPill>
                          </p>
                          {s.note ? (
                            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                  <p className="font-display text-sm text-foreground">
                    Verdict: {interaction.evaluation.verdict}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {interaction.evaluation.summary}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Predict first. The ledger is not evaluated until the room commits to
                  an answer.
                </p>
              )}
            </div>
          </section>

          {evaluated ? (
            <Question
              step="3"
              prompt={interaction.remediation.prompt}
              options={interaction.remediation.options}
              chosenId={remediationId}
              onChoose={(id, correct) => {
                answer(`${interaction.id}:remediation`, id);
                setCharacterState(correct ? "ivy-nod" : "ivy-thinking");
              }}
            />
          ) : null}

          <div aria-live="polite">
            {prediction?.correct && evaluated && fixed ? (
              <IvyNote headline={interaction.completion.headline} tone="proven">
                <p>{interaction.completion.body}</p>
              </IvyNote>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ledger({
  title,
  rules,
  stepFor,
  dimAfterIndex,
  corrected = false,
}: {
  title: string;
  rules: FirewallRule[];
  stepFor: (ruleId: string) => { result: string; note: string } | undefined;
  dimAfterIndex: number;
  corrected?: boolean;
}) {
  return (
    <section
      className={cn(
        "monitor-surface min-w-0 overflow-hidden rounded-md",
        corrected && "border border-evidence/40",
      )}
      aria-label={title}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-2 text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
        <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary" />
        {title}
      </div>
      <ol className="divide-y divide-border/40">
        {rules.map((rule, index) => {
          const step = stepFor(rule.id);
          const unevaluated =
            dimAfterIndex >= 0 && index > dimAfterIndex && !rule.locked;
          return (
            <li key={rule.id} className="p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-sm text-foreground">
                  Priority {rule.priority}
                </span>
                <StatusPill tone={rule.action === "ALLOW" ? "proven" : "failed"}>
                  {rule.action}
                </StatusPill>
                <span className="text-sm text-foreground">{rule.name}</span>
                {rule.locked ? (
                  <StatusPill tone="neutral">Protected baseline — do not edit</StatusPill>
                ) : null}
              </div>
              <p className="mt-1 font-mono text-xs break-words text-muted-foreground">
                source {rule.source} → destination {rule.destination} · {rule.protocol}{" "}
                port {rule.port}
              </p>
              {step ? (
                <p className="mt-2">
                  <StatusPill
                    tone={
                      step.result.toUpperCase().includes("UNEVALUATED")
                        ? "unproven"
                        : step.result.toUpperCase().includes("DENY")
                          ? "failed"
                          : "attention"
                    }
                  >
                    {step.result}
                  </StatusPill>
                </p>
              ) : unevaluated ? (
                <p className="mt-2">
                  <StatusPill tone="unproven">UNEVALUATED</StatusPill>
                </p>
              ) : null}
              {step?.note ? (
                <p className="mt-1 text-xs text-muted-foreground">{step.note}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Question({
  step,
  prompt,
  options,
  chosenId,
  onChoose,
}: {
  step: string;
  prompt: string;
  options: Array<{ id: string; label: string; correct: boolean; response: string }>;
  chosenId?: string | undefined;
  onChoose: (id: string, correct: boolean) => void;
}) {
  const chosen = options.find((o) => o.id === chosenId);
  return (
    <section
      className="rounded-sm border border-border bg-surface-raised/85 p-4 backdrop-blur-sm"
      aria-label={prompt}
    >
      <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
        Step {step}
      </p>
      <h3 className="mt-1 font-display text-sm text-foreground">{prompt}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((option) => (
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
                    ? "Supported by the ledger"
                    : "Hypothesis that does not fit the evidence"}
                </StatusPill>
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {chosen ? (
        <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-foreground">
          {chosen.response}
        </p>
      ) : null}
    </section>
  );
}
