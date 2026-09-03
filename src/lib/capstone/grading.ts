/**
 * Phase 3 grading model — client-safe.
 * Maps the nine workflow stages onto the four capstone stages the rubric uses,
 * and derives progress signals from a student's saved project state.
 * Contains no instructor-private scenario content.
 */

import type { Phase3State } from "./project-state";
import type { StageKey } from "./model";

export type StageGroup = "stage1" | "stage2" | "stage3" | "stage4";
export type FeedbackGroup = StageGroup | "overall";
export type Mark = "strong" | "on_track" | "needs_work" | "blocked";

export interface StageGroupDef {
  key: StageGroup;
  label: string;
  headline: string;
  weeks: string;
  stages: StageKey[];
}

export const STAGE_GROUPS: StageGroupDef[] = [
  {
    key: "stage1",
    label: "Stage 1",
    headline: "Analyze & Architect",
    weeks: "Weeks 17–19",
    stages: ["analyze", "design", "connect"],
  },
  {
    key: "stage2",
    label: "Stage 2",
    headline: "Certificate Operations",
    weeks: "Weeks 20–21",
    stages: ["operate", "automate"],
  },
  {
    key: "stage3",
    label: "Stage 3",
    headline: "Workload Validation & Testing",
    weeks: "Week 22",
    stages: ["validate", "test"],
  },
  {
    key: "stage4",
    label: "Stage 4",
    headline: "Change, Incident & Defense",
    weeks: "Weeks 23–24",
    stages: ["adapt", "defend"],
  },
];

export const MARK_LABEL: Record<Mark, string> = {
  strong: "Strong",
  on_track: "On track",
  needs_work: "Needs work",
  blocked: "Blocked",
};

export interface StageMetric {
  label: string;
  value: number;
}

export interface StageGroupProgress {
  key: StageGroup;
  /** 0–100, derived from how many expected signals are present. */
  percent: number;
  status: "not_started" | "in_progress" | "substantial";
  metrics: StageMetric[];
}

function score(signals: number[]): number {
  const met = signals.filter((n) => n > 0).length;
  return signals.length === 0 ? 0 : Math.round((met / signals.length) * 100);
}

/** Derive Stage 1–4 progress from a normalized project state. */
export function stageGroupProgress(state: Phase3State): StageGroupProgress[] {
  const requirements = state.analysis.filter((a) => a.kind === "requirement").length;
  const decisions = state.analysis.filter((a) => a.kind === "decision").length;
  const nodes = state.architecture.nodes.length;
  const edges = state.architecture.edges.length;
  const dispositions = state.architecture.dispositions.length;

  const profiles = state.operations.profiles.length;
  const assets = state.operations.assets.length;
  const lifecycle = state.operations.lifecycle.length;
  const approvals = state.operations.approvals.length;
  const publications = state.operations.publications.length;

  const instances = state.workloads.instances.length;
  const runs = state.workloads.runs.length;
  const passes = state.workloads.runs.filter((r) => r.result === "PASS").length;

  const timeline = state.change.timeline.length;
  const acknowledged = state.change.acknowledged.length;
  const checkpoints = state.change.checkpoints.filter((c) => c.status !== "Not Ready").length;

  const raw: Array<{ key: StageGroup; signals: number[]; metrics: StageMetric[] }> = [
    {
      key: "stage1",
      signals: [requirements, nodes, edges, dispositions, decisions],
      metrics: [
        { label: "Requirements", value: requirements },
        { label: "Components", value: nodes },
        { label: "Connections", value: edges },
        { label: "Findings handled", value: dispositions },
        { label: "Decisions", value: decisions },
      ],
    },
    {
      key: "stage2",
      signals: [profiles, assets, lifecycle, approvals, publications],
      metrics: [
        { label: "Profiles", value: profiles },
        { label: "Certificates", value: assets },
        { label: "Lifecycle events", value: lifecycle },
        { label: "Approvals", value: approvals },
        { label: "CRL/OCSP", value: publications },
      ],
    },
    {
      key: "stage3",
      signals: [instances, runs, passes],
      metrics: [
        { label: "Workloads", value: instances },
        { label: "Runs", value: runs },
        { label: "Passing runs", value: passes },
      ],
    },
    {
      key: "stage4",
      signals: [timeline, acknowledged, checkpoints],
      metrics: [
        { label: "Timeline entries", value: timeline },
        { label: "Events acknowledged", value: acknowledged },
        { label: "Checkpoints started", value: checkpoints },
      ],
    },
  ];

  return raw.map(({ key, signals, metrics }) => {
    const percent = score(signals);
    return {
      key,
      percent,
      status: percent === 0 ? "not_started" : percent >= 80 ? "substantial" : "in_progress",
      metrics,
    };
  });
}
