import { describe, expect, it } from "vitest";
import { buildPortfolioFiles, scrub } from "./portfolio.server";
import { emptyPhase3State, type Phase3State } from "./project-state";
import { getScenarioPrivate, getScenarioPublic } from "./scenarios/registry.server";
import { CHECKPOINT_TYPES } from "./scenario-types";

const CODE = "northstar-cloud";
const scenario = getScenarioPublic(CODE, "1.0.0")!;

function matureState(): Phase3State {
  const zone = scenario.zones[0]!.id;
  const pool = scenario.pools[0]!.id;
  const wl = scenario.workloads[0]!;
  const s = emptyPhase3State();
  s.analysis = [
    {
      id: "a1",
      kind: "requirement",
      title: "Offline root",
      detail: "Root must stay offline",
      source: "constraint",
      priority: "Must",
    },
  ];
  s.architecture.nodes = [
    { id: "hsm1", kind: "hsm", name: "Vault HSM", role: "key protection", zoneId: zone, x: 1, y: 1 },
    {
      id: "root", kind: "ca-root", name: "Northstar Root CA", role: "root", zoneId: zone, x: 2, y: 2,
      hsmId: "hsm1", offline: true, validityDays: 7300, notes: "Offline to reduce blast radius",
    },
    {
      id: "iss", kind: "ca-issuing", name: "Northstar Issuing CA", role: "issuing", zoneId: zone,
      x: 3, y: 3, parentId: "root", hsmId: "hsm1", validityDays: 1825,
    },
  ];
  s.architecture.edges = [
    { id: "e1", fromId: "root", toId: "iss", kind: "trust", label: "signs" },
  ];
  s.operations.profiles = [
    {
      id: "p1", name: "TLS Server", poolId: pool, eligibleCaIds: ["iss"], algorithm: "ECDSA P-256",
      validityDays: 90, subject: "CN=app", san: "app.example", eku: wl.requiredEku,
      enrollment: "ACME", approval: "standard", renewal: "automated", statusMethod: "OCSP",
      ownershipRequired: true, exportable: false, environment: "production",
      rationale: "short-lived automated issuance",
    },
  ];
  s.operations.assets = [
    {
      id: "c1", label: "app cert", poolId: pool, profileId: "p1", caNodeId: "iss", zoneId: zone,
      owner: "Platform", ownerState: "Known", lifecycle: "Active", status: "Good",
      daysRemaining: 60, origin: "student", note: "issued",
    },
  ];
  s.operations.lifecycle = [
    { id: "l1", assetId: "c1", at: "2026-01-01T00:00:00.000Z", action: "issued", to: "Active", actor: "student", detail: "issued" },
  ];
  s.operations.publications = [
    { id: "pub1", method: "OCSP", publisherNodeId: "iss", consumerZoneId: zone, freshnessHours: 4, reachable: true, note: "" },
  ];
  s.workloads.instances = [
    { id: "w1", definitionId: wl.id, name: wl.name, bindings: { server: "c1" }, config: {} },
  ];
  s.workloads.runs = [
    {
      id: "r1", workloadInstanceId: "w1", definitionId: wl.id, at: "2026-02-01T00:00:00.000Z",
      clockDay: 1, scenarioVersion: "1.0.0", ruleVersion: "1", result: "FAIL",
      checks: [{ order: 1, key: "eku", label: "EKU matches", result: "fail", expected: "x", observed: "y", consequence: "handshake rejected" }],
      artifacts: [], timestamps: [], priorRunIds: [], activeEventKeys: [],
    },
    {
      id: "r2", workloadInstanceId: "w1", definitionId: wl.id, at: "2026-02-02T00:00:00.000Z",
      clockDay: 2, scenarioVersion: "1.0.0", ruleVersion: "1", result: "PASS",
      checks: [], artifacts: [], timestamps: [], priorRunIds: ["r1"], activeEventKeys: [],
    },
  ];
  s.change.checkpoints = CHECKPOINT_TYPES.map((c) => ({
    type: c.key,
    status: "Submitted" as const,
    studentNote: `note ${c.key}`,
  }));
  s.notes = { defend: "I would automate revocation earlier next time." };
  return s;
}

function build(state: Phase3State, over: Partial<Parameters<typeof buildPortfolioFiles>[0]> = {}) {
  return buildPortfolioFiles({
    displayName: "Jordan Rivera",
    scenario,
    state,
    evidence: [{ stage: "analyze", week: 17, title: "Requirements traced", body: "Mapped to brief" }],
    activatedEvents: [],
    submitted: false,
    generatedAt: "2026-09-03T00:00:00.000Z",
    ...over,
  });
}

describe("portfolio package structure", () => {
  it("emits the expected GitHub-friendly file set", () => {
    const files = build(matureState());
    expect(Object.keys(files).sort()).toEqual(
      [
        "GITHUB-INSTRUCTIONS.md",
        "README.md",
        "data/project-summary.json",
        "docs/architecture.md",
        "docs/certificate-strategy.md",
        "docs/change-and-incident-response.md",
        "docs/final-defense-summary.md",
        "docs/lifecycle-and-status.md",
        "docs/workload-testing.md",
        "evidence/evidence-summary.md",
      ].sort(),
    );
  });

  it("reflects saved architecture as a mermaid diagram using names, not ids", () => {
    const arch = build(matureState())["docs/architecture.md"]!;
    expect(arch).toContain("```mermaid");
    expect(arch).toContain("Northstar Root CA");
    expect(arch).toContain("Northstar Issuing CA");
    expect(arch).not.toMatch(/\bhsm1\b/);
    expect(arch).not.toMatch(/\biss\b/);
  });

  it("keeps failed workload runs visible as troubleshooting evidence", () => {
    const wl = build(matureState())["docs/workload-testing.md"]!;
    expect(wl).toContain("Failures encountered and diagnosed: **1**");
    expect(wl).toContain("EKU matches");
    expect(wl).toContain("Final result: **PASS**");
  });

  it("does not invent Stage 4 content when no event is activated", () => {
    const files = build(matureState());
    expect(files["docs/change-and-incident-response.md"]).toContain(
      "Stage 4 change/incident work has not yet been completed",
    );
    expect(files["README.md"]).toContain("has not yet been completed");
  });

  it("includes only activated Stage 4 briefs", () => {
    const files = build(matureState(), {
      activatedEvents: [{ title: "CRL outage", studentBrief: "The responder is unreachable." }],
    });
    const doc = files["docs/change-and-incident-response.md"]!;
    expect(doc).toContain("CRL outage");
    const privateDefs = getScenarioPrivate(CODE, "1.0.0")!.events ?? [];
    for (const def of privateDefs) {
      expect(doc).not.toContain(def.key);
    }
  });

  it("marks an empty project as in-progress and omits invented content", () => {
    const files = build(emptyPhase3State());
    expect(files["README.md"]).toContain("In-progress portfolio snapshot");
    expect(files["docs/architecture.md"]).toContain("No architecture has been recorded");
    expect(files["docs/certificate-strategy.md"]).toContain("No certificate strategy work");
    expect(files["README.md"]).not.toContain("Lessons learned");
  });

  it("marks a submitted project as a final artifact", () => {
    const files = build(matureState(), { submitted: true });
    expect(files["README.md"]).toContain("Final portfolio artifact");
  });
});

describe("portfolio sanitization", () => {
  it("contains no UUIDs, emails, or signature-like material", () => {
    const dirty = matureState();
    dirty.notes["defend"] =
      "contact me at student@example.com about 3f6c1a1e-1c4f-4d2f-9a3d-0f1b2c3d4e5f " +
      "signature 9f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c";
    const files = build(dirty, { displayName: "leaky@example.com" });
    const all = Object.values(files).join("\n");
    expect(all).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(all).not.toMatch(/@example\.com/);
    expect(all).not.toMatch(/\b[0-9a-f]{40,}\b/i);
    expect(all).not.toContain("leaky");
  });

  it("omits instructor-private and other-student material", () => {
    const all = Object.values(build(matureState())).join("\n");
    for (const forbidden of [
      "difficulty",
      "calibration",
      "answerGuidance",
      "validSolutionFamilies",
      "instructorNotes",
      "triggerRules",
      "ownerId",
      "assignmentId",
      "projectId",
      "SUPABASE",
      "service_role",
    ]) {
      expect(all).not.toContain(forbidden);
    }
  });

  it("scrub redacts secrets and tokens", () => {
    expect(scrub("key sb_secret_abcdefgh")).not.toContain("sb_secret_abcdefgh");
  });
});

describe("portfolio json is not a restorable backup", () => {
  it("has no signature, state, or format fields the importer accepts", () => {
    const json = JSON.parse(build(matureState())["data/project-summary.json"]!);
    expect(json.artifact).toBe("cvi-phase3-portfolio-summary");
    expect(json.format).toBeUndefined();
    expect(json.signature).toBeUndefined();
    expect(json.body).toBeUndefined();
    expect(json.state).toBeUndefined();
    expect(json.ownerId).toBeUndefined();
    expect(json.assignmentId).toBeUndefined();
  });
});
