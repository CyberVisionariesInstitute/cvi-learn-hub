import { createFileRoute, Link } from "@tanstack/react-router";
import trustCampus from "@/assets/environments/pki/trust-campus.jpg";
import { ArrowLeft, ArrowUpRight, BookOpen, ShieldCheck, Lock, ScrollText, LifeBuoy, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/pki/capstone")({
  head: () => ({
    meta: [
      { title: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Student-facing doorway for the CyberVisionaries Institute Phase 3 PKI Architect Capstone, Weeks 17–24.",
      },
      {
        property: "og:title",
        content: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute",
      },
      {
        property: "og:description",
        content:
          "Student-facing doorway for the CyberVisionaries Institute Phase 3 PKI Architect Capstone, Weeks 17–24.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cvi-learn-hub.lovable.app/pki/capstone" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://cvi-learn-hub.lovable.app/pki/capstone" },
    ],
  }),
  component: PkiCapstonePage,
});

const roadmap = [
  { week: 17, title: "Scenario Analysis & Requirements", emphasis: "Understand the organization, constraints, and what must be protected." },
  { week: 18, title: "Trust Model & PKI Hierarchy", emphasis: "Design the root, intermediate, and issuing authority relationships." },
  { week: 19, title: "VM, HSM, Network & Service Architecture", emphasis: "Place the infrastructure that will carry the PKI." },
  { week: 20, title: "Certificate Strategy & Issuance Design", emphasis: "Match certificate types, lifecycles, and validation workflows to workloads." },
  { week: 21, title: "Lifecycle Automation, CRL & OCSP", emphasis: "Automate issuance, renewal, and revocation visibility." },
  { week: 22, title: "Workload & Failure Testing", emphasis: "Test against realistic traffic, outages, and misuse cases." },
  { week: 23, title: "Change/Incident & Architecture Revision", emphasis: "Respond to a deliberate change and justify the revised design." },
  { week: 24, title: "Final Portfolio & Defense", emphasis: "Present evidence, decisions, and lessons learned." },
];

const workflowSteps = [
  { label: "Analyze", description: "Read the scenario, map stakeholders, and identify trust boundaries." },
  { label: "Design", description: "Propose a hierarchy and issuance strategy that fits the constraints." },
  { label: "Connect", description: "Wire services, networks, and automation into a working architecture." },
  { label: "Operate", description: "Run issuance, renewal, and revocation processes under load." },
  { label: "Validate", description: "Check that workloads trust only the intended certificates." },
  { label: "Test", description: "Inject failures and misuse cases to find weak points." },
  { label: "Adapt", description: "Revise the architecture based on what the tests reveal." },
  { label: "Re-test", description: "Confirm the revised design behaves as claimed." },
  { label: "Defend", description: "Present evidence for every major trust decision." },
];

const strongWork = [
  "Traceable requirements",
  "Defensible architecture and trust decisions",
  "Responsible certificate ownership and lifecycle design",
  "Evidence-based troubleshooting",
  "Before/after change analysis",
  "Professional evidence and final defense",
];

const beforeYouBegin = [
  "Read the full Scenario Brief before building.",
  "Begin with scenario analysis and requirements.",
  "Save work regularly.",
  "Use only your assigned scenario/project.",
  "Keep the Student Guide available while working.",
];

function PkiCapstonePage() {
  return (
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={trustCampus}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_30%] opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.22_0.04_246/0.55)_0%,oklch(0.24_0.04_246/0.88)_55%,var(--color-background)_100%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-20 pb-24 sm:px-8 sm:pt-28">
          <Link
            to="/pki"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to PKI Demo Lab
          </Link>

          <p className="text-xs tracking-[0.3em] text-primary uppercase">
            CyberVisionaries Institute • Phase 3
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
            PKI Architect Capstone
          </h1>
          <p className="max-w-2xl font-display text-xl text-foreground/90 sm:text-2xl">
            Design. Defend. Operate. Adapt.
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/85">
            This is the eight-week culminating PKI capstone, Weeks 17–24. Each student acts as the PKI Architect for one assigned fictional organization. You will analyze the scenario, build a defensible certificate infrastructure, operate it under load and failure, respond to a change or incident, and present a professional defense of your decisions.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://phase3-simulator-wireframe.toniadwebster.chatgpt.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-object)] transition-colors hover:bg-primary/90 focus-visible:outline-offset-4"
            >
              Open My Capstone Assignment
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#roadmap"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface-raised/80 focus-visible:outline-offset-4"
            >
              Review the 8-Week Roadmap
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
            You will leave this portal to open the Phase 3 simulator. The simulator remains the authoritative application for authentication, assignment, project ownership, scenario-version locking, and security enforcement.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8">
        {/* Before You Begin */}
        <section aria-labelledby="before-you-begin" className="rounded-xl border border-border bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-primary" aria-hidden="true" />
            <h2 id="before-you-begin" className="font-display text-xl text-foreground sm:text-2xl">
              Before You Begin
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {beforeYouBegin.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface-raised/70 p-4 text-sm text-foreground/90">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 8-Week Roadmap */}
        <section aria-labelledby="roadmap" className="mt-12 scroll-mt-6" id="roadmap">
          <div className="flex items-center gap-3">
            <ScrollText className="size-5 text-primary" aria-hidden="true" />
            <h2 id="roadmap" className="font-display text-xl text-foreground sm:text-2xl">
              8-Week Roadmap
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Each week builds on the last. Skipping ahead without finishing the analysis and design stages usually creates more work later.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item, index) => (
              <li
                key={item.week}
                className="group relative flex flex-col gap-2 rounded-xl border border-border bg-surface/70 p-5 transition-colors hover:border-primary/50 hover:bg-surface-raised/80"
              >
                <span className="absolute right-4 top-4 font-display text-2xl font-semibold text-muted-foreground/40 transition-colors group-hover:text-primary/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-primary uppercase">
                  Week {item.week}
                </span>
                <h3 className="mt-1 font-display text-base font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.emphasis}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* How Phase 3 Works */}
        <section aria-labelledby="how-it-works" className="mt-14">
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-primary" aria-hidden="true" />
            <h2 id="how-it-works" className="font-display text-xl text-foreground sm:text-2xl">
              How Phase 3 Works
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The capstone follows a single engineering loop repeated at increasing depth. Decisions made early affect certificate operations, workload trust, and how well you can respond to later change.
          </p>
          <div className="mt-6 flex flex-wrap items-stretch gap-2">
            {workflowSteps.map((step, index) => (
              <div key={step.label} className="flex min-w-0 flex-1 basis-[9rem] flex-col gap-2 rounded-lg border border-border bg-surface/70 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-display text-sm font-medium text-foreground">
                    {step.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What Strong Work Looks Like */}
        <section aria-labelledby="strong-work" className="mt-14 rounded-xl border border-border bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
          <h2 id="strong-work" className="font-display text-xl text-foreground sm:text-2xl">
            What Strong Work Looks Like
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {strongWork.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
            There is no single hidden perfect diagram. Strong work is work you can explain and defend with evidence from your own scenario.
          </p>
        </section>

        {/* Individual Assignment Callout */}
        <section aria-labelledby="individual-assignment" className="mt-12 rounded-xl border border-border bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
          <h2 id="individual-assignment" className="font-display text-xl text-foreground sm:text-2xl">
            Your Assignment Is Individual
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            You may discuss general PKI concepts, tools, and design principles with classmates. You may not exchange scenario packages, project exports, completed diagrams, scenario-specific answers, or evidence portfolios. Your final defense must reflect your own analysis and decisions.
          </p>
        </section>

        {/* Support */}
        <section aria-labelledby="support" className="mt-12">
          <div className="flex items-center gap-3">
            <LifeBuoy className="size-5 text-primary" aria-hidden="true" />
            <h2 id="support" className="font-display text-xl text-foreground sm:text-2xl">
              Need Help?
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            If something looks wrong inside the simulator, capture the visible message, the current stage, the last confirmed saved state, and the exact action that triggered the issue before contacting your instructor. Never send passwords, tokens, or another student&apos;s project file.
          </p>
        </section>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface-raised/70 p-8 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-foreground">Ready to start?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open the Phase 3 simulator to access your assigned capstone project.
            </p>
          </div>
          <a
            href="https://phase3-simulator-wireframe.toniadwebster.chatgpt.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-object)] transition-colors hover:bg-primary/90 focus-visible:outline-offset-4"
          >
            Open My Capstone Assignment
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </DemoLabShell>
  );
}
