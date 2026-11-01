import { describe, expect, it } from "vitest";
import { computeReadiness } from "@/lib/week11/readiness.server";
import { createSeedState } from "@/lib/week11/engine";
import { missions } from "@/lib/week11/seed";
import { isRequiredQuestion } from "@/lib/week11/requirements";
import type { Learner } from "@/lib/week11/types";
import { buildSnapshot, detectSourceChange } from "./source.server";
import { computeQA, fillEmptyFromSource, normalizeContent, seedContent } from "./model";

/** Fictional student who did ONLY the shortened required Lab 3 Case File work (no optional labs). */
function requiredOnlyAttempt() {
  const long = "Fictional practice text long enough to count as written.";
  const finding = (key: string, refs: string[]) => ({ key, title: `${key} title`, refs, observation: long, hypothesis: long, conclusion: `${key} ${long}`, uncertainty: long, nextAction: long, priority: "high" as const, rationale: long });
  const m06 = missions.find((m) => m.key === "M06")!;
  const answers = Object.fromEntries(m06.questions.filter((q) => isRequiredQuestion("M06", q.id)).map((q) => [q.id, long]));
  const learner: Learner = {
    displayName: "Pat Practice",
    findings: [finding("F1", ["S004", "S009"]), finding("F2", ["A002"])],
    comparison: { refs: ["S010"], text: long },
    report: { sections: {}, limitations: long, liveChain: "LA-0001 then AT-0002 showed the result." },
    captions: { "EV-17": long, "EV-18": long, "EV-19": long },
    missions: { M06: { answers } },
  } as unknown as Learner;
  const ev = ["E17", "E18", "E19"].map((slot) => ({ evidence_key: `EV-${slot.slice(1)}`, slot, mission: "M06", title: slot, snapshot: {}, content_hash: "h", captured_revision: 1, created_at: "2026-10-31" }));
  return { learner, ev };
}

describe("Week 11 → Week 12 handoff (shortened required path)", () => {
  it("a required-only Case File makes the Week 12 source complete even with optional labs untouched", () => {
    const { learner, ev } = requiredOnlyAttempt();
    const readiness = computeReadiness(createSeedState(), learner, ev as never);
    const m06 = readiness.find((r) => r.mission === "M06")!;
    expect(m06.missing).toEqual([]);
    for (const opt of ["M01", "M03", "M04"]) expect(readiness.find((r) => r.mission === opt)!.required).toBe(false);
    const snap = buildSnapshot({ id: "aaaaaaaa-0000-0000-0000-000000000000", status: "active", archived_at: null, learner, text_revision: 3, state_revision: 4 }, ev as never, m06);
    expect(snap.sourceComplete).toBe(true);
    expect(computeQA(snap, seedContent(snap), "").checks.find((c) => c.id === "source")!.ok).toBe(true);
  });

  it("maps the student's own findings, limitations and name into Week 12 starting fields", () => {
    const { learner, ev } = requiredOnlyAttempt();
    const snap = buildSnapshot({ id: "aaaaaaaa-0000-0000-0000-000000000000", status: "active", archived_at: null, learner, text_revision: 3, state_revision: 4 }, ev as never, { ready: true, missing: [] });
    const c = seedContent(snap);
    expect(c.report.analyst).toBe("Pat Practice");
    expect(c.report.limitations).toBe(learner.report!.limitations);
    expect(c.findings.map((f) => [f.sourceFindingKey, f.evidenceRefs])).toEqual([["F1", ["S004", "S009"]], ["F2", ["A002"]]]);
    expect(snap.comparison.refs).toEqual(["S010"]);
    expect(snap.report.liveChain).toContain("LA-0001");
    expect(snap.evidence.map((e) => e.slot)).toEqual(["E17", "E18", "E19"]);
  });

  it("an empty Week 11 Case File gives a draft source with plain missing items", () => {
    const empty = buildSnapshot({ id: "bbbbbbbb-0000-0000-0000-000000000000", status: "active", archived_at: null, learner: null, text_revision: 0, state_revision: 0 }, [], computeReadiness(createSeedState(), {}, []).find((r) => r.mission === "M06")!);
    expect(empty.sourceComplete).toBe(false);
    expect(empty.sourceMissing.length).toBeGreaterThan(0);
    const src = computeQA(empty, seedContent(empty), "").checks.find((c) => c.id === "source")!;
    expect(src.ok).toBe(false);
    expect(src.missing[0]).toContain("Lab 3");
  });

  it("refresh fills only empty Week 12 fields and never overwrites student writing", () => {
    const { learner, ev } = requiredOnlyAttempt();
    const snap = buildSnapshot({ id: "aaaaaaaa-0000-0000-0000-000000000000", status: "active", archived_at: null, learner, text_revision: 5, state_revision: 4 }, ev as never, { ready: true, missing: [] });
    // Started from an empty source: nothing to keep yet → findings/name/limitations fill in.
    const filled = fillEmptyFromSource(normalizeContent({}), snap)!;
    expect(filled.findings).toHaveLength(2);
    expect(filled.report.analyst).toBe("Pat Practice");
    // Student already edited: nothing is replaced.
    const edited = normalizeContent({ findings: [{ key: "RF1", sourceFindingKey: "F1", statement: "My own words", evidenceRefs: ["S009"], confidence: "likely", uncertainty: "" }], report: { ...normalizeContent({}).report, analyst: "Pat P.", limitations: "My limits text here." } });
    expect(fillEmptyFromSource(edited, snap)).toBeNull();
  });

  it("detects a newer Week 11 source without changing Week 12", () => {
    const change = detectSourceChange({ sourceId: "x", textRevision: 3, stateRevision: 4 }, { id: "x", status: "active", text_revision: 5, state_revision: 4, archived_at: null });
    expect(change?.kind).toBe("edited");
    expect(change?.detail).toContain("Week 12 writing is safe");
  });
});
