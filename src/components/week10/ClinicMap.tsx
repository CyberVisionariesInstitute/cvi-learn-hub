import { cn } from "@/lib/utils";
import { rooms, type RoomId } from "@/lib/week10/case-packet";

/**
 * Clinic floor plan. Drawn natively with SVG — no external artwork.
 * Every room is a real button, so the plan works with mouse, keyboard and
 * touch. An equivalent list is rendered alongside it for anyone who prefers
 * or requires linear navigation.
 */
export function ClinicMap({
  active,
  visited,
  onSelect,
}: {
  active: RoomId | null;
  visited: string[];
  onSelect: (id: RoomId) => void;
}) {
  return (
    <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <h3 className="font-display text-sm tracking-[0.16em] text-muted-foreground uppercase">
          Clinic floor plan
        </h3>
        <div className="relative mt-3 aspect-[4/3] w-full">
          <svg
            viewBox="0 0 100 100"
            role="presentation"
            className="absolute inset-0 h-full w-full"
          >
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="2"
              className="fill-background stroke-border"
              strokeWidth="0.6"
            />
            <line x1="46" y1="6" x2="46" y2="76" className="stroke-border" strokeWidth="0.4" />
            <line x1="4" y1="76" x2="96" y2="76" className="stroke-border" strokeWidth="0.4" />
            <text x="50" y="72" textAnchor="middle" className="fill-muted-foreground" fontSize="2.6">
              patient corridor
            </text>
          </svg>
          {rooms.map((room, i) => {
            const isActive = room.id === active;
            const seen = visited.includes(room.id);
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelect(room.id)}
                aria-pressed={isActive}
                style={{
                  left: `${room.plan.x}%`,
                  top: `${room.plan.y}%`,
                  width: `${room.plan.w}%`,
                  height: `${room.plan.h}%`,
                }}
                className={cn(
                  "absolute flex flex-col justify-between rounded-md border p-2 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/20"
                    : "border-border bg-surface-raised hover:border-primary/60",
                )}
              >
                <span className="text-xs font-semibold text-foreground">
                  {i + 1}. {room.name}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {seen ? "✓ visited" : "not visited yet"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <h3 className="font-display text-sm tracking-[0.16em] text-muted-foreground uppercase">
          Rooms (list view)
        </h3>
        <ul className="mt-3 space-y-2">
          {rooms.map((room, i) => {
            const isActive = room.id === active;
            const seen = visited.includes(room.id);
            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => onSelect(room.id)}
                  aria-pressed={isActive}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "min-h-14 w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/15"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">
                    {i + 1}. {room.name} {seen ? "· visited" : ""}
                  </span>
                  <span className="block text-xs text-muted-foreground">{room.purpose}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
