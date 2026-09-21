# Week 10 Clinic Artwork Integration

## Scope
- Add the six approved uploaded clinic illustrations as durable project assets with the exact entrance/room mapping provided.
- Add a reusable, accessible 16:9 clinic illustration presentation with descriptive alternative text, the required caption, and an optional full-size link.
- Show the entrance artwork on the Week 10 overview and as a restrained Lab 2 context banner.
- Show the mapped room artwork when rooms change in the overview and Lab 1, while preserving the floor plan, room list, evidence cards, notebook, and all saved learner state.
- Reuse the same room mapping in the protected instructor room presentation.

## Technical details
- Store images through the project asset CDN and commit only generated asset pointer files.
- Keep exact evidence in existing HTML; artwork remains illustrative and does not supply authoritative evidence.
- Make no changes to Week 10 data, storage, authorization, other weeks, the separate Lab Portal/Tracker, or publishing.

## Verification
- Confirm all six image URLs load successfully.
- Verify room switching selects the correct artwork on student and instructor views.
- Check desktop and mobile layouts for uncropped 16:9 presentation and readable adjacent content.
- Run the appropriate TypeScript checks, focused tests, and production build validation provided by the project harness.
