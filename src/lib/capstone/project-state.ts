/**
 * Phase 3 — student project state (client-safe).
 * The project is the only editable object; the scenario package is read-only.
 */

import type {
  ApprovalMode,
  CheckpointStatus,
  CheckpointType,
  LifecycleState,
  OwnerState,
  StatusValue,
} from "./scenario-types";

export const STATE_VERSION = 2;

/* ---------------------------------------------------------------- Stage 1 */

export type AnalysisKind =
  | "fact"
  | "assumption"
  | "question"
  | "risk"
  | "requirement"
  | "decision";

export type RequirementStatus = "addressed" | "partially addressed" | "unresolved";

export interface AnalysisItem {
  id: string;
  kind: AnalysisKind;
  title: string;
  detail: string;
  /** Traced source: scenario constraint / concern / open question id or text. */
  source: string;
  status?: RequirementStatus;
  priority?: "Must" | "Should" | "Could";
}

export type NodeKind =
  | "vm"
  | "service"
  | "hsm"
  | "ca-root"
  | "ca-issuing"
  | "publisher"
  | "relying-system"
  | "appliance";

export interface ArchNode {
  id: string;
  kind: NodeKind;
  name: string;
  role: string;
  zoneId: string;
  x: number;
  y: number;
  /** For CA nodes: id of the signing parent CA node. */
  parentId?: string;
  /** For CA / signing nodes: id of the HSM node protecting the key. */
  hsmId?: string;
  hsmRationale?: string;
  offline?: boolean;
  validityDays?: number;
  notes?: string;
}

export interface ArchEdge {
  id: string;
  fromId: string;
  toId: string;
  kind: "network" | "trust" | "publication" | "enrollment";
  label: string;
}

export interface FindingDisposition {
  findingId: string;
  disposition: "accepted-risk" | "remediated" | "rejected" | "open";
  rationale: string;
  evidenceRef?: string;
}

/* ---------------------------------------------------------------- Stage 2 */

export interface StudentProfile {
  id: string;
  name: string;
  poolId: string;
  eligibleCaIds: string[];
  algorithm: string;
  validityDays: number;
  subject: string;
  san: string;
  eku: string;
  enrollment: "ACME" | "SCEP" | "EST" | "Manual" | "API";
  approval: ApprovalMode;
  renewal: "automated" | "assisted" | "manual";
  statusMethod: "CRL" | "OCSP" | "OCSP stapling" | "Scheduled CRL" | "None";
  ownershipRequired: boolean;
  exportable: boolean;
  environment: "internal" | "external" | "development" | "production" | "any";
  exception?: string;
  rationale: string;
}

export interface CertAsset {
  id: string;
  label: string;
  poolId: string;
  profileId?: string;
  caNodeId?: string;
  targetNodeId?: string;
  zoneId: string;
  owner: string;
  ownerState: OwnerState;
  lifecycle: LifecycleState;
  status: StatusValue;
  daysRemaining: number | null;
  origin: "known" | "discovered" | "historical" | "exception" | "student";
  /** Set when this asset replaced another (renewal / re-issue). */
  replacesId?: string;
  revocationReason?: string;
  publishedTo?: string[];
  note: string;
  /** Present only for assets introduced by an activated instructor event. */
  fromEventKey?: string;
}

export interface LifecycleEvent {
  id: string;
  assetId: string;
  at: string;
  action: string;
  from?: string;
  to?: string;
  actor: "student" | "automation" | "instructor-event";
  detail: string;
}

export interface ApprovalRecord {
  id: string;
  assetId: string;
  requestedBy: string;
  approvedBy: string;
  mode: ApprovalMode;
  at: string;
  note: string;
}

export interface DiscoveryRun {
  id: string;
  at: string;
  scope: string;
  foundAssetIds: string[];
}

export interface StatusPublication {
  id: string;
  method: "CRL" | "OCSP" | "Scheduled CRL" | "OCSP stapling";
  publisherNodeId: string;
  consumerZoneId: string;
  freshnessHours: number;
  reachable: boolean;
  note: string;
}

/* ---------------------------------------------------------------- Stage 3 */

export interface WorkloadInstance {
  id: string;
  definitionId: string;
  name: string;
  /** Certificate bindings by role: server, client, signing, tsa. */
  bindings: Record<string, string | undefined>;
  sourceNodeId?: string;
  targetNodeId?: string;
  config: Record<string, string>;
}

export type FailureCategory =
  | "Configuration"
  | "Connectivity"
  | "Trust"
  | "Certificate"
  | "Status"
  | "Signing"
  | "Timestamp"
  | "Policy/Governance"
  | "Integrity";

export interface DependencyCheck {
  order: number;
  key: string;
  label: string;
  result: "pass" | "fail" | "skipped";
  expected: string;
  observed: string;
  category?: FailureCategory | undefined;
  code?: string | undefined;
  consequence?: string | undefined;
  objectRef?: string | undefined;
  relatedRequirementId?: string | undefined;
}

export interface ExecutionRun {
  id: string;
  workloadInstanceId: string;
  definitionId: string;
  at: string;
  clockDay: number;
  scenarioVersion: string;
  ruleVersion: string;
  result: "PASS" | "FAIL";
  checks: DependencyCheck[];
  artifacts: { id: string; kind: string; label: string; detail: string }[];
  timestamps: { id: string; artifactId: string; at: string; valid: boolean; note: string }[];
  /** Ids of previous runs of the same workload instance. */
  priorRunIds: string[];
  /** Event keys active when the run executed. */
  activeEventKeys: string[];
  staleForCurrentState?: boolean;
}

/* ---------------------------------------------------------------- Stage 4 */

export interface TimelineEntry {
  id: string;
  at: string;
  kind: "baseline" | "event" | "student-action" | "revalidation";
  title: string;
  detail: string;
  eventKey?: string;
}

export interface CheckpointRecord {
  type: CheckpointType;
  status: CheckpointStatus;
  studentNote: string;
  submittedAt?: string;
}

export interface ProjectBaselineSnapshot {
  id: string;
  eventKey: string;
  at: string;
  runSummary: { workloadInstanceId: string; runId: string; result: "PASS" | "FAIL" }[];
  findingCount: number;
}

/* ------------------------------------------------------------------ Root */

export interface Phase3State {
  version: number;
  clockDay: number;
  analysis: AnalysisItem[];
  architecture: {
    nodes: ArchNode[];
    edges: ArchEdge[];
    dispositions: FindingDisposition[];
  };
  operations: {
    profiles: StudentProfile[];
    assets: CertAsset[];
    lifecycle: LifecycleEvent[];
    approvals: ApprovalRecord[];
    discovery: DiscoveryRun[];
    publications: StatusPublication[];
  };
  workloads: {
    instances: WorkloadInstance[];
    runs: ExecutionRun[];
  };
  change: {
    timeline: TimelineEntry[];
    baselines: ProjectBaselineSnapshot[];
    checkpoints: CheckpointRecord[];
    acknowledged: string[];
  };
  notes: Record<string, string>;
  /** Seeded inventory ids that have been imported into operations. */
  seeded: string[];
}

export function emptyPhase3State(): Phase3State {
  return {
    version: STATE_VERSION,
    clockDay: 0,
    analysis: [],
    architecture: { nodes: [], edges: [], dispositions: [] },
    operations: {
      profiles: [],
      assets: [],
      lifecycle: [],
      approvals: [],
      discovery: [],
      publications: [],
    },
    workloads: { instances: [], runs: [] },
    change: { timeline: [], baselines: [], checkpoints: [], acknowledged: [] },
    notes: {},
    seeded: [],
  };
}

/** Accepts legacy (v1 register) state and returns a valid v2 structure. */
export function normalizeState(raw: unknown): Phase3State {
  const base = emptyPhase3State();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Phase3State> & Record<string, unknown>;
  if (r.version !== STATE_VERSION) {
    // Legacy v1 stage registers: keep their notes so nothing is lost.
    const notes: Record<string, string> = {};
    for (const [key, value] of Object.entries(r)) {
      if (value && typeof value === "object" && "notes" in (value as object)) {
        const n = (value as { notes?: unknown }).notes;
        if (typeof n === "string" && n.trim()) notes[key] = n;
      }
    }
    return { ...base, notes };
  }
  return {
    ...base,
    ...r,
    architecture: { ...base.architecture, ...(r.architecture ?? {}) },
    operations: { ...base.operations, ...(r.operations ?? {}) },
    workloads: { ...base.workloads, ...(r.workloads ?? {}) },
    change: { ...base.change, ...(r.change ?? {}) },
    notes: { ...(r.notes ?? {}) },
    seeded: r.seeded ?? [],
  } as Phase3State;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
