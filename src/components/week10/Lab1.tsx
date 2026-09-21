import { cn } from "@/lib/utils";
import { Field, Hint, Panel } from "./ui";
import {
  assets,
  clinicProfile,
  evidence,
  evidenceById,
  glossary,
} from "@/lib/week10/case-packet";
import type { Week10Store } from "@/lib/week10/useWeek10";
import type { ScenarioRow } from "@/lib/week10/state";

export function Lab1({ store }: { store: Week10Store }) {
  const { state, update } = store;

  function editScenario(id: string, patch: Partial<ScenarioRow>) {
    update((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  return (
    <div className="space-y-4">
      {/* A — business mission */}
      <Panel eyebrow="Part A" title="What this clinic is trying to do">
        <p className="text-sm leading-relaxed text-foreground">{clinicProfile.blurb}</p>
        <ul className="mt-3 space-y-1">
          {clinicProfile.facts.map((f, i) => (
            <li key={i} className="text-sm leading-relaxed text-foreground">
              • {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-foreground">
          Security work exists to keep this clinic running and to keep patients safe. For the
          rest of this lab, every judgement you make should trace back to something you can
          point at in the evidence.
        </p>
      </Panel>

      {/* B — assets */}
      <Panel eyebrow="Part B" title="The five things worth protecting">
        <div className="grid gap-3 @3xl:grid-cols-2">
          {assets.map((a) => (
            <div key={a.id} className="rounded-md border border-border bg-background p-4">
              <p className="font-mono text-xs text-primary">{a.id}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{a.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.purpose}</p>
              {state.mode === "guided" ? (
                <details className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Show a hint: why this asset matters
                  </summary>
                  <dl className="mt-2 space-y-1 text-sm text-foreground">
                    <div>
                      <dt className="inline font-medium">Kept private: </dt>
                      <dd className="inline">{a.cia.confidentiality}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Correct: </dt>
                      <dd className="inline">{a.cia.integrity}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Available: </dt>
                      <dd className="inline">{a.cia.availability}</dd>
                    </div>
                  </dl>
                </details>
              ) : (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>What here must stay private?</li>
                  <li>What here must stay correct?</li>
                  <li>What here must stay available?</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Vocabulary */}
      <Panel title="The words you will use">
        <dl className="grid gap-3 @3xl:grid-cols-2">
          {glossary.map((g) => (
            <div key={g.term} className="rounded-md border border-border bg-background p-3">
              <dt className="text-sm font-medium text-foreground">{g.term}</dt>
              <dd className="mt-1 text-sm text-foreground">{g.plain}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">{g.precise}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* Worked example — deliberately a sixth, non-assessed situation */}
      {state.mode === "guided" ? (
        <Panel eyebrow="Worked example" title="How one row is built (this row is not one of yours)">
          <p className="text-sm text-muted-foreground">
            This example uses the clinic's paper appointment diary at the front desk. It is
            deliberately not one of the five scenarios you are asked to complete, so nothing
            is filled in for you.
          </p>
          <dl className="mt-3 space-y-2 text-sm text-foreground">
            <div>
              <dt className="font-medium">Asset</dt>
              <dd>The paper day-list printed each morning at reception.</dd>
            </div>
            <div>
              <dt className="font-medium">Evidence</dt>
              <dd>
                Front desk photograph showing the day-list face-up on the counter (illustrative
                only — not in your evidence list).
              </dd>
            </div>
            <div>
              <dt className="font-medium">Threat / event</dt>
              <dd>A visitor at the counter reads the names of other patients attending today.</dd>
            </div>
            <div>
              <dt className="font-medium">Vulnerability</dt>
              <dd>The list is left visible at a public counter with no cover sheet.</dd>
            </div>
            <div>
              <dt className="font-medium">Consequence</dt>
              <dd>Patient attendance is disclosed to strangers; trust and privacy are damaged.</dd>
            </div>
            <div>
              <dt className="font-medium">CIA</dt>
              <dd>Confidentiality.</dd>
            </div>
            <div>
              <dt className="font-medium">Unknown / question</dt>
              <dd>How often the counter is left unattended is not recorded.</dd>
            </div>
          </dl>
        </Panel>
      ) : null}

      {/* C — scenarios */}
      <Panel eyebrow="Part C" title="Build your five risk scenarios">
        <p className="text-sm text-muted-foreground">
          One row per situation. Tick the evidence you are relying on — the IDs travel with
          your work into Lab 2 and into your report. Where the evidence does not tell you
          something, say so in the unknown box instead of assuming.
        </p>

        <div className="mt-4 space-y-4">
          {state.scenarios.map((s, index) => {
            const suggested = threatEvents[index];
            return (
              <div key={s.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-sm text-foreground">
                    Scenario {index + 1}{" "}
                    <span className="font-mono text-xs text-primary">{s.id}</span>
                  </p>
                  {suggested && state.mode === "guided" ? (
                    <p className="text-xs text-muted-foreground">
                      Starting point: {suggested.name}
                    </p>
                  ) : null}
                </div>

                <label className="mt-3 block text-sm">
                  <span className="block font-medium text-foreground">Asset</span>
                  <select
                    value={s.assetId}
                    onChange={(e) => editScenario(s.id, { assetId: e.target.value })}
                    className="mt-1 min-h-11 w-full rounded-md border border-border bg-surface-raised p-2 text-sm text-foreground"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset className="mt-3">
                  <legend className="text-sm font-medium text-foreground">
                    Evidence I am using
                  </legend>
                  <div className="mt-2 grid gap-1 @2xl:grid-cols-2">
                    {evidence.map((card) => {
                      const checked = s.evidenceIds.includes(card.id);
                      return (
                        <label
                          key={card.id}
                          className={cn(
                            "flex min-h-11 items-start gap-2 rounded-md border px-3 py-2 text-sm",
                            checked ? "border-primary bg-primary/10" : "border-border",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              editScenario(s.id, {
                                evidenceIds: checked
                                  ? s.evidenceIds.filter((x) => x !== card.id)
                                  : [...s.evidenceIds, card.id],
                              })
                            }
                            className="mt-1"
                          />
                          <span>
                            <span className="font-mono text-xs text-primary">{card.id}</span>{" "}
                            <span className="text-foreground">{card.title}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-3 grid gap-3 @3xl:grid-cols-2">
                  <Field
                    label="Threat / event"
                    help="What could happen, and who or what causes it."
                    value={s.threat}
                    onChange={(threat) => editScenario(s.id, { threat })}
                  />
                  <Field
                    label="Vulnerability"
                    help="The weakness in the evidence that would let it happen."
                    value={s.vulnerability}
                    onChange={(vulnerability) => editScenario(s.id, { vulnerability })}
                  />
                  <Field
                    label="Consequence"
                    help="What it costs the clinic and its patients."
                    value={s.consequence}
                    onChange={(consequence) => editScenario(s.id, { consequence })}
                  />
                  <Field
                    label="Unknown / question (optional but encouraged)"
                    help="Anything the evidence does not settle."
                    value={s.unknown}
                    onChange={(unknown) => editScenario(s.id, { unknown })}
                  />
                </div>

                <fieldset className="mt-3">
                  <legend className="text-sm font-medium text-foreground">
                    Which of CIA is affected?
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(
                      [
                        ["confidentiality", "Confidentiality — kept private"],
                        ["integrity", "Integrity — correct"],
                        ["availability", "Availability — there when needed"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className={cn(
                          "flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm",
                          s.cia[key] ? "border-primary bg-primary/10" : "border-border",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={s.cia[key]}
                          onChange={() =>
                            editScenario(s.id, { cia: { ...s.cia, [key]: !s.cia[key] } })
                          }
                        />
                        <span className="text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            );
          })}
        </div>

        <Hint mode={state.mode}>
          If your threat and vulnerability boxes say the same thing, you have written one
          idea twice. The threat is the event ("someone signs in as reception"); the
          vulnerability is why it is possible ("password only, no second step").
        </Hint>
      </Panel>

      {/* D — email analysis */}
      <Panel eyebrow="Part D" title="Email analysis">
        <p className="text-sm text-muted-foreground">
          Reread{" "}
          <span className="font-mono text-primary">EV-REC-01</span> and{" "}
          <span className="font-mono text-primary">EV-REC-02</span>:{" "}
          {evidenceById("EV-REC-01")?.title}.
        </p>
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <Field
              key={i}
              label={`Warning sign ${i + 1}`}
              rows={2}
              value={state.email.signs[i] ?? ""}
              onChange={(text) =>
                update((prev) => {
                  const signs: [string, string, string] = [...prev.email.signs];
                  signs[i] = text;
                  return { ...prev, email: { ...prev.email, signs } };
                })
              }
            />
          ))}
          <Field
            label="Safe response and reporting step"
            help="What you would actually do, and who you would tell."
            value={state.email.safeStep}
            onChange={(safeStep) =>
              update((prev) => ({ ...prev, email: { ...prev.email, safeStep } }))
            }
          />
          <Field
            label="Suspicious vs proven — in your words"
            help="What does this message prove, and what would you need to check to know more?"
            value={state.email.proofNote}
            onChange={(proofNote) =>
              update((prev) => ({ ...prev, email: { ...prev.email, proofNote } }))
            }
          />
        </div>
        <Hint mode={state.mode}>
          Warning signs are things you can point at in the message itself: who it came from,
          what it asks for, and how it pressures you. "It felt odd" is a reaction, not a
          sign.
        </Hint>
      </Panel>
    </div>
  );
}
