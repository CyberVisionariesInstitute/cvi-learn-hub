# Week 11 Download & GitHub — Review (no changes made)

Evidence: code inspection of the latest commit, all automated checks (7 files / 150 tests passing, including 6 new Week 11 download tests), preview build OK. No live signed-in browser walkthrough was done in this review.

## PASS
- **Discoverable from every intended place:** "Download & GitHub" in the simulator menu, the Dashboard "Your portfolio files" box, the Current Mission panel ("Download this lab" and "Download & GitHub"), each mission page, and the Case File (Lab 06), which now shows the same shared download screen.
- **Per-lab Markdown for M01–M06:** each lab download is built by the same generator as the ZIP. A test confirms each single-lab file is byte-identical to the same file inside the ZIP.
- **Complete ZIP:** still works, and saves any pending text before building. File name: `week-11-portfolio.zip`, or `-DRAFT.zip` when any lab is unfinished.
- **DRAFT and missing items:** each lab shows "Evidence-ready" or "DRAFT · N missing" with an expandable "What's missing" list before download. The DRAFT marker is also written inside the file. The screen says "Download is not submission" and explains that uploading to GitHub is not grading submission.
- **GitHub instructions on screen:** use your own portfolio repository (not the template), put files in `week-11/labs/`, create the folder with README if needed, then Add file → Upload files → Commit changes, and check your name and answers appear afterwards. A full folder layout is included.
- **Folder structure:** `week-11/README.md`, `week-11/labs/README.md`, six `lab-0X-….md` files, and `evidence/` (index, JSON, two historical log files, simulator activity, manifest). A test checks the ZIP contains exactly this list.
- **Old README names removed:** `README-week11-root.md` and `README-week11-submissions.md` no longer appear anywhere in the app.
- **Lab 06:** still the IAM Investigation Case File (Portfolio Deliverable 4), with the Week 12 handoff. A test confirms no Executive Summary section.
- **No leaks:** downloads only read the signed-in student's own active attempt and include only the student-safe missing-items text. Tests confirm no answer-key or rule wording in the exports, and that the download screen does not load any server-only code.
- **Students can download:** the lab download needs only a signed-in account, with no instructor check (only instructor functions check staff role).
- **Week 10:** no Week 10 screens changed in these commits, and all Week 10 checks pass.

## PARTIAL
- **Accessibility/phone:** buttons are real buttons, download results are announced to screen readers, and lab rows are laid out to wrap on narrow screens. Not yet confirmed in a live browser at 390px width with a signed-in student.
- **Mission page download:** it works, but it is a small secondary button at the bottom of the mission brief, easy to miss.
- **Small code tidy-up:** the lab download helper labels its input loosely. It works because the server checks M01–M06, but the label could be more exact.

## FAIL / remaining gaps
- **Old Mission 6 wording is still there** (in the mission definitions):
  - "Pin exact event IDs for at least two distinct findings." There is no Pin button; the Case File uses event-ID filtering and "insert activity ID."
  - "Preview the export, fix missing pieces, download the ZIP…" There is no Preview; the right flow is to check the "What's missing" list on Download & GitHub, then download.

  Students see this text in the mission brief and the Current Mission panel, so it contradicts the new screen.

## Regressions
- None found in checks or build.

## Ready for the Lab Portal update?
- **Almost.** Fix the two Mission 6 sentences above first, since the Portal instructions will point students to this flow. Then do one short signed-in student test at phone width: download one lab and the ZIP. After that, it is ready.

## Recommended fix (single small pass, when approved)
1. Reword the Mission 6 step: "Filter accounts, outcomes and devices. Open details and View Raw Log. Note the exact event IDs for at least two distinct findings and add them to your Case File."
2. Reword the export step: "Open Download & GitHub, review the missing-items list for Lab 06, fix anything missing, then download the complete ZIP and upload it to your GitHub portfolio. Week 12 uses this case file as source material."
3. Tighten the lab download helper's input type to M01–M06.
4. Signed-in 390px browser check of Download & GitHub, the Current Mission panel, and the Case File.
