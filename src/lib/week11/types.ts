import type { SimState } from "./engine";

export interface Finding {
  key: string; title: string; refs: string[]; observation: string; hypothesis: string;
  conclusion: string; uncertainty: string; nextAction: string; priority: "" | "high" | "medium" | "low"; rationale: string;
}

export interface Learner {
  displayName?: string;
  missions?: Record<string, { answers?: Record<string, string>; trace?: Record<string, string> }>;
  captions?: Record<string, string>;
  findings?: Finding[];
  comparison?: { refs: string[]; text: string };
  report?: { sections?: Record<string, string>; managerSummary?: string; limitations?: string; liveChain?: string };
}

export interface EvidenceRow {
  evidence_key: string; slot: string; mission: string; title: string;
  snapshot: unknown; content_hash: string; captured_revision: number; created_at: string;
}

export interface AttemptView {
  id: string; shortId: string; status: "active" | "archived"; revision: number; textRevision: number;
  seedVersion: string; state: SimState; learner: Learner; evidence: EvidenceRow[];
  readiness: { mission: string; ready: boolean; missing: string[] }[];
  updatedAt: string; archived: { id: string; archivedAt: string | null }[];
  reviews: { feedback: string; scores: Record<string, number>; created_at: string }[];
}
