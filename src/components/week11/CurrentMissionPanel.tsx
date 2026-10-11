import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { missions, type Directory, type MissionId } from "@/lib/week11/seed";
import { navForMissing, testChecklists, type Nav } from "@/lib/week11/guidance";
import { instructionSteps, instructionProgress, type InstructionPreference } from "@/lib/week11/instructions";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge } from "./ui";
import { InstructionStepPanel } from "./InstructionStepPanel";
import type { View } from "./Simulator";

interface CurrentMissionPanelProps {
  store: Week11Store; mission: MissionId; open: boolean;
  onOpenChange: (open: boolean) => void; onView: (view: View) => void;
  go: (nav: Nav) => void; preference?: InstructionPreference | undefined;
  onStep: (step: number) => void; onComplete: (id: string, checked: boolean) => void;
  dir: Directory;
}

export function CurrentMissionPanel({ store, mission, open, onOpenChange, onView, go, preference, onStep, onComplete, dir }: CurrentMissionPanelProps) {
  const contentId = useId();
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const currentMission = missions.find((item) => item.key === mission);
  if (!currentMission || !store.view) return null;
  const steps = instructionSteps[currentMission.key];
  const progress = instructionProgress(steps, preference);
  const idx = progress.current;
  const instruction = steps[idx];
  if (!instruction) return null;
  const readiness = store.view.readiness.find((item) => item.mission === mission);
  const capturedSlots = new Set(store.view.evidence.filter((item) => item.mission === mission).map((item) => item.slot));
  const answers = store.learner.missions?.[mission]?.answers ?? {};
  const answeredCount = currentMission.questions.filter((question) => answers[question.id]?.trim()).length;
  const checklist = testChecklists[mission];
  const nextNav = readiness?.missing[0] ? navForMissing(mission, readiness.missing[0]) : null;
  const checked = preference?.completed.includes(instruction.id) ?? false;
  const advance = () => { onComplete(instruction.id, true); onStep(Math.min(idx + 1, steps.length - 1)); };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="sticky top-2 z-20 min-w-0 rounded-md border border-primary/50 bg-surface-raised shadow-lg lg:col-start-2">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
        <div className="min-w-0">
          <p className="font-display text-xs text-primary">Current Mission · Step {idx + 1} of {steps.length}</p>
          <h2 className="font-display text-sm [overflow-wrap:anywhere] sm:text-base">{currentMission.lab} · {currentMission.title}</h2>
          {!open ? <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">Next step: {instruction.doing}</p> : null}
        </div>
        <CollapsibleTrigger asChild><Button type="button" variant="outline" className="min-h-11 shrink-0 px-3" aria-controls={contentId} aria-expanded={open} aria-label={open ? "Collapse Current Mission" : "Expand Current Mission"}>{open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}<span className="hidden sm:inline">{open ? "Collapse" : "Expand"}</span></Button></CollapsibleTrigger>
      </div>
      <CollapsibleContent id={contentId} className="max-h-[65dvh] overflow-y-auto border-t border-border px-3 pb-4 pt-3 sm:px-4">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{progress.completed} checked complete · current step {idx + 1} · {progress.remaining} unchecked</p>
            <p className="mt-1 text-xs text-muted-foreground">Personal checklist on this browser only — not readiness or a grade.</p>
            <div className="my-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose the step you're working on">
              <Button type="button" variant="outline" disabled={idx === 0} onClick={() => onStep(idx - 1)}>← Previous</Button>
              <label className="min-w-0 text-xs"><span className="sr-only">Step</span><select className="min-h-11 max-w-full rounded-md border border-border bg-background px-2" value={idx} onChange={(event) => onStep(Number(event.target.value))}>{steps.map((step, index) => <option key={step.id} value={index}>Step {index + 1}{preference?.completed.includes(step.id) ? " ✓" : ""}{step.group ? ` · ${step.group}` : ""}</option>)}</select></label>
              <Button type="button" variant="outline" disabled={idx === steps.length - 1} onClick={() => onStep(idx + 1)}>Next →</Button>
            </div>
            {mission === "M06" ? <div className="mb-3 border-l-2 border-primary pl-3 text-xs"><p>Labs 1–5: administer, test, and collect evidence.</p><p className="mt-1 font-medium">Lab 6: investigate the records and assemble Portfolio Deliverable 4.</p></div> : null}
            <InstructionStepPanel key={instruction.id} instruction={instruction} mission={mission} store={store} go={go} currentDir={dir} />
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
              <label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={checked} onChange={(event) => onComplete(instruction.id, event.target.checked)} />I have completed this step</label>
              <Button type="button" variant="outline" onClick={advance}>{idx === steps.length - 1 ? "Check this step complete" : "Done — next step"}</Button>
            </div>
            <details className="mt-3"><summary className="cursor-pointer text-xs">All steps{instruction.group ? " / ticket checklists" : ""}</summary><ol className="mt-2 space-y-1">{steps.map((step, index) => <li key={step.id}><Button type="button" variant="ghost" className="h-auto min-h-11 w-full justify-start whitespace-normal text-left text-xs" aria-current={index === idx ? "step" : undefined} onClick={() => onStep(index)}>{preference?.completed.includes(step.id) ? "✓" : index === idx ? "→" : "○"} {index + 1}. {step.group ? `${step.group} · ` : ""}{step.doing}</Button></li>)}</ol></details>
            {checklist ? <details className="mt-3" open={mission === "M04" && instruction.sourceStep === 3}><summary className="cursor-pointer text-xs">Access test checklist</summary><ul className="mt-2 space-y-2 text-xs">{checklist.map((item) => { const recorded = store.view?.state.tests.some((test) => test.account === item.account && test.resource === item.resource && test.action === item.action && test.mode === "current-access"); return <li key={item.label}><Badge tone={recorded ? "allow" : "neutral"}>{recorded ? "recorded" : "not yet"}</Badge> {item.label}</li>; })}</ul><p className="mt-2 text-xs text-muted-foreground">Recorded means a test exists, not that its security result is correct. Read the decision and reason.</p></details> : null}
            {mission === "M06" && idx === steps.length - 1 ? <p className="mt-3 border-l-2 border-primary pl-3 text-xs">Your completed Week 11 Case File becomes the source for Week 12. Use the same signed-in account for Week 12 so your Case File can be found.</p> : null}
          </div>
          <aside className="min-w-0 border-t border-border pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0" aria-label="Mission progress">
            <h3 className="text-xs font-semibold">Saved work checkpoints</h3>
            <div className="mt-2 flex flex-wrap gap-2" role="status" aria-live="polite"><Badge tone={readiness?.ready ? "allow" : "neutral"}>{readiness?.ready ? "Evidence-ready" : `${readiness?.missing.length ?? 0} requirement(s) remaining`}</Badge><Badge>Evidence {capturedSlots.size}/{currentMission.evidence.length}</Badge><Badge>Explanations {answeredCount}/{currentMission.questions.length}</Badge></div>
            {!readiness?.ready && readiness?.missing[0] ? <details className="mt-3 text-xs"><summary className="cursor-pointer">Next saved-work checkpoint</summary><p className="mt-2 [overflow-wrap:anywhere]">{readiness.missing[0]}</p>{nextNav ? <Button type="button" variant="outline" className="mt-2 h-auto min-h-11 whitespace-normal text-xs" onClick={() => go(nextNav)}>Open {nextNav.label}</Button> : null}</details> : null}
            <details className="mt-3 text-xs"><summary className="cursor-pointer">Mission shortcuts / downloads</summary><div className="mt-2 flex flex-wrap gap-2"><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal text-xs" onClick={() => onView("missions")}>Mission Progress</Button><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal text-xs" onClick={() => onView("evidence")}>Evidence Tray</Button><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal text-xs" disabled={downloading} onClick={async () => { setDownloading(true); try { const result = await store.exportLab(mission); setDownloadMessage(`Downloaded ${result.filename}${result.draft ? " (DRAFT)" : ""}.`); } catch (error) { setDownloadMessage(`Download failed: ${(error as Error).message}`); } finally { setDownloading(false); } }}>{downloading ? "Preparing…" : "Download this lab"}</Button><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal text-xs" onClick={() => onView("downloads")}>Download &amp; GitHub</Button>{currentMission.tickets.length ? <Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal text-xs" onClick={() => onView("tickets")}>Help Desk / IAM Tickets</Button> : null}</div></details>
            <p className="mt-2 text-xs [overflow-wrap:anywhere]" role="status" aria-live="polite">{downloadMessage}</p>
          </aside>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
