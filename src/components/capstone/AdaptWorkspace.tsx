import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Panel, Btn, Field, inputClass, Badge, DataTable, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { newId } from "@/lib/capstone/project-state";
import {
  CHECKPOINT_TYPES,
  CHECKPOINT_STATUSES,
  type CheckpointStatus,
  type CheckpointType,
  type PublicEvent,
} from "@/lib/capstone/scenario-types";
import { acknowledgeEvent, completeCheckpoint } from "@/lib/capstone/capstone.functions";
import { useRefreshWorkspace } from "@/lib/capstone/useWorkspace";

const CHECKPOINT_WEEK: Record<CheckpointType, number> = {
  "change-assessment": 21,
  "remediation-design": 22,
  "recovery-validation": 23,
  "evidence-defense": 24,
};

export function AdaptWorkspace({
  events,
  eventRows,
  reviews,
  projectId,
}: {
  events: PublicEvent[];
  eventRows: { id: string; key: string; acknowledged_at: string | null; activated_at: string | null }[];
  reviews: { stage: string; review_state: string; reviewer_notes: string | null }[];
  projectId: string;
}) {
  const { draft, update, save } = useDraft();
  const runAck = useServerFn(acknowledgeEvent);
  const runCheckpoint = useServerFn(completeCheckpoint);
  const refresh = useRefreshWorkspace();
  const [busy, setBusy] = useState(false);

  async function acknowledge(event: PublicEvent) {
    const row = eventRows.find((r) => r.key === event.key);
    if (!row) return;
    setBusy(true);
    try {
      await runAck({ data: { id: row.id } });
      update((s) => {
        if (!s.change.acknowledged.includes(event.key)) s.change.acknowledged.push(event.key);
        s.change.timeline.push({
          id: newId("tl"),
          at: new Date().toISOString(),
          kind: "event",
          title: event.title,
          detail: event.studentBrief,
          eventKey: event.key,
        });
        s.change.baselines.push({
          id: newId("base"),
          eventKey: event.key,
          at: new Date().toISOString(),
          runSummary: s.workloads.instances.map((i) => {
            const runs = s.workloads.runs.filter((r) => r.workloadInstanceId === i.id);
            const last = runs[runs.length - 1];
            return {
              workloadInstanceId: i.id,
              runId: last?.id ?? "none",
              result: last?.result ?? "FAIL",
            };
          }),
          findingCount: s.architecture.dispositions.length,
        });
        s.clockDay += 1;
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Change & incident response"
        description="Released changes arrive on your instructor's timing. Your earlier design and evidence are never rewritten — you respond forward."
      >
        {events.length === 0 ? (
          <Empty>No changes have been released to your scenario yet.</Empty>
        ) : (
          <ul className="space-y-4">
            {events.map((e) => {
              const row = eventRows.find((r) => r.key === e.key);
              const acked = Boolean(row?.acknowledged_at) || draft.change.acknowledged.includes(e.key);
              return (
                <li key={e.key} className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="warn">{e.kind}</Badge>
                    <h3 className="font-display text-base text-foreground">{e.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{e.studentBrief}</p>
                  {e.symptoms.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {e.symptoms.map((s) => (
                        <li key={s} className="flex gap-2 text-sm text-foreground/90">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-3">
                    {acked ? (
                      <p className="text-xs text-muted-foreground">
                        Acknowledged — baseline captured. Re-run affected workloads in Test.
                      </p>
                    ) : (
                      <Btn variant="primary" disabled={busy} onClick={() => void acknowledge(e)}>
                        Acknowledge and capture baseline
                      </Btn>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Change timeline" description="Before / after record of every released change and your response.">
        {draft.change.timeline.length === 0 ? (
          <Empty>Nothing on the timeline yet.</Empty>
        ) : (
          <DataTable head={["When", "Type", "Entry", "Detail"]}>
            {[...draft.change.timeline].reverse().map((t) => (
              <tr key={t.id} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 text-muted-foreground">{new Date(t.at).toLocaleString()}</td>
                <td className="py-2 pr-3 text-muted-foreground">{t.kind}</td>
                <td className="py-2 pr-3 text-foreground">{t.title}</td>
                <td className="py-2 text-muted-foreground">{t.detail}</td>
              </tr>
            ))}
          </DataTable>
        )}
        <div className="mt-4">
          <AddTimelineEntry />
        </div>
      </Panel>

      <Panel
        title="Instructor checkpoints"
        description="Submit each checkpoint for review. Instructor feedback appears here; your work stays editable."
      >
        <ul className="space-y-3">
          {CHECKPOINT_TYPES.map((ct) => {
            const record = draft.change.checkpoints.find((c) => c.type === ct.key);
            const review = reviews.find((r) => r.stage === ct.key);
            return (
              <li key={ct.key} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base text-foreground">{ct.label}</h3>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(record?.status ?? "Not Ready")}>
                      {record?.status ?? "Not Ready"}
                    </Badge>
                    {review ? <Badge tone="info">Review: {review.review_state}</Badge> : null}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Field label="Your note to the reviewer">
                      <input
                        className={inputClass}
                        value={record?.studentNote ?? ""}
                        onChange={(e) =>
                          update((s) => {
                            const existing = s.change.checkpoints.find((c) => c.type === ct.key);
                            if (existing) existing.studentNote = e.target.value;
                            else
                              s.change.checkpoints.push({
                                type: ct.key,
                                status: "Not Ready",
                                studentNote: e.target.value,
                              });
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Status">
                    <select
                      className={inputClass}
                      value={record?.status ?? "Not Ready"}
                      onChange={(e) =>
                        update((s) => {
                          const value = e.target.value as CheckpointStatus;
                          const existing = s.change.checkpoints.find((c) => c.type === ct.key);
                          if (existing) existing.status = value;
                          else
                            s.change.checkpoints.push({
                              type: ct.key,
                              status: value,
                              studentNote: "",
                            });
                        })
                      }
                    >
                      {CHECKPOINT_STATUSES.filter(
                        (s) => s === "Not Ready" || s === "Ready for Review" || s === "Submitted",
                      ).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {review?.reviewer_notes ? (
                  <p className="mt-3 rounded-md border border-border bg-surface/70 p-3 text-sm text-foreground/90">
                    Reviewer: {review.reviewer_notes}
                  </p>
                ) : null}
                <div className="mt-3">
                  <Btn
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        update((s) => {
                          const existing = s.change.checkpoints.find((c) => c.type === ct.key);
                          const at = new Date().toISOString();
                          if (existing) {
                            existing.status = "Submitted";
                            existing.submittedAt = at;
                          } else {
                            s.change.checkpoints.push({
                              type: ct.key,
                              status: "Submitted",
                              studentNote: "",
                              submittedAt: at,
                            });
                          }
                        });
                        await save(`Checkpoint submitted: ${ct.label}`);
                        await runCheckpoint({
                          data: {
                            projectId,
                            stage: ct.key,
                            week: CHECKPOINT_WEEK[ct.key],
                            done: true,
                          },
                        });
                        await refresh();
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Submit for review
                  </Btn>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function statusTone(status: CheckpointStatus) {
  if (status === "Accepted") return "good" as const;
  if (status === "Needs Revision") return "bad" as const;
  if (status === "Submitted" || status === "Ready for Review") return "warn" as const;
  return "info" as const;
}

function AddTimelineEntry() {
  const { update } = useDraft();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field label="Action taken">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Detail">
        <input className={inputClass} value={detail} onChange={(e) => setDetail(e.target.value)} />
      </Field>
      <div className="flex items-end">
        <Btn
          onClick={() => {
            if (!title.trim()) return;
            update((s) => {
              s.change.timeline.push({
                id: newId("tl"),
                at: new Date().toISOString(),
                kind: "student-action",
                title: title.trim(),
                detail: detail.trim(),
              });
            });
            setTitle("");
            setDetail("");
          }}
        >
          Record action
        </Btn>
      </div>
    </div>
  );
}
