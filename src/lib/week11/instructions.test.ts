import { describe, expect, it } from "vitest";
import { instructionProgress, instructionSteps, parseInstructionPreferences } from "./instructions";
import { missions } from "./seed";

describe("Week 11 presentation substeps", () => {
  it.each(missions)("maps every $key requirement to existing seed steps", (mission) => {
    const steps = instructionSteps[mission.key];
    expect(new Set(steps.map((step) => step.sourceStep))).toEqual(new Set(mission.steps.map((_, index) => index)));
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
    for (const step of steps) {
      expect(step.sourceStep).toBeGreaterThanOrEqual(0);
      expect(step.sourceStep).toBeLessThan(mission.steps.length);
      if (step.capture) expect(mission.evidence.some((slot) => slot.slot === step.capture)).toBe(true);
    }
  });
  it("keeps all five Lab 5 ticket checklists separate and sequential", () => {
    const groups = instructionSteps.M05.map((step) => step.group);
    expect([...new Set(groups)]).toEqual(["T501", "T502", "T503", "T504", "T505"]);
    for (const group of new Set(groups)) {
      const positions = groups.flatMap((value, index) => value === group ? [index] : []);
      expect(positions.at(-1)).toBe((positions[0] ?? 0) + positions.length - 1);
      expect(positions.length).toBeGreaterThan(1);
    }
  });
  it("does not treat a viewed step as completed", () => {
    const steps = instructionSteps.M02;
    expect(instructionProgress(steps, { current: 4, completed: [] })).toEqual({ current: 4, completed: 0, remaining: steps.length });
  });
  it("counts personal completion by unique step identity, never by the current index", () => {
    const steps = instructionSteps.M01;
    const first = steps[0];
    if (!first) throw new Error("Missing step");
    expect(instructionProgress(steps, { current: 8, completed: [first.id, first.id, "foreign"] })).toEqual({ current: 8, completed: 1, remaining: steps.length - 1 });
  });
  it("rejects invalid local resume data and unknown step IDs", () => {
    const first = instructionSteps.M03[0];
    if (!first) throw new Error("Missing step");
    expect(parseInstructionPreferences(JSON.stringify({ M03: { current: 999, completed: [first.id, first.id, "M05-01", 7] }, M99: { current: 1 } }))).toEqual({ M03: { current: 0, completed: [first.id] } });
    expect(parseInstructionPreferences("broken")).toEqual({});
  });
});
