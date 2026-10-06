/** SERVER-ONLY Week 12 GitHub portfolio export (Portfolio Deliverable 5). */
import { zipSync, strToU8 } from "fflate";
import {
  coachFlags, computeQA, normalizeContent, parseDuration, validRefs, week12Paths, week12ZipName, writtenWords,
  WEEK11_CASE_FILE_PATH, WEEK11_EVIDENCE_INDEX_PATH, type ExecOption, type SourceSnapshot, type W12Content,
} from "./model";

export interface W12ExportInput { snapshot: SourceSnapshot; snapshotHash: string; capturedAt: string; content: W12Content; execOption: ExecOption }

const esc = (v: unknown) => String(v ?? "").replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;")).replace(/\r/g, "");
const block = (v: string | undefined) => (v && v.trim() ? esc(v.trim()) : "_Not written yet._");
const draftBanner = (draft: boolean) => (draft ? "> **DRAFT** — Final QA is not complete yet. Fix the missing items in the Week 12 builder and download again.\n\n" : "");
const sim = "> Fictional training scenario: Cloud Heights Identity Center (simulated). No real organisation, people or systems.\n";

export function buildWeek12Files(p: W12ExportInput): Record<string, string> {
  const c = normalizeContent(p.content);
  const s = p.snapshot;
  const { checks, ready } = computeQA(s, c, p.execOption);
  const draft = !ready;
  const name = c.report.analyst.trim() || "_Name not entered_";
  const refs = validRefs(s);
  const fmt = p.execOption === "written" ? "Written Executive Summary" : p.execOption === "video" ? "Video Executive Briefing" : "Not chosen yet";
  const files: Record<string, string> = {};

  files["week-12/README.md"] = `# Week 12 — Communications Capstone

**Portfolio Deliverable 5 — Technical Incident Report + Executive Communication**

${draftBanner(draft)}${sim}
- Analyst: ${esc(name)}
- Executive communication format: **${fmt}**
- Source: my Week 11 Lab 06 IAM Investigation Case File — [${WEEK11_CASE_FILE_PATH}](${WEEK11_CASE_FILE_PATH})${s.sourceComplete ? "" : " (**DRAFT SOURCE** when copied)"}
- Status: ${draft ? "DRAFT" : "Final QA complete"}

## Files
- [technical-incident-report.md](technical-incident-report.md) — the technical report, findings, recommendations and limitations
${p.execOption === "written" ? "- [executive-summary.md](executive-summary.md) — written summary for leadership\n" : p.execOption === "video" ? "- [video-briefing.md](video-briefing.md) — link and notes for my recorded briefing for leadership\n" : ""}- [source/week11-source-manifest.json](source/week11-source-manifest.json) — which Week 11 source this was built from

## Final QA
${checks.map((x) => `- [${x.ok ? "x" : " "}] ${x.label}`).join("\n")}

Week 12 transforms the Week 11 investigation into professional communication. It does not re-investigate or add new incident facts. Evidence stays in \`week-11/\` and is referenced, not copied.
`;

  const findings = c.findings.map((f, i) => {
    const ok = f.evidenceRefs.filter((r) => refs.has(r));
    const bad = f.evidenceRefs.filter((r) => !refs.has(r));
    return `### Finding ${i + 1} (${esc(f.key)})${f.confidence ? ` — confidence: ${f.confidence}` : ""}

${block(f.statement)}

- Evidence / events: ${ok.length ? ok.map(esc).join(", ") : "_none linked_"}${bad.length ? ` (not found in Week 11 source: ${bad.map(esc).join(", ")})` : ""}
- Uncertainty: ${block(f.uncertainty)}
`;
  }).join("\n");

  const recs = c.recommendations.map((r, i) => `### Recommendation ${i + 1} (${esc(r.key)})

- **What:** ${block(r.action)}
- **Who:** ${block(r.owner)}
- **Why:** ${block(r.why)}
- **Priority:** ${r.priority || "_not set_"}
- **Timeframe:** ${block(r.timeframe)}
- **Linked findings:** ${r.linkedFindings.length ? r.linkedFindings.map(esc).join(", ") : "_none_"}
- **Success measure:** ${block(r.successMeasure)}
`).join("\n");

  const flags = coachFlags(c, p.execOption).filter((f) => f.reviewed);
  files["week-12/technical-incident-report.md"] = `# ${esc(c.report.title.trim() || "Technical Incident Report")}

${draftBanner(draft)}${sim}
- Analyst: ${esc(name)}
- Source case file: [${WEEK11_CASE_FILE_PATH}](${WEEK11_CASE_FILE_PATH})
- Evidence index: [${WEEK11_EVIDENCE_INDEX_PATH}](${WEEK11_EVIDENCE_INDEX_PATH})

## 1. Purpose / incident context
${block(c.report.purpose)}

## 2. Scope
${block(c.report.scope)}

## 3. Evidence reviewed
${block(c.report.evidenceReviewed)}

Evidence IDs (EV-…) and event IDs (S…, A…, C…) refer to records in my Week 11 evidence index; full evidence is not duplicated here.

## 4. Timeline
${block(c.report.timeline)}

## 5. Findings
${findings || "_No findings yet._"}
## 6. Impact / risk
${block(c.report.impact)}

## 7. Recommendations / next actions
${recs || "_No recommendations yet._"}
## 8. Limitations / unknowns
${block(c.report.limitations)}

## 9. Conclusion
${block(c.report.conclusion)}
${flags.length ? `
## Appendix — wording I checked against evidence
${flags.map((f) => `- "${f.term}" in ${esc(f.fieldLabel)}: ${esc(c.acks[f.id]!.trim())}`).join("\n")}
` : ""}`;

  if (p.execOption === "written") {
    const w = c.written;
    files["week-12/executive-summary.md"] = `# Executive Summary — Cloud Heights Identity Investigation

${draftBanner(draft)}${sim}
- Prepared by: ${esc(name)}
- Audience: Cloud Heights leadership
- Length: ${writtenWords(w)} words (target about 250–400)
- Full technical detail: [technical-incident-report.md](technical-incident-report.md)

## What happened?
${block(w.whatHappened)}

## Why does it matter?
${block(w.whyMatters)}

## What did we find?
${block(w.whatFound)}

## What should happen next?
${block(w.nextSteps)}
${w.uncertain.trim() ? `
## What remains uncertain
${block(w.uncertain)}
` : ""}`;
  } else if (p.execOption === "video") {
    const v = c.video;
    const d = parseDuration(v.duration);
    files["week-12/video-briefing.md"] = `# Video Executive Briefing — Cloud Heights Identity Investigation

${draftBanner(draft)}${sim}
- Presenter: ${esc(name)}
- Audience: Cloud Heights leadership
- Video link: ${v.url.trim() ? `<${esc(v.url.trim())}>` : "_not added_"}
- Platform: ${block(v.platform)}
- Duration: ${d === null ? block(v.duration) : `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`} (target about 2–3 minutes)
- Viewable by link (checked signed out): ${v.accessChecked ? "yes" : "not confirmed"}
- Full technical detail: [technical-incident-report.md](technical-incident-report.md)

## Outline / speaker notes
${block(v.outline)}

## Reflection — adapting the briefing for leadership
${block(v.reflection)}
`;
  }

  const cited = [...new Set(c.findings.flatMap((f) => f.evidenceRefs).filter((r) => refs.has(r)))].sort();
  files["week-12/source/week11-source-manifest.json"] = `${JSON.stringify({
    deliverable: "Portfolio Deliverable 5",
    executiveFormat: p.execOption || null,
    source: {
      path: "week-11/labs/lab-06-identity-investigation-case-file.md",
      attempt: s.sourceShortId,
      attemptStatusWhenCopied: s.sourceStatus,
      week11TextRevision: s.w11TextRevision,
      week11StateRevision: s.w11StateRevision,
      completeWhenCopied: s.sourceComplete,
      snapshotSha256: p.snapshotHash,
      copiedAt: p.capturedAt,
    },
    evidenceKeys: s.evidence.map((e) => e.key),
    referencesCited: cited,
    draft,
  }, null, 2)}\n`;

  // Exact path set per option.
  const want = week12Paths(p.execOption);
  return Object.fromEntries(want.map((k) => [k, files[k]!]));
}

export function buildWeek12Zip(p: W12ExportInput) {
  const files = buildWeek12Files(p);
  const draft = !computeQA(p.snapshot, p.content, p.execOption).ready;
  const zipped = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, [strToU8(v), { mtime: new Date("2026-01-01T00:00:00Z") }]])) as never);
  return { filename: week12ZipName(draft), draft, files: Object.keys(files), zipBase64: Buffer.from(zipped).toString("base64") };
}
