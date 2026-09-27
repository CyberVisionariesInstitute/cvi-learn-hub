/**
 * Week 11 student-facing navigation guidance (client-safe).
 * Pairs 1:1 with `missions[].steps` in seed.ts. Contains ONLY navigation hints and
 * outcomes already stated by mission text or ticket approvals — never readiness
 * predicates or answer-key content (those stay in *.server.ts).
 */
import type { Directory } from "./seed";

export type NavView = "dashboard" | "missions" | "users" | "groups" | "ous" | "roles" | "resources" | "tickets" | "signins" | "audit" | "evidence" | "report";
export interface Nav { label: string; view: NavView; dir?: Directory; account?: string; ticket?: string }
export interface StepGuide { doing: string; where: string; lookFor: string; proves: string; mode: "explore" | "assessed"; links: Nav[]; capture?: string }

const u = (account: string, dir: Directory, label = account): Nav => ({ label, view: "users", dir, account });
const tk = (ticket: string): Nav => ({ label: `Ticket ${ticket}`, view: "tickets", ticket });
const V = (view: NavView, label: string, dir?: Directory): Nav => (dir ? { label, view, dir } : { label, view });

export const stepGuides: Record<string, StepGuide[]> = {
  M01: [
    { doing: "Meet Alex as one person with two accounts.", where: "Users → On-Premises (AD) → ad-alex → Person record (HR); then the cloud account link.", lookFor: "Each account's identifier (UPN) and which directory it lives in.", proves: "You can name both accounts and say they belong to the same person.", mode: "explore", links: [u("ad-alex", "AD"), u("cl-alex", "CLOUD")] },
    { doing: "See how Alex actually gets access.", where: "ad-alex / cl-alex account page → 'Groups and effective access' table.", lookFor: "The OU (organization only) vs the groups, and every granting path to Response Share and Response Queue.", proves: "One AD path and one cloud path you can describe.", mode: "explore", links: [u("ad-alex", "AD"), u("cl-alex", "CLOUD"), V("ous", "Organizational Units", "AD")] },
    { doing: "Compare two cloud groups by what they grant.", where: "Groups (Cloud) → Junior-Analysts and Case-Readers; Roles & Access for what each role allows.", lookFor: "The role assignments behind each group — not the group name.", proves: "A written comparison based on assignments.", mode: "explore", links: [V("groups", "Cloud groups", "CLOUD"), V("roles", "Roles & Access"), u("cl-blair", "CLOUD"), u("cl-finley", "CLOUD")] },
    { doing: "Inspect Drew's leaver accounts.", where: "Users → search 'Drew' in BOTH directories.", lookFor: "Account status and the HR employment state.", proves: "You can explain why the person record remains.", mode: "explore", links: [V("users", "AD users", "AD"), V("users", "Cloud users", "CLOUD")] },
    { doing: "Attach a real object to each of the seven concepts.", where: "Mission Progress → 'Directory trace — seven concepts'.", lookFor: "Objects you actually inspected.", proves: "All seven boxes filled with real objects.", mode: "assessed", links: [V("missions", "Directory trace")] },
    { doing: "Capture your trace and comparison.", where: "Capture evidence (here in this panel, or on Mission Progress).", lookFor: "Tick the accounts you traced (E01) and the Blair/Finley/Drew accounts (E02).", proves: "E01 and E02 captured, plus the two differences answered.", mode: "assessed", links: [V("missions", "Explanations")], capture: "E01" },
  ],
  M02: [
    { doing: "Inspect Blair's cloud account before touching anything.", where: "Users → Cloud → cl-blair; Resources → Case Summaries.", lookFor: "Status, MFA, credential state, groups and what those groups are assigned.", proves: "A written prediction.", mode: "explore", links: [u("cl-blair", "CLOUD"), V("resources", "Resources")] },
    { doing: "Prove Blair can authenticate.", where: "cl-blair account page → Sign-in tester (scroll down).", lookFor: "Device managed-blair, credential current, MFA pass.", proves: "A successful sign-in event.", mode: "assessed", links: [u("cl-blair", "CLOUD", "cl-blair sign-in tester")] },
    { doing: "Test access with that session.", where: "cl-blair account page → Test Access → Case Summaries / read.", lookFor: "The decision and the reason in the trace.", proves: "A recorded test result. A denial here matches the ticket's starting problem. Capture E03 now.", mode: "assessed", links: [u("cl-blair", "CLOUD", "cl-blair Test Access")], capture: "E03" },
    { doing: "Make the narrow correction APP-201 approves.", where: "Tickets → T201 (read APP-201); change membership on the account page or assignments on Roles & Access.", lookFor: "Before adding anything, check what each candidate grants.", proves: "An audit record of your change.", mode: "assessed", links: [tk("T201"), u("cl-blair", "CLOUD"), V("roles", "Roles & Access")] },
    { doing: "Retest read and update.", where: "cl-blair account page → Test Access.", lookFor: "Read and update results against the approval (editing is not approved).", proves: "Both test results. The update denial is an expected result. Capture E04, then set T201 to resolved.", mode: "assessed", links: [u("cl-blair", "CLOUD"), tk("T201")], capture: "E04" },
    { doing: "Explain the four A's with your own records.", where: "Mission Progress → Your explanations; Audit Logs → Your simulated activity.", lookFor: "Your real sign-in, test and audit IDs.", proves: "All explanation prompts answered.", mode: "assessed", links: [V("missions", "Explanations"), V("audit", "Audit Logs")] },
  ],
  M03: [
    { doing: "Create Jamie's AD account.", where: "Tickets → T301 first; then Users → On-Premises (AD) → 'Planned account: Jamie Ellis'.", lookFor: "The OU that T301 describes — choose it before clicking Create.", proves: "ad-jamie exists (disabled, no groups).", mode: "assessed", links: [tk("T301"), V("users", "AD users", "AD")] },
    { doing: "Add the approved groups.", where: "ad-jamie account page → Administrative actions → Membership.", lookFor: "The groups T301 names.", proves: "Memberships visible on the account.", mode: "assessed", links: [u("ad-jamie", "AD"), tk("T301")] },
    { doing: "Verify identity before any credential action.", where: "Tickets → T302 → Identity verification.", lookFor: "HR ID from HR-301 and the directory-confirmed callback route.", proves: "Verification shows 'passed'.", mode: "assessed", links: [tk("T302")] },
    { doing: "Reset the credential.", where: "ad-jamie account page → Credentials → Sensitive-action ticket = T302 → Reset credential.", lookFor: "Credential version before and after.", proves: "An audit record of the reset.", mode: "assessed", links: [u("ad-jamie", "AD")], capture: "E06" },
    { doing: "Enable, sign in, change credential, test.", where: "ad-jamie → Status (Enable) → Sign-in tester → 'Complete simulated credential change' → sign in again → Test Access: Staff Handbook / read.", lookFor: "Each action's result message.", proves: "A handbook read test after a fresh sign-in.", mode: "assessed", links: [u("ad-jamie", "AD")] },
    { doing: "Run the validation sequence.", where: "ad-jamie → Disable → try sign-in/test → Enable → fresh sign-in → handbook read.", lookFor: "The denial while disabled (expected), then the allow after re-enabling.", proves: "The ordered sequence in your records. Capture E07.", mode: "assessed", links: [u("ad-jamie", "AD")], capture: "E07" },
    { doing: "Capture and explain.", where: "Capture evidence + Mission Progress explanations.", lookFor: "ad-jamie snapshot for E05.", proves: "E05–E07 captured, explanations answered, T301/T302 resolved.", mode: "assessed", links: [V("missions", "Explanations"), tk("T301")], capture: "E05" },
  ],
  M04: [
    { doing: "Write each job's required and forbidden actions.", where: "Tickets → T401, T402, T403; answer on Mission Progress.", lookFor: "Approved scope and what is 'not approved'.", proves: "Jobs answer filled.", mode: "explore", links: [tk("T401"), tk("T402"), tk("T403"), V("missions", "Explanations")] },
    { doing: "Review each job's configuration.", where: "Roles & Access (assignments) and Groups (Cloud) → 'Mark reviewed' on Junior-Analysts, Response-Operators, Audit-Reviewers.", lookFor: "Group → role → scope for each job.", proves: "Three review records. Capture E08.", mode: "assessed", links: [V("roles", "Roles & Access"), V("groups", "Cloud groups", "CLOUD")], capture: "E08" },
    { doing: "Find Casey's broad rights.", where: "Users → Cloud → cl-casey → 'Groups and effective access' (look at every granting path).", lookFor: "Paths granting more than T402 approves.", proves: "A narrower effective-access table. Remove membership or assignment — role definitions are read-only.", mode: "assessed", links: [u("cl-casey", "CLOUD"), V("roles", "Roles & Access")] },
    { doing: "Run the nine required tests (sign in first).", where: "Each account page → Sign-in tester, then Test Access.", lookFor: "Use the checklist below to track which you've run.", proves: "Nine recorded tests. Capture E09.", mode: "assessed", links: [u("cl-blair", "CLOUD"), u("cl-casey", "CLOUD"), u("cl-emi", "CLOUD")], capture: "E09" },
    { doing: "Temporary grant experiment.", where: "cl-blair → Membership: add Audit-Reviewers (GC-AUD) → test Audit Evidence read → remove → retest.", lookFor: "Allow while granted, deny after removal (expected).", proves: "The four-record chain. Capture E10.", mode: "assessed", links: [u("cl-blair", "CLOUD")], capture: "E10" },
    { doing: "ABAC: current state, then three what-ifs.", where: "cl-casey → Test Access → Internal Response Note / read; Mode 'ABAC what-if branch'.", lookFor: "Change exactly ONE override per run: device, department, classification.", proves: "Four cases in your records. Capture E11.", mode: "assessed", links: [u("cl-casey", "CLOUD", "cl-casey Test Access")], capture: "E11" },
    { doing: "Explain RBAC, scope, least privilege, ABAC.", where: "Mission Progress → Your explanations; then set T401–T403 to resolved.", lookFor: "Your own tests and changes.", proves: "Explanations answered.", mode: "assessed", links: [V("missions", "Explanations"), tk("T401")] },
  ],
  M05: [
    { doing: "Joiner T501: Jamie's cloud account.", where: "Tickets → T501 → verify; Users → Cloud → Planned account → create; cl-jamie → MFA (ticket T501) → Enable → sign in → credential change → groups → tests.", lookFor: "The groups APP-501 approves; read-only case access.", proves: "Case read + update tests (update denial is expected). Capture E12.", mode: "assessed", links: [tk("T501"), V("users", "Cloud users", "CLOUD"), u("cl-jamie", "CLOUD")], capture: "E12" },
    { doing: "Mover T502: Alex Response → Audit.", where: "Capture E13 'before' FIRST; then ad-alex → Department transfer + Move OU; memberships on ad-alex and cl-alex.", lookFor: "Old operational access should end in both directories.", proves: "After-tests in both directories (old response access denied is expected).", mode: "assessed", links: [u("ad-alex", "AD"), u("cl-alex", "CLOUD"), tk("T502")], capture: "E13" },
    { doing: "Leaver T503: Finley now.", where: "cl-finley → sign in + case read FIRST; then ad-/cl-finley → Disable, Revoke sessions, remove groups; ad-finley → Move OU Disabled Accounts.", lookFor: "Test with the old session (Session dropdown) and a new sign-in.", proves: "Denied old session and denied new sign-in (both expected). Capture E14.", mode: "assessed", links: [u("cl-finley", "CLOUD"), u("ad-finley", "AD"), tk("T503")], capture: "E14" },
    { doing: "T504: unverified reset request.", where: "Tickets → T504 → compare REQ-504 with HR-LOOKUP → Identity verification.", lookFor: "Whether the requester's details match the HR record. Do not reset if verification fails.", proves: "Failed verification (expected) and 'Set escalated' with a note. Capture E15.", mode: "assessed", links: [tk("T504")], capture: "E15" },
    { doing: "T505: scoped Azure access.", where: "Roles & Access → Azure Resource Access (add assignment); cl-blair → Membership; cl-blair → Test Access.", lookFor: "The resource group APP-505 names.", proves: "Metadata allow; stop and Other-Team-VM denied (expected). Capture E16.", mode: "assessed", links: [V("roles", "Roles & Access"), u("cl-blair", "CLOUD"), tk("T505")], capture: "E16" },
  ],
  M06: [
    { doing: "Read the historical sign-ins.", where: "Sign-in Logs → Historical.", lookFor: "Field meanings and the investigative context.", proves: "Starting hypothesis answered.", mode: "explore", links: [V("signins", "Sign-in Logs"), V("missions", "Hypothesis")] },
    { doing: "Filter and open raw records.", where: "Sign-in / Audit Logs → filters → click an event ID to View Raw Log.", lookFor: "Records that support two distinct findings. Note their IDs — you tick them in the Case File.", proves: "Event IDs selected in two findings.", mode: "assessed", links: [V("signins", "Sign-in Logs"), V("audit", "Audit Logs"), V("report", "Case File")] },
    { doing: "Correlate sign-ins with audit changes.", where: "Raw Log dialog → 'Find related records by correlation ID'.", lookFor: "What a shared ID supports — and what it doesn't prove.", proves: "Correlated records referenced in a finding. Capture E17.", mode: "assessed", links: [V("audit", "Audit Logs")], capture: "E17" },
    { doing: "Record a benign/ambiguous comparison.", where: "Case File → 'Benign or ambiguous comparison'.", lookFor: "Records that should not be over-claimed.", proves: "Text + source records. Capture E18.", mode: "assessed", links: [V("report", "Case File")], capture: "E18" },
    { doing: "Complete each finding's reasoning.", where: "Case File → Finding 1, Finding 2 …", lookFor: "Observation ≠ hypothesis ≠ conclusion.", proves: "Every field, priority and event references filled.", mode: "assessed", links: [V("report", "Case File")] },
    { doing: "Add one live simulator chain.", where: "Audit Logs → Your simulated activity; Case File → Live chain (use the ID picker).", lookFor: "LA-/AT- IDs from your earlier missions.", proves: "Live chain filled.", mode: "assessed", links: [V("audit", "Audit Logs"), V("report", "Case File")] },
    { doing: "Assemble sections and limitations.", where: "Case File → Case file sections.", lookFor: "Preliminary recommendations and explicit limitations.", proves: "Limitations filled.", mode: "assessed", links: [V("report", "Case File")] },
    { doing: "Export and upload.", where: "Case File → Portfolio export (the list shows each file's DRAFT/ready status) → Download.", lookFor: "Missing pieces flagged DRAFT.", proves: "ZIP downloaded; capture E19; files committed to your GitHub repo.", mode: "assessed", links: [V("report", "Portfolio export")], capture: "E19" },
  ],
};

/** Which records to tick per evidence slot (navigation help only). */
export const slotHints: Record<string, string> = {
  E01: "Accounts: ad-alex, cl-alex (their snapshots include OU, groups and effective access).",
  E02: "Accounts: cl-blair, cl-finley, and Drew's two accounts.",
  E03: "Your cl-blair sign-in event + the first Case Summaries read test.",
  E04: "Your membership/assignment audit event + the read and update retests.",
  E05: "Account: ad-jamie.",
  E06: "T302 verification audit event + the reset audit event.",
  E07: "Disable/enable audit events + the denied and allowed sign-ins/tests, in order.",
  E08: "Accounts: cl-blair, cl-casey, cl-emi + your review audit events.",
  E09: "The nine access tests.",
  E10: "Add-member audit, allowed test, remove-member audit, denied retest.",
  E11: "Casey's Internal Response Note tests (current + three what-ifs).",
  E12: "cl-jamie + its creation, MFA, status and group audits + tests.",
  E13: "ad-alex, cl-alex + before tests, change audits and after tests.",
  E14: "ad-finley, cl-finley + disable/revoke audits + denied tests/sign-in.",
  E15: "T504 verification and status audit events.",
  E16: "cl-blair + the assignment audit + three Training-VM/Other-Team-VM tests.",
  E17: "Historical records you used in your findings.",
  E18: "Historical records from your comparison.",
  E19: "Historical records in the case file (after exporting).",
};

/** Denials that the mission text or ticket approvals already state as the correct outcome. */
const expected: { account: string; resource?: string; action?: string; reason?: string; why: string }[] = [
  { account: "cl-blair", resource: "R-CASE", action: "update", why: "Editing is not approved (APP-201 / T401)." },
  { account: "cl-blair", resource: "R-CASE", action: "read", why: "Matches T201's starting problem (before your correction)." },
  { account: "cl-blair", resource: "R-AUD", action: "read", why: "Expected after the temporary grant is removed (M04 step 5)." },
  { account: "cl-blair", resource: "R-VM1", action: "stop", why: "APP-505 excludes stopping VMs." },
  { account: "cl-blair", resource: "R-VM2", why: "APP-505 excludes other resource groups." },
  { account: "cl-casey", resource: "R-AUD", action: "delete", why: "Audit deletion is not approved (T402)." },
  { account: "cl-casey", resource: "R-DIR", why: "Directory administration is not approved (T402)." },
  { account: "cl-emi", resource: "R-AUD", action: "delete", why: "Deletion is not approved (T403)." },
  { account: "cl-jamie", resource: "R-CASE", action: "update", why: "APP-501 approves read-only case access." },
  { account: "cl-alex", resource: "R-QUEUE", why: "T502: Response operational access should end." },
  { account: "ad-alex", resource: "R-ADRESP", why: "T502: Response operational access should end." },
  { account: "cl-finley", why: "T503: Finley has left — access should be denied." },
  { account: "ad-finley", why: "T503: Finley has left — access should be denied." },
  { account: "ad-jamie", reason: "ACCOUNT_DISABLED", why: "Expected while the account is disabled (M03 validation)." },
];

export function expectedDenyNote(t: { account: string; resource: string; action: string; decision: string; mode?: string; reasons: string[] }): string | null {
  if (t.decision !== "deny") return null;
  if (t.mode === "abac-what-if") return "What-if branches show which single attribute condition blocks access (M04 step 6).";
  const hit = expected.find((e) => e.account === t.account && (!e.resource || e.resource === t.resource) && (!e.action || e.action === t.action) && (!e.reason || t.reasons.includes(e.reason)));
  return hit ? hit.why : null;
}

/** Accounts whose CHANGES belong to specific missions (soft guard). */
export const changeMissions: Record<string, string[]> = {
  "ad-jamie": ["M03", "M05"], "cl-jamie": ["M05"], "ad-alex": ["M05"], "cl-alex": ["M05"],
  "ad-finley": ["M05"], "cl-finley": ["M05"], "cl-casey": ["M04"], "cl-emi": ["M04"], "cl-blair": ["M02", "M04", "M05"],
};

/** Map a student-safe readiness message to a navigation target (heuristic, no predicates). */
export function navForMissing(mission: string, text: string): Nav | null {
  const t = text;
  if (/^Capture E\d+|evidence slot|E\d\d/.test(t)) return { label: "Capture evidence", view: "missions" };
  if (/^Answer:/.test(t)) return { label: "Explanations", view: "missions" };
  if (/concept/.test(t)) return { label: "Directory trace", view: "missions" };
  const tkt = t.match(/\bT\d{3}\b/)?.[0];
  if (tkt && /verification|escalation|record/.test(t)) return tk(tkt);
  if (/resource-group access/.test(t)) return V("roles", "Roles & Access");
  if (/reviewed/.test(t)) return V("groups", "Cloud groups", "CLOUD");
  if (mission === "M06") return /live|limitations|comparison|findings|correlated/.test(t) ? V("report", "Case File") : null;
  const who: [RegExp, string, Directory][] = [
    [/Jamie/, mission === "M03" ? "ad-jamie" : "cl-jamie", mission === "M03" ? "AD" : "CLOUD"],
    [/Alex/, "cl-alex", "CLOUD"], [/Finley/, "cl-finley", "CLOUD"], [/Casey/, "cl-casey", "CLOUD"], [/Emi/, "cl-emi", "CLOUD"], [/Blair/, "cl-blair", "CLOUD"],
  ];
  for (const [re, acct, dir] of who) if (re.test(t)) return u(acct, dir);
  if (tkt) return tk(tkt);
  return null;
}

/** Required-test checklists (from the mission step text). Show only whether a test was run. */
export const testChecklists: Record<string, { account: string; resource: string; action: string; label: string }[]> = {
  M04: [
    { account: "cl-blair", resource: "R-CASE", action: "read", label: "Blair · case read" },
    { account: "cl-blair", resource: "R-CASE", action: "update", label: "Blair · case update" },
    { account: "cl-casey", resource: "R-QUEUE", action: "read", label: "Casey · queue read" },
    { account: "cl-casey", resource: "R-QUEUE", action: "update", label: "Casey · queue update" },
    { account: "cl-casey", resource: "R-AUD", action: "delete", label: "Casey · audit delete" },
    { account: "cl-casey", resource: "R-DIR", action: "manage_sensitive_groups", label: "Casey · directory manage_sensitive_groups" },
    { account: "cl-emi", resource: "R-AUD", action: "read", label: "Emi · audit read" },
    { account: "cl-emi", resource: "R-AUD", action: "export", label: "Emi · audit export" },
    { account: "cl-emi", resource: "R-AUD", action: "delete", label: "Emi · audit delete" },
  ],
  M05: [
    { account: "cl-jamie", resource: "R-CASE", action: "read", label: "T501 Jamie · case read" },
    { account: "cl-jamie", resource: "R-CASE", action: "update", label: "T501 Jamie · case update" },
    { account: "cl-finley", resource: "R-CASE", action: "read", label: "T503 Finley · case read" },
    { account: "cl-blair", resource: "R-VM1", action: "read_metadata", label: "T505 Training-VM metadata" },
    { account: "cl-blair", resource: "R-VM1", action: "stop", label: "T505 Training-VM stop" },
    { account: "cl-blair", resource: "R-VM2", action: "read_metadata", label: "T505 Other-Team-VM metadata" },
  ],
};

export const glossary: Record<string, string> = {
  UPN: "User Principal Name — the sign-in name, like an email address.",
  DN: "Distinguished Name — the account's full path in the AD tree (OU included).",
  OU: "Organizational Unit — a folder for organizing AD accounts. It grants no access here.",
  "Credential version": "Increases every time the credential is reset. No real password exists.",
  "Security revision": "Increases when a security-relevant change (status, credential) invalidates sessions.",
  "Department attr": "An attribute the ABAC rules can check.",
};
