# Week 12 Communications Capstone — Architecture Review and Plan

Review only. No code or data changed.

## 1. Reuse directly
- **Week 11 attempt data** (`w11_attempts.learner`): `findings[]` (observation, hypothesis, conclusion, uncertainty, nextAction, priority, rationale, refs), `captions`, `comparison`, `report.sections`, `report.limitations`, `report.liveChain`, `missions[].answers`.
- **Week 11 evidence** (`w11_evidence`): evidence keys (`EV-XXXXXX-NNN`), slot, mission, title, frozen snapshot, content hash. Historical event IDs come from `seed.ts` (`historicalSignins`, `historicalAudit`).
- **Patterns to copy**: server-owned writes (`requireSupabaseAuth` + session-derived owner + service client inside handler), optimistic `text_revision` autosave (`saveWeek11Text`), `DownloadsView` (status list, missing items, per-file + ZIP, DRAFT naming, GitHub upload guide, live-region announcements), `CurrentMissionPanel` (persistent collapsible step companion), staff gate (`isStaff` + `?staff=1` sign-in + "Switch to student view"), instructor route shape (`cyberfoundations.week-11.instructor.tsx`), `w11_reviews` shape for feedback/scores.
- **Visual/UI kit**: `components/week11/ui.tsx`, approved Module 4 Ivy assets (used selectively).
- **Lab 06 file path for references**: `week-11/labs/lab-06-identity-investigation-case-file.md` (confirmed in `seed.ts`).

## 2. New pieces
**Routes**
- `src/routes/cyberfoundations.week-12.index.tsx` — student capstone (signed-in, same gate as Week 11).
- `src/routes/cyberfoundations.week-12.instructor.tsx` — staff review.
- Link card in `cyberfoundations.index.tsx` and a "Switch to student view" entry in the Instructor Console.

**Components** (`src/components/week12/`)
- `Week12Shell` (6-step navigation + persistent step companion), `SourceCaseFile` (read-only Week 11 snapshot panel with evidence chips), `ClassifyBoard` (step 1), `FindingsEditor` (step 2), `ReportBuilder` (step 3), `ExecCommsBuilder` with Written/Video branch (step 4), `RecommendationsEditor` (step 5), `FinalQA` + `Week12Downloads` (step 6), `LanguageCoach` (inline flags).

**Server functions** (`src/lib/week12/week12.functions.ts`)
- `startOrResumeWeek12` — finds the student's Week 11 source, creates/returns the Week 12 attempt.
- `saveWeek12Draft` — revision-checked autosave of the Week 12 text.
- `refreshWeek12Source` — explicit re-snapshot of the latest Week 11 case file (student-triggered, never automatic).
- `getWeek12QA` / `exportWeek12` / `exportWeek12File` — readiness + Markdown/ZIP.
- `setWeek12Volunteer` — opt in/out of live presentation (separate field).
- Instructor: `listWeek12Attempts`, `getWeek12AttemptForInstructor`, `reviewWeek12`, `selectWeek12Presenter`.
- Server-only: `readiness.server.ts`, `export.server.ts`, `language.server.ts` (optional deeper check), `instructor-key.server.ts` (rubric).

**Tables** (new migration, following the existing GRANT → RLS → policy order)
- `w12_attempts`: id, owner_user_id, status (active/archived), source_w11_attempt_id, source_snapshot jsonb, source_snapshot_hash, source_text_revision, source_captured_at, exec_option ('' | 'written' | 'video'), content jsonb, text_revision, volunteer_status ('none'|'volunteered'|'withdrawn'), presenter_selected boolean (staff-only write), timestamps. Unique active per owner.
- `w12_reviews`: attempt_id, instructor_id, scores jsonb, feedback, text_revision, created_at.
- Policies: owner SELECT own, staff SELECT all; no client INSERT/UPDATE/DELETE (all writes through server functions, like `w11_*`).

## 3. Linking to the correct Week 11 attempt
- Owner is always `context.userId` from the session; the request never carries a Week 11 attempt ID.
- Source choice: the owner's single **active** `w11_attempts` row (enforced by the existing unique index `w11_one_active_attempt`).
- **Snapshot, don't live-link**: copy findings, captions, comparison, report, limitations, live chain, evidence index (key/slot/mission/title/hash) and referenced historical event IDs into `w12_attempts.source_snapshot` with its hash and Week 11 `text_revision`. Week 12 never writes to `w11_*`.
- Edge cases:
  - **No Week 11 attempt**: friendly blocker "Finish Week 11 Lab 06 first", link to Week 11; no Week 12 row created.
  - **Week 11 incomplete (M06 not ready)**: allow start but show "Source case file is DRAFT" banner and list the Week 11 missing items; final QA flags it.
  - **Week 11 reset after Week 12 started**: the snapshot keeps the old attempt ID; Week 12 shows "Your Week 11 attempt was reset on <date>. Your Week 12 work still uses the earlier case file." Offer "Use my new case file" (refresh) only by explicit action, warning that evidence references may no longer match.
  - **Week 11 edited after snapshot**: compare `text_revision`; show "Your Week 11 case file changed — refresh source?" Never auto-overwrite.
  - **Only archived Week 11 attempts, none active**: cannot happen today (reset always creates a new active one); still handle by falling back to the most recent archived attempt with a banner.
  - Evidence keys cited in Week 12 are validated server-side against the snapshot; unknown keys are flagged.

## 4. Week 12 state model (`w12_attempts.content`)
```text
classify:    { items: [{ id, sourceRef, text, label: fact|finding|evidence|interpretation|unknown|recommendation }] }
findings:    [{ key, sourceFindingKey, statement, evidenceRefs[], confidence: confirmed|likely|possible, uncertainty }]
report:      { title, summary, scope, timeline[{ time, eventRef, text }], findings (refs), impact,
               rootCause, containment, limitations, appendixRefs[] }
exec:        { option: written|video,
               written?: { headline, whatHappened, businessImpact, whatWeKnowDont, decisionsNeeded, nextSteps },
               video?: { url, platform, durationSeconds, accessCheck, outline[], transcriptOrNotes, reflection } }
recommendations: [{ key, action, owner, priority, timeframe, linkedFindings[], successMeasure }]
qa:          { acknowledgedFlags: [{ flagId, note }] }
```
Separate top-level columns: `exec_option`, `volunteer_status`, `presenter_selected` (so grading never reads volunteer status).

## 5. Export design
```text
week-12/README.md                         index, option chosen, Week 11 source hash + revision, DRAFT status
week-12/technical-incident-report.md      full technical report; evidence cited by EV key and event ID
week-12/executive-summary.md              (written option)  OR
week-12/video-briefing.md                 (video option) URL, platform, duration, access note, outline,
                                          notes/transcript, reflection
week-12/recommendations.md                optional split; or kept inside the report (decide at build)
week-12/source/week11-source-manifest.json  snapshot hash, Week 11 attempt short ID, evidence keys only
```
- References point to `../week-11/labs/lab-06-identity-investigation-case-file.md` and `../week-11/labs/evidence/week11-evidence-index.md`; no duplicated evidence bodies.
- ZIP: `week-12-portfolio.zip` / `week-12-portfolio-DRAFT.zip`; per-file downloads byte-identical to ZIP copies (same rule as Week 11).
- Only the chosen executive file is included; switching option keeps the other draft saved but excluded.
- Same GitHub upload guide as Week 10/11 (Add file → Upload files → Commit), plus "downloading is not submitting".
- Volunteer status is not in the export.

## 6. Instructor review
- List: student, exec option, DRAFT/ready, last saved, volunteer status, reviewed?
- Detail: side-by-side Week 11 source snapshot vs Week 12 report; unsupported-language flags and the student's acknowledgements; evidence-ref validity; rubric (equal-weight criteria for written and video, judging clarity, accuracy, audience fit, evidence alignment — not format); feedback; open video link.
- Presenter selection: mark up to two volunteers as selected (staff-only, recorded in audit), independent of scores.
- Read-only for staff on student content; reset/regrade actions logged.

## 7. Risks and blockers
- **Cohort isolation**: same unresolved blocker as Week 11 (no cohort mapping) — Week 12 inherits owner-only scoping; staff see all students. Documented, not solved.
- **Video hosting**: no storage bucket exists. Recommend URL-only (unlisted YouTube / Drive / Loom) with a "viewable by link" checkbox; uploading files would need storage, size limits and moderation — out of scope unless you want it.
- **Equal-difficulty requirement**: rubric and checklist length must match for both options; needs your sign-off on criteria and word/time targets (proposed: 250–400 words vs 2–3 minutes + 150-word reflection).
- **Language coaching**: client keyword flags (attacker, compromised, breach, malicious, hacked, stolen, exfiltrated) are coaching only; acknowledging with an evidence ref or rewording clears the flag. AI-assisted checking is possible later but not recommended for v1 (consistency, cost).
- **Answer-key separation**: Week 11 readiness predicates and instructor key must stay out of the snapshot and the Week 12 bundle; the snapshot copies student text and evidence metadata only.
- **Students who skipped Week 11** or worked offline: blocked with a clear path; instructor may need a manual override (decide).
- **Week 11 filename mismatch risk**: summary text in earlier turns used `lab-06-identity-investigation.md`; the actual source is `lab-06-identity-investigation-case-file.md` — Week 12 links must use the latter.
- Existing linter note on `has_role`/`is_staff` stays a separate change.

## 8. Staged implementation and acceptance tests
**Stage 1 — Data and source link**: migration (`w12_attempts`, `w12_reviews`, grants, RLS, unique active index); `startOrResumeWeek12`, snapshot builder, `saveWeek12Draft`.
- Tests: student A cannot read B's Week 12 or source; no Week 11 → blocker; reset Week 11 → old snapshot kept, refresh banner; snapshot contains no readiness/answer-key fields; stale revision returns conflict.

**Stage 2 — Shell + Steps 1–2** (route, step companion, source panel, classify board, findings editor, language coach).
- Tests: signed-out redirect; evidence chips only show snapshot keys; flags appear for unsupported terms and clear on evidence ref/acknowledge; no hard block; 390px no overflow; keyboard + aria on all controls.

**Stage 3 — Steps 3–5** (report builder, written/video branch, recommendations).
- Tests: option switch preserves both drafts; video URL validation (https, allowed hosts); recommendations must link ≥1 finding; equal checklist counts for both options.

**Stage 4 — Final QA + export** (server readiness, Markdown/ZIP, GitHub guide).
- Tests: exact path set per option; per-file byte identity with ZIP; DRAFT naming; Week 11 references resolve to the case-file path; no Week 11 evidence bodies duplicated; volunteer status absent; no server-only imports in student UI.

**Stage 5 — Instructor review + volunteer selection**.
- Tests: student cannot call review/select functions; max two selected presenters; review stored with text revision; volunteer status never affects score fields.

**Stage 6 — Regression + walkthrough**: Week 10 and Week 11 suites unchanged; signed-in 390px/1280px Playwright pass through all six steps for both options; nothing published.

## Decisions needed from you
1. Video: link-only (recommended) or uploaded files?
2. Length targets for written vs video (proposal above).
3. Should students without a finished Week 11 be blocked, allowed with DRAFT banner (recommended), or instructor-overridable?
4. Recommendations as a separate file or inside the technical report?
