import { useState } from "react";
import { Panel, Btn, Field, inputClass, Badge, DataTable, Empty } from "./ui";
import { useDraft } from "@/lib/capstone/draft";
import { newId, type StatusPublication } from "@/lib/capstone/project-state";
import type { ScenarioPublic } from "@/lib/capstone/scenario-types";

export function AutomateWorkspace({ scenario }: { scenario: ScenarioPublic }) {
  const { draft, update } = useDraft();
  const [method, setMethod] = useState<StatusPublication["method"]>("CRL");
  const [publisherNodeId, setPublisherNodeId] = useState("");
  const [consumerZoneId, setConsumerZoneId] = useState(scenario.zones[0]?.id ?? "");
  const [freshnessHours, setFreshnessHours] = useState(24);

  const publishers = draft.architecture.nodes.filter(
    (n) => n.kind === "publisher" || n.kind === "ca-issuing" || n.kind === "service",
  );

  function addPublication() {
    if (!publisherNodeId || !consumerZoneId) return;
    update((s) => {
      s.operations.publications.push({
        id: newId("pub"),
        method,
        publisherNodeId,
        consumerZoneId,
        freshnessHours,
        reachable: true,
        note: "",
      });
    });
  }

  const automated = draft.operations.profiles.filter((p) => p.renewal === "automated");
  const renewalDue = draft.operations.assets.filter((a) => a.lifecycle === "Renewal Due");

  return (
    <div className="space-y-6">
      <Panel
        title="Status & revocation distribution"
        description="Decide how each zone learns that a certificate is no longer trustworthy, and how fresh that answer must be."
      >
        <div className="grid gap-3 sm:grid-cols-5">
          <Field label="Method">
            <select
              className={inputClass}
              value={method}
              onChange={(e) => setMethod(e.target.value as StatusPublication["method"])}
            >
              {["CRL", "Scheduled CRL", "OCSP", "OCSP stapling"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Published by">
            <select
              className={inputClass}
              value={publisherNodeId}
              onChange={(e) => setPublisherNodeId(e.target.value)}
            >
              <option value="">—</option>
              {publishers.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Consumed by zone">
            <select
              className={inputClass}
              value={consumerZoneId}
              onChange={(e) => setConsumerZoneId(e.target.value)}
            >
              {scenario.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max staleness (hours)">
            <input
              type="number"
              className={inputClass}
              value={freshnessHours}
              onChange={(e) => setFreshnessHours(Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end">
            <Btn variant="primary" onClick={addPublication}>
              Add path
            </Btn>
          </div>
        </div>

        <div className="mt-4">
          {draft.operations.publications.length === 0 ? (
            <Empty>No status distribution paths defined. Relying zones cannot check revocation.</Empty>
          ) : (
            <DataTable head={["Method", "Publisher", "Consumer zone", "Freshness", "Reachable", ""]}>
              {draft.operations.publications.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-foreground">{p.method}</td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {draft.architecture.nodes.find((n) => n.id === p.publisherNodeId)?.name ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {scenario.zones.find((z) => z.id === p.consumerZoneId)?.name ?? p.consumerZoneId}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{p.freshnessHours}h</td>
                  <td className="py-2 pr-3">
                    <Badge tone={p.reachable ? "good" : "bad"}>{p.reachable ? "Yes" : "No"}</Badge>
                  </td>
                  <td className="py-2">
                    <Btn
                      variant="quiet"
                      onClick={() =>
                        update((s) => {
                          s.operations.publications = s.operations.publications.filter(
                            (x) => x.id !== p.id,
                          );
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
        </div>
      </Panel>

      <Panel
        title="Renewal automation"
        description="Automation only covers certificates whose profile is set to automated renewal and whose owner is confirmed."
      >
        <p className="text-sm text-muted-foreground">
          {automated.length} profile(s) set to automated renewal · {renewalDue.length} certificate(s)
          currently due.
        </p>
        <div className="mt-3">
          <Btn
            variant="primary"
            disabled={renewalDue.length === 0}
            onClick={() =>
              update((s) => {
                for (const a of s.operations.assets) {
                  if (a.lifecycle !== "Renewal Due") continue;
                  const profile = s.operations.profiles.find((p) => p.id === a.profileId);
                  const eligible =
                    profile?.renewal === "automated" &&
                    (!profile.ownershipRequired ||
                      a.ownerState === "Known" ||
                      a.ownerState === "Confirmed");
                  if (!eligible) continue;
                  a.lifecycle = "Renewal Pending";
                  s.operations.lifecycle.push({
                    id: newId("lc"),
                    assetId: a.id,
                    at: new Date().toISOString(),
                    action: "automated renewal queued",
                    from: "Renewal Due",
                    to: "Renewal Pending",
                    actor: "automation",
                    detail: `Queued by automation using profile ${profile?.name ?? "?"}.`,
                  });
                }
              })
            }
          >
            Run renewal automation
          </Btn>
        </div>
        <ul className="mt-4 space-y-2">
          {renewalDue.map((a) => {
            const profile = draft.operations.profiles.find((p) => p.id === a.profileId);
            const eligible =
              profile?.renewal === "automated" &&
              (!profile.ownershipRequired || a.ownerState === "Known" || a.ownerState === "Confirmed");
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-foreground">{a.label}</span>
                <Badge tone={eligible ? "good" : "warn"}>
                  {eligible
                    ? "Covered by automation"
                    : profile
                      ? "Blocked — manual profile or unconfirmed owner"
                      : "Blocked — no profile assigned"}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
