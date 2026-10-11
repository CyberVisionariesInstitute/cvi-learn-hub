import { describe, expect, it } from "vitest";
import { emptyEvidenceRefs, hasEvidenceRefs } from "./evidence-recipes";

describe("Week 11 unchanged evidence selection contract", () => {
  it("keeps the seven existing reference fields", () => {
    expect(emptyEvidenceRefs()).toEqual({ accounts: [], groups: [], tests: [], signins: [], audits: [], tickets: [], historical: [] });
  });
  it("allows a single reference without an explanation or recipe completion", () => {
    expect(hasEvidenceRefs({ ...emptyEvidenceRefs(), accounts: ["ad-alex"] })).toBe(true);
  });
  it("does not allow an empty selection", () => {
    expect(hasEvidenceRefs(emptyEvidenceRefs())).toBe(false);
  });
  it.each(["groups", "tests", "signins", "audits", "tickets", "historical"] as const)("retains support for %s references", (kind) => {
    expect(hasEvidenceRefs({ ...emptyEvidenceRefs(), [kind]: ["record-1"] })).toBe(true);
  });
});