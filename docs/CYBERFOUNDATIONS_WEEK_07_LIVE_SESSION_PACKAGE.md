# CyberFoundations Week 7 — Cloud Heights Guard Post

**Security Incident Strategy Session**
*Can It Reach It? Should It Reach It? Can You Prove It?*

- Experience ID: `cf-w7-cloud-heights-guard-post`
- Route: `/cyberfoundations/week-07/cloud-heights-guard-post`
- Program / Module / Week: CyberFoundations / Module 2 / Week 7
- Type: Live Mission · Status: Available · Replay: Available
- Duration: 75 minutes, seven scenes
- Instructor console: `/instructor` → CyberFoundations → Cloud Heights Guard Post

This document mirrors the implemented experience exactly and can be run as a
paper backup if the Demo Lab is unavailable.

## Scope guardrails (apply to every scene)

- A rule is a traffic decision: direction, source, source port, destination,
  destination port, protocol, action and priority each answer a distinct question.
- Rules evaluate from the lowest priority number upward; the first matching rule wins.
- Inbound and outbound are separate ledgers.
- Student-created/edited rules stay in priority **200–999**. Protected baseline
  priorities **100 allow-ssh-from-bastion**, **110 allow-icmp-intra-vnet** and
  **120 deny-ssh-student-subnet** are never changed and are never troubleshooting targets.
- The Portal rule tester is fixed to **TCP 8080 on the student's own VM**.
- Required source: **Grid Beacon 10.60.6.4**. Negative-test source: **Other Test
  Source 10.60.6.10**.
- Temporary service command: `python3 -m http.server 8080`.
- Supported verdicts: `ALLOWED`, `DENIED`, `SERVICE_NOT_LISTENING`, `TEST_ERROR`.
- The listener and the NSG rule do different jobs; `SERVICE_NOT_LISTENING` can
  coexist with a correct rule.
- There is **no student-facing flow-log viewer** in the current lab product. Do
  not promise one.
- Never claim "everything is secure". State only what the presented evidence supports.
- Workflow kept visible: UNDERSTAND → PREDICT → INSPECT → CHANGE → TEST → VERIFY → EXPLAIN.

---

# Deliverable 1 — 75-Minute Run of Show

| # | Scene | Minutes | Focus | Environment | Interaction |
|---|-------|---------|-------|-------------|-------------|
| 1 | Incident Briefing | 9 | Ask for evidence before changing anything | Incident response room | `investigation-request` |
| 2 | What Do We Actually Know? | 10 | Proven vs assumed vs not yet verified | Incident response room / evidence board | `evidence-sort` |
| 3 | Read the Door Ledger | 14 | Lowest number first, first match wins, narrowest fix | NOC wall display | `rule-evaluation` |
| 4 | The Plot Twist | 11 | Permission ≠ service availability | Remote access workstation | `investigation` |
| 5 | Prove It | 11 | Positive + negative testing as paired proof | Troubleshooting room / test wall | `test-comparison` |
| 6 | The Operations Briefing | 10 | A statement scoped to the evidence | Briefing room | `briefing` |
| 7 | Module 2 Close / Week 8 Bridge | 10 | ADDRESS → … → EVIDENCE, then Module 3 handoff | Cloud Heights campus | `sequence` |
| | **Total** | **75** | | | |

Time split target: roughly **60–70% student reasoning and interaction**,
**30–40% instructor facilitation**. Each scene carries an explicit processing
pause; those pauses are part of the minutes above, not extra.

---

# Deliverable 2 — Complete Instructor Facilitation Guide

Each scene's guide is also rendered live in the instructor console
("Facilitation guide — Scene N"), closed by default in present mode.

## Scene 1 — Incident Briefing (9 min)

**Objective.** Decide what you need to know about incident CH-8080 before anyone
touches a rule.

**On screen.** Incident ticket CH-8080 with six known fields; eight selectable
evidence questions; a field-notes panel that fills as questions are asked.

**Ticket.** Incident CH-8080 · Affected service: Student application ·
Destination: Student VM · Protocol: TCP · Port: 8080 · Reported symptom:
Application unreachable · Required source: Grid Beacon 10.60.6.4.
The ticket does not identify routing, NSG/firewall, rule priority, service
availability, authentication or anything else as the cause.

**Ivy's opening.** "Before we touch the ledger, what questions would keep us from
solving the wrong problem?"

**Instructor opening statement.** "You are the Cloud Heights security operations
team. A ticket says the student application is unreachable on TCP 8080. You have
permission to change rules — but not yet."

**Questions to ask.** What do you need to know before you change anything? ·
Which of these questions could, on its own, end the investigation? · What does
the ticket deliberately not tell us?

**Expected student reasoning.** Confirm the VM is running first; establish
destination, source, protocol and port as four separate facts; treat "is there a
path" and "is the service listening" as different questions; read the rules
before proposing a rule change.

**Likely misconceptions.** "It's the firewall" before any rule has been read ·
source and destination collapsed into one fact · assuming the tester covers more
than TCP 8080.

**Follow-up questions.** If the VM were powered off, which other answers would
still matter? · Which answer would you want in writing before editing a rule?

**Processing pause.** After the last answer, 60 seconds. Ask each student to write
down the one thing they still cannot prove.

**Evidence reveal order.** VM power state → destination → network path → service
state (deliberately unresolved) → applicable rules → required source → protocol
and port → how the test was run.

**Correct answer / reasoning.** All eight questions are legitimate; the scene is
complete when each has been asked and the room can name what remains unproven —
the service state.

**Transition.** "We have answers. Next we separate the answers we proved from the
stories we told ourselves."

## Scene 2 — What Do We Actually Know? (10 min)

**Objective.** Sort every statement into PROVEN / ASSUMED / NOT YET VERIFIED and
defend the sort.

**On screen.** Evidence board with three columns and eleven statements from Scene 1.

**Instructor opening statement.** "Same evidence, no new information. Our only job
is to be honest about which category each statement belongs in."

**Questions to ask.** What have we proven? → then → What have we NOT proven? ·
Which assumption is the most tempting one here, and why?

**Expected student reasoning.**
- PROVEN: VM is running; required source is 10.60.6.4; destination is the assigned
  student VM (simulation address 10.60.7.25); a network path to the VM subnet is
  available; requested protocol/port is TCP 8080.
- ASSUMED: "The firewall is broken", "The network is down", "The application is
  broken", "Someone changed a rule".
- NOT YET VERIFIED: the service is listening on TCP 8080; the applicable rules
  allow traffic from 10.60.6.4.

**Likely misconceptions.** Treating "the path is available" as proof the traffic is
permitted · filing a cause claim under NOT YET VERIFIED to make it sound neutral.

**Follow-up questions.** If "the network is down" were true, which proven fact would
have to be wrong? · What would it take to move "the service is listening" into PROVEN?

**Processing pause.** 60 seconds after the sort. Ask each student to name the
assumption they personally would have made.

**Evidence reveal order.** Proven summary line → the open question (why the traffic
did not arrive).

**Reinforce.** Reachability does not equal permission. Revisions are free and never
punitive.

**Transition.** "Two of these are questions about rules. Let's go read the ledger and
stop guessing."

## Scene 3 — Read the Door Ledger (14 min)

**Objective.** Evaluate the inbound ledger in priority order and choose the smallest
defensible correction.

**On screen.** Inbound ledger (three protected baseline rules plus two
student-controlled rules); the traffic card 10.60.6.4 → student VM, TCP 8080;
stepwise evaluation.

**Student-controlled rules as found.**

| Priority | Action | Source | Destination | Protocol | Port |
|---|---|---|---|---|---|
| 200 | DENY | 10.60.6.0/24 | Student VM | TCP | 8080 |
| 250 | ALLOW | 10.60.6.4 | Student VM | TCP | 8080 |

**Instructor opening statement.** "This is the door ledger for the student VM. Read
it the way the platform reads it: top of the list is the lowest number, and the
first rule that matches ends the conversation."

**Prediction question (before any outcome is shown).** "What happens to traffic from
10.60.6.4, and why?"

**Evaluation walk.** 100 no match → 110 no match → 120 no match → **200 MATCH → DENY
→ STOP** → 250 remains visible and explicitly **UNEVALUATED**.
Verdict: DENIED at priority 200. LOWER NUMBER FIRST. FIRST MATCH WINS.

**Remediation options.** Change source to Any · Delete all DENY rules · Open TCP 8080
to the entire subnet · **Correct only the conflicting student-controlled rule**
(strongest).

**Corrected ledger (student band only; 100/110/120 untouched).**

| Priority | Action | Source | Destination | Protocol | Port |
|---|---|---|---|---|---|
| 250 | ALLOW | 10.60.6.4 | Student VM | TCP | 8080 |
| 300 | DENY | 10.60.6.0/24 | Student VM | TCP | 8080 |

**Likely misconceptions.** "The more specific rule wins" · "The ALLOW cancels the
DENY" · "The firewall is broken" · reaching for priorities 100/110/120 as
troubleshooting targets.

**Follow-up questions.** If we set the ALLOW source to Any, what have we just
permitted? · Which remediation option would you have to defend in a review?

**Processing pause.** 90 seconds after the MATCH → DENY → STOP reveal, before opening
the remediation question.

**Evidence reveal order.** Evaluation order → first match wins → separate inbound and
outbound ledgers → editable band 200–999.

**Correct answer / reasoning.** DENIED at 200; 250 unevaluated. Fix by reordering
within the student band: ALLOW 10.60.6.4 at 250, DENY 10.60.6.0/24 at 300. Priority
values are behaviour, not identifiers.

**Transition.** "The ledger is right. Let's test it — and see whether the ledger was
the only problem."

## Scene 4 — The Plot Twist (11 min)

**Objective.** Interpret `SERVICE_NOT_LISTENING` without reaching for the rule ledger
again.

**On screen.** Terminal showing the tester result; a four-node status strip (source,
path, rule, listener); one decision step, then the service command and retest.

**Reveal.** `portal rule-test --source 10.60.6.4 --proto tcp --port 8080` →
`Result: SERVICE_NOT_LISTENING`.

**Instructor opening statement.** "We corrected the ledger and ran the tester. Read
the result before anyone touches anything."

**Immediate question.** "Do we change the NSG again?" (Correct: no — different failure
domain.)

**Then.** Start the temporary service with the only supported command,
`python3 -m http.server 8080`, and retest:
Grid Beacon 10.60.6.4 → TCP 8080 → **ALLOWED**.

**Likely misconceptions.** Treating any failed test as a firewall problem · widening
the ALLOW rule to force a green result · claiming authentication was tested when
nothing tested it.

**Follow-up questions.** If we had broadened the rule first, what would the retest
have proven? · What is the user-visible symptom for both of tonight's problems?

**Processing pause.** 60 seconds immediately after `SERVICE_NOT_LISTENING` appears —
no hands, no answers, just reading.

**Evidence reveal order.** Tester verdict → permission vs availability → temporary
service command → retest result ALLOWED.

**Reinforce.** Permission does not guarantee service availability. The same
user-facing symptom can have different causes.

**Transition.** "It works. That is not the same as knowing it works securely."

## Scene 5 — Prove It (11 min)

**Objective.** Pair the positive result with a negative test and state exactly what
the pair proves.

**On screen.** Two test cards, a persistent paired-proof table
(source → protocol/port → verdict), and the interpretation question.

**Opening.** Begin with the ALLOWED result and ask: "Are we done?"

**Tests.**

| Source | Protocol / Port | Verdict | Proves |
|---|---|---|---|
| Grid Beacon 10.60.6.4 | TCP 8080 | ALLOWED | Required traffic works |
| Other Test Source 10.60.6.10 | TCP 8080 | DENIED | Restricted traffic fails |

**Likely misconceptions.** Assuming a same-subnet address inherits the exact-source
allowance · concluding "everything is secure" from two tests on one port · treating
the tester as evidence about authentication.

**Follow-up questions.** If the negative test had returned ALLOWED, what would that
tell us about the rule? · What could you write, word for word, that these two
results support?

**Processing pause.** 60 seconds once both verdicts are on the wall, before asking
what they prove.

**Evidence reveal order.** Positive result → negative result → Deliverable 2 paired
proof statement.

**Correct answer / reasoning.** Together with the narrow rule, the pair supports
least privilege for **this TCP 8080 access requirement** — not for the VM, the
application, or authentication.

**Reinforce.** IT WORKS is not the same as IT WORKS SECURELY.

**Transition.** "Now we say it out loud, in a room where somebody will ask us to
defend every word."

## Scene 6 — The Operations Briefing (10 min)

**Objective.** Assemble an incident statement that says only what the evidence
supports.

**Sections.** WHAT WE FOUND · WHAT WE CHANGED · WHAT THE EVIDENCE PROVES · NOT
SUPPORTED — LEAVE OUT.

**Supported lines.**
- Found: the network path to the VM was available; an earlier matching
  student-controlled security rule prevented the intended traffic; a second problem
  existed because the service was not listening on TCP 8080.
- Changed: the rule conflict was corrected without broadening access or altering
  protected baseline rules; the temporary TCP 8080 service was restored.
- Proves: the intended Grid Beacon source was ALLOWED on TCP 8080; the unintended
  source was DENIED on TCP 8080; positive and negative testing together support
  least privilege for this TCP 8080 access requirement.

**Unsupported lines students must reject, with reasons.**
- "The firewall was broken." — it enforced the ledger exactly as written.
- "The network caused the outage." — the path was confirmed available beforehand.
- "Everything is secure now." — two tests on one protocol and one port cannot support
  a claim that broad.

**Approved statement.** *CH-8080 closed: rule conflict corrected inside the student
band, temporary service restored, access verified by paired positive and negative
testing on TCP 8080.*

**Processing pause.** 60 seconds before approval; the room reads the assembled
statement silently.

**Transition.** "That closes CH-8080 — and it closes Module 2."

## Scene 7 — Module 2 Close / Week 8 Bridge (10 min)

**Objective.** Reassemble the Module 2 chain end to end and name the question Module
3 answers.

**Visual recap.**

```text
WEEK 5 — FIND IT & ROUTE IT
Addressing / DNS / Ports / Routing
        ↓
WEEK 6 — ACCESS IT SECURELY
VM / Bastion / SSH / Authentication / Troubleshooting
        ↓
WEEK 7 — CONTROL IT & PROVE IT
Firewall / NSG / Rule Priority / Least Privilege / Testing / Evidence
```

**Chain to rebuild.**

```text
ADDRESS → NETWORK → PATH → SECURITY BOUNDARY → PERMISSION → SECURE ACCESS → EVIDENCE
```

**Likely misconceptions.** Placing EVIDENCE early as if proof were a setup step ·
treating SECURE ACCESS as interchangeable with PERMISSION.

**Processing pause.** 60 seconds after the chain is confirmed, before the Module 3
handoff. Let the closing question sit unanswered.

**Closing question (speculation welcome, not graded).** "If we can find the
destination, build the path, control access, authenticate the user, and prove the
connection… what protects the information itself?"

**Then reveal only.** `NEXT: MODULE 3 — PRACTICAL CRYPTOGRAPHY`. Do not teach
cryptography in this session.

---

# Deliverable 3 — Lovable Demo Lab Build Specification

## Content model

The experience is pure data: `src/lib/demo-lab/experiences/cloud-heights-guard-post.ts`,
registered in `src/lib/demo-lab/programs.ts` (`experiences` array and
`cf-week-07`, retitled "Firewalls, Security Groups & Network Defense", status
`available`).

Type additions in `src/lib/demo-lab/types.ts`:

- `SceneFacilitation` on `Scene.facilitation` — recommended minutes, on-screen
  summary, opening statement, questions to ask, expected reasoning, misconceptions,
  follow-up questions, processing pause, evidence reveal order, correct answer, and
  transition. Instructor-only.
- `Experience.runOfShow` — ordered `{ order, title, minutes, focus }` rows.
- Three new interaction kinds and their interfaces (below), added to the
  `InteractionKind` and `Interaction` unions.

## Reused components (unchanged behaviour)

`ExperiencePlayer`, `SceneRenderer`, `SceneNavigation`, `EnvironmentLayer`,
`CharacterLayer` and the existing production Ivy media/state machine,
`DialogueLayer`, `EvidencePanel`, `InteractionLayer`, `IncidentBoard`
(`evidence-sort`), `Investigation` (`investigation`), `LadderBoard` (`sequence`),
`BriefingBoard` (`briefing`), shared `parts.tsx` (`TerminalView`, `StatusPill`,
`SurfaceHeading`, `IvyNote`, `PlacementBoard`), `DemoLabShell`,
`ProgramExperienceBrowser`, and the instructor console. Environment art is reused:
`incident-response-room`, `noc`, `remote-access-workstation`,
`troubleshooting-room`, `briefing-room`, `cloud-heights-campus`. No new artwork was
generated.

## New reusable components

1. `RuleEvaluationBoard` (`kind: "rule-evaluation"`) — ordered rule ledger plus
   traffic evaluation. Predict → walk the ledger lowest-number-first → first match
   wins (`MATCH → DENY → STOP`) → later rules render an explicit `UNEVALUATED`
   label → choose the narrowest remediation → corrected ledger renders. Locked rules
   are labelled "Protected baseline — do not edit". Every state is text-labelled;
   colour is never the only signal.
2. `TestComparisonPanel` (`kind: "test-comparison"`) — generic positive/negative
   test surface. Per test: source → protocol/port → prediction → verdict → what it
   proves, plus a persistent paired-proof table and a scoped interpretation question
   whose distractors over-claim.
3. `InvestigationRequestBoard` (`kind: "investigation-request"`) — generic
   "ask before you change" board: an incomplete ticket plus selectable evidence
   questions that reveal answers and evidence items and never mutate anything.

Completion rules for all three were added to `isSceneComplete` in
`src/lib/demo-lab/useExperienceState.ts`; renderers are registered in
`src/components/demo-lab/InteractionLayer.tsx`.

## Interaction and accessibility conventions

- No native HTML5 drag dependency in any new component: every interaction is
  click/tap on a button, or select-then-place with a keyboard-reachable "Place here"
  control (existing boards already support select → place; the three new components
  are button-only).
- All targets are at least 44px tall, focusable, with `aria-pressed` state and
  `aria-live` result regions.
- Verdicts and rule states are always written out (`ALLOWED`, `DENIED`,
  `SERVICE NOT LISTENING`, `UNEVALUATED`, `MATCH → DENY → STOP`).
- Evidence persists once revealed; predictions can be revised at any time.
- Wrong predictions are labelled "Hypothesis that does not fit the evidence".
- No timers, countdowns, buzzers, scores or leaderboards; reduced-motion behaviour
  inherited from the existing layers.
- "Reset this scene" clears only the current scene's state.
- Continue is gated on meaningful completion; instructors can still reveal evidence
  and explanation and jump between scenes.

## Instructor console

`/instructor` renders, for this experience: the 75-minute run of show (from
`Experience.runOfShow`), the current scene's `Facilitation guide` as a `<details>`
panel (open in console view, **closed by default in present mode** so nothing
reaches the projector unintentionally), plus the existing controls — previous,
next, jump, reset scene, reveal evidence, reveal explanation, dialogue toggle,
restart and present mode. The guide sits above the scene in its own column track
with `min-w-0`, so it never overlaps the presented experience.

## Routing and deployment

- Route file: `src/routes/cyberfoundations.week-07.cloud-heights-guard-post.tsx`
  (`createFileRoute("/cyberfoundations/week-07/cloud-heights-guard-post")`), with its
  own `head()` metadata.
- Added to the GitHub Pages prerender list in `vite.config.ts`, preserving the
  existing base-path handling.
- Week 6 (`cf-w6-grid-to-cloud-heights`) route, IDs, data and behaviour are
  unchanged.
