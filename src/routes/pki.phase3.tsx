import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import trustCampus from "@/assets/environments/pki/trust-campus.jpg";
import { SCHEDULE, currentWeek, formatDeadline } from "@/lib/capstone/schedule";
import { STAGE_GROUPS } from "@/lib/capstone/grading";

export const Route = createFileRoute("/pki/phase3")({
  head: () => ({
    meta: [
      { title: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute" },
      {
        name: "description",
        content:
          "Overview, weekly deadlines and workspace entry for the Phase 3 PKI Architect Capstone: analyze, design, operate, test, adapt and defend a real PKI.",
      },
      {
        property: "og:title",
        content: "Phase 3 PKI Architect Capstone — CyberVisionaries Institute",
      },
      {
        property: "og:description",
        content:
          "Weeks 17–24. One assigned organization, one architecture, one defense. Overview and deadlines for capstone students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Phase3Landing,
});

function Phase3Landing() {
  const week = currentWeek();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={trustCampus}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_35%] opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.13_0.05_265/0.5)_0%,oklch(0.11_0.04_265/0.84)_55%,var(--color-background)_100%)]"
        />
        <div className="relative mx-auto max-w-5xl px-5 pt-20 pb-20 sm:px-8 sm:pt-28">
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Phase 3 · Weeks 17–24</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            PKI Architect Capstone
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">
            You are the PKI Architect for one assigned organization. Over eight weeks you analyze
            the environment, design the trust model, run certificate operations, test real
            workloads, respond to change, and defend every decision with evidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/pki/capstone"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Open My Capstone Assignment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/pki"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm text-foreground hover:border-primary/60"
            >
              Back to PKI Demo Lab
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-5 pb-20 sm:px-8">
        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="font-display text-2xl text-foreground">
            How the capstone works
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {STAGE_GROUPS.map((g) => (
              <article key={g.key} className="rounded-xl border border-border bg-surface/80 p-5">
                <p className="text-xs tracking-[0.2em] text-primary uppercase">
                  {g.label} · {g.weeks}
                </p>
                <h3 className="mt-2 font-display text-lg text-foreground">{g.headline}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {g.stages.join(" → ")}
                </p>
              </article>
            ))}
          </div>
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
                  w.week === week ? "border-primary/50 bg-primary/5" : "border-border bg-surface/70"
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
          <div className="mt-6">
            <Link
              to="/pki/capstone"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Go to My Capstone Assignment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
