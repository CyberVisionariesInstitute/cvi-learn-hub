import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ProgramExperienceBrowser } from "@/components/demo-lab/ProgramExperienceBrowser";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { fromTheGridToCloudHeights as flagship } from "@/lib/demo-lab/experiences/from-the-grid-to-cloud-heights";
import gridToCloudHeights from "@/assets/environments/cyberfoundations/grid-to-cloud-heights.jpg";
import gridNeighborhoodDusk from "@/assets/environments/cyberfoundations/grid-neighborhood-dusk.jpg";

export const Route = createFileRoute("/cyberfoundations/")({
  head: () => ({
    meta: [
      { title: "CyberFoundations — CVI Demo Lab" },
      {
        name: "description",
        content:
          "Live missions and interactive scenarios for CyberFoundations, from The Grid to Cloud Heights.",
      },
      { property: "og:title", content: "CyberFoundations — CVI Demo Lab" },
      {
        property: "og:description",
        content:
          "Live missions and interactive scenarios for CyberFoundations, from The Grid to Cloud Heights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyberFoundationsPage,
});

function CyberFoundationsPage() {
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      {/* --------------------------------------------------- Program plate */}
      <section className="relative isolate overflow-hidden">
        <img
          src={gridToCloudHeights}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_30%] opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.05_250/0.5)_0%,oklch(0.11_0.05_250/0.8)_50%,var(--color-background)_100%)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8 sm:pt-28">
          <p className="text-xs tracking-[0.3em] text-primary uppercase">
            {cyberfoundations.tagline}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            {cyberfoundations.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">
            {cyberfoundations.description}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- Flagship mission */}
      <section
        className="mx-auto -mt-14 max-w-7xl px-5 sm:px-8"
        aria-labelledby="flagship-heading"
      >
        <div className="relative isolate overflow-hidden rounded-2xl border border-primary/30">
          <img
            src={gridNeighborhoodDusk}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-[60%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.11_0.05_250/0.94)_0%,oklch(0.11_0.05_250/0.8)_45%,oklch(0.11_0.05_250/0.35)_100%)]"
          />
          <div className="relative max-w-2xl p-6 sm:p-10">
            <p className="text-xs tracking-[0.24em] text-primary uppercase">
              Flagship live mission · {flagship.subtitle}
            </p>
            <h2
              id="flagship-heading"
              className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl"
            >
              {flagship.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/85">
              {flagship.description}
            </p>
            <ul className="mt-5 space-y-1.5">
              {flagship.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex gap-2 text-sm leading-snug text-foreground/80"
                >
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {objective}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to={flagship.route}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Enter the mission
                <span aria-hidden="true">→</span>
              </Link>
              <p className="font-mono text-xs text-muted-foreground">
                {flagship.scenes.length} scenes · ~{flagship.estimatedMinutes} min · no
                timers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ The program */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 className="font-display text-xs tracking-[0.24em] text-muted-foreground uppercase">
          The rest of the program
        </h2>
        <div className="mt-6">
          <ProgramExperienceBrowser program={cyberfoundations} />
        </div>
      </div>
    </DemoLabShell>
  );
}
