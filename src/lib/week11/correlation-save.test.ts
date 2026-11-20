import { describe, expect, it, vi, beforeEach } from "vitest";
import { createSeedState } from "./engine";
import { computeReadiness, hasCorrelatedFinding, CORRELATION_MISSING } from "./readiness.server";

const full = (key: string, refs: string[]) => ({ key, title: "t", refs, observation: "observation text", hypothesis: "hypothesis text", conclusion: "conclusion text", uncertainty: "uncertainty text", nextAction: "next action text", priority: "high" as const, rationale: "rationale text" });
const m06 = (findings: ReturnType<typeof full>[]) => computeReadiness(createSeedState(), { findings, comparison: { refs: ["S002", "S003"], text: "comparison text here" }, report: { liveChain: "LA-1 AT-2 chain text", limitations: "limitations text here" } }, []).find((x) => x.mission === "M06")!;

describe("M06 cross-log correlation", () => {
  it("accepts a sign-in and audit record sharing a real correlation ID in one finding", () => {
    expect(hasCorrelatedFinding([full("F1", ["S009", "A002"])])).toBe(true);
    expect(m06([full("F1", ["S012"]), full("F2", ["S009", "A002"])]).missing).not.toContain(CORRELATION_MISSING);
  });
  it("rejects a failed/successful sign-in pair with different correlation IDs", () => {
    expect(hasCorrelatedFinding([full("F1", ["S002", "S003"])])).toBe(false);
  });
  it("rejects the pair split across two findings or only one half cited", () => {
    expect(hasCorrelatedFinding([full("F1", ["S009"]), full("F2", ["A002"])])).toBe(false);
    expect(hasCorrelatedFinding([full("F1", ["S009", "S004"])])).toBe(false);
  });
  it("never matches the not_available sentinel", () => {
    expect(hasCorrelatedFinding([full("F1", ["A001", "A003", "S001"])])).toBe(false);
  });
  it("Tas-shaped findings (S012 / S002+S003) still need the correlation, with a link-able message", () => {
    const r = m06([full("F1", ["S012"]), full("F2", ["S002", "S003"])]);
    expect(r.missing).toContain(CORRELATION_MISSING);
    expect(CORRELATION_MISSING).not.toMatch(/C009|S009|A002/);
  });
  it("ignores incomplete findings even if they cite the pair", () => {
    expect(m06([{ ...full("F1", ["S009", "A002"]), rationale: "" }, full("F2", ["S012"])]).missing).toContain(CORRELATION_MISSING);
  });
});

/* ---------- useWeek11 save semantics, with a tiny React stand-in ---------- */
const fns: Record<string, (a?: unknown) => Promise<unknown>> = {};
vi.mock("react", () => ({
  useRef: (v: unknown) => ({ current: v }),
  useState: (v: unknown) => { const box = { v }; return [box.v, (n: unknown) => { box.v = typeof n === "function" ? (n as (p: unknown) => unknown)(box.v) : n; }]; },
  useCallback: (f: unknown) => f,
  useEffect: () => {},
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (f: { __n: string }) => (a: unknown) => fns[f.__n]!(a) }));
vi.mock("./week11.functions", () => Object.fromEntries(["captureWeek11Evidence", "executeWeek11Command", "exportWeek11", "exportWeek11Lab", "resetWeek11", "saveWeek11Text", "startOrResumeWeek11"].map((n) => [n, { __n: n }])));

const baseView = (learner = {}, textRevision = 1) => ({ id: "a", shortId: "A", status: "active", revision: 1, textRevision, seedVersion: "1", state: createSeedState(), learner, evidence: [], readiness: [] });

describe("useWeek11 flush/capture", () => {
  beforeEach(() => { for (const k of Object.keys(fns)) delete fns[k]; fns["startOrResumeWeek11"] = async () => baseView(); vi.useFakeTimers(); });

  it("flush reports false on conflict and keeps pending writing for capture", async () => {
    const { useWeek11 } = await import("./useWeek11");
    const s = useWeek11();
    fns["saveWeek11Text"] = async () => ({ conflict: "STATE_CHANGED", textRevision: 5 });
    let captured: unknown;
    fns["captureWeek11Evidence"] = async (a) => { captured = a; return { ...baseView({ captions: { "EV-A-001": "cap" } }, 6), evidenceKey: "EV-A-001", captionSaved: true }; };
    s.setLearner((l) => ({ ...l, displayName: "My pending text" }));
    expect(await s.flush()).toBe(false);
    const r = await s.captureEvidence({ mission: "M06", slot: "E17", title: "t", refs: { accounts: [], groups: [], tests: [], signins: [], audits: [], tickets: [], historical: ["S012"] }, caption: "cap" });
    expect(captured).toBeTruthy();
    expect(r.captionSaved).toBe(true);
    // Pending text is not replaced by the server learner; a later flush still sends it plus the saved caption.
    let sent: { learner: { displayName?: string; captions?: Record<string, string> } } | undefined;
    fns["saveWeek11Text"] = async (a) => { sent = (a as { data: typeof sent }).data; return { textRevision: 7, savedAt: new Date().toISOString() }; };
    expect(await s.flush()).toBe(true);
    expect(sent!.learner.displayName).toBe("My pending text");
    expect(sent!.learner.captions?.["EV-A-001"]).toBe("cap");
  });

  it("flush reports false when the request fails and export refuses to use stale writing", async () => {
    const { useWeek11 } = await import("./useWeek11");
    const s = useWeek11();
    fns["saveWeek11Text"] = async () => { throw new Error("offline"); };
    s.setLearner((l) => ({ ...l, displayName: "x" }));
    expect(await s.flush()).toBe(false);
    let exported = false; fns["exportWeek11Lab"] = async () => { exported = true; return {}; };
    await expect(s.exportLab("M06")).rejects.toThrow(/not saved/);
    expect(exported).toBe(false);
  });

  it("capture failure rethrows so the form keeps its input", async () => {
    const { useWeek11 } = await import("./useWeek11");
    const s = useWeek11();
    fns["captureWeek11Evidence"] = async () => { throw new Error("Evidence not saved. Try again."); };
    await expect(s.captureEvidence({ mission: "M06", slot: "E17", title: "t", refs: { accounts: [], groups: [], tests: [], signins: [], audits: [], tickets: [], historical: ["S012"] }, caption: "" })).rejects.toThrow();
  });

  it("reports an unsaved explanation while keeping the captured evidence key", async () => {
    const { useWeek11 } = await import("./useWeek11");
    const s = useWeek11();
    fns["captureWeek11Evidence"] = async () => ({ ...baseView({}, 1), evidenceKey: "EV-A-002", captionSaved: false });
    const r = await s.captureEvidence({ mission: "M06", slot: "E18", title: "t", refs: { accounts: [], groups: [], tests: [], signins: [], audits: [], tickets: [], historical: ["S010"] }, caption: "explain" });
    expect(r).toEqual({ evidenceKey: "EV-A-002", captionSaved: false });
  });
});
