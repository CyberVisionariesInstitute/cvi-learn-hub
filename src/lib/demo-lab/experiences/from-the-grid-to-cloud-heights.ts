import type { Experience } from "../types";

/**
 * Flagship CyberFoundations Week 6 experience.
 * First pass: architecture prototype — one working scene, remaining scenes
 * are declared as structure so the player and instructor console can be
 * exercised end to end.
 */
export const fromTheGridToCloudHeights: Experience = {
  id: "cf-w6-grid-to-cloud-heights",
  slug: "from-the-grid-to-cloud-heights",
  programId: "cyberfoundations",
  moduleId: "cf-module-2",
  weekId: "cf-week-06",
  type: "live-mission",
  status: "in-development",
  title: "From The Grid to Cloud Heights",
  subtitle: "Live Mission · Week 6",
  description:
    "Bridge Week 5 networking fundamentals into real cloud troubleshooting through a guided investigation with Ivy.",
  objectives: [
    "Decide whether a destination is reached locally or through the gateway.",
    "Read evidence before committing to a conclusion.",
    "State a conclusion that accounts for every observation.",
  ],
  estimatedMinutes: 45,
  characterIds: ["ivy"],
  environmentIds: ["grid-neighborhood", "ivy-workstation", "noc"],
  replayAvailable: true,
  route: "/cyberfoundations/week-06/from-the-grid-to-cloud-heights",
  instructorNotes: [
    "Scene 1 is the architecture prototype. Final cinematic artwork is specified separately.",
    "Keep the /24 framing explicit — do not open binary subnetting in this week.",
  ],
  scenes: [
    {
      id: "scene-01-know-your-neighborhood",
      title: "Mission 01 — Know Your Neighborhood",
      objective:
        "Sort four destinations into the ones Ivy's workstation reaches directly and the ones that leave through the gateway.",
      environmentId: "ivy-workstation",
      characterState: "ivy-read-screen",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "My workstation is 10.20.5.42 with a /24 mask. Four destinations are on today's ticket and I want to know which ones I can reach without leaving the block.",
          characterState: "ivy-read-screen",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Before you touch anything — take a guess. Which of these look like neighbors to you?",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "ev-interface",
          label: "Interface address",
          value: "10.20.5.42/24",
          status: "healthy",
          note: "Ivy's workstation on the service block.",
        },
        {
          id: "ev-gateway",
          label: "Default gateway",
          value: "10.20.5.1",
          status: "healthy",
          note: "The exit from this neighborhood.",
        },
        {
          id: "ev-scope",
          label: "Local range (this example only)",
          value: "10.20.5.0 – 10.20.5.255",
          note: "For this /24 example, the first three numbers identify the neighborhood.",
        },
      ],
      interaction: {
        id: "int-neighborhood",
        kind: "classify",
        prompt: "How does 10.20.5.42 reach each destination?",
        instruction:
          "Select a destination, then choose Reached locally or Sent to the gateway. You can change any answer at any time.",
        scopeNote:
          "For this /24 example, addresses that share 10.20.5 are in the same neighborhood. Other masks split the address differently — that comes later.",
        options: [
          {
            id: "local",
            label: "Reached locally",
            description: "Same neighborhood — the workstation talks to it directly.",
          },
          {
            id: "gateway",
            label: "Sent to the gateway",
            description: "Different neighborhood — traffic leaves via 10.20.5.1.",
          },
        ],
        items: [
          {
            id: "d1",
            label: "10.20.5.20",
            detail: "Shop-floor printer",
            correctOptionId: "local",
            responses: {
              local: {
                headline: "Same neighborhood — 10.20.5",
                body: "10.20.5.20 shares 10.20.5 with the workstation, so the frame goes straight across the local segment. No gateway involved.",
              },
              gateway: {
                headline: "Watch what the gateway would see",
                body: "Sending this to 10.20.5.1 means asking a neighbor's door to hand a letter back to the same street. Compare the first three numbers of 10.20.5.42 and 10.20.5.20 before you commit.",
                revealsEvidenceIds: ["ev-scope"],
              },
            },
          },
          {
            id: "d2",
            label: "10.20.5.99",
            detail: "Bench test laptop",
            correctOptionId: "local",
            responses: {
              local: {
                headline: "Same neighborhood — 10.20.5",
                body: "Only the last number changed. For this /24 example that is still the same block, so the workstation reaches it directly.",
              },
              gateway: {
                headline: "Only the last number differs",
                body: "10.20.5.42 and 10.20.5.99 share 10.20.5. If a different final number were enough to leave the block, Ivy could not reach the printer either.",
                revealsEvidenceIds: ["ev-scope"],
              },
            },
          },
          {
            id: "d3",
            label: "10.20.7.20",
            detail: "Depot file server",
            correctOptionId: "gateway",
            responses: {
              gateway: {
                headline: "Different neighborhood — 10.20.7",
                body: "The third number changed, so this is off-block for this /24 example. The workstation hands the traffic to 10.20.5.1.",
              },
              local: {
                headline: "Check the third number",
                body: "10.20.7.20 is not 10.20.5.something. Treating it as local means the workstation would shout on its own segment and nobody would answer — which is exactly what an ARP timeout looks like.",
                revealsEvidenceIds: ["ev-gateway"],
              },
            },
          },
          {
            id: "d4",
            label: "10.21.5.42",
            detail: "Regional monitoring host",
            correctOptionId: "gateway",
            responses: {
              gateway: {
                headline: "Different neighborhood — 10.21.5",
                body: "The second number changed too. Off-block, so it leaves through the gateway.",
              },
              local: {
                headline: "A familiar-looking ending is not a neighborhood",
                body: "10.21.5.42 ends the same way as Ivy's own address, which is exactly why it is worth checking. The neighborhood is decided by 10.21.5 versus 10.20.5, not by the last number.",
                revealsEvidenceIds: ["ev-scope"],
              },
            },
          },
        ],
      },
      successSummary:
        "Two destinations sit on 10.20.5 and are reached directly. Two sit on different blocks and leave through 10.20.5.1. That single check — same neighborhood or not — is the first question in almost every connectivity call.",
      retryPrompt:
        "Nothing is locked in. Change any destination and watch what the evidence does.",
      explanation:
        "For this /24 example the first three numbers identify the neighborhood. Matching neighborhood means direct local delivery; a different neighborhood means the workstation forwards to its default gateway at 10.20.5.1. Other mask lengths divide the address at a different point — Week 6 does not use binary subnetting.",
      instructorNotes: [
        "Ask for predictions before anyone selects an option.",
        "If a student generalises the rule to every mask, restate the /24 framing.",
      ],
      continueLabel: "Continue to the ticket",
    },
    {
      id: "scene-02-the-ticket",
      title: "Mission 02 — The Ticket",
      objective:
        "Read the support ticket on Ivy's monitor and decide which evidence is missing.",
      environmentId: "ivy-workstation",
      characterState: "ivy-type",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "A ticket just landed. Before we run anything, what would we need to see to believe it?",
          characterState: "ivy-type",
        },
      ],
      explanation: "Scene content is authored in a later pass.",
      instructorNotes: ["Structure only in this first pass."],
    },
    {
      id: "scene-03-cloud-heights-noc",
      title: "Mission 03 — Cloud Heights NOC",
      objective:
        "Compare the on-block picture with the topology wall at Cloud Heights.",
      environmentId: "noc",
      characterState: "ivy-briefing",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Same question, bigger building. The wall shows more of the path than my desk ever did.",
          characterState: "ivy-briefing",
        },
      ],
      explanation: "Scene content is authored in a later pass.",
      instructorNotes: ["Structure only in this first pass."],
    },
  ],
};
