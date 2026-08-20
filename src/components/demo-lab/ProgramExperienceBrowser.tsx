import { Link } from "@tanstack/react-router";
import {
  experienceTypeLabels,
  getExperience,
  statusLabels,
} from "@/lib/demo-lab/programs";
import type { Program } from "@/lib/demo-lab/types";

/** Week/module browser. Content-driven — no per-program page implementation. */
export function ProgramExperienceBrowser({ program }: { program: Program }) {
  return (
    <div className="space-y-14">
      {program.modules.map((module) => (
        <section key={module.id} aria-label={`${module.label} — ${module.title}`}>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/70 pb-3">
            <h2 className="font-display text-xs tracking-[0.24em] text-primary uppercase">
              {module.label}
            </h2>
            <p className="font-display text-xl text-foreground">{module.title}</p>
            <p className="text-sm text-muted-foreground">{module.summary}</p>
          </div>

          <ol className="mt-6 space-y-5">
            {module.weeks.map((week) => {
              const weekExperiences = week.experienceIds
                .map(getExperience)
                .filter((e) => e !== undefined);
              return (
                <li
                  key={week.id}
                  className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]"
                >
                  <div className="pt-1">
                    <p className="font-display text-sm tracking-[0.18em] text-foreground uppercase">
                      {week.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{week.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {statusLabels[week.status]}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{week.summary}</p>
                    {weekExperiences.map((experience) => (
                      <Link
                        key={experience.id}
                        to={experience.route}
                        className="glass-panel block rounded-xl p-6 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
                      >
                        <span className="flex flex-wrap items-center gap-3 text-xs tracking-[0.18em] uppercase">
                          <span className="text-primary">
                            {experienceTypeLabels[experience.type]}
                          </span>
                          <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
                            {statusLabels[experience.status]}
                          </span>
                          <span className="text-muted-foreground">
                            ~{experience.estimatedMinutes} min
                          </span>
                        </span>
                        <span className="mt-3 block font-display text-2xl text-foreground">
                          {experience.title}
                        </span>
                        <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {experience.description}
                        </span>
                        <span className="mt-4 flex items-center gap-2 text-sm text-foreground">
                          Open experience
                          <span aria-hidden="true" className="text-primary">
                            →
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
