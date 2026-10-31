/**
 * Presentation-only starting ticks for required evidence on the guided path.
 * Picks the student's OWN most recent records for the accounts named in the
 * task (filtering by account/resource/action only, never by expected result).
 * Students review, untick, explain and save themselves; nothing is captured here.
 */
import type { SimState } from "./engine";
import type { EvidenceKind } from "./evidence-recipes";

type Refs = Partial<Record<EvidenceKind, string[]>>;

const lastTest = (s: SimState, acct: string, res: string, action: string) =>
  [...s.tests].reverse().find((t) => t.mode === "current-access" && t.account === acct && t.resource === res && t.action === action)?.id;
const lastSignin = (s: SimState, acct: string) => [...s.signins].reverse().find((x) => x.account === acct)?.id;
const audits = (s: SimState, targets: string[], max = 4) =>
  s.audits.filter((a) => a.activity !== "access_test" && targets.includes(a.target)).slice(-max).map((a) => a.id);
const ids = (xs: (string | undefined)[]) => xs.filter((x): x is string => !!x);

export function suggestRefs(slot: string, s: SimState): Refs | undefined {
  switch (slot) {
    case "E03": return { signins: ids([lastSignin(s, "cl-blair")]), tests: ids([lastTest(s, "cl-blair", "R-CASE", "read")]) };
    case "E04": return { audits: audits(s, ["cl-blair", "GC-READ", "GC-JUN"], 2), tests: ids([lastTest(s, "cl-blair", "R-CASE", "read"), lastTest(s, "cl-blair", "R-CASE", "update")]) };
    case "E13": return { audits: audits(s, ["cl-alex", "P01"]), tests: ids([lastTest(s, "cl-alex", "R-QUEUE", "read"), lastTest(s, "cl-alex", "R-AUD", "export")]) };
    case "E14": return { audits: audits(s, ["cl-finley"]), signins: ids([lastSignin(s, "cl-finley")]) };
    default: return undefined;
  }
}
