/**
 * Week 11 guided view — presentation only.
 * Shorter beginner path: three required labs built from chosen substeps of the
 * unchanged seed missions, plus clearly optional practice screens holding every
 * other substep. Which items count toward completion lives in requirements.ts.
 * Never reads answer keys, never writes learner data on its own.
 */
import { missions, traceConcepts, type MissionId } from "./seed";
import { instructionSteps, type InstructionStep } from "./instructions";
import { isRequiredQuestion, isRequiredSlot } from "./requirements";
import type { AttemptView, Learner } from "./types";

export interface GuidedLab {
  n: 1 | 2 | 3;
  title: string;
  goal: string;
  why: string;
  missions: MissionId[];
  minutes: string;
}

export const GUIDED_LABS: GuidedLab[] = [
  { n: 1, title: "Who Has Access?", missions: ["M01", "M02"], minutes: "35–45 min",
    goal: "Look at a few people and their accounts, and spot an access problem.",
    why: "Before you can fix access, you need to see who can open what — and why." },
  { n: 2, title: "Update Someone's Access", missions: ["M02", "M05"], minutes: "45–55 min",
    goal: "Make one access change at a time, then test that it worked.",
    why: "People join, move and leave. Their access has to change with them — safely." },
  { n: 3, title: "Explain What You Found", missions: ["M06"], minutes: "40–50 min",
    goal: "Turn your saved records into a short Case File that explains what happened.",
    why: "A finding only helps if someone else can read it and trust it." },
];

export type SubKind = "explain" | "trace" | "capture" | "tool";
export interface GuidedSub { step: InstructionStep; kind: SubKind; questionId?: string; traceId?: string }
export interface GuidedScreen {
  id: string;
  /** 1–3 = required lab; 0 = optional practice (never counts toward completion). */
  lab: 0 | 1 | 2 | 3;
  mission: MissionId; sourceStep: number;
  goal: string;
  /** Short part label inside a lab, e.g. "Part A · Fix Blair". */
  part?: string;
  example?: boolean;
  optional?: boolean;
  subs: GuidedSub[];
}

export function classify(mission: MissionId, step: InstructionStep): GuidedSub {
  if (step.capture) return { step, kind: "capture" };
  const m = missions.find((x) => x.key === mission)!;
  if (step.doing.startsWith(EXPLAIN)) {
    const label = norm(step.doing.slice(EXPLAIN.length));
    const q = m.questions.find((x) => norm(x.label).startsWith(label) || label.startsWith(norm(x.label)));
    if (q) return { step, kind: "explain", questionId: q.id };
    const alias = QUESTION_ALIASES[mission]?.[label];
    if (alias) return { step, kind: "explain", questionId: alias };
  }
  if (mission === "M01" && step.doing.startsWith(TRACE)) {
    const label = norm(step.doing.slice(TRACE.length));
    const c = traceConcepts.find((x) => norm(x.label) === label);
    if (c) return { step, kind: "trace", traceId: c.id };
  }
  return { step, kind: "tool" };
}

type Def = { id: string; lab: 1 | 2 | 3; mission: MissionId; goal: string; part?: string; example?: boolean; ids: string[] };
const r = (a: number, b: number, m: string) => Array.from({ length: b - a + 1 }, (_, i) => `${m}-${String(a + i).padStart(2, "0")}`);

/** The required path, in order. Every other substep becomes optional practice. */
const REQUIRED_DEFS: Def[] = [
  { id: "L1-example", lab: 1, mission: "M01", example: true, part: "Worked example", goal: "Watch how we follow one person — Alex — from their HR record to their accounts and what they can open.", ids: r(1, 5, "M01") },
  { id: "L1-predict", lab: 1, mission: "M02", part: "Your turn · Blair", goal: "Look at Blair's account and predict: can Blair read case summaries?", ids: r(1, 3, "M02") },
  { id: "L1-test", lab: 1, mission: "M02", part: "Your turn · Blair", goal: "Test it: sign in as Blair, then try to read case summaries.", ids: r(4, 5, "M02") },
  { id: "L1-explain", lab: 1, mission: "M02", part: "Your turn · Blair", goal: "Explain in one or two sentences why Blair could sign in but not read.", ids: ["M02-13"] },
  { id: "L2a-fix", lab: 2, mission: "M02", part: "Part A · Fix Blair", goal: "Give Blair only the access the ticket approves — reading, not editing.", ids: r(6, 7, "M02") },
  { id: "L2a-check", lab: 2, mission: "M02", part: "Part A · Fix Blair", goal: "Retest Blair and save your proof.", ids: [...r(8, 10, "M02"), "M02-14"] },
  { id: "L2b-change", lab: 2, mission: "M05", part: "Part B · Alex changes teams", goal: "Move Alex's cloud account from Response to Audit.", ids: ["M05-14", "M05-20", "M05-28", "M05-29"] },
  { id: "L2b-check", lab: 2, mission: "M05", part: "Part B · Alex changes teams", goal: "Retest Alex's cloud account and save your proof.", ids: [...r(30, 34, "M05"), "M05-66"] },
  { id: "L2c-leave", lab: 2, mission: "M05", part: "Part C · Finley leaves", goal: "Turn off Finley's cloud account and end any open sessions.", ids: ["M05-35", "M05-42", "M05-43"] },
  { id: "L2c-check", lab: 2, mission: "M05", part: "Part C · Finley leaves", goal: "Check Finley can no longer sign in, and save your proof.", ids: r(47, 49, "M05") },
  { id: "L3-look", lab: 3, mission: "M06", part: "Look", goal: "Look through the historical sign-in and audit records and pick events for two findings.", ids: ["M06-01", ...r(3, 7, "M06")] },
  { id: "L3-correlate", lab: 3, mission: "M06", part: "Connect", goal: "Find records that share one correlation ID and say what that supports.", ids: r(8, 9, "M06") },
  { id: "L3-compare", lab: 3, mission: "M06", part: "Compare", goal: "Record one harmless or unclear event as a comparison.", ids: r(10, 11, "M06") },
  { id: "L3-f1", lab: 3, mission: "M06", part: "Finding 1", goal: "Write Finding 1 using the short prompts.", ids: r(12, 19, "M06") },
  { id: "L3-f2", lab: 3, mission: "M06", part: "Finding 2", goal: "Write Finding 2 using different events.", ids: r(20, 27, "M06") },
  { id: "L3-live", lab: 3, mission: "M06", part: "Your own activity", goal: "Pick one chain from your own Lab 2 activity and describe it in one sentence.", ids: r(28, 29, "M06") },
  { id: "L3-limits", lab: 3, mission: "M06", part: "Limitations", goal: "Say what this practice simulation can't show.", ids: ["M06-42"] },
  { id: "L3-download", lab: 3, mission: "M06", part: "Download", goal: "Check nothing is missing, download your Week 11 files and upload them to GitHub.", ids: ["M06-43", "M06-44", "M06-final-download", "M06-45"] },
];

const OPTIONAL_GOALS: Partial<Record<MissionId, string>> = {
  M01: "Optional practice: explore more of the directory.",
  M02: "Optional practice: explain identification and authentication in your own words.",
  M03: "Optional practice: onboard Jamie in Active Directory.",
  M04: "Optional practice: the least-privilege challenge.",
  M05: "Optional practice: more joiner, mover and leaver tickets.",
  M06: "Optional practice: the starting hypothesis and the longer Case File sections.",
};

export function buildScreens(): GuidedScreen[] {
  const out: GuidedScreen[] = [];
  const seenSlots = new Set<string>();
  const used = new Set<string>();
  const byId = new Map(missions.flatMap((m) => instructionSteps[m.key].map((s) => [s.id, { m: m.key, s }] as const)));
  const sub = (mk: MissionId, s: InstructionStep) => {
    const x = classify(mk, s);
    // A slot captured again later is shown as a reminder, not a second capture box.
    if (x.kind === "capture") { if (seenSlots.has(s.capture!)) return { step: s, kind: "tool" as const }; seenSlots.add(s.capture!); }
    return x;
  };
  for (const d of REQUIRED_DEFS) {
    const steps = d.ids.map((id) => { const hit = byId.get(id); if (!hit || hit.m !== d.mission) throw new Error(`Unknown guided substep ${id}`); used.add(id); return hit.s; });
    out.push({ id: d.id, lab: d.lab, mission: d.mission, sourceStep: steps[0]!.sourceStep, goal: d.goal, part: d.part, example: d.example, subs: steps.map((s) => sub(d.mission, s)) });
  }
  for (const m of missions) {
    const rest = instructionSteps[m.key].filter((s) => !used.has(s.id));
    for (const src of [...new Set(rest.map((s) => s.sourceStep))].sort((a, b) => a - b)) {
      const steps = rest.filter((s) => s.sourceStep === src);
      out.push({ id: `${m.key}-S${src}`, lab: 0, mission: m.key, sourceStep: src, optional: true, part: `${m.lab}: ${m.title}`, goal: m.steps[src] ?? OPTIONAL_GOALS[m.key] ?? m.objective, subs: steps.map((s) => sub(m.key, s)) });
    }
  }
  return out;
}

export const GUIDED_SCREENS = buildScreens();
export const REQUIRED_COUNT = GUIDED_SCREENS.filter((s) => !s.optional).length;
export const FIRST_OPTIONAL = REQUIRED_COUNT;

export function labScreens(lab: number) { return GUIDED_SCREENS.filter((s) => s.lab === lab); }

export function positionLabel(index: number) {
  const s = GUIDED_SCREENS[index]!;
  const inLab = labScreens(s.lab);
  const n = inLab.findIndex((x) => x.id === s.id) + 1;
  return s.optional ? `Optional practice · ${n} of ${inLab.length}` : `Lab ${s.lab} of 3 · Step ${n} of ${inLab.length}`;
}

/** Truthful per-screen check from the student's own saved work only. On
 * required screens only required items are listed; optional ones are labelled. */
export function screenChecks(s: GuidedScreen, view: Pick<AttemptView, "evidence">, learner: Learner) {
  const ans = learner.missions?.[s.mission]?.answers ?? {};
  const trace = learner.missions?.["M01"]?.trace ?? {};
  const seen = new Set<string>();
  return s.subs.filter((x) => x.kind !== "tool").filter((x) => { const k = x.questionId ?? x.traceId ?? x.step.capture ?? x.step.id; if (seen.has(k)) return false; seen.add(k); return true; }).map((x) => {
    const optional = s.optional || (x.kind === "capture" ? !isRequiredSlot(s.mission, x.step.capture!) : x.kind === "explain" ? !isRequiredQuestion(s.mission, x.questionId!) : true);
    if (x.kind === "capture") return { id: x.step.id, optional, label: `Evidence ${x.step.capture} saved`, done: view.evidence.some((e) => e.slot === x.step.capture) };
    if (x.kind === "trace") return { id: x.step.id, optional, label: `${traceConcepts.find((c) => c.id === x.traceId)?.label} picked`, done: !!trace[x.traceId!]?.trim() };
    return { id: x.step.id, optional, label: "Explanation written", done: (ans[x.questionId!] ?? "").trim().length > 0 };
  });
}

/** Resume at the first required screen with unsaved required work. */
export function firstOpenScreen(view: Pick<AttemptView, "evidence" | "readiness">, learner: Learner) {
  const anyAnswer = Object.values(learner.missions ?? {}).some((m) => Object.values(m?.answers ?? {}).some((a) => (a ?? "").trim()));
  if (!view.evidence.length && !anyAnswer) return 0;
  const req = GUIDED_SCREENS.slice(0, REQUIRED_COUNT).map((s, i) => ({ s, i }));
  const open = req.find(({ s }) => !s.example && view.readiness.find((r) => r.mission === s.mission)?.ready === false && screenChecks(s, view, learner).some((c) => !c.optional && !c.done));
  if (open) return open.i;
  const notReady = req.find(({ s }) => !s.example && view.readiness.find((r) => r.mission === s.mission)?.ready === false);
  if (notReady) {
    // Nothing visibly missing on screens: start at the mission's first required screen.
    return req.find(({ s }) => s.mission === notReady.s.mission && !s.example)!.i;
  }
  return REQUIRED_COUNT - 1;
}

export const guidedKey = (attempt: string) => `w11-guided:${attempt}`;
export function parseGuided(raw: string | null): { index: number } | null {
  try { const v = JSON.parse(raw ?? "null"); return typeof v?.index === "number" && v.index >= 0 && v.index < GUIDED_SCREENS.length ? { index: Math.floor(v.index) } : null; } catch { return null; }
}
