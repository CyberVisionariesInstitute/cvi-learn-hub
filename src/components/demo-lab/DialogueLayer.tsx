import { CharacterLayer } from "./CharacterLayer";
import type { Character, CharacterState, DialogueLine } from "@/lib/demo-lab/types";

/**
 * Dialogue is context, not narration. It never covers the interaction and it
 * can be hidden entirely from the instructor console.
 */
export function DialogueLayer({
  character,
  characterState,
  lines,
  visible,
  opaque = false,
}: {
  character: Character;
  characterState: CharacterState;
  lines: DialogueLine[];
  visible: boolean;
  /** Readability-first scenes use a fully opaque, high-contrast surface. */
  opaque?: boolean;
}) {
  if (!visible || lines.length === 0) return null;

  return (
    <div
      className={
        opaque
          ? "rounded-lg border border-border bg-card p-4 text-card-foreground"
          : "glass-panel rounded-lg p-4"
      }
    >
      <CharacterLayer character={character} state={characterState} />
      <div className="mt-3 space-y-3">
        {lines.map((line) => (
          <p key={line.id} className="text-sm leading-relaxed text-foreground">
            <span className="sr-only">{line.speaker} says: </span>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
