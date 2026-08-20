# CVI Demo Lab dimensional interaction pass

## Goal
Preserve the current artwork, mission content, state engine, and Program → Week → Experience → Scene architecture while making the home portals and all eight Week 6 scenes read as physical professional environments rather than UI panels over images.

## Implementation

### 1. Shared depth and motion system
- Add semantic depth, screen, board, light, shadow, perspective, and motion tokens/utilities to the global design system.
- Build reusable scene-layer primitives for artwork, atmospheric/vignette layers, foreground framing, physical screens/boards, and tactile interactive objects.
- Keep motion short and event-driven: 2–4px focus/hover lift, pressed depth, screen-content transitions, card settling, route tracing, and state-based Ivy movement.
- Disable parallax, tracing, settling, and idle motion under `prefers-reduced-motion` while retaining immediate state changes.

### 2. Home portals
- Preserve both program images and existing copy.
- Turn each entry into a scene portal with layered frame, lighting response, differential image/text movement, and keyboard-equivalent focus treatment.
- Reduce the bordered-card silhouette and anchor copy into the lower environmental frame.

### 3. Environment and Ivy staging
- Refactor the shared environment renderer so artwork occupies the dominant field, interaction content mounts onto a believable monitor/whiteboard/wall/terminal/evidence-board surface, and evidence/instructions no longer read as a detached sidebar.
- Place Ivy as an in-scene foreground figure with scene/state-aware poses and restrained transition classes; keep current media resolution and placeholders.
- Preserve responsive crops and use existing mobile hotspot/character anchors.

### 4. Mission-specific physical interactions
- **Mission 1:** Add foreground framing, building/gateway depth, route draw/stop/fade states, target/gateway illumination, prefix-sign emphasis on wrong routes, and completion light toward Cloud Heights.
- **Mission 2:** Recompose ticket, terminal, and tools as angled desk monitors/workbench objects; running a tool visibly updates the active terminal and selected object depth.
- **Mission 3:** Render a perspective whiteboard with attached cards, lift/tilt during selection/drag, board shadows, and an in-board marker annotation at the first questionable transition.
- **Mission 4:** Embed shell evidence, access-chain indicators, and selectable log/status rows into a secure-lobby workstation with progressive illumination.
- **Mission 5:** Make the topology wall the dominant visual surface, retain gateway “NO REPLY,” animate the relevant path/screen on each test, and reveal later telemetry beside—not instead of—the contradiction.
- **Mission 6:** Build a two-monitor remote-access desk with terminal evidence, reachability/auth stages, connecting flow, and monitor-integrated three-state controls.
- **Mission 7:** Turn the shared placement interaction into a physical incident board with pinned cards, subtle settled rotations, keyboard/tap placement, and contradictory notes in-context.
- **Mission 8:** Turn briefing placement into a presentation display that fills progressively; animate the final analyst slide and apply a restrained morning-light completion shift.

### 5. Instructor Present mode
- Make Present mode a true expanded scene layout: hide selectors, scene list, title copy, and footer/header chrome; maximize the environment; keep a discreet accessible presenter control strip.
- Restore the complete console unchanged when Present mode exits.

## Technical details
- Keep interaction data and completion logic unchanged unless a small display-state field is required for visual feedback.
- Prefer shared primitives and semantic CSS utilities over one-off hardcoded colors or giant route components.
- Continue using real buttons/fieldsets and existing controller actions; environmental styling changes presentation, not semantics.
- Maintain 44px targets, visible focus, meaningful `aria-label`/`aria-pressed`, `aria-live` feedback, and tap-select → tap-place behavior on touch layouts.

## Verification
- Run targeted tests/build checks provided by the project harness.
- Exercise all eight scenes and Present mode in the browser.
- Capture and visually inspect: home desktop; Mission 1 desktop/mobile; Missions 2, 3, 5, 7, 8 desktop; Instructor Present mode.
- Check overflow, focus visibility, keyboard operation, dynamic text/status, responsive crop/anchors, and reduced-motion behavior.
