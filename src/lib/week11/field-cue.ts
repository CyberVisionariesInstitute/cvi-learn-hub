/**
 * Week 11 record-field cue — presentation only.
 * The compact guided log table hides timestamps and several investigation fields
 * behind one control, so a learner comparing events has to be told that control
 * exists. These strings name the real control, cite only fields that table
 * actually hides, and never add a task, name expected records, or decide
 * readiness.
 */
import type { NavView } from "./guidance";

/** Exact labels of the record-table control — the cue and the button share them. */
export const RECORD_FIELDS_LABEL = { open: "Show all record fields", close: "Show essential fields" } as const;

/** Columns the compact guided table keeps; everything else stays behind the control. */
export const COMPACT_FIELDS: Record<"signin" | "audit", readonly string[]> = {
  signin: ["event_id", "user", "outcome", "reason", "correlation_id"],
  audit: ["event_id", "activity", "target", "result", "correlation_id"],
};

/** Plain words for hidden fields, each tied to the real field names it stands for. */
const HIDDEN: Record<"signin" | "audit", { plain: string; fields: string[] }[]> = {
  signin: [
    { plain: "the app", fields: ["application"] },
    { plain: "the source IP", fields: ["source_ip"] },
    { plain: "the device", fields: ["device_id"] },
    { plain: "the scenario location", fields: ["scenario_location"] },
  ],
  audit: [
    { plain: "who acted", fields: ["actor"] },
    { plain: "what changed before and after", fields: ["before_value", "after_value"] },
    { plain: "the approval ticket", fields: ["approval_ticket"] },
  ],
};

/** Every field the cue cites, for the accuracy test. */
export function citedFields(kind: "signin" | "audit") {
  return ["time_utc", ...HIDDEN[kind].flatMap((h) => h.fields)];
}

const list = (items: string[]) => (items.length < 2 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

const ORDER = "Times are UTC and these dates are fictional scenario time. Use the timestamps to check the order, then compare the details relevant to your finding — a close time alone doesn't prove two events are connected.";

export type CueKind = "signin" | "audit" | "caseFile";

/**
 * The cue itself, split so the control label can be highlighted.
 * `caseFile` points the learner at the logs instead of the table in front of them.
 */
export function recordFieldsCue(kind: CueKind) {
  const where = kind === "caseFile" ? " in the Sign-in or Audit log" : "";
  const hidden = kind === "caseFile" ? "its other details" : list(HIDDEN[kind].map((h) => h.plain));
  return {
    lead: "Comparing events?",
    label: RECORD_FIELDS_LABEL.open,
    detail: `${where} to see when each event happened (time_utc) and ${hidden}. ${ORDER}`,
  };
}

/** Kept short: shown once every column is already on screen. */
export const RECORD_FIELDS_SHOWN = "Every field is showing — use time_utc to check the order, then compare the details relevant to your finding.";

/**
 * Case File substeps where the learner compares or correlates historical events.
 * The correlation search itself already opens the log table, whose own cue covers it.
 */
const COMPARISON_SUBSTEPS = new Set(["M06-06", "M06-07", "M06-09", "M06-10", "M06-11"]);
export const isComparisonSubstep = (id: string) => COMPARISON_SUBSTEPS.has(id);

/** True when this step's own tool is a log table, so the table cue already shows. */
export function showsLogTable(links: { view: NavView }[]) {
  return links.some((l) => l.view === "signins" || l.view === "audit");
}
