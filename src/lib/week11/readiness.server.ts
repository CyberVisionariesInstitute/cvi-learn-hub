/**
 * SERVER-ONLY mission readiness predicates. These encode expected state and
 * must never be imported by client code. Responses expose factual missing
 * requirements only.
 */
import { effectiveAccess, type AccessTest, type SimState } from "./engine";
import { missions, traceConcepts } from "./seed";
import type { Learner, EvidenceRow } from "./types";

export interface MissionReadiness { mission: string; ready: boolean; missing: string[] }

const has = (s: SimState, acct: string, group: string) => s.memberships.some((m) => m.account === acct && m.group === group);
const tested = (s: SimState, acct: string, res: string, action: string, decision: "allow" | "deny", reason?: string, after = 0) =>
  s.tests.some((t: AccessTest) => t.mode === "current-access" && t.account === acct && t.resource === res && t.action === action && t.decision === decision && t.seq > after && (!reason || t.reasons.includes(reason)));
const filled = (v: string | undefined, min = 15) => (v ?? "").trim().length >= min;
const grants = (s: SimState, acct: string) => new Set(effectiveAccess(s, acct).map((g) => `${g.resource}:${g.action}`));
const slot = (ev: EvidenceRow[], learner: Learner, id: string) => {
  const rows = ev.filter((e) => e.slot === id);
  if (!rows.length) return `Capture evidence ${id}.`;
  if (!rows.some((r) => filled(learner.captions?.[r.evidence_key], 10))) return `Add a "What does this prove?" caption to ${id}.`;
  return null;
};

export function computeReadiness(s: SimState, learner: Learner, ev: EvidenceRow[]): MissionReadiness[] {
  const out: MissionReadiness[] = [];
  const q = (m: string, id: string) => learner.missions?.[m]?.answers?.[id];
  const push = (mission: string, missing: (string | null | false | undefined)[]) => {
    const list = missing.filter((x): x is string => typeof x === "string");
    out.push({ mission, ready: list.length === 0, missing: list });
  };
  const questions = (m: string) => missions.find((x) => x.key === m)!.questions
    .filter((qq) => !filled(q(m, qq.id))).map((qq) => `Answer: "${qq.label}".`);

  // M01
  const trace = learner.missions?.["M01"]?.trace ?? {};
  push("M01", [
    ...traceConcepts.filter((c) => !trace[c.id]).map((c) => `Attach a directory object to the "${c.label}" concept.`),
    slot(ev, learner, "E01"), slot(ev, learner, "E02"), ...questions("M01"),
  ]);

  // M02
  const blairSignin = s.signins.find((x) => x.account === "cl-blair" && x.raw['outcome'] === "success");
  const beforeDeny = s.tests.find((t) => t.account === "cl-blair" && t.resource === "R-CASE" && t.action === "read" && t.decision === "deny" && t.reasons.includes("NO_MATCHING_GRANT"));
  const bG = grants(s, "cl-blair");
  push("M02", [
    !blairSignin && "Record a successful cloud sign-in for Blair.",
    !beforeDeny && "Record Blair's Case Summaries read test before any access change.",
    !bG.has("R-CASE:read") && "Blair's current access still doesn't meet the approved business request.",
    bG.has("R-CASE:update") && "Blair currently has access beyond the approved scope — check Effective access.",
    !tested(s, "cl-blair", "R-CASE", "read", "allow", undefined, beforeDeny?.seq ?? 0) && "Retest Blair's Case Summaries read after your change.",
    !tested(s, "cl-blair", "R-CASE", "update", "deny", "NO_MATCHING_GRANT") && "Add a denied update test for Blair.",
    slot(ev, learner, "E03"), slot(ev, learner, "E04"), ...questions("M02"),
  ]);

  // M03
  const aj = s.accounts.find((a) => a.key === "ad-jamie");
  const t302 = s.tickets.find((t) => t.key === "T302");
  const disableSeq = s.audits.find((e) => e.target === "ad-jamie" && e.activity === "account_status_changed" && (e.after as { status?: string })?.status === "disabled")?.seq ?? 0;
  push("M03", [
    !aj && "Create Jamie's on-prem account from T301.",
    aj && aj.ou !== "OU-SUP" && "Jamie's OU placement doesn't match what T301 describes.",
    aj && !(has(s, "ad-jamie", "GA-ALL") && has(s, "ad-jamie", "GA-SUP")) && "Jamie's group memberships don't yet match T301.",
    t302?.verification !== "passed" && "Complete passed verification on T302.",
    aj && !s.audits.some((e) => e.target === "ad-jamie" && e.activity === "password_reset") && "Perform the verified credential reset.",
    aj && aj.mustChange && "Complete the simulated credential-change challenge.",
    aj && aj.status !== "enabled" && "Jamie's account should end enabled (ACT-301).",
    !disableSeq && "Run the disable → denied → re-enable validation sequence.",
    disableSeq > 0 && !s.tests.some((t) => t.account === "ad-jamie" && t.decision === "deny" && t.seq > disableSeq) && !s.signins.some((x) => x.account === "ad-jamie" && x.raw['reason'] === "ACCOUNT_DISABLED") && "Show a denied sign-in or access test while Jamie is disabled.",
    !tested(s, "ad-jamie", "R-HAND", "read", "allow", undefined, disableSeq) && "Test Staff Handbook read after re-enabling and a fresh sign-in.",
    slot(ev, learner, "E05"), slot(ev, learner, "E06"), slot(ev, learner, "E07"), ...questions("M03"),
  ]);

  // M04
  const t505 = s.tickets.find((t) => t.key === "T505");
  const allowedBlair = new Set(["R-LAND:read", "R-CASE:read", ...(t505 ? ["R-VM1:read_metadata"] : [])]);
  const cG = grants(s, "cl-casey");
  const eG = grants(s, "cl-emi");
  const extra = (g: Set<string>, ok: Set<string>) => [...g].some((x) => !ok.has(x));
  const blairAudAllow = s.tests.find((t) => t.account === "cl-blair" && t.resource === "R-AUD" && t.action === "read" && t.decision === "allow");
  const abac = s.tests.filter((t) => t.account === "cl-casey" && t.resource === "R-ABAC");
  const whatIf = (k: string) => abac.some((t) => t.mode === "abac-what-if" && t.decision === "deny" && t.overrides && t.overrides[k] !== undefined && Object.keys(t.overrides).length === 1);
  push("M04", [
    extra(bG, allowedBlair) && "Blair's effective access still includes something outside T401.",
    !cG.has("R-QUEUE:read") || !cG.has("R-QUEUE:update") || !cG.has("R-ABAC:read") ? "Casey's access doesn't yet cover what T402 approves." : null,
    extra(cG, new Set(["R-QUEUE:read", "R-QUEUE:update", "R-ABAC:read"])) && "Casey's effective access still includes rights outside T402 — inspect every path.",
    !eG.has("R-AUD:read") || !eG.has("R-AUD:export") ? "Emi's access doesn't yet cover what T403 approves." : null,
    extra(eG, new Set(["R-AUD:read", "R-AUD:export"])) && "Emi's effective access includes rights outside T403.",
    ["GC-JUN", "GC-RESP", "GC-AUD"].some((g) => !s.reviews.some((r) => r.group === g)) && "Mark the reader, responder and auditor configurations as reviewed.",
    !tested(s, "cl-blair", "R-CASE", "read", "allow") && "Required test: Blair case read.",
    !tested(s, "cl-blair", "R-CASE", "update", "deny") && "Required test: Blair case update.",
    !tested(s, "cl-casey", "R-QUEUE", "read", "allow") && "Required test: Casey queue read.",
    !tested(s, "cl-casey", "R-QUEUE", "update", "allow") && "Required test: Casey queue update.",
    !tested(s, "cl-casey", "R-AUD", "delete", "deny") && "Required test: Casey audit delete.",
    !tested(s, "cl-casey", "R-DIR", "manage_sensitive_groups", "deny") && "Required test: Casey directory manage_sensitive_groups.",
    !tested(s, "cl-emi", "R-AUD", "read", "allow") && "Required test: Emi audit read.",
    !tested(s, "cl-emi", "R-AUD", "export", "allow") && "Required test: Emi audit export.",
    !tested(s, "cl-emi", "R-AUD", "delete", "deny") && "Required test: Emi audit delete.",
    (!blairAudAllow || !tested(s, "cl-blair", "R-AUD", "read", "deny", undefined, blairAudAllow.seq)) && "Complete the temporary grant → allowed test → revoke → denied retest for Blair.",
    !abac.some((t) => t.mode === "current-access" && t.decision === "allow") && "Run Casey's Internal Response Note read under current state.",
    !whatIf("deviceTrust") && "Run the what-if case changing only the device.",
    !whatIf("department") && "Run the what-if case changing only the department.",
    !whatIf("classification") && "Run the what-if case changing only the classification.",
    slot(ev, learner, "E08"), slot(ev, learner, "E09"), slot(ev, learner, "E10"), slot(ev, learner, "E11"), ...questions("M04"),
  ]);

  // M05
  const cj = s.accounts.find((a) => a.key === "cl-jamie");
  const alex = s.people.find((p) => p.key === "P01");
  const adAlex = s.accounts.find((a) => a.key === "ad-alex");
  const clAlex = s.accounts.find((a) => a.key === "cl-alex");
  const fin = s.accounts.filter((a) => a.person === "P06");
  const t504 = s.tickets.find((t) => t.key === "T504");
  const finleyBefore = s.tests.find((t) => t.account === "cl-finley" && t.resource === "R-CASE" && t.action === "read" && t.decision === "allow");
  push("M05", [
    !cj && "T501: create Jamie's cloud account for the same person.",
    cj && (cj.status !== "enabled" || cj.mfa !== "enrolled" || cj.mustChange) && "T501: Jamie's cloud account setup (MFA, credential, status) isn't complete.",
    cj && !(has(s, "cl-jamie", "GC-JUN") && has(s, "cl-jamie", "GC-READ")) && "T501: Jamie's cloud groups don't yet match APP-501.",
    cj && (!tested(s, "cl-jamie", "R-CASE", "read", "allow") || !tested(s, "cl-jamie", "R-CASE", "update", "deny")) && "T501: test Jamie's case read and update.",
    (alex?.dept !== "DEP-AUD" || adAlex?.dept !== "DEP-AUD" || clAlex?.dept !== "DEP-AUD") && "T502: department attributes are not all updated.",
    adAlex?.ou !== "OU-AUD" && "T502: Alex's AD placement hasn't changed to match the transfer.",
    (has(s, "ad-alex", "GA-RESP") || has(s, "cl-alex", "GC-RESP")) && "T502: Alex still has old operational memberships.",
    (!has(s, "ad-alex", "GA-AUD") || !has(s, "cl-alex", "GC-AUD") || !has(s, "ad-alex", "GA-ALL")) && "T502: Alex's memberships don't yet match the approved access.",
    (!tested(s, "cl-alex", "R-QUEUE", "read", "deny") || !tested(s, "cl-alex", "R-AUD", "export", "allow") || !tested(s, "ad-alex", "R-ADRESP", "read", "deny") || !tested(s, "ad-alex", "R-ADAUD", "read", "allow")) && "T502: run Alex's after-transfer tests in both directories.",
    !finleyBefore && "T503: test Finley's case read before offboarding.",
    fin.some((a) => a.status !== "disabled") && "T503: Finley still has an enabled account.",
    s.memberships.some((m) => m.account.endsWith("-finley")) && "T503: Finley still has group memberships.",
    s.accounts.find((a) => a.key === "ad-finley")?.ou !== "OU-DIS" && "T503: Finley's AD account placement isn't updated.",
    s.sessions.some((x) => x.account.endsWith("-finley") && x.status === "active") && "T503: Finley still has an active session.",
    !s.signins.some((x) => x.account === "cl-finley" && x.raw['reason'] === "ACCOUNT_DISABLED") && "T503: show a new sign-in attempt being denied.",
    t504?.verification !== "failed" && "T504: record the verification result.",
    t504?.status !== "escalated" && "T504: record your escalation decision.",
    s.audits.some((e) => e.ticket === "T504" && e.activity === "password_reset") && "T504: a reset was applied — check the ticket record.",
    !s.assignments.some((a) => a.group === "GC-AZ" && a.role === "RL-AZREAD" && a.scope === "RG-LAB") && "T505: configure the approved resource-group access.",
    !has(s, "cl-blair", "GC-AZ") && "T505: Blair doesn't yet have the approved path.",
    (!tested(s, "cl-blair", "R-VM1", "read_metadata", "allow") || !tested(s, "cl-blair", "R-VM1", "stop", "deny") || !tested(s, "cl-blair", "R-VM2", "read_metadata", "deny")) && "T505: run the three scoped tests.",
    slot(ev, learner, "E12"), slot(ev, learner, "E13"), slot(ev, learner, "E14"), slot(ev, learner, "E15"), slot(ev, learner, "E16"), ...questions("M05"),
  ]);

  // M06 — technical case file (Deliverable 4). The polished Technical Incident
  // Report and Executive Summary are Week 12 deliverables, not Week 11.
  const fs = (learner.findings ?? []).filter((f) => ["observation", "hypothesis", "conclusion", "uncertainty", "nextAction", "rationale"].every((k) => filled((f as unknown as Record<string, string>)[k], 10)) && f.refs.length > 0 && f.priority);
  const sig = new Set(fs.map((f) => [...f.refs].sort().join(",")));
  const allRefs = fs.flatMap((f) => f.refs);
  push("M06", [
    fs.length < 2 && "Complete at least two findings with every reasoning field, a priority and raw-event references.",
    fs.length >= 2 && sig.size < 2 && "Your two findings reference identical events — make them distinct.",
    !allRefs.includes("S009") && !allRefs.includes("A002") && "Reference the correlated sign-in/audit records you investigated.",
    !filled(learner.comparison?.text) || !(learner.comparison?.refs?.length) ? "Record one benign/ambiguous comparison with its source records." : null,
    !filled(learner.report?.liveChain) && "Describe one live simulator audit/access chain from your earlier missions.",
    !filled(learner.report?.limitations) && "Write the explicit simulation/environment limitations section.",
    slot(ev, learner, "E17"), slot(ev, learner, "E18"), slot(ev, learner, "E19"), ...questions("M06"),
  ]);
  return out;
}
