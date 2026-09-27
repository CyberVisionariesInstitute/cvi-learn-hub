# Week 11 Usability Walkthrough — Gap Report (no code changes)

Scope: M01–M06, student perspective, based on the current code: mission definitions, simulator shell and navigation, directory screens, testers, tickets, logs, evidence tray, case-file editor, readiness rules and the Current Mission panel. Nothing was changed or published. Approving this plan only accepts the report. The fixes will come as one separate consolidated refinement pass after you review it.

Method note: I traced each step to the screen and control that actually supports it. I did not run a live click-through of all six missions in this pass. Items marked (verify live) need to be confirmed during the refinement QA.

---

## 1. Executive summary

Every mission can be completed with the current screens, but a beginner has to learn the simulator's layout on their own. The main problems:

1. **Instructions name tasks, not places.** Steps say "Sign-in tester", "Test Access", "What-if", "Effective access" and "Mark reviewed" without saying where those controls are. Most of them are inside a selected account's page on Users, and the AD/Cloud switch decides which accounts appear there.
2. **The AD/Cloud switch is easy to miss and quietly changes context.** It sits above the side menu. Switching clears the selected user, and the step wording rarely says which directory a step needs.
3. **Evidence capture only exists on Mission Progress.** Students have to leave the screen where the proof is and pick an evidence slot from a list with long labels. The mission panel's "Evidence Tray" shortcut opens the tray, which cannot capture anything.
4. **Expected denials are shown as plain "deny" results.** Deny traces give a reason code (e.g. NO_MATCHING_GRANT, ACCOUNT_DISABLED) but never say "this denial is the correct learning result for step X".
5. **Later-mission actions are available from the start.** A student in M01 can create Jamie, transfer Alex or disable Finley, which changes the starting state for M03 and M05 without warning.
6. **Readiness messages say what is missing but not where to fix it.** Some are deliberately vague ("current access still doesn't meet…"), which is right for assessed reasoning but gives no navigation hint.

None of this blocks completion. Together it adds a lot of back-and-forth and guessing, which works against the beginner- and neurodivergent-friendly goal.

---

## 2. Cross-mission / global gaps

| # | Gap | Where | Impact |
|---|---|---|---|
| G1 | Steps don't name the screen, the AD/Cloud context or the control label | mission steps in seed.ts | Guessing where to go |
| G2 | Sign-in tester, Access tester, What-if, Effective access and Administrative actions only appear after selecting an account on Users, and nothing says so | Users screen | Students hunt through Resources, Roles and Tickets |
| G3 | The AD/Cloud switch is above the menu, uses long labels, doesn't appear in the screen title, and clears the selection when switched | Simulator side menu | Students look for cl-blair while in AD |
| G4 | Groups and Roles screens don't clearly follow the AD/Cloud switch, but Users and OUs do (verify live) | Groups, Roles screens | Mixed mental model |
| G5 | Evidence capture only works on Mission Progress. The panel's "Evidence Tray" shortcut can't capture | Mission Progress, Evidence Tray | Extra navigation, lost context |
| G6 | Evidence slot labels are long bundles ("Membership/access change audit + read result + update result"), with no checklist of which records belong in the capture | Capture evidence form | Doesn't know what to select |
| G7 | Deny results never say whether the denial was expected for the mission | Access tester trace | Misreads a correct denial as failure |
| G8 | Readiness "missing" items have no link to the relevant screen or object | Current Mission panel, Mission Progress | Knows what, not where |
| G9 | No step-level progress. The "current task" line comes from readiness, not step numbers, so it can point to a different step than the one the student is on | Current Mission panel | Confusing "current task" |
| G10 | Cross-mission state: M03/M05/T505 actions are available anywhere. The M04 Blair rule depends on whether T505 exists | Users screen actions; readiness | Early changes confuse later missions |
| G11 | No visual difference between "explore freely" steps (M01, predictions) and "final state is assessed" steps (M02–M05) | Mission steps | Worries about touching anything, or not realizing the final state matters |
| G12 | Corrections without a reset are possible (remove member, re-enable…) but never explained. Reset looks like the only way back | Mission Progress | Unnecessary resets, lost evidence |
| G13 | Terminology shows up before it's explained: DN, UPN, scope, ACL path, ABAC, securityRevision, credential version. The concept guides are only on the mission screen | Account page and elsewhere | Beginner overload |
| G14 | Object names in steps don't always match UI labels: "Response Share" vs resource name, "Case Summaries" vs R-CASE, "GC-PRIV" not named in steps, "Audit-Reviewers" vs GC-AUD | Steps vs screens | Search fails |
| G15 | The Users screen shows about eight action controls at once (group, OU, status, sessions, reset, unlock, MFA, transfer) plus a justification field | Account page | Too many options at once |
| G16 | On phones the side menu becomes a 2–3 column button grid below the mission bar. The account page is long, so the testers are far down the page (verify live) | Narrow screens | Long scrolling, lost orientation |
| G17 | Justification/ticket requirement for admin actions: a refusal message appears only after clicking (verify live) | Justify field | Trial and error |

---

## 3. M01 — Identity Directory

| Step | Screen / control | Gaps |
|---|---|---|
| 1 Alex person → accounts | Users (AD) → ad-alex → "Person record (HR)" card; switch to Cloud → cl-alex | Account links are plain text, not clickable. Students must switch directory and search again. There is no standalone "person" screen |
| 2 OU vs groups, Response Share/Queue paths | Account page: Account details (OU), "Groups and effective access" table | "Effective access" is a table title, not a tab or button, so the step reads like a control. The resource names in the table must match "Response Share/Response Queue" (verify live). The OU-vs-group difference isn't explained where it shows up |
| 3 Blair vs Finley groups | Groups screen or each account's effective access | Doesn't say which directory (Cloud). Group → role → resource needs Roles & Access; that link isn't signposted |
| 4 Drew disabled | Users, both directories | "Find Drew" doesn't mention that both directories need checking |
| 5 Seven-concept trace | Mission Progress dropdowns | Choices are a flat list of object IDs. Concept hints are helpful. There's no "open this object" link |
| 6 Capture E01/E02 + differences | Mission Progress | E01's label bundles five items. Students don't know which records to tick in the capture form |

Answer leakage: none. The step names Response Share/Queue, which is provided business context. Navigation guidance is too sparse, not too revealing.

---

## 4. M02 — Authentication vs Authorization

| Step | Gaps |
|---|---|
| 1 Inspect cl-blair | Needs the Cloud context, which isn't stated. "Case Summaries' rights" requires Resources or Roles, not Users |
| 2 Sign-in tester | Lives on the cl-blair account page below the fold. The "managed-blair" device option has to match the dropdown label (verify live). "Capture the success" is ambiguous: capture happens later, on Mission Progress |
| 3 Test Access read | The deny shows NO_MATCHING_GRANT, but there's no "this is the expected 'before' result" cue. Students may think they did something wrong |
| 4 APP-201 + narrow correction | APP-201 is under Tickets → T201, which isn't said. The fix happens on Users (Add to group) or Roles (Assign), and neither place is hinted, which is appropriate. The "narrow" meaning is left to reasoning. Fine, but a hint like "check what each candidate group grants before adding" would help without giving the answer |
| 5 Retest read/update | The update deny is the correct result but looks like a failure (G7). Readiness requires the update deny to have reason NO_MATCHING_GRANT specifically. That isn't visible to students |
| 6 Explanations | Prompts are clear. They're on Mission Progress, away from the audit record they cite |

T201 status: resolving a ticket with unmet predicates returns OUTCOME_UNMET with a safe explanation. Good. Students don't know they should resolve T201 at all; it isn't a step.

---

## 5. M03 — Build and Manage the Directory

| Step | Gaps |
|---|---|
| 1 Create ad-jamie + OU | The "Planned account" card appears only in Users with the AD context selected. The OU dropdown comes before the create button. The step says "choose the OU" but doesn't hint to check T301 first (T301 is on Tickets) |
| 2 DN, groups | Group names GA-ALL/GA-SUP aren't named in the step, which is correct: the ticket names them. Students must go back to Tickets to read them, then to Users to add them |
| 3 T302 verification | Tickets → T302 → Identity verification card. The HR ID field wants CH-008 from HR-301. Clear once on the ticket |
| 4 Credential reset | Reset is on the account page and needs the "Sensitive-action ticket" dropdown set to T302. That link is not explained. "Note the credential version" is in the details table (verify it's visible without scrolling) |
| 5 Enable, sign in, change challenge, test handbook | The must-change challenge flow inside the Sign-in tester needs confirming (verify live). A five-action chain in one step is heavy |
| 6 Disable → deny → re-enable → fresh sign-in | Readiness requires the handbook test to come after the disable. The "fresh sign-in" requirement is implicit. The expected ACCOUNT_DISABLED denial isn't framed as a success |
| 7 Evidence | Three slots. E07 needs a sequence of records. The capture form offers no ordering or grouping |

Dependency: if a student created ad-jamie early (e.g. during M01) in the wrong OU, the "Move OU" correction exists but nobody points to it.

---

## 6. M04 — Least Privilege Challenge

| Step | Gaps |
|---|---|
| 1 Write jobs | Answered in a text box on Mission Progress. Fine |
| 2 Group → role → scope; "mark reviewed" | Happens on Roles & Access, which the step never says. The "Mark reviewed" buttons belong to GC-JUN/GC-RESP/GC-AUD, but students may not know which three groups are "the configurations" (the T40x tickets list targets, not groups) |
| 3 Casey excess path | "Find broad rights" is intentionally unnamed, which is good. But students must go to cl-casey's effective access, trace the path to a group (GC-PRIV), then remove membership on Users *or* the assignment on Roles. "Don't delete role definitions" suggests a delete control that doesn't exist (verify live) |
| 4 Nine tests | Tests run from each account's page, so three account switches and nine test runs in total. No checklist shows which of the nine are done; readiness lists them only as missing items |
| 5 Temporary Blair grant | "Audit-Reviewers" must match the group label (GC-AUD). Four actions with order-sensitive readiness |
| 6 ABAC current + what-ifs | The What-if control is inside the Access tester, visible only for R-ABAC (verify live). Readiness requires exactly one changed attribute *and* a deny. A what-if that allows (or changes two things) silently doesn't count |
| 7 Explanations | Fine |

Hidden dependency: the Blair allowed set changes once T505 access exists. If a student does M05 first, M04's messages still hold, but this isn't stated. Order-independence is not explained.

---

## 7. M05 — Joiner, Mover, Leaver

| Step | Gaps |
|---|---|
| T501 | Seven actions in one sentence. Needs Cloud context, the T501 ticket for MFA/reset, sign-in with the change challenge, groups, and two tests. No sub-checklist |
| T502 | "Capture Alex's before access" has to happen *before* changes, but capture only exists on Mission Progress, so students may change first. The department transfer control is on the account page and applies to the person + both accounts (good, but unexplained). Four after-tests across two directories |
| T503 | Order matters (test before offboarding; old-session retest after revoke). The "retest old session" mechanism, i.e. which UI reuses an old session, needs confirming (verify live) |
| T504 | Verification with "Requester-supplied details only" should fail. That failure is the correct outcome but is only reflected as a badge. "Try the reset if you like" invites an action that readiness then flags ("a reset was applied — check the ticket record") without explaining how to recover |
| T505 | Needs Roles & Access (assign GC-AZ → RL-AZREAD at RG-LAB) plus membership on Users. The step doesn't mention Roles. Two expected denies (stop, Other-Team-VM) |

Main gap: M05 is the heaviest mission, but its steps are the longest and least signposted. It needs sub-steps per ticket.

---

## 8. M06 — Identity Investigation + Case File

| Step | Gaps |
|---|---|
| 1 Historical source | Good: Historical is the default and the source is labeled clearly |
| 2 Filter + raw log | The Result/Outcome filters are free-text (e.g. "success"), where a dropdown would be easier. The "Open details" wording in the step doesn't match the UI, where the event ID is a link button. "Pin exact event IDs" has no pin control: pinning happens by ticking IDs in the case-file editor on another screen |
| 3 Correlation | The raw-log dialog lists shared correlation IDs and offers "Find related records". Good. But it only covers related records from the same log type (verify live across sign-in/audit) |
| 4 Benign comparison | Done in Case File. Step doesn't say where |
| 5 Findings | Case-file editor. The event-ID picker shows *every* historical ID as checkboxes. That's heavy on phones, but doesn't leak anything |
| 6 Live chain | Free text only. Students must remember LA-/AT- IDs from Audit Logs (Live source). No picker |
| 7 Sections + limitations | Clear. Readiness requires the limitations field specifically |
| 8 Export + upload | Clear wording, and the Week 12 handoff is correct. "Preview the export" has no preview control, only Download |

Evidence: E17/E18/E19 are captured on Mission Progress, but the content lives in the Case File. That split is confusing for the final deliverable. E19 "versioned export" isn't linked to the download action.

No answer leakage: no row is labeled, and readiness only asks for S009/A002 references ("the correlated records you investigated"), which is appropriately indirect.

---

## 9. Prioritized fixes

**Critical**
- C1 Add "Where to go" and directory context to every step (G1, G3), rendered from mission definitions.
- C2 Make capture evidence available in the Current Mission panel, or from any screen (G5), with a per-slot "include these records" checklist (G6).
- C3 Label expected outcomes: when a test result matches a step's intended deny, show "Expected result for this step". Use the student-safe step description only, no predicates (G7).
- C4 Fix step wording that references controls that don't exist: "Pin" (M06), "Preview the export" (M06), "Open details", "delete role definitions" (M04) (G14).

**High**
- H1 Step-level deep links: open a screen with the account/ticket/resource preselected and AD/Cloud set (section 11).
- H2 Make account links on the person record clickable, switching context automatically (M01).
- H3 Split M03 step 5, M04 step 4 and all M05 tickets into sub-step checklists showing factual done/not-done from the student's own records (no answer key).
- H4 Readiness items get a "Go there" link to the relevant screen (G8).
- H5 Show the directory context in each screen's heading, and keep the selection when switching if the person has an account in the other directory (G3).
- H6 Soft guard for later-mission actions: a "This belongs to M03/M05 — continue?" note (not a block) (G10).

**Medium**
- M1 Explore vs assessed-final-state badges per mission/step (G11).
- M2 "How to correct without resetting" helper text (G12).
- M3 Inline term tooltips for DN, UPN, scope, ABAC, credential version (G13).
- M4 Group admin actions on the account page into sections (Membership / Placement / Status & sessions / Credentials / Transfer) (G15).
- M5 Result/outcome filters as dropdowns. Live-chain picker from Live audit IDs (M06).
- M6 Nine-test and four-ABAC-case progress checklist (M04).
- M7 Clarify T504 "try the reset" and how to record the refusal.

**Nice-to-have**
- N1 On phones, a jump link from the account header to "Test sign-in/access".
- N2 Filter the event-ID picker (search / only IDs you've opened).
- N3 T201/T30x/T40x "resolve the ticket" as an explicit final step.

---

## 10. Proposed instruction pattern

Each step renders four short lines from the mission definition (single source):

```text
1. What am I doing?     Test whether Blair can read case summaries.
2. Where do I go?       Users -> Cloud -> cl-blair -> Test access   [Open]
3. What am I looking for? The decision and the reason in the trace.
4. What proves success? A recorded test result (a denial is expected here).
                        Capture into E03 when done.            [Capture]
```

Rules: "Where" and "Proves" use real UI labels only. "Looking for" never names the correct group/role/permission unless the ticket or business context already states it. Success describes the *kind* of record, never the expected state.

---

## 11. Recommended deep links (per step)

- M01: 1 Users·AD·ad-alex, then Users·Cloud·cl-alex · 2 ad-alex effective access · 3 Groups·Cloud (Junior-Analysts, Case-Readers), Roles & Access · 4 Users (search "Drew") in both directories · 5–6 Mission Progress trace/capture
- M02: 1 Users·Cloud·cl-blair, Resources·Case Summaries · 2–3 cl-blair Sign-in / Access tester · 4 Tickets·T201 · 5 cl-blair Access tester · 6 Audit Logs·Live
- M03: 1 Tickets·T301, Users·AD·planned Jamie · 2 ad-jamie Administrative actions · 3 Tickets·T302 verification · 4 ad-jamie Reset (T302 preselected) · 5–6 ad-jamie Status + testers
- M04: 1 Tickets·T401–T403 · 2 Roles & Access (GC-JUN, GC-RESP, GC-AUD) · 3 cl-casey effective access · 4 cl-blair / cl-casey / cl-emi Access tester · 5 cl-blair Administrative actions · 6 cl-casey Access tester → Internal Response Note → What-if
- M05: T501 Tickets·T501, Users·Cloud·planned Jamie · T502 ad-alex / cl-alex · T503 cl-finley tester, then ad-/cl-finley actions · T504 Tickets·T504 · T505 Roles & Access, cl-blair
- M06: 1–3 Sign-in Logs·Historical, Audit Logs·Historical · 4–7 Case File sections · 6 Audit Logs·Live · 8 Case File export

---

## 12. Steps that can't currently be completed cleanly

1. M06 step 2 "pin exact event IDs": there's no pin control. It's actually done in the Case File picker.
2. M06 step 8 "preview the export": there's no preview, only download.
3. M02 step 2 / M05 T502 "capture the success/before access" at the moment it happens: capture is only on Mission Progress, so the "before" timing depends on the student leaving the screen first.
4. M04 step 6 what-if: a what-if that allows, or changes two attributes, silently doesn't count, and nothing tells the student.
5. M05 T503 "retest old session": the UI path to reuse an existing session needs live confirmation.
6. M01 step 1 "follow both account links": the links aren't clickable.

---

## Technical notes for the refinement pass (for later approval)

- Add optional `where`, `lookFor`, `proves`, `link` fields per step in the `missions` definitions in `seed.ts`. The Current Mission panel and Mission screen render them. No server-only predicates move to the client.
- Deep links: extend Simulator state (`view`, `dir`, `selected`, ticket/resource preselection) through a single `navigate(target)` helper.
- "Expected result" labels come from student-safe step metadata (e.g. `expects: "deny"` on the step). Readiness and answer-key files stay unchanged.
- Portable capture: reuse the existing CaptureEvidence component in the panel.
- Weeks 6–10 untouched. No DB/RLS/migration changes. No publish.
