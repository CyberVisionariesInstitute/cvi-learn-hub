import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Staff-only Capstone rubric scoring and defense stage.
 *
 * The rubric itself lives in `rubric.server.ts` and is only ever loaded inside
 * these handlers, so criteria, descriptors and point weights never reach a
 * student bundle. Every handler re-checks the caller's staff role.
 */

async function requireStaff(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const staff = (data ?? []).some(
    (r: { role: string }) => r.role === "instructor" || r.role === "admin",
  );
  if (!staff) throw new Error("Forbidden");
}

function overridesOf(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

/** Staff-only: the rubric definition plus a scored row per student. */
export const rubricCohort = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const [assignments, profiles, projects, defenses, submissions] = await Promise.all([
      supabase
        .from("assignments")
        .select("id, user_id, scenario_code, scenario_version, state, is_test, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name, email"),
      supabase.from("projects").select("id, assignment_id, owner_id, revision, updated_at, state"),
      supabase
        .from("defense_records")
        .select("project_id, scores, outcome, total_points, max_points, finalized_at, scheduled_at"),
      supabase
        .from("submissions")
        .select("id, project_id, review_state, submitted_at, defense_notes"),
    ]);

    const { normalizeState } = await import("./project-state");
    const { scoreRubric, rubricDefinition } = await import("./rubric.server");

    const rows = (assignments.data ?? []).map((a) => {
      const profile = (profiles.data ?? []).find((p) => p.id === a.user_id);
      const project = (projects.data ?? []).find((p) => p.assignment_id === a.id);
      const defense = (defenses.data ?? []).find((d) => d.project_id === project?.id) ?? null;
      const submission = (submissions.data ?? []).find((s) => s.project_id === project?.id) ?? null;
      const state = normalizeState(project?.state);
      return {
        assignmentId: a.id,
        studentId: a.user_id,
        studentName: profile?.display_name ?? profile?.email ?? a.user_id.slice(0, 8),
        scenarioCode: a.scenario_code,
        scenarioVersion: a.scenario_version,
        isTest: Boolean(a.is_test),
        projectId: project?.id ?? null,
        started: Boolean(project && (project.revision ?? 0) > 0),
        updatedAt: project?.updated_at ?? null,
        score: project ? scoreRubric(state, overridesOf(defense?.scores)) : null,
        outcome: defense?.outcome ?? "pending",
        finalizedAt: defense?.finalized_at ?? null,
        scheduledAt: defense?.scheduled_at ?? null,
        submission,
      };
    });

    return { rubric: rubricDefinition(), rows };
  });

/** Staff-only: everything the defense panel needs for one project. */
export const defensePanel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const [{ data: project }, { data: submission }, { data: record }, { data: evidence }] =
      await Promise.all([
        supabase
          .from("projects")
          .select("id, owner_id, assignment_id, revision, updated_at, state, scenario_code, scenario_version")
          .eq("id", data.projectId)
          .single(),
        supabase
          .from("submissions")
          .select("id, review_state, submitted_at, defense_notes, reviewer_notes")
          .eq("project_id", data.projectId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("defense_records").select("*").eq("project_id", data.projectId).maybeSingle(),
        supabase
          .from("evidence_items")
          .select("id, stage, title, created_at")
          .eq("project_id", data.projectId)
          .order("created_at", { ascending: false }),
      ]);

    if (!project) throw new Error("Project not found");

    const { normalizeState } = await import("./project-state");
    const { scoreRubric, rubricDefinition } = await import("./rubric.server");
    const state = normalizeState(project.state);
    const score = scoreRubric(state, overridesOf(record?.scores));

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
      submission: submission ?? null,
      record: record
        ? {
            id: record.id as string,
            scheduledAt: record.scheduled_at as string | null,
            presentationNotes: (record.presentation_notes as string) ?? "",
            panelQuestions: Array.isArray(record.panel_questions)
              ? (record.panel_questions as Array<{ question: string; response: string }>)
              : [],
            scores: overridesOf(record.scores),
            outcome: record.outcome as string,
            finalizedAt: record.finalized_at as string | null,
          }
        : null,
      evidenceCount: (evidence ?? []).length,
      rubric: rubricDefinition(),
      score,
    };
  });

const questionSchema = z.object({
  question: z.string().max(1000),
  response: z.string().max(4000),
});

/** Staff-only: create or update the defense record for one project. */
export const saveDefenseRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        assignmentId: z.string().uuid().nullable().optional(),
        ownerId: z.string().uuid(),
        scheduledAt: z.string().max(40).nullable().optional(),
        presentationNotes: z.string().max(20000).default(""),
        panelQuestions: z.array(questionSchema).max(40).default([]),
        scores: z.record(z.string(), z.number()).default({}),
        outcome: z
          .enum(["pending", "pass", "pass_with_conditions", "revise", "fail"])
          .default("pending"),
        finalize: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireStaff(supabase, userId);

    const { data: project } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, state")
      .eq("id", data.projectId)
      .single();
    if (!project) throw new Error("Project not found");

    const { normalizeState } = await import("./project-state");
    const { scoreRubric } = await import("./rubric.server");
    const score = scoreRubric(normalizeState(project.state), data.scores);

    if (data.finalize && data.outcome === "pending") {
      throw new Error("Choose a defense outcome before finalizing");
    }

    const { error } = await supabase.from("defense_records").upsert(
      {
        project_id: data.projectId,
        assignment_id: data.assignmentId ?? project.assignment_id,
        owner_id: data.ownerId,
        reviewer_id: userId,
        scheduled_at: data.scheduledAt || null,
        presentation_notes: data.presentationNotes,
        panel_questions: data.panelQuestions,
        scores: data.scores,
        total_points: score.total,
        max_points: score.maxPoints,
        outcome: data.outcome,
        finalized_at: data.finalize ? new Date().toISOString() : null,
      },
      { onConflict: "project_id" },
    );
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      project_id: data.projectId,
      action: data.finalize ? "defense.finalized" : "defense.saved",
      detail: { outcome: data.outcome, total: score.total, max: score.maxPoints },
    });

    return { ok: true, total: score.total, maxPoints: score.maxPoints, percent: score.percent };
  });
