# Phase 3 In-Portal Capstone Workspace

Absorb the standalone Phase 3 simulator into this portal so `/pki/capstone` becomes the student workspace itself. CyberFoundations Weeks 6–7 and the existing PKI demo modules stay untouched.

## Two decisions needed before Phase 1

**1. Deployment target must change.** The project currently deploys as a fully prerendered static site to GitHub Pages (`.github/workflows/deploy.yml`, `GITHUB_PAGES=true` branch in `vite.config.ts`, `nitro: false`). A static site has no server, so it cannot enforce authenticated student access, exact scenario-version locking, server-side ownership checks, or auditability — the security contract you asked to preserve is impossible there. The plan assumes Phase 3 is served from the Lovable-hosted app (server functions + database), with GitHub Pages either retired or kept only for the public marketing/demo routes.

**2. Backend must be enabled.** There is no backend connected today (no `src/integrations`, no auth, all content is static TypeScript data under `src/lib/demo-lab/`). Phase 1 turns on Lovable Cloud (Postgres + auth + storage + server functions). Without it, nothing in the security contract can be honored.

**Assumption:** scenario packages are authored/owned by instructors and stored server-side; students never receive the full package, only the redacted slice their assignment unlocks.

---

## Phase 1 — Backend foundation and security contract

Enable Lovable Cloud, then build the data model. All Phase 3 reads/writes go through authenticated server functions; nothing sensitive ships to the browser.

Tables (all with row-level security and explicit grants):

- `profiles` — student display identity, linked to auth user.
- `user_roles` — separate role table (`student`, `instructor`, `admin`) with a `has_role()` security-definer function. Roles are never stored on profiles.
- `scenario_packages` — instructor-only. Full authored package JSON, `version` string, `status` (draft/released). No student-readable policy at all.
- `scenario_student_views` — the redacted, student-safe projection of a package version (brief, constraints, requirements, visible workloads). This is the only scenario content a student can ever read, and only via an assignment join.
- `assignments` — one row per student: `user_id`, `scenario_package_id`, pinned `scenario_version`, `state` (active/locked/submitted), `assigned_by`, timestamps. Uniqueness constraint enforces one active scenario per student.
- `projects` — the student's working state: `assignment_id`, `owner_id`, versioned `state` JSON (design graph, CA hierarchy, network/service placement, certificate inventory, automation config), `revision`, `updated_at`.
- `project_revisions` — append-only snapshots for save/reopen and rollback.
- `evidence_items` — captured artifacts (test results, validation output, screenshots/notes) tied to project + checkpoint.
- `checkpoints` — per-week completion records (Weeks 17–24) with instructor review status.
- `hidden_events` — instructor-authored change/incident triggers with `activated_at`; rows are invisible to students until activated, enforced in policy, not in UI.
- `submissions` — final portfolio/defense package with immutable snapshot at submit time.
- `audit_log` — every state-changing action: actor, assignment, action, before/after revision, timestamp.

Enforcement rules baked into policies and server functions:

- Every student read is scoped by `owner_id = auth.uid()` joined through an active assignment. Cross-student and cross-scenario access is denied at the database, not the route.
- Scenario content is only reachable through the student's assignment at its pinned version — no catalog endpoint, no browse, no version switching.
- Instructor-only fields (calibration, difficulty score, answer guidance, hidden events pre-activation, QA records, other students' work) live in instructor-only tables/columns with no student policy.
- Import of an exported project verifies the file's assignment id, owner, and scenario version match the caller's active assignment; mismatches are rejected and logged.
- Route guards protect the UI; every server function independently re-checks auth and ownership.

Deliverables: migrations, `requireSupabaseAuth`-backed server functions for load/save/submit/export/import, and an `/auth` sign-in route.

---

## Phase 2 — Student workspace at /pki/capstone

`/pki` stays the PKI home. `/pki/capstone` moves under the authenticated gate and becomes the workspace shell, keeping the lighter PKI blue/gold trust-campus visual identity already used by `pki.capstone.tsx` — never CyberFoundations dark navy.

Routing:

```text
/pki                                  public PKI home (unchanged)
/pki/capstone                         public overview + sign-in CTA (no simulator link)
/_authenticated/capstone              workspace shell (assignment header, progress rail)
  /overview                           assignment + scenario brief + week roadmap
  /analyze                            requirements & stakeholder mapping
  /design                             trust model / CA hierarchy builder
  /connect                            VM, HSM, network, service placement
  /operate                            certificate issuance, renewal, revocation, CRL/OCSP
  /validate                           workload trust checks
  /test                               load + failure injection, results
  /adapt                              change/incident response (hidden-event driven)
  /evidence                           evidence locker, checkpoints
  /defend                             final portfolio assembly + submission
```

Workspace behavior:

- Loader (safe under `_authenticated`) fetches assignment + redacted scenario view + current project revision.
- Autosave with explicit "Save" and revision history; reopen restores the last revision.
- Stage gating follows the Analyze → Design → Connect → Operate → Validate → Test → Adapt → Re-test → Defend loop already described on the current capstone page; checkpoints unlock as prerequisites complete.
- Every stage writes evidence items that flow into the defense portfolio.
- Student-safe export produces a signed, owner-scoped JSON snapshot; import validates as described in Phase 1.
- Remove both "Open My Capstone Assignment" external links to `phase3-simulator-wireframe.toniadwebster.chatgpt.site` and any other student-facing reference to it. Existing capstone marketing content (Before You Begin, roadmap, workflow, strong-work criteria, individual-assignment callout, support) is retained as the pre-login overview.

---

## Phase 3 — Instructor functionality

Extend the existing `/instructor` route (which today is public and demo-only) into a role-gated console under `_authenticated` with `has_role('instructor')`:

- Scenario package authoring/versioning and release; assign a student to a package version.
- Cohort dashboard: per-student progress, checkpoints, submission state. No cross-student leakage to students.
- Hidden event activation per assignment, with audit entries.
- Checkpoint review, rubric/competency scoring against the common rubric model, defense evaluation.
- Audit log viewer.

The existing CyberFoundations instructor Present mode and facilitation guides remain exactly as they are; the console gains a Phase 3 section rather than being rewritten.

---

## Phase 4 — Migration from the standalone simulator

- Catalogue the standalone simulator's screens, state model, and the seven released scenario packages; map each to the tables and workspace stages above. This is the porting inventory that drives Phase 2/3 sequencing.
- Port the seven packages into `scenario_packages` as versioned rows via migration, and author the redacted `scenario_student_views` projections for each.
- If any student work exists in the standalone system, import it into `projects` with matching pinned versions; otherwise cut over at a clean cohort boundary.
- Redirect or retire the standalone URL; confirm no student-facing surface in this repo references it.
- Adjust the GitHub Pages build: either drop the Pages workflow in favor of Lovable hosting, or restrict its prerender list to public routes only and exclude every `_authenticated` path.

---

## Phase 5 — Acceptance tests

Security (the gating set):

- Unauthenticated request to any capstone workspace route or server function is denied.
- Student A cannot read or write Student B's project, evidence, submission, or assignment, by direct API call.
- No endpoint returns a scenario catalog, another version of the assigned scenario, calibration data, difficulty score, answer guidance, or unactivated hidden events.
- Import rejects a file from another student, another scenario, or another version, and logs the attempt.
- Every mutation appears in `audit_log`.

Functional:

- End-to-end run: sign in → assignment → brief → design → operate → validate → test → hidden event activated by instructor → adapt → re-test → evidence → submit → instructor review.
- Save, close, reopen restores exact state; revision history rolls back correctly.
- Export/import round-trips for the owning student.

Regression:

- `/`, `/cyberfoundations`, both Week 6 and Week 7 missions, `/pki`, and existing PKI demo modules render and behave identically; Present mode unchanged.
- Typecheck, production build, and responsive QA at 390/1280/1920 across the new workspace.
