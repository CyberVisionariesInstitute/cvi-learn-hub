/**
 * CyberFoundations — Module 4, Week 10
 * "Cloud Heights Family Clinic — Risk & Threat Investigation"
 *
 * Fully authored, fictional teaching case. Every name, address, host name and
 * document here is invented for instruction and uses reserved `.example`
 * names. There is no real patient data, no live host, and nothing here is
 * executed: all "system output" is authored text, not captured output.
 *
 * Content lives here; presentation lives in src/components/week10.
 */

export const WEEK10_ROUTES = {
  overview: "/cyberfoundations/week-10",
  lab1: "/cyberfoundations/week-10/lab-1",
  lab2: "/cyberfoundations/week-10/lab-2",
  instructor: "/cyberfoundations/week-10/instructor",
} as const;

export const scenarioDate = "Friday 13 March 2026, 09:00 (clinic local time)";

export type RoomId =
  | "reception"
  | "records"
  | "workstations"
  | "website"
  | "backup";

export interface EvidenceCard {
  /** Stable ID. Student findings and exports reference these forever. */
  id: string;
  roomId: RoomId;
  title: string;
  /** What the learner is literally looking at. Facts only. */
  detail: string[];
  /** What is *not* known from this evidence. Never assumed either way. */
  unknowns?: string[];
  kind: "document" | "statement" | "system-report" | "photo" | "certificate";
}

export interface Room {
  id: RoomId;
  name: string;
  /** Plain-language reason the room exists in the clinic. */
  purpose: string;
  /** Position on the floor plan, % of the plan box. */
  plan: { x: number; y: number; w: number; h: number };
  staff: { name: string; role: string; statement: string };
  evidenceIds: string[];
  /** ELI5 orientation shown before any jargon. */
  plainIntro: string;
}

export interface ClinicAsset {
  id: string;
  name: string;
  purpose: string;
  /** Why confidentiality / integrity / availability matter for this asset. */
  cia: { confidentiality: string; integrity: string; availability: string };
  roomIds: RoomId[];
}

export interface ThreatEvent {
  id: string;
  name: string;
  plain: string;
  assetId: string;
  evidenceIds: string[];
}

export interface GlossaryTerm {
  term: string;
  plain: string;
  precise: string;
}

/* ------------------------------------------------------------------ */
/* The clinic                                                          */
/* ------------------------------------------------------------------ */

export const clinicProfile = {
  name: "Cloud Heights Family Clinic",
  blurb:
    "A single-location family clinic with 12 staff. It books appointments, keeps patient records, uses staff laptops, publishes a small public information website, and copies its records to a backup drive.",
  facts: [
    "12 staff: 1 practice manager, 2 clinicians, 3 nurses, 4 reception/scheduling staff, 1 billing clerk, 1 part-time IT contractor (one day a week).",
    "Appointment system: a hosted scheduling service, signed in with an email address and password. No second step at sign-in.",
    "Patient records: a records application on the clinic network. Reception staff reach it through one shared account.",
    "Staff laptops: 9 clinic-owned laptops, managed loosely by the part-time IT contractor.",
    "Public website: static information pages (address, opening hours, services). It does not contain or reach patient records.",
    "Backups: one external drive kept plugged into the reception workstation.",
  ],
  boundaries: [
    "Everything in this case is fictional. No real clinic, patient, address, or mailbox is involved.",
    "Nothing in this lab scans, connects to, or attacks anything. All output shown is authored teaching text.",
    "Where a fact is not known, the case says so. Unknown never means 'secure' and never means 'already breached'.",
  ],
};

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export const evidence: EvidenceCard[] = [
  /* -------------------------------------------------- Reception */
  {
    id: "EV-REC-01",
    roomId: "reception",
    kind: "document",
    title: "Email received at the reception mailbox",
    detail: [
      "From: Clinic IT Support <appointments@clinic-support.example>",
      "To: reception@cloudheights-clinic.example",
      "Received: 13 March 2026, 07:58",
      "Subject: URGENT — scheduling account will be closed today",
      "Body: \"Our records show your scheduling password has expired. Confirm your username and current password within 2 hours at https://account-verify.clinic-support.example/reset or the appointment system will be locked for your whole clinic today.\"",
      "The message is shown here as inert text. The address is not a working link and nothing is sent anywhere.",
    ],
    unknowns: [
      "Whether anyone at the clinic replied or entered a password is not recorded anywhere in this case.",
    ],
  },
  {
    id: "EV-REC-02",
    roomId: "reception",
    kind: "statement",
    title: "Sender address comparison card",
    detail: [
      "The clinic's real scheduling vendor writes from: support@appointments-vendor.example",
      "The clinic's own domain is: cloudheights-clinic.example",
      "The message arrived from: clinic-support.example — a third, different domain.",
      "The display name says \"Clinic IT Support\". The display name is typed by the sender and is not proof of who sent it.",
    ],
  },
  {
    id: "EV-REC-03",
    roomId: "reception",
    kind: "statement",
    title: "Reception desk log note",
    detail: [
      "Log note, 13 March 2026: \"Third message like this in three weeks. Everyone at the front desk gets them. We just delete them.\"",
      "Reception scheduling accounts sign in with an email address and a password only.",
    ],
    unknowns: [
      "There is no record of these messages ever being reported to the IT contractor.",
    ],
  },

  /* -------------------------------------------------- Records office */
  {
    id: "EV-REC-OFF-01",
    roomId: "records",
    kind: "system-report",
    title: "Records application account list",
    detail: [
      "Accounts with access to patient records: 4 clinician/nurse accounts (named), 1 billing account (named), 1 account named `frontdesk`.",
      "`frontdesk` is the account all four reception staff sign in with. The password is written on a card in the desk drawer.",
      "Last password change on `frontdesk`: 8 months ago.",
    ],
  },
  {
    id: "EV-REC-OFF-02",
    roomId: "records",
    kind: "system-report",
    title: "Records access log extract",
    detail: [
      "12 March 2026 14:02 — user `frontdesk` opened 6 patient records.",
      "12 March 2026 16:41 — user `frontdesk` opened 2 patient records.",
      "Every reception-side entry in the log shows `frontdesk`. The log cannot show which of the four people was at the keyboard.",
    ],
    unknowns: [
      "Whether those record openings were appropriate cannot be judged from this log, because the log does not identify a person.",
    ],
  },
  {
    id: "EV-REC-OFF-03",
    roomId: "records",
    kind: "statement",
    title: "Practice manager statement — leavers",
    detail: [
      "Renata Coyle, Practice Manager: \"When a front desk person leaves we collect their badge. The shared records login stays the same, because changing it means telling everyone the new password.\"",
      "Two reception staff have left in the past year.",
    ],
    unknowns: [
      "Whether a former member of staff can still reach the records application from outside the clinic is not established by this evidence.",
    ],
  },

  /* -------------------------------------------------- Staff workspace */
  {
    id: "EV-WKS-01",
    roomId: "workstations",
    kind: "system-report",
    title: "Update status report (IT contractor, 13 March 2026)",
    detail: [
      "9 clinic laptops checked.",
      "7 laptops: vendor security updates applied within the last 14 days.",
      "2 laptops (asset tags CHC-04, CHC-07): no security updates applied for 90 days. Vendor security updates are listed as pending.",
      "Both pending laptops are used daily for email and for the records application.",
    ],
    unknowns: [
      "No alert, no malware detection, and no incident has been reported for these laptops. Missing updates is a weakness, not a confirmed attack.",
    ],
  },
  {
    id: "EV-WKS-02",
    roomId: "workstations",
    kind: "statement",
    title: "IT contractor statement",
    detail: [
      "Dev Marchetti, IT contractor (1 day/week): \"Updates need a restart, and those two laptops are in constant use. Staff keep postponing. Nobody owns chasing it.\"",
    ],
  },
  {
    id: "EV-WKS-03",
    roomId: "workstations",
    kind: "photo",
    title: "Desk photo — signed-in laptop",
    detail: [
      "Photo taken in the shared staff workspace at 09:00: a laptop is signed in to the records application, screen unlocked, no one seated.",
      "The workspace door opens onto the corridor patients use to reach the waiting area.",
    ],
  },

  /* -------------------------------------------------- Website station */
  {
    id: "EV-WEB-01",
    roomId: "website",
    kind: "certificate",
    title: "Website certificate details (captured 13 March 2026)",
    detail: [
      "Subject: www.cloudheights-clinic.example",
      "Subject Alternative Name: www.cloudheights-clinic.example, cloudheights-clinic.example",
      "Issuer: Cloud Heights Teaching CA (fictional issuer used for this lesson)",
      "Valid from: 20 December 2025, 00:00 UTC",
      "Valid to: 20 March 2026, 23:59 UTC",
      "At the scenario date of 13 March 2026 the certificate is valid. It expires in 7 days.",
    ],
  },
  {
    id: "EV-WEB-02",
    roomId: "website",
    kind: "statement",
    title: "Renewal process note",
    detail: [
      "Renewal is done by hand. The last two renewals were done by the IT contractor on the day the site started warning visitors.",
      "There is no calendar reminder and no named owner for renewal in the clinic's records.",
    ],
  },
  {
    id: "EV-WEB-03",
    roomId: "website",
    kind: "document",
    title: "What the public website actually holds",
    detail: [
      "Pages: address and map, opening hours, list of services, a phone number, and a 'how to register' page.",
      "The website has no sign-in, no patient portal, and no connection to the records application.",
      "If the certificate expires, visitors' browsers show a warning before the page. The pages themselves are still just public information.",
    ],
    unknowns: [
      "A certificate expiring does not, by itself, expose patient records. Those are a separate system.",
    ],
  },

  /* -------------------------------------------------- Backup room */
  {
    id: "EV-BAK-01",
    roomId: "backup",
    kind: "system-report",
    title: "Backup job history",
    detail: [
      "Backup target: one external drive, letter D:, permanently attached to the reception workstation.",
      "Last successful backup: 27 February 2026 (14 days before the scenario date).",
      "Since then: 6 job entries reading 'completed with errors — source in use'.",
      "There are no copies anywhere else: no second drive, no offsite copy, no cloud copy.",
    ],
  },
  {
    id: "EV-BAK-02",
    roomId: "backup",
    kind: "statement",
    title: "Restore testing statement",
    detail: [
      "Renata Coyle, Practice Manager: \"We have never tried to put the data back. We assume it works because the light blinks.\"",
      "No restoration test is recorded in any clinic document.",
    ],
    unknowns: [
      "Because no restore has ever been attempted, whether the copies would actually work is unknown. Unknown is not the same as broken and not the same as fine.",
    ],
  },
  {
    id: "EV-BAK-03",
    roomId: "backup",
    kind: "photo",
    title: "Backup drive photo",
    detail: [
      "The drive sits on the desk beside the reception workstation, plugged in by USB, powered on.",
      "Anything that can write to the reception workstation's files can also write to this drive while it is attached.",
    ],
  },
];

export function evidenceById(id: string): EvidenceCard | undefined {
  return evidence.find((e) => e.id === id);
}

/* ------------------------------------------------------------------ */
/* Rooms                                                               */
/* ------------------------------------------------------------------ */

export const rooms: Room[] = [
  {
    id: "reception",
    name: "Reception",
    purpose: "Books appointments, greets patients, answers the clinic mailbox.",
    plainIntro:
      "This is the front desk. People here answer email all day, which means they are the part of the clinic strangers can reach most easily.",
    plan: { x: 4, y: 8, w: 40, h: 40 },
    staff: {
      name: "Priya Osei",
      role: "Reception & Scheduling Lead",
      statement:
        "I had a message this morning saying our scheduling account closes in two hours unless I confirm the password. It looked official, but the address underneath was not our usual one. We get something like this most weeks.",
    },
    evidenceIds: ["EV-REC-01", "EV-REC-02", "EV-REC-03"],
  },
  {
    id: "records",
    name: "Records Office",
    purpose: "Holds the patient records application used across the clinic.",
    plainIntro:
      "This is where patient information lives. The question here is not only who can get in, but whether the clinic can tell who did.",
    plan: { x: 48, y: 8, w: 48, h: 26 },
    staff: {
      name: "Renata Coyle",
      role: "Practice Manager",
      statement:
        "All four of my front desk people sign in to records the same way, with the same login. It is quicker. When someone leaves we take their badge back, but that login stays as it is.",
    },
    evidenceIds: ["EV-REC-OFF-01", "EV-REC-OFF-02", "EV-REC-OFF-03"],
  },
  {
    id: "workstations",
    name: "Staff Workspace",
    purpose: "Shared desks where clinicians and nurses use clinic laptops.",
    plainIntro:
      "Laptops are the tools staff actually touch. Software updates are the boring maintenance that keeps known holes closed.",
    plan: { x: 48, y: 38, w: 48, h: 26 },
    staff: {
      name: "Dev Marchetti",
      role: "IT Contractor (one day a week)",
      statement:
        "Two laptops have not taken security updates in 90 days. Nobody is refusing; they just postpone the restart every day, and no one is responsible for chasing it.",
    },
    evidenceIds: ["EV-WKS-01", "EV-WKS-02", "EV-WKS-03"],
  },
  {
    id: "website",
    name: "Website Station",
    purpose: "Publishes the clinic's public information pages.",
    plainIntro:
      "The public website is the clinic's shop window. It tells people where to come and when. It is not where records are kept.",
    plan: { x: 4, y: 52, w: 40, h: 22 },
    staff: {
      name: "Amara Boateng",
      role: "Billing Clerk & Website Editor",
      statement:
        "I update opening hours on the site. The security certificate gets renewed by hand, usually after someone notices a warning in their browser. It is not on anyone's list.",
    },
    evidenceIds: ["EV-WEB-01", "EV-WEB-02", "EV-WEB-03"],
  },
  {
    id: "backup",
    name: "Backup Room",
    purpose: "Stores the clinic's only copy of its records data.",
    plainIntro:
      "A backup is a spare copy you can put back. A copy you have never put back is a promise, not a proof.",
    plan: { x: 4, y: 78, w: 92, h: 16 },
    staff: {
      name: "Renata Coyle",
      role: "Practice Manager",
      statement:
        "The backup drive stays plugged in so it runs by itself. The last clean run was two weeks ago and we have never tested putting anything back.",
    },
    evidenceIds: ["EV-BAK-01", "EV-BAK-02", "EV-BAK-03"],
  },
];

export function roomById(id: RoomId): Room {
  return rooms.find((r) => r.id === id)!;
}

/* ------------------------------------------------------------------ */
/* Assets and threat events                                            */
/* ------------------------------------------------------------------ */

export const assets: ClinicAsset[] = [
  {
    id: "AS-01",
    name: "Appointment scheduling account",
    purpose: "Books, moves and cancels patient appointments for the whole clinic.",
    roomIds: ["reception"],
    cia: {
      confidentiality:
        "The schedule shows who is coming in and when, which is itself information about patients.",
      integrity:
        "Changed or deleted appointments send patients to the wrong place at the wrong time.",
      availability:
        "If reception cannot sign in, the clinic cannot run its day.",
    },
  },
  {
    id: "AS-02",
    name: "Patient records application",
    purpose: "Stores and shows clinical information about patients.",
    roomIds: ["records", "workstations"],
    cia: {
      confidentiality: "Patient information must only be seen by people with a reason.",
      integrity: "A wrong or altered record can lead to a wrong clinical decision.",
      availability: "Clinicians need the record during the appointment, not later.",
    },
  },
  {
    id: "AS-03",
    name: "Staff laptops",
    purpose: "The devices staff use to reach email and the records application.",
    roomIds: ["workstations"],
    cia: {
      confidentiality: "A laptop signed in and unattended shows whatever is on screen.",
      integrity: "Software with known weaknesses can be used to change what runs on the device.",
      availability: "A laptop out of action takes a clinician out of action.",
    },
  },
  {
    id: "AS-04",
    name: "Public information website",
    purpose: "Tells the public the address, hours and services of the clinic.",
    roomIds: ["website"],
    cia: {
      confidentiality:
        "Low — the content is meant to be public. The certificate protects the connection, not a secret.",
      integrity: "Wrong hours or a wrong phone number sends patients to a closed door.",
      availability:
        "If browsers warn or block visitors, people cannot reliably reach basic clinic information.",
    },
  },
  {
    id: "AS-05",
    name: "Backup archive",
    purpose: "The copy of clinic data used to recover after loss or damage.",
    roomIds: ["backup"],
    cia: {
      confidentiality: "A backup holds the same sensitive data as the original.",
      integrity: "A copy that is incomplete or corrupted restores the wrong thing.",
      availability: "Recovery is the whole point: a copy you cannot restore is not recovery.",
    },
  },
];

export const threatEvents: ThreatEvent[] = [
  {
    id: "TH-01",
    name: "Phishing leads to scheduling account takeover",
    plain:
      "Someone tricks a member of staff into typing the scheduling password into a fake page, then signs in as them.",
    assetId: "AS-01",
    evidenceIds: ["EV-REC-01", "EV-REC-02", "EV-REC-03"],
  },
  {
    id: "TH-02",
    name: "Unattributable or unauthorised access to patient records",
    plain:
      "Records are opened by someone who should not open them — and the clinic cannot tell who did it.",
    assetId: "AS-02",
    evidenceIds: ["EV-REC-OFF-01", "EV-REC-OFF-02", "EV-REC-OFF-03"],
  },
  {
    id: "TH-03",
    name: "Malware or misuse of a known software weakness on an out-of-date laptop",
    plain:
      "A laptop missing security updates is easier to take over, because the holes it still has are publicly known.",
    assetId: "AS-03",
    evidenceIds: ["EV-WKS-01", "EV-WKS-02", "EV-WKS-03"],
  },
  {
    id: "TH-04",
    name: "Certificate expiry disrupts trusted access to the public website",
    plain:
      "The certificate runs out, browsers warn visitors, and people stop trusting or reaching the clinic's public information.",
    assetId: "AS-04",
    evidenceIds: ["EV-WEB-01", "EV-WEB-02", "EV-WEB-03"],
  },
  {
    id: "TH-05",
    name: "Loss of recoverable backups",
    plain:
      "Data is lost or encrypted by an attacker, and the only copy is stale, untested, or was attached to the same machine.",
    assetId: "AS-05",
    evidenceIds: ["EV-BAK-01", "EV-BAK-02", "EV-BAK-03"],
  },
];

/* ------------------------------------------------------------------ */
/* Vocabulary — plain language first, precise wording second           */
/* ------------------------------------------------------------------ */

export const glossary: GlossaryTerm[] = [
  {
    term: "Asset",
    plain: "Something the clinic needs in order to work, or needs to protect.",
    precise:
      "An asset is anything of value to the organisation: data, a system, a device, or a service.",
  },
  {
    term: "Threat / threat event",
    plain: "The bad thing that could happen, and who or what could cause it.",
    precise:
      "A threat event is a specific occurrence that could harm an asset, described as actor + action.",
  },
  {
    term: "Vulnerability",
    plain: "The weak spot that would let the bad thing happen.",
    precise:
      "A vulnerability is a weakness in a system, process, or practice that a threat can act on.",
  },
  {
    term: "Consequence / impact",
    plain: "What it costs the clinic and its patients if it happens.",
    precise:
      "Impact is the effect on operations, people, data and obligations if the event occurs.",
  },
  {
    term: "Likelihood",
    plain: "How believable it is that this happens here, given what you found.",
    precise:
      "A qualitative judgement based on exposure, weaknesses present, and protections already in place.",
  },
  {
    term: "Risk",
    plain: "The combination of how believable it is and how bad it would be.",
    precise:
      "Risk here is expressed as a classroom score: likelihood x impact, each rated 1 to 3.",
  },
  {
    term: "Control",
    plain: "The thing you change so the bad outcome gets less likely or less painful.",
    precise:
      "A control is a safeguard applied to reduce likelihood, reduce impact, or improve detection.",
  },
  {
    term: "Residual risk",
    plain: "What is still left over after your fix is in place.",
    precise:
      "The risk remaining once a control is operating. It is described here in words, not invented numbers.",
  },
  {
    term: "CIA",
    plain: "Three questions: kept private? correct? available when needed?",
    precise: "Confidentiality, Integrity and Availability.",
  },
  {
    term: "Attribution",
    plain: "Being able to say which person did something.",
    precise:
      "Attribution requires individually identified accounts; shared accounts remove it.",
  },
];

/* ------------------------------------------------------------------ */
/* Printable case packet                                               */
/* ------------------------------------------------------------------ */

export function casePacketMarkdown(): string {
  const lines: string[] = [];
  lines.push(`# Cloud Heights Family Clinic — Case Packet`);
  lines.push("");
  lines.push(`Scenario date: ${scenarioDate}`);
  lines.push("");
  lines.push(clinicProfile.blurb);
  lines.push("");
  lines.push("## Clinic facts");
  clinicProfile.facts.forEach((f) => lines.push(`- ${f}`));
  lines.push("");
  lines.push("## Boundaries of this exercise");
  clinicProfile.boundaries.forEach((b) => lines.push(`- ${b}`));
  lines.push("");
  lines.push("## Assets");
  assets.forEach((a) => {
    lines.push(`### ${a.id} — ${a.name}`);
    lines.push(a.purpose);
    lines.push(`- Confidentiality: ${a.cia.confidentiality}`);
    lines.push(`- Integrity: ${a.cia.integrity}`);
    lines.push(`- Availability: ${a.cia.availability}`);
    lines.push("");
  });
  lines.push("## Rooms and evidence");
  rooms.forEach((room) => {
    lines.push(`### ${room.name}`);
    lines.push(room.purpose);
    lines.push(`> ${room.staff.name} (${room.staff.role}): "${room.staff.statement}"`);
    lines.push("");
    room.evidenceIds.forEach((id) => {
      const card = evidenceById(id);
      if (!card) return;
      lines.push(`**${card.id} — ${card.title}**`);
      card.detail.forEach((d) => lines.push(`- ${d}`));
      (card.unknowns ?? []).forEach((u) => lines.push(`- Not known: ${u}`));
      lines.push("");
    });
  });
  lines.push("## Vocabulary");
  glossary.forEach((g) => {
    lines.push(`- **${g.term}** — ${g.plain} (${g.precise})`);
  });
  lines.push("");
  lines.push(
    "All content is fictional teaching material. Nothing in this packet was captured from a real system.",
  );
  return lines.join("\n");
}
