import type { Character } from "./types";

/**
 * Character framework.
 *
 * Production media is NOT in the repository yet. `plannedAssets` documents the
 * exact slots the art pass must fill; `assets` stays empty until real files
 * land, so the player renders the neutral placeholder figure instead of
 * pretending a stand-in is final artwork.
 *
 * Convention: src/assets/characters/ivy/<state>.<ext>
 *   ivy-idle.webp      static / reduced-motion frame  (required per state)
 *   ivy-idle.webm      transparent motion             (optional)
 *   ivy-idle.mp4       motion fallback                (optional)
 */
const ivySlot = (state: string) => [
  `src/assets/characters/ivy/${state}.webp`,
  `src/assets/characters/ivy/${state}.webm`,
  `src/assets/characters/ivy/${state}.mp4`,
];

export const ivy: Character = {
  id: "ivy",
  name: "Ivy",
  role: "Grid Technician",
  accentToken: "signal",
  assets: {},
  plannedAssets: {
    "ivy-enter": ivySlot("ivy-enter"),
    "ivy-idle": ivySlot("ivy-idle"),
    "ivy-thinking": ivySlot("ivy-thinking"),
    "ivy-point": ivySlot("ivy-point"),
    "ivy-nod": ivySlot("ivy-nod"),
    "ivy-walk-left": ivySlot("ivy-walk-left"),
    "ivy-walk-right": ivySlot("ivy-walk-right"),
    "ivy-react": ivySlot("ivy-react"),
    "ivy-type": ivySlot("ivy-type"),
    "ivy-read-screen": ivySlot("ivy-read-screen"),
    "ivy-whiteboard": ivySlot("ivy-whiteboard"),
    "ivy-working": ivySlot("ivy-working"),
    "ivy-briefing": ivySlot("ivy-briefing"),
  },
};

export const cyberfoundationsCharacters: Character[] = [ivy];

export const pkiCharacters: Character[] = [];

export const charactersById: Record<string, Character> = {
  ivy,
};
