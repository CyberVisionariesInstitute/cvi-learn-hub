import { describe, expect, it } from "vitest";
import { COMPACT_FIELDS, RECORD_FIELDS_LABEL, RECORD_FIELDS_SHOWN, citedFields, isComparisonSubstep, recordFieldsCue, showsLogTable } from "./field-cue";
import { AUDIT_FIELDS, SIGNIN_FIELDS } from "./seed";
import { instructionSteps } from "./instructions";
import { GUIDED_SCREENS, REQUIRED_COUNT } from "./guided-steps";

const cueText = (kind: "signin" | "audit" | "caseFile") => {
  const c = recordFieldsCue(kind);
  return `${c.lead} ${c.label}${c.detail}`;
};

describe("Week 11 record-field cue", () => {
  it("names the control exactly as the table renders it", () => {
    expect(RECORD_FIELDS_LABEL.open).toBe("Show all record fields");
    expect(RECORD_FIELDS_LABEL.close).toBe("Show essential fields");
    for (const kind of ["signin", "audit", "caseFile"] as const) expect(cueText(kind)).toContain(RECORD_FIELDS_LABEL.open);
  });

  it("cites only fields the compact table really hides", () => {
    for (const [kind, all] of [["signin", SIGNIN_FIELDS], ["audit", AUDIT_FIELDS]] as const) {
      const compact = COMPACT_FIELDS[kind];
      for (const field of citedFields(kind)) {
        expect(all).toContain(field);
        expect(compact, `${kind} hides ${field}`).not.toContain(field);
      }
    }
  });

  it("keeps each log's cue to its own fields", () => {
    expect(cueText("signin")).toContain("source IP");
    expect(cueText("signin")).not.toContain("approval ticket");
    expect(cueText("audit")).toContain("approval ticket");
    expect(cueText("audit")).not.toContain("source IP");
    expect(cueText("caseFile")).toContain("Sign-in or Audit log");
  });

  it("says times are UTC fictional dates without claiming they prove a connection", () => {
    for (const kind of ["signin", "audit", "caseFile"] as const) {
      const text = cueText(kind);
      expect(text).toContain("UTC");
      expect(text).toContain("fictional");
      expect(text).toContain("doesn't prove two events are connected");
    }
    expect(RECORD_FIELDS_SHOWN).toContain("time_utc");
  });

  it("never supplies event IDs or conclusions", () => {
    for (const kind of ["signin", "audit", "caseFile"] as const) expect(cueText(kind)).not.toMatch(/\b[SA]\d{3}\b/);
  });

  it("sits only at Case File comparison substeps, not where the log table is already open", () => {
    expect(isComparisonSubstep("M06-06")).toBe(true);
    expect(isComparisonSubstep("M06-07")).toBe(true);
    expect(isComparisonSubstep("M06-09")).toBe(true);
    expect(isComparisonSubstep("M06-10")).toBe(true);
    expect(isComparisonSubstep("M06-11")).toBe(true);
    expect(isComparisonSubstep("M06-08")).toBe(false);
    expect(isComparisonSubstep("M06-01")).toBe(false);
    expect(isComparisonSubstep("M02-06")).toBe(false);
    const corr = instructionSteps.M06.find((s) => s.id === "M06-08")!;
    expect(showsLogTable(corr.links)).toBe(true);
    const cmp = instructionSteps.M06.find((s) => s.id === "M06-10")!;
    expect(showsLogTable(cmp.links)).toBe(false);
  });

  it("still has every cued substep on a required Lab 3 screen", () => {
    const required = GUIDED_SCREENS.slice(0, REQUIRED_COUNT).filter((s) => s.mission === "M06");
    for (const id of ["M06-06", "M06-07", "M06-09", "M06-10", "M06-11"]) {
      expect(required.some((s) => s.subs.some((x) => x.step.id === id)), id).toBe(true);
    }
  });
});
