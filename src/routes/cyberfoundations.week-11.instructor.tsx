import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { supabase } from "@/integrations/supabase/client";
import { checkInstructorAccess } from "@/lib/demo-lab/instructor.functions";
import { getWeek11AttemptForInstructor, instructorResetWeek11, listWeek11Attempts, reviewWeek11 } from "@/lib/week11/week11.functions";
import { Badge, btn, btnPrimary, Card, input, TableWrap } from "@/components/week11/ui";
import { missions } from "@/lib/week11/seed";

export const Route = createFileRoute("/cyberfoundations/week-11/instructor")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Week 11 Instructor Console — Cloud Heights Identity Center" },
    { name: "description", content: "Staff-only review of Week 11 simulator attempts, evidence, reports and the protected answer key." },
    { property: "og:title", content: "Week 11 Instructor Console" },
    { property: "og:description", content: "Staff-only Week 11 review console." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: location.href } as never });
    try { await checkInstructorAccess({}); } catch { throw redirect({ to: "/cyberfoundations" }); }
  },
  component: Week11Instructor,
});

type List = Awaited<ReturnType<typeof listWeek11Attempts>>;
type Detail = Awaited<ReturnType<typeof getWeek11AttemptForInstructor>>;

function Week11Instructor() {
  const list = useServerFn(listWeek11Attempts);
  const get = useServerFn(getWeek11AttemptForInstructor);
  const review = useServerFn(reviewWeek11);
  const resetFn = useServerFn(instructorResetWeek11);
  const [rows, setRows] = useState<List>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [reason, setReason] = useState("");
  const load = () => list().then(setRows).catch((e: Error) => setMsg(e.message));
  useEffect(() => { void load(); }, []);
  const open = async (id: string) => { setMsg(null); setDetail(await get({ data: { attemptId: id } })); };
  const v = detail?.view;
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        <Card eyebrow="Staff only · server-authorized" title="Week 11 Instructor Console — Cloud Heights Identity Center">
          <p className="text-sm">Read-only view of learner attempts. Simulated roles (for example a student granting themselves Privileged Operator) have no effect here. No cohort roster exists in this project yet, so every authorized instructor sees all Week 11 attempts.</p>
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived attempts</label>
          {msg ? <p role="alert" className="mt-2 text-sm">{msg}</p> : null}
          <div className="mt-3"><TableWrap label="Attempts">
            <thead><tr className="border-b border-border"><th className="p-2">Learner</th><th className="p-2">Attempt</th><th className="p-2">Status</th><th className="p-2">Revision</th><th className="p-2">Last saved</th><th className="p-2"><span className="sr-only">Open</span></th></tr></thead>
            <tbody>{rows.filter((r) => showArchived || r.status === "active").map((r) => <tr key={r.id} className="border-b border-border/50"><td className="p-2">{r.learnerName || "—"} <span className="block text-xs text-muted-foreground">{r.email}</span></td><td className="p-2 font-mono">{r.shortId}</td><td className="p-2"><Badge>{r.status}</Badge></td><td className="p-2">{r.revision} / text {r.textRevision}</td><td className="p-2 text-xs">{new Date(r.updatedAt).toLocaleString()}</td><td className="p-2"><button type="button" className={btn} onClick={() => void open(r.id)}>Open</button></td></tr>)}
              {rows.length === 0 ? <tr><td className="p-2" colSpan={6}>No attempts yet.</td></tr> : null}</tbody>
          </TableWrap></div>
        </Card>
        {v && detail ? (
          <>
            <Card title={`Attempt ${v.shortId} · ${v.learner.displayName || "no name"} · ${v.status}`}>
              <ul className="grid gap-2 md:grid-cols-2">{v.readiness.map((r) => <li key={r.mission} className="rounded-md border border-border p-2 text-sm"><strong>{r.mission} {missions.find((m) => m.key === r.mission)?.title}</strong> {r.ready ? <Badge tone="allow">evidence-ready</Badge> : <Badge>{r.missing.length} missing</Badge>}{!r.ready ? <ul className="mt-1 list-disc pl-5 text-xs">{r.missing.slice(0, 6).map((x) => <li key={x}>{x}</li>)}</ul> : null}</li>)}</ul>
              <p className="mt-3 text-sm">Stuck indicators: {v.state.audits.filter((a) => a.result === "refused").length} refused actions · {v.state.tickets.filter((t) => t.status === "open").length} untouched tickets · {v.evidence.length} evidence captures.</p>
              <details className="mt-3"><summary className="cursor-pointer text-sm">Current directory state (read-only JSON)</summary><pre className="mt-1 max-h-96 overflow-auto whitespace-pre-wrap break-all rounded bg-terminal p-2 font-mono text-[0.7rem] text-terminal-foreground">{JSON.stringify({ accounts: v.state.accounts, memberships: v.state.memberships, assignments: v.state.assignments, sessions: v.state.sessions, tickets: v.state.tickets }, null, 2)}</pre></details>
              <details className="mt-2"><summary className="cursor-pointer text-sm">Learner writing, findings and report</summary><pre className="mt-1 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-surface p-2 text-xs">{JSON.stringify(v.learner, null, 2)}</pre></details>
              <details className="mt-2"><summary className="cursor-pointer text-sm">Evidence ({v.evidence.length})</summary><ul className="mt-1 space-y-1 text-xs">{v.evidence.map((e) => <li key={e.evidence_key}>{e.slot} {e.evidence_key} — {e.title} (rev {e.captured_revision}) — caption: {v.learner.captions?.[e.evidence_key] || "none"}</li>)}</ul></details>
            </Card>
            <Card title="Protected answer key" eyebrow="Never sent to students">
              <ul className="space-y-2 text-sm">{detail.key.missions.map((m) => <li key={m.mission}><strong>{m.mission}:</strong> {m.expected} <em className="block text-muted-foreground">Feedback: {m.feedback}</em></li>)}</ul>
              <h3 className="mt-3 font-medium">Historical explanation</h3>
              <ul className="list-disc pl-5 text-sm">{detail.key.historical.map(([k, t]) => <li key={k}><span className="font-mono">{k}</span> — {t}</li>)}</ul>
              <p className="mt-2 text-sm">{detail.key.acceptAlternatives}</p>
              <h3 className="mt-3 font-medium">Common misconceptions</h3>
              <ul className="list-disc pl-5 text-sm">{detail.key.misconceptions.map(([k, t]) => <li key={k}><strong>{k}</strong> — {t}</li>)}</ul>
            </Card>
            <Card title="Review (rubric, proposed — subject to course grading policy)">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{detail.key.rubric.map((r) => <label key={r.id} className="block text-sm">{r.label} (/{r.points})<input type="number" min={0} max={r.points} className={input} value={scores[r.id] ?? ""} onChange={(e) => setScores({ ...scores, [r.id]: Math.min(r.points, Math.max(0, Number(e.target.value))) })} /></label>)}</div>
              <textarea className={`${input} mt-2`} rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} aria-label="Feedback" placeholder="Criterion-specific feedback" />
              <button type="button" className={`${btnPrimary} mt-2`} onClick={async () => { await review({ data: { attemptId: v.id, scores, feedback } }); setMsg("Review saved against the current text revision."); }}>Save review</button>
              {v.reviews.length ? <p className="mt-2 text-xs text-muted-foreground">{v.reviews.length} earlier review(s).</p> : null}
            </Card>
            {v.status === "active" ? <Card title="Reset this learner's attempt">
              <p className="text-sm">Archives the attempt (kept read-only) and creates a fresh seed copy. No other learner is touched; there is no cohort-wide reset.</p>
              <input className={`${input} mt-2`} placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button type="button" className={`${btn} mt-2`} disabled={reason.trim().length < 5} onClick={async () => { if (!confirm("Archive this attempt and start a fresh one for the learner?")) return; await resetFn({ data: { attemptId: v.id, reason, idempotencyKey: crypto.randomUUID(), confirm: "RESET" } }); setReason(""); setDetail(null); setMsg("Attempt reset."); void load(); }}>Reset with reason</button>
            </Card> : null}
          </>
        ) : null}
      </div>
    </DemoLabShell>
  );
}
