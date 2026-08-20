import gridNeighborhoodDusk from "@/assets/environments/cyberfoundations/grid-neighborhood-dusk.jpg";
import gridToCloudHeights from "@/assets/environments/cyberfoundations/grid-to-cloud-heights.jpg";
import type { Environment } from "./types";

/**
 * Environment art convention:
 *   src/assets/environments/<program>/<environment-id>.jpg
 * Scene config selects the environment; no component hard-codes imagery.
 */
export const cyberfoundationsEnvironments: Environment[] = [
  {
    id: "grid-neighborhood",
    name: "The Grid — 10.20.5 Neighborhood",
    description:
      "A small-business district at dusk: streets, sidewalks, landscaping and low offices, with a road leaving toward the arterial.",
    surface: "monitor",
    backgroundSrc: gridNeighborhoodDusk,
  },

  {
    id: "ivy-workstation",
    name: "Ivy's Workstation",
    description:
      "A field technician desk with two monitors, a network map printout and a ticket queue.",
    surface: "monitor",
  },
  {
    id: "troubleshooting-room",
    name: "Troubleshooting Room",
    description: "A small IT support room with a working whiteboard and a test bench.",
    surface: "whiteboard",
  },
  {
    id: "cloud-heights-campus",
    name: "Cloud Heights — Technology Campus",
    description: "A modern datacenter campus approach with glass frontage at dusk.",
    surface: "wall-display",
    backgroundSrc: gridToCloudHeights,
  },

  {
    id: "secure-lobby",
    name: "Secure Lobby",
    description: "Badge-controlled reception with an access-status display.",
    surface: "wall-display",
  },
  {
    id: "noc",
    name: "Network Operations Center",
    description: "Tiered operations floor with a topology wall and analyst desks.",
    surface: "wall-display",
  },
  {
    id: "remote-access-workstation",
    name: "Remote Access Workstation",
    description: "An analyst desk configured for jump-host and terminal work.",
    surface: "terminal",
  },
  {
    id: "incident-response-room",
    name: "Incident Response Room",
    description: "A closed room with a physical evidence board and a shared timeline.",
    surface: "evidence-board",
  },
  {
    id: "briefing-room",
    name: "Briefing Room",
    description: "A conference room with a briefing display for the analyst statement.",
    surface: "wall-display",
  },
];

export const pkiEnvironments: Environment[] = [
  {
    id: "pki-operations-center",
    name: "PKI Operations Center",
    description: "Certificate lifecycle operations floor with issuance dashboards.",
    surface: "wall-display",
  },
  {
    id: "pki-ca-workspace",
    name: "Certificate Authority Workspace",
    description: "Controlled workspace for CA request review and issuance.",
    surface: "monitor",
  },
  {
    id: "pki-hsm-room",
    name: "HSM / Key Management Room",
    description: "Access-controlled room housing hardware security modules.",
    surface: "terminal",
  },
  {
    id: "pki-trust-architecture-room",
    name: "Trust Architecture Room",
    description: "Design room with a wall-sized trust hierarchy diagram.",
    surface: "whiteboard",
  },
  {
    id: "pki-incident-room",
    name: "PKI Incident Room",
    description: "Response room for revocation and compromise handling.",
    surface: "evidence-board",
  },
  {
    id: "pki-briefing-room",
    name: "PKI Briefing Room",
    description: "Stakeholder briefing space for trust decisions.",
    surface: "wall-display",
  },
];
