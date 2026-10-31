# Week 11 — Three Guided Labs (preview only)

## One decision needed first
Week 11 completion is checked on the server against six missions and 19 evidence slots (E01–E19). Week 12 only marks a student's source as complete when that check passes, and current students' progress is measured against it.

- **Option A (default in this plan): keep every requirement, cut the effort.** The three labs regroup the same required work. Evidence is saved automatically right after the student's own action, tests and changes are pre-selected for the record shown, and IDs are inserted by ticking records instead of typing. No change to grading, Week 12, or existing attempts. The amount of *work* stays the same; the *friction* drops a lot.
- **Option B: actually reduce the required work.** Fewer tickets, fewer tests and fewer evidence slots. This is an assessment change: new server rules, a decision on how in-progress and finished six-lab attempts are judged, and Week 12 readiness changes. Needs your explicit sign-off on which items are dropped.

The rest of this plan assumes Option A. Tell me if you want B.

## What students will see
A new guided view at the same Week 11 address, using the same account and saved attempt.

```text
Welcome back  →  Lab 1 of 3 · Step 2 of 6  →  [Back]  [Continue]
```

1. **Who Has Access?** (old Missions 1–2) — meet the people, compare Active Directory and Cloud Identity. One worked example ("Here's how we spot that Jordan still has old access"), then a similar guided try with specific hints.
2. **Update Someone's Access** (old Missions 3–5) — one ticket at a time: read request → make one change → re-test → see the expected result → evidence saved. DENY outcomes explained kindly.
3. **Explain What You Found** (old Mission 6) — the existing Case File builder, with short prompts and sentence starters ("This access should be removed because ___"). Historical records (S/A/C IDs) and the student's own activity (LA-/AT-) are shown in clearly separate, labelled groups.

Each screen follows: Your goal → Why it matters (short) → numbered steps → the task itself → Check your work → one Continue button. Only the records and controls for that step are shown. Case File and the classic six-lab view stay available as secondary links, so earlier work remains reachable.

Look: centered reading column, 18–20px body text, light reading surface with dark text and CVI violet accents, city art only on lab intro screens. Keyboard and 390px phone friendly. Save status shows "Saving…" until confirmed.

## Technical details
- New `src/components/week11/guided/` (GuidedApp, LabIntro, StepScreen, CheckYourWork, steps map). Pure presentation map in `src/lib/week11/guided-steps.ts` linking each guided step to existing mission IDs, step indexes and evidence slots; unit tests assert every E01–E19 slot and every mission question is reachable from exactly one guided step.
- Actions call the existing `week11.functions.ts` commands only. Auto-capture uses the existing CaptureEvidence/store contract, triggered after the student's command succeeds, with the exact record they just produced; never captures on page load or for records they didn't create.
- No changes to `readiness.server.ts`, `tickets.server.ts`, answer key, DB functions, export filenames, Week 12 snapshot, or student rows. Progress shown from existing readiness results only.
- Guided position is browser-local, keyed by account + attempt (same pattern as Week 12 guide).
- `?view=classic` keeps the current simulator; guided becomes default in preview.
- Compatibility contract (Case File fields, section keys, evidence IDs, export paths Week 12 reads) written to `docs/week11-week12-contract.md` with a test.
- Validation: unit tests, isolated synthetic-data harness (no server writes) for all 3 labs at 1280px and 390px plus keyboard pass, existing-attempt mapping check against a synthetic six-lab attempt, export + Week 12 snapshot build test. Harness removed afterwards. Not published.

## Limitations to expect
No test against a real student account; screen-reader testing not included.
