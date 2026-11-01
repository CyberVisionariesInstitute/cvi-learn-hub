import { describe, expect, it } from "vitest";
import { checkedSourceRead } from "./source-read.server";

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
});