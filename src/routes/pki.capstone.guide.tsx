import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { GUIDE_META, GUIDE_SECTIONS, type GuideBlock } from "@/lib/capstone/student-guide";
import { Btn } from "@/components/capstone/ui";

export const Route = createFileRoute("/pki/capstone/guide")({
  validateSearch: (search: Record<string, unknown>): { print: boolean } => ({
    print: Boolean(search['print']),
  }),
  component: StudentGuidePage,
});

function StudentGuidePage() {
  const { print } = Route.useSearch();

  useEffect(() => {
    if (!print) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [print]);

  return (
    <div className="space-y-6 print:space-y-4">
      <header className="rounded-xl border border-border bg-surface/80 p-6 print:border-0 print:p-0">
        <p className="text-xs tracking-[0.3em] text-primary uppercase">Student Guide</p>
        <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
          {GUIDE_META.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{GUIDE_META.tagline}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Meta label="Program format" value={GUIDE_META.format} />
          <Meta label="Your role" value={GUIDE_META.role} />
          <Meta label="Release basis" value={GUIDE_META.release} />
          <Meta label="Student journey" value={GUIDE_META.journey} />
        </dl>
        <div className="mt-5 flex flex-wrap gap-3 print:hidden">
          <Link
            to="/pki/capstone"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground hover:border-primary/60"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to My Capstone Assignment
          </Link>
          <Btn variant="primary" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print / Save as PDF
          </Btn>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav
          aria-label="Guide sections"
          className="h-max rounded-xl border border-border bg-surface/70 p-4 lg:sticky lg:top-6 print:hidden"
        >
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Contents</p>
          <ol className="mt-3 space-y-1 text-sm">
            {GUIDE_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded px-2 py-1.5 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                >
                  {section.number}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-6 print:space-y-4">
          {GUIDE_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-h`}
              className="scroll-mt-6 rounded-xl border border-border bg-surface/80 p-5 sm:p-6 print:break-inside-avoid print:border-0 print:p-0"
            >
              <h3 id={`${section.id}-h`} className="font-display text-lg text-foreground">
                {section.number}. {section.title}
              </h3>
              <div className="mt-3 space-y-4">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-foreground/90">{value}</dd>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  if (block.kind === "para") {
    return <p className="max-w-3xl text-sm leading-relaxed text-foreground/90">{block.text}</p>;
  }

  if (block.kind === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {block.head?.map((h) => (
                <th
                  key={h}
                  className="py-2 pr-4 text-xs font-normal tracking-[0.14em] text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows?.map((row, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4 align-top text-foreground/90">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const ListTag = block.kind === "steps" ? "ol" : "ul";
  return (
    <div>
      {block.text ? (
        <p className="max-w-3xl text-sm leading-relaxed text-foreground/90">{block.text}</p>
      ) : null}
      <ListTag
        className={`mt-2 max-w-3xl space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90 ${
          block.kind === "steps" ? "list-decimal" : "list-disc"
        }`}
      >
        {block.items?.map((item, i) => <li key={i}>{item}</li>)}
      </ListTag>
    </div>
  );
}
