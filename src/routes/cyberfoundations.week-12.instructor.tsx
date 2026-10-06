import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { supabase } from "@/integrations/supabase/client";
import { checkInstructorAccess } from "@/lib/demo-lab/instructor.functions";
import { getWeek12AttemptForInstructor, listWeek12Attempts, reviewWeek12, selectWeek12Presenter } from "@/lib/week12/week12.functions";
import { Badge, btn, btnPrimary, Card, input, TableWrap } from "@/components/week11/ui";
import { coachFlags, computeQA, RUBRIC, RUBRIC_MAX, validRefs, writtenWords, type Week12View } from "@/lib/week12/model";

export const Route = createFileRoute("/cyberfoundations/week-12/instructor")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Week 12 Instructor Console — Communications Capstone" },
    { name: "description", content: "Staff-only review of Week 12 Technical Incident Reports and executive communications." },
    { property: "og:title", content: "Week 12 Instructor Console" },
    { property: "og:description", content: "Staff-only Week 12 review console." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: location.href } as never });
    try { await checkInstructorAccess({}); } catch { throw redirect({ to: "/cyberfoundations" }); }
  },
  component: Week12Instructor,
});

type List = Awaited<ReturnType<typeof listWeek12Attempts>>;

function Week12Instructor() {
  const list = useServerFn(listWeek12Attempts);
  const get = useServerFn(getWeek12AttemptForInstructor);
  const review = useServerFn(reviewWeek12);
  const select = useServerFn(selectWeek12Presenter);
  const [rows, setRows] = useState<List>([]);
  const [detail, setDetail] = useState<Week12View | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const load = () => list().then(setRows).catch((e: Error) => setMsg(e.message));
  useEffect(() => { void load(); }, []);
  const open = async (id: string) => { setMsg(null); setScores({}); setFeedback(""); setDetail(await get({ data: { attemptId: id } })); };
  const selectedCount = rows.filter((r) => r.presenterSelected).length;
  const toggleSel = async (id: string, sel: boolean) => {
    try { await select({ data: { attemptId: id, selected: sel } }); setMsg(sel ? "Presenter selected." : "Presenter unselected."); await load(); }
    catch (e) { setMsg((e as Error).message); }
  };
  const d = detail;
  const qa = d ? computeQA(d.snapshot, d.content, d.execOption) : null;
  const refs = d ? validRefs(d.snapshot) : new Set<string>();
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        <Card eyebrow="Staff only · server-authorized" title="Week 12 Instructor Console — Communications Capstone">
          <p className="text-sm">Read-only view of student work. Written and video options use the same rubric. Live-presentation selection (max 2) is separate from scores and readiness. No cohort roster exists yet, so every authorized instructor sees all Week 12 attempts.</p>
          {msg ? <p role="status" className="mt-2 text-sm">{msg}</p> : null}
          <div className="mt-3"><TableWrap label="Week 12 attempts">
            <thead><tr className="border-b border-border"><th className="p-2">Learner</th><th className="p-2">Format</th><th className="p-2">Status</th><th className="p-2">Last saved</th><th className="p-2">Reviewed</th><th className="p-2">Volunteer</th><th className="p-2"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="p-2">{r.learnerName || "—"}<span className="block text-xs text-muted-foreground">{r.email ?? ""}</span></td>
                <td className="p-2">{r.execOption || "—"}</td>
                <td className="p-2">{r.ready ? <Badge tone="allow">Ready</Badge> : <Badge tone="warn">DRAFT</Badge>}</td>
                <td className="p-2 text-xs">{new Date(r.updatedAt).toLocaleString()}</td>
                <td className="p-2">{r.reviewed ? "Yes" : "No"}</td>
                <td className="p-2 text-xs">{r.volunteerStatus === "volunteered" ? (
                  <label className="flex items-center gap-1"><input type="checkbox" checked={r.presenterSelected} disabled={!r.presenterSelected && selectedCount >= 2} onChange={(e) => void toggleSel(r.id, e.target.checked)} /> Select to present</label>
                ) : r.volunteerStatus}</td>
                <td className="p-2"><button type="button" className={btn} onClick={() => void open(r.id)}>Open</button></td>
              </tr>
            ))}{rows.length === 0 ? <tr><td colSpan={7} className="p-2 text-sm text-muted-foreground">No Week 12 attempts yet.</td></tr> : null}</tbody>
          </TableWrap></div>
          <p className="mt-2 text-xs text-muted-foreground">Selected presenters: {selectedCount} of 2.</p>
        </Card>

        {d && qa ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Week 11 source snapshot" eyebrow={`Attempt ${d.snapshot.sourceShortId} · ${d.snapshot.sourceComplete ? "complete" : "DRAFT SOURCE"}`}>
              {d.sourceChange ? <p className="mb-2 text-xs">Source note: {d.sourceChange.detail}</p> : null}
              <div className="space-y-2 text-sm">
                {d.snapshot.findings.map((f) => <div key={f.key} className="rounded-md border border-border p-2"><p className="font-medium">{f.key} · {f.title} <span className="font-mono text-xs">{f.refs.join(", ")}</span></p><p className="whitespace-pre-wrap text-xs">{f.observation}</p><p className="whitespace-pre-wrap text-xs"><strong>Conclusion:</strong> {f.conclusion}</p></div>)}
                <p className="whitespace-pre-wrap text-xs"><strong>Comparison:</strong> {d.snapshot.comparison.text || "—"}</p>
                <p className="whitespace-pre-wrap text-xs"><strong>Limitations:</strong> {d.snapshot.report.limitations || "—"}</p>
                <p className="text-xs"><strong>Evidence:</strong> {d.snapshot.evidence.map((e) => e.key).join(", ") || "—"}</p>
              </div>
            </Card>
            <Card title={d.content.report.title || "Technical Incident Report"} eyebrow={`${d.content.report.analyst || "No name"} · ${d.execOption || "no format chosen"}`}>
              <div className="space-y-2 text-sm">
                {(["purpose", "scope", "evidenceReviewed", "timeline", "impact", "limitations", "conclusion"] as const).map((k) => <p key={k} className="whitespace-pre-wrap break-words text-xs"><strong>{k}:</strong> {d.content.report[k] || "—"}</p>)}
                <h3 className="font-medium">Findings</h3>
                {d.content.findings.map((f) => <div key={f.key} className="rounded-md border border-border p-2 text-xs"><p className="whitespace-pre-wrap">{f.key}: {f.statement}</p><p className="mt-1 flex flex-wrap gap-1">{f.evidenceRefs.map((r) => <Badge key={r} tone={refs.has(r) ? "allow" : "deny"}>{refs.has(r) ? "✓" : "✕"} {r}</Badge>)}</p></div>)}
                <h3 className="font-medium">Recommendations</h3>
                {d.content.recommendations.map((r) => <p key={r.key} className="whitespace-pre-wrap text-xs">{r.key}: {r.action} — {r.owner}, {r.priority}, {r.timeframe}; links {r.linkedFindings.join(", ")}; success: {r.successMeasure}</p>)}
                <h3 className="font-medium">Executive communication</h3>
                {d.execOption === "written" ? <div className="text-xs"><p>{writtenWords(d.content.written)} words</p>{Object.entries(d.content.written).map(([k, x]) => <p key={k} className="whitespace-pre-wrap"><strong>{k}:</strong> {x || "—"}</p>)}</div> : null}
                {d.execOption === "video" ? <div className="text-xs"><p>{/^https:\/\//.test(d.content.video.url) ? <a className="underline" href={d.content.video.url} target="_blank" rel="noopener noreferrer">Open video link</a> : "No valid link"} · {d.content.video.platform} · {d.content.video.duration} · access checked: {d.content.video.accessChecked ? "yes" : "no"}</p><p className="whitespace-pre-wrap"><strong>Outline:</strong> {d.content.video.outline}</p><p className="whitespace-pre-wrap"><strong>Reflection:</strong> {d.content.video.reflection}</p></div> : null}
                <h3 className="font-medium">Coaching flags</h3>
                <ul className="text-xs">{coachFlags(d.content, d.execOption).map((f) => <li key={f.id}>{f.reviewed ? "✓" : "◌"} "{f.term}" in {f.fieldLabel}{f.reviewed ? ` — ${d.content.acks[f.id]}` : ""}</li>)}</ul>
                <h3 className="font-medium">QA</h3>
                <ul className="text-xs">{qa.checks.map((x) => <li key={x.id}>{x.ok ? "✓" : "◌"} {x.label}</li>)}</ul>
              </div>
            </Card>
            <Card title="Review" className="lg:col-span-2" eyebrow={`Same rubric for written and video · 0–${RUBRIC_MAX} each`}>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{RUBRIC.map((r) => (
                <label key={r.key} className="block text-sm">{r.label}<input type="number" min={0} max={RUBRIC_MAX} className={`${input} mt-1`} value={scores[r.key] ?? ""} onChange={(e) => setScores((s) => ({ ...s, [r.key]: Math.max(0, Math.min(RUBRIC_MAX, Number(e.target.value))) }))} /></label>
              ))}</div>
              <label className="mt-3 block text-sm">Feedback<textarea className={`${input} mt-1`} rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></label>
              <button type="button" className={`${btnPrimary} mt-2`} onClick={async () => { try { await review({ data: { attemptId: d.id, scores, feedback } }); setMsg("Review saved."); await load(); } catch (e) { setMsg((e as Error).message); } }}>Save review</button>
              {d.reviews.length ? <div className="mt-3 text-xs"><p className="font-medium">Previous reviews</p>{d.reviews.map((r) => <p key={r.created_at}>{new Date(r.created_at).toLocaleString()}: {Object.entries(r.scores).map(([k, x]) => `${k} ${x}`).join(", ")} — {r.feedback}</p>)}</div> : null}
            </Card>
          </div>
        ) : null}
      </div>
    </DemoLabShell>
  );
}
