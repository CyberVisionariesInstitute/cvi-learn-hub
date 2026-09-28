import { useState } from "react";
import { missions, type MissionId } from "@/lib/week11/seed";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge, btn, btnPrimary, Card } from "./ui";

const fileOf = (path: string) => path.split("/").pop()!;

/** Week 11 student downloads + GitHub handoff (mirrors the Week 10 Downloads pattern). */
export function DownloadsView({ store, afterZip }: { store: Week11Store; afterZip?: string }) {
  const v = store.view!;
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const name = store.learner.displayName?.trim();
  const allReady = v.readiness.every((r) => r.ready);

  const lab = async (key: MissionId) => {
    setBusy(key);
    try { const r = await store.exportLab(key); setStatus(`Downloaded ${r.filename}${r.draft ? " (DRAFT)" : ""}.`); }
    catch (e) { setStatus(`Download failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };
  const zip = async () => {
    setBusy("zip");
    try { const r = await store.exportZip(); setStatus(`Downloaded ${r.filename} (${r.files.length} files).${afterZip ? ` ${afterZip}` : ""}`); }
    catch (e) { setStatus(`Download failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <Card eyebrow="Download is not submission" title="Download & GitHub">
        {!name ? <p className="mb-3 rounded-md border border-amber/60 bg-amber/10 p-2 text-sm" role="note">Reminder: enter your name on the Dashboard before downloading, so your files show who wrote them.</p> : null}
        <p className="text-sm">Your files are built from your saved simulator work — answers, evidence captions, findings and Case File. You don't need to copy anything by hand. Unfinished labs still download and are marked <strong>DRAFT</strong> inside the file, with the missing items listed.</p>
        <p className="mt-2 text-sm"><strong>Recommended:</strong> download the complete ZIP at the end. Single-lab files are for adding labs to GitHub as you finish them.</p>
        <button type="button" className={`${btnPrimary} mt-3 w-full sm:w-auto`} disabled={busy !== null} onClick={zip}>{busy === "zip" ? "Preparing…" : "Download complete Week 11 ZIP"}</button>
        <p className="mt-1 text-xs text-muted-foreground">File name: <span className="font-mono">week-11-portfolio{allReady ? "" : "-DRAFT"}.zip</span></p>
        <p className="mt-2 min-h-5 text-sm" role="status" aria-live="polite">{status}</p>
      </Card>

      <Card title="Your six lab files" eyebrow="Status comes from required work being present — not a grade">
        <ul className="grid gap-2">
          {missions.map((m) => {
            const r = v.readiness.find((x) => x.mission === m.key);
            return (
              <li key={m.key} className="grid min-w-0 gap-2 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.lab} · {m.title}</p>
                  <p className="break-all font-mono text-xs text-muted-foreground">{fileOf(m.exportPath)}</p>
                  <p className="mt-1">{r?.ready ? <Badge tone="allow">✓ Evidence-ready</Badge> : <Badge tone="warn">DRAFT · {r?.missing.length ?? 0} item(s) missing</Badge>}</p>
                  {!r?.ready && r?.missing.length ? (
                    <details className="mt-1 text-xs"><summary className="cursor-pointer">What's missing</summary>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5">{r.missing.map((x) => <li key={x}>{x}</li>)}</ul>
                    </details>
                  ) : null}
                </div>
                <button type="button" className={`${btn} shrink-0 text-xs`} disabled={busy !== null} onClick={() => lab(m.key)}>{busy === m.key ? "Preparing…" : `Download ${m.lab} (Markdown)`}</button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Lab 06 is the IAM Investigation Case File (Portfolio Deliverable 4) — a technical case file. Week 12 uses it as source material for the professional report and presentation.</p>
      </Card>

      <Card title="How to add your Week 11 work to your GitHub portfolio">
        <ol className="space-y-2 text-sm">
          <li>1. Finish your work here, check the missing-items list above, and check your name on the Dashboard.</li>
          <li>2. Use <strong>Download complete Week 11 ZIP</strong> and unzip it. Keep the folder structure.</li>
          <li>3. Open <strong>your own</strong> existing CyberFoundations portfolio repository on GitHub — not the institute's template repository. Week 11 files belong in <span className="font-mono">week-11/labs/</span>, the same pattern as <span className="font-mono">week-10/labs/</span>.</li>
          <li>4. If <span className="font-mono">week-11/labs/</span> doesn't exist yet, choose <strong>Add file → Create new file</strong>, type <span className="font-mono">week-11/labs/README.md</span>, add a heading such as <span className="font-mono"># Week 11 Lab Reports</span>, and <strong>Commit changes</strong>. (The ZIP also contains this README.)</li>
          <li>5. Open <span className="font-mono">week-11/labs/</span>, choose <strong>Add file → Upload files</strong>, drag in the six <span className="font-mono">lab-0X-….md</span> files and the <span className="font-mono">evidence</span> folder, write a descriptive commit message and choose <strong>Commit changes</strong>.</li>
          <li>6. Upload <span className="font-mono">week-11/README.md</span> into <span className="font-mono">week-11/</span>.</li>
          <li>7. Open the committed files and check your name and latest answers appear. Don't delete other weeks' work.</li>
        </ol>
        <details className="mt-3 text-sm"><summary className="cursor-pointer">Full folder layout</summary>
          <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-2 font-mono text-xs">{`week-11/
  README.md
  labs/
    README.md
${missions.map((m) => `    ${fileOf(m.exportPath)}`).join("\n")}
    evidence/
      week11-evidence-index.md
      week11-evidence.json
      historical-signins.tsv
      historical-audit.tsv
      simulator-activity.json
      export-manifest.json`}</pre>
        </details>
        <p className="mt-3 text-xs text-muted-foreground">Downloading does not upload anything, and uploading to GitHub does not submit for grading — grading submission instructions are provided separately. Screenshots are optional.</p>
      </Card>
    </div>
  );
}
