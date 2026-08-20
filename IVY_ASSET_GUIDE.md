# Ivy — production character asset guide

Ivy's delivery system is finished in code. Drop approved files into
`src/assets/characters/ivy/` using the names below and they are wired
automatically (`src/lib/demo-lab/characters.ts` globs the folder). No component
changes are needed when new media lands.

## Resolution order per state

1. `ivy-<state>.webm` — transparent motion (preferred)
2. `ivy-<state>.mp4` — motion fallback, only where transparency is not required
3. `ivy-<state>.animated.webp` — animated WebP
4. `ivy-<state>.webp` / `.png` — static still (always used under
   `prefers-reduced-motion`, and as the video poster)
5. neutral placeholder figure (quiet, fallback-only — not final artwork)

## Framing rules (all states)

- Transparent background, feet at the bottom edge of the frame.
- Identical camera height and figure scale across states — no layout shift.
- Suggested still: 900 × 1400 WebP. Clips: 2–4 s, loopable for ambient states,
  one-shot for reactions, 24–30 fps, ≤ 2 MB.
- Dusk / NOC lighting: deep navy key, cyan infrastructure fill, warm amber rim.

## Required states

| State | Framing | Motion | Week 6 scenes |
| --- | --- | --- | --- |
| `ivy-enter` | Full body, walking in | One-shot | 1 (arrival) |
| `ivy-idle` | Full body, standing | Ambient loop | 1, any hold |
| `ivy-walk-left` / `ivy-walk-right` | Full body, profile | Loop | 1 (route moves) |
| `ivy-point` | Full body, arm extended | One-shot | 1, 3, 7 |
| `ivy-thinking` | Full body / 3-4, hand near chin | Ambient loop | 1, 3, 7 |
| `ivy-nod` | 3/4 upper body | One-shot | 1, 3, 7, 8 |
| `ivy-react` | 3/4 upper body | One-shot | 5, 6 |
| `ivy-type` | 3/4, tablet in hand | Ambient loop | 2, 6 |
| `ivy-working` | 3/4 at console | Ambient loop | 2, 5 |
| `ivy-read-screen` | 3/4, facing screen | Ambient loop | 4, 6 |
| `ivy-whiteboard` | Full body, beside board | Ambient loop | 3 |
| `ivy-briefing` | Full body, presenting | Ambient loop | 8 |
| portrait | Head & shoulders, square | Still only | dialogue bust (`ivy-portrait.webp`) |

## Reduced motion

Every state must ship a still. Under `prefers-reduced-motion: reduce` the layer
never plays video or animated WebP and never runs the procedural clip CSS — the
still alone must read as the pose.

## Staging

Per-scene position/scale lives in scene config (`characterStaging` on `Scene`),
not in `CharacterLayer`. Media is `pointer-events-none` unless a character is
explicitly configured as interactive, so Ivy can never block a hotspot.
