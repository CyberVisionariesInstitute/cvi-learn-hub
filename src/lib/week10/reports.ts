/**
 * Week 10 report generation.
 *
 * Reports contain the learner's own writing only. No instructor answer
 * material is imported here, so it cannot reach a student download.
 */

import { assets, evidenceById, scenarioDate } from "./case-packet";
import {
  band,
  bandLabels,
  checklist,
  score,
  wordCount,
  type Week10State,
} from "./state";

/** Escapes student text so it cannot break the Markdown table or inject markup. */
export function mdCell(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/([`*_{}[\]()#+\-!])/g, "\\$1")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

/** Escapes student text for block (non-table) use, keeping real line breaks. */
export function mdBlock(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([`*_{}[\]()#+!])/g, "\\$1")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function assetName(id: string): string {
  return assets.find((a) => a.id === id)?.name ?? id;
}

function evidenceLine(ids: string[]): string {
  if (!ids.length) return "(none selected)";
  return ids
    .map((id) => {
      const card = evidenceById(id);
      return card ? `${card.id} (${card.title})` : id;
    })
    .join("; ");
}

function ciaLine(cia: { confidentiality: boolean; integrity: boolean; availability: boolean }) {
  const parts: string[] = [];
  if (cia.confidentiality) parts.push("Confidentiality");
  if (cia.integrity) parts.push("Integrity");
  if (cia.availability) parts.push("Availability");
  return parts.length ? parts.join(", ") : "(none selected)";
}

function header(state: Week10State, title: string, learner: string): string[] {
  const missing = checklist(state).filter((c) => !c.done);
  const lines = [
    `# ${title}`,
    "",
    `Learner: ${mdBlock(learner) || "(name not recorded)"}`,
    `Case: Cloud Heights Family Clinic — Risk & Threat Investigation`,
    `Scenario date: ${scenarioDate}`,
    `Report generated: ${new Date().toISOString()}`,
    `Study mode: ${state.mode === "guided" ? "Guided (hints available)" : "Independent (hints hidden)"}`,
    "",
  ];
  if (missing.length) {
    lines.push("> **DRAFT — this report is incomplete.** Still to finish:");
    missing.forEach((m) => lines.push(`> - ${m.label}`));
    lines.push("");
  } else {
    lines.push("Completion checklist: all required work is present.");
    lines.push("");
  }
  return lines;
}

export function lab1Report(state: Week10State, learner = ""): string {
  const lines = header(state, "Week 10 — Lab 1: Investigate What Needs Protection", learner);

  lines.push("## Evidence added to my findings");
  if (!state.findings.length) lines.push("(no evidence added yet)");
  state.findings.forEach((id) => {
    const card = evidenceById(id);
    lines.push(`- ${id} — ${card ? card.title : "(evidence no longer in the case packet)"}`);
  });
  lines.push("");

  lines.push("## My investigation notebook");
  lines.push(mdBlock(state.notebook) || "(empty)");
  lines.push("");

  lines.push("## Risk scenarios");
  lines.push("");
  lines.push(
    "| ID | Asset | Evidence | Threat / event | Vulnerability | Consequence | CIA | Unknown / question |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  state.scenarios.forEach((s) => {
    lines.push(
      `| ${s.id} | ${mdCell(assetName(s.assetId))} | ${mdCell(evidenceLine(s.evidenceIds))} | ${mdCell(s.threat)} | ${mdCell(s.vulnerability)} | ${mdCell(s.consequence)} | ${mdCell(ciaLine(s.cia))} | ${mdCell(s.unknown)} |`,
    );
  });
  lines.push("");

  lines.push("## Email analysis");
  state.email.signs.forEach((sign, i) => {
    lines.push(`${i + 1}. ${mdBlock(sign) || "(not answered)"}`);
  });
  lines.push("");
  lines.push(`**Safe response / reporting step:** ${mdBlock(state.email.safeStep) || "(not answered)"}`);
  lines.push("");
  lines.push(
    `**Suspicious vs proven:** ${mdBlock(state.email.proofNote) || "(not answered)"}`,
  );
  lines.push("");
  return lines.join("\n");
}

export function lab2Report(state: Week10State, learner = ""): string {
  const lines = header(state, "Week 10 — Lab 2: Prioritize Risks and Recommend Controls", learner);

  lines.push("## Risk ratings");
  lines.push("");
  lines.push(
    "| ID | Asset | Likelihood | Why | Impact | Why | Score (L x I) | Classroom band |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  state.scenarios.forEach((s) => {
    const r = state.ratings.find((x) => x.scenarioId === s.id);
    if (!r) return;
    const value = score(r);
    lines.push(
      `| ${s.id} | ${mdCell(assetName(s.assetId))} | ${r.likelihood || "—"} | ${mdCell(r.likelihoodWhy)} | ${r.impact || "—"} | ${mdCell(r.impactWhy)} | ${value || "—"} | ${bandLabels[band(value)]} |`,
    );
  });
  lines.push("");
  lines.push(
    "Bands (1–2 low, 3–4 medium, 6–9 high) are a classroom teaching aid, not a compliance standard.",
  );
  lines.push("");

  lines.push("## Priority risks");
  if (!state.priorities.length) lines.push("(none chosen yet)");
  state.priorities.forEach((id) => {
    const s = state.scenarios.find((x) => x.id === id);
    lines.push(`- ${id} — ${mdBlock(s ? assetName(s.assetId) : "(removed)")}`);
  });
  lines.push("");
  lines.push(`**Why these:** ${mdBlock(state.priorityWhy) || "(not answered)"}`);
  lines.push("");

  lines.push("## Recommended controls");
  if (!state.controls.length) lines.push("(none recorded yet)");
  state.controls.forEach((c) => {
    lines.push(`### ${c.scenarioId}`);
    lines.push(`- **Control:** ${mdBlock(c.control) || "(not answered)"}`);
    lines.push(`- **How it helps:** ${mdBlock(c.howItHelps) || "(not answered)"}`);
    lines.push(`- **Risk remaining afterwards:** ${mdBlock(c.residual) || "(not answered)"}`);
    lines.push("");
  });

  lines.push("## Owner briefing");
  lines.push(`Word count: ${wordCount(state.briefing)} (guide: 100–150)`);
  lines.push("");
  lines.push(mdBlock(state.briefing) || "(not written yet)");
  lines.push("");
  return lines.join("\n");
}

export function portfolioReport(state: Week10State, learner = ""): string {
  return [
    "# Week 10 — Cloud Heights Family Clinic: Full Portfolio Report",
    "",
    "This report combines Lab 1 and Lab 2. It contains only your own work.",
    "",
    "---",
    "",
    lab1Report(state, learner),
    "",
    "---",
    "",
    lab2Report(state, learner),
    "",
  ].join("\n");
}
