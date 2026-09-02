import type { ReactNode } from "react";

export function Panel({
  title,
  description,
  actions,
  children,
  id,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      aria-labelledby={id ? `${id}-h` : undefined}
      className="rounded-xl border border-border bg-surface/80 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={id ? `${id}-h` : undefined} className="font-display text-lg text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Btn({
  children,
  onClick,
  variant = "default",
  type = "button",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "quiet";
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const base =
    "inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : variant === "quiet"
        ? "text-muted-foreground hover:text-foreground"
        : "border border-border text-foreground hover:border-primary/60";
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-raised text-foreground/80",
    good: "bg-primary/15 text-primary",
    warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bad: "bg-destructive/15 text-destructive",
    info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>
  );
}

export function DataTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th
                key={h}
                className="py-2 pr-3 text-xs font-normal tracking-[0.14em] text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
