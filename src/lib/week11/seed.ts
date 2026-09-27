/**
 * Cloud Heights Identity Center — seed chic-w11-v1.
 *
 * Exact fictional data from the Week 11 simulator specification, Sections 4, 7
 * and 8. Student-visible: contains business tickets and diagnostic catalogs
 * only. Expected mission outcomes and answer keys live in *.server.ts files.
 */

export const SEED_VERSION = "chic-w11-v1";
export const SCENARIO_START = "2026-09-28T13:00:00Z";
export const OPERATOR = "sim-junior-analyst";
export const SIMULATION_BANNER =
  "Training simulation — fictional Cloud Heights accounts and resources. Your actions change only your Week 11 learning attempt. This is not a live AD domain, Microsoft Entra tenant or Azure subscription.";

export type Directory = "AD" | "CLOUD";
export type DeptKey = "DEP-RESP" | "DEP-SUP" | "DEP-AUD" | "DEP-IT";
export type EmploymentStatus = "active" | "departed" | "contractor_ending" | "approved_joiner";

export const departments: Record<DeptKey, string> = {
  "DEP-RESP": "Response",
  "DEP-SUP": "Support",
  "DEP-AUD": "Audit",
  "DEP-IT": "IT Services",
};

export interface PersonSeed {
  key: string;
  name: string;
  dept: DeptKey;
  status: EmploymentStatus;
  hrId: string;
  username: string;
  work: string;
}

export const peopleSeed: PersonSeed[] = [
  { key: "P01", name: "Alex Morgan", dept: "DEP-RESP", status: "active", hrId: "CH-001", username: "alex", work: "Response employee scheduled to move to Audit in T502" },
  { key: "P02", name: "Blair Chen", dept: "DEP-SUP", status: "active", hrId: "CH-002", username: "blair", work: "Junior analyst needing read-only case access" },
  { key: "P03", name: "Casey Rivera", dept: "DEP-RESP", status: "active", hrId: "CH-003", username: "casey", work: "Response agent; has a privilege grant to examine" },
  { key: "P04", name: "Drew Patel", dept: "DEP-SUP", status: "departed", hrId: "CH-004", username: "drew", work: "Departed 2026-09-18" },
  { key: "P05", name: "Emi Brooks", dept: "DEP-AUD", status: "active", hrId: "CH-005", username: "emi", work: "Auditor requiring audit evidence access" },
  { key: "P06", name: "Finley Ross", dept: "DEP-SUP", status: "contractor_ending", hrId: "CH-006", username: "finley", work: "Contractor ending at scenario start" },
  { key: "P07", name: "Harper Lane", dept: "DEP-IT", status: "active", hrId: "CH-007", username: "helpdesk", work: "Fictional help-desk administrator in historical records" },
  { key: "P08", name: "Jamie Ellis", dept: "DEP-SUP", status: "approved_joiner", hrId: "CH-008", username: "jamie", work: "Approved joiner; not yet provisioned" },
];

export const employmentLabel: Record<EmploymentStatus, string> = {
  active: "Active",
  departed: "Departed",
  contractor_ending: "Contractor ending at scenario start",
  approved_joiner: "Approved joiner — not yet provisioned",
};

export interface OU {
  key: string;
  name: string;
  parent: string | null;
  dn: string;
}

export const ous: OU[] = [
  { key: "OU-STAFF", name: "Staff", parent: null, dn: "OU=Staff,DC=ad,DC=cloudheights,DC=example" },
  { key: "OU-SUP", name: "Support", parent: "OU-STAFF", dn: "OU=Support,OU=Staff,DC=ad,DC=cloudheights,DC=example" },
  { key: "OU-RESP", name: "Response", parent: "OU-STAFF", dn: "OU=Response,OU=Staff,DC=ad,DC=cloudheights,DC=example" },
  { key: "OU-AUD", name: "Audit", parent: "OU-STAFF", dn: "OU=Audit,OU=Staff,DC=ad,DC=cloudheights,DC=example" },
  { key: "OU-IT", name: "IT Services", parent: "OU-STAFF", dn: "OU=IT Services,OU=Staff,DC=ad,DC=cloudheights,DC=example" },
  { key: "OU-DIS", name: "Disabled Accounts", parent: null, dn: "OU=Disabled Accounts,DC=ad,DC=cloudheights,DC=example" },
];

export const initialAccountPlacement: Record<string, { ou: string; enabled: boolean }> = {
  alex: { ou: "OU-RESP", enabled: true },
  blair: { ou: "OU-SUP", enabled: true },
  casey: { ou: "OU-RESP", enabled: true },
  drew: { ou: "OU-DIS", enabled: false },
  emi: { ou: "OU-AUD", enabled: true },
  finley: { ou: "OU-SUP", enabled: true },
  helpdesk: { ou: "OU-IT", enabled: true },
};

export interface GroupSeed {
  key: string;
  dir: Directory;
  name: string;
  purpose: string;
  members: string[];
}

export const groups: GroupSeed[] = [
  { key: "GA-ALL", dir: "AD", name: "All-Staff", purpose: "Everyone currently employed at Cloud Heights", members: ["alex", "blair", "casey", "emi", "finley", "helpdesk"] },
  { key: "GA-SUP", dir: "AD", name: "Support-Team", purpose: "Support department staff (organizational security group)", members: ["blair", "finley"] },
  { key: "GA-RESP", dir: "AD", name: "Response-Team", purpose: "Response department staff", members: ["alex", "casey"] },
  { key: "GA-AUD", dir: "AD", name: "Audit-Team", purpose: "Audit department staff", members: ["emi"] },
  { key: "GA-IT", dir: "AD", name: "IT-Services", purpose: "IT Services staff (organizational security group)", members: ["helpdesk"] },
  { key: "GC-JUN", dir: "CLOUD", name: "Junior-Analysts", purpose: "Junior analysts in the cloud case app", members: ["blair"] },
  { key: "GC-READ", dir: "CLOUD", name: "Case-Readers", purpose: "People who read case summaries", members: ["finley"] },
  { key: "GC-RESP", dir: "CLOUD", name: "Response-Operators", purpose: "Response queue operators", members: ["alex"] },
  { key: "GC-AUD", dir: "CLOUD", name: "Audit-Reviewers", purpose: "Audit evidence reviewers", members: [] },
  { key: "GC-PRIV", dir: "CLOUD", name: "Privileged-Operators", purpose: "Broad operational and directory rights", members: ["casey"] },
  { key: "GC-OLD", dir: "CLOUD", name: "Old-Response-Team", purpose: "Legacy response group", members: [] },
  { key: "GC-HELP", dir: "CLOUD", name: "Helpdesk-Operators", purpose: "Help-desk directory operators", members: ["helpdesk"] },
  { key: "GC-AZ", dir: "CLOUD", name: "Training-Resource-Readers", purpose: "Training Azure resource viewers", members: [] },
];

export type ResourceAuthority = "AD" | "CLOUD_APP" | "CLOUD_DIR" | "AZURE";

export interface Resource {
  key: string;
  authority: ResourceAuthority;
  name: string;
  type: string;
  classification: "Internal" | "Confidential" | "Restricted";
  owner: DeptKey;
  actions: string[];
  content: string;
  parent?: string;
}

export const authorityLabel: Record<ResourceAuthority, string> = {
  AD: "On-prem AD file share",
  CLOUD_APP: "Cloud app",
  CLOUD_DIR: "Cloud directory teaching scope",
  AZURE: "Azure resource simulation",
};

export const resources: Resource[] = [
  { key: "R-HAND", authority: "AD", name: "Staff Handbook", type: "ad_file", classification: "Internal", owner: "DEP-IT", actions: ["read"], content: "Cloud Heights training handbook — fictional." },
  { key: "R-ADRESP", authority: "AD", name: "Response Share", type: "ad_file", classification: "Internal", owner: "DEP-RESP", actions: ["read", "update"], content: "Response team practice notes." },
  { key: "R-ADAUD", authority: "AD", name: "Audit Share", type: "ad_file", classification: "Confidential", owner: "DEP-AUD", actions: ["read"], content: "Audit working papers — fictional." },
  { key: "R-LAND", authority: "CLOUD_APP", name: "Analyst Landing", type: "app_page", classification: "Internal", owner: "DEP-SUP", actions: ["read"], content: "Welcome to Cloud Heights case training." },
  { key: "R-CASE", authority: "CLOUD_APP", name: "Case Summaries", type: "case", classification: "Internal", owner: "DEP-SUP", actions: ["read", "update", "delete"], content: "CH-101 phishing report · CH-102 lost training laptop (fictional; no real victims)" },
  { key: "R-QUEUE", authority: "CLOUD_APP", name: "Response Queue", type: "queue", classification: "Internal", owner: "DEP-RESP", actions: ["read", "update", "delete"], content: "CH-101 awaiting triage · CH-102 awaiting follow-up" },
  { key: "R-AUD", authority: "CLOUD_APP", name: "Audit Evidence", type: "audit", classification: "Confidential", owner: "DEP-AUD", actions: ["read", "export", "delete"], content: "Fabricated review ledger." },
  { key: "R-DIR", authority: "CLOUD_DIR", name: "Directory Administration Sandbox", type: "directory", classification: "Restricted", owner: "DEP-IT", actions: ["manage_users", "manage_sensitive_groups"], content: "No real directory connection." },
  { key: "R-ABAC", authority: "CLOUD_APP", name: "Internal Response Note", type: "response_note", classification: "Internal", owner: "DEP-RESP", actions: ["read"], content: "Response-only training note." },
  { key: "R-VM1", authority: "AZURE", name: "Training-VM", type: "azure_vm", classification: "Internal", owner: "DEP-IT", actions: ["read_metadata", "stop"], content: "Simulated state label: running", parent: "RG-LAB" },
  { key: "R-VM2", authority: "AZURE", name: "Other-Team-VM", type: "azure_vm", classification: "Internal", owner: "DEP-IT", actions: ["read_metadata", "stop"], content: "Simulated state label: running", parent: "RG-OTHER" },
];

export const resourceGroups = [
  { key: "RG-LAB", name: "Identity Training Resource Group" },
  { key: "RG-OTHER", name: "Other Team Resource Group" },
];

export type RoleAuthority = "CLOUD" | "AZURE";

export interface Role {
  key: string;
  name: string;
  authority: RoleAuthority;
  authorityLabel: string;
  perms: { type: string; actions: string[] }[];
}

export const roles: Role[] = [
  { key: "RL-LAND", name: "Landing Reader", authority: "CLOUD", authorityLabel: "Cloud app", perms: [{ type: "app_page", actions: ["read"] }] },
  { key: "RL-READ", name: "Case Reader", authority: "CLOUD", authorityLabel: "Cloud app", perms: [{ type: "case", actions: ["read"] }] },
  { key: "RL-RESP", name: "Response Agent", authority: "CLOUD", authorityLabel: "Cloud app", perms: [{ type: "queue", actions: ["read", "update"] }, { type: "response_note", actions: ["read"] }] },
  { key: "RL-AUD", name: "Audit Reviewer", authority: "CLOUD", authorityLabel: "Cloud app", perms: [{ type: "audit", actions: ["read", "export"] }] },
  { key: "RL-PRIV", name: "Privileged Operator", authority: "CLOUD", authorityLabel: "Cloud teaching", perms: [{ type: "case", actions: ["read", "update", "delete"] }, { type: "queue", actions: ["read", "update", "delete"] }, { type: "audit", actions: ["read", "export", "delete"] }, { type: "directory", actions: ["manage_users", "manage_sensitive_groups"] }] },
  { key: "RL-HELP", name: "Helpdesk Operator", authority: "CLOUD", authorityLabel: "Cloud directory teaching", perms: [{ type: "directory", actions: ["manage_users"] }] },
  { key: "RL-AZREAD", name: "Azure Reader — teaching subset", authority: "AZURE", authorityLabel: "Azure resource simulation", perms: [{ type: "azure_vm", actions: ["read_metadata"] }] },
  { key: "RL-AZOPER", name: "VM Operator — fictional teaching role", authority: "AZURE", authorityLabel: "Azure resource simulation", perms: [{ type: "azure_vm", actions: ["read_metadata", "stop"] }] },
];

export const initialAssignments: { key: string; group: string; role: string; scope: string }[] = [
  { key: "AS-01", group: "GC-JUN", role: "RL-LAND", scope: "R-LAND" },
  { key: "AS-02", group: "GC-READ", role: "RL-READ", scope: "R-CASE" },
  { key: "AS-03", group: "GC-RESP", role: "RL-RESP", scope: "R-QUEUE" },
  { key: "AS-04", group: "GC-RESP", role: "RL-RESP", scope: "R-ABAC" },
  { key: "AS-05", group: "GC-AUD", role: "RL-AUD", scope: "R-AUD" },
  { key: "AS-06", group: "GC-PRIV", role: "RL-PRIV", scope: "R-CASE" },
  { key: "AS-07", group: "GC-PRIV", role: "RL-PRIV", scope: "R-QUEUE" },
  { key: "AS-08", group: "GC-PRIV", role: "RL-PRIV", scope: "R-AUD" },
  { key: "AS-09", group: "GC-PRIV", role: "RL-PRIV", scope: "R-DIR" },
  { key: "AS-10", group: "GC-HELP", role: "RL-HELP", scope: "R-DIR" },
];

/** AD ACL entries — read-only in v1. OU hierarchy plays no part. */
export const adAcl: { group: string; resource: string; actions: string[] }[] = [
  { group: "GA-ALL", resource: "R-HAND", actions: ["read"] },
  { group: "GA-RESP", resource: "R-ADRESP", actions: ["read", "update"] },
  { group: "GA-AUD", resource: "R-ADAUD", actions: ["read"] },
];

export interface Device {
  key: string;
  person: string | null;
  trust: "managed" | "unmanaged";
  ip: string;
  location: string;
}

export const devices: Device[] = [
  { key: "managed-alex", person: "P01", trust: "managed", ip: "192.0.2.10", location: "Office-A; VPN 198.51.100.20 / Remote-C" },
  { key: "managed-blair", person: "P02", trust: "managed", ip: "192.0.2.11", location: "Office-A" },
  { key: "managed-casey", person: "P03", trust: "managed", ip: "192.0.2.12", location: "Office-A" },
  { key: "managed-emi", person: "P05", trust: "managed", ip: "192.0.2.13", location: "Office-A" },
  { key: "managed-finley", person: "P06", trust: "managed", ip: "192.0.2.14", location: "Office-A" },
  { key: "managed-helpdesk", person: "P07", trust: "managed", ip: "192.0.2.15", location: "Office-A" },
  { key: "managed-jamie", person: "P08", trust: "managed", ip: "192.0.2.16", location: "Office-A" },
  { key: "unknown-device", person: null, trust: "unmanaged", ip: "203.0.113.77", location: "Remote-B" },
  { key: "unmanaged-personal", person: null, trust: "unmanaged", ip: "203.0.113.90", location: "Remote-B" },
];


/* ------------------------------------------------------------------ */
/* Tickets — business need and approval only (no solution table).      */
/* ------------------------------------------------------------------ */

export interface TicketDocument {
  id: string;
  title: string;
  body: string;
}

export interface TicketSeed {
  key: string;
  mission: string;
  title: string;
  requester: string;
  approver: string;
  targets: string[];
  request: string;
  approvedScope: string;
  documents: TicketDocument[];
  verification: null | {
    targetAccount: string;
    /** Whether a directory-confirmed callback result exists for this ticket. */
    callback: { id: string; completed: boolean };
    /** Details supplied by whoever asked. */
    claimedHrId: string;
  };
  /** Sensitive actions this ticket may authorise once verification passes. */
  permitsReset?: string[];
  permitsUnlock?: string[];
  permitsCreate?: string[];
  permitsMfa?: string[];
}

export const tickets: TicketSeed[] = [
  {
    key: "T201", mission: "M02", title: "Blair can sign in but can't read case summaries",
    requester: "Support lead", approver: "Support lead", targets: ["cl-blair"],
    request: "Blair Chen signs in to the cloud case app but cannot open the Case Summaries she needs for her junior analyst work.",
    approvedScope: "Read-only access to Case Summaries. No editing.",
    documents: [{ id: "APP-201", title: "Support approval (signed, fictional)", body: "Approve read-only Case Summaries access for Blair Chen (cl-blair). Editing is not approved. No credential action is requested." }],
    verification: null,
  },
  {
    key: "T301", mission: "M03", title: "Onboard Jamie Ellis — on-prem directory",
    requester: "HR", approver: "HR / Support lead", targets: ["P08", "ad-jamie"],
    request: "Jamie Ellis joins Support. Create the planned on-prem account and give the basic staff handbook access new staff receive.",
    approvedScope: "Create the planned AD account in the Support area; basic staff and Support team membership; staff handbook read. Enabling the account is approved in ACT-301, including a disable/re-enable validation check.",
    documents: [
      { id: "HR-301", title: "HR planned-employee record", body: "Planned employee P08 Jamie Ellis, staff ID CH-008, department Support. Start: current scenario." },
      { id: "ACT-301", title: "Activation approval", body: "Approve enabling ad-jamie after setup. A controlled disable → re-enable validation sequence is permitted for training." },
    ],
    verification: null, permitsCreate: ["ad-jamie"],
  },
  {
    key: "T302", mission: "M03", title: "Initial credential setup for Jamie (AD)",
    requester: "HR on behalf of approved joiner", approver: "HR", targets: ["ad-jamie"],
    request: "Set up Jamie's first on-prem credential. Verify the joiner before any reset.",
    approvedScope: "Credential reset for ad-jamie after verification passes. Never display or record a password.",
    documents: [
      { id: "HR-301", title: "HR planned-employee record", body: "Staff ID on file: CH-008." },
      { id: "CB-302", title: "Directory-confirmed callback simulation", body: "Callback placed to the number on the HR record. Result: identity details match." },
    ],
    verification: { targetAccount: "ad-jamie", callback: { id: "CB-302", completed: true }, claimedHrId: "CH-008" },
    permitsReset: ["ad-jamie"],
  },
  {
    key: "T401", mission: "M04", title: "Confirm junior analyst access",
    requester: "Support lead", approver: "Support lead", targets: ["cl-blair"],
    request: "Confirm Blair has the access a junior analyst needs: read cases only. A temporary audit-access experiment is permitted for training, but must not remain.",
    approvedScope: "Case Summaries read. Nothing else beyond the landing page.",
    documents: [{ id: "APP-401", title: "Support lead approval", body: "Junior analyst: read cases only. Temporary sandbox audit experiment allowed; final state must not keep it." }],
    verification: null,
  },
  {
    key: "T402", mission: "M04", title: "Casey — response agent access",
    requester: "Response lead", approver: "Response lead", targets: ["cl-casey"],
    request: "Casey works the response queue and reads the Internal Response Note.",
    approvedScope: "Response queue read and update; Internal Response Note read. No audit deletion. No directory privileges.",
    documents: [{ id: "APP-402", title: "Response lead approval", body: "Approve queue read/update and Internal Response Note read for Casey Rivera. Audit deletion and directory administration are not approved." }],
    verification: null,
  },
  {
    key: "T403", mission: "M04", title: "Emi — audit reviewer access",
    requester: "Audit lead", approver: "Audit lead", targets: ["cl-emi"],
    request: "Emi reviews audit evidence.",
    approvedScope: "Audit Evidence read and export only.",
    documents: [{ id: "APP-403", title: "Audit lead approval", body: "Approve Audit Evidence read and export for Emi Brooks. Deletion is not approved." }],
    verification: null,
  },
  {
    key: "T501", mission: "M05", title: "Finish Jamie's cloud onboarding",
    requester: "HR", approver: "HR / Support lead", targets: ["P08", "cl-jamie"],
    request: "Jamie also needs the cloud case app. Same person as HR-301. Read-only case access.",
    approvedScope: "Create the planned cloud account for P08, verified MFA enrollment and credential setup, enable, junior analyst and case reader access. Keep the AD account.",
    documents: [
      { id: "HR-501", title: "HR record link", body: "Links to HR-301: P08 Jamie Ellis, staff ID CH-008." },
      { id: "CB-501", title: "Directory-confirmed callback simulation", body: "Callback to HR-recorded number. Result: identity details match." },
      { id: "APP-501", title: "Support lead approval", body: "Approve Junior-Analysts and Case-Readers for Jamie. Read-only case access." },
    ],
    verification: { targetAccount: "cl-jamie", callback: { id: "CB-501", completed: true }, claimedHrId: "CH-008" },
    permitsCreate: ["cl-jamie"], permitsMfa: ["cl-jamie"],
  },
  {
    key: "T502", mission: "M05", title: "Alex moves Response → Audit",
    requester: "HR", approver: "HR / Audit lead", targets: ["P01", "ad-alex", "cl-alex"],
    request: "Alex Morgan transfers from Response to Audit, effective now.",
    approvedScope: "Department change to Audit in HR and both directories; keep staff handbook access; remove old operational access; add audit access.",
    documents: [
      { id: "HR-502", title: "HR transfer notice", body: "P01 Alex Morgan: Response → Audit, effective current scenario time." },
      { id: "APP-502", title: "Audit lead approval", body: "Approve Audit team and audit evidence access. Response operational access should end." },
    ],
    verification: null,
  },
  {
    key: "T503", mission: "M05", title: "Contractor Finley leaves now",
    requester: "HR", approver: "HR", targets: ["P06", "ad-finley", "cl-finley"],
    request: "Finley Ross's contract ends now. Revoke access in both directories. Keep records and logs.",
    approvedScope: "Disable both accounts, end sessions, remove memberships, move the AD account to Disabled Accounts. Do not delete anything.",
    documents: [{ id: "HR-503", title: "HR termination approval", body: "Termination approved by HR (not requested by the account holder). Effective immediately." }],
    verification: null,
  },
  {
    key: "T504", mission: "M05", title: "Password reset request for Blair",
    requester: "Unrecognized caller", approver: "none", targets: ["cl-blair"],
    request: "A caller says they are Blair and asks for an urgent password reset. They give employee ID CH-099.",
    approvedScope: "No reset approval is attached. Follow the verification procedure.",
    documents: [
      { id: "REQ-504", title: "Requester details (untrusted)", body: "Claimed employee ID: CH-099. Call-back number supplied by caller, not on HR record." },
      { id: "HR-LOOKUP", title: "HR record lookup", body: "Blair Chen (P02) staff ID on file: CH-002." },
      { id: "CB-504", title: "Directory-confirmed callback", body: "Not completed — no callback to the HR-recorded number has been made." },
    ],
    verification: { targetAccount: "cl-blair", callback: { id: "CB-504", completed: false }, claimedHrId: "CH-099" },
    permitsReset: ["cl-blair"],
  },
  {
    key: "T505", mission: "M05", title: "Training VM metadata for Blair",
    requester: "Training resource owner", approver: "Training resource owner", targets: ["cl-blair"],
    request: "Blair needs to view Training-VM details for a class exercise.",
    approvedScope: "View metadata in Identity Training Resource Group (RG-LAB) only. VM stop and other resource groups are excluded.",
    documents: [{ id: "APP-505", title: "Resource owner approval", body: "Approve metadata viewing in RG-LAB only. Explicitly excludes stopping VMs and any other resource group." }],
    verification: null,
  },
];

/* ------------------------------------------------------------------ */
/* Historical scenario records — exact raw values, never modified.     */
/* ------------------------------------------------------------------ */

export const SIGNIN_FIELDS = ["event_id", "time_utc", "user", "application", "source_ip", "device_id", "scenario_location", "outcome", "reason", "authentication_method", "mfa_detail", "correlation_id"] as const;
export const AUDIT_FIELDS = ["event_id", "time_utc", "actor", "activity", "target", "before_value", "after_value", "result", "approval_ticket", "correlation_id"] as const;

export type SigninRaw = Record<(typeof SIGNIN_FIELDS)[number], string>;
export type AuditRaw = Record<(typeof AUDIT_FIELDS)[number], string>;

const HIST_SIGNINS_TSV = `S001	2026-09-21T13:00:00Z	alex@cvi-training.example	CaseDesk	192.0.2.10	managed-alex	Office-A	success	accepted	password_plus_mfa	challenged_now	C001
S002	2026-09-21T13:01:00Z	blair@cvi-training.example	CaseDesk	192.0.2.11	managed-blair	Office-A	failure	incorrect_password	password	not_recorded	C002
S003	2026-09-21T13:02:00Z	blair@cvi-training.example	CaseDesk	192.0.2.11	managed-blair	Office-A	success	accepted	password_plus_mfa	challenged_now	C003
S004	2026-09-21T14:00:00Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	failure	incorrect_password	password	not_recorded	C004
S005	2026-09-21T14:00:30Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	failure	incorrect_password	password	not_recorded	C005
S006	2026-09-21T14:01:00Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	failure	incorrect_password	password	not_recorded	C006
S007	2026-09-21T14:01:30Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	failure	incorrect_password	password	not_recorded	C007
S008	2026-09-21T14:02:00Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	failure	incorrect_password	password	not_recorded	C008
S009	2026-09-21T14:03:00Z	casey@cvi-training.example	CaseDesk	203.0.113.77	unknown-device	Remote-B	success	accepted	password	no_challenge_recorded	C009
S010	2026-09-21T14:10:00Z	alex@cvi-training.example	CaseDesk	192.0.2.10	managed-alex	Office-A	success	accepted	existing_session	satisfied_earlier	C010
S011	2026-09-21T14:12:00Z	alex@cvi-training.example	CaseDesk	198.51.100.20	managed-alex	Remote-C	success	accepted	existing_session	satisfied_earlier	C011
S012	2026-09-21T14:20:00Z	drew@cvi-training.example	CaseDesk	203.0.113.88	unknown-device	Remote-B	failure	account_disabled	password	not_recorded	C012`;

const HIST_AUDIT_TSV = `A001	2026-09-21T13:10:00Z	helpdesk@cvi-training.example	group_member_added	blair@cvi-training.example	none	Junior-Analysts	success	CHG-1101	not_available
A002	2026-09-21T14:04:00Z	casey@cvi-training.example	group_member_added	casey@cvi-training.example	none	Privileged-Operators	success	none_recorded	C009
A003	2026-09-21T14:15:00Z	helpdesk@cvi-training.example	group_member_removed	alex@cvi-training.example	Old-Response-Team	none	success	CHG-1102	not_available
A004	2026-09-21T14:25:00Z	helpdesk@cvi-training.example	password_reset_request	blair@cvi-training.example	unchanged	unchanged	refused	REQ-1103	not_available`;

function parseTsv<K extends string>(fields: readonly K[], tsv: string): Record<K, string>[] {
  return tsv.split("\n").map((line) => {
    const cols = line.split("\t");
    return Object.fromEntries(fields.map((f, i) => [f, cols[i] ?? ""])) as Record<K, string>;
  });
}

export const historicalSignins: SigninRaw[] = parseTsv(SIGNIN_FIELDS, HIST_SIGNINS_TSV);
export const historicalAudit: AuditRaw[] = parseTsv(AUDIT_FIELDS, HIST_AUDIT_TSV);
export const historicalSigninsTsv = `${SIGNIN_FIELDS.join("\t")}\n${HIST_SIGNINS_TSV}\n`;
export const historicalAuditTsv = `${AUDIT_FIELDS.join("\t")}\n${HIST_AUDIT_TSV}\n`;

/** Normalized references, kept separate from raw display values. */
export const historicalGroupMap: Record<string, string> = {
  "Junior-Analysts": "GC-JUN",
  "Privileged-Operators": "GC-PRIV",
  "Old-Response-Team": "GC-OLD",
};
export const upnToCloudAccount = (upn: string) =>
  upn.endsWith("@cvi-training.example") ? `cl-${upn.split("@")[0]}` : null;

export const historicalContext = [
  "Ordinary work hours are 13:00–21:00 UTC, weekdays.",
  "Known devices are listed in the device catalog (managed devices belong to named staff).",
  "Blair reported a typo when signing in at 13:01 on September 21.",
  "Alex's VPN egress 198.51.100.20 may show location Remote-C.",
  "Drew Patel left on September 18 and was disabled.",
  "CHG-1101 approves Blair's Junior-Analysts membership.",
  "CHG-1102 approves Alex's removal from Old-Response-Team.",
  "REQ-1103 has incomplete identity verification.",
  "No approval record is supplied for A002.",
  "mfa_detail 'no_challenge_recorded' means no challenge appears in this excerpt — it does not prove MFA was disabled.",
  "Correlation 'not_available' and ticket 'none_recorded' mean unavailable in this excerpt, not proof of absence everywhere.",
  "These records came from an earlier/unknown policy context; today's simulator lockout and MFA rules are not applied to them.",
];

/* ------------------------------------------------------------------ */
/* Missions — student-visible objectives and steps.                    */
/* ------------------------------------------------------------------ */

export interface MissionSeed {
  key: string;
  lab: string;
  title: string;
  time: string;
  objective: string;
  situation: string;
  steps: string[];
  evidence: { slot: string; label: string }[];
  questions: { id: string; label: string }[];
  tickets: string[];
  exportPath: string;
}

export const missions: MissionSeed[] = [
  {
    key: "M01", lab: "Lab 01", title: "Identity Directory: Who Is Who?", time: "20–30 min",
    objective: "Investigate why one person may have different access in different identity systems.",
    situation: "Before changing anything, map who is who. No configuration changes are needed in this mission.",
    steps: [
      "Open Alex Morgan's person record (Users → Alex). Follow both account links and note each identifier and directory.",
      "Find Alex's AD organizational unit and both accounts' groups. Use Effective access to see the actual paths to Response Share and Response Queue.",
      "Compare Blair's cloud Junior-Analysts group with Finley's Case-Readers group. What does each actually grant? The name alone is not enough.",
      "Find Drew. Inspect both disabled accounts. Why can a person record stay after someone leaves?",
      "Build a directory trace: attach one real object to each of the seven concepts below.",
      "Capture your trace (E01) and comparison (E02), then explain two differences between the AD and cloud views.",
    ],
    evidence: [
      { slot: "E01", label: "Directory trace: Alex person, both accounts, OU, one AD grant path, one cloud role path" },
      { slot: "E02", label: "Comparison of Blair, Finley and Drew" },
    ],
    questions: [
      { id: "diff1", label: "Difference 1 between the AD and cloud views (what you saw, and why it matters)" },
      { id: "diff2", label: "Difference 2 between the AD and cloud views" },
      { id: "groups", label: "What do Junior-Analysts and Case-Readers actually grant? How did you check?" },
      { id: "drew", label: "Why does Drew's person record still exist?" },
    ],
    tickets: [], exportPath: "week-11/labs/lab-01-identity-directory.md",
  },
  {
    key: "M02", lab: "Lab 02", title: "Authentication vs. Authorization: A Valid Badge Doesn't Open Every Door", time: "25–35 min",
    objective: "Diagnose and repair Blair's missing case access without granting update rights.",
    situation: "Ticket T201: Blair signs in to the cloud app but cannot read the case summaries she needs.",
    steps: [
      "Inspect cl-blair: status, MFA and credential state, groups, what those groups are assigned, and Case Summaries' rights. Write a prediction.",
      "Sign-in tester: sign in as cl-blair using managed-blair, current credential, MFA pass. Capture the success.",
      "Test Access with that session: Case Summaries / read. Capture the result and its trace.",
      "Read APP-201 and make the narrow access correction. Do not change passwords to solve an authorization problem.",
      "Retest Case Summaries read and update. Explain why both results match the business request.",
      "Explain identification, authentication, authorization and accountability using your real sign-in, test and audit records.",
    ],
    evidence: [
      { slot: "E03", label: "Successful sign-in + the access result before your change" },
      { slot: "E04", label: "Membership/access change audit + read result + update result" },
    ],
    questions: [
      { id: "prediction", label: "Prediction before testing: will Blair be able to read cases? Why?" },
      { id: "identification", label: "Identification — using the actual account" },
      { id: "authentication", label: "Authentication — using your sign-in event" },
      { id: "authorization", label: "Authorization — using your access tests" },
      { id: "accountability", label: "Accountability — using the audit record" },
    ],
    tickets: ["T201"], exportPath: "week-11/labs/lab-02-authentication-vs-authorization.md",
  },
  {
    key: "M03", lab: "Lab 03", title: "Build and Manage the Directory", time: "35–45 min",
    objective: "Create Jamie's AD account, place it, grant basic group access, and verify, reset and enable it safely.",
    situation: "Tickets T301/T302 onboard Jamie Ellis into the on-prem directory.",
    steps: [
      "Inspect HR person P08 and T301. Create ad-jamie from the planned template and choose the OU. It starts disabled with no groups.",
      "Inspect the DN, person link and groups. Add the group memberships the ticket approves. Why didn't the OU alone grant handbook access?",
      "Open T302. Run verification: match the HR ID and use the directory-confirmed callback.",
      "Perform the simulated credential reset. Note the credential version before and after. No password is ever entered.",
      "Using ACT-301, enable the account, sign in, complete the credential-change challenge, sign in again and test Staff Handbook / read.",
      "Validation: disable → sign-in/access denied → re-enable → fresh sign-in → handbook read allowed.",
      "Capture evidence and explain the separate effects of OU placement, group membership, credential reset and account status.",
    ],
    evidence: [
      { slot: "E05", label: "Created account with OU and groups" },
      { slot: "E06", label: "Passed verification + reset version change" },
      { slot: "E07", label: "Disable / re-enable / session validation sequence" },
    ],
    questions: [
      { id: "ou", label: "What did OU placement change — and not change?" },
      { id: "group", label: "What did group membership change?" },
      { id: "reset", label: "What did the credential reset change? Why did verification come first?" },
      { id: "status", label: "What did disabling and re-enabling do to sessions and access?" },
    ],
    tickets: ["T301", "T302"], exportPath: "week-11/labs/lab-03-build-and-manage-directory.md",
  },
  {
    key: "M04", lab: "Lab 04", title: "Least Privilege Challenge", time: "40–55 min",
    objective: "Configure three job-role assignments, remove excess access, and test role-based and attribute-based access.",
    situation: "Tickets T401–T403 describe three different jobs. Each person should have what the job needs — no more.",
    steps: [
      "For Blair, Casey and Emi, write the job and the required/forbidden actions before configuring.",
      "Inspect each relevant group → role → scope configuration. Keep correct grants, change what's needed, then mark each configuration reviewed.",
      "For Casey, inspect every granting path in Effective access. Find broad rights, capture them, and narrow them. Don't delete role definitions.",
      "After cloud sign-ins, run the nine required tests: Blair case read/update; Casey queue read/update, audit delete, directory manage_sensitive_groups; Emi audit read/export/delete.",
      "Sandbox experiment: give cl-blair temporary Audit-Reviewers membership, test audit read, remove it, retest. Don't leave it.",
      "Casey's Internal Response Note read with managed-casey (current state). Then in What-if, change one attribute at a time: unmanaged device, Audit department, Confidential classification.",
      "Explain RBAC, assignment scope, least privilege, why sign-in didn't settle authorization, and how ABAC adds conditions.",
    ],
    evidence: [
      { slot: "E08", label: "Three job configuration snapshots with rationales" },
      { slot: "E09", label: "The nine required access tests" },
      { slot: "E10", label: "Temporary grant → allowed test → revoke → denied retest" },
      { slot: "E11", label: "Four ABAC cases (current + three what-ifs)" },
    ],
    questions: [
      { id: "jobs", label: "Blair, Casey, Emi: job, required actions, forbidden actions" },
      { id: "abacPredict", label: "Prediction for the three what-if cases, then which attribute changed each result" },
      { id: "rbac", label: "RBAC and assignment scope in your own words" },
      { id: "least", label: "Least privilege — what you removed and why" },
      { id: "abac", label: "Why sign-in didn't settle authorization, and how ABAC adds conditions" },
    ],
    tickets: ["T401", "T402", "T403"], exportPath: "week-11/labs/lab-04-least-privilege-challenge.md",
  },
  {
    key: "M05", lab: "Lab 05", title: "Joiner, Mover, Leaver", time: "40–55 min",
    objective: "Complete four lifecycle tickets across the two directory surfaces, plus a short Azure scope comparison.",
    situation: "Tickets T501–T505. No automatic synchronization exists here: each directory must be handled explicitly.",
    steps: [
      "Joiner T501: create the cloud account for the same Jamie (P08), verify, enroll MFA, enable, complete credential setup, add approved groups; test case read/update.",
      "Mover T502: capture Alex's before access; change department, move the AD OU, adjust memberships in both directories; retest both.",
      "Leaver T503: sign in as Finley first and test case read. Then disable both accounts, revoke sessions, remove memberships, move to Disabled Accounts; retest old session and a new sign-in.",
      "Unverified reset T504: compare requester details with Blair's record, run verification, try the reset if you like, then escalate.",
      "Comparison T505: give cl-blair Training-VM metadata access at RG-LAB; test metadata, stop, and Other-Team-VM metadata.",
    ],
    evidence: [
      { slot: "E12", label: "Jamie joiner chain" },
      { slot: "E13", label: "Alex before/after access and changes" },
      { slot: "E14", label: "Finley session/status/revocation evidence" },
      { slot: "E15", label: "Failed reset verification, refusal and escalation" },
      { slot: "E16", label: "AD DS – Entra – Azure comparison and scoped tests" },
    ],
    questions: [
      { id: "t501", label: "T501 decision table — Add / Retain / Remove / Deny / Escalate (write 'not applicable — reason' where needed)" },
      { id: "t502", label: "T502 decision table — Add / Retain / Remove / Deny / Escalate" },
      { id: "t503", label: "T503 decision table — Add / Retain / Remove / Deny / Escalate" },
      { id: "t504", label: "T504 decision table — Add / Retain / Remove / Deny / Escalate" },
      { id: "azure", label: "Why is an Azure resource role/scope different from a cloud directory role?" },
    ],
    tickets: ["T501", "T502", "T503", "T504", "T505"], exportPath: "week-11/labs/lab-05-joiner-mover-leaver.md",
  },
  {
    key: "M06", lab: "Lab 06", title: "Identity Investigation + Case File (Deliverable 4)", time: "45–60 min",
    objective: "Correlate historical logs and assemble the Cloud Heights IAM Investigation Case File — Portfolio Deliverable 4.",
    situation: "The September 21 historical records are yours to investigate. No row is labelled for you. This mission produces a technical case file — Week 12 turns it into the professional Technical Incident Report and Executive Summary.",
    steps: [
      "Open Sign-in Logs (Historical). Read the fields and context, then write a starting hypothesis.",
      "Filter accounts, outcomes and devices. Open details and View Raw Log. Pin exact event IDs for at least two distinct findings.",
      "Correlate sign-ins with audit changes. Explain what a shared correlation ID supports — and does not prove.",
      "Record one benign or ambiguous comparison (for example a documented typo or VPN context) with its source records.",
      "For each finding fill observation, hypothesis, supported conclusion, uncertainty, next action, priority and why.",
      "Add one live simulator audit/access chain from your earlier missions, labelled separately from historical records.",
      "Assemble the case file sections, preliminary response recommendations and explicit simulation limitations.",
      "Preview the export, fix missing pieces, download the ZIP and upload the files to your GitHub portfolio repository. Week 12 uses this case file as source material for the final report and presentation.",
    ],
    evidence: [
      { slot: "E17", label: "Two distinct findings with raw-event references and correlation" },
      { slot: "E18", label: "Benign/ambiguous comparison" },
      { slot: "E19", label: "Completed case file / versioned export" },
    ],
    questions: [{ id: "hypothesis", label: "Starting hypothesis before filtering" }],
    tickets: [], exportPath: "week-11/labs/lab-06-identity-investigation-case-file.md",
  },
];

export const traceConcepts = [
  { id: "person", label: "Person", hint: "A human at the organization (HR record)" },
  { id: "identity", label: "Identity", hint: "The attributes a system uses to represent an actor — not just a display name" },
  { id: "account", label: "Account", hint: "One system's record used to sign in" },
  { id: "group", label: "Security group", hint: "A list of accounts managed together" },
  { id: "ou", label: "OU", hint: "A directory filing cabinet (AD only here)" },
  { id: "role", label: "Role", hint: "A named bundle of job permissions, assigned at a scope" },
  { id: "permission", label: "Permission", hint: "One action on one kind of resource" },
] as const;

export const reportSections = [
  "Scope, environment and explicit simulation limitation",
  "Identity/directory trace and AD DS–Entra–Azure comparison",
  "Blair authentication-versus-authorization investigation",
  "Directory administration and sensitive-action verification",
  "Three job-role configurations, scopes and business rationales",
  "Access test matrix and temporary grant/revoke evidence",
  "ABAC current-policy and what-if findings",
  "Joiner/mover/leaver and unverified-reset decisions",
  "Historical identity findings (see findings below)",
  "Sign-in/audit correlation (including C009) and one benign/ambiguous comparison",
  "Preliminary response/remediation recommendations, priority and uncertainty",
  "Evidence index notes",
];

export const TEXT_LIMITS = { caption: 2000, finding: 5000, reportTotal: 50000, evidencePerExport: 100 };
