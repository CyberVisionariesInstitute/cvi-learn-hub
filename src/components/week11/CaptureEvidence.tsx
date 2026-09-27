import { useState } from "react";
import { slotHints } from "@/lib/week11/guidance";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { btnPrimary, Card, Select, TextArea } from "./ui";

const HIST = ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S009", "S010", "S011", "S012", "A001", "A002", "A003", "A004"];

export function CaptureEvidence({ store, mission, slots, initialSlot, compact }: { store: Week11Store; mission: string; slots: { slot: string; label: string }[]; initialSlot?: string | undefined; compact?: boolean }) {
  const s = store.view!.state;
  const [slot, setSlot] = useState(initialSlot && slots.some((x) => x.slot === initialSlot) ? initialSlot : slots[0]!.slot);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);
  const [signins, setSignins] = useState<string[]>([]);
  const [audits, setAudits] = useState<string[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const pick = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const chip = (list: string[], set: (v: string[]) => void, id: string, label: string) => (
    <label key={id} className={`flex min-h-9 cursor-pointer items-center gap-1 rounded border px-2 text-xs ${list.includes(id) ? "border-primary bg-primary/15" : "border-border"}`}><input type="checkbox" checked={list.includes(id)} onChange={() => pick(list, set, id)} />{label}</label>
  );
  const captured = store.view!.evidence.filter((e) => e.mission === mission);
  const body = (
    <>
      <Select label="Evidence slot" value={slot} onChange={setSlot} options={slots.map((x) => ({ value: x.slot, label: `${x.slot} — ${x.label}` }))} />
      {slotHints[slot] ? <p className="mt-2 rounded-md border border-border bg-surface p-2 text-xs"><strong>Include:</strong> {slotHints[slot]}</p> : null}
      <div className="mt-3 space-y-3">
        <fieldset><legend className="text-sm font-medium">Accounts (snapshot of attributes, groups, effective access)</legend><div className="mt-1 flex flex-wrap gap-1.5">{s.accounts.map((a) => chip(accounts, setAccounts, a.key, a.key))}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Access tests (newest first)</legend><div className="mt-1 flex max-h-40 flex-wrap gap-1.5 overflow-auto">{s.tests.slice().reverse().map((t) => chip(tests, setTests, t.id, `${t.id} ${t.account} ${t.resource}/${t.action} ${t.decision}`))}{s.tests.length === 0 ? <span className="text-xs text-muted-foreground">None yet.</span> : null}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Your sign-in events</legend><div className="mt-1 flex max-h-32 flex-wrap gap-1.5 overflow-auto">{s.signins.slice().reverse().map((x) => chip(signins, setSignins, x.id, `${x.id} ${x.account} ${x.raw['reason']}`))}{s.signins.length === 0 ? <span className="text-xs text-muted-foreground">None yet.</span> : null}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Your audit events</legend><div className="mt-1 flex max-h-40 flex-wrap gap-1.5 overflow-auto">{s.audits.filter((a) => a.activity !== "access_test").slice().reverse().map((a) => chip(audits, setAudits, a.id, `${a.id} ${a.activity} ${a.target} ${a.result}`))}</div></fieldset>
        {mission === "M06" ? <fieldset><legend className="text-sm font-medium">Historical records</legend><div className="mt-1 flex flex-wrap gap-1.5">{HIST.map((id) => chip(hist, setHist, id, id))}</div></fieldset> : null}
        <TextArea label="What does this prove?" max={2000} rows={2} value={caption} onChange={setCaption} />
      </div>
      <button type="button" className={`${btnPrimary} mt-3`} disabled={store.busy || accounts.length + tests.length + signins.length + audits.length + hist.length === 0} onClick={async () => {
        await store.captureEvidence({ mission, slot, title: slots.find((x) => x.slot === slot)!.label, refs: { accounts, groups: [], tests, signins, audits, tickets: [], historical: hist }, caption });
        setAccounts([]); setTests([]); setSignins([]); setAudits([]); setHist([]); setCaption("");
      }}>Capture {slot}</button>
      {captured.length ? <p className="mt-2 text-xs text-muted-foreground">Captured: {captured.map((e) => `${e.slot} (${e.evidence_key})`).join(", ")} — edit captions in the Evidence Tray. Captures are snapshots; later changes never rewrite them.</p> : null}
    </>
  );
  if (compact) return <div className="rounded-md border border-border p-3">{body}</div>;
  return <Card title="Capture evidence" eyebrow="Immutable snapshot of the current simulator state">{body}</Card>;
}
