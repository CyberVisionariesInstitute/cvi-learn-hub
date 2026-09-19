import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ModeToggle, Panel, ProgressBar, SaveIndicator } from "./ui";
import { checklist } from "@/lib/week10/state";
import { casePacketMarkdown, WEEK10_ROUTES } from "@/lib/week10/case-packet";
import { lab1Report, lab2Report, portfolioReport } from "@/lib/week10/reports";
import { downloadText, type Week10Store } from "@/lib/week10/useWeek10";

const btn =
  "min-h-11 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/60";

export function Week10Toolbar({ store }: { store: Week10Store }) {
  const { state, status, setMode, resetWeek, restore, backupJson } = store;
  const [learner, setLearner] = useState("");
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
    try {
      const result = restore(JSON.parse(await file.text()));
      if (result.ok) {
        setRestoreProblems([]);
        setRestoreOk(true);
      } else {
        setRestoreProblems(result.problems);
      }
    } catch {
      setRestoreProblems(["That file is not readable as JSON. Choose the backup file you downloaded from this page."]);
    }
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
          <SaveIndicator status={status} />
        </div>
        <label className="mt-3 block text-sm">
          <span className="block font-medium text-foreground">
            Your name (used on your reports)
          </span>
          <input
            value={learner}
            onChange={(e) => setLearner(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
          />
        </label>
      </Panel>

      <Panel title="Downloads">
        <p className="text-sm text-muted-foreground">
          Reports contain your own writing only. Unfinished work is still downloadable and is
          clearly marked as a draft with a list of what is missing.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn}
            onClick={() => downloadText(`${prefix}-lab-1.md`, lab1Report(state, learner))}
          >
            Download Lab 1 report (Markdown)
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => downloadText(`${prefix}-lab-2.md`, lab2Report(state, learner))}
          >
            Download Lab 2 report (Markdown)
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              downloadText(`${prefix}-portfolio.md`, portfolioReport(state, learner))
            }
          >
            Download combined portfolio report
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => downloadText("week10-case-packet.md", casePacketMarkdown())}
          >
            Download case packet
          </button>
          <button type="button" className={btn} onClick={() => window.print()}>
            Print / save as PDF
          </button>
        </div>
        <p className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-foreground">
          <strong>How to hand this in:</strong> download your combined portfolio report, then
          submit the file in the CVI Tracker as instructed by your facilitator. Screenshots
          are optional and never required.
        </p>
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
            onClick={() => downloadText(`${prefix}-backup.json`, backupJson(), "application/json")}
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
