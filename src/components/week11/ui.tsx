import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const btn = "min-h-11 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/60 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
export const btnPrimary = "min-h-11 rounded-md border border-primary/70 bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/30 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
export const input = "min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

export function Card({ title, eyebrow, children, className, actions }: { title?: ReactNode; eyebrow?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface-raised p-4 text-foreground sm:p-5", className)}>
      {(title || eyebrow || actions) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {eyebrow ? <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">{eyebrow}</p> : null}
            {title ? <h2 className="font-display text-lg">{title}</h2> : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Select({ label, value, onChange, options, id }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; id?: string }) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select id={id} className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, help, max = 5000 }: { label: string; value: string; onChange: (v: string) => void; rows?: number; help?: string; max?: number }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {help ? <span className="block text-xs text-muted-foreground">{help}</span> : null}
      <textarea className={cn(input, "mt-1")} rows={rows} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      <span className="block text-right text-[0.7rem] text-muted-foreground">{value.length}/{max}</span>
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "allow" | "deny" | "warn" | "info"; children: ReactNode }) {
  const t = {
    neutral: "border-border text-muted-foreground",
    allow: "border-primary/60 bg-primary/15 text-foreground",
    deny: "border-destructive/60 bg-destructive/15 text-foreground",
    warn: "border-amber/60 bg-amber/15 text-foreground",
    info: "border-border bg-surface text-foreground",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.7rem]", t)}>{children}</span>;
}

export function Decision({ d }: { d: string }) {
  if (d === "allow") return <Badge tone="allow">✓ ALLOW</Badge>;
  if (d === "deny") return <Badge tone="deny">✕ DENY</Badge>;
  return <Badge tone="warn">◌ PREVIEW</Badge>;
}

export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 break-words font-mono text-[0.8rem]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TableWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[36rem] text-left text-sm">{children}</table>
    </div>
  );
}
