import type { Experience } from "../types";

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
      continueLabel: "Go to Station 1",
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
      continueLabel: "Go to Station 2",
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
      continueLabel: "Go to Station 3",
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
      continueLabel: "Go to Station 4",
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
      continueLabel: "Go to the close",
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
      continueLabel: "End of experience",
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
