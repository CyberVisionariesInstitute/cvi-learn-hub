import { Link } from "@tanstack/react-router";
import { Panel, ProgressBar } from "./ui";
import {
  band,
  bandLabels,
  checklist,
  controlStatus,
  ratingStatus,
  score,
  visitedRoomIds,
  wordCount,
  type Week10State,
} from "@/lib/week10/state";
import {
  assets,
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
 * material, sample wording or grading is referenced here. "Opened" is only
 * ever described as opened — never as understood or correct.
 */

const notWritten = "Not written yet";

function assetName(id: string): string {
  return assets.find((a) => a.id === id)?.name ?? id;
}

const ratingText: Record<ReturnType<typeof ratingStatus>, string> = {
  unrated: "Not rated yet",
  "partly-rated": "Only one of likelihood and impact chosen",
  "rated-without-reasons": "Rated, reasons still to write",
  justified: "Rated with your reasons",
};

export function CompletionSummary({ store }: { store: Week10Store }) {
  const state: Week10State = store.state;
  const items = checklist(state);
  const done = items.filter((i) => i.done).length;
  const remaining = items.filter((i) => !i.done);

  const visited = visitedRoomIds(state);
  const unvisited = rooms.filter((r) => !visited.includes(r.id));

  const findings = state.findings
    .map((id) => evidenceById(id))
    .filter((e): e is NonNullable<ReturnType<typeof evidenceById>> => Boolean(e));

  const emailSigns = state.email.signs.filter((s) => s.trim()).length;
  const briefingWords = wordCount(state.briefing);
  const everythingDone = remaining.length === 0;

  const decisions = state.scenarios.map((s, i) => {
    const rating = state.ratings.find((r) => r.scenarioId === s.id);
    const value = rating ? score(rating) : 0;
    return {
      index: i + 1,
      id: s.id,
      asset: assetName(s.assetId),
      threat: s.threat.trim(),
      evidence: s.evidenceIds.length ? s.evidenceIds.join(", ") : "None chosen yet",
      ratingLabel:
        rating && rating.likelihood && rating.impact
          ? `${rating.likelihood} × ${rating.impact} = ${value}`
          : "Not rated yet",
      ratingState: ratingText[ratingStatus(state, s.id)],
      bandLabel: bandLabels[band(value)],
      isPriority: state.priorities.includes(s.id),
      control: controlStatus(state, s.id),
    };
  });

  return (
    <Panel title="Your Week 10 summary">
      <p className="text-sm text-muted-foreground">
        This is a picture of your own work so far. Nothing here is graded, and no model
        answers are shown — it simply reflects what you have opened, chosen and written.
        Opening a room records that you looked at it; it does not say your answer is right.
      </p>

      <div className="mt-4">
        <ProgressBar done={done} total={items.length} label="Required work completed" />
      </div>

      <div className="mt-5 grid gap-4 @3xl:grid-cols-2">
        <section>
          <h3 className="font-display text-sm text-foreground">Rooms you have visited</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {rooms.map((r) => {
              const isVisited = visited.includes(r.id);
              return (
                <li key={r.id}>
                  <span aria-hidden="true">{isVisited ? "✓" : "○"}</span>{" "}
                  <span className="sr-only">{isVisited ? "Visited:" : "Not opened yet:"}</span>
                  {r.name}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {visited.length} of {rooms.length} rooms opened.
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
        <p className="mt-1 text-xs text-muted-foreground">
          Everything below is your own writing.
        </p>

        {/* Small screens: one readable card per scenario. */}
        <ul className="mt-3 space-y-3 @3xl:hidden">
          {decisions.map((d) => (
            <li key={d.id} className="rounded-md border border-border bg-background p-4">
              <p className="font-display text-sm text-foreground">
                {d.index}. {d.asset}{" "}
                <span className="font-mono text-xs text-primary">{d.id}</span>
              </p>
              <dl className="mt-2 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Your threat / event</dt>
                  <dd className={d.threat ? "text-foreground" : "text-muted-foreground"}>
                    {d.threat || notWritten}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Evidence attached</dt>
                  <dd className="text-foreground">{d.evidence}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Likelihood × impact</dt>
                  <dd className="text-foreground">
                    {d.ratingLabel} — {d.ratingState}. {d.bandLabel}.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Recommendation</dt>
                  <dd className="text-foreground">
                    <RecommendationStatus
                      isPriority={d.isPriority}
                      control={d.control}
                      inline={false}
                    />
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        {/* Wide screens: the same information as a table. */}
        <div className="mt-3 hidden overflow-x-auto @3xl:block">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Your scenarios: the asset, the threat you described, the evidence attached, your
              likelihood and impact ratings, the classroom band, and how far your
              recommendation has been written.
            </caption>
            <thead>
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2 pr-3">Scenario &amp; asset</th>
                <th scope="col" className="py-2 pr-3">Your threat / event</th>
                <th scope="col" className="py-2 pr-3">Evidence</th>
                <th scope="col" className="py-2 pr-3">Likelihood × impact</th>
                <th scope="col" className="py-2 pr-3">Band</th>
                <th scope="col" className="py-2">Priority &amp; recommendation</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.id} className="border-t border-border align-top">
                  <th scope="row" className="py-2 pr-3 font-normal text-foreground">
                    {d.index}. {d.asset}
                    <br />
                    <span className="font-mono text-xs text-primary">{d.id}</span>
                  </th>
                  <td
                    className={
                      d.threat ? "py-2 pr-3 text-foreground" : "py-2 pr-3 text-muted-foreground"
                    }
                  >
                    {d.threat || notWritten}
                  </td>
                  <td className="py-2 pr-3 text-foreground">{d.evidence}</td>
                  <td className="py-2 pr-3 text-foreground">
                    {d.ratingLabel}
                    <br />
                    <span className="text-xs text-muted-foreground">{d.ratingState}</span>
                  </td>
                  <td className="py-2 pr-3 text-foreground">{d.bandLabel}</td>
                  <td className="py-2 text-foreground">
                    <RecommendationStatus
                      isPriority={d.isPriority}
                      control={d.control}
                      inline
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-3 space-y-1 text-sm text-foreground">
          <li>
            Suspicious email: {emailSigns} of 3 warning signs written
            {state.email.safeStep.trim()
              ? ", reporting step written"
              : ", reporting step still to write"}
            .
          </li>
          <li>
            Priority reasoning:{" "}
            {state.priorities.length >= 2
              ? state.priorityWhy.trim()
                ? "two priorities chosen, reasoning written"
                : "two priorities chosen, reasoning still to write"
              : `${state.priorities.length} of 2 priorities chosen`}
            .
          </li>
          <li>
            Owner briefing:{" "}
            {briefingWords
              ? `${briefingWords} words written (about 100–150 is the guide)`
              : "not started yet"}
            .
          </li>
          {/*
            Wording describes what is entered, never that it was stored: only
            the save indicator knows whether a write actually succeeded.
          */}
          <li>
            Notebook (optional):{" "}
            {state.notebook.trim()
              ? `${wordCount(state.notebook)} words entered`
              : "nothing entered yet"}
            {store.status === "error"
              ? " — your latest work could not be saved in this browser; see the save message and download a backup"
              : ""}
            .
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="font-display text-sm text-foreground">Still to do</h3>
        {unvisited.length ? (
          <div className="mt-2 rounded-md border border-amber/40 bg-amber/10 p-3">
            <p className="text-sm text-foreground">
              Investigation steps left — this lab asks you to walk all {rooms.length} rooms:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {unvisited.map((r) => (
                <li key={r.id}>
                  •{" "}
                  <Link
                    to={WEEK10_ROUTES.overview}
                    hash="rooms"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Investigate the {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {remaining.length ? (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {remaining.map((i) => (
              <li key={i.id}>
                • Lab {i.lab} — {i.label}
              </li>
            ))}
          </ul>
        ) : null}

        {everythingDone ? (
          <p className="mt-2 text-sm text-foreground">
            Every required step is present, including all {rooms.length} room visits. You can
            download your combined portfolio report and submit it in the CVI Tracker.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Your Week 10 investigation is not finished yet. Finish the steps above before you
            submit.
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

function RecommendationStatus({
  isPriority,
  control,
  inline,
}: {
  isPriority: boolean;
  control: { control: boolean; howItHelps: boolean; residual: boolean; complete: boolean };
  inline: boolean;
}) {
  if (!isPriority) return <span>Not chosen as a priority</span>;
  const parts = [
    `Control: ${control.control ? "written" : notWritten.toLowerCase()}`,
    `How it helps: ${control.howItHelps ? "written" : notWritten.toLowerCase()}`,
    `Remaining risk: ${control.residual ? "written" : notWritten.toLowerCase()}`,
  ];
  return (
    <span className={inline ? "block" : undefined}>
      <span className="block font-medium">
        Priority — recommendation {control.complete ? "complete" : "not complete yet"}
      </span>
      <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        {parts.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </span>
  );
}
