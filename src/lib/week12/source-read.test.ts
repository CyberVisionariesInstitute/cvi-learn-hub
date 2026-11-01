import { describe, expect, it } from "vitest";
import { assertRefreshVersion, checkedSourceRead } from "./source-read.server";

describe("Week 12 source reads", () => {
  it("a failed attempt read is not treated as a missing attempt", () => {
    expect(() => checkedSourceRead({ data: null, error: { message: "network failure" } }, "Could not load Week 11.")).toThrow("Could not load Week 11.");
  });
  it("a failed evidence read cannot become an empty evidence snapshot", () => {
    expect(() => checkedSourceRead({ data: null, error: { message: "timeout" } }, "Could not load evidence.")).toThrow("Could not load evidence.");
  });
  it("a successful absent row remains absent", () => {
    expect(checkedSourceRead({ data: null, error: null }, "Could not load.")).toBeNull();
  });
  it("successful rows are preserved without changing owner or content", () => {
    const data = { owner_user_id: "fictional-owner", content: "saved draft" };
    expect(checkedSourceRead({ data, error: null }, "Could not load.")).toBe(data);
  });
  it("refresh rejects a newer saved draft without replacing its source", () => {
    expect(() => assertRefreshVersion({ text_revision: 4, source_snapshot_hash: "original" }, { expectedTextRevision: 3, expectedSnapshotHash: "original" })).toThrow("Source was not refreshed");
  });
  it("refresh rejects a source already replaced in another tab", () => {
    expect(() => assertRefreshVersion({ text_revision: 3, source_snapshot_hash: "new-source" }, { expectedTextRevision: 3, expectedSnapshotHash: "original" })).toThrow("Source was not refreshed");
  });
  it("refresh permits exactly the confirmed draft and source", () => {
    expect(() => assertRefreshVersion({ text_revision: 3, source_snapshot_hash: "original" }, { expectedTextRevision: 3, expectedSnapshotHash: "original" })).not.toThrow();
  });
});