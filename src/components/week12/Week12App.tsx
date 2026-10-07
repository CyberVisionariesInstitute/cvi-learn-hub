import { useEffect, useId, useMemo, useState } from "react";
import { Badge, btn, btnPrimary, Card, input, Select, TextArea } from "@/components/week11/ui";
import {
  CLASS_LABELS, classItems, coachFlags, computeQA, execMissing, parseDuration, parseRefs, recommendationIssues, validRefs, validateVideoUrl,
  week12Paths, week12ZipName, writtenWords, WEEK11_CASE_FILE_PATH, type ClassLabel, type CoachFlag, type W12Content, type Week12File,
} from "@/lib/week12/model";
import type { Week12Store } from "@/lib/week12/useWeek12";
import { Week12Visual } from "./Week12Visual";

export const STAGES = [
  { n: 1, title: "Review your case file", doing: "Read your own Week 11 Lab 06 case file and sort each statement: is it a fact, evidence, a finding, an interpretation, an unknown, or a recommendation?", proves: "Every source statement has a label. There are no right-answer marks — this is to sharpen your thinking." },
  { n: 2, title: "Strengthen your findings", doing: "Rewrite your findings in report-ready, defensible language and keep each one linked to Week 11 evidence or event IDs.", proves: "At least two findings with a clear statement and a valid evidence/event reference; any high-certainty words reviewed." },
  { n: 3, title: "Technical incident report", doing: "Build the technical report section by section for a technical reader.", proves: "Every report section is filled in, including limitations and your name." },
  { n: 4, title: "Executive communication", doing: "Choose ONE: a written Executive Summary (about 250–400 words) or a video Executive Briefing (about 2–3 minutes, link only). Both are equal.", proves: "Your chosen option is complete. Drafts of the other option are kept but not counted." },
  { n: 5, title: "Recommendations & next actions", doing: "Turn vague advice into specific actions with an owner, priority, timeframe, linked finding and success measure. These appear inside your technical report.", proves: "At least one recommendation passes every quality check." },
  { n: 6, title: "Final QA & portfolio export", doing: "Check the list, fix anything missing, then download your Week 12 files and upload them to your GitHub portfolio.", proves: "All QA checks pass, so your download is not marked DRAFT." },
] as const;

export function Week12App({ store, stage, onStage }: { store: Week12Store; stage: number; onStage: (n: number) => void }) {
  const v = store.view!;
  const c = store.content!;
  const qa = useMemo(() => computeQA(v.snapshot, c, store.execOption), [v.snapshot, c, store.execOption]);
  const st = STAGES[stage - 1]!;
  const stageChecks = qa.checks.filter((x) => x.stage === stage);
  const [open, setOpen] = useState(true);
  const panelId = useId();
  useEffect(() => { try { const s = localStorage.getItem("cvi:w12-companion"); if (s) setOpen(s === "1"); } catch { /* ignore */ } }, []);
  const toggle = () => setOpen((o) => { try { localStorage.setItem("cvi:w12-companion", o ? "0" : "1"); } catch { /* ignore */ } return !o; });
  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-3 py-5 sm:px-6">
      <Card eyebrow="CyberFoundations · Week 12 · Final capstone" title="Communications Capstone — Portfolio Deliverable 5">
        <p className="text-sm">You already did the investigation in Week 11. This week you <strong>communicate</strong> it: a Technical Incident Report plus one executive communication (written or video). Don't add new incident facts — work from your own case file.</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {v.snapshot.sourceComplete ? <Badge tone="allow">Source: Week 11 Lab 06 complete</Badge> : <Badge tone="warn">DRAFT SOURCE</Badge>}
          <Badge tone="info">Week 11 attempt {v.snapshot.sourceShortId}</Badge>
          <SaveStatus store={store} />
        </div>
        <Week12Visual stage="hero" />
      </Card>

      <SourceBanner store={store} />

      <nav aria-label="Week 12 stages" className="overflow-x-hidden">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {STAGES.map((s) => {
            const checks = qa.checks.filter((x) => x.stage === s.n);
            const done = checks.length > 0 && checks.every((x) => x.ok);
            return (
              <li key={s.n} className="min-w-0">
                <button type="button" aria-current={s.n === stage ? "step" : undefined} onClick={() => onStage(s.n)}
                  className={`${btn} w-full min-w-0 text-left text-xs ${s.n === stage ? "border-primary bg-primary/20" : ""}`}>
                  <span className="block font-mono text-[0.7rem] text-muted-foreground">Stage {s.n}{done ? " ✓" : ""}</span>
                  <span className="block truncate">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Week12Visual stage={st.n} />

      <section className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm" aria-label="Current stage guide">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-base">Stage {st.n}: {st.title}</h2>
          <button type="button" className={`${btn} min-h-9 py-1 text-xs`} aria-expanded={open} aria-controls={panelId} onClick={toggle}>{open ? "Hide guide" : "Show guide"}</button>
        </div>
        {open ? (
          <div id={panelId} className="mt-2 space-y-1">
            <p><strong>What am I doing?</strong> {st.doing}</p>
            <p><strong>What proves success?</strong> {st.proves}</p>
            {stageChecks.length ? (
              <ul className="mt-1 space-y-0.5">{stageChecks.map((x) => <li key={x.id}>{x.ok ? "✓" : "◌"} {x.label}{!x.ok && x.missing.length ? <span className="block pl-5 text-xs text-muted-foreground">{x.missing.slice(0, 3).join(" ")}</span> : null}</li>)}</ul>
            ) : null}
          </div>
        ) : null}
      </section>

      {stage === 1 ? <StageReview store={store} /> : null}
      {stage === 2 ? <StageFindings store={store} /> : null}
      {stage === 3 ? <StageReport store={store} /> : null}
      {stage === 4 ? <StageExec store={store} /> : null}
      {stage === 5 ? <StageRecs store={store} /> : null}
      {stage === 6 ? <StageQA store={store} qa={qa} onStage={onStage} /> : null}

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className={btn} disabled={stage === 1} onClick={() => onStage(stage - 1)}>← Previous stage</button>
        {stage < 6 ? <button type="button" className={btnPrimary} onClick={() => onStage(stage + 1)}>Next: {STAGES[stage]!.title} →</button> : null}
      </div>
    </div>
  );
}

function SaveStatus({ store }: { store: Week12Store }) {
  const s = store.saveState;
  return (
    <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
      {s.kind === "saving" ? "Saving…" : s.kind === "saved" ? `Saved ${s.at}` : s.kind === "failed" ? `Not saved: ${s.message}` : s.kind === "conflict"
        ? <>Changed in another tab. <button type="button" className="underline" onClick={() => void store.reloadAfterConflict()}>Save my version</button></> : "Autosaves as you type"}
    </span>
  );
}

function SourceBanner({ store }: { store: Week12Store }) {
  const v = store.view!;
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const showDraft = !v.snapshot.sourceComplete;
  if (!showDraft && !v.sourceChange) return null;
  const doRefresh = async () => {
    try { await store.refreshSource(); setMsg("Source refreshed from Week 11. Your Week 12 writing was kept — check your evidence references still match."); setConfirm(false); }
    catch (e) { setMsg((e as Error).message); }
  };
  return (
    <div className="space-y-2 rounded-xl border border-amber/60 bg-amber/10 p-3 text-sm" role="note">
      {showDraft ? <p><strong>DRAFT SOURCE.</strong> Your Week 11 Lab 06 case file wasn't complete when Week 12 copied it. You can keep working here, but Week 12 can't be final-ready until Lab 06 is complete in Week 11 and you refresh the source.</p> : null}
      {v.sourceChange ? <p><strong>Source changed.</strong> {v.sourceChange.detail}</p> : null}
      {!confirm ? <button type="button" className={btn} onClick={() => setConfirm(true)}>Refresh from Week 11…</button> : (
        <div className="space-y-2 rounded-md border border-border bg-background p-2">
          <p>This replaces the Week 11 source shown in Week 12 with your current Week 11 case file. Your Week 12 writing stays, but references to evidence that no longer exists will be flagged.</p>
          <div className="flex flex-wrap gap-2"><button type="button" className={btnPrimary} onClick={doRefresh}>Yes, refresh source</button><button type="button" className={btn} onClick={() => setConfirm(false)}>Cancel</button></div>
        </div>
      )}
      {msg ? <p role="status">{msg}</p> : null}
    </div>
  );
}

/* --------------------------------- Stage 1 -------------------------------- */

function SourcePanel({ store }: { store: Week12Store }) {
  const s = store.view!.snapshot;
  return (
    <Card eyebrow="Read-only · from your Week 11 Lab 06 case file" title="Your Week 11 source">
      <p className="text-xs text-muted-foreground">Copied from attempt {s.sourceShortId}{s.sourceStatus === "archived" ? " (archived)" : ""}. In your portfolio this is <span className="break-all font-mono">{WEEK11_CASE_FILE_PATH}</span>.</p>
      <div className="mt-2 space-y-2 text-sm">
        {s.findings.length === 0 ? <p className="text-muted-foreground">No findings were written in Week 11 yet.</p> : null}
        {s.findings.map((f) => (
          <details key={f.key} className="rounded-md border border-border p-2"><summary className="cursor-pointer font-medium">{f.key} · {f.title || "Untitled finding"} <span className="font-mono text-xs text-muted-foreground">{f.refs.join(", ")}</span></summary>
            <dl className="mt-1 space-y-1 text-xs">{(["observation", "hypothesis", "conclusion", "uncertainty", "nextAction", "rationale"] as const).map((k) => f[k] ? <div key={k}><dt className="font-medium">{k}</dt><dd className="whitespace-pre-wrap break-words">{f[k]}</dd></div> : null)}</dl>
          </details>
        ))}
        {s.comparison.text ? <details className="rounded-md border border-border p-2"><summary className="cursor-pointer font-medium">Benign/ambiguous comparison</summary><p className="mt-1 whitespace-pre-wrap break-words text-xs">{s.comparison.text}</p></details> : null}
        <details className="rounded-md border border-border p-2"><summary className="cursor-pointer font-medium">Case file sections, limitations & live chain</summary>
          <div className="mt-1 space-y-1 text-xs">
            {s.report.sections.filter((x) => x.text.trim()).map((x) => <p key={x.n} className="whitespace-pre-wrap break-words"><strong>{x.n}. {x.title}:</strong> {x.text}</p>)}
            <p className="whitespace-pre-wrap break-words"><strong>Limitations:</strong> {s.report.limitations || "—"}</p>
            <p className="break-words"><strong>Live chain:</strong> {s.report.liveChain || "—"}</p>
          </div>
        </details>
        <details className="rounded-md border border-border p-2"><summary className="cursor-pointer font-medium">Evidence you captured ({s.evidence.length})</summary>
          <ul className="mt-1 space-y-1 text-xs">{s.evidence.map((e) => <li key={e.key} className="break-words"><span className="font-mono">{e.key}</span> · {e.slot} · {e.title}{s.captions[e.key] ? ` — ${s.captions[e.key]}` : ""}</li>)}</ul>
        </details>
      </div>
    </Card>
  );
}

function StageReview({ store }: { store: Week12Store }) {
  const items = classItems(store.view!.snapshot);
  const c = store.content!;
  const done = items.filter((i) => c.classify[i.id]).length;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SourcePanel store={store} />
      <Card eyebrow={`${done} of ${items.length} labelled`} title="Classify your source statements">
        <details className="mb-2 text-xs"><summary className="cursor-pointer">What do the labels mean?</summary>
          <ul className="mt-1 space-y-0.5">{CLASS_LABELS.map((l) => <li key={l.value}><strong>{l.label}:</strong> {l.help}</li>)}</ul>
          <p className="mt-2 font-medium">Fictional teaching example (not your case answer):</p>
          <ul className="mt-1 space-y-0.5">
            <li><strong>Fact:</strong> "A successful sign-in occurred at 8:46."</li>
            <li><strong>Evidence:</strong> "Sign-in event S009."</li>
            <li><strong>Finding:</strong> "The sign-in pattern warrants further review."</li>
            <li><strong>Interpretation:</strong> "The account may have been misused."</li>
            <li><strong>Unknown:</strong> "Who controlled the account?"</li>
            <li><strong>Recommendation:</strong> "Review the related privileged access change."</li>
          </ul>
        </details>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing to classify yet — write findings in Week 11 Lab 06, then refresh the source.</p> : null}
        <ul className="space-y-2">{items.map((i) => (
          <li key={i.id} className="rounded-md border border-border p-2">
            <p className="text-xs text-muted-foreground">{i.source}</p>
            <p className="my-1 whitespace-pre-wrap break-words text-sm">{i.text}</p>
            <Select label="This is a…" value={c.classify[i.id] ?? ""} onChange={(x) => store.update((p) => ({ ...p, classify: { ...p.classify, [i.id]: x as ClassLabel } }))}
              options={[{ value: "", label: "Choose…" }, ...CLASS_LABELS.map((l) => ({ value: l.value, label: l.label }))]} />
          </li>
        ))}</ul>
      </Card>
    </div>
  );
}

/* --------------------------------- Stage 2 -------------------------------- */

function RefsInput({ value, onChange, valid }: { value: string[]; onChange: (v: string[]) => void; valid: Set<string> }) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => { setText(value.join(", ")); }, [value.join(",")]);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">Evidence / event references</label>
      <span className="block text-xs text-muted-foreground">Comma-separated, e.g. EV-ABC123-004, S009, A002, C009</span>
      <p className="mt-1 text-xs text-muted-foreground">Use the evidence/event IDs from your Week 11 Case File shown in Stage 1. Do not invent new IDs.</p>
      <details className="mt-1 text-xs"><summary className="cursor-pointer">Where do I find these IDs?</summary>
        <p className="mt-1 text-muted-foreground">Valid references come from your Week 11 source and evidence list, already displayed in Stage 1 of this capstone. Copy the IDs exactly as they appear there.</p>
      </details>
      <input id={id} className={`${input} mt-1 font-mono`} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onChange(parseRefs(text))} />
      <div className="mt-1 flex flex-wrap gap-1">{value.map((r) => <Badge key={r} tone={valid.has(r) ? "allow" : "deny"}>{valid.has(r) ? "✓" : "✕ not in source"} {r}</Badge>)}</div>
    </div>
  );
}

function CoachList({ store, flags }: { store: Week12Store; flags: CoachFlag[] }) {
  if (!flags.length) return null;
  return (
    <div className="space-y-2 rounded-md border border-amber/60 bg-amber/10 p-2 text-sm" role="note">
      <p><strong>Can your evidence support this statement?</strong> Words like these claim certainty. Suspicious or unusual is not the same as proven compromise. Reword it — or, if your evidence really supports it, say which evidence. This is coaching, not a block.</p>
      {flags.map((f) => (
        <label key={f.id} className="block">
          <span className="text-xs">{f.reviewed ? "✓" : "◌"} "<strong>{f.term}</strong>" in {f.fieldLabel}</span>
          <input className={`${input} mt-1`} placeholder="Evidence note, e.g. 'A002 shows self-granted membership with no approval ticket'" value={store.content!.acks[f.id] ?? ""}
            onChange={(e) => store.update((p) => ({ ...p, acks: { ...p.acks, [f.id]: e.target.value } }))} />
        </label>
      ))}
    </div>
  );
}

function StageFindings({ store }: { store: Week12Store }) {
  const c = store.content!;
  const valid = validRefs(store.view!.snapshot);
  const flags = coachFlags(c, store.execOption).filter((f) => f.field.startsWith("finding:"));
  const setF = (i: number, patch: Partial<W12Content["findings"][number]>) => store.update((p) => ({ ...p, findings: p.findings.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  const add = () => store.update((p) => {
    const n = Math.max(0, ...p.findings.map((f) => Number(f.key.replace(/\D/g, "")) || 0)) + 1;
    return { ...p, findings: [...p.findings, { key: `RF${n}`, sourceFindingKey: "", statement: "", evidenceRefs: [], confidence: "", uncertainty: "" }] };
  });
  return (
    <div className="space-y-4">
      <Card title="Defensible language" eyebrow="Say only what your evidence shows">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Prefer "The records show…", "This is consistent with…", "We could not confirm…".</li>
          <li>Name the record: "S004–S008 show five failed sign-ins, then S009 succeeded from an unknown device."</li>
          <li>Separate what happened from what it might mean, and state your confidence.</li>
        </ul>
      </Card>
      {c.findings.map((f, i) => (
        <Card key={f.key} title={`Finding ${f.key}`} eyebrow={f.sourceFindingKey ? `From Week 11 ${f.sourceFindingKey}` : "New finding"}
          actions={<button type="button" className={`${btn} min-h-9 py-1 text-xs`} onClick={() => store.update((p) => ({ ...p, findings: p.findings.filter((_, j) => j !== i) }))}>Remove</button>}>
          <div className="space-y-3">
            <TextArea label="Report-ready finding statement" value={f.statement} onChange={(x) => setF(i, { statement: x })} max={3000} />
            <RefsInput value={f.evidenceRefs} onChange={(x) => setF(i, { evidenceRefs: x })} valid={valid} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Confidence" value={f.confidence} onChange={(x) => setF(i, { confidence: x as never })} options={[{ value: "", label: "Choose…" }, { value: "confirmed", label: "Confirmed by records" }, { value: "likely", label: "Likely" }, { value: "possible", label: "Possible" }]} />
              <TextArea label="What remains uncertain?" value={f.uncertainty} onChange={(x) => setF(i, { uncertainty: x })} rows={2} max={2000} />
            </div>
          </div>
        </Card>
      ))}
      <button type="button" className={btn} onClick={add} disabled={c.findings.length >= 12}>+ Add another evidence-supported finding</button>
      <p className="text-xs text-muted-foreground">Only add another finding if it is supported by evidence already captured in your Week 11 Case File. Week 12 is not a new investigation.</p>
      <CoachList store={store} flags={flags} />
    </div>
  );
}

/* --------------------------------- Stage 3 -------------------------------- */

function StageReport({ store }: { store: Week12Store }) {
  const r = store.content!.report;
  const set = (k: keyof typeof r) => (x: string) => store.update((p) => ({ ...p, report: { ...p.report, [k]: x } }));
  const flags = coachFlags(store.content!, store.execOption).filter((f) => f.field.startsWith("report:"));
  return (
    <div className="space-y-4">
      <Card title="Report header">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium">Report title</span><input className={`${input} mt-1`} value={r.title} maxLength={200} onChange={(e) => set("title")(e.target.value)} /></label>
          <label className="block"><span className="text-sm font-medium">Analyst (your name)</span><input className={`${input} mt-1`} value={r.analyst} maxLength={120} onChange={(e) => set("analyst")(e.target.value)} /></label>
        </div>
      </Card>
      <Card title="Report sections" eyebrow="Technical audience">
        <div className="space-y-3">
          <TextArea label="1. Purpose / incident context" help="Why was this investigated? What triggered it?" value={r.purpose} onChange={set("purpose")} />
          <TextArea label="2. Scope" help="Which accounts, systems and time window — and what was out of scope." value={r.scope} onChange={set("scope")} />
          <TextArea label="3. Evidence reviewed" help="Sign-in logs, audit logs, directory state, captured evidence (EV-…)." value={r.evidenceReviewed} onChange={set("evidenceReviewed")} />
          <TextArea label="4. Timeline" help="One line per event: time — event ID — what the record shows." value={r.timeline} onChange={set("timeline")} rows={5} max={6000} />
          <div className="rounded-md border border-border p-2 text-sm"><strong>5. Findings</strong> — pulled in from Stage 2 ({store.content!.findings.length} written).
            <p className="mt-1 text-xs text-muted-foreground">You do not need to copy and paste these sections. Findings from Stage 2 and recommendations from Stage 5 are inserted automatically into your exported Technical Incident Report.</p>
          </div>
          <TextArea label="6. Impact / risk" help="What could this access allow? Who is affected? How serious, and why?" value={r.impact} onChange={set("impact")} />
          <div className="rounded-md border border-border p-2 text-sm"><strong>7. Recommendations / next actions</strong> — built in Stage 5 ({store.content!.recommendations.length} written).
            <p className="mt-1 text-xs text-muted-foreground">You do not need to copy and paste these sections. Findings from Stage 2 and recommendations from Stage 5 are inserted automatically into your exported Technical Incident Report.</p>
          </div>
          <TextArea label="8. Limitations / unknowns" help="What the evidence cannot tell you; data you didn't have." value={r.limitations} onChange={set("limitations")} />
          <TextArea label="9. Conclusion" help="Two or three sentences a technical lead could act on." value={r.conclusion} onChange={set("conclusion")} />
        </div>
      </Card>
      <CoachList store={store} flags={flags} />
    </div>
  );
}

/* --------------------------------- Stage 4 -------------------------------- */

function StageExec({ store }: { store: Week12Store }) {
  const c = store.content!;
  const opt = store.execOption;
  const w = c.written, vid = c.video;
  const setW = (k: keyof typeof w) => (x: string) => store.update((p) => ({ ...p, written: { ...p.written, [k]: x } }));
  const setV = (patch: Partial<typeof vid>) => store.update((p) => ({ ...p, video: { ...p.video, ...patch } }));
  const missing = execMissing(c, opt);
  const words = writtenWords(w);
  const urlErr = vid.url ? validateVideoUrl(vid.url) : null;
  const dur = parseDuration(vid.duration);
  const flags = coachFlags(c, opt).filter((f) => f.field.startsWith("written:") || f.field.startsWith("video:"));
  return (
    <div className="space-y-4">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium">Choose one executive communication — both are equally weighted</legend>
        {([["written", "A. Written Executive Summary", "About 250–400 words answering five leadership questions."], ["video", "B. Video Executive Briefing", "About 2–3 minutes. Paste a link (no uploads), plus a short outline and reflection."]] as const).map(([val, t, d]) => (
          <label key={val} className={`cursor-pointer rounded-xl border p-3 ${opt === val ? "border-primary bg-primary/10" : "border-border"}`}>
            <input type="radio" name="exec" className="mr-2" checked={opt === val} onChange={() => store.chooseExec(val)} />
            <span className="font-medium">{t}</span><span className="mt-1 block text-xs text-muted-foreground">{d}</span>
          </label>
        ))}
      </fieldset>
      {opt ? <p className="text-xs text-muted-foreground">Switching keeps both drafts saved. Only your selected option is checked and exported.</p> : null}

      {opt === "written" ? (
        <Card title="Written Executive Summary" eyebrow={`${words} words · target about 250–400`}>
          <div className="space-y-3">
            <TextArea label="What happened?" value={w.whatHappened} onChange={setW("whatHappened")} max={3000} />
            <TextArea label="Why does it matter?" help="Business impact in plain language — no jargon." value={w.whyMatters} onChange={setW("whyMatters")} max={3000} />
            <TextArea label="What did we find?" value={w.whatFound} onChange={setW("whatFound")} max={3000} />
            <TextArea label="What should happen next?" value={w.nextSteps} onChange={setW("nextSteps")} max={3000} />
            <TextArea label="What remains uncertain? (if material)" value={w.uncertain} onChange={setW("uncertain")} max={3000} />
          </div>
        </Card>
      ) : null}

      {opt === "video" ? (
        <Card title="Video Executive Briefing" eyebrow="Link only · about 2–3 minutes">
          <div className="space-y-3">
            <label className="block"><span className="text-sm font-medium">Video link (https)</span>
              <input className={`${input} mt-1`} type="url" inputMode="url" value={vid.url} maxLength={500} onChange={(e) => setV({ url: e.target.value })} aria-invalid={Boolean(urlErr)} />
              {urlErr ? <span className="text-xs" role="alert">{urlErr}</span> : null}</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">Platform</span><input className={`${input} mt-1`} placeholder="YouTube (unlisted), Google Drive, Loom…" value={vid.platform} maxLength={80} onChange={(e) => setV({ platform: e.target.value })} /></label>
              <label className="block"><span className="text-sm font-medium">Duration</span><input className={`${input} mt-1`} placeholder="2:30" value={vid.duration} maxLength={20} onChange={(e) => setV({ duration: e.target.value })} />
                <span className="text-xs text-muted-foreground">{dur !== null ? `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")}` : "Use m:ss"}</span></label>
            </div>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={vid.accessChecked} onChange={(e) => setV({ accessChecked: e.target.checked })} /> I opened the link in a private/signed-out window and it plays for anyone with the link.</label>
            <TextArea label="Outline / speaker notes" help="Bullet lines — one per point you make." value={vid.outline} onChange={(x) => setV({ outline: x })} rows={5} max={4000} />
            <TextArea label="Reflection — how did you adapt this for leadership?" help="About 2–4 sentences." value={vid.reflection} onChange={(x) => setV({ reflection: x })} rows={3} max={2000} />
            <p className="text-xs text-muted-foreground">The outline and short reflection are submission notes, not an additional essay. They do not need to be included in your recorded briefing.</p>
          </div>
        </Card>
      ) : null}

      {opt && missing.length ? <div className="rounded-md border border-border p-2 text-sm"><strong>Still needed:</strong><ul className="list-disc pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul></div> : null}
      <CoachList store={store} flags={flags} />
    </div>
  );
}

/* --------------------------------- Stage 5 -------------------------------- */

function StageRecs({ store }: { store: Week12Store }) {
  const c = store.content!;
  const keys = c.findings.map((f) => f.key);
  const setR = (i: number, patch: Partial<W12Content["recommendations"][number]>) => store.update((p) => ({ ...p, recommendations: p.recommendations.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const add = () => store.update((p) => {
    const n = Math.max(0, ...p.recommendations.map((r) => Number(r.key.replace(/\D/g, "")) || 0)) + 1;
    return { ...p, recommendations: [...p.recommendations, { key: `R${n}`, action: "", owner: "", why: "", priority: "", timeframe: "", linkedFindings: [], successMeasure: "" }] };
  });
  return (
    <div className="space-y-4">
      <Card title="From vague to actionable" eyebrow="These go inside your technical report">
        <p className="text-sm">"Improve security" or "monitor logs" can't be acted on. Try: <em>"Remove Blair's self-granted Privileged-Operators membership and require a ticket-approved change for that group — IAM team, high priority, within 24 hours; success = group audit shows no unapproved members."</em></p>
      </Card>
      {c.recommendations.map((r, i) => {
        const issues = recommendationIssues(r, keys);
        return (
          <Card key={r.key} title={`Recommendation ${r.key}`} eyebrow={issues.length ? `${issues.length} quality check(s) to fix` : "✓ Actionable"}
            actions={<button type="button" className={`${btn} min-h-9 py-1 text-xs`} onClick={() => store.update((p) => ({ ...p, recommendations: p.recommendations.filter((_, j) => j !== i) }))}>Remove</button>}>
            <div className="space-y-3">
              <TextArea label="What — the specific action" value={r.action} onChange={(x) => setR(i, { action: x })} rows={2} max={1500} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-medium">Who owns it</span><input className={`${input} mt-1`} value={r.owner} maxLength={200} onChange={(e) => setR(i, { owner: e.target.value })} /></label>
                <label className="block"><span className="text-sm font-medium">Timeframe</span><input className={`${input} mt-1`} placeholder="within 24 hours" value={r.timeframe} maxLength={200} onChange={(e) => setR(i, { timeframe: e.target.value })} /></label>
                <Select label="Priority" value={r.priority} onChange={(x) => setR(i, { priority: x as never })} options={[{ value: "", label: "Choose…" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} />
              </div>
              <TextArea label="Why — which risk it reduces" value={r.why} onChange={(x) => setR(i, { why: x })} rows={2} max={1500} />
              <fieldset><legend className="text-sm font-medium">Linked finding(s)</legend>
                <div className="mt-1 flex flex-wrap gap-3">{keys.length ? keys.map((k) => (
                  <label key={k} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={r.linkedFindings.includes(k)} onChange={(e) => setR(i, { linkedFindings: e.target.checked ? [...r.linkedFindings, k] : r.linkedFindings.filter((x) => x !== k) })} />{k}</label>
                )) : <span className="text-xs text-muted-foreground">Write findings in Stage 2 first.</span>}</div>
              </fieldset>
              <TextArea label="Success measure — how you'll know it worked" value={r.successMeasure} onChange={(x) => setR(i, { successMeasure: x })} rows={2} max={1500} />
              {issues.length ? <ul className="list-disc pl-5 text-xs">{issues.map((x) => <li key={x}>{x}</li>)}</ul> : null}
            </div>
          </Card>
        );
      })}
      <button type="button" className={btn} onClick={add} disabled={c.recommendations.length >= 12}>+ Add recommendation</button>
    </div>
  );
}

/* --------------------------------- Stage 6 -------------------------------- */

function StageQA({ store, qa, onStage }: { store: Week12Store; qa: ReturnType<typeof computeQA>; onStage: (n: number) => void }) {
  const v = store.view!;
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const paths = week12Paths(store.execOption);
  const one = async (path: string) => {
    setBusy(path);
    try { const r = await store.downloadFile(path.replace(/^week-12\//, "") as Week12File); setStatus(`Downloaded ${r.filename}${r.draft ? " (DRAFT)" : ""}.`); }
    catch (e) { setStatus(`Download failed: ${(e as Error).message}`); } finally { setBusy(null); }
  };
  const zip = async () => {
    setBusy("zip");
    try { const r = await store.downloadZip(); setStatus(`Downloaded ${r.filename} (${r.files.length} files).`); }
    catch (e) { setStatus(`Download failed: ${(e as Error).message}`); } finally { setBusy(null); }
  };
  return (
    <div className="space-y-4">
      <Card title="Final QA" eyebrow={qa.ready ? "✓ Ready — your download won't be marked DRAFT" : "Fix these, then download"}>
        <ul className="space-y-2">{qa.checks.map((x) => (
          <li key={x.id} className="rounded-md border border-border p-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><span>{x.ok ? "✓" : "◌"} {x.label}</span>
              {!x.ok ? <button type="button" className={`${btn} min-h-9 py-1 text-xs`} onClick={() => onStage(x.stage)}>Go to Stage {x.stage}</button> : null}</div>
            {!x.ok && x.missing.length ? <ul className="mt-1 list-disc pl-5 text-xs">{x.missing.map((m) => <li key={m} className="break-words">{m}</li>)}</ul> : null}
          </li>
        ))}</ul>
      </Card>

      <Card title="Download & GitHub" eyebrow="Downloading is not submitting">
        <p className="text-sm">These files are built from your saved Week 12 work. Downloading doesn't submit anything — you upload them to your own GitHub portfolio.</p>
        <ul className="mt-3 grid gap-2">{paths.map((p) => (
          <li key={p} className="grid min-w-0 gap-2 rounded-md border border-border p-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <span className="break-all font-mono text-xs">{p}</span>
            <button type="button" className={`${btn} text-xs`} disabled={busy !== null} onClick={() => one(p)}>{busy === p ? "Preparing…" : "Download file"}</button>
          </li>
        ))}</ul>
        {!store.execOption ? <p className="mt-2 text-xs">Choose your executive communication in Stage 4 to add its file.</p> : null}
        <button type="button" className={`${btnPrimary} mt-3 w-full sm:w-auto`} disabled={busy !== null} onClick={zip}>{busy === "zip" ? "Preparing…" : "Download complete Week 12 ZIP"}</button>
        <p className="mt-1 text-xs text-muted-foreground">File name: <span className="font-mono">{week12ZipName(!qa.ready)}</span></p>
        <p className="mt-2 min-h-5 text-sm" role="status" aria-live="polite">{status}</p>
        <ol className="mt-3 space-y-1 text-sm">
          <li>1. Unzip the download and keep the folder structure.</li>
          <li>2. Open <strong>your own</strong> CyberFoundations portfolio repository on GitHub (the one that already has <span className="font-mono">week-11/</span>).</li>
          <li>3. Choose <strong>Add file → Upload files</strong>, drag in the whole <span className="font-mono">week-12</span> folder, write a commit message and choose <strong>Commit changes</strong>.</li>
          <li>4. Open <span className="font-mono">week-12/technical-incident-report.md</span> on GitHub and click the link to your Week 11 case file to check it opens.</li>
        </ol>
      </Card>

      <Card title="Optional: volunteer to present live" eyebrow="Not graded · not part of QA">
        <p className="text-sm">Two volunteers will be chosen by your instructor to present live. Volunteering has no effect on your grade or readiness.</p>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={v.volunteerStatus === "volunteered"} onChange={(e) => void store.setVolunteer(e.target.checked)} /> I'd like to be considered for a live presentation.</label>
        {v.presenterSelected ? <p className="mt-1 text-sm" role="status">Your instructor has selected you to present.</p> : null}
      </Card>

      {v.reviews.length ? (
        <Card title="Instructor feedback">{v.reviews.map((r) => <p key={r.created_at} className="whitespace-pre-wrap text-sm">{r.feedback}</p>)}</Card>
      ) : null}
    </div>
  );
}
