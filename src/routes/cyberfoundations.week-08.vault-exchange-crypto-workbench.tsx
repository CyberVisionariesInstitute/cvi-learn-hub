import { createFileRoute } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ExperiencePlayer } from "@/components/demo-lab/ExperiencePlayer";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { ivyVaultHeroImage } from "@/lib/demo-lab/characters";
import { vaultExchangeCryptoWorkbench } from "@/lib/demo-lab/experiences/vault-exchange-crypto-workbench";

const description =
  "Week 8 interactive scenario: one incident report across four stations — encryption, hashing, digital signatures and public-key authentication — at the Cloud Heights Vault Exchange.";

export const Route = createFileRoute(
  "/cyberfoundations/week-08/vault-exchange-crypto-workbench",
)({
  head: () => ({
    meta: [
      { title: "Vault Exchange Crypto Workbench — CVI Demo Lab" },
      { name: "description", content: description },
      {
        property: "og:title",
        content: "Vault Exchange Crypto Workbench — CVI Demo Lab",
      },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkbenchPage,
});

function WorkbenchPage() {
  const experience = vaultExchangeCryptoWorkbench;
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <header className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <div className="glass-panel grid gap-6 overflow-hidden rounded-xl p-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div>
            <p className="font-display text-xs tracking-[0.24em] text-primary uppercase">
              Module 3 · Week 8 · Interactive Scenario · ~
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
          <img
            src={ivyVaultHeroImage}
            alt="Ivy, Security Analyst — Vault Access Level 3, at the Vault Exchange"
            className="h-full w-full rounded-lg object-cover"
            loading="lazy"
          />
        </div>
      </header>
      <ExperiencePlayer
        experience={experience}
        environments={cyberfoundations.environments}
      />
    </DemoLabShell>
  );
}
