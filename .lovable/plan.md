# Week 12 published QA — read-only results and proposed follow-up

Overall: **GO.** No blockers. Two minor wording/status items are optional polish.

## Evidence sources (kept separate)
- **Live (checked now, signed out, read-only):** capstone.cybervisionariesinstitute.org/cyberfoundations/week-12. cvi-learn-hub.lovable.app redirects to the same custom domain. Signed-out visitors land on "Student sign in" (`/auth?redirect=/cyberfoundations/week-12`) on desktop and at 390px. No server calls were made and there's no sideways scrolling. All 77 live code files were fetched and searched for the new wording.
- **Source (current project):** the guide steps, Stage 3 jump fix, Stage 6 status card, two-presenter limit and readiness rules.
- **Earlier practice page (made-up data, no server calls, now deleted):** 50 of 50 keyboard and mouse checks passed at 1280px and 390px, and all 210 tests pass. That run proves how the screens behave, **not** the live signed-in flow.
- **Not done live:** a signed-in walkthrough. Opening Week 12 signed in can create an attempt and autosave, so it was skipped as instructed.

## Results
| # | Area | Result | Evidence |
|---|---|---|---|
| 1 | Published version and sign-in routing | PASS | Live redirect described above |
| 2 | DO THIS / GO HERE / LOOK FOR / WHEN DONE guide, current stage, Welcome back / Continue | PASS | Live code has the guide labels, "Continue at Stage" and the account+attempt guide key; practice run confirmed behaviour |
| 3 | One-item pagers / Show all / Save & next section | PASS | Live code and practice run |
| 4 | Report header and Section 8 jump buttons | PASS | Live code has the section-select event; practice run confirmed the right section opens with the cursor in its box |
| 5 | Evidence "press Tab" cue | PASS | Live code |
| 6 | Written/video requirements; report required for both | PASS | Live code; requirement checks unchanged in source |
| 7 | Final QA is not the grade; flagged-word explanation; old "not a block" line gone | PASS | Live code |
| 8 | Real case IDs (S009/A002/C009) gone from examples; made-up LIB-77 used instead | PASS | Live code |
| 9 | Source ownership / Refresh wording | PASS | Source; refresh rules unchanged |
| 10 | Downloads, GitHub paths, Lab Submissions / Submission Tracker handoff | PASS, with limitation | Named destination only; no verified link exists in the project |
| 11 | Optional presenters, maximum two | PASS | Instructor box disabled at 2; the database also refuses a third |
| 12 | Stage 6 "Where is my work?": Autosaved ✓ | MINOR | It shows ✓ in the brief pause right after typing, before the save finishes. Recommend: show ✓ only after a confirmed save. |
| 13 | Stage 6 volunteer card: "Two volunteers will be chosen" | MINOR | Reads as guaranteed. Recommend: "Up to two volunteers may be chosen by your instructor." |
| 14 | Live signed-in flow (saving, downloads, real source data) | LIMITATION | Not checked live. Recommend a short run with a staff test-student account. |

## Proposed follow-up (only if approved)
1. Stage 6 status card: mark Autosaved ✓ only after a confirmed save, not while a save is pending.
2. Volunteer card wording: change it to "Up to two volunteers may be chosen by your instructor."
3. Run the Week 12 tests and the 390px and keyboard checks again, then wait for your go-ahead before publishing.

## Technical details
- Item 1: in `StageQA` in `src/components/week12/Week12App.tsx`, the Autosaved line counts `saveState` "idle" as saved. "idle" is also the state while an edit is waiting to save. Show ✓ only when `saveState.kind === "saved"`, and otherwise show "Saving soon".
- Item 2 is a text-only change. The presenter limit stays enforced by the database and the instructor screen.
- Nothing else changes: source snapshot, refresh, readiness, exports and student records stay untouched.
