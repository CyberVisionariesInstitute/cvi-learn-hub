import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { computeReadiness } from "@/lib/week11/readiness.server";
import { createSeedState } from "@/lib/week11/engine";
import { buildSnapshot, detectSourceChange, snapshotHash } from "./source.server";
import { buildWeek12Files, buildWeek12Zip } from "./export.server";
import { coachFlags, computeQA, normalizeContent, parseDuration, recommendationIssues, seedContent, validateVideoUrl, week12Paths, type ExecOption, type SourceSnapshot, type W12Content } from "./model";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

function snap(complete = true): SourceSnapshot {
  const row = { id: "11111111-2222-3333-4444-555555555555", status: "active" as const, archived_at: null, text_revision: 7, state_revision: 12,
    learner: { displayName: "Sam Student", findings: [{ key: "F1", title: "S009 cluster", refs: ["S004", "S009"], observation: "Five failures then success.", hypothesis: "Password guessing.", conclusion: "S004–S009 show repeated failures then success from an unknown device.", uncertainty: "No MFA detail.", nextAction: "Verify with user.", priority: "high" as const, rationale: "r" }], comparison: { refs: ["S010"], text: "VPN sign-ins are benign." }, report: { limitations: "Simulated logs only.", liveChain: "LA-1 AT-2" } } };
  const ev = [{ evidence_key: "EV-111111-001", slot: "E17", mission: "M06", title: "Cluster", snapshot: { effectiveAccess: ["SECRET-BODY"] }, content_hash: "h", captured_revision: 3, created_at: "2026-01-01" }];
  return buildSnapshot(row, ev as never, { ready: complete, missing: complete ? [] : ["Capture E19."] });
}

function full(s: SourceSnapshot, opt: ExecOption): W12Content {
  const c = seedContent(s);
  c.report = { title: "IAM Incident Report", analyst: "Sam Student", purpose: "Investigate unusual identity activity on Sept 21.", scope: "Historical sign-ins and audit records, Sept 21.", evidenceReviewed: "Sign-in and audit logs, EV-111111-001.", timeline: "09:00 S004 failed ... 09:05 S009 success.", impact: "Possible unauthorised access to case records.", limitations: "Simulated data; no endpoint telemetry.", conclusion: "Two findings need follow-up by the IAM team." };
  c.findings = [
    { key: "RF1", sourceFindingKey: "F1", statement: "S004–S009 show five failed sign-ins then a success.", evidenceRefs: ["S004", "S009"], confidence: "confirmed", uncertainty: "" },
    { key: "RF2", sourceFindingKey: "", statement: "A002 shows a self-granted privileged membership without approval.", evidenceRefs: ["A002", "C009"], confidence: "confirmed", uncertainty: "" },
  ];
  c.recommendations = [{ key: "R1", action: "Remove the self-granted Privileged-Operators membership and require ticket approval.", owner: "IAM team", why: "Unapproved privilege.", priority: "high", timeframe: "24 hours", linkedFindings: ["RF2"], successMeasure: "Audit shows no unapproved members." }];
  c.written = { whatHappened: words(80), whyMatters: words(80), whatFound: words(80), nextSteps: words(60), uncertain: "" };
  c.video = { url: "https://youtu.be/abc123", platform: "YouTube unlisted", duration: "2:30", accessChecked: true, outline: "- intro\n- findings\n- asks", reflection: words(30) };
  return opt ? c : c;
}
const input = (s: SourceSnapshot, c: W12Content, opt: ExecOption) => ({ snapshot: s, snapshotHash: snapshotHash(s), capturedAt: "2026-10-06T00:00:00Z", content: c, execOption: opt });

describe("Week 12 source handoff", () => {
  it("snapshot excludes evidence bodies, readiness predicates, answer keys and platform IDs", () => {
    const s = snap();
    const j = JSON.stringify(s);
    expect(j).not.toContain("SECRET-BODY");
    expect(j).not.toContain("11111111-2222");
    expect(j).not.toMatch(/expected|instructorKey|computeReadiness/);
    expect(s.sourceShortId).toBe("111111");
  });
  it("uses the real Week 11 readiness only to produce a student-safe M06 status", () => {
    const r = computeReadiness(createSeedState(), {}, []).find((x) => x.mission === "M06")!;
    expect(r.ready).toBe(false);
  });
  it("detects edits, resets and archived sources without overwriting", () => {
    const f = { sourceId: "a", textRevision: 1, stateRevision: 1 };
    expect(detectSourceChange(f, { id: "a", status: "active", text_revision: 1, state_revision: 1, archived_at: null })).toBeNull();
    expect(detectSourceChange(f, { id: "a", status: "active", text_revision: 2, state_revision: 1, archived_at: null })?.kind).toBe("edited");
    expect(detectSourceChange(f, { id: "bbbbbb-1", status: "active", text_revision: 0, state_revision: 0, archived_at: null })?.kind).toBe("reset");
    expect(detectSourceChange(f, { id: "a", status: "archived", text_revision: 1, state_revision: 1, archived_at: "2026-10-01" })?.kind).toBe("archived");
  });
});

describe("Week 12 readiness", () => {
  it("written and video both reach ready with the same check set", () => {
    const s = snap();
    const w = computeQA(s, full(s, "written"), "written");
    const v = computeQA(s, full(s, "video"), "video");
    expect(w.ready).toBe(true);
    expect(v.ready).toBe(true);
    expect(w.checks.map((x) => x.id)).toEqual(v.checks.map((x) => x.id));
  });
  it("incomplete Week 11 source → DRAFT SOURCE, cannot be final-ready", () => {
    const s = snap(false);
    const q = computeQA(s, full(s, "written"), "written");
    expect(q.ready).toBe(false);
    expect(q.checks.find((x) => x.id === "source")!.missing[0]).toContain("DRAFT SOURCE");
  });
  it("switching option keeps both drafts and only the selected one counts", () => {
    const s = snap();
    const c = full(s, "written");
    c.video.url = "";
    expect(computeQA(s, c, "written").ready).toBe(true);
    expect(computeQA(s, c, "video").ready).toBe(false);
    expect(c.written.whatHappened.length).toBeGreaterThan(0);
  });
  it("video URL and duration validation", () => {
    expect(validateVideoUrl("http://x.com/v")).toMatch(/https/);
    expect(validateVideoUrl("not a url")).toBeTruthy();
    expect(validateVideoUrl("https://drive.google.com/file/d/1")).toBeNull();
    expect(parseDuration("2:30")).toBe(150);
    expect(parseDuration("3 min")).toBe(180);
  });
  it("requires two evidence-linked findings validated against the snapshot", () => {
    const s = snap();
    const c = full(s, "written");
    c.findings[1]!.evidenceRefs = ["EV-999999-001"];
    const q = computeQA(s, c, "written");
    expect(q.checks.find((x) => x.id === "findings")!.ok).toBe(false);
    expect(q.checks.find((x) => x.id === "findings")!.missing.join(" ")).toContain("EV-999999-001");
  });
  it("recommendations must link a finding and be specific", () => {
    const r = { key: "R1", action: "Improve security", owner: "", why: "", priority: "" as const, timeframe: "", linkedFindings: [], successMeasure: "" };
    const issues = recommendationIssues(r, ["RF1"]);
    expect(issues.join(" ")).toMatch(/Link at least one finding/);
    expect(issues.length).toBeGreaterThan(3);
  });
  it("coaching flags unsupported words but does not block saving; acknowledgement clears it", () => {
    const s = snap();
    const c = full(s, "written");
    c.findings[0]!.statement = "The attacker compromised Blair's account via S009.";
    const flags = coachFlags(c, "written");
    expect(flags.map((f) => f.term)).toEqual(expect.arrayContaining(["attacker", "compromised"]));
    expect(computeQA(s, c, "written").checks.find((x) => x.id === "language")!.ok).toBe(false);
    flags.forEach((f) => { c.acks[f.id] = "S004–S009 plus A002 support this."; });
    expect(computeQA(s, c, "written").ready).toBe(true);
  });
  it("volunteer status is not a readiness input", () => {
    expect(computeQA.length).toBe(3);
  });
});

describe("Week 12 export", () => {
  it("exact path set per option", () => {
    const s = snap();
    expect(Object.keys(buildWeek12Files(input(s, full(s, "written"), "written")))).toEqual(week12Paths("written"));
    expect(week12Paths("written")).toEqual(["week-12/README.md", "week-12/technical-incident-report.md", "week-12/executive-summary.md", "week-12/source/week11-source-manifest.json"]);
    expect(week12Paths("video")).toEqual(["week-12/README.md", "week-12/technical-incident-report.md", "week-12/video-briefing.md", "week-12/source/week11-source-manifest.json"]);
    expect(Object.keys(buildWeek12Files(input(s, full(s, "video"), "video")))).not.toContain("week-12/executive-summary.md");
  });
  it("ZIP files are byte-identical to per-file downloads, with DRAFT naming", () => {
    const s = snap();
    const c = full(s, "video");
    const files = buildWeek12Files(input(s, c, "video"));
    const z = buildWeek12Zip(input(s, c, "video"));
    expect(z.filename).toBe("week-12-portfolio.zip");
    const un = unzipSync(Uint8Array.from(Buffer.from(z.zipBase64, "base64")));
    for (const [k, v] of Object.entries(files)) expect(strFromU8(un[k]!)).toBe(v);
    expect(buildWeek12Zip(input(snap(false), c, "video")).filename).toBe("week-12-portfolio-DRAFT.zip");
  });
  it("README names Deliverable 5 and format; report references Week 11 paths; no evidence bodies or volunteer data", () => {
    const s = snap();
    const files = buildWeek12Files(input(s, full(s, "written"), "written"));
    expect(files["week-12/README.md"]).toContain("Portfolio Deliverable 5");
    expect(files["week-12/README.md"]).toContain("Written Executive Summary");
    expect(files["week-12/technical-incident-report.md"]).toContain("../week-11/labs/lab-06-identity-investigation-case-file.md");
    expect(files["week-12/technical-incident-report.md"]).toContain("../week-11/labs/evidence/week11-evidence-index.md");
    const all = Object.values(files).join("\n");
    expect(all).not.toContain("SECRET-BODY");
    expect(all).not.toMatch(/volunteer|presenter/i);
    expect(all).not.toContain("11111111-2222");
    expect(all).not.toContain("recommendations.md");
  });
});

describe("Week 12 security boundaries (source checks)", () => {
  const fns = readFileSync("src/lib/week12/week12.functions.ts", "utf8");
  it("student functions derive ownership from the session only", () => {
    for (const name of ["startOrResumeWeek12", "saveWeek12Draft", "refreshWeek12Source", "setWeek12Volunteer", "exportWeek12", "exportWeek12File"]) {
      const body = fns.split(`export const ${name}`)[1]!.split("export const")[0]!;
      expect(body).toContain("requireSupabaseAuth");
      expect(body).toContain("context.userId");
      expect(body).not.toMatch(/attemptId|ownerId|owner_user_id:\s*data/);
    }
  });
  it("instructor review/selection require staff", () => {
    for (const name of ["listWeek12Attempts", "getWeek12AttemptForInstructor", "reviewWeek12", "selectWeek12Presenter"]) {
      const body = fns.split(`export const ${name}`)[1]!.split("export const")[0]!;
      expect(body).toContain("isStaff(");
      expect(body).toContain('throw new Error("Forbidden")');
    }
  });
  it("Week 12 never writes Week 11 tables", () => {
    expect(fns).not.toMatch(/from\("w11_[a-z_]+" as never\)\.(insert|update|delete|upsert)/);
    expect(fns).not.toMatch(/w11_commit_command|w11_reset_attempt/);
  });
  it("student UI imports no server-only modules", () => {
    for (const f of ["src/components/week12/Week12App.tsx", "src/routes/cyberfoundations.week-12.index.tsx", "src/lib/week12/useWeek12.ts", "src/lib/week12/model.ts"]) {
      expect(readFileSync(f, "utf8")).not.toMatch(/\.server"|instructor-key|readiness\.server/);
    }
  });
  it("normalizes missing content safely", () => {
    expect(normalizeContent(undefined).report.title).toBe("");
  });
});
