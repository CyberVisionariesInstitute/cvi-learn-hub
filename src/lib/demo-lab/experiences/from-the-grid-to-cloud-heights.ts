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
  status: "available",
  title: "From The Grid to Cloud Heights",
  subtitle: "Live Mission · Week 6",
  description:
    "Carry Week 5 networking fundamentals into real cloud troubleshooting: eight scenes that move from a service block in The Grid to an incident briefing at the Cloud Heights campus.",
  objectives: [
    "Decide whether a destination is reached locally or through the gateway.",
    "Match a support question to the tool that can actually answer it.",
    "Work a troubleshooting ladder from dependency, not preference.",
    "Separate reachability from permission, and observation from assumption.",
    "State a conclusion — and its open questions — that the evidence supports.",
  ],
  estimatedMinutes: 75,
  characterIds: ["ivy"],
  environmentIds: [
    "grid-neighborhood",
    "ivy-workstation",
    "troubleshooting-room",
    "secure-lobby",
    "noc",
    "remote-access-workstation",
    "incident-response-room",
    "briefing-room",
  ],
  replayAvailable: true,
  route: "/cyberfoundations/week-06/from-the-grid-to-cloud-heights",
  instructorNotes: [
    "Eight scenes, roughly 8–10 minutes each. Any scene can be run standalone from the console.",
    "Keep the /24 framing explicit in Scene 1 — do not open binary subnetting in this week.",
    "Scenes 5–8 are the reasoning core; protect time for them.",
    "Final production Ivy motion assets are still outstanding — the player uses documented fallbacks.",
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
            y: 50,
            mobileX: 76,
            mobileY: 52,
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
      id: "scene-02-the-toolkit",
      title: "Mission 02 — The Toolkit",
      objective:
        "Answer three real support questions by choosing the tool that actually answers each one, then say what the output proved.",
      environmentId: "ivy-workstation",
      characterState: "ivy-type",
      characterStaging: {
        x: 12,
        bottom: 2,
        height: 56,
        mobileX: 14,
        mobileHeight: 40,
      },

      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Three tickets came in overnight. Every one of them is a different question, and each question has a tool that answers it.",
          characterState: "ivy-type",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Don't run everything and hope. Read the question first, then reach for the one tool that can settle it.",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "ev-host",
          label: "Workstation",
          value: "cf-support-01 · 10.20.5.42/24",
          status: "healthy",
        },
        {
          id: "ev-resolver",
          label: "Configured resolver",
          value: "10.20.5.53",
          status: "healthy",
          note: "The name service this desk asks by default.",
        },
        {
          id: "ev-toolkit",
          label: "Tool of record",
          value: "One question → one tool",
          note: "Recorded on the summary board once a ticket is resolved.",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-toolkit",
        kind: "tool-terminal",
        prompt: "Which tool answers this ticket?",
        instruction:
          "Pick a tool from the utility strip. Every tool runs and returns real output — including the ones that answer a different question. Then say what the result actually proved.",
        tools: [
          {
            id: "t-ip",
            command: "ip addr",
            label: "Interface config",
            purpose: "What address and mask this machine holds.",
          },
          {
            id: "t-ping",
            command: "ping",
            label: "Reachability",
            purpose: "Whether a host answers, and how fast.",
          },
          {
            id: "t-trace",
            command: "traceroute",
            label: "Path",
            purpose: "Which hops the traffic passes, and where it stops.",
          },
          {
            id: "t-dig",
            command: "dig",
            label: "Name resolution",
            purpose: "What address a name resolves to, and who answered.",
          },
        ],
        tickets: [
          {
            id: "tk-1",
            ref: "CF-1042",
            question: "Does this machine even have a usable address on our block?",
            body: "User reports 'no network'. Nothing else has been checked yet.",
            correctToolId: "t-ip",
            runs: {
              "t-ip": {
                command: "ip addr show eth0",
                output: [
                  "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500",
                  "    inet 10.20.5.42/24 brd 10.20.5.255 scope global eth0",
                  "    valid_lft forever preferred_lft forever",
                ],
                verdict:
                  "The interface is up and holds 10.20.5.42/24 — a valid address on our own block. 'No network' is already not literally true.",
              },
              "t-ping": {
                command: "ping -c 2 10.20.5.1",
                output: [
                  "PING 10.20.5.1 56(84) bytes of data.",
                  "64 bytes from 10.20.5.1: icmp_seq=1 ttl=64 time=0.94 ms",
                  "2 packets transmitted, 2 received, 0% packet loss",
                ],
                verdict:
                  "The gateway answers — but that tells you the path works, not what address this machine is configured with.",
              },
              "t-trace": {
                command: "traceroute 10.20.7.20",
                output: [
                  "traceroute to 10.20.7.20, 30 hops max",
                  " 1  10.20.5.1  1.02 ms",
                  " 2  10.20.0.1  3.44 ms",
                  " 3  10.20.7.20  4.10 ms",
                ],
                verdict:
                  "A working path off the block. Interesting, but it answers 'which way does traffic go', not 'what address do I hold'.",
              },
              "t-dig": {
                command: "dig +short depot.grid.local",
                output: ["10.20.7.20"],
                verdict:
                  "Name resolution works. That is a different layer than the machine's own interface configuration.",
              },
            },
            followUp: {
              prompt: "What did that output actually establish?",
              options: [
                {
                  id: "o1",
                  label: "The machine holds a valid address on 10.20.5 and the link is up.",
                  correct: true,
                  response:
                    "Exactly. Local configuration is ruled in. The fault, whatever it is, is further out.",
                },
                {
                  id: "o2",
                  label: "The network is completely fine.",
                  correct: false,
                  response:
                    "Too big a claim from one command. It proves this interface is configured — nothing about anything beyond it.",
                },
                {
                  id: "o3",
                  label: "The user's application is broken.",
                  correct: false,
                  response:
                    "Nothing here touches the application. That is an assumption, not a finding.",
                },
              ],
            },
            summaryRow: {
              question: "Do I have a usable address?",
              tool: "ip addr",
              evidence: "10.20.5.42/24, link up",
            },
          },
          {
            id: "tk-2",
            ref: "CF-1043",
            question: "Users say the depot server is 'down'. Is it answering at all?",
            body: "Depot server is known to live at 10.20.7.20. No other detail supplied.",
            correctToolId: "t-ping",
            runs: {
              "t-ping": {
                command: "ping -c 3 10.20.7.20",
                output: [
                  "PING 10.20.7.20 56(84) bytes of data.",
                  "64 bytes from 10.20.7.20: icmp_seq=1 ttl=62 time=4.21 ms",
                  "64 bytes from 10.20.7.20: icmp_seq=2 ttl=62 time=4.08 ms",
                  "3 packets transmitted, 3 received, 0% packet loss",
                ],
                verdict:
                  "The host answers on every attempt. It is up and reachable from here — so 'down' is describing something other than the host being off.",
              },
              "t-ip": {
                command: "ip addr show eth0",
                output: ["    inet 10.20.5.42/24 brd 10.20.5.255 scope global eth0"],
                verdict:
                  "Our own configuration, again. Nothing in this output describes the depot server.",
              },
              "t-trace": {
                command: "traceroute 10.20.7.20",
                output: [
                  " 1  10.20.5.1  0.98 ms",
                  " 2  10.20.0.1  3.31 ms",
                  " 3  10.20.7.20  4.19 ms",
                ],
                verdict:
                  "The path completes to the destination. Close — but this maps the route rather than simply asking 'are you there?'.",
              },
              "t-dig": {
                command: "dig +short depot.grid.local",
                output: ["10.20.7.20"],
                verdict:
                  "The name maps to the address we were already given. It does not tell you whether that address responds.",
              },
            },
            followUp: {
              prompt: "What can you now say about 'the server is down'?",
              options: [
                {
                  id: "o1",
                  label: "The host responds; whatever is failing is not the host being offline.",
                  correct: true,
                  response:
                    "That is the defensible version. You have narrowed the fault without guessing at the cause.",
                },
                {
                  id: "o2",
                  label: "The users are wrong and nothing is broken.",
                  correct: false,
                  response:
                    "Something is clearly failing for them. You have only ruled out one explanation.",
                },
                {
                  id: "o3",
                  label: "The service on the server is confirmed healthy.",
                  correct: false,
                  response:
                    "A reply to a ping comes from the host, not the service. The service has not been tested.",
                },
              ],
            },
            summaryRow: {
              question: "Is the depot host answering?",
              tool: "ping",
              evidence: "3/3 replies, 0% loss",
            },
          },
          {
            id: "tk-3",
            ref: "CF-1044",
            question:
              "One user reaches the depot by address but not by name. Where does that break?",
            body: "Same desk, same cable, same subnet. Only the name fails.",
            correctToolId: "t-dig",
            runs: {
              "t-dig": {
                command: "dig depot.grid.local",
                output: [
                  ";; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 41822",
                  ";; QUESTION SECTION:",
                  ";depot.grid.local.        IN  A",
                  ";; SERVER: 10.20.5.53#53",
                ],
                verdict:
                  "The resolver at 10.20.5.53 answered — and its answer was NXDOMAIN, no such name. The break is in name resolution, not in connectivity.",
              },
              "t-ping": {
                command: "ping -c 2 10.20.7.20",
                output: [
                  "64 bytes from 10.20.7.20: icmp_seq=1 ttl=62 time=4.15 ms",
                  "2 packets transmitted, 2 received, 0% packet loss",
                ],
                verdict:
                  "By address, everything works — which the ticket already told you. It confirms the problem is not reachability.",
              },
              "t-ip": {
                command: "ip addr show eth0",
                output: ["    inet 10.20.5.42/24 brd 10.20.5.255 scope global eth0"],
                verdict:
                  "Configuration is fine. It cannot show you anything about names.",
              },
              "t-trace": {
                command: "traceroute 10.20.7.20",
                output: [" 1  10.20.5.1  1.10 ms", " 3  10.20.7.20  4.22 ms"],
                verdict:
                  "The path is intact. Names never entered this test.",
              },
            },
            followUp: {
              prompt: "What does NXDOMAIN from your own resolver tell you?",
              options: [
                {
                  id: "o1",
                  label: "The resolver was reached and it has no record for that name.",
                  correct: true,
                  response:
                    "Right. A returned answer proves the resolver is alive — the missing record is the fault.",
                },
                {
                  id: "o2",
                  label: "The DNS server is offline.",
                  correct: false,
                  response:
                    "An offline resolver times out. This one answered, and answered quickly.",
                },
                {
                  id: "o3",
                  label: "The depot server is refusing connections.",
                  correct: false,
                  response:
                    "Nothing reached the depot in this test. That would be a different check entirely.",
                },
              ],
            },
            summaryRow: {
              question: "Why does the name fail?",
              tool: "dig",
              evidence: "NXDOMAIN from 10.20.5.53",
            },
          },
        ],
        completion: {
          headline: "Three questions, three tools, three pieces of evidence.",
          body: "None of these tools is better than the others — they answer different questions. Choosing deliberately is what turns a support call into an investigation.",
        },
      },
      successSummary:
        "You matched each question to the tool that could settle it, and stated only what the output supported. That summary board is the shape of a good handover note.",
      retryPrompt:
        "You can re-run any tool on any ticket. Running the 'wrong' one is a legitimate way to see what it does and does not prove.",
      explanation:
        "Tools answer specific questions: ip addr describes local configuration, ping tests whether a host responds, traceroute shows where along a path traffic stops, and dig shows what a name resolves to and who answered. The discipline is to pick the tool that can change your mind, and then claim only what the output supports.",
      instructorNotes: [
        "Ask students to predict the output before the tool runs.",
        "The 'wrong' tools return real output on purpose — use them to discuss scope of evidence.",
      ],
      continueLabel: "Continue to the whiteboard",
    },

    {
      id: "scene-03-the-ladder",
      title: "Mission 03 — The Troubleshooting Ladder",
      objective:
        "Build the order you would actually check things in, and defend the first rung.",
      environmentId: "troubleshooting-room",
      characterState: "ivy-whiteboard",
      bareSurface: true,
      characterStaging: {
        x: 88,
        bottom: 7,
        height: 60,
        mobileX: 84,
        mobileBottom: 4,
        mobileHeight: 42,
        flip: true,
      },

      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Everyone has a favourite first check. Mine is the one that can rule out the most with the least effort.",
          characterState: "ivy-whiteboard",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Put these five on the board in the order you'd work them. I'll only argue with the first rung I disagree with.",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "ev-ladder-rule",
          label: "Working rule",
          value: "Cheapest check that rules out the most, first.",
        },
        {
          id: "ev-ladder-scope",
          label: "Scope",
          value: "Local → path → name → service",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-ladder",
        kind: "sequence",
        prompt: "In what order would you actually check these?",
        instruction:
          "Drag a card onto a rung, or select a card and choose a rung. Move anything at any time, then check the ladder. Nothing is wiped when you're wrong.",
        boardTitle: "Troubleshooting ladder",
        steps: [
          {
            id: "s-link",
            label: "Link and address",
            detail: "Is the interface up with a valid address and mask?",
          },
          {
            id: "s-gateway",
            label: "Gateway",
            detail: "Does the way off this block respond?",
          },
          {
            id: "s-remote",
            label: "Remote host",
            detail: "Does the destination address answer at all?",
          },
          {
            id: "s-dns",
            label: "Name resolution",
            detail: "Does the name map to the address we expect?",
          },
          {
            id: "s-service",
            label: "Service and application",
            detail: "Is the port open and the application responding?",
          },
        ],
        correctOrder: ["s-link", "s-gateway", "s-remote", "s-dns", "s-service"],
        challenges: {
          "s-service":
            "Testing the application first is the most expensive check you can make, and a failure there tells you almost nothing — it could be caused by every rung below it. What would you have to assume for that to be a safe first step?",
          "s-dns":
            "Names are a layer above the path. If the interface has no address, the resolver lookup fails for a reason that has nothing to do with DNS. What has to be true before a name test means anything?",
          "s-remote":
            "Testing the far host first can work — but if it fails you still can't say whether the problem is here, on the way, or there. What could you rule out more cheaply first?",
          "s-gateway":
            "The gateway is a good early check, but it assumes this machine already has a valid address on the block. What proves that?",
          "*":
            "Walk it from where you are outward. Which of these can you verify without depending on any of the others?",
        },
        completion: {
          headline: "Local, then path, then name, then service.",
          body: "Each rung only makes sense once the one below it holds. That is why the ladder scales: the same order works on a desk in The Grid and on a campus network you've never seen.",
        },
        transitionMessage: {
          from: "Cloud Heights Operations",
          subject: "Escalation — CF-1044 handed to campus NOC",
          body: "Your ladder matches ours. Bring your notes to the Cloud Heights campus — we have a case that needs the same discipline at a larger scale.",
        },
      },
      successSummary:
        "The ladder holds: link and address, gateway, remote host, name resolution, then service. You defended the first rung rather than reciting a list.",
      retryPrompt:
        "Clear the board or move a single card. Ivy will re-read the ladder from the bottom rung up.",
      explanation:
        "Troubleshooting order is about dependency, not preference. Verify what you control first, then each successive layer that depends on it. When a low rung fails, everything above it is untestable — which is why starting at the top produces confident but unsupported conclusions.",
      instructorNotes: [
        "Ask a student to defend their first rung before checking the ladder.",
        "The service-first ordering is the most common and the most useful to discuss.",
      ],
      continueLabel: "Travel to Cloud Heights",
    },

    {
      id: "scene-04-arrival",
      title: "Mission 04 — Arrival at Cloud Heights",
      objective:
        "Read the lobby access check and separate what it proves from what it only suggests.",
      environmentId: "secure-lobby",
      characterState: "ivy-read-screen",
      characterStaging: {
        x: 14,
        bottom: 3,
        height: 56,
        mobileX: 15,
        mobileHeight: 40,
      },

      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Badge in, laptop on the guest segment. The kiosk says we're connected — but connected to what, exactly?",
          characterState: "ivy-read-screen",
        },
      ],
      evidence: [
        {
          id: "ev-guest",
          label: "Guest segment",
          value: "172.18.4.61/22",
          status: "healthy",
        },
        {
          id: "ev-campus-gw",
          label: "Campus gateway",
          value: "172.18.4.1",
          status: "healthy",
        },
        {
          id: "ev-chain",
          label: "Access chain",
          value: "Laptop → segment → gateway → campus resolver",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-arrival",
        kind: "evidence-select",
        prompt: "What does this connection actually prove?",
        instruction:
          "Select every claim the kiosk output supports. Selecting a claim it does not support is fine — Ivy will tell you which part is still an assumption.",
        terminal: {
          lines: [
            "guest@cf-laptop:~$ ip addr show wlan0",
            "    inet 172.18.4.61/22 brd 172.18.7.255 scope global wlan0",
            "guest@cf-laptop:~$ ping -c 2 172.18.4.1",
            "64 bytes from 172.18.4.1: icmp_seq=1 ttl=64 time=2.11 ms",
            "2 packets transmitted, 2 received, 0% packet loss",
            "guest@cf-laptop:~$ dig +short noc.cloudheights.internal",
            "172.18.20.14",
          ],
        },
        chain: [
          { id: "c-laptop", label: "Laptop" },
          { id: "c-segment", label: "Guest segment" },
          { id: "c-gateway", label: "Campus gateway" },
          { id: "c-resolver", label: "Campus resolver" },
        ],
        options: [
          {
            id: "a1",
            label: "The laptop holds a valid address on the guest segment.",
            supported: true,
            chainId: "c-segment",
            response:
              "Shown directly: 172.18.4.61/22 on an interface that is up.",
          },
          {
            id: "a2",
            label: "The campus gateway responds to this laptop.",
            supported: true,
            chainId: "c-gateway",
            response:
              "Two replies, no loss. The way off the guest segment is answering.",
          },
          {
            id: "a3",
            label: "A campus resolver answered a name query.",
            supported: true,
            chainId: "c-resolver",
            response:
              "The lookup returned an address, so a resolver was reached and had the record.",
          },
          {
            id: "a4",
            label: "The laptop can reach the NOC host at 172.18.20.14.",
            supported: false,
            response:
              "Not shown. Resolving a name tells you what address it maps to — nothing was ever sent to that address.",
          },
          {
            id: "a5",
            label: "Guest traffic is permitted into the internal network.",
            supported: false,
            response:
              "Also not shown. Guest segments frequently resolve internal names and are still filtered at the boundary. That needs its own test.",
          },
        ],
        completion: {
          headline: "Three links proven, two still assumptions.",
          body: "Address, gateway and resolver are established. Reaching the NOC host and passing the guest boundary are separate claims that need separate evidence — and that's exactly what the NOC floor will ask you for.",
        },
      },
      successSummary:
        "You lit up the part of the chain the evidence supports and left the rest unproven. Naming the gap is as valuable as naming the finding.",
      retryPrompt:
        "Selections toggle freely. Try selecting a claim you think is unsupported and read why.",
      explanation:
        "A successful lookup proves the resolver answered, not that the resolved host is reachable. Each link in an access chain requires its own evidence, and a working lower link never implies the one above it.",
      instructorNotes: [
        "Press on the difference between 'resolved' and 'reachable' — it recurs all week.",
      ],
      continueLabel: "Enter the NOC",
    },

    {
      id: "scene-05-noc",
      title: "Mission 05 — Cloud Heights NOC",
      objective:
        "Run a real investigation: interpret the failure, choose the next question, and gather evidence that changes the topology wall.",
      environmentId: "noc",
      characterState: "ivy-briefing",
      characterStaging: {
        x: 9,
        bottom: 4,
        height: 58,
        mobileX: 13,
        mobileHeight: 42,
      },

      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Same ladder, bigger building. The wall in front of you shows more of the path than my desk ever did — but it only updates when you test something.",
          characterState: "ivy-briefing",
        },
      ],
      evidence: [
        {
          id: "ev-noc-host",
          label: "Affected host",
          value: "cf-student-07 · 172.18.20.7/22",
          status: "unknown",
        },
        {
          id: "ev-noc-app",
          label: "Reported symptom",
          value: "Lab portal will not load",
          status: "degraded",
        },
        {
          id: "ev-noc-finding",
          label: "Established finding",
          value: "Host and path healthy; service not listening",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-noc",
        kind: "investigation",
        prompt: "Why can't cf-student-07 load the lab portal?",
        instruction:
          "Work one step at a time. Each step opens only after the previous one is settled, and every command you run updates the topology wall.",
        opening: {
          command: "curl -sS --max-time 5 http://portal.cloudheights.internal/",
          output: [
            "curl: (7) Failed to connect to portal.cloudheights.internal port 80: Connection refused",
          ],
          caption:
            "Alert on the wall: cf-student-07 cannot load the lab portal. Connection refused, immediately.",
        },
        topology: [
          {
            id: "n-host",
            label: "cf-student-07",
            initialStatus: "unknown",
            initialReading: "172.18.20.7/22 · not yet tested",
          },
          {
            id: "n-gateway",
            label: "Campus gateway 172.18.20.1",
            initialStatus: "unknown",
            initialReading: "not yet tested",
          },
          {
            id: "n-dns",
            label: "Resolver 172.18.20.53",
            initialStatus: "unknown",
            initialReading: "not yet queried",
          },
          {
            id: "n-portal",
            label: "portal host 172.18.20.14",
            initialStatus: "unknown",
            initialReading: "not yet tested",
          },
        ],
        steps: [
          {
            id: "st-1",
            kind: "choice",
            prompt: "The error came back instantly. What does that suggest?",
            instruction:
              "Read the wording of the failure before deciding what to test.",
            options: [
              {
                id: "o1",
                label:
                  "Something answered and actively refused — this is not a silent timeout.",
                correct: true,
                response:
                  "Right. A refusal is a response. A dropped or unreachable path usually hangs until it times out instead.",
              },
              {
                id: "o2",
                label: "The network path is broken.",
                correct: false,
                assumption: true,
                response:
                  "Possible, but a broken path normally produces a timeout, not an immediate refusal. That's an assumption we haven't tested.",
              },
              {
                id: "o3",
                label: "DNS failed.",
                correct: false,
                assumption: true,
                response:
                  "If the name hadn't resolved, curl would have said it couldn't resolve the host. It got as far as a port.",
              },
            ],
          },
          {
            id: "st-2",
            kind: "diagnostic",
            prompt: "Establish the bottom rungs before you touch the service.",
            instruction: "Run both checks — the wall updates as evidence arrives.",
            commands: [
              {
                id: "c-ip",
                command: "ip addr show ens18",
                output: [
                  "    inet 172.18.20.7/22 brd 172.18.23.255 scope global ens18",
                ],
                proves:
                  "The host holds a valid campus address and the interface is up.",
                topologyUpdate: {
                  nodeId: "n-host",
                  status: "healthy",
                  reading: "172.18.20.7/22 · link up",
                },
              },
              {
                id: "c-gw",
                command: "ping -c 3 172.18.20.1",
                output: [
                  "3 packets transmitted, 3 received, 0% packet loss",
                  "rtt min/avg/max = 0.71/0.83/0.95 ms",
                ],
                proves: "The campus gateway responds; the path off this segment is intact.",
                topologyUpdate: {
                  nodeId: "n-gateway",
                  status: "healthy",
                  reading: "3/3 replies · 0.83 ms avg",
                },
              },
            ],
          },
          {
            id: "st-3",
            kind: "choice",
            prompt: "Local and gateway are healthy. What is the next question worth asking?",
            options: [
              {
                id: "o1",
                label:
                  "Does the name resolve to the host we think, and does that host answer?",
                correct: true,
                response:
                  "That is the next rung, and it separates two claims that are easy to conflate.",
              },
              {
                id: "o2",
                label: "Reinstall the portal application.",
                correct: false,
                assumption: true,
                response:
                  "That's a fix for a cause you haven't established. If you're wrong, you've changed the system and lost the evidence.",
              },
              {
                id: "o3",
                label: "Escalate to the firewall team.",
                correct: false,
                assumption: true,
                response:
                  "A refusal usually comes from the host itself; filtering more often drops silently. Escalating now hands over an untested theory.",
              },
            ],
          },
          {
            id: "st-4",
            kind: "diagnostic",
            prompt: "Test name resolution and the service itself.",
            commands: [
              {
                id: "c-dig",
                command: "dig +short portal.cloudheights.internal",
                output: ["172.18.20.14"],
                proves:
                  "The resolver answered and the name maps to 172.18.20.14 as expected.",
                topologyUpdate: {
                  nodeId: "n-dns",
                  status: "healthy",
                  reading: "answered · portal → 172.18.20.14",
                },
              },
              {
                id: "c-ping-portal",
                command: "ping -c 3 172.18.20.14",
                output: ["3 packets transmitted, 3 received, 0% packet loss"],
                proves: "The portal host itself is up and reachable.",
                topologyUpdate: {
                  nodeId: "n-portal",
                  status: "degraded",
                  reading: "host replies · port 80 refused",
                },
              },
              {
                id: "c-ss",
                command: "ss -tlnp | grep ':80'",
                output: ["(no output)"],
                proves:
                  "Nothing is listening on port 80 on the portal host — which is exactly what produces an immediate connection refused.",
                topologyUpdate: {
                  nodeId: "n-portal",
                  status: "degraded",
                  reading: "host up · no listener on :80",
                },
              },
            ],
          },
          {
            id: "st-5",
            kind: "choice",
            prompt: "State the conclusion the evidence supports.",
            options: [
              {
                id: "o1",
                label:
                  "Host, path and name resolution are healthy; the portal service is not listening on port 80.",
                correct: true,
                response:
                  "That is defensible in every part, and it tells the next team precisely where to look.",
              },
              {
                id: "o2",
                label: "The network is down.",
                correct: false,
                response:
                  "Every network-layer test passed. This conclusion contradicts your own evidence.",
              },
              {
                id: "o3",
                label: "The student's laptop is misconfigured.",
                correct: false,
                assumption: true,
                response:
                  "The laptop's address, gateway and resolution all checked out. Nothing points at it.",
              },
            ],
          },
        ],
        completion: {
          headline: "Network healthy, service down — and you can prove each half.",
          body: "You climbed the ladder in a building you'd never worked in, and every claim on the wall is backed by a command you actually ran.",
        },
      },
      successSummary:
        "The topology wall now reads: host healthy, gateway healthy, resolution healthy, portal host up with no listener on port 80. That is a finding, not a guess.",
      retryPrompt:
        "Steps stay open once reached — re-run any command or reconsider any choice.",
      explanation:
        "Connection refused is a response, and responses are evidence. Working up the ladder separated a healthy network from an unhealthy service, which is the difference between escalating to the right team and escalating to any team.",
      instructorNotes: [
        "Pause at step 3 and take predictions before revealing the diagnostic commands.",
        "Contrast 'refused' with 'timed out' explicitly — students conflate them.",
      ],
      continueLabel: "Continue to remote access",
    },

    {
      id: "scene-06-remote-access",
      title: "Mission 06 — The Door at Port 22",
      objective:
        "Classify what each SSH message proves about reachability and about permission.",
      environmentId: "remote-access-workstation",
      characterState: "ivy-type",
      characterStaging: {
        x: 11,
        bottom: 2,
        height: 54,
        mobileX: 14,
        mobileHeight: 40,
      },

      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "To fix the portal we need a shell on the host. Three different attempts, three different messages — and they mean very different things.",
          characterState: "ivy-type",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Read them as two separate questions: did anything answer, and were we allowed in?",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "ev-jump",
          label: "Jump host",
          value: "cf-jump · 172.18.20.9",
          status: "healthy",
        },
        {
          id: "ev-door",
          label: "Diagnostic split",
          value: "Reachability ≠ permission",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-door22",
        kind: "three-state",
        prompt: "What is each message actually telling you?",
        instruction:
          "For every captured message, classify both dimensions. Wrong classifications are answered with the reasoning, never a buzzer.",
        monitorTitle: "SSH diagnostic — port 22",
        dimensions: [
          {
            id: "reach",
            label: "Reachability",
            question: "Did something on port 22 respond at all?",
          },
          {
            id: "permit",
            label: "Permission",
            question: "Were these credentials accepted?",
          },
        ],
        states: [
          { id: "yes", label: "Established", glyph: "✓" },
          { id: "no", label: "Ruled out", glyph: "✕" },
          { id: "unknown", label: "Not shown", glyph: "?" },
        ],
        scenarios: [
          {
            id: "sc-timeout",
            output: "ssh: connect to host cf-student-07 port 22: Connection timed out",
            correct: { reach: "no", permit: "unknown" },
            hints: {
              reach:
                "Nothing came back at all. A timeout means the attempt went unanswered — reachability on port 22 is ruled out from here.",
              permit:
                "No service ever responded, so credentials were never offered. Permission is simply not shown by this message.",
            },
            explanation:
              "A timeout is silence: filtered, dropped, or nothing listening. It says nothing whatsoever about whether your account would have been accepted.",
          },
          {
            id: "sc-refused",
            output: "ssh: connect to host cf-student-07 port 22: Connection refused",
            correct: { reach: "no", permit: "unknown" },
            hints: {
              reach:
                "The host answered, but it answered by closing the door — there is no SSH service accepting connections on port 22, so remote access is ruled out.",
              permit:
                "Again, no authentication was ever attempted. Permission remains untested.",
            },
            explanation:
              "Refused proves the host is alive and responding — which is more than a timeout tells you — while still proving no SSH service is available to log into.",
          },
          {
            id: "sc-denied",
            output: "analyst@cf-student-07: Permission denied (publickey,password).",
            correct: { reach: "yes", permit: "no" },
            hints: {
              reach:
                "To reject your credentials, a service had to receive them. Reachability on port 22 is established by this message.",
              permit:
                "The service explicitly declined these credentials, so permission is ruled out — for this account, with this key.",
            },
            explanation:
              "This is the message people most often read as 'the network is broken'. It is the opposite: the network worked perfectly and the authorisation layer said no.",
          },
        ],
        completion: {
          headline: "Reachability and permission are two separate findings.",
          body: "Once you classify them apart, the fix routes itself: a timeout goes to the network or filtering owner, a refusal goes to whoever runs the service, and a denial goes to whoever manages access.",
          shell: [
            "analyst@cf-jump:~$ ssh -i ~/.ssh/ops_ed25519 analyst@cf-student-07",
            "Welcome to Cloud Heights lab host cf-student-07",
            "analyst@cf-student-07:~$ systemctl status portal --no-pager",
            "  ● portal.service - Lab Portal",
            "     Active: inactive (dead) since 03:14",
          ],
        },
      },
      successSummary:
        "Timeout and refusal both rule out remote access but for different reasons; permission denied proves you got all the way there. With the correct key, the shell opens — and the portal service is confirmed stopped.",
      retryPrompt:
        "Re-classify any message. Switching between messages keeps everything you've already established.",
      explanation:
        "Port 22 is not a place — it is a service endpoint on a host. A response of any kind proves something is listening or actively refusing; silence proves neither. Authentication is a separate layer that can only fail once you have already arrived.",
      instructorNotes: [
        "Ask which message is the 'best news' for the analyst — permission denied usually surprises people.",
      ],
      continueLabel: "Continue to the incident room",
    },

    {
      id: "scene-07-incident-room",
      title: "Mission 07 — The Incident Board",
      objective:
        "Separate what was observed from what was assumed, and name what is still unverified.",
      environmentId: "incident-response-room",
      characterState: "ivy-thinking",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Before anyone writes this up, we sort the board. Observed on the left, assumed in the middle, unverified on the right.",
          characterState: "ivy-thinking",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "Most bad incident reports aren't wrong about the facts. They're wrong about which parts were facts.",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "ev-board-rule",
          label: "Board rule",
          value: "A claim is observed only if a command produced it.",
        },
        {
          id: "ev-board-gap",
          label: "Named gap",
          value: "Why the service stopped is still unverified",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-incident-board",
        kind: "evidence-sort",
        prompt: "Sort the board before the write-up.",
        instruction:
          "Select a card, then choose a column — or drag it. Cards can be moved as often as you like; Ivy questions a placement rather than locking it.",
        report: {
          from: "Lab supervisor",
          text: "The whole lab network went down this morning and someone must have changed the firewall.",
        },
        buckets: [
          {
            id: "b-observed",
            label: "Observed",
            description: "A command or system message produced this directly.",
          },
          {
            id: "b-assumed",
            label: "Assumed",
            description: "Plausible, but nothing we ran actually shows it.",
          },
          {
            id: "b-unverified",
            label: "Still unverified",
            description: "A real open question we have not yet tested.",
          },
        ],
        items: [
          {
            id: "i-1",
            label: "curl returned 'connection refused' on port 80",
            correctBucketId: "b-observed",
            challenge: {
              "*":
                "This one came straight off the terminal in the NOC. What would make it anything other than an observation?",
            },
            explanation:
              "Captured verbatim from the command output — the cleanest kind of evidence.",
          },
          {
            id: "i-2",
            label: "cf-student-07 holds 172.18.20.7/22 with the link up",
            correctBucketId: "b-observed",
            challenge: {
              "*": "We ran ip addr and read the result. That is an observation.",
            },
            explanation: "Directly shown by ip addr on the affected host.",
          },
          {
            id: "i-3",
            label: "Nothing is listening on port 80 on the portal host",
            correctBucketId: "b-observed",
            challenge: {
              "*":
                "ss -tlnp returned no listener for :80. What more would you want before calling that observed?",
            },
            explanation:
              "Shown by ss on the host, and consistent with the immediate refusal.",
          },
          {
            id: "i-4",
            label: "The whole lab network went down",
            correctBucketId: "b-assumed",
            challenge: {
              "b-observed":
                "Which command produced that? Every network test we ran came back healthy — this came from the report, not the evidence.",
              "*":
                "It's stated confidently in the report, but our own tests contradict it. Where does a confident, untested claim belong?",
            },
            explanation:
              "It came from the reporter's interpretation. Gateway, resolution and host tests all passed, so it isn't supported.",
          },
          {
            id: "i-5",
            label: "Someone changed the firewall",
            correctBucketId: "b-assumed",
            challenge: {
              "b-unverified":
                "Close — but this isn't a question we chose to open, it's a cause someone asserted without evidence. Which column is for asserted causes?",
              "*":
                "Nothing we ran touched a firewall rule. What is a confidently stated cause with no supporting evidence?",
            },
            explanation:
              "An asserted cause. A filtering change usually produces timeouts, not an immediate refusal from the host.",
          },
          {
            id: "i-6",
            label: "Why the portal service stopped at 03:14",
            correctBucketId: "b-unverified",
            challenge: {
              "b-assumed":
                "We aren't assuming anything here — we genuinely don't know, and it matters. Which column is for open questions?",
              "*":
                "systemctl shows the service inactive since 03:14, but not why. Is that a fact, an assumption, or an open question?",
            },
            explanation:
              "A real gap. Logs from around 03:14 would answer it; nothing we have so far does.",
          },
          {
            id: "i-7",
            label: "Whether other lab hosts are affected",
            correctBucketId: "b-unverified",
            challenge: {
              "*":
                "We only tested cf-student-07. Does that make the scope known, assumed, or open?",
            },
            explanation:
              "Scope was never tested. Until another host is checked, this stays an open question.",
          },
        ],
        completion: {
          headline: "Three facts, two assumptions, two open questions.",
          body: "The board now shows exactly what you can defend and exactly what you still owe. That distinction is what makes an incident report useful to the next shift.",
        },
      },
      successSummary:
        "Observed: the refusal, the host's address, and the missing listener. Assumed: the network-wide outage and the firewall change. Unverified: why the service stopped, and whether anyone else is affected.",
      retryPrompt:
        "Move any card back to the tray and re-sort it. Ivy re-reads the board each time.",
      explanation:
        "Incident quality depends on labelling the epistemic status of every claim. Observations come from output you captured, assumptions are inherited from reports or intuition, and unverified items are the questions you are explicitly handing forward.",
      instructorNotes: [
        "The firewall card is the discussion piece — plausible, common, and unsupported.",
      ],
      continueLabel: "Continue to the briefing",
    },

    {
      id: "scene-08-briefing",
      title: "Mission 08 — The Briefing",
      objective:
        "Assemble a statement you could defend to the operations lead, and say what remains open.",
      environmentId: "briefing-room",
      characterState: "ivy-briefing",
      intro: [
        {
          id: "l1",
          speaker: "Ivy",
          text: "Last part. Put it on the display in three sections: what we found, what it means, and what we still don't know.",
          characterState: "ivy-briefing",
        },
        {
          id: "l2",
          speaker: "Ivy",
          text: "If you can't say the third one out loud, the first two aren't trustworthy either.",
          characterState: "ivy-nod",
        },
      ],
      evidence: [
        {
          id: "ev-brief-shape",
          label: "Briefing shape",
          value: "Finding → Meaning → Open question",
        },
        {
          id: "ev-brief-close",
          label: "Handover",
          value: "Service owner, with logs from 03:14",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "int-briefing",
        kind: "briefing",
        prompt: "Build the briefing.",
        instruction:
          "Place each card under the section where it belongs. When the display reads correctly, confirm the statement.",
        sections: [
          {
            id: "sec-found",
            label: "What we found",
            description: "Claims backed by output we captured.",
          },
          {
            id: "sec-means",
            label: "What it means",
            description: "The interpretation those findings support.",
          },
          {
            id: "sec-open",
            label: "What we don't know",
            description: "Named gaps we are handing forward.",
          },
        ],
        items: [
          {
            id: "b-1",
            label: "Host address, gateway and name resolution all tested healthy",
            correctSectionId: "sec-found",
            statementFragment:
              "On cf-student-07, the interface, campus gateway and name resolution all tested healthy.",
            explanation:
              "Each of these came from a command we ran, so it belongs in findings.",
          },
          {
            id: "b-2",
            label: "Port 80 refused immediately; no listener on the portal host",
            correctSectionId: "sec-found",
            statementFragment:
              "The portal host answered but refused port 80, and no process was listening on it.",
            explanation:
              "Observed twice — once from the client, once on the host itself.",
          },
          {
            id: "b-3",
            label: "portal.service has been inactive since 03:14",
            correctSectionId: "sec-found",
            statementFragment: "portal.service has been inactive since 03:14.",
            explanation: "Read directly from systemctl over the SSH session.",
          },
          {
            id: "b-4",
            label: "This is a service fault, not a network fault",
            correctSectionId: "sec-means",
            statementFragment:
              "Taken together, this is a service fault rather than a network fault,",
            explanation:
              "An interpretation — well supported, but still a conclusion drawn from the findings rather than a finding itself.",
          },
          {
            id: "b-5",
            label: "Ownership sits with the portal service owner, not the network team",
            correctSectionId: "sec-means",
            statementFragment:
              "so it belongs with the portal service owner rather than the network team.",
            explanation:
              "A routing decision that follows from the interpretation above it.",
          },
          {
            id: "b-6",
            label: "The cause of the 03:14 stop is not established",
            correctSectionId: "sec-open",
            statementFragment:
              "We have not established why the service stopped at 03:14,",
            explanation:
              "A named gap. Stating it protects everyone downstream from over-reading the report.",
          },
          {
            id: "b-7",
            label: "Scope beyond cf-student-07 has not been tested",
            correctSectionId: "sec-open",
            statementFragment:
              "and we have not tested whether any host other than cf-student-07 is affected.",
            explanation:
              "The second open question — scope was never part of what we measured.",
          },
        ],
        confirm: {
          prompt:
            "Read it back. Every sentence should be one you could defend with a command you actually ran.",
          action: "Confirm the briefing",
        },
        completion: {
          headline: "That's a briefing an operations lead can act on.",
          body: "Findings, interpretation and gaps are separated, so nobody has to guess which part was measured. The mission is complete.",
          finalLine:
            "Same question I asked on my block: is it here, on the way, or there? You answered it in a building you'd never set foot in.",
          banner: "Mission complete — From The Grid to Cloud Heights",
        },
      },
      successSummary:
        "The briefing separates three measured findings, two supported interpretations, and two explicitly named unknowns — the standard this whole mission has been building toward.",
      retryPrompt:
        "Move any card between sections; the assembled statement rebuilds itself.",
      explanation:
        "A professional handover distinguishes measurement from interpretation from ignorance. The findings carry evidence, the meaning carries reasoning, and the open questions carry honesty about scope — which is what lets the next person start where you stopped instead of starting over.",
      instructorNotes: [
        "Close the session by asking a student to deliver the assembled statement aloud.",
      ],
      continueLabel: "Finish the mission",
    },
  ],
};

