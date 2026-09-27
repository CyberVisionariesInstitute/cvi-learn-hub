import { useState } from "react";
import { missions, SIMULATION_BANNER, tickets, traceConcepts, type Directory } from "@/lib/week11/seed";
import { scenarioTime } from "@/lib/week11/engine";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { GroupsView, OUsView, ResourcesView, RolesView, TicketsView, UsersView } from "./DirectoryViews";
import { EvidenceView, LogsView, ReportView } from "./InvestigationViews";
import { Badge, btn, btnPrimary, Card, input, Select, TextArea } from "./ui";

export const VIEWS = ["dashboard", "missions", "users", "groups", "ous", "roles", "resources", "tickets", "signins", "audit", "evidence", "report"] as const;
export type View = (typeof VIEWS)[number];
const labels: Record<View, string> = { dashboard: "Dashboard", missions: "Mission Progress", users: "Users", groups: "Groups", ous: "Organizational Units", roles: "Roles & Access", resources: "Resources", tickets: "Help Desk / IAM Tickets", signins: "Sign-in Logs", audit: "Audit Logs", evidence: "Evidence Tray", report: "Case File (Lab 06)" };

export function Simulator({ store, view, onView, mission, onMission }: { store: Week11Store; view: View; onView: (v: View) => void; mission: string; onMission: (m: string) => void }) {
  const v = store.view!;
  const [dir, setDir] = useState<Directory>("AD");
  const [selected, setSelected] = useState<string | null>(null);
  const archived = v.status === "archived";
  const save = store.textSave;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p role="note" className="rounded-md border border-amber/60 bg-amber/10 px-3 py-2 text-sm text-foreground">{SIMULATION_BANNER}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">CyberFoundations · Module 4 · Week 11</p>
          <h1 className="font-display text-2xl">Cloud Heights Identity Center</h1>
          <p className="text-xs text-muted-foreground">You — Junior IAM/Security Analyst (sim-junior-analyst) · attempt {v.shortId} · revision {v.revision} · scenario time (fictional) {scenarioTime(v.state.seq)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
          {save.kind === "saving" ? <Badge>Saving…</Badge> : save.kind === "saved" ? <Badge tone="allow">Saved at {save.at}</Badge> : save.kind === "failed" ? <Badge tone="deny">Not saved: {save.message}</Badge> : save.kind === "conflict" ? <><Badge tone="warn">Changed in another tab</Badge><button type="button" className={btn} onClick={() => void store.reloadAfterConflict()}>Review & reapply my text</button></> : null}
          <button type="button" className={btn} onClick={() => void store.flush()}>Save</button>
        </div>
      </div>
      {archived ? <p className="mt-2 rounded-md border border-border p-2 text-sm">Archived attempt — read-only.</p> : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Simulator" className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-3 grid grid-cols-2 gap-1 lg:grid-cols-1" role="group" aria-label="Directory context">
            <button type="button" aria-pressed={dir === "AD"} className={`${btn} text-xs ${dir === "AD" ? "border-primary bg-primary/10" : ""}`} onClick={() => { setDir("AD"); setSelected(null); }}>On-Premises Directory — Active Directory (simulated AD DS)</button>
            <button type="button" aria-pressed={dir === "CLOUD"} className={`${btn} text-xs ${dir === "CLOUD" ? "border-primary bg-primary/10" : ""}`} onClick={() => { setDir("CLOUD"); setSelected(null); }}>Cloud Identity — Microsoft Entra ID (simulation)</button>
          </div>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {VIEWS.map((x) => <li key={x}><button type="button" aria-current={view === x ? "page" : undefined} onClick={() => onView(x)} className={`${btn} w-full text-left text-xs ${view === x ? "border-primary bg-primary/10" : ""}`}>{labels[x]}</button></li>)}
          </ul>
        </nav>
        <main className="min-w-0 space-y-4">
          {store.lastResult ? (
            <div role="status" className={`flex items-start justify-between gap-2 rounded-md border p-3 text-sm ${store.lastResult.ok ? "border-primary/50 bg-primary/10" : "border-destructive/50 bg-destructive/10"}`}>
              <span>{store.lastResult.message}</span>
              <button type="button" className="text-xs underline" onClick={() => store.setLastResult(null)}>Dismiss</button>
            </div>
          ) : null}
          {view === "dashboard" ? <Dashboard store={store} onView={onView} onMission={onMission} /> : null}
          {view === "missions" ? <MissionView store={store} mission={mission} onMission={onMission} onView={onView} /> : null}
          {view === "users" ? <UsersView store={store} dir={dir} selected={selected} onSelect={setSelected} /> : null}
          {view === "groups" ? <GroupsView store={store} /> : null}
          {view === "ous" ? <OUsView store={store} dir={dir} /> : null}
          {view === "roles" ? <RolesView store={store} /> : null}
          {view === "resources" ? <ResourcesView /> : null}
          {view === "tickets" ? <TicketsView store={store} /> : null}
          {view === "signins" ? <LogsView key="s" store={store} kind="signin" /> : null}
          {view === "audit" ? <LogsView key="a" store={store} kind="audit" /> : null}
          {view === "evidence" ? <EvidenceView store={store} /> : null}
          {view === "report" ? <ReportView store={store} /> : null}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ store, onView, onMission }: { store: Week11Store; onView: (v: View) => void; onMission: (m: string) => void }) {
  const v = store.view!;
  const s = v.state;
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [name, setName] = [store.learner.displayName ?? "", (x: string) => store.setLearner((l) => ({ ...l, displayName: x }))];
  return (
    <div className="space-y-4">
      <Card eyebrow="Cloud Heights Services (fictional)" title="Organization summary">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <p><strong className="block text-2xl">{s.people.length}</strong>people</p>
          <p><strong className="block text-2xl">{s.accounts.length}</strong>accounts</p>
          <p><strong className="block text-2xl">{s.tickets.filter((t) => t.status !== "resolved" && t.status !== "escalated").length}</strong>open tickets</p>
          <p><strong className="block text-2xl">{s.audits.length}</strong>of your actions logged</p>
        </div>
        <label className="mt-4 block max-w-md"><span className="text-sm font-medium">Your name for exported reports</span><input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></label>
        {!name.trim() ? <p className="mt-1 text-xs text-amber">Enter your name before exporting.</p> : null}
        <p className="mt-3 text-xs text-muted-foreground">Your real CVI sign-in is separate from every fictional account here. Saved in your CVI account on the server — available on any device you sign in from.</p>
      </Card>
      <Card title="Six missions" eyebrow="Times are estimates, not timers. Every mission stays open.">
        <ul className="grid gap-2 md:grid-cols-2">{missions.map((m) => { const r = v.readiness.find((x) => x.mission === m.key)!; return (
          <li key={m.key}><button type="button" className={`${btn} w-full text-left`} onClick={() => { onMission(m.key); onView("missions"); }}>
            <span className="font-mono text-xs">{m.lab} · {m.time}</span><span className="block font-medium">{m.title}</span>
            <span className="mt-1 block">{r.ready ? <Badge tone="allow">✓ Evidence-ready</Badge> : <Badge>{r.missing.length} item(s) remaining</Badge>}</span>
          </button></li>); })}</ul>
      </Card>
      <Card title="Recent actions">
        <ul className="space-y-1 text-sm">{s.audits.slice(-6).reverse().map((a) => <li key={a.id}><span className="font-mono text-xs">{a.id}</span> {a.activity} → {a.target} <Badge tone={a.result === "refused" ? "deny" : "neutral"}>{a.result}</Badge></li>)}{s.audits.length === 0 ? <li>No actions yet.</li> : null}</ul>
      </Card>
      <Card title="Start over (new attempt)">
        <p className="text-sm">Resetting archives this whole attempt (read-only, still exportable) and starts a fresh copy of the seed. Answers, evidence and reports in the archived attempt are kept. There is no partial mission reset because missions share one directory — prefer correcting mistakes through normal administration.</p>
        {v.archived.length ? <p className="mt-1 text-xs text-muted-foreground">{v.archived.length} archived attempt(s).</p> : null}
        {confirming ? (
          <div className="mt-3 space-y-2">
            <label className="block"><span className="text-sm">Reason (required)</span><input className={input} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
            <div className="flex gap-2"><button type="button" className={btnPrimary} disabled={reason.trim().length < 3} onClick={async () => { await store.reset(reason); setConfirming(false); setReason(""); }}>Archive and start a new attempt</button><button type="button" className={btn} onClick={() => setConfirming(false)}>Cancel — keep my attempt</button></div>
          </div>
        ) : <button type="button" className={`${btn} mt-3`} onClick={() => setConfirming(true)}>Reset attempt…</button>}
      </Card>
    </div>
  );
}

function MissionView({ store, mission, onMission, onView }: { store: Week11Store; mission: string; onMission: (m: string) => void; onView: (v: View) => void }) {
  const v = store.view!;
  const m = missions.find((x) => x.key === mission) ?? missions[0]!;
  const r = v.readiness.find((x) => x.mission === m.key)!;
  const ans = store.learner.missions?.[m.key]?.answers ?? {};
  const setAns = (id: string, val: string) => store.setLearner((l) => ({ ...l, missions: { ...(l.missions ?? {}), [m.key]: { ...(l.missions?.[m.key] ?? {}), answers: { ...ans, [id]: val } } } }));
  const trace = store.learner.missions?.["M01"]?.trace ?? {};
  const setTrace = (id: string, val: string) => store.setLearner((l) => ({ ...l, missions: { ...(l.missions ?? {}), M01: { ...(l.missions?.["M01"] ?? {}), trace: { ...trace, [id]: val } } } }));
  const traceObjects = [
    ...v.state.people.map((p) => `${p.key} ${p.name}`), ...v.state.accounts.map((a) => `${a.key} (${a.upn})`), ...v.state.accounts.map((a) => `${a.key}.department=${a.dept}`),
    "GA-RESP Response-Team", "GC-RESP Response-Operators", "GC-JUN Junior-Analysts", "GC-READ Case-Readers", "OU-RESP Response", "OU-SUP Support", "OU-DIS Disabled Accounts",
    "RL-RESP Response Agent @ R-QUEUE", "RL-READ Case Reader @ R-CASE", "RL-LAND Landing Reader @ R-LAND", "queue → read", "queue → update", "case → read", "ad_file R-ADRESP → read (ACL)",
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Missions">{missions.map((x) => <button key={x.key} type="button" aria-pressed={x.key === m.key} className={`${btn} text-xs ${x.key === m.key ? "border-primary bg-primary/10" : ""}`} onClick={() => onMission(x.key)}>{x.lab}</button>)}</div>
      <Card eyebrow={`${m.lab} · ${m.time} (estimate)`} title={m.title}>
        <p className="text-sm"><strong>Objective:</strong> {m.objective}</p>
        <p className="mt-1 text-sm"><strong>Situation:</strong> {m.situation}</p>
        {m.tickets.length ? <p className="mt-1 text-sm">Tickets: {m.tickets.map((t) => <button key={t} type="button" className="mr-2 underline" onClick={() => onView("tickets")}>{t} {tickets.find((x) => x.key === t)?.title}</button>)}</p> : null}
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">{m.steps.map((st) => <li key={st}>{st}</li>)}</ol>
        <p className="mt-3 text-xs text-muted-foreground">Any valid path through the console counts — you don't have to click screens in this exact order. Plain language → analogy → term: an account is like a badge; a group is a list on the door; a role is a job's bundle of keys; a permission is one specific key.</p>
      </Card>
      {m.key === "M01" ? (
        <Card title="Directory trace — seven concepts" eyebrow="Pick real objects, not definitions">
          <div className="grid gap-3 sm:grid-cols-2">{traceConcepts.map((c) => (
            <Select key={c.id} label={`${c.label} — ${c.hint}`} value={trace[c.id] ?? ""} onChange={(x) => setTrace(c.id, x)} options={[{ value: "", label: "choose an object" }, ...traceObjects.map((o) => ({ value: o, label: o }))]} />
          ))}</div>
        </Card>
      ) : null}
      <Card title="Your explanations" eyebrow="Saved automatically">
        <div className="space-y-3">{m.questions.map((qq) => <TextArea key={qq.id} label={qq.label} value={ans[qq.id] ?? ""} onChange={(x) => setAns(qq.id, x)} />)}</div>
        {m.key === "M06" ? <button type="button" className={`${btn} mt-3`} onClick={() => onView("report")}>Open the case file editor</button> : null}
      </Card>
      <CaptureEvidence store={store} mission={m.key} slots={m.evidence} />
      <Card title="Readiness" eyebrow="Presence of required work — not a grade">
        {r.ready ? <p className="text-sm"><Badge tone="allow">✓ Evidence-ready</Badge> Everything required is present. Your instructor reviews the reasoning.</p> : (
          <ul className="list-disc space-y-1 pl-5 text-sm">{r.missing.map((x) => <li key={x}>{x}</li>)}</ul>
        )}
      </Card>
    </div>
  );
}

function CaptureEvidence({ store, mission, slots }: { store: Week11Store; mission: string; slots: { slot: string; label: string }[] }) {
  const s = store.view!.state;
  const [slot, setSlot] = useState(slots[0]!.slot);
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
  return (
    <Card title="Capture evidence" eyebrow="Immutable snapshot of the current simulator state">
      <Select label="Evidence slot" value={slot} onChange={setSlot} options={slots.map((x) => ({ value: x.slot, label: `${x.slot} — ${x.label}` }))} />
      <div className="mt-3 space-y-3">
        <fieldset><legend className="text-sm font-medium">Accounts (snapshot of attributes, groups, effective access)</legend><div className="mt-1 flex flex-wrap gap-1.5">{s.accounts.map((a) => chip(accounts, setAccounts, a.key, a.key))}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Access tests</legend><div className="mt-1 flex max-h-40 flex-wrap gap-1.5 overflow-auto">{s.tests.slice().reverse().map((t) => chip(tests, setTests, t.id, `${t.id} ${t.account} ${t.resource}/${t.action} ${t.decision}`))}{s.tests.length === 0 ? <span className="text-xs text-muted-foreground">None yet.</span> : null}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Your sign-in events</legend><div className="mt-1 flex max-h-32 flex-wrap gap-1.5 overflow-auto">{s.signins.slice().reverse().map((x) => chip(signins, setSignins, x.id, `${x.id} ${x.account} ${x.raw['reason']}`))}{s.signins.length === 0 ? <span className="text-xs text-muted-foreground">None yet.</span> : null}</div></fieldset>
        <fieldset><legend className="text-sm font-medium">Your audit events</legend><div className="mt-1 flex max-h-40 flex-wrap gap-1.5 overflow-auto">{s.audits.filter((a) => a.activity !== "access_test").slice().reverse().map((a) => chip(audits, setAudits, a.id, `${a.id} ${a.activity} ${a.target} ${a.result}`))}</div></fieldset>
        {mission === "M06" ? <fieldset><legend className="text-sm font-medium">Historical records</legend><div className="mt-1 flex flex-wrap gap-1.5">{["S001","S002","S003","S004","S005","S006","S007","S008","S009","S010","S011","S012","A001","A002","A003","A004"].map((id) => chip(hist, setHist, id, id))}</div></fieldset> : null}
        <TextArea label="What does this prove?" max={2000} rows={2} value={caption} onChange={setCaption} />
      </div>
      <button type="button" className={`${btnPrimary} mt-3`} disabled={store.busy || accounts.length + tests.length + signins.length + audits.length + hist.length === 0} onClick={async () => {
        await store.captureEvidence({ mission, slot, title: slots.find((x) => x.slot === slot)!.label, refs: { accounts, groups: [], tests, signins, audits, tickets: [], historical: hist }, caption });
        setAccounts([]); setTests([]); setSignins([]); setAudits([]); setHist([]); setCaption("");
      }}>Capture {slot}</button>
      {captured.length ? <p className="mt-2 text-xs text-muted-foreground">Captured: {captured.map((e) => `${e.slot} (${e.evidence_key})`).join(", ")} — edit captions in the Evidence Tray.</p> : null}
    </Card>
  );
}
