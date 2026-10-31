/**
 * Week 11 guided view — presentation only.
 * Regroups the unchanged six seed missions into three beginner labs. Each
 * guided screen is one (mission, sourceStep) requirement from seed.ts, and its
 * numbered steps are the existing instruction substeps. Never reads answer
 * keys, never changes readiness, never writes learner data on its own.
 */
import { missions, traceConcepts, type MissionId } from "./seed";
import { instructionSteps, type InstructionStep } from "./instructions";
import type { AttemptView, Learner } from "./types";

export interface GuidedLab {
  n: 1 | 2 | 3;
  title: string;
  goal: string;
  why: string;
  missions: MissionId[];
}

export const GUIDED_LABS: GuidedLab[] = [
  { n: 1, title: "Who Has Access?", missions: ["M01", "M02"],
    goal: "Look at a few people and their accounts, and spot an access problem.",
    why: "Before you can fix access, you need to see who can open what — and why." },
  { n: 2, title: "Update Someone's Access", missions: ["M03", "M04", "M05"],
    goal: "Make one access change at a time, then test that it worked.",
    why: "People join, move and leave. Their access has to change with them — safely." },
  { n: 3, title: "Explain What You Found", missions: ["M06"],
    goal: "Turn your saved records into a short Case File that explains what happened.",
    why: "A finding only helps if someone else can read it and trust it." },
];

export type SubKind = "explain" | "trace" | "capture" | "tool";
export interface GuidedSub { step: InstructionStep; kind: SubKind; questionId?: string; traceId?: string }
export interface GuidedScreen {
  id: string; lab: 1 | 2 | 3; mission: MissionId; sourceStep: number;
  /** One-sentence goal: the unchanged seed requirement text. */
  goal: string;
  subs: GuidedSub[];
}

const EXPLAIN = "Write your explanation: ";
const TRACE = "Choose one real object for ";
const norm = (s: string) => s.replace(/[’']/g, "'").replace(/[.?]+$/, "").trim().toLowerCase();

export function classify(mission: MissionId, step: InstructionStep): GuidedSub {
  if (step.capture) return { step, kind: "capture" };
  const m = missions.find((x) => x.key === mission)!;
  if (step.doing.startsWith(EXPLAIN)) {
    const label = norm(step.doing.slice(EXPLAIN.length));
    const q = m.questions.find((x) => norm(x.label).startsWith(label) || label.startsWith(norm(x.label)));
    if (q) return { step, kind: "explain", questionId: q.id };
  }
  if (mission === "M01" && step.doing.startsWith(TRACE)) {
    const label = norm(step.doing.slice(TRACE.length));
    const c = traceConcepts.find((x) => norm(x.label) === label);
    if (c) return { step, kind: "trace", traceId: c.id };
  }
  return { step, kind: "tool" };
}

export function buildScreens(): GuidedScreen[] {
  const out: GuidedScreen[] = [];
  for (const lab of GUIDED_LABS) {
    for (const mk of lab.missions) {
      const m = missions.find((x) => x.key === mk)!;
      const steps = instructionSteps[mk];
      const sources = [...new Set(steps.map((s) => s.sourceStep))].sort((a, b) => a - b);
      for (const src of sources) {
        out.push({
          id: `${mk}-S${src}`, lab: lab.n, mission: mk, sourceStep: src,
          goal: m.steps[src] ?? m.objective,
          subs: steps.filter((s) => s.sourceStep === src).map((s) => classify(mk, s)),
        });
      }
    }
  }
  return out;
}

export const GUIDED_SCREENS = buildScreens();

export function labScreens(lab: number) { return GUIDED_SCREENS.filter((s) => s.lab === lab); }

export function positionLabel(index: number) {
  const s = GUIDED_SCREENS[index]!;
  const inLab = labScreens(s.lab);
  return `Lab ${s.lab} of 3 · Step ${inLab.findIndex((x) => x.id === s.id) + 1} of ${inLab.length}`;
}

/** Truthful per-screen check from the student's own saved work only. */
export function screenChecks(s: GuidedScreen, view: Pick<AttemptView, "evidence">, learner: Learner) {
  const ans = learner.missions?.[s.mission]?.answers ?? {};
  const trace = learner.missions?.["M01"]?.trace ?? {};
  return s.subs.filter((x) => x.kind !== "tool").map((x) => {
    if (x.kind === "capture") return { id: x.step.id, label: `Evidence ${x.step.capture} saved`, done: view.evidence.some((e) => e.slot === x.step.capture) };
    if (x.kind === "trace") return { id: x.step.id, label: `${traceConcepts.find((c) => c.id === x.traceId)?.label} picked`, done: !!trace[x.traceId!]?.trim() };
    return { id: x.step.id, label: "Explanation written", done: (ans[x.questionId!] ?? "").trim().length > 0 };
  });
}

/** Resume an existing (six-lab) attempt at the first screen with unsaved required work. */
export function firstOpenScreen(view: Pick<AttemptView, "evidence" | "readiness">, learner: Learner) {
  const i = GUIDED_SCREENS.findIndex((s) => {
    if (view.readiness.find((r) => r.mission === s.mission)?.ready) return false;
    return screenChecks(s, view, learner).some((c) => !c.done);
  });
  if (i >= 0) return i;
  const j = GUIDED_SCREENS.findIndex((s) => !view.readiness.find((r) => r.mission === s.mission)?.ready);
  return j >= 0 ? j : GUIDED_SCREENS.length - 1;
}

export const guidedKey = (attempt: string) => `w11-guided:${attempt}`;
export function parseGuided(raw: string | null): { index: number } | null {
  try { const v = JSON.parse(raw ?? "null"); return typeof v?.index === "number" && v.index >= 0 && v.index < GUIDED_SCREENS.length ? { index: Math.floor(v.index) } : null; } catch { return null; }
}
