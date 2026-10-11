import { useState } from "react";
import { Button } from "@/components/ui/button";
import { historicalAudit, historicalSignins, reportSections } from "@/lib/week11/seed";
import { caseFileParts, caseFilePresence, findingPresence, sectionGuidance } from "@/lib/week11/case-file-guidance";
import type { Finding } from "@/lib/week11/types";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { input, TextArea } from "./ui";
import { DownloadsView } from "./DownloadsView";

const blankFinding = (n: number): Finding => ({ key: `F${n}`, title: "", refs: [], observation: "", hypothesis: "", conclusion: "", uncertainty: "", nextAction: "", priority: "", rationale: "" });
const eventIds = [...historicalSignins, ...historicalAudit].map((r) => r.event_id);
const path = ["Review evidence", "Build findings", "Compare records", "Document live activity", "Complete Case File sections", "Final review", "Download"];
const findingLabels = ["Name the finding", "Select the records", "Observation", "Hypothesis", "Supported conclusion", "What remains unknown?", "Next action", "Priority", "Why this priority?"];
const progressLabels = ["title added", "historical records selected", "observation written", "hypothesis written", "conclusion written", "uncertainty written", "next action written", "priority selected", "rationale written"];
const writingSteps = {
  2: { field: "observation", prompt: "What do the selected records literally show?", starter: "The records show…" },
  3: { field: "hypothesis", prompt: "What is one possible explanation for what you observed?", starter: "One possible explanation is…" },
  4: { field: "conclusion", prompt: "What can you actually support with the selected evidence?", starter: "Based on the available records…" },
  5: { field: "uncertainty", prompt: "What can these records not tell you yet?", starter: "The available evidence does not establish…" },
  6: { field: "nextAction", prompt: "What should be checked or done next?", starter: "" },
  8: { field: "rationale", prompt: "What risk or impact makes this priority reasonable?", starter: "" },
} as const;
type Destination = "signins" | "audit" | "evidence";

function HistoricalPicker({ value, onChange, label }: { value: string[]; onChange: (refs: string[]) => void; label: string }) {
  const [filter, setFilter] = useState("");
  return <fieldset className="min-w-0"><legend className="text-sm font-medium">{label}</legend>
    <label className="mt-2 block text-xs">Filter event IDs<input className={`${input} mt-1 max-w-xs`} value={filter} onChange={(e) => setFilter(e.target.value.trim().toUpperCase())} /></label>
    <p className="mt-2 break-words text-xs text-muted-foreground">Selected: {value.length ? value.join(", ") : "No records selected yet."}</p>
    <details className="mt-2"><summary className="min-h-11 cursor-pointer content-center text-sm focus-visible:outline focus-visible:outline-primary">Choose historical event IDs</summary>
      <div className="mt-2 flex flex-wrap gap-2">{eventIds.filter((id) => !filter || id.includes(filter) || value.includes(id)).map((id) => <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-3 font-mono text-xs"><input type="checkbox" checked={value.includes(id)} onChange={(e) => onChange(e.target.checked ? [...value, id] : value.filter((x) => x !== id))} />{id}</label>)}</div>
    </details>
  </fieldset>;
}

function Starter({ text }: { text: string }) {
  return text ? <p className="my-3 max-w-prose text-xs text-muted-foreground"><strong>Sentence starter:</strong> {text}</p> : null;
}

export function CaseFileBuilder({ store, onView }: { store: Week11Store; onView?: ((view: Destination) => void) | undefined }) {
  const [stage, setStage] = useState(0);
  const [findingIndex, setFindingIndex] = useState(0);
  const [findingStep, setFindingStep] = useState(0);
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const v = store.view;
  if (!v) return null;
  const { learner, setLearner } = store;
  const findings = learner.findings?.length ? learner.findings : [blankFinding(1), blankFinding(2)];
  const finding = findings[findingIndex] ?? findings[0];
  if (!finding) return null;
  const rep = learner.report ?? {};
  const setF = (patch: Partial<Finding>) => setLearner((l) => {
    const list = [...(l.findings?.length ? l.findings : [blankFinding(1), blankFinding(2)])];
    const current = list[findingIndex];
    if (!current) return l;
    list[findingIndex] = { ...current, ...patch };
    return { ...l, findings: list };
  });
  const setRep = (patch: Partial<NonNullable<typeof learner.report>>) => setLearner((l) => ({ ...l, report: { ...(l.report ?? {}), ...patch } }));
  const presence = findingPresence(finding);
  const review = caseFilePresence(learner, eventIds, [...v.state.audits.map((e) => e.id), ...v.state.tests.map((e) => e.id), ...v.state.signins.map((e) => e.id)]);
  const currentPath = stage === 4 || stage === 5 ? 4 : stage > 5 ? stage - 1 : stage;
  const go = (next: number) => { setStage(next); setSaveError(""); };
  const next = () => {
    if (stage === 1 && findingStep < 8) setFindingStep(findingStep + 1);
    else if (stage === 1 && findingIndex < findings.length - 1) { setFindingIndex(findingIndex + 1); setFindingStep(0); }
    else if (stage === 4 && section < reportSections.length - 1) setSection(section + 1);
    else go(Math.min(7, stage + 1));
  };
  const previous = () => {
    if (stage === 1 && findingStep > 0) setFindingStep(findingStep - 1);
    else if (stage === 1 && findingIndex > 0) { setFindingIndex(findingIndex - 1); setFindingStep(8); }
    else if (stage === 4 && section > 0) setSection(section - 1);
    else go(Math.max(0, stage - 1));
  };
  const saveContinue = async () => { setSaving(true); setSaveError(""); try { await store.flush(); next(); } catch { setSaveError("Your writing is still here. Check the save message above and try Save again."); } finally { setSaving(false); } };
  const logButtons = <div className="mt-3 flex flex-wrap gap-2">{(["signins", "audit"] as const).map((view) => <Button key={view} variant="outline" className="min-h-11 whitespace-normal" onClick={() => onView?.(view)} disabled={!onView}>Open {view === "signins" ? "Sign-in Logs" : "Audit Logs"}</Button>)}</div>;
  const writing = writingSteps[findingStep as keyof typeof writingSteps];
  const guidance = sectionGuidance[section];
  const sectionTitle = (reportSections[section] ?? "").replace(" (including C009)", "");
  return <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
    <header className="space-y-3 border-b border-border pb-5">
      <p className="text-xs text-primary">Lab 06 · Portfolio Deliverable 4</p>
      <h2 className="font-display text-xl">Cloud Heights IAM Investigation Case File</h2>
      <p className="max-w-prose text-sm font-medium">You are not writing the polished incident report yet.</p>
      <details><summary className="min-h-11 cursor-pointer content-center text-sm focus-visible:outline focus-visible:outline-primary">Week 11 / Week 12: what am I making?</summary><div className="max-w-prose space-y-2 text-sm">
        <p><strong>Week 11:</strong> Build your technical Case File and document what the evidence supports.</p><p><strong>Week 12:</strong> Turn this Case File into the polished Technical Incident Report and executive communication.</p>
        <p>Labs 1–5: administer, test, and collect evidence.</p><p>Lab 6: investigate the records and assemble Portfolio Deliverable 4.</p>
      </div></details>
      <p className="max-w-prose border-l-2 border-primary pl-3 text-xs">Your completed Week 11 Case File becomes the source for Week 12. Use the same signed-in account for Week 12 so your Case File can be found.</p>
      <nav aria-label="Case File progress"><ol className="grid gap-1 sm:grid-cols-2">{path.map((title, i) => {
        const done = [v.evidence.length > 0, (learner.findings?.length ?? 0) >= 2 && (learner.findings ?? []).every((f) => findingPresence(f).every(Boolean)), Boolean(learner.comparison?.refs.length && learner.comparison.text.trim()), Boolean(rep.liveChain?.trim()), review.sections && Boolean(rep.limitations?.trim()), false, false][i];
        return <li key={title}><Button variant={currentPath === i ? "secondary" : "ghost"} aria-current={currentPath === i ? "step" : undefined} className="min-h-11 h-auto w-full justify-start whitespace-normal text-left text-xs" onClick={() => go(i > 4 ? i + 1 : i)}>{done ? "✓" : `${i + 1}.`} {title}</Button></li>;
      })}</ol></nav>
      <p className="text-xs text-muted-foreground">Progress describes saved writing and selections only, not a grade. Your writing saves automatically.</p>
    </header>
    <section aria-label="Current Case File task" className="min-w-0 space-y-4">
      {stage === 0 ? <>
        <h3 className="font-display text-lg">1. Review evidence</h3><p className="max-w-prose text-sm">Read the Historical records in Sign-in Logs and Audit Logs. Choose relevant records yourself; a shared ID does not prove cause.</p>
        {logButtons}<Button variant="outline" className="min-h-11" onClick={() => onView?.("evidence")} disabled={!onView}>Open Evidence Tray</Button>
        <details><summary className="min-h-11 cursor-pointer content-center text-sm">Need help?</summary><p className="max-w-prose text-xs text-muted-foreground">Open an Event ID to read its raw record. Note which records support each observation. Keep Historical records separate from Your simulated activity.</p></details>
        <p className="text-sm">When done: continue to Finding 1. No records are selected automatically.</p>
      </> : null}
      {stage === 1 ? <>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose finding">{findings.map((f, i) => <Button key={f.key} variant={findingIndex === i ? "secondary" : "outline"} className="min-h-11" aria-pressed={findingIndex === i} onClick={() => { setFindingIndex(i); setFindingStep(0); }}>Finding {i + 1}</Button>)}</div>
        <label className="block text-sm">Choose a finding step<select className={`${input} mt-1`} value={findingStep} onChange={(e) => setFindingStep(Number(e.target.value))}>{findingLabels.map((label, i) => <option key={label} value={i}>{i + 1}. {label}</option>)}</select></label>
        <h3 className="font-display text-lg">Finding {findingIndex + 1} · Step {findingStep + 1} of 9 — {findingLabels[findingStep]}</h3>
        {findingStep === 0 ? <label className="block text-sm">Give this finding a short title.<span className="block text-xs text-muted-foreground">What are you investigating in this finding?</span><input className={`${input} mt-2`} value={finding.title} maxLength={200} onChange={(e) => setF({ title: e.target.value })} /></label> : null}
        {findingStep === 1 ? <><p className="text-sm">Choose only the historical event IDs that directly support this finding.</p><HistoricalPicker label="Exact historical events this finding rests on" value={finding.refs} onChange={(refs) => setF({ refs })} />{logButtons}</> : null}
        {writing ? <><TextArea label={writing.prompt} value={finding[writing.field]} onChange={(value) => setF({ [writing.field]: value })} /><Starter text={writing.starter} />{findingStep === 3 ? <p className="max-w-prose text-xs text-muted-foreground">A hypothesis is something you are considering. It is not something you have proven.</p> : null}</> : null}
        {findingStep === 7 ? <label className="block text-sm">How urgent is the next action?<select className={`${input} mt-2`} value={finding.priority} onChange={(e) => setF({ priority: e.target.value as Finding["priority"] })}><option value="">Choose priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label> : null}
        <details open={findingStep === 8}><summary className="min-h-11 cursor-pointer content-center text-sm">Finding {findingIndex + 1} progress · {presence.filter(Boolean).length} of 9 added</summary><ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">{progressLabels.map((label, i) => <li key={label}>{presence[i] ? "✓" : "○"} {label}</li>)}</ul><p className="mt-2 text-xs">Guidance only: this checks presence, not correctness.</p></details>
        {presence.every(Boolean) ? <p role="status" className="text-sm">✓ Finding {findingIndex + 1} ready for final Case File review</p> : null}
        {findings.length < 6 ? <Button variant="outline" className="min-h-11" onClick={() => { setLearner((l) => ({ ...l, findings: [...(l.findings?.length ? l.findings : findings), blankFinding(findings.length + 1)] })); setFindingIndex(findings.length); setFindingStep(0); }}>Add another finding</Button> : null}
      </> : null}
      {stage === 2 ? <>
        <h3 className="font-display text-lg">3. Benign or ambiguous comparison</h3><p className="max-w-prose text-sm">This section demonstrates professional judgment. Unusual does not automatically mean malicious.</p>
        <h4 className="text-sm font-medium">Step 1 — Select the records</h4><HistoricalPicker label="Choose the historical records you want to compare." value={learner.comparison?.refs ?? []} onChange={(refs) => setLearner((l) => ({ ...l, comparison: { text: l.comparison?.text ?? "", refs } }))} />
        <ol start={2} className="max-w-prose list-decimal space-y-3 pl-5 text-sm"><li><strong>What looks unusual?</strong><p className="text-xs text-muted-foreground">What part of these records might initially look concerning or unusual?</p></li><li><strong>What else could explain it?</strong><p className="text-xs text-muted-foreground">What context or evidence provides another reasonable explanation?</p></li><li><strong>Why should you not over-claim?</strong><p className="text-xs text-muted-foreground">Explain why these records are not enough to claim compromise, malicious activity, or another unsupported conclusion.</p></li></ol>
        <TextArea label="Write these three ideas together" help="Use one paragraph or three short parts in this same field." value={learner.comparison?.text ?? ""} onChange={(text) => setLearner((l) => ({ ...l, comparison: { refs: l.comparison?.refs ?? [], text } }))} />
      </> : null}
      {stage === 3 ? <>
        <h3 className="font-display text-lg">4. Show one example from your own Week 11 work.</h3><p className="text-sm">Choose records that show: Action → recorded change/test → result.</p><p className="max-w-prose text-xs text-muted-foreground">Use IDs from Your simulated activity here, not Historical S/A records.</p>
        <TextArea label="In 1–3 sentences, explain what you did and what the simulator recorded." value={rep.liveChain ?? ""} onChange={(liveChain) => setRep({ liveChain })} />
        <Starter text="During my Week 11 work, I performed ________. Record ________ shows ________." />
        <details><summary className="min-h-11 cursor-pointer content-center text-sm">Insert a live audit ID (newest first)</summary><div className="flex max-h-64 flex-wrap gap-2 overflow-auto">{[...v.state.audits].reverse().slice(0, 30).map((e) => <Button key={e.id} variant="outline" className="min-h-11 h-auto max-w-full whitespace-normal text-left font-mono text-xs" onClick={() => setRep({ liveChain: `${rep.liveChain ?? ""}${rep.liveChain ? " " : ""}${e.id}` })}>{e.id} {e.activity}</Button>)}{!v.state.audits.length ? <p className="text-xs">No live activity yet — complete earlier missions first.</p> : null}</div></details>
      </> : null}
      {stage === 4 && guidance ? <>
        <p className="text-xs text-primary">Part {guidance.part} — {caseFileParts[guidance.part - 1]}</p>
        <label className="block text-sm">Choose a Case File section<select className={`${input} mt-1`} value={section} onChange={(e) => setSection(Number(e.target.value))}>{reportSections.map((title, i) => <option key={title} value={i}>{i + 1}. {title.replace(" (including C009)", "")}</option>)}</select></label>
        <h3 className="font-display text-lg">Section {section + 1} of 12 — {sectionTitle}</h3>
        <div className="max-w-prose text-sm"><h4 className="font-medium">What belongs here?</h4><p className="mt-1 text-muted-foreground">{guidance.help}</p></div>
        <details><summary className="min-h-11 cursor-pointer content-center text-sm">Do not put here</summary><p className="max-w-prose text-xs text-muted-foreground">{guidance.avoid}</p></details>
        <Starter text={guidance.starter} /><TextArea label={`Write section ${section + 1}`} rows={6} value={rep.sections?.[String(section + 1)] ?? ""} onChange={(value) => setLearner((l) => ({ ...l, report: { ...(l.report ?? {}), sections: { ...(l.report?.sections ?? {}), [String(section + 1)]: value } } }))} />
        <details><summary className="min-h-11 cursor-pointer content-center text-sm">What belongs in each section?</summary><ol className="list-decimal space-y-3 pl-5 text-xs text-muted-foreground">{sectionGuidance.map((item, i) => <li key={i}><strong>{reportSections[i]?.replace(" (including C009)", "")}</strong><p>{item.help}</p></li>)}</ol></details>
      </> : null}
      {stage === 5 ? <>
        <p className="text-xs text-primary">Part 4 — Close the case</p><h3 className="font-display text-lg">Limitations</h3>
        <TextArea label="What can this simulation or the available records NOT tell you?" value={rep.limitations ?? ""} onChange={(limitations) => setRep({ limitations })} />
        <Starter text="This investigation is limited by…" /><details><summary className="min-h-11 cursor-pointer content-center text-sm">Need help? Categories to consider</summary><ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground"><li>Missing records</li><li>Simulated environment limits</li><li>Facts that cannot be confirmed</li></ul></details>
      </> : null}
      {stage === 6 ? <>
        <h3 className="font-display text-lg">Your Case File Check</h3><p className="max-w-prose text-sm">Final readiness is still checked by the existing Week 11 system. This review helps you catch missing work before downloading.</p>
        <ul className="space-y-3 text-sm">{([
          [review.twoFindings, "At least two saved findings exist"], [review.findingEvidence, "Findings have selected evidence"], [review.observationsAndConclusions, "Observation and supported conclusion fields are filled"], [review.uncertaintyAndLimitations, "Uncertainty and limitations are documented"], [review.nextActions, "Next actions are included"], [review.historicalSelections, "Finding and comparison selections use Historical records"], [review.liveSource, "Live chain cites Your simulated activity, with no Historical event IDs detected"], [review.sections, "All twelve Case File sections have content"],
        ] as const).map(([done, label]) => <li key={label}>{done ? "✓" : "○"} {label}</li>)}</ul>
        <p className="max-w-prose text-xs text-muted-foreground">Presence checks cannot judge your reasoning or verify every reference in free text. Read your IDs again to ensure Historical records and Your simulated activity are not mixed in the wrong fields. Nothing here blocks downloading.</p>
      </> : null}
      {stage === 7 ? <>
        <h3 className="font-display text-lg">When your Case File is complete:</h3><ol className="list-decimal space-y-2 pl-5 text-sm"><li>Review your Case File</li><li>Download your Week 11 files</li><li>Upload them to your GitHub portfolio</li><li>Keep using the same account for Week 12</li></ol>
        <DownloadsView store={store} afterZip="Next: capture E19 from the Current Mission panel or Mission Progress." />
      </> : null}
    </section>
    <footer className="space-y-2 border-t border-border pt-4">
      <div className="flex flex-wrap justify-between gap-2"><Button variant="outline" className="min-h-11" disabled={stage === 0 || saving} onClick={previous}>Previous</Button>{stage < 7 ? <Button className="min-h-11" disabled={saving} onClick={() => void saveContinue()}>{saving ? "Saving…" : "Save & Continue"}</Button> : null}</div>
      <p className="text-xs text-muted-foreground">Move backward or choose any step without re-entering your writing. Check the save message above before leaving.</p>
      {saveError ? <p role="alert" className="text-sm">{saveError}</p> : null}
    </footer>
  </div>;
}
