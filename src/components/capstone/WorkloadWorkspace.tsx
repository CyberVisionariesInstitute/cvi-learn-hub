import { useState } from "react";
import { Panel, Btn, Field, inputClass, Badge, DataTable, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { newId, type ExecutionRun } from "@/lib/capstone/project-state";
import type { PublicEvent, ScenarioPublic } from "@/lib/capstone/scenario-types";

const ROLES: Record<string, string[]> = {
  tls: ["server"],
  mtls: ["server", "client"],
  cicd: ["client", "signing"],
  "code-signing": ["signing", "tsa"],
  timestamping: ["tsa"],
  cloud: ["server", "client"],
};

export function WorkloadWorkspace({
  scenario,
  events,
  mode,
}: {
  scenario: ScenarioPublic;
  events: PublicEvent[];
  mode: "bind" | "execute";
}) {
  const { draft, update, execute, saving } = useDraft();
  const [definitionId, setDefinitionId] = useState(scenario.workloads[0]?.id ?? "");
  const [openRun, setOpenRun] = useState<string | null>(null);

  const activeKeys = events.map((e) => e.key);

  function addInstance() {
    const def = scenario.workloads.find((w) => w.id === definitionId);
    if (!def) return;
    update((s) => {
      s.workloads.instances.push({
        id: newId("wl"),
        definitionId: def.id,
        name: def.name,
        bindings: {},
        config: {},
      });
    });
  }

  return (
    <div className="space-y-6">
      <Panel
        title={mode === "bind" ? "Workload integration" : "Workload execution"}
        description={
          mode === "bind"
            ? "Instantiate each scenario workload and bind the certificates, endpoints, and configuration it needs."
            : "Execute a workload against your current design. Results are deterministic: same design, same result."
        }
      >
        {mode === "bind" ? (
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Scenario workload">
              <select
                className={inputClass}
                value={definitionId}
                onChange={(e) => setDefinitionId(e.target.value)}
              >
                {scenario.workloads.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.type})
                  </option>
                ))}
              </select>
            </Field>
            <Btn variant="primary" onClick={addInstance}>
              Add workload instance
            </Btn>
          </div>
        ) : null}

        <ul className="mt-5 space-y-4">
          {draft.workloads.instances.length === 0 ? (
            <li>
              <Empty>No workload instances yet. Add one in Validate first.</Empty>
            </li>
          ) : null}
          {draft.workloads.instances.map((inst) => {
            const def = scenario.workloads.find((w) => w.id === inst.definitionId);
            if (!def) return null;
            const roles = ROLES[def.type] ?? ["server"];
            const runs = draft.workloads.runs.filter((r) => r.workloadInstanceId === inst.id);
            const latest = runs[runs.length - 1];
            return (
              <li key={inst.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base text-foreground">{inst.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {def.type} · {scenario.zones.find((z) => z.id === def.sourceZone)?.name ?? def.sourceZone}{" "}
                      → {scenario.zones.find((z) => z.id === def.targetZone)?.name ?? def.targetZone}
                    </p>
                  </div>
                  {latest ? (
                    <Badge tone={latest.result === "PASS" ? "good" : "bad"}>
                      Last run {latest.result}
                      {isStale(latest, activeKeys) ? " · stale for current state" : ""}
                    </Badge>
                  ) : (
                    <Badge tone="info">Never executed</Badge>
                  )}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{def.notes}</p>
                {def.scenarioRequirement ? (
                  <p className="mt-1 text-sm text-foreground/90">
                    Scenario requirement: {def.scenarioRequirement}
                  </p>
                ) : null}

                {mode === "bind" ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {roles.map((role) => (
                      <Field key={role} label={`${role} certificate`}>
                        <select
                          className={inputClass}
                          value={inst.bindings[role] ?? ""}
                          onChange={(e) =>
                            update((s) => {
                              const i = s.workloads.instances.find((x) => x.id === inst.id);
                              if (i) i.bindings[role] = e.target.value || undefined;
                            })
                          }
                        >
                          <option value="">— unbound —</option>
                          {draft.operations.assets.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label} ({a.lifecycle})
                            </option>
                          ))}
                        </select>
                      </Field>
                    ))}
                    <Field label="Source component">
                      <select
                        className={inputClass}
                        value={inst.sourceNodeId ?? ""}
                        onChange={(e) =>
                          update((s) => {
                            const i = s.workloads.instances.find((x) => x.id === inst.id);
                            if (i) i.sourceNodeId = e.target.value || undefined;
                          })
                        }
                      >
                        <option value="">—</option>
                        {draft.architecture.nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Target component">
                      <select
                        className={inputClass}
                        value={inst.targetNodeId ?? ""}
                        onChange={(e) =>
                          update((s) => {
                            const i = s.workloads.instances.find((x) => x.id === inst.id);
                            if (i) i.targetNodeId = e.target.value || undefined;
                          })
                        }
                      >
                        <option value="">—</option>
                        {draft.architecture.nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex items-end">
                      <Btn
                        variant="quiet"
                        onClick={() =>
                          update((s) => {
                            s.workloads.instances = s.workloads.instances.filter((x) => x.id !== inst.id);
                          })
                        }
                      >
                        Remove instance
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <Btn variant="primary" disabled={saving} onClick={() => void execute(inst.id)}>
                      {saving ? "Executing…" : "Execute workload"}
                    </Btn>
                    {runs.length === 0 ? (
                      <Empty>No runs recorded for this workload.</Empty>
                    ) : (
                      <ul className="space-y-2">
                        {[...runs].reverse().map((run) => (
                          <li key={run.id} className="rounded-md border border-border">
                            <button
                              type="button"
                              onClick={() => setOpenRun(openRun === run.id ? null : run.id)}
                              aria-expanded={openRun === run.id}
                              className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left text-sm"
                            >
                              <span className="text-foreground">
                                {new Date(run.at).toLocaleString()} · day {run.clockDay} ·{" "}
                                {run.ruleVersion} / {run.scenarioVersion}
                              </span>
                              <span className="flex items-center gap-2">
                                {isStale(run, activeKeys) ? <Badge tone="warn">Stale</Badge> : null}
                                <Badge tone={run.result === "PASS" ? "good" : "bad"}>{run.result}</Badge>
                              </span>
                            </button>
                            {openRun === run.id ? <RunDetail run={run} /> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function isStale(run: ExecutionRun, activeKeys: string[]) {
  return activeKeys.some((k) => !run.activeEventKeys.includes(k));
}

function RunDetail({ run }: { run: ExecutionRun }) {
  return (
    <div className="border-t border-border p-3">
      <DataTable head={["#", "Check", "Result", "Expected", "Observed", "Category", "Consequence"]}>
        {run.checks.map((c) => (
          <tr key={`${run.id}-${c.key}`} className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 text-muted-foreground">{c.order}</td>
            <td className="py-2 pr-3 text-foreground">{c.label}</td>
            <td className="py-2 pr-3">
              <Badge tone={c.result === "pass" ? "good" : c.result === "fail" ? "bad" : "info"}>
                {c.result}
              </Badge>
            </td>
            <td className="py-2 pr-3 text-muted-foreground">{c.expected}</td>
            <td className="py-2 pr-3 text-muted-foreground">{c.observed}</td>
            <td className="py-2 pr-3 text-muted-foreground">{c.category ?? "—"}</td>
            <td className="py-2 text-muted-foreground">{c.consequence ?? "—"}</td>
          </tr>
        ))}
      </DataTable>
      {run.artifacts.length > 0 ? (
        <div className="mt-3">
          <h4 className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Artifacts</h4>
          <ul className="mt-1 space-y-1 text-sm text-foreground/90">
            {run.artifacts.map((a) => (
              <li key={a.id}>
                {a.label} — <span className="text-muted-foreground">{a.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {run.timestamps.length > 0 ? (
        <div className="mt-3">
          <h4 className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Timestamps</h4>
          <ul className="mt-1 space-y-1 text-sm text-foreground/90">
            {run.timestamps.map((t) => (
              <li key={t.id}>
                {new Date(t.at).toLocaleString()} — {t.valid ? "valid" : "invalid"} · {t.note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {run.priorRunIds.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Prior runs preserved: {run.priorRunIds.length}
        </p>
      ) : null}
    </div>
  );
}
