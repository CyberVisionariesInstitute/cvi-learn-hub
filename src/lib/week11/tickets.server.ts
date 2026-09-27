/**
 * SERVER-ONLY ticket outcome predicates (spec Section 9). A ticket may be
 * marked resolved/escalated only when the current simulator state actually
 * matches its approved outcome. Never import from client code — messages are
 * factual ("what is still missing"), never the hidden answer key.
 */
import { effectiveAccess, type SimState } from "./engine";

export interface TicketOutcome { ok: boolean; unmet: string[] }

const has = (s: SimState, acct: string, group: string) => s.memberships.some((m) => m.account === acct && m.group === group);
const grants = (s: SimState, acct: string) => new Set(effectiveAccess(s, acct).map((g) => `${g.resource}:${g.action}`));
const extra = (g: Set<string>, ok: Set<string>) => [...g].filter((x) => !ok.has(x));
const tested = (s: SimState, acct: string, res: string, action: string, decision: "allow" | "deny") =>
  s.tests.some((t) => t.mode === "current-access" && t.account === acct && t.resource === res && t.action === action && t.decision === decision);
const acct = (s: SimState, k: string) => s.accounts.find((a) => a.key === k);
const ticket = (s: SimState, k: string) => s.tickets.find((t) => t.key === k);

/** Returns the unmet approved-outcome conditions for resolving (or, for T504, escalating) a ticket. */
export function ticketOutcome(s: SimState, key: string, target: "resolved" | "escalated"): TicketOutcome {
  const unmet: (string | false | null | undefined)[] = [];
  switch (key) {
    case "T201": {
      const g = grants(s, "cl-blair");
      unmet.push(
        !g.has("R-CASE:read") && "Blair still cannot read Case Summaries.",
        (g.has("R-CASE:update") || g.has("R-CASE:delete")) && "Blair has Case Summaries access beyond the approved read-only scope.",
      );
      break;
    }
    case "T301": {
      const a = acct(s, "ad-jamie");
      unmet.push(
        !a && "Jamie's on-prem account has not been created.",
        a && a.ou !== "OU-SUP" && "Jamie's account is not placed in the Support OU.",
        a && !(has(s, "ad-jamie", "GA-ALL") && has(s, "ad-jamie", "GA-SUP")) && "Jamie is missing the approved staff and Support memberships.",
        a && a.status !== "enabled" && "Jamie's account is not enabled (ACT-301).",
      );
      break;
    }
    case "T302": {
      const a = acct(s, "ad-jamie");
      unmet.push(
        ticket(s, "T302")?.verification !== "passed" && "Identity verification on T302 has not passed.",
        !s.audits.some((e) => e.target === "ad-jamie" && e.activity === "password_reset") && "No verified credential reset has been performed for ad-jamie.",
        a?.mustChange && "The must-change-credential challenge has not been completed.",
      );
      break;
    }
    case "T401": {
      const g = grants(s, "cl-blair");
      const allowed = new Set(["R-LAND:read", "R-CASE:read", ...(ticket(s, "T505") ? ["R-VM1:read_metadata"] : [])]);
      const x = extra(g, allowed);
      unmet.push(
        !g.has("R-CASE:read") && "Blair cannot read Case Summaries.",
        x.length > 0 && `Blair's effective access includes rights outside the approved junior-analyst scope (${x.join(", ")}).`,
      );
      break;
    }
    case "T402": {
      const g = grants(s, "cl-casey");
      const allowed = new Set(["R-QUEUE:read", "R-QUEUE:update", "R-ABAC:read"]);
      const x = extra(g, allowed);
      unmet.push(
        (!g.has("R-QUEUE:read") || !g.has("R-QUEUE:update")) && "Casey cannot yet read and update the Response Queue.",
        !g.has("R-ABAC:read") && "Casey cannot read the Internal Response Note.",
        has(s, "cl-casey", "GC-PRIV") && "Casey is still a member of Privileged-Operators.",
        x.length > 0 && `Casey's effective access includes rights outside the approved scope (${x.join(", ")}).`,
      );
      break;
    }
    case "T403": {
      const g = grants(s, "cl-emi");
      const allowed = new Set(["R-AUD:read", "R-AUD:export"]);
      const x = extra(g, allowed);
      unmet.push(
        (!g.has("R-AUD:read") || !g.has("R-AUD:export")) && "Emi cannot yet read and export Audit Evidence.",
        x.length > 0 && `Emi's effective access includes rights outside the approved scope (${x.join(", ")}).`,
      );
      break;
    }
    case "T501": {
      const a = acct(s, "cl-jamie");
      unmet.push(
        !a && "Jamie's cloud account has not been created.",
        a && a.status !== "enabled" && "Jamie's cloud account is not enabled.",
        a && a.mfa !== "enrolled" && "MFA enrollment is not complete for Jamie's cloud account.",
        a?.mustChange && "The must-change-credential challenge has not been completed.",
        a && !(has(s, "cl-jamie", "GC-JUN") && has(s, "cl-jamie", "GC-READ")) && "Jamie is missing the approved Junior-Analysts and Case-Readers memberships (APP-501).",
        !acct(s, "ad-jamie") && "Jamie's on-prem account (T301) does not exist — the cloud account must link the same person.",
      );
      break;
    }
    case "T502": {
      const p = s.people.find((x) => x.key === "P01");
      const ad = acct(s, "ad-alex");
      const cl = acct(s, "cl-alex");
      unmet.push(
        (p?.dept !== "DEP-AUD" || ad?.dept !== "DEP-AUD" || cl?.dept !== "DEP-AUD") && "The department attribute is not Audit on the person record and both accounts.",
        ad?.ou !== "OU-AUD" && "Alex's AD account has not moved to the Audit OU.",
        (has(s, "ad-alex", "GA-RESP") || has(s, "cl-alex", "GC-RESP")) && "Alex still has Response operational memberships in one or both directories.",
        !has(s, "ad-alex", "GA-ALL") && "Alex lost the staff membership the handbook depends on.",
        (!has(s, "ad-alex", "GA-AUD") || !has(s, "cl-alex", "GC-AUD")) && "Alex is missing the approved Audit memberships.",
      );
      break;
    }
    case "T503": {
      const fin = s.accounts.filter((a) => a.person === "P06");
      unmet.push(
        fin.some((a) => a.status !== "disabled") && "One or both of Finley's accounts are still enabled.",
        s.memberships.some((m) => m.account.endsWith("-finley")) && "Finley still has group memberships.",
        acct(s, "ad-finley")?.ou !== "OU-DIS" && "Finley's AD account has not moved to Disabled Accounts.",
        s.sessions.some((x) => x.account.endsWith("-finley") && x.status === "active") && "Finley still has an active simulated session.",
        !s.signins.some((x) => x.account === "cl-finley" && x.raw['reason'] === "ACCOUNT_DISABLED") && "No denied sign-in has been recorded after offboarding.",
      );
      break;
    }
    case "T504": {
      if (target === "resolved") {
        unmet.push("This request has no approval and failed verification — it cannot be resolved. Escalation is the valid outcome.");
        break;
      }
      const before = acct(s, "cl-blair");
      unmet.push(
        ticket(s, "T504")?.verification !== "failed" && "The verification result has not been recorded as failed.",
        s.audits.some((e) => e.ticket === "T504" && e.activity === "password_reset") && "A credential reset was applied under T504 — the approved outcome is refusal with no credential change.",
        before?.mustChange && "Blair's credential state changed; the approved outcome leaves it unchanged.",
      );
      break;
    }
    case "T505": {
      unmet.push(
        !s.assignments.some((a) => a.group === "GC-AZ" && a.role === "RL-AZREAD" && a.scope === "RG-LAB") && "The reader role is not assigned at the training resource group scope.",
        !has(s, "cl-blair", "GC-AZ") && "Blair is not a member of the training resource group.",
        !tested(s, "cl-blair", "R-VM1", "read_metadata", "allow") && "No allowed metadata test on Training-VM.",
        !tested(s, "cl-blair", "R-VM1", "stop", "deny") && "No denied stop test on Training-VM.",
        !tested(s, "cl-blair", "R-VM2", "read_metadata", "deny") && "No denied metadata test on the other team's VM.",
      );
      break;
    }
    default:
      break;
  }
  const list = unmet.filter((x): x is string => typeof x === "string");
  return { ok: list.length === 0, unmet: list };
}
