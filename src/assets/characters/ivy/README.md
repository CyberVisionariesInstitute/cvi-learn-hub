# Ivy — character media slots

Production artwork is **not** in the repository yet. Until files land here the
player renders a neutral placeholder figure (see `CharacterLayer`), which is
deliberately abstract and must not be treated as Ivy's design.

## Naming convention

```
src/assets/characters/ivy/<state>.webp   static frame (required per state)
src/assets/characters/ivy/<state>.webm   transparent motion (optional)
src/assets/characters/ivy/<state>.mp4    motion fallback (optional)
```

States used by Mission 1: `ivy-enter`, `ivy-idle`, `ivy-thinking`,
`ivy-point`, `ivy-nod`. Full state list lives in `CharacterState`
(`src/lib/demo-lab/types.ts`).

## Wiring a state up

In `src/lib/demo-lab/characters.ts`, add to `ivy.assets`:

```ts
import idle from "@/assets/characters/ivy/ivy-idle.webp";
import enterWebm from "@/assets/characters/ivy/ivy-enter.webm";

"ivy-enter": {
  staticSrc: idle,
  motionSources: [{ src: enterWebm, type: "video/webm" }],
  alt: "Ivy walking into the neighborhood",
},
```

Resolution order at runtime: `motionSources` → `animatedSrc` → `staticSrc` →
placeholder. `staticSrc` is always used under `prefers-reduced-motion`.

## Art requirements

- Transparent background, full body, feet at the bottom edge of the frame.
- Consistent camera height and figure scale across states (no layout shift).
- Dusk-lit to match the Grid neighborhood environment.
- Motion clips: 2–4s, loopable, restrained (no constant idle motion).
