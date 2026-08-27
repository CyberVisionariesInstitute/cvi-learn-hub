import { cyberfoundationsCharacters, pkiCharacters } from "./characters";
import { cyberfoundationsEnvironments, pkiEnvironments } from "./environments";
import { fromTheGridToCloudHeights } from "./experiences/from-the-grid-to-cloud-heights";
import { cloudHeightsGuardPost } from "./experiences/cloud-heights-guard-post";
import type { Experience, Program, ProgramId } from "./types";

export const experiences: Experience[] = [
  fromTheGridToCloudHeights,
  cloudHeightsGuardPost,
];

export const cyberfoundations: Program = {
  id: "cyberfoundations",
  name: "CyberFoundations",
  tagline: "The Grid → Cloud Heights",
  description:
    "Field-level networking and cloud reasoning, taught through situations a junior practitioner actually walks into.",
  themeClass: "program-cyberfoundations",
  route: "/cyberfoundations",
  characters: cyberfoundationsCharacters,
  environments: cyberfoundationsEnvironments,
  modules: [
    {
      id: "cf-module-1",
      label: "Module 1",
      title: "Systems & Security Groundwork",
      summary: "Weeks 1–4. Interactive demonstrations are being added.",
      weeks: [
        {
          id: "cf-week-01",
          label: "Weeks 1–4",
          title: "Groundwork",
          summary: "Demonstrations for these weeks are queued behind Module 2.",
          experienceIds: [],
          status: "planned",
        },
      ],
    },
    {
      id: "cf-module-2",
      label: "Module 2",
      title: "Networking & Cloud Foundations",
      summary:
        "Where the Grid meets Cloud Heights. Week 6 carries the flagship live mission.",
      weeks: [
        {
          id: "cf-week-05",
          label: "Week 5",
          title: "The Grid",
          summary:
            "Addressing, local delivery and the gateway, seen from a technician's desk.",
          experienceIds: [],
          status: "planned",
        },
        {
          id: "cf-week-06",
          label: "Week 6",
          title: "Cloud Heights",
          summary:
            "Week 5 fundamentals carried into a real cloud troubleshooting investigation.",
          experienceIds: [fromTheGridToCloudHeights.id],
          status: "in-development",
        },
        {
          id: "cf-week-07",
          label: "Week 7",
          title: "Firewalls, Security Groups & Network Defense",
          summary:
            "Rule priority, least privilege and paired testing, worked as a live security incident at the Cloud Heights Guard Post.",
          experienceIds: [cloudHeightsGuardPost.id],
          status: "available",
        },
      ],
    },
  ],
};

export const pki: Program = {
  id: "pki",
  name: "PKI",
  tagline: "Identity, trust and certificate infrastructure",
  description:
    "Trust decisions made the way real certificate operations teams make them: deliberately, with the hierarchy in view.",
  themeClass: "program-pki",
  route: "/pki",
  characters: pkiCharacters,
  environments: pkiEnvironments,
  modules: [
    {
      id: "pki-foundations",
      label: "Foundations",
      title: "Trust Foundations",
      summary: "What a certificate asserts, and who is being believed.",
      weeks: [
        {
          id: "pki-foundations-1",
          label: "Foundations",
          title: "Identity & Assertion",
          summary: "Experience design in progress.",
          experienceIds: [],
          status: "planned",
        },
      ],
    },
    {
      id: "pki-phase-1",
      label: "Phase 1",
      title: "Certificate Authority Operations",
      summary: "Request review, issuance and the CA workspace.",
      weeks: [
        {
          id: "pki-phase-1-1",
          label: "Phase 1",
          title: "Issuance Operations",
          summary: "Experience design in progress.",
          experienceIds: [],
          status: "planned",
        },
      ],
    },
    {
      id: "pki-phase-2",
      label: "Phase 2",
      title: "Key Management & HSMs",
      summary: "Protecting the material the whole hierarchy depends on.",
      weeks: [
        {
          id: "pki-phase-2-1",
          label: "Phase 2",
          title: "Key Custody",
          summary: "Experience design in progress.",
          experienceIds: [],
          status: "planned",
        },
      ],
    },
    {
      id: "pki-phase-3",
      label: "Phase 3",
      title: "Revocation & Incident Response",
      summary: "When trust has to be withdrawn quickly and defensibly.",
      weeks: [
        {
          id: "pki-phase-3-1",
          label: "Phase 3",
          title: "Revocation Response",
          summary: "Experience design in progress.",
          experienceIds: [],
          status: "planned",
        },
      ],
    },
  ],
};

export const programs: Program[] = [cyberfoundations, pki];

export function getProgram(id: ProgramId): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getExperience(id: string): Experience | undefined {
  return experiences.find((e) => e.id === id);
}

export function getExperiencesForProgram(id: ProgramId): Experience[] {
  return experiences.filter((e) => e.programId === id);
}

export const experienceTypeLabels: Record<string, string> = {
  "live-mission": "Live Mission",
  "mini-demo": "Mini Demo",
  "interactive-scenario": "Interactive Scenario",
  replay: "Replay / Reinforcement",
};

export const statusLabels: Record<string, string> = {
  available: "Available",
  "in-development": "In Development",
  planned: "Planned",
};
