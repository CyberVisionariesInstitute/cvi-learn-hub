import { describe, expect, it } from "vitest";
import { summarizeSnapshot } from "./snapshot-summary";

describe("saved snapshot summaries", () => {
  it("reads all seven captured reference kinds without changing the snapshot", () => {
    const snapshot = {
      accounts: [{ key: "ad-example" }], groups: [{ group: "G-example" }],
      tests: [{ id: "AT-example" }], signins: [{ id: "SI-example" }],
      audits: [{ id: "LA-example" }], tickets: [{ key: "T-example" }],
      historical: [{ event_id: "S-example" }, { event_id: "A-example" }],
    };
    const before = JSON.stringify(snapshot);
    expect(summarizeSnapshot(snapshot).map((item) => [item.count, item.ids])).toEqual([
      [1, ["ad-example"]], [1, ["G-example"]], [1, ["AT-example"]],
      [1, ["SI-example"]], [1, ["LA-example"]], [1, ["T-example"]],
      [2, ["S-example", "A-example"]],
    ]);
    expect(JSON.stringify(snapshot)).toBe(before);
  });
  it("does not invent references for absent or malformed captured records", () => {
    expect(summarizeSnapshot({ accounts: [], tests: "AT-example", audits: [{ activity: "example" }] })).toEqual([
      { kind: "Audit", count: 1, ids: [] },
    ]);
    expect(summarizeSnapshot(null)).toEqual([]);
  });
});