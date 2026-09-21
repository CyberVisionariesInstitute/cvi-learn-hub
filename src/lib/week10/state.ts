/**
 * Week 10 learner state.
 *
 * Persistence is local to the browser. The Demo Lab has no per-learner
 * coursework table, so this module never claims cross-device sync: the UI
 * says "Saved on this browser/device". Storage keys are namespaced by week
 * and by identity when a signed-in identity is known, so an instructor
 * demonstration and a student's own work can never be mixed.
 */

import { assets, rooms, threatEvents } from "./case-packet";

export const WEEK10_SCHEMA = "cvi.week10.v1";

export type StudyMode = "guided" | "independent";

export interface ScenarioRow {
  /** Stable ID carried from Lab 1 into Lab 2 and into every export. */
  id: string;
  assetId: string;
  evidenceIds: string[];
  threat: string;
  vulnerability: string;
  consequence: string;
  cia: { confidentiality: boolean; integrity: boolean; availability: boolean };
  unknown: string;
}

export interface RiskRating {
  /** Matches ScenarioRow.id. */
  scenarioId: string;
  likelihood: 0 | 1 | 2 | 3;
  likelihoodWhy: string;
  impact: 0 | 1 | 2 | 3;
  impactWhy: string;
}

export interface ControlPlan {
  scenarioId: string;
  control: string;
  howItHelps: string;
  residual: string;
}

export interface Week10State {
  schema: typeof WEEK10_SCHEMA;
  savedAt: string;
  mode: StudyMode;
  /** Evidence IDs the learner added to their findings. */
  findings: string[];
  /** Free-text notebook, learner-owned. */
  notebook: string;
  /** Lab 1 */
  scenarios: ScenarioRow[];
  email: {
    signs: [string, string, string];
    safeStep: string;
    proofNote: string;
  };
  /** Lab 2 */
  ratings: RiskRating[];
  priorities: string[];
  priorityWhy: string;
  controls: ControlPlan[];
  briefing: string;
  /** Rooms the learner has opened at least once (progress only). */
  visitedRooms: string[];
}

export function emptyScenario(id: string, assetId: string): ScenarioRow {
  return {
    id,
    assetId,
    evidenceIds: [],
    threat: "",
    vulnerability: "",
    consequence: "",
    cia: { confidentiality: false, integrity: false, availability: false },
    unknown: "",
  };
}

export function createInitialState(mode: StudyMode = "guided"): Week10State {
  const scenarios = threatEvents.map((t, i) =>
    emptyScenario(`SC-${String(i + 1).padStart(2, "0")}`, t.assetId),
  );
  return {
    schema: WEEK10_SCHEMA,
    savedAt: new Date().toISOString(),
    mode,
    findings: [],
    notebook: "",
    scenarios,
    email: { signs: ["", "", ""], safeStep: "", proofNote: "" },
    ratings: scenarios.map((s) => ({
      scenarioId: s.id,
      likelihood: 0,
      likelihoodWhy: "",
      impact: 0,
      impactWhy: "",
    })),
    priorities: [],
    priorityWhy: "",
    controls: [],
    briefing: "",
    visitedRooms: [],
  };
}

/* ------------------------------------------------------------------ */
/* Carry-over: ratings and controls follow scenario IDs                */
/* ------------------------------------------------------------------ */

/**
 * Keeps Lab 2 aligned with Lab 1 by stable ID. Editing a Lab 1 row never
 * clears the learner's rating or control writing; removing a row removes its
 * downstream entries so exports cannot go stale.
 */
export function reconcile(state: Week10State): Week10State {
  const ids = state.scenarios.map((s) => s.id);
  const ratings = ids.map(
    (id) =>
      state.ratings.find((r) => r.scenarioId === id) ?? {
        scenarioId: id,
        likelihood: 0 as const,
        likelihoodWhy: "",
        impact: 0 as const,
        impactWhy: "",
      },
  );
  return {
    ...state,
    ratings,
    controls: state.controls.filter((c) => ids.includes(c.scenarioId)),
    priorities: state.priorities.filter((p) => ids.includes(p)),
  };
}

export function score(rating: RiskRating): number {
  return rating.likelihood * rating.impact;
}

export type Band = "unrated" | "low" | "medium" | "high";

export function band(value: number): Band {
  if (value <= 0) return "unrated";
  if (value <= 2) return "low";
  if (value <= 4) return "medium";
  return "high";
}

export const bandLabels: Record<Band, string> = {
  unrated: "Not rated yet",
  low: "Low (1–2)",
  medium: "Medium (3–4)",
  high: "High (6–9)",
};

export const likelihoodRubric = [
  {
    value: 1,
    label: "1 — Low",
    text: "Little exposure, few or no matching weaknesses in the evidence, and protections already in place that would usually stop it.",
  },
  {
    value: 2,
    label: "2 — Medium",
    text: "There is real exposure and at least one weakness in the evidence, but something partial stands in the way.",
  },
  {
    value: 3,
    label: "3 — High",
    text: "The exposure is routine, the weakness is present in the evidence, and nothing found so far would reliably stop it.",
  },
];

export const impactRubric = [
  {
    value: 1,
    label: "1 — Low",
    text: "Noticeable nuisance. Clinic operations continue, sensitive data is not affected, recovery is quick.",
  },
  {
    value: 2,
    label: "2 — Medium",
    text: "Part of the clinic's day is disrupted, or limited sensitive data is involved, or recovery takes real effort.",
  },
  {
    value: 3,
    label: "3 — High",
    text: "Clinic operations stop or patient data is exposed or lost, and recovery is slow, uncertain, or untested.",
  },
];

/* ------------------------------------------------------------------ */
/* Completion checklist                                                */
/* ------------------------------------------------------------------ */

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  lab: 1 | 2;
}

const filled = (s: string) => s.trim().length > 0;

/**
 * Unique, valid room IDs the learner has actually opened. Guards against a
 * duplicated or stale ID inflating the count in a restored backup.
 */
export function visitedRoomIds(state: Week10State): string[] {
  return rooms.map((r) => r.id).filter((id) => state.visitedRooms.includes(id));
}

export interface ControlStatus {
  control: boolean;
  howItHelps: boolean;
  residual: boolean;
  complete: boolean;
}

/** Per-scenario control completeness: a typed control alone is not a recommendation. */
export function controlStatus(state: Week10State, scenarioId: string): ControlStatus {
  const c = state.controls.find((x) => x.scenarioId === scenarioId);
  const control = Boolean(c && filled(c.control));
  const howItHelps = Boolean(c && filled(c.howItHelps));
  const residual = Boolean(c && filled(c.residual));
  return { control, howItHelps, residual, complete: control && howItHelps && residual };
}

export type RatingStatus = "unrated" | "partly-rated" | "rated-without-reasons" | "justified";

/** Distinguishes an incomplete rating from a fully justified one. */
export function ratingStatus(state: Week10State, scenarioId: string): RatingStatus {
  const r = state.ratings.find((x) => x.scenarioId === scenarioId);
  if (!r || (!r.likelihood && !r.impact)) return "unrated";
  if (!r.likelihood || !r.impact) return "partly-rated";
  return filled(r.likelihoodWhy) && filled(r.impactWhy) ? "justified" : "rated-without-reasons";
}

export function checklist(state: Week10State): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  items.push({
    id: "rooms",
    lab: 1,
    label: `All ${rooms.length} clinic rooms opened (the walkthrough this lab asks for)`,
    done: visitedRoomIds(state).length === rooms.length,
  });
  items.push({
    id: "findings",
    lab: 1,
    label: "At least five pieces of evidence added to your findings",
    done: state.findings.length >= 5,
  });
  state.scenarios.forEach((s, i) => {
    const complete =
      s.evidenceIds.length > 0 &&
      filled(s.threat) &&
      filled(s.vulnerability) &&
      filled(s.consequence) &&
      (s.cia.confidentiality || s.cia.integrity || s.cia.availability);
    items.push({
      id: `scenario-${s.id}`,
      lab: 1,
      label: `Scenario ${i + 1} (${s.id}): evidence, threat, vulnerability, consequence and at least one CIA concern`,
      done: complete,
    });
  });
  items.push({
    id: "email",
    lab: 1,
    label: "Email analysis: three warning signs and a safe reporting step",
    done: state.email.signs.every(filled) && filled(state.email.safeStep),
  });
  state.scenarios.forEach((s, i) => {
    const r = state.ratings.find((x) => x.scenarioId === s.id);
    items.push({
      id: `rating-${s.id}`,
      lab: 2,
      label: `Risk ${i + 1} (${s.id}): likelihood and impact rated, both with a reason`,
      done: Boolean(
        r && r.likelihood > 0 && r.impact > 0 && filled(r.likelihoodWhy) && filled(r.impactWhy),
      ),
    });
  });
  items.push({
    id: "priorities",
    lab: 2,
    label: "Two priority risks chosen, with your reasoning",
    done: state.priorities.length >= 2 && filled(state.priorityWhy),
  });
  items.push({
    id: "controls",
    lab: 2,
    label: "Each priority risk has a control, how it helps, and remaining risk described",
    done:
      state.priorities.length >= 2 &&
      state.priorities.every((id) => {
        const c = state.controls.find((x) => x.scenarioId === id);
        return Boolean(c && filled(c.control) && filled(c.howItHelps) && filled(c.residual));
      }),
  });
  items.push({
    id: "briefing",
    lab: 2,
    label: "Owner briefing written (about 100–150 words is the guide, not a limit)",
    done: filled(state.briefing),
  });
  return items;
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

export type Identity = { kind: "student" | "instructor-demo"; id: string };

export function storageKey(identity: Identity): string {
  return `${WEEK10_SCHEMA}:${identity.kind}:${identity.id}`;
}

export function load(identity: Identity): Week10State | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(identity));
    if (!raw) return null;
    const parsed = validate(JSON.parse(raw));
    return parsed.ok ? reconcile(parsed.state) : null;
  } catch {
    return null;
  }
}

export function save(identity: Identity, state: Week10State): void {
  if (typeof window === "undefined") return;
  const next = { ...state, savedAt: new Date().toISOString() };
  window.localStorage.setItem(storageKey(identity), JSON.stringify(next));
}

export function clear(identity: Identity): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(identity));
}

export type ValidationResult =
  | { ok: true; state: Week10State }
  | { ok: false; problems: string[] };

/** Schema validation for restore, written to explain itself to a beginner. */
export function validate(input: unknown): ValidationResult {
  const problems: string[] = [];
  if (typeof input !== "object" || input === null) {
    return { ok: false, problems: ["This file does not contain saved Week 10 work."] };
  }
  const raw = input as Record<string, unknown>;
  if (raw['schema'] !== WEEK10_SCHEMA) {
    problems.push(
      `This backup is labelled "${String(raw['schema'] ?? "nothing")}" but this page expects "${WEEK10_SCHEMA}".`,
    );
  }
  if (!Array.isArray(raw['scenarios'])) problems.push("The scenario list is missing.");
  if (!Array.isArray(raw['findings'])) problems.push("The findings list is missing.");
  if (problems.length) return { ok: false, problems };

  const base = createInitialState();
  const assetIds = assets.map((a) => a.id);
  const scenarios = (raw['scenarios'] as unknown[])
    .map((s, i) => {
      const r = (s ?? {}) as Record<string, unknown>;
      const id = typeof r['id'] === "string" ? r['id'] : `SC-${String(i + 1).padStart(2, "0")}`;
      const assetId =
        typeof r['assetId'] === "string" && assetIds.includes(r['assetId'])
          ? r['assetId']
          : assetIds[0]!;
      const cia = (r['cia'] ?? {}) as Record<string, unknown>;
      return {
        id,
        assetId,
        evidenceIds: Array.isArray(r['evidenceIds'])
          ? (r['evidenceIds'] as unknown[]).filter((x): x is string => typeof x === "string")
          : [],
        threat: str(r['threat']),
        vulnerability: str(r['vulnerability']),
        consequence: str(r['consequence']),
        cia: {
          confidentiality: cia['confidentiality'] === true,
          integrity: cia['integrity'] === true,
          availability: cia['availability'] === true,
        },
        unknown: str(r['unknown']),
      } satisfies ScenarioRow;
    })
    .slice(0, 12);

  const emailRaw = (raw['email'] ?? {}) as Record<string, unknown>;
  const signsRaw = Array.isArray(emailRaw['signs']) ? (emailRaw['signs'] as unknown[]) : [];

  const state: Week10State = reconcile({
    ...base,
    schema: WEEK10_SCHEMA,
    savedAt: str(raw['savedAt']) || new Date().toISOString(),
    mode: raw['mode'] === "independent" ? "independent" : "guided",
    findings: (raw['findings'] as unknown[]).filter((x): x is string => typeof x === "string"),
    notebook: str(raw['notebook']),
    scenarios: scenarios.length ? scenarios : base.scenarios,
    email: {
      signs: [str(signsRaw[0]), str(signsRaw[1]), str(signsRaw[2])],
      safeStep: str(emailRaw['safeStep']),
      proofNote: str(emailRaw['proofNote']),
    },
    ratings: Array.isArray(raw['ratings'])
      ? (raw['ratings'] as unknown[]).map((x) => {
          const r = (x ?? {}) as Record<string, unknown>;
          return {
            scenarioId: str(r['scenarioId']),
            likelihood: rate(r['likelihood']),
            likelihoodWhy: str(r['likelihoodWhy']),
            impact: rate(r['impact']),
            impactWhy: str(r['impactWhy']),
          };
        })
      : base.ratings,
    priorities: Array.isArray(raw['priorities'])
      ? (raw['priorities'] as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    priorityWhy: str(raw['priorityWhy']),
    controls: Array.isArray(raw['controls'])
      ? (raw['controls'] as unknown[]).map((x) => {
          const c = (x ?? {}) as Record<string, unknown>;
          return {
            scenarioId: str(c['scenarioId']),
            control: str(c['control']),
            howItHelps: str(c['howItHelps']),
            residual: str(c['residual']),
          };
        })
      : [],
    briefing: str(raw['briefing']),
    visitedRooms: Array.isArray(raw['visitedRooms'])
      ? (raw['visitedRooms'] as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
  });
  return { ok: true, state };
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function rate(value: unknown): 0 | 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3 ? value : 0;
}
