import { cn } from "@/lib/utils";
import { Field, Hint, Panel } from "./ui";
import { assets } from "@/lib/week10/case-packet";
import {
  band,
  bandLabels,
  impactRubric,
  likelihoodRubric,
  score,
  wordCount,
  type RiskRating,
} from "@/lib/week10/state";
import type { Week10Store } from "@/lib/week10/useWeek10";

function assetName(id: string) {
  return assets.find((a) => a.id === id)?.name ?? id;
}

export function Lab2({ store }: { store: Week10Store }) {
  const { state, update } = store;

  function rate(scenarioId: string, patch: Partial<RiskRating>) {
    update((prev) => ({
      ...prev,
      ratings: prev.ratings.map((r) =>
        r.scenarioId === scenarioId ? { ...r, ...patch } : r,
      ),
    }));
  }

  function editControl(scenarioId: string, patch: Partial<{ control: string; howItHelps: string; residual: string }>) {
    update((prev) => {
      const exists = prev.controls.some((c) => c.scenarioId === scenarioId);
      const controls = exists
        ? prev.controls.map((c) => (c.scenarioId === scenarioId ? { ...c, ...patch } : c))
        : [...prev.controls, { scenarioId, control: "", howItHelps: "", residual: "", ...patch }];
      return { ...prev, controls };
    });
  }

  const carried = state.scenarios;
  const emptyRows = carried.filter((s) => !s.threat.trim());

  return (
    <div className="space-y-4">
      <Panel eyebrow="Carried over" title="Your Lab 1 scenarios">
        <p className="text-sm text-muted-foreground">
          These are the same rows, matched by their IDs. Editing Lab 1 keeps everything you
          write here; deleting a row would remove its rating and control so your report can
          never show work for something that no longer exists.
        </p>
        {emptyRows.length ? (
          <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
            {emptyRows.length} scenario{emptyRows.length === 1 ? " has" : "s have"} no threat
            written yet in Lab 1. You can still rate here, but finish Lab 1 for a complete
            report.
          </p>
        ) : null}
        <ul className="mt-3 space-y-1 text-sm text-foreground">
          {carried.map((s, i) => (
            <li key={s.id}>
              <span className="font-mono text-xs text-primary">{s.id}</span> — Risk {i + 1}:{" "}
              {assetName(s.assetId)} · {s.threat.trim() || "(no threat written yet)"}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="How to choose a number">
        <div className="grid gap-4 @3xl:grid-cols-2">
          <div>
            <h3 className="font-display text-sm text-foreground">Likelihood</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on exposure, the weaknesses you found, and protections already in place.
              These are judgements, not statistics — there is no percentage behind them.
            </p>
            <ul className="mt-2 space-y-2">
              {likelihoodRubric.map((r) => (
                <li key={r.value} className="rounded-md border border-border bg-background p-3 text-sm">
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="mt-1 block text-muted-foreground">{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm text-foreground">Impact</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on clinic operations, sensitive data, and how hard recovery would be.
            </p>
            <ul className="mt-2 space-y-2">
              {impactRubric.map((r) => (
                <li key={r.value} className="rounded-md border border-border bg-background p-3 text-sm">
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="mt-1 block text-muted-foreground">{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Step 1" title="Rate each risk">
        <div className="space-y-4">
          {carried.map((s, i) => {
            const r = state.ratings.find((x) => x.scenarioId === s.id);
            if (!r) return null;
            const value = score(r);
            return (
              <div key={s.id} className="rounded-lg border border-border bg-background p-4">
                <p className="font-display text-sm text-foreground">
                  Risk {i + 1} <span className="font-mono text-xs text-primary">{s.id}</span> ·{" "}
                  {assetName(s.assetId)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.threat.trim() || "(no threat written in Lab 1 yet)"}
                </p>

                {(
                  [
                    ["likelihood", "Likelihood", likelihoodRubric],
                    ["impact", "Impact", impactRubric],
                  ] as const
                ).map(([key, label, rubric]) => (
                  <fieldset key={key} className="mt-3">
                    <legend className="text-sm font-medium text-foreground">{label}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rubric.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => rate(s.id, { [key]: opt.value } as Partial<RiskRating>)}
                          aria-pressed={r[key] === opt.value}
                          className={cn(
                            "min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                            r[key] === opt.value
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-border hover:border-primary/60",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <div className="mt-3 grid gap-3 @3xl:grid-cols-2">
                  <Field
                    label="Why this likelihood?"
                    help="Point at evidence."
                    rows={2}
                    value={r.likelihoodWhy}
                    onChange={(likelihoodWhy) => rate(s.id, { likelihoodWhy })}
                  />
                  <Field
                    label="Why this impact?"
                    help="Operations, data, recovery."
                    rows={2}
                    value={r.impactWhy}
                    onChange={(impactWhy) => rate(s.id, { impactWhy })}
                  />
                </div>

                <p className="mt-3 text-sm text-foreground">
                  Score: {r.likelihood || "—"} × {r.impact || "—"} ={" "}
                  <strong>{value || "not rated"}</strong> · {bandLabels[band(value)]}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <RiskMatrix store={store} />

      <Panel eyebrow="Step 2" title="Choose your two priority risks">
        <p className="text-sm text-muted-foreground">
          Usually the highest scores, but not always. A different choice is fine when you can
          explain it — and ties are normal.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {carried.map((s, i) => {
            const chosen = state.priorities.includes(s.id);
            return (
              <label
                key={s.id}
                className={cn(
                  "flex min-h-14 items-start gap-3 rounded-md border px-3 py-2.5 text-sm",
                  chosen ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                <input
                  type="checkbox"
                  checked={chosen}
                  className="mt-1"
                  onChange={() =>
                    update((prev) => ({
                      ...prev,
                      priorities: chosen
                        ? prev.priorities.filter((p) => p !== s.id)
                        : [...prev.priorities, s.id],
                    }))
                  }
                />
                <span className="text-foreground">
                  Risk {i + 1} ({s.id}) — {assetName(s.assetId)}
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-3">
          <Field
            label="Why these two first?"
            value={state.priorityWhy}
            onChange={(priorityWhy) => update((prev) => ({ ...prev, priorityWhy }))}
          />
        </div>
      </Panel>

      <Panel eyebrow="Step 3" title="Recommend a control for each priority risk">
        {state.priorities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Choose your priority risks above and they will appear here.
          </p>
        ) : null}
        <div className="space-y-4">
          {state.priorities.map((id) => {
            const s = carried.find((x) => x.id === id);
            const c = state.controls.find((x) => x.scenarioId === id);
            return (
              <div key={id} className="rounded-lg border border-border bg-background p-4">
                <p className="font-display text-sm text-foreground">
                  <span className="font-mono text-xs text-primary">{id}</span>{" "}
                  {s ? assetName(s.assetId) : ""}
                </p>
                <div className="mt-3 space-y-3">
                  <Field
                    label="Control"
                    help="One concrete thing a 12-person clinic could actually do."
                    rows={2}
                    value={c?.control ?? ""}
                    onChange={(control) => editControl(id, { control })}
                  />
                  <Field
                    label="How it helps"
                    help="Does it make the event less likely, less damaging, or easier to spot?"
                    rows={2}
                    value={c?.howItHelps ?? ""}
                    onChange={(howItHelps) => editControl(id, { howItHelps })}
                  />
                  <Field
                    label="Risk remaining afterwards"
                    help="Describe it in words. Do not invent a new score — no control makes risk zero."
                    rows={2}
                    value={c?.residual ?? ""}
                    onChange={(residual) => editControl(id, { residual })}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <Hint mode={state.mode}>
          A good control names the weakness it closes. "Improve security" closes nothing;
          "individual named accounts for each reception member" closes the attribution gap
          you found in the records office.
        </Hint>
      </Panel>

      <Panel eyebrow="Step 4" title="Briefing for the practice manager">
        <p className="text-sm text-muted-foreground">
          About 100–150 words, in plain language, for someone who is not technical. The word
          count is a guide — nothing is blocked if you go over or under.
        </p>
        <div className="mt-3">
          <Field
            label="Your briefing"
            rows={8}
            value={state.briefing}
            onChange={(briefing) => update((prev) => ({ ...prev, briefing }))}
          />
        </div>
        <p className="mt-2 text-sm text-foreground" aria-live="polite">
          {wordCount(state.briefing)} words.
        </p>
        <Hint mode={state.mode}>
          Say what you found, why it matters to the clinic, what you recommend, and what it
          still does not fix. Avoid claiming an attack happened unless the evidence says so.
        </Hint>
      </Panel>
    </div>
  );
}

/** Accessible 3x3 matrix: cells list every risk, plus a full table alternative. */
function RiskMatrix({ store }: { store: Week10Store }) {
  const { state } = store;
  const cell = (l: number, i: number) =>
    state.ratings.filter((r) => r.likelihood === l && r.impact === i);

  return (
    <Panel title="Risk matrix">
      <p className="text-sm text-muted-foreground">
        Each cell lists every risk with that combination, so overlapping scores are all
        visible. Bands are written out as words as well as position — colour is never the
        only signal. These bands (1–2 low, 3–4 medium, 6–9 high) are a classroom teaching
        aid, not a compliance standard.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Risk matrix: impact across the top, likelihood down the side
          </caption>
          <thead>
            <tr>
              <th scope="col" className="border border-border p-2 text-left text-muted-foreground">
                Likelihood ↓ / Impact →
              </th>
              {[1, 2, 3].map((i) => (
                <th key={i} scope="col" className="border border-border p-2 text-foreground">
                  Impact {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[3, 2, 1].map((l) => (
              <tr key={l}>
                <th scope="row" className="border border-border p-2 text-left text-foreground">
                  Likelihood {l}
                </th>
                {[1, 2, 3].map((i) => {
                  const value = l * i;
                  const entries = cell(l, i);
                  return (
                    <td
                      key={i}
                      className={cn(
                        "border border-border p-2 align-top",
                        band(value) === "high"
                          ? "bg-destructive/15"
                          : band(value) === "medium"
                            ? "bg-amber/15"
                            : "bg-surface-raised",
                      )}
                    >
                      <span className="block text-xs text-muted-foreground">
                        Score {value} · {bandLabels[band(value)]}
                      </span>
                      {entries.length ? (
                        <ul className="mt-1 space-y-0.5">
                          {entries.map((e) => (
                            <li key={e.scenarioId} className="font-mono text-xs text-foreground">
                              {e.scenarioId}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="mt-1 block text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-5 font-display text-sm text-foreground">Same information as a list</h3>
      <ul className="mt-2 space-y-1 text-sm text-foreground">
        {state.scenarios.map((s, idx) => {
          const r = state.ratings.find((x) => x.scenarioId === s.id);
          const value = r ? score(r) : 0;
          return (
            <li key={s.id}>
              Risk {idx + 1} ({s.id}) — likelihood {r?.likelihood || "not rated"}, impact{" "}
              {r?.impact || "not rated"}, score {value || "not rated"},{" "}
              {bandLabels[band(value)]}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
