# Week 11 persistent mission companion

## Scope
- Change Week 11 only; preserve Weeks 6–10 and do not publish.
- Keep existing mission definitions as the only source for mission titles, objective, situation, steps, tickets, and evidence labels.
- Do not change readiness rules, ticket outcome validation, instructor answers, database behavior, or access controls.

## Implementation
1. Add a focused `CurrentMissionPanel` inside the Week 11 simulator shell so it remains visible while switching among dashboard, mission, directory, ticket, log, evidence, and case-file views.
2. Use the selected mission already stored in the page URL. Keep the panel’s expanded/collapsed preference in Week 11 page state so view changes do not reset it.
3. Expanded view will show the mission title, concise objective and situation, numbered tasks, student-safe factual progress from the existing readiness result, and the next incomplete instruction without interpreting conceptual answers.
4. Add accessible shortcuts to Mission Progress and Evidence Tray, plus Tickets when the selected mission references tickets.
5. Build a compact collapsed bar for narrow screens, with `aria-expanded`, `aria-controls`, a labelled heading/status region, visible focus, and wrapping/min-width safeguards.

## Verification
- Add focused tests for mission-definition sourcing, student-safe progress/guidance, and no expected-state or answer-key content in the companion module.
- Exercise M01 across Mission → Users → Groups → OUs → Roles → Evidence → Mission while confirming collapse state persists.
- Exercise a later ticket/log mission and inspect mobile width for horizontal overflow.
- Run all Week 11 tests and the Week 10 regression suite; confirm the preview build remains healthy.
