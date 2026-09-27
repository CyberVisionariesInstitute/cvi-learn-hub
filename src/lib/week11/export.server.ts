/** SERVER-ONLY GitHub portfolio export (spec 10.4). No answer keys, no platform IDs. */
import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { historicalAudit, historicalAuditTsv, historicalSignins, historicalSigninsTsv, missions, reportSections, SEED_VERSION, SIMULATION_BANNER, AUDIT_FIELDS, SIGNIN_FIELDS } from "./seed";
import type { SimState } from "./engine";
import type { EvidenceRow, Learner } from "./types";
import type { MissionReadiness } from "./readiness.server";

const esc = (v: unknown) => String(v ?? "").replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;")).replace(/\r/g, "");
const block = (v: string | undefined) => (v && v.trim() ? esc(v.trim()) : "_Not written yet._");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export function buildExport(p: { attemptLabel: string; revision: number; textRevision: number; state: SimState; learner: Learner; evidence: EvidenceRow[]; readiness: MissionReadiness[] }) {
  const { learner, evidence, readiness, state } = p;
  const name = esc(learner.displayName?.trim() || "(name not entered)");
  const allReady = readiness.every((r) => r.ready);
  const draft = (m: string) => !readiness.find((r) => r.mission === m)?.ready;
  const header = (title: string, m?: string) =>
    `# ${title}\n\n**Learner:** ${name}  \n**Attempt:** ${p.attemptLabel} · seed ${SEED_VERSION} · state revision ${p.revision} · text revision ${p.textRevision}\n\n> ${SIMULATION_BANNER}\n\n${m && draft(m) ? `> **DRAFT — incomplete.** Missing:\n${readiness.find((r) => r.mission === m)!.missing.map((x) => `> - ${esc(x)}`).join("\n")}\n\n` : ""}`;
  const evList = (m: string) => {
    const rows = evidence.filter((e) => e.mission === m);
    return rows.length ? rows.map((e) => `- **${e.slot} · ${e.evidence_key}** — ${esc(e.title)} (captured at revision ${e.captured_revision})  \n  _What this proves:_ ${block(learner.captions?.[e.evidence_key])}  \n  See [evidence index](evidence/week11-evidence-index.md#${e.evidence_key.toLowerCase()})`).join("\n") : "_No evidence captured yet._";
  };
  const files: Record<string, string> = {};
  for (const m of missions) {
    let body = header(`${m.lab} — ${m.title}`, m.key) + `## Objective\n\n${m.objective}\n\n## My answers\n\n`;
    body += m.questions.map((qq) => `### ${esc(qq.label)}\n\n${block(learner.missions?.[m.key]?.answers?.[qq.id])}\n`).join("\n");
    if (m.key === "M01") {
      const tr = learner.missions?.["M01"]?.trace ?? {};
      body += `\n## Directory trace\n\n| Concept | Object |\n|---|---|\n${Object.entries(tr).map(([k, v]) => `| ${esc(k)} | ${esc(v)} |`).join("\n")}\n`;
    }
    if (m.key === "M06") {
      body += `\n## IAM Investigation Case File (Portfolio Deliverable 4)\n\n_This is a technical case file. Week 12 uses it as source material to produce the professional Technical Incident Report and Executive Summary and to finalize and present the portfolio._\n\n`;
      reportSections.forEach((title, i) => {
        body += `### ${i + 1}. ${title}\n\n${block(learner.report?.sections?.[String(i + 1)])}\n\n`;
        if (i === 8) (learner.findings ?? []).forEach((f, n) => {
          body += `#### Finding ${n + 1}: ${esc(f.title)}\n\n- **Events:** ${f.refs.map(esc).join(", ") || "none"}\n- **Observation:** ${block(f.observation)}\n- **Hypothesis:** ${block(f.hypothesis)}\n- **Supported conclusion:** ${block(f.conclusion)}\n- **Uncertainty / missing information:** ${block(f.uncertainty)}\n- **Next action:** ${block(f.nextAction)}\n- **Priority:** ${esc(f.priority || "not set")} — ${block(f.rationale)}\n\n`;
        });
        if (i === 9) body += `**Benign/ambiguous comparison** (${(learner.comparison?.refs ?? []).map(esc).join(", ")}): ${block(learner.comparison?.text)}\n\n**Live simulator chain (current attempt, not historical):** ${block(learner.report?.liveChain)}\n\n`;
      });
      body += `### Explicit simulation/environment limitations\n\n${block(learner.report?.limitations)}\n\n### Earlier labs\n\n${missions.slice(0, 5).map((x) => `- [${x.lab}](${x.exportPath.split("/").pop()})`).join("\n")}\n`;
    }
    body += `\n## Evidence\n\n${evList(m.key)}\n`;
    files[m.exportPath] = body;
  }
  files["week-11/README-week11-root.md"] = header("Week 11 — IAM & Active Directory: Who Gets Access to What?") + `Browser-based simulated AD/IAM administration in Cloud Heights Identity Center. No real domain, tenant or Azure subscription was configured.\n\nLab 06 is the **IAM Investigation Case File (Portfolio Deliverable 4)** — a technical case file. Week 12 uses it as source material for the professional Technical Incident Report and Executive Summary and the final portfolio presentation.\n\n${missions.map((m) => `- [${m.lab}: ${m.title}](labs/${m.exportPath.split("/").pop()})`).join("\n")}\n\nStatus: ${allReady ? "all six missions evidence-ready" : "**DRAFT** — some missions incomplete"}.\n`;
  files["week-11/labs/README-week11-submissions.md"] = `# Week 11 submission guide\n\n1. Unzip this export. Keep the folder structure.\n2. Open **your own** CyberFoundations portfolio repository on GitHub (not the template).\n3. Go into (or create) \`week-11/labs/\`. Use **Add file → Upload files**, drag in the six lab files and the \`evidence/\` folder, preview the changes, write a descriptive commit message and choose **Commit changes**.\n4. Upload \`week-11/README-week11-root.md\` to \`week-11/\`.\n5. Open the committed files and check your name and latest answers appear.\n\nDownloading or uploading does not submit anything for grading. Grading submission instructions are provided separately. Screenshots are optional (\`assets/screenshots/week-11/\`). Don't delete other weeks' work.\n`;
  const evJson = evidence.map((e) => ({ id: e.evidence_key, slot: e.slot, mission: e.mission, title: e.title, captured_revision: e.captured_revision, content_hash: e.content_hash, origin: "simulator_capture", caption: learner.captions?.[e.evidence_key] ?? "", snapshot: e.snapshot }));
  files["week-11/labs/evidence/week11-evidence.json"] = JSON.stringify(evJson, null, 2);
  files["week-11/labs/evidence/week11-evidence-index.md"] = `# Week 11 evidence index\n\nSimulator captures from ${p.attemptLabel}. Hash detects content changes; it is not proof of live AD administration.\n\n${evJson.map((e) => `## ${e.id}\n\n- Slot ${e.slot} · ${e.mission} · revision ${e.captured_revision}\n- ${esc(e.title)}\n- SHA-256 ${e.content_hash}\n- Caption: ${block(e.caption)}\n`).join("\n")}`;
  const refs = new Set([...(learner.findings ?? []).flatMap((f) => f.refs), ...(learner.comparison?.refs ?? [])]);
  const sel = (tsvAll: string, rows: Record<string, string>[], fields: readonly string[]) =>
    `# selection: records referenced in findings/comparison (${rows.filter((r) => refs.has(r['event_id']!)).length} of ${rows.length}); full dataset follows below the marker\n${fields.join("\t")}\n${rows.filter((r) => refs.has(r['event_id']!)).map((r) => fields.map((f) => r[f]).join("\t")).join("\n")}\n# full-dataset\n${tsvAll}`;
  files["week-11/labs/evidence/historical-signins.tsv"] = sel(historicalSigninsTsv, historicalSignins, SIGNIN_FIELDS);
  files["week-11/labs/evidence/historical-audit.tsv"] = sel(historicalAuditTsv, historicalAudit, AUDIT_FIELDS);
  files["week-11/labs/evidence/simulator-activity.json"] = JSON.stringify({ source: "LIVE — your simulated activity (fictional)", signins: state.signins, audits: state.audits, accessTests: state.tests }, null, 2);
  const manifest = { seed: SEED_VERSION, attempt: p.attemptLabel, state_revision: p.revision, text_revision: p.textRevision, exported_at: new Date().toISOString(), draft: !allReady, provenance: "Fictional Cloud Heights simulation. Historical records are fabricated; live records were produced by this attempt.", files: Object.entries(files).map(([path, c]) => ({ path, sha256: sha(c) })) };
  files["week-11/labs/evidence/export-manifest.json"] = JSON.stringify(manifest, null, 2);
  const zip = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])));
  return { zipBase64: Buffer.from(zip).toString("base64"), files: Object.keys(files), draft: !allReady };
}
