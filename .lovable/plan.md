# Week 11 fix-pass review (no edits made)

What was checked: the current code, all automated checks (144 pass, including Week 11 and the 43 Week 10 regression checks; 63 in those two suites), and the latest preview build (OK). This was a review of the code only. I did not click through the six missions live.

## 1. PASS
- Current Mission companion: one panel sits in the simulator shell above every view. It remembers whether it is open or collapsed, has a compact collapsed line, and uses aria-expanded/aria-controls with a scrollable body capped at 70% of screen height.
- Four-line step guidance ("What am I doing? / Where do I go? / What am I looking for? / What proves success?") appears for every step of M01–M06, in both the panel and the mission page, with Explore and Assessed tags.
- AD vs Cloud context: user lists say which directory you are viewing ("Viewing: On-Premises AD / Cloud (Entra ID)") and give a hint to switch. Groups shows which directory it is displaying. The OUs view on Cloud explains that OUs are an AD concept.
- Deep links: step links open the right view, directory, account or ticket.
- Readiness "Go there" links: shown in the panel and on the mission page. They are based only on the student-safe "missing" messages.
- Capture evidence inside the panel ("Capture E## here") without returning to Mission Progress. Slot hints are shown.
- Expected-denial labels on test results ("Expected learning result … A denial here is not a mistake"). What-if and Preview results are marked as not access evidence.
- Required-test checklists (run / not yet) state plainly that they only show a test exists, not that it is correct.
- M05 Joiner/Mover/Leaver steps name the order to follow ("Capture E13 before FIRST", "sign in + case read FIRST").
- Early-change guardrail: an amber heads-up appears when you change an account that belongs to another mission.
- Terminology: UPN and DN tooltips come from the glossary. "Linked ticket" wording matches the ticket screens.
- M06 historical logs: raw log view, "Find related records by correlation ID" (supports C009) and TSV download all work. The Case File has Live-chain ID picking, the case-file sections and the ZIP export.
- Week 12 handoff: the Case File shows the handoff note and "Technical content only". There is no manager or executive-summary requirement.
- No answer-key leakage: no Week 11 screen or guidance file imports any server-only file. Readiness rules, ticket outcome validation and the instructor key are unchanged.

## 2. PARTIAL
- **Readiness link "Capture evidence" goes to Mission overview** instead of opening the panel's capture form, so the back-and-forth remains for this one link.
- **Related-account links:** step links jump between paired accounts (e.g. ad-alex and cl-alex), but the account detail page has no clickable link to the same person's other-directory account.
- **M04 nine-test / ABAC progress:** the checklist shows which tests have been run. There is no "x of 9" count, and what-if tests are not grouped separately in the panel.
- **Corrections without reset:** the M05 wording says to escalate rather than reset. There is no dedicated "how to undo a change" hint on other steps. Needs a live check.
- **Expected-denial labels come from a hint list in the student-facing guidance file.** This follows the mission text, but anyone reading the page source can see which denials are expected. This is teaching content, not the answer key. Please confirm that is acceptable.
- **Phone layout:** the code keeps text from forcing a wider page, but it has not been re-checked at 390px on every view since the last pass.

## 3. FAIL / remaining gaps
- **M06 step wording was not fixed:** step text in the mission definitions still says "Pin exact event IDs" (there is no Pin control) and "Preview the export" (there is no Preview control, only "Download portfolio ZIP"). The mission page and the panel both show this text, so the Case File steps don't match the actual buttons.
- **The M06 situation text still says "Executive Summary"** as the Week 12 output. That is correct handoff wording, not a requirement, so it is acceptable.

## 4. New regressions
- None found in the automated checks or the build.
- Watch item: the panel body is limited to 70% of screen height and stays pinned at the top. When it is expanded on short phone screens, very little of the view underneath is left visible. Needs a live check.

## 5. Recommended fixes before resuming the walkthrough
1. Rewrite the two M06 steps in the mission definitions (seed.ts): replace "Pin" with the real control (note the event IDs in a finding or pick them in the Case File event picker) and "Preview the export" with "check the DRAFT/missing list, then Download portfolio ZIP".
2. Make the readiness "Capture evidence" link open the panel's capture form with the matching slot selected.
3. Add a "Same person in the other directory" link on the account detail page.
4. Add an "x of 9 required tests run" count to the M04 checklist.
5. Do a short live check at 390px (panel expanded on Users and on Case File) and a one-step walkthrough of M01 and M05.

## 6. Ready to resume M01?
Yes. M01–M05 can be walked through now. Fix item 1 before M06, because its steps name controls that don't exist. Items 2–4 are refinements and can be done alongside the walkthrough.

Nothing was edited or published.
