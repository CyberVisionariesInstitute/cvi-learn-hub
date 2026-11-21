/**
 * Week 11 shorter beginner path — WHICH saved items count toward completion.
 * Client-safe: lists field/slot IDs only, never expected answers or state.
 * Optional items stay available, keep their credit, and never block readiness.
 */
import type { MissionId } from "./seed";

/** Missions that are entirely optional practice (worked example / extension work). */
export const OPTIONAL_MISSIONS: MissionId[] = ["M01", "M03", "M04"];

/** Evidence slots that count toward completion. All other slots are optional practice. */
export const REQUIRED_SLOTS: Partial<Record<MissionId, string[]>> = {
  M02: ["E03", "E04"],
  M05: ["E13", "E14"],
  M06: ["E17", "E18", "E19"],
};

/** Short written answers that count toward completion. Others are optional. */
export const REQUIRED_QUESTIONS: Partial<Record<MissionId, string[]>> = {
  M02: ["prediction", "authorization", "accountability"],
  M05: ["t502", "t503"],
  M06: [],
};

export const isRequiredMission = (m: string) => !OPTIONAL_MISSIONS.includes(m as MissionId);
export const isRequiredSlot = (m: string, slot: string) => (REQUIRED_SLOTS[m as MissionId] ?? []).includes(slot);
export const isRequiredQuestion = (m: string, id: string) => (REQUIRED_QUESTIONS[m as MissionId] ?? []).includes(id);
export const ALL_REQUIRED_SLOTS = Object.values(REQUIRED_SLOTS).flat();

/** Presentation-only mapping; legacy files and completion predicates stay unchanged. */
export const GUIDED_EXPORT_MAPPING: { title: string; missions: MissionId[]; detail: string }[] = [
  { title: "Guided Lab 1 — Who Has Access?", missions: ["M01", "M02"], detail: "Classic Lab 01 holds optional worked-example practice; classic Lab 02 holds your required Blair prediction and access explanation." },
  { title: "Guided Lab 2 — Update Someone's Access", missions: ["M02", "M05"], detail: "Classic Lab 02 also holds your Blair correction; classic Lab 05 holds required T502/T503 answers and any optional T501/T504/Azure practice." },
  { title: "Guided Lab 3 — Explain What You Found", missions: ["M06"], detail: "Classic Lab 06 holds your findings, comparison, own activity, limitations and Case File. Its starting-hypothesis question is optional practice." },
  { title: "Optional extensions", missions: ["M03", "M04"], detail: "Classic Labs 03 and 04 contain optional practice only. Empty optional answers do not block completion." },
];
