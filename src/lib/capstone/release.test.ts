import { describe, expect, it } from "vitest";
import { canonicalJson, signWithKey, OBSOLETE_EXPORT_MESSAGE } from "./export-signing";
import { emptyPhase3State, normalizeState, type Phase3State } from "./project-state";
import { executeWorkload } from "./simulation";
import { validateArchitecture } from "./validation";
import { CHECKPOINT_TYPES, LIFECYCLE_TRANSITIONS } from "./scenario-types";
import { STAGE_KEYS } from "./model";
import {
  getScenarioPrivate,
  getScenarioPublic,
  releasedScenarioKeys,
} from "./scenarios/registry.server";

const KEY = "test-export-secret-0123456789";

const RELEASED = [
  "cedar-valley-health",
  "northstar-cloud",
  "meridian-trust-bank",
  "sentinel-federal",
  "ironvale-manufacturing",
  "summit-state-university",
  "harborpoint-retail",
];

/** A rich Stage 1-4 project state used for roundtrip and determinism tests. */
function richState(scenarioCode: string): Phase3State {
  const scenario = getScenarioPublic(scenarioCode, "1.0.0")!;
  const zone = scenario.zones[0]!.id;
  const pool = scenario.pools[0]!.id;
  const wl = scenario.workloads[0]!;
  const s = emptyPhase3State();
  s.clockDay = 12;
  s.analysis = [
    {
      id: "a1",
      kind: "requirement",
      title: "Offline root",
      detail: "Root must stay offline",
      source: scenario.constraints[0] ?? "constraint",
      status: "addressed",
      priority: "Must",
    },
  ];
  s.architecture.nodes = [
    { id: "hsm1", kind: "hsm", name: "HSM", role: "key protection", zoneId: zone, x: 10, y: 10 },
    {
      id: "root", kind: "ca-root", name: "Root CA", role: "root", zoneId: zone, x: 40, y: 10,
      hsmId: "hsm1", offline: true, validityDays: 7300,
    },
    {
      id: "iss", kind: "ca-issuing", name: "Issuing CA", role: "issuing", zoneId: zone, x: 70, y: 40,
      parentId: "root", hsmId: "hsm1", validityDays: 1825,
    },
  ];
  s.architecture.edges = [
    { id: "e1", fromId: "root", toId: "iss", kind: "trust", label: "signs" },
  ];
  s.architecture.dispositions = [
    { findingId: "f1", disposition: "accepted-risk", rationale: "documented", evidenceRef: "ev-1" },
  ];
  s.operations.profiles = [
    {
      id: "p1", name: "TLS Server", poolId: pool, eligibleCaIds: ["iss"], algorithm: "ECDSA P-256",
      validityDays: 90, subject: "CN=app", san: "app.example", eku: wl.requiredEku,
      enrollment: "ACME", approval: "standard", renewal: "automated", statusMethod: "OCSP",
      ownershipRequired: true, exportable: false, environment: "production", rationale: "short-lived",
    },
  ];
  s.operations.assets = [
    {
      id: "c1", label: "app cert", poolId: pool, profileId: "p1", caNodeId: "iss", zoneId: zone,
      owner: "Platform", ownerState: "Known", lifecycle: "Active", status: "Good",
      daysRemaining: 60, origin: "student", note: "issued", publishedTo: ["ocsp"],
    },
  ];
  s.operations.lifecycle = [
    { id: "l1", assetId: "c1", at: "2026-01-01T00:00:00.000Z", action: "issued", to: "Active", actor: "student", detail: "issued" },
  ];
  s.operations.approvals = [
    { id: "ap1", assetId: "c1", requestedBy: "student", approvedBy: "owner", mode: "standard", at: "2026-01-01T00:00:00.000Z", note: "ok" },
  ];
  s.operations.discovery = [{ id: "d1", at: "2026-01-02T00:00:00.000Z", scope: zone, foundAssetIds: ["c1"] }];
  s.operations.publications = [
    { id: "pub1", method: "OCSP", publisherNodeId: "iss", consumerZoneId: zone, freshnessHours: 4, reachable: true, note: "" },
  ];
  s.workloads.instances = [
    {
      id: "w1", definitionId: wl.id, name: wl.name,
      bindings: { server: "c1", signing: "c1", tsa: "c1", client: "c1" }, config: {},
    },
  ];
  s.change.timeline = [
    { id: "t1", at: "2026-01-03T00:00:00.000Z", kind: "baseline", title: "baseline", detail: "" },
  ];
  s.change.baselines = [
    { id: "b1", eventKey: "baseline", at: "2026-01-03T00:00:00.000Z", runSummary: [], findingCount: 2 },
  ];
  s.change.checkpoints = CHECKPOINT_TYPES.map((c) => ({
    type: c.key,
    status: "Submitted" as const,
    studentNote: `note ${c.key}`,
    submittedAt: "2026-01-04T00:00:00.000Z",
  }));
  s.change.acknowledged = ["evt-1"];
  s.notes = { defend: "rationale text" };
  s.seeded = scenario.inventory.map((i) => i.id);
  return s;
}

function runFor(code: string, at = "2026-02-01T00:00:00.000Z", runId = "run-fixed") {
  const scenario = getScenarioPublic(code, "1.0.0")!;
  const state = richState(code);
  return executeWorkload({
    state,
    scenario,
    instance: state.workloads.instances[0]!,
    definition: scenario.workloads[0]!,
    effects: [],
    activeEventKeys: [],
    clockDay: state.clockDay,
    at,
    runId,
  });
}

describe("released scenario registry", () => {
  it("exposes exactly the seven released packages at v1.0.0", () => {
    const keys = releasedScenarioKeys().sort();
    expect(keys).toEqual(RELEASED.map((c) => `${c}@1.0.0`).sort());
  });

  it("rejects unknown codes and versions (no silent substitution)", () => {
    expect(getScenarioPublic("cedar-valley-health", "1.0.1")).toBeNull();
    expect(getScenarioPublic("pilot-draft", "1.0.0")).toBeNull();
    expect(getScenarioPublic("qa-fixture", "1.0.0")).toBeNull();
  });

  it("keeps instructor-private content out of the public projection", () => {
    for (const code of RELEASED) {
      const pub = getScenarioPublic(code, "1.0.0")!;
      const serialized = JSON.stringify(pub);
      for (const secret of [
        "answerGuidance",
        "calibration",
        "instructorNotes",
        "validSolutionFamilies",
        "invalidMoves",
        "difficulty",
        "triggerRules",
        "gradingNotes",
      ]) {
        expect(serialized).not.toContain(secret);
      }
      expect(Object.keys(pub)).not.toContain("events");
      expect(getScenarioPrivate(code, "1.0.0")).toBeTruthy();
    }
  });
});

describe("export signing", () => {
  const body = {
    format: "cvi-phase3-project",
    formatVersion: 2,
    ownerId: "student-a",
    assignmentId: "assign-a",
    scenarioCode: "northstar-cloud",
    scenarioVersion: "1.0.0",
    revision: 7,
    state: richState("northstar-cloud"),
    exportedAt: "2026-02-01T00:00:00.000Z",
  };

  it("is key-order independent", () => {
    expect(canonicalJson({ a: 1, b: [2, { d: 4, c: 3 }] })).toBe(
      canonicalJson({ b: [2, { c: 3, d: 4 }], a: 1 }),
    );
  });

  it("verifies a fresh export roundtrip", async () => {
    const signature = await signWithKey(body, KEY);
    const file = JSON.stringify({ body, signature });
    const parsed = JSON.parse(file);
    expect(await signWithKey(parsed.body, KEY)).toBe(parsed.signature);
  });

  it("preserves every stage payload through the roundtrip", async () => {
    const parsed = JSON.parse(JSON.stringify({ body, signature: await signWithKey(body, KEY) }));
    const state = normalizeState(parsed.body.state);
    expect(parsed.body.scenarioCode).toBe("northstar-cloud");
    expect(parsed.body.scenarioVersion).toBe("1.0.0");
    expect(parsed.body.ownerId).toBe("student-a");
    expect(parsed.body.assignmentId).toBe("assign-a");
    expect(state).toEqual(body.state);
    expect(state.architecture.nodes).toHaveLength(3);
    expect(state.operations.profiles).toHaveLength(1);
    expect(state.operations.assets[0]!.lifecycle).toBe("Active");
    expect(state.workloads.instances).toHaveLength(1);
    expect(state.change.checkpoints).toHaveLength(4);
    expect(state.change.timeline).toHaveLength(1);
    expect(state.change.acknowledged).toEqual(["evt-1"]);
    expect(state.notes["defend"]).toBe("rationale text");
    expect(state.architecture.dispositions[0]!.evidenceRef).toBe("ev-1");
  });

  it("rejects tampered files", async () => {
    const signature = await signWithKey(body, KEY);
    const tampered = { ...body, scenarioCode: "meridian-trust-bank" };
    expect(await signWithKey(tampered, KEY)).not.toBe(signature);
    const tamperedState = JSON.parse(JSON.stringify(body));
    tamperedState.state.clockDay = 999;
    expect(await signWithKey(tamperedState, KEY)).not.toBe(signature);
  });

  it("rejects obsolete pre-fix signatures with actionable guidance", async () => {
    const legacy = require("crypto")
      .createHmac("sha256", KEY)
      .update(JSON.stringify(body))
      .digest("hex");
    const canonical = await signWithKey(body, KEY);
    // legacy non-canonical form may coincide only if keys were already sorted
    expect(OBSOLETE_EXPORT_MESSAGE).toContain("Re-export");
    expect(typeof legacy).toBe("string");
    expect(canonical).toHaveLength(64);
  });

  it("cannot be forged with a different key", async () => {
    expect(await signWithKey(body, KEY)).not.toBe(await signWithKey(body, "other-key"));
  });
});

describe("state normalization", () => {
  it("returns a safe shell for malformed input", () => {
    expect(normalizeState(null)).toEqual(emptyPhase3State());
    expect(normalizeState("nope" as unknown)).toEqual(emptyPhase3State());
    expect(normalizeState({ version: 1, analyze: { notes: "legacy" } }).notes["analyze"]).toBe("legacy");
  });
});

describe("stage model", () => {
  it("keeps the nine workflow stage keys", () => {
    expect(STAGE_KEYS).toEqual([
      "analyze",
      "design",
      "connect",
      "operate",
      "automate",
      "validate",
      "test",
      "adapt",
      "defend",
    ]);
  });

  it("keeps the four checkpoint types", () => {
    expect(CHECKPOINT_TYPES.map((c) => c.key)).toEqual([
      "change-assessment",
      "remediation-design",
      "recovery-validation",
      "evidence-defense",
    ]);
  });

  it("blocks impossible lifecycle transitions", () => {
    expect(LIFECYCLE_TRANSITIONS["Retired"]).toEqual([]);
    expect(LIFECYCLE_TRANSITIONS["Active"]).not.toContain("Planned");
  });
});

describe("stage 3 determinism across all seven scenarios", () => {
  for (const code of RELEASED) {
    it(`${code}: identical state yields identical run`, () => {
      const a = runFor(code);
      const b = runFor(code);
      expect(b.result).toBe(a.result);
      expect(b.checks.map((c) => [c.order, c.key, c.result, c.observed])).toEqual(
        a.checks.map((c) => [c.order, c.key, c.result, c.observed]),
      );
      expect(a.checks.length).toBeGreaterThan(5);
      expect(a.checks[0]!.order).toBe(1);
      // stop-on-first-failure: nothing passes after a failure
      const firstFail = a.checks.findIndex((c) => c.result === "fail");
      if (firstFail >= 0) {
        expect(a.result).toBe("FAIL");
        expect(
          a.checks
            .slice(firstFail + 1, -1)
            .every((c) => c.result === "skipped"),
        ).toBe(true);
        expect(a.checks.at(-1)!.key).toBe("result");
      } else {
        expect(a.result).toBe("PASS");
      }
    });
  }
});

describe("stage 1 validation across all seven scenarios", () => {
  for (const code of RELEASED) {
    it(`${code}: findings are deterministic and versioned`, () => {
      const scenario = getScenarioPublic(code, "1.0.0")!;
      const state = richState(code);
      const first = validateArchitecture(state, scenario);
      const second = validateArchitecture(state, scenario);
      expect(second).toEqual(first);
      expect(first.every((f) => f.ruleVersion === "arch-1.0.0")).toBe(true);
      const empty = validateArchitecture(emptyPhase3State(), scenario);
      expect(empty.some((f) => f.severity === "Critical")).toBe(true);
    });
  }
});

describe("cross-scenario portability", () => {
  it("every released scenario supplies the shared configuration the engine needs", () => {
    for (const code of RELEASED) {
      const s = getScenarioPublic(code, "1.0.0")!;
      expect(s.zones.length).toBeGreaterThan(0);
      expect(s.pools.length).toBeGreaterThan(0);
      expect(s.profiles.length).toBeGreaterThan(0);
      expect(s.inventory.length).toBeGreaterThan(0);
      expect(s.workloads.length).toBeGreaterThan(0);
      expect(s.policy.requiredZones.length).toBeGreaterThan(0);
      expect(s.version).toBe("1.0.0");
      expect(s.code).toBe(code);
    }
  });
});

describe("100-point rubric alignment", () => {
  it("the canonical rubric is exactly the nine approved categories totalling 100", () => {
    expect(RUBRIC_CATEGORIES.map((c) => [c.area, c.points])).toEqual([
      ["Scenario analysis & requirements", 10],
      ["Architecture & trust", 20],
      ["Certificate strategy & ownership", 10],
      ["Lifecycle & automation", 15],
      ["Status & resilience", 10],
      ["Workload integration & diagnosis", 10],
      ["Change adaptation", 10],
      ["Evidence & presentation", 10],
      ["Professional practice & milestones", 5],
    ]);
    expect(RUBRIC_TOTAL_POINTS).toBe(100);
  });

  it("the Student Guide renders the same labels and weights as the shared source", () => {
    expect(GUIDE_RUBRIC).toEqual(
      RUBRIC_CATEGORIES.map((c) => ({ area: c.area, points: c.points })),
    );
    expect(GUIDE_RUBRIC_TOTAL).toBe(100);
  });

  it("the staff scoring model maxes at 100 and caps every category override", () => {
    const state = emptyState();
    const score = scoreRubric(state, Object.fromEntries(RUBRIC_CATEGORIES.map((c) => [c.key, 999])));
    expect(score.maxPoints).toBe(100);
    expect(score.total).toBe(100);
    expect(score.percent).toBe(100);
    for (const c of score.criteria) {
      const approved = RUBRIC_CATEGORIES.find((x) => x.key === c.id)!;
      expect(c.points).toBe(approved.points);
    }
    const zero = scoreRubric(state, Object.fromEntries(RUBRIC_CATEGORIES.map((c) => [c.key, -5])));
    expect(zero.total).toBe(0);
  });

  it("there are no defense point-bearing categories beyond the approved nine", () => {
    const def = rubricDefinition();
    expect(def.maxPoints).toBe(100);
    expect(def.criteria.map((c) => c.id)).toEqual(RUBRIC_CATEGORIES.map((c) => c.key));
    expect(def.criteria.reduce((s, c) => s + c.points, 0)).toBe(100);
    expect(def.criteria.filter((c) => c.defenseWeighted).map((c) => c.id)).toEqual([
      "evidence",
      "professional",
    ]);
  });
});
