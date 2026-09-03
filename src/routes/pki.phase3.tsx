import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import trustCampus from "@/assets/environments/pki/trust-campus.jpg";
import { SCHEDULE, currentWeek, formatDeadline } from "@/lib/capstone/schedule";
import { STAGE_GROUPS } from "@/lib/capstone/grading";
import { RUBRIC_CATEGORIES, RUBRIC_TOTAL_POINTS } from "@/lib/capstone/rubric-categories";

export const Route = createFileRoute("/pki/phase3")({
  head: () => ({
    meta: [
      { title: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Student portal for the Phase 3 PKI Architect Capstone: workspace, guide, portfolio, defense schedule, weekly deadlines, and the approved 100-point rubric.",
      },
      {
        property: "og:title",
        content: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute",
      },
      {
        property: "og:description",
        content:
          "Student portal for the CVI Phase 3 PKI Architect Capstone. Workspace, guide, portfolio, and deadlines in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Phase3Portal,
});

function Phase3Portal() {
  const week = currentWeek();

  return (
    <div className="program-pki">
      <section className="relative isolate overflow-hidden">
        <img
          src={trustCampus}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_35%] opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.05_265/0.55)_0%,oklch(0.11_0.04_265/0.88)_55%,var(--color-background)_100%)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 text-primary" aria-hidden="true" />
            <p className="text-xs tracking-[0.3em] text-primary uppercase">
              CyberVisionaries Institute · Phase 3
            </p>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
            PKI Architect Capstone
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            You are the PKI Architect for one assigned organization. Over eight weeks you analyze
            the environment, design the trust model, run certificate operations, test real
            workloads, respond to a live change, and defend every decision with evidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/pki/capstone"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-object)] transition-colors hover:bg-primary/90"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Open My Capstone Workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/pki/capstone/guide"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm text-foreground transition-colors hover:border-primary/60"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Read the Student Guide
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
            The workspace and guide require the student account your instructor enrolled. There is
            no public scenario catalog and no self-service sign-up.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-5 pb-20 sm:px-8">
        {week ? (
          <CurrentWeekBanner week={week} />
        ) : (
          <section className="rounded-xl border border-border bg-surface/80 p-5">
            <p className="text-sm text-muted-foreground">
              The current capstone window has ended. Contact your instructor if you need to finish
              late or request a portfolio extension.
            </p>
          </section>
        )}

        <section aria-labelledby="student-portal">
          <h2 id="student-portal" className="font-display text-2xl text-foreground">
            Student portal
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Everything you need for the capstone is linked below. Start in the workspace; the guide
            explains each stage, the rubric, and defense expectations.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PortalCard
              to="/pki/capstone"
              icon={<LayoutDashboard className="size-5" aria-hidden="true" />}
              title="Capstone Workspace"
              description="Your assigned scenario, stage work, evidence, instructor feedback, and save/export."
              action="Open workspace"
              primary
            />
            <PortalCard
              to="/pki/capstone/guide"
              icon={<BookOpen className="size-5" aria-hidden="true" />}
              title="Student Guide"
              description="Role, weekly roadmap, checkpoints, 100-point rubric, glossary, and portfolio guidance."
              action="Read the guide"
            />
            <PortalCard
              to="/pki/capstone"
              icon={<FolderGit2 className="size-5" aria-hidden="true" />}
              title="Portfolio Package"
              description="Generate a sanitized GitHub-ready zip from your saved work. Available inside the workspace."
              action="Go to workspace"
            />
            <PortalCard
              to="/pki/capstone/$stage"
              params={{ stage: "defend" }}
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
              title="Defense Stage"
              description="Submit your portfolio and prepare for your live defense. Unlocks after you complete earlier stages."
              action="Open Defend"
            />
          </div>
        </section>

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="font-display text-2xl text-foreground">
            How the capstone works
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {STAGE_GROUPS.map((g) => (
              <article
                key={g.key}
                className="rounded-xl border border-border bg-surface/80 p-5 transition-colors hover:border-primary/40"
              >
                <p className="text-xs tracking-[0.2em] text-primary uppercase">
                  {g.label} · {g.weeks}
                </p>
                <h3 className="mt-2 font-display text-lg text-foreground">{g.headline}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.stages.join(" → ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="rubric">
          <h2 id="rubric" className="font-display text-2xl text-foreground">
            100-point rubric
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Your final grade is built from these nine categories. Defense presentation quality is
            scored inside Evidence &amp; presentation and Professional practice — no extra points are
            added.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RUBRIC_CATEGORIES.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-border bg-surface/70 p-4"
              >
                <p className="font-display text-2xl text-primary">{c.points}</p>
                <p className="mt-1 text-sm text-foreground">{c.area}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Total possible: <strong className="text-foreground">{RUBRIC_TOTAL_POINTS} points</strong>
          </p>
        </section>

        <section aria-labelledby="deadlines">
          <h2
            id="deadlines"
            className="flex items-center gap-2 font-display text-2xl text-foreground"
          >
            <CalendarDays className="size-5 text-primary" aria-hidden="true" />
            Weekly deadlines
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each deliverable is due 23:59 on the Friday of that week. Work is saved continuously in
            your workspace — the deadline is when it must be complete and evidenced.
          </p>
          <ul className="mt-5 space-y-2">
            {SCHEDULE.map((w) => (
              <li
                key={w.week}
                className={`rounded-xl border p-4 ${
                  w.week === week
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-surface/70"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-base text-foreground">
                    Week {w.week} — {w.title}
                    {w.week === week ? (
                      <span className="ml-2 rounded bg-primary/15 px-2 py-0.5 text-xs text-primary">
                        Current
                      </span>
                    ) : null}
                  </p>
                  <span className="text-xs text-muted-foreground">Due {formatDeadline(w.week)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{w.focus}</p>
                <p className="mt-1 text-sm text-foreground/85">Deliverable: {w.deliverable}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="expectations"
          className="rounded-xl border border-border bg-surface/80 p-6"
        >
          <h2
            id="expectations"
            className="flex items-center gap-2 font-display text-xl text-foreground"
          >
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            What strong work looks like
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90">
            <li>Every design choice is traced to a requirement or a constraint in your brief.</li>
            <li>Failures are diagnosed, corrected and re-tested — not hidden.</li>
            <li>Change and incident response is evidenced before and after.</li>
            <li>You can defend the architecture out loud, without the diagram in front of you.</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            There is no single perfect diagram. Your capstone is individual: you see only your own
            assignment, and your work is private to you and your instructor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/pki/capstone"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-object)] transition-colors hover:bg-primary/90"
            >
              Go to My Capstone Assignment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/pki"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm text-foreground transition-colors hover:border-primary/60"
            >
              Back to PKI Demo Lab
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function CurrentWeekBanner({ week }: { week: number }) {
  const entry = SCHEDULE.find((w) => w.week === week);
  if (!entry) return null;
  return (
    <section
      aria-label="Current week"
      className="rounded-xl border border-primary/40 bg-primary/10 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-primary uppercase">
            Current focus · Week {week}
          </p>
          <h3 className="mt-1 font-display text-xl text-foreground">{entry.title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{entry.focus}</p>
          <p className="mt-2 text-sm text-foreground/85">
            Deliverable due Friday: <span className="text-foreground">{entry.deliverable}</span>
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.14em]">Deadline</p>
          <p className="mt-1 font-display text-lg text-foreground">{formatDeadline(week)}</p>
          <Link
            to="/pki/capstone"
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-primary/60"
          >
            Continue in workspace
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface PortalCardProps {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  primary?: boolean;
}

function PortalCard({ to, params, icon, title, description, action, primary }: PortalCardProps) {
  return (
    <Link
      to={to}
      params={params as any}
      className={`group flex h-full flex-col rounded-xl border p-5 transition-all ${
        primary
          ? "border-primary/40 bg-primary/5 hover:border-primary/70"
          : "border-border bg-surface/80 hover:border-primary/40"
      }`}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-lg ${
          primary ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
        }`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-base text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:underline">
        {action}
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
