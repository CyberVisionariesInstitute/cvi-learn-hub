/**
 * Canonical, PUBLIC-SAFE Phase 3 Capstone rubric categories.
 *
 * This is the single source of truth for category keys, labels and point
 * weights. Both the student-facing Student Guide and the staff scoring model
 * import from here, so the approved 100-point model cannot drift.
 *
 * Instructor-private scoring heuristics, descriptors and calibration live in
 * `rubric.server.ts` and never reach a student bundle.
 */

export type RubricCategoryKey =
  | "analysis"
  | "architecture"
  | "certificate_strategy"
  | "lifecycle"
  | "status_resilience"
  | "workload"
  | "change"
  | "evidence"
  | "professional";

export interface RubricCategory {
  key: RubricCategoryKey;
  /** Student-facing area name. Identical in the guide and the staff console. */
  area: string;
  points: number;
}

export const RUBRIC_CATEGORIES: RubricCategory[] = [
  { key: "analysis", area: "Scenario analysis & requirements", points: 10 },
  { key: "architecture", area: "Architecture & trust", points: 20 },
  { key: "certificate_strategy", area: "Certificate strategy & ownership", points: 10 },
  { key: "lifecycle", area: "Lifecycle & automation", points: 15 },
  { key: "status_resilience", area: "Status & resilience", points: 10 },
  { key: "workload", area: "Workload integration & diagnosis", points: 10 },
  { key: "change", area: "Change adaptation", points: 10 },
  { key: "evidence", area: "Evidence & presentation", points: 10 },
  { key: "professional", area: "Professional practice & milestones", points: 5 },
];

export const RUBRIC_TOTAL_POINTS = RUBRIC_CATEGORIES.reduce((sum, c) => sum + c.points, 0);
