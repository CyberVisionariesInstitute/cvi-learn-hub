import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { createSeedState } from "./engine";
import { computeReadiness } from "./readiness.server";
import { buildExport, buildLabExport, WEEK11_EXPORT_PATHS, zipName } from "./export.server";
import { missions } from "./seed";
import { readFileSync } from "node:fs";
import { isRequiredQuestion } from "./requirements";

const state = createSeedState();
const learner = { displayName: "Test Student" };
const readiness = computeReadiness(state, learner, []);
const input = { attemptLabel: "attempt ABC123", revision: 1, textRevision: 0, state, learner, evidence: [], readiness };

describe("Week 11 student downloads", () => {
  const z = buildExport(input);
  const files = unzipSync(Buffer.from(z.zipBase64, "base64"));

  it("distinguishes every unanswered optional question from required unanswered work in individual files and ZIP", () => {
    for (const m of missions) {
      const individual = buildLabExport(input, m.key).content;
      const zipped = files[m.exportPath];
      expect(zipped).toBeDefined();
      expect(individual).toBe(strFromU8(zipped ?? new Uint8Array()));
      for (const q of m.questions) {
        const section = individual.split(`### ${q.label}\n\n`)[1]?.split("\n### ")[0];
        expect(section).toBeDefined();
        if (isRequiredQuestion(m.key, q.id)) {
          expect(section).toContain("**Required answer**");
          expect(section).toContain("_Not written yet._");
          expect(section).not.toContain("Optional practice not completed");
        } else {
          expect(section).toContain("**Optional practice**");
          expect(section).toContain("_Optional practice not completed._");
          expect(section?.split("\n## ")[0]).not.toContain("_Not written yet._");
        }
      }
    }
  });

  it("preserves filled optional answers including T501/T504/Azure and starting hypothesis without changing student data", () => {
    const saved = { ...learner, missions: Object.fromEntries(missions.map((m) => [m.key, { answers: Object.fromEntries(m.questions.map((q) => [q.id, `OWN-${m.key}-${q.id}`])) }])) };
    const before = JSON.stringify(saved);
    const zip = unzipSync(Buffer.from(buildExport({ ...input, learner: saved }).zipBase64, "base64"));
    for (const m of missions) {
      const c = buildLabExport({ ...input, learner: saved }, m.key).content;
      expect(c).toBe(strFromU8(zip[m.exportPath] ?? new Uint8Array()));
      for (const q of m.questions) expect(c).toContain(`OWN-${m.key}-${q.id}`);
      expect(c).not.toContain("Optional practice not completed");
    }
    expect(JSON.stringify(saved)).toBe(before);
  });

  it("retains all six literal legacy Markdown paths", () => {
    expect(missions.map((m) => m.exportPath)).toEqual([
      "week-11/labs/lab-01-identity-directory.md", "week-11/labs/lab-02-authentication-vs-authorization.md",
      "week-11/labs/lab-03-build-and-manage-directory.md", "week-11/labs/lab-04-least-privilege-challenge.md",
      "week-11/labs/lab-05-joiner-mover-leaver.md", "week-11/labs/lab-06-identity-investigation-case-file.md",
    ]);
  });

  it("optional blanks never turn a required-ready export into DRAFT", () => {
    const ready = input.readiness.map((r) => ({ ...r, ready: true, missing: [] }));
    const result = buildExport({ ...input, readiness: ready });
    expect(result.draft).toBe(false);
    expect(result.filename).toBe("week-11-portfolio.zip");
    for (const key of ["M01", "M03", "M04"] as const) expect(buildLabExport(input, key).draft).toBe(false);
  });

  it("ZIP contains exactly the documented GitHub paths", () => {
    expect(Object.keys(files).sort()).toEqual([...WEEK11_EXPORT_PATHS].sort());
  });

  it("preserves twelve numeric section keys in order and exports all optional findings and the existing chain", () => {
    const report = { sections: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i + 1), `SECTION-VALUE-${i + 1}-END`])), limitations: "LIMITATIONS-VALUE", liveChain: "LA-FICTION AT-FICTION LS-FICTION" };
    const findings = Array.from({ length: 3 }, (_, i) => ({ key: `F${i + 1}`, title: `FINDING-VALUE-${i + 1}`, refs: [], observation: "", hypothesis: "", conclusion: "", uncertainty: "", nextAction: "", priority: "" as const, rationale: "" }));
    const saved = { ...learner, report, findings, comparison: { refs: ["S002"], text: "COMPARISON-VALUE" } };
    const before = JSON.stringify(saved);
    const content = buildLabExport({ ...input, learner: saved }, "M06").content;
    const positions = Array.from({ length: 12 }, (_, i) => content.indexOf(`SECTION-VALUE-${i + 1}-END`));
    expect(positions.every((n) => n >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const f of findings) expect(content).toContain(f.title);
    expect(content).toContain(report.liveChain);
    expect(content).toContain(report.limitations);
    expect(content).toContain(saved.comparison.text);
    expect(JSON.stringify(saved)).toBe(before);
  });

  it("incomplete work is DRAFT with a deterministic name", () => {
    expect(z.draft).toBe(true);
    expect(z.filename).toBe("week-11-portfolio-DRAFT.zip");
    expect(zipName(false)).toBe("week-11-portfolio.zip");
  });

  it("single-lab download is byte-identical to the ZIP copy and lists missing items", () => {
    for (const m of missions) {
      const r = buildLabExport(input, m.key);
      expect(r.filename).toBe(m.exportPath.split("/").pop());
      expect(r.content).toBe(strFromU8(files[m.exportPath]!));
      if (["M01", "M03", "M04"].includes(m.key)) expect(r.content).toContain("Optional practice");
      else expect(r.content).toContain("DRAFT — incomplete");
    }
  });

  it("Lab 06 remains the Case File with Week 12 handoff and no executive-summary requirement", () => {
    const c = buildLabExport(input, "M06").content;
    expect(c).toContain("IAM Investigation Case File (Portfolio Deliverable 4)");
    expect(c).toContain("Week 12 uses it");
    expect(c).not.toMatch(/##+ .*Executive Summary/i);
  });

  it("no answer-key or readiness-rule text in any export file", () => {
    const all = Object.values(files).map((f) => strFromU8(f)).join("\n");
    expect(all).not.toMatch(/instructor[- ]key|answer key|expectedState|predicate/i);
  });

  it("student download UI never imports server-only modules", () => {
    const src = readFileSync("src/components/week11/DownloadsView.tsx", "utf8");
    expect(src).not.toMatch(/\.server/);
  });
});
