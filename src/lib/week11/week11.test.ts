import { describe, expect, it } from "vitest";
import { applyCommand, createSeedState, type Command, type SimState } from "./engine";
import { computeReadiness } from "./readiness.server";
import { ticketOutcome } from "./tickets.server";
import { devices, groups, historicalAudit, historicalSignins, ous, resources, roles } from "./seed";

let rev = 0;
function run(s: SimState, c: Command) {
  const r = applyCommand(s, c, { attemptShort: "TEST01", revision: rev++ });
  return { s: r.state ?? s, r: r.result };
}
function signIn(s: SimState, account: string, device: string) {
  const o = run(s, { type: "signin", account, device, credential: "current", mfa: "pass" });
  return { s: o.s, session: o.r.sessionKey! };
}
const test = (s: SimState, account: string, session: string | null, resource: string, action: string, extra: Partial<Extract<Command, { type: "test_access" }>> = {}) => {
  const o = run(s, { type: "test_access", account, session, resource, action, mode: "current-access", ...extra });
  return { s: o.s, t: o.s.tests.at(-1)!, r: o.r };
};

describe("Week 11 seed (DIR / LOG-01)", () => {
  it("matches the spec counts", () => {
    const s = createSeedState();
    expect(s.people).toHaveLength(8);
    expect(s.accounts).toHaveLength(14);
    expect(ous).toHaveLength(6);
    expect(groups).toHaveLength(13);
    expect(roles).toHaveLength(8);
    expect(resources).toHaveLength(11);
    expect(s.assignments).toHaveLength(10);
    expect(devices).toHaveLength(9);
    expect(s.accounts.some((a) => a.username === "jamie")).toBe(false);
    expect(historicalSignins).toHaveLength(12);
    expect(historicalAudit).toHaveLength(4);
    expect(historicalSignins.find((r) => r.event_id === "S009")?.correlation_id).toBe("C009");
    expect(historicalAudit.find((r) => r.event_id === "A002")?.correlation_id).toBe("C009");
  });
});

describe("engine fixtures", () => {
  it("ENG-01/02 authentication vs authorization", () => {
    let s = createSeedState();
    const si = signIn(s, "cl-blair", "managed-blair"); s = si.s;
    let x = test(s, "cl-blair", si.session, "R-CASE", "read"); s = x.s;
    expect(x.t.decision).toBe("deny"); expect(x.t.reasons).toContain("NO_MATCHING_GRANT");
    s = run(s, { type: "add_member", group: "GC-READ", account: "cl-blair", ticket: "T201" }).s;
    x = test(s, "cl-blair", si.session, "R-CASE", "read"); s = x.s;
    expect(x.t.decision).toBe("allow");
    expect(x.t.paths[0]).toMatchObject({ group: "GC-READ", role: "RL-READ", scope: "R-CASE" });
    x = test(s, "cl-blair", si.session, "R-CASE", "update");
    expect(x.t.decision).toBe("deny");
  });

  it("ENG-03 moving OU changes nothing about access", () => {
    let s = createSeedState();
    s = run(s, { type: "move_ou", account: "ad-blair", ou: "OU-RESP", reason: "test" }).s;
    const si = signIn(s, "ad-blair", "managed-blair"); s = si.s;
    expect(test(s, "ad-blair", si.session, "R-HAND", "read").t.decision).toBe("allow");
    expect(test(s, "ad-blair", si.session, "R-ADRESP", "read").t.decision).toBe("deny");
  });

  it("ENG-04/07 union of paths", () => {
    let s = createSeedState();
    s = run(s, { type: "add_member", group: "GC-RESP", account: "cl-casey", ticket: "T402" }).s;
    let si = signIn(s, "cl-casey", "managed-casey"); s = si.s;
    expect(test(s, "cl-casey", si.session, "R-AUD", "delete").t.decision).toBe("allow"); // GC-PRIV still there
    s = run(s, { type: "remove_member", group: "GC-PRIV", account: "cl-casey", ticket: "T402" }).s;
    expect(test(s, "cl-casey", si.session, "R-QUEUE", "update").t.decision).toBe("allow");
    expect(test(s, "cl-casey", si.session, "R-AUD", "delete").t.decision).toBe("deny");
    expect(test(s, "cl-casey", si.session, "R-DIR", "manage_sensitive_groups").t.decision).toBe("deny");
  });

  it("ENG-08/09 disable revokes sessions; enable needs fresh sign-in", () => {
    let s = createSeedState();
    const si = signIn(s, "cl-finley", "managed-finley"); s = si.s;
    s = run(s, { type: "set_status", account: "cl-finley", status: "disabled", ticket: "T503" }).s;
    expect(test(s, "cl-finley", si.session, "R-CASE", "read").t.reasons[0]).toBe("ACCOUNT_DISABLED");
    expect(run(s, { type: "signin", account: "cl-finley", device: "managed-finley", credential: "current", mfa: "pass" }).r.outcome).toBe("ACCOUNT_DISABLED");
    expect(s.accounts.find((a) => a.key === "ad-finley")!.status).toBe("enabled");
    s = run(s, { type: "set_status", account: "cl-finley", status: "enabled", reason: "reversal test" }).s;
    expect(test(s, "cl-finley", si.session, "R-CASE", "read").t.decision).toBe("deny");
  });

  it("ENG-10/11 verified vs refused reset", () => {
    let s = createSeedState();
    s = run(s, { type: "create_account", person: "P08", dir: "AD", ou: "OU-SUP", ticket: "T301" }).s;
    s = run(s, { type: "verify", ticket: "T302", route: "trusted", hrId: "CH-008" }).s;
    s = run(s, { type: "reset_credential", account: "ad-jamie", ticket: "T302" }).s;
    expect(s.accounts.find((a) => a.key === "ad-jamie")!.credentialVersion).toBe(2);
    s = run(s, { type: "verify", ticket: "T504", route: "trusted", hrId: "CH-002" }).s;
    expect(s.tickets.find((t) => t.key === "T504")!.verification).toBe("failed");
    const before = s.accounts.find((a) => a.key === "cl-blair")!;
    const r = run(s, { type: "reset_credential", account: "cl-blair", ticket: "T504" });
    expect(r.r.outcome).toBe("refused");
    expect(r.s.accounts.find((a) => a.key === "cl-blair")).toEqual(before);
  });

  it("ENG-12 lockout on third failure", () => {
    let s = createSeedState();
    for (let i = 0; i < 3; i++) s = run(s, { type: "signin", account: "cl-casey", device: "managed-casey", credential: "incorrect", mfa: "pass" }).s;
    expect(s.accounts.find((a) => a.key === "cl-casey")!.locked).toBe(true);
    expect(run(s, { type: "signin", account: "cl-casey", device: "managed-casey", credential: "current", mfa: "pass" }).r.outcome).toBe("ACCOUNT_LOCKED");
  });

  it("ENG-13 duplicate and cross-directory are rejected without mutation", () => {
    let s = createSeedState();
    s = run(s, { type: "create_account", person: "P08", dir: "AD", ou: "OU-SUP", ticket: "T301" }).s;
    const dup = applyCommand(s, { type: "create_account", person: "P08", dir: "AD", ou: "OU-SUP", ticket: "T301" }, { attemptShort: "X", revision: 0 });
    expect(dup.state).toBeNull();
    const cross = applyCommand(s, { type: "add_member", group: "GA-ALL", account: "cl-blair", reason: "test" }, { attemptShort: "X", revision: 0 });
    expect(cross.result.error?.code).toBe("DIRECTORY_MISMATCH");
  });

  it("ENG-14 Azure scope", () => {
    let s = createSeedState();
    s = run(s, { type: "assign_role", group: "GC-AZ", role: "RL-AZREAD", scope: "RG-LAB", ticket: "T505" }).s;
    s = run(s, { type: "add_member", group: "GC-AZ", account: "cl-blair", ticket: "T505" }).s;
    const si = signIn(s, "cl-blair", "managed-blair"); s = si.s;
    expect(test(s, "cl-blair", si.session, "R-VM1", "read_metadata").t.decision).toBe("allow");
    expect(test(s, "cl-blair", si.session, "R-VM1", "stop").t.decision).toBe("deny");
    expect(test(s, "cl-blair", si.session, "R-VM2", "read_metadata").t.decision).toBe("deny");
  });

  it("ENG-16 unsupported action is input error", () => {
    const s = createSeedState();
    expect(applyCommand(s, { type: "test_access", account: "cl-blair", resource: "R-LAND", action: "delete", mode: "current-access" }, { attemptShort: "X", revision: 0 }).result.error?.code).toBe("INVALID_ACTION");
  });

  it("ENG-17/18/19 ABAC", () => {
    let s = createSeedState();
    s = run(s, { type: "add_member", group: "GC-RESP", account: "cl-casey", ticket: "T402" }).s;
    const si = signIn(s, "cl-casey", "managed-casey"); s = si.s;
    expect(test(s, "cl-casey", si.session, "R-ABAC", "read").t.decision).toBe("allow");
    for (const ov of [{ deviceTrust: "unmanaged" }, { department: "DEP-AUD" }, { classification: "Confidential" }]) {
      const x = test(s, "cl-casey", si.session, "R-ABAC", "read", { mode: "abac-what-if", overrides: ov });
      expect(x.t.decision).toBe("deny"); s = x.s;
    }
    expect(test(s, "cl-casey", si.session, "R-ABAC", "read", { mode: "abac-what-if", overrides: { department: "unknown" } }).t.reasons).toContain("ATTRIBUTE_MISSING");
    expect(s.accounts.find((a) => a.key === "cl-casey")!.dept).toBe("DEP-RESP");
  });

  it("readiness starts incomplete and reports facts", () => {
    const r = computeReadiness(createSeedState(), {}, []);
    expect(r).toHaveLength(6);
    expect(r.every((m) => !m.ready)).toBe(true);
  });

  it("Lab 06 readiness is a case file: no manager-summary requirement, E19 required", () => {
    const r = computeReadiness(createSeedState(), {}, []).find((m) => m.mission === "M06")!;
    expect(r.missing.join(" ")).not.toMatch(/manager summary/i);
    expect(r.missing.some((x) => x.includes("E19"))).toBe(true);
  });
});

describe("ticket outcome validation (T201–T505)", () => {
  it("fresh seed: no ticket can be resolved", () => {
    const s = createSeedState();
    for (const k of ["T201", "T301", "T302", "T401", "T402", "T403", "T501", "T502", "T503", "T505"]) {
      expect(ticketOutcome(s, k, "resolved").ok, k).toBe(false);
    }
    expect(ticketOutcome(s, "T504", "resolved").unmet.join(" ")).toMatch(/cannot be resolved/i);
    expect(ticketOutcome(s, "T504", "escalated").ok).toBe(false);
  });

  it("T201 passes only with narrow read access", () => {
    let s = createSeedState();
    expect(ticketOutcome(s, "T201", "resolved").ok).toBe(false);
    s = run(s, { type: "add_member", group: "GC-READ", account: "cl-blair", ticket: "T201" }).s;
    expect(ticketOutcome(s, "T201", "resolved").ok).toBe(true);
    s = run(s, { type: "add_member", group: "GC-PRIV", account: "cl-blair", reason: "excess test" }).s;
    const o = ticketOutcome(s, "T201", "resolved");
    expect(o.ok).toBe(false);
    expect(o.unmet.join(" ")).toMatch(/beyond the approved read-only scope/);
  });

  it("T301/T302 require account, placement, memberships, verification and reset", () => {
    let s = createSeedState();
    s = run(s, { type: "create_account", person: "P08", dir: "AD", ou: "OU-SUP", ticket: "T301" }).s;
    expect(ticketOutcome(s, "T301", "resolved").ok).toBe(false); // no groups, disabled
    s = run(s, { type: "add_member", group: "GA-ALL", account: "ad-jamie", ticket: "T301" }).s;
    s = run(s, { type: "add_member", group: "GA-SUP", account: "ad-jamie", ticket: "T301" }).s;
    s = run(s, { type: "set_status", account: "ad-jamie", status: "enabled", ticket: "T301" }).s;
    expect(ticketOutcome(s, "T301", "resolved").ok).toBe(true);
    expect(ticketOutcome(s, "T302", "resolved").ok).toBe(false); // not verified
    s = run(s, { type: "verify", ticket: "T302", route: "trusted", hrId: "CH-008" }).s;
    expect(ticketOutcome(s, "T302", "resolved").ok).toBe(false); // no reset yet
    s = run(s, { type: "reset_credential", account: "ad-jamie", ticket: "T302" }).s;
    expect(ticketOutcome(s, "T302", "resolved").ok).toBe(false); // must-change pending
    const si = run(s, { type: "signin", account: "ad-jamie", device: "managed-jamie", credential: "current", mfa: "pass" });
    s = si.s;
    s = run(s, { type: "complete_credential_change", challenge: si.r.challengeKey! }).s;
    expect(ticketOutcome(s, "T302", "resolved").ok).toBe(true);
  });

  it("T402 fails while Casey keeps Privileged-Operators", () => {
    let s = createSeedState();
    s = run(s, { type: "add_member", group: "GC-RESP", account: "cl-casey", ticket: "T402" }).s;
    const o = ticketOutcome(s, "T402", "resolved");
    expect(o.ok).toBe(false);
    expect(o.unmet.join(" ")).toMatch(/Privileged-Operators/);
    s = run(s, { type: "remove_member", group: "GC-PRIV", account: "cl-casey", ticket: "T402" }).s;
    expect(ticketOutcome(s, "T402", "resolved").ok).toBe(true);
  });

  it("T503 requires full two-directory offboarding plus denied sign-in", () => {
    let s = createSeedState();
    const si = signIn(s, "cl-finley", "managed-finley"); s = si.s;
    void si;
    s = run(s, { type: "set_status", account: "cl-finley", status: "disabled", ticket: "T503" }).s;
    s = run(s, { type: "set_status", account: "ad-finley", status: "disabled", ticket: "T503" }).s;
    expect(ticketOutcome(s, "T503", "resolved").ok).toBe(false); // memberships + OU + denied sign-in missing
    s = run(s, { type: "remove_member", group: "GA-ALL", account: "ad-finley", ticket: "T503" }).s;
    s = run(s, { type: "remove_member", group: "GA-SUP", account: "ad-finley", ticket: "T503" }).s;
    s = run(s, { type: "remove_member", group: "GC-READ", account: "cl-finley", ticket: "T503" }).s;
    s = run(s, { type: "move_ou", account: "ad-finley", ou: "OU-DIS", ticket: "T503" }).s;
    expect(ticketOutcome(s, "T503", "resolved").ok).toBe(false); // denied sign-in not yet recorded
    s = run(s, { type: "signin", account: "cl-finley", device: "managed-finley", credential: "current", mfa: "pass" }).s;
    expect(ticketOutcome(s, "T503", "resolved").ok).toBe(true);
  });

  it("T504 escalation needs failed verification and an unchanged credential", () => {
    let s = createSeedState();
    s = run(s, { type: "verify", ticket: "T504", route: "trusted", hrId: "CH-002" }).s;
    expect(ticketOutcome(s, "T504", "escalated").ok).toBe(true);
    expect(ticketOutcome(s, "T504", "resolved").ok).toBe(false);
  });

  it("T505 requires the scoped assignment, membership and three tests", () => {
    let s = createSeedState();
    s = run(s, { type: "assign_role", group: "GC-AZ", role: "RL-AZREAD", scope: "RG-LAB", ticket: "T505" }).s;
    s = run(s, { type: "add_member", group: "GC-AZ", account: "cl-blair", ticket: "T505" }).s;
    expect(ticketOutcome(s, "T505", "resolved").ok).toBe(false); // tests missing
    const si = signIn(s, "cl-blair", "managed-blair"); s = si.s;
    s = test(s, "cl-blair", si.session, "R-VM1", "read_metadata").s;
    s = test(s, "cl-blair", si.session, "R-VM1", "stop").s;
    s = test(s, "cl-blair", si.session, "R-VM2", "read_metadata").s;
    expect(ticketOutcome(s, "T505", "resolved").ok).toBe(true);
  });
});
