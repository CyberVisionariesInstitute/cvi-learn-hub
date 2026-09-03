# Phase 3 PKI Architect Capstone — Launch Plan

Cohort: 7 students, Weeks 17–24. Cohort start (Monday of Week 17) is set by
`COHORT_START_ISO` in `src/lib/capstone/schedule.ts`; update that one value and every
deadline shown to students shifts with it.

## 1. Sign-in links

| When | Action |
| --- | --- |
| T−5 days | Confirm all seven accounts exist, student-only role, one active assignment at v1.0.0 (already true). |
| T−4 days | Send the password / sign-in link from `/auth`. Links are single-use and time limited — send in one batch, not weeks early. |
| T−3 days | Chase any student who has not set a password. Re-send individually (per-address rate limits apply; space resends out). |
| T−1 day | Confirm each student can reach **My Capstone Assignment** and sees their own scenario only. |

Do not send links more than a week ahead: expired links create day-one support load.

## 2. Week-by-week run of show

| Week | Stage group | Live session focus | Due Friday 23:59 |
| --- | --- | --- | --- |
| 17 | Stage 1 | Reading the brief, separating fact from assumption | Requirement register |
| 18 | Stage 1 | Trust model and CA hierarchy critique | CA hierarchy with justification |
| 19 | Stage 1 | Infrastructure, zones, HSMs, validation findings | Validated architecture |
| 20 | Stage 2 | Certificate profiles and issuance flow | Profiles mapped to workloads |
| 21 | Stage 2 | Lifecycle, CRL/OCSP, failure behaviour | Lifecycle controls |
| 22 | Stage 3 | Workload runs; reading and fixing failures | Passing runs + diagnostic history |
| 23 | Stage 4 | Change / incident response | Change response + re-test evidence |
| 24 | Stage 4 | Portfolio assembly and live defense | Submitted portfolio + defense |

## 3. Stage 4 event activation

Hidden events stay invisible to students until released from the console.

- **Do not activate before Week 23.** A student whose Stage 1–3 work is unstable will read the
  event as a bug, not a change.
- **Precondition per student:** at least one passing workload run and a saved Stage 3 baseline.
  Check this on the grading console (Stage 3 percentage and run counts) before releasing.
- **Release order:** the scenario's first registry event only. Release the second event, if the
  scenario has one, no earlier than 48 hours later, and only to students who acknowledged the first.
- **Never** release during the final defense window (last 48 hours of Week 24).

Release path: `/phase3-console` → Events → select assignment → release registry event.

## 4. First live session (Week 17)

1. Open with the cohort in the portal, everyone signed in, on **My Capstone Assignment**.
2. Walk one student through Analyze live — read the brief, log two requirements, log one decision,
   attach one piece of evidence, save. This makes the save/revision model concrete.
3. State the privacy rule out loud: each student sees only their own organization; there is no
   catalog and no shared answer key.
4. State the evidence rule: unsupported claims do not count. Evidence is the deliverable.
5. Close by pointing at `/pki/phase3` for deadlines and at the instructor feedback panel, so they
   know where marks and comments will appear.

## 5. Grading rhythm

- Review on the grading console (`/phase3-grading`) each Monday against the previous Friday deadline.
- Leave one feedback entry per stage group; students see it in their workspace immediately.
- Use marks consistently: Strong / On track / Needs work / Blocked. "Blocked" means the student
  cannot progress without instructor action — act on it the same day.
