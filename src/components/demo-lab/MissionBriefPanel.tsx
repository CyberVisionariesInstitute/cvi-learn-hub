import type { MissionBrief } from "@/lib/demo-lab/types";

/**
 * Explicit student mission instructions in a fully opaque, high-contrast
 * panel. Never drawn over artwork, never collapsed behind a tooltip.
 */

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h3 className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </h3>
      <div className="mt-1 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

export function MissionBriefPanel({ brief }: { brief: MissionBrief }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
      <h2 className="font-display text-base text-foreground">Mission brief</h2>
      <div className="mt-3 space-y-4">
        <Block label="Situation">
          <p>{brief.situation}</p>
        </Block>

        <Block label="Your mission">
          <p>{brief.mission}</p>
        </Block>

        {brief.steps?.length ? (
          <Block label="Do these steps">
            <ol className="list-decimal space-y-1 pl-5">
              {brief.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Block>
        ) : null}

        <Block label="Evidence to inspect">
          <ul className="list-disc space-y-1 pl-5">
            {brief.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Block>

        <Block label="Decision to make">
          <p className="font-medium">{brief.decision}</p>
        </Block>

        <Block label="What we are looking for">
          <p>{brief.lookingFor}</p>
        </Block>

        <Block label="Mission complete when">
          <p>{brief.completeWhen}</p>
        </Block>
      </div>
    </div>
  );
}
