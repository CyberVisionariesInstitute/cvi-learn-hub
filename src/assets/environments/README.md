# Environment art

Convention: `src/assets/environments/<program>/<environment-id>.jpg`

Wired through `Environment.backgroundSrc` in `src/lib/demo-lab/environments.ts`.
Scene config selects the environment by id — no component hard-codes imagery.

## Status

| File | Environment | Status |
| --- | --- | --- |
| `cyberfoundations/grid-neighborhood-dusk.jpg` | `grid-neighborhood` | first-pass generated art, not final |
| `cyberfoundations/grid-to-cloud-heights.jpg` | `cloud-heights-campus` | first-pass generated art, not final |
| `pki/trust-campus.jpg` | PKI program entry | first-pass generated art, not final |

Remaining environments (`ivy-workstation`, `noc`, `troubleshooting-room`,
`secure-lobby`, all `pki-*`) have **no art yet** and fall back to the
generated CSS atmosphere.

Production art notes: 16:9 master at ≥1920px wide, dusk key light, deep navy
base with cyan infrastructure light and warm amber street/interior light,
clear empty ground plane where hotspots and the character are blocked in.
