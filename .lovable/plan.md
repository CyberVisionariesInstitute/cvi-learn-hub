# Week 12 read-only review (no edits made)

Scope: current source only. No browser run, student writes, attempts or publishing this turn. Browser results below come from earlier synthetic checks and were not repeated.

## Findings

1. **MINOR: Final QA hides unknown-reference advisories once the findings check passes.**
   - `model.ts` `computeQA` adds "These references aren't in your Week 11 source: …" to `findings.missing`.
   - `Week12App.tsx:570` only shows `missing` when `!x.ok`. If two findings are already linked, the advisory disappears from Final QA, but Stage 2 still shows the "✕ not in source" badges.
   - The test `week12.test.ts:93` confirms readiness stays `true` in this case.
   - Effect: a student can download a non-DRAFT report that still cites IDs not in their source.
   - Recommendation: show advisories in Final QA even when the check passes, without changing readiness.

2. **MINOR: Guide wording doesn't match readiness.** `guide.ts:31` says "WHEN DONE … no ✕ badges", but readiness accepts ✕ badges as long as two findings are linked. Students get mixed messages about whether this is a requirement.

3. **MINOR: Equal weighting is stated, but the effort differs.** Written needs about 250–400 words. Video needs a link, platform, a duration of 1:45–3:15, a playback confirmation, an outline of 3 or more lines and a reflection of 20 or more words (`execMissing`). The extra notes are labelled "submission notes", which helps. This is a policy question, not a defect.

4. **INFO: Written word count includes the optional "What remains uncertain?" box.** That's acceptable, but students can't see it in the "covers all five boxes" wording.

No blockers found.

## What is working (verified in source)

- **Shorter Week 11 path isn't blocked.** Week 12 uses M06 `ready` from `computeReadiness`. Optional items are kept separate and never block (`readiness.server.ts:13,40`). Covered by `handoff.test.ts`.
- **Stage 4 keeps the report mandatory for both options.** It says Stage 3 is required for everyone. Switching options keeps both drafts ("Switching keeps both drafts saved"). Only the selected option is checked and exported (`week12Paths`).
- **Pagers** use exact field labels. The Stage 4 pager resets to the first prompt when you switch options.
- **Refresh** needs `REFRESH` confirmation, a matching revision and a matching snapshot hash. On conflict it fails with "your writing is kept" (`week12.functions.ts:117–131`). Read failures are reported separately from missing work (`source-read.server.ts`, tested).
- **Export paths** are unchanged, and the executive file only appears once an option is chosen.

## Remaining risks and limits

- No authenticated save, import, refresh or download test. No hosted concurrency test. No screen-reader pass.
- I didn't re-measure layout or readability in a browser this turn. That evidence is from the previous synthetic checks.

## Recommendation

**Publish is acceptable.** Findings 1–2 are small, low-risk copy and display fixes. Making them first is recommended but optional. Approving this card does not start any edits. Ask separately if you want 1–2 fixed.
