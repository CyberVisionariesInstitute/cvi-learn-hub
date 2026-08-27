import { IvyNote, StatusPill, SurfaceHeading } from "./parts";
import { cn } from "@/lib/utils";
import type { InvestigationRequestInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Reusable "ask before you change" board.
 *
 * An incident ticket arrives incomplete. Students request evidence questions
 * one at a time; every answer stays on the board. Nothing is changed in this
 * interaction — that is the point. Click/tap and keyboard only, no drag.
 */
export function InvestigationRequestBoard({
  interaction,
  controller,
}: {
  interaction: InvestigationRequestInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, revealEvidenceIds, setCharacterState } = controller;
  const asked = sceneState.used;

  const essential = interaction.questions.filter((q) => q.essential);
  const askedEssential = essential.filter((q) => asked.includes(q.id)).length;
  const done = askedEssential === essential.length;

  function ask(id: string) {
    const question = interaction.questions.find((q) => q.id === id);
    if (!question || asked.includes(id)) return;
    markUsed(id);
    revealEvidenceIds(question.revealsEvidenceIds ?? []);
    setCharacterState(question.essential ? "ivy-nod" : "ivy-thinking");
  }

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Cloud Heights guard post"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="grid min-w-0 gap-4 @3xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section
          className="min-w-0 rounded-sm border border-border bg-surface-raised/85 p-4 shadow-[var(--shadow-object)] backdrop-blur-sm"
          aria-label={`Incident ticket ${interaction.ticket.ref}`}
        >
          <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
            Incident ticket · {interaction.ticket.ref}
          </p>
          <h3 className="mt-1 font-display text-sm text-foreground">
            {interaction.ticket.title}
          </h3>
          <dl className="mt-3 space-y-1.5">
            {interaction.ticket.rows.map((row) => (
              <div key={row.label} className="flex flex-wrap gap-x-2 text-sm">
                <dt className="text-muted-foreground">{row.label}:</dt>
                <dd className="font-mono text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-l-2 border-amber bg-amber/10 p-3 text-sm text-foreground">
            {interaction.ticket.note}
          </p>
        </section>

        <div className="min-w-0 space-y-3">
          <p className="text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
            Evidence requests · {askedEssential} of {essential.length} essential
            questions asked
          </p>
          <ul className="space-y-2">
            {interaction.questions.map((question) => {
              const isAsked = asked.includes(question.id);
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    onClick={() => ask(question.id)}
                    aria-pressed={isAsked}
                    className={cn(
                      "tactile-control min-h-14 w-full rounded-sm border px-3 py-2.5 text-left",
                      isAsked
                        ? "border-evidence/60 bg-evidence/10"
                        : "border-border hover:border-primary/60",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-foreground">{question.label}</span>
                      <StatusPill tone={isAsked ? "proven" : "neutral"}>
                        {isAsked ? "Answered" : "Not asked yet"}
                      </StatusPill>
                    </span>
                    {isAsked ? (
                      <span className="mt-2 block font-mono text-xs text-foreground">
                        {question.answer}
                      </span>
                    ) : null}
                    {isAsked ? (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {question.response}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite">
            {done ? (
              <IvyNote headline={interaction.completion.headline} tone="proven">
                <p>{interaction.completion.body}</p>
              </IvyNote>
            ) : (
              <p className="border-l-2 border-primary/60 pl-3 text-sm text-muted-foreground">
                Answers stay on the board. Ask as many questions as the room wants —
                nothing is changed in this scene.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
