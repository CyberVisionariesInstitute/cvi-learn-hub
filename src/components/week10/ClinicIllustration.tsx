import type { ClinicIllustration as ClinicIllustrationData } from "@/lib/week10/clinic-art";
import { cn } from "@/lib/utils";

export function ClinicIllustration({
  illustration,
  className,
  priority = false,
}: {
  illustration: ClinicIllustrationData;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-border bg-background", className)}>
      <a
        href={illustration.src}
        target="_blank"
        rel="noreferrer"
        aria-label="Open this illustration at full size in a new tab"
        className="block bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <img
          src={illustration.src}
          alt={illustration.alt}
          loading={priority ? "eager" : "lazy"}
          className="aspect-video h-auto w-full object-contain"
        />
      </a>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>Illustration — open evidence cards for exact details.</span>
        <a
          href={illustration.src}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          View full size
        </a>
      </figcaption>
    </figure>
  );
}
