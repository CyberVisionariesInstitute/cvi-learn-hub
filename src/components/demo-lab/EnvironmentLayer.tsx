import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { CharacterLayer } from "./CharacterLayer";
import type {
  Character,
  CharacterStaging,
  CharacterState,
  Environment,
} from "@/lib/demo-lab/types";

/**
 * Default staging per kind of space. Scenes can override this with
 * `scene.characterStaging` — coordinates live in content, never in the
 * character component.
 */
const defaultStaging: Record<Environment["surface"], CharacterStaging> = {
  monitor: { x: 9, bottom: 2, height: 52, mobileX: 12, mobileHeight: 40 },
  "wall-display": { x: 10, bottom: 2, height: 58, mobileX: 13, mobileHeight: 42 },
  whiteboard: { x: 90, bottom: 6, height: 56, mobileX: 86, mobileHeight: 40, flip: true },
  "evidence-board": { x: 89, bottom: 6, height: 54, mobileX: 86, mobileHeight: 40, flip: true },
  terminal: { x: 8, bottom: 2, height: 50, mobileX: 12, mobileHeight: 38 },
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
  characterStaging,
  bareSurface = false,
  foreground,
}: {
  environment: Environment;
  children: ReactNode;
  aside?: ReactNode;
  /** In-scene figure; omit for environments that stage the character themselves. */
  character?: Character | undefined;
  characterState?: CharacterState;
  /** Scene-level override for figure scale/position. */
  characterStaging?: CharacterStaging;
  /** The interaction owns the room surface: drop the generic panel chrome. */
  bareSurface?: boolean;
  /** Optional in-room foreground cues (table edge, chair silhouettes). */
  foreground?: ReactNode;
}) {
  const isMobile = useIsMobile();
  const staging = characterStaging ?? defaultStaging[environment.surface];
  const x = (isMobile ? staging.mobileX : undefined) ?? staging.x;
  const bottom = (isMobile ? staging.mobileBottom : undefined) ?? staging.bottom ?? 2;
  const height = (isMobile ? staging.mobileHeight : undefined) ?? staging.height ?? 52;

  const figureStyle: CSSProperties = {
    left: `${x}%`,
    bottom: `${bottom}%`,
    height: `${height}%`,
    transform: "translateX(-50%)",
  };

  return (
    <section
      className="@container relative min-h-[32rem] overflow-hidden rounded-xl border border-border/50 bg-surface/60 shadow-[var(--shadow-depth)]"
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
          style={figureStyle}
          className={cn(
            "pointer-events-none absolute w-[14%] min-w-16 transition-[left,bottom,height,opacity] duration-700 ease-out motion-reduce:transition-none",
            staging.layer === "front" ? "z-20" : "z-0",
          )}
        >
          <CharacterLayer
            character={character}
            state={characterState}
            variant="figure"
            flip={staging.flip ?? false}
          />
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
              "@container relative max-h-[75vh] overflow-auto",
              bareSurface
                ? "rounded-none bg-transparent p-0"
                : cn(
                    "physical-surface rounded-lg bg-surface/88 p-4 sm:p-6",
                    environment.surface === "terminal" && "bg-terminal/80 font-mono",
                    environment.surface === "monitor" && "@5xl:rotate-x-1 @5xl:-rotate-y-1",
                    environment.surface === "whiteboard" && "@5xl:rotate-y-1",
                  ),
            )}
          >
            {bareSurface ? null : (
              <div className="mb-3 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 rounded-full bg-primary"
                />
                {surfaceLabel[environment.surface]}
              </div>
            )}
            {children}
          </div>
          {aside ? <div className="flex flex-col gap-4">{aside}</div> : null}
        </div>
      </div>

      {foreground ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {foreground}
        </div>
      ) : null}
    </section>
  );
}
