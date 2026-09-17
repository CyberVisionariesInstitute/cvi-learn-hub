import { createFileRoute } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ExperiencePlayer } from "@/components/demo-lab/ExperiencePlayer";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { SceneVisualPanel } from "@/components/demo-lab/SceneVisualPanel";
import { trustAuthorityVisuals } from "@/lib/demo-lab/experiences/trust-authority-visuals";
import { trustAuthority } from "@/lib/demo-lab/experiences/trust-authority";

const description =
  "Week 9 interactive scenario: inspect a certificate, follow the trust chain, investigate three warnings, and decide whether Ivy can trust the connection — in plain language, with nothing timed or graded.";

export const Route = createFileRoute("/cyberfoundations/week-09/trust-authority")({
  head: () => ({
    meta: [
      { title: "The Trust Authority — CVI Demo Lab" },
      { name: "description", content: description },
      { property: "og:title", content: "The Trust Authority — CVI Demo Lab" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustAuthorityPage,
});

function TrustAuthorityPage() {
  const experience = trustAuthority;
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <header className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <div className="glass-panel grid gap-6 overflow-hidden rounded-xl p-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div>
            <p className="font-display text-xs tracking-[0.24em] text-primary uppercase">
              Module 3 · Week 9 · Interactive Scenario · ~
              {experience.estimatedMinutes} min
            </p>
            <h1 className="mt-3 font-display text-3xl text-foreground">
              {experience.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {experience.subtitle}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground">
              {experience.description}
            </p>
          </div>
          <SceneVisualPanel visual={trustAuthorityVisuals.openingBriefing} />
        </div>
      </header>
      <ExperiencePlayer
        experience={experience}
        environments={cyberfoundations.environments}
      />
    </DemoLabShell>
  );
}
