/**
 * Week 11 guided three-lab view — presentation only.
 * Uses the existing store, components and commands; never writes learner data
 * by itself and never decides readiness. Position is browser-local per attempt.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Week11Store } from "@/lib/week11/useWeek11";
import type { Nav } from "@/lib/week11/guidance";
import { denyCoaching, directoryLabel } from "@/lib/week11/instructions";
import { isComparisonSubstep, recordFieldsCue, showsLogTable } from "@/lib/week11/field-cue";
import { missions, traceConcepts, type Directory } from "@/lib/week11/seed";
import {
  FIRST_OPTIONAL, GUIDED_LABS, GUIDED_SCREENS, REQUIRED_COUNT, firstOpenScreen, guidedKey, labScreens, parseGuided, positionLabel, screenChecks, type GuidedScreen,
} from "@/lib/week11/guided-steps";
import { CaptureEvidence } from "../CaptureEvidence";
import { CaseFileBuilder } from "../CaseFileBuilder";
import { GroupsView, OUsView, ResourcesView, RolesView, TicketsView, UsersView } from "../DirectoryViews";
import { EvidenceView, LogsView } from "../InvestigationViews";
import { DownloadsView } from "../DownloadsView";
import { MissionArt, Week11Hero } from "../Visuals";
import { traceObjectsFor } from "../Simulator";
import { suggestRefs } from "@/lib/week11/guided-preselect";

/** Sentence starters for the short required answers (student writes the rest). */
const STARTERS: Record<string, string> = {
  prediction: "I think Blair can / cannot read case summaries because ___.",
  authorization: "Blair could sign in but not read, because ___.",
  accountability: "I changed ___ because the ticket approved ___. The audit record ___ shows it.",
  t502: "I removed ___ and added ___ because Alex moved to ___. The retests showed ___.",
  t503: "I disabled ___ and ended ___ because Finley left. The new sign-in was ___.",
};

/** ELI5 first, then the technical name, per original mission. */
const PLAIN: Record<string, { everyday: string; term: string; link: string }> = {
  M01: { everyday: "One person can have more than one \"key card\" — one for the office building and one for the online apps. Each card can open different doors.", term: "This is identity vs. account: one person (identity) can have several accounts in Active Directory and Cloud Identity.", link: "You met users and groups in earlier weeks; here you see them side by side." },
  M02: { everyday: "Getting in the front door is not the same as being allowed into every room.", term: "Signing in is authentication. What you may open afterwards is authorization.", link: "This builds on the sign-in and access ideas from Week 10." },
  M03: { everyday: "When someone's job changes, you move their key card to the right folder and change which doors it opens — then you check it still works.", term: "Account lifecycle: OU placement, group membership, credential reset and enable/disable.", link: "Lab 1 showed you where accounts live; now you change them." },
  M04: { everyday: "Give people the doors they need for their job — and no extra ones.", term: "Least privilege with role-based (RBAC) and attribute-based (ABAC) access.", link: "Roles are just named bundles of permissions, like the groups you saw in Lab 1." },
  M05: { everyday: "Help-desk requests ask you to add, keep or remove access. You decide, make the change, and test it.", term: "Joiner–mover–leaver tickets and access reviews.", link: "You use the same Test Access tool from earlier steps." },
  M06: { everyday: "Now you are the storyteller: use the records you saved to explain what happened, in your own words.", term: "An IAM investigation Case File built from evidence.", link: "Everything you saved in Labs 1 and 2 is available here." },
};

const VIEW_LABELS: Record<string, string> = { users: "Users", groups: "Groups", ous: "Organizational Units", roles: "Roles & Access", resources: "Resources", tickets: "Help Desk / IAM Tickets", signins: "Sign-in Logs", audit: "Audit Logs", evidence: "Evidence Tray", report: "Case File", downloads: "Download & GitHub" };

export function GuidedApp({ store, onClassic }: { store: Week11Store; onClassic: () => void }) {
  const v = store.view;
  if (!v) return null;
  const storageKey = guidedKey(v.id);
  const [index, setIndex] = useState<number | null>(null);
  const [subIndex, setSubIndex] = useState(0);
  const [showCaseFile, setShowCaseFile] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const saved = parseGuided(window.localStorage.getItem(storageKey));
    setIndex(saved?.index ?? firstOpenScreen(v, store.learner));
    try { setSubIndex(Number(window.localStorage.getItem(`${storageKey}:look`)) || 0); } catch { setSubIndex(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const go = (i: number) => {
    const next = Math.max(0, Math.min(GUIDED_SCREENS.length - 1, i));
    setIndex(next);
    setShowCaseFile(false);
    try { window.localStorage.setItem(storageKey, JSON.stringify({ index: next })); } catch { /* private mode */ }
    requestAnimationFrame(() => { headingRef.current?.focus(); window.scrollTo({ top: 0 }); });
  };

  if (index === null) return <p role="status" className="p-8 text-lg">Opening your labs…</p>;
  const screen = GUIDED_SCREENS[index];
  if (!screen) return null;
  const lab = GUIDED_LABS.find((l) => l.n === screen.lab) ?? { title: "Optional practice", why: "Explore further when you want more practice." };
  const inLab = labScreens(screen.lab);
  const isLabStart = inLab[0]?.id === screen.id;
  const isMissionStart = !screen.optional && GUIDED_SCREENS.find((s) => s.mission === screen.mission && !s.example)?.id === screen.id;
  const paged = screen.id === "L3-look";
  const subPosition = Math.max(0, Math.min(subIndex, screen.subs.length - 1));
  const currentSubs = paged ? screen.subs.slice(subPosition, subPosition + 1) : screen.subs;
  const taskScreen = paged ? { ...screen, subs: currentSubs } : screen;
  const caseFileCue = taskScreen.subs.some((s) => isComparisonSubstep(s.step.id)) && !showsLogTable(taskScreen.subs.flatMap((s) => s.step.links)) ? recordFieldsCue("caseFile") : null;
  const moveSub = (n: number) => {
    const next = Math.max(0, Math.min(n, screen.subs.length - 1));
    setSubIndex(next);
    try { window.localStorage.setItem(`${storageKey}:look`, String(next)); } catch { /* private mode */ }
    requestAnimationFrame(() => { headingRef.current?.focus(); window.scrollTo({ top: 0 }); });
  };
  const labDone = (n: number) => labScreens(n).every((s) => screenChecks(s, v, store.learner).every((c) => c.optional || c.done));
  const save = store.textSave;
  const resumed = v.state.seq > 0 || v.textRevision > 0;

  return (
    <div className="w11-guided mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm text-primary">Week 11 · Cloud Heights Identity Center</p>
          <p className="mt-1 text-base text-muted-foreground">Practice data only — every person and account here is fictional.</p>
        </div>
        <p aria-live="polite" className="max-w-40 shrink-0 break-words border-l border-border pl-3 text-base">
          {store.busy ? "Recording action…" : save.kind === "pending" || save.kind === "saving" ? "Saving…" : save.kind === "saved" ? `Saved ✓ ${save.at}` : save.kind === "failed" ? `Not saved — ${save.message}` : save.kind === "conflict" ? "Changed in another tab" : "No pending text edits"}
        </p>
      </header>
      {save.kind === "conflict" ? <Button type="button" variant="link" onClick={() => void store.reloadAfterConflict()}>Review and reapply my text</Button> : null}

      <div className="mt-3 grid gap-2 border-b border-border pb-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <p className="text-base text-primary">{positionLabel(index)}</p>
          <p className="font-display text-xl font-semibold">{screen.optional ? "Optional practice" : lab.title}{screen.part ? ` · ${screen.part}` : ""}</p>
        </div>
        <details className="min-w-0 xl:max-w-xl">
          <summary className="min-h-11 cursor-pointer content-center text-base">Change lab or open optional practice</summary>
      <nav aria-label="Week 11 labs" className="mt-2">
        <ol className="grid gap-2 sm:grid-cols-2">
          {GUIDED_LABS.map((l) => {
            const ready = labDone(l.n);
            const current = l.n === screen.lab;
            return (
              <li key={l.n}>
                <Button variant="outline" type="button" aria-current={current ? "step" : undefined} onClick={() => go(GUIDED_SCREENS.findIndex((s) => s.lab === l.n))}
                  className={`h-auto min-h-11 w-full min-w-0 flex-col items-start whitespace-normal rounded-lg border px-3 py-2 text-left text-base ${current ? "border-violet bg-violet/15" : "border-border"}`}>
                  <span className="block text-sm text-muted-foreground">Lab {l.n} · {l.minutes}{ready ? " · ✓ done" : ""}</span>
                  <span className="font-medium">{l.title}</span>
                </Button>
              </li>
            );
          })}
          <li>
            <Button variant="outline" type="button" aria-current={screen.optional ? "step" : undefined} onClick={() => go(FIRST_OPTIONAL)}
              className={`h-auto min-h-11 w-full min-w-0 flex-col items-start whitespace-normal rounded-lg border border-dashed px-3 py-2 text-left text-base ${screen.optional ? "border-violet bg-violet/15" : "border-border"}`}>
              <span className="block text-sm text-muted-foreground">Not required</span>
              <span className="font-medium">Optional practice</span>
            </Button>
          </li>
        </ol>
      </nav>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-base">
        <Button type="button" variant="link" className="min-h-11 px-0 text-base" onClick={() => setShowCaseFile((x) => !x)} aria-expanded={showCaseFile}>{showCaseFile ? "Back to my step" : "Open my Case File"}</Button>
        <span aria-hidden className="text-muted-foreground">·</span>
        <Button type="button" variant="link" className="min-h-11 px-0 text-base" onClick={onClassic}>Classic six-lab view</Button>
      </div>

        </details>
      </div>

          <nav aria-label="Step navigation" className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border py-3">
            <Button type="button" variant="outline" size="lg" disabled={index === 0} onClick={() => go(index - 1)}>← Back</Button>
            <label className="min-w-0 justify-self-center">
              <span className="sr-only">Jump to a step</span>
              <select className="min-h-11 w-full max-w-[16rem] rounded-md border border-border bg-background px-2 text-base" value={index} onChange={(e) => go(Number(e.target.value))}>
                <optgroup label="Required">{GUIDED_SCREENS.slice(0, REQUIRED_COUNT).map((s, i) => <option key={s.id} value={i}>{positionLabel(i)}</option>)}</optgroup>
                <optgroup label="Optional practice">{GUIDED_SCREENS.slice(REQUIRED_COUNT).map((s, i) => <option key={s.id} value={i + REQUIRED_COUNT}>{positionLabel(i + REQUIRED_COUNT)}</option>)}</optgroup>
              </select>
            </label>
            {index === REQUIRED_COUNT - 1
              ? <Button type="button" size="lg" onClick={() => setShowCaseFile(true)}>Review my Case File</Button>
              : index === GUIDED_SCREENS.length - 1
                ? <Button type="button" size="lg" onClick={() => go(firstOpenScreen(v, store.learner))}>Back to my required steps</Button>
                : <Button type="button" size="lg" onClick={() => go(index + 1)}>Continue →</Button>}
          </nav>
      {showCaseFile ? (
        <section className="mt-4" aria-label="Case File"><CaseFileBuilder store={store} /></section>
      ) : (
        <>
          <div className="w11-guided-workspace mt-4 grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <article className="w11-guidance min-w-0 border-l-2 border-reading-accent bg-reading p-4 text-lg leading-relaxed text-reading-foreground sm:p-5" aria-labelledby="w11g-goal">
          {screen.optional ? (
            <p className="mt-4 rounded-lg border border-dashed border-border p-3 text-lg"><strong>Optional practice.</strong> This does not count toward finishing Week 11. Anything you already did here is kept and still shows in your downloads.</p>
          ) : null}
          {screen.example ? (
            <p className="mt-4 rounded-lg border border-violet/50 bg-violet/10 p-3 text-lg"><strong>Worked example.</strong> Follow along — there is nothing to save on this step. Next, you'll try a similar task on your own.</p>
          ) : null}
          {resumed && index === firstOpenScreen(v, store.learner) ? (
            <p className="mt-4 rounded-lg border border-violet/50 bg-violet/10 p-3 text-lg">Welcome back. Your saved work is here — you're on <strong>{lab.title}</strong>.</p>
          ) : null}

            <h1 id="w11g-goal" ref={headingRef} tabIndex={-1} className="font-display text-2xl leading-snug focus-visible:outline">Your goal</h1>
            <p className="mt-2 text-xl">{screen.goal}</p>

            <h2 className="mt-4 text-xl font-semibold">Why it matters</h2>
            {isMissionStart ? (
              <div className="mt-1 space-y-2">
                <p><strong>In everyday words:</strong> {PLAIN[screen.mission]!.everyday}</p>
                <p><strong>The technical name:</strong> {PLAIN[screen.mission]!.term}</p>
                <p className="text-reading-muted">{PLAIN[screen.mission]!.link}</p>
              </div>
            ) : <p className="mt-1">{lab.why}</p>}

            <h2 className="mt-4 text-xl font-semibold">{screen.example ? "Let's do one together" : "Steps"}</h2>
            {paged ? <div className="mt-2 space-y-2">
              <p>Review action {subPosition + 1} of {screen.subs.length} · within this step</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="min-h-11" disabled={subPosition === 0} onClick={() => moveSub(subPosition - 1)}>Previous action</Button>
                <Button variant="outline" className="min-h-11" disabled={subPosition === screen.subs.length - 1} onClick={() => moveSub(subPosition + 1)}>Next action</Button>
              </div>
            </div> : null}
            <ol className="mt-2 space-y-3">
              {currentSubs.map((sub, i) => (
                <li key={sub.step.id} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-reading-accent text-base font-semibold text-reading">{paged ? subPosition + 1 : i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium">{sub.step.doing}{sub.step.dir ? <span className="ml-2 rounded bg-reading-border px-2 py-0.5 text-sm font-semibold uppercase">{directoryLabel(sub.step.dir)}</span> : null}</p>
                    <p className="text-base text-reading-muted">Where: {sub.step.where.replace("Mission Progress → Your explanations", "Your explanation below").replace("Current Mission → evidence callout", "Save your evidence below")}</p>
                    <details className="mt-1 text-base">
                      <summary className="cursor-pointer text-reading-accent">What should I see?</summary>
                      <p className="mt-1">{sub.step.lookFor}</p>
                      <p className="mt-1"><strong>You're done when:</strong> {sub.step.proves}</p>
                    </details>
                  </div>
                </li>
              ))}
            </ol>
            {caseFileCue ? <p className="mt-3 rounded-lg border border-reading-border p-3 text-base"><strong>{caseFileCue.lead}</strong> Select <strong>{caseFileCue.label}</strong>{caseFileCue.detail}</p> : null}
            {screen.example ? <p className="mt-3"><strong>What we learned:</strong> one person, two accounts. Group grants open resources; an OU is a folder, not a permission.</p> : null}
            {screen.mission !== "M06" && screen.subs.some((s) => /test|sign in|sign-in/i.test(s.step.doing)) ? (
              <p className="mt-4 rounded-lg border border-reading-border p-3 text-base"><strong>About DENY results:</strong> {denyCoaching}</p>
            ) : null}
            {isLabStart && !screen.optional ? (
              <details className="w11-guided-intro mt-4">
                <summary className="min-h-11 cursor-pointer content-center text-base text-reading-accent">Meet Ivy · lab introduction</summary>
                <div className="mt-2">{screen.lab === 1 ? <Week11Hero /> : <MissionArt mission={screen.mission} />}</div>
              </details>
            ) : null}
          </article>

          <div className="w11-activity min-w-0">
          <section aria-label="Your task" className="min-w-0 space-y-3">
            <h2 className="font-display text-xl">Do it here</h2>
            <ScreenTask key={`${screen.id}:${paged ? subPosition : "all"}`} store={store} screen={taskScreen} />
          </section>

          <CheckYourWork store={store} screen={screen} />
          </div>
          </div>


        </>
      )}
    </div>
  );
}

function pagedFinding(screen: GuidedScreen) {
  const id = screen.subs[0]?.step.id;
  return screen.id === "L3-look" && id === "M06-06" ? 0 : screen.id === "L3-look" && id === "M06-07" ? 1 : undefined;
}

function ScreenTask({ store, screen }: { store: Week11Store; screen: GuidedScreen }) {
  const v = store.view!;
  const m = missions.find((x) => x.key === screen.mission)!;
  const ans = store.learner.missions?.[m.key]?.answers ?? {};
  const trace = store.learner.missions?.["M01"]?.trace ?? {};
  const traceObjects = useMemo(() => traceObjectsFor(v), [v]);
  const setAns = (id: string, val: string) => store.setLearner((l) => ({ ...l, missions: { ...(l.missions ?? {}), [m.key]: { ...(l.missions?.[m.key] ?? {}), answers: { ...(l.missions?.[m.key]?.answers ?? {}), [id]: val } } } }));
  const setTrace = (id: string, val: string) => store.setLearner((l) => ({ ...l, missions: { ...(l.missions ?? {}), M01: { ...(l.missions?.["M01"] ?? {}), trace: { ...(l.missions?.["M01"]?.trace ?? {}), [id]: val } } } }));

  const questionIds = [...new Set(screen.subs.flatMap((s) => (s.questionId ? [s.questionId] : [])))];
  const traceIds = screen.subs.flatMap((s) => (s.traceId ? [s.traceId] : []));
  const slots = screen.subs.filter((s) => s.kind === "capture").map((s) => m.evidence.find((e) => e.slot === s.step.capture)!).filter(Boolean);
  const links: Nav[] = [];
  for (const s of screen.subs) for (const l of s.step.links) if (l.view !== "missions" && !(l.view === "evidence" && s.kind === "capture") && !links.some((x) => x.view === l.view)) links.push(l);

  return (
    <>
      {links.length ? <ToolPanel key={screen.id} store={store} compactAccount={!screen.optional} initialFinding={pagedFinding(screen)} links={links} mission={screen.mission} focus={screen.id.includes("check") || screen.id === "L1-test" ? "test" : screen.id.includes("fix") || screen.id.includes("change") || screen.id.includes("leave") ? "change" : "review"} /> : null}
      {traceIds.length ? (
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <h3 className="text-lg font-semibold">Pick a real object you inspected</h3>
          <div className="mt-3 grid gap-3">
            {traceIds.map((id) => { const c = traceConcepts.find((x) => x.id === id)!; return (
              <label key={id} className="block text-base">
                <span className="font-medium">{c.label}</span> <span className="text-muted-foreground">— {c.hint}</span>
                <select className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" value={trace[id] ?? ""} onChange={(e) => setTrace(id, e.target.value)}>
                  <option value="">choose an object</option>
                  {traceObjects.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>); })}
          </div>
        </div>
      ) : null}
      {questionIds.map((id) => { const q = m.questions.find((x) => x.id === id)!; return (
        <label key={id} className="block rounded-xl border border-border bg-surface-raised p-4 text-base">
          <span className="text-lg font-semibold">{q.label}</span>
          <span className="mt-1 block text-muted-foreground">Sentence starter: "{STARTERS[id] ?? "In the records I saw ___, which shows ___."}"</span>
          <textarea className="mt-2 w-full rounded-md border border-border bg-background p-3 text-lg leading-relaxed" rows={4} maxLength={5000} value={ans[id] ?? ""} onChange={(e) => setAns(id, e.target.value)} />
        </label>); })}
      {slots.length ? (
        <div>
          <p className="mb-2 rounded-lg border border-evidence/60 bg-evidence/10 p-3 text-lg font-semibold">Save your evidence: pick the records you just created, explain them in a sentence, then save.</p>
          {!screen.optional && suggestRefs(slots[0]!.slot, v.state) ? <p className="mb-2 text-base text-muted-foreground">We ticked your most recent matching records to save you copying IDs. Check each one, untick anything that doesn't belong, then explain and save.</p> : null}
          <CaptureEvidence key={screen.id} store={store} mission={m.key} slots={slots} initialSlot={slots[0]!.slot} preselect={screen.optional ? undefined : suggestRefs(slots[0]!.slot, v.state)} />
        </div>
      ) : null}
      {store.lastResult ? <p aria-live="polite" className={`rounded-lg border p-3 text-base ${store.lastResult.ok ? "border-evidence/60" : "border-amber/60"}`}>{store.lastResult.ok ? "Done: " : "Not yet: "}{store.lastResult.message}</p> : null}
    </>
  );
}

function ToolPanel({ store, links, mission, focus, initialFinding, compactAccount }: { compactAccount: boolean; initialFinding?: number | undefined; store: Week11Store; links: Nav[]; mission: string; focus: "test" | "change" | "review" }) {
  const v = store.view!;
  const [active, setActive] = useState(0);
  const [fullAccount, setFullAccount] = useState(false);
  const link = links[active];
  if (!link) return null;
  const initialAcct = link.account ? v.state.accounts.find((a) => a.key === link.account) : undefined;
  const [dir, setDir] = useState<Directory>(initialAcct?.dir ?? link.dir ?? "AD");
  const [selected, setSelected] = useState<string | null>(initialAcct?.key ?? null);
  const pick = (i: number) => {
    const l = links[i]!; setActive(i);
    const a = l.account ? v.state.accounts.find((x) => x.key === l.account) : undefined;
    if (a) { setDir(a.dir); setSelected(a.key); } else if (l.dir) setDir(l.dir);
  };
  const switchDir = (d: Directory) => {
    const cur = v.state.accounts.find((a) => a.key === selected);
    const twin = cur ? v.state.accounts.find((a) => a.person === cur.person && a.dir === d) : undefined;
    setDir(d); setSelected(twin?.key ?? null);
  };
  const go = (n: Nav) => {
    const i = links.findIndex((l) => l.view === n.view);
    if (i >= 0) pick(i);
    const a = n.account ? v.state.accounts.find((x) => x.key === n.account) : undefined;
    if (a) { setDir(a.dir); setSelected(a.key); }
  };
  const needsDir = ["users", "groups", "ous"].includes(link.view);
  return (
    <div className="w11-guided-tool min-w-0 rounded-xl border border-border bg-surface p-3 sm:p-4">
      {links.length > 1 ? (
        <div role="tablist" aria-label="Tools for this step" className="mb-3 flex flex-wrap gap-2">
          {links.map((l, i) => <button key={l.view} role="tab" type="button" aria-selected={i === active} onClick={() => pick(i)} className={`min-h-11 rounded-md border px-3 text-base ${i === active ? "border-violet bg-violet/15" : "border-border"}`}>{VIEW_LABELS[l.view] ?? l.label}</button>)}
        </div>
      ) : <p className="mb-3 text-base font-semibold">{VIEW_LABELS[link.view] ?? link.label}</p>}
      {needsDir ? (
        <div role="group" aria-label="Directory" className="mb-3 flex flex-wrap gap-2">
          {(["AD", "CLOUD"] as Directory[]).map((d) => <button key={d} type="button" aria-pressed={dir === d} onClick={() => switchDir(d)} className={`min-h-11 rounded-md border px-3 text-base font-semibold uppercase ${dir === d ? "border-primary bg-primary/15" : "border-border"}`}>{directoryLabel(d)}</button>)}
        </div>
      ) : null}
      {link.view === "users" && selected ? <Button type="button" variant="link" className="mb-2 min-h-11 px-0 text-base" aria-expanded={fullAccount} onClick={() => setFullAccount((x) => !x)}>{fullAccount ? "Show only this step's account tools" : "Show all account tools"}</Button> : null}
      <div className={`w11-tool-content ${link.view === "users" ? "w11-account-content" : ""}`} data-account-focus={fullAccount ? "all" : focus} role={links.length > 1 ? "tabpanel" : undefined}>
        {link.view === "users" ? <UsersView store={store} dir={dir} selected={selected} onSelect={setSelected} mission={mission} go={go} guided={compactAccount} /> : null}
        {link.view === "groups" ? <GroupsView store={store} dir={dir} /> : null}
        {link.view === "ous" ? <OUsView store={store} dir={dir} /> : null}
        {link.view === "roles" ? <RolesView store={store} /> : null}
        {link.view === "resources" ? <ResourcesView /> : null}
        {link.view === "tickets" ? <TicketsView key={link.ticket} store={store} initial={link.ticket} guided /> : null}
        {link.view === "signins" ? <LogsView store={store} kind="signin" guided /> : null}
        {link.view === "audit" ? <LogsView store={store} kind="audit" guided /> : null}
        {link.view === "evidence" ? <EvidenceView store={store} /> : null}
        {link.view === "report" ? <CaseFileBuilder store={store} initialFinding={initialFinding} /> : null}
        {link.view === "downloads" ? <DownloadsView store={store} /> : null}
      </div>
    </div>
  );
}

function CheckYourWork({ store, screen }: { store: Week11Store; screen: GuidedScreen }) {
  const v = store.view!;
  const checks = screenChecks(screen, v, store.learner);
  const r = v.readiness.find((x) => x.mission === screen.mission)!;
  const lastOfMission = !screen.optional && [...GUIDED_SCREENS.slice(0, REQUIRED_COUNT)].reverse().find((s) => s.mission === screen.mission)!.id === screen.id && r.required !== false;
  return (
    <section aria-labelledby="w11g-check" className="mt-4 border-t border-reading-border bg-reading p-4 text-lg leading-relaxed text-reading-foreground">
      <h2 id="w11g-check" className="text-xl font-semibold">Check your work</h2>
      {checks.length ? (
        <ul className="mt-2 space-y-1">{checks.map((c) => <li key={c.id}>{c.done ? "✓" : "○"} {c.label}{c.done ? "" : " — not yet"}{c.optional && !screen.optional ? " (optional)" : ""}</li>)}</ul>
      ) : <p className="mt-2">Open each "What should I see?" above and compare it with what the tool shows. When they match, continue.</p>}
      {lastOfMission ? (
        r.ready ? <p className="mt-3 font-semibold">✓ Everything needed for this part is saved. Your instructor reviews your reasoning.</p> : (
          <div className="mt-3">
            <p className="font-semibold">Still needed for this part ({r.missing.length}):</p>
            <ul className="mt-1 list-disc space-y-1 pl-6 text-base">{r.missing.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="mt-2 text-base text-reading-muted">That's okay — you can continue and come back. Use Back or the step menu to return.</p>
          </div>
        )
      ) : null}
    </section>
  );
}
