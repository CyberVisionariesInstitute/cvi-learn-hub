import { useState } from "react";
import { Panel, Btn, Field, inputClass, Badge, DataTable, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { newId, type AnalysisItem, type AnalysisKind } from "@/lib/capstone/project-state";
import type { ScenarioPublic } from "@/lib/capstone/scenario-types";

const KINDS: { key: AnalysisKind; label: string; hint: string }[] = [
  { key: "fact", label: "Facts", hint: "Stated in the brief and not in dispute." },
  { key: "assumption", label: "Assumptions", hint: "What you are choosing to assume, and why." },
  { key: "question", label: "Open questions", hint: "What you would ask the organization." },
  { key: "risk", label: "Risks", hint: "What could go wrong, and what it would cost." },
  { key: "requirement", label: "Requirements", hint: "What the architecture must satisfy." },
  { key: "decision", label: "Decisions", hint: "Choices made, with rationale." },
];

export function AnalyzeWorkspace({ scenario }: { scenario: ScenarioPublic }) {
  const { draft, update } = useDraft();
  const [kind, setKind] = useState<AnalysisKind>("requirement");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState("");

  const sources = [
    ...scenario.constraints.map((c) => `Constraint: ${c}`),
    ...scenario.concerns.map((c) => `Concern: ${c}`),
    ...scenario.openQuestions.map((c) => `Open question: ${c}`),
    ...scenario.requiredOutcomes.map((c) => `Required outcome: ${c}`),
  ];

  function add() {
    if (!title.trim()) return;
    const item: AnalysisItem = {
      id: newId("an"),
      kind,
      title: title.trim(),
      detail: detail.trim(),
      source,
      ...(kind === "requirement" ? { status: "unresolved" as const, priority: "Must" as const } : {}),
    };
    update((s) => {
      s.analysis.push(item);
    });
    setTitle("");
    setDetail("");
  }

  return (
    <div className="space-y-6">
      <Panel
        id="brief"
        title="Scenario brief"
        description="Authoritative and read-only. Your project is the editable object."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Situation</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{scenario.situation}</p>
            <h3 className="mt-4 text-xs tracking-[0.14em] text-muted-foreground uppercase">Mission</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{scenario.mission}</p>
            <h3 className="mt-4 text-xs tracking-[0.14em] text-muted-foreground uppercase">
              Definition of success
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {scenario.definitionOfSuccess}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Organization metrics
              </h3>
              <dl className="mt-2 grid grid-cols-2 gap-2">
                {scenario.metrics.map((m) => (
                  <div key={m.label} className="rounded-md border border-border p-2">
                    <dt className="text-xs text-muted-foreground">{m.label}</dt>
                    <dd className="text-sm text-foreground">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <BriefList title="Current-state concerns" items={scenario.concerns} />
            <BriefList title="Design constraints" items={scenario.constraints} />
            <BriefList title="Intentionally open questions" items={scenario.openQuestions} />
            <BriefList title="Required outcomes" items={scenario.requiredOutcomes} />
            <BriefList title="Research & fairness guidance" items={scenario.researchGuidance} />
          </div>
        </div>
      </Panel>

      <Panel
        id="add"
        title="Requirements workspace"
        description="Capture facts, assumptions, questions, risks, requirements and decisions, and trace each back to the brief."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Type">
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => setKind(e.target.value as AnalysisKind)}
            >
              {KINDS.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Statement">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Traced from">
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">— not traced —</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s.length > 70 ? `${s.slice(0, 70)}…` : s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Detail">
            <input className={inputClass} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <Btn variant="primary" onClick={add}>
            Add record
          </Btn>
        </div>
      </Panel>

      {KINDS.map((k) => {
        const rows = draft.analysis.filter((a) => a.kind === k.key);
        return (
          <Panel key={k.key} title={k.label} description={k.hint}>
            {rows.length === 0 ? (
              <Empty>Nothing recorded yet.</Empty>
            ) : (
              <DataTable head={["Statement", "Traced from", "Detail", k.key === "requirement" ? "Status" : "", ""]}>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-3 text-foreground">{r.title}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.source || "—"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.detail || "—"}</td>
                    <td className="py-2 pr-3">
                      {k.key === "requirement" ? (
                        <select
                          className={inputClass}
                          value={r.status ?? "unresolved"}
                          onChange={(e) =>
                            update((s) => {
                              const item = s.analysis.find((a) => a.id === r.id);
                              if (item) item.status = e.target.value as AnalysisItem["status"];
                            })
                          }
                        >
                          <option value="addressed">addressed</option>
                          <option value="partially addressed">partially addressed</option>
                          <option value="unresolved">unresolved</option>
                        </select>
                      ) : null}
                    </td>
                    <td className="py-2">
                      <Btn
                        variant="quiet"
                        onClick={() =>
                          update((s) => {
                            s.analysis = s.analysis.filter((a) => a.id !== r.id);
                          })
                        }
                      >
                        Remove
                      </Btn>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
            {k.key === "requirement" && rows.length > 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {rows.filter((r) => r.status === "addressed").length} addressed ·{" "}
                {rows.filter((r) => r.status === "partially addressed").length} partial ·{" "}
                {rows.filter((r) => r.status === "unresolved").length} unresolved
              </p>
            ) : null}
          </Panel>
        );
      })}
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FindingBadge({ severity }: { severity: string }) {
  return (
    <Badge tone={severity === "Critical" ? "bad" : severity === "Warning" ? "warn" : "info"}>
      {severity}
    </Badge>
  );
}
