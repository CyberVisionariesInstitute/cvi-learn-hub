import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Character, CharacterState } from "@/lib/demo-lab/types";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export const characterStateDescription: Record<CharacterState, string> = {
  "ivy-idle": "standing by",
  "ivy-enter": "arriving",
  "ivy-walk-left": "walking",
  "ivy-walk-right": "walking",
  "ivy-working": "working",
  "ivy-type": "typing",
  "ivy-read-screen": "reading the screen",
  "ivy-point": "pointing the way",
  "ivy-whiteboard": "at the whiteboard",
  "ivy-thinking": "thinking it over",
  "ivy-react": "reacting",
  "ivy-nod": "nodding",
  "ivy-briefing": "briefing the room",
};

/**
 * Fallback-only stand-in. Deliberately quiet and abstract: it marks where
 * approved artwork will stand, and is never presented as Ivy's design.
 */
function PlaceholderFigure({ state }: { state: CharacterState }) {
  return (
    <svg
      viewBox="0 0 60 140"
      className="size-full opacity-35"
      role="presentation"
      aria-hidden="true"
      data-character-placeholder="true"
    >
      <ellipse cx="30" cy="134" rx="18" ry="4" fill="oklch(0 0 0 / 35%)" />
      <circle cx="30" cy="20" r="11" fill="var(--color-muted-foreground)" opacity="0.35" />
      <path
        d="M30 34c-11 0-18 7-18 17v34h36V51c0-10-7-17-18-17Z"
        fill="var(--color-muted-foreground)"
        opacity="0.28"
      />
      <rect x="17" y="85" width="10" height="45" rx="5" fill="var(--color-muted-foreground)" opacity="0.28" />
      <rect x="33" y="85" width="10" height="45" rx="5" fill="var(--color-muted-foreground)" opacity="0.28" />
      {state === "ivy-point" ? (
        <rect x="42" y="48" width="24" height="6" rx="3" fill="var(--color-muted-foreground)" opacity="0.35" />
      ) : null}
    </svg>
  );
}

/**
 * Character presentation layer.
 *
 * Per-state media resolution:
 *   1. motionSources (webm → mp4) when motion is allowed
 *   2. animatedSrc (animated WebP) when motion is allowed
 *   3. staticSrc (always used under prefers-reduced-motion, and as poster)
 *   4. quiet fallback placeholder
 *
 * The frame is a fixed box, so state changes never shift layout, and media is
 * pointer-events-none unless the character is explicitly interactive, so it can
 * never intercept interaction hotspots.
 */
export function CharacterLayer({
  character,
  state,
  variant = "portrait",
  className,
  interactive = false,
  flip = false,
}: {
  character: Character;
  state: CharacterState;
  /** portrait = dialogue bust; figure = full-body in-scene presence. */
  variant?: "portrait" | "figure";
  className?: string;
  interactive?: boolean;
  /** Mirror the figure so she faces the surface she is working at. */
  flip?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const asset = character.assets?.[state];
  const [mediaFailed, setMediaFailed] = useState(false);
  useEffect(() => setMediaFailed(false), [state]);

  const description = characterStateDescription[state];
  const motion = !reducedMotion && !mediaFailed ? asset?.motionSources : undefined;
  const animated = !reducedMotion && !mediaFailed ? asset?.animatedSrc : undefined;
  const label = `${character.name}, ${character.role} — ${description}`;

  const frame =
    variant === "portrait"
      ? "size-12 rounded-full border border-primary/50 bg-surface-raised"
      : "h-full w-full";

  if (variant === "portrait" && character.portraitSrc) {
    return (
      <figure
        className={cn("flex items-center gap-3", className)}
        data-character={character.id}
        data-character-state={state}
      >
        <img
          src={character.portraitSrc}
          alt={label}
          className={cn(
            "size-12 shrink-0 rounded-full border border-primary/50 object-cover object-top",
            !interactive && "pointer-events-none",
          )}
        />
        <figcaption className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {character.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {character.role} — {description}
          </span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        variant === "portrait" ? "flex items-center gap-3" : "block h-full",
        className,
      )}
      data-character={character.id}
      data-character-state={state}
    >
      {/*
        Keyed on state so one-shot clips (enter, point, nod, react, read-screen)
        replay every time the state machine transitions, while ambient clips
        (idle, working, whiteboard, briefing) keep looping.
      */}
      <div
        key={state}
        data-character-state={state}
        className={cn(
          "ivy-clip relative flex shrink-0 items-center justify-center overflow-hidden",
          frame,
          variant === "figure" &&
            "drop-shadow-[0_18px_12px_color-mix(in_oklab,var(--background)_65%,transparent)] transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none",
          variant === "figure" &&
            (state === "ivy-react" || state === "ivy-point") &&
            "drop-shadow-[0_18px_16px_color-mix(in_oklab,var(--color-primary)_28%,transparent)]",
          flip && "-scale-x-100",
          !interactive && "pointer-events-none",
        )}
      >
        {motion?.length ? (
          <video
            key={`${state}-motion`}
            className="size-full object-contain object-bottom"
            poster={asset?.staticSrc}
            autoPlay
            muted
            playsInline
            loop={AMBIENT_STATES.includes(state)}
            onError={() => setMediaFailed(true)}
            aria-label={label}
          >
            {motion.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : animated ? (
          <img
            key={`${state}-anim`}
            src={animated}
            alt={label}
            onError={() => setMediaFailed(true)}
            className="size-full object-contain object-bottom"
          />
        ) : asset?.staticSrc ? (
          <img
            key={`${state}-still`}
            src={asset.staticSrc}
            alt={asset.alt}
            onError={() => setMediaFailed(true)}
            className={cn(
              "size-full object-contain",
              variant === "figure" && "object-bottom",
            )}
          />
        ) : (
          <PlaceholderFigure state={state} />
        )}
      </div>

      {variant === "portrait" ? (
        <figcaption className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {character.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {character.role} — {description}
          </span>
        </figcaption>
      ) : (
        <figcaption className="sr-only">{label}</figcaption>
      )}
    </figure>
  );
}

/** Holds that read as ambient; their clips loop, everything else plays once. */
const AMBIENT_STATES: CharacterState[] = [
  "ivy-idle",
  "ivy-working",
  "ivy-whiteboard",
  "ivy-briefing",
  "ivy-thinking",
];
