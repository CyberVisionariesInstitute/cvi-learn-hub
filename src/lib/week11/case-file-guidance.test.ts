import { describe, expect, it } from "vitest";
import { caseFilePresence, findingPresence, sectionGuidance } from "./case-file-guidance";
import type { Finding, Learner } from "./types";

const finding: Finding = { key: "F1", title: "Fictional title", refs: ["S-DEMO"], observation: "Observed", hypothesis: "Possible", conclusion: "Supported", uncertainty: "Unknown", nextAction: "Check", priority: "medium", rationale: "Impact" };
describe("Case File presentation presence", () => {
  it("reports nine finding fields without judging their content or changing writing", () => {
    const before = JSON.stringify(finding);
    expect(findingPresence(finding)).toEqual(Array(9).fill(true));
    expect(findingPresence({ ...finding, refs: [], uncertainty: " " })).toEqual([true, false, true, true, true, false, true, true, true]);
    expect(JSON.stringify(finding)).toBe(before);
  });
  it("counts at least two saved findings, not blank UI placeholders", () => {
    expect(caseFilePresence({}, [], []).twoFindings).toBe(false);
    expect(caseFilePresence({ findings: [finding] }, [], []).twoFindings).toBe(false);
    expect(caseFilePresence({ findings: [finding, { ...finding, key: "F2" }] }, [], []).twoFindings).toBe(true);
  });
  it("checks all twelve original section keys and separate limitations without rewriting them", () => {
    const learner: Learner = { findings: [finding, { ...finding, key: "F2" }], comparison: { refs: ["S-DEMO"], text: "Compare" }, report: { sections: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i + 1), `Saved ${i + 1}`])), limitations: "Limited", liveChain: "LA-DEMO shows an action" } };
    const before = JSON.stringify(learner);
    expect(caseFilePresence(learner, ["S-DEMO"], ["LA-DEMO"]).sections).toBe(true);
    expect(caseFilePresence({ ...learner, report: { ...learner.report, sections: { ...learner.report?.sections, "12": "" } } }, [], []).sections).toBe(false);
    expect(caseFilePresence({ ...learner, report: { ...learner.report, limitations: "" } }, [], []).uncertaintyAndLimitations).toBe(false);
    expect(sectionGuidance.map((item) => item.part)).toEqual([1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4]);
    expect(JSON.stringify(learner)).toBe(before);
  });
  it("distinguishes historical selections and exact live references without assessing conclusions", () => {
    const learner: Learner = { findings: [finding], comparison: { refs: ["S-DEMO"], text: "" }, report: { liveChain: "LA-DEMO" } };
    expect(caseFilePresence(learner, ["S-DEMO"], ["LA-DEMO"]).historicalSelections).toBe(true);
    expect(caseFilePresence(learner, ["S-DEMO"], ["LA-DEMO"]).liveSource).toBe(true);
    expect(caseFilePresence({ ...learner, report: { liveChain: "LA-DEMO S-DEMO" } }, ["S-DEMO"], ["LA-DEMO"]).liveSource).toBe(false);
    expect(caseFilePresence({ ...learner, report: { liveChain: "LA-DEMO-extra" } }, ["S-DEMO"], ["LA-DEMO"]).liveSource).toBe(false);
    expect(caseFilePresence({ ...learner, comparison: { refs: ["LA-DEMO"], text: "" } }, ["S-DEMO"], []).historicalSelections).toBe(false);
  });
});