import { IvyNote, StatusPill, SurfaceHeading } from "./parts";
import { cn } from "@/lib/utils";
import type { TestComparisonInteraction, TestVerdict } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

const verdictTone: Record<TestVerdict, "proven" | "failed" | "attention"> = {
  ALLOWED: "proven",
  DENIED: "failed",
  SERVICE_NOT_LISTENING: "attention",
  TEST_ERROR: "attention",
};

/**
 * Reusable positive/negative test comparison.
 *
 * Each row reads source → protocol/port → verdict, and every verdict is
 * written out in words. Results persist so the pair can be compared and
 * interpreted together.
 */
export function TestComparisonPanel({
  interaction,
  controller,
}: {
  interaction: TestComparisonInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, markUsed, setCharacterState } = controller;

  const meaningId = sceneState.answers[`${interaction.id}:meaning`];
  const meaning = interaction.meaning.options.find((o) => o.id === meaningId);

  const allRun = interaction.tests.every((t) => sceneState.used.includes(t.id));

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Portal rule tester"
        title={interaction.prompt}
        instruction={interaction.instruction}
        note={interaction.testerNote}
      />

      <div className="grid min-w-0 gap-4 @4xl:grid-cols-2">
        {interaction.tests.map((test, index) => {
          const predictionKey = `${test.id}:prediction`;
          const chosenId = sceneState.answers[predictionKey];
          const chosen = test.options.find((o) => o.id === chosenId);
          const run = sceneState.used.includes(test.id);
          return (
            <section
              key={test.id}
              className="min-w-0 rounded-sm border border-border bg-surface-raised/50 p-4 shadow-[var(--shadow-object)]"
              aria-label={test.label}
            >
              <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
                Test {index + 1} · {test.label}
              </p>
              <p className="mt-2 font-mono text-xs break-words text-foreground">
                {test.source} → {test.destination} · {test.protocol} {test.port}
              </p>

              <h3 className="mt-3 font-display text-sm text-foreground">
                {test.predictionPrompt}
              </h3>
              <div className="mt-2 flex flex-col gap-2">
                {test.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      answer(predictionKey, option.id);
                      setCharacterState(option.correct ? "ivy-nod" : "ivy-thinking");
                    }}
                    aria-pressed={chosenId === option.id}
                    className={cn(
                      "tactile-control min-h-11 rounded-sm border px-3 py-2 text-left text-sm",
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
                            ? "Matches the result"
                            : "Hypothesis that does not fit the result"}
                        </StatusPill>
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {chosen ? (
                <p aria-live="polite" className="mt-2 text-sm text-foreground">
                  {chosen.response}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!chosenId}
                onClick={() => {
                  markUsed(test.id);
                  setCharacterState("ivy-read-screen");
                }}
                className="tactile-control mt-3 min-h-11 w-full rounded-sm border border-border px-3 text-sm text-foreground hover:border-primary/60 disabled:opacity-40"
              >
                {run ? "Result shown" : "Run this test"}
              </button>

              <div aria-live="polite" className="mt-3">
                {run ? (
                  <div className="rounded-sm border border-border bg-terminal/70 p-3">
                    <p className="font-mono text-xs text-foreground">
                      Verdict: {test.verdict}
                    </p>
                    <p className="mt-1">
                      <StatusPill tone={verdictTone[test.verdict]}>
                        {test.verdict.replaceAll("_", " ")}
                      </StatusPill>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {test.proves}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Result appears after the room predicts. Predictions can be revised.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section
        className="monitor-surface min-w-0 overflow-hidden rounded-md"
        aria-label="Paired proof"
      >
        <div className="border-b border-border/50 px-3 py-2 text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          Paired proof — source → protocol/port → verdict
        </div>
        <ul className="divide-y divide-border/40">
          {interaction.tests.map((test) => {
            const run = sceneState.used.includes(test.id);
            return (
              <li
                key={`row-${test.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3"
              >
                <span className="font-mono text-sm text-foreground">
                  {test.source} → {test.protocol} {test.port}
                </span>
                <StatusPill tone={run ? verdictTone[test.verdict] : "neutral"}>
                  {run ? test.verdict.replaceAll("_", " ") : "Not run yet"}
                </StatusPill>
              </li>
            );
          })}
        </ul>
      </section>

      {allRun ? (
        <section
          className="rounded-sm border border-border bg-surface-raised/40 p-4"
          aria-label={interaction.meaning.prompt}
        >
          <h3 className="font-display text-sm text-foreground">
            {interaction.meaning.prompt}
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            {interaction.meaning.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  answer(`${interaction.id}:meaning`, option.id);
                  setCharacterState(option.correct ? "ivy-nod" : "ivy-thinking");
                }}
                aria-pressed={meaningId === option.id}
                className={cn(
                  "tactile-control min-h-14 rounded-sm border px-3 py-2.5 text-left text-sm",
                  meaningId === option.id
                    ? option.correct
                      ? "border-evidence/70 bg-evidence/10"
                      : "border-amber/70 bg-amber/10"
                    : "border-border hover:border-primary/60",
                )}
              >
                <span className="block text-foreground">{option.label}</span>
                {meaningId === option.id ? (
                  <span className="mt-1 block">
                    <StatusPill tone={option.correct ? "proven" : "attention"}>
                      {option.correct
                        ? "Scoped to the evidence"
                        : "Claims more than the evidence supports"}
                    </StatusPill>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {meaning ? (
            <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-foreground">
              {meaning.response}
            </p>
          ) : null}
        </section>
      ) : null}

      <div aria-live="polite">
        {allRun && meaning?.correct ? (
          <IvyNote headline={interaction.completion.headline} tone="proven">
            <p>{interaction.completion.body}</p>
          </IvyNote>
        ) : null}
      </div>
    </div>
  );
}
