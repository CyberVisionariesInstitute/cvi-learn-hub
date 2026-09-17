import type { Experience } from "../types";
import { trustAuthorityVisuals } from "./trust-authority-visuals";

/**
 * CyberFoundations Module 3 · Week 9 — The Trust Authority.
 *
 * Ivy protected the incident report in Week 8. Now she has to send it to the
 * intended Vault Exchange service, and the service presents a certificate.
 *
 * Everything on screen is authored teaching content: reserved `.example`
 * names, clearly fictional teaching certificates, and a fixed scenario clock.
 * No TLS handshake is performed, no OpenSSL command is executed, and no real
 * certificate is parsed or validated.
 */

/** The single fixed clock every validity judgement is made against. */
export const REFERENCE_TIME = "14 March 2026, 09:00 UTC";

const MODEL_NOTE =
  "Conceptual model. Certificates, chains and warnings below are written for teaching using reserved .example names and a fixed scenario clock. Nothing is parsed, fetched or verified live.";

const CLOCK_NOTE = `Scenario clock: ${REFERENCE_TIME}. Judge every date against this time, not against today.`;

const TERMS = [
  {
    term: "Certificate",
    meaning:
      "A file a service shows you that says “I am this name”, signed by someone else who vouches for it.",
  },
  {
    term: "Subject Alternative Name (SAN)",
    meaning:
      "The list of names the certificate is actually for. This is the list the client checks.",
  },
  {
    term: "Issuer",
    meaning: "The authority whose name is written on the certificate as the signer.",
  },
  {
    term: "Trust anchor (root)",
    meaning:
      "A certificate the client has been configured to believe. Trust is a client setting, not something the certificate can claim for itself.",
  },
];

export const trustAuthority: Experience = {
  id: "cf-w9-trust-authority",
  slug: "trust-authority",
  programId: "cyberfoundations",
  moduleId: "cf-module-3",
  weekId: "cf-week-09",
  type: "interactive-scenario",
  status: "available",
  title: "The Trust Authority",
  subtitle: "Can Ivy trust this connection?",
  description:
    "Ivy protected the incident report last week. Now she has to send it to the real Vault Exchange service — and the service hands her a certificate. Four stations: read the badge, follow the chain, investigate the warning, make the decision. No timers, no penalties, nothing graded.",
  objectives: [
    "Find the intended hostname, the Subject Alternative Name list, the issuer and the validity interval on a certificate.",
    "Arrange a certificate chain and explain why a root signing itself does not make it trusted.",
    "Tell a hostname mismatch, an expired certificate and a missing intermediate apart from the evidence on screen.",
    "State in plain language what a passing certificate check does — and does not — prove.",
  ],
  estimatedMinutes: 34,
  characterIds: ["ivy-vault"],
  environmentIds: ["vault-exchange-workbench"],
  replayAvailable: true,
  route: "/cyberfoundations/week-09/trust-authority",
  thumbnail: trustAuthorityVisuals.browserThumbnail,
  instructorNotes: [
    `Every validity judgement uses the fixed scenario clock (${REFERENCE_TIME}). If a student says “but it depends on today”, agree — and point at the clock banner.`,
    "Facilitation option: before pressing any reveal button, ask the room to predict the outcome out loud or in chat. Predictions are never scored or collected.",
    "Reading the issuer name is not verifying the signature. Say that sentence at least twice; it is the single biggest Week 9 misconception.",
    "Never demonstrate clicking through a warning or installing an unverified root, even as a joke. The station deliberately offers those options and explains why they are unsafe.",
    "All certificates use reserved .example names and are clearly fictional teaching material. Nothing here is a live check.",
  ],
  runOfShow: [
    {
      order: 1,
      title: "Opening brief",
      minutes: 2,
      focus: "Week 8 → Week 9 handoff: protected, but sent where?",
    },
    {
      order: 2,
      title: "Station 1 — Inspect the badge",
      minutes: 7,
      focus: "Hostname, SAN, issuer, validity against a fixed clock",
    },
    {
      order: 3,
      title: "Station 2 — Follow the trust chain",
      minutes: 8,
      focus: "Leaf → intermediate → root, and the client's trust decision",
    },
    {
      order: 4,
      title: "Station 3 — Investigate the warning",
      minutes: 10,
      focus: "Mismatch, expiry and missing intermediate as distinct failures",
    },
    {
      order: 5,
      title: "Station 4 — Make the decision",
      minutes: 6,
      focus: "Pass and fail cases, supporting evidence, and the limits",
    },
    {
      order: 6,
      title: "Close",
      minutes: 1,
      focus: "Plain-language recap students can reuse in the Week 9 labs",
    },
  ],
  scenes: [
    /* ------------------------------------------------ Scene 1 — Brief */
    {
      id: "ta-brief",
      title: "Opening brief — the destination question",
      objective:
        "Ivy protected the report. Now: is this the destination she meant to reach?",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-briefing",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.openingBriefing,
      continueLabel: "Go to Station 1",
      missionBrief: {
        situation:
          "Ivy encrypted and signed the incident report last week. This morning she opens a connection to the Vault Exchange service to send it, and the service immediately hands her a certificate instead of just accepting the file.",
        mission:
          "Work out which new question Week 9 answers, and which question it does not.",
        evidence: [
          "Week 8's question: “Can someone read or change this report?” — that is about the data.",
          "Week 9's question: “Am I actually talking to the service I meant to reach?” — that is about the destination.",
          `The scenario clock shown on every station: ${REFERENCE_TIME}.`,
        ],
        decision:
          "Why does protecting the report not tell Ivy whether it is safe to send?",
        lookingFor:
          "Encryption and signatures protect the file. They say nothing about who is on the other end of the connection. Checking the destination is a separate question, and the certificate is the evidence used to answer it.",
        completeWhen:
          "You can say in one sentence what the certificate is being used to check, and you are ready to read one.",
      },
      instructorAnswerGuide: {
        sayThis:
          "Last week we made the report unreadable to strangers and provable to friends. Today we ask something different: the report is protected, but who exactly are we about to hand it to?",
        predictionPrompt:
          "Before you continue: predict out loud or in chat what a certificate could possibly prove about a destination.",
        actionSequence: [
          "Read the two questions on screen with the room.",
          "Point at the scenario clock banner and explain that every date today is judged against it.",
          "Ask one person to state the Week 9 question in their own words, then press Continue.",
        ],
        expectedAnswer: [
          {
            text: "Protecting the report keeps the contents safe, but it does not tell Ivy who is on the other end; the certificate is the evidence used to check that the destination is the intended one.",
          },
        ],
        whyCorrect:
          "Confidentiality and integrity are properties of the data. Identity of the endpoint is a separate property, and it is established by checking a certificate against the name requested, the time, and the client's own trust configuration.",
        expectedEvidence: [
          "The two side-by-side questions: the data question and the destination question.",
          `The fixed scenario clock banner reading ${REFERENCE_TIME}.`,
        ],
        misconceptions: [
          {
            wrong: "If the file is encrypted, it is safe to send anywhere.",
            correction:
              "Sending an encrypted file to the wrong party still hands it over. Encryption protects the contents in transit; it does not choose the recipient.",
          },
          {
            wrong: "The padlock means the site is the real company.",
            correction:
              "It means the checks we are about to learn passed for the name typed in the address bar. Anyone can obtain a certificate for a name they control.",
          },
        ],
        followUp: {
          question:
            "If Ivy sent the protected report to an impostor, what would the impostor have?",
          desiredResponse:
            "A copy of the file — and if they are the intended recipient's impersonator, possibly the ability to read it once decrypted for them.",
        },
        boundary:
          "Nothing in this brief proves any destination is genuine. It only separates the data question from the destination question.",
        readyToAdvance: [
          "The room can state the Week 9 question in plain language.",
          "Everyone has noticed the fixed scenario clock.",
        ],
      },
      intro: [
        {
          id: "ta-brief-1",
          speaker: "Ivy",
          text: "Last week I locked the report and signed it. Good. Today I have to actually send it — and the moment I connect, the other side shows me a certificate.",
          characterState: "ivy-briefing",
        },
        {
          id: "ta-brief-2",
          speaker: "Ivy",
          text: "Think of a certificate like an ID badge held up at a door. Before I hand over anything, I want to read the badge properly: whose name is on it, who issued it, and whether it is still in date.",
        },
        {
          id: "ta-brief-3",
          speaker: "Ivy",
          text: "Four stations. Read the badge, follow the chain, investigate the warning, then decide. Nothing is timed, nothing is graded, and you can reset any station.",
        },
      ],
      explanation:
        "Week 8 protected the information. Week 9 checks the destination. Both are needed: a perfectly encrypted file sent to the wrong service is still a disclosure.",
      instructorNotes: [
        "Open with: “The report is safe. Should we press send?” Let the room sit with it for a moment.",
      ],
      facilitation: {
        recommendedMinutes: 2,
        onScreen: [
          "Opening brief panel with the data question and the destination question",
          "Fixed scenario clock banner",
        ],
        openingStatement:
          "Ivy's report is protected. Before she sends it, she has one more question to answer — and it is not about the file.",
        questionsToAsk: [
          "What would it cost us to send this to the wrong Vault Exchange?",
          "What could a certificate possibly prove about the other end?",
        ],
        expectedReasoning: [
          "Encryption protects contents, not choice of recipient.",
          "A certificate is a claim about identity that someone else has signed.",
        ],
        misconceptions: [
          "“Encrypted means safe to send anywhere.”",
          "“The padlock means the company is legitimate.”",
        ],
        followUpQuestions: [
          "Who decides whether the badge issuer is believable?",
        ],
        processingPause:
          "Pause for a slow count of ten after asking the destination question. Do not fill the silence.",
        evidenceRevealOrder: [
          "Data question",
          "Destination question",
          "Scenario clock",
        ],
        correctAnswer:
          "Protection is about the report; the certificate check is about the destination. Both are required before sending.",
        transition:
          "Move to Station 1 and read one certificate properly, field by field.",
      },
    },

    /* ------------------------------------- Scene 2 — Inspect the badge */
    {
      id: "ta-inspect",
      title: "Station 1 — Inspect the badge",
      objective:
        "Find the intended hostname, the SAN list, the issuer and the validity interval.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-read-screen",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.inspectPrimary,
      continueLabel: "Go to Station 2",
      missionBrief: {
        situation:
          "Ivy typed vault-exchange.example into her client. The service answered with a certificate, and her client is showing her the fields.",
        mission:
          "Read the certificate the way a guard reads an ID badge, and decide whether the name, the dates and the issuer line up with what Ivy asked for.",
        steps: [
          "Open each of the five certificate field cards, one at a time.",
          "Compare the Subject Alternative Name list with the hostname Ivy requested.",
          `Compare the validity interval with the scenario clock (${REFERENCE_TIME}).`,
          "Read the Issuer field and note the name written there.",
          "Answer the three questions under the certificate.",
        ],
        evidence: [
          "Subject CN and the Subject Alternative Name (SAN) list.",
          "Requested hostname: vault-exchange.example.",
          `Validity: “Not before” and “Not after”, compared with ${REFERENCE_TIME}.`,
          "Issuer: the name printed on the certificate as the signer.",
        ],
        decision:
          "Do the name and the dates match what Ivy asked for — and has anything about the issuer actually been verified yet?",
        lookingFor:
          "The SAN list contains the requested hostname and the scenario clock falls inside the validity interval, so the name and date checks pass. Reading the issuer's name is not the same as verifying the signature or the trust path — that comes at Station 2.",
        completeWhen:
          "All five field cards have been opened and all three questions are answered correctly.",
      },
      instructorAnswerGuide: {
        sayThis:
          "A badge tells you a name, who printed it, and when it stops being valid. A certificate does the same three things. Let's read all three before we believe any of them.",
        predictionPrompt:
          "Before opening the SAN card, ask: “Which field do you think the client actually checks the hostname against?” Take predictions, then open it.",
        actionSequence: [
          "Open all five field cards in order: Subject, SAN, Issuer, Validity, Fingerprint.",
          "Say the requested hostname aloud and find it in the SAN list.",
          "Read the validity interval against the scenario clock banner.",
          "Answer question 1 (which field is checked), question 2 (is it in date), question 3 (has the issuer been verified).",
        ],
        expectedAnswer: [
          {
            label: "Name",
            text: "The client checks the requested hostname against the Subject Alternative Name list, and vault-exchange.example appears there, so the name check passes.",
          },
          {
            label: "Date",
            text: `The scenario clock ${REFERENCE_TIME} falls between 12 January 2026 and 12 July 2026, so the certificate is inside its validity interval.`,
          },
          {
            label: "Issuer",
            text: "We have read the issuer's name, which is only a claim printed on the certificate; nothing has verified that signature or the path to a trusted root yet.",
          },
        ],
        whyCorrect:
          "Modern clients match hostnames against the SAN list, not the Subject Common Name, and validity is an interval comparison against a clock. The Issuer field is unverified text until a signature check builds a path to a trust anchor.",
        expectedEvidence: [
          "SAN card listing vault-exchange.example and www.vault-exchange.example.",
          "Validity card showing 12 January 2026 to 12 July 2026.",
          "Issuer card reading CVI Teaching Intermediate CA G2.",
          "Clock banner fixed at the scenario time.",
        ],
        misconceptions: [
          {
            wrong: "The hostname is checked against the Subject CN.",
            correction:
              "The SAN list is what clients check. CN is legacy text kept for display; a certificate can be valid for names that never appear in CN.",
          },
          {
            wrong: "It says it was issued by a CA, so the CA issued it.",
            correction:
              "That line is just text on the file. Anyone can type a name there. Only a signature check against a trusted path shows whether the claim holds.",
          },
          {
            wrong: "It is not expired because my computer says today's date is fine.",
            correction:
              "Validity is judged against a clock, and today we use the fixed scenario clock on screen so everyone reaches the same answer.",
          },
        ],
        followUp: {
          question:
            "If the SAN list said vault-archive.example instead, what would change?",
          desiredResponse:
            "The name check would fail — the client asked for vault-exchange.example, and a certificate for a different name does not cover it.",
        },
        boundary:
          "Reading fields proves nothing about authenticity. The badge could be a perfectly formatted forgery; Station 1 only establishes what it claims.",
        readyToAdvance: [
          "Every field card has been opened.",
          "Students say “SAN” rather than “CN” when asked what the hostname is matched against.",
          "The room agrees that the issuer name has been read, not verified.",
        ],
      },
      intro: [
        {
          id: "ta-inspect-1",
          speaker: "Ivy",
          text: "Here is the badge. Before I believe any of it, I want to read three things: whose name is on it, who says so, and whether it is still in date.",
          characterState: "ivy-read-screen",
        },
        {
          id: "ta-inspect-2",
          speaker: "Ivy",
          text: "The analogy has a limit, though. I can read a badge without checking whether the badge office really printed it. Reading and verifying are two different jobs.",
        },
      ],
      interaction: {
        id: "ta-inspect",
        kind: "trust-authority",
        prompt: "Read the certificate the Vault Exchange presented",
        instruction:
          "Open each field card, then answer the three questions. Nothing is scored; you can reset this station at any time.",
        stationLabel: "Station 1 of 4 — Inspect the badge",
        modelNote: MODEL_NOTE,
        boundary:
          "Reading fields shows what the certificate claims. It does not verify the signature, the issuer, or the trust path — that is Station 2.",
        referenceTime: CLOCK_NOTE,
        terms: TERMS,
        completion: {
          headline: "Name and date checks pass — issuer still unverified",
          body: "vault-exchange.example is in the SAN list and the scenario clock sits inside the validity interval. The issuer line has been read, not verified.",
        },
        station: {
          kind: "inspect",
          referenceTime: REFERENCE_TIME,
          requestedHostname: "vault-exchange.example",
          analogy: {
            headline: "A certificate is like an ID badge held up at the door",
            body: "It shows a name, the office that issued it, and the dates it is good for. You read it before you let anyone in.",
            limits: [
              "You can read a badge perfectly and still not know whether it is genuine.",
              "A convincing badge can be made by someone who is not the badge office.",
              "Believing the badge office is a decision you made in advance — it is not written on the badge.",
            ],
          },
          certificateTitle:
            "Teaching certificate (fictional) — presented by the Vault Exchange service",
          fields: [
            {
              id: "subject",
              label: "Subject (CN)",
              value: "CN = vault-exchange.example",
              detail:
                "The display name of the service. Modern clients do not use this for hostname matching; it is kept for human readability.",
            },
            {
              id: "san",
              label: "Subject Alternative Name (SAN)",
              value:
                "DNS: vault-exchange.example, DNS: www.vault-exchange.example",
              detail:
                "This is the list the client checks the requested hostname against. Ivy asked for vault-exchange.example, which appears here, so the name check passes.",
            },
            {
              id: "issuer",
              label: "Issuer",
              value: "CN = CVI Teaching Intermediate CA G2",
              detail:
                "The name written on the certificate as the signer. Reading this name is not verifying the signature — it is text until a path to a trusted root is checked.",
            },
            {
              id: "validity",
              label: "Validity",
              value: "Not before: 12 Jan 2026 00:00 UTC · Not after: 12 Jul 2026 23:59 UTC",
              detail: `Compared with the scenario clock of ${REFERENCE_TIME}, the certificate is inside its validity interval.`,
            },
            {
              id: "fingerprint",
              label: "Fingerprint (SHA-256, illustrative)",
              value: "3F:AA:19:74:6C:02:E8:B1:55:9D:… (teaching value)",
              detail:
                "A short identifier for this exact file, written for the lesson. Useful for saying “the same certificate”; it does not prove the certificate is trustworthy.",
            },
          ],
          questions: [
            {
              id: "field",
              prompt:
                "Which field does the client compare the requested hostname against?",
              options: [
                {
                  id: "san",
                  label: "The Subject Alternative Name (SAN) list",
                  correct: true,
                  response:
                    "Yes. The SAN list is the authoritative list of names this certificate is for, and vault-exchange.example is on it.",
                },
                {
                  id: "cn",
                  label: "The Subject Common Name (CN)",
                  correct: false,
                  response:
                    "That was the old way, and it is a very common answer. Today clients read the SAN list; CN is kept for display.",
                },
                {
                  id: "issuer",
                  label: "The Issuer name",
                  correct: false,
                  response:
                    "The issuer says who signed it, not which site it is for. Try the field that lists names.",
                },
              ],
            },
            {
              id: "date",
              prompt: `Against the scenario clock of ${REFERENCE_TIME}, is this certificate in date?`,
              options: [
                {
                  id: "in-date",
                  label: "Yes — the clock falls inside the validity interval",
                  correct: true,
                  response:
                    "Correct. 14 March 2026 sits between 12 January 2026 and 12 July 2026.",
                },
                {
                  id: "expired",
                  label: "No — it has expired",
                  correct: false,
                  response:
                    "Check the two validity dates against the clock banner rather than today's real date; the scenario clock is earlier than “not after”.",
                },
                {
                  id: "depends",
                  label: "It depends on what today's date is",
                  correct: false,
                  response:
                    "Good instinct in real life, and exactly why this lesson fixes the clock. Use the banner time so the whole room reaches the same answer.",
                },
              ],
            },
            {
              id: "issuer-check",
              prompt: "What has the Issuer field established so far?",
              options: [
                {
                  id: "claim",
                  label:
                    "Only the name claimed as the signer — nothing has been verified yet",
                  correct: true,
                  response:
                    "Exactly. Reading the issuer is not verifying the signature or the trust path. That work happens at Station 2.",
                },
                {
                  id: "verified",
                  label: "That a real certificate authority issued this certificate",
                  correct: false,
                  response:
                    "Not yet. That text can say anything; a signature check against a trusted path is what would support the claim.",
                },
                {
                  id: "trusted",
                  label: "That Ivy's client trusts this authority",
                  correct: false,
                  response:
                    "Trust is a setting inside Ivy's client, not a statement on the certificate. We look at her trust store next.",
                },
              ],
            },
          ],
        },
      },
      evidence: [
        {
          id: "ta-requested",
          label: "Hostname requested by Ivy",
          value: "vault-exchange.example",
        },
        {
          id: "ta-clock",
          label: "Scenario clock",
          value: REFERENCE_TIME,
          note: "Fixed for the whole session so every answer is comparable.",
        },
      ],
      successSummary:
        "Name check: passes. Date check: passes against the scenario clock. Issuer: read, not verified.",
      retryPrompt:
        "Want to read it again? Reset this scene and open the cards in any order.",
      explanation:
        "The badge analogy gets you started: a name, an office, and an expiry. It stops working the moment you ask whether the badge is genuine — reading a name is never the same as checking a signature.",
      instructorNotes: [
        "If someone answers “CN”, thank them: it was the correct answer for years. Then show the SAN card.",
      ],
      facilitation: {
        recommendedMinutes: 7,
        onScreen: [
          "Five certificate field cards",
          "Requested hostname and the fixed clock banner",
          "Three inspection questions",
        ],
        openingStatement:
          "Let's read this badge properly — name, office, dates — and keep track of which of those we have actually checked.",
        questionsToAsk: [
          "Which name did Ivy ask for, and where is that name on this certificate?",
          "What does “not after” mean against our scenario clock?",
          "Have we verified anything yet, or only read it?",
        ],
        expectedReasoning: [
          "The hostname is matched against the SAN list.",
          "Validity is an interval containing the reference time.",
          "The issuer line is an unverified claim.",
        ],
        misconceptions: [
          "“CN is the hostname check.”",
          "“It says CA, so a CA signed it.”",
        ],
        followUpQuestions: [
          "If the SAN said vault-archive.example, which check would fail?",
        ],
        processingPause:
          "After the issuer question, pause and let the room sit with “read, not verified” for a slow count of ten.",
        evidenceRevealOrder: ["Subject", "SAN", "Issuer", "Validity", "Fingerprint"],
        correctAnswer:
          "Name passes via SAN, date passes against the fixed clock, issuer is an unverified claim.",
        transition:
          "We have a claim about who signed it. Station 2 asks whether that signature leads anywhere the client believes.",
      },
    },

    /* ----------------------------------- Scene 3 — Follow the chain */
    {
      id: "ta-chain",
      title: "Station 2 — Follow the trust chain",
      objective:
        "Arrange leaf → intermediate → root, and separate signing from the client's trust decision.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-whiteboard",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.chainPrimary,
      continueLabel: "Go to Station 3",
      missionBrief: {
        situation:
          "The certificate says it was signed by CVI Teaching Intermediate CA G2. Ivy wants to see where that signature leads before she believes it.",
        mission:
          "Build the chain from the website certificate up to a trust anchor, then see what happens when the client's trust store changes.",
        steps: [
          "Place the website (leaf) certificate in the top slot.",
          "Place the certificate that signed it in the middle slot.",
          "Place the certificate that signed the intermediate in the bottom slot.",
          "Switch the client's trust store to “lesson root trusted” and read the verdict.",
          "Switch it to “lesson root absent” and read the verdict again.",
          "Answer the question about what actually changed.",
        ],
        evidence: [
          "Each certificate's Subject and Issuer lines — the Issuer of one matches the Subject of the next one up.",
          "The verdict panel with the lesson root present in the client's trust store.",
          "The verdict panel with the same chain and the lesson root absent.",
        ],
        decision:
          "The chain did not change between the two runs. Why did the result change?",
        lookingFor:
          "Signing links the certificates together; trusting is a separate decision made by the client's configuration. A root signing itself proves nothing — it only becomes an anchor because the client was configured to accept it.",
        completeWhen:
          "The three certificates are in the correct order, both trust-store settings have been viewed, and the question is answered correctly.",
      },
      instructorAnswerGuide: {
        sayThis:
          "Each certificate points at whoever signed it, like a chain of “ask my manager”. Follow it up until you reach someone your computer was already told to believe — or until you run out of people.",
        predictionPrompt:
          "Before switching the trust store off, ask the room to predict the verdict. Most will say the chain breaks; ask them which part of it breaks.",
        actionSequence: [
          "Read the Subject and Issuer of all three certificates aloud.",
          "Place leaf, then intermediate, then root, matching Issuer to Subject.",
          "Press the trusted setting and read the verdict.",
          "Press the untrusted setting and read the verdict.",
          "Answer the “what changed” question.",
        ],
        expectedAnswer: [
          {
            label: "Order",
            text: "The website certificate for vault-exchange.example is signed by CVI Teaching Intermediate CA G2, which is signed by CVI Teaching Root CA R1.",
          },
          {
            label: "Trust",
            text: "The chain was identical in both runs; only the client's trust store changed, and trust in the root is what turned the same chain into an accepted path.",
          },
        ],
        whyCorrect:
          "Path building follows Issuer-to-Subject links, but path validation requires terminating at an anchor the client has been configured to trust. A self-signature is a mathematical property of the root, not a grant of trust.",
        expectedEvidence: [
          "Leaf Issuer = Intermediate Subject; Intermediate Issuer = Root Subject.",
          "Trusted verdict: the path terminates at a configured anchor and is accepted.",
          "Untrusted verdict: the same path is complete but ends at an unknown authority and is rejected.",
        ],
        misconceptions: [
          {
            wrong: "The root signs itself, so it is trusted.",
            correction:
              "Self-signing only means the root vouched for its own name. Trust exists because your operating system or browser was configured to include it.",
          },
          {
            wrong: "The server should send its root certificate too.",
            correction:
              "The server sends its own certificate and the intermediates. The root must already be in the client's trust store; a root sent by the server would prove nothing.",
          },
          {
            wrong: "A missing intermediate and an untrusted root are the same error.",
            correction:
              "Missing intermediate means the client could not build a complete path. Untrusted root means the path was complete but ended somewhere the client does not believe.",
          },
        ],
        followUp: {
          question:
            "Two learners run the same site; one sees an error and one does not. What is the most likely difference?",
          desiredResponse:
            "Their clients have different trust stores, or one client already cached the intermediate the server failed to send.",
        },
        boundary:
          "A validated path shows the chain leads to a configured anchor. It does not show the operator is honest or that the anchor's issuing practices are good.",
        readyToAdvance: [
          "The three certificates are ordered correctly.",
          "Both trust-store verdicts have been read aloud.",
          "Students can state that signing and trusting are different things.",
        ],
      },
      intro: [
        {
          id: "ta-chain-1",
          speaker: "Ivy",
          text: "The badge says the badge office signed it. Fine — which badge office, and does my client actually believe that office?",
          characterState: "ivy-whiteboard",
        },
        {
          id: "ta-chain-2",
          speaker: "Ivy",
          text: "Each certificate names whoever signed it. Follow those names upwards until you reach one my client was configured to trust. If you never reach one, the chain leads nowhere useful.",
        },
      ],
      interaction: {
        id: "ta-chain",
        kind: "trust-authority",
        prompt: "Build the chain, then change the client's trust store",
        instruction:
          "Select a certificate, then place it in a slot. Match each Issuer line to the Subject line of the certificate above it in authority.",
        stationLabel: "Station 2 of 4 — Follow the trust chain",
        modelNote: MODEL_NOTE,
        boundary:
          "A complete, trusted path shows the chain ends where the client was told to believe. It does not show the service is run honestly.",
        referenceTime: CLOCK_NOTE,
        terms: TERMS,
        completion: {
          headline: "Same chain, two different outcomes",
          body: "Signing links certificates together. Trusting is a decision your client made in advance — change it, and the identical chain is no longer accepted.",
        },
        station: {
          kind: "chain",
          certificates: [
            {
              id: "root",
              label: "CVI Teaching Root CA R1",
              subject: "CN = CVI Teaching Root CA R1",
              issuer: "CN = CVI Teaching Root CA R1 (self-signed)",
              detail:
                "A fictional teaching root. It signed its own certificate, which is normal for roots and proves nothing about trust.",
            },
            {
              id: "leaf",
              label: "vault-exchange.example (website certificate)",
              subject: "CN = vault-exchange.example",
              issuer: "CN = CVI Teaching Intermediate CA G2",
              detail:
                "Also called the leaf or end-entity certificate. This is the one the service presented to Ivy.",
            },
            {
              id: "intermediate",
              label: "CVI Teaching Intermediate CA G2",
              subject: "CN = CVI Teaching Intermediate CA G2",
              issuer: "CN = CVI Teaching Root CA R1",
              detail:
                "The working authority that signs day-to-day certificates. Servers are expected to send this alongside their own certificate.",
            },
          ],
          slots: [
            {
              id: "slot-leaf",
              label: "1. The certificate the website presented",
              hint: "The one with vault-exchange.example as its subject.",
            },
            {
              id: "slot-intermediate",
              label: "2. The certificate that signed it",
              hint: "Its Subject must match the Issuer line above it.",
            },
            {
              id: "slot-root",
              label: "3. The certificate that signed the intermediate",
              hint: "The end of the path — and only useful if the client trusts it.",
            },
          ],
          correctOrder: ["leaf", "intermediate", "root"],
          signingNote:
            "“Signed by” is a link between two certificates. “Trusted by” is a setting inside the client. They are different statements, and only the second one is a decision.",
          selfSignedNote:
            "The root signed its own certificate. That is normal and expected — and it is not what makes it trusted. Anyone can self-sign a certificate naming themselves an authority.",
          deliveryNote:
            "The server sends its own certificate plus any intermediates. It is not expected to send the root: a root supplied by the server would be vouching for itself.",
          trustStore: {
            label: "Ivy's client trust store",
            trustedLabel: "CVI Teaching Root CA R1 is installed and trusted",
            untrustedLabel: "CVI Teaching Root CA R1 is not in the trust store",
            trusted: {
              verdict: "Path accepted — ends at a configured trust anchor",
              body: "The client built leaf → intermediate → root and found the root in its own trusted list. The path terminates somewhere the client was configured to believe, so the chain check passes.",
            },
            untrusted: {
              verdict: "Path rejected — ends at an unknown authority",
              body: "Exactly the same three certificates, still correctly signed one by the next. The client simply does not have this root in its trusted list, so the path leads to a stranger. This is not a missing certificate; it is a missing trust decision.",
            },
            question: {
              prompt:
                "The certificates did not change between the two runs. What changed?",
              options: [
                {
                  id: "trust",
                  label:
                    "The client's trust configuration — whether the root is in its trusted list",
                  correct: true,
                  response:
                    "Right. Signing built the path; trusting the anchor is what made the path acceptable.",
                },
                {
                  id: "signature",
                  label: "The signatures stopped being valid",
                  correct: false,
                  response:
                    "The signatures were fine in both runs. Look again at which panel changed: the trust store, not the certificates.",
                },
                {
                  id: "server",
                  label: "The server stopped sending the root certificate",
                  correct: false,
                  response:
                    "Servers are not expected to send their root at all. The root has to be in the client's trust store to mean anything.",
                },
              ],
            },
          },
          distinctFailures: [
            {
              label: "Missing intermediate",
              detail:
                "The client cannot build a complete path: the link between the website certificate and the root is absent. Nothing has been rejected on trust grounds — there is simply no path yet.",
            },
            {
              label: "Untrusted root",
              detail:
                "The client built a complete path, but the anchor at the end is not in its trusted list. The path exists and is rejected anyway.",
            },
          ],
        },
      },
      evidence: [
        {
          id: "ta-chain-links",
          label: "Chain links",
          value:
            "leaf issuer = intermediate subject; intermediate issuer = root subject",
        },
        {
          id: "ta-anchor",
          label: "Trust anchor",
          value: "CVI Teaching Root CA R1",
          note: "Only an anchor when the client is configured to trust it.",
          hiddenUntilRevealed: true,
        },
      ],
      successSummary:
        "Chain ordered correctly, and both trust-store outcomes observed: identical certificates, different results.",
      retryPrompt:
        "Reset this scene to rebuild the chain and try the trust store in the other order.",
      explanation:
        "Path building follows the Issuer-to-Subject links. Path validation also requires ending at an anchor the client was configured to trust. A root's self-signature is expected — and it is not a trust grant.",
      instructorNotes: [
        "If someone insists the server should send the root, ask: “If an impostor sent you their own root, what would that prove?”",
      ],
      facilitation: {
        recommendedMinutes: 8,
        onScreen: [
          "Three certificate cards with Subject and Issuer lines",
          "Three ordered chain slots",
          "Trust store toggle and verdict panel",
        ],
        openingStatement:
          "We have a name claiming to be the signer. Let's follow it upwards and see where it ends.",
        questionsToAsk: [
          "Whose Subject matches this certificate's Issuer?",
          "Why does a self-signed root not settle the question?",
          "What exactly changed between the two verdicts?",
        ],
        expectedReasoning: [
          "Issuer-to-Subject links build the path.",
          "The anchor is trusted because of client configuration.",
          "Missing intermediate ≠ untrusted root.",
        ],
        misconceptions: [
          "“Self-signed means trusted.”",
          "“The server should send the root.”",
        ],
        followUpQuestions: [
          "Why might the same site work on one laptop and fail on another?",
        ],
        processingPause:
          "After switching the root off, hold the silence for a slow ten before asking what changed.",
        evidenceRevealOrder: [
          "Certificate cards",
          "Completed chain",
          "Trusted verdict",
          "Untrusted verdict",
        ],
        correctAnswer:
          "leaf → intermediate → root; only the client's trust configuration changed between runs.",
        transition:
          "Now that the healthy case is clear, Station 3 shows three ways it goes wrong.",
      },
    },

    /* --------------------------------- Scene 4 — Investigate warnings */
    {
      id: "ta-warning",
      title: "Station 3 — Investigate the warning",
      objective:
        "Diagnose a hostname mismatch, an expired certificate and a missing intermediate from their evidence.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-thinking",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.warningPrimary,
      continueLabel: "Go to Station 4",
      missionBrief: {
        situation:
          "Over three different attempts, Ivy's client refuses the connection and shows a warning. Each warning looks similar at a glance and has a completely different cause.",
        mission:
          "Take each case in turn, read the evidence, name the specific problem, and choose a safe next action.",
        steps: [
          "Select Case A, then read the client message and all evidence rows.",
          "Choose the diagnosis you believe is correct.",
          "Choose the next action you would take.",
          "Press “Check my thinking” to reveal the feedback and the explanation.",
          "Repeat for Case B and Case C. Use “Try this case again” to redo any case.",
        ],
        evidence: [
          "Case A: the requested hostname compared with the SAN list.",
          `Case B: the “Not after” date compared with the scenario clock (${REFERENCE_TIME}).`,
          "Case C: how many certificates the server sent, what is in the trust store, and whether any intermediate is cached or fetchable.",
        ],
        decision:
          "For each case: what exactly failed, and what is the safe next step?",
        lookingFor:
          "Case A is a name problem, Case B is a time problem, Case C is an incomplete-path problem caused by server configuration. The safe action is always to stop and fix the cause — never to click through the warning and never to install an unverified root.",
        completeWhen:
          "All three cases have a correct diagnosis and a safe next action.",
      },
      instructorAnswerGuide: {
        sayThis:
          "Three warnings that look almost the same in a browser. Our job is to stop reading the scary box and start reading the evidence underneath it.",
        predictionPrompt:
          "For each case, ask the room to commit to a diagnosis before anyone presses “Check my thinking”. Predictions are never collected or scored.",
        actionSequence: [
          "Select Case A and read every evidence row aloud.",
          "Take a diagnosis and an action from the room, then press “Check my thinking”.",
          "Repeat for Case B and Case C.",
          "Name the three causes side by side before advancing.",
        ],
        expectedAnswer: [
          {
            label: "Case A",
            text: "The certificate is valid but it is for vault-archive.example, not the vault-exchange.example Ivy requested, so the name check fails.",
          },
          {
            label: "Case B",
            text: "The certificate stopped being valid on 1 August 2025, which is before the scenario clock, so the date check fails and it must be renewed.",
          },
          {
            label: "Case C",
            text: "The server sent only its own certificate, no intermediate is cached or fetchable, so the client cannot build a complete path to the root it does trust.",
          },
        ],
        whyCorrect:
          "Each failure is at a different check: name matching, validity interval, and path construction. The remedy therefore differs — correct the destination, renew the certificate, or fix the server's certificate chain configuration.",
        expectedEvidence: [
          "Case A: SAN list containing only vault-archive.example names.",
          "Case B: Not after 1 August 2025 against the scenario clock.",
          "Case C: “Certificates sent by server: 1 (leaf only)”, “Cached intermediates: none”, “Automatic fetch: not available in this client”.",
        ],
        misconceptions: [
          {
            wrong: "It is fine, I will just click through this once.",
            correction:
              "The warning is the check working. Clicking through hands the protected report to whoever is actually on the other end.",
          },
          {
            wrong: "Installing the root from the warning page fixes it.",
            correction:
              "Installing an unverified root tells your computer to believe a stranger for every site, not just this one. Never do it to clear a warning.",
          },
          {
            wrong: "A missing intermediate is the client's fault.",
            correction:
              "It is a server configuration problem. Some clients hide it by caching or fetching the intermediate, which is why it works on one machine and fails on another.",
          },
        ],
        followUp: {
          question:
            "Case C works on your phone but fails on the lab machine. Has the server been fixed?",
          desiredResponse:
            "No — the phone probably had the intermediate cached or fetched it. The server is still sending an incomplete chain.",
        },
        boundary:
          "Diagnosing a warning does not tell you whether the destination is malicious. It tells you which check failed and who has to fix it.",
        readyToAdvance: [
          "All three cases diagnosed correctly with safe actions.",
          "Nobody in the room is offering “click through” as a real option.",
          "Students can state the three causes as name, time, and path.",
        ],
        scenarioGuides: [
          {
            id: "case-hostname",
            title: "Case A — hostname mismatch",
            actionSequence: [
              "Press the “Case A — the name does not look right” tab.",
              "Read the client message, then the “Requested hostname” and “SAN list” rows.",
              "Choose the hostname-mismatch diagnosis.",
              "Choose “Stop and confirm the correct address with the service owner”.",
              "Press “Check my thinking”.",
            ],
            sayThis:
              "The certificate here is perfectly valid — signed properly, in date. It is just not for the address we typed. What does that tell us?",
            expectedAnswer:
              "The certificate is valid and correctly signed, but its SAN list covers vault-archive.example only, so it does not cover the vault-exchange.example address Ivy requested and the name check fails.",
            expectedEvidence: [
              "Requested hostname: vault-exchange.example.",
              "SAN list: vault-archive.example, www.vault-archive.example.",
              "Chain and validity rows both reading as fine.",
            ],
            whyCorrect:
              "Hostname verification compares the requested name with the SAN list. A certificate that is valid for a different name provides no assurance about this destination.",
            misconceptions: [
              {
                wrong: "The names are similar, so it is probably the same company.",
                correction:
                  "Similar names are exactly how impersonation works. The check is an exact match against the SAN list, not a judgement about similarity.",
              },
              {
                wrong: "The certificate is invalid.",
                correction:
                  "It is a valid certificate — for a different name. Precision matters when you report this.",
              },
            ],
            followUp: {
              question: "Who can fix this, and how?",
              desiredResponse:
                "Either Ivy is using the wrong address, or the service needs a certificate that includes this hostname in its SAN list.",
            },
            boundary:
              "A mismatch does not prove an attack. A misconfigured load balancer produces the identical evidence.",
            readyToAdvance: [
              "Students point at the SAN row, not the padlock.",
              "The diagnosis is stated as a name problem.",
            ],
          },
          {
            id: "case-expired",
            title: "Case B — expired certificate",
            actionSequence: [
              "Press the “Case B — the dates look wrong” tab.",
              "Read the “Not after” row and compare it with the clock banner.",
              "Choose the expired diagnosis.",
              "Choose “Stop and ask the service owner to renew the certificate”.",
              "Press “Check my thinking”.",
            ],
            sayThis:
              "Everything about this certificate looks right except one number. Compare the “not after” date to the clock at the top of the screen, not to today.",
            expectedAnswer:
              `The certificate's validity ended on 1 August 2025, which is before the scenario clock of ${REFERENCE_TIME}, so the certificate has expired and the date check fails.`,
            expectedEvidence: [
              "Not before: 1 February 2025; Not after: 1 August 2025.",
              `Scenario clock banner: ${REFERENCE_TIME}.`,
              "Name and chain rows both reading as fine.",
            ],
            whyCorrect:
              "Validity is an interval check against a reference time. Once the reference time is past “not after”, the certificate is out of date regardless of how well it is signed.",
            misconceptions: [
              {
                wrong: "Expired just means old; it still works.",
                correction:
                  "Clients reject it outright. Expiry limits how long a single certificate can be relied on if its key is ever compromised.",
              },
              {
                wrong: "I can fix it by changing my computer's clock.",
                correction:
                  "That disables the check for every site you visit. The certificate has to be renewed by the service owner.",
              },
            ],
            followUp: {
              question:
                "Why do certificates expire at all if the signature is still mathematically fine?",
              desiredResponse:
                "It limits the damage window if a key leaks, and it forces the information in the certificate to be re-checked regularly.",
            },
            boundary:
              "An expiry tells you nothing about whether the service was ever compromised — only that this certificate can no longer be relied on.",
            readyToAdvance: [
              "The room compares dates to the scenario clock, not today.",
              "The remedy named is renewal by the owner.",
            ],
          },
          {
            id: "case-missing-intermediate",
            title: "Case C — missing intermediate",
            actionSequence: [
              "Press the “Case C — the chain stops early” tab.",
              "Read “Certificates sent by server”, “Cached intermediates” and “Automatic fetch”.",
              "Choose the incomplete-path diagnosis.",
              "Choose “Stop and ask the service owner to send the intermediate certificate”.",
              "Press “Check my thinking”.",
            ],
            sayThis:
              "Look carefully: the root we trust is right there in the trust store. The problem is the missing step in the middle, and this client has no cached copy and cannot fetch one.",
            expectedAnswer:
              "The server sent only its own certificate, the client has no cached intermediate and cannot fetch one, so it cannot build a complete path to the root it does trust — this is a server chain configuration problem, not an untrusted root.",
            expectedEvidence: [
              "Certificates sent by server: 1 (leaf only).",
              "Client trust store: CVI Teaching Root CA R1 present and trusted.",
              "Cached intermediates: none. Automatic fetch: not available in this client.",
            ],
            whyCorrect:
              "Path validation needs every link. With the intermediate absent and unobtainable, no path can be built at all, even though the anchor at the top is trusted.",
            misconceptions: [
              {
                wrong: "The root is untrusted.",
                correction:
                  "The trust store row shows the root present and trusted. The break is one level lower down.",
              },
              {
                wrong: "It works in my browser, so the server is fine.",
                correction:
                  "Other clients often cache or fetch the missing intermediate. That hides the fault; it does not fix it.",
              },
              {
                wrong: "Ivy should install the intermediate herself.",
                correction:
                  "Patching one workstation leaves every other client broken. The server should be configured to send the full chain.",
              },
            ],
            followUp: {
              question:
                "Why is “it works on my machine” especially misleading for this failure?",
              desiredResponse:
                "Client behaviour varies: some cache intermediates from earlier visits or fetch them automatically, so the same server looks healthy on one device and broken on another.",
            },
            boundary:
              "This case does not show the root is bad or the site is fake. It shows the server is not sending everything the client needs.",
            readyToAdvance: [
              "Students distinguish this from the untrusted-root case out loud.",
              "The fix is assigned to the server owner.",
            ],
          },
        ],
      },
      intro: [
        {
          id: "ta-warning-1",
          speaker: "Ivy",
          text: "Three attempts, three warnings. They all look the same in the browser — a big box telling me something is wrong. That box is not the evidence.",
          characterState: "ivy-thinking",
        },
        {
          id: "ta-warning-2",
          speaker: "Ivy",
          text: "I never click through these, and I never install a root certificate to make a warning go away. I find out which check failed and who has to fix it.",
        },
      ],
      interaction: {
        id: "ta-warning",
        kind: "trust-authority",
        prompt: "Three warnings, three different causes",
        instruction:
          "Pick a case, read every evidence row, choose a diagnosis and an action, then press “Check my thinking”. You can redo any case.",
        stationLabel: "Station 3 of 4 — Investigate the warning",
        modelNote: MODEL_NOTE,
        boundary:
          "Diagnosing which check failed does not tell you whether the destination is malicious, only what went wrong and who fixes it.",
        referenceTime: CLOCK_NOTE,
        terms: TERMS,
        completion: {
          headline: "Three causes named: name, time, path",
          body: "A mismatch, an expiry and an incomplete chain look alike in a warning box and need completely different fixes.",
        },
        station: {
          kind: "warning",
          revealAction: "Check my thinking",
          resetCaseAction: "Try this case again",
          safetyNote:
            "Safety rule for every case: do not click through a certificate warning, and never install a root certificate you cannot independently verify. A warning is the check doing its job.",
          cases: [
            {
              id: "case-hostname",
              label: "Case A — the name does not look right",
              summary:
                "Ivy connects to vault-exchange.example and the client stops immediately.",
              clientMessage:
                "This server could not prove that it is vault-exchange.example. Its security certificate is for a different name.",
              evidence: [
                { label: "Requested hostname", value: "vault-exchange.example" },
                {
                  label: "Certificate SAN list",
                  value: "vault-archive.example, www.vault-archive.example",
                },
                { label: "Validity", value: "In date against the scenario clock" },
                {
                  label: "Chain",
                  value: "Complete, ends at a trusted root",
                },
              ],
              diagnosis: {
                prompt: "What exactly failed here?",
                options: [
                  {
                    id: "mismatch",
                    label:
                      "Hostname mismatch — the SAN list does not include the requested name",
                    correct: true,
                    response:
                      "Correct. The certificate is valid and properly signed; it is simply for a different name.",
                  },
                  {
                    id: "expired",
                    label: "The certificate has expired",
                    correct: false,
                    response:
                      "Check the validity row — it reads in date against the scenario clock. Look at the two name rows instead.",
                  },
                  {
                    id: "untrusted",
                    label: "The issuing authority is not trusted",
                    correct: false,
                    response:
                      "The chain row says the path is complete and ends at a trusted root. The failing check is the name.",
                  },
                  {
                    id: "broken",
                    label: "The certificate file is corrupt",
                    correct: false,
                    response:
                      "Nothing here indicates corruption. Every field parsed and displayed fine; one of them just does not match.",
                  },
                ],
              },
              action: {
                prompt: "What is the safe next step?",
                options: [
                  {
                    id: "confirm",
                    label:
                      "Stop, and confirm the correct address with the service owner",
                    safe: true,
                    response:
                      "Yes. Either Ivy has the wrong address, or the service needs a certificate covering this hostname.",
                  },
                  {
                    id: "proceed",
                    label: "Continue anyway — the names look similar",
                    safe: false,
                    response:
                      "Similar names are how impersonation works. Continuing would hand the protected report to an unverified destination.",
                  },
                  {
                    id: "ignore-warnings",
                    label: "Turn off certificate warnings for this client",
                    safe: false,
                    response:
                      "That removes the check for every site, not just this one. The warning is the only thing that caught the mismatch.",
                  },
                ],
              },
              explanation:
                "A hostname mismatch means the certificate is not for the address you asked for. It is often a misconfiguration — and it is also exactly what impersonation looks like, which is why the client refuses either way.",
            },
            {
              id: "case-expired",
              label: "Case B — the dates look wrong",
              summary:
                "A second Vault Exchange endpoint answers, and the client refuses on sight.",
              clientMessage:
                "This server's security certificate is not valid at the current time.",
              evidence: [
                { label: "Requested hostname", value: "vault-exchange.example" },
                {
                  label: "Certificate SAN list",
                  value: "vault-exchange.example — matches the request",
                },
                {
                  label: "Validity",
                  value: "Not before 1 Feb 2025 00:00 UTC · Not after 1 Aug 2025 23:59 UTC",
                },
                { label: "Scenario clock", value: REFERENCE_TIME },
                { label: "Chain", value: "Complete, ends at a trusted root" },
              ],
              diagnosis: {
                prompt: "What exactly failed here?",
                options: [
                  {
                    id: "expired",
                    label:
                      "The certificate expired — the scenario clock is after “not after”",
                    correct: true,
                    response:
                      "Correct. Validity ended on 1 August 2025, more than seven months before the scenario clock.",
                  },
                  {
                    id: "notyet",
                    label: "The certificate is not valid yet",
                    correct: false,
                    response:
                      "“Not before” was February 2025, which is already past. The problem is at the other end of the interval.",
                  },
                  {
                    id: "mismatch",
                    label: "Hostname mismatch",
                    correct: false,
                    response:
                      "The SAN row matches the requested name exactly. Compare the dates with the clock banner instead.",
                  },
                  {
                    id: "clock",
                    label: "Ivy's computer clock is wrong",
                    correct: false,
                    response:
                      "A reasonable real-world suspicion, but this lesson fixes the clock deliberately so the answer is unambiguous: the certificate is out of date.",
                  },
                ],
              },
              action: {
                prompt: "What is the safe next step?",
                options: [
                  {
                    id: "renew",
                    label: "Stop, and ask the service owner to renew the certificate",
                    safe: true,
                    response:
                      "Yes. Renewal is the owner's job, and it is usually quick once someone tells them.",
                  },
                  {
                    id: "backdate",
                    label: "Set the workstation clock back to last July",
                    safe: false,
                    response:
                      "That disables date checking for every site on that machine. Never fix a certificate problem by breaking the clock.",
                  },
                  {
                    id: "proceed",
                    label: "Continue anyway — it is only a few months out",
                    safe: false,
                    response:
                      "Expiry exists to limit how long a single certificate can be relied on. “Only a few months” is still outside what anyone has vouched for.",
                  },
                ],
              },
              explanation:
                "Expiry is a deliberate limit on how long one certificate can be relied on. An expired certificate may have been perfectly legitimate yesterday; nobody is vouching for it today.",
            },
            {
              id: "case-missing-intermediate",
              label: "Case C — the chain stops early",
              summary:
                "A third endpoint answers. The name and dates are fine, and the client still cannot proceed.",
              clientMessage:
                "This server's security certificate could not be verified: a required certificate in the chain is missing.",
              evidence: [
                { label: "Requested hostname", value: "vault-exchange.example" },
                {
                  label: "Certificate SAN list",
                  value: "vault-exchange.example — matches the request",
                },
                { label: "Validity", value: "In date against the scenario clock" },
                {
                  label: "Certificates sent by server",
                  value: "1 — the website certificate only",
                },
                {
                  label: "Client trust store",
                  value: "CVI Teaching Root CA R1 — present and trusted",
                },
                { label: "Cached intermediates", value: "None" },
                {
                  label: "Automatic intermediate fetch",
                  value: "Not available in this client",
                },
              ],
              diagnosis: {
                prompt: "What exactly failed here?",
                options: [
                  {
                    id: "missing",
                    label:
                      "Incomplete path — the intermediate is missing and cannot be obtained, so no chain can be built",
                    correct: true,
                    response:
                      "Correct. The root is trusted, but the step between the website certificate and the root is absent, so there is no path at all.",
                  },
                  {
                    id: "untrusted",
                    label: "The root is not trusted by this client",
                    correct: false,
                    response:
                      "Read the trust store row: the root is present and trusted. This is the failure that gets confused with that one.",
                  },
                  {
                    id: "expired",
                    label: "The certificate has expired",
                    correct: false,
                    response:
                      "The validity row reads in date. The gap is in the chain, not the calendar.",
                  },
                  {
                    id: "client",
                    label: "Ivy's client is broken and should be replaced",
                    correct: false,
                    response:
                      "The client is behaving correctly by refusing an unverifiable path. Clients that hide this are being generous, not correct.",
                  },
                ],
              },
              action: {
                prompt: "What is the safe next step?",
                options: [
                  {
                    id: "server",
                    label:
                      "Stop, and ask the service owner to send the intermediate certificate with the chain",
                    safe: true,
                    response:
                      "Yes. Fixing the server fixes it for every client, including the ones that currently hide the fault.",
                  },
                  {
                    id: "install-root",
                    label:
                      "Download and install the intermediate or root from the warning page",
                    safe: false,
                    response:
                      "Never install certificates offered by the very connection you cannot verify — and installing an unverified root affects every site you visit.",
                  },
                  {
                    id: "other-device",
                    label: "Use a device where the site loads without a warning",
                    safe: false,
                    response:
                      "That device probably cached or fetched the intermediate. The server is still misconfigured and the problem is hidden, not solved.",
                  },
                ],
              },
              explanation:
                "Servers are expected to send their own certificate plus the intermediates — not the root. When the intermediate is missing and the client has no cached or fetchable copy, no path exists. Client behaviour varies, which is why this fault appears intermittent across devices.",
            },
          ],
        },
      },
      evidence: [
        {
          id: "ta-safety",
          label: "Standing rule",
          value: "Never click through a warning; never install an unverified root.",
        },
      ],
      successSummary:
        "All three cases diagnosed: a name problem, a time problem, and an incomplete-path problem — each with a different owner and a different fix.",
      retryPrompt:
        "Any case can be redone with “Try this case again”, and the whole station resets with “Reset this scene”.",
      explanation:
        "The warning box is a summary, not the evidence. Once you read the underlying rows, the three failures are easy to tell apart: the name did not match, the time was outside the interval, or the path could not be built.",
      instructorNotes: [
        "Case C is the one students confuse with an untrusted root. Put both sentences on the board side by side.",
      ],
      facilitation: {
        recommendedMinutes: 10,
        onScreen: [
          "Three case tabs",
          "Client warning message and the evidence rows",
          "Diagnosis and action choices, with feedback held until “Check my thinking”",
        ],
        openingStatement:
          "Three warnings that look almost identical. Let's stop reading the box and start reading the rows underneath it.",
        questionsToAsk: [
          "Which specific row tells you the answer?",
          "Who has to fix this — Ivy, or the service owner?",
          "What would happen if we clicked through?",
        ],
        expectedReasoning: [
          "Case A: requested name is absent from the SAN list.",
          "Case B: reference time is after “not after”.",
          "Case C: no intermediate available, so no path can be built.",
        ],
        misconceptions: [
          "“Missing intermediate means untrusted root.”",
          "“Clicking through once is fine.”",
          "“It works on my phone, so the server is fine.”",
        ],
        followUpQuestions: [
          "Why does this failure look intermittent across different devices?",
        ],
        processingPause:
          "Before each reveal, hold a slow count of ten and take predictions. Do not confirm or deny during the pause.",
        evidenceRevealOrder: ["Case A", "Case B", "Case C"],
        correctAnswer:
          "Name mismatch, expiry against the fixed clock, and an unbuildable path with no cached or fetchable intermediate.",
        transition:
          "Station 4 puts it together: a case that passes, a case that fails, and what passing actually proves.",
      },
    },

    /* ---------------------------------- Scene 5 — Make the decision */
    {
      id: "ta-decision",
      title: "Station 4 — Make the decision",
      objective:
        "Decide pass or fail, name the supporting evidence, and state the limit of the conclusion.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-nod",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.decisionPrimary,
      continueLabel: "Go to the close",
      missionBrief: {
        situation:
          "Ivy has two final connection attempts in front of her, each with its check results laid out. She has to decide whether to send the protected report.",
        mission:
          "For each scenario: decide whether the demonstrated checks pass, pick the evidence that supports your decision, and state one thing the result does not prove.",
        steps: [
          "Open Scenario 1 and read all four check rows.",
          "Choose your verdict, then press “Check my thinking”.",
          "Select every piece of evidence that genuinely supports your verdict.",
          "Choose the correct limit of the conclusion.",
          "Repeat for Scenario 2.",
        ],
        evidence: [
          "The name check row: requested hostname against the SAN list.",
          "The date check row against the scenario clock.",
          "The path check row: chain complete and ending at a trusted anchor.",
          "The key possession row: whether the server proved it holds the private key matching the certificate.",
        ],
        decision:
          "Do the demonstrated checks pass — and what does a pass still not tell you?",
        lookingFor:
          "Scenario 1 passes all four checks; Scenario 2 fails on the name. A pass means you are talking to the holder of a certificate for that name whose chain your client trusts. It is not proof the site is honest, malware-free, or safe to buy from.",
        completeWhen:
          "Both scenarios have a correct verdict, complete supporting evidence, and a correctly identified limit.",
      },
      instructorAnswerGuide: {
        sayThis:
          "This is the moment that matters in the real job: the checks gave you a result, and now you have to say out loud what that result actually means — and what it does not.",
        predictionPrompt:
          "Ask for a verdict prediction before either reveal. Then ask the harder one: “If it passes, would you buy something from this site?”",
        actionSequence: [
          "Open Scenario 1, read the four check rows, take a verdict from the room, press “Check my thinking”.",
          "Select all supporting evidence rows.",
          "Choose the limit statement.",
          "Repeat for Scenario 2 and contrast the two.",
        ],
        expectedAnswer: [
          {
            label: "PASS",
            text: "Scenario 1 passes: the requested hostname is in the SAN list, the scenario clock is inside the validity interval, the chain ends at a trusted anchor, and the server proved possession of the matching private key.",
          },
          {
            label: "FAIL",
            text: "Scenario 2 fails: every other check is fine, but the certificate's SAN list does not include the requested hostname, so the name check fails and Ivy must not send the report.",
          },
          {
            label: "LIMIT",
            text: "A pass shows we are talking to the holder of a trusted certificate for that name; it does not show the operator is honest, the site is malware-free, or that it is safe to buy from.",
          },
        ],
        whyCorrect:
          "Certificate validation answers an identity question about a name, bound to proof of private-key possession during the handshake. Honesty, safety and business conduct are outside what any of these checks measure.",
        expectedEvidence: [
          "Scenario 1: four rows marked pass, including the key-possession row.",
          "Scenario 2: name row marked fail with the other three marked pass.",
          "The possession note stating that a certificate and public key alone do not prove possession.",
        ],
        misconceptions: [
          {
            wrong: "The padlock means the site is safe.",
            correction:
              "It means the name, date and path checks passed and the server proved it holds the matching key. A fraudulent shop can hold a perfectly valid certificate for its own name.",
          },
          {
            wrong: "Holding the certificate is enough to prove identity.",
            correction:
              "Certificates are public. The server must also prove it possesses the matching private key during the handshake; otherwise anyone could replay a copied certificate.",
          },
          {
            wrong: "Name, date and path is the whole of certificate validation.",
            correction:
              "It is the beginner starting checklist. Real validators also check revocation, key usage, signature algorithms, name constraints and more.",
          },
        ],
        followUp: {
          question:
            "A shop has a perfect certificate and takes your money without shipping anything. Which check should have caught that?",
          desiredResponse:
            "None of them. Certificate validation is about identity and the connection, not about honesty.",
        },
        boundary:
          "Nothing at this station evaluates the operator's conduct, the site's content, or the completeness of a production validator.",
        readyToAdvance: [
          "Both verdicts correct with supporting evidence named.",
          "At least one student states the limit unprompted.",
          "Nobody equates the padlock with safety.",
        ],
        scenarioGuides: [
          {
            id: "scenario-pass",
            title: "Scenario 1 — the passing case",
            actionSequence: [
              "Press the “Scenario 1 — the intended service” tab.",
              "Read the four check rows aloud, finishing with key possession.",
              "Choose the PASS verdict and press “Check my thinking”.",
              "Select the four supporting evidence items.",
              "Choose the limit statement about honesty and safety.",
            ],
            sayThis:
              "Everything lines up here. Before we celebrate, I want somebody to tell me precisely what we are now entitled to believe.",
            expectedAnswer:
              "The demonstrated checks pass: the requested hostname appears in the SAN list, the scenario clock falls inside the validity interval, the chain ends at a root the client trusts, and the server proved it holds the private key matching the certificate.",
            expectedEvidence: [
              "Name row: vault-exchange.example present in the SAN list — pass.",
              `Date row: ${REFERENCE_TIME} inside 12 Jan – 12 Jul 2026 — pass.`,
              "Path row: leaf → intermediate → trusted root — pass.",
              "Possession row: handshake proved the private key is held by this server — pass.",
            ],
            whyCorrect:
              "All four demonstrated checks succeed, and possession of the private key is what ties the certificate to the party actually answering.",
            misconceptions: [
              {
                wrong: "Now we know the company is trustworthy.",
                correction:
                  "We know which name we are talking to and that its certificate chain is trusted. Conduct is a separate question entirely.",
              },
              {
                wrong: "The certificate alone proved who they are.",
                correction:
                  "Certificates are public documents. The proof came from demonstrating possession of the matching private key.",
              },
            ],
            followUp: {
              question: "Would you enter payment details here on this evidence alone?",
              desiredResponse:
                "No. The checks establish identity of a name, not the honesty of the business behind it.",
            },
            boundary:
              "A pass does not prove honesty, absence of malware, or safety of any transaction — and this is the beginner checklist, not a full validator.",
            readyToAdvance: [
              "Someone states the limit without being prompted.",
              "The key-possession row is named as part of the answer.",
            ],
          },
          {
            id: "scenario-fail",
            title: "Scenario 2 — the failing case",
            actionSequence: [
              "Press the “Scenario 2 — the lookalike endpoint” tab.",
              "Read all four rows and find the single failing one.",
              "Choose the FAIL verdict and press “Check my thinking”.",
              "Select the evidence that supports stopping.",
              "Choose the limit statement about what a failure does not prove.",
            ],
            sayThis:
              "Three green rows and one red one. Tell me which row decides this, and tell me what we are allowed to conclude about the people running it.",
            expectedAnswer:
              "The demonstrated checks fail: the certificate is in date, correctly chained and backed by proof of key possession, but its SAN list does not include vault-exchange.example, so the name check fails and Ivy must not send the report.",
            expectedEvidence: [
              "Name row: requested vault-exchange.example, SAN lists vault-exchange-portal.example — fail.",
              "Date, path and possession rows all reading pass.",
            ],
            whyCorrect:
              "Validation is a conjunction: every check must pass. A single failed name check means the connection is not to the requested identity, whatever else succeeded.",
            misconceptions: [
              {
                wrong: "Three out of four is good enough.",
                correction:
                  "Identity checking is all-or-nothing. The one failing check is precisely the one that says who you are talking to.",
              },
              {
                wrong: "This proves it is an attacker.",
                correction:
                  "It proves the name does not match. Misconfiguration produces identical evidence; report it as a mismatch, not as an attack.",
              },
            ],
            followUp: {
              question: "What would you write in the ticket?",
              desiredResponse:
                "“Connection to vault-exchange.example presented a certificate whose SAN list covers vault-exchange-portal.example only; name check failed; not sending until confirmed.”",
            },
            boundary:
              "A failure does not identify who is behind the endpoint or whether any attack occurred.",
            readyToAdvance: [
              "The failing row is named specifically.",
              "The report wording avoids claiming an attack.",
            ],
          },
        ],
      },
      intro: [
        {
          id: "ta-decision-1",
          speaker: "Ivy",
          text: "Two attempts left, and I have all the check results in front of me. Time to decide — and to be exact about what the decision covers.",
          characterState: "ivy-nod",
        },
        {
          id: "ta-decision-2",
          speaker: "Ivy",
          text: "One more thing I want you to notice: holding a certificate is not proof of identity. Anyone can copy a certificate; only the real service can prove it holds the matching private key.",
        },
      ],
      interaction: {
        id: "ta-decision",
        kind: "trust-authority",
        prompt: "Pass or fail — and what does the result actually cover?",
        instruction:
          "Work through both scenarios: verdict first, then supporting evidence, then the limit of the conclusion.",
        stationLabel: "Station 4 of 4 — Make the decision",
        modelNote: MODEL_NOTE,
        boundary:
          "These checks establish an identity for a name over this connection. They do not establish honesty, safety, content quality, or freedom from malware.",
        referenceTime: CLOCK_NOTE,
        terms: TERMS,
        completion: {
          headline: "One pass, one fail, and a clearly stated limit",
          body: "You can now say what a successful certificate check proves — and say, just as clearly, what it leaves unanswered.",
        },
        station: {
          kind: "decision",
          revealAction: "Check my thinking",
          possessionNote:
            "A certificate and its public key are public information. During a real TLS handshake the server must also prove it possesses the matching private key; without that proof, a copied certificate would be enough to impersonate anyone.",
          checklistNote:
            "Name, date and path are your beginner starting checklist. Production validators also check revocation status, key usage, signature algorithms, name constraints and more.",
          scenarios: [
            {
              id: "scenario-pass",
              label: "Scenario 1 — the intended service",
              summary:
                "Ivy connects to vault-exchange.example and the client completes every demonstrated check.",
              checks: [
                {
                  label: "Name check — requested hostname against the SAN list",
                  result: "pass",
                  detail:
                    "Requested vault-exchange.example; SAN list includes vault-exchange.example.",
                },
                {
                  label: "Date check — validity against the scenario clock",
                  result: "pass",
                  detail: `${REFERENCE_TIME} falls inside 12 Jan 2026 – 12 Jul 2026.`,
                },
                {
                  label: "Path check — chain to a trusted anchor",
                  result: "pass",
                  detail:
                    "leaf → CVI Teaching Intermediate CA G2 → CVI Teaching Root CA R1, which is in the client's trust store.",
                },
                {
                  label: "Key possession — proved during the handshake",
                  result: "pass",
                  detail:
                    "The server demonstrated it holds the private key matching the certificate's public key.",
                },
              ],
              verdict: {
                prompt: "Do the demonstrated checks pass?",
                options: [
                  {
                    id: "pass",
                    label: "Yes — all four demonstrated checks pass",
                    correct: true,
                    response:
                      "Correct. Name, date, path and key possession all succeeded.",
                  },
                  {
                    id: "fail",
                    label: "No — something failed",
                    correct: false,
                    response:
                      "Read the four rows again; each one is marked pass, including key possession.",
                  },
                  {
                    id: "unknown",
                    label: "There is not enough information",
                    correct: false,
                    response:
                      "For the checks we are demonstrating, every row has a result. Be careful to answer about these checks rather than everything that could ever be checked.",
                  },
                ],
              },
              evidence: {
                prompt: "Select every piece of evidence that supports your verdict.",
                options: [
                  {
                    id: "san",
                    label: "vault-exchange.example appears in the SAN list",
                    supporting: true,
                    response: "Yes — this is what makes the name check pass.",
                  },
                  {
                    id: "dates",
                    label: "The scenario clock falls inside the validity interval",
                    supporting: true,
                    response: "Yes — the date check rests on this comparison.",
                  },
                  {
                    id: "path",
                    label: "The chain ends at a root in the client's trust store",
                    supporting: true,
                    response: "Yes — a complete path to a configured anchor.",
                  },
                  {
                    id: "possession",
                    label:
                      "The server proved it holds the private key matching the certificate",
                    supporting: true,
                    response:
                      "Yes — and this is the one people forget. Without it, a copied certificate would be enough.",
                  },
                  {
                    id: "padlock",
                    label: "The browser displayed a padlock icon",
                    supporting: false,
                    response:
                      "The padlock is a summary of the checks, not independent evidence. Cite the checks themselves.",
                  },
                  {
                    id: "looks",
                    label: "The site looks professional and familiar",
                    supporting: false,
                    response:
                      "Appearance is not evidence. Convincing copies are easy to build.",
                  },
                ],
              },
              limit: {
                prompt: "State the limit: what does this pass NOT prove?",
                options: [
                  {
                    id: "honesty",
                    label:
                      "It does not prove the operator is honest, the site is malware-free, or that it is safe to buy from",
                    correct: true,
                    response:
                      "Exactly. Identity of a name is not a character reference.",
                  },
                  {
                    id: "encryption",
                    label: "It does not prove the connection is encrypted",
                    correct: false,
                    response:
                      "Encryption is part of the protected connection being established. The bigger gap is what the checks say about the people running the service.",
                  },
                  {
                    id: "nothing",
                    label: "There is no meaningful limit — a pass means it is safe",
                    correct: false,
                    response:
                      "This is the single most common misunderstanding of the padlock. A fraudulent shop can hold a perfectly valid certificate for its own name.",
                  },
                ],
              },
            },
            {
              id: "scenario-fail",
              label: "Scenario 2 — the lookalike endpoint",
              summary:
                "A second endpoint answers for the same request, and three of the four rows look healthy.",
              checks: [
                {
                  label: "Name check — requested hostname against the SAN list",
                  result: "fail",
                  detail:
                    "Requested vault-exchange.example; SAN list contains vault-exchange-portal.example only.",
                },
                {
                  label: "Date check — validity against the scenario clock",
                  result: "pass",
                  detail: `${REFERENCE_TIME} falls inside the certificate's validity interval.`,
                },
                {
                  label: "Path check — chain to a trusted anchor",
                  result: "pass",
                  detail:
                    "The chain is complete and ends at a root in the client's trust store.",
                },
                {
                  label: "Key possession — proved during the handshake",
                  result: "pass",
                  detail:
                    "The server holds the private key matching the certificate it presented.",
                },
              ],
              verdict: {
                prompt: "Do the demonstrated checks pass?",
                options: [
                  {
                    id: "fail",
                    label: "No — the name check fails, so validation fails",
                    correct: true,
                    response:
                      "Correct. Every check must pass; the failing one is the one that says who we are talking to.",
                  },
                  {
                    id: "pass",
                    label: "Yes — three out of four passed",
                    correct: false,
                    response:
                      "Identity checking is all-or-nothing. A valid, well-chained certificate for the wrong name says nothing about this destination.",
                  },
                  {
                    id: "partial",
                    label: "Partially — it is safe for low-risk data",
                    correct: false,
                    response:
                      "There is no partial pass. We do not know who is answering, so nothing should be sent.",
                  },
                ],
              },
              evidence: {
                prompt: "Select every piece of evidence that supports your verdict.",
                options: [
                  {
                    id: "mismatch",
                    label:
                      "The SAN list contains vault-exchange-portal.example, not the requested name",
                    supporting: true,
                    response: "Yes — this single row decides the outcome.",
                  },
                  {
                    id: "requested",
                    label: "Ivy requested vault-exchange.example",
                    supporting: true,
                    response:
                      "Yes — the comparison needs both halves: what was asked for and what was offered.",
                  },
                  {
                    id: "others",
                    label: "The date, path and possession checks all passed",
                    supporting: false,
                    response:
                      "True, but it does not support stopping. Note it in the ticket as context, not as evidence for the verdict.",
                  },
                  {
                    id: "attacker",
                    label: "The endpoint is being run by an attacker",
                    supporting: false,
                    response:
                      "Not established. A misconfiguration produces identical evidence; report the mismatch, not an accusation.",
                  },
                ],
              },
              limit: {
                prompt: "State the limit: what does this failure NOT prove?",
                options: [
                  {
                    id: "unknown-party",
                    label:
                      "It does not prove who is behind the endpoint or that an attack took place",
                    correct: true,
                    response:
                      "Right. It proves the name did not match. That is enough to stop, and not enough to accuse.",
                  },
                  {
                    id: "broken-ca",
                    label: "It proves the certificate authority made a mistake",
                    correct: false,
                    response:
                      "Nothing indicates that. The certificate is valid — for a different name.",
                  },
                  {
                    id: "no-limit",
                    label: "It proves the service is malicious",
                    correct: false,
                    response:
                      "Be careful with that claim in a report. Misconfigured load balancers cause this constantly.",
                  },
                ],
              },
            },
          ],
        },
      },
      evidence: [
        {
          id: "ta-possession",
          label: "Proof of possession",
          value: "Certificate + public key alone ≠ proof of possession",
          note: "The handshake requires proving the matching private key is held.",
        },
      ],
      successSummary:
        "Both verdicts made with evidence, and the limit stated: identity of a name, not a guarantee of honesty or safety.",
      retryPrompt:
        "Reset this scene to work either scenario again from the top.",
      explanation:
        "A successful certificate check says: this connection is to the holder of a certificate for the name I asked for, whose chain ends where my client was configured to trust. That is a genuinely useful statement — and it is not a statement about honesty, content or safety.",
      instructorNotes: [
        "Push for the limit sentence in the students' own words. It is the takeaway they will reuse all week.",
      ],
      facilitation: {
        recommendedMinutes: 6,
        onScreen: [
          "Two scenario tabs with four check rows each",
          "Verdict, supporting evidence and limit prompts",
          "Key-possession and checklist notes",
        ],
        openingStatement:
          "The checks have run. Now we say exactly what they bought us — and what they did not.",
        questionsToAsk: [
          "Which row decides Scenario 2?",
          "Would you buy something from the passing site on this evidence?",
          "What is missing from a name-date-path checklist?",
        ],
        expectedReasoning: [
          "Validation is a conjunction; one failure fails it.",
          "Possession of the private key is what binds the certificate to the responder.",
          "Identity is not honesty.",
        ],
        misconceptions: [
          "“Padlock means safe.”",
          "“Three out of four is fine.”",
          "“Name, date, path is the whole check.”",
        ],
        followUpQuestions: [
          "Which check would have caught a dishonest but properly certified shop?",
        ],
        processingPause:
          "After the passing verdict, pause a slow ten before asking whether they would enter payment details.",
        evidenceRevealOrder: [
          "Scenario 1 rows",
          "Scenario 1 verdict",
          "Scenario 2 rows",
          "Scenario 2 verdict",
        ],
        correctAnswer:
          "Scenario 1 passes all four checks; Scenario 2 fails on the name. A pass proves identity of a name, not honesty or safety.",
        transition:
          "Close with the plain-language sentence students will carry into the Week 9 labs.",
      },
    },

    /* ------------------------------------------------- Scene 6 — Close */
    {
      id: "ta-close",
      title: "Close — say it in plain language",
      objective:
        "Leave with one sentence about certificates that a beginner can actually use.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-briefing",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: trustAuthorityVisuals.closingRecap,
      continueLabel: "Finish",
      missionBrief: {
        situation:
          "Ivy sent the report to the destination that passed every check, and filed a ticket for the one that did not.",
        mission:
          "Recap what each check answers, then take away one sentence you can use in this week's labs.",
        steps: [
          "Read the four recap rows: question, check, and what it establishes.",
          "Say the plain-language takeaway in your own words to yourself, aloud, or in chat.",
          "Press “Show the plain-language takeaway” to compare with Ivy's wording.",
        ],
        evidence: [
          "Row 1 — “Is this the right name?” answered by the SAN check.",
          "Row 2 — “Is it still in date?” answered against the scenario clock.",
          "Row 3 — “Does the chain end somewhere I trust?” answered by the path check.",
          "Row 4 — “Is the other side really the holder?” answered by proof of private-key possession.",
        ],
        decision: "How would you explain a certificate check to a colleague in one go?",
        lookingFor:
          "Something close to: the service showed me a badge for the name I asked for, it was in date, the badge office chain ended at someone my computer already trusts, and the service proved it holds the matching private key — which tells me who I am talking to, not whether they are honest.",
        completeWhen:
          "The takeaway has been revealed and you have put it in your own words. Nothing is submitted or collected.",
      },
      instructorAnswerGuide: {
        sayThis:
          "Last thing. If a colleague asks you tomorrow what a certificate check does, what do you say? Keep it to one breath.",
        predictionPrompt:
          "Ask two or three volunteers for their sentence before revealing Ivy's version. Do not correct wording during this part.",
        actionSequence: [
          "Read the four recap rows with the room.",
          "Take two or three student sentences.",
          "Press “Show the plain-language takeaway” and compare.",
        ],
        expectedAnswer: [
          {
            text: "A certificate check asks four things: is this the name I asked for, is it still in date, does the chain end at someone my client already trusts, and did the other side prove it holds the matching private key.",
          },
          {
            text: "Passing those checks tells me who I am connected to. It does not tell me whether they are honest or whether the site is safe.",
          },
        ],
        whyCorrect:
          "The four checks map exactly to the four stations, and the limit sentence prevents the padlock-equals-safe misconception from travelling into the labs.",
        expectedEvidence: [
          "The four-row recap table.",
          "The revealed takeaway panel.",
        ],
        misconceptions: [
          {
            wrong: "Certificates prove a site is safe.",
            correction:
              "They establish an identity for a name over this connection. Safety is a different judgement made with different evidence.",
          },
          {
            wrong: "This week replaced last week.",
            correction:
              "Week 8 protects the information; Week 9 checks the destination. Ivy needs both to send the report responsibly.",
          },
        ],
        followUp: {
          question:
            "In this week's labs, which single row will you check first when something fails?",
          desiredResponse:
            "The name row — it is the most common failure and the fastest to confirm.",
        },
        boundary:
          "The session taught a beginner checklist against authored teaching data. It is not a substitute for a production validator or a live TLS trace.",
        readyToAdvance: [
          "At least two students have said the takeaway in their own words.",
          "The limit is part of everyone's sentence.",
        ],
      },
      intro: [
        {
          id: "ta-close-1",
          speaker: "Ivy",
          text: "Report sent — to the destination that passed, and a ticket raised for the one that did not. That is the whole job today.",
          characterState: "ivy-briefing",
        },
        {
          id: "ta-close-2",
          speaker: "Ivy",
          text: "If you remember one thing: the check tells me who I am talking to. It never tells me whether they are honest.",
        },
      ],
      interaction: {
        id: "ta-recap",
        kind: "trust-authority",
        prompt: "Four questions, four checks",
        instruction:
          "Read the recap, put the takeaway in your own words, then reveal Ivy's version. Nothing is collected.",
        stationLabel: "Close — plain-language recap",
        modelNote: MODEL_NOTE,
        boundary:
          "This session used authored teaching certificates. It teaches the reasoning, not a production validation procedure.",
        referenceTime: CLOCK_NOTE,
        terms: TERMS,
        completion: {
          headline: "You can explain a certificate check in one breath",
          body: "Name, date, path, possession — and a clear statement of what a pass does not cover.",
        },
        station: {
          kind: "recap",
          revealAction: "Show the plain-language takeaway",
          rows: [
            {
              question: "Is this the name I asked for?",
              check: "Compare the requested hostname with the SAN list",
              detail:
                "Station 1. A valid certificate for a different name does not cover this destination.",
            },
            {
              question: "Is it still in date?",
              check: `Compare “not before” and “not after” with the clock (${REFERENCE_TIME})`,
              detail:
                "Station 1 and Case B. Expiry limits how long one certificate can be relied on.",
            },
            {
              question: "Does the chain end somewhere I trust?",
              check: "Build leaf → intermediate → anchor and check the trust store",
              detail:
                "Station 2 and Case C. A missing intermediate and an untrusted root are different failures.",
            },
            {
              question: "Is the other side really the holder?",
              check: "The handshake proves possession of the matching private key",
              detail:
                "Station 4. Certificates are public; only possession of the private key binds one to the responder.",
            },
          ],
          takeaway: {
            headline: "Say it like this",
            body: "“The service showed me a badge for the name I asked for. It was in date. The chain of signatures ended at an authority my computer was already set up to trust. And the service proved it holds the private key that matches the badge. That tells me who I am talking to — it does not tell me they are honest, that the site is malware-free, or that it is safe to buy from.”",
          },
        },
      },
      successSummary:
        "Takeaway revealed. Reuse the wording — or your own version of it — whenever a certificate question comes up this week.",
      retryPrompt:
        "Reset this scene to read the recap again before your lab work.",
      explanation:
        "Week 8 protected the information. Week 9 checked the destination. The certificate answered a narrow, useful question well, and the honest limits of that answer are as important as the answer.",
      instructorNotes: [
        "Take student sentences before revealing Ivy's. Their wording is usually better for their own notes.",
      ],
      facilitation: {
        recommendedMinutes: 1,
        onScreen: ["Four-row recap table", "Hidden takeaway panel"],
        openingStatement:
          "One sentence each. What does a certificate check actually do?",
        questionsToAsk: ["What does it prove?", "What does it not prove?"],
        expectedReasoning: [
          "Name, date, path, possession.",
          "Identity of a name, not honesty.",
        ],
        misconceptions: ["“It means the site is safe.”"],
        followUpQuestions: [
          "Which row will you check first when a lab connection fails?",
        ],
        processingPause:
          "Let two or three sentences land before revealing Ivy's wording.",
        evidenceRevealOrder: ["Recap rows", "Takeaway"],
        correctAnswer:
          "Four checks: name, date, path, possession — proving identity of a name, not honesty or safety.",
        transition:
          "Students carry the takeaway sentence into the Week 9 labs; optional independent replay is available.",
      },
    },
  ],
};
