/**
 * Phase 3 PKI Architect Capstone — shared, client-safe model.
 * No secrets, no instructor-private content.
 */

export type StageKey =
  | "analyze"
  | "design"
  | "connect"
  | "operate"
  | "automate"
  | "validate"
  | "test"
  | "adapt"
  | "defend";

export interface StageFieldDef {
  key: string;
  label: string;
  kind: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
}

export interface StageDef {
  key: StageKey;
  week: number;
  label: string;
  headline: string;
  objective: string;
  /** Label for a single record in this stage's register. */
  itemNoun: string;
  fields: StageFieldDef[];
  /** Free-form narrative prompt shown above the register. */
  notesPrompt: string;
}

export const STAGES: StageDef[] = [
  {
    key: "analyze",
    week: 17,
    label: "Analyze",
    headline: "Scenario Analysis & Requirements",
    objective:
      "Map stakeholders, trust boundaries, and the requirements your architecture must satisfy.",
    itemNoun: "Requirement",
    notesPrompt: "Summarise the organization, its risk posture, and what must be protected.",
    fields: [
      { key: "title", label: "Requirement", kind: "text", placeholder: "Clinical devices must authenticate to the gateway" },
      { key: "source", label: "Traced from", kind: "text", placeholder: "Scenario constraint or stakeholder" },
      {
        key: "priority",
        label: "Priority",
        kind: "select",
        options: ["Must", "Should", "Could"],
      },
      { key: "notes", label: "Why it matters", kind: "textarea" },
    ],
  },
  {
    key: "design",
    week: 18,
    label: "Design",
    headline: "Trust Model & PKI Hierarchy",
    objective: "Define the root, intermediate, and issuing authorities and how they relate.",
    itemNoun: "Authority",
    notesPrompt: "Explain the shape of your hierarchy and why it fits the constraints.",
    fields: [
      { key: "title", label: "Authority name", kind: "text", placeholder: "Meridian Root CA" },
      {
        key: "tier",
        label: "Tier",
        kind: "select",
        options: ["Root", "Intermediate", "Issuing"],
      },
      { key: "parent", label: "Signed by", kind: "text", placeholder: "Parent authority" },
      { key: "keying", label: "Key & protection", kind: "text", placeholder: "RSA-4096, offline, HSM-backed" },
      { key: "validity", label: "Validity", kind: "text", placeholder: "20 years" },
      { key: "notes", label: "Justification", kind: "textarea" },
    ],
  },
  {
    key: "connect",
    week: 19,
    label: "Connect",
    headline: "VM, HSM, Network & Service Architecture",
    objective: "Place the infrastructure that will carry the PKI and connect it.",
    itemNoun: "Component",
    notesPrompt: "Describe the placement decisions and the boundaries they enforce.",
    fields: [
      { key: "title", label: "Component", kind: "text", placeholder: "Issuing CA VM" },
      {
        key: "kind",
        label: "Type",
        kind: "select",
        options: ["VM", "HSM", "Network zone", "Service", "Appliance"],
      },
      { key: "zone", label: "Zone / segment", kind: "text", placeholder: "Core secure zone" },
      { key: "connects", label: "Connects to", kind: "text", placeholder: "Service mesh, OCSP responder" },
      { key: "notes", label: "Rationale", kind: "textarea" },
    ],
  },
  {
    key: "operate",
    week: 20,
    label: "Operate",
    headline: "Certificate Strategy & Issuance Design",
    objective: "Match certificate types, lifetimes, and validation workflows to workloads.",
    itemNoun: "Certificate profile",
    notesPrompt: "State the issuance policy: who may request what, and how it is approved.",
    fields: [
      { key: "title", label: "Profile name", kind: "text", placeholder: "Service mTLS" },
      { key: "workload", label: "Workload", kind: "text", placeholder: "Internal service mesh" },
      { key: "issuer", label: "Issued by", kind: "text", placeholder: "Issuing CA 1" },
      { key: "lifetime", label: "Lifetime", kind: "text", placeholder: "90 days" },
      {
        key: "usage",
        label: "Key usage",
        kind: "select",
        options: ["Server auth", "Client auth", "Mutual TLS", "Code signing", "Document signing"],
      },
      { key: "notes", label: "Design notes", kind: "textarea" },
    ],
  },
  {
    key: "automate",
    week: 21,
    label: "Automate",
    headline: "Lifecycle Automation, CRL & OCSP",
    objective: "Automate issuance, renewal, and revocation visibility.",
    itemNoun: "Lifecycle control",
    notesPrompt: "Describe how renewal and revocation stay reliable without manual effort.",
    fields: [
      { key: "title", label: "Control", kind: "text", placeholder: "ACME renewal for mesh workloads" },
      {
        key: "mechanism",
        label: "Mechanism",
        kind: "select",
        options: ["ACME", "SCEP", "EST", "Manual ceremony", "CRL", "OCSP", "OCSP stapling"],
      },
      { key: "cadence", label: "Cadence / freshness", kind: "text", placeholder: "Renew at 2/3 lifetime" },
      { key: "failure", label: "Failure behaviour", kind: "text", placeholder: "Soft-fail with alert" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    key: "validate",
    week: 22,
    label: "Validate",
    headline: "Workload Trust Validation",
    objective: "Check that workloads trust only the certificates you intended.",
    itemNoun: "Validation check",
    notesPrompt: "Record what you checked and what the result actually proves.",
    fields: [
      { key: "title", label: "Check", kind: "text", placeholder: "Portal trusts only public chain" },
      { key: "workload", label: "Workload", kind: "text" },
      { key: "expected", label: "Expected trust anchor", kind: "text" },
      {
        key: "result",
        label: "Result",
        kind: "select",
        options: ["Pass", "Fail", "Inconclusive"],
      },
      { key: "notes", label: "Evidence", kind: "textarea" },
    ],
  },
  {
    key: "test",
    week: 22,
    label: "Test",
    headline: "Workload & Failure Testing",
    objective: "Test against realistic traffic, outages, and misuse cases.",
    itemNoun: "Test run",
    notesPrompt: "Describe the conditions you injected and what broke first.",
    fields: [
      { key: "title", label: "Test", kind: "text", placeholder: "Revoke issuing CA under load" },
      {
        key: "kind",
        label: "Type",
        kind: "select",
        options: ["Load", "Outage", "Expiry", "Revocation", "Misuse", "Recovery"],
      },
      { key: "expected", label: "Expected outcome", kind: "text" },
      { key: "observed", label: "Observed outcome", kind: "text" },
      { key: "notes", label: "Analysis", kind: "textarea" },
    ],
  },
  {
    key: "adapt",
    week: 23,
    label: "Adapt",
    headline: "Change / Incident & Architecture Revision",
    objective: "Respond to the change your instructor releases and justify the revised design.",
    itemNoun: "Change response",
    notesPrompt: "Before/after: what changed in the architecture, and why.",
    fields: [
      { key: "title", label: "Response", kind: "text", placeholder: "Re-key the compromised issuing CA" },
      { key: "trigger", label: "Triggered by", kind: "text", placeholder: "Released change event" },
      { key: "before", label: "Before", kind: "textarea" },
      { key: "after", label: "After", kind: "textarea" },
      { key: "notes", label: "Re-test result", kind: "textarea" },
    ],
  },
  {
    key: "defend",
    week: 24,
    label: "Defend",
    headline: "Final Portfolio & Defense",
    objective: "Present evidence, decisions, and lessons learned.",
    itemNoun: "Defense claim",
    notesPrompt: "Your closing statement: what you built, and what your evidence proves.",
    fields: [
      { key: "title", label: "Claim", kind: "text", placeholder: "Revocation is provable within one hour" },
      { key: "evidence", label: "Backed by", kind: "text", placeholder: "Test run / validation check" },
      { key: "notes", label: "Argument", kind: "textarea" },
    ],
  },
];

export const STAGE_KEYS = STAGES.map((s) => s.key);

export function isStageKey(value: string): value is StageKey {
  return (STAGE_KEYS as string[]).includes(value);
}

export function getStage(key: StageKey): StageDef {
  return STAGES.find((s) => s.key === key)!;
}

export interface StageItem {
  id: string;
  [field: string]: string;
}

export interface StageState {
  notes: string;
  items: StageItem[];
}

export type ProjectState = Partial<Record<StageKey, StageState>>;

export function emptyStage(): StageState {
  return { notes: "", items: [] };
}

export function stageOf(state: ProjectState, key: StageKey): StageState {
  return state[key] ?? emptyStage();
}

/** Stage is considered started once it has notes or at least one record. */
export function stageProgress(state: ProjectState, key: StageKey): "empty" | "started" {
  const s = stageOf(state, key);
  return s.notes.trim() || s.items.length > 0 ? "started" : "empty";
}
