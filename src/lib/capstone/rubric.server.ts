/**
 * Phase 3 Capstone rubric — STAFF ONLY.
 *
 * Server-only by filename convention (`.server.ts`); never import from a
 * component or a client-reachable module scope.
 *
 * Category keys, labels and weights come from the shared public-safe module
 * `rubric-categories.ts` (the same source the Student Guide renders), so the
 * approved 100-point model cannot drift. Everything in THIS file — evidence
 * signals, targets, descriptors, calibration — is instructor-private.
 *
 * Auto-scores are a starting point, not a grade: the panel can override every
 * category from 0 to its approved maximum. The final defense contributes
 * WITHIN the 100 points (Evidence & presentation, Professional practice &
 * milestones); there are no defense points on top.
 */

import type { Phase3State } from "./project-state";
import {
  RUBRIC_CATEGORIES,
  RUBRIC_TOTAL_POINTS,
  type RubricCategory,
  type RubricCategoryKey,
} from "./rubric-categories";

export type { RubricCategoryKey, RubricCategory };
export { RUBRIC_CATEGORIES };

/** Instructor-private evidence signal feeding a category's auto-score. */
interface Signal {
  label: string;
  /** Returns 0..1. */
  value: (s: Phase3State) => number;
}

export interface RubricCriterion {
  /** Stable id, equal to the category key: panel overrides are per category. */
  id: RubricCategoryKey;
  label: string;
  points: number;
  /** Stage 1–4 checkpoints this category grades. */
  checkpoint: string;
  descriptor: string;
  /** Whether the panel is expected to grade this live at the defense. */
  defenseWeighted: boolean;
  signals: Signal[];
}

const ratio = (value: number, target: number) => (target <= 0 ? 0 : Math.min(1, value / target));

const filled = (s: Phase3State) =>
  Object.keys(s.notes).filter((k) => (s.notes[k] ?? "").trim().length > 0).length;

const CRITERIA_META: Record<
  RubricCategoryKey,
  Omit<RubricCriterion, "id" | "label" | "points">
> = {
  analysis: {
    checkpoint: "Checkpoints 1.1–1.2 — Requirements captured, findings dispositioned",
    descriptor:
      "Requirements are specific and traced to the brief, and every discovery finding is accepted, remediated or explicitly deferred.",
    defenseWeighted: false,
    signals: [
      {
        label: "Requirements captured",
        value: (s) => ratio(s.analysis.filter((a) => a.kind === "requirement").length, 6),
      },
      {
        label: "Findings dispositioned",
        value: (s) => ratio(s.architecture.dispositions.length, 5),
      },
    ],
  },
  architecture: {
    checkpoint: "Checkpoints 1.3–1.4 — Hierarchy designed, trust paths connected",
    descriptor:
      "CA hierarchy, trust relationships, zones and key-protection choices form a validated structure with no orphaned components.",
    defenseWeighted: false,
    signals: [
      { label: "Hierarchy components", value: (s) => ratio(s.architecture.nodes.length, 6) },
      { label: "Trust paths", value: (s) => ratio(s.architecture.edges.length, 5) },
      {
        label: "Design decisions recorded",
        value: (s) => ratio(s.analysis.filter((a) => a.kind === "decision").length, 4),
      },
    ],
  },
  certificate_strategy: {
    checkpoint: "Checkpoints 2.1–2.3 — Profiles, issuance, approval discipline",
    descriptor:
      "Certificate pools, profiles, ownership and the approval model fit the workloads and the scenario's control requirements.",
    defenseWeighted: false,
    signals: [
      { label: "Certificate profiles", value: (s) => ratio(s.operations.profiles.length, 3) },
      { label: "Issued assets", value: (s) => ratio(s.operations.assets.length, 5) },
      { label: "Approvals exercised", value: (s) => ratio(s.operations.approvals.length, 3) },
    ],
  },
  lifecycle: {
    checkpoint: "Checkpoint 2.4 — Lifecycle handling and automation",
    descriptor:
      "Issuance, renewal, replacement and revocation are exercised deliberately as lifecycle operations, not one-off actions.",
    defenseWeighted: false,
    signals: [
      { label: "Lifecycle events", value: (s) => ratio(s.operations.lifecycle.length, 4) },
      {
        label: "Renewal / revocation coverage",
        value: (s) => {
          const kinds = new Set(
            s.operations.lifecycle.map((e) => String((e as { action?: string }).action ?? "")),
          );
          return ratio(kinds.size, 3);
        },
      },
    ],
  },
  status_resilience: {
    checkpoint: "Checkpoint 2.5 — Status publication and reachability",
    descriptor:
      "CRL/OCSP publication is current and reachable by relying parties, with resilience controls for status availability.",
    defenseWeighted: false,
    signals: [
      { label: "Status publications", value: (s) => ratio(s.operations.publications.length, 2) },
    ],
  },
  workload: {
    checkpoint: "Checkpoints 3.1–3.3 — Coverage, execution, diagnosis, re-test",
    descriptor:
      "Every required workload is instantiated, tested across runs, and failures are diagnosed and resolved on the current design.",
    defenseWeighted: false,
    signals: [
      { label: "Workload coverage", value: (s) => ratio(s.workloads.instances.length, 4) },
      { label: "Runs executed", value: (s) => ratio(s.workloads.runs.length, 5) },
      {
        label: "Runs passing",
        value: (s) =>
          s.workloads.runs.length === 0
            ? 0
            : s.workloads.runs.filter((r) => r.result === "PASS").length / s.workloads.runs.length,
      },
    ],
  },
  change: {
    checkpoint: "Checkpoints 4.1–4.2 — Events absorbed, response timeline",
    descriptor:
      "Activated Stage 4 changes and incidents are acknowledged, worked, revalidated and re-tested with a sequenced timeline.",
    defenseWeighted: false,
    signals: [
      { label: "Events acknowledged", value: (s) => ratio(s.change.acknowledged.length, 2) },
      { label: "Timeline entries", value: (s) => ratio(s.change.timeline.length, 5) },
    ],
  },
  evidence: {
    checkpoint: "Checkpoint 4.4 — Evidence package · Final defense proof",
    descriptor:
      "Evidence is current and lets a reviewer verify the outcome independently, and the student produces proof on demand during the defense. Defense presentation quality is scored here — there are no separate defense points.",
    defenseWeighted: true,
    signals: [{ label: "Evidence notes on file", value: (s) => ratio(filled(s), 4) }],
  },
  professional: {
    checkpoint: "Checkpoint 4.3 — Readiness checkpoints and milestone discipline",
    descriptor:
      "Checkpoints are worked on schedule and the student's reasoning and process are professional under questioning at the defense.",
    defenseWeighted: true,
    signals: [
      {
        label: "Checkpoints started",
        value: (s) => ratio(s.change.checkpoints.filter((c) => c.status !== "Not Ready").length, 3),
      },
    ],
  },
};

export const RUBRIC: RubricCriterion[] = RUBRIC_CATEGORIES.map((cat) => ({
  id: cat.key,
  label: cat.area,
  points: cat.points,
  ...CRITERIA_META[cat.key],
}));

export const MAX_POINTS = RUBRIC_TOTAL_POINTS;

export interface CriterionScore {
  id: RubricCategoryKey;
  /** Evidence-derived suggestion in points. */
  autoPoints: number;
  /** Panel override, if the instructor has scored it. */
  panelPoints: number | null;
  /** Effective points used in the total. */
  points: number;
  maxPoints: number;
}

export interface RubricScore {
  criteria: CriterionScore[];
  autoTotal: number;
  total: number;
  maxPoints: number;
  percent: number;
  byCategory: Array<{ category: RubricCategoryKey; points: number; maxPoints: number }>;
}

function autoRatio(c: RubricCriterion, state: Phase3State): number {
  if (c.signals.length === 0) return 0;
  const sum = c.signals.reduce((acc, sig) => acc + Math.max(0, Math.min(1, sig.value(state))), 0);
  return sum / c.signals.length;
}

/** Score one project. `overrides` maps category key -> panel points. */
export function scoreRubric(
  state: Phase3State,
  overrides: Record<string, number> = {},
): RubricScore {
  const criteria: CriterionScore[] = RUBRIC.map((c) => {
    const autoPoints = Math.round(autoRatio(c, state) * c.points);
    const raw = overrides[c.id];
    const panelPoints =
      typeof raw === "number" && Number.isFinite(raw)
        ? Math.max(0, Math.min(c.points, Math.round(raw)))
        : null;
    return {
      id: c.id,
      autoPoints,
      panelPoints,
      points: panelPoints ?? autoPoints,
      maxPoints: c.points,
    };
  });

  const total = criteria.reduce((sum, c) => sum + c.points, 0);
  return {
    criteria,
    autoTotal: criteria.reduce((sum, c) => sum + c.autoPoints, 0),
    total,
    maxPoints: MAX_POINTS,
    percent: Math.round((total / MAX_POINTS) * 100),
    byCategory: criteria.map((c) => ({
      category: c.id,
      points: c.points,
      maxPoints: c.maxPoints,
    })),
  };
}

/** Client-safe projection of the rubric definition for the STAFF UI only. */
export function rubricDefinition() {
  return {
    categories: RUBRIC_CATEGORIES,
    maxPoints: MAX_POINTS,
    criteria: RUBRIC.map(({ signals, ...rest }) => ({
      ...rest,
      signalLabels: signals.map((s) => s.label),
    })),
  };
}
