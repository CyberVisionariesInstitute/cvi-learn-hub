# Week 11 Final Read-Only QA (Published Site)

No code edits, no data changes, no attempt resets, no publishing. The only output is a QA report file.

## What I will check

1. **Entry and saved work** — open the published Week 11 page signed out to confirm the sign-in screen appears. Signed-in checks use the preview with a read-only session; I will only view screens and never click Save, Capture, Reset, status buttons or text fields on a real account.
2. **Orientation** — the Week 11 path (Lab 1 → Lab 6 Case File → Download & GitHub), the "one continuous investigation / do not reset" wording, and Welcome back / Current lab / Next step / Continue.
3. **All six labs** — read every Current Mission step for the DO THIS / GO HERE / LOOK FOR / WHEN DONE format, Active Directory / Cloud Identity labels, exact screen names, controls that don't exist, and answer leaks. Extra attention on Labs 3, 4, 5 and 6. I will click each "Open …" button in an isolated practice copy to confirm it opens the right screen, account or ticket.
4. **Evidence capture** — test E01, E03, one Lab 4 slot, one Lab 5 slot and one Lab 6 slot in the isolated practice copy: the Find → Select → Explain → Save flow, collapsed optional evidence, empty states, sentence starters, the review before saving, the confirmation key, Evidence Tray wording and the collapsed raw snapshot.
5. **Left-menu sections** — for Resources, Help Desk / IAM Tickets, Sign-in Logs, Audit Logs, Evidence Tray, Case File and Download & GitHub, confirm each answers: What is this for? What do I look at? What do I do next?
6. **Tickets** — orientation headings, the five identity-verification steps, decision note and status. Compare the verification code against its last approved version to confirm the rules are unchanged.
7. **Logs** — Historical / Your simulated activity / Combined, opening a raw event, field help, the refused-action note, and using filters and dialogs on mobile and by keyboard.
8. **Case File (Lab 06)** — the full guided builder: core vs optional findings, the nine finding steps keeping saved data, no "including C009", the three live-record groups, Section 1 "Scope and environment", the separate Limitations step, all 12 section keys in order, the final review labeled as guidance, the Download handoff and the Week 12 same-account note.
9. **Export** — check through code and tests that ZIP/Markdown paths, the Lab 06 filename, optional findings, section order 1–12, corrected titles, the separate limitations section and Week 12 compatibility are all intact.
10. **Responsive and accessibility** — 1280px and 390px, page-level horizontal overflow, touch targets, visible focus, keyboard use, accessible names, and open/close behavior for help sections and dialogs.
11. **Regression and safety** — run the Week 11 tests and the Week 10–12 regression tests, check build and runtime logs, and confirm the protected files are unchanged (assessment rules, server functions, exports, auth, instructor tools, Week 12).

## Report format

The report goes in Files as `week11-final-qa-report.md`. Every finding is marked PASS, MINOR UX issue or BLOCKER. Each issue lists the screen/lab, what the student sees, why it could confuse them and the recommended fix. The report ends with a go/no-go recommendation, a fix-now vs can-wait split, the test/build/mobile results, and confirmation that nothing changed.

## Technical notes

- Signed-in walkthroughs on the published site would write autosave data to a real account, so interactive checks use the isolated in-memory practice copy on the local dev server. The published site gets signed-out and view-only checks.
- I will take checksums of the protected files before and after the QA to show nothing changed.
- Tests run with `bunx vitest run`, which writes nothing to the project.
