import { describe, expect, it } from "vitest";
import { GUIDED_SCREENS, GUIDED_LABS, REQUIRED_COUNT, firstOpenScreen, positionLabel, screenChecks, parseGuided } from "./guided-steps";
import { ALL_REQUIRED_SLOTS, REQUIRED_QUESTIONS } from "./requirements";
import { missions, reportSections, traceConcepts } from "./seed";
import { instructionSteps } from "./instructions";

const allSubs = GUIDED_SCREENS.flatMap((s) => s.subs.map((x) => ({ ...x, mission: s.mission })));

describe("Week 11 guided labs map onto unchanged missions", () => {
  it("has three required labs and puts required screens before optional practice", () => {
    expect(GUIDED_LABS.map((l) => l.n)).toEqual([1, 2, 3]);
    expect(GUIDED_SCREENS.slice(0, REQUIRED_COUNT).every((s) => !s.optional && s.lab > 0)).toBe(true);
    expect(GUIDED_SCREENS.slice(REQUIRED_COUNT).every((s) => s.optional && s.lab === 0)).toBe(true);
    expect(REQUIRED_COUNT).toBe(18);
  });
  it("puts every required evidence slot and question on a required screen", () => {
    const req = GUIDED_SCREENS.slice(0, REQUIRED_COUNT);
    expect(ALL_REQUIRED_SLOTS).toEqual(["E03", "E04", "E13", "E14", "E17", "E18", "E19"]);
    for (const slot of ALL_REQUIRED_SLOTS) expect(req.some((s) => s.subs.some((x) => x.kind === "capture" && x.step.capture === slot)), slot).toBe(true);
    for (const [m, ids] of Object.entries(REQUIRED_QUESTIONS)) for (const id of ids!) expect(req.some((s) => s.mission === m && s.subs.some((x) => x.questionId === id)), id).toBe(true);
  });
  it("starts with one worked example that saves nothing", () => {
    const ex = GUIDED_SCREENS.filter((s) => s.example);
    expect(ex.map((s) => s.id)).toEqual(["L1-example"]);
    expect(ex[0]!.subs.every((x) => x.kind === "tool")).toBe(true);
  });
  it("keeps every instruction substep exactly once", () => {
    const total = missions.reduce((n, m) => n + instructionSteps[m.key].length, 0);
    expect(allSubs.length).toBe(total);
    expect(new Set(allSubs.map((x) => x.step.id)).size).toBe(total);
  });
  it("makes every evidence slot E01–E19 reachable from exactly one screen", () => {
    const slots = missions.flatMap((m) => m.evidence.map((e) => e.slot));
    expect(slots).toHaveLength(19);
    for (const slot of slots) expect(GUIDED_SCREENS.filter((s) => s.subs.some((x) => x.kind === "capture" && x.step.capture === slot))).toHaveLength(1);
  });
  it("makes every mission question reachable from exactly one screen", () => {
    for (const m of missions) for (const q of m.questions) {
      expect(GUIDED_SCREENS.filter((s) => s.mission === m.key && s.subs.some((x) => x.questionId === q.id)), `${m.key}.${q.id}`).toHaveLength(1);
    }
  });
  it("makes every directory-trace concept reachable", () => {
    for (const c of traceConcepts) expect(allSubs.filter((x) => x.traceId === c.id)).toHaveLength(1);
  });
  it("shows real step counts", () => {
    expect(positionLabel(0)).toBe(`Lab 1 of 3 · Step 1 of ${GUIDED_SCREENS.filter((s) => s.lab === 1).length}`);
  });
  it("pins the report section count Week 12 reads", () => {
    expect(reportSections.length).toBeGreaterThan(0);
  });
});

describe("existing six-lab attempts resume correctly", () => {
  const ready = (ids: string[]) => missions.map((m) => ({ mission: m.key, ready: ids.includes(m.key), missing: ids.includes(m.key) ? [] : ["x"], required: true, optional: [] }));
  it("starts a fresh attempt at Lab 1 step 1", () => {
    expect(firstOpenScreen({ evidence: [], readiness: ready([]) }, {})).toBe(0);
  });
  it("skips required work already saved and lands on Alex's team move", () => {
    const i = firstOpenScreen({ evidence: [{ slot: "E03" } as never, { slot: "E04" } as never], readiness: ready(["M01", "M02", "M03", "M04"]) }, {});
    expect(GUIDED_SCREENS[i]!.mission).toBe("M05");
    expect(GUIDED_SCREENS[i]!.lab).toBe(2);
  });
  it("counts a capture only when the slot really exists", () => {
    const s = GUIDED_SCREENS.find((x) => x.subs.some((y) => y.step.capture === "E01"))!;
    const before = screenChecks(s, { evidence: [] }, {}).find((c) => c.label.includes("E01"))!;
    const after = screenChecks(s, { evidence: [{ slot: "E01" } as never] }, {}).find((c) => c.label.includes("E01"))!;
    expect(before.done).toBe(false);
    expect(after.done).toBe(true);
  });
  it("rejects corrupt saved positions", () => {
    expect(parseGuided("{bad")).toBeNull();
    expect(parseGuided(JSON.stringify({ index: 9999 }))).toBeNull();
    expect(parseGuided(JSON.stringify({ index: 2 }))).toEqual({ index: 2 });
  });
});
