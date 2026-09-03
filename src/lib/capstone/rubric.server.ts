/**
 * Phase 3 Capstone rubric — STAFF ONLY.
 *
 * This module is server-only by filename convention (`.server.ts`) and must
 * never be imported from a component or a client-reachable module scope.
 * It maps every Stage 1–4 checkpoint onto competencies and points, and
 * derives an evidence-based auto-score from a student's saved project state.
 *
 * Auto-scores are a starting point for the instructor, not a grade: the
 * defense panel can override every criterion.
 */

import type { Phase3State } from "./project-state";
import type { StageGroup } from "./grading";

export type CompetencyKey =
  | "requirements"
  | "architecture"
  | "trust_operations"
  | "automation"
  | "validation"
  | "resilience"
  | "evidence"
  | "communication";

export interface Competency {
  key: CompetencyKey;
  label: string;
  summary: string;
}

export const COMPETENCIES: Competency[] = [
  {
    key: "requirements",
    label: "Requirements & Constraints",
    summary: "Reads the scenario accurately and states what the PKI must satisfy.",
  },
  {
    key: "architecture",
    label: "Trust Architecture",
    summary: "Designs a hierarchy and trust paths that hold up under scrutiny.",
  },
  {
    key: "trust_operations",
    label: "Certificate Operations",
    summary: "Issues, profiles, approves and revokes certificates correctly.",
  },
  {
    key: "automation",
    label: "Lifecycle & Status",
    summary: "Keeps renewal, CRL/OCSP publication and inventory current.",
  },
  {
    key: "validation",
    label: "Workload Validation",
    summary: "Proves the design works against real workload tests.",
  },
  {
    key: "resilience",
    label: "Change & Incident Response",
    summary: "Absorbs late changes and incidents without breaking trust.",
  },
  {
    key: "evidence",
    label: "Evidence Discipline",
    summary: "Every claim is backed by a recorded artifact.",
  },
  {
    key: "communication",
    label: "Defense & Communication",
    summary: "Explains and defends decisions to a non-author audience.",
  },
];

export interface RubricCriterion {
  id: string;
  /** Which Stage 1–4 checkpoint this criterion grades. */
  stage: StageGroup | "defense";
  checkpoint: string;
  competency: CompetencyKey;
  label: string;
  descriptor: string;
  points: number;
  /**
   * Evidence-derived suggestion, 0..1, used to pre-fill the panel score.
   * Defense criteria have no automatic signal and return null.
   */
  auto: ((s: Phase3State) => number) | null;
}

const ratio = (value: number, target: number) =>
  target <= 0 ? 0 : Math.min(1, value / target);

export const RUBRIC: RubricCriterion[] = [
  // Stage 1 — Analyze & Architect
  {
    id: "s1-requirements",
    stage: "stage1",
    checkpoint: "Checkpoint 1.1 — Requirements captured",
    competency: "requirements",
    label: "Scenario requirements are captured and specific",
    descriptor: "At least six requirements traced to the brief, not generic PKI boilerplate.",
    points: 10,
    auto: (s) => ratio(s.analysis.filter((a) => a.kind === "requirement").length, 6),
  },
  {
    id: "s1-findings",
    stage: "stage1",
    checkpoint: "Checkpoint 1.2 — Findings dispositioned",
    competency: "requirements",
    label: "Every discovery finding has a disposition",
    descriptor: "Findings are accepted, remediated or explicitly deferred with a reason.",
    points: 8,
    auto: (s) => ratio(s.architecture.dispositions.length, 5),
  },
  {
    id: "s1-hierarchy",
    stage: "stage1",
    checkpoint: "Checkpoint 1.3 — Hierarchy designed",
    competency: "architecture",
    label: "Trust hierarchy is complete and justified",
    descriptor: "Roots, issuing CAs and relying parties are present with sane roles.",
    points: 12,
    auto: (s) => ratio(s.architecture.nodes.length, 6),
  },
  {
    id: "s1-paths",
    stage: "stage1",
    checkpoint: "Checkpoint 1.4 — Trust paths connected",
    competency: "architecture",
    label: "Trust paths connect every relying workload",
    descriptor: "Connections form valid chains; no orphaned components.",
    points: 10,
    auto: (s) => ratio(s.architecture.edges.length, 5),
  },
  {
    id: "s1-decisions",
    stage: "stage1",
    checkpoint: "Checkpoint 1.5 — Decisions recorded",
    competency: "evidence",
    label: "Design decisions are written down with rationale",
    descriptor: "Decisions state the option chosen and why alternatives were rejected.",
    points: 6,
    auto: (s) => ratio(s.analysis.filter((a) => a.kind === "decision").length, 4),
  },

  // Stage 2 — Certificate Operations
  {
    id: "s2-profiles",
    stage: "stage2",
    checkpoint: "Checkpoint 2.1 — Certificate profiles",
    competency: "trust_operations",
    label: "Profiles match the workloads they serve",
    descriptor: "Key usage, validity and subject rules fit each workload class.",
    points: 10,
    auto: (s) => ratio(s.operations.profiles.length, 3),
  },
  {
    id: "s2-issuance",
    stage: "stage2",
    checkpoint: "Checkpoint 2.2 — Issuance",
    competency: "trust_operations",
    label: "Certificates issued to the correct subjects",
    descriptor: "Issued assets cover the scenario's required services.",
    points: 10,
    auto: (s) => ratio(s.operations.assets.length, 5),
  },
  {
    id: "s2-approvals",
    stage: "stage2",
    checkpoint: "Checkpoint 2.3 — Approval discipline",
    competency: "trust_operations",
    label: "Approvals follow the scenario's control requirements",
    descriptor: "Sensitive issuance is approved, not self-served.",
    points: 8,
    auto: (s) => ratio(s.operations.approvals.length, 3),
  },
  {
    id: "s2-lifecycle",
    stage: "stage2",
    checkpoint: "Checkpoint 2.4 — Lifecycle handling",
    competency: "automation",
    label: "Renewal and revocation are exercised",
    descriptor: "Lifecycle events show renewal and revocation handled deliberately.",
    points: 8,
    auto: (s) => ratio(s.operations.lifecycle.length, 4),
  },
  {
    id: "s2-status",
    stage: "stage2",
    checkpoint: "Checkpoint 2.5 — Status publication",
    competency: "automation",
    label: "CRL/OCSP status is published and current",
    descriptor: "Revocation status is reachable by relying parties.",
    points: 8,
    auto: (s) => ratio(s.operations.publications.length, 2),
  },

  // Stage 3 — Workload Validation & Testing
  {
    id: "s3-coverage",
    stage: "stage3",
    checkpoint: "Checkpoint 3.1 — Workload coverage",
    competency: "validation",
    label: "All required workloads are instantiated",
    descriptor: "Each service named in the brief is represented and testable.",
    points: 10,
    auto: (s) => ratio(s.workloads.instances.length, 4),
  },
  {
    id: "s3-runs",
    stage: "stage3",
    checkpoint: "Checkpoint 3.2 — Tests executed",
    competency: "validation",
    label: "Validation tests were actually run",
    descriptor: "Runs exist across workloads, not a single token test.",
    points: 8,
    auto: (s) => ratio(s.workloads.runs.length, 5),
  },
  {
    id: "s3-passing",
    stage: "stage3",
    checkpoint: "Checkpoint 3.3 — Tests passing",
    competency: "validation",
    label: "Workloads pass validation on the current design",
    descriptor: "Latest runs pass; failures are explained and resolved.",
    points: 12,
    auto: (s) => {
      const runs = s.workloads.runs;
      if (runs.length === 0) return 0;
      return runs.filter((r) => r.result === "PASS").length / runs.length;
    },
  },

  // Stage 4 — Change, Incident & Defense
  {
    id: "s4-ack",
    stage: "stage4",
    checkpoint: "Checkpoint 4.1 — Events absorbed",
    competency: "resilience",
    label: "Released changes and incidents are acknowledged and worked",
    descriptor: "No activated event is left unhandled.",
    points: 10,
    auto: (s) => ratio(s.change.acknowledged.length, 2),
  },
  {
    id: "s4-timeline",
    stage: "stage4",
    checkpoint: "Checkpoint 4.2 — Response timeline",
    competency: "resilience",
    label: "Response actions are sequenced and timed",
    descriptor: "The timeline shows what was done, when, and why.",
    points: 8,
    auto: (s) => ratio(s.change.timeline.length, 5),
  },
  {
    id: "s4-checkpoints",
    stage: "stage4",
    checkpoint: "Checkpoint 4.3 — Readiness checkpoints",
    competency: "resilience",
    label: "Readiness checkpoints are declared ready",
    descriptor: "The student judges their own readiness honestly.",
    points: 6,
    auto: (s) => ratio(s.change.checkpoints.filter((c) => c.status !== "Not Ready").length, 3),
  },
  {
    id: "s4-evidence",
    stage: "stage4",
    checkpoint: "Checkpoint 4.4 — Evidence package",
    competency: "evidence",
    label: "Evidence package supports the final claims",
    descriptor: "Notes and artifacts let a reviewer verify the outcome independently.",
    points: 8,
    auto: (s) => ratio(Object.keys(s.notes).filter((k) => (s.notes[k] ?? "").trim()).length, 4),
  },

  // Defense — panel scored only
  {
    id: "d1-narrative",
    stage: "defense",
    checkpoint: "Defense — Architecture walkthrough",
    competency: "communication",
    label: "Explains the architecture clearly end to end",
    descriptor: "A non-author can follow the trust story without the diagram.",
    points: 10,
    auto: null,
  },
  {
    id: "d2-justification",
    stage: "defense",
    checkpoint: "Defense — Decision justification",
    competency: "communication",
    label: "Defends decisions under questioning",
    descriptor: "Answers hold up, and trade-offs are acknowledged honestly.",
    points: 10,
    auto: null,
  },
  {
    id: "d3-proof",
    stage: "defense",
    checkpoint: "Defense — Proof on demand",
    competency: "evidence",
    label: "Produces proof for claims when asked",
    descriptor: "Points to the run, artifact or record that proves the claim.",
    points: 10,
    auto: null,
  },
  {
    id: "d4-incident",
    stage: "defense",
    checkpoint: "Defense — Incident reasoning",
    competency: "resilience",
    label: "Reasons through the late change or incident",
    descriptor: "Explains impact, containment and residual risk.",
    points: 8,
    auto: null,
  },
];

export const MAX_POINTS = RUBRIC.reduce((sum, c) => sum + c.points, 0);

export interface CriterionScore {
  id: string;
  /** Evidence-derived suggestion in points (rounded), or null for defense criteria. */
  autoPoints: number | null;
  /** Panel override, if the instructor has scored it. */
  panelPoints: number | null;
  /** Effective points used in the total. */
  points: number;
}

export interface RubricScore {
  criteria: CriterionScore[];
  autoTotal: number;
  total: number;
  maxPoints: number;
  percent: number;
  byStage: Array<{ stage: StageGroup | "defense"; points: number; maxPoints: number }>;
  byCompetency: Array<{ competency: CompetencyKey; points: number; maxPoints: number }>;
}

/** Score one project. `overrides` maps criterion id -> panel points. */
export function scoreRubric(
  state: Phase3State,
  overrides: Record<string, number> = {},
): RubricScore {
  const criteria: CriterionScore[] = RUBRIC.map((c) => {
    const autoPoints = c.auto ? Math.round(c.auto(state) * c.points) : null;
    const raw = overrides[c.id];
    const panelPoints =
      typeof raw === "number" && Number.isFinite(raw)
        ? Math.max(0, Math.min(c.points, Math.round(raw)))
        : null;
    return {
      id: c.id,
      autoPoints,
      panelPoints,
      points: panelPoints ?? autoPoints ?? 0,
    };
  });

  const pointsOf = (id: string) => criteria.find((c) => c.id === id)?.points ?? 0;
  const stages: Array<StageGroup | "defense"> = ["stage1", "stage2", "stage3", "stage4", "defense"];

  return {
    criteria,
    autoTotal: criteria.reduce((sum, c) => sum + (c.autoPoints ?? 0), 0),
    total: criteria.reduce((sum, c) => sum + c.points, 0),
    maxPoints: MAX_POINTS,
    percent: Math.round((criteria.reduce((s, c) => s + c.points, 0) / MAX_POINTS) * 100),
    byStage: stages.map((stage) => {
      const group = RUBRIC.filter((c) => c.stage === stage);
      return {
        stage,
        points: group.reduce((s, c) => s + pointsOf(c.id), 0),
        maxPoints: group.reduce((s, c) => s + c.points, 0),
      };
    }),
    byCompetency: COMPETENCIES.map((comp) => {
      const group = RUBRIC.filter((c) => c.competency === comp.key);
      return {
        competency: comp.key,
        points: group.reduce((s, c) => s + pointsOf(c.id), 0),
        maxPoints: group.reduce((s, c) => s + c.points, 0),
      };
    }),
  };
}

/** Client-safe projection of the rubric definition for the staff UI. */
export function rubricDefinition() {
  return {
    competencies: COMPETENCIES,
    maxPoints: MAX_POINTS,
    criteria: RUBRIC.map(({ auto: _auto, ...rest }) => rest),
  };
}
