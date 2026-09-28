import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AttemptView, EvidenceRow, Learner } from "./types";
import type { Command, SimState } from "./engine";
import { MISSION_IDS } from "./seed";

/**
 * Week 11 server operations. Every call re-derives the owner from the
 * authenticated session; request bodies never carry ownership. Writes use the
 * service client only after that check, through atomic database functions.
 */

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
const admin = async (): Promise<Admin> => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const short = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

async function isStaff(supabase: { from: (t: "user_roles") => any }, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) => r.role === "instructor" || r.role === "admin");
}

async function loadActive(db: Admin, userId: string) {
  const { data } = await db.from("w11_attempts" as never).select("*").eq("owner_user_id", userId).eq("status", "active").maybeSingle();
  return data as null | { id: string; state: SimState; learner: Learner; state_revision: number; text_revision: number; seed_version: string; status: "active" | "archived"; updated_at: string; owner_user_id: string };
}

async function view(db: Admin, row: NonNullable<Awaited<ReturnType<typeof loadActive>>>): Promise<AttemptView> {
  const { computeReadiness } = await import("./readiness.server");
  const [{ data: ev }, { data: arch }, { data: rev }] = await Promise.all([
    db.from("w11_evidence" as never).select("evidence_key,slot,mission,title,snapshot,content_hash,captured_revision,created_at").eq("attempt_id", row.id).order("created_at"),
    db.from("w11_attempts" as never).select("id,archived_at").eq("owner_user_id", row.owner_user_id).eq("status", "archived").order("archived_at", { ascending: false }),
    db.from("w11_reviews" as never).select("feedback,scores,created_at").eq("attempt_id", row.id).order("created_at", { ascending: false }),
  ]);
  const evidence = (ev ?? []) as unknown as EvidenceRow[];
  return {
    id: row.id, shortId: short(row.id), status: row.status, revision: row.state_revision, textRevision: row.text_revision,
    seedVersion: row.seed_version, state: row.state, learner: row.learner ?? {}, evidence,
    readiness: computeReadiness(row.state, row.learner ?? {}, evidence), updatedAt: row.updated_at,
    archived: ((arch ?? []) as { id: string; archived_at: string | null }[]).map((a) => ({ id: a.id, archivedAt: a.archived_at })),
    reviews: (rev ?? []) as AttemptView["reviews"],
  };
}

export const startOrResumeWeek11 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AttemptView> => {
    const db = await admin();
    let row = await loadActive(db, context.userId);
    if (!row) {
      const { createSeedState } = await import("./engine");
      const { SEED_VERSION } = await import("./seed");
      const { error } = await db.from("w11_attempts" as never).insert({ owner_user_id: context.userId, seed_version: SEED_VERSION, state: createSeedState(), learner: {} } as never);
      if (error && !String(error.message).includes("duplicate")) throw new Error("Could not start your Week 11 attempt.");
      row = await loadActive(db, context.userId);
      if (!row) throw new Error("Could not start your Week 11 attempt.");
    }
    return view(db, row);
  });

const cmdSchema = z.object({
  expectedRevision: z.number().int().min(0),
  idempotencyKey: z.string().min(8).max(80),
  command: z.record(z.unknown()).refine((c) => typeof c['type'] === "string"),
});

export const executeWeek11Command = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cmdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    const { applyCommand } = await import("./engine");
    const { createHash } = await import("node:crypto");
    const hash = createHash("sha256").update(JSON.stringify(data.command)).digest("hex");
    // Replays with the same key return the stored result.
    const { data: prior } = await db.from("w11_actions" as never).select("request_hash,result").eq("attempt_id", row.id).eq("idempotency_key", data.idempotencyKey).maybeSingle();
    if (prior) {
      const p = prior as { request_hash: string; result: import("./engine").CommandResult };
      if (p.request_hash !== hash) return { conflict: "IDEMPOTENCY_CONFLICT" as const, view: await view(db, row) };
      return { result: p.result, view: await view(db, row) };
    }
    if (row.state_revision !== data.expectedRevision) return { conflict: "STATE_CHANGED" as const, view: await view(db, row) };
    // Ticket resolution requires the approved outcome in current state.
    const cmd = data.command as unknown as Command;
    if (cmd.type === "ticket_status" && (cmd.status === "resolved" || cmd.status === "escalated")) {
      const { ticketOutcome } = await import("./tickets.server");
      const o = ticketOutcome(row.state, cmd.ticket, cmd.status);
      if (!o.ok) {
        const message = `${cmd.ticket} can't be marked ${cmd.status} yet. Still missing: ${o.unmet.join(" ")} Correct the state and try again — nothing was changed.`;
        return { result: { ok: false, message, error: { code: "OUTCOME_UNMET", message } }, view: await view(db, row) };
      }
    }
    let out;
    try {
      out = applyCommand(row.state, data.command as unknown as Command, { attemptShort: short(row.id), revision: row.state_revision });
    } catch {
      return { result: { ok: false, message: "Invalid command input.", error: { code: "INVALID_INPUT", message: "Invalid command input." } }, view: await view(db, row) };
    }
    if (!out.state) return { result: out.result, view: await view(db, row) };
    const { data: rpc, error } = await db.rpc("w11_commit_command" as never, {
      p_attempt: row.id, p_expected_revision: data.expectedRevision, p_idem: data.idempotencyKey, p_hash: hash,
      p_action_type: String(data.command['type']), p_new_state: out.state, p_new_seq: out.state.seq, p_result: out.result,
      p_actor_kind: "learner", p_actor: context.userId,
    } as never);
    if (error) throw new Error("Not saved — the simulator could not record that action. Try again.");
    const r = rpc as { error?: string };
    const fresh = await loadActive(db, context.userId);
    if (r.error) return { conflict: r.error, view: await view(db, fresh ?? row) };
    return { result: out.result, view: await view(db, fresh!) };
  });

const evSchema = z.object({
  mission: z.string().regex(/^M0[1-6]$/),
  slot: z.string().regex(/^E(0[1-9]|1[0-9])$/),
  title: z.string().min(3).max(200),
  refs: z.object({
    accounts: z.array(z.string().max(40)).max(30).default([]),
    groups: z.array(z.string().max(40)).max(30).default([]),
    tests: z.array(z.string().max(60)).max(40).default([]),
    signins: z.array(z.string().max(60)).max(40).default([]),
    audits: z.array(z.string().max(60)).max(60).default([]),
    tickets: z.array(z.string().max(40)).max(20).default([]),
    historical: z.array(z.string().max(10)).max(20).default([]),
  }),
  caption: z.string().max(2000).default(""),
});

export const captureWeek11Evidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => evSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    const { effectiveAccess, accountDn } = await import("./engine");
    const { historicalSignins, historicalAudit, ous } = await import("./seed");
    const s = row.state;
    const snapshot = {
      captured_revision: row.state_revision, seed: row.seed_version,
      accounts: data.refs.accounts.map((k) => { const a = s.accounts.find((x) => x.key === k); return a ? { ...a, dn: accountDn(s, a), ouName: ous.find((o) => o.key === a.ou)?.name ?? null, person: s.people.find((p) => p.key === a.person), groups: s.memberships.filter((m) => m.account === k).map((m) => m.group), effectiveAccess: effectiveAccess(s, k), activeSessions: s.sessions.filter((x) => x.account === k && x.status === "active").map((x) => x.key) } : { key: k, missing: true }; }),
      groups: data.refs.groups.map((g) => ({ group: g, members: s.memberships.filter((m) => m.group === g).map((m) => m.account), assignments: s.assignments.filter((a) => a.group === g) })),
      tests: s.tests.filter((t) => data.refs.tests.includes(t.id)),
      signins: s.signins.filter((x) => data.refs.signins.includes(x.id)),
      audits: s.audits.filter((x) => data.refs.audits.includes(x.id)),
      tickets: s.tickets.filter((t) => data.refs.tickets.includes(t.key)),
      historical: [...historicalSignins, ...historicalAudit].filter((r) => data.refs.historical.includes(r.event_id)),
    };
    const { createHash } = await import("node:crypto");
    const body = JSON.stringify(snapshot);
    const { count } = await db.from("w11_evidence" as never).select("id", { count: "exact", head: true }).eq("attempt_id", row.id);
    const key = `EV-${short(row.id)}-${String((count ?? 0) + 1).padStart(3, "0")}`;
    const { error } = await db.from("w11_evidence" as never).insert({ attempt_id: row.id, evidence_key: key, slot: data.slot, mission: data.mission, title: data.title, snapshot, content_hash: createHash("sha256").update(body).digest("hex"), captured_revision: row.state_revision } as never);
    if (error) throw new Error("Evidence not saved. Try again.");
    if (data.caption.trim()) {
      const learner = { ...(row.learner ?? {}), captions: { ...(row.learner?.captions ?? {}), [key]: data.caption } };
      await db.from("w11_attempts" as never).update({ learner, text_revision: row.text_revision + 1 } as never).eq("id", row.id).eq("text_revision", row.text_revision);
    }
    return view(db, (await loadActive(db, context.userId))!);
  });

const learnerSchema = z.object({
  expectedTextRevision: z.number().int().min(0),
  learner: z.object({
    displayName: z.string().max(120).optional(),
    missions: z.record(z.object({ answers: z.record(z.string().max(5000)).optional(), trace: z.record(z.string().max(200)).optional() })).optional(),
    captions: z.record(z.string().max(2000)).optional(),
    findings: z.array(z.object({ key: z.string().max(20), title: z.string().max(200), refs: z.array(z.string().max(10)).max(20), observation: z.string().max(5000), hypothesis: z.string().max(5000), conclusion: z.string().max(5000), uncertainty: z.string().max(5000), nextAction: z.string().max(5000), priority: z.enum(["", "high", "medium", "low"]), rationale: z.string().max(5000) })).max(10).optional(),
    comparison: z.object({ refs: z.array(z.string().max(10)).max(20), text: z.string().max(5000) }).optional(),
    report: z.object({ sections: z.record(z.string().max(5000)).optional(), managerSummary: z.string().max(5000).optional(), limitations: z.string().max(5000).optional(), liveChain: z.string().max(5000).optional() }).optional(),
  }),
});

export const saveWeek11Text = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => learnerSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    if (JSON.stringify(data.learner).length > 120_000) return { conflict: "TOO_LONG" as const, textRevision: row.text_revision };
    if (row.text_revision !== data.expectedTextRevision) return { conflict: "STATE_CHANGED" as const, textRevision: row.text_revision, learner: row.learner };
    const { data: upd, error } = await db.from("w11_attempts" as never).update({ learner: data.learner, text_revision: row.text_revision + 1, updated_at: new Date().toISOString() } as never).eq("id", row.id).eq("text_revision", row.text_revision).select("text_revision");
    if (error) throw new Error("Not saved.");
    if (!upd || !(upd as unknown[]).length) return { conflict: "STATE_CHANGED" as const, textRevision: row.text_revision, learner: row.learner };
    return { textRevision: row.text_revision + 1, savedAt: new Date().toISOString() };
  });

export const getWeek11Readiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    return (await view(db, row)).readiness;
  });

export const exportWeek11 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    const v = await view(db, row);
    const { buildExport } = await import("./export.server");
    return buildExport({ attemptLabel: `attempt ${v.shortId}`, revision: v.revision, textRevision: v.textRevision, state: v.state, learner: v.learner, evidence: v.evidence, readiness: v.readiness });
  });

export const exportWeek11Lab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ mission: z.enum(MISSION_IDS) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    const v = await view(db, row);
    const { buildLabExport } = await import("./export.server");
    return buildLabExport({ attemptLabel: `attempt ${v.shortId}`, revision: v.revision, textRevision: v.textRevision, state: v.state, learner: v.learner, evidence: v.evidence, readiness: v.readiness }, data.mission);
  });

const resetSchema = z.object({ expectedRevision: z.number().int(), idempotencyKey: z.string().min(8).max(80), confirm: z.literal("RESET"), reason: z.string().min(3).max(500) });

export const resetWeek11 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadActive(db, context.userId);
    if (!row) throw new Error("No active attempt.");
    const { createSeedState } = await import("./engine");
    const { data: r, error } = await db.rpc("w11_reset_attempt" as never, { p_attempt: row.id, p_expected_revision: data.expectedRevision, p_idem: `${context.userId}:${data.idempotencyKey}`, p_seed_state: createSeedState(), p_actor: context.userId, p_actor_kind: "learner", p_reason: data.reason } as never);
    if (error) throw new Error("Reset failed. Your current attempt is unchanged.");
    if ((r as { error?: string }).error) return { conflict: (r as { error: string }).error };
    return { view: await view(db, (await loadActive(db, context.userId))!) };
  });

/* ------------------------------ Instructor ------------------------------ */

export const listWeek11Attempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const { data, error } = await context.supabase.from("w11_attempts" as never).select("id,owner_user_id,status,state_revision,text_revision,updated_at,learner").order("updated_at", { ascending: false });
    if (error) throw new Error("Unable to load attempts.");
    const rows = (data ?? []) as unknown as { id: string; owner_user_id: string; status: string; state_revision: number; text_revision: number; updated_at: string; learner: Learner }[];
    const ids = [...new Set(rows.map((r) => r.owner_user_id))];
    const { data: profiles } = ids.length ? await context.supabase.from("profiles").select("id,email,display_name").in("id", ids) : { data: [] };
    return rows.map((r) => {
      const p = (profiles ?? []).find((x) => x.id === r.owner_user_id);
      return { id: r.id, shortId: short(r.id), status: r.status, revision: r.state_revision, textRevision: r.text_revision, updatedAt: r.updated_at, learnerName: r.learner?.displayName ?? "", email: p?.email ?? null, ownerId: r.owner_user_id };
    });
  });

export const getWeek11AttemptForInstructor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w11_attempts" as never).select("*").eq("id", data.attemptId).maybeSingle();
    if (!row) throw new Error("Not found");
    const { week11InstructorKey } = await import("./instructor-key.server");
    return { view: await view(db, row as never), key: week11InstructorKey };
  });

export const getWeek11InstructorKey = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const { week11InstructorKey } = await import("./instructor-key.server");
    return week11InstructorKey;
  });

export const reviewWeek11 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid(), scores: z.record(z.number().min(0).max(25)), feedback: z.string().max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w11_attempts" as never).select("text_revision").eq("id", data.attemptId).maybeSingle();
    if (!row) throw new Error("Not found");
    const { error } = await db.from("w11_reviews" as never).insert({ attempt_id: data.attemptId, instructor_id: context.userId, scores: data.scores, feedback: data.feedback, text_revision: (row as { text_revision: number }).text_revision } as never);
    if (error) throw new Error("Review not saved.");
    return { ok: true };
  });

export const instructorResetWeek11 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid(), reason: z.string().min(5).max(500), idempotencyKey: z.string().min(8).max(80), confirm: z.literal("RESET") }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w11_attempts" as never).select("state_revision,status").eq("id", data.attemptId).maybeSingle();
    if (!row || (row as { status: string }).status !== "active") throw new Error("Only an active attempt can be reset.");
    const { createSeedState } = await import("./engine");
    const { data: r, error } = await db.rpc("w11_reset_attempt" as never, { p_attempt: data.attemptId, p_expected_revision: (row as { state_revision: number }).state_revision, p_idem: `${context.userId}:${data.idempotencyKey}`, p_seed_state: createSeedState(), p_actor: context.userId, p_actor_kind: "instructor", p_reason: data.reason } as never);
    if (error || (r as { error?: string }).error) throw new Error("Reset failed; the attempt is unchanged.");
    return { ok: true };
  });
