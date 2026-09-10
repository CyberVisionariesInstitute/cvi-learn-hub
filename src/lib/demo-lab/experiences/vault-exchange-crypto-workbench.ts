import type { Experience } from "../types";
import { vaultExchangeVisuals } from "./vault-exchange-visuals";

/**
 * CyberFoundations Module 3 · Week 8 — The Vault Exchange.
 *
 * One incident report, four cryptography stations. Everything rendered is
 * authored teaching content presented as a clearly labelled conceptual model:
 * no real cipher, digest, signature or SSH exchange is performed, and no key,
 * secret, password or passphrase is ever generated, displayed or stored.
 *
 * Scope stops at the Week 9 doorway: no certificates, CAs, PKI hierarchies,
 * certificate chains or TLS handshake mechanics are taught here.
 */

const MODEL_NOTE =
  "Conceptual model. The values below are written for teaching and are not produced by real cryptography. Nothing here should be used operationally.";

const report = [
  "INCIDENT REPORT · VX-4417",
  "Reported by: Ivy — Security Analyst, Vault Access Level 3",
  "Summary: Unusual after-hours access attempt on the analyst workstation.",
  "Action taken: Session isolated. Report prepared for the operations record.",
];

export const vaultExchangeCryptoWorkbench: Experience = {
  id: "cf-w8-vault-exchange-crypto-workbench",
  slug: "vault-exchange-crypto-workbench",
  programId: "cyberfoundations",
  moduleId: "cf-module-3",
  weekId: "cf-week-08",
  type: "interactive-scenario",
  status: "available",
  title: "Vault Exchange Crypto Workbench",
  subtitle: "What protects the information when access controls are not enough?",
  description:
    "One incident report, four stations. See how encryption, hashing, digital signatures and public-key authentication each solve a different security problem — in plain language, with no timers and no penalties.",
  objectives: [
    "Tell plaintext, ciphertext and decryption apart, and say what encryption does not protect against.",
    "Use a digest comparison to detect a one-character change between two copies.",
    "Explain what a passing — and a failing — signature verification actually proves.",
    "Place the public key in the server's authorized list and keep the private key with its owner.",
  ],
  estimatedMinutes: 14,
  characterIds: ["ivy-vault"],
  environmentIds: ["vault-exchange-workbench"],
  replayAvailable: true,
  route: "/cyberfoundations/week-08/vault-exchange-crypto-workbench",
  thumbnail: vaultExchangeVisuals.browserThumbnail,
  instructorNotes: [
    "Language is ELI5-first on purpose. Let students say it wrong once, then tighten the wording together.",
    "Every station resets on its own with 'Reset this scene' — nothing is scored and nothing is lost.",
    "If a student asks how the ciphertext or digest was produced, say plainly: it was written for the lesson. The behaviour is faithful; the maths is not being run.",
    "Hold the Week 9 bridge question at the end. Do not answer it — certificates are next week.",
  ],
  runOfShow: [
    { order: 1, title: "Opening brief", minutes: 2, focus: "Week 7 → Week 8 handoff" },
    { order: 2, title: "Station 1 — Protect", minutes: 3, focus: "Confidentiality" },
    { order: 3, title: "Station 2 — Compare", minutes: 3, focus: "Integrity" },
    { order: 4, title: "Station 3 — Sign & verify", minutes: 3, focus: "Authenticity" },
    { order: 5, title: "Station 4 — Authenticate", minutes: 2, focus: "Key possession" },
    { order: 6, title: "Close", minutes: 2, focus: "Recap and the Week 9 question" },
  ],
  scenes: [
    /* ------------------------------------------------ Scene 1 — Brief */
    {
      id: "vx-brief",
      title: "Opening brief — the Vault Exchange",
      objective:
        "What protects the information when access controls are not enough?",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-briefing",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: vaultExchangeVisuals.openingBriefing,
      continueLabel: "Go to Station 1",
      missionBrief: {
        situation:
          "The Guard Post can control access, but a copied incident report may still be readable or altered after it leaves the protected system.",
        mission:
          "Review the two security questions and identify what access control handles versus what cryptography handles.",
        evidence: [
          "“Should this traffic be allowed?” — this question is about the door and the path.",
          "“Can someone read it, detect a change, verify approval, or prove key possession?” — this question is about the data itself, or the cryptographic proof attached to it.",
        ],
        decision: "Why is access control alone not enough?",
        lookingFor:
          "Access control decides who should get in; cryptography protects or verifies the information once someone has it. They are complementary layers.",
        completeWhen:
          "You can state that distinction in one sentence and are ready to test the same report at four stations.",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Read both security questions aloud with the room.",
          "Sort each question into 'access' or 'data'.",
          "State the distinction in one sentence before moving to Station 1.",
        ],
        expectedAnswer: [
          {
            text: "Access control controls entry; cryptography protects or verifies the information once someone has it. We need both.",
          },
        ],
        whyCorrect:
          "The two controls answer different questions. A permitted or copied file has already passed the access decision, so only protection applied to the data itself still helps.",
        expectedEvidence: [
          "The two questions displayed side by side, one about the path and one about the data.",
        ],
        misconceptions: [
          {
            wrong: "The firewall protects the file.",
            correction:
              "It controls permitted traffic, not the readability or integrity of a copied file.",
          },
        ],
        followUp: {
          question:
            "If the firewall worked but a backup was exposed, what question comes next?",
          desiredResponse:
            "Can the person read it, and can we detect whether it changed?",
        },
        boundary:
          "Nothing here proves any specific control is configured correctly; it only separates the access question from the data question.",
        readyToAdvance: [
          "Students distinguish access protection from data protection.",
          "The room can state the distinction in one sentence.",
        ],
      },
      intro: [
        {
          id: "vx-brief-1",
          speaker: "Ivy",
          text: "Last week at the Guard Post we asked one question: should this traffic be allowed? That question is about the door.",
          characterState: "ivy-briefing",
        },
        {
          id: "vx-brief-2",
          speaker: "Ivy",
          text: "Here at the Vault Exchange we ask the next one: if someone gets the information anyway, can they understand it — and can we tell if it changed?",
        },
        {
          id: "vx-brief-3",
          speaker: "Ivy",
          text: "We will take one incident report through four stations. Same document every time; different problem each time. Nothing is timed and nothing is graded.",
        },
      ],
      explanation:
        "Access control decides who gets in. Cryptography decides what the information is worth once someone is holding it. The two work together; neither replaces the other.",
      instructorNotes: [
        "Ask the room: 'The firewall did its job and a file still walked out the door. What now?'",
      ],
    },

    /* ---------------------------------------------- Scene 2 — Protect */
    {
      id: "vx-protect",
      title: "Station 1 — Protect",
      objective: "Turn a readable report into an unreadable one, then get it back.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-type",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: vaultExchangeVisuals.protectPrimary,
      continueLabel: "Go to Station 2",
      missionBrief: {
        situation:
          "The incident report is plaintext and readable by anyone who obtains the file.",
        mission:
          "Take the report from readable, to unreadable, and back to exactly what it was.",
        steps: [
          "Read the original plaintext report.",
          "Select “Encrypt the report”.",
          "Inspect the ciphertext and confirm it is no longer readable as the original report.",
          "Select “Decrypt the report”.",
          "Compare the recovered text to the original, character for character.",
        ],
        evidence: [
          "The readable plaintext report before you start.",
          "The unreadable illustrative ciphertext after encryption.",
          "The recovered text after decryption, identical to the original.",
        ],
        decision: "What did encryption protect, and what did it not protect?",
        lookingFor:
          "Encryption protects confidentiality — the meaning of the content. It does not stop the file from being copied, stolen, deleted, corrupted, or misused by someone who has the key.",
        completeWhen:
          "Both Encrypt and Decrypt have been run and the exact original text is recovered.",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Read the plaintext report on screen.",
          "Run “Encrypt the report” and inspect the ciphertext.",
          "Run “Decrypt the report”.",
          "Compare the recovered wording to the original line by line.",
        ],
        expectedAnswer: [
          {
            text: "Encryption changed readable plaintext into unreadable ciphertext and decryption recovered the exact original. It protects confidentiality, not possession or availability.",
          },
        ],
        whyCorrect:
          "The round trip demonstrates that the transformation hides meaning and is exactly reversible for the right holder — it says nothing about who holds or can delete the file.",
        expectedEvidence: [
          "Plaintext panel readable at the start.",
          "Ciphertext panel unreadable after encryption.",
          "Recovered plaintext identical to the original after decryption.",
        ],
        misconceptions: [
          {
            wrong: "Encryption prevents theft, deletion, or changes.",
            correction:
              "The encrypted object can still be stolen, deleted, or modified.",
          },
          {
            wrong: "Ciphertext is a damaged file.",
            correction:
              "It is intentionally transformed and recoverable with the right key.",
          },
        ],
        followUp: {
          question: "What does an attacker still have?",
          desiredResponse:
            "A file they may copy or delete, but cannot understand without the key.",
        },
        boundary:
          "This shows confidentiality only. It does not prove who holds the file, that the file still exists, or that the content is genuine.",
        readyToAdvance: [
          "Ciphertext has been inspected.",
          "Recovery exactly matches the original plaintext.",
          "Students state that confidentiality — not possession — was protected.",
        ],
      },
      intro: [
        {
          id: "vx-protect-1",
          speaker: "Ivy",
          text: "Right now the report is plaintext — anyone holding the file can read it. Encrypt it and read the screen again.",
          characterState: "ivy-type",
        },
      ],
      interaction: {
        id: "vx-protect-i",
        kind: "crypto-workbench",
        stationLabel: "Station 1 of 4 — Protect",
        prompt: "Make the report unreadable, then recover it exactly.",
        instruction:
          "Encrypt the report, look at what is left, then decrypt it and check the wording is unchanged.",
        modelNote: MODEL_NOTE,
        boundary:
          "encryption keeps the content secret; it does not stop the file being stolen, deleted or modified. A stolen encrypted file is still a stolen file.",
        terms: [
          { term: "Plaintext", meaning: "The information in its readable form." },
          {
            term: "Encryption",
            meaning: "Scrambling readable information so it cannot be understood.",
          },
          { term: "Ciphertext", meaning: "The scrambled, unreadable result." },
          {
            term: "Decryption",
            meaning: "Turning ciphertext back into the exact original plaintext.",
          },
          {
            term: "Confidentiality",
            meaning: "Only people who are meant to understand it, can.",
          },
          {
            term: "At rest vs in transit",
            meaning:
              "At rest = stored on a disk or in a bucket. In transit = moving across a network. Both need protecting; they are protected separately.",
          },
        ],
        station: {
          kind: "protect",
          documentTitle: "Incident report VX-4417",
          plaintext: report,
          ciphertext: [
            "8Q2M vT7x  Kd3p LZ9r  aH4c  mN0s  wR6y",
            "b1Fj  qE8t  Uc5v  Xo2n  gS7d  yP4k  Jm9w",
            "r3Zt  Ah6q  Dl0b  Nv8x  Tc2e  Ky5u  Ws1i",
            "p7Rn  Gf4o  Ib9h  Qz3m  Ln6a  Vd0y  Xu8s",
          ],
          encryptAction: "Encrypt the report",
          decryptAction: "Decrypt the report",
          captions: {
            plaintext: "Readable by anyone who obtains the file.",
            ciphertext:
              "Same document, unreadable form. Illustrative representation, not a real cipher output.",
            recovered:
              "Recovered character for character — decryption returns the exact original, not a summary.",
          },
        },
        completion: {
          headline: "Confidentiality, demonstrated",
          body: "The report went from readable, to unreadable, and back to exactly what it was. That round trip is what encryption is for.",
        },
      },
      successSummary:
        "Encryption protects meaning, not possession. The file can still be taken — it just cannot be read.",
      retryPrompt:
        "Use 'Reset this scene' to run the encrypt and decrypt steps again from the start.",
      explanation:
        "Encryption is reversible on purpose: the point is that the right person can recover the original exactly. Store-side protection (at rest) and network-side protection (in transit) are separate jobs, and you usually need both.",
      instructorNotes: [
        "Ask what an attacker still has after stealing the encrypted file: a file they cannot read, but can delete.",
      ],
    },

    /* ---------------------------------------------- Scene 3 — Compare */
    {
      id: "vx-compare",
      title: "Station 2 — Compare",
      objective: "Spot a one-character difference without reading the whole document.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-read-screen",
      hideCharacterFigure: true,
      flatPresentation: true,
      continueLabel: "Go to Station 3",
      missionBrief: {
        situation:
          "Two report copies look nearly identical, but one punctuation character changed.",
        mission:
          "Use a digest comparison to decide whether the two copies are the same document.",
        steps: [
          "Inspect both copies of the report.",
          "Generate the SHA-256 digest for each copy.",
          "Compare the complete digest values, not just the first few characters.",
          "Choose the answer that correctly interprets the evidence.",
        ],
        evidence: [
          "The two digest values differ even though only one character changed.",
        ],
        decision: "Are the files identical, and what can the hashes prove?",
        lookingFor:
          "No. Different digests mean the contents differ. A hash comparison detects change; it does not identify who changed the file, explain why it changed, prove authorship, hide the content, or recover an earlier version.",
        completeWhen:
          "Both digests are visible and you select “No — the digests differ, so the content differs.”",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Inspect both copies side by side.",
          "Run the hash step to display both digests.",
          "Compare the complete digest values.",
          "Select the correct interpretation.",
        ],
        expectedAnswer: [
          {
            text: "The files differ because their complete SHA-256 digests differ.",
          },
        ],
        whyCorrect:
          "A digest is a fingerprint of the whole content. Any difference in the digests means the compared content is not the same.",
        expectedEvidence: [
          "Two digest displays with clearly different values.",
          "The changed line highlighted in Copy B.",
        ],
        misconceptions: [
          {
            wrong: "The similar-looking digest proves the files are mostly the same.",
            correction:
              "Treat the digest as a complete value; any difference means the compared content differs.",
          },
          {
            wrong: "The hash tells us who changed it.",
            correction: "It detects a content difference only.",
          },
          {
            wrong: "Hashing is reversible encryption.",
            correction: "A digest is not used to recover the document.",
          },
        ],
        followUp: {
          question: "If the digests matched, what would that prove?",
          desiredResponse:
            "The checked content matches the recorded content; it would not prove authorship or owner identity.",
        },
        boundary:
          "The comparison does not identify who changed the file, why it changed, who wrote it, or what the earlier version said.",
        readyToAdvance: [
          "Both digests are visible.",
          "The correct interpretation has been selected.",
        ],
      },
      intro: [
        {
          id: "vx-compare-1",
          speaker: "Ivy",
          text: "Two copies of the same report landed in the record. One of them has a single character changed. Reading both line by line does not scale — hashing does.",
          characterState: "ivy-read-screen",
        },
      ],
      interaction: {
        id: "vx-compare-i",
        kind: "crypto-workbench",
        stationLabel: "Station 2 of 4 — Compare",
        prompt: "Are these two copies identical?",
        instruction:
          "Run the hash step on both copies, compare the two digest displays, then answer the question.",
        modelNote:
          "Conceptual model. These digests are written for teaching and are formatted to look like SHA-256 output. They are not the result of a real SHA-256 calculation.",
        boundary:
          "hashing is a one-way check, not encryption. You cannot turn a digest back into the document, and a digest keeps nothing secret.",
        terms: [
          {
            term: "Hash function",
            meaning: "A process that turns any file into a short fixed-length value.",
          },
          { term: "Digest", meaning: "The short value the hash function produces." },
          {
            term: "SHA-256",
            meaning:
              "A widely used hash function whose digests are always the same length.",
          },
          {
            term: "Integrity",
            meaning: "Confidence that the content has not changed since it was recorded.",
          },
          {
            term: "Avalanche effect",
            meaning:
              "Change one character and the digest changes completely — not slightly.",
          },
        ],
        station: {
          kind: "compare",
          hashAction: "Show the digest for each copy",
          copies: [
            {
              id: "vx-copy-a",
              label: "Copy A — filed by Ivy",
              lines: report,
              digest:
                "e3b1c44 298fc1c1 49afbf4c 8996fb92 427ae41e 4649b934 ca495991 b7852b85",
            },
            {
              id: "vx-copy-b",
              label: "Copy B — retrieved from the shared folder",
              lines: [
                report[0]!,
                report[1]!,
                "Summary: Unusual after-hours access attempt on the analyst workstation,",
                report[3]!,
              ],
              changedLineIndex: 2,
              digest:
                "9f2c7a0 51d38ba7 63e0cc19 07b4a5de 118cf6b2 8a1d4470 5cd39e0f 22ab6d31",
            },
          ],
          question: {
            prompt: "Based on the two digests, are the copies the same document?",
            options: [
              {
                id: "vx-same",
                label: "Yes — they look almost the same to me.",
                correct: false,
                response:
                  "Almost is the trap. Digests do not get 'close' — either they match exactly or the content differs. These do not match.",
              },
              {
                id: "vx-different",
                label: "No — the digests differ, so the content differs.",
                correct: true,
                response:
                  "Correct. One character changed — a full stop became a comma — and the whole digest changed. That is how a change is detected without reading the file.",
              },
              {
                id: "vx-cannot",
                label: "Cannot tell without reading both documents.",
                correct: false,
                response:
                  "Reading works for four lines. The digest comparison works for four lines or four million, which is why it is used.",
              },
            ],
          },
        },
        completion: {
          headline: "Integrity, demonstrated",
          body: "Different digest means different content. Same digest means the content you are checking matches the content that was recorded.",
        },
      },
      successSummary:
        "Hashing answers one question well: did this change? It does not hide anything and it cannot be undone.",
      retryPrompt: "Use 'Reset this scene' to hide the digests and compare again.",
      explanation:
        "A digest is a fingerprint of content. Record the fingerprint when the document is filed, and any later change is obvious — even a single character.",
      instructorNotes: [
        "Ask: 'If the digests matched, what would that prove — and what would it still not prove?' (Content unchanged; not who wrote it.)",
      ],
    },

    /* ------------------------------------------------- Scene 4 — Sign */
    {
      id: "vx-sign",
      title: "Station 3 — Sign & verify",
      objective: "Verify a signed report, change one line, and verify again.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-point",
      hideCharacterFigure: true,
      flatPresentation: true,
      continueLabel: "Go to Station 4",
      missionBrief: {
        situation:
          "A report claims to be approved. A typed name is weak evidence, so the cryptographic signature must be checked.",
        mission:
          "Verify the report before and after a change, and work out what verification actually proves.",
        steps: [
          "Verify the untouched report and observe the PASS result.",
          "Change the specified line of the report.",
          "Verify the altered report and observe the FAIL result.",
          "Compare what PASS and FAIL each mean.",
        ],
        evidence: [
          "Untouched content passes verification.",
          "Altered content fails verification with the same signature and public key.",
        ],
        decision: "What does signature verification actually prove?",
        lookingFor:
          "PASS means the content matches what was signed and the private key paired with the verification public key was used. FAIL means the current content is not the signed content. It does not prove a human personally clicked Sign, identify who altered it, or make the document secret.",
        completeWhen:
          "You have observed one passing verification and one failing verification.",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Verify the untouched approved report — PASS.",
          "Change the specified line.",
          "Verify again — FAIL.",
          "Optionally restore the approved wording and verify once more.",
        ],
        expectedAnswer: [
          {
            label: "PASS",
            text: "The content matches what was signed and the paired private key was used.",
          },
          {
            label: "FAIL",
            text: "The current content no longer matches the signature; do not treat it as the approved document.",
          },
        ],
        whyCorrect:
          "Verification is a statement about a specific document and a specific key pair, so any change to the content breaks the match while the document itself stays readable.",
        expectedEvidence: [
          "“Signature verification: PASSED” on the untouched report.",
          "“Signature verification: FAILED” after the line is changed.",
          "The report text remains readable throughout.",
        ],
        misconceptions: [
          {
            wrong: "PASS proves Ivy personally signed it.",
            correction:
              "It proves use of Ivy's signing key; identity depends on control and trust of that key.",
          },
          {
            wrong: "A signature encrypts the report.",
            correction: "The report remains readable.",
          },
        ],
        followUp: {
          question: "What if someone stole the private key?",
          desiredResponse:
            "They could create signatures that verify, which is why private-key custody matters.",
        },
        boundary:
          "Verification does not prove which human acted, who altered the document, or keep any content secret.",
        readyToAdvance: [
          "Both a PASS and a FAIL have been observed.",
          "Students state that the key, not the person, is what was proven.",
        ],
      },
      intro: [
        {
          id: "vx-sign-1",
          speaker: "Ivy",
          text: "This copy was approved and signed. Verify it first while it is untouched, then change one line and verify again. Watch what happens.",
          characterState: "ivy-point",
        },
      ],
      interaction: {
        id: "vx-sign-i",
        kind: "crypto-workbench",
        stationLabel: "Station 3 of 4 — Sign & verify",
        prompt: "What does a signature actually prove?",
        instruction:
          "Verify the approved report, then use the change control and verify once more.",
        modelNote:
          "Conceptual model. The signature block is illustrative teaching content, not a real signature, and no private key exists in this lab.",
        boundary:
          "a signature does not encrypt the document — the report stays fully readable. It proves the content did not change and that the matching private key was used; it cannot prove with absolute certainty which human clicked the button.",
        terms: [
          {
            term: "Signing",
            meaning: "Done with the private-key side, which stays with its owner.",
          },
          {
            term: "Verifying",
            meaning: "Done with the matching public key, which anyone may hold.",
          },
          {
            term: "Authenticity",
            meaning: "Evidence about which key approved this exact content.",
          },
          {
            term: "Integrity again",
            meaning: "Change the signed content and verification stops passing.",
          },
        ],
        station: {
          kind: "sign",
          documentTitle: "Incident report VX-4417 — approved copy",
          lines: report,
          signature: {
            label: "Signature block (illustrative)",
            value: "SIG:4417 3f7a91cc 2b48d05e 6ca17f39 88b2e4d0 (sample display value)",
            signedBy: "Ivy, Security Analyst — Vault Access Level 3",
            keyLabel: "her public key, held by the operations record",
          },
          verifyAction: "Verify signature",
          changeAction: "Change one line of the report",
          restoreAction: "Restore the approved wording",
          change: {
            lineIndex: 3,
            changedLine:
              "Action taken: No action required. Report closed without isolation.",
            note: "One line edited after approval — the rest of the document is untouched.",
          },
          results: {
            valid: {
              headline: "Verification passed",
              body: "The content matches what was signed, and it was signed with the private key that pairs with this public key. The document is still readable — signing does not hide anything.",
            },
            invalid: {
              headline: "Verification failed",
              body: "The signature no longer matches the content. Something was changed after approval. The check does not say who changed it or what the original said — only that this is not the approved content.",
            },
          },
        },
        completion: {
          headline: "Authenticity and integrity together",
          body: "A pass says the content is unchanged and the paired private key was used. A fail says: do not treat this as the approved document.",
        },
      },
      successSummary:
        "Signatures are about trust in content and key, not secrecy. The report was readable the whole time.",
      retryPrompt:
        "Use 'Reset this scene' to return to the approved copy and verify from the start.",
      explanation:
        "Verification is a statement about a key and a document, not about a person's hands. If the private key was left where someone else could use it, the signature still verifies — which is exactly why private keys stay with their owner.",
      instructorNotes: [
        "Push back gently on 'it proves Ivy did it'. It proves Ivy's key did it.",
      ],
    },

    /* ----------------------------------------- Scene 5 — Authenticate */
    {
      id: "vx-authenticate",
      title: "Station 4 — Authenticate",
      objective: "Set up a key-based SSH login without ever sending the private key.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-working",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: vaultExchangeVisuals.authenticatePrimary,
      continueLabel: "Go to the close",
      missionBrief: {
        situation:
          "Ivy must log in to the existing analyst@localhost account using a key pair, without sending her private key.",
        mission:
          "Place each key where it belongs and run the simulated login proof.",
        steps: [
          "Place the public key on the server, in analyst's authorized_keys list.",
          "Keep the private key with Ivy on her own device.",
          "Run the simulated ssh analyst@localhost proof.",
          "Read the server and client exchange line by line.",
        ],
        evidence: [
          "The server has the public key on file.",
          "The client computes the proof locally.",
          "“Proof accepted” appears in the output.",
          "The private key never travels, and the account password is not used.",
        ],
        decision: "Which key goes where, and what does the successful login prove?",
        lookingFor:
          "The public key goes on the server and may be shared. The private key stays with Ivy. A successful login proves possession of the matching private key — not transmission of it, and not absolute real-world identity.",
        completeWhen:
          "Both keys are placed correctly and the simulated login ends with “Welcome, analyst.”",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Place the public key on the server's authorized list.",
          "Keep the private key with Ivy.",
          "Run the simulated login proof.",
          "Read the exchange aloud and point out that no key material is sent.",
        ],
        expectedAnswer: [
          {
            text: "The public key belongs in analyst's authorized_keys; the private key stays with Ivy. Login proves possession of the matching private key.",
          },
        ],
        whyCorrect:
          "The server only needs the public half to pose the challenge; the answer is computed on Ivy's machine, so possession is demonstrated without disclosure.",
        expectedEvidence: [
          "The public key listed in the server panel, the private key in Ivy's panel.",
          "Output showing the proof computed locally and “Proof accepted.”",
          "“Welcome, analyst.” as the final line.",
        ],
        misconceptions: [
          {
            wrong: "Upload the private key to the server.",
            correction:
              "Never distribute the private key; the proof is computed locally.",
          },
          {
            wrong: "The key passphrase is the analyst account password.",
            correction:
              "A key passphrase protects the private-key file locally; it is not the remote account password.",
          },
        ],
        followUp: {
          question: "What crossed the network?",
          desiredResponse: "A cryptographic proof, not the private key.",
        },
        boundary:
          "A successful login proves key possession, not the real-world identity of the person holding the key.",
        readyToAdvance: [
          "Both keys are placed correctly.",
          "The successful login output has been read.",
          "Students state that possession — not transmission — was proven.",
        ],
      },
      intro: [
        {
          id: "vx-auth-1",
          speaker: "Ivy",
          text: "Same analyst account, same VM, same localhost session you used in Week 6. Only the way I prove who I am changes.",
          characterState: "ivy-working",
        },
        {
          id: "vx-auth-2",
          speaker: "Ivy",
          text: "One of these belongs on the server. One of them never leaves my side. Place them.",
        },
      ],
      interaction: {
        id: "vx-auth-i",
        kind: "crypto-workbench",
        stationLabel: "Station 4 of 4 — Authenticate",
        prompt: "Which key goes on the server?",
        instruction:
          "Place each item where it belongs, then run the simulated login proof.",
        modelNote:
          "Conceptual model. No key material exists in this lab — the labels below are descriptions, not keys — and the login output is authored, not a real SSH session.",
        boundary:
          "public-key authentication proves the person logging in holds the matching private key. It does not encrypt your files, and the key's passphrase is a separate thing from the analyst account password.",
        terms: [
          {
            term: "Public key",
            meaning: "Safe to share. It is placed on the servers you want to log in to.",
          },
          {
            term: "Private key",
            meaning:
              "Stays with its owner and never travels to the server. It is not sent during login.",
          },
          {
            term: "authorized_keys",
            meaning:
              "A file in the account on the server that lists the public keys allowed to log in as that account.",
          },
          {
            term: "Key passphrase",
            meaning:
              "Unlocks the private key on your own machine. It is not the analyst account password, and the server never sees it.",
          },
        ],
        station: {
          kind: "authenticate",
          serverLabel: "Analyst account on the VM · ~/.ssh/authorized_keys",
          serverDetail:
            "Same localhost VM as Week 6. This file lists public keys that may log in as the analyst account.",
          keeperLabel: "Stays with Ivy",
          keeperDetail:
            "Held on her own machine, unlocked by a passphrase only she knows. Nothing here is displayed or stored by this lab.",
          items: [
            {
              id: "vx-auth-public",
              label: "Ivy's public key (description only)",
              detail:
                "The shareable half of the pair. Anyone may hold a copy without gaining access.",
              correctPlacement: "server",
              responses: {
                server:
                  "Correct. Listing the public key in authorized_keys tells the server: whoever can prove they hold the matching private key may log in as this account.",
                keeper:
                  "It can stay with her too, but the server needs a copy — otherwise there is nothing for it to check the login against.",
              },
            },
            {
              id: "vx-auth-private",
              label: "Ivy's private key (description only)",
              detail:
                "The half that proves identity. It is never transmitted to the server during login.",
              correctPlacement: "keeper",
              responses: {
                server:
                  "No. A private key sent to a server is a private key you no longer control. It never travels — the proof happens on Ivy's machine.",
                keeper:
                  "Correct. It stays with her, and login works by proving she holds it — not by handing it over.",
              },
            },
          ],
          connect: {
            action: "Run the simulated login proof",
            command: "ssh analyst@localhost",
            output: [
              "Server: I have a public key on file for 'analyst'. Prove you hold the matching private key.",
              "Client: (proof computed locally — no private key is sent)",
              "Server: Proof accepted.",
              "Welcome, analyst. Last login: today from localhost",
            ],
            verdict:
              "The login succeeded without the private key ever leaving Ivy's machine, and without the analyst account password being used.",
          },
        },
        completion: {
          headline: "Possession, proven",
          body: "The server checked a public key it already had. Ivy proved possession of the private half. Same VM, same account — only the authentication method changed.",
        },
      },
      successSummary:
        "Public keys are for sharing. Private keys are for keeping. Login proves possession, not transmission.",
      retryPrompt: "Use 'Reset this scene' to empty the authorized list and place again.",
      explanation:
        "Week 6 logged in with a password the server had to check. Here the server checks a proof instead, using a public key it already trusts for that account. Nothing secret crosses the network either way.",
      instructorNotes: [
        "If someone asks to see a key: no key material is generated or displayed anywhere in this lab, and no command here prints private-key contents.",
      ],
    },

    /* ------------------------------------------------ Scene 6 — Close */
    {
      id: "vx-close",
      title: "Close — four tools, four jobs",
      objective: "Match each security need to the tool that actually solves it.",
      environmentId: "vault-exchange-workbench",
      characterState: "ivy-briefing",
      hideCharacterFigure: true,
      flatPresentation: true,
      visual: vaultExchangeVisuals.closingRecap,
      continueLabel: "End of experience",
      missionBrief: {
        situation:
          "The same report passed through four stations because each tool solves a different security problem.",
        mission:
          "Review and match each need to the correct tool, then open the Week 9 bridge question.",
        steps: [
          "Read each row of the recap table.",
          "Say the tool and the property it provides out loud.",
          "Open next week's question.",
        ],
        evidence: [
          "Keep content unreadable → Encryption → Confidentiality.",
          "Detect whether content changed → Hashing / digest comparison → Integrity.",
          "Verify signed content and the paired signing key → Digital signature verification → Integrity plus key-based authenticity.",
          "Prove possession during login → Public-key authentication → Authentication and key possession.",
        ],
        decision: "What remains unresolved after learning how to use a public key?",
        lookingFor:
          "Knowing how to use a public key does not prove who owns it. The remaining question is how to trust that a public key belongs to the claimed person or system.",
        completeWhen:
          "The four mappings are reviewed and you reveal the Week 9 Trust Authority question. We do not answer it this week.",
      },
      instructorAnswerGuide: {
        actionSequence: [
          "Walk the four recap rows in order.",
          "Ask the room to name the property each tool provides.",
          "Reveal the Week 9 bridge question and stop there.",
        ],
        expectedAnswer: [
          { text: "Keep content unreadable → Encryption → Confidentiality." },
          {
            text: "Detect whether content changed → Hashing / digest comparison → Integrity.",
          },
          {
            text: "Verify signed content and paired signing key → Digital signature verification → Integrity plus key-based authenticity.",
          },
          {
            text: "Prove possession during login → Public-key authentication → Authentication / key possession.",
          },
        ],
        whyCorrect:
          "Each station answered one distinct question, so each need maps to exactly one tool and one security property.",
        expectedEvidence: [
          "The four-row recap table displayed in full.",
          "The Week 9 Trust Authority question revealed after the reveal action.",
        ],
        misconceptions: [
          {
            wrong: "One tool does all four jobs.",
            correction: "Each tool answers a different question.",
          },
          {
            wrong: "A valid public key proves who owns it.",
            correction:
              "The cryptographic relationship works, but ownership and trust are still unresolved.",
          },
        ],
        followUp: {
          question: "What is the Week 9 question?",
          desiredResponse:
            "How do I know this public key really belongs to the claimed person or system?",
        },
        boundary:
          "None of these four tools establishes who owns a key. Certificates and certificate authorities are Week 9 — do not answer that question today.",
        readyToAdvance: [
          "The four mappings are clear to the room.",
          "The Trust Authority question is revealed and left unanswered.",
        ],
      },
      intro: [
        {
          id: "vx-close-1",
          speaker: "Ivy",
          text: "One report, four stations, four different problems. None of these tools replaces another.",
          characterState: "ivy-briefing",
        },
      ],
      interaction: {
        id: "vx-close-i",
        kind: "crypto-workbench",
        stationLabel: "Close — recap and next week",
        prompt: "What each tool is actually for",
        instruction:
          "Read the recap, then open the question we are carrying into Week 9.",
        modelNote:
          "Everything in this experience was a clearly labelled conceptual model, built for understanding rather than for operational use.",
        boundary:
          "these four tools cover secrecy, change detection, approval evidence and login proof. Deciding whether a key really belongs to the person who sent it is a separate problem — and it is next week's.",
        terms: [],
        station: {
          kind: "recap",
          rows: [
            {
              goal: "Protect confidentiality",
              tool: "Encryption",
              detail: "Readable becomes unreadable, and back again for the right person.",
            },
            {
              goal: "Detect change",
              tool: "Hashing",
              detail: "One character differs, the whole digest differs.",
            },
            {
              goal: "Prove the signing/key relationship",
              tool: "Digital signature",
              detail:
                "Content unchanged, and approved with the matching private key. Still readable.",
            },
            {
              goal: "Prove possession for SSH login",
              tool: "Public-key authentication",
              detail:
                "Public key on the server, private key never leaves its owner.",
            },
          ],
          revealAction: "Open next week's question",
          bridge: {
            question:
              "I know how to use this public key — but how do I know it actually belongs to the person who sent it?",
            note: "That is the Trust Authority question, and it is the bridge into Week 9. We are not answering it today.",
          },
        },
        completion: {
          headline: "Week 8 complete",
          body: "You can now say which tool solves which problem — and you have a precise question to bring to Week 9.",
        },
      },
      successSummary:
        "Four tools, four jobs, one open question about trust.",
      retryPrompt:
        "Use 'Reset this scene' to hide the closing question, or 'Back' to revisit any station.",
      explanation:
        "Each station answered a different question: can they read it, did it change, who approved it, and can this login prove possession. Trust in the key itself is the missing piece.",
      instructorNotes: [
        "Close on the question, not an answer. Let it sit until Week 9.",
      ],
    },
  ],
};
