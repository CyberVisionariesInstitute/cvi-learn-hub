/** SERVER-ONLY: builds the frozen, student-safe Week 11 source snapshot for Week 12. */
import { createHash } from "node:crypto";
import { historicalAudit, historicalSignins, reportSections } from "@/lib/week11/seed";
import type { EvidenceRow, Learner } from "@/lib/week11/types";
import type { SourceSnapshot } from "./model";

export interface W11SourceRow {
  id: string; status: "active" | "archived"; archived_at: string | null; learner: Learner | null;
  text_revision: number; state_revision: number;
}

export const shortId = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

/**
 * Copies only the student's own writing and evidence metadata. Week 11
 * readiness logic is never copied — only the resulting student-facing
 * Lab 06 missing-item list (already visible to the student in Week 11).
 */
export function buildSnapshot(row: W11SourceRow, evidence: EvidenceRow[], m06: { ready: boolean; missing: string[] }): SourceSnapshot {
  const l = row.learner ?? {};
  const sections = l.report?.sections ?? {};
  return {
    version: 1,
    sourceShortId: shortId(row.id),
    sourceStatus: row.status,
    sourceArchivedAt: row.archived_at,
    studentName: (l.displayName ?? "").trim(),
    w11TextRevision: row.text_revision,
    w11StateRevision: row.state_revision,
    sourceComplete: m06.ready,
    sourceMissing: m06.missing.slice(0, 40),
    findings: (l.findings ?? []).map((f) => ({
      key: f.key, title: f.title ?? "", refs: (f.refs ?? []).map((r) => r.toUpperCase()), observation: f.observation ?? "", hypothesis: f.hypothesis ?? "",
      conclusion: f.conclusion ?? "", uncertainty: f.uncertainty ?? "", nextAction: f.nextAction ?? "", priority: f.priority ?? "", rationale: f.rationale ?? "",
    })),
    comparison: { refs: l.comparison?.refs ?? [], text: l.comparison?.text ?? "" },
    report: {
      sections: reportSections.map((title, i) => ({ n: i + 1, title, text: sections[String(i + 1)] ?? "" })),
      limitations: l.report?.limitations ?? "",
      liveChain: l.report?.liveChain ?? "",
    },
    captions: l.captions ?? {},
    evidence: evidence.map((e) => ({ key: e.evidence_key, slot: e.slot, mission: e.mission, title: e.title, capturedRevision: e.captured_revision, contentHash: e.content_hash })),
    historicalEventIds: [...historicalSignins, ...historicalAudit].map((r) => r.event_id),
    correlationIds: [...new Set([...historicalSignins, ...historicalAudit].map((r) => r.correlation_id).filter(Boolean))],
  };
}

export const snapshotHash = (s: SourceSnapshot) => createHash("sha256").update(JSON.stringify(s)).digest("hex");

/** Compares the frozen snapshot with the student's current Week 11 source. */
export function detectSourceChange(
  frozen: { sourceId: string | null; textRevision: number; stateRevision: number },
  current: { id: string; status: "active" | "archived"; text_revision: number; state_revision: number; archived_at: string | null } | null,
): null | { kind: "edited" | "reset" | "archived"; detail: string } {
  if (!current) return null;
  if (frozen.sourceId && current.id !== frozen.sourceId) {
    return { kind: "reset", detail: `Your Week 11 attempt was reset (new attempt ${shortId(current.id)}). Week 12 still uses your earlier case file until you choose Refresh from Week 11.` };
  }
  if (current.status === "archived") return { kind: "archived", detail: `Your Week 11 source attempt is archived${current.archived_at ? ` (${current.archived_at.slice(0, 10)})` : ""}. Week 12 uses its most recent saved case file.` };
  if (current.text_revision !== frozen.textRevision || current.state_revision !== frozen.stateRevision) {
    return { kind: "edited", detail: "Your Week 11 case file changed after Week 12 copied it. Your Week 12 writing is safe; choose Refresh from Week 11 if you want the newer source." };
  }
  return null;
}
