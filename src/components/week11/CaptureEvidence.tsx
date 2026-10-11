import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { slotHints, type Nav } from "@/lib/week11/guidance";
import { emptyEvidenceRefs, evidenceRecipes, hasEvidenceRefs, type EvidenceKind } from "@/lib/week11/evidence-recipes";
import { groups as groupDefinitions, historicalAudit, historicalSignins, resources } from "@/lib/week11/seed";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { btnPrimary, Card, Select, TextArea } from "./ui";

const kindLabels: Record<EvidenceKind, string> = { accounts: "Account snapshot", groups: "Group snapshot", tests: "Access test", signins: "Sign-in", audits: "Audit", tickets: "Ticket snapshot", historical: "Historical record" };
const kinds: EvidenceKind[] = ["accounts", "tests", "signins", "audits", "groups", "tickets", "historical"];
const example = "Example format — not your case answer: In a fictional example, the sign-in record shows that the account authenticated successfully. The access test records the account’s access decision for the requested resource before any changes were made.";

export function CaptureEvidence({ store, mission, slots, initialSlot, compact, go }: { store: Week11Store; mission: string; slots: { slot: string; label: string }[]; initialSlot?: string | undefined; compact?: boolean; go?: (nav: Nav) => void }) {
  const [slot, setSlot] = useState(initialSlot && slots.some((x) => x.slot === initialSlot) ? initialSlot : slots[0]?.slot ?? "");
  const [refs, setRefs] = useState(emptyEvidenceRefs);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<{ slot: string; keys: string[] } | null>(null);
  const [notice, setNotice] = useState("");
  const id = useId();
  const view = store.view;
  const evidence = view?.evidence;
  const evidenceRef = useRef(evidence);
  evidenceRef.current = evidence;
  // Mission switches retain the component in the existing mission page.
  useEffect(() => {
    setSlot(initialSlot && slots.some((x) => x.slot === initialSlot) ? initialSlot : slots[0]?.slot ?? "");
    setRefs(emptyEvidenceRefs()); setCaption(""); setSubmitted(null); setNotice("");
  }, [mission, initialSlot]);
  useEffect(() => {
    if (!submitted || !evidence) return;
    const saved = evidence.find((item) => item.mission === mission && item.slot === submitted.slot && !submitted.keys.includes(item.evidence_key));
    if (!saved) return;
    setRefs(emptyEvidenceRefs()); setCaption(""); setSubmitted(null); setNotice("");
  }, [evidence, mission, submitted]);
  if (!view) return null;
  const s = view.state;
  const definition = slots.find((item) => item.slot === slot);
  if (!definition) return null;
  const recipe = evidenceRecipes[slot];
  const guidance = recipe?.records ?? [];
  const availableKinds = kinds.filter((kind) => kind !== "historical" || mission === "M06");
  const options: Record<EvidenceKind, { id: string; label: string }[]> = {
    accounts: s.accounts.map((a) => ({ id: a.key, label: `${a.key} · ${s.people.find((p) => p.key === a.person)?.name ?? a.username} · ${a.dir === "AD" ? "Active Directory" : "Cloud Identity"} · ${a.status}` })),
    groups: groupDefinitions.map((g) => ({ id: g.key, label: `${g.key} · ${g.name}` })),
    tests: s.tests.slice().reverse().map((t) => ({ id: t.id, label: `${t.id} · ${t.account} · ${resources.find((r) => r.key === t.resource)?.name ?? t.resource} / ${t.action} · ${t.decision.toUpperCase()} · ${t.mode}` })),
    signins: s.signins.slice().reverse().map((x) => ({ id: x.id, label: `${x.id} · ${x.account} · ${x.raw['outcome'] ?? ""} · ${x.raw['reason'] ?? ""}` })),
    audits: s.audits.filter((a) => a.activity !== "access_test").slice().reverse().map((a) => ({ id: a.id, label: `${a.id} · ${a.activity.replaceAll("_", " ")} · ${a.target} · ${a.result}${a.ticket ? ` · ${a.ticket}` : ""}` })),
    tickets: s.tickets.map((t) => ({ id: t.key, label: `${t.key} · ${t.status} · verification ${t.verification}` })),
    historical: [...historicalSignins.map((r) => ({ id: r.event_id, label: `${r.event_id} · Sign-in · ${r.user} · ${r.outcome} · ${r.reason}` })), ...historicalAudit.map((r) => ({ id: r.event_id, label: `${r.event_id} · Audit · ${r.activity.replaceAll("_", " ")} · ${r.target} · ${r.result}` }))],
  };
  const select = (kind: EvidenceKind, recordId: string) => setRefs((previous) => ({ ...previous, [kind]: previous[kind].includes(recordId) ? previous[kind].filter((key) => key !== recordId) : [...previous[kind], recordId] }));
  const emptyMessage = (kind: EvidenceKind) => {
    if (kind === "signins") return "No sign-in record yet. Complete the required sign-in test first. Go to Users → the account in the task → Sign-in tester.";
    if (kind === "tests") return "No access-test record yet. Run the required access test first. Go to Users → the account in the task → Test Access.";
    if (kind === "audits") return "No audit record yet. Complete the action in your task first, then review Audit Logs → Your simulated activity.";
    if (kind === "accounts") return "No account snapshot available yet. Go to Users and complete the account task first.";
    return "No records available here yet. Review the linked task before returning to capture.";
  };
  const navFor = (kind: EvidenceKind): Nav[] => {
    if (kind === "audits") return [{ view: "audit", label: "Audit Logs" }, ...(recipe?.nav.filter((n) => n.view === "tickets") ?? [])];
    if (["accounts", "signins", "tests"].includes(kind)) return recipe?.nav.filter((n) => n.view === "users").length ? recipe.nav.filter((n) => n.view === "users") : [{ view: "users", label: "Users" }];
    return recipe?.nav ?? [];
  };
  const navButtons = (navs: Nav[]) => go ? <div className="mt-2 flex flex-wrap gap-2">{navs.map((nav, index) => <Button key={`${nav.view}-${index}`} variant="outline" type="button" className="h-auto min-h-11 max-w-full whitespace-normal text-left text-xs" onClick={() => go(nav)}>Open {nav.label}{nav.account ? ` · ${nav.account}` : nav.ticket ? ` · ${nav.ticket}` : ""}</Button>)}</div> : null;
  const picker = (kind: EvidenceKind, heading: string) => <fieldset key={kind} className="min-w-0 border-t border-border pt-3">
    <legend className="max-w-full pr-2 text-sm font-semibold">{heading}</legend>
    <p className="mb-2 text-xs text-muted-foreground">{refs[kind].length} selected{["tests", "signins", "audits"].includes(kind) ? " · newest first" : ""}</p>
    {options[kind].length ? <div className="max-h-64 space-y-2 overflow-y-auto">{options[kind].map((item) => <label key={item.id} className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-2 rounded-md border p-3 text-xs ${refs[kind].includes(item.id) ? "border-primary bg-primary/10" : "border-border"}`}>
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" checked={refs[kind].includes(item.id)} onChange={() => select(kind, item.id)} />
      <span className="min-w-0 [overflow-wrap:anywhere]">{item.label}</span>
    </label>)}</div> : <div className="text-sm"><p className="max-w-prose">{emptyMessage(kind)}</p>{navButtons(navFor(kind))}</div>}
  </fieldset>;
  const captured = view.evidence.filter((e) => e.mission === mission && e.slot === slot);
  const selectedCount = Object.values(refs).reduce((count, list) => count + list.length, 0);
  const body = <div className="min-w-0 space-y-4 text-sm [overflow-wrap:anywhere]">
    <Select id={`${id}-slot`} label="Evidence slot" value={slot} onChange={(next) => { setSlot(next); setRefs(emptyEvidenceRefs()); setCaption(""); setNotice(""); }} options={slots.map((x) => ({ value: x.slot, label: `${x.slot} — ${x.label}` }))} />
    <section aria-label="What am I capturing?" className="max-w-prose space-y-2">
      <h3 className="text-xs font-semibold text-primary">WHAT AM I CAPTURING?</h3>
      <p className="font-medium">{slot} — {definition.label}</p>
      <p>{recipe?.summary ?? slotHints[slot]}</p>
      <details><summary className="min-h-11 cursor-pointer content-center text-xs">Where do I find these records?</summary><p className="text-xs text-muted-foreground">{slotHints[slot]} {guidance.some((r) => r.kind === "tests" || r.kind === "signins") ? "In Users, open the account, then use Jump to Sign-in tester or Jump to Test Access." : ""}</p>{navButtons(recipe?.nav ?? [])}</details>
    </section>
    <section aria-label="Selection checklist" className="border-l-4 border-primary bg-primary/5 p-3">
      <p className="font-semibold">Selection checklist</p>
      <ul className="mt-2 space-y-2">{guidance.map((item) => <li key={item.kind}>{refs[item.kind].length ? "✓" : "○"} {item.label} · {refs[item.kind].length ? `${refs[item.kind].length} selected` : "not selected yet"}</li>)}<li>{caption.trim() ? "✓ Explanation added" : "○ Explanation not added yet"}</li></ul>
      <p className="mt-2 text-xs text-muted-foreground">A checkmark means you selected that kind of record. Compare each record with the task; these marks are not readiness results.</p>
    </section>
    <section aria-label="Select evidence records" className="space-y-4">
      {guidance.map((item, index) => picker(item.kind, `Step ${index + 1} — ${item.label}`))}
      <details className="border-t border-border pt-2"><summary className="min-h-11 cursor-pointer content-center font-medium">Add optional supporting evidence</summary><div className="mt-3 space-y-4">{availableKinds.filter((kind) => !guidance.some((r) => r.kind === kind)).map((kind) => picker(kind, kindLabels[kind]))}</div></details>
    </section>
    <section className="border-t border-border pt-3">
      <h3 className="mb-2 font-semibold">Step {guidance.length + 1} — Explain it</h3>
      <TextArea label="Explain the evidence" help="In 1–2 sentences, explain what the selected records show. Describe only what you can see in the evidence." max={2000} rows={3} value={caption} onChange={setCaption} />
      {recipe?.starter ? <p className="mt-2 max-w-prose text-xs text-muted-foreground"><strong>Sentence starter:</strong> {recipe.starter}</p> : null}
      <details className="mt-2"><summary className="min-h-11 cursor-pointer content-center text-xs">See an example format</summary><p className="max-w-prose text-xs text-muted-foreground">{guidance.some((r) => r.kind === "tests" || r.kind === "signins") ? example : "Example format — not your case answer: In a fictional example, I selected records X and Y. Record X shows the account’s state at that moment. Record Y documents a later action. Together, they show what changed; they do not establish who was responsible."}</p></details>
    </section>
    <section aria-label="You are about to save" className="border-t border-border pt-3">
      <h3 className="font-semibold">Step {guidance.length + 2} — Review and save</h3>
      <p className="mt-2 font-medium">You are about to save · {selectedCount} record{selectedCount === 1 ? "" : "s"}</p>
      {selectedCount ? <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-xs">{availableKinds.flatMap((kind) => refs[kind].map((recordId) => <li key={`${kind}-${recordId}`}><strong>{kindLabels[kind]}:</strong> {options[kind].find((item) => item.id === recordId)?.label ?? recordId}</li>))}</ul> : <p className="mt-2 text-xs text-muted-foreground">Select a record above to include it here.</p>}
      <p className="mt-3">Explanation: {caption.trim() ? "✓ Added" : "Not added yet"}</p>
      <p className="mt-3 max-w-prose text-xs text-muted-foreground"><strong>What happens next?</strong> Capture saves a snapshot of these records. Later simulator changes will not rewrite this saved evidence.</p>
      <Button type="button" className={`${btnPrimary} mt-3 h-auto max-w-full whitespace-normal`} disabled={store.busy || saving || !hasEvidenceRefs(refs)} onClick={async () => {
        const keys = (evidenceRef.current ?? []).map((item) => item.evidence_key);
        setSaving(true); setNotice(""); setSubmitted({ slot, keys });
        try { await store.captureEvidence({ mission, slot, title: definition.label, refs, caption }); }
        catch { setSubmitted(null); setNotice("Could not save this evidence. Your selections and explanation are still here; try again."); }
        finally { setSaving(false); }
      }}>{saving ? `Capturing ${slot}…` : `Capture ${slot}`}</Button>
      {notice ? <p role="alert" className="mt-2 text-destructive">{notice}</p> : null}
    </section>
    {captured.length ? <section aria-label="Saved evidence" aria-live="polite" className="border-t border-border pt-3"><p className="font-semibold">✓ {slot} captured</p><ul className="mt-1 space-y-1 text-xs">{captured.map((e) => <li key={e.evidence_key}>Saved as evidence key {e.evidence_key}</li>)}</ul><p className="mt-2 text-xs">You can review or edit the explanation later in Evidence Tray.</p>{navButtons([{ view: "evidence", label: "Evidence Tray" }])}</section> : null}
  </div>;
  if (compact) return <div className="min-w-0 rounded-md border border-border p-3">{body}</div>;
  return <Card title="Capture evidence" eyebrow="Find it → Select it → Explain it → Save it">{body}</Card>;
}
