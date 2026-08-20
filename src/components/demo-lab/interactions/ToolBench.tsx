import { useMemo, useState } from "react";
import { IvyNote, StatusPill, SurfaceHeading, TerminalView } from "./parts";
import { cn } from "@/lib/utils";
import type { ToolTerminalInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Scene pattern: question → tool → simulated run → what it proves.
 * The tools live on a utility strip beside the monitors, not in a quiz card.
 */
export function ToolBench({
  interaction,
  controller,
}: {
  interaction: ToolTerminalInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, markUsed, setCharacterState } = controller;
  const { answers } = sceneState;

  const ticketDone = (id: string) => {
    const ticket = interaction.tickets.find((t) => t.id === id)!;
    const follow = ticket.followUp.options.find(
      (o) => o.id === answers[`${id}:follow`],
    );
    return answers[`${id}:tool`] === ticket.correctToolId && follow?.correct === true;
  };

  const firstOpen = interaction.tickets.findIndex((t) => !ticketDone(t.id));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const active =
    interaction.tickets[Math.min(index, interaction.tickets.length - 1)]!;

  const chosenToolId = answers[`${active.id}:tool`];
  const chosenTool = interaction.tools.find((t) => t.id === chosenToolId);
  const run = chosenToolId ? active.runs[chosenToolId] : undefined;
  const toolCorrect = chosenToolId === active.correctToolId;
  const followId = answers[`${active.id}:follow`];
  const followOption = active.followUp.options.find((o) => o.id === followId);

  const history = useMemo(() => {
    const lines: string[] = [];
    for (const ticket of interaction.tickets) {
      for (const tool of interaction.tools) {
        if (!sceneState.used.includes(`${ticket.id}:${tool.id}`)) continue;
        const r = ticket.runs[tool.id];
        if (!r) continue;
        lines.push(`analyst@cf-support:~$ ${r.command}`, ...r.output, "");
      }
    }
    return lines;
  }, [interaction, sceneState.used]);

  const completedRows = interaction.tickets
    .filter((t) => ticketDone(t.id))
    .map((t) => t.summaryRow);

  const allDone = completedRows.length === interaction.tickets.length;

  function chooseTool(toolId: string) {
    answer(`${active.id}:tool`, toolId);
    markUsed(`${active.id}:${toolId}`);
    setCharacterState(toolId === active.correctToolId ? "ivy-read-screen" : "ivy-thinking");
  }

  return (
    <div className="space-y-5">
      <SurfaceHeading
        eyebrow="Support desk"
        title={interaction.prompt}
        instruction={interaction.instruction}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="space-y-4">
          {/* Ticket monitor */}
          <section
            className="rounded-lg border border-border bg-surface-raised/50 p-4"
            aria-label="Support ticket"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-xs text-primary">TICKET {active.ref}</p>
              <p className="text-xs text-muted-foreground">
                Ticket {index + 1} of {interaction.tickets.length}
                {ticketDone(active.id) ? " — resolved" : ""}
              </p>
            </div>
            <h3 className="mt-2 font-display text-base text-foreground">
              {active.question}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{active.body}</p>
          </section>

          <TerminalView lines={history} label="Terminal — cf-support" />

          <div aria-live="polite" className="space-y-3">
            {run ? (
              <IvyNote
                headline={`${chosenTool?.command} — what that actually showed`}
                tone={toolCorrect ? "proven" : "attention"}
              >
                <p>{run.verdict}</p>
                {!toolCorrect ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Useful evidence — it just answers a different question than this
                    ticket asked. Try another tool from the strip.
                  </p>
                ) : null}
              </IvyNote>
            ) : (
              <p className="text-sm text-muted-foreground">
                Read the question, then pick the tool you would actually reach for.
              </p>
            )}

            {toolCorrect ? (
              <fieldset className="rounded-md border border-border bg-surface-raised/40 p-4">
                <legend className="px-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  {active.followUp.prompt}
                </legend>
                <div className="mt-2 flex flex-col gap-2">
                  {active.followUp.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        answer(`${active.id}:follow`, option.id);
                        setCharacterState(option.correct ? "ivy-nod" : "ivy-thinking");
                      }}
                      aria-pressed={followId === option.id}
                      className={cn(
                        "min-h-14 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                        followId === option.id
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border text-foreground hover:border-primary/60",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {followOption ? (
                  <p className="mt-3 text-sm text-foreground">
                    <StatusPill tone={followOption.correct ? "proven" : "attention"}>
                      {followOption.correct ? "Supported" : "Not quite"}
                    </StatusPill>{" "}
                    {followOption.response}
                  </p>
                ) : null}
              </fieldset>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="min-h-11 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60 disabled:opacity-40"
            >
              Previous ticket
            </button>
            <button
              type="button"
              onClick={() =>
                setIndex((i) => Math.min(interaction.tickets.length - 1, i + 1))
              }
              disabled={
                index >= interaction.tickets.length - 1 || !ticketDone(active.id)
              }
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Next ticket
            </button>
          </div>
        </div>

        {/* Utility strip mounted beside the monitors */}
        <aside
          className="rounded-lg border border-border bg-surface/60 p-3"
          aria-label="Desk utility strip"
        >
          <h3 className="text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
            Utility strip
          </h3>
          <ul className="mt-3 space-y-2">
            {interaction.tools.map((tool) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => chooseTool(tool.id)}
                  aria-pressed={chosenToolId === tool.id}
                  className={cn(
                    "min-h-14 w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                    chosenToolId === tool.id
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <span className="block font-mono text-sm text-foreground">
                    {tool.command}
                  </span>
                  <span className="block text-[0.68rem] leading-snug text-muted-foreground">
                    {tool.purpose}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {completedRows.length ? (
        <section
          className="rounded-lg border border-border bg-surface-raised/40 p-4"
          aria-label="Question to tool to evidence summary"
        >
          <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
            Question → Tool → Evidence
          </h3>
          <ul className="mt-3 space-y-2">
            {completedRows.map((row) => (
              <li
                key={row.tool + row.question}
                className="grid gap-1 border-b border-border/50 pb-2 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.2fr)] sm:gap-3"
              >
                <span className="text-foreground">{row.question}</span>
                <span className="font-mono text-primary">{row.tool}</span>
                <span className="text-muted-foreground">{row.evidence}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {allDone ? (
        <IvyNote headline={interaction.completion.headline} tone="proven">
          <p>{interaction.completion.body}</p>
        </IvyNote>
      ) : null}
    </div>
  );
}
