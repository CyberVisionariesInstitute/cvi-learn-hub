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
