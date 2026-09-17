import { useState } from "react";
import { cn } from "@/lib/utils";
import { StatusPill } from "./parts";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";
import type {
  TrustAuthorityInteraction,
  TrustChainStation,
  TrustDecisionStation,
  TrustInspectStation,
  TrustRecapStation,
  TrustWarningStation,
} from "@/lib/demo-lab/types";

/**
 * Week 9 — The Trust Authority.
 *
 * Certificates, chains, warnings and check results are authored teaching
 * content using reserved .example names and a fixed scenario clock. Nothing
 * is parsed, fetched, executed or verified live. All technical labels are
 * rendered as text/HTML so they stay readable and selectable at every size.
 */

const actionClass =
  "min-h-11 rounded-md border border-primary/50 bg-primary/15 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/25 disabled:opacity-40";

const quietActionClass =
  "min-h-11 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-primary/60 disabled:opacity-40";

const choiceClass = (selected: boolean) =>
  cn(
    "min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
    selected
      ? "border-primary bg-primary/15 text-foreground"
      : "border-border hover:border-primary/60",
  );

function Tabs({
  label,
  items,
  activeId,
  onSelect,
}: {
  label: string;
  items: Array<{ id: string; label: string; done: boolean }>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === activeId}
          onClick={() => onSelect(item.id)}
          className={cn(
            "min-h-11 rounded-md border px-3 py-2 text-left text-sm",
            item.id === activeId
              ? "border-primary bg-primary/15 text-foreground"
              : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
          )}
        >
          <span className="block">{item.label}</span>
          <span className="block text-xs text-muted-foreground">
            {item.done ? "Complete" : "Not finished yet"}
          </span>
        </button>
      ))}
    </div>
  );
}

function ChoiceGroup({
  prompt,
  options,
  selectedId,
  onSelect,
  response,
}: {
  prompt: string;
  options: Array<{ id: string; label: string }>;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  response?: string;
}) {
  return (
    <fieldset className="rounded-md border border-border bg-surface-raised/40 p-4">
      <legend className="px-1 text-sm text-foreground">{prompt}</legend>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selectedId === option.id}
            onClick={() => onSelect(option.id)}
            className={choiceClass(selectedId === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {response ? (
        <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-foreground">
          {response}
        </p>
      ) : null}
    </fieldset>
  );
}

/* --------------------------------------- Station 1 — Inspect the badge */

function InspectStation({
  station,
  interaction,
  controller,
}: {
  station: TrustInspectStation;
  interaction: TrustAuthorityInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const id = interaction.id;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-surface-raised/40 p-4">
        <h3 className="font-display text-sm text-foreground">
          {station.analogy.headline}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {station.analogy.body}
        </p>
        <p className="mt-3 text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          Where the analogy stops
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {station.analogy.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </section>

      <dl className="grid gap-2 text-sm @2xl:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <dt className="text-xs text-muted-foreground">Hostname Ivy requested</dt>
          <dd className="font-mono text-foreground">{station.requestedHostname}</dd>
        </div>
        <div className="rounded-md border border-border p-3">
          <dt className="text-xs text-muted-foreground">Scenario clock (fixed)</dt>
          <dd className="font-mono text-foreground">{station.referenceTime}</dd>
        </div>
      </dl>

      <section>
        <h3 className="font-display text-sm text-foreground">
          {station.certificateTitle}
        </h3>
        <ul className="mt-3 space-y-2">
          {station.fields.map((field) => {
            const opened = sceneState.used.includes(`${id}:field:${field.id}`);
            return (
              <li key={field.id}>
                <button
                  type="button"
                  aria-expanded={opened}
                  onClick={() => markUsed(`${id}:field:${field.id}`)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors",
                    opened
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <span className="block text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                    {field.label}
                  </span>
                  <span className="mt-1 block font-mono text-sm break-words text-foreground">
                    {field.value}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {opened ? field.detail : "Select to read what this field means"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-3">
        {station.questions.map((question) => {
          const key = `${id}:q:${question.id}`;
          const chosenId = sceneState.answers[key];
          const chosen = question.options.find((o) => o.id === chosenId);
          return (
            <ChoiceGroup
              key={question.id}
              prompt={question.prompt}
              options={question.options}
              selectedId={chosenId}
              onSelect={(optionId) => answer(key, optionId)}
              {...(chosen ? { response: chosen.response } : {})}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------- Station 2 — Trust chain */

function ChainStation({
  station,
  interaction,
  controller,
}: {
  station: TrustChainStation;
  interaction: TrustAuthorityInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer, clearAnswers } = controller;
  const id = interaction.id;
  const [selected, setSelected] = useState<string | null>(null);

  const placement: Record<string, string | undefined> = {};
  for (const slot of station.slots) {
    placement[slot.id] = sceneState.answers[`${id}:slot:${slot.id}`];
  }
  const placedIds = Object.values(placement).filter(Boolean) as string[];
  const ordered = station.slots.every(
    (slot, i) => placement[slot.id] === station.correctOrder[i],
  );

  const view = sceneState.answers[`${id}:store`] ?? "";
  const storeChoice = sceneState.answers[`${id}:store-answer`];
  const storeOption = station.trustStore.question.options.find(
    (o) => o.id === storeChoice,
  );
  const mode = sceneState.answers[`${id}:mode`];

  function place(slotId: string) {
    if (!selected) return;
    // one certificate per slot; drop it from any slot it already occupies
    clearAnswers(
      (key) =>
        key.startsWith(`${id}:slot:`) && sceneState.answers[key] === selected,
    );
    answer(`${id}:slot:${slotId}`, selected);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <p className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
        {station.signingNote}
      </p>

      <section>
        <h3 className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          Certificates available
        </h3>
        <ul className="mt-2 grid gap-2 @2xl:grid-cols-3">
          {station.certificates.map((cert) => {
            const placedSlot = station.slots.find(
              (slot) => placement[slot.id] === cert.id,
            );
            return (
              <li key={cert.id}>
                <button
                  type="button"
                  aria-pressed={selected === cert.id}
                  onClick={() =>
                    setSelected(selected === cert.id ? null : cert.id)
                  }
                  className={cn(
                    "h-full w-full rounded-md border p-3 text-left transition-colors",
                    selected === cert.id
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">
                    {cert.label}
                  </span>
                  <span className="mt-1 block font-mono text-xs break-words text-muted-foreground">
                    Subject: {cert.subject}
                  </span>
                  <span className="block font-mono text-xs break-words text-muted-foreground">
                    Issuer: {cert.issuer}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {cert.detail}
                  </span>
                  <span className="mt-1 block text-xs text-primary">
                    {placedSlot
                      ? `Placed in slot: ${placedSlot.label}`
                      : selected === cert.id
                        ? "Selected — now choose a slot"
                        : "Not placed yet"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          The chain, top to bottom
        </h3>
        <ol className="mt-2 space-y-2">
          {station.slots.map((slot, index) => {
            const certId = placement[slot.id];
            const cert = station.certificates.find((c) => c.id === certId);
            const correct = certId ? certId === station.correctOrder[index] : undefined;
            return (
              <li key={slot.id}>
                <div
                  className={cn(
                    "rounded-md border p-3",
                    correct === true
                      ? "border-evidence/60 bg-evidence/10"
                      : correct === false
                        ? "border-amber/60 bg-amber/10"
                        : "border-border",
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{slot.hint}</p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    {cert ? cert.label : "— empty —"}
                  </p>
                  {certId ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {correct
                        ? "Placement matches the signing relationship."
                        : "Check the Issuer line against the Subject of the certificate below it."}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!selected}
                      onClick={() => place(slot.id)}
                      className={quietActionClass}
                    >
                      {selected ? "Place here" : "Select a certificate first"}
                    </button>
                    {certId ? (
                      <button
                        type="button"
                        onClick={() => answer(`${id}:slot:${slot.id}`, "")}
                        className={quietActionClass}
                      >
                        Clear slot
                      </button>
                    ) : null}
                  </div>
                </div>
                {index < station.slots.length - 1 ? (
                  <p
                    aria-hidden="true"
                    className="py-1 text-center text-xs text-muted-foreground"
                  >
                    ↑ signed by
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          {placedIds.length} of {station.slots.length} slots filled.
        </p>
      </section>

      <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
        {station.selfSignedNote}
      </p>
      <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
        {station.deliveryNote}
      </p>

      <section className="rounded-md border border-border bg-surface-raised/40 p-4">
        <h3 className="font-display text-sm text-foreground">
          {station.trustStore.label}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The chain stays exactly the same. Only the client's configuration changes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!ordered}
            className={actionClass}
            onClick={() => {
              answer(`${id}:store`, "trusted");
              answer(`${id}:mode`, "trusted");
              markUsed(`${id}:trusted`);
            }}
          >
            {station.trustStore.trustedLabel}
          </button>
          <button
            type="button"
            disabled={!ordered}
            className={quietActionClass}
            onClick={() => {
              answer(`${id}:store`, "untrusted");
              answer(`${id}:mode`, "untrusted");
              markUsed(`${id}:untrusted`);
            }}
          >
            {station.trustStore.untrustedLabel}
          </button>
        </div>
        {!ordered ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Complete the chain first, then try both trust-store settings.
          </p>
        ) : null}

        <div aria-live="polite" className="mt-3">
          {view === "trusted" || view === "untrusted" ? (
            <div
              className={cn(
                "rounded-md border p-3",
                view === "trusted"
                  ? "border-evidence/50 bg-evidence/10"
                  : "border-destructive/50 bg-destructive/10",
              )}
            >
              <StatusPill tone={view === "trusted" ? "proven" : "failed"}>
                {view === "trusted"
                  ? "Chain check: ACCEPTED"
                  : "Chain check: REJECTED"}
              </StatusPill>
              <p className="mt-2 font-display text-sm text-foreground">
                {view === "trusted"
                  ? station.trustStore.trusted.verdict
                  : station.trustStore.untrusted.verdict}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {view === "trusted"
                  ? station.trustStore.trusted.body
                  : station.trustStore.untrusted.body}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Try both settings to see the same chain reach two different outcomes.
            </p>
          )}
        </div>
        {mode ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Last setting used: {mode === "trusted" ? "root trusted" : "root absent"}.
          </p>
        ) : null}
      </section>

      <ChoiceGroup
        prompt={station.trustStore.question.prompt}
        options={station.trustStore.question.options}
        selectedId={storeChoice}
        onSelect={(optionId) => answer(`${id}:store-answer`, optionId)}
        {...(storeOption ? { response: storeOption.response } : {})}
      />

      <section className="rounded-md border border-border p-3">
        <h3 className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          Two failures that are often confused
        </h3>
        <dl className="mt-2 space-y-2 text-sm">
          {station.distinctFailures.map((failure) => (
            <div key={failure.label}>
              <dt className="text-foreground">{failure.label}</dt>
              <dd className="text-muted-foreground">{failure.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ------------------------------------- Station 3 — Investigate warning */

function WarningStation({
  station,
  interaction,
  controller,
}: {
  station: TrustWarningStation;
  interaction: TrustAuthorityInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer, clearAnswers } = controller;
  const [activeId, setActiveId] = useState(station.cases[0]!.id);
  const active = station.cases.find((c) => c.id === activeId) ?? station.cases[0]!;

  const diagnosisId = sceneState.answers[`${active.id}:diagnosis`];
  const actionId = sceneState.answers[`${active.id}:action`];
  const revealed = sceneState.used.includes(`${active.id}:revealed`);
  const diagnosis = active.diagnosis.options.find((o) => o.id === diagnosisId);
  const actionChoice = active.action.options.find((o) => o.id === actionId);
  const caseDone =
    revealed && diagnosis?.correct === true && actionChoice?.safe === true;

  return (
    <div className="space-y-5">
      <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
        {station.safetyNote}
      </p>

      <Tabs
        label="Warning cases"
        activeId={active.id}
        onSelect={setActiveId}
        items={station.cases.map((c) => {
          const d = c.diagnosis.options.find(
            (o) => o.id === sceneState.answers[`${c.id}:diagnosis`],
          );
          const a = c.action.options.find(
            (o) => o.id === sceneState.answers[`${c.id}:action`],
          );
          return {
            id: c.id,
            label: c.label,
            done:
              sceneState.used.includes(`${c.id}:revealed`) &&
              d?.correct === true &&
              a?.safe === true,
          };
        })}
      />

      <section className="rounded-md border border-border bg-surface-raised/40 p-4">
        <p className="text-sm text-muted-foreground">{active.summary}</p>
        <p className="mt-3 rounded-md border border-amber/50 bg-amber/10 p-3 text-sm text-foreground">
          <span className="block text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
            Message shown by the client
          </span>
          {active.clientMessage}
        </p>
        <h3 className="mt-4 text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          Evidence
        </h3>
        <dl className="mt-2 space-y-2 text-sm">
          {active.evidence.map((row) => (
            <div key={row.label} className="grid gap-0.5 @2xl:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-mono break-words text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ChoiceGroup
        prompt={active.diagnosis.prompt}
        options={active.diagnosis.options}
        selectedId={diagnosisId}
        onSelect={(optionId) => answer(`${active.id}:diagnosis`, optionId)}
        {...(revealed && diagnosis ? { response: diagnosis.response } : {})}
      />

      <ChoiceGroup
        prompt={active.action.prompt}
        options={active.action.options}
        selectedId={actionId}
        onSelect={(optionId) => answer(`${active.id}:action`, optionId)}
        {...(revealed && actionChoice ? { response: actionChoice.response } : {})}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={actionClass}
          disabled={!diagnosisId || !actionId}
          onClick={() => markUsed(`${active.id}:revealed`)}
        >
          {station.revealAction}
        </button>
        <button
          type="button"
          className={quietActionClass}
          onClick={() => {
            clearAnswers((key) => key.startsWith(`${active.id}:`));
            answer(`${active.id}:diagnosis`, "");
            answer(`${active.id}:action`, "");
          }}
        >
          {station.resetCaseAction}
        </button>
      </div>
      {!diagnosisId || !actionId ? (
        <p className="text-xs text-muted-foreground">
          Choose a diagnosis and an action first. Predict the outcome before you reveal
          it — predictions are never collected or scored.
        </p>
      ) : null}

      <div aria-live="polite">
        {revealed ? (
          <div className="space-y-2">
            <StatusPill tone={caseDone ? "proven" : "attention"}>
              {caseDone
                ? "Diagnosis correct · safe action chosen"
                : "Keep going — adjust your diagnosis or action"}
            </StatusPill>
            <p className="rounded-md border border-border p-3 text-sm leading-relaxed text-foreground">
              {active.explanation}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------- Station 4 — Make the decision */

function DecisionStation({
  station,
  controller,
}: {
  station: TrustDecisionStation;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const [activeId, setActiveId] = useState(station.scenarios[0]!.id);
  const active =
    station.scenarios.find((s) => s.id === activeId) ?? station.scenarios[0]!;

  const verdictId = sceneState.answers[`${active.id}:verdict`];
  const verdict = active.verdict.options.find((o) => o.id === verdictId);
  const revealed = sceneState.used.includes(`${active.id}:revealed`);
  const limitId = sceneState.answers[`${active.id}:limit`];
  const limit = active.limit.options.find((o) => o.id === limitId);

  return (
    <div className="space-y-5">
      <Tabs
        label="Decision scenarios"
        activeId={active.id}
        onSelect={setActiveId}
        items={station.scenarios.map((s) => {
          const v = s.verdict.options.find(
            (o) => o.id === sceneState.answers[`${s.id}:verdict`],
          );
          const l = s.limit.options.find(
            (o) => o.id === sceneState.answers[`${s.id}:limit`],
          );
          const evidenceDone = s.evidence.options.every(
            (o) =>
              (sceneState.answers[`${s.id}:evidence:${o.id}`] === "selected") ===
              o.supporting,
          );
          return {
            id: s.id,
            label: s.label,
            done: v?.correct === true && l?.correct === true && evidenceDone,
          };
        })}
      />

      <section className="rounded-md border border-border bg-surface-raised/40 p-4">
        <p className="text-sm text-muted-foreground">{active.summary}</p>
        <ul className="mt-3 space-y-2">
          {active.checks.map((check) => (
            <li
              key={check.label}
              className={cn(
                "rounded-md border p-3",
                check.result === "pass"
                  ? "border-evidence/50 bg-evidence/10"
                  : "border-destructive/50 bg-destructive/10",
              )}
            >
              <StatusPill tone={check.result === "pass" ? "proven" : "failed"}>
                {check.result === "pass" ? "PASS" : "FAIL"}
              </StatusPill>
              <p className="mt-2 text-sm font-medium text-foreground">{check.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <ChoiceGroup
        prompt={active.verdict.prompt}
        options={active.verdict.options}
        selectedId={verdictId}
        onSelect={(optionId) => answer(`${active.id}:verdict`, optionId)}
        {...(revealed && verdict ? { response: verdict.response } : {})}
      />

      <button
        type="button"
        className={actionClass}
        disabled={!verdictId}
        onClick={() => markUsed(`${active.id}:revealed`)}
      >
        {station.revealAction}
      </button>
      {!verdictId ? (
        <p className="text-xs text-muted-foreground">
          Commit to a verdict first. Predicting before revealing is encouraged and never
          scored.
        </p>
      ) : null}

      <fieldset className="rounded-md border border-border bg-surface-raised/40 p-4">
        <legend className="px-1 text-sm text-foreground">
          {active.evidence.prompt}
        </legend>
        <ul className="mt-2 space-y-2">
          {active.evidence.options.map((option) => {
            const key = `${active.id}:evidence:${option.id}`;
            const selected = sceneState.answers[key] === "selected";
            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => answer(key, selected ? "" : "selected")}
                  className={choiceClass(selected)}
                >
                  <span className="block text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {selected ? "Selected as supporting" : "Not selected"}
                  </span>
                </button>
                {selected ? (
                  <p aria-live="polite" className="mt-1 text-sm text-foreground">
                    {option.response}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <ChoiceGroup
        prompt={active.limit.prompt}
        options={active.limit.options}
        selectedId={limitId}
        onSelect={(optionId) => answer(`${active.id}:limit`, optionId)}
        {...(limit ? { response: limit.response } : {})}
      />

      <p className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
        {station.possessionNote}
      </p>
      <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
        {station.checklistNote}
      </p>
    </div>
  );
}

/* ---------------------------------------------------- Close — recap */

function RecapStation({
  station,
  interaction,
  controller,
}: {
  station: TrustRecapStation;
  interaction: TrustAuthorityInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed } = controller;
  const revealed = sceneState.used.includes(`${interaction.id}:takeaway`);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            What each certificate check answers
          </caption>
          <thead>
            <tr className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
              <th scope="col" className="border-b border-border py-2 pr-3">
                Question
              </th>
              <th scope="col" className="border-b border-border py-2 pr-3">
                Check
              </th>
              <th scope="col" className="border-b border-border py-2">
                What it establishes
              </th>
            </tr>
          </thead>
          <tbody>
            {station.rows.map((row) => (
              <tr key={row.question} className="align-top">
                <th
                  scope="row"
                  className="border-b border-border/60 py-2 pr-3 font-normal text-foreground"
                >
                  {row.question}
                </th>
                <td className="border-b border-border/60 py-2 pr-3 text-foreground">
                  {row.check}
                </td>
                <td className="border-b border-border/60 py-2 text-muted-foreground">
                  {row.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className={actionClass}
        disabled={revealed}
        onClick={() => markUsed(`${interaction.id}:takeaway`)}
      >
        {station.revealAction}
      </button>

      <div aria-live="polite">
        {revealed ? (
          <div className="rounded-md border border-evidence/50 bg-evidence/10 p-4">
            <p className="font-display text-sm text-foreground">
              {station.takeaway.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {station.takeaway.body}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Say it in your own words first — out loud, in chat, or to yourself. Nothing
            is collected.
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Shell */

export function TrustAuthority({
  interaction,
  controller,
}: {
  interaction: TrustAuthorityInteraction;
  controller: ExperienceController;
}) {
  const station = interaction.station;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] tracking-[0.22em] text-primary uppercase">
          {interaction.stationLabel}
        </p>
        <h2 className="mt-1 font-display text-lg text-foreground">
          {interaction.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{interaction.instruction}</p>
        <p className="mt-3 rounded-md border border-border bg-surface-raised/60 p-3 text-xs text-muted-foreground">
          {interaction.referenceTime}
        </p>
        <p className="mt-2 rounded-md border border-border p-3 text-xs text-muted-foreground">
          {interaction.modelNote}
        </p>
      </div>

      {station.kind === "inspect" ? (
        <InspectStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}
      {station.kind === "chain" ? (
        <ChainStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}
      {station.kind === "warning" ? (
        <WarningStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}
      {station.kind === "decision" ? (
        <DecisionStation station={station} controller={controller} />
      ) : null}
      {station.kind === "recap" ? (
        <RecapStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}

      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm text-foreground">
          Plain-language glossary
        </summary>
        <dl className="mt-3 space-y-2 text-sm">
          {interaction.terms.map((term) => (
            <div key={term.term}>
              <dt className="text-foreground">{term.term}</dt>
              <dd className="text-muted-foreground">{term.meaning}</dd>
            </div>
          ))}
        </dl>
      </details>

      <p className="rounded-md border border-border p-3 text-xs text-muted-foreground">
        <span className="block text-[0.62rem] tracking-[0.2em] uppercase">
          What this station does not prove
        </span>
        {interaction.boundary}
      </p>

      {controller.complete ? (
        <div
          aria-live="polite"
          className="rounded-md border border-evidence/50 bg-evidence/10 p-4"
        >
          <p className="font-display text-sm text-foreground">
            {interaction.completion.headline}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {interaction.completion.body}
          </p>
        </div>
      ) : null}
    </div>
  );
}
