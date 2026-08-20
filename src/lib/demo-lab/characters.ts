import type { Character } from "./types";

/**
 * Character framework. Motion assets can be attached per state later; the
 * player never depends on their presence.
 */
export const ivy: Character = {
  id: "ivy",
  name: "Ivy",
  role: "Grid Technician",
  accentToken: "signal",
  assets: {},
};

export const cyberfoundationsCharacters: Character[] = [ivy];

export const pkiCharacters: Character[] = [];

export const charactersById: Record<string, Character> = {
  ivy,
};
