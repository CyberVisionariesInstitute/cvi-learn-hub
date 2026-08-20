# CVI Demo Lab — Implementation Audit (read-only)

Reviewed: all routes, the demo-lab component layer, the data model, the Week 6 mission config, and rendered screenshots of `/`, `/cyberfoundations`, `/pki`, `/instructor`, and the Week 6 mission.

## WHAT'S WORKING

- **Data-driven experience model is real, not cosmetic.** `types.ts` (241 lines) defines Program → Module → Week → Experience → Scene, and `programs.ts` composes CyberFoundations and PKI purely from data. The Week 6 route file is a 41-line thin wrapper: no lesson logic lives in a page component.
- **Scene state is genuinely per-scene.** `useExperienceState` keys `answers`, `revealedEvidence`, `used`, and `explanationRevealed` per scene id, so "Reset this scene" is local and never wipes the run — matching the brief exactly.
- **Layered scene rendering.** `SceneRenderer` composes Dialogue → Environment (with the interaction mounted on a named surface: monitor, whiteboard, wall-display, terminal) → Evidence aside. The "on screen" evidence panel sitting beside the monitor already reads as instrumentation rather than a quiz result box.
- **Know Your Neighborhood teaches instead of grading.** Every wrong answer returns an authored diagnostic (ARP timeout framing for 10.20.7.20, "a familiar ending is not a neighborhood" for 10.21.5.42) and reveals evidence rather than saying "Incorrect". The `/24` scope note is explicit and repeated in the explanation. Answers are re-changeable, nothing locks.
- **Instructor console is functionally complete for a shell.** Program → experience selectors, scene jump list, per-scene notes, and eight live controls (prev/next/reset/reveal evidence/reveal explanation/toggle dialogue/restart/present) driving the same controller the student player uses. No divergent second renderer.
- **Accessibility baseline is above average.** Single `<main>`, real `<button>`/`<fieldset>`/`<legend>`, `aria-pressed`/`aria-current`, `aria-live` on feedback and scene counter, 44px min tap targets, global focus-visible ring, a reduced-motion media block, no timers, and status conveyed by label text plus dot (not color alone). Console is clean — zero errors across all five routes.
- **Program theming is token-scoped.** `.program-cyberfoundations` and `.program-pki` override `--primary`, `--atmosphere`, and (for PKI) background/surface/border. No hardcoded color utilities in the demo-lab components.

## WHAT FEELS TOO FLAT / GENERIC

- **Home page is a typographic SaaS split, not a lab.** Two rounded rectangles with tagline/title/body/arrow on a gradient wash. There is no environment imagery, no depth, no sense of a place — a stranger cannot tell this is a cyber training environment rather than a B2B landing page. The hero occupies a third of the fold and the right half is empty.
- **Environments are named but not rendered.** `Environment.backgroundSrc` exists and `EnvironmentLayer` handles it, but **zero image assets exist** (`src/assets` is absent). Every "workstation", "NOC", and "whiteboard" is currently the same translucent panel with a text label. The brief's dimensional, realistic-space direction is scaffolded, not delivered.
- **Ivy is an initials avatar.** `characters.ts` sets `assets: {}`. Thirteen character states are typed and described, but every one renders the same circle reading "IV" plus an italic descriptor. Nothing enters, types, points, or reacts.
- **PKI differentiation is a hue swap.** Gold accents on a slightly lighter navy, but the page is a 2×2 module grid and a flat environment list — structurally weaker and less cinematic than CyberFoundations, and with no experiences it reads as a roadmap page.
- **CyberFoundations page shows mostly empty rows.** Four of five weeks are "Experience design in progress" text with no visual hierarchy separating the live flagship from placeholders.
- **Instructor console cramps the stage.** At the console's 3-column layout the mission renders into a ~250px column with badly wrapped text (see screenshot). "Present" toggles `xl:col-span-2` on a child of a 2-column grid whose parent still constrains it, so present mode does not actually go full-bleed.

## ARCHITECTURE — PASS (with two scaling defects)

The separation is correct and will carry weeks 7..N without new component work for `classify` scenes. Two things will bite before Week 8:

1. **Content ids are hardcoded in the engine.** `SceneRenderer` filters evidence with a literal `e.id !== "ev-scope"`. That is Week 6 content leaking into the shared renderer; any scene using a different evidence id gets wrong reveal behavior. Evidence needs a declarative `hiddenUntilRevealed` flag on the item.
2. **One hand-written route file per experience.** `/cyberfoundations/week-06/from-the-grid-to-cloud-heights` is a bespoke file importing the mission directly. Twenty weeks × two programs means twenty-plus near-identical route files. This needs a dynamic `$program/$week/$slug` route resolving from the registry.

Also noted, non-blocking: `select-object` and `terminal` interactions are stubs (no command parsing, no output model); scene completion for `terminal` is `used.length > 0`, which is not a real gate; there is no progress persistence, so a page reload loses a student's run; the instructor console renders a second `<h1>` inside a page that already has one.

## PROTOTYPE MISSION — PASS (scene 1 only)

Scene 1 fully satisfies observe → predict → interact → gather evidence → interpret → explain: Ivy asks for a prediction before interaction, the classify grid drives evidence reveals, "Show the reasoning" is learner-triggered, and the success summary generalises the rule. The `/24` boundary is enforced in copy and never drifts into binary subnetting.

Where it falls short of "flagship live mission": scenes 2 and 3 are structural stubs (`"Scene content is authored in a later pass."`), so the 45-minute mission is currently ~5 minutes of content. There is no ticket, no terminal, no NOC wall, and no cross-scene evidence carry-forward — the investigation arc the brief describes does not exist yet.

## BLOCKERS TO WEEK-TO-WEEK SCALING

1. No dynamic experience route (per-week route files).
2. Content ids referenced inside shared renderers.
3. No authoring contract for a new week: nothing documents which fields are required, and a malformed scene fails silently (renders the "authored in a later pass" fallback).
4. Only one interaction kind is actually implemented, so any week needing a terminal, a topology pick, or a sequence task requires engine work, not content work.
5. No art pipeline: environments and character states are typed but there is no asset naming convention or generation plan, so every new week would re-litigate visuals.

## NEXT 3 PRIORITY BUILDS

1. **Cinematic environment + character pass.** Generate the CyberFoundations art set (Ivy's workstation, the Grid neighborhood, Cloud Heights NOC, troubleshooting room) plus an Ivy sprite set covering idle / enter / type / read-screen / point / whiteboard, wire them through `backgroundSrc` and `Character.assets`, and rebuild the home page around an environment scene instead of two cards. This is what converts "credible scaffold" into the brief's visual direction.
2. **Make Week 6 a full mission.** Author scenes 2 and 3 for real: a ticket-triage scene on the monitor and a NOC wall-display scene, backed by a working `terminal` interaction (declared command set, authored output, evidence emitted into the run) and evidence that carries across scenes.
3. **Harden the authoring path for week N.** Add the dynamic `$program/$week/$slug` route resolving from the experience registry, move the `ev-scope` special case into a declarative evidence flag, add a scene-config validator with visible authoring errors, and write a short authoring guide so a new week is a data file and nothing else.

No files were modified.
