import { Button } from "@/components/ui/button";
import { missions } from "@/lib/week11/seed";
import type { Week11Store } from "@/lib/week11/useWeek11";
import type { View } from "./Simulator";

export function Week11Path({ store, mission, onMission, onView }: { store: Week11Store; mission: string; onMission: (mission: string) => void; onView: (view: View) => void }) {
  return (
    <section className="mt-3 min-w-0 border-y border-border py-3" aria-label="Week 11 path">
      <ol className="flex flex-wrap items-center gap-1">{missions.map((item, index) => <li key={item.key} className="flex items-center gap-1"><Button type="button" variant="ghost" className="h-auto min-h-11 whitespace-normal px-2 text-xs" aria-current={mission === item.key ? "step" : undefined} onClick={() => { onMission(item.key); onView("missions"); }}>Lab {index + 1}{index === 5 ? " Case File" : ""}{store.view?.readiness.find((result) => result.mission === item.key)?.ready ? " ✓" : ""}</Button><span aria-hidden="true">→</span></li>)}<li><Button type="button" variant="ghost" className="h-auto min-h-11 whitespace-normal px-2 text-xs" onClick={() => onView("downloads")}>Download &amp; GitHub</Button></li></ol>
      <p className="mt-1 max-w-prose text-xs text-muted-foreground">Week 11 is one continuous IAM investigation. Your work carries forward from one lab to the next. Do not reset between labs unless your instructor tells you to.</p>
    </section>
  );
}
