import type { Experience } from "../types";

/**
 * CyberFoundations Week 7 flagship live mission.
 *
 * Scope is fixed by the Week 7 lesson guides and the Cloud Heights lab
 * package: rule anatomy, priority order, first-match-wins, separate inbound
 * and outbound ledgers, the protected baseline band (100/110/120), the
 * student band (200–999), the fixed TCP 8080 rule tester, and the four
 * supported verdicts. Nothing beyond that scope is introduced here, and no
 * student-facing flow-log viewer is claimed — the lab does not expose one.
 */
export const cloudHeightsGuardPost: Experience = {
  id: "cf-w7-cloud-heights-guard-post",
  slug: "cloud-heights-guard-post",
  programId: "cyberfoundations",
  moduleId: "cf-module-2",
  weekId: "cf-week-07",
  type: "live-mission",
  status: "available",
  title: "Cloud Heights Guard Post — Security Incident Strategy Session",
  subtitle: "Can It Reach It? Should It Reach It? Can You Prove It?",
  description:
    "Seven scenes at the Cloud Heights Guard Post: work incident CH-8080 from an incomplete ticket to a defensible operations statement, using rule priority, least privilege, and paired positive/negative testing.",
  objectives: [
    "Ask for evidence before changing anything.",
    "Separate what is proven from what is assumed or not yet verified.",
    "Read an ordered rule ledger: lowest number first, first match wins.",
    "Correct only the conflicting student-controlled rule, without broadening access.",
    "Distinguish a permission problem from a service-availability problem.",
    "Prove least privilege with paired positive and negative tests.",
    "Brief the outcome in language the evidence actually supports.",
  ],
  estimatedMinutes: 75,
  characterIds: ["ivy"],
  environmentIds: [
    "incident-response-room",
    "noc",
    "remote-access-workstation",
    "troubleshooting-room",
    "briefing-room",
    "cloud-heights-campus",
  ],
  replayAvailable: true,
  route: "/cyberfoundations/week-07/cloud-heights-guard-post",
  instructorNotes: [
    "Students are the Cloud Heights security operations team. Ivy supplies context and reacts; she does not make the security decisions.",
    "Protected baseline priorities 100, 110 and 120 are never edited and never used as troubleshooting targets. Student work stays in 200–999.",
    "The rule tester is fixed to TCP 8080 against the student's own VM. Do not imply other ports, protocols or authentication were tested.",
    "There is no student-facing flow-log viewer in the current lab product. Do not promise one.",
    "Aim for roughly 60–70% student reasoning, 30–40% facilitation. Use the processing pause in every scene.",
    "Call an incorrect prediction a hypothesis that does not fit the evidence — never a failure.",
  ],
  runOfShow: [
    {
      order: 1,
      title: "Incident Briefing",
      minutes: 9,
      focus: "Ask for evidence before changing anything.",
    },
    {
      order: 2,
      title: "What Do We Actually Know?",
      minutes: 10,
      focus: "Proven vs assumed vs not yet verified.",
    },
    {
      order: 3,
      title: "Read the Door Ledger",
      minutes: 14,
      focus: "Lowest number first, first match wins, narrowest fix.",
    },
    {
      order: 4,
      title: "The Plot Twist",
      minutes: 11,
      focus: "Permission is not the same as service availability.",
    },
    {
      order: 5,
      title: "Prove It",
      minutes: 11,
      focus: "Positive and negative testing as paired proof.",
    },
    {
      order: 6,
      title: "The Operations Briefing",
      minutes: 10,
      focus: "A statement scoped to the evidence.",
    },
    {
      order: 7,
      title: "Module 2 Close / Week 8 Bridge",
      minutes: 10,
      focus: "Address → … → Evidence, then the Module 3 handoff.",
    },
  ],

  scenes: [
    /* ---------------------------------------------- Scene 1 — briefing */
    {
      id: "w7-scene-01-incident-briefing",
      title: "Scene 01 — Incident Briefing",
      objective:
        "Decide what you need to know about incident CH-8080 before anyone touches a rule.",
      environmentId: "incident-response-room",
      characterState: "ivy-briefing",
      intro: [
        {
          id: "w7s1-l1",
          speaker: "Ivy",
          text: "Ticket CH-8080 just landed at the Guard Post. Application unreachable on TCP 8080, and that is genuinely all we have.",
          characterState: "ivy-briefing",
        },
        {
          id: "w7s1-l2",
          speaker: "Ivy",
          text: "Before we touch the ledger — what questions would keep us from solving the wrong problem?",
          characterState: "ivy-thinking",
        },
      ],
      evidence: [
        {
          id: "w7-ev-ticket",
          label: "Incident",
          value: "CH-8080",
          status: "unknown",
          note: "Reported symptom only. No cause identified.",
        },
        {
          id: "w7-ev-vm",
          label: "VM power state",
          value: "Running",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-dest",
          label: "Destination",
          value: "Assigned student VM (simulation address 10.60.7.25)",
          status: "unknown",
          note: "Simulation placeholder for the learner's assigned VM.",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-path",
          label: "Network path",
          value: "Available to the VM subnet",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-service",
          label: "Service state on TCP 8080",
          value: "Not established by this evidence",
          status: "unknown",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-rules",
          label: "Applicable inbound rules",
          value: "Student-controlled rules exist at priority 200 and 250",
          status: "degraded",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-source",
          label: "Required source",
          value: "Grid Beacon 10.60.6.4",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-port",
          label: "Requested protocol / port",
          value: "TCP 8080",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev-test",
          label: "Reported test",
          value: "Portal rule tester run from Grid Beacon; traffic did not arrive",
          status: "degraded",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "w7-i1-requests",
        kind: "investigation-request",
        prompt: "What do you need to know before you change anything?",
        instruction:
          "Select the questions you want answered. Every answer stays on the board. No rule is edited in this scene.",
        ticket: {
          ref: "CH-8080",
          title: "Student application unreachable",
          rows: [
            { label: "Affected service", value: "Student application" },
            { label: "Destination", value: "Student VM" },
            { label: "Protocol", value: "TCP" },
            { label: "Port", value: "8080" },
            { label: "Reported symptom", value: "Application unreachable" },
            { label: "Required source", value: "Grid Beacon 10.60.6.4" },
          ],
          note: "The ticket does not say whether this is routing, a security rule, rule priority, service availability, or something else. Nothing here identifies a cause.",
        },
        questions: [
          {
            id: "w7-q-vm",
            label: "Is the VM running?",
            essential: true,
            answer: "VM power state: Running.",
            response:
              "Worth confirming first — a powered-off VM would explain everything and change nothing else.",
            revealsEvidenceIds: ["w7-ev-vm"],
          },
          {
            id: "w7-q-dest",
            label: "What is the destination IP?",
            essential: true,
            answer: "Assigned student VM — simulation address 10.60.7.25.",
            response:
              "A rule that names the wrong destination protects the wrong thing. Pin the destination early.",
            revealsEvidenceIds: ["w7-ev-dest"],
          },
          {
            id: "w7-q-path",
            label: "Is there a valid network path?",
            essential: true,
            answer: "Path to the VM subnet is available.",
            response:
              "Reachability is a Week 5 question. Answering it here stops the room blaming the network later.",
            revealsEvidenceIds: ["w7-ev-path"],
          },
          {
            id: "w7-q-service",
            label: "Is the service listening?",
            essential: true,
            answer:
              "Not established yet — nothing in the ticket confirms a listener on TCP 8080.",
            response:
              "Hold that gap. A permission fix cannot make a service that is not running answer.",
            revealsEvidenceIds: ["w7-ev-service"],
          },
          {
            id: "w7-q-rules",
            label: "What security rules apply?",
            essential: true,
            answer:
              "Student-controlled inbound rules exist at priority 200 and 250. Protected baseline rules 100, 110 and 120 also apply and are not editable.",
            response:
              "Two student rules on the same port is the first thing that deserves a careful read.",
            revealsEvidenceIds: ["w7-ev-rules"],
          },
          {
            id: "w7-q-source",
            label: "What is the source?",
            essential: true,
            answer: "Required source is Grid Beacon 10.60.6.4.",
            response:
              "Source is a distinct question from destination. A rule answers both separately.",
            revealsEvidenceIds: ["w7-ev-source"],
          },
          {
            id: "w7-q-port",
            label: "What is the port?",
            essential: true,
            answer: "TCP 8080 — the port the tester is fixed to.",
            response: "Protocol and port together, not port alone.",
            revealsEvidenceIds: ["w7-ev-port"],
          },
          {
            id: "w7-q-test",
            label: "What happened during the test?",
            essential: true,
            answer:
              "The Portal rule tester was run from Grid Beacon toward the student VM on TCP 8080; the traffic did not arrive.",
            response:
              "Knowing how the test was run tells us what the result can and cannot prove.",
            revealsEvidenceIds: ["w7-ev-test"],
          },
        ],
        completion: {
          headline: "Questions first, changes later.",
          body: "Eight answers on the board and not one rule touched. That is what keeps a team from fixing something that was never broken.",
        },
      },
      successSummary:
        "The room now has the evidence set it asked for — and a written record of what is still unknown.",
      retryPrompt:
        "Reset the board to run the questioning again with a different group.",
      explanation:
        "Good troubleshooting starts with questions, not changes. Each answer narrows the failure domain: power, destination, path, service, rules, source, port, and how the test was actually run.",
      instructorNotes: [
        "Do not name a cause in this scene, even if a student guesses correctly.",
        "Ask questions before revealing answers; the board is the room's, not yours.",
      ],
      facilitation: {
        recommendedMinutes: 9,
        onScreen: [
          "Incident ticket CH-8080 with six known fields.",
          "Eight selectable evidence questions.",
          "Field-notes evidence panel that fills as questions are asked.",
        ],
        openingStatement:
          "You are the Cloud Heights security operations team. A ticket says the student application is unreachable on TCP 8080. You have permission to change rules — but not yet.",
        questionsToAsk: [
          "What do you need to know before you change anything?",
          "Which of these questions could, on its own, end the investigation?",
          "What does the ticket deliberately not tell us?",
        ],
        expectedReasoning: [
          "Confirm the VM is running before anything else.",
          "Establish destination, source, protocol and port as four separate facts.",
          "Ask whether the path exists and whether the service is listening — separate questions.",
          "Ask what rules apply before proposing a rule change.",
        ],
        misconceptions: [
          "\"It's the firewall\" stated before any rule has been read.",
          "Treating source and destination as one fact.",
          "Assuming the tester covers more than TCP 8080.",
        ],
        followUpQuestions: [
          "If the VM were powered off, which of the other answers would still matter?",
          "Which answer would you want in writing before you edited a rule?",
        ],
        processingPause:
          "After the last question is answered, pause for 60 seconds. Ask the room to write down the one thing they still cannot prove.",
        evidenceRevealOrder: [
          "VM power state",
          "Destination",
          "Network path",
          "Service state (deliberately unresolved)",
          "Applicable rules",
          "Required source",
          "Protocol and port",
          "How the test was run",
        ],
        correctAnswer:
          "All eight questions are legitimate. The scene is complete when each has been asked and the room can state what remains unproven — the service state.",
        transition:
          "We have answers. Next we separate the answers we proved from the stories we told ourselves.",
      },
      continueLabel: "Sort the evidence",
    },

    /* --------------------------------------- Scene 2 — what do we know */
    {
      id: "w7-scene-02-what-we-know",
      title: "Scene 02 — What Do We Actually Know?",
      objective:
        "Sort every statement into PROVEN, ASSUMED, or NOT YET VERIFIED — and defend the sort.",
      environmentId: "incident-response-room",
      characterState: "ivy-thinking",
      bareSurface: true,
      intro: [
        {
          id: "w7s2-l1",
          speaker: "Ivy",
          text: "Everything from the briefing is on the board. Some of it we proved. Some of it we said out loud and started believing.",
          characterState: "ivy-point",
        },
      ],
      evidence: [
        {
          id: "w7-ev2-proven",
          label: "Proven so far",
          value: "VM running · source 10.60.6.4 · destination student VM · path available · TCP 8080",
          status: "healthy",
        },
        {
          id: "w7-ev2-open",
          label: "Still open",
          value: "Why the traffic did not arrive",
          status: "unknown",
          note: "Reachability does not equal permission.",
        },
      ],
      interaction: {
        id: "w7-i2-sort",
        kind: "evidence-sort",
        prompt: "What have we proven — and what have we not?",
        instruction:
          "Select a statement, then choose a column. Statements can be moved as often as the room wants; nothing is scored.",
        report: {
          from: "Guard Post duty log",
          text: "CH-8080 remains open. No configuration change has been made.",
        },
        buckets: [
          {
            id: "proven",
            label: "Proven",
            description: "Backed by evidence we actually gathered.",
          },
          {
            id: "assumed",
            label: "Assumed",
            description: "Stated as fact, but never demonstrated.",
          },
          {
            id: "unverified",
            label: "Not yet verified",
            description: "A fair question with no answer yet.",
          },
        ],
        items: [
          {
            id: "w7-s2-vm",
            label: "The VM is running.",
            correctBucketId: "proven",
            challenge: {
              assumed: "We read the power state directly. What makes that an assumption?",
              unverified: "This one we did verify — check the field notes.",
            },
            explanation: "Power state was reported directly in the briefing evidence.",
          },
          {
            id: "w7-s2-source",
            label: "The required source is Grid Beacon 10.60.6.4.",
            correctBucketId: "proven",
            challenge: {
              assumed: "The ticket names the source explicitly.",
              unverified: "We have it in writing on the ticket.",
            },
            explanation: "The ticket states the required source address.",
          },
          {
            id: "w7-s2-dest",
            label:
              "The destination is the assigned student VM (simulation address 10.60.7.25).",
            correctBucketId: "proven",
            challenge: {
              assumed: "We asked for the destination and got an answer.",
              unverified: "This was answered during the briefing.",
            },
            explanation:
              "Destination was confirmed during evidence gathering. The address is a simulation placeholder.",
          },
          {
            id: "w7-s2-path",
            label: "A network path to the VM subnet is available.",
            correctBucketId: "proven",
            challenge: {
              assumed: "Path availability was confirmed, not guessed.",
              unverified: "We verified this one in the briefing.",
            },
            explanation:
              "Path availability is proven — and proves nothing about permission.",
          },
          {
            id: "w7-s2-port",
            label: "The requested protocol and port are TCP 8080.",
            correctBucketId: "proven",
            challenge: {
              assumed: "Both the ticket and the tester fix this.",
              unverified: "The tester is fixed to TCP 8080.",
            },
            explanation: "Protocol and port are fixed by the ticket and the tester.",
          },
          {
            id: "w7-s2-firewall",
            label: "The firewall is broken.",
            correctBucketId: "assumed",
            challenge: {
              proven: "Which reading of which rule proved a fault?",
              unverified:
                "This is stronger than an open question — someone asserted it as a cause.",
            },
            explanation:
              "No rule has been read yet. A rule doing exactly what it says is not a broken firewall.",
          },
          {
            id: "w7-s2-network",
            label: "The network is down.",
            correctBucketId: "assumed",
            challenge: {
              proven: "We proved the opposite: the path is available.",
              unverified: "The path question was already answered.",
            },
            explanation: "The evidence directly contradicts this claim.",
          },
          {
            id: "w7-s2-app",
            label: "The application is broken.",
            correctBucketId: "assumed",
            challenge: {
              proven: "Nothing has inspected the application.",
              unverified:
                "It is being asserted as a cause, which makes it an assumption rather than an open question.",
            },
            explanation:
              "Nothing gathered so far speaks to the application's internal health.",
          },
          {
            id: "w7-s2-changed",
            label: "Someone changed a rule.",
            correctBucketId: "assumed",
            challenge: {
              proven: "We have no change record in evidence.",
              unverified:
                "It is phrased as a cause, not a question — that makes it an assumption.",
            },
            explanation:
              "A plausible story with no supporting evidence in front of us.",
          },
          {
            id: "w7-s2-listening",
            label: "The service is listening on TCP 8080.",
            correctBucketId: "unverified",
            challenge: {
              proven: "Which answer showed us a listener?",
              assumed:
                "Nobody claimed it as fact — the room flagged it as unknown, which is the honest position.",
            },
            explanation:
              "This was explicitly left open in the briefing and stays open until tested.",
          },
          {
            id: "w7-s2-rules-effect",
            label: "The applicable rules allow traffic from 10.60.6.4.",
            correctBucketId: "unverified",
            challenge: {
              proven: "We know rules exist. We have not read their effect.",
              assumed:
                "No one has asserted this — it is the next question to answer.",
            },
            explanation:
              "We know two student rules exist at 200 and 250. Their combined effect is the next scene.",
          },
        ],
        completion: {
          headline: "Reachability does not equal permission.",
          body: "Five proven facts, four assumptions the room can name out loud, and two honest unknowns. Now we go read the ledger.",
        },
      },
      successSummary:
        "The board separates evidence from narrative. Assumptions stay visible rather than being deleted.",
      retryPrompt: "Reset the board to re-sort with a fresh group.",
      explanation:
        "Proven means we gathered it. Assumed means someone said it. Not yet verified means it is a fair question with no answer. A path being available says nothing about whether the traffic is permitted.",
      instructorNotes: [
        "Let students move cards freely; there is no penalty and no score.",
        "Ask 'what have we proven' before 'what have we not proven' — in that order.",
      ],
      facilitation: {
        recommendedMinutes: 10,
        onScreen: [
          "Evidence board with PROVEN / ASSUMED / NOT YET VERIFIED columns.",
          "Eleven statements drawn from Scene 1.",
        ],
        openingStatement:
          "Same evidence, no new information. Our only job is to be honest about which category each statement belongs in.",
        questionsToAsk: [
          "What have we proven?",
          "What have we NOT proven?",
          "Which assumption is the most tempting one here, and why?",
        ],
        expectedReasoning: [
          "Five directly gathered facts belong in PROVEN.",
          "Cause claims — firewall, network, application, someone changed a rule — are assumptions.",
          "Service state and rule effect are open questions, not accusations.",
        ],
        misconceptions: [
          "Treating 'the path is available' as proof the traffic is permitted.",
          "Filing a cause claim under NOT YET VERIFIED to make it sound neutral.",
        ],
        followUpQuestions: [
          "If 'the network is down' were true, which proven fact would have to be wrong?",
          "What would it take to move 'the service is listening' into PROVEN?",
        ],
        processingPause:
          "After the sort is complete, pause 60 seconds. Ask each student to name the assumption they personally would have made.",
        evidenceRevealOrder: [
          "Proven summary line",
          "Open question: why the traffic did not arrive",
        ],
        correctAnswer:
          "PROVEN: VM running, source, destination, path, protocol/port. ASSUMED: firewall broken, network down, application broken, someone changed a rule. NOT YET VERIFIED: service listening, rule effect.",
        transition:
          "Two of these are questions about rules. Let's go read the ledger and stop guessing.",
      },
      continueLabel: "Read the ledger",
    },

    /* --------------------------------------------- Scene 3 — the ledger */
    {
      id: "w7-scene-03-door-ledger",
      title: "Scene 03 — Read the Door Ledger",
      objective:
        "Evaluate the inbound ledger in priority order and choose the smallest defensible correction.",
      environmentId: "noc",
      characterState: "ivy-read-screen",
      bareSurface: true,
      intro: [
        {
          id: "w7s3-l1",
          speaker: "Ivy",
          text: "Inbound ledger for the student VM. Two of these are ours to edit. Three are baseline and stay exactly where they are.",
          characterState: "ivy-point",
        },
        {
          id: "w7s3-l2",
          speaker: "Ivy",
          text: "Before I run the evaluation — what happens to traffic from 10.60.6.4, and why?",
          characterState: "ivy-thinking",
        },
      ],
      evidence: [
        {
          id: "w7-ev3-order",
          label: "Evaluation order",
          value: "Lowest priority number first",
          status: "healthy",
        },
        {
          id: "w7-ev3-match",
          label: "Match behaviour",
          value: "First matching rule wins; evaluation stops there",
          status: "healthy",
        },
        {
          id: "w7-ev3-ledgers",
          label: "Ledgers",
          value: "Inbound and outbound are separate",
          status: "healthy",
        },
        {
          id: "w7-ev3-band",
          label: "Editable band",
          value: "Priority 200–999 (student-controlled)",
          status: "healthy",
          note: "Priorities 100, 110 and 120 are protected baseline rules.",
        },
      ],
      interaction: {
        id: "w7-i3-ledger",
        kind: "rule-evaluation",
        prompt: "What happens to traffic from 10.60.6.4, and why?",
        instruction:
          "Predict first, then walk the ledger, then choose the narrowest correction. Only rules in the 200–999 band may be changed.",
        ledgerTitle: "Inbound ledger — student VM",
        directionLabel: "Inbound · student VM",
        principles: [
          "Lower number first",
          "First match wins",
          "Inbound and outbound are separate ledgers",
          "Student band: 200–999",
        ],
        rules: [
          {
            id: "w7-r100",
            priority: 100,
            name: "allow-ssh-from-bastion",
            action: "ALLOW",
            source: "Bastion subnet",
            destination: "Student VM",
            protocol: "TCP",
            port: "22",
            locked: true,
          },
          {
            id: "w7-r110",
            priority: 110,
            name: "allow-icmp-intra-vnet",
            action: "ALLOW",
            source: "VNet",
            destination: "VNet",
            protocol: "ICMP",
            port: "—",
            locked: true,
          },
          {
            id: "w7-r120",
            priority: 120,
            name: "deny-ssh-student-subnet",
            action: "DENY",
            source: "Student subnet",
            destination: "Student VM",
            protocol: "TCP",
            port: "22",
            locked: true,
          },
          {
            id: "w7-r200",
            priority: 200,
            name: "deny-8080-subnet",
            action: "DENY",
            source: "10.60.6.0/24",
            destination: "Student VM",
            protocol: "TCP",
            port: "8080",
          },
          {
            id: "w7-r250",
            priority: 250,
            name: "allow-8080-grid-beacon",
            action: "ALLOW",
            source: "10.60.6.4",
            destination: "Student VM",
            protocol: "TCP",
            port: "8080",
          },
        ],
        packet: {
          label: "Portal rule tester run from Grid Beacon",
          source: "10.60.6.4",
          destination: "Student VM",
          protocol: "TCP",
          port: "8080",
        },
        prediction: {
          prompt: "Step 1 · Predict: what does this ledger do with that traffic?",
          options: [
            {
              id: "w7-p-denied",
              label:
                "DENIED — priority 200 matches first because 10.60.6.4 is inside 10.60.6.0/24.",
              correct: true,
              response:
                "That is the reading the ledger supports. 200 is evaluated before 250, the source falls inside the /24, and evaluation stops at the first match.",
            },
            {
              id: "w7-p-allowed",
              label: "ALLOWED — the exact-source rule is more specific, so it wins.",
              correct: false,
              response:
                "A reasonable hypothesis, but it does not fit how this ledger works. Specificity does not outrank priority order; the lower number is evaluated first.",
            },
            {
              id: "w7-p-both",
              label: "Both rules apply and the ALLOW cancels the DENY.",
              correct: false,
              response:
                "Rules are not combined. Evaluation stops at the first match, so the later rule is never consulted.",
            },
            {
              id: "w7-p-baseline",
              label: "The baseline SSH rules decide it.",
              correct: false,
              response:
                "Those rules are about TCP 22, not TCP 8080. A rule only decides traffic it actually matches.",
            },
          ],
        },
        evaluation: {
          steps: [
            {
              ruleId: "w7-r100",
              result: "NO MATCH — continue",
              note: "TCP 22 from the bastion subnet. Different port, different source.",
            },
            {
              ruleId: "w7-r110",
              result: "NO MATCH — continue",
              note: "ICMP only; this is TCP.",
            },
            {
              ruleId: "w7-r120",
              result: "NO MATCH — continue",
              note: "TCP 22 again. Not our traffic.",
            },
            {
              ruleId: "w7-r200",
              result: "MATCH → DENY → STOP",
              note: "10.60.6.4 is inside 10.60.6.0/24, destination and TCP 8080 match. Evaluation ends here.",
            },
            {
              ruleId: "w7-r250",
              result: "UNEVALUATED",
              note: "Never reached. A correct rule that never runs changes nothing.",
            },
          ],
          verdict: "DENIED at priority 200",
          summary:
            "The firewall is not broken. It did exactly what the ledger told it to do, in the order the ledger told it to do it.",
        },
        remediation: {
          prompt: "Step 3 · What is the smallest defensible remediation?",
          options: [
            {
              id: "w7-fix-correct",
              label:
                "Correct only the conflicting student-controlled rules so the exact-source ALLOW is evaluated before the subnet DENY, both inside 200–999.",
              correct: true,
              response:
                "This restores the required access without widening it, leaves the protected baseline untouched, and keeps every change inside the student band.",
            },
            {
              id: "w7-fix-any",
              label: "Change the source on the ALLOW rule to Any.",
              correct: false,
              response:
                "That would let the required traffic through — and everything else with it. The requirement is one source, not any source.",
            },
            {
              id: "w7-fix-delete",
              label: "Delete all DENY rules.",
              correct: false,
              response:
                "It would remove the conflict and the protection at the same time, and it would reach protected baseline rules we are not permitted to change.",
            },
            {
              id: "w7-fix-subnet",
              label: "Open TCP 8080 to the entire subnet.",
              correct: false,
              response:
                "That grants access to every host in 10.60.6.0/24, including the source we will later need to prove is denied.",
            },
          ],
          correctedTitle: "Corrected inbound ledger — student band only",
          correctedRules: [
            {
              id: "w7-rc100",
              priority: 100,
              name: "allow-ssh-from-bastion",
              action: "ALLOW",
              source: "Bastion subnet",
              destination: "Student VM",
              protocol: "TCP",
              port: "22",
              locked: true,
            },
            {
              id: "w7-rc110",
              priority: 110,
              name: "allow-icmp-intra-vnet",
              action: "ALLOW",
              source: "VNet",
              destination: "VNet",
              protocol: "ICMP",
              port: "—",
              locked: true,
            },
            {
              id: "w7-rc120",
              priority: 120,
              name: "deny-ssh-student-subnet",
              action: "DENY",
              source: "Student subnet",
              destination: "Student VM",
              protocol: "TCP",
              port: "22",
              locked: true,
            },
            {
              id: "w7-rc250",
              priority: 250,
              name: "allow-8080-grid-beacon",
              action: "ALLOW",
              source: "10.60.6.4",
              destination: "Student VM",
              protocol: "TCP",
              port: "8080",
            },
            {
              id: "w7-rc300",
              priority: 300,
              name: "deny-8080-subnet",
              action: "DENY",
              source: "10.60.6.0/24",
              destination: "Student VM",
              protocol: "TCP",
              port: "8080",
            },
          ],
          note: "Priority values are behaviour, not labels. ALLOW at 250 is now evaluated before DENY at 300, both stay inside the 200–999 student band, and priorities 100, 110 and 120 are untouched.",
        },
        completion: {
          headline: "The ledger reads correctly now.",
          body: "One exact source is permitted on TCP 8080; the rest of the /24 is still denied. Nothing was broadened and no baseline rule was edited.",
        },
      },
      successSummary:
        "Predicted, evaluated, and corrected — with least privilege and the protected baseline intact.",
      retryPrompt: "Reset the ledger to run the prediction again.",
      explanation:
        "Rules are evaluated from the lowest priority number upward and the first match wins. A correct ALLOW placed after a broader DENY never runs. Reordering inside the 200–999 band fixes the conflict without granting anything extra.",
      instructorNotes: [
        "Take the prediction before pressing Evaluate. The prediction is the lesson.",
        "If a student says 'the firewall is broken', return to the evaluation walk rather than correcting them directly.",
        "Never invite edits to priorities 100, 110 or 120.",
      ],
      facilitation: {
        recommendedMinutes: 14,
        onScreen: [
          "Inbound ledger with three protected baseline rules and two student rules.",
          "Traffic card: 10.60.6.4 → student VM, TCP 8080.",
          "Stepwise evaluation with MATCH → DENY → STOP and an UNEVALUATED rule below it.",
        ],
        openingStatement:
          "This is the door ledger for the student VM. Read it the way the platform reads it: top of the list is the lowest number, and the first rule that matches ends the conversation.",
        questionsToAsk: [
          "What happens to traffic from 10.60.6.4, and why?",
          "What is priority 250 doing during that evaluation?",
          "What is the smallest change that fixes this?",
        ],
        expectedReasoning: [
          "10.60.6.4 falls inside 10.60.6.0/24, so priority 200 matches.",
          "Because the first match wins, priority 250 is never evaluated.",
          "Reordering within 200–999 restores access without broadening it.",
        ],
        misconceptions: [
          "\"The more specific rule wins\" — priority order decides, not specificity.",
          "\"The ALLOW cancels the DENY\" — rules are not combined.",
          "\"The firewall is broken\" — it is enforcing exactly what was written.",
          "Reaching for priorities 100/110/120 as troubleshooting targets.",
        ],
        followUpQuestions: [
          "If we set the ALLOW source to Any, what have we just permitted?",
          "Which of the four remediation options would you have to defend in a review?",
        ],
        processingPause:
          "Hold 90 seconds after the MATCH → DENY → STOP reveal, before opening the remediation question.",
        evidenceRevealOrder: [
          "Evaluation order",
          "First match wins",
          "Separate inbound and outbound ledgers",
          "Editable band 200–999",
        ],
        correctAnswer:
          "DENIED at priority 200; priority 250 is unevaluated. Correct only the student-controlled rules: ALLOW 10.60.6.4 at 250, DENY 10.60.6.0/24 at 300.",
        transition:
          "The ledger is right. Let's test it — and see whether the ledger was the only problem.",
      },
      continueLabel: "Run the test",
    },

    /* ------------------------------------------- Scene 4 — plot twist */
    {
      id: "w7-scene-04-plot-twist",
      title: "Scene 04 — The Plot Twist",
      objective:
        "Interpret a SERVICE_NOT_LISTENING result without reaching for the rule ledger again.",
      environmentId: "remote-access-workstation",
      characterState: "ivy-type",
      intro: [
        {
          id: "w7s4-l1",
          speaker: "Ivy",
          text: "Ledger corrected. Running the tester from Grid Beacon on TCP 8080 now.",
          characterState: "ivy-type",
        },
      ],
      evidence: [
        {
          id: "w7-ev4-verdict",
          label: "Tester verdict",
          value: "SERVICE_NOT_LISTENING",
          status: "degraded",
          note: "A supported verdict. It is not an error in the rule.",
        },
        {
          id: "w7-ev4-domains",
          label: "Two different jobs",
          value: "The NSG rule decides permission; the listener decides availability",
          status: "healthy",
        },
        {
          id: "w7-ev4-command",
          label: "Temporary service command",
          value: "python3 -m http.server 8080",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
        {
          id: "w7-ev4-retest",
          label: "Retest from Grid Beacon",
          value: "10.60.6.4 → TCP 8080 → ALLOWED",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "w7-i4-twist",
        kind: "investigation",
        prompt: "The rule is right. The test still isn't green. What now?",
        instruction:
          "Read the verdict, decide which failure domain it belongs to, then act — one step at a time.",
        opening: {
          command: "portal rule-test --source 10.60.6.4 --proto tcp --port 8080",
          output: ["Result: SERVICE_NOT_LISTENING"],
          caption:
            "SERVICE_NOT_LISTENING is one of four supported verdicts. It can coexist with a completely correct rule.",
        },
        topology: [
          {
            id: "w7-n-source",
            label: "Grid Beacon 10.60.6.4",
            initialStatus: "healthy",
            initialReading: "Test source",
          },
          {
            id: "w7-n-path",
            label: "Network path",
            initialStatus: "healthy",
            initialReading: "Available",
          },
          {
            id: "w7-n-rule",
            label: "NSG rule (permission)",
            initialStatus: "healthy",
            initialReading: "ALLOW 250 evaluated first",
          },
          {
            id: "w7-n-service",
            label: "TCP 8080 listener",
            initialStatus: "no-response",
            initialReading: "Nothing listening",
          },
        ],
        steps: [
          {
            id: "w7-s4-decide",
            kind: "choice",
            prompt: "Do we change the NSG again?",
            instruction: "Say what the verdict is actually reporting.",
            options: [
              {
                id: "w7-s4-o-service",
                label:
                  "No. This is a different failure domain — nothing is listening on TCP 8080.",
                correct: true,
                response:
                  "Correct. The rule answered 'this traffic is permitted'. The verdict is reporting that nothing answered on the other side.",
              },
              {
                id: "w7-s4-o-broaden",
                label: "Yes — broaden the ALLOW rule until something works.",
                correct: false,
                assumption: true,
                response:
                  "That is a hypothesis that does not fit the evidence. Widening permission cannot create a listener, and it would give away the least privilege we just established.",
              },
              {
                id: "w7-s4-o-priority",
                label: "Yes — the priority numbers must still be wrong.",
                correct: false,
                assumption: true,
                response:
                  "Understandable instinct, but the evaluation already showed ALLOW at 250 being reached first. A priority problem would report a denial, not a missing listener.",
              },
              {
                id: "w7-s4-o-auth",
                label: "It must be an authentication failure.",
                correct: false,
                assumption: true,
                response:
                  "Nothing in this scene tested authentication, so we cannot claim it either way. The verdict we have names the listener, not credentials.",
              },
            ],
          },
          {
            id: "w7-s4-restore",
            kind: "diagnostic",
            prompt: "Start the temporary service and retest.",
            instruction:
              "Only the supported lab command is available. Run it, then run the tester again.",
            commands: [
              {
                id: "w7-s4-c-start",
                command: "python3 -m http.server 8080",
                output: [
                  "Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...",
                ],
                proves: "A listener now exists on TCP 8080.",
                topologyUpdate: {
                  nodeId: "w7-n-service",
                  status: "healthy",
                  reading: "Listening on 0.0.0.0:8080",
                },
              },
              {
                id: "w7-s4-c-retest",
                command: "portal rule-test --source 10.60.6.4 --proto tcp --port 8080",
                output: ["Result: ALLOWED"],
                proves:
                  "The required source now reaches the service on TCP 8080 — permission and availability together.",
                topologyUpdate: {
                  nodeId: "w7-n-rule",
                  status: "healthy",
                  reading: "ALLOWED from 10.60.6.4",
                },
              },
            ],
          },
        ],
        completion: {
          headline: "Two problems, two different fixes.",
          body: "The rule conflict was a permission problem. The missing listener was an availability problem. The same user-facing symptom — 'unreachable' — covered both.",
        },
      },
      successSummary:
        "Grid Beacon 10.60.6.4 → TCP 8080 → ALLOWED, with the narrow rule still in place.",
      retryPrompt: "Reset this scene to work the twist again.",
      explanation:
        "Permission does not guarantee service availability. The NSG rule and the Python listener do different jobs, so a correct rule can sit alongside SERVICE_NOT_LISTENING. Identical symptoms can have entirely different causes.",
      instructorNotes: [
        "Pause on the verdict before anyone proposes an action.",
        "Do not let the room claim authentication was tested or ruled out — nothing here tested it.",
      ],
      facilitation: {
        recommendedMinutes: 11,
        onScreen: [
          "Terminal showing SERVICE_NOT_LISTENING.",
          "Four-node status strip: source, path, rule, listener.",
          "One decision step, then the service command and the retest.",
        ],
        openingStatement:
          "We corrected the ledger and ran the tester. Read the result before anyone touches anything.",
        questionsToAsk: [
          "Do we change the NSG again?",
          "Which part of the system is this verdict actually describing?",
          "What would broadening the rule accomplish here?",
        ],
        expectedReasoning: [
          "SERVICE_NOT_LISTENING describes the destination service, not the rule.",
          "A correct rule and a missing listener can be true at the same time.",
          "Start the temporary service, then retest with the same fixed parameters.",
        ],
        misconceptions: [
          "Treating any failed test as a firewall problem.",
          "Widening the ALLOW rule to force a green result.",
          "Claiming authentication was tested when nothing tested it.",
        ],
        followUpQuestions: [
          "If we had broadened the rule first, what would the retest have proven?",
          "What is the user-visible symptom for both of tonight's problems?",
        ],
        processingPause:
          "Hold 60 seconds immediately after SERVICE_NOT_LISTENING appears. No hands, no answers — just reading.",
        evidenceRevealOrder: [
          "Tester verdict",
          "Two different jobs (permission vs availability)",
          "Temporary service command",
          "Retest result ALLOWED",
        ],
        correctAnswer:
          "Do not change the NSG. Start the temporary service with python3 -m http.server 8080, then retest: 10.60.6.4 → TCP 8080 → ALLOWED.",
        transition:
          "It works. That is not the same as knowing it works securely — so let's prove the other half.",
      },
      continueLabel: "Prove it",
    },

    /* ---------------------------------------------- Scene 5 — prove it */
    {
      id: "w7-scene-05-prove-it",
      title: "Scene 05 — Prove It",
      objective:
        "Pair the positive result with a negative test and state exactly what the pair proves.",
      environmentId: "troubleshooting-room",
      characterState: "ivy-point",
      bareSurface: true,
      intro: [
        {
          id: "w7s5-l1",
          speaker: "Ivy",
          text: "Grid Beacon came back ALLOWED. Are we done?",
          characterState: "ivy-thinking",
        },
      ],
      evidence: [
        {
          id: "w7-ev5-positive",
          label: "Positive test",
          value: "10.60.6.4 → TCP 8080 → ALLOWED",
          status: "healthy",
        },
        {
          id: "w7-ev5-negative",
          label: "Negative test",
          value: "10.60.6.10 → TCP 8080 → DENIED",
          status: "healthy",
          hiddenUntilRevealed: true,
          note: "Other Test Source. Restricted traffic fails as intended.",
        },
        {
          id: "w7-ev5-deliverable",
          label: "Deliverable 2",
          value: "Narrow rule + positive test + negative test = paired proof",
          status: "healthy",
          hiddenUntilRevealed: true,
        },
      ],
      interaction: {
        id: "w7-i5-tests",
        kind: "test-comparison",
        prompt: "One green result is half a proof. What is the other half?",
        instruction:
          "Predict each result, then run it. Both results stay on screen so the pair can be read together.",
        testerNote:
          "The Portal rule tester is fixed to TCP 8080 against your own VM. It says nothing about other ports, other protocols, or authentication.",
        tests: [
          {
            id: "w7-t-positive",
            label: "Positive test — required source",
            source: "Grid Beacon 10.60.6.4",
            destination: "Student VM",
            protocol: "TCP",
            port: "8080",
            predictionPrompt: "What should the required source return?",
            options: [
              {
                id: "w7-t1-allowed",
                label: "ALLOWED — the exact-source rule is now evaluated first.",
                correct: true,
                response:
                  "Required traffic works. That is the access requirement satisfied.",
              },
              {
                id: "w7-t1-denied",
                label: "DENIED — the subnet rule still catches it.",
                correct: false,
                response:
                  "That fit the old ledger. After reordering, the exact-source ALLOW at 250 is reached before the DENY at 300.",
              },
              {
                id: "w7-t1-notlistening",
                label: "SERVICE_NOT_LISTENING — nothing has changed on the VM.",
                correct: false,
                response:
                  "The temporary service was started in the previous scene, so a listener now exists.",
              },
            ],
            verdict: "ALLOWED",
            proves:
              "Proves the required source reaches the service on TCP 8080. It proves nothing about any other source.",
          },
          {
            id: "w7-t-negative",
            label: "Negative test — Other Test Source",
            source: "Other Test Source 10.60.6.10",
            destination: "Student VM",
            protocol: "TCP",
            port: "8080",
            predictionPrompt: "What should the unintended source return?",
            options: [
              {
                id: "w7-t2-denied",
                label: "DENIED — it is not the exact source named in the ALLOW rule.",
                correct: true,
                response:
                  "It falls through the exact-source ALLOW and matches the subnet DENY at 300.",
              },
              {
                id: "w7-t2-allowed",
                label: "ALLOWED — it is in the same subnet as the required source.",
                correct: false,
                response:
                  "A hypothesis that does not fit the ledger: the ALLOW rule names one address, not the /24.",
              },
              {
                id: "w7-t2-error",
                label: "TEST_ERROR — the tester only supports one source.",
                correct: false,
                response:
                  "The tester supports the Other Test Source; that is exactly what makes negative testing possible here.",
              },
            ],
            verdict: "DENIED",
            proves:
              "Proves restricted traffic fails on TCP 8080. Without this result, we could not claim the access is narrow.",
          },
        ],
        meaning: {
          prompt: "Taken together, what do these two results support?",
          options: [
            {
              id: "w7-m-scoped",
              label:
                "The intended source reaches TCP 8080 and an unintended source does not — paired proof of least privilege for this specific access requirement.",
              correct: true,
              response:
                "That is Deliverable 2: a narrow rule, a positive test, and a negative test, each stated only as far as the evidence goes.",
            },
            {
              id: "w7-m-secure",
              label: "The VM is secure.",
              correct: false,
              response:
                "Too broad. Two tests on one port with one protocol cannot support a claim about the whole VM.",
            },
            {
              id: "w7-m-works",
              label: "The application works.",
              correct: false,
              response:
                "The tester reports on reachability and permission for TCP 8080; it does not assess whether the application behaves correctly.",
            },
            {
              id: "w7-m-auth",
              label: "Authentication is correctly configured.",
              correct: false,
              response:
                "Nothing in this session tested authentication, so we cannot support that either way.",
            },
          ],
        },
        completion: {
          headline: "IT WORKS is not the same as IT WORKS SECURELY.",
          body: "The positive test shows required traffic succeeding. The negative test shows restricted traffic failing. Together with the narrow rule, that is the evidence Deliverable 2 asks for.",
        },
      },
      successSummary:
        "Both results are on the wall: 10.60.6.4 ALLOWED, 10.60.6.10 DENIED, with a carefully scoped interpretation.",
      retryPrompt: "Reset the tests to run the predictions again.",
      explanation:
        "Positive testing proves required traffic works. Negative testing proves restricted traffic fails. Neither alone demonstrates least privilege; together with a narrow rule they support this one access requirement on TCP 8080 — and nothing wider.",
      instructorNotes: [
        "Ask 'are we done?' after the positive result and let the silence sit.",
        "Push back on any absolute claim, including from strong students.",
      ],
      facilitation: {
        recommendedMinutes: 11,
        onScreen: [
          "Two test cards: required source and Other Test Source.",
          "Persistent paired-proof table of source → protocol/port → verdict.",
          "Interpretation question with three over-broad distractors.",
        ],
        openingStatement:
          "We have one green result. In an operations review, one green result is a claim, not proof.",
        questionsToAsk: [
          "Are we done?",
          "What should 10.60.6.10 return, and why?",
          "What does each result prove on its own?",
        ],
        expectedReasoning: [
          "The required source is ALLOWED because the exact-source rule is evaluated first.",
          "The other source is DENIED because it matches only the subnet DENY.",
          "The pair supports least privilege for TCP 8080 in this scenario, nothing broader.",
        ],
        misconceptions: [
          "Assuming a same-subnet address inherits the exact-source allowance.",
          "Concluding 'everything is secure' from two tests on one port.",
          "Treating the tester as evidence about authentication.",
        ],
        followUpQuestions: [
          "If the negative test had returned ALLOWED, what would that tell us about the rule?",
          "What could you write in a report, word for word, that these two results support?",
        ],
        processingPause:
          "Pause 60 seconds after both verdicts are on the wall, before asking what they prove.",
        evidenceRevealOrder: [
          "Positive test result",
          "Negative test result",
          "Deliverable 2 paired-proof statement",
        ],
        correctAnswer:
          "10.60.6.4 → TCP 8080 → ALLOWED; 10.60.6.10 → TCP 8080 → DENIED. Together they support least privilege for this TCP 8080 access requirement.",
        transition:
          "Now we say it out loud, in a room where somebody will ask us to defend every word.",
      },
      continueLabel: "Write the briefing",
    },

    /* --------------------------------------------- Scene 6 — briefing */
    {
      id: "w7-scene-06-operations-briefing",
      title: "Scene 06 — The Operations Briefing",
      objective:
        "Assemble an incident statement that says only what the evidence supports.",
      environmentId: "briefing-room",
      characterState: "ivy-briefing",
      bareSurface: true,
      intro: [
        {
          id: "w7s6-l1",
          speaker: "Ivy",
          text: "Operations wants the CH-8080 statement. Place each line where it belongs — and leave out anything we cannot back.",
          characterState: "ivy-briefing",
        },
      ],
      evidence: [
        {
          id: "w7-ev6-scope",
          label: "Scope of the claim",
          value: "TCP 8080 inbound to the student VM, two tested sources",
          status: "healthy",
        },
      ],
      interaction: {
        id: "w7-i6-briefing",
        kind: "briefing",
        prompt: "Assemble the CH-8080 operations statement.",
        instruction:
          "Select a line, then choose a section. Unsupported lines belong in the rejected section, with a reason.",
        sections: [
          {
            id: "found",
            label: "What we found",
            description: "Conditions established by evidence.",
          },
          {
            id: "changed",
            label: "What we changed",
            description: "Actions taken, stated precisely.",
          },
          {
            id: "proves",
            label: "What the evidence proves",
            description: "Claims scoped to what was actually tested.",
          },
          {
            id: "rejected",
            label: "Not supported — leave out",
            description: "Statements the evidence does not back.",
          },
        ],
        items: [
          {
            id: "w7-b-path",
            label: "The network path to the VM was available.",
            correctSectionId: "found",
            statementFragment: "The network path to the VM was available.",
            explanation: "Confirmed during evidence gathering, before any change.",
          },
          {
            id: "w7-b-rule",
            label:
              "An earlier matching student-controlled security rule prevented the intended traffic.",
            correctSectionId: "found",
            statementFragment:
              "An earlier matching student-controlled security rule prevented the intended traffic.",
            explanation:
              "The evaluation showed priority 200 matching first and stopping evaluation.",
          },
          {
            id: "w7-b-listener",
            label: "A second problem existed: the service was not listening on TCP 8080.",
            correctSectionId: "found",
            statementFragment:
              "A second problem existed: the service was not listening on TCP 8080.",
            explanation: "Reported directly by the tester as SERVICE_NOT_LISTENING.",
          },
          {
            id: "w7-b-fix",
            label:
              "The rule conflict was corrected without broadening access or altering protected baseline rules.",
            correctSectionId: "changed",
            statementFragment:
              "The rule conflict was corrected without broadening access or altering protected baseline rules.",
            explanation:
              "Only priorities inside the 200–999 student band were changed.",
          },
          {
            id: "w7-b-service",
            label: "The temporary TCP 8080 service was restored.",
            correctSectionId: "changed",
            statementFragment: "The temporary TCP 8080 service was restored.",
            explanation: "Started with the supported lab command, then retested.",
          },
          {
            id: "w7-b-allowed",
            label: "The intended Grid Beacon source was ALLOWED on TCP 8080.",
            correctSectionId: "proves",
            statementFragment:
              "The intended Grid Beacon source was ALLOWED on TCP 8080.",
            explanation: "Positive test result from 10.60.6.4.",
          },
          {
            id: "w7-b-denied",
            label: "The unintended source was DENIED on TCP 8080.",
            correctSectionId: "proves",
            statementFragment: "The unintended source was DENIED on TCP 8080.",
            explanation: "Negative test result from 10.60.6.10.",
          },
          {
            id: "w7-b-pair",
            label:
              "Positive and negative testing together support least privilege for this TCP 8080 access requirement.",
            correctSectionId: "proves",
            statementFragment:
              "Positive and negative testing together support least privilege for this TCP 8080 access requirement.",
            explanation:
              "Deliverable 2: narrow rule plus paired proof, scoped to what was tested.",
          },
          {
            id: "w7-b-broken",
            label: "The firewall was broken.",
            correctSectionId: "rejected",
            statementFragment: "",
            explanation:
              "The firewall enforced the ledger exactly as written. A rule conflict is not a fault.",
          },
          {
            id: "w7-b-network",
            label: "The network caused the outage.",
            correctSectionId: "rejected",
            statementFragment: "",
            explanation:
              "The path was confirmed available before any change was made.",
          },
          {
            id: "w7-b-secure",
            label: "Everything is secure now.",
            correctSectionId: "rejected",
            statementFragment: "",
            explanation:
              "Two tests on one protocol and one port cannot support a claim that broad.",
          },
        ],
        confirm: {
          prompt: "Approve this statement for the operations record?",
          action: "Approve statement",
        },
        completion: {
          headline: "Statement approved.",
          body: "Every line is traceable to something the team gathered or tested, and the three unsupported claims are on the record as rejected.",
          finalLine:
            "CH-8080 closed: rule conflict corrected inside the student band, temporary service restored, access verified by paired positive and negative testing on TCP 8080.",
          banner: "CH-8080 — Operations statement",
        },
      },
      successSummary:
        "A concise, professional statement scoped to the evidence — with the tempting claims explicitly excluded.",
      retryPrompt: "Reset the briefing to rebuild the statement.",
      explanation:
        "A defensible statement separates conditions found, actions taken, and claims proven — and names what it will not claim. 'Everything is secure' is the fastest way to lose a room's trust.",
      instructorNotes: [
        "Ask students to justify each rejected line rather than just placing it.",
        "The final statement is a good template for their own lab write-up.",
      ],
      facilitation: {
        recommendedMinutes: 10,
        onScreen: [
          "Briefing display with four sections, including a rejected section.",
          "Eleven candidate statement lines, three of them unsupported.",
          "Assembled statement building as lines are placed.",
        ],
        openingStatement:
          "You are briefing operations. Everything you say will be read back to you if this incident is reviewed.",
        questionsToAsk: [
          "Which of these lines could you defend with a specific piece of evidence?",
          "Why is 'the firewall was broken' wrong rather than just imprecise?",
          "What is the strongest true statement we can make?",
        ],
        expectedReasoning: [
          "Findings, changes, and proofs are separate categories.",
          "Cause claims we never evidenced are excluded, not softened.",
          "Claims are bounded to TCP 8080 and the two tested sources.",
        ],
        misconceptions: [
          "Rewording 'everything is secure' instead of rejecting it.",
          "Filing 'the service was not listening' under changes rather than findings.",
        ],
        followUpQuestions: [
          "What would you add to this statement if you were given one more test?",
          "Which line would a reviewer challenge first?",
        ],
        processingPause:
          "Before approval, pause 60 seconds and ask the room to read the assembled statement silently.",
        evidenceRevealOrder: ["Scope of the claim"],
        correctAnswer:
          "Found: path available, earlier matching rule blocked traffic, service not listening. Changed: rule conflict corrected inside the student band, service restored. Proves: ALLOWED from 10.60.6.4, DENIED from 10.60.6.10, paired proof of least privilege for TCP 8080. Rejected: firewall broken, network caused it, everything is secure.",
        transition:
          "That closes CH-8080 — and it closes Module 2. Let's see what we have actually built over three weeks.",
      },
      continueLabel: "Close Module 2",
    },

    /* ------------------------------------------ Scene 7 — module close */
    {
      id: "w7-scene-07-module-close",
      title: "Scene 07 — Module 2 Close / Week 8 Bridge",
      objective:
        "Reassemble the Module 2 chain end to end and name the question Module 3 answers.",
      environmentId: "cloud-heights-campus",
      characterState: "ivy-whiteboard",
      bareSurface: true,
      intro: [
        {
          id: "w7s7-l1",
          speaker: "Ivy",
          text: "Week 5 taught us to find it and route it. Week 6 taught us to reach it securely. Week 7 taught us to control it and prove it.",
          characterState: "ivy-point",
        },
        {
          id: "w7s7-l2",
          speaker: "Ivy",
          text: "Put the chain back together in order and it stops looking like separate systems.",
          characterState: "ivy-whiteboard",
        },
      ],
      evidence: [
        {
          id: "w7-ev7-w5",
          label: "Week 5 — Find it & route it",
          value: "Addressing · DNS · Ports · Routing",
          status: "healthy",
        },
        {
          id: "w7-ev7-w6",
          label: "Week 6 — Access it securely",
          value: "VM · Bastion · SSH · Authentication · Troubleshooting",
          status: "healthy",
        },
        {
          id: "w7-ev7-w7",
          label: "Week 7 — Control it & prove it",
          value:
            "Firewall · NSG · Rule priority · Least privilege · Testing · Evidence",
          status: "healthy",
        },
      ],
      interaction: {
        id: "w7-i7-chain",
        kind: "sequence",
        prompt: "Rebuild the Module 2 chain, first link to last.",
        instruction:
          "Select a link, then choose a slot. Order can be changed as often as you like; check the chain when the room agrees.",
        boardTitle: "The Grid → Cloud Heights — one journey",
        steps: [
          {
            id: "w7-c-address",
            label: "ADDRESS",
            detail: "Know what you are trying to reach. Week 5.",
          },
          {
            id: "w7-c-network",
            label: "NETWORK",
            detail: "Know which network it lives on. Week 5.",
          },
          {
            id: "w7-c-path",
            label: "PATH",
            detail: "Know the traffic can get there. Week 5.",
          },
          {
            id: "w7-c-boundary",
            label: "SECURITY BOUNDARY",
            detail: "Know where the decision is enforced. Week 7.",
          },
          {
            id: "w7-c-permission",
            label: "PERMISSION",
            detail: "Know whether it is allowed. Week 7.",
          },
          {
            id: "w7-c-access",
            label: "SECURE ACCESS",
            detail: "Know who is connecting, and how. Week 6.",
          },
          {
            id: "w7-c-evidence",
            label: "EVIDENCE",
            detail: "Prove it, positively and negatively. Week 7.",
          },
        ],
        correctOrder: [
          "w7-c-address",
          "w7-c-network",
          "w7-c-path",
          "w7-c-boundary",
          "w7-c-permission",
          "w7-c-access",
          "w7-c-evidence",
        ],
        challenges: {
          "w7-c-boundary":
            "Can a boundary decide anything before we know the address and the path it applies to?",
          "w7-c-permission":
            "Permission is decided at a boundary. Which one has to exist first?",
          "w7-c-evidence":
            "Evidence proves the links before it. What is left to prove if it comes first?",
          "w7-c-access":
            "Secure access assumes the traffic is already permitted to arrive. What comes before it?",
          "*": "Walk it as a sentence: where is it, how do we get there, who decides, what is allowed, how do we connect, what can we prove?",
        },
        completion: {
          headline: "ADDRESS → NETWORK → PATH → SECURITY BOUNDARY → PERMISSION → SECURE ACCESS → EVIDENCE",
          body: "Three weeks of separate-looking systems, and one continuous infrastructure-security journey from The Grid to Cloud Heights.",
        },
        transitionMessage: {
          from: "Cloud Heights Guard Post",
          subject: "NEXT: MODULE 3 — PRACTICAL CRYPTOGRAPHY",
          body: "If we can find the destination, build the path, control access, authenticate the user, and prove the connection… what protects the information itself? Bring your speculation to Week 8.",
        },
      },
      successSummary:
        "The chain is complete and the closing question is open — speculation welcome, answers next module.",
      retryPrompt: "Reset the board to rebuild the chain with another group.",
      explanation:
        "Each week added one link. Addressing and routing find and reach the destination; boundaries and permission decide whether the traffic should arrive; secure access identifies who is connecting; evidence is what makes any of it defensible.",
      instructorNotes: [
        "Let the closing question stay open. Do not teach cryptography in this session.",
        "Speculation is welcome and explicitly not graded.",
      ],
      facilitation: {
        recommendedMinutes: 10,
        onScreen: [
          "Week 5 / Week 6 / Week 7 capability stack in the field notes.",
          "Seven-link chain board to reassemble.",
          "Module 3 handoff message after the chain is checked.",
        ],
        openingStatement:
          "Three weeks ago none of this was connected. Let's see whether it is one system now.",
        questionsToAsk: [
          "Which link has to come first, and why?",
          "Where in this chain did tonight's incident actually live?",
          "If we can find it, reach it, control it, authenticate it and prove it — what protects the information itself?",
        ],
        expectedReasoning: [
          "Addressing and routing precede any security decision.",
          "The boundary must exist before permission can be decided at it.",
          "Evidence is last because it proves everything before it.",
        ],
        misconceptions: [
          "Placing EVIDENCE early, as if proof were a setup step.",
          "Treating SECURE ACCESS as interchangeable with PERMISSION.",
        ],
        followUpQuestions: [
          "Which link would you be least comfortable explaining in an interview?",
          "What would you want to protect even after all seven links are working?",
        ],
        processingPause:
          "After the chain is confirmed, pause 60 seconds before revealing the Module 3 handoff. Let the closing question sit unanswered.",
        evidenceRevealOrder: [
          "Week 5 capabilities",
          "Week 6 capabilities",
          "Week 7 capabilities",
        ],
        correctAnswer:
          "ADDRESS → NETWORK → PATH → SECURITY BOUNDARY → PERMISSION → SECURE ACCESS → EVIDENCE. Then reveal only: NEXT: MODULE 3 — PRACTICAL CRYPTOGRAPHY.",
        transition:
          "Close the session here. Module 3 opens the cryptography question — do not answer it tonight.",
      },
      continueLabel: "End of mission",
    },
  ],
};
