# Week 11 — Shorter beginner path (proposal)

## Where we are today
- 6 missions, 39 guided steps, 19 evidence slots, ~30 written answers, 10 tickets.
- Listed times add up to about **3.5–5 hours**, before re-reading and fixing.

## What Week 12 actually needs (fixed — cannot simplify)
Week 12 only checks that **Lab 06 (Case File) is ready**. It does not check Labs 01–05.
- **Two findings**, each with: event IDs, observation, hypothesis, conclusion, uncertainty, next action, priority, why. They must use different events and include the correlated sign-in/audit records.
- **One benign/ambiguous comparison** with its source records.
- **Live activity chain** — the student's own LA-/AT- IDs from earlier labs.
- **Limitations** text.
- Case File evidence **E17, E18, E19**.
- Same field names, evidence IDs, export file names and GitHub paths.

Week 12 shows the 12 report sections, captions and other evidence when they exist, but does not require them. Those can be simplified.

## Proposed required path (about 2–2.5 hours including reading and thinking)

### Lab 1 · Who Has Access? — about 35–45 min, 5 screens
1. **Worked example (read and explore):** we walk through Alex: person → AD account → cloud account → group → what it opens. The student clicks through the real records. Nothing is captured, and the step is not counted as their work.
2. **Your turn:** Blair (ticket T201). Predict whether Blair can read case summaries (one sentence).
3. Run Blair's sign-in test, then the read-access test. Expect sign-in ALLOW and read DENY.
4. **Evidence E03** saves when the student clicks Save. The two tests they just ran are already ticked.
5. One short answer with a sentence starter: "Blair could sign in but not read, because ___."
- Required: E03 and two short answers. **Optional:** E01, E02, the AD/cloud differences, groups, Drew.

### Lab 2 · Update Someone's Access — about 45–55 min, split into 3 short parts
- **2a Fix Blair (about 10 min):** add Blair to Case-Readers, then retest. Read should be ALLOW and update DENY. Evidence **E04**, with records pre-ticked from the student's own actions.
- **2b Alex changes teams (about 20 min):** move cl-alex to Audit. Remove the old Response group, add the Audit group, then run 2 retests (R-QUEUE read DENY, R-AUD export ALLOW). Evidence **E13**. *The Active Directory side becomes optional.*
- **2c Finley leaves (about 15 min):** disable the account, revoke sessions, then run a sign-in test (DENY). Evidence **E14**.
- Each part has one decision sentence: "I removed/kept ___ because ___."
- **Optional practice (does not count toward completion):** Jamie onboarding (old Lab 03, T301/T302/T501, E05–E07, E12), least-privilege challenge (old Lab 04, E08–E11), unverified reset T504 (E15), Azure scope T505 (E16).

### Lab 3 · Explain What You Found — about 40–50 min, 6 screens
1. Look at historical sign-ins (one guided filter and one starting hypothesis). That hypothesis **becomes Finding 1's hypothesis**, so the separate question goes away.
2. Finding 1: tick the event IDs, then answer short prompts with sentence starters.
3. Finding 2: same pattern, using different events.
4. Comparison: tick the records and write one or two sentences.
5. Live activity: choose from the student's own Lab 2 LA-/AT- records (one-click insert). They write one sentence.
6. Limitations: sentence starter. Then download and upload to GitHub.
- **E17, E18 and E19 save when the student clicks Save or Download**, using records they ticked themselves.
- Report sections 1–12 become optional. A "Use my Lab 1–2 answers" button copies **the student's own text** into them. It never writes anything for them.

**Totals:** 16 required screens (from 39), 7 required evidence slots (from 19), about 8 short answers (from about 30).

## Readiness and compatibility changes
- Lab "ready" checks move to the smaller required set above. Optional items show as "Optional practice". They never block completion.
- Lab 06 check stays the same, except the duplicate "starting hypothesis" question is no longer required separately. **Week 12 is unaffected.**
- Ticket checks: T502 passes with the Cloud Identity side only. T301/T302/T501/T401–T403/T504/T505 become optional.
- **Existing students:** anything already done keeps its credit. Because the new rules are a subset, no one who is ready becomes not-ready. Saved answers, evidence and attempts stay untouched. Nothing resets.
- Classic six-lab view stays available at `?mode=classic` and shows which items are now optional.
- Instructor answer key and review screens are updated to match. Exports and file names do not change.

## Decisions for you
1. Should Alex's team move require **Cloud Identity only** (proposed), or both directories?
2. Should the **unverified password reset (T504)** be optional (proposed) or required? It teaches "verify before you reset."
3. Should the **least-privilege challenge** be fully optional (proposed), or should one small required task stay?

## Technical notes
- Changes: `readiness.server.ts` (M01–M05 predicate sets and the M06 question list), `tickets.server.ts` (T502 scope), `guided-steps.ts`, `GuidedApp.tsx`, evidence auto-capture on Save (existing `capture` command, student-selected refs only), and the instructor key. Tests are updated to pin the new required set and Week 12 fields.
- No database, RLS or schema changes. No data migration.
- Preview only. Nothing is published.
