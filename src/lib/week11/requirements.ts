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
