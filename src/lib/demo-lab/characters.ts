import type { Character, CharacterAsset, CharacterMediaType, CharacterState } from "./types";

import ivyPortrait from "@/assets/characters/ivy/ivy-portrait.webp";

/**
 * Character media delivery.
 *
 * Drop files into `src/assets/characters/ivy/` following the convention below
 * and they are picked up automatically — no component or registry rewrite:
 *
 *   ivy-<state>.webm        transparent motion  (preferred)
 *   ivy-<state>.mp4         motion fallback     (no transparency)
 *   ivy-<state>-anim.webp   animated WebP       (motion, transparent)
 *   ivy-<state>.webp/.png   still               (reduced motion + poster)
 *
 * Resolution order at runtime: webm → mp4 → animated webp → still → fallback
 * still (see STILL_FALLBACK) → neutral placeholder figure.
 *
 * See IVY_ASSET_GUIDE.md for required states and framing.
 */
const files = import.meta.glob("../../assets/characters/ivy/*.{webp,png,webm,mp4}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop();
  if (name) byName[name] = url;
}

const ALL_STATES: CharacterState[] = [
  "ivy-idle",
  "ivy-enter",
  "ivy-walk-left",
  "ivy-walk-right",
  "ivy-working",
  "ivy-type",
  "ivy-read-screen",
  "ivy-point",
  "ivy-whiteboard",
  "ivy-thinking",
  "ivy-react",
  "ivy-nod",
  "ivy-briefing",
];

/** Which still stands in when a state has no still of its own. */
const STILL_FALLBACK: Record<CharacterState, string[]> = {
  "ivy-idle": ["ivy-idle"],
  "ivy-enter": ["ivy-enter", "ivy-idle"],
  "ivy-walk-left": ["ivy-walk-left", "ivy-idle"],
  "ivy-walk-right": ["ivy-walk-right", "ivy-idle"],
  "ivy-working": ["ivy-working", "ivy-type", "ivy-idle"],
  "ivy-type": ["ivy-type", "ivy-idle"],
  "ivy-read-screen": ["ivy-read-screen", "ivy-type", "ivy-idle"],
  "ivy-point": ["ivy-point", "ivy-idle"],
  "ivy-whiteboard": ["ivy-whiteboard", "ivy-point", "ivy-idle"],
  "ivy-thinking": ["ivy-thinking", "ivy-idle"],
  "ivy-react": ["ivy-react", "ivy-thinking", "ivy-idle"],
  "ivy-nod": ["ivy-nod", "ivy-idle"],
  "ivy-briefing": ["ivy-briefing", "ivy-brief", "ivy-point", "ivy-idle"],
};

const ALT: Record<CharacterState, string> = {
  "ivy-idle": "Ivy, Grid Technician, standing by",
  "ivy-enter": "Ivy arriving on site",
  "ivy-walk-left": "Ivy moving through the scene",
  "ivy-walk-right": "Ivy moving through the scene",
  "ivy-working": "Ivy running diagnostics",
  "ivy-type": "Ivy typing a command on her field tablet",
  "ivy-read-screen": "Ivy reading output on her screen",
  "ivy-point": "Ivy pointing something out",
  "ivy-whiteboard": "Ivy working at the whiteboard",
  "ivy-thinking": "Ivy thinking through the evidence",
  "ivy-react": "Ivy reacting to a surprising result",
  "ivy-nod": "Ivy nodding in agreement",
  "ivy-briefing": "Ivy briefing the room",
};

function still(state: CharacterState): string | undefined {
  for (const base of STILL_FALLBACK[state]) {
    const hit = byName[`${base}.webp`] ?? byName[`${base}.png`];
    if (hit) return hit;
  }
  return undefined;
}

function buildAsset(state: CharacterState): CharacterAsset | undefined {
  const motionSources: Array<{ src: string; type: CharacterMediaType }> = [];
  const webm = byName[`${state}.webm`];
  const mp4 = byName[`${state}.mp4`];
  if (webm) motionSources.push({ src: webm, type: "video/webm" });
  if (mp4) motionSources.push({ src: mp4, type: "video/mp4" });

  const animatedSrc = byName[`${state}-anim.webp`];
  const staticSrc = still(state);

  if (!motionSources.length && !animatedSrc && !staticSrc) return undefined;

  return {
    ...(motionSources.length ? { motionSources } : {}),
    ...(animatedSrc ? { animatedSrc } : {}),
    ...(staticSrc ? { staticSrc } : {}),
    alt: ALT[state],
  };
}

const ivyAssets: Partial<Record<CharacterState, CharacterAsset>> = {};
for (const state of ALL_STATES) {
  const asset = buildAsset(state);
  if (asset) ivyAssets[state] = asset;
}

/** States that still have no motion clip of their own. */
export const ivyMissingMotion = ALL_STATES.filter(
  (s) => !ivyAssets[s]?.motionSources?.length && !ivyAssets[s]?.animatedSrc,
);

export const ivy: Character = {
  id: "ivy",
  name: "Ivy",
  role: "Grid Technician",
  accentToken: "signal",
  assets: ivyAssets,
  portraitSrc: ivyPortrait,
  productionArtwork: Boolean(ivyAssets["ivy-idle"]?.staticSrc),
};

export const cyberfoundationsCharacters: Character[] = [ivy];

export const pkiCharacters: Character[] = [];

export const charactersById: Record<string, Character> = {
  ivy,
};
