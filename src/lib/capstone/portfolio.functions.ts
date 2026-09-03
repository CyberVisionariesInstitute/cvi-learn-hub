import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeState } from "./project-state";

/**
 * Sanitized, GitHub-ready portfolio package.
 *
 * Ownership is verified server-side against the authenticated user; the
 * client-supplied project id is only ever used as a lookup key. Nothing here
 * is signed and nothing here is importable back into the capstone.
 */
export const exportPortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: project } = await supabase
      .from("projects")
      .select("id, owner_id, assignment_id, state, scenario_code, scenario_version")
      .eq("id", data.projectId)
      .single();
    if (!project || project.owner_id !== userId) throw new Error("Forbidden");

    const { getScenarioPublic } = await import("./scenarios/registry.server");
    const scenario = getScenarioPublic(project.scenario_code, project.scenario_version);
    if (!scenario) throw new Error("Scenario content is unavailable for this assignment version.");

    const [{ data: profile }, { data: evidence }, { data: eventRows }, { data: submission }] =
      await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
        supabase
          .from("evidence_items")
          .select("stage, week, title, body, created_at")
          .eq("project_id", project.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("hidden_events")
          .select("title, student_brief, activated_at")
          .eq("assignment_id", project.assignment_id)
          .not("activated_at", "is", null),
        supabase.from("submissions").select("id").eq("project_id", project.id).maybeSingle(),
      ]);

    const { buildPortfolioFiles } = await import("./portfolio.server");
    const files = buildPortfolioFiles({
      displayName: profile?.display_name ?? null,
      scenario,
      state: normalizeState(project.state),
      evidence: (evidence ?? []).map((e) => ({
        stage: e.stage as string,
        week: (e.week as number | null) ?? null,
        title: e.title as string,
        body: (e.body as string | null) ?? null,
      })),
      activatedEvents: (eventRows ?? [])
        .filter((e) => !!e.activated_at)
        .map((e) => ({ title: e.title as string, studentBrief: e.student_brief as string })),
      submitted: Boolean(submission),
      generatedAt: new Date().toISOString(),
    });

    await supabase.from("audit_log").insert({
      actor_id: userId,
      assignment_id: project.assignment_id,
      project_id: project.id,
      action: "portfolio.exported",
      detail: { files: Object.keys(files).length },
    });

    return {
      files,
      filename: `pki-architect-capstone-portfolio-${new Date().toISOString().slice(0, 10)}.zip`,
    };
  });
