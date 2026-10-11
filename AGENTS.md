<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Week 11 simulator state is server-authoritative (`w11_*` tables); all writes go through `src/lib/week11/week11.functions.ts` using the atomic `w11_commit_command`/`w11_reset_attempt` DB functions — why: students must not forge directory state, evidence or readiness.
- Week 11 readiness predicates and the answer key live only in `*.server.ts` files — why: expected-state rules must never reach student bundles.
- Week 11 evidence recipes are presentation-only guidance sourced from public mission labels and hints; CaptureEvidence uses the existing store contract and never gates capture on recipe completion — why: selection coaching must not become assessment logic or a second evidence system.
- Week 11 Evidence Tray summaries read only captured snapshot record arrays, never live state or readiness — why: descriptions must remain faithful to immutable evidence as the simulator changes.
- Week 11 Case File builder guidance and presence checks are presentation-only; navigation never writes learner fields, and all edits use the existing learner store and unchanged section keys — why: small-step coaching must preserve saved work, exports and authoritative readiness.
- Week 11 mission-working guidance uses presentation-only substeps mapped to unchanged `seed.ts` mission steps through one persistent simulator-shell companion; checklist/resume preferences are browser-local and attempt-scoped, never learner records or readiness — why: clearer instructions must not change exports, assessment rules or saved work.
- Week 12 reads each student's Week 11 case file server-side (session owner only) into a frozen, student-safe snapshot in `w12_attempts`; it never writes `w11_*`, and refresh is student-triggered only — why: Week 12 writing must never be silently overwritten and answer keys must stay server-side.
- Week 12 teaching imagery and diagrams live in a presentation-only reusable visual component with stage variants, without store access — why: visual changes must not affect source snapshots, readiness, exports or student content.
