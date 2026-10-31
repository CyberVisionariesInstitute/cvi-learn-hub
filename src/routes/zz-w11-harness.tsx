// TEMPORARY isolated practice harness — fictional data, no server calls. Remove after checks.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createSeedState, applyCommand } from "@/lib/week11/engine";
import { missions } from "@/lib/week11/seed";
import { GuidedApp } from "@/components/week11/guided/GuidedApp";
import type { Learner, AttemptView } from "@/lib/week11/types";
import type { Week11Store, TextSave } from "@/lib/week11/useWeek11";

export const Route = createFileRoute("/zz-w11-harness")({ ssr: false, component: H });
function H() {
  const existing = new URLSearchParams(location.search).get("existing") === "1";
  const [state, setState] = useState(createSeedState());
  const [learner, setL] = useState<Learner>(existing ? { missions: { M01: { answers: { diff1: "x", diff2: "x", groups: "x", drew: "x" } } } } : {});
  const [save, setSave] = useState<TextSave>({ kind: "idle" });
  const [last, setLast] = useState<{ ok: boolean; message: string } | null>(null);
  const ready = existing ? ["M01", "M02"] : [];
  const view: AttemptView = { id: existing ? "fict-existing" : "fict-new", shortId: "FICT01", status: "active", revision: state.seq, textRevision: existing ? 3 : 0, seedVersion: "x", state, learner, evidence: [], readiness: missions.map((m) => ({ mission: m.key, ready: ready.includes(m.key), missing: ready.includes(m.key) ? [] : ["Example missing item (fictional)"] })), updatedAt: "", archived: [], reviews: [] };
  if (existing) view.state = { ...state, seq: Math.max(state.seq, 5) };
  const store = {
    view, loadError: null, busy: false, lastResult: last, setLastResult: setLast, learner, textSave: save,
    setLearner: (fn: (l: Learner) => Learner) => { setL(fn); setSave({ kind: "pending" }); setTimeout(() => setSave({ kind: "saved", at: "now" }), 800); },
    run: async (c: never) => { const r = applyCommand(state as never, c as never, "fict" as never) as never as { state?: typeof state; result?: { ok: boolean; message: string } }; if (r?.state) setState(r.state); const res = r?.result ?? { ok: true, message: "ok (fictional)" }; setLast(res); return res; },
    flush: async () => {}, reloadAfterConflict: async () => {}, captureEvidence: async () => { setLast({ ok: true, message: "Captured (fictional, not stored)" }); },
    exportZip: async () => ({}), exportLab: async () => ({}), reset: async () => {},
  } as unknown as Week11Store;
  return <div className="program-cyberfoundations min-h-screen bg-background text-foreground"><GuidedApp store={store} onClassic={() => setLast({ ok: true, message: "classic clicked" })} /></div>;
}
