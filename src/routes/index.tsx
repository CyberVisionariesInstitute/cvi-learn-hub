import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { programs } from "@/lib/demo-lab/programs";
import type { ProgramId } from "@/lib/demo-lab/types";
import gridToCloudHeights from "@/assets/environments/cyberfoundations/grid-to-cloud-heights.jpg";
import trustCampus from "@/assets/environments/pki/trust-campus.jpg";

/** Entry art per program. Swapped here when final environment art lands. */
const programEntryArt: Record<ProgramId, { src: string; place: string }> = {
  cyberfoundations: { src: gridToCloudHeights, place: "The Grid, looking up" },
  pki: { src: trustCampus, place: "The Trust Campus approach" },
};

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <DemoLabShell>
      {/* ------------------------------------------------------ Hero plate */}
      <section className="relative isolate overflow-hidden">
        <img
          src={gridToCloudHeights}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_35%] opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.05_260/0.55)_0%,oklch(0.12_0.05_260/0.75)_45%,var(--color-background)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-28 sm:px-8 sm:pt-36 sm:pb-40">
          <p className="text-xs tracking-[0.34em] text-primary uppercase">
            CyberVisionaries Institute
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.03] font-semibold text-foreground sm:text-6xl">
            CVI Demo Lab
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85">
            Step into the environments the work actually happens in. Live missions run
            during class, and stay open afterward for reinforcement.
          </p>
          <p className="mt-6 max-w-2xl font-mono text-xs tracking-wide text-muted-foreground">
            observe → predict → interact → gather evidence → interpret → explain
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- Program portals */}
      <section
        className="mx-auto -mt-16 max-w-7xl px-5 pb-24 sm:px-8"
        aria-label="Training environments"
      >
        <h2 className="font-display text-xs tracking-[0.24em] text-muted-foreground uppercase">
          Enter a training environment
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {programs.map((program) => {
            const art = programEntryArt[program.id];
            return (
              <Link
                key={program.id}
                to={program.route}
                aria-label={`Enter ${program.name}`}
                className={`${program.themeClass} scene-depth group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl border border-border/30 shadow-[var(--shadow-depth)] outline-offset-4 sm:aspect-[16/10]`}
              >
                <img
                  src={art.src}
                  alt=""
                  aria-hidden="true"
                  className="absolute -inset-2 size-[calc(100%+1rem)] object-cover transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-[1.045] group-focus-visible:-translate-y-1 group-focus-visible:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.12_0.05_260/0.25)_0%,oklch(0.12_0.05_260/0.55)_45%,oklch(0.1_0.04_260/0.92)_100%)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
                />
                <span aria-hidden="true" className="absolute inset-0 opacity-0 shadow-[inset_0_0_70px_color-mix(in_oklab,var(--primary)_20%,transparent)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span aria-hidden="true" className="absolute inset-x-[6%] bottom-0 h-8 rounded-[50%] bg-background/70 blur-xl" />
                <span className="relative block translate-z-8 border-t border-border/25 bg-background/35 p-6 backdrop-blur-[2px] transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 sm:p-8 motion-reduce:transition-none">
                  <span className="block text-xs tracking-[0.24em] text-primary uppercase">
                    {program.tagline}
                  </span>
                  <span className="mt-3 block font-display text-3xl font-semibold text-foreground sm:text-4xl">
                    {program.name}
                  </span>
                  <span className="mt-3 block max-w-md text-sm leading-relaxed text-foreground/80">
                    {program.description}
                  </span>
                  <span className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground">
                    Enter {program.name}
                    <span
                      aria-hidden="true"
                      className="text-primary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </span>
                  <span className="mt-2 block font-mono text-[0.7rem] text-muted-foreground">
                    {art.place}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </DemoLabShell>
  );
}
