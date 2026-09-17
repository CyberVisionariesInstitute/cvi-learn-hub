import { describe, expect, it } from "vitest";
import {
  REFERENCE_TIME,
  trustAuthority,
} from "./experiences/trust-authority";
import { cyberfoundations, getExperience } from "./programs";
import { isSceneComplete, type SceneState } from "./useExperienceState";
import { vaultExchangeCryptoWorkbench } from "./experiences/vault-exchange-crypto-workbench";
import type {
  TrustAuthorityInteraction,
  TrustChainStation,
  TrustDecisionStation,
  TrustInspectStation,
  TrustRecapStation,
  TrustWarningStation,
} from "./types";

const scenes = trustAuthority.scenes;

function stateFor(overrides: Partial<SceneState> = {}): SceneState {
  return {
    answers: {},
    revealedEvidence: [],
    used: [],
    explanationRevealed: false,
    ...overrides,
  };
}

function interactionOf(sceneId: string): TrustAuthorityInteraction {
  const scene = scenes.find((s) => s.id === sceneId)!;
  const interaction = scene.interaction!;
  if (interaction.kind !== "trust-authority") throw new Error("wrong kind");
  return interaction;
}

describe("Week 9 registration and routing", () => {
  it("is registered under CyberFoundations Module 3, Week 9", () => {
    const module3 = cyberfoundations.modules.find((m) => m.id === "cf-module-3")!;
    const week9 = module3.weeks.find((w) => w.id === "cf-week-09")!;
    expect(week9.experienceIds).toEqual([trustAuthority.id]);
    expect(week9.status).toBe("available");
    expect(getExperience(trustAuthority.id)).toBe(trustAuthority);
  });

  it("keeps Week 8 alongside it, unchanged", () => {
    const module3 = cyberfoundations.modules.find((m) => m.id === "cf-module-3")!;
    const week8 = module3.weeks.find((w) => w.id === "cf-week-08")!;
    expect(week8.experienceIds).toEqual([vaultExchangeCryptoWorkbench.id]);
    expect(vaultExchangeCryptoWorkbench.scenes).toHaveLength(6);
  });

  it("uses the agreed route and a guided run of roughly 33–35 minutes", () => {
    expect(trustAuthority.route).toBe("/cyberfoundations/week-09/trust-authority");
    const total = (trustAuthority.runOfShow ?? []).reduce(
      (sum, row) => sum + row.minutes,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(33);
    expect(total).toBeLessThanOrEqual(35);
    expect(trustAuthority.replayAvailable).toBe(true);
  });
});

describe("Week 9 scenario logic", () => {
  it("uses a fixed scenario clock rather than today's date", () => {
    expect(REFERENCE_TIME).toBe("14 March 2026, 09:00 UTC");
    for (const scene of scenes) {
      const interaction = scene.interaction;
      if (!interaction || interaction.kind !== "trust-authority") continue;
      expect(interaction.referenceTime).toContain(REFERENCE_TIME);
    }
  });

  it("matches the requested hostname against the SAN list", () => {
    const station = interactionOf("ta-inspect").station as TrustInspectStation;
    expect(station.requestedHostname).toBe("vault-exchange.example");
    const san = station.fields.find((f) => f.id === "san")!;
    expect(san.value).toContain(station.requestedHostname);
    const fieldQuestion = station.questions.find((q) => q.id === "field")!;
    expect(fieldQuestion.options.find((o) => o.correct)!.id).toBe("san");
    const issuerQuestion = station.questions.find((q) => q.id === "issuer-check")!;
    expect(issuerQuestion.options.find((o) => o.correct)!.id).toBe("claim");
  });

  it("only uses reserved .example hostnames", () => {
    const serialised = JSON.stringify(trustAuthority);
    const hostnames = serialised.match(/[a-z0-9-]+\.(?:com|net|org|io|co)\b/gi) ?? [];
    expect(hostnames).toEqual([]);
    expect(serialised).toContain("vault-exchange.example");
  });

  it("orders the chain leaf → intermediate → root with matching issuers", () => {
    const station = interactionOf("ta-chain").station as TrustChainStation;
    expect(station.correctOrder).toEqual(["leaf", "intermediate", "root"]);
    const byId = Object.fromEntries(station.certificates.map((c) => [c.id, c]));
    expect(byId["leaf"]!.issuer).toBe(byId["intermediate"]!.subject);
    expect(byId["intermediate"]!.issuer).toBe(byId["root"]!.subject);
    expect(byId["root"]!.issuer).toContain("self-signed");
  });

  it("treats trust as a client decision, not a property of the root", () => {
    const station = interactionOf("ta-chain").station as TrustChainStation;
    expect(station.selfSignedNote).toMatch(/not what makes it trusted/i);
    expect(station.deliveryNote).toMatch(/not expected to send the root/i);
    expect(station.trustStore.question.options.find((o) => o.correct)!.id).toBe(
      "trust",
    );
    expect(station.distinctFailures.map((f) => f.label)).toEqual([
      "Missing intermediate",
      "Untrusted root",
    ]);
  });

  it("offers three distinct warning cases with safe actions only", () => {
    const station = interactionOf("ta-warning").station as TrustWarningStation;
    expect(station.cases.map((c) => c.id)).toEqual([
      "case-hostname",
      "case-expired",
      "case-missing-intermediate",
    ]);
    for (const c of station.cases) {
      expect(c.diagnosis.options.filter((o) => o.correct)).toHaveLength(1);
      expect(c.action.options.filter((o) => o.safe)).toHaveLength(1);
      expect(c.evidence.length).toBeGreaterThanOrEqual(4);
    }
    expect(station.safetyNote).toMatch(/never install a root certificate/i);
  });

  it("models the missing intermediate with no cached or fetchable copy", () => {
    const station = interactionOf("ta-warning").station as TrustWarningStation;
    const missing = station.cases.find((c) => c.id === "case-missing-intermediate")!;
    const rows = Object.fromEntries(missing.evidence.map((e) => [e.label, e.value]));
    expect(rows["Cached intermediates"]).toBe("None");
    expect(rows["Automatic intermediate fetch"]).toMatch(/not available/i);
    expect(rows["Client trust store"]).toMatch(/present and trusted/i);
    expect(missing.diagnosis.options.find((o) => o.correct)!.id).toBe("missing");
  });

  it("dates the expired case before the scenario clock", () => {
    const station = interactionOf("ta-warning").station as TrustWarningStation;
    const expired = station.cases.find((c) => c.id === "case-expired")!;
    const validity = expired.evidence.find((e) => e.label === "Validity")!.value;
    expect(validity).toContain("Not after 1 Aug 2025");
    expect(expired.evidence.find((e) => e.label === "Scenario clock")!.value).toBe(
      REFERENCE_TIME,
    );
    expect(expired.diagnosis.options.find((o) => o.correct)!.id).toBe("expired");
  });

  it("pairs a passing and a failing decision scenario with stated limits", () => {
    const station = interactionOf("ta-decision").station as TrustDecisionStation;
    expect(station.scenarios.map((s) => s.id)).toEqual([
      "scenario-pass",
      "scenario-fail",
    ]);
    const pass = station.scenarios[0]!;
    const fail = station.scenarios[1]!;
    expect(pass.checks.every((c) => c.result === "pass")).toBe(true);
    expect(fail.checks.filter((c) => c.result === "fail")).toHaveLength(1);
    expect(pass.limit.options.find((o) => o.correct)!.id).toBe("honesty");
    expect(station.possessionNote).toMatch(/private key/i);
    expect(station.checklistNote).toMatch(/revocation/i);
  });
});

describe("Week 9 completion, reset and replay", () => {
  it("never completes an interactive station from an empty state", () => {
    for (const scene of scenes) {
      if (!scene.interaction) continue;
      expect(isSceneComplete(scene, stateFor()), scene.id).toBe(false);
    }
  });

  it("completes the inspect station only with all fields and correct answers", () => {
    const scene = scenes.find((s) => s.id === "ta-inspect")!;
    const interaction = interactionOf("ta-inspect");
    const station = interaction.station as TrustInspectStation;
    const used = station.fields.map((f) => `${interaction.id}:field:${f.id}`);
    const answers: Record<string, string> = {};
    for (const q of station.questions) {
      answers[`${interaction.id}:q:${q.id}`] = q.options.find((o) => o.correct)!.id;
    }
    expect(isSceneComplete(scene, stateFor({ used, answers }))).toBe(true);
    expect(isSceneComplete(scene, stateFor({ used }))).toBe(false);
  });

  it("requires both trust-store settings at the chain station", () => {
    const scene = scenes.find((s) => s.id === "ta-chain")!;
    const interaction = interactionOf("ta-chain");
    const station = interaction.station as TrustChainStation;
    const answers: Record<string, string> = {
      [`${interaction.id}:store-answer`]: station.trustStore.question.options.find(
        (o) => o.correct,
      )!.id,
    };
    station.slots.forEach((slot, i) => {
      answers[`${interaction.id}:slot:${slot.id}`] = station.correctOrder[i]!;
    });
    expect(
      isSceneComplete(
        scene,
        stateFor({ answers, used: [`${interaction.id}:trusted`] }),
      ),
    ).toBe(false);
    expect(
      isSceneComplete(
        scene,
        stateFor({
          answers,
          used: [`${interaction.id}:trusted`, `${interaction.id}:untrusted`],
        }),
      ),
    ).toBe(true);
  });

  it("requires a correct diagnosis and a safe action for all three warnings", () => {
    const scene = scenes.find((s) => s.id === "ta-warning")!;
    const station = interactionOf("ta-warning").station as TrustWarningStation;
    const answers: Record<string, string> = {};
    const used: string[] = [];
    for (const c of station.cases) {
      answers[`${c.id}:diagnosis`] = c.diagnosis.options.find((o) => o.correct)!.id;
      answers[`${c.id}:action`] = c.action.options.find((o) => o.safe)!.id;
      used.push(`${c.id}:revealed`);
    }
    expect(isSceneComplete(scene, stateFor({ answers, used }))).toBe(true);

    const unsafe = { ...answers };
    const first = station.cases[0]!;
    unsafe[`${first.id}:action`] = first.action.options.find((o) => !o.safe)!.id;
    expect(isSceneComplete(scene, stateFor({ answers: unsafe, used }))).toBe(false);
  });

  it("requires verdict, exact evidence and limit for both decision scenarios", () => {
    const scene = scenes.find((s) => s.id === "ta-decision")!;
    const station = interactionOf("ta-decision").station as TrustDecisionStation;
    const answers: Record<string, string> = {};
    const used: string[] = [];
    for (const s of station.scenarios) {
      answers[`${s.id}:verdict`] = s.verdict.options.find((o) => o.correct)!.id;
      answers[`${s.id}:limit`] = s.limit.options.find((o) => o.correct)!.id;
      for (const option of s.evidence.options) {
        if (option.supporting) answers[`${s.id}:evidence:${option.id}`] = "selected";
      }
      used.push(`${s.id}:revealed`);
    }
    expect(isSceneComplete(scene, stateFor({ answers, used }))).toBe(true);

    const overselected = { ...answers };
    const firstScenario = station.scenarios[0]!;
    const distractor = firstScenario.evidence.options.find((o) => !o.supporting)!;
    overselected[`${firstScenario.id}:evidence:${distractor.id}`] = "selected";
    expect(isSceneComplete(scene, stateFor({ answers: overselected, used }))).toBe(
      false,
    );
  });

  it("completes the close once the takeaway is revealed", () => {
    const scene = scenes.find((s) => s.id === "ta-close")!;
    const interaction = interactionOf("ta-close");
    const station = interaction.station as TrustRecapStation;
    expect(station.rows).toHaveLength(4);
    expect(
      isSceneComplete(scene, stateFor({ used: [`${interaction.id}:takeaway`] })),
    ).toBe(true);
  });

  it("treats the opening brief as readable with no interaction required", () => {
    const brief = scenes.find((s) => s.id === "ta-brief")!;
    expect(brief.interaction).toBeUndefined();
    expect(isSceneComplete(brief, stateFor())).toBe(true);
  });
});

describe("Week 9 student mission briefs", () => {
  it("has six scenes in the agreed order", () => {
    expect(scenes.map((s) => s.id)).toEqual([
      "ta-brief",
      "ta-inspect",
      "ta-chain",
      "ta-warning",
      "ta-decision",
      "ta-close",
    ]);
  });

  it("gives every station a complete brief", () => {
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

  it("gives every station numbered steps and a takeaway explanation", () => {
    const withSteps = scenes.filter((s) => (s.missionBrief?.steps?.length ?? 0) > 0);
    expect(withSteps.map((s) => s.id)).toEqual([
      "ta-inspect",
      "ta-chain",
      "ta-warning",
      "ta-decision",
      "ta-close",
    ]);
    for (const scene of scenes) {
      expect(scene.explanation, `${scene.id} explanation`).toBeTruthy();
    }
  });

  it("never asks students to submit anything", () => {
    const serialised = JSON.stringify(trustAuthority).toLowerCase();
    expect(serialised).not.toContain("submit your");
    expect(serialised).not.toContain("leaderboard");
    // "graded" only ever appears as a reassurance that nothing is graded.
    for (const match of serialised.match(/.{24}graded/g) ?? []) {
      expect(match).toMatch(/not|never|nothing/);
    }
  });
});

describe("Week 9 instructor guide", () => {
  it("gives every scene a facilitation package and an answer guide", () => {
    for (const scene of scenes) {
      expect(scene.facilitation, `${scene.id} facilitation`).toBeDefined();
      const guide = scene.instructorAnswerGuide;
      expect(guide, `${scene.id} instructorAnswerGuide`).toBeDefined();
      expect(guide!.actionSequence.length).toBeGreaterThan(0);
      expect(guide!.sayThis!.length).toBeGreaterThan(20);
      expect(guide!.predictionPrompt!.length).toBeGreaterThan(20);
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

  it("covers every warning case and decision scenario individually", () => {
    const warning = scenes.find((s) => s.id === "ta-warning")!;
    const warningStation = interactionOf("ta-warning").station as TrustWarningStation;
    expect(
      warning.instructorAnswerGuide!.scenarioGuides!.map((g) => g.id),
    ).toEqual(warningStation.cases.map((c) => c.id));

    const decision = scenes.find((s) => s.id === "ta-decision")!;
    const decisionStation = interactionOf("ta-decision")
      .station as TrustDecisionStation;
    expect(
      decision.instructorAnswerGuide!.scenarioGuides!.map((g) => g.id),
    ).toEqual(decisionStation.scenarios.map((s) => s.id));

    for (const scene of [warning, decision]) {
      for (const entry of scene.instructorAnswerGuide!.scenarioGuides!) {
        expect(entry.actionSequence.length).toBeGreaterThan(2);
        expect(entry.sayThis.length).toBeGreaterThan(20);
        expect(entry.expectedAnswer).toMatch(/\.$/);
        expect(entry.expectedEvidence.length).toBeGreaterThan(1);
        expect(entry.whyCorrect.length).toBeGreaterThan(20);
        expect(entry.misconceptions.length).toBeGreaterThan(1);
        for (const m of entry.misconceptions) {
          expect(m.wrong.length).toBeGreaterThan(5);
          expect(m.correction.length).toBeGreaterThan(10);
        }
        expect(entry.followUp.desiredResponse.length).toBeGreaterThan(10);
        expect(entry.boundary.length).toBeGreaterThan(20);
        expect(entry.readyToAdvance.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps a timed run of show for the instructor console", () => {
    expect(trustAuthority.runOfShow).toHaveLength(6);
    expect(trustAuthority.instructorNotes!.length).toBeGreaterThan(3);
  });
});
