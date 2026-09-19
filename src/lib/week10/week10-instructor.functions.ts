import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Week10InstructorKey } from "./instructor-key.server";

/**
 * Week 10 instructor answer material.
 *
 * Authorisation is server-side: the caller must present a valid session AND
 * hold the instructor or admin role. The answer key module is imported inside
 * the handler so it never enters a client bundle.
 */
export const getWeek10InstructorKey = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Week10InstructorKey> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw new Error("Unable to verify instructor access.");

    const staff = (data ?? []).some(
      (r: { role: string }) => r.role === "instructor" || r.role === "admin",
    );
    if (!staff) throw new Error("Forbidden");

    const { week10InstructorKey } = await import("./instructor-key.server");
    return week10InstructorKey;
  });
