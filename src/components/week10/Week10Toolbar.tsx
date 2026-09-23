import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ModeToggle, Panel, ProgressBar, SaveIndicator } from "./ui";
import { checklist, validate } from "@/lib/week10/state";
import { casePacketMarkdown, WEEK10_ROUTES } from "@/lib/week10/case-packet";
import { lab1Report, lab2Report, portfolioReport } from "@/lib/week10/reports";
import { downloadText, type Week10Store } from "@/lib/week10/useWeek10";

const btn =
  "min-h-11 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/60";

export function Week10Toolbar({ store }: { store: Week10Store }) {
  const { state, status, saveError, setMode, resetWeek, restore, backupJson, flush, update } = store;
  const learner = state.learnerName;
  const [pendingRestore, setPendingRestore] = useState<{ raw: unknown; fileName: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [restoreProblems, setRestoreProblems] = useState<string[]>([]);
  const [restoreOk, setRestoreOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const items = checklist(state);
  const done = items.filter((i) => i.done).length;
  const isDemo = store.identity.kind === "instructor-demo";
  const prefix = isDemo ? "week10-INSTRUCTOR-DEMO" : "week10";

  async function onRestoreFile(file: File) {
    setRestoreOk(false);
    setPendingRestore(null);
    try {
      const raw: unknown = JSON.parse(await file.text());
      const check = validate(raw);
      if (!check.ok) {
        setRestoreProblems(check.problems);
        return;
      }
      setRestoreProblems([]);
      setPendingRestore({ raw, fileName: file.name });
    } catch {
      setRestoreProblems(["That file is not readable as JSON. Choose the backup file you downloaded from this page."]);
    }
  }

  function confirmRestore() {
    if (!pendingRestore) return;
    const result = restore(pendingRestore.raw);
    setPendingRestore(null);
    if (result.ok) {
      setRestoreProblems([]);
      setRestoreOk(true);
    } else {
      setRestoreProblems(result.problems);
    }
  }

  function downloadBackup() {
    flush();
    downloadText(`${prefix}-backup.json`, backupJson(), "application/json");
  }

  return (
    <div className="space-y-4">
      <Panel title="Your progress">
        {isDemo ? (
          <p className="mb-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
            Instructor demonstration slot. This work is stored separately from student work
            and every download is labelled as a demonstration.
          </p>
        ) : null}
        <ProgressBar done={done} total={items.length} label="Required work completed" />
        <ul className="mt-3 space-y-1">
          {items.map((i) => (
            <li key={i.id} className="text-sm text-foreground">
              <span aria-hidden="true">{i.done ? "✓" : "○"}</span>{" "}
              <span className="sr-only">{i.done ? "Done:" : "Still to do:"}</span>
              Lab {i.lab} — {i.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Completion means the required work is present. Nothing here grades your wording.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to={WEEK10_ROUTES.overview} className={btn}>
            Overview
          </Link>
          <Link to={WEEK10_ROUTES.lab1} className={btn}>
            Lab 1
          </Link>
          <Link to={WEEK10_ROUTES.lab2} className={btn}>
            Lab 2
          </Link>
        </div>
      </Panel>

      <Panel title="Study mode and saving">
        <ModeToggle mode={state.mode} onChange={setMode} />
        <div className="mt-3">
          <SaveIndicator status={status} error={saveError} />
        </div>
        <label className="mt-3 block text-sm">
          <span className="block font-medium text-foreground">
            Your name (used on your reports)
          </span>
          <input
            value={learner}
            maxLength={120}
            disabled={!store.ready}
            onChange={(e) => {
              const learnerName = e.target.value;
              update((prev) => ({ ...prev, learnerName }));
            }}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Saved with your Week 10 work on this browser/device and included in your JSON backup.
        </p>
      </Panel>

      <Panel title="Downloads">
        {!learner.trim() ? (
          <p className="mb-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
            Reminder: enter your name above before downloading, so your reports show who wrote
            them.
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Reports contain your own writing only. Unfinished work is still downloadable and is
          clearly marked as a draft with a list of what is missing.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => { flush(); downloadText(`${prefix}-lab-1.md`, lab1Report(state, learner)); }}
          >
            Download Lab 1 report (Markdown)
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => { flush(); downloadText(`${prefix}-lab-2.md`, lab2Report(state, learner)); }}
          >
            Download Lab 2 report (Markdown)
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => { flush(); downloadText(`${prefix}-portfolio.md`, portfolioReport(state, learner)); }}
          >
            Download combined portfolio report
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => downloadText("week10-case-packet.md", casePacketMarkdown(state.mode))}
          >
            Download case packet
          </button>
          <button type="button" className={btn} onClick={() => window.print()}>
            Print / save as PDF
          </button>
        </div>
        <SubmissionSteps />
      </Panel>

      <Panel title="Backup and restore (this browser only)">
        <p className="text-sm text-muted-foreground">
          Your work is saved on this browser/device. To move it to another computer, download
          the backup file here and restore it there. This is a file you carry, not automatic
          sync.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            onClick={downloadBackup}
          >
            Download JSON backup
          </button>
          <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
            Restore from backup file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onRestoreFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {pendingRestore ? (
          <div
            role="alertdialog"
            aria-labelledby="w10-restore-title"
            aria-describedby="w10-restore-desc"
            className="mt-3 rounded-md border border-amber/50 bg-amber/10 p-3"
          >
            <p id="w10-restore-title" className="text-sm font-medium text-foreground">
              Replace your current Week 10 work with “{pendingRestore.fileName}”?
            </p>
            <p id="w10-restore-desc" className="mt-1 text-sm text-foreground">
              The file checked out as a valid Week 10 backup. Restoring replaces your current
              answers, findings, ratings, controls, notebook and name with the file&apos;s
              contents. We recommend downloading a backup of your current work first.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={btn} onClick={downloadBackup}>
                Download current backup first
              </button>
              <button type="button" className={btn} onClick={confirmRestore}>
                Replace my work with this backup
              </button>
              <button type="button" className={btn} autoFocus onClick={() => setPendingRestore(null)}>
                Cancel — keep my current work
              </button>
            </div>
          </div>
        ) : null}
        <div aria-live="polite" className="mt-3">
          {restoreOk ? (
            <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
              Backup restored. Your work on this page now matches the file.
            </p>
          ) : null}
          {restoreProblems.length ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground">
              <p className="font-medium">This file was not restored:</p>
              <ul className="mt-1 space-y-1">
                {restoreProblems.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
              <p className="mt-1 text-muted-foreground">
                Nothing on this page was changed.
              </p>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel title="Reset Week 10">
        <p className="text-sm text-muted-foreground">
          This clears only your Week 10 work{isDemo ? " in the instructor demonstration slot" : ""}.
          Work from other weeks is untouched. Download a backup first if you might want it
          back.
        </p>
        {confirmReset ? (
          <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-foreground">
              Clear all Week 10 answers, findings and notes? This cannot be undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={btn}
                onClick={() => {
                  resetWeek();
                  setConfirmReset(false);
                }}
              >
                Yes, clear Week 10
              </button>
              <button type="button" className={btn} onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={`${btn} mt-3`} onClick={() => setConfirmReset(true)}>
            Reset Week 10 work
          </button>
        )}
      </Panel>
    </div>
  );
}

/** Shared, unambiguous GitHub portfolio upload instructions for Week 10. */
export function SubmissionSteps() {
  return (
    <div className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-foreground">
      <p className="font-medium">How to add your Week 10 reports to your GitHub portfolio</p>
      <ol className="mt-2 space-y-2">
        <li>
          1. Finish the lab here, check the required-work list and your reasoning, and enter or
          check your name above.
        </li>
        <li>
          2. Use <strong>Download Lab 1 report (Markdown)</strong> to get{" "}
          <span className="font-mono">week10-lab-1.md</span>, or{" "}
          <strong>Download Lab 2 report (Markdown)</strong> to get{" "}
          <span className="font-mono">week10-lab-2.md</span>.
        </li>
        <li>
          3. Open <strong>your own</strong> existing CyberFoundations student portfolio
          repository on GitHub — not the institute&apos;s template repository. Week 10 reports
          belong in the <span className="font-mono">week-10/labs/</span> folder, the same
          pattern as Week 8 (<span className="font-mono">week-08/labs/</span>) and Week 9 (
          <span className="font-mono">week-09/labs/</span>). The full destinations are{" "}
          <span className="font-mono">week-10/labs/week10-lab-1.md</span> and{" "}
          <span className="font-mono">week-10/labs/week10-lab-2.md</span>.
        </li>
        <li>
          4. If the <span className="font-mono">week-10/labs/</span> folder does not exist yet,
          create it once: from your repository&apos;s main page choose{" "}
          <strong>Add file → Create new file</strong>, type{" "}
          <span className="font-mono">week-10/labs/README.md</span> as the filename, add a short
          heading such as <span className="font-mono"># Week 10 Lab Reports</span>, and choose{" "}
          <strong>Commit changes</strong>. If the folder already exists, use it as it is —
          don&apos;t replace an existing README.
        </li>
        <li>
          5. Open the <span className="font-mono">week-10/labs/</span> folder, choose{" "}
          <strong>Add file → Upload files</strong>, select the matching downloaded{" "}
          <span className="font-mono">.md</span> report, check the filename and destination,
          type a meaningful commit message, and choose <strong>Commit changes</strong> (follow
          GitHub&apos;s confirmation if it asks).
        </li>
        <li>
          6. Open the committed file on GitHub and confirm your name and latest completed
          answers show. Downloading a report alone does not upload it to GitHub or submit it
          for grading.
        </li>
      </ol>
      <p className="mt-3 font-medium">Revising a report</p>
      <p className="mt-1 text-muted-foreground">
        Edit your answers here, download a fresh report, and keep the original filename
        (remove any &ldquo;(1)&rdquo; or &ldquo;(2)&rdquo; your browser added). Upload it to the
        same <span className="font-mono">week-10/labs/</span> folder under the same filename,
        check that you are updating the intended file, commit, then
        reopen it to verify. Do not delete your other work.
      </p>
      <ul className="mt-3 space-y-1 text-muted-foreground">
        <li>• Grading submission instructions will be provided separately.</li>
        <li>
          • The combined portfolio report is optional and does not replace the two individual
          reports.
        </li>
        <li>
          • The JSON backup only restores editable work in this demo — it is not a lab report
          to upload.
        </li>
        <li>• Screenshots are optional.</li>
      </ul>
    </div>
  );
}
