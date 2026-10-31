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
