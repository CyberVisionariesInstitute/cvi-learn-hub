import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BriefingInteraction } from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

/**
 * Mission 08 — morning operations briefing.
 *
 * The presentation display is the dominant object in the room; evidence moves
 * from the prep table into the slide sections, and each correct placement
 * builds the actual slide. Status reads Briefing draft → Evidence aligned →
 * Ready to brief. No points, no celebration effects.
 */
export function BriefingBoard({
  interaction,
  controller,
}: {
  interaction: BriefingInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, answer, clearAnswers, setCharacterState } = controller;
  const [selected, setSelected] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  const placement = sceneState.answers;
  const placedRight = interaction.items.every(
    (i) => placement[i.id] === i.correctSectionId,
  );
  const confirmed = placement["__confirmed"] === "yes";
  const tray = interaction.items.filter((i) => !placement[i.id]);
  const placedCount = interaction.items.length - tray.length;

  const last = interaction.items.find((i) => i.id === lastId);
  const lastCorrect = last ? placement[last.id] === last.correctSectionId : false;

  const statement = interaction.sections
    .flatMap((section) =>
      interaction.items
        .filter((i) => i.correctSectionId === section.id)
        .map((i) => i.statementFragment),
    )
    .join(" ");

  const status = confirmed
    ? "Ready to brief"
    : placedRight
      ? "Evidence aligned"
      : "Briefing draft";

  function place(itemId: string, sectionId: string) {
    answer(itemId, sectionId);
    setSelected(null);
    setLastId(itemId);
    const item = interaction.items.find((i) => i.id === itemId);
    setCharacterState(
      item && item.correctSectionId === sectionId ? "ivy-briefing" : "ivy-thinking",
    );
    if (placement["__confirmed"]) clearAnswers((k) => k === "__confirmed");
  }

  return (
    <div
      className={cn(
        "scene-depth space-y-4 transition-[filter] duration-1000 ease-out motion-reduce:transition-none",
        confirmed && "brightness-110",
      )}
    >
      {/* The presentation display dominates the room. */}
      <section className="monitor-surface relative mx-auto w-full rounded-[0.25rem] p-4 sm:p-6">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-2">
          <h2 className="font-display text-sm tracking-[0.2em] text-foreground uppercase">
            {interaction.prompt}
          </h2>
          <p className="text-[0.65rem] tracking-[0.2em] text-primary uppercase">
            {status} · {placedCount}/{interaction.items.length}
          </p>
        </header>

        <div className="mt-4 grid gap-4 @3xl:grid-cols-3">
          {interaction.sections.map((section) => {
            const placed = interaction.items.filter(
              (i) => placement[i.id] === section.id,
            );
            const sectionReady =
              placed.length > 0 &&
              placed.every((i) => i.correctSectionId === section.id);
            return (
              <section
                key={section.id}
                aria-label={section.label}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) place(id, section.id);
                }}
                className={cn(
                  "min-h-44 min-w-0 border-t-2 pt-2 transition-colors duration-500 motion-reduce:transition-none",
                  sectionReady ? "border-primary" : "border-border/70",
                )}
              >
                <h3
                  className={cn(
                    "font-display text-[0.7rem] tracking-[0.18em] uppercase",
                    sectionReady ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {section.label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {section.description}
                </p>
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => selected && place(selected, section.id)}
                  className="tactile-control mt-3 min-h-11 w-full rounded-[0.12rem] border border-dashed border-border px-2 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground disabled:opacity-40"
                >
                  {selected ? "Add to this section" : "Select evidence first"}
                </button>
                <ul className="mt-3 space-y-2">
                  {placed.map((item) => {
                    const ok = item.correctSectionId === section.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            clearAnswers((k) => k === item.id || k === "__confirmed");
                            setSelected(item.id);
                          }}
                          className={cn(
                            "settle-in w-full rounded-[0.12rem] border-l-2 bg-background/40 px-3 py-2 text-left text-sm",
                            ok
                              ? "border-primary text-foreground"
                              : "border-amber text-foreground",
                          )}
                        >
                          <span className="block">
                            {ok ? item.statementFragment : item.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {ok ? "On the slide — select to move" : "Ivy would move this"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {placedRight ? (
          <div aria-live="polite" className="settle-in mt-5 border-t border-border/60 pt-4">
            <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
              {confirmed ? interaction.completion.banner : "Assembled analyst statement"}
            </h3>
            <p className="mt-3 border-l-2 border-primary pl-4 text-base leading-relaxed text-foreground">
              {statement}
            </p>
            {confirmed ? (
              <p className="mt-3 pl-4 text-sm text-muted-foreground">
                “{interaction.completion.finalLine}” — {interaction.completion.body}
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  {interaction.confirm.prompt}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    answer("__confirmed", "yes");
                    setCharacterState("ivy-briefing");
                  }}
                  className="tactile-control mt-3 min-h-11 rounded-[0.15rem] bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  {interaction.confirm.action}
                </button>
              </>
            )}
          </div>
        ) : null}
      </section>

      {/* Briefing prep table */}
      <div className="rounded-[0.15rem] border-t-2 border-primary/40 bg-background/45 p-3">
        <h3 className="font-display text-xs tracking-[0.2em] text-foreground uppercase">
          Briefing prep table
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{interaction.instruction}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {tray.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              All evidence is on the display.
            </li>
          ) : null}
          {tray.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", item.id);
                  setSelected(item.id);
                }}
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                aria-pressed={selected === item.id}
                className={cn(
                  "pinned-card lift-on-select min-h-14 max-w-72 rounded-[0.12rem] border px-3 py-2 text-left text-sm",
                  index % 2 ? "[--card-tilt:0.7deg]" : "[--card-tilt:-0.8deg]",
                  selected === item.id
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-surface-raised/70 text-foreground hover:border-primary/60",
                )}
              >
                <span className="block">{item.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {selected === item.id
                    ? "Selected — choose a section"
                    : "Select to place"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div aria-live="polite">
        {last && placement[last.id] && !placedRight ? (
          <p
            className={cn(
              "border-l-2 pl-3 text-sm text-foreground",
              lastCorrect ? "border-evidence/60" : "border-amber",
            )}
          >
            {last.explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
}
