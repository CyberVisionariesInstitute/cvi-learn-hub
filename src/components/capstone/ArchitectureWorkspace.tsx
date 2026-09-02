import { useMemo, useState } from "react";
import { Panel, Btn, Field, inputClass, Badge, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { newId, type ArchEdge, type ArchNode, type NodeKind } from "@/lib/capstone/project-state";
import type { EventEffects, ScenarioPublic } from "@/lib/capstone/scenario-types";
import { validateArchitecture, nodeLabel } from "@/lib/capstone/validation";

const TRUST_KINDS: NodeKind[] = ["ca-root", "ca-issuing", "hsm", "publisher"];
const INFRA_KINDS: NodeKind[] = ["vm", "service", "relying-system", "appliance", "publisher"];

const KIND_LABELS: Record<NodeKind, string> = {
  "ca-root": "Root CA",
  "ca-issuing": "Issuing CA",
  hsm: "HSM",
  publisher: "Status publisher",
  vm: "Server / VM",
  service: "Service",
  "relying-system": "Relying system",
  appliance: "Appliance",
};

export function ArchitectureWorkspace({
  scenario,
  effects,
  focus,
}: {
  scenario: ScenarioPublic;
  effects: EventEffects[];
  focus: "trust" | "infrastructure";
}) {
  const { draft, update } = useDraft();
  const kinds = focus === "trust" ? TRUST_KINDS : INFRA_KINDS;
  const [kind, setKind] = useState<NodeKind>(kinds[0] as NodeKind);
  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState(scenario.zones[0]?.id ?? "");
  const [selected, setSelected] = useState<string | null>(null);

  const disabledPaths = useMemo(
    () => effects.flatMap((e) => e.disablePaths ?? []),
    [effects],
  ) as [string, string][];

  const findings = useMemo(
    () => validateArchitecture(draft, scenario, disabledPaths),
    [draft, scenario, disabledPaths],
  );

  const nodes = draft.architecture.nodes;
  const shown = nodes.filter((n) => kinds.includes(n.kind));
  const sel = nodes.find((n) => n.id === selected) ?? null;

  function addNode() {
    if (!name.trim()) return;
    const node: ArchNode = {
      id: newId("node"),
      kind,
      name: name.trim(),
      role:
        scenario.nodeCatalog.find((c) => c.type === kind)?.role ?? KIND_LABELS[kind],
      zoneId,
      x: 40 + ((nodes.length * 90) % 520),
      y: 40 + Math.floor(nodes.length / 6) * 90,
    };
    update((s) => {
      s.architecture.nodes.push(node);
    });
    setName("");
    setSelected(node.id);
  }

  function patch(id: string, fn: (n: ArchNode) => void) {
    update((s) => {
      const node = s.architecture.nodes.find((n) => n.id === id);
      if (node) fn(node);
    });
  }

  return (
    <div className="space-y-6">
      <Panel
        title={focus === "trust" ? "Trust model builder" : "Infrastructure & connectivity"}
        description={
          focus === "trust"
            ? "Place your CA hierarchy, key protection, and publication points. Every CA needs a signing parent (except the root) and a key-protection decision."
            : "Place servers, services, relying systems, and connect them. Segmentation rules from the scenario are enforced by validation, not by the canvas."
        }
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Component">
            <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as NodeKind)}>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Zone">
            <select className={inputClass} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {scenario.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <Btn variant="primary" onClick={addNode}>
              Add component
            </Btn>
          </div>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.length === 0 ? (
            <li className="sm:col-span-2 lg:col-span-3">
              <Empty>No components placed yet.</Empty>
            </li>
          ) : null}
          {shown.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setSelected(n.id)}
                aria-pressed={selected === n.id}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selected === n.id
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-surface/70 hover:border-primary/40"
                }`}
              >
                <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {KIND_LABELS[n.kind]}
                </span>
                <span className="mt-1 block font-display text-base text-foreground">{n.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {scenario.zones.find((z) => z.id === n.zoneId)?.name ?? n.zoneId}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {sel ? (
        <Panel title={`Configure — ${sel.name}`} description={nodeLabel(sel)}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name">
              <input
                className={inputClass}
                value={sel.name}
                onChange={(e) => patch(sel.id, (n) => void (n.name = e.target.value))}
              />
            </Field>
            <Field label="Zone">
              <select
                className={inputClass}
                value={sel.zoneId}
                onChange={(e) => patch(sel.id, (n) => void (n.zoneId = e.target.value))}
              >
                {scenario.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Role / purpose">
              <input
                className={inputClass}
                value={sel.role}
                onChange={(e) => patch(sel.id, (n) => void (n.role = e.target.value))}
              />
            </Field>

            {sel.kind === "ca-issuing" ? (
              <Field label="Signing parent">
                <select
                  className={inputClass}
                  value={sel.parentId ?? ""}
                  onChange={(e) =>
                    patch(sel.id, (n) => void (n.parentId = e.target.value || undefined))
                  }
                >
                  <option value="">— none —</option>
                  {nodes
                    .filter((n) => n.kind === "ca-root" || (n.kind === "ca-issuing" && n.id !== sel.id))
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                </select>
              </Field>
            ) : null}

            {sel.kind === "ca-root" || sel.kind === "ca-issuing" ? (
              <>
                <Field label="Key protection (HSM)">
                  <select
                    className={inputClass}
                    value={sel.hsmId ?? ""}
                    onChange={(e) => patch(sel.id, (n) => void (n.hsmId = e.target.value || undefined))}
                  >
                    <option value="">— software key store —</option>
                    {nodes
                      .filter((n) => n.kind === "hsm")
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Key-protection rationale">
                  <input
                    className={inputClass}
                    value={sel.hsmRationale ?? ""}
                    onChange={(e) => patch(sel.id, (n) => void (n.hsmRationale = e.target.value))}
                  />
                </Field>
                <Field label="Certificate validity (days)">
                  <input
                    type="number"
                    className={inputClass}
                    value={sel.validityDays ?? 0}
                    onChange={(e) =>
                      patch(sel.id, (n) => void (n.validityDays = Number(e.target.value)))
                    }
                  />
                </Field>
                <Field label="Operational posture">
                  <select
                    className={inputClass}
                    value={sel.offline ? "offline" : "online"}
                    onChange={(e) => patch(sel.id, (n) => void (n.offline = e.target.value === "offline"))}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </Field>
              </>
            ) : null}

            <Field label="Notes">
              <input
                className={inputClass}
                value={sel.notes ?? ""}
                onChange={(e) => patch(sel.id, (n) => void (n.notes = e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Btn
              variant="quiet"
              onClick={() => {
                update((s) => {
                  s.architecture.nodes = s.architecture.nodes.filter((n) => n.id !== sel.id);
                  s.architecture.edges = s.architecture.edges.filter(
                    (e) => e.fromId !== sel.id && e.toId !== sel.id,
                  );
                });
                setSelected(null);
              }}
            >
              Remove component
            </Btn>
          </div>
        </Panel>
      ) : null}

      <EdgeEditor scenario={scenario} />

      <Panel
        title="Validation"
        description={`Deterministic architecture review. Findings explain what to reconsider — they do not give you the answer.`}
      >
        {findings.length === 0 ? (
          <Empty>No findings against the current architecture.</Empty>
        ) : (
          <ul className="space-y-3">
            {findings.map((f) => {
              const disp = draft.architecture.dispositions.find((d) => d.findingId === f.id);
              return (
                <li key={f.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={f.severity === "Critical" ? "bad" : f.severity === "Warning" ? "warn" : "info"}>
                      {f.severity}
                    </Badge>
                    <span className="font-display text-sm text-foreground">{f.title}</span>
                    <span className="text-xs text-muted-foreground">{f.ruleId}</span>
                  </div>
                  <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    <Row label="What triggered it" value={f.trigger} />
                    <Row label="Object" value={f.objectRef} />
                    <Row label="Related constraint" value={f.relatedConstraint} />
                    <Row label="What to reconsider" value={f.reconsider} />
                  </dl>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Disposition">
                      <select
                        className={inputClass}
                        value={disp?.disposition ?? "open"}
                        onChange={(e) =>
                          update((s) => {
                            const existing = s.architecture.dispositions.find((d) => d.findingId === f.id);
                            const value = e.target.value as "open" | "accepted-risk" | "remediated" | "rejected";
                            if (existing) existing.disposition = value;
                            else
                              s.architecture.dispositions.push({
                                findingId: f.id,
                                disposition: value,
                                rationale: "",
                              });
                          })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="remediated">Remediated</option>
                        <option value="accepted-risk">Accepted risk</option>
                        <option value="rejected">Rejected finding</option>
                      </select>
                    </Field>
                    <Field label="Rationale">
                      <input
                        className={inputClass}
                        value={disp?.rationale ?? ""}
                        onChange={(e) =>
                          update((s) => {
                            const existing = s.architecture.dispositions.find((d) => d.findingId === f.id);
                            if (existing) existing.rationale = e.target.value;
                            else
                              s.architecture.dispositions.push({
                                findingId: f.id,
                                disposition: "open",
                                rationale: e.target.value,
                              });
                          })
                        }
                      />
                    </Field>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

function EdgeEditor({ scenario }: { scenario: ScenarioPublic }) {
  const { draft, update } = useDraft();
  const nodes = draft.architecture.nodes;
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [kind, setKind] = useState<ArchEdge["kind"]>("network");
  const [label, setLabel] = useState("");

  function add() {
    if (!fromId || !toId || fromId === toId) return;
    update((s) => {
      s.architecture.edges.push({ id: newId("edge"), fromId, toId, kind, label });
    });
    setLabel("");
  }

  return (
    <Panel
      title="Connections"
      description="Network reachability, trust relationships, enrollment paths, and status publication paths."
    >
      <div className="grid gap-3 sm:grid-cols-5">
        <Field label="From">
          <select className={inputClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
            <option value="">—</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To">
          <select className={inputClass} value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">—</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as ArchEdge["kind"])}>
            <option value="network">network</option>
            <option value="trust">trust</option>
            <option value="enrollment">enrollment</option>
            <option value="publication">publication</option>
          </select>
        </Field>
        <Field label="Label">
          <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Btn onClick={add}>Connect</Btn>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {draft.architecture.edges.length === 0 ? (
          <li>
            <Empty>No connections yet.</Empty>
          </li>
        ) : null}
        {draft.architecture.edges.map((e) => {
          const from = nodes.find((n) => n.id === e.fromId);
          const to = nodes.find((n) => n.id === e.toId);
          return (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="text-foreground">
                {from?.name ?? "?"} → {to?.name ?? "?"}{" "}
                <span className="text-muted-foreground">
                  ({e.kind}
                  {e.label ? ` · ${e.label}` : ""}) ·{" "}
                  {scenario.zones.find((z) => z.id === from?.zoneId)?.name ?? "—"} →{" "}
                  {scenario.zones.find((z) => z.id === to?.zoneId)?.name ?? "—"}
                </span>
              </span>
              <Btn
                variant="quiet"
                onClick={() =>
                  update((s) => {
                    s.architecture.edges = s.architecture.edges.filter((x) => x.id !== e.id);
                  })
                }
              >
                Remove
              </Btn>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
