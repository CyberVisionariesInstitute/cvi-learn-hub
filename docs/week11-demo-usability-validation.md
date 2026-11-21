# Week 11 demo usability/export validation

Preview only. No publication, student messages, database writes, account access or student-attempt changes.

Preview: https://id-preview--7435b6fb-90c9-493a-a553-2c70b12230ab.lovable.app/cyberfoundations/week-11?lab=3

## Changes

- Each optional short question is identified using the existing `isRequiredQuestion` predicate, including optional questions inside required missions. Empty optional answers export as “Optional practice not completed”; filled answers are retained. Required empty answers remain distinguishable and completion rules are unchanged.
- Downloads and both exported READMEs share the three-guided-labs/six-legacy-files mapping. Classic Lab 02 holds guided Lab 1 and Lab 2 work; classic Lab 05 holds required T502/T503 plus optional practice; classic Lab 06 holds the Case File. Classic Labs 01/03/04 remain optional.
- Connect offers a keyboard-operable direct action opening the existing Finding 1 record-selection task, with Finding 2 still available. No automatic selections or third-finding requirement. Historical sign-in and audit records need a real matching correlation ID across completed findings; no assessment or seed change.
- Save Case File writing and Capture E17 have distinct purposes and confirmations. Guided log/Evidence Tray navigation now works and returns without unmounting the current task. Removed the obsolete Case File download message pointing at classic-only capture navigation.
- Capture input clears only after confirmed snapshot/explanation success. Caption failure retains the explanation and warning. The saved list reads confirmed captions from the server-view copy, not pending local edits.
- Concurrent flush callers share one request; newer edits remain pending. Confirmed saves update the view's saved learner copy. Existing export/reset and Save & Continue failure gates are preserved.

## Verification

- **272 tests passed**, 20 test files; **148 Week 11/12-focused tests passed**.
- Export regressions checked each optional/required question, preserved filled optional answers, individual Markdown/ZIP byte equality, all six literal legacy paths, optional blanks not creating DRAFT, and existing Case File fields/extra findings. Tests preserve original learner objects.
- Save regressions checked shared in-flight saves, newer edit preservation, conflict/failure preservation, export refusal after failed flush, and caption failure results. Existing Week 12 handoff/sourceComplete regressions passed unchanged.
- **15 browser checks passed** using real presentation components and a temporary fictional in-memory store. No hosted save/import functions were invoked. Zero page errors; zero non-GET/HEAD requests.
- Browser sequence: Connect → direct finding picker → select records → save → edit reasoning → failed Save & Continue stays put → conflict preserves writing → successful save → return → reopen saved writing → open logs/return → capture E17 → inspect saved IDs/explanation → Evidence Tray/return → navigate away/remount → retained snapshot → caption failure retains input/warning → capture failure retains input → Downloads mapping.
- Desktop 1280×1800 and phone 390×844 checked; Downloads, Connect and picker had no horizontal page overflow. Enter-key direct finding action verified at both widths. Screenshots reviewed for mapping, mobile picker and capture-failure display.
- Preview build log: build OK. Temporary fictional browser harness removed before final delivery.

## Limits

No authenticated student flow or hosted persistence/concurrent-session test was run because student mutations were forbidden. Actual browser file downloads were not exercised; export content and ZIP bytes were exercised in tests. No full keyboard-only or screen-reader audit, and no manual typecheck. These limits do not change the verified synthetic workflow results.

## Changed files

- `src/lib/week11/requirements.ts`
- `src/lib/week11/export.server.ts`
- `src/lib/week11/instructions.ts`
- `src/lib/week11/useWeek11.ts`
- `src/lib/week11/week11-downloads.test.ts`
- `src/lib/week11/correlation-save.test.ts`
- `src/components/week11/DownloadsView.tsx`
- `src/components/week11/Simulator.tsx`
- `src/components/week11/guided/GuidedApp.tsx`
- `src/components/week11/CaseFileBuilder.tsx`
- `src/components/week11/CaptureEvidence.tsx`
- `AGENTS.md` (one shared-mapping rule)
- `roadmap.md` (this request only)
- `docs/week11-demo-usability-validation.md`

Seed, actual completion predicates, student data, legacy filenames, and all Week 12 files remain unchanged.