import { ArrowDown, ArrowRight, RadioTower, FileSearch, FileText, Search, ShieldCheck, ListChecks, Clock, ChartNoAxesCombined, Target, Users, Flag, CircleCheck, Video, NotebookPen, Github, Send, type LucideIcon } from "lucide-react";
import ivyHero from "@/assets/characters/ivy-vault/ivy-vault-hero.jpg";
import ivyHeadshot from "@/assets/characters/ivy-vault/ivy-vault-headshot.jpg";

type TeachingStage = 1 | 2 | 3 | 4 | 5 | 6;
type Step = { label: string; detail: string; icon: LucideIcon };
const lessons: Record<TeachingStage, { title: string; steps: Step[]; caption: string }> = {
  1: { title: "From case file to communication", steps: [
    { label: "Week 11 case file", detail: "Your findings, records & unknowns", icon: FileSearch },
    { label: "Review & classify", detail: "Fact · Finding · Evidence · Interpretation · Unknown · Recommendation", icon: Search },
    { label: "Week 12 communication", detail: "Explain the same investigation clearly", icon: FileText },
  ], caption: "Same investigation. A clearer message — not a new incident." },
  2: { title: "Build a defensible finding", steps: [
    { label: "Evidence", detail: "What the record shows", icon: FileSearch },
    { label: "Analysis", detail: "What it supports — and what it cannot", icon: Search },
    { label: "Defensible finding", detail: "Statement + reference + uncertainty", icon: ShieldCheck },
  ], caption: "Suspicious or unusual does not mean proven compromise." },
  3: { title: "Anatomy of a technical report", steps: [
    { label: "Purpose & scope", detail: "Context and boundaries", icon: Target },
    { label: "Evidence & timeline", detail: "Records and sequence", icon: Clock },
    { label: "Findings & impact", detail: "Meaning and risk", icon: ChartNoAxesCombined },
    { label: "Recommendations", detail: "Specific next actions", icon: ListChecks },
    { label: "Limitations & conclusion", detail: "Unknowns and closing assessment", icon: ShieldCheck },
  ], caption: "A traceable document: context → records → findings → action → uncertainty." },
  4: { title: "Translate for leadership", steps: [
    { label: "Technical report", detail: "Keep the evidence and uncertainty", icon: FileText },
    { label: "Leadership brief", detail: "What happened · Why it matters · What we found · What happens next", icon: Users },
  ], caption: "One audience. One selected format. Equal expectations." },
  5: { title: "Turn findings into action", steps: [
    { label: "Finding", detail: "Evidence-linked risk", icon: FileSearch },
    { label: "Recommendation", detail: "Specific action and why", icon: Target },
    { label: "Delivery plan", detail: "Owner · Priority · Timeframe · Success measure", icon: Flag },
  ], caption: "A recommendation belongs in the report and links back to a finding." },
  6: { title: "Make your work portfolio-ready", steps: [
    { label: "Finalize", detail: "QA checklist + technical report", icon: CircleCheck },
    { label: "Present", detail: "Your selected executive communication", icon: Send },
    { label: "Portfolio", detail: "Download files → upload to your GitHub", icon: Github },
  ], caption: "Portfolio Deliverable 5 · Downloading is not submitting." },
};

/** Static teaching only: no store access, readiness logic, or student data. */
export function Week12Visual({ stage }: { stage: TeachingStage | "hero" }) {
  if (stage === "hero") return (
    <figure data-week12-visual="hero" className="mt-4 overflow-hidden rounded-lg border border-primary/30 bg-background">
      <img src={ivyHero} alt="Ivy overlooking the city at dusk from a tower balcony" className="block h-44 w-full object-cover object-[64%_32%] sm:h-56 sm:object-[50%_32%]" fetchPriority="high" />
      <figcaption className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-primary/30 px-4 py-3">
        <RadioTower aria-hidden="true" className="size-7 shrink-0 text-amber" />
        <div className="min-w-0"><span className="block font-display text-lg font-semibold text-foreground">Broadcast Tower</span><span className="block text-xs text-muted-foreground">Week 12 · From investigation to professional communication</span></div>
      </figcaption>
    </figure>
  );
  const lesson = lessons[stage];
  return (
    <figure data-week12-visual={stage} aria-label={`Stage ${stage}: ${lesson.title}`} className="overflow-hidden rounded-lg border border-primary/25 bg-background">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <img src={ivyHeadshot} alt="Ivy, security analyst" className="size-12 shrink-0 rounded-full border border-primary/40 object-cover object-top" />
        <div className="min-w-0"><p className="font-mono text-[0.65rem] text-amber">BROADCAST TOWER / 0{stage}</p><h2 className="font-display text-base font-semibold text-foreground sm:text-lg">{lesson.title}</h2></div>
      </div>
      <ol className={`grid gap-2 px-4 py-4 sm:px-5 ${stage === 3 ? "sm:grid-cols-5" : stage === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {lesson.steps.map(({ label, detail, icon: Icon }, i) => (
          <li key={label} className="relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-l-2 border-primary/45 py-2 pl-3 sm:block sm:py-1 sm:pr-4">
            <Icon aria-hidden="true" className={`size-6 shrink-0 ${i === lesson.steps.length - 1 ? "text-amber" : "text-primary"}`} strokeWidth={1.5} />
            <div className="min-w-0 sm:mt-2"><p className="text-sm font-semibold text-foreground">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div>
            {i < lesson.steps.length - 1 ? <><ArrowRight aria-hidden="true" className="absolute right-0 top-1 hidden size-4 text-primary/70 sm:block" /><ArrowDown aria-hidden="true" className="absolute -bottom-3 left-4 size-3 text-primary/70 sm:hidden" /></> : null}
          </li>
        ))}
      </ol>
      {stage === 2 ? <dl className="mx-4 mb-4 grid gap-2 border-t border-border pt-3 text-xs sm:mx-5 sm:grid-cols-2"><div><dt className="font-medium text-primary">Defensible</dt><dd className="mt-1 text-foreground">“The record shows an unusual sign-in; intent is unknown.”</dd></div><div><dt className="font-medium text-amber">Overstated without evidence</dt><dd className="mt-1 text-foreground">“An attacker compromised the account.”</dd></div></dl> : null}
      {stage === 4 ? <div className="mx-4 mb-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-t border-border pt-3 sm:mx-5"><div className="min-w-0 text-center"><NotebookPen aria-hidden="true" className="mx-auto mb-1 size-5 text-primary" /><p className="text-xs font-medium">Written Executive Summary</p><p className="mt-1 text-xs text-muted-foreground">250–400 words</p></div><span className="font-mono text-xs text-amber">OR</span><div className="min-w-0 text-center"><Video aria-hidden="true" className="mx-auto mb-1 size-5 text-primary" /><p className="text-xs font-medium">Video Executive Briefing</p><p className="mt-1 text-xs text-muted-foreground">2–3 minutes · link only</p></div></div> : null}
      <figcaption className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground sm:px-5">{lesson.caption}</figcaption>
    </figure>
  );
}