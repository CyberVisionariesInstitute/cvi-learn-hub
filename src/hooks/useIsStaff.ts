import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export type StaffStatus = "loading" | "staff" | "not-staff" | "signed-out";

/**
 * Client-side staff (instructor/admin) check against user_roles.
 * UI gating only — server functions enforce access independently.
 */
export function useIsStaff(): StaffStatus {
  const { session, loading } = useSession();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session?.user) {
      setIsStaff(false);
      return;
    }
    let active = true;
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setIsStaff(false);
          return;
        }
        setIsStaff(
          (data ?? []).some((r) => r.role === "instructor" || r.role === "admin"),
        );
      });
    return () => {
      active = false;
    };
  }, [loading, session?.user?.id]);

  if (loading) return "loading";
  if (!session?.user) return "signed-out";
  if (isStaff === null) return "loading";
  return isStaff ? "staff" : "not-staff";
}
