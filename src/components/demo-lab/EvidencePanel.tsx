import type { EvidenceItem } from "@/lib/demo-lab/types";

const statusText: Record<NonNullable<EvidenceItem["status"]>, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  "no-response": "No response",
  unknown: "Unknown",
};

const statusDot: Record<NonNullable<EvidenceItem["status"]>, string> = {
  healthy: "bg-evidence",
  degraded: "bg-amber",
  "no-response": "bg-destructive",
  unknown: "bg-muted-foreground",
};

/** Evidence is always labelled in text — never carried by colour alone. */
export function EvidencePanel({
  items,
  title = "Evidence",
}: {
  items: EvidenceItem[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="glass-panel rounded-lg p-4" aria-label={title}>
      <h3 className="font-display text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </h3>
      <dl className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="font-mono text-sm text-foreground">
              {item.value}
              {item.status ? (
                <span className="ml-2 inline-flex items-center gap-1.5 rounded border border-border px-1.5 py-0.5 font-sans text-[0.68rem] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className={`inline-block size-1.5 rounded-full ${statusDot[item.status]}`}
                  />
                  {statusText[item.status]}
                </span>
              ) : null}
            </dd>
            {item.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
