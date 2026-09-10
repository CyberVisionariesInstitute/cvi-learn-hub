import { cn } from "@/lib/utils";
import { StatusPill, TerminalView } from "./parts";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";
import type {
  CryptoAuthStation,
  CryptoCompareStation,
  CryptoProtectStation,
  CryptoRecapStation,
  CryptoSignStation,
  CryptoWorkbenchInteraction,
} from "@/lib/demo-lab/types";

/**
 * Vault Exchange crypto workbench.
 *
 * Everything shown here is authored teaching content rendered as a clearly
 * labelled conceptual model. Nothing is computed, no real cipher, digest,
 * signature or SSH exchange takes place, and no key, secret, password or
 * passphrase is ever generated, displayed or stored.
 */

const actionClass =
  "min-h-11 rounded-md border border-primary/50 bg-primary/15 px-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/25 disabled:opacity-40 motion-reduce:transition-none";

const quietActionClass =
  "min-h-11 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-primary/60 disabled:opacity-40";

function DocumentPane({
  title,
  lines,
  tone = "plain",
  highlightLine,
  caption,
}: {
  title: string;
  lines: string[];
  tone?: "plain" | "cipher";
  highlightLine?: number;
  caption?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-raised/50 p-3">
      <p className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </p>
      <pre
        className={cn(
          "mt-2 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap transition-opacity duration-500 motion-reduce:transition-none",
          tone === "cipher" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {lines.map((line, i) => (
          <span
            key={`${line}-${i}`}
            className={cn(
              "block",
              highlightLine === i && "rounded bg-amber/20 px-1 text-foreground",
            )}
          >
            {line}
          </span>
        ))}
      </pre>
      {caption ? (
        <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------- Station 1 — Protect */

function ProtectStation({
  station,
  interaction,
  controller,
}: {
  station: CryptoProtectStation;
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const id = interaction.id;
  const phase = sceneState.answers[`${id}:phase`] ?? "plain";
  const encrypted = phase === "cipher";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={actionClass}
          disabled={encrypted}
          onClick={() => {
            answer(`${id}:phase`, "cipher");
            markUsed(`${id}:encrypt`);
          }}
        >
          {station.encryptAction}
        </button>
        <button
          type="button"
          className={quietActionClass}
          disabled={!encrypted}
          onClick={() => {
            answer(`${id}:phase`, "recovered");
            markUsed(`${id}:decrypt`);
          }}
        >
          {station.decryptAction}
        </button>
      </div>

      <div aria-live="polite">
        {encrypted ? (
          <DocumentPane
            title={`${station.documentTitle} — ciphertext`}
            lines={station.ciphertext}
            tone="cipher"
            caption={station.captions.ciphertext}
          />
        ) : (
          <DocumentPane
            title={`${station.documentTitle} — plaintext`}
            lines={station.plaintext}
            caption={
              phase === "recovered"
                ? station.captions.recovered
                : station.captions.plaintext
            }
          />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        State:{" "}
        {encrypted
          ? "ciphertext — unreadable without the decryption step"
          : phase === "recovered"
            ? "plaintext recovered, character for character"
            : "plaintext — readable by anyone who obtains the file"}
      </p>
    </div>
  );
}

/* ------------------------------------------------- Station 2 — Compare */

function CompareStation({
  station,
  interaction,
  controller,
}: {
  station: CryptoCompareStation;
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const id = interaction.id;
  const hashed = sceneState.used.includes(`${id}:hash`);
  const chosenId = sceneState.answers[`${id}:same`];
  const chosen = station.question.options.find((o) => o.id === chosenId);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 @2xl:grid-cols-2">
        {station.copies.map((copy) => (
          <div key={copy.id} className="space-y-2">
            <DocumentPane
              title={copy.label}
              lines={copy.lines}
              {...(copy.changedLineIndex !== undefined && hashed
                ? { highlightLine: copy.changedLineIndex }
                : {})}
            />
            <div
              className={cn(
                "rounded-md border p-3 transition-opacity duration-500 motion-reduce:transition-none",
                hashed
                  ? "border-primary/40 bg-primary/10 opacity-100"
                  : "border-border opacity-70",
              )}
            >
              <p className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                Digest display (illustrative)
              </p>
              <p className="mt-1 font-mono text-[0.7rem] break-all text-foreground">
                {hashed ? copy.digest : "— run the hash step —"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={actionClass}
        disabled={hashed}
        onClick={() => markUsed(`${id}:hash`)}
      >
        {station.hashAction}
      </button>

      {hashed ? (
        <fieldset className="rounded-md border border-border bg-surface-raised/40 p-4">
          <legend className="px-1 text-xs text-muted-foreground">
            {station.question.prompt}
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {station.question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={chosenId === option.id}
                onClick={() => answer(`${id}:same`, option.id)}
                className={cn(
                  "min-h-11 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  chosenId === option.id
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border hover:border-primary/60",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-3 text-sm text-foreground">
            {chosen?.response ?? ""}
          </p>
        </fieldset>
      ) : null}
    </div>
  );
}

/* -------------------------------------------- Station 3 — Sign & verify */

function SignStation({
  station,
  interaction,
  controller,
}: {
  station: CryptoSignStation;
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const id = interaction.id;
  const changed = sceneState.answers[`${id}:content`] === "changed";
  const lastVerify = sceneState.answers[`${id}:verify`];

  const lines = changed
    ? station.lines.map((line, i) =>
        i === station.change.lineIndex ? station.change.changedLine : line,
      )
    : station.lines;

  const result = lastVerify === "valid" ? station.results.valid : station.results.invalid;

  return (
    <div className="space-y-4">
      <DocumentPane
        title={station.documentTitle}
        lines={lines}
        {...(changed
          ? { highlightLine: station.change.lineIndex, caption: station.change.note }
          : {})}
      />

      <div className="rounded-md border border-border bg-surface-raised/50 p-3">
        <p className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          {station.signature.label}
        </p>
        <p className="mt-1 font-mono text-[0.7rem] break-all text-muted-foreground">
          {station.signature.value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Signed by {station.signature.signedBy} · verified with{" "}
          {station.signature.keyLabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={actionClass}
          onClick={() => {
            answer(`${id}:verify`, changed ? "invalid" : "valid");
            markUsed(changed ? `${id}:verified-invalid` : `${id}:verified-valid`);
          }}
        >
          {station.verifyAction}
        </button>
        <button
          type="button"
          className={quietActionClass}
          disabled={changed}
          onClick={() => {
            answer(`${id}:content`, "changed");
            answer(`${id}:verify`, "");
          }}
        >
          {station.changeAction}
        </button>
        <button
          type="button"
          className={quietActionClass}
          disabled={!changed}
          onClick={() => {
            answer(`${id}:content`, "original");
            answer(`${id}:verify`, "");
          }}
        >
          {station.restoreAction}
        </button>
      </div>

      <div aria-live="polite">
        {lastVerify === "valid" || lastVerify === "invalid" ? (
          <div
            className={cn(
              "rounded-md border p-4 transition-opacity duration-500 motion-reduce:transition-none",
              lastVerify === "valid"
                ? "border-evidence/50 bg-evidence/10"
                : "border-destructive/50 bg-destructive/10",
            )}
          >
            <StatusPill tone={lastVerify === "valid" ? "proven" : "failed"}>
              {lastVerify === "valid"
                ? "Signature verification: PASSED"
                : "Signature verification: FAILED"}
            </StatusPill>
            <p className="mt-2 font-display text-sm text-foreground">{result.headline}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{result.body}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run verification to see what the signature can and cannot establish.
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------- Station 4 — Public-key auth */

function AuthStation({
  station,
  interaction,
  controller,
}: {
  station: CryptoAuthStation;
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed, answer } = controller;
  const id = interaction.id;
  const placedCorrectly = station.items.every(
    (item) => sceneState.answers[item.id] === item.correctPlacement,
  );
  const connected = sceneState.used.includes(`${id}:connect`);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 @2xl:grid-cols-2">
        <div className="rounded-md border border-border bg-surface-raised/50 p-3">
          <p className="font-display text-sm text-foreground">{station.serverLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{station.serverDetail}</p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-foreground">
            {station.items
              .filter((i) => sceneState.answers[i.id] === "server")
              .map((i) => (
                <li key={i.id}>{i.label}</li>
              ))}
            {station.items.every((i) => sceneState.answers[i.id] !== "server") ? (
              <li className="text-muted-foreground">// authorized_keys is empty</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-surface-raised/50 p-3">
          <p className="font-display text-sm text-foreground">{station.keeperLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{station.keeperDetail}</p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-foreground">
            {station.items
              .filter((i) => sceneState.answers[i.id] === "keeper")
              .map((i) => (
                <li key={i.id}>{i.label}</li>
              ))}
          </ul>
        </div>
      </div>

      <ul className="space-y-2">
        {station.items.map((item) => {
          const placement = sceneState.answers[item.id] as
            | "server"
            | "keeper"
            | undefined;
          return (
            <li
              key={item.id}
              className="rounded-md border border-border bg-surface-raised/40 p-3"
            >
              <p className="font-mono text-sm text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={placement === "server"}
                  onClick={() => answer(item.id, "server")}
                  className={cn(
                    "min-h-11 rounded-md border px-3 text-sm transition-colors",
                    placement === "server"
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  Add to the server's authorized list
                </button>
                <button
                  type="button"
                  aria-pressed={placement === "keeper"}
                  onClick={() => answer(item.id, "keeper")}
                  className={cn(
                    "min-h-11 rounded-md border px-3 text-sm transition-colors",
                    placement === "keeper"
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  Keep with Ivy
                </button>
              </div>
              {placement ? (
                <p aria-live="polite" className="mt-2 text-sm text-foreground">
                  {item.responses[placement]}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={actionClass}
        disabled={!placedCorrectly || connected}
        onClick={() => markUsed(`${id}:connect`)}
      >
        {station.connect.action}
      </button>
      {!placedCorrectly ? (
        <p className="text-xs text-muted-foreground">
          Place each item where it belongs before running the login proof.
        </p>
      ) : null}

      {connected ? (
        <div className="space-y-2">
          <TerminalView
            label="Simulated login proof"
            lines={[`$ ${station.connect.command}`, ...station.connect.output]}
          />
          <p className="text-sm text-foreground">{station.connect.verdict}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------- Close — recap */

function RecapStation({
  station,
  interaction,
  controller,
}: {
  station: CryptoRecapStation;
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const { sceneState, markUsed } = controller;
  const id = interaction.id;
  const revealed = sceneState.used.includes(`${id}:bridge`);

  return (
    <div className="space-y-4">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          What each cryptographic tool is for
        </caption>
        <thead>
          <tr className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
            <th scope="col" className="border-b border-border py-2 pr-3">
              What we need
            </th>
            <th scope="col" className="border-b border-border py-2 pr-3">
              Tool
            </th>
            <th scope="col" className="border-b border-border py-2">
              Why
            </th>
          </tr>
        </thead>
        <tbody>
          {station.rows.map((row) => (
            <tr key={row.goal} className="align-top">
              <td className="border-b border-border/60 py-2 pr-3 text-foreground">
                {row.goal}
              </td>
              <td className="border-b border-border/60 py-2 pr-3 font-medium text-foreground">
                {row.tool}
              </td>
              <td className="border-b border-border/60 py-2 text-muted-foreground">
                {row.detail}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className={actionClass}
        disabled={revealed}
        onClick={() => markUsed(`${id}:bridge`)}
      >
        {station.revealAction}
      </button>

      <div aria-live="polite">
        {revealed ? (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-4 transition-opacity duration-500 motion-reduce:transition-none">
            <p className="font-display text-base text-foreground">
              “{station.bridge.question}”
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {station.bridge.note}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CryptoWorkbench({
  interaction,
  controller,
}: {
  interaction: CryptoWorkbenchInteraction;
  controller: ExperienceController;
}) {
  const station = interaction.station;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.62rem] tracking-[0.2em] text-primary uppercase">
          {interaction.stationLabel}
        </p>
        <h2 className="mt-1 font-display text-lg text-foreground">
          {interaction.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{interaction.instruction}</p>
      </div>

      <p className="rounded-md border border-amber/40 bg-amber/10 p-3 text-xs leading-relaxed text-foreground">
        {interaction.modelNote}
      </p>

      {station.kind === "protect" ? (
        <ProtectStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}
      {station.kind === "compare" ? (
        <CompareStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}
      {station.kind === "sign" ? (
        <SignStation station={station} interaction={interaction} controller={controller} />
      ) : null}
      {station.kind === "authenticate" ? (
        <AuthStation station={station} interaction={interaction} controller={controller} />
      ) : null}
      {station.kind === "recap" ? (
        <RecapStation
          station={station}
          interaction={interaction}
          controller={controller}
        />
      ) : null}

      {interaction.terms.length ? (
        <dl className="grid gap-2 rounded-md border border-border bg-surface-raised/40 p-4 @2xl:grid-cols-2">
          {interaction.terms.map((term) => (
            <div key={term.term}>
              <dt className="text-sm font-medium text-foreground">{term.term}</dt>
              <dd className="text-xs leading-relaxed text-muted-foreground">
                {term.meaning}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="rounded-md border border-border p-3 text-xs leading-relaxed text-muted-foreground">
        Boundary: {interaction.boundary}
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
