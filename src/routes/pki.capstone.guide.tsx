import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, Search, X, BookmarkCheck } from "lucide-react";
import { GUIDE_META, GUIDE_SECTIONS, type GuideBlock, type GuideSection } from "@/lib/capstone/student-guide";
import { downloadGuidePdf } from "@/lib/capstone/guide-pdf";
import { readGuideProgress, writeGuideProgress, type GuideProgress } from "@/lib/capstone/guide-progress";
import { Btn } from "@/components/capstone/ui";

export const Route = createFileRoute("/pki/capstone/guide")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { print?: boolean | undefined; section?: string | undefined } => ({
    ...(search['print'] ? { print: true as const } : {}),
    ...(typeof search['section'] === "string" && search['section']
      ? { section: search['section'] }
      : {}),
  }),
  component: StudentGuidePage,
});

function blockText(block: GuideBlock): string {
  return [
    block.text ?? "",
    ...(block.items ?? []),
    ...(block.head ?? []),
    ...(block.rows ?? []).flat(),
  ].join(" ");
}

function sectionMatches(section: GuideSection, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  if (section.title.toLowerCase().includes(needle)) return true;
  return section.blocks.some((b) => blockText(b).toLowerCase().includes(needle));
}

function StudentGuidePage() {
  const { print, section: targetSection } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [pdfState, setPdfState] = useState<"idle" | "working" | "error">("idle");
  const [resume, setResume] = useState<GuideProgress | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  const q = query.trim();
  const visible = useMemo(() => GUIDE_SECTIONS.filter((s) => sectionMatches(s, q)), [q]);

  useEffect(() => {
    if (!print) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [print]);

  // Read saved position once on mount.
  useEffect(() => {
    setResume(readGuideProgress());
  }, []);

  // Jump to a requested section (e.g. "Continue where I left off").
  useEffect(() => {
    if (!targetSection) return;
    const el = document.getElementById(targetSection);
    if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
  }, [targetSection]);

  // Track the section currently being read and remember it.
  useEffect(() => {
    if (q) return;
    const nodes = Array.from(
      articleRef.current?.querySelectorAll<HTMLElement>("section[id]") ?? [],
    );
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!top) return;
        const id = top.target.id;
        setCurrent(id);
        writeGuideProgress(id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [q]);

  const handleDownload = async () => {
    setPdfState("working");
    try {
      await downloadGuidePdf();
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };

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
          <Btn variant="primary" onClick={handleDownload} disabled={pdfState === "working"}>
            <Download className="size-4" aria-hidden="true" />
            {pdfState === "working" ? "Preparing PDF…" : "Download Guide (PDF)"}
          </Btn>
          <Btn onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Btn>
        </div>
        <p aria-live="polite" className="sr-only">
          {pdfState === "working" ? "Generating your guide PDF" : ""}
        </p>
        {pdfState === "error" ? (
          <p className="mt-3 text-sm text-destructive print:hidden">
            We could not build the PDF just now. Try again, or use Print to save a copy.
          </p>
        ) : null}
      </header>

      {resume && (!current || current !== resume.id) ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 print:hidden">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <BookmarkCheck className="size-4 text-primary" aria-hidden="true" />
            Continue where you left off — section {resume.number}. {resume.title}
          </p>
          <a
            href={`#${resume.id}`}
            className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Jump back in
          </a>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav
          aria-label="Guide sections"
          className="h-max rounded-xl border border-border bg-surface/70 p-4 lg:sticky lg:top-6 print:hidden"
        >
          <label className="block">
            <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              Search the guide
            </span>
            <span className="relative mt-2 block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="CRL, OCSP, Checkpoint…"
                className="min-h-11 w-full rounded-md border border-border bg-background px-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </label>
          <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
            {q
              ? `${visible.length} matching ${visible.length === 1 ? "section" : "sections"}`
              : `${GUIDE_SECTIONS.length} sections`}
          </p>

          <p className="mt-4 text-xs tracking-[0.14em] text-muted-foreground uppercase">Contents</p>
          <ol className="mt-3 space-y-1 text-sm">
            {visible.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block rounded px-2 py-1.5 hover:bg-primary/10 hover:text-foreground ${
                    current === section.id ? "bg-primary/10 text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {section.number}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article ref={articleRef} className="space-y-6 print:space-y-4">
          {visible.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface/80 p-6 text-sm text-muted-foreground">
              No sections match “{q}”. Try a shorter term such as “CRL”, “OCSP”, or “Checkpoint”.
            </p>
          ) : null}
          {visible.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-h`}
              className="scroll-mt-6 rounded-xl border border-border bg-surface/80 p-5 sm:p-6 print:break-inside-avoid print:border-0 print:p-0"
            >
              <h3 id={`${section.id}-h`} className="font-display text-lg text-foreground">
                <Highlight text={`${section.number}. ${section.title}`} query={q} />
              </h3>
              <div className="mt-3 space-y-4">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} query={q} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-primary/30 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
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

function Block({ block, query }: { block: GuideBlock; query: string }) {
  if (block.kind === "para") {
    return (
      <p className="max-w-3xl text-sm leading-relaxed text-foreground/90">
        <Highlight text={block.text ?? ""} query={query} />
      </p>
    );
  }

  if (block.kind === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
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
                    <Highlight text={cell} query={query} />
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
        <p className="max-w-3xl text-sm leading-relaxed text-foreground/90">
          <Highlight text={block.text} query={query} />
        </p>
      ) : null}
      <ListTag
        className={`mt-2 max-w-3xl space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90 ${
          block.kind === "steps" ? "list-decimal" : "list-disc"
        }`}
      >
        {block.items?.map((item, i) => (
          <li key={i}>
            <Highlight text={item} query={query} />
          </li>
        ))}
      </ListTag>
    </div>
  );
}
