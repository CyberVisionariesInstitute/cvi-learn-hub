import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWorkspace } from "./capstone.functions";

export const workspaceKey = ["phase3", "workspace"] as const;

export function useWorkspace(enabled: boolean) {
  const fetchWorkspace = useServerFn(getWorkspace);
  return useQuery({
    queryKey: workspaceKey,
    queryFn: () => fetchWorkspace({}),
    enabled,
    staleTime: 10_000,
  });
}

export function useRefreshWorkspace() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: workspaceKey });
}

export type Workspace = Awaited<ReturnType<typeof getWorkspace>>;
