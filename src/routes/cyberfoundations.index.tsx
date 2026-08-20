import { createFileRoute } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ProgramExperienceBrowser } from "@/components/demo-lab/ProgramExperienceBrowser";
import { cyberfoundations } from "@/lib/demo-lab/programs";

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
    ],
  }),
  component: CyberFoundationsPage,
});

function CyberFoundationsPage() {
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">
          {cyberfoundations.tagline}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-foreground sm:text-5xl">
          {cyberfoundations.name}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {cyberfoundations.description}
        </p>

        <div className="mt-14">
          <ProgramExperienceBrowser program={cyberfoundations} />
        </div>
      </div>
    </DemoLabShell>
  );
}
