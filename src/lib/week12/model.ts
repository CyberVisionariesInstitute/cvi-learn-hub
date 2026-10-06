/**
 * Week 12 Communications Capstone — client-safe model.
 * Pure types and checks only. No Week 11 answer keys or readiness predicates
 * live here: Week 12 checks only look at the student's own writing and the
 * frozen, student-safe snapshot of their Week 11 case file.
 */

export const WEEK11_CASE_FILE_PATH = "../week-11/labs/lab-06-identity-investigation-case-file.md";
export const WEEK11_EVIDENCE_INDEX_PATH = "../week-11/labs/evidence/week11-evidence-index.md";

export type ExecOption = "" | "written" | "video";
export type ClassLabel = "fact" | "finding" | "evidence" | "interpretation" | "unknown" | "recommendation";
export const CLASS_LABELS: { value: ClassLabel; label: string; help: string }[] = [
  { value: "fact", label: "Fact", help: "Directly recorded in a log or the directory — no judgement added." },
  { value: "evidence", label: "Evidence", help: "A specific record you captured or cite (EV-…, S004, A002)." },
  { value: "finding", label: "Finding", help: "A conclusion your evidence supports." },
  { value: "interpretation", label: "Interpretation", help: "What you think it means — reasonable, but not proven." },
  { value: "unknown", label: "Unknown", help: "Something the evidence cannot answer yet." },
  { value: "recommendation", label: "Recommendation", help: "An action someone should take next." },
];

export interface SourceFinding {
  key: string; title: string; refs: string[]; observation: string; hypothesis: string;
  conclusion: string; uncertainty: string; nextAction: string; priority: string; rationale: string;
}

/** Frozen, student-safe copy of the student's Week 11 Lab 06 case file. */
export interface SourceSnapshot {
  version: 1;
  sourceShortId: string;
  sourceStatus: "active" | "archived";
  sourceArchivedAt: string | null;
  studentName: string;
  w11TextRevision: number;
  w11StateRevision: number;
  sourceComplete: boolean;
  /** Student-facing Lab 06 missing items (the same list Week 11 already shows the student). */
  sourceMissing: string[];
  findings: SourceFinding[];
  comparison: { refs: string[]; text: string };
  report: { sections: { n: number; title: string; text: string }[]; limitations: string; liveChain: string };
  captions: Record<string, string>;
  evidence: { key: string; slot: string; mission: string; title: string; capturedRevision: number; contentHash: string }[];
  historicalEventIds: string[];
  correlationIds: string[];
}

export interface W12Finding { key: string; sourceFindingKey: string; statement: string; evidenceRefs: string[]; confidence: "" | "confirmed" | "likely" | "possible"; uncertainty: string }
export interface W12Recommendation { key: string; action: string; owner: string; why: string; priority: "" | "high" | "medium" | "low"; timeframe: string; linkedFindings: string[]; successMeasure: string }
export interface W12Report { title: string; analyst: string; purpose: string; scope: string; evidenceReviewed: string; timeline: string; impact: string; limitations: string; conclusion: string }
export interface W12Written { whatHappened: string; whyMatters: string; whatFound: string; nextSteps: string; uncertain: string }
export interface W12Video { url: string; platform: string; duration: string; accessChecked: boolean; outline: string; reflection: string }

export interface W12Content {
  classify: Record<string, ClassLabel>;
  findings: W12Finding[];
  report: W12Report;
  recommendations: W12Recommendation[];
  written: W12Written;
  video: W12Video;
  /** flagId → student's note (evidence citation or reason the wording is supported). */
  acks: Record<string, string>;
}

export const emptyReport = (): W12Report => ({ title: "", analyst: "", purpose: "", scope: "", evidenceReviewed: "", timeline: "", impact: "", limitations: "", conclusion: "" });
export const emptyWritten = (): W12Written => ({ whatHappened: "", whyMatters: "", whatFound: "", nextSteps: "", uncertain: "" });
export const emptyVideo = (): W12Video => ({ url: "", platform: "", duration: "", accessChecked: false, outline: "", reflection: "" });

export function normalizeContent(c: Partial<W12Content> | null | undefined): W12Content {
  return {
    classify: c?.classify ?? {},
    findings: c?.findings ?? [],
    report: { ...emptyReport(), ...(c?.report ?? {}) },
    recommendations: c?.recommendations ?? [],
    written: { ...emptyWritten(), ...(c?.written ?? {}) },
    video: { ...emptyVideo(), ...(c?.video ?? {}) },
    acks: c?.acks ?? {},
  };
}

/** Starting content prefilled from the student's own Week 11 writing (to transform, not re-investigate). */
export function seedContent(s: SourceSnapshot): W12Content {
  const c = normalizeContent({});
  c.report.analyst = s.studentName;
  c.report.title = "Cloud Heights Identity Investigation — Technical Incident Report";
  c.report.limitations = s.report.limitations;
  c.findings = s.findings.slice(0, 10).map((f, i) => ({
    key: `RF${i + 1}`, sourceFindingKey: f.key, statement: f.conclusion || f.observation, evidenceRefs: [...f.refs],
    confidence: "", uncertainty: f.uncertainty,
  }));
  return c;
}

/* --------------------------- Classification items -------------------------- */

export interface ClassItem { id: string; source: string; text: string }
export function classItems(s: SourceSnapshot): ClassItem[] {
  const out: ClassItem[] = [];
  s.findings.forEach((f) => {
    const lbl = `${f.key}${f.title ? ` · ${f.title}` : ""}`;
    ([["observation", "Observation"], ["hypothesis", "Hypothesis"], ["conclusion", "Conclusion"], ["uncertainty", "Uncertainty"], ["nextAction", "Next action"]] as const)
      .forEach(([k, name]) => { if (f[k]?.trim()) out.push({ id: `${f.key}:${k}`, source: `${lbl} — ${name}`, text: f[k].trim() }); });
  });
  if (s.comparison.text.trim()) out.push({ id: "comparison", source: "Benign/ambiguous comparison", text: s.comparison.text.trim() });
  if (s.report.limitations.trim()) out.push({ id: "limitations", source: "Limitations", text: s.report.limitations.trim() });
  if (s.report.liveChain.trim()) out.push({ id: "liveChain", source: "Live simulator audit chain", text: s.report.liveChain.trim() });
  return out;
}

/* ------------------------------ Evidence refs ------------------------------ */

export function validRefs(s: SourceSnapshot): Set<string> {
  return new Set([...s.evidence.map((e) => e.key), ...s.historicalEventIds, ...s.correlationIds]);
}
export const parseRefs = (text: string) => [...new Set(text.split(/[\s,;]+/).map((x) => x.trim().toUpperCase()).filter(Boolean))];

/* --------------------------- Language coaching ----------------------------- */

export const COACH_TERMS = ["attacker", "hacked", "hacker", "compromised", "compromise", "breach", "breached", "malicious", "stolen", "exfiltrated", "exfiltration", "intruder", "proven"] as const;

export interface CoachFlag { id: string; field: string; fieldLabel: string; term: string; reviewed: boolean }

/** Text fields that are checked, with labels students recognise. */
export function coachFields(c: W12Content, opt: ExecOption): { field: string; label: string; text: string }[] {
  const f: { field: string; label: string; text: string }[] = [];
  c.findings.forEach((x) => f.push({ field: `finding:${x.key}`, label: `Finding ${x.key}`, text: x.statement }));
  ([["purpose", "Purpose"], ["timeline", "Timeline"], ["impact", "Impact / risk"], ["conclusion", "Conclusion"]] as const)
    .forEach(([k, l]) => f.push({ field: `report:${k}`, label: `Report — ${l}`, text: c.report[k] }));
  if (opt === "written") (Object.keys(c.written) as (keyof W12Written)[]).forEach((k) => f.push({ field: `written:${k}`, label: `Executive summary — ${k}`, text: c.written[k] }));
  if (opt === "video") { f.push({ field: "video:outline", label: "Video outline", text: c.video.outline }); }
  return f;
}

export function coachFlags(c: W12Content, opt: ExecOption): CoachFlag[] {
  const flags: CoachFlag[] = [];
  for (const { field, label, text } of coachFields(c, opt)) {
    const lower = (text ?? "").toLowerCase();
    for (const term of COACH_TERMS) {
      if (new RegExp(`\\b${term}\\b`).test(lower)) {
        const id = `${field}|${term}`;
        flags.push({ id, field, fieldLabel: label, term, reviewed: Boolean(c.acks[id]?.trim()) });
      }
    }
  }
  return flags;
}

/* ------------------------------ Recommendations ---------------------------- */

const VAGUE = [/^improve (security|access|things)/i, /^monitor (the )?logs?\.?$/i, /^be more careful/i, /^review (access|permissions)\.?$/i, /^train (users|staff)\.?$/i, /^fix (it|this|the issue)/i];
export function recommendationIssues(r: W12Recommendation, findingKeys: string[]): string[] {
  const m: string[] = [];
  const a = r.action.trim();
  if (a.length < 15) m.push("Describe the action in a full sentence.");
  else if (VAGUE.some((re) => re.test(a))) m.push("Too vague — say exactly what changes, on which account/group/control.");
  if (!r.owner.trim()) m.push("Who owns it?");
  if (!r.why.trim()) m.push("Why (which risk it reduces)?");
  if (!r.priority) m.push("Priority.");
  if (!r.timeframe.trim()) m.push("Timeframe.");
  if (!r.linkedFindings.some((k) => findingKeys.includes(k))) m.push("Link at least one finding.");
  if (!r.successMeasure.trim()) m.push("How will you know it worked (success measure)?");
  return m;
}

/* ------------------------------ Executive comms ---------------------------- */

export const WRITTEN_TARGET = { min: 250, max: 400, softMin: 225, softMax: 440 };
export const VIDEO_TARGET = { minSec: 120, maxSec: 180, softMin: 105, softMax: 195 };

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const writtenWords = (w: W12Written) => wordCount([w.whatHappened, w.whyMatters, w.whatFound, w.nextSteps, w.uncertain].join(" "));

export function validateVideoUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return "Add the link to your video.";
  let p: URL;
  try { p = new URL(u); } catch { return "That isn't a valid web link."; }
  if (p.protocol !== "https:") return "The link must start with https://.";
  if (!p.hostname.includes(".")) return "The link needs a real website address.";
  return null;
}

/** Accepts "2:30", "2m 30s", "150", "2.5 min" → seconds. */
export function parseDuration(s: string): number | null {
  const t = s.trim().toLowerCase();
  if (!t) return null;
  let m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  m = /^(\d+(?:\.\d+)?)\s*(m|min|mins|minutes)\s*(?:(\d+)\s*(s|sec|secs|seconds)?)?$/.exec(t);
  if (m) return Math.round(Number(m[1]) * 60) + (m[3] ? Number(m[3]) : 0);
  m = /^(\d+)\s*(s|sec|secs|seconds)?$/.exec(t);
  if (m) return Number(m[1]);
  return null;
}

export function execMissing(c: W12Content, opt: ExecOption): string[] {
  if (!opt) return ["Choose Written Executive Summary or Video Executive Briefing."];
  const m: string[] = [];
  if (opt === "written") {
    const w = c.written;
    if (!w.whatHappened.trim()) m.push("What happened?");
    if (!w.whyMatters.trim()) m.push("Why does it matter?");
    if (!w.whatFound.trim()) m.push("What did we find?");
    if (!w.nextSteps.trim()) m.push("What should happen next?");
    const n = writtenWords(w);
    if (n < WRITTEN_TARGET.softMin || n > WRITTEN_TARGET.softMax) m.push(`About ${WRITTEN_TARGET.min}–${WRITTEN_TARGET.max} words (now ${n}).`);
  } else {
    const v = c.video;
    const u = validateVideoUrl(v.url); if (u) m.push(u);
    if (!v.platform.trim()) m.push("Platform (for example YouTube unlisted, Google Drive, Loom).");
    const d = parseDuration(v.duration);
    if (d === null) m.push("Duration (for example 2:30).");
    else if (d < VIDEO_TARGET.softMin || d > VIDEO_TARGET.softMax) m.push(`About 2–3 minutes (now ${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}).`);
    if (!v.accessChecked) m.push("Confirm you opened the link signed out / in a private window and it plays.");
    if (v.outline.split("\n").filter((l) => l.trim()).length < 3) m.push("Outline or speaker notes — at least 3 bullet lines.");
    if (wordCount(v.reflection) < 20) m.push("Short reflection (about 2–4 sentences) on how you adapted it for leadership.");
  }
  return m;
}

/* ---------------------------------- QA ------------------------------------- */

export interface QACheck { id: string; label: string; ok: boolean; missing: string[]; stage: number }

const REPORT_FIELDS: [keyof W12Report, string][] = [
  ["title", "Report title"], ["purpose", "Purpose / incident context"], ["scope", "Scope"], ["evidenceReviewed", "Evidence reviewed"],
  ["timeline", "Timeline"], ["impact", "Impact / risk"], ["conclusion", "Conclusion"],
];

/**
 * Final readiness. Inputs are only the snapshot, the student's writing and the
 * chosen option. Volunteer status is intentionally not an input.
 */
export function computeQA(snap: SourceSnapshot, raw: W12Content, opt: ExecOption): { checks: QACheck[]; ready: boolean } {
  const c = normalizeContent(raw);
  const refs = validRefs(snap);
  const linked = c.findings.filter((f) => f.statement.trim().length >= 20 && f.evidenceRefs.some((r) => refs.has(r)));
  const flags = coachFlags(c, opt);
  const keys = c.findings.map((f) => f.key);
  const goodRecs = c.recommendations.filter((r) => recommendationIssues(r, keys).length === 0);
  const badRefs = [...new Set(c.findings.flatMap((f) => f.evidenceRefs).filter((r) => !refs.has(r)))];
  const checks: QACheck[] = [
    { id: "source", stage: 1, label: "Week 11 Lab 06 source is complete", ok: snap.sourceComplete, missing: snap.sourceComplete ? [] : ["DRAFT SOURCE — finish these in Week 11 Lab 06, then use Refresh from Week 11:", ...snap.sourceMissing] },
    { id: "name", stage: 3, label: "Your name is on the report", ok: Boolean(c.report.analyst.trim()), missing: c.report.analyst.trim() ? [] : ["Add your name as analyst."] },
    { id: "sections", stage: 3, label: "Report sections present", ok: REPORT_FIELDS.every(([k]) => c.report[k].trim().length >= (k === "title" ? 5 : 20)), missing: REPORT_FIELDS.filter(([k]) => c.report[k].trim().length < (k === "title" ? 5 : 20)).map(([, l]) => l) },
    { id: "findings", stage: 2, label: "At least two evidence-linked findings", ok: linked.length >= 2, missing: [...(linked.length >= 2 ? [] : [`${linked.length} of 2 findings have a statement and a valid evidence/event reference.`]), ...(badRefs.length ? [`These references aren't in your Week 11 source: ${badRefs.join(", ")}`] : [])] },
    { id: "language", stage: 2, label: "High-certainty wording reviewed", ok: flags.every((f) => f.reviewed), missing: flags.filter((f) => !f.reviewed).map((f) => `"${f.term}" in ${f.fieldLabel} — reword or add your evidence note.`) },
    { id: "limitations", stage: 3, label: "Limitations / unknowns stated", ok: c.report.limitations.trim().length >= 20, missing: c.report.limitations.trim().length >= 20 ? [] : ["Describe what the evidence cannot tell you."] },
    { id: "recommendations", stage: 5, label: "At least one actionable recommendation", ok: goodRecs.length >= 1, missing: goodRecs.length ? [] : c.recommendations.length ? recommendationIssues(c.recommendations[0]!, keys).map((x) => `Recommendation ${c.recommendations[0]!.key}: ${x}`) : ["Add a recommendation."] },
    { id: "exec", stage: 4, label: opt === "video" ? "Video Executive Briefing complete" : opt === "written" ? "Written Executive Summary complete" : "Executive communication chosen and complete", ok: execMissing(c, opt).length === 0, missing: execMissing(c, opt) },
  ];
  return { checks, ready: checks.every((x) => x.ok) };
}

export const RUBRIC = [
  { key: "technical_accuracy", label: "Technical accuracy" },
  { key: "evidence_alignment", label: "Evidence alignment" },
  { key: "clarity", label: "Clarity" },
  { key: "business_impact", label: "Business impact" },
  { key: "recommendations", label: "Actionable recommendations" },
  { key: "audience_fit", label: "Audience fit" },
  { key: "professionalism", label: "Professionalism" },
] as const;
export const RUBRIC_MAX = 4;

export const WEEK12_FILES = ["README.md", "technical-incident-report.md", "executive-summary.md", "video-briefing.md", "source/week11-source-manifest.json"] as const;
export type Week12File = (typeof WEEK12_FILES)[number];
export function week12Paths(opt: ExecOption): string[] {
  return ["week-12/README.md", "week-12/technical-incident-report.md", ...(opt === "written" ? ["week-12/executive-summary.md"] : opt === "video" ? ["week-12/video-briefing.md"] : []), "week-12/source/week11-source-manifest.json"];
}
export const week12ZipName = (draft: boolean) => `week-12-portfolio${draft ? "-DRAFT" : ""}.zip`;

export interface Week12View {
  id: string; textRevision: number; execOption: ExecOption; content: W12Content; snapshot: SourceSnapshot;
  snapshotHash: string; capturedAt: string; updatedAt: string; volunteerStatus: "none" | "volunteered" | "withdrawn"; presenterSelected: boolean;
  sourceChange: null | { kind: "edited" | "reset" | "archived"; detail: string };
  reviews: { feedback: string; scores: Record<string, number>; created_at: string }[];
}
