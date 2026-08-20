import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Simulated terminal. Output is authored content, never executed. */
export function TerminalView({
  lines,
  label = "Terminal",
  className,
}: {
  lines: string[];
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-terminal/90 shadow-inner",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1.5 text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
        <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary" />
        {label}
      </div>
      <pre
        aria-live="polite"
        className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed text-terminal-foreground sm:text-sm"
      >
        {lines.length ? lines.join("\n") : "// no commands run yet"}
      </pre>
    </div>
  );
}

/** Status is always carried by text as well as tone. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "neutral" | "proven" | "unproven" | "failed" | "attention";
  children: ReactNode;
}) {
  const toneClass = {
    neutral: "border-border text-muted-foreground",
    proven: "border-evidence/60 bg-evidence/10 text-foreground",
    unproven: "border-border bg-surface-raised/60 text-muted-foreground",
    failed: "border-destructive/60 bg-destructive/10 text-foreground",
    attention: "border-amber/60 bg-amber/10 text-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[0.68rem] tracking-wide",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function SurfaceHeading({
  eyebrow,
  title,
  instruction,
  note,
}: {
  eyebrow?: string;
  title: string;
  instruction?: string;
  note?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-[0.65rem] tracking-[0.22em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 font-display text-lg text-foreground">{title}</h2>
      {instruction ? (
        <p className="mt-2 text-sm text-muted-foreground">{instruction}</p>
      ) : null}
      {note ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** Ivy speaking inside an interaction surface. */
export function IvyNote({
  headline,
  children,
  tone = "neutral",
}: {
  headline: string;
  children?: ReactNode;
  tone?: "neutral" | "attention" | "proven";
}) {
  const toneClass = {
    neutral: "border-primary/40 bg-primary/10",
    attention: "border-amber/50 bg-amber/10",
    proven: "border-evidence/50 bg-evidence/10",
  }[tone];
  return (
    <div className={cn("rounded-md border p-4", toneClass)}>
      <p className="font-display text-sm text-foreground">{headline}</p>
      {children ? (
        <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
      ) : null}
    </div>
  );
}

export interface PlacementItem {
  id: string;
  label: string;
}

export interface PlacementBucket {
  id: string;
  label: string;
  description: string;
}

/**
 * Shared placement surface for board-style sorting (incident board, briefing
 * displays). Works with mouse drag, keyboard select → place, and tap → tap.
 */
export function PlacementBoard({
  items,
  buckets,
  placement,
  selectedId,
  onSelect,
  onPlace,
  onUnplace,
  statusOf,
  trayLabel = "Unplaced cards",
}: {
  items: PlacementItem[];
  buckets: PlacementBucket[];
  placement: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPlace: (itemId: string, bucketId: string) => void;
  onUnplace: (itemId: string) => void;
  statusOf: (itemId: string) => "correct" | "incorrect" | undefined;
  trayLabel?: string;
}) {
  const tray = items.filter((i) => !placement[i.id]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
          {trayLabel}
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {tray.length === 0 ? (
            <li className="text-sm text-muted-foreground">Every card is on the board.</li>
          ) : null}
          {tray.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", item.id);
                  onSelect(item.id);
                }}
                onClick={() => onSelect(selectedId === item.id ? null : item.id)}
                aria-pressed={selectedId === item.id}
                className={cn(
                  "min-h-11 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  selectedId === item.id
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-surface-raised/50 text-foreground hover:border-primary/60",
                )}
              >
                {item.label}
                {selectedId === item.id ? (
                  <span className="ml-2 text-xs text-primary">selected</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {buckets.map((bucket) => {
          const placed = items.filter((i) => placement[i.id] === bucket.id);
          return (
            <section
              key={bucket.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) onPlace(id, bucket.id);
              }}
              className="rounded-lg border border-border bg-surface-raised/40 p-3"
              aria-label={bucket.label}
            >
              <h3 className="font-display text-xs tracking-[0.18em] text-foreground uppercase">
                {bucket.label}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{bucket.description}</p>
              <button
                type="button"
                disabled={!selectedId}
                onClick={() => selectedId && onPlace(selectedId, bucket.id)}
                className="mt-3 min-h-11 w-full rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground disabled:opacity-40"
              >
                {selectedId ? `Place here` : "Select a card first"}
              </button>
              <ul className="mt-3 space-y-2">
                {placed.map((item) => {
                  const status = statusOf(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onUnplace(item.id)}
                        className={cn(
                          "min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm",
                          status === "correct"
                            ? "border-evidence/60 bg-evidence/10"
                            : status === "incorrect"
                              ? "border-amber/60 bg-amber/10"
                              : "border-border",
                        )}
                      >
                        <span className="block text-foreground">{item.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {status === "correct"
                            ? "Placed correctly — select to move"
                            : status === "incorrect"
                              ? "Questioned — select to move"
                              : "Select to move"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
