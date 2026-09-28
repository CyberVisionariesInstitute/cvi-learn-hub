# Week 11 student download and GitHub handoff (matching Week 10)

Nothing will be edited or published until you approve this plan. Week 10 stays exactly as it is.

## 1. How Week 10 works today
- Each lab page (Lab 1 and Lab 2) has a **Downloads** box in its toolbar:
  - "Download Lab 1 report (Markdown)" gives `week10-lab-1.md`
  - "Download Lab 2 report (Markdown)" gives `week10-lab-2.md`
  - "Download combined portfolio report" and "Download case packet"
  - "Download JSON backup" and restore
- Unfinished work can still be downloaded, and the report is marked as unfinished.
- The Week 10 start page says to download both reports and upload each one to `week-10/labs/`, and that "Downloading alone does not upload anything."
- A shared step-by-step GitHub guide sits right below the buttons. It says to use **your own** portfolio repository (not the template), gives the exact destination path, explains how to create `week-10/labs/` once with a README, then **Add file → Upload files → Commit changes**, and how to check the result.

## 2. How Week 11 works today, and the gap
- There is one control: **"Download portfolio ZIP"**, found only at the bottom of the Case File (Lab 06) screen. It builds the ZIP from your saved simulator work (six lab Markdown files, a README, a submission guide, an evidence index and JSON, the log TSVs, your simulator activity and a manifest) and names it `week-11-portfolio.zip` or `week-11-portfolio-DRAFT.zip`.
- The list of what is still missing (DRAFT) is shown only in that same Case File box.

Gaps:
- **Hard to find:** a student working on M01–M05 never sees the download. It looks like a Lab 06 task.
- **No single-lab download:** Week 10 students download one Markdown file per lab. In Week 11 you must download the whole ZIP, even to add just Lab 01.
- **GitHub steps live only inside the ZIP** (`README-week11-submissions.md`). There are no on-screen steps like Week 10's.
- **The root file is named `README-week11-root.md`** but belongs in `week-11/`. Students would have to rename it, or would end up with an oddly named file. This is not beginner-friendly.
- **You can't see what's missing without scrolling to the Case File.**

## 3. Recommended design and where the buttons go
Add one shared **"Download & GitHub"** screen to the Week 11 simulator, plus shortcuts to it:
1. **New menu item "Download & GitHub"** in the simulator menu, after Case File. The Case File keeps its own export box, linked to the same screen so there is one place to maintain.
2. **Dashboard card "Your portfolio files"**: shows each lab's status (evidence-ready or DRAFT with a count) and a "Download & GitHub" button.
3. **Current Mission panel shortcut:** add "Download this lab" next to the Evidence Tray shortcut. It downloads that mission's Markdown file.
4. **Mission overview (each mission):** add a "Download Lab 0X (Markdown)" button under the readiness list.

The "Download & GitHub" screen will use the same layout and wording as Week 10's Downloads box:
- A table of all six labs: filename, status, what's missing (the same student-safe messages already shown), and a download button for each lab.
- **"Download complete Week 11 ZIP"** (the main button).
- A "Download is not submission" notice, and a reminder to check your name first.
- Week 11 GitHub steps modelled on Week 10's step-by-step guide.
- A reminder that Lab 06 is the IAM Investigation Case File (Portfolio Deliverable 4) and that Week 12 builds on it.
- Phone layout: the table becomes stacked cards, buttons are at least 44px tall, there is a live status line after each download ("Downloaded lab-01-identity-directory.md (DRAFT)"), and everything works by keyboard.

## 4. GitHub folder layout (uses the existing Week 11 names)
```text
week-11/
  README.md                         (renamed from README-week11-root.md)
  labs/
    README.md                       (submission guide, renamed from README-week11-submissions.md)
    lab-01-identity-directory.md
    lab-02-authentication-vs-authorization.md
    lab-03-build-and-manage-directory.md
    lab-04-least-privilege-challenge.md
    lab-05-joiner-mover-leaver.md
    lab-06-identity-investigation-case-file.md
    evidence/
      week11-evidence-index.md
      week11-evidence.json
      historical-signins.tsv
      historical-audit.tsv
      simulator-activity.json
      export-manifest.json
```
- ZIP name: `week-11-portfolio.zip`, or `week-11-portfolio-DRAFT.zip` when any lab is incomplete. The name is always the same for the same situation; there are no dates or random IDs.
- Single-lab download names match the ZIP exactly (e.g. `lab-01-identity-directory.md`), with no "-DRAFT" suffix. DRAFT status goes inside the file, the same way Week 10 does it, so the GitHub filename never changes.

## 5. Per-lab downloads, full ZIP, or both
**Both.** Per-lab Markdown matches Week 10 and lets students upload as they go. The full ZIP is still the recommended one-step option, because Lab 06 and the evidence folder cross-reference the other labs. The screen will say: "Upload the ZIP contents at the end; single-lab files are for adding labs as you finish them." The existing JSON backup/restore is not needed because Week 11 work is saved to your account.

## 6. Changes to the Case File and export generator
- Rename the two README files as shown above, and update the links inside them.
- Add a server function `exportWeek11Lab({ mission })` that returns one lab's Markdown. It will be built by the same code the ZIP uses (split the per-lab body into its own helper), so the single file and the ZIP copy are identical. It uses the same sign-in and ownership checks as `exportWeek11`.
- Keep the DRAFT header and missing list exactly as they are. Everything still comes only from the student-safe readiness messages. No answer key, no readiness rules and no instructor data will be used.
- Lab 06 content, the Week 12 handoff wording, and the "no executive summary" rule stay unchanged.
- No changes to database, access rules, or Week 10 files.

## Technical details
- Files: `export.server.ts` (split out `buildLabMarkdown`, rename READMEs), `week11.functions.ts` (add `exportWeek11Lab`), `useWeek11.ts` (add `exportLab` download helper), new `components/week11/DownloadsView.tsx`, `Simulator.tsx` (new `downloads` view, Dashboard card, Case File link), `CurrentMissionPanel.tsx` and the mission view (per-lab button).
- The on-screen GitHub steps are a local `Week11SubmissionSteps` component whose wording mirrors Week 10's `SubmissionSteps`. Week 10's component is not imported or changed.

## 7. Acceptance tests
- Automated:
  - A single-lab download is byte-identical to the same file inside the ZIP.
  - The ZIP contains exactly the paths in section 4.
  - Incomplete labs show the DRAFT header and missing list, and the ZIP gets the `-DRAFT` name.
  - Filenames are always the same.
  - No export file contains answer-key or readiness-rule text (reuse the existing leak test).
  - Lab 06 still contains the Case File sections and the Week 12 handoff, and has no executive-summary requirement.
  - A signed-out or non-owner request to `exportWeek11Lab` is refused.
- Week 10: all existing checks pass, and the Week 10 files are unchanged.
- Live checks (preview):
  - "Download & GitHub" is reachable from the menu, the Dashboard, the Current Mission panel and the Case File.
  - A single-lab download and the ZIP download both work for a student account with no instructor role.
  - The missing items show before downloading.
  - At 390px there is no sideways scrolling.
  - Keyboard-only use works, and screen readers announce the status after a download.
- Nothing published.
