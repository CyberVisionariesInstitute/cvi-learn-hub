/**
 * Phase 3 capstone schedule — client-safe.
 * Deadlines are derived from a single cohort start date so the whole calendar
 * shifts by editing COHORT_START_ISO (Monday of Week 17).
 */

export const COHORT_START_ISO = "2026-09-07";

export interface ScheduleWeek {
  week: number;
  stageGroup: "stage1" | "stage2" | "stage3" | "stage4";
  title: string;
  focus: string;
  deliverable: string;
}

export const SCHEDULE: ScheduleWeek[] = [
  {
    week: 17,
    stageGroup: "stage1",
    title: "Scenario Analysis & Requirements",
    focus: "Read the brief, separate facts from assumptions, trace requirements.",
    deliverable: "Requirement register with traced sources.",
  },
  {
    week: 18,
    stageGroup: "stage1",
    title: "Trust Model & PKI Hierarchy",
    focus: "Root, intermediate and issuing authorities with key protection.",
    deliverable: "CA hierarchy with justification for every tier.",
  },
  {
    week: 19,
    stageGroup: "stage1",
    title: "Infrastructure & Connectivity",
    focus: "VMs, HSMs, zones and the paths between them.",
    deliverable: "Architecture that passes validation with findings dispositioned.",
  },
  {
    week: 20,
    stageGroup: "stage2",
    title: "Certificate Strategy & Issuance",
    focus: "Pools, profiles, ownership, request and approval flow.",
    deliverable: "Certificate profiles mapped to workloads.",
  },
  {
    week: 21,
    stageGroup: "stage2",
    title: "Lifecycle Automation, CRL & OCSP",
    focus: "Renewal, revocation and status freshness.",
    deliverable: "Lifecycle controls with failure behaviour recorded.",
  },
  {
    week: 22,
    stageGroup: "stage3",
    title: "Workload Validation & Testing",
    focus: "Run workloads, read failures, correct and re-test.",
    deliverable: "Passing runs plus the diagnostic history that got you there.",
  },
  {
    week: 23,
    stageGroup: "stage4",
    title: "Change / Incident Response",
    focus: "Respond to the released change, revalidate, record before and after.",
    deliverable: "Change response with re-test evidence and checkpoints.",
  },
  {
    week: 24,
    stageGroup: "stage4",
    title: "Final Portfolio & Defense",
    focus: "Assemble evidence and defend the decisions you made.",
    deliverable: "Submitted portfolio and live defense.",
  },
];

/** Friday 23:59 of the given capstone week. */
export function weekDeadline(week: number): Date {
  const start = new Date(`${COHORT_START_ISO}T00:00:00`);
  const offsetWeeks = week - SCHEDULE[0]!.week;
  const d = new Date(start);
  d.setDate(d.getDate() + offsetWeeks * 7 + 4);
  d.setHours(23, 59, 0, 0);
  return d;
}

export function formatDeadline(week: number): string {
  return weekDeadline(week).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function currentWeek(now = new Date()): number | null {
  for (const w of SCHEDULE) {
    if (now <= weekDeadline(w.week)) return w.week;
  }
  return null;
}
