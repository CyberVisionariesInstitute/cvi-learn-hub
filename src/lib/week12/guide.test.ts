import { describe, expect, it } from "vitest";
import { GUIDE_STEPS, guideKey, parseGuidePrefs, stageProgress, stageSteps } from "./guide";

const all = Object.values(GUIDE_STEPS).flat();

describe("Week 12 guide", () => {
  it("covers all six stages with complete DO THIS / GO HERE / LOOK FOR / WHEN DONE", () => {
    expect(Object.keys(GUIDE_STEPS)).toEqual(["1", "2", "3", "4", "5", "6"]);
    for (const s of all) for (const f of [s.doing, s.where, s.lookFor, s.whenDone]) expect(f.trim().length).toBeGreaterThan(5);
  });
  it("never names real case event IDs", () => {
    expect(JSON.stringify(GUIDE_STEPS)).not.toMatch(/\b(C009|A002|S009|S004)\b/);
  });
  it("Stage 4 shows only the chosen branch", () => {
    expect(stageSteps(4, "")).toHaveLength(1);
    expect(stageSteps(4, "written").some((s) => s.branch === "video")).toBe(false);
    expect(stageSteps(4, "video").some((s) => s.branch === "written")).toBe(false);
  });
  it("position is scoped to account and attempt", () => {
    expect(guideKey("u1", "a1")).not.toBe(guideKey("u2", "a1"));
    expect(guideKey("u1", "a1")).not.toBe(guideKey("u1", "a2"));
  });
  it("bad storage falls back safely and clamps position", () => {
    expect(parseGuidePrefs("{oops")).toEqual({ stages: {} });
    const steps = stageSteps(1, "");
    expect(stageProgress(steps, { current: 99, completed: [] }).current).toBe(steps.length - 1);
  });
});

describe("Week 12 guide named Stage 3 targets", () => {
  it("Report header and Limitations select their own sections", () => {
    const s3 = GUIDE_STEPS[3]!;
    expect(s3.find((s) => s.id === "s3-header")!.links[0]!.section).toBe(0);
    expect(s3.find((s) => s.id === "s3-limits")!.links[0]!.section).toBe(8);
  });
});
