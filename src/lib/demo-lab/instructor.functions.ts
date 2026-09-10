import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side instructor access check for the CyberFoundations Demo Lab console.
 * Callers must be authenticated and hold the instructor or admin role.
 */
export const checkInstructorAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      throw new Error("Unable to verify instructor access.");
    }

    const staff = (data ?? []).some(
      (r: { role: string }) => r.role === "instructor" || r.role === "admin",
    );

    if (!staff) {
      throw new Error("Forbidden");
    }

    return { ok: true };
  });
