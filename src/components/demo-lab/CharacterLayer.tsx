import { useEffect, useState } from "react";
import type { Character, CharacterState } from "@/lib/demo-lab/types";

function usePrefersReducedMotion() {
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

const stateDescription: Partial<Record<CharacterState, string>> = {
  "ivy-idle": "standing by",
  "ivy-enter": "arriving",
  "ivy-walk-left": "walking",
  "ivy-walk-right": "walking",
  "ivy-working": "working",
  "ivy-type": "typing",
  "ivy-read-screen": "reading the screen",
  "ivy-point": "pointing at the screen",
  "ivy-whiteboard": "at the whiteboard",
  "ivy-thinking": "thinking",
  "ivy-react": "reacting",
  "ivy-nod": "nodding",
  "ivy-briefing": "briefing the room",
};

/**
 * Character presentation layer. Motion is optional, skippable and never
 * blocks progress; without a motion asset a static or typographic marker
 * is used instead.
 */
export function CharacterLayer({
  character,
  state,
  compact,
}: {
  character: Character;
  state: CharacterState;
  compact?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const asset = character.assets?.[state];
  const description = stateDescription[state] ?? "present";
  const useMotion = Boolean(asset?.motionSrc) && !reducedMotion;

  return (
    <figure
      className="flex items-center gap-3"
      data-character={character.id}
      data-character-state={state}
    >
      <div
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/50 bg-surface-raised"
        aria-hidden={Boolean(asset)}
      >
        {useMotion && asset?.motionSrc ? (
          <video
            className="size-full object-cover"
            src={asset.motionSrc}
            poster={asset.staticSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : asset?.staticSrc ? (
          <img src={asset.staticSrc} alt={asset.alt} className="size-full object-cover" />
        ) : (
          <span className="font-display text-sm font-semibold text-primary">
            {character.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      {!compact && (
        <figcaption className="text-xs">
          <span className="block font-display text-sm text-foreground">
            {character.name}
          </span>
          <span className="text-muted-foreground">
            {character.role} — {description}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
