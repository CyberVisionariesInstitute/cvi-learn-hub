/** Browser-side serialization only. Assessment and persisted payloads are unchanged. */
export function createSaveQueue(saveOne: () => Promise<boolean>, isDirty: () => boolean) {
  let active: Promise<boolean> | null = null;
  return () => {
    if (active) return active;
    active = (async () => {
      while (isDirty()) {
        if (!await saveOne()) return false;
      }
      return true;
    })().finally(() => { active = null; });
    return active;
  };
}

export async function requireConfirmedSave(flush: () => Promise<boolean>) {
  if (!await flush()) throw new Error("Your latest writing has not been saved. Resolve the save message before refreshing or downloading.");
}