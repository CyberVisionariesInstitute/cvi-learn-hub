# Week 11 → Week 12 compatibility contract

The guided three-lab view is presentation-only. It reads and writes exactly the same data as the classic six-lab simulator (`?view=classic`). Nothing below may change without updating Week 12.

## What Week 12 reads (`src/lib/week12/source.server.ts`)
From the student's own `w11_attempts` row (active, else latest archived):
- `learner.displayName`
- `learner.findings[]`: `key, title, refs, observation, hypothesis, conclusion, uncertainty, nextAction, priority, rationale`
- `learner.comparison`: `refs, text`
- `learner.report.sections` keyed `"1"`…`"N"` in `reportSections` order, plus `limitations` and `liveChain`
- `learner.captions`
- `text_revision`, `state_revision`, `status`, `archived_at`

From `w11_evidence`: `evidence_key, slot, mission, title, captured_revision, content_hash`.

Readiness: server `computeReadiness(...)` result for mission `M06` decides `sourceComplete`.

## Stable identifiers
- Missions `M01`–`M06` (guided Lab 1 = M01–M02, Lab 2 = M03–M05, Lab 3 = M06).
- Evidence slots `E01`–`E19`, each reachable from exactly one guided screen.
- Mission question IDs and `traceConcepts` IDs (stored under `learner.missions[Mxx].answers` / `.trace`).
- Historical scenario event IDs (S/A/C…) stay separate from the student's own `LA-`/`AT-` activity.
- Export filenames and GitHub paths come from `export.server.ts` / `seed.ts` `exportPath`; unchanged.

Pinned by `src/lib/week11/guided-steps.test.ts`.

## Shorter beginner path (approved 2026-10-31)
- Required for completion (`src/lib/week11/requirements.ts`): M02 (E03, E04; prediction/authorization/accountability), M05 Cloud Identity side of T502 and T503 (E13, E14; t502/t503), M06 unchanged except the separate starting-hypothesis question is optional.
- M01, M03, M04 and all other M05 items are optional practice: `readiness[].required === false`, `ready === true`, unmet items in `optional`.
- Week 12 still uses only M06 readiness for `sourceComplete`; every Week 12 field above is still required.
- Required rules are a strict subset of the old rules, so no previously ready attempt becomes not-ready.
