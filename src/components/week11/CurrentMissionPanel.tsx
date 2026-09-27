import { useId } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { missions } from "@/lib/week11/seed";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge } from "./ui";
import type { View } from "./Simulator";

interface CurrentMissionPanelProps {
  store: Week11Store;
  mission: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onView: (view: View) => void;
}

export function CurrentMissionPanel({ store, mission, open, onOpenChange, onView }: CurrentMissionPanelProps) {
  const contentId = useId();
  const currentMission = missions.find((item) => item.key === mission) ?? missions[0];
  if (!currentMission || !store.view) return null;

  const readiness = store.view.readiness.find((item) => item.mission === currentMission.key);
  const capturedSlots = new Set(
    store.view.evidence.filter((item) => item.mission === currentMission.key).map((item) => item.slot),
  );
  const answers = store.learner.missions?.[currentMission.key]?.answers ?? {};
  const answeredCount = currentMission.questions.filter((question) => answers[question.id]?.trim()).length;
  const currentTask = readiness?.ready
    ? "Review your work and evidence before export."
    : currentMission.steps[0] ?? currentMission.objective;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="sticky top-2 z-20 min-w-0 rounded-md border border-primary/50 bg-surface-raised shadow-lg">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
        <div className="min-w-0">
          <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">Current Mission</p>
          <h2 className="truncate font-display text-sm sm:text-base">{currentMission.key} · {currentMission.title}</h2>
          {!open ? <p className="truncate text-xs text-muted-foreground">Current task: {currentTask}</p> : null}
        </div>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 shrink-0 px-3"
            aria-expanded={open}
            aria-controls={contentId}
          >
            {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            <span>{open ? "Collapse" : "Expand"}</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent id={contentId} className="max-h-[70dvh] overflow-y-auto border-t border-border px-3 pb-4 pt-3 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <p className="text-sm"><strong>Objective:</strong> {currentMission.objective}</p>
            <p className="mt-1 text-sm"><strong>Situation:</strong> {currentMission.situation}</p>
            <h3 className="mt-4 font-display text-sm">Mission tasks</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
              {currentMission.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>

          <aside className="min-w-0 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0" aria-label="Mission progress">
            <h3 className="font-display text-sm">Factual checkpoints</h3>
            <div className="mt-2 flex flex-wrap gap-2" role="status" aria-live="polite">
              <Badge tone={readiness?.ready ? "allow" : "neutral"}>
                {readiness?.ready ? "Evidence-ready" : `${readiness?.missing.length ?? 0} requirement(s) remaining`}
              </Badge>
              <Badge tone="info">Evidence {capturedSlots.size}/{currentMission.evidence.length}</Badge>
              <Badge tone="info">Explanations {answeredCount}/{currentMission.questions.length}</Badge>
            </div>
            <p className="mt-3 text-sm"><strong>Current task:</strong> {currentTask}</p>
            {!readiness?.ready && readiness?.missing[0] ? (
              <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Next checkpoint:</strong> {readiness.missing[0]}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Mission shortcuts">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("missions")}>Mission overview</Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("evidence")}>Evidence Tray</Button>
              {currentMission.tickets.length ? <Button type="button" variant="outline" className="min-h-11" onClick={() => onView("tickets")}>Tickets</Button> : null}
            </div>
          </aside>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}