import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/lib/week10/useWeek10";
import type { StudyMode } from "@/lib/week10/state";

/** Opaque, high-contrast content panel. Text never sits on artwork. */
export function Panel({
  title,
  eyebrow,
  children,
  className,
  id,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-border bg-surface-raised p-5 text-foreground shadow-sm",
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-display text-xs tracking-[0.22em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-1 font-display text-lg text-foreground">{title}</h2>
      ) : null}
      <div className={title || eyebrow ? "mt-3" : undefined}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  help,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {help ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">{help}</span>
      ) : null}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );
}

/** Hints are only offered in guided mode; basic instructions never hide. */
export function Hint({ mode, children }: { mode: StudyMode; children: ReactNode }) {
  if (mode !== "guided") return null;
  return (
    <details className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        Show a hint
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </details>
  );
}

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: StudyMode;
  onChange: (mode: StudyMode) => void;
}) {
  return (
    <fieldset className="rounded-md border border-border bg-surface-raised p-3">
      <legend className="px-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
        Study mode
      </legend>
      <div className="flex flex-wrap gap-2">
        {(["guided", "independent"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-pressed={mode === m}
            className={cn(
              "min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
              mode === m
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/60",
            )}
          >
            {m === "guided" ? "Guided — hints available" : "Independent — hints hidden"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Instructions and completion criteria are always shown in both modes. Independent
        mode only hides optional hints and the worked example.
      </p>
    </fieldset>
  );
}

export function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <p
      aria-live="polite"
      className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-muted-foreground"
    >
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Ready"} · Saved on
      this browser/device only. This is not cross-device sync — use the JSON backup to move
      your work.
    </p>
  );
}

export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>
          {done} of {total} ({pct}%)
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="mt-1 h-2 w-full overflow-hidden rounded-full border border-border bg-background"
      >
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
