// Presentation only: describe captured records, never current directory state.
const capturedKinds = [
  ["accounts", "Account snapshot"], ["groups", "Group snapshot"],
  ["tests", "Access test"], ["signins", "Sign-in"],
  ["audits", "Audit"], ["tickets", "Ticket snapshot"],
  ["historical", "Historical record"],
] as const;

export function summarizeSnapshot(snapshot: unknown): { kind: string; count: number; ids: string[] }[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const saved = snapshot as Record<string, unknown>;
  return capturedKinds.flatMap(([field, kind]) => {
    const records = saved[field];
    if (!Array.isArray(records) || !records.length) return [];
    const ids = records.flatMap((record: unknown) => {
      if (!record || typeof record !== "object") return [];
      const ref = record as Record<string, unknown>;
      const id = ref['id'] ?? ref['key'] ?? ref['group'] ?? ref['event_id'];
      return typeof id === "string" ? [id] : [];
    });
    return [{ kind, count: records.length, ids }];
  });
}