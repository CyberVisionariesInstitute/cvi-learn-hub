import { useMemo, useState } from "react";
import { Panel, Btn, Field, inputClass, Badge, DataTable, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import {
  newId,
  type CertAsset,
  type StudentProfile,
} from "@/lib/capstone/project-state";
import {
  LIFECYCLE_TRANSITIONS,
  STATUS_VALUES,
  OWNER_STATES,
  type EventEffects,
  type LifecycleState,
  type OwnerState,
  type ScenarioPublic,
  type StatusValue,
} from "@/lib/capstone/scenario-types";

function lifecycleTone(state: LifecycleState) {
  if (state === "Active" || state === "Issued") return "good" as const;
  if (state === "Revoked" || state === "Expired") return "bad" as const;
  if (state === "Renewal Due" || state === "Renewal Pending") return "warn" as const;
  return "info" as const;
}

export function OperateWorkspace({
  scenario,
  effects,
}: {
  scenario: ScenarioPublic;
  effects: EventEffects[];
}) {
  const { draft, update } = useDraft();
  const [tab, setTab] = useState<"profiles" | "inventory" | "history">("profiles");

  const statusOverrides = useMemo(() => {
    const merged: Record<string, StatusValue> = {};
    for (const e of effects) Object.assign(merged, e.statusOverrides ?? {});
    return merged;
  }, [effects]);

  const eventAssets = useMemo(() => effects.flatMap((e) => e.addAssets ?? []), [effects]);

  const unseeded = [...scenario.inventory, ...eventAssets].filter(
    (seed) => !draft.seeded.includes(seed.id),
  );

  function importInventory() {
    update((s) => {
      for (const seed of [...scenario.inventory, ...eventAssets]) {
        if (s.seeded.includes(seed.id)) continue;
        s.seeded.push(seed.id);
        s.operations.assets.push({
          id: seed.id,
          label: seed.label,
          poolId: seed.poolId,
          zoneId: seed.zoneId,
          owner: seed.owner,
          ownerState: seed.ownerState,
          lifecycle: seed.lifecycle,
          status: seed.status,
          daysRemaining: seed.daysRemaining,
          origin: seed.origin,
          note: seed.note,
        });
        s.operations.lifecycle.push({
          id: newId("lc"),
          assetId: seed.id,
          at: new Date().toISOString(),
          action: "imported",
          to: seed.lifecycle,
          actor: "student",
          detail: `Imported from scenario inventory (${seed.origin}).`,
        });
      }
      s.operations.discovery.push({
        id: newId("disc"),
        at: new Date().toISOString(),
        scope: "Full scenario inventory sweep",
        foundAssetIds: [...scenario.inventory, ...eventAssets].map((i) => i.id),
      });
    });
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Certificate operations"
        description="Pools are fixed by the scenario. Profiles, ownership, and lifecycle actions are yours."
      >
        <div className="flex flex-wrap gap-2">
          {(["profiles", "inventory", "history"] as const).map((t) => (
            <Btn key={t} variant={tab === t ? "primary" : "quiet"} onClick={() => setTab(t)}>
              {t === "profiles" ? "Profiles" : t === "inventory" ? "Inventory" : "Lifecycle history"}
            </Btn>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scenario.pools.map((p) => (
            <div key={p.id} className="rounded-md border border-border p-3">
              <p className="font-display text-sm text-foreground">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.purpose}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Status challenge: {scenario.policy.statusChallenge}
        </p>
      </Panel>

      {tab === "profiles" ? <Profiles scenario={scenario} /> : null}

      {tab === "inventory" ? (
        <Panel
          title="Certificate inventory"
          description="Every certificate has an owner state and a lifecycle state. Illegal transitions are blocked."
        >
          {unseeded.length > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-primary/40 bg-primary/5 p-3">
              <p className="text-sm text-foreground">
                {unseeded.length} certificate record(s) available from discovery.
              </p>
              <Btn variant="primary" onClick={importInventory}>
                Run discovery import
              </Btn>
            </div>
          ) : null}

          {draft.operations.assets.length === 0 ? (
            <Empty>No certificates in your inventory yet.</Empty>
          ) : (
            <DataTable
              head={["Certificate", "Pool", "Owner", "Owner state", "Lifecycle", "Status", "Days", "Actions"]}
            >
              {draft.operations.assets.map((a) => {
                const status = statusOverrides[a.id] ?? a.status;
                return (
                  <tr key={a.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-3">
                      <span className="text-foreground">{a.label}</span>
                      <span className="block text-xs text-muted-foreground">{a.note}</span>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {scenario.pools.find((p) => p.id === a.poolId)?.name ?? a.poolId}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={a.owner}
                        onChange={(e) =>
                          update((s) => {
                            const asset = s.operations.assets.find((x) => x.id === a.id);
                            if (asset) asset.owner = e.target.value;
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={a.ownerState}
                        onChange={(e) =>
                          update((s) => {
                            const asset = s.operations.assets.find((x) => x.id === a.id);
                            if (asset) asset.ownerState = e.target.value as OwnerState;
                          })
                        }
                      >
                        {OWNER_STATES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge tone={lifecycleTone(a.lifecycle)}>{a.lifecycle}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={status}
                        disabled={Boolean(statusOverrides[a.id])}
                        onChange={(e) =>
                          update((s) => {
                            const asset = s.operations.assets.find((x) => x.id === a.id);
                            if (asset) asset.status = e.target.value as StatusValue;
                          })
                        }
                      >
                        {STATUS_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{a.daysRemaining ?? "—"}</td>
                    <td className="py-2">
                      <LifecycleActions asset={a} scenario={scenario} />
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>
      ) : null}

      {tab === "history" ? (
        <Panel title="Lifecycle history" description="Append-only record of every certificate action.">
          {draft.operations.lifecycle.length === 0 ? (
            <Empty>No lifecycle actions recorded yet.</Empty>
          ) : (
            <DataTable head={["When", "Certificate", "Action", "From", "To", "Actor", "Detail"]}>
              {[...draft.operations.lifecycle].reverse().map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-muted-foreground">
                    {new Date(l.at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 text-foreground">
                    {draft.operations.assets.find((a) => a.id === l.assetId)?.label ?? l.assetId}
                  </td>
                  <td className="py-2 pr-3 text-foreground">{l.action}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{l.from ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{l.to ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{l.actor}</td>
                  <td className="py-2 text-muted-foreground">{l.detail}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      ) : null}
    </div>
  );
}

function LifecycleActions({ asset, scenario }: { asset: CertAsset; scenario: ScenarioPublic }) {
  const { draft, update } = useDraft();
  const allowed = LIFECYCLE_TRANSITIONS[asset.lifecycle];
  const profile = draft.operations.profiles.find((p) => p.id === asset.profileId);
  const approvalMode = profile?.approval ?? "standard";

  function transition(to: LifecycleState, action: string) {
    update((s) => {
      const a = s.operations.assets.find((x) => x.id === asset.id);
      if (!a) return;
      const from = a.lifecycle;
      a.lifecycle = to;
      if (to === "Revoked") a.status = "Revoked";
      if (to === "Active") a.status = "Good";
      s.operations.lifecycle.push({
        id: newId("lc"),
        assetId: a.id,
        at: new Date().toISOString(),
        action,
        from,
        to,
        actor: "student",
        detail: `${action} via operations console.`,
      });
      if (action === "request" && approvalMode !== "standard") {
        s.operations.approvals.push({
          id: newId("apr"),
          assetId: a.id,
          requestedBy: "student",
          approvedBy: approvalMode === "dual" ? "second approver" : "governance board",
          mode: approvalMode,
          at: new Date().toISOString(),
          note: `${approvalMode} approval recorded for ${a.label}.`,
        });
      }
      if (action === "renew") {
        const replacement: CertAsset = {
          ...a,
          id: newId("cert"),
          label: `${a.label} (renewed)`,
          lifecycle: "Issued",
          status: "Good",
          daysRemaining: profile?.validityDays ?? 365,
          origin: "student",
          replacesId: a.id,
          note: `Replacement issued for ${a.label}.`,
        };
        a.lifecycle = "Replaced";
        s.operations.assets.push(replacement);
        s.operations.lifecycle.push({
          id: newId("lc"),
          assetId: replacement.id,
          at: new Date().toISOString(),
          action: "issued",
          to: "Issued",
          actor: "student",
          detail: `Issued as replacement for ${a.label}.`,
        });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {allowed.includes("Requested") ? (
        <Btn variant="quiet" onClick={() => transition("Requested", "request")}>
          Request
        </Btn>
      ) : null}
      {allowed.includes("Issued") ? (
        <Btn variant="quiet" onClick={() => transition("Issued", "issue")}>
          Issue
        </Btn>
      ) : null}
      {allowed.includes("Active") ? (
        <Btn variant="quiet" onClick={() => transition("Active", "activate")}>
          Activate
        </Btn>
      ) : null}
      {asset.lifecycle === "Renewal Due" || asset.lifecycle === "Renewal Pending" ? (
        <Btn variant="quiet" onClick={() => transition("Replaced", "renew")}>
          Renew
        </Btn>
      ) : null}
      {allowed.includes("Revoked") ? (
        <Btn variant="quiet" onClick={() => transition("Revoked", "revoke")}>
          Revoke
        </Btn>
      ) : null}
      <select
        aria-label={`Assign profile to ${asset.label}`}
        className={inputClass}
        value={asset.profileId ?? ""}
        onChange={(e) =>
          update((s) => {
            const a = s.operations.assets.find((x) => x.id === asset.id);
            if (a) a.profileId = e.target.value || undefined;
          })
        }
      >
        <option value="">— no profile —</option>
        {draft.operations.profiles
          .filter((p) => p.poolId === asset.poolId)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>
      <select
        aria-label={`Issuing CA for ${asset.label}`}
        className={inputClass}
        value={asset.caNodeId ?? ""}
        onChange={(e) =>
          update((s) => {
            const a = s.operations.assets.find((x) => x.id === asset.id);
            if (a) a.caNodeId = e.target.value || undefined;
          })
        }
      >
        <option value="">— no issuing CA —</option>
        {draft.architecture.nodes
          .filter((n) => n.kind === "ca-issuing" || n.kind === "ca-root")
          .map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
      </select>
      <select
        aria-label={`Bind ${asset.label} to component`}
        className={inputClass}
        value={asset.targetNodeId ?? ""}
        onChange={(e) =>
          update((s) => {
            const a = s.operations.assets.find((x) => x.id === asset.id);
            if (a) a.targetNodeId = e.target.value || undefined;
          })
        }
      >
        <option value="">— unbound —</option>
        {draft.architecture.nodes
          .filter((n) => !["hsm", "ca-root", "ca-issuing"].includes(n.kind))
          .map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({scenario.zones.find((z) => z.id === n.zoneId)?.name ?? n.zoneId})
            </option>
          ))}
      </select>
    </div>
  );
}

function Profiles({ scenario }: { scenario: ScenarioPublic }) {
  const { draft, update } = useDraft();
  const [templateId, setTemplateId] = useState(scenario.profiles[0]?.id ?? "");

  function addFromTemplate() {
    const t = scenario.profiles.find((p) => p.id === templateId);
    if (!t) return;
    const profile: StudentProfile = {
      id: newId("prof"),
      name: t.name,
      poolId: t.poolId,
      eligibleCaIds: [],
      algorithm: t.algorithm,
      validityDays: t.validityDays,
      subject: "",
      san: "",
      eku: t.eku,
      enrollment: "Manual",
      approval: t.approval,
      renewal: "manual",
      statusMethod: "CRL",
      ownershipRequired: true,
      exportable: false,
      environment: t.environment,
      rationale: "",
    };
    update((s) => {
      s.operations.profiles.push(profile);
    });
  }

  return (
    <Panel
      title="Certificate profiles"
      description="Start from a scenario template, then decide enrollment, approval, renewal, status method and ownership rules."
    >
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Template">
          <select className={inputClass} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {scenario.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {scenario.pools.find((x) => x.id === p.poolId)?.name}
              </option>
            ))}
          </select>
        </Field>
        <Btn variant="primary" onClick={addFromTemplate}>
          Create profile
        </Btn>
      </div>

      <div className="mt-5 space-y-4">
        {draft.operations.profiles.length === 0 ? <Empty>No profiles defined yet.</Empty> : null}
        {draft.operations.profiles.map((p) => (
          <div key={p.id} className="rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Profile name">
                <input
                  className={inputClass}
                  value={p.name}
                  onChange={(e) => patch(p.id, (x) => void (x.name = e.target.value))}
                />
              </Field>
              <Field label="Eligible issuing CAs">
                <select
                  multiple
                  className={`${inputClass} min-h-24`}
                  value={p.eligibleCaIds}
                  onChange={(e) =>
                    patch(
                      p.id,
                      (x) =>
                        void (x.eligibleCaIds = Array.from(e.target.selectedOptions).map((o) => o.value)),
                    )
                  }
                >
                  {draft.architecture.nodes
                    .filter((n) => n.kind === "ca-issuing" || n.kind === "ca-root")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Algorithm">
                <input
                  className={inputClass}
                  value={p.algorithm}
                  onChange={(e) => patch(p.id, (x) => void (x.algorithm = e.target.value))}
                />
              </Field>
              <Field label="Validity (days)">
                <input
                  type="number"
                  className={inputClass}
                  value={p.validityDays}
                  onChange={(e) => patch(p.id, (x) => void (x.validityDays = Number(e.target.value)))}
                />
              </Field>
              <Field label="EKU">
                <input
                  className={inputClass}
                  value={p.eku}
                  onChange={(e) => patch(p.id, (x) => void (x.eku = e.target.value))}
                />
              </Field>
              <Field label="Subject / SAN policy">
                <input
                  className={inputClass}
                  value={p.san}
                  onChange={(e) => patch(p.id, (x) => void (x.san = e.target.value))}
                />
              </Field>
              <Field label="Enrollment">
                <select
                  className={inputClass}
                  value={p.enrollment}
                  onChange={(e) =>
                    patch(p.id, (x) => void (x.enrollment = e.target.value as StudentProfile["enrollment"]))
                  }
                >
                  {["ACME", "SCEP", "EST", "Manual", "API"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Approval">
                <select
                  className={inputClass}
                  value={p.approval}
                  onChange={(e) =>
                    patch(p.id, (x) => void (x.approval = e.target.value as StudentProfile["approval"]))
                  }
                >
                  {["standard", "dual", "governed"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Renewal">
                <select
                  className={inputClass}
                  value={p.renewal}
                  onChange={(e) =>
                    patch(p.id, (x) => void (x.renewal = e.target.value as StudentProfile["renewal"]))
                  }
                >
                  {["automated", "assisted", "manual"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status method">
                <select
                  className={inputClass}
                  value={p.statusMethod}
                  onChange={(e) =>
                    patch(p.id, (x) => void (x.statusMethod = e.target.value as StudentProfile["statusMethod"]))
                  }
                >
                  {["CRL", "OCSP", "OCSP stapling", "Scheduled CRL", "None"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Exception (optional)">
                <input
                  className={inputClass}
                  value={p.exception ?? ""}
                  onChange={(e) => patch(p.id, (x) => void (x.exception = e.target.value))}
                />
              </Field>
              <Field label="Rationale">
                <input
                  className={inputClass}
                  value={p.rationale}
                  onChange={(e) => patch(p.id, (x) => void (x.rationale = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={p.ownershipRequired}
                  onChange={(e) => patch(p.id, (x) => void (x.ownershipRequired = e.target.checked))}
                />
                Owner must be confirmed before issuance
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={p.exportable}
                  onChange={(e) => patch(p.id, (x) => void (x.exportable = e.target.checked))}
                />
                Private key exportable
              </label>
              <Btn
                variant="quiet"
                onClick={() =>
                  update((s) => {
                    s.operations.profiles = s.operations.profiles.filter((x) => x.id !== p.id);
                  })
                }
              >
                Remove profile
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );

  function patch(id: string, fn: (p: StudentProfile) => void) {
    update((s) => {
      const p = s.operations.profiles.find((x) => x.id === id);
      if (p) fn(p);
    });
  }
}
