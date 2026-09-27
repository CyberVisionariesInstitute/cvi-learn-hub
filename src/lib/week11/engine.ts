/**
 * Deterministic Cloud Heights simulation engine (spec Sections 6–8).
 *
 * Pure functions: (state, command) → (next state, result). The server runs
 * this authoritatively; it contains diagnostic rules only — never mission
 * answer keys or readiness predicates.
 */
import {
  adAcl, devices, groups, historicalAudit, historicalSignins, initialAccountPlacement,
  initialAssignments, ous, peopleSeed, resources, roles, SCENARIO_START, SEED_VERSION, tickets,
  type DeptKey, type Directory, type EmploymentStatus,
} from "./seed";

export interface Person { key: string; name: string; dept: DeptKey; status: EmploymentStatus; hrId: string; ad: string | null; cloud: string | null }
export interface Account {
  key: string; person: string; dir: Directory; username: string; upn: string; ou: string | null;
  dept: DeptKey; status: "enabled" | "disabled"; locked: boolean; credentialVersion: number;
  mustChange: boolean; failedCount: number; mfa: "enrolled" | "not_enrolled" | "not_in_scope";
  securityRevision: number;
}
export interface Membership { group: string; account: string; addedSeq: number }
export interface Assignment { key: string; group: string; role: string; scope: string; createdSeq: number }
export interface Session { key: string; account: string; credV: number; secRev: number; device: string; mfa: boolean; status: "active" | "revoked"; seq: number }
export interface Challenge { key: string; account: string; credV: number; used: boolean }
export interface TicketState {
  key: string; status: "open" | "investigating" | "in_progress" | "resolved" | "escalated";
  verification: "not_started" | "passed" | "failed"; verifiedAtCredV?: number | undefined;
  notes: { seq: number; text: string }[]; linkedSeq: number[];
}
export interface LiveSignin {
  id: string; seq: number; account: string; raw: Record<string, string>;
}
export interface LiveAudit {
  id: string; seq: number; activity: string; actorKind: "learner" | "instructor"; target: string;
  targetType: string; changed: string[]; before: unknown; after: unknown; result: "accepted" | "refused" | "no_op";
  ticket: string | null; correlation: string; reason?: string | undefined; time: string;
}
export interface AccessPath { kind: "acl" | "role"; group: string; role?: string | undefined; scope?: string | undefined; assignment?: string }
export interface AccessTest {
  id: string; seq: number; revision: number; account: string; session: string | null; device: string | null;
  resource: string; action: string; mode: "current-access" | "preview" | "abac-what-if";
  decision: "allow" | "deny" | "preview"; reasons: string[]; paths: AccessPath[];
  memberships: string[]; attributes?: Record<string, string> | undefined; overrides?: Record<string, string> | undefined;
}
export interface SimState {
  seed: string; seq: number; people: Person[]; accounts: Account[]; memberships: Membership[];
  assignments: Assignment[]; sessions: Session[]; challenges: Challenge[]; tickets: TicketState[];
  recoveryTickets: { key: string; account: string; seq: number }[];
  signins: LiveSignin[]; audits: LiveAudit[]; tests: AccessTest[]; reviews: { group: string; seq: number; note: string }[];
  assignmentCounter: number;
}

export const scenarioTime = (seq: number) =>
  new Date(Date.parse(SCENARIO_START) + seq * 60_000).toISOString().replace(".000Z", "Z");

const dn = (name: string, ou: string | null) => {
  const o = ous.find((x) => x.key === ou);
  return o ? `CN=${name},${o.dn}` : "";
};
export const accountDn = (s: SimState, a: Account) =>
  a.dir === "AD" ? dn(s.people.find((p) => p.key === a.person)?.name ?? a.username, a.ou) : null;

export function createSeedState(): SimState {
  const people: Person[] = peopleSeed.map((p) => ({
    key: p.key, name: p.name, dept: p.dept, status: p.status, hrId: p.hrId,
    ad: p.key === "P08" ? null : `ad-${p.username}`,
    cloud: p.key === "P08" ? null : `cl-${p.username}`,
  }));
  const accounts: Account[] = [];
  for (const p of peopleSeed) {
    const place = initialAccountPlacement[p.username];
    if (!place) continue;
    const base = { person: p.key, username: p.username, dept: p.dept, status: place.enabled ? "enabled" as const : "disabled" as const, locked: false, credentialVersion: 1, mustChange: false, failedCount: 0, securityRevision: 1 };
    accounts.push({ ...base, key: `ad-${p.username}`, dir: "AD", upn: `${p.username}@ad.cloudheights.example`, ou: place.ou, mfa: "not_in_scope" });
    accounts.push({ ...base, key: `cl-${p.username}`, dir: "CLOUD", upn: `${p.username}@cvi-training.example`, ou: null, mfa: "enrolled" });
  }
  const memberships: Membership[] = groups.flatMap((g) =>
    g.members.map((u) => ({ group: g.key, account: `${g.dir === "AD" ? "ad" : "cl"}-${u}`, addedSeq: 0 })),
  );
  return {
    seed: SEED_VERSION, seq: 0, people, accounts, memberships,
    assignments: initialAssignments.map((a) => ({ ...a, createdSeq: 0 })),
    sessions: [], challenges: [], recoveryTickets: [],
    tickets: tickets.map((t) => ({ key: t.key, status: "open", verification: "not_started", notes: [], linkedSeq: [] })),
    signins: [], audits: [], tests: [], reviews: [], assignmentCounter: 10,
  };
}

/* ------------------------------------------------------------------ */
/* Commands                                                            */
/* ------------------------------------------------------------------ */

export type Command =
  | { type: "create_account"; person: string; dir: Directory; ou?: string | undefined; ticket: string }
  | { type: "move_ou"; account: string; ou: string; ticket?: string | undefined; reason?: string }
  | { type: "add_member" | "remove_member"; group: string; account: string; ticket?: string | undefined; reason?: string }
  | { type: "assign_role"; group: string; role: string; scope: string; ticket?: string | undefined; reason?: string }
  | { type: "revoke_role"; assignment: string; ticket?: string | undefined; reason?: string }
  | { type: "set_status"; account: string; status: "enabled" | "disabled"; ticket?: string | undefined; reason?: string }
  | { type: "verify"; ticket: string; route: "trusted" | "request_only"; hrId: string }
  | { type: "reset_credential"; account: string; ticket: string }
  | { type: "unlock"; account: string; ticket: string }
  | { type: "signin"; account: string; device: string; credential: "current" | "stale" | "incorrect"; mfa: "pass" | "fail" | "cancel" }
  | { type: "complete_credential_change"; challenge: string }
  | { type: "enroll_mfa"; account: string; ticket: string }
  | { type: "revoke_sessions"; account: string; ticket?: string | undefined; reason?: string }
  | { type: "transfer_department"; person: string; dept: DeptKey; ticket: string }
  | { type: "ticket_status"; ticket: string; status: "investigating" | "in_progress" | "resolved" | "escalated"; note: string }
  | { type: "test_access"; account: string; session?: string | null | undefined; resource: string; action: string; mode: "current-access" | "preview" | "abac-what-if"; device?: string | undefined; overrides?: Record<string, string> | undefined }
  | { type: "review_config"; group: string; note: string }
  | { type: "open_recovery"; account: string };

export interface CommandResult {
  ok: boolean;
  /** Input/validation error: no mutation, no sequence advance. */
  error?: { code: string; message: string };
  outcome?: string | undefined;
  message: string;
  seq?: number | undefined;
  eventIds?: string[] | undefined;
  testId?: string | undefined;
  sessionKey?: string | undefined;
  challengeKey?: string | undefined;
}

const fail = (code: string, message: string): { state: null; result: CommandResult } => ({
  state: null, result: { ok: false, error: { code, message }, message },
});

const MAX_TEXT = 2000;

export function applyCommand(
  prev: SimState, cmd: Command, ctx: { attemptShort: string; revision: number; actorKind?: "learner" | "instructor" },
): { state: SimState | null; result: CommandResult } {
  const s: SimState = structuredClone(prev);
  const seq = s.seq + 1;
  const time = scenarioTime(seq);
  const actorKind = ctx.actorKind ?? "learner";
  const eventIds: string[] = [];
  let ordinal = 0;
  const acct = (k: string) => s.accounts.find((a) => a.key === k);
  const person = (k: string) => s.people.find((p) => p.key === k);
  const ticketSeed = (k: string) => tickets.find((t) => t.key === k);
  const ticketState = (k: string) => s.tickets.find((t) => t.key === k);

  const audit = (e: Omit<LiveAudit, "id" | "seq" | "actorKind" | "time" | "correlation"> & { correlation?: string }) => {
    ordinal += 1;
    const id = `LA-${ctx.attemptShort}-${seq}-${ordinal}`;
    s.audits.push({ ...e, id, seq, actorKind, time, correlation: e.correlation ?? `LC-${ctx.attemptShort}-${seq}` });
    eventIds.push(id);
    if (e.ticket) ticketState(e.ticket)?.linkedSeq.push(seq);
  };
  const commit = (message: string, extra: Partial<CommandResult> = {}): { state: SimState; result: CommandResult } => {
    s.seq = seq;
    return { state: s, result: { ok: true, message, seq, eventIds, ...extra } };
  };
  const text = (v: string | undefined) => (v ?? "").trim().slice(0, MAX_TEXT);
  const justification = (c: { ticket?: string | undefined; reason?: string }) => {
    if (c.ticket && ticketSeed(c.ticket)) return { ok: true, ticket: c.ticket };
    if (c.ticket && s.recoveryTickets.some((r) => r.key === c.ticket)) return { ok: true, ticket: c.ticket };
    if (text(c.reason).length >= 3) return { ok: true, ticket: null };
    return { ok: false, ticket: null };
  };
  const revokeSessions = (a: Account) => {
    let n = 0;
    for (const x of s.sessions) if (x.account === a.key && x.status === "active") { x.status = "revoked"; n++; }
    return n;
  };

  switch (cmd.type) {
    case "create_account": {
      const p = person(cmd.person);
      const t = ticketSeed(cmd.ticket);
      const key = `${cmd.dir === "AD" ? "ad" : "cl"}-jamie`;
      if (!p || p.key !== "P08") return fail("CREATE_RESTRICTED", "Only the planned joiner (P08 Jamie Ellis) can be created in this exercise.");
      if (acct(key)) return fail("DUPLICATE_ACCOUNT", `Jamie already has a ${cmd.dir === "AD" ? "on-prem" : "cloud"} account (${key}). Open the existing account instead — a person has one account per directory.`);
      if (!t || !t.permitsCreate?.includes(key)) return fail("TICKET_REQUIRED", `Creating ${key} needs the ticket that approves it.`);
      if (cmd.dir === "AD" && !ous.some((o) => o.key === cmd.ou)) return fail("OU_REQUIRED", "Choose an existing organizational unit for the on-prem account.");
      const a: Account = {
        key, person: p.key, dir: cmd.dir, username: "jamie",
        upn: cmd.dir === "AD" ? "jamie@ad.cloudheights.example" : "jamie@cvi-training.example",
        ou: cmd.dir === "AD" ? cmd.ou! : null, dept: "DEP-SUP", status: "disabled", locked: false,
        credentialVersion: 1, mustChange: true, failedCount: 0, mfa: cmd.dir === "AD" ? "not_in_scope" : "not_enrolled", securityRevision: 1,
      };
      s.accounts.push(a);
      if (cmd.dir === "AD") p.ad = key; else p.cloud = key;
      audit({ activity: "user_created", target: key, targetType: "account", changed: ["account"], before: null, after: { ...a, dn: accountDn(s, a) }, result: "accepted", ticket: t.key });
      return commit(`Created ${key} (disabled, no groups, must change credential).`);
    }
    case "move_ou": {
      const a = acct(cmd.account);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      if (a.dir !== "AD") return fail("DIRECTORY_MISMATCH", "OUs are an AD concept in this exercise. Cloud accounts have no OU.");
      if (!ous.some((o) => o.key === cmd.ou)) return fail("NOT_FOUND", "That OU does not exist.");
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Link a ticket or write a short reason for this change.");
      const before = { ou: a.ou, dn: accountDn(s, a) };
      if (a.ou === cmd.ou) {
        audit({ activity: "ou_changed", target: a.key, targetType: "account", changed: [], before, after: before, result: "no_op", ticket: j.ticket, reason: text(cmd.reason) });
        return commit("No change: the account is already in that OU (recorded as a no-op).");
      }
      a.ou = cmd.ou;
      audit({ activity: "ou_changed", target: a.key, targetType: "account", changed: ["ou", "dn"], before, after: { ou: a.ou, dn: accountDn(s, a) }, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(`Moved ${a.key} to ${cmd.ou}. Group memberships and permissions are unchanged.`);
    }
    case "add_member":
    case "remove_member": {
      const a = acct(cmd.account);
      const g = groups.find((x) => x.key === cmd.group);
      if (!a || !g) return fail("NOT_FOUND", "Account or group not found.");
      if (a.dir !== g.dir) return fail("DIRECTORY_MISMATCH", `${g.name} is a${g.dir === "AD" ? "n on-prem AD" : " cloud"} group; ${a.key} is a${a.dir === "AD" ? "n on-prem" : " cloud"} account. Choose a group from the same directory.`);
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Link a ticket or write a short reason (for example 'sandbox experiment').");
      const before = s.memberships.filter((m) => m.account === a.key).map((m) => m.group).sort();
      const has = s.memberships.some((m) => m.group === g.key && m.account === a.key);
      const adding = cmd.type === "add_member";
      if (has === adding) {
        audit({ activity: adding ? "group_member_added" : "group_member_removed", target: a.key, targetType: "account", changed: [], before, after: before, result: "no_op", ticket: j.ticket, reason: text(cmd.reason) });
        return commit(`No change: ${a.key} ${adding ? "is already" : "is not"} a member of ${g.name} (recorded as a no-op).`);
      }
      if (adding) s.memberships.push({ group: g.key, account: a.key, addedSeq: seq });
      else s.memberships = s.memberships.filter((m) => !(m.group === g.key && m.account === a.key));
      const after = s.memberships.filter((m) => m.account === a.key).map((m) => m.group).sort();
      audit({ activity: adding ? "group_member_added" : "group_member_removed", target: a.key, targetType: "account", changed: ["memberships"], before, after, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(`${adding ? "Added" : "Removed"} ${a.key} ${adding ? "to" : "from"} ${g.name}.`);
    }
    case "assign_role": {
      const g = groups.find((x) => x.key === cmd.group);
      const r = roles.find((x) => x.key === cmd.role);
      if (!g || !r) return fail("NOT_FOUND", "Group or role not found.");
      if (g.dir !== "CLOUD") return fail("DIRECTORY_MISMATCH", "Role assignments apply to cloud groups. AD resources use the separate ACL.");
      const scopeRes = resources.find((x) => x.key === cmd.scope);
      const isRg = cmd.scope === "RG-LAB" || cmd.scope === "RG-OTHER";
      if (!scopeRes && !isRg) return fail("NOT_FOUND", "Scope not found.");
      const scopeTypes = isRg ? ["azure_vm"] : [scopeRes!.type];
      const scopeAuthority = isRg || scopeRes!.authority === "AZURE" ? "AZURE" : scopeRes!.authority === "AD" ? "AD" : "CLOUD";
      if (scopeAuthority === "AD") return fail("AUTHORITY_MISMATCH", "AD file shares are governed by AD ACL entries, not cloud roles.");
      if (scopeAuthority !== r.authority) return fail("AUTHORITY_MISMATCH", `${r.name} is a ${r.authorityLabel} role; that scope belongs to a different authority.`);
      if (!r.perms.some((p) => scopeTypes.includes(p.type))) return fail("TYPE_MISMATCH", `${r.name} has no permissions for ${scopeTypes.join("/")} resources.`);
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Link a ticket or write a short reason.");
      if (s.assignments.some((a) => a.group === g.key && a.role === r.key && a.scope === cmd.scope)) {
        audit({ activity: "role_assignment_changed", target: g.key, targetType: "group", changed: [], before: null, after: null, result: "no_op", ticket: j.ticket, reason: "Assignment already exists" });
        return commit("No change: that exact assignment already exists (recorded as a no-op).");
      }
      s.assignmentCounter += 1;
      const a: Assignment = { key: `AS-${String(s.assignmentCounter).padStart(2, "0")}`, group: g.key, role: r.key, scope: cmd.scope, createdSeq: seq };
      s.assignments.push(a);
      audit({ activity: "role_assignment_changed", target: g.key, targetType: "group", changed: ["assignments"], before: null, after: a, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(`Assigned ${r.name} to ${g.name} at ${cmd.scope} (${a.key}).`);
    }
    case "revoke_role": {
      const a = s.assignments.find((x) => x.key === cmd.assignment);
      if (!a) return fail("NOT_FOUND", "Assignment not found.");
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Link a ticket or write a short reason.");
      s.assignments = s.assignments.filter((x) => x.key !== a.key);
      audit({ activity: "role_assignment_changed", target: a.group, targetType: "group", changed: ["assignments"], before: a, after: null, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(`Removed assignment ${a.key}. The role definition stays in the catalog.`);
    }
    case "set_status": {
      const a = acct(cmd.account);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Enabling or disabling needs an approved ticket or a documented sandbox reason.");
      const before = { status: a.status, securityRevision: a.securityRevision };
      if (a.status === cmd.status) {
        audit({ activity: "account_status_changed", target: a.key, targetType: "account", changed: [], before, after: before, result: "no_op", ticket: j.ticket, reason: text(cmd.reason) });
        return commit(`No change: ${a.key} is already ${a.status}.`);
      }
      a.status = cmd.status;
      let revoked = 0;
      if (cmd.status === "disabled") { a.securityRevision += 1; revoked = revokeSessions(a); }
      audit({ activity: "account_status_changed", target: a.key, targetType: "account", changed: cmd.status === "disabled" ? ["status", "securityRevision", "sessions"] : ["status"], before, after: { status: a.status, securityRevision: a.securityRevision, sessionsRevoked: revoked }, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(cmd.status === "disabled" ? `Disabled ${a.key}; ${revoked} simulated session(s) revoked. OU unchanged.` : `Enabled ${a.key}. Old sessions stay revoked; memberships are unchanged.`);
    }
    case "verify": {
      const t = ticketSeed(cmd.ticket);
      const ts = ticketState(cmd.ticket);
      const rec = s.recoveryTickets.find((r) => r.key === cmd.ticket);
      if ((!t || !t.verification || !ts) && !rec) return fail("NO_VERIFICATION", "This ticket has no identity verification step.");
      const targetKey = rec ? rec.account : t!.verification!.targetAccount;
      const target = acct(targetKey) ?? null;
      const p = person(targetKey.startsWith("ad-") || targetKey.startsWith("cl-") ? (target?.person ?? (targetKey.endsWith("jamie") ? "P08" : "")) : "");
      const callbackOk = rec ? !!(p && (p.status === "active" || p.status === "approved_joiner")) : t!.verification!.callback.completed;
      const hrOk = !!p && cmd.hrId.trim().toUpperCase() === p.hrId;
      const passed = cmd.route === "trusted" && callbackOk && hrOk;
      const why = cmd.route !== "trusted" ? "Request-only details are not trusted verification."
        : !callbackOk ? "No directory-confirmed callback has been completed for this request."
        : !hrOk ? "The HR ID does not match the target's HR record." : "Trusted callback and matching HR ID.";
      const state = rec ? null : ts!;
      if (state) { state.verification = passed ? "passed" : "failed"; state.verifiedAtCredV = target?.credentialVersion; }
      else if (rec) (rec as { verified?: boolean }).verified = passed;
      audit({ activity: "verification_completed", target: targetKey, targetType: "ticket", changed: ["verification"], before: null, after: { route: cmd.route, hrIdSupplied: cmd.hrId.trim().slice(0, 12), outcome: passed ? "passed" : "failed" }, result: passed ? "accepted" : "refused", ticket: cmd.ticket, reason: why });
      return commit(passed ? `Verification passed for ${targetKey}: ${why}` : `Verification failed: ${why}`, { outcome: passed ? "passed" : "failed" });
    }
    case "reset_credential":
    case "unlock": {
      const a = acct(cmd.account);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      const t = ticketSeed(cmd.ticket);
      const rec = s.recoveryTickets.find((r) => r.key === cmd.ticket) as { key: string; account: string; verified?: boolean } | undefined;
      const permits = rec ? rec.account === a.key : cmd.type === "reset_credential" ? !!t?.permitsReset?.includes(a.key) : !!t?.permitsUnlock?.includes(a.key);
      const verified = rec ? rec.verified === true : ticketState(cmd.ticket)?.verification === "passed";
      const activity = cmd.type === "reset_credential" ? "password_reset" : "account_unlocked";
      if (!permits || !verified) {
        const reason = !permits ? "This ticket does not authorise that action for this account." : "Reset refused: requester verification is incomplete/mismatched.";
        audit({ activity: `${activity}_refused`, target: a.key, targetType: "account", changed: [], before: null, after: null, result: "refused", ticket: cmd.ticket, reason });
        return commit(reason, { outcome: "refused" });
      }
      const before = { credentialVersion: a.credentialVersion, mustChange: a.mustChange, locked: a.locked, failedCount: a.failedCount, securityRevision: a.securityRevision };
      let revoked = 0;
      if (cmd.type === "reset_credential") {
        a.credentialVersion += 1; a.mustChange = true; a.failedCount = 0; a.locked = false; a.securityRevision += 1;
        revoked = revokeSessions(a);
      } else { a.locked = false; a.failedCount = 0; }
      audit({ activity, target: a.key, targetType: "account", changed: cmd.type === "reset_credential" ? ["credentialVersion", "mustChange", "locked", "failedCount", "securityRevision", "sessions"] : ["locked", "failedCount"], before, after: { credentialVersion: a.credentialVersion, mustChange: a.mustChange, locked: a.locked, failedCount: a.failedCount, securityRevision: a.securityRevision, sessionsRevoked: revoked }, result: "accepted", ticket: cmd.ticket });
      return commit(cmd.type === "reset_credential" ? `Credential reset: version ${before.credentialVersion} → ${a.credentialVersion}; must change at next sign-in; ${revoked} session(s) revoked. No password was set or shown.` : `Unlocked ${a.key}. No permissions changed.`, { outcome: "accepted" });
    }
    case "signin": {
      const dev = devices.find((d) => d.key === cmd.device);
      if (!dev) return fail("NOT_FOUND", "Device not found.");
      const a = acct(cmd.account);
      const upn = a?.upn ?? cmd.account;
      let outcome = "success";
      let reason = "accepted";
      let sessionKey: string | undefined;
      let challengeKey: string | undefined;
      const lockEvents: (() => void)[] = [];
      if (!a) { outcome = "failure"; reason = "ACCOUNT_NOT_FOUND"; }
      else if (a.status === "disabled") { outcome = "failure"; reason = "ACCOUNT_DISABLED"; }
      else if (a.locked) { outcome = "failure"; reason = "ACCOUNT_LOCKED"; }
      else if (cmd.credential !== "current") {
        outcome = "failure"; reason = "INVALID_CREDENTIAL"; a.failedCount += 1;
        if (a.failedCount >= 3) {
          a.locked = true;
          lockEvents.push(() => audit({ activity: "account_locked", target: a.key, targetType: "account", changed: ["locked"], before: { locked: false }, after: { locked: true, failedCount: a.failedCount }, result: "accepted", ticket: null, reason: "Third consecutive credential failure" }));
        }
      } else if (a.mustChange) {
        outcome = "challenge"; reason = "CREDENTIAL_CHANGE_REQUIRED";
        challengeKey = `CHAL-${ctx.attemptShort}-${seq}`;
        s.challenges.push({ key: challengeKey, account: a.key, credV: a.credentialVersion, used: false });
      } else if (a.dir === "CLOUD" && a.mfa !== "enrolled") { outcome = "failure"; reason = "MFA_ENROLLMENT_REQUIRED"; }
      else if (a.dir === "CLOUD" && cmd.mfa !== "pass") { outcome = "failure"; reason = cmd.mfa === "fail" ? "MFA_FAILED" : "MFA_CANCELED"; }
      else {
        a.failedCount = 0;
        sessionKey = `SES-${ctx.attemptShort}-${seq}`;
        s.sessions.push({ key: sessionKey, account: a.key, credV: a.credentialVersion, secRev: a.securityRevision, device: dev.key, mfa: a.dir === "CLOUD", status: "active", seq });
      }
      ordinal += 1;
      const id = `LS-${ctx.attemptShort}-${seq}-${ordinal}`;
      s.signins.push({
        id, seq, account: cmd.account,
        raw: {
          event_id: id, time_utc: time, user: upn, application: a?.dir === "AD" ? "AD-Logon (simulated)" : "CaseDesk",
          source_ip: dev.ip, device_id: dev.key, scenario_location: dev.location.split(";")[0] ?? dev.location,
          outcome, reason, authentication_method: a?.dir === "CLOUD" && outcome === "success" ? "password_plus_mfa" : "password",
          mfa_detail: a?.dir === "CLOUD" && reason.startsWith("MFA") ? "challenged_now" : a?.dir === "CLOUD" && outcome === "success" ? "challenged_now" : "not_recorded",
          correlation_id: `LC-${ctx.attemptShort}-${seq}`,
        },
      });
      eventIds.push(id);
      lockEvents.forEach((f) => f());
      const msg: Record<string, string> = {
        accepted: `Sign-in succeeded. Simulated session ${sessionKey} is bound to credential v${a?.credentialVersion} on ${dev.key}.`,
        ACCOUNT_NOT_FOUND: "Sign-in failed: account not found.",
        ACCOUNT_DISABLED: "Sign-in failed: the account is disabled (checked before credentials and MFA).",
        ACCOUNT_LOCKED: "Sign-in failed: the account is locked. Unlock requires a verified ticket.",
        INVALID_CREDENTIAL: `Sign-in failed: invalid credential (consecutive failures: ${a?.failedCount ?? 0}${a?.locked ? " — account now locked" : ""}).`,
        CREDENTIAL_CHANGE_REQUIRED: "Credential change required. Complete the simulated credential change, then sign in again. This is not an access session.",
        MFA_ENROLLMENT_REQUIRED: "Sign-in failed: MFA enrollment is required for this cloud account.",
        MFA_FAILED: "Sign-in failed: MFA response failed.",
        MFA_CANCELED: "Sign-in failed: MFA was canceled.",
      };
      return commit(msg[reason] ?? reason, { outcome: reason, sessionKey, challengeKey });
    }
    case "complete_credential_change": {
      const c = s.challenges.find((x) => x.key === cmd.challenge);
      if (!c || c.used) return fail("INVALID_CHALLENGE", "This challenge is not valid or was already used.");
      const a = acct(c.account);
      if (!a || a.credentialVersion !== c.credV || !a.mustChange) return fail("INVALID_CHALLENGE", "The account changed since this challenge was issued. Sign in again.");
      c.used = true;
      const before = { credentialVersion: a.credentialVersion, mustChange: true };
      a.credentialVersion += 1; a.mustChange = false;
      audit({ activity: "credential_changed", target: a.key, targetType: "account", changed: ["credentialVersion", "mustChange"], before, after: { credentialVersion: a.credentialVersion, mustChange: false }, result: "accepted", ticket: null });
      return commit(`Simulated credential change complete (v${before.credentialVersion} → v${a.credentialVersion}). Sign in again for a session. No secret was collected.`);
    }
    case "enroll_mfa": {
      const a = acct(cmd.account);
      const t = ticketSeed(cmd.ticket);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      if (a.dir !== "CLOUD") return fail("DIRECTORY_MISMATCH", "MFA enrollment applies to cloud accounts in this exercise.");
      if (!t?.permitsMfa?.includes(a.key)) return fail("TICKET_REQUIRED", "MFA enrollment is available only during approved cloud onboarding.");
      if (ticketState(t.key)?.verification !== "passed") return fail("VERIFICATION_REQUIRED", "Complete identity verification on the onboarding ticket first.");
      if (a.mfa === "enrolled") return fail("ALREADY_ENROLLED", "MFA is already enrolled.");
      a.mfa = "enrolled";
      audit({ activity: "mfa_enrolled", target: a.key, targetType: "account", changed: ["mfa"], before: { mfa: "not_enrolled" }, after: { mfa: "enrolled" }, result: "accepted", ticket: t.key });
      return commit(`Simulated MFA enrollment complete for ${a.key}.`);
    }
    case "revoke_sessions": {
      const a = acct(cmd.account);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      const j = justification(cmd);
      if (!j.ok) return fail("REASON_REQUIRED", "Link a ticket or write a short reason.");
      a.securityRevision += 1;
      const n = revokeSessions(a);
      audit({ activity: "sessions_revoked", target: a.key, targetType: "account", changed: ["sessions", "securityRevision"], before: null, after: { sessionsRevoked: n, securityRevision: a.securityRevision }, result: "accepted", ticket: j.ticket, reason: text(cmd.reason) });
      return commit(`Revoked ${n} simulated session(s) for ${a.key}.`);
    }
    case "transfer_department": {
      const p = person(cmd.person);
      const t = ticketSeed(cmd.ticket);
      if (!p) return fail("NOT_FOUND", "Person not found.");
      if (!t || t.key !== "T502" || p.key !== "P01") return fail("TICKET_REQUIRED", "Department transfers need an approved transfer ticket for that person.");
      const targets = [p, ...[p.ad, p.cloud].map((k) => (k ? acct(k) : undefined)).filter(Boolean)] as (Person | Account)[];
      for (const obj of targets) {
        const before = obj.dept;
        obj.dept = cmd.dept;
        audit({ activity: "department_changed", target: obj.key, targetType: "person" in obj ? "account" : "person", changed: before === cmd.dept ? [] : ["department"], before, after: cmd.dept, result: before === cmd.dept ? "no_op" : "accepted", ticket: t.key });
      }
      return commit(`Department set to ${cmd.dept} on ${p.name}'s person record and both accounts. OU and memberships did not change.`);
    }
    case "ticket_status": {
      const ts = ticketState(cmd.ticket);
      if (!ts) return fail("NOT_FOUND", "Ticket not found.");
      const note = text(cmd.note);
      if ((cmd.status === "resolved" || cmd.status === "escalated") && note.length < 10) return fail("NOTE_REQUIRED", "Write a decision note (at least a sentence) before resolving or escalating.");
      const before = ts.status;
      ts.status = cmd.status;
      if (note) ts.notes.push({ seq, text: note });
      // HR person records follow only approved ticket completion.
      if (cmd.status === "resolved") {
        if (cmd.ticket === "T503") { const p = person("P06"); if (p) p.status = "departed"; }
        if (cmd.ticket === "T501" || cmd.ticket === "T301") { const p = person("P08"); if (p && p.status === "approved_joiner") p.status = "active"; }
      }
      audit({ activity: cmd.status === "escalated" ? "ticket_escalated" : cmd.status === "resolved" ? "ticket_resolved" : "ticket_status_changed", target: cmd.ticket, targetType: "ticket", changed: ["status"], before, after: cmd.status, result: "accepted", ticket: cmd.ticket, reason: note });
      return commit(`Ticket ${cmd.ticket}: ${before} → ${cmd.status}. Ticket status alone does not grant or remove access.`);
    }
    case "test_access": {
      const res = resources.find((r) => r.key === cmd.resource);
      const a = acct(cmd.account);
      if (!res || !a) return fail("INVALID_INPUT", "Invalid test input: unknown account or resource.");
      if (!res.actions.includes(cmd.action)) return fail("INVALID_ACTION", `Invalid test input: ${res.name} does not support '${cmd.action}'. This is not a permission denial.`);
      const t = evaluateAccess(s, cmd);
      ordinal += 1;
      const id = `AT-${ctx.attemptShort}-${seq}-${ordinal}`;
      const test: AccessTest = { ...t, id, seq, revision: ctx.revision + 1 };
      s.tests.push(test);
      audit({ activity: "access_test", target: res.key, targetType: "resource", changed: [], before: null, after: { test: id, account: a.key, action: cmd.action, decision: t.decision, reasons: t.reasons, mode: t.mode }, result: "accepted", ticket: null });
      const label = t.mode === "preview" ? "Preview (not access evidence)" : t.decision === "allow" ? "ALLOW" : "DENY";
      return commit(`${label}: ${a.key} → ${res.name} / ${cmd.action}. ${reasonText(t.reasons)}`, { testId: id, outcome: t.decision });
    }
    case "review_config": {
      const g = groups.find((x) => x.key === cmd.group);
      if (!g) return fail("NOT_FOUND", "Group not found.");
      s.reviews.push({ group: g.key, seq, note: text(cmd.note) });
      audit({ activity: "configuration_reviewed", target: g.key, targetType: "group", changed: [], before: null, after: { members: s.memberships.filter((m) => m.group === g.key).map((m) => m.account), assignments: s.assignments.filter((x) => x.group === g.key).map((x) => `${x.role}@${x.scope}`) }, result: "no_op", ticket: null, reason: text(cmd.note) });
      return commit(`Reviewed ${g.name}'s configuration (no change made — recorded as reviewed, not as a new assignment).`);
    }
    case "open_recovery": {
      const a = acct(cmd.account);
      if (!a) return fail("NOT_FOUND", "Account not found.");
      const p = person(a.person);
      if (!p || p.status === "departed") return fail("RECOVERY_NOT_ALLOWED", "Training recovery does not reactivate departed employees.");
      const key = `TR-${a.key}-${seq}`;
      s.recoveryTickets.push({ key, account: a.key, seq });
      audit({ activity: "recovery_ticket_opened", target: a.key, targetType: "account", changed: [], before: null, after: { ticket: key }, result: "accepted", ticket: null });
      return commit(`Opened training recovery ticket ${key}. Verify with the HR ID, then unlock or reset only this account.`);
    }
  }
}

export const reasonCopy: Record<string, string> = {
  ALLOW: "A matching grant permits this action.",
  ACCOUNT_DISABLED: "The target account is disabled.",
  ACCOUNT_LOCKED: "The target account is locked.",
  NO_VALID_SESSION: "Sign in as this fictional account first — no valid simulated session.",
  SESSION_INVALIDATED: "The session was issued before a credential or security change and is no longer valid.",
  DIRECTORY_MISMATCH: "This account's directory cannot use this resource's authority.",
  NO_MATCHING_GRANT: "Sign-in succeeded; no matching grant permits this action.",
  ATTRIBUTE_MISSING: "A required attribute is missing or unknown.",
  ABAC_CONDITION_FAILED: "An attribute policy condition is false.",
  PREVIEW: "Policy preview only — not successful access evidence.",
};
export const reasonText = (r: string[]) => r.map((x) => reasonCopy[x] ?? x).join(" ");

/** Authoritative decision order (spec 6.2). Pure; used by the command above. */
export function evaluateAccess(
  s: SimState,
  cmd: { account: string; session?: string | null | undefined; resource: string; action: string; mode: AccessTest["mode"]; device?: string | undefined; overrides?: Record<string, string> | undefined },
): Omit<AccessTest, "id" | "seq" | "revision"> {
  const a = s.accounts.find((x) => x.key === cmd.account)!;
  const res = resources.find((r) => r.key === cmd.resource)!;
  const memberships = s.memberships.filter((m) => m.account === a.key).map((m) => m.group).sort();
  const sess = cmd.session ? s.sessions.find((x) => x.key === cmd.session) ?? null : null;
  const base = { account: a.key, session: sess?.key ?? null, device: sess?.device ?? cmd.device ?? null, resource: res.key, action: cmd.action, mode: cmd.mode, memberships };
  const deny = (reasons: string[], paths: AccessPath[] = [], attributes?: Record<string, string>) =>
    ({ ...base, decision: "deny" as const, reasons, paths, attributes, overrides: cmd.overrides });

  const preview = cmd.mode === "preview";
  if (!preview) {
    if (a.status === "disabled") return deny(["ACCOUNT_DISABLED"]);
    if (a.locked) return deny(["ACCOUNT_LOCKED"]);
    if (!sess || sess.status !== "active" || sess.account !== a.key) return deny(["NO_VALID_SESSION"]);
    if (sess.credV !== a.credentialVersion || sess.secRev !== a.securityRevision) return deny(["SESSION_INVALIDATED"]);
  }
  const resourceDir: Directory = res.authority === "AD" ? "AD" : "CLOUD";
  if (a.dir !== resourceDir) return deny(["DIRECTORY_MISMATCH"]);

  let paths: AccessPath[] = [];
  if (res.authority === "AD") {
    paths = adAcl.filter((e) => e.resource === res.key && e.actions.includes(cmd.action) && memberships.includes(e.group))
      .map((e) => ({ kind: "acl", group: e.group, scope: res.key }));
  } else {
    for (const asg of s.assignments) {
      if (!memberships.includes(asg.group)) continue;
      if (asg.scope !== res.key && asg.scope !== res.parent) continue;
      const role = roles.find((r) => r.key === asg.role);
      if (!role) continue;
      if ((role.authority === "AZURE") !== (res.authority === "AZURE")) continue;
      if (role.perms.some((p) => p.type === res.type && p.actions.includes(cmd.action))) {
        paths.push({ kind: "role", group: asg.group, role: role.key, scope: asg.scope, assignment: asg.key });
      }
    }
  }
  if (preview) return { ...base, decision: "preview", reasons: ["PREVIEW", paths.length ? "ALLOW" : "NO_MATCHING_GRANT"], paths };
  if (!paths.length) return deny(["NO_MATCHING_GRANT"]);

  if (res.key === "R-ABAC") {
    const ov = cmd.mode === "abac-what-if" ? cmd.overrides ?? {} : {};
    const dev = devices.find((d) => d.key === sess!.device);
    const attrs = {
      department: ov['department'] ?? a.dept,
      deviceTrust: ov['deviceTrust'] ?? dev?.trust ?? "unknown",
      classification: ov['classification'] ?? res.classification,
    };
    const vals = Object.values(attrs);
    if (vals.some((v) => !v || v === "unknown")) return deny(["ATTRIBUTE_MISSING"], paths, attrs);
    if (attrs.department !== "DEP-RESP" || attrs.deviceTrust !== "managed" || attrs.classification !== "Internal")
      return deny(["ABAC_CONDITION_FAILED"], paths, attrs);
    return { ...base, decision: "allow", reasons: ["ALLOW"], paths, attributes: attrs, overrides: cmd.mode === "abac-what-if" ? ov : undefined };
  }
  return { ...base, decision: "allow", reasons: ["ALLOW"], paths };
}

/** Effective grants for an account (all resources/actions), ignoring session. */
export function effectiveAccess(s: SimState, accountKey: string) {
  const out: { resource: string; action: string; paths: AccessPath[] }[] = [];
  const a = s.accounts.find((x) => x.key === accountKey);
  if (!a) return out;
  for (const r of resources) {
    for (const action of r.actions) {
      const t = evaluateAccess(s, { account: a.key, resource: r.key, action, mode: "preview" });
      if (t.paths.length) out.push({ resource: r.key, action, paths: t.paths });
    }
  }
  return out;
}

export { historicalAudit, historicalSignins };
