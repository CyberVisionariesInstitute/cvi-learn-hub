import { Link } from "@tanstack/react-router";
import { Panel, ProgressBar } from "./ui";
import {
  band,
  bandLabels,
  checklist,
  score,
  wordCount,
  type Week10State,
} from "@/lib/week10/state";
import {
  evidenceById,
  rooms,
  WEEK10_ROUTES,
} from "@/lib/week10/case-packet";
import type { Week10Store } from "@/lib/week10/useWeek10";

/**
 * Student-facing progress summary.
 *
 * Shows only the learner's own work: rooms opened, evidence they chose,
 * decisions they wrote, and what is still outstanding. No instructor answer
 * material, sample wording or grading is referenced here.
 */
export function CompletionSummary({ store }: { store: Week10Store }) {
  const state: Week10State = store.state;
  const items = checklist(state);
  const done = items.filter((i) => i.done).length;
  const remaining = items.filter((i) => !i.done);

  const findings = state.findings
    .map((id) => evidenceById(id))
    .filter((e): e is NonNullable<ReturnType<typeof evidenceById>> => Boolean(e));

  const emailSigns = state.email.signs.filter((s) => s.trim()).length;
  const briefingWords = wordCount(state.briefing);

  return (
    <Panel title="Your Week 10 summary">
      <p className="text-sm text-muted-foreground">
        This is a picture of your own work so far. Nothing here is graded, and no model
        answers are shown — it simply reflects what you have opened, chosen and written.
      </p>

      <div className="mt-4">
        <ProgressBar done={done} total={items.length} label="Required work completed" />
      </div>

      <div className="mt-5 grid gap-4 @3xl:grid-cols-2">
        <section>
          <h3 className="font-display text-sm text-foreground">Rooms you have visited</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {rooms.map((r) => {
              const visited = state.visitedRooms.includes(r.id);
              return (
                <li key={r.id}>
                  <span aria-hidden="true">{visited ? "✓" : "○"}</span>{" "}
                  <span className="sr-only">{visited ? "Visited:" : "Not opened yet:"}</span>
                  {r.name}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {state.visitedRooms.length} of {rooms.length} rooms opened.
          </p>
        </section>

        <section>
          <h3 className="font-display text-sm text-foreground">Evidence in your findings</h3>
          {findings.length ? (
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {findings.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-xs text-primary">{e.id}</span> {e.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              You have not added any evidence yet. Open a room and use “Add to my findings”.
            </p>
          )}
        </section>
      </div>

      <section className="mt-5">
        <h3 className="font-display text-sm text-foreground">Decisions you have recorded</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Your scenarios, with the evidence attached, your likelihood and impact ratings,
              your classroom band, and whether the scenario is one of your priorities.
            </caption>
            <thead>
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2 pr-3">Scenario</th>
                <th scope="col" className="py-2 pr-3">Evidence</th>
                <th scope="col" className="py-2 pr-3">Likelihood × impact</th>
                <th scope="col" className="py-2 pr-3">Band</th>
                <th scope="col" className="py-2">Priority &amp; control</th>
              </tr>
            </thead>
            <tbody>
              {state.scenarios.map((s, i) => {
                const rating = state.ratings.find((r) => r.scenarioId === s.id);
                const value = rating ? score(rating) : 0;
                const isPriority = state.priorities.includes(s.id);
                const control = state.controls.find((c) => c.scenarioId === s.id);
                return (
                  <tr key={s.id} className="border-t border-border align-top">
                    <th scope="row" className="py-2 pr-3 font-normal text-foreground">
                      {i + 1}. <span className="font-mono text-xs text-primary">{s.id}</span>
                    </th>
                    <td className="py-2 pr-3 text-foreground">
                      {s.evidenceIds.length ? s.evidenceIds.join(", ") : "None yet"}
                    </td>
                    <td className="py-2 pr-3 text-foreground">
                      {rating && rating.likelihood && rating.impact
                        ? `${rating.likelihood} × ${rating.impact} = ${value}`
                        : "Not rated yet"}
                    </td>
                    <td className="py-2 pr-3 text-foreground">{bandLabels[band(value)]}</td>
                    <td className="py-2 text-foreground">
                      {isPriority
                        ? control?.control.trim()
                          ? "Priority — control written"
                          : "Priority — control still to write"
                        : "Not chosen as a priority"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-foreground">
          <li>
            Suspicious email: {emailSigns} of 3 warning signs written
            {state.email.safeStep.trim() ? ", reporting step written" : ", reporting step still to write"}.
          </li>
          <li>
            Owner briefing: {briefingWords
              ? `${briefingWords} words written (about 100–150 is the guide)`
              : "not started yet"}.
          </li>
          <li>
            Notebook: {state.notebook.trim() ? "you have notes saved" : "empty so far"}.
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="font-display text-sm text-foreground">Still to do</h3>
        {remaining.length ? (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {remaining.map((i) => (
              <li key={i.id}>• Lab {i.lab} — {i.label}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-foreground">
            Everything required is present. You can download your combined portfolio report
            and submit it in the CVI Tracker.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            to={WEEK10_ROUTES.lab1}
            className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
          >
            Go to Lab 1
          </Link>
          <Link
            to={WEEK10_ROUTES.lab2}
            className="min-h-11 rounded-md border border-border px-3 py-2 text-foreground hover:border-primary/60"
          >
            Go to Lab 2
          </Link>
        </div>
      </section>
    </Panel>
  );
}
