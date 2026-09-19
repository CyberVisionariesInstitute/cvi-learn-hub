/**
 * Week 10 instructor answer material — SERVER ONLY.
 *
 * The `.server.ts` filename keeps this module out of every client bundle.
 * It is reached only through the authenticated, role-checked server function
 * in week10-instructor.functions.ts, so it can never appear in a student
 * download or in an anonymous response.
 */

export interface AnswerRow {
  scenarioId: string;
  asset: string;
  evidenceIds: string[];
  threat: string;
  vulnerability: string;
  consequence: string;
  cia: string;
  unknown: string;
  likelihood: { value: number; why: string };
  impact: { value: number; why: string };
  control: string;
  howItHelps: string;
  residual: string;
  acceptableAlternatives: string[];
}

export interface RoomGuide {
  roomId: string;
  facilitatorPrompt: string;
  sayThis: string;
  reveals: { evidenceId: string; interpretation: string }[];
  ciaLink: string;
  misconceptions: { wrong: string; correction: string }[];
  readyToAdvance: string[];
}

export interface Week10InstructorKey {
  runOfShow: { minutes: string; segment: string; detail: string }[];
  rooms: RoomGuide[];
  answerRegister: AnswerRow[];
  emailAnswer: {
    signs: string[];
    safeStep: string;
    proofBoundary: string;
    acceptableAlternatives: string[];
  };
  sampleBriefing: string;
  rubric: {
    criterion: string;
    lookFor: string;
    strong: string;
    developing: string;
  }[];
  gradingStance: string[];
}

export const week10InstructorKey: Week10InstructorKey = {
  gradingStance: [
    "Grade the reasoning, not the number. A 2x3 with evidence-backed justification is stronger work than a 3x3 with none.",
    "Any priority pair is acceptable if the learner explains it from evidence. Ties are fine.",
    "Reject unsupported certainty in either direction: 'we were definitely hacked' and 'this is all fine' are both wrong for the same reason.",
    "Vocabulary is taught gently. If a learner writes the right idea with the wrong word, name the word and keep the credit.",
  ],

  runOfShow: [
    {
      minutes: "0–5",
      segment: "Framing",
      detail:
        "Name the shift: earlier weeks were commands, firewalls, keys and certificates. This week asks what any of that is worth to a business. Show the floor plan; say nobody is hacking anything today.",
    },
    {
      minutes: "5–20",
      segment: "Room sweep (Lab 1, part 1)",
      detail:
        "Visit rooms in order: Reception, Records, Workspace, Website, Backup. At each, read the staff statement aloud, open one evidence card, ask for a prediction before revealing your interpretation.",
    },
    {
      minutes: "20–40",
      segment: "Scenario table (Lab 1, part 2)",
      detail:
        "Learners build five rows. Walk the room. Use the worked example only as a shape; it deliberately does not fill an assessed row.",
    },
    {
      minutes: "40–50",
      segment: "Email analysis",
      detail:
        "Three warning signs and one safe step. Insist on the distinction: suspicious message received is not the same as account compromised.",
    },
    {
      minutes: "50–75",
      segment: "Lab 2 — ratings and matrix",
      detail:
        "Rate likelihood and impact against the rubric shown in the UI. Compare two learners with different numbers and identical evidence; discuss why both can be defensible.",
    },
    {
      minutes: "75–95",
      segment: "Priorities, controls, briefing",
      detail:
        "Top two, one control each, remaining risk in words. Briefing is written to the practice manager, not to a security team.",
    },
    {
      minutes: "95–105",
      segment: "Close and hand off",
      detail:
        "Collect downloads. Preview Week 11: identity and access management is the deep answer to the shared-login finding they just made.",
    },
  ],

  rooms: [
    {
      roomId: "reception",
      facilitatorPrompt:
        "Before I open this message — what would make you believe it, and what would make you doubt it?",
      sayThis:
        "Reception is the easiest part of any clinic to reach from the outside. You do not need a network to get here; you need an email address.",
      reveals: [
        {
          evidenceId: "EV-REC-01",
          interpretation:
            "Evidence: urgency ('2 hours'), a password request, and a link to an address the clinic does not own. Interpretation: this is a credential phishing attempt against the scheduling account. It is an attempt, not an outcome.",
        },
        {
          evidenceId: "EV-REC-02",
          interpretation:
            "Evidence: three different domains — vendor, clinic, sender. Interpretation: the sender domain matches neither party. The display name is attacker-controlled text and proves nothing.",
        },
        {
          evidenceId: "EV-REC-03",
          interpretation:
            "Evidence: weekly repetition, password-only sign-in, no reporting route. Interpretation: exposure is routine and there is no second factor behind the password, so one successful trick is enough.",
        },
      ],
      ciaLink:
        "Confidentiality (who is coming in, and when) and availability (a clinic that cannot open its schedule cannot run the day).",
      misconceptions: [
        {
          wrong: "'They got in.'",
          correction:
            "Nothing in the evidence records a reply or a sign-in. Say 'a credential phishing attempt was received', then say what you would check to find out more.",
        },
        {
          wrong: "'Just delete it, problem solved.'",
          correction:
            "Deleting ends one message. It leaves the weakness — password-only sign-in with no reporting route — exactly as it was.",
        },
      ],
      readyToAdvance: [
        "Learner can point at the sender domain as the evidence, not the tone.",
        "Learner separates attempt from compromise in their own words.",
      ],
    },
    {
      roomId: "records",
      facilitatorPrompt:
        "The log is complete and nothing is missing from it. So why can this log not answer 'who opened that record?'",
      sayThis:
        "A shared login is not just a password problem. It is an accountability problem: the system is working perfectly and still cannot name a person.",
      reveals: [
        {
          evidenceId: "EV-REC-OFF-01",
          interpretation:
            "Evidence: one `frontdesk` account for four people, password on a card, unchanged for 8 months. Interpretation: no individual identity, no individual revocation.",
        },
        {
          evidenceId: "EV-REC-OFF-02",
          interpretation:
            "Evidence: every reception entry reads `frontdesk`. Interpretation: attribution is impossible by design. You cannot investigate misuse you cannot attribute.",
        },
        {
          evidenceId: "EV-REC-OFF-03",
          interpretation:
            "Evidence: badges collected, shared login unchanged, two leavers. Interpretation: departure does not remove access. Whether a leaver can still reach the system from outside is not established — say so rather than assuming.",
        },
      ],
      ciaLink:
        "Confidentiality (records seen without a reason) and integrity (changes that cannot be traced to a person).",
      misconceptions: [
        {
          wrong: "'Just change the shared password.'",
          correction:
            "That removes leavers for a while and still leaves four people indistinguishable. Individual accounts are the control; a password rotation is a stopgap.",
        },
        {
          wrong: "'The log proves nothing bad happened.'",
          correction: "The log cannot show a person, so it can neither prove nor disprove misuse.",
        },
      ],
      readyToAdvance: [
        "Learner uses the word attribution, or describes it accurately without the word.",
        "Learner treats leaver access as a question raised by the evidence, not a confirmed breach.",
      ],
    },
    {
      roomId: "workstations",
      facilitatorPrompt:
        "Ninety days of missing updates. What does that tell us, and what does it definitely not tell us?",
      sayThis:
        "Security updates close holes that are already published. Skipping them means the weakness is known to everyone except the people who would have to fix it.",
      reveals: [
        {
          evidenceId: "EV-WKS-01",
          interpretation:
            "Evidence: 2 of 9 laptops, 90 days, vendor updates pending, both used for email and records. Interpretation: a known, unpatched weakness on devices that touch sensitive data. No detection and no incident is reported — so no exploitation is claimed.",
        },
        {
          evidenceId: "EV-WKS-02",
          interpretation:
            "Evidence: restart friction, no owner. Interpretation: the root cause is process ownership, not staff refusal. Controls that ignore the restart problem will fail again.",
        },
        {
          evidenceId: "EV-WKS-03",
          interpretation:
            "Evidence: unlocked laptop signed in to records in a room off a patient corridor. Interpretation: a second, physical path to the same data, independent of patching.",
        },
      ],
      ciaLink:
        "All three: confidentiality (screen and data exposure), integrity (code that can change what runs), availability (a device taken out of service).",
      misconceptions: [
        {
          wrong: "'They have malware.'",
          correction:
            "No detection exists in the evidence. Write 'increased likelihood of malware or exploitation of a known weakness', not 'infected'.",
        },
        {
          wrong: "'Only two laptops, so it is minor.'",
          correction:
            "Both are used daily for records. Impact follows what the device reaches, not how many devices there are.",
        },
      ],
      readyToAdvance: [
        "Learner separates vulnerability from incident.",
        "Learner notices the unlocked-screen evidence as a distinct issue from patching.",
      ],
    },
    {
      roomId: "website",
      facilitatorPrompt:
        "The certificate is valid today and expires in seven days. What actually breaks on day eight?",
      sayThis:
        "This is the Week 9 muscle again, pointed at the business. A certificate is a name-and-date proof for a connection. It is not a promise about the business behind it.",
      reveals: [
        {
          evidenceId: "EV-WEB-01",
          interpretation:
            "Evidence: valid 20 Dec 2025 to 20 Mar 2026, checked 13 Mar 2026. Interpretation: valid now, seven days of runway. The risk is scheduled, not hypothetical.",
        },
        {
          evidenceId: "EV-WEB-02",
          interpretation:
            "Evidence: manual renewal, historically reactive, no named owner, no reminder. Interpretation: high likelihood it lapses again, because the process depends on someone noticing a warning.",
        },
        {
          evidenceId: "EV-WEB-03",
          interpretation:
            "Evidence: public pages only, no sign-in, no link to records. Interpretation: the consequence is availability and trust in public information — not exposure of patient records.",
        },
      ],
      ciaLink:
        "Mainly availability (visitors blocked or warned away) and integrity of public information. Confidentiality is low here, and saying so is part of the skill.",
      misconceptions: [
        {
          wrong: "'Expiry leaks patient records.'",
          correction:
            "The public site holds no records and does not reach them. Expiry affects trusted access to public pages.",
        },
        {
          wrong: "'HTTPS means the clinic is secure.'",
          correction:
            "HTTPS protects the connection. It says nothing about shared logins, patching, or backups — all of which are broken in this same clinic.",
        },
      ],
      readyToAdvance: [
        "Learner names availability rather than confidentiality as the main concern.",
        "Learner cites the renewal process, not just the date, as the vulnerability.",
      ],
    },
    {
      roomId: "backup",
      facilitatorPrompt:
        "The drive has been running for two weeks. What exactly do we own right now?",
      sayThis:
        "A backup is only real once you have put it back. Until then it is an assumption with a blinking light.",
      reveals: [
        {
          evidenceId: "EV-BAK-01",
          interpretation:
            "Evidence: last clean backup 14 days ago, six failures since, no other copy. Interpretation: up to two weeks of data would be unrecoverable, with no second chance anywhere.",
        },
        {
          evidenceId: "EV-BAK-02",
          interpretation:
            "Evidence: no restore ever attempted, no test recorded. Interpretation: recoverability is unknown. Mark it unknown in the scenario row rather than guessing either way.",
        },
        {
          evidenceId: "EV-BAK-03",
          interpretation:
            "Evidence: permanently attached USB drive. Interpretation: anything able to write to the workstation can damage or encrypt the backup as well. The copy shares the fate of the original.",
        },
      ],
      ciaLink:
        "Availability above all, plus confidentiality (the copy holds the same sensitive data) and integrity (an incomplete copy restores wrong data).",
      misconceptions: [
        {
          wrong: "'They have backups, so they are covered.'",
          correction:
            "Untested, stale, and permanently attached. Each of those three alone would weaken recovery; together they remove it.",
        },
        {
          wrong: "'This proves ransomware would destroy them.'",
          correction:
            "It supports a concern about recovery. It does not confirm an attack or an actual loss.",
        },
      ],
      readyToAdvance: [
        "Learner names all three weaknesses (stale, untested, attached).",
        "Learner writes recoverability as unknown rather than as failure.",
      ],
    },
  ],

  answerRegister: [
    {
      scenarioId: "SC-01",
      asset: "AS-01 Appointment scheduling account",
      evidenceIds: ["EV-REC-01", "EV-REC-02", "EV-REC-03"],
      threat:
        "An outsider phishes reception staff and signs in to the scheduling account as them.",
      vulnerability:
        "Sign-in is email plus password only, staff receive these messages weekly, and there is no reporting route.",
      consequence:
        "Appointments can be read, changed or cancelled; the clinic's day is disrupted and patient attendance information is exposed.",
      cia: "Confidentiality and Availability (Integrity if appointments are altered).",
      unknown: "Whether anyone has already entered a password is not recorded.",
      likelihood: {
        value: 3,
        why: "Weekly attempts, a single password as the only barrier, and no reporting habit.",
      },
      impact: {
        value: 2,
        why: "Significant disruption to the clinic day and exposure of attendance information; clinical records are a separate system.",
      },
      control:
        "Turn on a second sign-in step (MFA) for the scheduling service and give reception a one-click way to report suspicious mail.",
      howItHelps:
        "A stolen password alone stops being enough, which removes most of the value of the phishing attempt, and reporting turns a silent weekly event into something visible.",
      residual:
        "Phishing attempts continue and a determined attacker can still try to trick someone through the second step; the remaining risk is lower and now detectable.",
      acceptableAlternatives: [
        "Impact 3 is defensible if the learner argues from a full day of lost appointments.",
        "Security awareness plus reporting is acceptable as a control if paired with a reason MFA is not first.",
      ],
    },
    {
      scenarioId: "SC-02",
      asset: "AS-02 Patient records application",
      evidenceIds: ["EV-REC-OFF-01", "EV-REC-OFF-02", "EV-REC-OFF-03"],
      threat:
        "Someone — current staff or a leaver — opens patient records without a reason, and the clinic cannot tell who.",
      vulnerability:
        "One shared `frontdesk` login for four people, password written down, unchanged for 8 months, not revoked when staff leave.",
      consequence:
        "Patient confidentiality can be breached with no way to investigate, and no individual can be held accountable.",
      cia: "Confidentiality and Integrity.",
      unknown:
        "Whether a former member of staff can still reach the system from outside the clinic.",
      likelihood: {
        value: 2,
        why: "Access is broad and unrevoked, but nothing in the evidence shows misuse occurring.",
      },
      impact: {
        value: 3,
        why: "Patient records are the clinic's most sensitive data and a breach cannot even be scoped without attribution.",
      },
      control:
        "Give each reception member an individual named account, remove the shared login, and add account removal to the leaver checklist.",
      howItHelps:
        "Every action becomes traceable to a person, and one person leaving removes exactly one access.",
      residual:
        "Authorised staff can still look at records they should not; that becomes a monitoring and supervision question, which is now possible.",
      acceptableAlternatives: [
        "Likelihood 3 is defensible via the unrevoked leaver accounts.",
        "Naming this the top priority instead of SC-01 is fully acceptable with reasoning.",
      ],
    },
    {
      scenarioId: "SC-03",
      asset: "AS-03 Staff laptops",
      evidenceIds: ["EV-WKS-01", "EV-WKS-02", "EV-WKS-03"],
      threat:
        "Malware or an attacker uses a publicly known software weakness on a laptop that has not been updated for 90 days.",
      vulnerability:
        "Two laptops with vendor security updates pending for 90 days, no owner for chasing updates, and at least one left unlocked in an accessible room.",
      consequence:
        "The device — and the records session on it — can be taken over; a clinician loses their working tool.",
      cia: "Confidentiality, Integrity and Availability.",
      unknown: "There is no detection evidence; no compromise is confirmed.",
      likelihood: {
        value: 2,
        why: "Known weaknesses are present and the devices handle email daily, but only two devices are affected and nothing shows active targeting.",
      },
      impact: {
        value: 3,
        why: "Both laptops reach the records application, so a takeover reaches patient data.",
      },
      control:
        "Set a scheduled maintenance window with a named owner so the two laptops are patched and restarted, and turn on automatic screen lock.",
      howItHelps:
        "Closes the published weaknesses on a predictable cycle and removes the unattended signed-in session.",
      residual:
        "Weaknesses discovered before a vendor fix exists remain, and patching lags the window by up to its length.",
      acceptableAlternatives: [
        "Treating the unlocked screen as its own sixth scenario is good work, not an error.",
      ],
    },
    {
      scenarioId: "SC-04",
      asset: "AS-04 Public information website",
      evidenceIds: ["EV-WEB-01", "EV-WEB-02", "EV-WEB-03"],
      threat:
        "The certificate expires in seven days and browsers begin warning or blocking visitors.",
      vulnerability:
        "Renewal is manual, reactive, unscheduled and has no named owner.",
      consequence:
        "Patients cannot easily reach address, hours and contact details, and lose confidence in the clinic's site.",
      cia: "Availability primarily; Integrity of public information. Confidentiality impact is low.",
      unknown: "Whether anyone is scheduled to renew before 20 March is not recorded.",
      likelihood: {
        value: 3,
        why: "Expiry is a certainty on a known date, and the renewal process has historically only run after warnings appear.",
      },
      impact: {
        value: 1,
        why: "Public information only; no records are reachable through this site and clinic operations continue.",
      },
      control:
        "Assign a named owner and set calendar reminders at 30 and 14 days before expiry, or enable automated renewal.",
      howItHelps:
        "Moves renewal from 'somebody notices a warning' to a scheduled task with an owner.",
      residual:
        "A reminder can still be missed while the owner is away; a deputy or automation reduces what is left.",
      acceptableAlternatives: [
        "Impact 2 is defensible if the learner argues patients rely on the site for hours and phone number.",
      ],
    },
    {
      scenarioId: "SC-05",
      asset: "AS-05 Backup archive",
      evidenceIds: ["EV-BAK-01", "EV-BAK-02", "EV-BAK-03"],
      threat:
        "Data is lost, damaged or encrypted and the clinic finds the only copy is stale, untested, or damaged with the original.",
      vulnerability:
        "One permanently attached drive, last clean backup 14 days ago with six failures since, no restore ever tested, no second or offsite copy.",
      consequence:
        "Up to two weeks of clinic data is unrecoverable, and recovery may fail entirely.",
      cia: "Availability primarily, with Confidentiality and Integrity of the copy itself.",
      unknown:
        "Whether the existing copies would actually restore is unknown, because no restore has been attempted.",
      likelihood: {
        value: 2,
        why: "Backup failures are already happening weekly; a triggering loss event is plausible but not evidenced.",
      },
      impact: {
        value: 3,
        why: "Losing patient data outright would stop the clinic and cannot be undone.",
      },
      control:
        "Keep a second copy that is not permanently attached (offsite or disconnected), fix the failing job, and run a documented test restore each month.",
      howItHelps:
        "Breaks the shared fate of copy and original, closes the two-week gap, and turns 'we assume it works' into evidence.",
      residual:
        "Data written between backups is still at risk, and the copy still holds sensitive data that must be protected.",
      acceptableAlternatives: [
        "Learners who make this the top priority on recovery grounds are reasoning well.",
      ],
    },
  ],

  emailAnswer: {
    signs: [
      "Sender domain mismatch: clinic-support.example is neither the clinic's domain nor the real vendor's domain.",
      "Urgency and threat: a two-hour deadline with the whole clinic being locked out, designed to stop people checking.",
      "A password is requested, and the link points at an address the clinic does not own. Legitimate providers do not ask for your current password by email.",
    ],
    safeStep:
      "Do not reply, do not open the link. Report it to the IT contractor using a route the clinic already trusts, and if in doubt reach the vendor through the address in the clinic's own records — never one in the message.",
    proofBoundary:
      "A suspicious email proves an attempt was made. It does not prove anyone entered a password or that an account is compromised. To move from suspicion to evidence you would look at sign-in history for the scheduling account and ask the four reception staff directly.",
    acceptableAlternatives: [
      "Generic greeting, odd formatting, or 'no such person as Clinic IT Support' are acceptable third signs.",
      "'Forward to the practice manager' is acceptable if reporting reaches the IT contractor.",
    ],
  },

  sampleBriefing:
    "Two things need your decision this month. First, all four reception staff share one records login, so if a record is opened inappropriately we cannot tell who did it, and staff who left still have working access. I recommend individual named accounts and adding account removal to the leaver checklist. Second, our backup is one drive that is always plugged in, last worked two weeks ago, and has never been test-restored, so we do not actually know whether we could recover. I recommend a second copy kept disconnected and a monthly test restore. Neither is expensive, and both are things we can start this month. Nothing here says we have been attacked; these are weaknesses we can close before something happens.",

  rubric: [
    {
      criterion: "Evidence identification",
      lookFor: "Each claim points at specific evidence IDs rather than general impressions.",
      strong: "Every scenario row cites evidence that actually supports the claim made.",
      developing: "Rows are plausible but unreferenced, or cite evidence from the wrong room.",
    },
    {
      criterion: "Concept distinctions",
      lookFor:
        "Asset, threat, vulnerability and consequence are used for four different things, not restated.",
      strong: "Vulnerability names a weakness; consequence names harm to the clinic.",
      developing: "Threat and vulnerability columns repeat the same sentence.",
    },
    {
      criterion: "Prioritisation",
      lookFor: "Ratings tied to exposure, weaknesses and existing protections.",
      strong: "Justifications reference evidence and acknowledge what is unknown.",
      developing: "Everything is rated 3, or the reasons restate the number.",
    },
    {
      criterion: "Control fit",
      lookFor: "The control addresses the vulnerability actually named.",
      strong: "Control is specific, achievable for a 12-person clinic, and residual risk is honest.",
      developing: "Control is generic ('improve security') or residual risk is claimed as zero.",
    },
    {
      criterion: "Communication",
      lookFor: "The briefing is written for a practice manager, not a security audience.",
      strong: "Plain language, two clear recommendations, no overstatement of what happened.",
      developing: "Jargon-led, or claims a breach the evidence does not support.",
    },
  ],
};
