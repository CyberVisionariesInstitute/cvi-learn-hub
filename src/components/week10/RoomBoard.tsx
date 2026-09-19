import { useState } from "react";
import { cn } from "@/lib/utils";
import { Field, Hint, Panel } from "./ui";
import { ClinicMap } from "./ClinicMap";
import { evidenceById, roomById, rooms, type RoomId } from "@/lib/week10/case-packet";
import type { Week10Store } from "@/lib/week10/useWeek10";

const kindLabels: Record<string, string> = {
  document: "Document",
  statement: "Staff statement",
  "system-report": "System report",
  photo: "Photograph",
  certificate: "Certificate details",
};

export function RoomBoard({ store }: { store: Week10Store }) {
  const [active, setActive] = useState<RoomId | null>("reception");
  const { state, toggleFinding, visitRoom, update } = store;
  const room = active ? roomById(active) : null;

  function select(id: RoomId) {
    setActive(id);
    visitRoom(id);
  }

  return (
    <div className="space-y-4">
      <ClinicMap active={active} visited={state.visitedRooms} onSelect={select} />

      {room ? (
        <Panel eyebrow={`Room ${rooms.findIndex((r) => r.id === room.id) + 1}`} title={room.name}>
          <p className="text-sm leading-relaxed text-foreground">{room.plainIntro}</p>

          <div className="mt-4 rounded-md border border-border bg-background p-4">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              {room.staff.name} — {room.staff.role}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              “{room.staff.statement}”
            </p>
          </div>

          <h3 className="mt-5 font-display text-sm text-foreground">Evidence in this room</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adding a card keeps it in your findings list. It does not write your
            interpretation — what the evidence means is yours to say in the notebook and in
            Lab 1.
          </p>

          <ul className="mt-3 space-y-3">
            {room.evidenceIds.map((id) => {
              const card = evidenceById(id);
              if (!card) return null;
              const added = state.findings.includes(id);
              return (
                <li
                  key={id}
                  className="rounded-md border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-xs text-primary">{card.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {kindLabels[card.kind] ?? card.kind}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{card.title}</p>
                  <ul className="mt-2 space-y-1">
                    {card.detail.map((d, i) => (
                      <li key={i} className="text-sm leading-relaxed text-foreground">
                        {d}
                      </li>
                    ))}
                  </ul>
                  {card.unknowns?.length ? (
                    <div className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3">
                      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                        Not known from this evidence
                      </p>
                      {card.unknowns.map((u, i) => (
                        <p key={i} className="mt-1 text-sm text-foreground">
                          {u}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleFinding(id)}
                    aria-pressed={added}
                    className={cn(
                      "mt-3 min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                      added
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border hover:border-primary/60",
                    )}
                  >
                    {added ? "✓ In my findings — remove" : "Add to my findings"}
                  </button>
                </li>
              );
            })}
          </ul>

          <Hint mode={state.mode}>
            Ask three questions in every room: what is worth protecting here, what weakness
            can I actually see in the evidence, and what would it cost the clinic if
            something went wrong? If the evidence does not answer a question, write it down
            as an unknown rather than guessing.
          </Hint>
        </Panel>
      ) : null}

      <Panel title="My investigation notebook">
        <p className="text-sm text-muted-foreground">
          Yours to keep. Nothing here is graded automatically.
        </p>
        <div className="mt-3">
          <Field
            label="Notes"
            rows={8}
            value={state.notebook}
            placeholder="What did you notice? What questions do you still have?"
            onChange={(notebook) => update((prev) => ({ ...prev, notebook }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {state.findings.length} evidence card{state.findings.length === 1 ? "" : "s"} in your
          findings.
        </p>
      </Panel>
    </div>
  );
}
