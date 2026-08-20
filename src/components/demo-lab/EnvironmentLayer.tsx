import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Environment } from "@/lib/demo-lab/types";

const surfaceLabel: Record<Environment["surface"], string> = {
  monitor: "Workstation monitor",
  "wall-display": "Wall display",
  whiteboard: "Whiteboard",
  "evidence-board": "Evidence board",
  terminal: "Terminal",
};

/**
 * Renders the believable real-world space a scene takes place in, and mounts
 * the interactive UI onto a surface that exists inside that space.
 */
export function EnvironmentLayer({
  environment,
  children,
  aside,
}: {
  environment: Environment;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section
      className="@container relative overflow-hidden rounded-xl border border-border/70 bg-surface/60"
      aria-label={`Environment: ${environment.name}`}
    >
      {environment.backgroundSrc ? (
        <img
          src={environment.backgroundSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
      ) : (
        <div
          aria-hidden="true"
          className="atmosphere absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, color-mix(in oklab, var(--surface) 20%, transparent), color-mix(in oklab, var(--background) 80%, transparent)), var(--atmosphere)",
          }}
        />
      )}

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-sm tracking-[0.18em] text-foreground uppercase">
            {environment.name}
          </h3>
          <p className="text-xs text-muted-foreground">{environment.description}</p>
        </div>

        <div className="mt-4 grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_20rem]">
          {/* The surface inside the environment that carries the interaction */}
          <div
            className={cn(
              "@container glass-panel relative rounded-lg p-4 sm:p-6",
              environment.surface === "terminal" && "bg-terminal/80 font-mono",
            )}
          >
            <div className="mb-3 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-primary"
              />
              {surfaceLabel[environment.surface]}
            </div>
            {children}
          </div>
          {aside ? <div className="flex flex-col gap-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
