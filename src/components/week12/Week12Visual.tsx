import hero from "@/assets/week12/broadcast-tower-ivy.png.asset.json";
import s1 from "@/assets/week12/stage1-case-file-report.png.asset.json";
import s2 from "@/assets/week12/stage2-evidence-findings.png.asset.json";
import s3 from "@/assets/week12/stage3-technical-report.png.asset.json";
import s4 from "@/assets/week12/stage4-executive-briefing.png.asset.json";
import s5 from "@/assets/week12/stage5-recommendations.png.asset.json";
import s6 from "@/assets/week12/stage6-finalize-present.png.asset.json";

type Stage = 1 | 2 | 3 | 4 | 5 | 6 | "hero";
const art: Record<Stage, { src: string; alt: string; caption: string }> = {
  hero: { src: hero.url, alt: "Ivy presenting in the Broadcast Tower studio above the city at dusk", caption: "Broadcast Tower · Week 12 Communications Capstone" },
  1: { src: s1.url, alt: "Ivy turning a Week 11 case file of evidence into an incident report", caption: "Lesson 1 · From case file to incident report" },
  2: { src: s2.url, alt: "Ivy introducing Lesson 2, Writing Evidence-Based Findings", caption: "Lesson 2 · Say only what you can prove" },
  3: { src: s3.url, alt: "Ivy beside a technical incident report outline: scope, evidence, timeline, findings, impact, recommendations, limitations, conclusion", caption: "Lesson 3 · Tell the complete technical story" },
  4: { src: s4.url, alt: "Ivy presenting an executive summary to leadership", caption: "Lesson 4 · Same facts, different audience" },
  5: { src: s5.url, alt: "Ivy linking findings to recommendations with owner, priority, timeframe and success measure", caption: "Lesson 5 · Turn findings into action" },
  6: { src: s6.url, alt: "Ivy with a final checklist, report, executive summary, video briefing and GitHub portfolio", caption: "Lesson 6 · Finalize and present the case" },
};

/** Exact approved Week 12 artwork. Presentation only: no store, readiness, or student data. */
export function Week12Visual({ stage }: { stage: Stage }) {
  const a = art[stage];
  return (
    <figure data-week12-visual={stage} className={`${stage === "hero" ? "mt-4" : ""} overflow-hidden rounded-lg border border-primary/30 bg-background`}>
      <img src={a.src} alt={a.alt} className="block h-auto w-full object-contain" {...(stage === "hero" ? { fetchPriority: "high" as const } : { loading: "lazy" as const })} />
      <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{a.caption}</figcaption>
    </figure>
  );
}
