import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/capstone/useWorkspace";
import { STAGES, getStage, isStageKey, type StageKey } from "@/lib/capstone/model";
import { AnalyzeWorkspace } from "@/components/capstone/AnalyzeWorkspace";
import { ArchitectureWorkspace } from "@/components/capstone/ArchitectureWorkspace";
import { OperateWorkspace } from "@/components/capstone/OperateWorkspace";
import { AutomateWorkspace } from "@/components/capstone/AutomateWorkspace";
import { WorkloadWorkspace } from "@/components/capstone/WorkloadWorkspace";
import { AdaptWorkspace } from "@/components/capstone/AdaptWorkspace";
import { DefendWorkspace } from "@/components/capstone/DefendWorkspace";

export const Route = createFileRoute("/pki/capstone/$stage")({
  params: {
    parse: (raw: Record<string, string>) => {
      if (!isStageKey(raw['stage'] ?? "")) throw notFound();
      return { stage: raw['stage'] as StageKey };
    },
    stringify: (params: { stage: StageKey }) => ({ stage: params.stage }),
  },
  component: StagePage,
});

function StagePage() {
  const { stage: stageKey } = Route.useParams();
  const stage = getStage(stageKey);
  const { data } = useWorkspace(true);

  if (!data || !data.assignment || !data.scenario || !data.project) return null;
  const scenario = data.scenario;
  const events = data.events;
  const effects = events.map((e) => e.effects);

  const index = STAGES.findIndex((s) => s.key === stageKey);
  const prev = index > 0 ? STAGES[index - 1] : null;
  const next = index < STAGES.length - 1 ? STAGES[index + 1] : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.24em] text-primary uppercase">Week {stage.week}</p>
        <h2 className="mt-1 font-display text-xl text-foreground">
          {stage.label} — {stage.headline}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{stage.objective}</p>
      </header>

      {stageKey === "analyze" ? <AnalyzeWorkspace scenario={scenario} /> : null}
      {stageKey === "design" ? (
        <ArchitectureWorkspace scenario={scenario} effects={effects} focus="trust" />
      ) : null}
      {stageKey === "connect" ? (
        <ArchitectureWorkspace scenario={scenario} effects={effects} focus="infrastructure" />
      ) : null}
      {stageKey === "operate" ? <OperateWorkspace scenario={scenario} effects={effects} /> : null}
      {stageKey === "automate" ? <AutomateWorkspace scenario={scenario} /> : null}
      {stageKey === "validate" ? (
        <WorkloadWorkspace scenario={scenario} events={events} mode="bind" />
      ) : null}
      {stageKey === "test" ? (
        <WorkloadWorkspace scenario={scenario} events={events} mode="execute" />
      ) : null}
      {stageKey === "adapt" ? (
        <AdaptWorkspace
          events={events}
          eventRows={data.eventRows}
          reviews={data.checkpoints.map((c) => ({
            stage: c.stage,
            review_state: c.review_state,
            reviewer_notes: c.reviewer_notes,
          }))}
          projectId={data.project.id}
        />
      ) : null}
      {stageKey === "defend" ? <DefendWorkspace scenario={scenario} workspace={data} /> : null}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {prev ? (
          <Link
            to="/pki/capstone/$stage"
            params={{ stage: prev.key }}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            ← {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/pki/capstone/$stage"
            params={{ stage: next.key }}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            {next.label} →
          </Link>
        ) : (
          <Link
            to="/pki/capstone/evidence"
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            Evidence locker →
          </Link>
        )}
      </nav>
    </div>
  );
}
