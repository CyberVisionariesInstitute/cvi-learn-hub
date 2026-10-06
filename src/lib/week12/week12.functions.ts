import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { WEEK12_FILES, type ExecOption, type SourceSnapshot, type W12Content, type Week12View } from "./model";

/**
 * Week 12 server operations. The owner is always the authenticated session
 * user; requests never carry an owner or Week 11 attempt id. Week 12 only
 * reads Week 11 rows — it never writes to them.
 */

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
const admin = async (): Promise<Admin> => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

interface W12Row {
  id: string; owner_user_id: string; status: string; source_w11_attempt_id: string | null; source_snapshot: SourceSnapshot; source_snapshot_hash: string;
  source_text_revision: number; source_state_revision: number; source_captured_at: string; exec_option: ExecOption; content: W12Content;
  text_revision: number; volunteer_status: "none" | "volunteered" | "withdrawn"; presenter_selected: boolean; updated_at: string;
}
interface W11Row { id: string; status: "active" | "archived"; archived_at: string | null; learner: never; text_revision: number; state_revision: number; state: never; owner_user_id: string }

async function isStaff(supabase: { from: (t: "user_roles") => any }, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) => r.role === "instructor" || r.role === "admin");
}

async function loadW12(db: Admin, userId: string) {
  const { data } = await db.from("w12_attempts" as never).select("*").eq("owner_user_id", userId).eq("status", "active").maybeSingle();
  return data as W12Row | null;
}

/** The student's own current Week 11 source: active attempt, else most recent archived. */
async function currentW11(db: Admin, userId: string) {
  const { data: active } = await db.from("w11_attempts" as never).select("*").eq("owner_user_id", userId).eq("status", "active").maybeSingle();
  if (active) return active as W11Row;
  const { data: arch } = await db.from("w11_attempts" as never).select("*").eq("owner_user_id", userId).eq("status", "archived").order("archived_at", { ascending: false }).limit(1).maybeSingle();
  return (arch as W11Row | null) ?? null;
}

async function snapshotFor(db: Admin, w11: W11Row) {
  const [{ computeReadiness }, { buildSnapshot, snapshotHash }] = await Promise.all([import("@/lib/week11/readiness.server"), import("./source.server")]);
  const { data: ev } = await db.from("w11_evidence" as never).select("evidence_key,slot,mission,title,snapshot,content_hash,captured_revision,created_at").eq("attempt_id", w11.id).order("created_at");
  const evidence = (ev ?? []) as never[];
  const m06 = computeReadiness(w11.state, w11.learner ?? {}, evidence).find((r) => r.mission === "M06") ?? { ready: false, missing: ["Lab 06 case file not started."] };
  const snap = buildSnapshot(w11, evidence, m06);
  return { snap, hash: snapshotHash(snap) };
}

async function view(db: Admin, row: W12Row): Promise<Week12View> {
  const { detectSourceChange } = await import("./source.server");
  const { normalizeContent } = await import("./model");
  const cur = await currentW11(db, row.owner_user_id);
  const { data: rev } = await db.from("w12_reviews" as never).select("feedback,scores,created_at").eq("attempt_id", row.id).order("created_at", { ascending: false });
  let change = detectSourceChange({ sourceId: row.source_w11_attempt_id, textRevision: row.source_text_revision, stateRevision: row.source_state_revision }, cur);
  if (!change && row.source_snapshot.sourceStatus === "archived") change = { kind: "archived", detail: "Week 12 is using your most recent archived Week 11 attempt because no active attempt was found." };
  return {
    id: row.id, textRevision: row.text_revision, execOption: row.exec_option, content: normalizeContent(row.content), snapshot: row.source_snapshot,
    snapshotHash: row.source_snapshot_hash, capturedAt: row.source_captured_at, updatedAt: row.updated_at, volunteerStatus: row.volunteer_status,
    presenterSelected: row.presenter_selected, sourceChange: change, reviews: (rev ?? []) as Week12View["reviews"],
  };
}

export const startOrResumeWeek12 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ blocked: "NO_WEEK11" } | { view: Week12View }> => {
    const db = await admin();
    let row = await loadW12(db, context.userId);
    if (!row) {
      const w11 = await currentW11(db, context.userId);
      if (!w11) return { blocked: "NO_WEEK11" };
      const { snap, hash } = await snapshotFor(db, w11);
      const { seedContent } = await import("./model");
      const { error } = await db.from("w12_attempts" as never).insert({
        owner_user_id: context.userId, source_w11_attempt_id: w11.id, source_snapshot: snap, source_snapshot_hash: hash,
        source_text_revision: w11.text_revision, source_state_revision: w11.state_revision, content: seedContent(snap),
      } as never);
      if (error && !String(error.message).includes("duplicate")) throw new Error("Could not start Week 12.");
      row = await loadW12(db, context.userId);
      if (!row) throw new Error("Could not start Week 12.");
    }
    return { view: await view(db, row) };
  });

const s = (n: number) => z.string().max(n).default("");
const contentSchema = z.object({
  classify: z.record(z.enum(["fact", "finding", "evidence", "interpretation", "unknown", "recommendation"])).default({}),
  findings: z.array(z.object({ key: z.string().max(10), sourceFindingKey: s(20), statement: s(3000), evidenceRefs: z.array(z.string().max(24)).max(30).default([]), confidence: z.enum(["", "confirmed", "likely", "possible"]).default(""), uncertainty: s(2000) })).max(12).default([]),
  report: z.object({ title: s(200), analyst: s(120), purpose: s(4000), scope: s(4000), evidenceReviewed: s(4000), timeline: s(6000), impact: s(4000), limitations: s(4000), conclusion: s(4000) }),
  recommendations: z.array(z.object({ key: z.string().max(10), action: s(1500), owner: s(200), why: s(1500), priority: z.enum(["", "high", "medium", "low"]).default(""), timeframe: s(200), linkedFindings: z.array(z.string().max(10)).max(12).default([]), successMeasure: s(1500) })).max(12).default([]),
  written: z.object({ whatHappened: s(3000), whyMatters: s(3000), whatFound: s(3000), nextSteps: s(3000), uncertain: s(3000) }),
  video: z.object({ url: s(500), platform: s(80), duration: s(20), accessChecked: z.boolean().default(false), outline: s(4000), reflection: s(2000) }),
  acks: z.record(z.string().max(800)).default({}),
});

export const saveWeek12Draft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ expectedTextRevision: z.number().int().min(0), execOption: z.enum(["", "written", "video"]), content: contentSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadW12(db, context.userId);
    if (!row) throw new Error("No Week 12 attempt.");
    if (row.text_revision !== data.expectedTextRevision) return { conflict: "STATE_CHANGED" as const, textRevision: row.text_revision };
    const { data: upd, error } = await db.from("w12_attempts" as never).update({ content: data.content, exec_option: data.execOption, text_revision: row.text_revision + 1 } as never)
      .eq("id", row.id).eq("text_revision", row.text_revision).select("text_revision");
    if (error) throw new Error("Not saved.");
    if (!upd || !(upd as unknown[]).length) return { conflict: "STATE_CHANGED" as const, textRevision: row.text_revision };
    return { textRevision: row.text_revision + 1, savedAt: new Date().toISOString() };
  });

/** Student-triggered only: replace the frozen source with the current Week 11 case file. Week 12 writing is kept. */
export const refreshWeek12Source = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ confirm: z.literal("REFRESH") }).parse(d))
  .handler(async ({ context }) => {
    const db = await admin();
    const row = await loadW12(db, context.userId);
    if (!row) throw new Error("No Week 12 attempt.");
    const w11 = await currentW11(db, context.userId);
    if (!w11) throw new Error("No Week 11 attempt found.");
    const { snap, hash } = await snapshotFor(db, w11);
    const { error } = await db.from("w12_attempts" as never).update({
      source_w11_attempt_id: w11.id, source_snapshot: snap, source_snapshot_hash: hash, source_text_revision: w11.text_revision,
      source_state_revision: w11.state_revision, source_captured_at: new Date().toISOString(),
    } as never).eq("id", row.id);
    if (error) throw new Error("Refresh failed; your Week 12 work is unchanged.");
    return { view: await view(db, (await loadW12(db, context.userId))!) };
  });

export const setWeek12Volunteer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ volunteer: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadW12(db, context.userId);
    if (!row) throw new Error("No Week 12 attempt.");
    const patch: Record<string, unknown> = { volunteer_status: data.volunteer ? "volunteered" : (row.volunteer_status === "none" ? "none" : "withdrawn") };
    if (!data.volunteer) { patch['presenter_selected'] = false; patch['presenter_selected_by'] = null; patch['presenter_selected_at'] = null; }
    const { error } = await db.from("w12_attempts" as never).update(patch as never).eq("id", row.id);
    if (error) throw new Error("Not saved.");
    return { volunteerStatus: patch['volunteer_status'] as Week12View["volunteerStatus"] };
  });

export const exportWeek12 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const row = await loadW12(db, context.userId);
    if (!row) throw new Error("No Week 12 attempt.");
    const { buildWeek12Zip } = await import("./export.server");
    return buildWeek12Zip({ snapshot: row.source_snapshot, snapshotHash: row.source_snapshot_hash, capturedAt: row.source_captured_at, content: row.content, execOption: row.exec_option });
  });

export const exportWeek12File = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ file: z.enum(WEEK12_FILES) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const row = await loadW12(db, context.userId);
    if (!row) throw new Error("No Week 12 attempt.");
    const { buildWeek12Files } = await import("./export.server");
    const { computeQA } = await import("./model");
    const files = buildWeek12Files({ snapshot: row.source_snapshot, snapshotHash: row.source_snapshot_hash, capturedAt: row.source_captured_at, content: row.content, execOption: row.exec_option });
    const content = files[`week-12/${data.file}`];
    if (content === undefined) throw new Error("That file isn't part of your selected executive format.");
    return { filename: data.file.split("/").pop()!, content, draft: !computeQA(row.source_snapshot, row.content, row.exec_option).ready };
  });

/* ------------------------------ Instructor ------------------------------ */

export const listWeek12Attempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const { data, error } = await context.supabase.from("w12_attempts" as never).select("id,owner_user_id,status,exec_option,content,source_snapshot,updated_at,volunteer_status,presenter_selected").eq("status", "active").order("updated_at", { ascending: false });
    if (error) throw new Error("Unable to load Week 12 attempts.");
    const rows = (data ?? []) as unknown as W12Row[];
    const ids = [...new Set(rows.map((r) => r.owner_user_id))];
    const { data: profiles } = ids.length ? await context.supabase.from("profiles").select("id,email,display_name").in("id", ids) : { data: [] };
    const { data: revs } = rows.length ? await context.supabase.from("w12_reviews" as never).select("attempt_id").in("attempt_id", rows.map((r) => r.id)) : { data: [] };
    const reviewed = new Set(((revs ?? []) as { attempt_id: string }[]).map((r) => r.attempt_id));
    const { computeQA } = await import("./model");
    return rows.map((r) => {
      const p = (profiles ?? []).find((x) => x.id === r.owner_user_id);
      return {
        id: r.id, learnerName: r.content?.report?.analyst || p?.display_name || "", email: p?.email ?? null, execOption: r.exec_option,
        ready: computeQA(r.source_snapshot, r.content, r.exec_option).ready, updatedAt: r.updated_at, reviewed: reviewed.has(r.id),
        volunteerStatus: r.volunteer_status, presenterSelected: r.presenter_selected,
      };
    });
  });

export const getWeek12AttemptForInstructor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w12_attempts" as never).select("*").eq("id", data.attemptId).maybeSingle();
    if (!row) throw new Error("Not found");
    return view(db, row as W12Row);
  });

export const reviewWeek12 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid(), scores: z.record(z.number().min(0).max(4)), feedback: z.string().max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w12_attempts" as never).select("text_revision").eq("id", data.attemptId).maybeSingle();
    if (!row) throw new Error("Not found");
    const { error } = await db.from("w12_reviews" as never).insert({ attempt_id: data.attemptId, instructor_id: context.userId, scores: data.scores, feedback: data.feedback, text_revision: (row as { text_revision: number }).text_revision } as never);
    if (error) throw new Error("Review not saved.");
    return { ok: true };
  });

/** Live-presentation selection: separate from scores and readiness; max two (enforced in the database). */
export const selectWeek12Presenter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid(), selected: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isStaff(context.supabase as never, context.userId))) throw new Error("Forbidden");
    const db = await admin();
    const { data: row } = await db.from("w12_attempts" as never).select("volunteer_status").eq("id", data.attemptId).maybeSingle();
    if (!row) throw new Error("Not found");
    if (data.selected && (row as { volunteer_status: string }).volunteer_status !== "volunteered") throw new Error("Only students who volunteered can be selected.");
    const { error } = await db.from("w12_attempts" as never).update({ presenter_selected: data.selected, presenter_selected_by: data.selected ? context.userId : null, presenter_selected_at: data.selected ? new Date().toISOString() : null } as never).eq("id", data.attemptId);
    if (error) throw new Error(String(error.message).includes("PRESENTER_LIMIT") ? "Two presenters are already selected. Unselect one first." : "Selection not saved.");
    return { ok: true };
  });
