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
        "Walk Ivy's four deliveries to where they actually go: the ones inside the 10.20.5 block, and the ones that have to leave through the gateway.",
      environmentId: "grid-neighborhood",
      characterState: "ivy-idle",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "This is my block. My van is at 10.20.5.42 and the mask is /24 — so every address that starts 10.20.5 is a building I can walk to.",
          characterState: "ivy-point",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Four deliveries on the work order. Before you send me anywhere — guess which ones are on this street.",
          characterState: "ivy-idle",
        },
      ],
      evidence: [
        {
          id: "ev-interface",
          label: "Interface address",
          value: "10.20.5.42/24",
          status: "healthy",
          note: "Ivy's van on the service block.",
        },
        {
          id: "ev-gateway",
          label: "Default gateway",
          value: "10.20.5.1",
          status: "healthy",
          note: "The road out of this neighborhood.",
        },
        {
          id: "ev-scope",
          label: "Local range (this example only)",
          value: "10.20.5.0 – 10.20.5.255",
          note: "For this /24 example, the first three numbers identify the neighborhood.",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-neighborhood",
        kind: "route-choice",
        prompt: "Where does each delivery actually go?",
        instruction:
          "Pick the place in the neighborhood that matches the address on Ivy's work order. If it isn't on this block, send her to the gateway road. Nothing is locked in — try any route and watch what happens.",
        scopeNote:
          "For this /24 example, addresses that share 10.20.5 are in the same neighborhood. Other masks split the address differently — that comes later.",
        sign: {
          title: "10.20.5 Service Block",
          lines: [
            "Addresses 10.20.5.1 – 10.20.5.255",
            "Gateway road: 10.20.5.1",
          ],
        },
        hotspots: [
          {
            id: "hs-van",
            kind: "origin",
            label: "Ivy's van",
            address: "10.20.5.42",
            x: 16,
            y: 62,
            mobileX: 20,
            mobileY: 58,
            detail: "Where Ivy starts every route.",
          },
          {
            id: "hs-printer",
            kind: "location",
            label: "Shop floor",
            address: "10.20.5.20",
            x: 38,
            y: 55,
            mobileX: 34,
            mobileY: 47,
          },
          {
            id: "hs-bench",
            kind: "location",
            label: "Bench lab",
            address: "10.20.5.99",
            x: 58,
            y: 52,
            mobileX: 62,
            mobileY: 40,
          },
          {
            id: "hs-gateway",
            kind: "gateway",
            label: "Gateway road",
            address: "10.20.5.1",
            signage: ["10.20.7 District →", "10.21.5 Region →"],
            x: 84,
            y: 68,
            mobileX: 78,
            mobileY: 60,
            detail: "Everything that isn't 10.20.5 leaves this way.",
          },
        ],
        characterAnchors: {
          "ivy-enter": { x: 8, y: 88, mobileX: 12, mobileY: 84 },
          "ivy-idle": { x: 22, y: 86, mobileX: 26, mobileY: 82 },
          "ivy-point": { x: 26, y: 86, mobileX: 30, mobileY: 82 },
          "ivy-thinking": { x: 22, y: 86, mobileX: 26, mobileY: 82 },
          "ivy-nod": { x: 24, y: 86, mobileX: 28, mobileY: 82 },
        },
        requests: [
          {
            id: "d1",
            address: "10.20.5.20",
            workOrder: "Drop the replacement toner at 10.20.5.20.",
            presentInEnvironment: true,
            correctHotspotId: "hs-printer",
            correct: {
              headline: "Same neighborhood — 10.20.5",
              body: "Ivy walks straight there. 10.20.5.20 shares 10.20.5 with her van, so the frame crosses the local segment with no gateway involved.",
              characterState: "ivy-nod",
            },
            incorrect: {
              "hs-gateway": {
                headline: "She's leaving the block to reach a building on it",
                body: "Sending this to 10.20.5.1 is asking the road out to hand a package back to the same street. Compare the first three numbers of 10.20.5.42 and 10.20.5.20 before you commit.",
                revealsEvidenceIds: ["ev-scope"],
                characterState: "ivy-thinking",
              },
              "*": {
                headline: "Right street, wrong door",
                body: "That address is on this block, but it isn't the one on the work order. Read the plaque before Ivy knocks.",
                characterState: "ivy-thinking",
              },
            },
          },
          {
            id: "d2",
            address: "10.20.5.99",
            workOrder: "Collect the bench test laptop at 10.20.5.99.",
            presentInEnvironment: true,
            correctHotspotId: "hs-bench",
            correct: {
              headline: "Same neighborhood — 10.20.5",
              body: "Only the last number changed. For this /24 example that is still the same block, so Ivy reaches it directly.",
              characterState: "ivy-nod",
            },
            incorrect: {
              "hs-gateway": {
                headline: "Only the last number differs",
                body: "10.20.5.42 and 10.20.5.99 share 10.20.5. If a different final number were enough to leave the block, Ivy couldn't reach the shop floor either.",
                revealsEvidenceIds: ["ev-scope"],
                characterState: "ivy-thinking",
              },
              "*": {
                headline: "Right street, wrong door",
                body: "Both of these are on 10.20.5, so the routing is the same — but the plaque has to match the work order.",
                characterState: "ivy-thinking",
              },
            },
          },
          {
            id: "d3",
            address: "10.20.7.20",
            workOrder: "Deliver the depot drive to 10.20.7.20.",
            presentInEnvironment: false,
            correctHotspotId: "hs-gateway",
            correct: {
              headline: "Different neighborhood — 10.20.7",
              body: "The third number changed, so there is no building here with that plaque. Ivy takes the gateway road at 10.20.5.1 and lets the next street handle it.",
              revealsEvidenceIds: ["ev-gateway"],
              characterState: "ivy-point",
            },
            incorrect: {
              "*": {
                headline: "Look at the plaques again — nothing here says 10.20.7",
                body: "Walking the block looking for an address that isn't on it means shouting on her own segment and getting no answer. That silence is exactly what an ARP timeout looks like.",
                revealsEvidenceIds: ["ev-scope"],
                characterState: "ivy-thinking",
              },
            },
          },
          {
            id: "d4",
            address: "10.21.5.42",
            workOrder: "Hand the monitoring appliance to 10.21.5.42.",
            presentInEnvironment: false,
            correctHotspotId: "hs-gateway",
            correct: {
              headline: "Different neighborhood — 10.21.5",
              body: "The second number changed too. Off-block, so it leaves through the gateway even though it ends the same way as Ivy's own address.",
              characterState: "ivy-point",
            },
            incorrect: {
              "*": {
                headline: "A familiar ending is not a neighborhood",
                body: "10.21.5.42 ends exactly like Ivy's own address, which is why it's worth checking. The neighborhood is decided by 10.21.5 versus 10.20.5, not by the last number.",
                revealsEvidenceIds: ["ev-scope"],
                characterState: "ivy-thinking",
              },
            },
          },
        ],
        completion: {
          headline: "Two doors on this street, two trips down the gateway road.",
          body: "10.20.5.20 and 10.20.5.99 are buildings Ivy can walk to. 10.20.7.20 and 10.21.5.42 have no plaque on this block, so they leave through 10.20.5.1 — the same road that eventually reaches Cloud Heights.",
        },
      },
      successSummary:
        "Two destinations sit on 10.20.5 and are reached directly. Two sit on different blocks and leave through 10.20.5.1. That single check — same neighborhood or not — is the first question in almost every connectivity call.",
      retryPrompt:
        "Nothing is locked in. Re-route any delivery and watch what the evidence does.",
      explanation:
        "For this /24 example the first three numbers identify the neighborhood. Matching neighborhood means direct local delivery; a different neighborhood means the workstation forwards to its default gateway at 10.20.5.1. Other mask lengths divide the address at a different point — Week 6 does not use binary subnetting.",
      instructorNotes: [
        "Ask for predictions before anyone clicks a building.",
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
