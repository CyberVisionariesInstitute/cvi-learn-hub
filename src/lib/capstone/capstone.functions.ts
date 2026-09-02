import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAGE_KEYS, type ProjectState } from "./model";

/**
 * Student-facing Phase 3 server functions.
 * Every handler runs as the caller under RLS: a student can only ever reach
 * their own assignment, their own project, and the redacted scenario view for
 * the exact version they were assigned.
 */

const stageItemSchema = z.record(z.string(), z.string());
const stageStateSchema = z.object({
  notes: z.string().max(20000),
  items: z.array(stageItemSchema).max(200),
});
const projectStateSchema = z.record(z.enum(STAGE_KEYS as [string, ...string[]]), stageStateSchema);

async function audit(
  supabase: any,
  entry: {
    actor_id: string;
    assignment_id?: string | null;
    project_id?: string | null;
    action: string;
    detail?: Record<string, unknown>;
  },
) {
  await supabase.from("audit_log").insert({
    actor_id: entry.actor_id,
    assignment_id: entry.assignment_id ?? null,
    project_id: entry.project_id ?? null,
    action: entry.action,
    detail: entry.detail ?? {},
  });
}

async function signPayload(payload: string) {
  const { createHmac } = await import("crypto");
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_URL"] ?? "cvi";
  return createHmac("sha256", key).update(payload).digest("hex");
}

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isStaff = (roles ?? []).some((r) => r.role === "instructor" || r.role === "admin");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", userId)
      .maybeSingle();

    const { data: assignment } = await supabase
      .from("assignments")
      .select("id, scenario_package_id, scenario_code, scenario_version, state, created_at")
      .eq("user_id", userId)
      .eq("state", "active")
      .maybeSingle();

    if (!assignment) {
      return { profile, isStaff, assignment: null } as const;
    }

    const { data: scenario } = await supabase
      .from("scenario_student_views")
      .select("organization, brief, constraints, requirements, workloads, scenario_version")
      .eq("scenario_package_id", assignment.scenario_package_id)
      .eq("scenario_version", assignment.scenario_version)
      .maybeSingle();

    let { data: project } = await supabase
      .from("projects")
      .select("id, state, revision, updated_at, scenario_code, scenario_version")
      .eq("assignment_id", assignment.id)
      .maybeSingle();

    if (!project) {
      const created = await supabase
        .from("projects")
        .insert({
          assignment_id: assignment.id,
          owner_id: userId,
          scenario_code: assignment.scenario_code,
          scenario_version: assignment.scenario_version,
          state: {},
        })
        .select("id, state, revision, updated_at, scenario_code, scenario_version")
        .single();
      if (created.error) throw new Error(created.error.message);
      project = created.data;
      await audit(supabase, {
        actor_id: userId,
        assignment_id: assignment.id,
        project_id: project.id,
        action: "project.created",
      });
    }

    const [{ data: checkpoints }, { data: evidence }, { data: events }, { data: submission }] =
      await Promise.all([
        supabase.from("checkpoints").select("*").eq("project_id", project.id),
        supabase
          .from("evidence_items")
          .select("*")
          .eq("project_id", project.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("hidden_events")
          .select("id, event_key, title, student_brief, activated_at, acknowledged_at")
          .eq("assignment_id", assignment.id)
          .not("activated_at", "is", null),
        supabase.from("submissions").select("*").eq("project_id", project.id).maybeSingle(),
      ]);

    return {
      profile,
      isStaff,
      assignment,
      scenario,
      project,
      checkpoints: checkpoints ?? [],
      evidence: evidence ?? [],
      events: events ?? [],
      submission: submission ?? null,
    } as const;
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        state: projectStateSchema,
        note: z.string().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: current, error } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, revision")
      .eq("id", data.projectId)
      .single();
    if (error || !current || current.owner_id !== userId) throw new Error("Forbidden");

    const nextRevision = current.revision + 1;

    const updated = await supabase
      .from("projects")
      .update({ state: data.state as never, revision: nextRevision })
      .eq("id", current.id)
      .select("id, state, revision, updated_at, scenario_code, scenario_version")
      .single();
    if (updated.error) throw new Error(updated.error.message);

    await supabase.from("project_revisions").insert({
      project_id: current.id,
      owner_id: userId,
      revision: nextRevision,
      state: data.state as never,
      note: data.note ?? null,
    });

    await audit(supabase, {
      actor_id: userId,
      assignment_id: current.assignment_id,
      project_id: current.id,
      action: "project.saved",
      detail: { revision: nextRevision },
    });

    return updated.data;
  });

export const listRevisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("project_revisions")
      .select("id, revision, note, created_at")
      .eq("project_id", data.projectId)
      .order("revision", { ascending: false })
      .limit(50);
    return rows ?? [];
  });

export const restoreRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), revisionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rev } = await supabase
      .from("project_revisions")
      .select("state, revision, owner_id, project_id")
      .eq("id", data.revisionId)
      .single();
    if (!rev || rev.owner_id !== userId || rev.project_id !== data.projectId)
      throw new Error("Forbidden");

    const { data: current } = await supabase
      .from("projects")
      .select("revision, owner_id, assignment_id")
      .eq("id", data.projectId)
      .single();
    if (!current || current.owner_id !== userId) throw new Error("Forbidden");

    const nextRevision = current.revision + 1;
    await supabase
      .from("projects")
      .update({ state: rev.state, revision: nextRevision })
      .eq("id", data.projectId);
    await supabase.from("project_revisions").insert({
      project_id: data.projectId,
      owner_id: userId,
      revision: nextRevision,
      state: rev.state,
      note: `Restored revision ${rev.revision}`,
    });
    await audit(supabase, {
      actor_id: userId,
      assignment_id: current.assignment_id,
      project_id: data.projectId,
      action: "project.restored",
      detail: { from: rev.revision, to: nextRevision },
    });
    return { revision: nextRevision, state: rev.state as ProjectState };
  });

export const addEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        stage: z.enum(STAGE_KEYS as [string, ...string[]]),
        week: z.number().int().min(17).max(24).optional(),
        title: z.string().min(1).max(200),
        body: z.string().max(8000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const inserted = await supabase
      .from("evidence_items")
      .insert({
        project_id: data.projectId,
        owner_id: userId,
        stage: data.stage,
        week: data.week ?? null,
        title: data.title,
        body: data.body ?? null,
      })
      .select("*")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    await audit(supabase, {
      actor_id: userId,
      project_id: data.projectId,
      action: "evidence.added",
      detail: { stage: data.stage },
    });
    return inserted.data;
  });

export const deleteEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("evidence_items")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const completeCheckpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        stage: z.enum(STAGE_KEYS as [string, ...string[]]),
        week: z.number().int().min(17).max(24),
        done: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = await supabase
      .from("checkpoints")
      .upsert(
        {
          project_id: data.projectId,
          owner_id: userId,
          stage: data.stage,
          week: data.week,
          student_state: data.done ? "complete" : "in_progress",
          completed_at: data.done ? new Date().toISOString() : null,
        },
        { onConflict: "project_id,stage" },
      )
      .select("*")
      .single();
    if (row.error) throw new Error(row.error.message);
    await audit(supabase, {
      actor_id: userId,
      project_id: data.projectId,
      action: data.done ? "checkpoint.completed" : "checkpoint.reopened",
      detail: { stage: data.stage },
    });
    return row.data;
  });

export const acknowledgeEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("hidden_events")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.supabase, {
      actor_id: context.userId,
      action: "event.acknowledged",
      detail: { id: data.id },
    });
    return { ok: true };
  });

export const submitCapstone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ projectId: z.string().uuid(), defenseNotes: z.string().max(20000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: project } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, state, revision, scenario_code, scenario_version")
      .eq("id", data.projectId)
      .single();
    if (!project || project.owner_id !== userId) throw new Error("Forbidden");

    const { data: evidence } = await supabase
      .from("evidence_items")
      .select("stage, week, title, body, created_at")
      .eq("project_id", project.id);

    const snapshot = {
      scenario_code: project.scenario_code,
      scenario_version: project.scenario_version,
      revision: project.revision,
      state: project.state,
      evidence: evidence ?? [],
      submitted_at: new Date().toISOString(),
    };

    const inserted = await supabase
      .from("submissions")
      .upsert(
        {
          project_id: project.id,
          owner_id: userId,
          snapshot: snapshot as never,
          defense_notes: data.defenseNotes,
          review_state: "submitted",
        },
        { onConflict: "project_id" },
      )
      .select("*")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);

    await supabase.from("assignments").update({ state: "submitted" }).eq("id", project.assignment_id);
    await audit(supabase, {
      actor_id: userId,
      assignment_id: project.assignment_id,
      project_id: project.id,
      action: "capstone.submitted",
      detail: { revision: project.revision },
    });
    return inserted.data;
  });

export const exportProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: project } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, state, revision, scenario_code, scenario_version")
      .eq("id", data.projectId)
      .single();
    if (!project || project.owner_id !== userId) throw new Error("Forbidden");

    const body = {
      format: "cvi-phase3-project",
      formatVersion: 1,
      ownerId: userId,
      assignmentId: project.assignment_id,
      scenarioCode: project.scenario_code,
      scenarioVersion: project.scenario_version,
      revision: project.revision,
      state: project.state,
      exportedAt: new Date().toISOString(),
    };
    const signature = await signPayload(JSON.stringify(body));
    await audit(supabase, {
      actor_id: userId,
      assignment_id: project.assignment_id,
      project_id: project.id,
      action: "project.exported",
    });
    return { body, signature };
  });

export const importProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), file: z.string().max(2_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: project } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, revision, scenario_code, scenario_version")
      .eq("id", data.projectId)
      .single();
    if (!project || project.owner_id !== userId) throw new Error("Forbidden");

    const reject = async (reason: string) => {
      await audit(supabase, {
        actor_id: userId,
        assignment_id: project.assignment_id,
        project_id: project.id,
        action: "project.import_rejected",
        detail: { reason },
      });
      throw new Error(`Import rejected: ${reason}`);
    };

    let parsed: { body?: Record<string, unknown>; signature?: string };
    try {
      parsed = JSON.parse(data.file);
    } catch {
      return await reject("file is not valid JSON");
    }
    if (!parsed.body || typeof parsed.signature !== "string")
      return await reject("missing signature");

    const expected = await signPayload(JSON.stringify(parsed.body));
    if (expected !== parsed.signature) return await reject("signature does not match");

    const b = parsed.body as Record<string, unknown>;
    if (b["ownerId"] !== userId) return await reject("file belongs to another student");
    if (b["assignmentId"] !== project.assignment_id)
      return await reject("file belongs to another assignment");
    if (b["scenarioCode"] !== project.scenario_code)
      return await reject("file belongs to another scenario");
    if (b["scenarioVersion"] !== project.scenario_version)
      return await reject("file is from another scenario version");

    const state = projectStateSchema.parse(b["state"] ?? {});
    const nextRevision = project.revision + 1;
    await supabase
      .from("projects")
      .update({ state: state as never, revision: nextRevision })
      .eq("id", project.id);
    await supabase.from("project_revisions").insert({
      project_id: project.id,
      owner_id: userId,
      revision: nextRevision,
      state: state as never,
      note: "Imported from file",
    });
    await audit(supabase, {
      actor_id: userId,
      assignment_id: project.assignment_id,
      project_id: project.id,
      action: "project.imported",
      detail: { revision: nextRevision },
    });
    return { revision: nextRevision, state: state as ProjectState };
  });
