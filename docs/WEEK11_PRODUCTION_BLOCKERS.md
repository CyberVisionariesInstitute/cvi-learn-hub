# Week 11 — Production release blockers

Status: **preview only. Do not publish Week 11 to students until every blocker below is resolved.**

## 1. Cohort isolation (BLOCKER)

This project has no CyberFoundations cohort or assignment records. Current behavior:

- Each Week 11 attempt belongs to its signed-in owner (`w11_attempts.owner_user_id`), enforced server-side.
- **Every authorized instructor sees every Week 11 attempt** (`listWeek11Attempts` is staff-wide; the `w11_*` staff-read policies use `has_role(..., 'instructor'|'admin')` with no cohort scoping).
- The `cohort_label` column exists on `w11_attempts` but is never populated.

Required before student release:

- Real Lab Portal/Tracker cohort and assignment integration.
- Attempts linked to a real assignment/cohort at creation (no hard-coded UUIDs, no fake assignments).
- Instructor visibility limited to their assigned cohorts, in both the server functions and the RLS staff-read policies.
- July and September cohort data must remain isolated once integration is wired.

## 2. Approved Module 4 Ivy artwork — RESOLVED 2026-09-27

Hero + six mission illustrations attached at `src/assets/week11/week11-{hero,m01..m06}.webp.asset.json` from the reviewed Module 4 visual set (navy suit, teal blouse, Security & Identity Analyst). Rendered via `src/components/week11/Visuals.tsx`. Concept teaching cards (A–J) are real accessible UI, not baked into images. Week 6 Grid Technician art remains unused in Week 11.

## 3. Pre-release QA still owed

- Full six-mission walkthrough end to end.
- Keyboard and screen-reader pass.
- A second student account to confirm cross-student invisibility.
- Lab Portal / Tracker links (those projects are untouched).

## Separately tracked technical debt (not a Week 11 blocker)

- `has_role`, `is_staff`, `owns_assignment` are SECURITY DEFINER and executable by signed-in users (linter 0029). Reviewed 2026-09-27: **Low severity** — read-only yes/no oracles about IDs a student already knows; no boundary crossing. Remediation (caller-scoping guard + revoke from PUBLIC/anon, or a private schema) is approved as a separate change; do not fold it into Week 11 refinement passes.
