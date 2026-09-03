import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Instructor-only Phase 3 controls. Every handler re-checks the caller's role
 * against user_roles through the caller's own client before doing anything.
 */

async function requireStaff(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const staff = (data ?? []).some(
    (r: { role: string }) => r.role === "instructor" || r.role === "admin",
  );
  if (!staff) throw new Error("Forbidden");
}

export const instructorOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const [assignments, scenarios, projects, submissions, events, profiles] = await Promise.all([
      supabase
        .from("assignments")
        .select("id, user_id, scenario_code, scenario_version, state, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("scenario_packages")
        .select("id, code, title, version, status, difficulty_score")
        .eq("status", "released")
        .order("code"),
      supabase.from("projects").select("id, assignment_id, owner_id, revision, updated_at"),
      supabase
        .from("submissions")
        .select("id, project_id, owner_id, review_state, submitted_at, defense_notes")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("hidden_events")
        .select("id, assignment_id, event_key, title, student_brief, activated_at, acknowledged_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name, email"),
    ]);

    return {
      assignments: assignments.data ?? [],
      scenarios: scenarios.data ?? [],
      projects: projects.data ?? [],
      submissions: submissions.data ?? [],
      events: events.data ?? [],
      profiles: profiles.data ?? [],
    };
  });

export const assignScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ studentId: z.string().uuid(), scenarioPackageId: z.string().uuid() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const { data: pkg } = await supabase
      .from("scenario_packages")
      .select("id, code, version, status")
      .eq("id", data.scenarioPackageId)
      .single();
    if (!pkg || pkg.status !== "released") throw new Error("Scenario is not released");

    const existing = await supabase
      .from("assignments")
      .select("id")
      .eq("user_id", data.studentId)
      .eq("state", "active")
      .maybeSingle();
    if (existing.data) throw new Error("Student already has an active assignment");

    const inserted = await supabase
      .from("assignments")
      .insert({
        user_id: data.studentId,
        scenario_package_id: pkg.id,
        scenario_code: pkg.code,
        scenario_version: pkg.version,
        assigned_by: userId,
        state: "active",
      })
      .select("*")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      assignment_id: inserted.data.id,
      action: "assignment.created",
      detail: { student: data.studentId, scenario: pkg.code, version: pkg.version },
    });
    return inserted.data;
  });

export const createHiddenEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        assignmentId: z.string().uuid(),
        eventKey: z.string().min(1).max(80),
        title: z.string().min(1).max(200),
        studentBrief: z.string().min(1).max(4000),
        instructorNotes: z.string().max(4000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const inserted = await supabase
      .from("hidden_events")
      .insert({
        assignment_id: data.assignmentId,
        event_key: data.eventKey,
        title: data.title,
        student_brief: data.studentBrief,
        instructor_notes: data.instructorNotes ?? null,
      })
      .select("*")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    return inserted.data;
  });

export const activateHiddenEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const { error } = await supabase
      .from("hidden_events")
      .update({ activated_at: new Date().toISOString(), activated_by: userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "event.activated",
      detail: { id: data.id },
    });
    return { ok: true };
  });

export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        reviewState: z.enum(["submitted", "in_review", "returned", "accepted"]),
        reviewerNotes: z.string().max(8000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const { error } = await supabase
      .from("submissions")
      .update({
        review_state: data.reviewState,
        reviewer_id: userId,
        reviewer_notes: data.reviewerNotes ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "submission.reviewed",
      detail: { id: data.id, state: data.reviewState },
    });
    return { ok: true };
  });

export const readAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const { data } = await supabase
      .from("audit_log")
      .select("id, actor_id, action, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

/**
 * Staff-only: the authored event catalogue for one assignment's pinned
 * scenario version, plus which of them already exist / are activated.
 * Instructor notes and solution families are visible here and nowhere else.
 */
export const listScenarioEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ assignmentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const { data: assignment } = await supabase
      .from("assignments")
      .select("id, scenario_code, scenario_version")
      .eq("id", data.assignmentId)
      .single();
    if (!assignment) throw new Error("Assignment not found");

    const { getScenarioPrivate } = await import("./scenarios/registry.server");
    const priv = getScenarioPrivate(assignment.scenario_code, assignment.scenario_version);
    if (!priv) throw new Error("Scenario version is not in the released registry");

    const { data: rows } = await supabase
      .from("hidden_events")
      .select("id, event_key, activated_at, acknowledged_at")
      .eq("assignment_id", assignment.id);

    return priv.events.map((e) => {
      const row = (rows ?? []).find((r) => r.event_key === e.key);
      return {
        key: e.key,
        kind: e.kind,
        title: e.title,
        studentBrief: e.studentBrief,
        instructorNotes: e.instructorNotes,
        validSolutionFamilies: e.validSolutionFamilies,
        invalidMoves: e.invalidMoves,
        rowId: row?.id ?? null,
        activatedAt: row?.activated_at ?? null,
        acknowledgedAt: row?.acknowledged_at ?? null,
      };
    });
  });

/**
 * Staff-only: release one authored event to one assignment. Idempotent —
 * releasing an already-activated event is a no-op, and only registry keys
 * for the assignment's pinned version are accepted.
 */
export const releaseScenarioEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ assignmentId: z.string().uuid(), eventKey: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const { data: assignment } = await supabase
      .from("assignments")
      .select("id, scenario_code, scenario_version")
      .eq("id", data.assignmentId)
      .single();
    if (!assignment) throw new Error("Assignment not found");

    const { getScenarioPrivate } = await import("./scenarios/registry.server");
    const priv = getScenarioPrivate(assignment.scenario_code, assignment.scenario_version);
    const def = priv?.events.find((e) => e.key === data.eventKey);
    if (!def) throw new Error("Unknown event for this scenario version");

    const { data: existing } = await supabase
      .from("hidden_events")
      .select("id, activated_at")
      .eq("assignment_id", assignment.id)
      .eq("event_key", def.key)
      .maybeSingle();

    const now = new Date().toISOString();
    if (existing?.activated_at) return { ok: true, alreadyActive: true };

    if (existing) {
      const { error } = await supabase
        .from("hidden_events")
        .update({ activated_at: now, activated_by: userId })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("hidden_events").insert({
        assignment_id: assignment.id,
        event_key: def.key,
        title: def.title,
        student_brief: def.studentBrief,
        instructor_notes: def.instructorNotes,
        activated_at: now,
        activated_by: userId,
      });
      if (error) throw new Error(error.message);
    }

    await supabase.from("audit_log").insert({
      actor_id: userId,
      assignment_id: assignment.id,
      action: "event.released",
      detail: { key: def.key, scenario: assignment.scenario_code, version: assignment.scenario_version },
    });
    return { ok: true, alreadyActive: false };
  });

/** Staff-only: review one student checkpoint. */
export const reviewCheckpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        reviewState: z.enum(["not_reviewed", "in_review", "needs_revision", "accepted"]),
        reviewerNotes: z.string().max(8000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const { error } = await supabase
      .from("checkpoints")
      .update({
        review_state: data.reviewState,
        reviewer_id: userId,
        reviewer_notes: data.reviewerNotes ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "checkpoint.reviewed",
      detail: { id: data.id, state: data.reviewState },
    });
    return { ok: true };
  });

/** Staff-only: all checkpoints, for the cohort review queue. */
export const listCheckpoints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);
    const { data } = await supabase
      .from("checkpoints")
      .select("id, project_id, owner_id, stage, week, student_state, review_state, reviewer_notes, updated_at")
      .order("updated_at", { ascending: false });
    return data ?? [];
  });

/* --------------------------------------------------------- Grading console */

/**
 * Staff-only: cohort grading view. Returns one row per assignment with
 * derived Stage 1–4 progress, evidence/checkpoint counts and existing
 * feedback. No instructor-private scenario content is included here.
 */
export const cohortGrading = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const [assignments, profiles, projects, evidence, checkpoints, submissions, feedback, events] =
      await Promise.all([
        supabase
          .from("assignments")
          .select("id, user_id, scenario_code, scenario_version, state, is_test, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, display_name, email"),
        supabase
          .from("projects")
          .select("id, assignment_id, owner_id, revision, updated_at, state"),
        supabase.from("evidence_items").select("id, project_id, stage, created_at"),
        supabase.from("checkpoints").select("id, project_id, stage, review_state, updated_at"),
        supabase.from("submissions").select("id, project_id, review_state, submitted_at"),
        supabase
          .from("stage_feedback")
          .select("id, project_id, stage_group, mark, body, updated_at"),
        supabase
          .from("hidden_events")
          .select("id, assignment_id, activated_at, acknowledged_at"),
      ]);

    const { normalizeState } = await import("./project-state");
    const { stageGroupProgress } = await import("./grading");

    const rows = (assignments.data ?? []).map((a) => {
      const profile = (profiles.data ?? []).find((p) => p.id === a.user_id);
      const project = (projects.data ?? []).find((p) => p.assignment_id === a.id);
      const state = normalizeState(project?.state);
      return {
        assignmentId: a.id,
        studentId: a.user_id,
        studentName: profile?.display_name ?? profile?.email ?? a.user_id.slice(0, 8),
        studentEmail: profile?.email ?? null,
        scenarioCode: a.scenario_code,
        scenarioVersion: a.scenario_version,
        assignmentState: a.state,
        isTest: Boolean(a.is_test),
        projectId: project?.id ?? null,
        revision: project?.revision ?? 0,
        updatedAt: project?.updated_at ?? null,
        started: Boolean(project && (project.revision ?? 0) > 0),
        progress: project ? stageGroupProgress(state) : [],
        evidenceCount: (evidence.data ?? []).filter((e) => e.project_id === project?.id).length,
        checkpoints: (checkpoints.data ?? []).filter((c) => c.project_id === project?.id),
        submission:
          (submissions.data ?? []).find((s) => s.project_id === project?.id) ?? null,
        feedback: (feedback.data ?? []).filter((f) => f.project_id === project?.id),
        eventsActivated: (events.data ?? []).filter(
          (e) => e.assignment_id === a.id && e.activated_at,
        ).length,
        eventsAcknowledged: (events.data ?? []).filter(
          (e) => e.assignment_id === a.id && e.acknowledged_at,
        ).length,
      };
    });

    return rows;
  });

/** Staff-only: one student's evidence, notes and checkpoints for review. */
export const studentDossier = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const [{ data: project }, { data: evidence }, { data: checkpoints }, { data: feedback }] =
      await Promise.all([
        supabase
          .from("projects")
          .select("id, owner_id, assignment_id, revision, updated_at, state, scenario_code, scenario_version")
          .eq("id", data.projectId)
          .single(),
        supabase
          .from("evidence_items")
          .select("id, stage, week, title, body, created_at")
          .eq("project_id", data.projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("checkpoints")
          .select("id, stage, week, student_state, review_state, reviewer_notes, updated_at")
          .eq("project_id", data.projectId),
        supabase
          .from("stage_feedback")
          .select("id, stage_group, mark, body, updated_at")
          .eq("project_id", data.projectId),
      ]);

    if (!project) throw new Error("Project not found");

    const { normalizeState } = await import("./project-state");
    const state = normalizeState(project.state);

    return {
      project: {
        id: project.id,
        ownerId: project.owner_id,
        assignmentId: project.assignment_id,
        revision: project.revision,
        updatedAt: project.updated_at,
        scenarioCode: project.scenario_code,
        scenarioVersion: project.scenario_version,
      },
      notes: state.notes,
      decisions: state.analysis
        .filter((a) => a.kind === "decision")
        .map((a) => ({ id: a.id, title: a.title, detail: a.detail, source: a.source })),
      timeline: state.change.timeline,
      runs: state.workloads.runs.map((r) => ({
        id: r.id,
        at: r.at,
        result: r.result,
        definitionId: r.definitionId,
        failures: r.checks.filter((c) => c.result === "fail").map((c) => c.label),
      })),
      evidence: evidence ?? [],
      checkpoints: checkpoints ?? [],
      feedback: feedback ?? [],
    };
  });

/** Staff-only: write or update feedback on one stage group. */
export const upsertStageFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        assignmentId: z.string().uuid().optional(),
        ownerId: z.string().uuid(),
        stageGroup: z.enum(["stage1", "stage2", "stage3", "stage4", "overall"]),
        mark: z.enum(["strong", "on_track", "needs_work", "blocked"]),
        body: z.string().max(8000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const { error } = await supabase.from("stage_feedback").upsert(
      {
        project_id: data.projectId,
        assignment_id: data.assignmentId ?? null,
        owner_id: data.ownerId,
        stage_group: data.stageGroup,
        mark: data.mark,
        body: data.body,
        reviewer_id: userId,
      },
      { onConflict: "project_id,stage_group" },
    );
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      project_id: data.projectId,
      action: "feedback.saved",
      detail: { stage_group: data.stageGroup, mark: data.mark },
    });
    return { ok: true };
  });
