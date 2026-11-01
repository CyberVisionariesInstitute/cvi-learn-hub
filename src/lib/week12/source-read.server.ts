/** Never confuse an unsuccessful source read with a genuinely absent row. */
export function checkedSourceRead<T>(result: { data: T; error: unknown }, message: string): T {
  if (result.error) throw new Error(message);
  return result.data;
}

/** Refresh must target the exact saved draft/source the student reviewed. */
export function assertRefreshVersion(row: { text_revision: number; source_snapshot_hash: string }, expected: { expectedTextRevision: number; expectedSnapshotHash: string }) {
  if (row.text_revision !== expected.expectedTextRevision || row.source_snapshot_hash !== expected.expectedSnapshotHash) {
    throw new Error("Week 12 changed in another tab. Source was not refreshed; your writing is kept. Reload and review before trying again.");
  }
}