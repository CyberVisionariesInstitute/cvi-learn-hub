import { useMemo, useRef, useState } from "react";
import { AUDIT_FIELDS, historicalAudit, historicalAuditTsv, historicalContext, historicalSignins, historicalSigninsTsv, missions, reportSections, SIGNIN_FIELDS } from "@/lib/week11/seed";
import type { Finding } from "@/lib/week11/types";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge, btn, btnPrimary, Card, input, TableWrap, TextArea } from "./ui";
import { DownloadsView } from "./DownloadsView";

type Row = Record<string, string> & { __source: string };

export function LogsView({ store, kind }: { store: Week11Store; kind: "signin" | "audit" }) {
  const s = store.view!.state;
  const [source, setSource] = useState<"HISTORICAL" | "LIVE" | "ALL">("HISTORICAL");
  const [q, setQ] = useState("");
  const [corr, setCorr] = useState("");
  const [result, setResult] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const opener = useRef<HTMLElement | null>(null);
  const fields = kind === "signin" ? SIGNIN_FIELDS : AUDIT_FIELDS;
  const rows: Row[] = useMemo(() => {
    const hist = (kind === "signin" ? historicalSignins : historicalAudit).map((r) => ({ ...r, __source: "HISTORICAL" }) as Row);
    const live = kind === "signin"
      ? s.signins.map((x) => ({ ...x.raw, __source: "LIVE" }) as Row)
      : s.audits.map((e) => ({ event_id: e.id, time_utc: e.time, actor: e.actorKind === "learner" ? "sim-junior-analyst" : "instructor", activity: e.activity, target: e.target, before_value: JSON.stringify(e.before ?? "none"), after_value: JSON.stringify(e.after ?? "none"), result: e.result, approval_ticket: e.ticket ?? "none_recorded", correlation_id: e.correlation, __source: "LIVE" }) as Row);
    const all = source === "HISTORICAL" ? hist : source === "LIVE" ? live : [...hist, ...live];
    const res = kind === "signin" ? "outcome" : "result";
    return all.filter((r) => (!q || Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())) && (!corr || r['correlation_id'] === corr) && (!result || r[res] === result))
      .sort((a, b) => (a['time_utc']! < b['time_utc']! ? -1 : a['time_utc']! > b['time_utc']! ? 1 : a['event_id']! < b['event_id']! ? -1 : 1));
  }, [s, source, q, corr, result, kind]);
  const PAGE = 25;
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const related = open ? [...historicalSignins, ...historicalAudit].filter((r) => open.__source === "HISTORICAL" && r.correlation_id === open['correlation_id'] && r.correlation_id !== "not_available") : [];
  return (
    <div className="space-y-4">
      <Card eyebrow={kind === "signin" ? "Sign-in Logs" : "Audit Logs"} title={source === "HISTORICAL" ? "Historical scenario records (fabricated September 21 snapshot)" : source === "LIVE" ? "Your simulated activity (this attempt)" : "Combined — see the Source column"}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Source">
          {(["HISTORICAL", "LIVE", "ALL"] as const).map((x) => <button key={x} type="button" aria-pressed={source === x} className={`${btn} ${source === x ? "border-primary bg-primary/10" : ""}`} onClick={() => { setSource(x); setPage(0); }}>{x === "HISTORICAL" ? "Historical" : x === "LIVE" ? "Your simulated activity" : "Combined"}</button>)}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label><span className="mb-1 block text-xs text-muted-foreground">Search (literal, any field)</span><input className={input} value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></label>
          <label><span className="mb-1 block text-xs text-muted-foreground">Correlation ID</span><input className={input} value={corr} onChange={(e) => { setCorr(e.target.value.trim()); setPage(0); }} /></label>
          <label><span className="mb-1 block text-xs text-muted-foreground">{kind === "signin" ? "Outcome" : "Result"}</span><select className={input} value={result} onChange={(e) => { setResult(e.target.value); setPage(0); }}><option value="">any</option>{(kind === "signin" ? ["success", "failure"] : ["success", "refused", "accepted"]).map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm"><span aria-live="polite">{rows.length} record(s)</span><button type="button" className={btn} onClick={() => { setQ(""); setCorr(""); setResult(""); setPage(0); }}>Clear filters</button>
          <span className="text-xs text-muted-foreground">Times are UTC. Historical dates are fictional scenario time.</span></div>
        {rows.length === 0 ? <p className="mt-3 text-sm">No records match these filters. That does not mean nothing happened — clear the filters to see everything.</p> : (
          <div className="mt-3"><TableWrap label={`${kind} log table`}>
            <thead><tr className="border-b border-border">{source === "ALL" ? <th className="p-2">Source</th> : null}{fields.map((f) => <th key={f} className="p-2 font-mono text-xs">{f}</th>)}</tr></thead>
            <tbody>{shown.map((r) => <tr key={r['event_id']} className="border-b border-border/50">{source === "ALL" ? <td className="p-2"><Badge>{r.__source}</Badge></td> : null}{fields.map((f) => <td key={f} className="max-w-[16rem] break-words p-2 font-mono text-xs">{f === "event_id" ? <button type="button" className="underline" onClick={(e) => { opener.current = e.currentTarget; setOpen(r); }}>{r[f]}</button> : r[f]}</td>)}</tr>)}</tbody>
          </TableWrap></div>
        )}
        {rows.length > PAGE ? <div className="mt-2 flex gap-2"><button type="button" className={btn} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button type="button" className={btn} disabled={(page + 1) * PAGE >= rows.length} onClick={() => setPage(page + 1)}>Next</button></div> : null}
        {source !== "LIVE" ? <button type="button" className={`${btn} mt-3`} onClick={() => { const blob = new Blob([kind === "signin" ? historicalSigninsTsv : historicalAuditTsv], { type: "text/tab-separated-values" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = kind === "signin" ? "historical-signins.tsv" : "historical-audit.tsv"; a.click(); }}>Download exact historical dataset (TSV)</button> : null}
      </Card>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label={`Raw record ${open['event_id']}`} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onKeyDown={(e) => { if (e.key === "Escape") { setOpen(null); opener.current?.focus(); } }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-surface-raised p-5">
            <h3 className="font-display text-lg">View Raw Log — {open['event_id']} <Badge>{open.__source}</Badge></h3>
            <pre className="mt-3 whitespace-pre-wrap break-all rounded-md bg-terminal p-3 font-mono text-xs text-terminal-foreground">{JSON.stringify(Object.fromEntries(fields.map((f) => [f, open[f]])), null, 2)}</pre>
            {related.length > 1 ? <p className="mt-3 text-sm">Records sharing correlation {open['correlation_id']}: {related.map((r) => r.event_id).join(", ")}. A shared ID links records; it does not by itself explain cause.</p> : null}
            <div className="mt-3 flex gap-2">
              <button type="button" className={btn} onClick={() => navigator.clipboard?.writeText(JSON.stringify(Object.fromEntries(fields.map((f) => [f, open[f]])), null, 2))}>Copy JSON</button>
              {open.__source === "HISTORICAL" && open['correlation_id'] !== "not_available" ? <button type="button" className={btn} onClick={() => { setCorr(open['correlation_id']!); setSource("ALL"); setOpen(null); }}>Find related records by correlation ID (this log)</button> : null}
              <button type="button" autoFocus className={btnPrimary} onClick={() => { setOpen(null); opener.current?.focus(); }}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
      {source !== "LIVE" ? <Card title="Investigative context"><ul className="list-disc space-y-1 pl-5 text-sm">{historicalContext.map((c) => <li key={c}>{c}</li>)}</ul></Card> : null}
    </div>
  );
}

export function EvidenceView({ store }: { store: Week11Store }) {
  const v = store.view!;
  const { learner, setLearner } = store;
  return (
    <div className="space-y-3">
      <Card title="Evidence Tray" eyebrow="Immutable captures; your captions are stored separately">
        {v.evidence.length === 0 ? <p className="text-sm">No evidence yet. Capture evidence from each mission page.</p> : null}
        <ul className="space-y-3">{v.evidence.map((e) => (
          <li key={e.evidence_key} className="rounded-md border border-border p-3">
            <p className="flex flex-wrap items-center gap-2 text-sm"><Badge tone="info">{e.slot}</Badge><span className="font-mono text-xs">{e.evidence_key}</span><strong>{e.title}</strong></p>
            <p className="mt-1 text-xs text-muted-foreground">{e.mission} · captured at revision {e.captured_revision}; current state is revision {v.revision}{e.captured_revision !== v.revision ? " — later changes never rewrite this capture; retest if you need current proof" : ""} · SHA-256 {e.content_hash.slice(0, 16)}…</p>
            <details className="mt-1"><summary className="cursor-pointer text-sm">Snapshot</summary><pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded bg-terminal p-2 font-mono text-[0.7rem] text-terminal-foreground">{JSON.stringify(e.snapshot, null, 2)}</pre></details>
            <div className="mt-2"><TextArea label="What does this prove?" max={2000} rows={2} value={learner.captions?.[e.evidence_key] ?? ""} onChange={(x) => setLearner((l) => ({ ...l, captions: { ...(l.captions ?? {}), [e.evidence_key]: x } }))} /></div>
          </li>
        ))}</ul>
      </Card>
    </div>
  );
}

const blankFinding = (n: number): Finding => ({ key: `F${n}`, title: "", refs: [], observation: "", hypothesis: "", conclusion: "", uncertainty: "", nextAction: "", priority: "", rationale: "" });
const eventIds = [...historicalSignins.map((r) => r.event_id), ...historicalAudit.map((r) => r.event_id)];

function RefPicker({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const [f, setF] = useState("");
  return (
    <fieldset><legend className="text-sm font-medium">{label}</legend>
      <input aria-label={`Filter event IDs for ${label}`} className={`${input} mt-1 max-w-xs`} placeholder="Filter IDs, e.g. S00 or A" value={f} onChange={(e) => setF(e.target.value.trim().toUpperCase())} />
      <div className="mt-1 flex flex-wrap gap-1.5">{eventIds.filter((id) => !f || id.includes(f) || value.includes(id)).map((id) => (
        <label key={id} className={`flex min-h-9 cursor-pointer items-center gap-1 rounded border px-2 font-mono text-xs ${value.includes(id) ? "border-primary bg-primary/15" : "border-border"}`}>
          <input type="checkbox" checked={value.includes(id)} onChange={(e) => onChange(e.target.checked ? [...value, id] : value.filter((x) => x !== id))} />{id}
        </label>))}</div>
    </fieldset>
  );
}

export function ReportView({ store }: { store: Week11Store }) {
  const v = store.view!;
  const { learner, setLearner } = store;
  const findings = learner.findings?.length ? learner.findings : [blankFinding(1), blankFinding(2)];
  const setF = (i: number, patch: Partial<Finding>) => setLearner((l) => { const list = [...(l.findings?.length ? l.findings : [blankFinding(1), blankFinding(2)])]; list[i] = { ...list[i]!, ...patch }; return { ...l, findings: list }; });
  const rep = learner.report ?? {};
  const setRep = (patch: Partial<NonNullable<typeof learner.report>>) => setLearner((l) => ({ ...l, report: { ...(l.report ?? {}), ...patch } }));
  return (
    <div className="space-y-4">
      <Card eyebrow="Lab 06 · Portfolio Deliverable 4" title="Cloud Heights IAM Investigation Case File">
        <p className="text-sm">A technical case file, inside Lab 06 — the sixth and final Week 11 submission. It may reference earlier lab files instead of repeating them. Nothing here is graded automatically; readiness only checks that required pieces are present.</p>
        <p className="mt-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm"><strong>Week 12 handoff:</strong> Week 12 uses this case file as source material to create the professional Technical Incident Report and Executive Summary, and to finalize and present your portfolio. You do not write those here.</p>
      </Card>
      {findings.map((f, i) => (
        <Card key={f.key} title={`Finding ${i + 1}`}>
          <label className="block"><span className="text-sm font-medium">Title</span><input className={input} value={f.title} maxLength={200} onChange={(e) => setF(i, { title: e.target.value })} /></label>
          <div className="mt-3"><RefPicker label="Exact historical events this finding rests on" value={f.refs} onChange={(refs) => setF(i, { refs })} /></div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <TextArea label="Observation (what the records show)" value={f.observation} onChange={(x) => setF(i, { observation: x })} />
            <TextArea label="Hypothesis (possible explanation)" value={f.hypothesis} onChange={(x) => setF(i, { hypothesis: x })} />
            <TextArea label="Supported conclusion" value={f.conclusion} onChange={(x) => setF(i, { conclusion: x })} />
            <TextArea label="Uncertainty / missing information" value={f.uncertainty} onChange={(x) => setF(i, { uncertainty: x })} />
            <TextArea label="Next action" value={f.nextAction} onChange={(x) => setF(i, { nextAction: x })} />
            <div>
              <label className="block"><span className="text-sm font-medium">Priority</span>
                <select className={input} value={f.priority} onChange={(e) => setF(i, { priority: e.target.value as Finding["priority"] })}><option value="">choose</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option></select></label>
              <div className="mt-2"><TextArea label="Why this priority?" value={f.rationale} onChange={(x) => setF(i, { rationale: x })} /></div>
            </div>
          </div>
        </Card>
      ))}
      {findings.length < 6 ? <button type="button" className={btn} onClick={() => setLearner((l) => ({ ...l, findings: [...findings, blankFinding(findings.length + 1)] }))}>Add another finding</button> : null}
      <Card title="Benign or ambiguous comparison">
        <RefPicker label="Source records" value={learner.comparison?.refs ?? []} onChange={(refs) => setLearner((l) => ({ ...l, comparison: { text: l.comparison?.text ?? "", refs } }))} />
        <div className="mt-3"><TextArea label="Why these records should not be over-claimed" value={learner.comparison?.text ?? ""} onChange={(text) => setLearner((l) => ({ ...l, comparison: { refs: l.comparison?.refs ?? [], text } }))} /></div>
      </Card>
      <Card title="Live simulator accountability chain">
        <TextArea label="Describe one audit/access chain from your own earlier missions (IDs such as LA-…, AT-…). This is your simulated activity, not historical data." value={rep.liveChain ?? ""} onChange={(x) => setRep({ liveChain: x })} />
        <p className="mt-2 text-xs text-muted-foreground">Insert one of your live IDs (newest first):</p>
        <div className="mt-1 flex max-h-32 flex-wrap gap-1.5 overflow-auto">{[...v.state.audits].reverse().slice(0, 30).map((e) => <button key={e.id} type="button" className={`${btn} min-h-9 py-1 font-mono text-xs`} onClick={() => setRep({ liveChain: `${rep.liveChain ?? ""}${rep.liveChain ? " " : ""}${e.id}` })}>{e.id} {e.activity}</button>)}{v.state.audits.length === 0 ? <span className="text-xs text-muted-foreground">No live activity yet — complete earlier missions first.</span> : null}</div>
      </Card>
      <Card title="Case file sections" eyebrow="Technical content only — the polished report and summary come in Week 12">
        <div className="space-y-3">{reportSections.map((t, i) => <TextArea key={t} label={`${i + 1}. ${t}`} value={rep.sections?.[String(i + 1)] ?? ""} onChange={(x) => setRep({ sections: { ...(rep.sections ?? {}), [String(i + 1)]: x } })} />)}</div>
        <div className="mt-3 space-y-3">
          <TextArea label="Explicit simulation/environment limitations" value={rep.limitations ?? ""} onChange={(x) => setRep({ limitations: x })} />
        </div>
      </Card>
      <DownloadsView store={store} afterZip="Next: capture E19 from the Current Mission panel or Mission Progress." />
    </div>
  );
}
