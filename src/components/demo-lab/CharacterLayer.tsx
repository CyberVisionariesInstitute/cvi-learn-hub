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
 * Neutral stand-in figure. Deliberately abstract: this is a placeholder for
 * production Ivy artwork, not a character design. It reads as a person-shaped
 * marker with a state indicator so scene blocking can be built and reviewed
 * before final art exists.
 */
function PlaceholderFigure({ state }: { state: CharacterState }) {
  return (
    <svg
      viewBox="0 0 60 140"
      className="size-full"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ivy-ph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="134" rx="20" ry="5" fill="oklch(0 0 0 / 45%)" />
      <circle cx="30" cy="20" r="12" fill="url(#ivy-ph)" />
      <path
        d="M30 34c-11 0-18 7-18 17v34h36V51c0-10-7-17-18-17Z"
        fill="url(#ivy-ph)"
      />
      <rect x="17" y="85" width="10" height="45" rx="5" fill="url(#ivy-ph)" />
      <rect x="33" y="85" width="10" height="45" rx="5" fill="url(#ivy-ph)" />
      {state === "ivy-point" ? (
        <rect
          x="42"
          y="48"
          width="26"
          height="7"
          rx="3.5"
          fill="var(--color-primary)"
          opacity="0.8"
        />
      ) : null}
      <circle
        cx="30"
        cy="55"
        r="3.5"
        fill="var(--color-primary)"
        opacity={state === "ivy-thinking" ? 1 : 0.6}
      />
    </svg>
  );
}

/**
 * Character presentation layer.
 *
 * Resolves per-state media in this order:
 *   1. motionSources (webm → mp4) when motion is allowed
 *   2. animatedSrc (animated WebP) when motion is allowed
 *   3. staticSrc (always used under prefers-reduced-motion)
 *   4. neutral placeholder figure
 *
 * The frame is a fixed box, so state changes never shift layout, and media is
 * pointer-events-none unless the character is explicitly interactive.
 */
export function CharacterLayer({
  character,
  state,
  variant = "portrait",
  className,
  interactive = false,
}: {
  character: Character;
  state: CharacterState;
  /** portrait = dialogue bust; figure = full-body in-scene presence. */
  variant?: "portrait" | "figure";
  className?: string;
  interactive?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const asset = character.assets?.[state];
  const description = characterStateDescription[state];
  const motion = !reducedMotion ? asset?.motionSources : undefined;
  const animated = !reducedMotion ? asset?.animatedSrc : undefined;
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
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden",
          frame,
          variant === "figure" &&
            "drop-shadow-[0_18px_12px_color-mix(in_oklab,var(--background)_65%,transparent)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
          variant === "figure" && state === "ivy-enter" && "translate-x-3 opacity-70",
          variant === "figure" && state === "ivy-thinking" && "-rotate-1 scale-[0.99]",
          variant === "figure" && state === "ivy-point" && "translate-x-1",
          variant === "figure" && state === "ivy-nod" && "-translate-y-0.5",
          !interactive && "pointer-events-none",
        )}
      >
        {motion?.length ? (
          <video
            key={state}
            className="size-full object-contain"
            poster={asset?.staticSrc}
            autoPlay
            muted
            playsInline
            aria-label={label}
          >
            {motion.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : animated ? (
          <img key={state} src={animated} alt={label} className="size-full object-contain" />
        ) : asset?.staticSrc ? (
          <img
            key={state}
            src={asset.staticSrc}
            alt={asset.alt}
            className="size-full object-contain"
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
