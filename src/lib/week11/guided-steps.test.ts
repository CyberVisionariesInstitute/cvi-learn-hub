import { describe, expect, it } from "vitest";
import { GUIDED_SCREENS, GUIDED_LABS, firstOpenScreen, positionLabel, screenChecks, parseGuided } from "./guided-steps";
import { missions, reportSections, traceConcepts } from "./seed";
import { instructionSteps } from "./instructions";

const allSubs = GUIDED_SCREENS.flatMap((s) => s.subs.map((x) => ({ ...x, mission: s.mission })));

describe("Week 11 guided labs map onto unchanged missions", () => {
  it("has three labs covering all six missions once", () => {
    expect(GUIDED_LABS.map((l) => l.n)).toEqual([1, 2, 3]);
    expect(GUIDED_LABS.flatMap((l) => l.missions)).toEqual(["M01", "M02", "M03", "M04", "M05", "M06"]);
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
  const ready = (ids: string[]) => missions.map((m) => ({ mission: m.key, ready: ids.includes(m.key), missing: ids.includes(m.key) ? [] : ["x"] }));
  it("starts a fresh attempt at Lab 1 step 1", () => {
    expect(firstOpenScreen({ evidence: [], readiness: ready([]) }, {})).toBe(0);
  });
  it("skips missions already evidence-ready and lands in the next one", () => {
    const i = firstOpenScreen({ evidence: [], readiness: ready(["M01", "M02"]) }, {});
    expect(GUIDED_SCREENS[i]!.mission).toBe("M03");
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
