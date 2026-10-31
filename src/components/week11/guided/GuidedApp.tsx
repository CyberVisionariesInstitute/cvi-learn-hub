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
import { missions, traceConcepts, type Directory } from "@/lib/week11/seed";
import {
  GUIDED_LABS, GUIDED_SCREENS, firstOpenScreen, guidedKey, labScreens, parseGuided, positionLabel, screenChecks, type GuidedScreen,
} from "@/lib/week11/guided-steps";
import { CaptureEvidence } from "../CaptureEvidence";
import { CaseFileBuilder } from "../CaseFileBuilder";
import { GroupsView, OUsView, ResourcesView, RolesView, TicketsView, UsersView } from "../DirectoryViews";
import { EvidenceView, LogsView } from "../InvestigationViews";
import { DownloadsView } from "../DownloadsView";
import { MissionArt, Week11Hero } from "../Visuals";
import { traceObjectsFor } from "../Simulator";

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
  const v = store.view!;
  const storageKey = guidedKey(v.id);
  const [index, setIndex] = useState<number | null>(null);
  const [showCaseFile, setShowCaseFile] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const saved = parseGuided(window.localStorage.getItem(storageKey));
    setIndex(saved?.index ?? firstOpenScreen(v, store.learner));
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
  const screen = GUIDED_SCREENS[index]!;
  const lab = GUIDED_LABS.find((l) => l.n === screen.lab)!;
  const inLab = labScreens(screen.lab);
  const isLabStart = inLab[0]!.id === screen.id;
  const isMissionStart = GUIDED_SCREENS.find((s) => s.mission === screen.mission)!.id === screen.id;
  const save = store.textSave;
  const resumed = v.state.seq > 0 || v.textRevision > 0;

  return (
    <div className="w11-guided mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-[0.2em] text-primary uppercase">Week 11 · Cloud Heights Identity Center</p>
          <p className="mt-1 text-base text-muted-foreground">Practice data only — every person and account here is fictional.</p>
        </div>
        <p aria-live="polite" className="rounded-md border border-border px-3 py-1.5 text-base">
          {save.kind === "pending" || save.kind === "saving" ? "Saving…" : save.kind === "saved" ? `Saved ✓ ${save.at}` : save.kind === "failed" ? `Not saved — ${save.message}` : save.kind === "conflict" ? "Changed in another tab" : "All work saved"}
        </p>
      </header>
      {save.kind === "conflict" ? <button type="button" className="mt-2 underline" onClick={() => void store.reloadAfterConflict()}>Review and reapply my text</button> : null}

      <nav aria-label="Week 11 labs" className="mt-4">
        <ol className="grid gap-2 sm:grid-cols-3">
          {GUIDED_LABS.map((l) => {
            const ready = l.missions.every((m) => v.readiness.find((r) => r.mission === m)?.ready);
            const current = l.n === screen.lab;
            return (
              <li key={l.n}>
                <button type="button" aria-current={current ? "step" : undefined} onClick={() => go(GUIDED_SCREENS.findIndex((s) => s.lab === l.n))}
                  className={`min-h-11 w-full rounded-lg border px-3 py-2 text-left text-base ${current ? "border-violet bg-violet/15" : "border-border"}`}>
                  <span className="block text-sm text-muted-foreground">Lab {l.n}{ready ? " · ✓ done" : ""}</span>
                  <span className="font-medium">{l.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap gap-2 text-base">
        <button type="button" className="min-h-11 underline" onClick={() => setShowCaseFile((x) => !x)} aria-expanded={showCaseFile}>{showCaseFile ? "Back to my step" : "Open my Case File"}</button>
        <span aria-hidden className="text-muted-foreground">·</span>
        <button type="button" className="min-h-11 underline" onClick={onClassic}>Classic six-lab view</button>
      </div>

      {showCaseFile ? (
        <section className="mt-4" aria-label="Case File"><CaseFileBuilder store={store} /></section>
      ) : (
        <>
          {isLabStart ? (
            <div className="mt-4 space-y-3">
              {screen.lab === 1 ? <Week11Hero /> : <MissionArt mission={screen.mission} />}
              {index === 0 || resumed ? null : null}
            </div>
          ) : null}
          {resumed && index === firstOpenScreen(v, store.learner) ? (
            <p className="mt-4 rounded-lg border border-violet/50 bg-violet/10 p-3 text-lg">Welcome back. Your saved work is here — you're on <strong>{lab.title}</strong>.</p>
          ) : null}

          <article className="mt-4 rounded-2xl border border-reading-border bg-reading p-5 text-lg leading-relaxed text-reading-foreground sm:p-8" aria-labelledby="w11g-goal">
            <p className="text-base font-semibold text-reading-accent">{positionLabel(index)} · {lab.title}</p>
            <h1 id="w11g-goal" ref={headingRef} tabIndex={-1} className="mt-2 font-display text-2xl leading-snug sm:text-3xl focus:outline-none">Your goal</h1>
            <p className="mt-2 text-xl">{screen.goal}</p>

            <h2 className="mt-6 text-xl font-semibold">Why it matters</h2>
            {isMissionStart ? (
              <div className="mt-1 space-y-2">
                <p><strong>In everyday words:</strong> {PLAIN[screen.mission]!.everyday}</p>
                <p><strong>The technical name:</strong> {PLAIN[screen.mission]!.term}</p>
                <p className="text-reading-muted">{PLAIN[screen.mission]!.link}</p>
              </div>
            ) : <p className="mt-1">{lab.why}</p>}

            {index === 0 ? <WorkedExample /> : null}

            <h2 className="mt-6 text-xl font-semibold">Steps</h2>
            <ol className="mt-2 space-y-3">
              {screen.subs.map((sub, i) => (
                <li key={sub.step.id} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-reading-accent text-base font-semibold text-reading">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium">{sub.step.doing}{sub.step.dir ? <span className="ml-2 rounded bg-reading-border px-2 py-0.5 text-sm font-semibold uppercase">{directoryLabel(sub.step.dir)}</span> : null}</p>
                    <p className="text-base text-reading-muted">Where: {sub.step.where}</p>
                    <details className="mt-1 text-base">
                      <summary className="cursor-pointer text-reading-accent">What should I see?</summary>
                      <p className="mt-1">{sub.step.lookFor}</p>
                      <p className="mt-1"><strong>You're done when:</strong> {sub.step.proves}</p>
                    </details>
                  </div>
                </li>
              ))}
            </ol>
            {screen.subs.some((s) => /test|sign in|sign-in/i.test(s.step.doing)) ? (
              <p className="mt-4 rounded-lg border border-reading-border p-3 text-base"><strong>About DENY results:</strong> {denyCoaching}</p>
            ) : null}
          </article>

          <section aria-label="Your task" className="mt-4 space-y-4">
            <h2 className="font-display text-xl">Do it here</h2>
            <ScreenTask store={store} screen={screen} />
          </section>

          <CheckYourWork store={store} screen={screen} />

          <nav aria-label="Step navigation" className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-border bg-background/95 py-3 backdrop-blur">
            <Button type="button" variant="outline" size="lg" disabled={index === 0} onClick={() => go(index - 1)}>← Back</Button>
            <label className="hidden min-w-0 sm:block">
              <span className="sr-only">Jump to a step</span>
              <select className="min-h-11 max-w-[16rem] rounded-md border border-border bg-background px-2 text-base" value={index} onChange={(e) => go(Number(e.target.value))}>
                {GUIDED_SCREENS.map((s, i) => <option key={s.id} value={i}>{positionLabel(i)}</option>)}
              </select>
            </label>
            {index < GUIDED_SCREENS.length - 1
              ? <Button type="button" size="lg" onClick={() => go(index + 1)}>Continue →</Button>
              : <Button type="button" size="lg" onClick={() => setShowCaseFile(true)}>Review my Case File</Button>}
          </nav>
        </>
      )}
    </div>
  );
}

function WorkedExample() {
  return (
    <details open className="mt-5 rounded-lg border border-reading-border bg-reading p-4 text-lg">
      <summary className="cursor-pointer font-semibold">Let's do one together first</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-6">
        <li>Open <strong>Users</strong> in <strong>Active Directory</strong> and choose <strong>ad-alex</strong>.</li>
        <li>Find the <strong>Person record (HR)</strong> box. It names the real (fictional) person this account belongs to.</li>
        <li>Now switch to <strong>Cloud Identity</strong>. The tool jumps to <strong>cl-alex</strong> — a second account for the same person.</li>
      </ol>
      <p className="mt-2"><strong>What we learned:</strong> one person, two accounts. Each account can open different things — that's where access problems hide.</p>
      <p className="mt-1 text-reading-muted">Your turn: follow the steps below the same way.</p>
    </details>
  );
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
      {links.length ? <ToolPanel key={screen.id} store={store} links={links} mission={screen.mission} /> : null}
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
          <span className="mt-1 block text-muted-foreground">Sentence starter: "In the records I saw ___, which shows ___."</span>
          <textarea className="mt-2 w-full rounded-md border border-border bg-background p-3 text-lg leading-relaxed" rows={4} maxLength={5000} value={ans[id] ?? ""} onChange={(e) => setAns(id, e.target.value)} />
        </label>); })}
      {slots.length ? (
        <div>
          <p className="mb-2 rounded-lg border border-evidence/60 bg-evidence/10 p-3 text-lg font-semibold">Save your evidence: pick the records you just created, explain them in a sentence, then save.</p>
          <CaptureEvidence key={screen.id} store={store} mission={m.key} slots={slots} initialSlot={slots[0]!.slot} />
        </div>
      ) : null}
      {store.lastResult ? <p aria-live="polite" className={`rounded-lg border p-3 text-base ${store.lastResult.ok ? "border-allow/60" : "border-amber/60"}`}>{store.lastResult.ok ? "Done: " : "Not yet: "}{store.lastResult.message}</p> : null}
    </>
  );
}

function ToolPanel({ store, links, mission }: { store: Week11Store; links: Nav[]; mission: string }) {
  const v = store.view!;
  const [active, setActive] = useState(0);
  const link = links[active]!;
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
  const go = (n: Nav) => { const i = links.findIndex((l) => l.view === n.view); if (i >= 0) pick(i); };
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
      <div role={links.length > 1 ? "tabpanel" : undefined}>
        {link.view === "users" ? <UsersView store={store} dir={dir} selected={selected} onSelect={setSelected} mission={mission} go={go} /> : null}
        {link.view === "groups" ? <GroupsView store={store} dir={dir} /> : null}
        {link.view === "ous" ? <OUsView store={store} dir={dir} /> : null}
        {link.view === "roles" ? <RolesView store={store} /> : null}
        {link.view === "resources" ? <ResourcesView /> : null}
        {link.view === "tickets" ? <TicketsView store={store} initial={link.ticket} /> : null}
        {link.view === "signins" ? <LogsView store={store} kind="signin" /> : null}
        {link.view === "audit" ? <LogsView store={store} kind="audit" /> : null}
        {link.view === "evidence" ? <EvidenceView store={store} /> : null}
        {link.view === "report" ? <CaseFileBuilder store={store} /> : null}
        {link.view === "downloads" ? <DownloadsView store={store} /> : null}
      </div>
    </div>
  );
}

function CheckYourWork({ store, screen }: { store: Week11Store; screen: GuidedScreen }) {
  const v = store.view!;
  const checks = screenChecks(screen, v, store.learner);
  const r = v.readiness.find((x) => x.mission === screen.mission)!;
  const lastOfMission = [...GUIDED_SCREENS].reverse().find((s) => s.mission === screen.mission)!.id === screen.id;
  return (
    <section aria-labelledby="w11g-check" className="mt-6 rounded-2xl border border-reading-border bg-reading p-5 text-lg text-reading-foreground sm:p-6">
      <h2 id="w11g-check" className="text-xl font-semibold">Check your work</h2>
      {checks.length ? (
        <ul className="mt-2 space-y-1">{checks.map((c) => <li key={c.id}>{c.done ? "✓" : "○"} {c.label}{c.done ? "" : " — not yet"}</li>)}</ul>
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
