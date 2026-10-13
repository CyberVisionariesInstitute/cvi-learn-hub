import { useEffect, useId, useState } from "react";
import { Badge, btn, btnPrimary } from "@/components/week11/ui";
import { useSession } from "@/hooks/useSession";
import { guideKey, parseGuidePrefs, stageProgress, stageSteps, type GuidePrefs, type GuideTarget } from "@/lib/week12/guide";
import type { ExecOption } from "@/lib/week12/model";

/** Browser-local guide position, scoped to the signed-in account + Week 12 attempt. Never learner content. */
export function useGuidePrefs(attemptId: string) {
  const { user } = useSession();
  const key = user ? guideKey(user.id, attemptId) : null;
  const [prefs, setPrefs] = useState<GuidePrefs>({ stages: {} });
  const [loaded, setLoaded] = useState<string | null>(null);
  useEffect(() => {
    if (!key) return;
    try { setPrefs(parseGuidePrefs(localStorage.getItem(key))); } catch { setPrefs({ stages: {} }); }
    setLoaded(key);
  }, [key]);
  useEffect(() => {
    if (!key || loaded !== key) return;
    try { localStorage.setItem(key, JSON.stringify(prefs)); } catch { /* guide still works */ }
  }, [key, loaded, prefs]);
  return { prefs: loaded === key ? prefs : { stages: {} }, ready: loaded !== null && loaded === key, setPrefs };
}

/** Scrolls to and focuses an on-page target; switches stage first when needed. Never writes data. */
export function useGoTo(stage: number, onStage: (n: number) => void) {
  return (target: GuideTarget) => {
    const focus = () => {
      const el = document.getElementById(target.anchor);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const field = el.matches("input,textarea,select,button") ? el : el.querySelector<HTMLElement>("input,textarea,select,button,summary");
      (field ?? el).focus({ preventScroll: true });
    };
    if (target.stage !== stage) { onStage(target.stage); setTimeout(focus, 150); } else focus();
  };
}

export function Week12Guide({ stage, title, execOption, attemptId, onStage, stageReady }: {
  stage: number; title: string; execOption: ExecOption; attemptId: string; onStage: (n: number) => void; stageReady: boolean;
}) {
  const { prefs, setPrefs } = useGuidePrefs(attemptId);
  const go = useGoTo(stage, onStage);
  const panelId = useId();
  const [open, setOpen] = useState(true);
  const steps = stageSteps(stage, execOption);
  const pref = prefs.stages[String(stage)];
  const p = stageProgress(steps, pref);
  const step = steps[p.current];
  useEffect(() => { setPrefs((all) => (all.lastStage === stage ? all : { ...all, lastStage: stage })); }, [stage, setPrefs]);
  if (!step) return null;
  const setStep = (current: number) => setPrefs((all) => ({ ...all, stages: { ...all.stages, [stage]: { completed: all.stages[stage]?.completed ?? [], current } } }));
  const mark = (id: string, on: boolean) => setPrefs((all) => {
    const prev = all.stages[stage] ?? { current: 0, completed: [] };
    return { ...all, stages: { ...all.stages, [stage]: { ...prev, completed: on ? [...new Set([...prev.completed, id])] : prev.completed.filter((x) => x !== id) } } };
  });
  const checked = pref?.completed.includes(step.id) ?? false;
  const last = p.current === steps.length - 1;
  return (
    <section className="sticky top-2 z-20 min-w-0 rounded-xl border border-primary/50 bg-surface-raised p-3 text-sm shadow-lg" aria-label="Current stage guide">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="font-display text-xs text-primary">Current Stage {stage} of 6 · Step {p.current + 1} of {steps.length}</p>
          <h2 className="font-display text-base [overflow-wrap:anywhere]">{title}</h2>
          {!open ? <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">Next step: {step.doing}</p> : null}
        </div>
        <button type="button" className={`${btn} text-xs`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>{open ? "Hide guide" : "Show guide"}</button>
      </div>
      {open ? (
        <div id={panelId} className="mt-2 max-h-[60dvh] min-w-0 overflow-y-auto [overflow-wrap:anywhere]">
          <p className="text-xs text-muted-foreground">{p.completed} checked complete · {p.remaining} remaining · personal checklist on this browser only — not Final QA or a grade.</p>
          <div className="my-2 flex flex-wrap items-center gap-2" role="group" aria-label="Choose the step you're working on">
            <button type="button" className={btn} disabled={p.current === 0} onClick={() => setStep(p.current - 1)}>← Previous</button>
            <select aria-label="Step" className="min-h-11 max-w-full rounded-md border border-border bg-background px-2 text-xs" value={p.current} onChange={(e) => setStep(Number(e.target.value))}>
              {steps.map((s, i) => <option key={s.id} value={i}>Step {i + 1}{pref?.completed.includes(s.id) ? " ✓" : ""}</option>)}
            </select>
            <button type="button" className={btn} disabled={last} onClick={() => setStep(p.current + 1)}>Next →</button>
          </div>
          {stage === 4 && !execOption && steps.length === 1 ? <p className="mb-2 text-xs text-muted-foreground">Your written or video steps appear here after you choose an option.</p> : null}
          <dl className="max-w-prose space-y-2">
            <div><dt className="text-xs font-semibold text-primary">DO THIS</dt><dd className="mt-0.5 font-medium">{step.doing}</dd></div>
            <div><dt className="text-xs font-semibold text-primary">GO HERE</dt><dd className="mt-0.5">{step.where}</dd></div>
            <div><dt className="text-xs font-semibold text-primary">LOOK FOR</dt><dd className="mt-0.5">{step.lookFor}</dd></div>
            <div><dt className="text-xs font-semibold text-primary">WHEN DONE</dt><dd className="mt-0.5">{step.whenDone}</dd></div>
          </dl>
          <div className="mt-2 flex flex-wrap gap-2">{step.links.map((l) => <button key={l.anchor + l.stage} type="button" className={`${btn} h-auto whitespace-normal text-left text-xs`} onClick={() => go(l)}>Open {l.label}{l.stage !== stage ? ` (Stage ${l.stage})` : ""}</button>)}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-2">
            <label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={checked} onChange={(e) => mark(step.id, e.target.checked)} />I have completed this step</label>
            {!last ? <button type="button" className={btn} onClick={() => { mark(step.id, true); setStep(p.current + 1); }}>Done — next step</button>
              : stage < 6 ? <button type="button" className={btnPrimary} onClick={() => { mark(step.id, true); onStage(stage + 1); }}>Done — go to Stage {stage + 1}</button>
              : <button type="button" className={btn} onClick={() => mark(step.id, true)}>Check this step complete</button>}
            {stageReady ? <Badge tone="allow">Stage QA items ✓</Badge> : null}
          </div>
          {step.help ? <details className="mt-2 text-xs"><summary className="cursor-pointer">Need help?</summary><p className="mt-1 max-w-prose text-muted-foreground">{step.help}</p></details> : null}
          <details className="mt-2 text-xs"><summary className="cursor-pointer">Why this matters</summary><p className="mt-1 max-w-prose text-muted-foreground">{WHY[stage]}</p></details>
          <details className="mt-2 text-xs"><summary className="cursor-pointer">Terms</summary><p className="mt-1 max-w-prose text-muted-foreground">Evidence is a specific record ID (EV-…, or an event ID from your source). A finding is a conclusion your evidence supports. Uncertainty is what the records cannot show. An executive is a leader who decides but does not read logs. A recommendation is an action with an owner and a deadline.</p></details>
          <details className="mt-2 text-xs"><summary className="cursor-pointer">Troubleshooting</summary><div className="mt-1 max-w-prose space-y-1 text-muted-foreground"><p>Your typing autosaves — watch the save status at the top. Moving between steps, findings or sections never deletes your work.</p><p>If an ID shows "✕ not in source", copy it again from Stage 1. If your Week 11 work changed, use "Refresh from Week 11…" — it never happens automatically.</p></div></details>
          <details className="mt-2 text-xs"><summary className="cursor-pointer">All steps in this stage</summary><ol className="mt-1 space-y-1">{steps.map((s, i) => <li key={s.id}><button type="button" className="min-h-11 w-full rounded px-1 text-left hover:bg-surface" aria-current={i === p.current ? "step" : undefined} onClick={() => setStep(i)}>{pref?.completed.includes(s.id) ? "✓" : i === p.current ? "→" : "○"} {i + 1}. {s.doing}</button></li>)}</ol></details>
        </div>
      ) : null}
    </section>
  );
}

const WHY: Record<number, string> = {
  1: "Knowing which statements are facts and which are interpretations stops you over-claiming in your report.",
  2: "Findings are the heart of the report. Each one must be traceable to evidence a reviewer can check.",
  3: "A technical reader needs scope, evidence, timeline and limits to trust and act on your work.",
  4: "Leaders decide quickly. They need the same facts in plain language, without logs or jargon.",
  5: "A recommendation with no owner, deadline or measure rarely gets done.",
  6: "Downloading is not submitting. Your instructor can only review work that is uploaded and submitted.",
};

/** Welcome-back card: resumes the last stage this browser saw for this account + attempt. Navigation only. */
export function Week12Resume({ stage, attemptId, onStage, execOption }: { stage: number; attemptId: string; onStage: (n: number) => void; execOption: ExecOption }) {
  const { prefs, ready } = useGuidePrefs(attemptId);
  const steps = stageSteps(stage, execOption);
  const nextAction = steps[stageProgress(steps, prefs.stages[String(stage)]).current]?.doing ?? "";
  const [initial, setInitial] = useState<number | null>(null);
  useEffect(() => { if (ready && initial === null) setInitial(prefs.lastStage ?? 0); }, [ready, initial, prefs.lastStage]);
  const resume = initial && initial !== stage ? initial : null;
  return (
    <section className="rounded-xl border border-border bg-surface p-3 text-sm" aria-label="Week 12 orientation">
      <p className="font-display text-xs text-primary">{resume ? "Welcome back" : "Week 12 path"}</p>
      <ol className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground"><li>Stage 1 Review →</li><li>2 Findings →</li><li>3 Technical report →</li><li>4 Executive communication →</li><li>5 Recommendations →</li><li>6 Final QA &amp; GitHub</li></ol>
      <p className="mt-2"><strong>Current stage:</strong> Stage {stage}. <strong>Next step:</strong> {nextAction}</p>
      {resume ? <button type="button" className={`${btnPrimary} mt-2`} onClick={() => onStage(resume)}>Continue at Stage {resume}</button> : null}
      <p className="mt-1 text-xs text-muted-foreground">Work one step at a time using the guide below. Your writing autosaves to your account.</p>
    </section>
  );
}
