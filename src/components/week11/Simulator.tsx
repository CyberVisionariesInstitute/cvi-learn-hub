import { useState } from "react";
import { navForMissing, stepGuides, type Nav } from "@/lib/week11/guidance";
import { CaptureEvidence } from "./CaptureEvidence";
import { missions, SIMULATION_BANNER, tickets, traceConcepts, type Directory, type MissionId } from "@/lib/week11/seed";
import { scenarioTime } from "@/lib/week11/engine";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { GroupsView, OUsView, ResourcesView, RolesView, TicketsView, UsersView } from "./DirectoryViews";
import { EvidenceView, LogsView, ReportView } from "./InvestigationViews";
import { Badge, btn, btnPrimary, Card, input, Select, TextArea } from "./ui";
export type { Nav };
import { ConceptGuides, MissionArt, Week11Hero } from "./Visuals";
import { CurrentMissionPanel } from "./CurrentMissionPanel";
import { DownloadsView } from "./DownloadsView";

export const VIEWS = ["dashboard", "missions", "users", "groups", "ous", "roles", "resources", "tickets", "signins", "audit", "evidence", "report", "downloads"] as const;
export type View = (typeof VIEWS)[number];
const labels: Record<View, string> = { dashboard: "Dashboard", missions: "Mission Progress", users: "Users", groups: "Groups", ous: "Organizational Units", roles: "Roles & Access", resources: "Resources", tickets: "Help Desk / IAM Tickets", signins: "Sign-in Logs", audit: "Audit Logs", evidence: "Evidence Tray", report: "Case File (Lab 06)", downloads: "Download & GitHub" };

export function Simulator({ store, view, onView, mission, onMission }: { store: Week11Store; view: View; onView: (v: View) => void; mission: string; onMission: (m: string) => void }) {
  const v = store.view!;
  const [dir, setDir] = useState<Directory>("AD");
  const [selected, setSelected] = useState<string | null>(null);
  const [missionPanelOpen, setMissionPanelOpen] = useState(true);
  const [ticketFocus, setTicketFocus] = useState<string | undefined>(undefined);
  const [stepIdx, setStepIdx] = useState<Record<string, number>>({});
  const go = (n: Nav) => {
    const acct = n.account ? v.state.accounts.find((a) => a.key === n.account) : undefined;
    if (acct) { setDir(acct.dir); setSelected(acct.key); } else if (n.dir) { setDir(n.dir); if (n.view === "users") setSelected(null); }
    if (n.ticket) setTicketFocus(n.ticket);
    onView(n.view as View);
  };
  const switchDir = (d: Directory) => {
    if (d === dir) return;
    const cur = v.state.accounts.find((a) => a.key === selected);
    const twin = cur ? v.state.accounts.find((a) => a.person === cur.person && a.dir === d) : undefined;
    setDir(d); setSelected(twin?.key ?? null);
  };
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
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <CurrentMissionPanel
          store={store}
          mission={mission}
          open={missionPanelOpen}
          onOpenChange={setMissionPanelOpen}
          onView={onView}
          go={go}
          step={stepIdx[mission] ?? 0}
          onStep={(n) => setStepIdx((m) => ({ ...m, [mission]: n }))}
        />
        <nav aria-label="Simulator" className="min-w-0 lg:sticky lg:top-4 lg:row-span-2 lg:row-start-1 lg:self-start">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Directory you're viewing (Users, Groups, OUs):</p>
          <div className="mb-3 grid grid-cols-2 gap-1 lg:grid-cols-1" role="group" aria-label="Directory context">
            <button type="button" aria-pressed={dir === "AD"} className={`${btn} text-xs ${dir === "AD" ? "border-primary bg-primary/10" : ""}`} onClick={() => switchDir("AD")}>On-Premises Directory — Active Directory (simulated AD DS)</button>
            <button type="button" aria-pressed={dir === "CLOUD"} className={`${btn} text-xs ${dir === "CLOUD" ? "border-primary bg-primary/10" : ""}`} onClick={() => switchDir("CLOUD")}>Cloud Identity — Microsoft Entra ID (simulation)</button>
          </div>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {VIEWS.map((x) => <li key={x}><button type="button" aria-current={view === x ? "page" : undefined} onClick={() => onView(x)} className={`${btn} w-full text-left text-xs ${view === x ? "border-primary bg-primary/10" : ""}`}>{labels[x]}</button></li>)}
          </ul>
        </nav>
        <main className="min-w-0 space-y-4 lg:col-start-2">
          {store.lastResult ? (
            <div role="status" className={`flex items-start justify-between gap-2 rounded-md border p-3 text-sm ${store.lastResult.ok ? "border-primary/50 bg-primary/10" : "border-destructive/50 bg-destructive/10"}`}>
              <span>{store.lastResult.message}</span>
              <button type="button" className="text-xs underline" onClick={() => store.setLastResult(null)}>Dismiss</button>
            </div>
          ) : null}
          {view === "dashboard" ? <Dashboard store={store} onView={onView} onMission={onMission} /> : null}
          {view === "missions" ? <MissionView store={store} mission={mission} onMission={onMission} onView={onView} go={go} /> : null}
          {view === "users" ? <UsersView store={store} dir={dir} selected={selected} onSelect={setSelected} mission={mission} go={go} /> : null}
          {view === "groups" ? <GroupsView store={store} dir={dir} /> : null}
          {view === "ous" ? <OUsView store={store} dir={dir} /> : null}
          {view === "roles" ? <RolesView store={store} /> : null}
          {view === "resources" ? <ResourcesView /> : null}
          {view === "tickets" ? <TicketsView key={ticketFocus ?? "t"} store={store} initial={ticketFocus} /> : null}
          {view === "signins" ? <LogsView key="s" store={store} kind="signin" /> : null}
          {view === "audit" ? <LogsView key="a" store={store} kind="audit" /> : null}
          {view === "evidence" ? <EvidenceView store={store} /> : null}
          {view === "report" ? <ReportView store={store} /> : null}
          {view === "downloads" ? <DownloadsView store={store} /> : null}
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
      <Week11Hero />
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
      <Card title="Your portfolio files" eyebrow="Download your Week 11 work for GitHub">
        <p className="text-sm">{v.readiness.filter((r) => r.ready).length} of {missions.length} labs evidence-ready. Unfinished labs download marked DRAFT.</p>
        <button type="button" className={`${btnPrimary} mt-3`} onClick={() => onView("downloads")}>Download & GitHub</button>
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

function MissionView({ store, mission, onMission, onView, go }: { store: Week11Store; mission: string; onMission: (m: string) => void; onView: (v: View) => void; go: (n: Nav) => void }) {
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
      <MissionArt mission={m.key} />
      <Card eyebrow={`${m.lab} · ${m.time} (estimate)`} title={m.title}>
        <p className="text-sm"><strong>Objective:</strong> {m.objective}</p>
        <p className="mt-1 text-sm"><strong>Situation:</strong> {m.situation}</p>
        {m.tickets.length ? <p className="mt-1 text-sm">Tickets: {m.tickets.map((t) => <button key={t} type="button" className="mr-2 underline" onClick={() => go({ label: t, view: "tickets", ticket: t })}>{t} {tickets.find((x) => x.key === t)?.title}</button>)}</p> : null}
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">{m.steps.map((st, i) => { const g = stepGuides[m.key]?.[i]; return (
          <li key={st}><span>{st}</span> {g ? <Badge tone={g.mode === "explore" ? "info" : "warn"}>{g.mode === "explore" ? "Explore — nothing assessed yet" : "Assessed: your final state/records count"}</Badge> : null}
            {g ? <><p className="mt-1 text-xs text-muted-foreground"><strong className="text-foreground">Where:</strong> {g.where}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">{g.links.map((n) => <button key={n.label + n.view} type="button" className={`${btn} min-h-9 py-1 text-xs`} onClick={() => go(n)}>Open {n.label}</button>)}</div></> : null}
          </li>); })}</ol>
        <p className="mt-3 text-xs text-muted-foreground">Any valid path through the console counts — you don't have to click screens in this exact order. Plain language → analogy → term: an account is like a badge; a group is a list on the door; a role is a job's bundle of keys; a permission is one specific key.</p>
      </Card>
      <ConceptGuides mission={m.key} />
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
          <ul className="list-disc space-y-1 pl-5 text-sm">{r.missing.map((x) => { const n = navForMissing(m.key, x); return <li key={x}>{x} {n && n.view !== "missions" ? <button type="button" className="text-xs underline" onClick={() => go(n)}>Go there: {n.label}</button> : null}</li>; })}</ul>
        )}
        <DownloadLabButton store={store} mission={m.key} lab={m.lab} onView={onView} />
        <p className="mt-3 text-xs text-muted-foreground">Made a mistake? Correct it with the opposite action (Remove from group, Move OU, Enable/Disable, remove an assignment), then retest and recapture. Earlier captures stay as history. A full reset is rarely needed.</p>
      </Card>
    </div>
  );
}

function DownloadLabButton({ store, mission, lab, onView }: { store: Week11Store; mission: MissionId; lab: string; onView: (v: View) => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className={btn} disabled={busy} onClick={async () => { setBusy(true); try { const r = await store.exportLab(mission); setMsg(`Downloaded ${r.filename}${r.draft ? " (DRAFT)" : ""}.`); } catch (e) { setMsg(`Download failed: ${(e as Error).message}`); } finally { setBusy(false); } }}>{busy ? "Preparing…" : `Download ${lab} (Markdown)`}</button>
      <button type="button" className="text-xs underline" onClick={() => onView("downloads")}>All downloads & GitHub steps</button>
      <span className="text-xs" role="status" aria-live="polite">{msg}</span>
    </div>
  );
}
