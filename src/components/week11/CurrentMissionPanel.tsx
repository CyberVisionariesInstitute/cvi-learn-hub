import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { missions } from "@/lib/week11/seed";
import { navForMissing, stepGuides, testChecklists, type Nav } from "@/lib/week11/guidance";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge } from "./ui";
import { CaptureEvidence } from "./CaptureEvidence";
import type { View } from "./Simulator";

interface CurrentMissionPanelProps {
  store: Week11Store;
  mission: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onView: (view: View) => void;
  go: (n: Nav) => void;
  step: number;
  onStep: (n: number) => void;
}

export function CurrentMissionPanel({ store, mission, open, onOpenChange, onView, go, step, onStep }: CurrentMissionPanelProps) {
  const contentId = useId();
  const [capturing, setCapturing] = useState(false);
  const [dl, setDl] = useState(false);
  const [dlMsg, setDlMsg] = useState<string | null>(null);
  const currentMission = missions.find((item) => item.key === mission) ?? missions[0];
  if (!currentMission || !store.view) return null;

  const s = store.view.state;
  const readiness = store.view.readiness.find((item) => item.mission === currentMission.key);
  const capturedSlots = new Set(store.view.evidence.filter((item) => item.mission === currentMission.key).map((item) => item.slot));
  const answers = store.learner.missions?.[currentMission.key]?.answers ?? {};
  const answeredCount = currentMission.questions.filter((question) => answers[question.id]?.trim()).length;
  const total = currentMission.steps.length;
  const idx = Math.min(step, total - 1);
  const guide = stepGuides[currentMission.key]?.[idx];
  const checklist = testChecklists[currentMission.key];
  const nextNav = readiness?.missing[0] ? navForMissing(currentMission.key, readiness.missing[0]) : null;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="sticky top-2 z-20 min-w-0 rounded-md border border-primary/50 bg-surface-raised shadow-lg lg:col-start-2">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
        <div className="min-w-0">
          <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">Current Mission · step {idx + 1} of {total}</p>
          <h2 className="truncate font-display text-sm sm:text-base">{currentMission.key} · {currentMission.title}</h2>
          {!open ? <p className="truncate text-xs text-muted-foreground">Step {idx + 1}: {guide?.doing ?? currentMission.steps[idx]} {guide ? `→ ${guide.where}` : ""}</p> : null}
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" className="min-h-11 shrink-0 px-3" aria-expanded={open} aria-controls={contentId}>
            {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            <span>{open ? "Collapse" : "Expand"}</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent id={contentId} className="max-h-[70dvh] overflow-y-auto border-t border-border px-3 pb-4 pt-3 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <p className="text-sm"><strong>Objective:</strong> {currentMission.objective}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose the step you're working on">
              <Button type="button" variant="outline" className="min-h-11" disabled={idx === 0} onClick={() => onStep(idx - 1)}>← Previous step</Button>
              <label className="text-sm"><span className="sr-only">Step</span>
                <select className="min-h-11 rounded-md border border-border bg-background px-2 text-sm" value={idx} onChange={(e) => onStep(Number(e.target.value))}>
                  {currentMission.steps.map((_, i) => <option key={i} value={i}>Step {i + 1}</option>)}
                </select>
              </label>
              <Button type="button" variant="outline" className="min-h-11" disabled={idx >= total - 1} onClick={() => onStep(idx + 1)}>Next step →</Button>
            </div>
            <section className="mt-3 rounded-md border border-border p-3" aria-labelledby={`${contentId}-step`}>
              <h3 id={`${contentId}-step`} className="flex flex-wrap items-center gap-2 font-display text-sm">Step {idx + 1} {guide ? <Badge tone={guide.mode === "explore" ? "info" : "warn"}>{guide.mode === "explore" ? "Explore" : "Assessed"}</Badge> : null}</h3>
              <p className="mt-1 text-sm">{currentMission.steps[idx]}</p>
              {guide ? (
                <dl className="mt-2 grid gap-1.5 text-sm">
                  <div><dt className="inline font-medium">What am I doing? </dt><dd className="inline">{guide.doing}</dd></div>
                  <div><dt className="inline font-medium">Where do I go? </dt><dd className="inline">{guide.where}</dd></div>
                  <div><dt className="inline font-medium">What am I looking for? </dt><dd className="inline">{guide.lookFor}</dd></div>
                  <div><dt className="inline font-medium">What proves success? </dt><dd className="inline">{guide.proves}</dd></div>
                </dl>
              ) : null}
              {guide ? <div className="mt-2 flex flex-wrap gap-1.5">{guide.links.map((n) => <Button key={n.label + n.view} type="button" variant="outline" className="min-h-10 text-xs" onClick={() => go(n)}>Open {n.label}</Button>)}
                {guide.capture ? <Button type="button" variant="outline" className="min-h-10 text-xs" aria-expanded={capturing} onClick={() => setCapturing((c) => !c)}>{capturing ? "Hide capture" : `Capture ${guide.capture} here`}</Button> : null}</div> : null}
              {capturing ? <div className="mt-3"><CaptureEvidence key={`${currentMission.key}-${guide?.capture}`} compact store={store} mission={currentMission.key} slots={currentMission.evidence} initialSlot={guide?.capture} /></div> : null}
            </section>
            {checklist ? (
              <section className="mt-3">
                <h3 className="font-display text-sm">Required tests — have you run them?</h3>
                <ul className="mt-1 grid gap-1 text-xs sm:grid-cols-2">{checklist.map((c) => { const done = s.tests.some((t) => t.account === c.account && t.resource === c.resource && t.action === c.action && t.mode === "current-access"); return <li key={c.label}><Badge tone={done ? "allow" : "neutral"}>{done ? "run" : "not yet"}</Badge> {c.label}</li>; })}</ul>
                <p className="mt-1 text-[0.7rem] text-muted-foreground">Shows only that a test exists in your records — not whether the result is correct.</p>
              </section>
            ) : null}
            <details className="mt-3"><summary className="cursor-pointer text-sm">All {total} mission tasks</summary>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">{currentMission.steps.map((st, i) => <li key={st}><button type="button" className={`text-left underline-offset-2 hover:underline ${i === idx ? "font-medium" : ""}`} onClick={() => onStep(i)}>{st}</button></li>)}</ol>
            </details>
          </div>

          <aside className="min-w-0 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0" aria-label="Mission progress">
            <h3 className="font-display text-sm">Factual checkpoints</h3>
            <div className="mt-2 flex flex-wrap gap-2" role="status" aria-live="polite">
              <Badge tone={readiness?.ready ? "allow" : "neutral"}>{readiness?.ready ? "Evidence-ready" : `${readiness?.missing.length ?? 0} requirement(s) remaining`}</Badge>
              <Badge tone="info">Evidence {capturedSlots.size}/{currentMission.evidence.length}</Badge>
              <Badge tone="info">Explanations {answeredCount}/{currentMission.questions.length}</Badge>
            </div>
            {!readiness?.ready && readiness?.missing[0] ? (
              <p className="mt-3 text-sm text-muted-foreground"><strong className="text-foreground">Next checkpoint:</strong> {readiness.missing[0]} {nextNav ? <button type="button" className="text-xs text-foreground underline" onClick={() => go(nextNav)}>Go there</button> : null}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Mission shortcuts">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("missions")}>Mission overview</Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("evidence")}>Evidence Tray (captions)</Button>
              <Button type="button" variant="outline" className="min-h-11" disabled={dl} onClick={async () => { setDl(true); try { const r = await store.exportLab(currentMission.key); setDlMsg(`Downloaded ${r.filename}${r.draft ? " (DRAFT)" : ""}.`); } catch (e) { setDlMsg(`Download failed: ${(e as Error).message}`); } finally { setDl(false); } }}>{dl ? "Preparing…" : "Download this lab"}</Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("downloads")}>Download & GitHub</Button>
              {currentMission.tickets.length ? <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("tickets")}>Tickets</Button> : null}
            </div>
            <p className="mt-2 text-xs" role="status" aria-live="polite">{dlMsg}</p>
            <p className="mt-3 text-xs text-muted-foreground">Return to Mission overview to answer explanations and check readiness when a step's evidence is captured.</p>
          </aside>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
