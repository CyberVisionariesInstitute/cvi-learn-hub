import { describe, expect, it } from "vitest";
import {
  assets,
  casePacketMarkdown,
  evidence,
  evidenceById,
  rooms,
  threatEvents,
} from "./case-packet";
import {
  band,
  checklist,
  checklistFor,
  controlStatus,
  ratingStatus,
  visitedRoomIds,
  clear,
  load,
  save,
  createInitialState,
  reconcile,
  score,
  validate,
  WEEK10_SCHEMA,
  wordCount,
  type Week10State,
} from "./state";
import { lab1Report, lab2Report, mdCell, portfolioReport } from "./reports";
import { week10InstructorKey } from "./instructor-key.server";
import { cyberfoundations } from "@/lib/demo-lab/programs";

function completed(): Week10State {
  const state = createInitialState();
  state.visitedRooms = rooms.map((r) => r.id);
  state.findings = evidence.slice(0, 6).map((e) => e.id);
  state.scenarios = state.scenarios.map((s, i) => ({
    ...s,
    evidenceIds: [evidence[i]!.id],
    threat: `threat ${i}`,
    vulnerability: `weakness ${i}`,
    consequence: `harm ${i}`,
    cia: { ...s.cia, confidentiality: true },
  }));
  state.email = { signs: ["a", "b", "c"], safeStep: "report it", proofNote: "attempt only" };
  state.ratings = state.scenarios.map((s) => ({
    scenarioId: s.id,
    likelihood: 2,
    impact: 3,
    likelihoodWhy: "evidence",
    impactWhy: "evidence",
  }));
  state.priorities = [state.scenarios[0]!.id, state.scenarios[1]!.id];
  state.priorityWhy = "highest scores";
  state.controls = state.priorities.map((id) => ({
    scenarioId: id,
    control: "c",
    howItHelps: "h",
    residual: "r",
  }));
  state.briefing = "briefing text";
  return state;
}

describe("Week 10 case packet", () => {
  it("has five rooms, five assets and five threat events", () => {
    expect(rooms).toHaveLength(5);
    expect(assets).toHaveLength(5);
    expect(threatEvents).toHaveLength(5);
  });

  it("gives every room a named staff statement and at least three evidence cards", () => {
    rooms.forEach((room) => {
      expect(room.staff.name.length).toBeGreaterThan(0);
      expect(room.staff.statement.length).toBeGreaterThan(0);
      expect(room.evidenceIds.length).toBeGreaterThanOrEqual(3);
      room.evidenceIds.forEach((id) => expect(evidenceById(id)).toBeDefined());
    });
  });

  it("uses stable unique evidence IDs", () => {
    const ids = evidence.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses reserved .example names and no real addresses", () => {
    const text = JSON.stringify(evidence);
    const hosts = text.match(/[a-z0-9-]+\.(com|org|net|io|health|uk)\b/gi) ?? [];
    expect(hosts).toEqual([]);
    expect(text).toContain("clinic-support.example");
  });

  it("labels unknowns rather than asserting compromise", () => {
    expect(evidenceById("EV-WKS-01")?.unknowns?.join(" ")).toMatch(/not a confirmed attack/i);
    expect(evidenceById("EV-BAK-02")?.unknowns?.join(" ")).toMatch(/unknown/i);
  });

  it("keeps the public website separate from patient records", () => {
    expect(evidenceById("EV-WEB-03")?.detail.join(" ")).toMatch(/no connection to the records/i);
  });

  it("renders a printable case packet with every evidence ID", () => {
    const md = casePacketMarkdown();
    evidence.forEach((e) => expect(md).toContain(e.id));
  });
});

describe("Week 10 state", () => {
  it("creates one scenario per threat event with stable IDs", () => {
    const s = createInitialState();
    expect(s.scenarios.map((x) => x.id)).toEqual(["SC-01", "SC-02", "SC-03", "SC-04", "SC-05"]);
  });

  it("preserves ratings and controls when Lab 1 text is edited", () => {
    let state = completed();
    state = reconcile({
      ...state,
      scenarios: state.scenarios.map((s) =>
        s.id === "SC-01" ? { ...s, threat: "rewritten" } : s,
      ),
    });
    expect(state.ratings.find((r) => r.scenarioId === "SC-01")?.likelihood).toBe(2);
    expect(state.controls.find((c) => c.scenarioId === "SC-01")?.control).toBe("c");
  });

  it("drops downstream work when a scenario is removed so exports cannot go stale", () => {
    const state = reconcile({
      ...completed(),
      scenarios: completed().scenarios.filter((s) => s.id !== "SC-01"),
    });
    expect(state.ratings.some((r) => r.scenarioId === "SC-01")).toBe(false);
    expect(state.controls.some((c) => c.scenarioId === "SC-01")).toBe(false);
    expect(state.priorities).not.toContain("SC-01");
  });

  it("scores and bands using the classroom scale", () => {
    expect(score({ scenarioId: "x", likelihood: 2, impact: 3, likelihoodWhy: "", impactWhy: "" })).toBe(6);
    expect(band(0)).toBe("unrated");
    expect(band(2)).toBe("low");
    expect(band(4)).toBe("medium");
    expect(band(6)).toBe("high");
    expect(band(9)).toBe("high");
  });

  it("marks a fresh state incomplete and a finished state complete", () => {
    expect(checklist(createInitialState()).every((i) => !i.done)).toBe(true);
    expect(checklist(completed()).every((i) => i.done)).toBe(true);
  });

  it("counts briefing words without blocking length", () => {
    expect(wordCount("one two three")).toBe(3);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("Week 10 backup validation", () => {
  it("accepts its own backup", () => {
    const result = validate(JSON.parse(JSON.stringify(completed())));
    expect(result.ok).toBe(true);
  });

  it("explains why a foreign file is rejected", () => {
    const result = validate({ schema: "something-else", scenarios: [], findings: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problems.join(" ")).toContain(WEEK10_SCHEMA);
  });

  it("rejects non-objects and malformed files", () => {
    expect(validate("nope").ok).toBe(false);
    expect(validate({ schema: WEEK10_SCHEMA }).ok).toBe(false);
  });
});

describe("Week 10 reports", () => {
  it("escapes student input so the table cannot be broken", () => {
    expect(mdCell("a | b")).toBe("a \\| b");
    expect(mdCell("line\nbreak")).toBe("line<br>break");
  });

  it("marks an unfinished report as a draft and lists what is missing", () => {
    const md = lab1Report(createInitialState(), "Learner");
    expect(md).toContain("DRAFT");
    expect(md).toContain("Email analysis");
  });

  it("includes the learner's own answers", () => {
    const state = completed();
    state.briefing = "my own briefing sentence";
    const md = lab2Report(state, "Learner");
    expect(md).toContain("my own briefing sentence");
    expect(md).not.toContain("DRAFT");
  });

  it("never leaks instructor answer material into a student report", () => {
    const md = portfolioReport(completed(), "Learner");
    expect(md).not.toContain(week10InstructorKey.sampleBriefing);
    week10InstructorKey.answerRegister.forEach((row) => {
      expect(md).not.toContain(row.control);
    });
  });
});

describe("Week 10 instructor key", () => {
  it("covers every room and every scenario", () => {
    expect(week10InstructorKey.rooms.map((r) => r.roomId).sort()).toEqual(
      rooms.map((r) => r.id).sort(),
    );
    expect(week10InstructorKey.answerRegister).toHaveLength(5);
  });

  it("gives each room a prompt, reveals, misconceptions and advance checks", () => {
    week10InstructorKey.rooms.forEach((room) => {
      expect(room.facilitatorPrompt.length).toBeGreaterThan(0);
      expect(room.sayThis.length).toBeGreaterThan(0);
      expect(room.reveals.length).toBeGreaterThanOrEqual(3);
      expect(room.misconceptions.length).toBeGreaterThanOrEqual(2);
      expect(room.readyToAdvance.length).toBeGreaterThanOrEqual(2);
      room.reveals.forEach((r) => expect(evidenceById(r.evidenceId)).toBeDefined());
    });
  });

  it("gives every answer row ratings, a control, residual risk and alternatives", () => {
    week10InstructorKey.answerRegister.forEach((row) => {
      expect(row.likelihood.value).toBeGreaterThan(0);
      expect(row.impact.value).toBeGreaterThan(0);
      expect(row.control.length).toBeGreaterThan(0);
      expect(row.residual.length).toBeGreaterThan(0);
      expect(row.acceptableAlternatives.length).toBeGreaterThan(0);
      row.evidenceIds.forEach((id) => expect(evidenceById(id)).toBeDefined());
    });
  });

  it("provides a five-criterion rubric and an email answer boundary", () => {
    expect(week10InstructorKey.rubric).toHaveLength(5);
    expect(week10InstructorKey.emailAnswer.signs).toHaveLength(3);
    expect(week10InstructorKey.emailAnswer.proofBoundary).toMatch(/does not prove/i);
  });
});

describe("Week 10 registration", () => {
  it("appears as Module 4 Week 10 with both lab launch links", () => {
    const module4 = cyberfoundations.modules.find((m) => m.id === "cf-module-4");
    expect(module4).toBeDefined();
    const week = module4!.weeks.find((w) => w.id === "cf-week-10");
    expect(week?.status).toBe("available");
    const targets = (week?.links ?? []).map((l) => l.to);
    expect(targets).toContain("/cyberfoundations/week-10/lab-1");
    expect(targets).toContain("/cyberfoundations/week-10/lab-2");
  });

  it("does not disturb earlier weeks", () => {
    const ids = cyberfoundations.modules.flatMap((m) => m.weeks.map((w) => w.id));
    ["cf-week-06", "cf-week-07", "cf-week-08", "cf-week-09"].forEach((id) =>
      expect(ids).toContain(id),
    );
  });
});


describe("Week 10 room visits and completion", () => {
  it("counts only unique valid room IDs", () => {
    const state = createInitialState();
    state.visitedRooms = ["reception", "reception", "not-a-room"];
    expect(visitedRoomIds(state)).toEqual(["reception"]);
  });

  it("requires all five room visits before Week 10 is complete", () => {
    const state = completed();
    state.visitedRooms = rooms.slice(0, 4).map((r) => r.id);
    const items = checklist(state);
    const roomsItem = items.find((i) => i.id === "rooms");
    expect(roomsItem?.done).toBe(false);
    expect(items.every((i) => i.done)).toBe(false);
    expect(checklist(completed()).every((i) => i.done)).toBe(true);
  });

  it("records the first room shown as a visit once the store is ready", () => {
    // visitRoom is idempotent, mirroring the RoomBoard hydration effect.
    let state = createInitialState();
    const visit = (id: string) =>
      state.visitedRooms.includes(id)
        ? state
        : { ...state, visitedRooms: [...state.visitedRooms, id] };
    state = visit("reception");
    state = visit("reception");
    expect(state.visitedRooms).toEqual(["reception"]);
    expect(visitedRoomIds(state)).toEqual(["reception"]);
  });

  it("separates control, how it helps and remaining risk", () => {
    const state = createInitialState();
    state.controls = [
      { scenarioId: "SC-01", control: "MFA", howItHelps: "", residual: "" },
    ];
    expect(controlStatus(state, "SC-01")).toEqual({
      control: true,
      howItHelps: false,
      residual: false,
      complete: false,
    });
    state.controls = [
      { scenarioId: "SC-01", control: "MFA", howItHelps: "stops reuse", residual: "some" },
    ];
    expect(controlStatus(state, "SC-01").complete).toBe(true);
    expect(controlStatus(state, "SC-02").control).toBe(false);
  });

  it("distinguishes incomplete ratings from justified ones", () => {
    const state = createInitialState();
    expect(ratingStatus(state, "SC-01")).toBe("unrated");
    state.ratings = [
      { scenarioId: "SC-01", likelihood: 2, impact: 0, likelihoodWhy: "", impactWhy: "" },
    ];
    expect(ratingStatus(state, "SC-01")).toBe("partly-rated");
    state.ratings = [
      { scenarioId: "SC-01", likelihood: 2, impact: 3, likelihoodWhy: "", impactWhy: "" },
    ];
    expect(ratingStatus(state, "SC-01")).toBe("rated-without-reasons");
    state.ratings = [
      { scenarioId: "SC-01", likelihood: 2, impact: 3, likelihoodWhy: "a", impactWhy: "b" },
    ];
    expect(ratingStatus(state, "SC-01")).toBe("justified");
  });
});

describe("Week 10 independent-mode answer protection", () => {
  it("keeps authored threat answers out of student reports", () => {
    const md = portfolioReport(completed(), "Learner");
    threatEvents.forEach((t) => expect(md).not.toContain(t.name));
  });

  it("omits authored CIA answers from the independent-mode case packet", () => {
    const independent = casePacketMarkdown("independent");
    const guided = casePacketMarkdown("guided");
    assets.forEach((a) => {
      expect(independent).not.toContain(a.cia.confidentiality);
      expect(guided).toContain(a.cia.confidentiality);
      expect(independent).toContain(a.name);
    });
    evidence.forEach((e) => expect(independent).toContain(e.id));
  });
});

describe("Week 10 storage slots", () => {
  function withStorage<T>(fn: (store: Map<string, string>) => T, fail = false): T {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (fail) throw new Error("QuotaExceededError");
        map.set(k, v);
      },
      removeItem: (k: string) => void map.delete(k),
    };
    (globalThis as unknown as { window: unknown }).window = { localStorage: storage };
    try {
      return fn(map);
    } finally {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  }

  it("writes the newest state to the learner's own slot and restores it", () => {
    withStorage(() => {
      const student = { kind: "student" as const, id: "u1" };
      const demo = { kind: "instructor-demo" as const, id: "u1" };
      const state = { ...createInitialState(), notebook: "typed then navigated" };
      save(student, state);
      expect(load(student)?.notebook).toBe("typed then navigated");
      expect(load(demo)).toBeNull();
      clear(student);
      expect(load(student)).toBeNull();
    });
  });

  it("surfaces a storage failure instead of reporting a save", () => {
    withStorage(() => {
      expect(() => save({ kind: "student", id: "u1" }, createInitialState())).toThrow();
    }, true);
  });
});

describe("Week 10 review fixes", () => {
  it("scopes the Lab 1 export to Lab 1 requirements", () => {
    // Lab 1 finished, Lab 2 untouched.
    const state = completed();
    state.ratings = state.scenarios.map((s) => ({
      scenarioId: s.id,
      likelihood: 0,
      likelihoodWhy: "",
      impact: 0,
      impactWhy: "",
    }));
    state.priorities = [];
    state.priorityWhy = "";
    state.controls = [];
    state.briefing = "";

    expect(checklistFor(state, "lab1").every((i) => i.done)).toBe(true);
    expect(checklistFor(state, "lab2").some((i) => !i.done)).toBe(true);
    expect(checklistFor(state, "all").some((i) => !i.done)).toBe(true);

    expect(lab1Report(state)).not.toContain("DRAFT");
    expect(lab2Report(state)).toContain("DRAFT");
    expect(portfolioReport(state)).toContain("Week 10 is not complete");
  });

  it("marks the combined portfolio complete only when every requirement is met", () => {
    const state = completed();
    expect(portfolioReport(state)).not.toContain("DRAFT");

    const missingRooms = { ...state, visitedRooms: ["reception"] };
    expect(portfolioReport(missingRooms)).toContain("Week 10 is not complete");
    // Lab 1's own export still cares about the five-room walkthrough.
    expect(lab1Report(missingRooms)).toContain("DRAFT");
    // Lab 2's export is not blocked by the room walkthrough.
    expect(lab2Report(missingRooms)).not.toContain("DRAFT");
  });

  it("keeps guided Lab 1 hints free of the five authored threat answers", async () => {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/components/week10/Lab1.tsx", "utf8"),
    );
    expect(source).not.toContain("threatEvents");
    threatEvents.forEach((t) => expect(source).not.toContain(t.name));
  });

  it("does not leak authored threat answers into learner exports", () => {
    const state = completed();
    const text = `${lab1Report(state)}\n${portfolioReport(state)}`;
    threatEvents.forEach((t) => expect(text).not.toContain(t.name));
  });

  it("counts only unique valid rooms actually opened", () => {
    const state = createInitialState();
    state.visitedRooms = ["records", "records", "not-a-room"];
    expect(visitedRoomIds(state)).toEqual(["records"]);
    expect(checklist(state).find((i) => i.id === "rooms")?.done).toBe(false);
  });
});

describe("reviewed fixes: reflection, learner name, legacy backups", () => {
  function completeLab1() {
    const s = createInitialState();
    s.visitedRooms = rooms.map((r) => r.id);
    s.findings = evidence.slice(0, 5).map((e) => e.id);
    s.scenarios = s.scenarios.map((sc) => ({
      ...sc, evidenceIds: [evidence[0]!.id], threat: "t", vulnerability: "v", consequence: "c",
      cia: { confidentiality: true, integrity: false, availability: false },
    }));
    s.email = { signs: ["a", "b", "c"], safeStep: "report", proofNote: "   " };
    return s;
  }
  it("blank reflection keeps Lab 1 and portfolio incomplete but not Lab 2 scope", () => {
    const s = completeLab1();
    expect(checklistFor(s, "lab1").every((i) => i.done)).toBe(false);
    expect(lab1Report(s)).toContain("DRAFT");
    expect(portfolioReport(s)).toContain("DRAFT");
    expect(checklistFor(s, "lab2").some((i) => i.id === "email")).toBe(false);
    s.email.proofNote = "suspicious, not proven";
    expect(checklistFor(s, "lab1").every((i) => i.done)).toBe(true);
    expect(lab1Report(s)).not.toContain("DRAFT");
  });
  it("legacy backup without learnerName loads with all work and empty name", () => {
    const s = completeLab1();
    const legacy = JSON.parse(JSON.stringify(s));
    delete legacy.learnerName;
    const r = validate(legacy);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.learnerName).toBe("");
      expect(r.state.findings).toEqual(s.findings);
      expect(r.state.scenarios[0]!.threat).toBe("t");
    }
  });
  it("learner name round-trips through backup and appears on reports", () => {
    const s = { ...createInitialState(), learnerName: "Test Learner" };
    const r = validate(JSON.parse(JSON.stringify(s)));
    expect(r.ok && r.state.learnerName).toBe("Test Learner");
    expect(lab1Report(s)).toContain("Learner: Test Learner");
    expect(lab2Report(s)).toContain("Learner: Test Learner");
  });
});
