import { cn } from "@/lib/utils";
import type { SceneVisual } from "@/lib/demo-lab/types";

/**
 * Lesson artwork in its own clean bordered panel. Nothing is ever rendered on
 * top of the image — no gradient, no text, no control. Captions sit below.
 */
export function SceneVisualPanel({
  visual,
  className,
}: {
  visual: SceneVisual;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-depth)]">
        <img
          src={visual.src}
          alt={visual.alt}
          loading="lazy"
          className={cn(
            "block h-auto max-h-[26rem] w-full",
            visual.fit === "cover" ? "object-cover" : "object-contain",
          )}
        />
      </div>
      {visual.caption ? (
        <figcaption className="text-xs leading-relaxed text-muted-foreground">
          {visual.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
