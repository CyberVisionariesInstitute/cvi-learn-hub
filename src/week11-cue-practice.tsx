/**
 * TEMPORARY practice harness — fictional data only, no server functions imported.
 * Renders the guided Week 11 view against a synthetic attempt so the record-field
 * cue can be checked in a browser without touching any real student attempt.
 */
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/styles.css";
import { GuidedApp } from "@/components/week11/guided/GuidedApp";
import { LogsView } from "@/components/week11/InvestigationViews";
import { createSeedState } from "@/lib/week11/engine";
import { missions, SEED_VERSION } from "@/lib/week11/seed";
import type { AttemptView, Learner } from "@/lib/week11/types";
import type { Week11Store } from "@/lib/week11/useWeek11";

const synthetic = (): AttemptView => ({
  id: "practice-attempt", shortId: "PRAC", status: "active", revision: 1, textRevision: 0,
  seedVersion: SEED_VERSION, state: createSeedState(), learner: {}, evidence: [],
  readiness: missions.map((m) => ({ mission: m.key, ready: false, missing: [], required: true, optional: [] })),
  updatedAt: new Date().toISOString(), archived: [], reviews: [],
});

function Practice() {
  const [view, setView] = useState<AttemptView>(synthetic);
  const store = {
    view, loadError: null, busy: false, lastResult: null, setLastResult: () => {},
    run: async () => null,
    learner: view.learner,
    setLearner: (fn: (l: Learner) => Learner) => setView((v) => ({ ...v, learner: fn(v.learner) })),
    textSave: { kind: "idle" }, flush: async () => {}, reloadAfterConflict: async () => {},
    captureEvidence: async () => {}, exportZip: async () => ({}), exportLab: async () => ({}), reset: async () => {},
  } as unknown as Week11Store;
  const classic = window.location.search.includes("classic");
  return (
    <div className="program-cyberfoundations min-h-screen bg-background text-foreground">
      {classic ? <div className="mx-auto max-w-5xl p-4"><LogsView store={store} kind="signin" /><LogsView store={store} kind="audit" /></div>
        : <GuidedApp store={store} onClassic={() => {}} />}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Practice /></StrictMode>);
