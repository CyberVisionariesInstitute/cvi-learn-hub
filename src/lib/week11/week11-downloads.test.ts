import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { createSeedState } from "./engine";
import { computeReadiness } from "./readiness.server";
import { buildExport, buildLabExport, WEEK11_EXPORT_PATHS, zipName } from "./export.server";
import { missions } from "./seed";
import { readFileSync } from "node:fs";

const state = createSeedState();
const learner = { displayName: "Test Student" };
const readiness = computeReadiness(state, learner, []);
const input = { attemptLabel: "attempt ABC123", revision: 1, textRevision: 0, state, learner, evidence: [], readiness };

describe("Week 11 student downloads", () => {
  const z = buildExport(input);
  const files = unzipSync(Buffer.from(z.zipBase64, "base64"));

  it("ZIP contains exactly the documented GitHub paths", () => {
    expect(Object.keys(files).sort()).toEqual([...WEEK11_EXPORT_PATHS].sort());
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
      expect(r.content).toContain("DRAFT — incomplete");
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
