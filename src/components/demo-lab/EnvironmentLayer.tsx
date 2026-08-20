import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CharacterLayer } from "./CharacterLayer";
import type { Character, CharacterState, Environment } from "@/lib/demo-lab/types";

/** Where Ivy stands inside each kind of space, so staging matches the scene. */
const characterStagePosition: Record<Environment["surface"], string> = {
  monitor: "bottom-2 left-2 h-[46%] w-[13%] min-w-16 @3xl:left-4 @3xl:h-[58%]",
  "wall-display": "bottom-2 left-3 h-[52%] w-[14%] min-w-16 @3xl:h-[64%]",
  whiteboard: "bottom-24 right-3 h-[50%] w-[14%] min-w-16 @3xl:h-[62%]",
  "evidence-board": "bottom-24 right-3 h-[48%] w-[13%] min-w-16 @3xl:h-[60%]",
  terminal: "bottom-2 left-2 h-[44%] w-[12%] min-w-16 @3xl:h-[56%]",
};

const surfaceLabel: Record<Environment["surface"], string> = {
  monitor: "Workstation monitor",
  "wall-display": "Wall display",
  whiteboard: "Whiteboard",
  "evidence-board": "Evidence board",
  terminal: "Terminal",
};

/**
 * Renders the believable real-world space a scene takes place in, and mounts
 * the interactive UI onto a surface that exists inside that space.
 */
export function EnvironmentLayer({
  environment,
  children,
  aside,
  character,
  characterState = "ivy-idle",
}: {
  environment: Environment;
  children: ReactNode;
  aside?: ReactNode;
  /** In-scene figure; omit for environments that stage the character themselves. */
  character?: Character | undefined;
  characterState?: CharacterState;
}) {
  return (
    <section
      className="@container scene-depth relative min-h-[32rem] overflow-hidden rounded-xl border border-border/50 bg-surface/60 shadow-[var(--shadow-depth)]"
      aria-label={`Environment: ${environment.name}`}
    >
      {environment.backgroundSrc ? (
        <img
          src={environment.backgroundSrc}
          alt=""
          aria-hidden="true"
          className="absolute -inset-2 size-[calc(100%+1rem)] object-cover opacity-85 transition-transform duration-1000 ease-out hover:scale-[1.015] motion-reduce:transition-none"
        />
      ) : (
        <div
          aria-hidden="true"
          className="atmosphere absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, color-mix(in oklab, var(--surface) 20%, transparent), color-mix(in oklab, var(--background) 80%, transparent)), var(--atmosphere)",
          }}
        />
      )}

      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-background)/20_0%,transparent_34%,var(--color-background)/82_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 shadow-[inset_0_0_100px_color-mix(in_oklab,var(--background)_75%,transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-[-5%] bottom-[-2rem] h-24 rounded-[50%] bg-background/80 blur-2xl" />

      {character ? (
        <div
          className={cn(
            "pointer-events-none absolute z-0 transition-[left,right,bottom,opacity] duration-700 ease-out motion-reduce:transition-none",
            characterStagePosition[environment.surface],
          )}
        >
          <CharacterLayer character={character} state={characterState} variant="figure" />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[32rem] flex-col justify-end p-3 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-sm tracking-[0.18em] text-foreground uppercase">
            {environment.name}
          </h3>
          <p className="text-xs text-muted-foreground">{environment.description}</p>
        </div>

        <div className="mt-4 grid items-end gap-4 @5xl:grid-cols-[minmax(0,1fr)_18rem]">
          {/* The surface inside the environment that carries the interaction */}
          <div
            className={cn(
              "@container physical-surface relative max-h-[75vh] overflow-auto rounded-lg bg-surface/88 p-4 sm:p-6",
              environment.surface === "terminal" && "bg-terminal/80 font-mono",
              environment.surface === "monitor" && "@5xl:rotate-x-1 @5xl:-rotate-y-1",
              environment.surface === "whiteboard" && "@5xl:rotate-y-1",
            )}
          >
            <div className="mb-3 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-primary"
              />
              {surfaceLabel[environment.surface]}
            </div>
            {children}
          </div>
          {aside ? <div className="flex flex-col gap-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
