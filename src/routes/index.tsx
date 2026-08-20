import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { programs } from "@/lib/demo-lab/programs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CVI Demo Lab — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Interactive demonstrations, live missions, and technical scenarios for CyberVisionaries Institute.",
      },
      { property: "og:title", content: "CVI Demo Lab — CyberVisionaries Institute" },
      {
        property: "og:description",
        content:
          "Interactive demonstrations, live missions, and technical scenarios for CyberVisionaries Institute.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <DemoLabShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-8 sm:pt-24">
          <p className="text-xs tracking-[0.34em] text-primary uppercase">
            CyberVisionaries Institute
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] font-semibold text-foreground sm:text-6xl">
            CVI Demo Lab
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Interactive demonstrations, live missions, and technical scenarios for
            CyberVisionaries Institute. Used during live classes, and open afterward for
            reinforcement.
          </p>
          <p className="mt-4 max-w-2xl font-mono text-xs tracking-wide text-muted-foreground">
            observe → predict → interact → gather evidence → interpret → explain
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8" aria-label="Programs">
        <h2 className="font-display text-xs tracking-[0.24em] text-muted-foreground uppercase">
          Choose a training environment
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {programs.map((program) => (
            <Link
              key={program.id}
              to={program.route}
              className={`${program.themeClass} atmosphere group relative overflow-hidden rounded-2xl border border-border/70 p-8 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5`}
            >
              <span className="relative block text-xs tracking-[0.24em] text-primary uppercase">
                {program.tagline}
              </span>
              <span className="relative mt-4 block font-display text-3xl font-semibold text-foreground">
                {program.name}
              </span>
              <span className="relative mt-4 block max-w-md text-sm leading-relaxed text-muted-foreground">
                {program.description}
              </span>
              <span className="relative mt-8 flex items-center gap-2 text-sm text-foreground">
                Enter {program.name}
                <span aria-hidden="true" className="text-primary">
                  →
                </span>
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-primary/50"
              />
            </Link>
          ))}
        </div>
      </section>
    </DemoLabShell>
  );
}
