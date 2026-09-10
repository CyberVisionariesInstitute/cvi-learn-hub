# Week 8 Vault Exchange readability revision

## Goal
Rebuild Week 8 so every lesson image and every piece of instructional content occupy separate, readable panels. Preserve the complete six-scene flow and all existing learning interactions.

## Visual structure
- Add the supplied Week 8 artwork as locked assets without regeneration, redesign, cropping, text overlays, or decorative filters.
- Give Week 8 a dedicated scene presentation instead of the shared cinematic background treatment that currently places content over environment art.
- Use an opaque, high-contrast content panel beside a standalone bordered image panel on desktop; stack image first and content second at 390px.
- Use `object-contain` for lesson artwork and stable aspect ratios so meaningful details remain visible.
- Keep Compare and Sign as clean, fully opaque interactive interfaces with no unrelated image.

## Scene artwork
- Browser card: `2A_Cipher_Vault.png` as a separate thumbnail.
- Opening: `1A_Ivys_First_Vault_Exchange_Assignment(1).png`, plus the Week 7 → 8 bridge image `1D_Guard_Post_vs_Protected_Data(1).png` in a controlled, non-autoplay sequence if needed to keep each large.
- Protect: `1E_Plaintext_to_Ciphertext(1).png`; accessible labeled controls reveal `1B_Postcard_Analogy(1).png` and `1C_Locked_Case_Analogy(1).png` one at a time.
- Shared-secret warning within Protect: show `2D_Unsafe_Secret_Sharing.png`, then `2E_Ivy_Protects_the_Key.png`, using explicit labeled controls.
- Authenticate: `3E_Public_vs_Private_Key_Custody.png`.
- Close: `3F_Where_Key_Pairs_Appear.png`, with recap text in a separate opaque panel.
- Compare and Sign: no image until dedicated artwork is supplied.

## Interaction preservation
- Retain opening, four stations, close, progress, Back/Next, independent scene reset, full replay, safety language, 12–15 minute timing, and Week 9 handoff.
- Keep the current completion requirements for encrypt/decrypt, digest comparison, valid/invalid signature checks, key placement/login proof, and closing reveal.
- Make all new reveal controls keyboard accessible, stateful per scene, resettable, and reduced-motion safe.

## Technical details
- Extend the Week 8 content model only as needed for optional scene artwork and ordered image reveals.
- Add a Week 8-specific renderer/layout path so other Demo Lab missions retain their existing cinematic environments unchanged.
- Add the browser thumbnail as structured experience metadata and render it separately from card text.
- Use existing semantic color and shadow tokens; remove transparency, gradients, and image overlays from Week 8 surfaces.

## Validation
- Walk all six scenes at desktop and 390px mobile.
- Verify images are uncropped, no text overlaps images, no horizontal overflow exists, and Back/Next/reset/replay still work.
- Verify all reveal controls and station completion states, including reduced-motion behavior.
- Run typecheck, full tests, and production build without publishing.
- Report images used, any held back, commit SHA availability, and the Week 8 preview URL.

## Current attachment blocker
The requested nine filenames are not present in the current upload mount; only earlier Module 2/CyberFoundations files are available. No substitute artwork will be used. Implementation can proceed after those exact files are attached.
