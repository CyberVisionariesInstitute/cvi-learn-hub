/**
 * Phase 3 — client-safe scenario contract types.
 * These describe only the PUBLIC, student-visible projection of a released
 * scenario package. Instructor-private definitions (event definitions,
 * calibration, answer guidance, difficulty) never use these types.
 */

export type OwnerState =
  | "Known"
  | "Unknown"
  | "Investigation Open"
  | "Confirmed"
  | "Unavailable"
  | "Retired";

export type LifecycleState =
  | "Planned"
  | "Requested"
  | "Issued"
  | "Active"
  | "Renewal Due"
  | "Renewal Pending"
  | "Replaced"
  | "Revoked"
  | "Expired"
  | "Retired";

export type StatusValue =
  | "Good"
  | "Revoked"
  | "Unknown"
  | "Stale"
  | "Unreachable"
  | "Not Published"
  | "Not Applicable";

export const LIFECYCLE_STATES: LifecycleState[] = [
  "Planned",
  "Requested",
  "Issued",
  "Active",
  "Renewal Due",
  "Renewal Pending",
  "Replaced",
  "Revoked",
  "Expired",
  "Retired",
];

export const OWNER_STATES: OwnerState[] = [
  "Known",
  "Unknown",
  "Investigation Open",
  "Confirmed",
  "Unavailable",
  "Retired",
];

export const STATUS_VALUES: StatusValue[] = [
  "Good",
  "Revoked",
  "Unknown",
  "Stale",
  "Unreachable",
  "Not Published",
  "Not Applicable",
];

/** Legal lifecycle transitions. Anything else is blocked as impossible. */
export const LIFECYCLE_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  Planned: ["Requested", "Retired"],
  Requested: ["Issued", "Retired"],
  Issued: ["Active", "Revoked", "Retired"],
  Active: ["Renewal Due", "Revoked", "Expired", "Retired"],
  "Renewal Due": ["Renewal Pending", "Revoked", "Expired"],
  "Renewal Pending": ["Replaced", "Renewal Due", "Revoked", "Expired"],
  Replaced: ["Retired"],
  Revoked: ["Retired"],
  Expired: ["Replaced", "Retired"],
  Retired: [],
};

export interface ScenarioMetric {
  label: string;
  value: string;
}

export interface ScenarioZone {
  id: string;
  name: string;
  note: string;
}

export interface CertPool {
  id: string;
  name: string;
  purpose: string;
}

export type ApprovalMode = "standard" | "dual" | "governed";

export interface ProfileTemplate {
  id: string;
  name: string;
  poolId: string;
  algorithm: string;
  validityDays: number;
  eku: string;
  approval: ApprovalMode;
  environment: "internal" | "external" | "development" | "production" | "any";
  notes: string;
}

export interface InventorySeed {
  id: string;
  label: string;
  poolId: string;
  zoneId: string;
  owner: string;
  ownerState: OwnerState;
  lifecycle: LifecycleState;
  status: StatusValue;
  daysRemaining: number | null;
  origin: "known" | "discovered" | "historical" | "exception";
  note: string;
}

export type WorkloadType =
  | "tls"
  | "mtls"
  | "cicd"
  | "code-signing"
  | "timestamping"
  | "cloud";

export interface WorkloadDefinition {
  id: string;
  name: string;
  type: WorkloadType;
  sourceZone: string;
  targetZone: string;
  /** Pools whose certificate an acceptable binding must come from. */
  requiresPools: string[];
  requiredEku: string;
  requiresTimestamp?: boolean;
  requiresHsm?: boolean;
  /** Scenario-specific requirement text, check 14. */
  scenarioRequirement?: string;
  notes: string;
}

export interface ScenarioPolicy {
  requireOfflineRoot: boolean;
  requireHsmForRoot: boolean;
  requireHsmForIssuing: boolean;
  maxIssuingValidityDays: number;
  minIssuingCas: number;
  /** Pairs of zone ids that may not be directly connected. */
  prohibitedPaths: [string, string][];
  /** Zones that a compliant architecture must place at least one node in. */
  requiredZones: string[];
  /** Status distribution problem the scenario expects to be solved. */
  statusChallenge: string;
}

export interface NodeCatalogEntry {
  type: string;
  label: string;
  role: string;
}

export interface ScenarioPublic {
  code: string;
  version: string;
  title: string;
  organization: string;
  industry: string;
  role: string;
  durationWeeks: string;
  architecturePattern: string;
  clmFocus: string;
  situation: string;
  mission: string;
  definitionOfSuccess: string;
  metrics: ScenarioMetric[];
  concerns: string[];
  constraints: string[];
  openQuestions: string[];
  requiredOutcomes: string[];
  researchGuidance: string[];
  zones: ScenarioZone[];
  pools: CertPool[];
  profiles: ProfileTemplate[];
  inventory: InventorySeed[];
  workloads: WorkloadDefinition[];
  nodeCatalog: NodeCatalogEntry[];
  policy: ScenarioPolicy;
}

/** Deterministic overlay applied to frozen Stage 1-3 objects after activation. */
export interface EventEffects {
  disablePaths?: [string, string][];
  allowPaths?: [string, string][];
  statusOverrides?: Record<string, StatusValue>;
  addAssets?: InventorySeed[];
  disableTimestamping?: boolean;
  requireGovernedSigning?: boolean;
  requireApprovalMode?: ApprovalMode;
  staleAllEvidence?: boolean;
  note?: string;
}

/** Public projection of an activated instructor event. */
export interface PublicEvent {
  key: string;
  title: string;
  kind: "change" | "discovery" | "incident";
  studentBrief: string;
  symptoms: string[];
  effects: EventEffects;
}

export const RUBRIC = [
  { key: "analysis", label: "Scenario analysis and requirements", points: 10 },
  { key: "architecture", label: "Architecture and trust", points: 20 },
  { key: "strategy", label: "Certificate strategy and ownership", points: 10 },
  { key: "lifecycle", label: "Lifecycle and automation", points: 15 },
  { key: "status", label: "Status and resilience", points: 10 },
  { key: "workload", label: "Workload integration and diagnosis", points: 10 },
  { key: "change", label: "Change adaptation", points: 10 },
  { key: "evidence", label: "Evidence and presentation", points: 10 },
  { key: "practice", label: "Professional practice and milestones", points: 5 },
] as const;

export const COMPETENCIES = [
  "Scenario Analysis",
  "Requirements Engineering",
  "PKI Architecture",
  "Trust & Segmentation",
  "Key Protection",
  "Certificate Governance",
  "Lifecycle Management",
  "Revocation / Status",
  "Workload Integration",
  "Diagnosis / Troubleshooting",
  "Risk Analysis",
  "Change Adaptation",
  "Decision Rationale",
  "Evidence & Defense",
] as const;

export const CHECKPOINT_TYPES = [
  { key: "change-assessment", label: "Change Assessment" },
  { key: "remediation-design", label: "Remediation Design" },
  { key: "recovery-validation", label: "Recovery Validation" },
  { key: "evidence-defense", label: "Evidence / Defense" },
] as const;

export type CheckpointType = (typeof CHECKPOINT_TYPES)[number]["key"];

export const CHECKPOINT_STATUSES = [
  "Not Ready",
  "Ready for Review",
  "Submitted",
  "Needs Revision",
  "Accepted",
] as const;

export type CheckpointStatus = (typeof CHECKPOINT_STATUSES)[number];
