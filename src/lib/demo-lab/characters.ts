import type { Character, CharacterAsset, CharacterState } from "./types";

import ivyIdle from "@/assets/characters/ivy/ivy-idle.webp";
import ivyPoint from "@/assets/characters/ivy/ivy-point.webp";
import ivyThinking from "@/assets/characters/ivy/ivy-thinking.webp";
import ivyType from "@/assets/characters/ivy/ivy-type.webp";
import ivyBrief from "@/assets/characters/ivy/ivy-brief.webp";
import ivyPortrait from "@/assets/characters/ivy/ivy-portrait.webp";

/**
 * Character framework.
 *
 * Ivy's production stills are in the repo as transparent full-body cutouts.
 * Motion clips (webm/mp4) are still optional per state; when they land, add
 * `motionSources` next to the existing `staticSrc` and the layer will prefer
 * them unless the user requests reduced motion.
 *
 * Convention: src/assets/characters/ivy/<state>.<ext>
 */
const frame = (staticSrc: string, alt: string): CharacterAsset => ({
  staticSrc,
  alt,
});

const ivyAssets: Partial<Record<CharacterState, CharacterAsset>> = {
  "ivy-idle": frame(ivyIdle, "Ivy, Grid Technician, standing by"),
  "ivy-enter": frame(ivyIdle, "Ivy arriving on site"),
  "ivy-walk-left": frame(ivyIdle, "Ivy moving through the scene"),
  "ivy-walk-right": frame(ivyIdle, "Ivy moving through the scene"),
  "ivy-nod": frame(ivyIdle, "Ivy nodding in agreement"),
  "ivy-thinking": frame(ivyThinking, "Ivy thinking through the evidence"),
  "ivy-react": frame(ivyThinking, "Ivy reacting to a surprising result"),
  "ivy-point": frame(ivyPoint, "Ivy pointing out the route"),
  "ivy-whiteboard": frame(ivyPoint, "Ivy working at the whiteboard"),
  "ivy-type": frame(ivyType, "Ivy typing a command on her field tablet"),
  "ivy-working": frame(ivyType, "Ivy running diagnostics"),
  "ivy-read-screen": frame(ivyType, "Ivy reading output on her screen"),
  "ivy-briefing": frame(ivyBrief, "Ivy briefing the room"),
};

export const ivy: Character = {
  id: "ivy",
  name: "Ivy",
  role: "Grid Technician",
  accentToken: "signal",
  assets: ivyAssets,
  portraitSrc: ivyPortrait,
};

export const cyberfoundationsCharacters: Character[] = [ivy];

export const pkiCharacters: Character[] = [];

export const charactersById: Record<string, Character> = {
  ivy,
};
