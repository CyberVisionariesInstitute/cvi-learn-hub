import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Week12App } from "@/components/week12/Week12App";
import { normalizeContent, type ExecOption, type W12Content, type Week12View } from "@/lib/week12/model";

// TEMPORARY isolated practice harness — fictional data, no server calls.
export const Route = createFileRoute("/w12-harness")({ ssr: false, component: H });

const snapshot = {
  version: 1, sourceShortId: "PRAC01", sourceStatus: "active", sourceArchivedAt: null, studentName: "Practice Student", w11TextRevision: 1, w11StateRevision: 1,
  sourceComplete: false, sourceMissing: ["Finish finding F2."],
  findings: [{ key: "F1", title: "Practice finding", refs: ["X1"], observation: "Practice observation text.", hypothesis: "Practice hypothesis.", conclusion: "Practice conclusion sentence here.", uncertainty: "Practice unknown.", nextAction: "Practice next.", priority: "high", rationale: "r" }],
  comparison: { refs: [], text: "" }, report: { sections: [], limitations: "Practice limits text.", liveChain: "" }, captions: {},
  evidence: [{ key: "EV-PRAC01-001", slot: "E17", mission: "M06", title: "Practice", capturedRevision: 1, contentHash: "h" }], historicalEventIds: ["X1", "X2"], correlationIds: [],
} as Week12View["snapshot"];

function H() {
  const [content, setContent] = useState<W12Content>(() => ({ ...normalizeContent({}), findings: [{ key: "RF1", sourceFindingKey: "F1", statement: "", evidenceRefs: [], confidence: "", uncertainty: "" }, { key: "RF2", sourceFindingKey: "", statement: "", evidenceRefs: [], confidence: "", uncertainty: "" }] }));
  const [execOption, setExec] = useState<ExecOption>("");
  const [stage, setStage] = useState(1);
  const view: Week12View = { id: "practice-attempt", textRevision: 1, execOption, content, snapshot, snapshotHash: "h", capturedAt: "", updatedAt: "", volunteerStatus: "none", presenterSelected: false, sourceChange: null, reviews: [] };
  (window as unknown as { __w12: unknown }).__w12 = content;
  const store = {
    view, blocked: false, loadError: null, content, execOption, saveState: { kind: "idle" as const },
    update: (fn: (c: W12Content) => W12Content) => setContent((c) => fn(c)), chooseExec: setExec,
    flush: async () => {}, reloadAfterConflict: async () => {}, refreshSource: async () => {}, setVolunteer: async () => {},
    downloadZip: async () => ({ filename: "week-12-portfolio-DRAFT.zip", files: [], zipBase64: "", draft: true }),
    downloadFile: async () => ({ filename: "x.md", content: "", draft: true }),
  };
  return <Week12App store={store as never} stage={stage} onStage={setStage} />;
}
