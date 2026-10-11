import { useState } from "react";
import { Button } from "@/components/ui/button";
import { directoryLabel, denyCoaching, type InstructionStep } from "@/lib/week11/instructions";
import { slotHints, type Nav } from "@/lib/week11/guidance";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { missions } from "@/lib/week11/seed";
import { CaptureEvidence } from "./CaptureEvidence";
import { Badge } from "./ui";

export function InstructionStepPanel({ instruction, mission, store, go, currentDir }: {
  instruction: InstructionStep; mission: string; store: Week11Store; go: (nav: Nav) => void; currentDir?: "AD" | "CLOUD";
}) {
  const [capturing, setCapturing] = useState(false);
  const definition = missions.find((item) => item.key === mission);
  const slot = definition?.evidence.find((item) => item.slot === instruction.capture);
  return (
    <div className="min-w-0 space-y-3 text-sm [overflow-wrap:anywhere]">
      {instruction.group ? <Badge tone="info">{instruction.group}</Badge> : null}
      {instruction.dir ? <p className="flex flex-wrap items-center gap-2"><Badge tone="info">{directoryLabel(instruction.dir).toUpperCase()}</Badge>{currentDir && currentDir !== instruction.dir ? <span className="text-xs text-muted-foreground">Open the task below to switch directory.</span> : null}</p> : null}
      <dl className="max-w-prose space-y-3">
        <div><dt className="text-xs font-semibold text-primary">DO THIS</dt><dd className="mt-1 font-medium">{instruction.doing}</dd></div>
        <div><dt className="text-xs font-semibold text-primary">GO HERE</dt><dd className="mt-1">{instruction.where}</dd></div>
        <div><dt className="text-xs font-semibold text-primary">LOOK FOR</dt><dd className="mt-1">{instruction.lookFor}</dd></div>
        <div><dt className="text-xs font-semibold text-primary">WHEN DONE</dt><dd className="mt-1">{instruction.proves}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2">{instruction.links.map((nav, index) => <Button key={`${nav.view}-${index}`} type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal text-left text-xs" onClick={() => go(nav)}>Open {nav.label}{nav.account ? ` · ${nav.account}` : nav.ticket ? ` · ${nav.ticket}` : ""}</Button>)}</div>
      {slot && definition ? (
        <section className="border-l-4 border-amber bg-amber/10 p-3" aria-label={`Evidence ${slot.slot}`}>
          <h3 className="text-xs font-semibold">STOP — CAPTURE EVIDENCE</h3>
          <p className="mt-1 font-medium">{slot.slot} · {slot.label}</p>
          <p className="mt-1 text-xs">{slotHints[slot.slot]}</p>
          <Button type="button" variant="outline" className="mt-2 h-auto min-h-11 whitespace-normal" aria-expanded={capturing} aria-controls={`capture-${instruction.id}`} onClick={() => setCapturing((value) => !value)}>{capturing ? "Hide capture" : `Capture ${slot.slot} here`}</Button>
          {capturing ? <div id={`capture-${instruction.id}`} className="mt-3"><CaptureEvidence compact store={store} mission={mission} slots={definition.evidence} initialSlot={slot.slot} /></div> : null}
        </section>
      ) : null}
      <details className="border-t border-border pt-2"><summary className="cursor-pointer text-xs">Need help?</summary><div className="mt-2 max-w-prose space-y-2 text-xs text-muted-foreground"><p>Use the Open button to reach this screen. In Users, use Jump to Sign-in tester or Jump to Test Access for the testers on the account page.</p><p>If a named account is not listed, check the directory context. A planned account must be created in its earlier task.</p></div></details>
      <details><summary className="cursor-pointer text-xs">Why this matters</summary><p className="mt-2 max-w-prose text-xs text-muted-foreground">{definition?.objective} This small step contributes to that lab; a personal checkmark is not an assessment result.</p></details>
      <details><summary className="cursor-pointer text-xs">Terms / analogy</summary><p className="mt-2 max-w-prose text-xs text-muted-foreground">A person is the human. Each account is a separate sign-in badge. An OU is a filing folder in Active Directory, not an access grant. A group is a list of accounts. A role is a bundle of allowed job actions. A permission is one action on a resource. Authentication checks the badge; authorization checks what it may open.</p></details>
      <details><summary className="cursor-pointer text-xs">Troubleshooting</summary><div className="mt-2 max-w-prose space-y-2 text-xs text-muted-foreground"><p>{denyCoaching}</p><p>If an action is refused, read its reason and check the linked ticket. Correct only what the task requires; retest and capture the new record. Do not reset between labs unless your instructor tells you to.</p></div></details>
    </div>
  );
}
