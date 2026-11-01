import { describe, expect, it } from "vitest";
import { createSaveQueue, requireConfirmedSave } from "./save-queue";

describe("confirmed Week 12 saves", () => {
  it("serializes simultaneous save/refresh/download callers and confirms newer edits too", async () => {
    let dirty = true, calls = 0, running = 0, peak = 0;
    const flush = createSaveQueue(async () => {
      running++; peak = Math.max(peak, running); calls++;
      await Promise.resolve(); running--;
      // A new edit arrives during the first request.
      if (calls === 2) dirty = false;
      return true;
    }, () => dirty);
    expect(await Promise.all([flush(), flush(), flush()])).toEqual([true, true, true]);
    expect(calls).toBe(2); expect(peak).toBe(1);
  });
  it.each(["failure", "conflict"])("blocks dependent actions on %s without discarding dirty work", async () => {
    let dirty = true;
    const flush = createSaveQueue(async () => false, () => dirty);
    await expect(requireConfirmedSave(flush)).rejects.toThrow("not been saved");
    expect(dirty).toBe(true);
  });
  it("permits an action after the current draft is confirmed", async () => {
    let dirty = true;
    const flush = createSaveQueue(async () => { dirty = false; return true; }, () => dirty);
    await expect(requireConfirmedSave(flush)).resolves.toBeUndefined();
  });
});