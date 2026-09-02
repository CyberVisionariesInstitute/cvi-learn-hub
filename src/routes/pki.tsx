import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import trustCampus from "@/assets/environments/pki/trust-campus.jpg";
import { pki } from "@/lib/demo-lab/programs";
import { statusLabels } from "@/lib/demo-lab/programs";
import { ArrowRight, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/pki")({
  head: () => ({
    meta: [
      { title: "PKI — CVI Demo Lab" },
      {
        name: "description",
        content:
          "Certificate authority, key custody and revocation scenarios for the CyberVisionaries PKI program.",
      },
      { property: "og:title", content: "PKI — CVI Demo Lab" },
      {
        property: "og:description",
        content:
          "Certificate authority, key custody and revocation scenarios for the CyberVisionaries PKI program.",
      },
    ],
  }),
  component: PkiPage,
});

function PkiPage() {
  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <section className="relative isolate overflow-hidden">
        <img
          src={trustCampus}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_35%] opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.05_265/0.5)_0%,oklch(0.11_0.04_265/0.82)_55%,var(--color-background)_100%)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 sm:px-8 sm:pt-28">
          <p className="text-xs tracking-[0.3em] text-primary uppercase">{pki.tagline}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            PKI Demo Lab
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">
            {pki.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-4 pb-16 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {pki.modules.map((module) => (
            <section key={module.id} className="bg-surface p-7">
              <h2 className="text-xs tracking-[0.24em] text-primary uppercase">
                {module.label}
              </h2>
              <p className="mt-3 font-display text-xl text-foreground">{module.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {module.summary}
              </p>
              <ul className="mt-5 space-y-2">
                {module.weeks.map((week) => (
                  <li
                    key={week.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/70 pt-2 text-sm"
                  >
                    <span className="text-foreground">{week.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {statusLabels[week.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          className="mt-12 rounded-xl border border-border p-7"
          aria-label="PKI operating environments"
        >
          <h2 className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
            Operating environments
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pki.environments.map((environment) => (
              <li key={environment.id}>
                <p className="font-display text-sm text-foreground">{environment.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {environment.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DemoLabShell>
  );
}
