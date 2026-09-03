/**
 * Canonical, student-safe content for the Phase 3 PKI Architect Capstone Student Guide.
 * Both the online guide page and the print / save-as-PDF output render from this one source.
 * Contains no instructor notes, calibration, hidden events, answer guidance, or scenario data.
 */

export interface GuideBlock {
  kind: "para" | "list" | "steps" | "table";
  text?: string;
  items?: string[];
  head?: string[];
  rows?: string[][];
}

export interface GuideSection {
  id: string;
  number: number;
  title: string;
  blocks: GuideBlock[];
}

export const GUIDE_META = {
  title: "CyberVisionaries Institute Phase 3 PKI Architect Capstone — Student Guide",
  tagline: "Design. Defend. Operate. Adapt.",
  format: "8 weeks · Weeks 17–24",
  role: "PKI Architect",
  release: "Scenario packages v1.0.0 · current production Phase 3 portal",
  journey:
    "Analyze → Design → Connect → Operate → Validate → Test → Adapt → Re-test → Defend",
};

export const CHECKPOINT_TYPES = [
  "Change Assessment",
  "Remediation Design",
  "Recovery Validation",
  "Evidence/Defense",
];

export const CHECKPOINT_STATUSES = [
  "Not Ready",
  "Ready for Review",
  "Submitted",
  "Needs Revision",
  "Accepted",
];

/**
 * The approved 100-point rubric areas, re-exported from the single canonical
 * source shared with the staff scoring model so the two cannot drift.
 */
export const RUBRIC: { area: string; points: number }[] = RUBRIC_CATEGORIES.map((c) => ({
  area: c.area,
  points: c.points,
}));

export const RUBRIC_TOTAL = RUBRIC_TOTAL_POINTS;


export const WEEKLY_ROADMAP: { week: string; focus: string }[] = [
  { week: "Week 17", focus: "Scenario analysis and requirements" },
  { week: "Week 18", focus: "Trust model and CA hierarchy" },
  { week: "Week 19", focus: "VM/HSM/network/service architecture" },
  { week: "Week 20", focus: "Certificate strategy and issuance" },
  { week: "Week 21", focus: "Lifecycle automation, CRL, and OCSP" },
  { week: "Week 22", focus: "Workload and failure testing" },
  { week: "Week 23", focus: "Change/incident response and architecture revision" },
  { week: "Week 24", focus: "Portfolio evidence and defense" },
];

export const GLOSSARY: { term: string; definition: string }[] = [
  { term: "CA", definition: "Certificate Authority — the trusted system that issues and signs certificates." },
  { term: "Root CA", definition: "The top of your trust hierarchy. Its key is the anchor everything else chains to, so it is protected and used sparingly." },
  { term: "Issuing CA", definition: "A subordinate CA that issues day-to-day certificates on behalf of the root." },
  { term: "HSM", definition: "Hardware Security Module — protected hardware that generates and stores private keys so they cannot be exported." },
  { term: "Trust zone", definition: "A grouping of systems that share the same trust expectations and boundaries." },
  { term: "Certificate pool", definition: "The WHY: a business or system need that requires certificates." },
  { term: "Certificate profile", definition: "The HOW: the technical template — key type, validity, extensions, and usage — applied when issuing." },
  { term: "Certificate owner", definition: "The named person or team accountable for a certificate through its life." },
  { term: "CRL", definition: "Certificate Revocation List — a published list of certificates that are no longer trusted." },
  { term: "OCSP", definition: "Online Certificate Status Protocol — a live query for the status of a single certificate." },
  { term: "Lifecycle state", definition: "Where a certificate is in its process: requested, approved, issued, deployed, renewed, replaced, retired." },
  { term: "Certificate status", definition: "Whether the certificate is currently valid, expired, or revoked — separate from its lifecycle state." },
  { term: "Workload", definition: "A real system behavior that depends on certificates, such as a TLS service or a signing pipeline." },
  { term: "mTLS", definition: "Mutual TLS — both client and server present certificates and authenticate each other." },
  { term: "Code signing", definition: "Signing software so its origin and integrity can be verified." },
  { term: "Timestamping", definition: "Binding a trusted time to a signature so it remains verifiable after the signing certificate expires." },
  { term: "Baseline", definition: "The stable, validated state of your environment before a change or incident is introduced." },
  { term: "Evidence", definition: "A saved record — result, observation, or artifact — that proves what your system did and when." },
  { term: "Checkpoint", definition: "A reviewed milestone your instructor evaluates as you progress." },
  { term: "Stale evidence", definition: "Evidence that was valid when captured but no longer reflects the current state of your environment." },
  { term: "Scenario version", definition: "The exact released version of your assigned scenario package that your project is locked to." },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "welcome",
    number: 1,
    title: "Welcome / Capstone Purpose",
    blocks: [
      {
        kind: "para",
        text: "This is your Phase 3 capstone: an individual, scenario-based engagement where you act as the PKI Architect for one organization for eight weeks. You will design a trust architecture, operate it, break it under load, diagnose it, adapt it after change, and defend it.",
      },
      {
        kind: "para",
        text: "There is no hidden perfect diagram and no single answer-key architecture. Two strong students with different scenarios — or even the same scenario — can arrive at different, defensible designs.",
      },
      {
        kind: "list",
        text: "You are evaluated on:",
        items: [
          "Scenario fit — does the design serve this organization's real constraints?",
          "Traceable reasoning — can each decision be traced to a requirement?",
          "System behavior — does what you built actually work?",
          "Diagnosis — can you explain a failure and fix its cause?",
          "Improvement — do you adapt when the environment changes?",
          "Evidence — can you prove the final state?",
          "Professional defense — can you present and answer for your work?",
        ],
      },
    ],
  },
  {
    id: "role",
    number: 2,
    title: "Your Role as PKI Architect",
    blocks: [
      {
        kind: "para",
        text: "You are not completing exercises. You are the architect of record for your assigned organization. You own the trust model, the key protection decisions, the certificate strategy, the automation, the testing, and the story you tell about all of it.",
      },
      {
        kind: "list",
        text: "That means you are expected to:",
        items: [
          "Ask what the organization actually needs before drawing anything.",
          "State assumptions explicitly rather than leaving them implied.",
          "Make tradeoffs deliberately and be able to name the cost of each.",
          "Test your own design before someone else tests it for you.",
          "Keep evidence as you go, not the night before defense.",
        ],
      },
    ],
  },
  {
    id: "scenario",
    number: 3,
    title: "How Your Individual Scenario Works",
    blocks: [
      {
        kind: "para",
        text: "Each student is assigned exactly one scenario at exactly one released version. Your workspace shows only My Capstone Assignment — there is no scenario catalog to browse and no way to switch scenarios.",
      },
      {
        kind: "para",
        text: "Your project is locked to your account, your assignment, and your scenario version. Everything you save, export, and defend is bound to that pairing.",
      },
      {
        kind: "para",
        text: "Your Scenario Brief is the source of truth for your organization: its situation, mission, constraints, required outcomes, and open questions. Read all of it before you design.",
      },
    ],
  },
  {
    id: "privacy",
    number: 4,
    title: "Privacy and Assignment Integrity",
    blocks: [
      {
        kind: "list",
        items: [
          "Your scenario, your project, and your evidence are yours alone. Do not share them with classmates.",
          "Do not request, accept, or reuse another student's scenario materials, diagrams, or export files.",
          "Exports are signed and bound to your account, assignment, and scenario version. A file from another student, scenario, or version is rejected on import.",
          "Comparing general PKI concepts with classmates is fine. Exchanging scenario-specific work is not.",
        ],
      },
    ],
  },
  {
    id: "navigate",
    number: 5,
    title: "How to Navigate the Capstone Workspace",
    blocks: [
      {
        kind: "list",
        items: [
          "Overview — your scenario brief, progress, instructor feedback, and backup/restore.",
          "Stage tabs — the workflow stages, each with its own working surface.",
          "Evidence — your evidence locker, organized by stage.",
          "Save project — the sticky save bar at the bottom saves your current revision. Save often.",
        ],
      },
      {
        kind: "para",
        text: "Your work is stored server-side against your project, so you can close the portal and reopen where you left off from any device you sign in on.",
      },
    ],
  },
  {
    id: "stage1",
    number: 6,
    title: "Stage 1 — Analyze & Design",
    blocks: [
      {
        kind: "steps",
        text: "Work in this order:",
        items: [
          "Read the complete Scenario Brief first — all of it, before designing.",
          "Identify facts, assumptions, questions, risks, requirements, and decisions, and keep them distinguishable from each other.",
          "Build the infrastructure model: trust zones, CA hierarchy, HSM attachments, and network relationships.",
          "Validate, then read the findings as feedback on your reasoning.",
        ],
      },
      {
        kind: "para",
        text: "Validation findings are feedback, not a hidden topology answer key. A clean validation does not mean your design fits the scenario, and a finding does not automatically mean you are wrong — it means explain or fix.",
      },
      {
        kind: "list",
        text: "Findings use three severities:",
        items: [
          "Critical — a structural problem that undermines trust or will block later stages.",
          "Warning — a real risk or gap you should address or justify.",
          "Advisory — a suggestion or consideration worth documenting.",
        ],
      },
    ],
  },
  {
    id: "stage2",
    number: 7,
    title: "Stage 2 — Certificate Operations",
    blocks: [
      {
        kind: "list",
        items: [
          "Discover and classify what actually needs certificates in your scenario.",
          "Understand Pools as WHY (the need) and Profiles as HOW (the issuance template).",
          "Assign ownership explicitly. \"Unknown\" is a signal to investigate, not an automatic failure or a reason to revoke.",
          "Work through the full set of operations: request, approval, issuance, deployment, renewal, replacement, revocation, and status.",
          "Keep lifecycle state and certificate status distinct — a certificate can be deployed and still be revoked.",
          "Use CRL and OCSP evidence to reason about authoritative status, reachability, freshness, caching, and trust.",
        ],
      },
    ],
  },
  {
    id: "stage3",
    number: 8,
    title: "Stage 3 — Workload Simulation & Diagnosis",
    blocks: [
      {
        kind: "steps",
        text: "The loop for every workload is:",
        items: [
          "Configure the workload against your architecture.",
          "Execute it.",
          "Observe exactly what happened.",
          "Diagnose the cause, not just the symptom.",
          "Correct the underlying configuration or design.",
          "Re-test.",
          "Defend the result.",
        ],
      },
      {
        kind: "para",
        text: "Workloads can include TLS, mTLS, CI/CD, code signing, timestamping, and cloud-style certificate dependencies.",
      },
      {
        kind: "para",
        text: "The simulation is deterministic: the same saved state and configuration produce the same result. A failure is never random — it is caused by something in your design.",
      },
      {
        kind: "para",
        text: "Preserve both failed and successful runs. A failure you diagnosed and fixed is stronger evidence than a first-try pass, so add to your evidence trail instead of overwriting your history.",
      },
    ],
  },
  {
    id: "stage4",
    number: 9,
    title: "Stage 4 — Change, Incident, Adaptation & Defense",
    blocks: [
      {
        kind: "para",
        text: "Stage 4 begins from a stable baseline: your validated architecture with passing workloads. Capture that baseline deliberately.",
      },
      {
        kind: "para",
        text: "Your instructor controls when changes or incidents are introduced. After a change is released to you, the environment you validated may no longer behave the same way.",
      },
      {
        kind: "steps",
        text: "When a change or incident is released, work this flow:",
        items: [
          "Observe what changed.",
          "Investigate the actual impact on your architecture.",
          "Assess risk, scope, and urgency.",
          "Adapt your design or configuration.",
          "Validate the adapted architecture.",
          "Re-test the affected workloads.",
          "Defend both the change and your response.",
        ],
      },
      {
        kind: "para",
        text: "Older PASS evidence stays historically valid — it proves what was true then — but it can become stale for the current state. Re-test and capture fresh evidence for anything the change touched.",
      },
    ],
  },
  {
    id: "roadmap",
    number: 10,
    title: "Weekly Roadmap (Weeks 17–24)",
    blocks: [
      {
        kind: "table",
        head: ["Week", "Focus"],
        rows: WEEKLY_ROADMAP.map((w) => [w.week, w.focus]),
      },
    ],
  },
  {
    id: "checkpoints",
    number: 11,
    title: "Checkpoints & Evidence",
    blocks: [
      { kind: "list", text: "There are four checkpoint types:", items: CHECKPOINT_TYPES },
      {
        kind: "list",
        text: "Each checkpoint moves through these statuses:",
        items: CHECKPOINT_STATUSES,
      },
      {
        kind: "para",
        text: "Evidence is what turns a design into a defensible one. Capture what you observed, when you observed it, and what it proves. Organize evidence by stage as you go — it becomes your submission snapshot and the backbone of your defense.",
      },
    ],
  },
  {
    id: "research",
    number: 12,
    title: "Research and Professional Reasoning",
    blocks: [
      {
        kind: "para",
        text: "You are expected to research. Standards, vendor documentation, and industry practice are all fair inputs. What matters is that you can explain why a practice applies to your scenario rather than citing it as authority.",
      },
      {
        kind: "list",
        items: [
          "Prefer primary sources and current documentation.",
          "Note where a recommendation comes from and where you deviated from it.",
          "When two sources conflict, decide and justify — do not average them.",
          "\"Best practice\" is not a reason on its own. Fit to your scenario is.",
        ],
      },
    ],
  },
  {
    id: "integrity",
    number: 13,
    title: "Academic / Project Integrity",
    blocks: [
      {
        kind: "list",
        items: [
          "The work you submit must be your own architecture and your own reasoning.",
          "Do not share or accept scenario-specific work, exports, or evidence.",
          "You may use tools and references, but you must be able to explain and defend every decision in your project without them.",
          "If you cannot explain it during defense, it does not count as yours.",
        ],
      },
    ],
  },
  {
    id: "saving",
    number: 14,
    title: "Saving, Reopening, Exporting and Importing",
    blocks: [
      {
        kind: "list",
        items: [
          "Save from the save bar at the bottom of the workspace. Each save creates a new revision.",
          "Reopen any time by signing in — your latest revision loads automatically.",
          "Export from the Overview page to download a signed backup of your current project.",
          "Import restores a backup as a new revision. Exports are locked to your account, assignment, and scenario version.",
          "Keep your own backup before major redesigns so you can restore a known-good revision.",
        ],
      },
    ],
  },
  {
    id: "help",
    number: 15,
    title: "Troubleshooting / Getting Help",
    blocks: [
      {
        kind: "list",
        items: [
          "Workspace will not load or your assignment is missing: refresh, sign out and back in, then contact your instructor.",
          "Import rejected: re-export from the current portal — older export files are obsolete and files from another account, scenario, or version are rejected by design.",
          "A workload keeps failing: the simulation is deterministic, so re-read the failure detail and trace it back to a configuration or design cause.",
          "Anything that looks like a portal defect rather than a design problem: report it to your instructor with what you did and what you saw.",
        ],
      },
    ],
  },
  {
    id: "defense",
    number: 16,
    title: "Final Defense Expectations",
    blocks: [
      {
        kind: "list",
        text: "Be ready to explain:",
        items: [
          "What you built.",
          "Why it fits your scenario.",
          "What tradeoffs you made.",
          "What failed and why.",
          "How you diagnosed it.",
          "How you adapted after change.",
          "What evidence proves the final state.",
          "What you would improve next.",
        ],
      },
      {
        kind: "para",
        text: "Your defense is a professional presentation, not a quiz. Bring your evidence, speak to your decisions, and answer questions directly — including the ones about what did not work.",
      },
    ],
  },
  {
    id: "rubric",
    number: 17,
    title: "100-Point Rubric Overview",
    blocks: [
      {
        kind: "table",
        head: ["Area", "Points"],
        rows: [
          ...RUBRIC.map((r) => [r.area, String(r.points)]),
          ["Total", String(RUBRIC_TOTAL)],
        ],
      },
    ],
  },
  {
    id: "checklist",
    number: 18,
    title: "Final Submission Checklist",
    blocks: [
      {
        kind: "list",
        items: [
          "Scenario requirements traced to design decisions",
          "Architecture complete and validated",
          "CA hierarchy and trust relationships documented",
          "HSM and key-protection decisions documented",
          "Certificate pools, profiles, and ownership complete",
          "Lifecycle and status operations tested",
          "Workloads executed and diagnosed",
          "Stage 4 adaptation completed when activated",
          "Four checkpoints completed as required",
          "Evidence current and organized",
          "Export/back-up created from the current portal",
          "Final defense ready",
        ],
      },
    ],
  },
  {
    id: "glossary",
    number: 19,
    title: "Glossary",
    blocks: [
      {
        kind: "table",
        head: ["Term", "Meaning"],
        rows: GLOSSARY.map((g) => [g.term, g.definition]),
      },
    ],
  },
];
