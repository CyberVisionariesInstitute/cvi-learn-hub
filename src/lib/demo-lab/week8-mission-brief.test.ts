import { describe, expect, it } from "vitest";
import { vaultExchangeCryptoWorkbench } from "./experiences/vault-exchange-crypto-workbench";

const scenes = vaultExchangeCryptoWorkbench.scenes;

describe("Week 8 mission briefs", () => {
  it("has six scenes", () => {
    expect(scenes).toHaveLength(6);
  });

  it("gives every scene a complete, specific mission brief", () => {
    for (const scene of scenes) {
      const brief = scene.missionBrief;
      expect(brief, `${scene.id} missionBrief`).toBeDefined();
      expect(brief!.situation.length).toBeGreaterThan(30);
      expect(brief!.mission.length).toBeGreaterThan(20);
      expect(brief!.evidence.length).toBeGreaterThan(0);
      expect(brief!.decision.length).toBeGreaterThan(10);
      expect(brief!.lookingFor.length).toBeGreaterThan(30);
      expect(brief!.completeWhen.length).toBeGreaterThan(20);
    }
  });

  it("lists ordered steps for the four stations and the close", () => {
    const withSteps = scenes.filter((s) => (s.missionBrief?.steps?.length ?? 0) > 0);
    expect(withSteps.map((s) => s.id)).toEqual([
      "vx-protect",
      "vx-compare",
      "vx-sign",
      "vx-authenticate",
      "vx-close",
    ]);
  });

  it("keeps the close scene pointed at the unanswered Week 9 question", () => {
    const close = scenes.find((s) => s.id === "vx-close")!;
    expect(close.missionBrief!.evidence).toHaveLength(4);
    expect(close.missionBrief!.lookingFor).toMatch(/belongs to the claimed person/i);
  });
});

describe("Week 8 instructor answer guides", () => {
  it("gives every scene a structured answer guide", () => {
    for (const scene of scenes) {
      const guide = scene.instructorAnswerGuide;
      expect(guide, `${scene.id} instructorAnswerGuide`).toBeDefined();
      expect(guide!.actionSequence.length).toBeGreaterThan(0);
      expect(guide!.expectedAnswer.length).toBeGreaterThan(0);
      expect(guide!.whyCorrect.length).toBeGreaterThan(20);
      expect(guide!.expectedEvidence.length).toBeGreaterThan(0);
      expect(guide!.misconceptions.length).toBeGreaterThan(0);
      expect(guide!.followUp.question.length).toBeGreaterThan(5);
      expect(guide!.followUp.desiredResponse.length).toBeGreaterThan(5);
      expect(guide!.boundary.length).toBeGreaterThan(20);
      expect(guide!.readyToAdvance.length).toBeGreaterThan(0);
    }
  });

  it("pairs every misconception with a correction", () => {
    for (const scene of scenes) {
      for (const item of scene.instructorAnswerGuide!.misconceptions) {
        expect(item.wrong.length).toBeGreaterThan(5);
        expect(item.correction.length).toBeGreaterThan(10);
      }
    }
  });

  it("labels both PASS and FAIL answers at the sign station", () => {
    const sign = scenes.find((s) => s.id === "vx-sign")!;
    expect(sign.instructorAnswerGuide!.expectedAnswer.map((a) => a.label)).toEqual([
      "PASS",
      "FAIL",
    ]);
  });

  it("keeps the four recap mappings in the close answer guide", () => {
    const close = scenes.find((s) => s.id === "vx-close")!;
    expect(close.instructorAnswerGuide!.expectedAnswer).toHaveLength(4);
  });
});
