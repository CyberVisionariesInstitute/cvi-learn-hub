import { useEffect, useMemo, useState } from "react";
import { CharacterLayer, usePrefersReducedMotion } from "../CharacterLayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type {
  Character,
  Environment,
  EnvironmentHotspot,
  HotspotAnchor,
  RouteChoiceInteraction,
  RouteResponse,
} from "@/lib/demo-lab/types";
import type { ExperienceController } from "@/lib/demo-lab/useExperienceState";

function anchorOf(a: HotspotAnchor, mobile: boolean) {
  return {
    x: mobile ? (a.mobileX ?? a.x) : a.x,
    y: mobile ? (a.mobileY ?? a.y) : a.y,
  };
}

/** Gentle curve between two stage points, in stage-percent space. */
function routePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fraction = 1,
) {
  const ex = from.x + (to.x - from.x) * fraction;
  const ey = from.y + (to.y - from.y) * fraction;
  const cx = (from.x + ex) / 2;
  const cy = Math.max(from.y, ey) + 6;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${ex} ${ey}`;
}

export function NeighborhoodRoute({
  interaction,
  controller,
  environment,
  character,
}: {
  interaction: RouteChoiceInteraction;
  controller: ExperienceController;
  environment: Environment;
  character: Character | undefined;
}) {
  const mobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const { sceneState, answer, revealEvidenceIds, setCharacterState, complete } =
    controller;
  const [lastChoice, setLastChoice] = useState<{
    requestId: string;
    hotspotId: string;
    correct: boolean;
    response: RouteResponse;
  } | null>(null);

  const hotspots = interaction.hotspots;
  const origin = hotspots.find((h) => h.kind === "origin")!;
  const gateway = hotspots.find((h) => h.kind === "gateway")!;

  const activeRequest = useMemo(() => {
    const pending = interaction.requests.find(
      (r) => sceneState.answers[r.id] !== r.correctHotspotId,
    );
    return pending ?? interaction.requests[interaction.requests.length - 1]!;
  }, [interaction.requests, sceneState.answers]);

  /* Ivy arrives once, then settles. Motion is never required for progress. */
  useEffect(() => {
    if (sceneState.characterState) return;
    if (reducedMotion) {
      setCharacterState("ivy-idle");
      return;
    }
    setCharacterState("ivy-enter");
    const t = window.setTimeout(() => setCharacterState("ivy-idle"), 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const characterState = controller.characterState;
  const characterAnchor = anchorOf(
    interaction.characterAnchors?.[characterState] ??
      interaction.characterAnchors?.["ivy-idle"] ?? { x: origin.x, y: origin.y },
    mobile,
  );

  function choose(hotspot: EnvironmentHotspot) {
    const request = activeRequest;
    const isCorrect = hotspot.id === request.correctHotspotId;
    const response = isCorrect
      ? request.correct
      : (request.incorrect[hotspot.id] ?? request.incorrect["*"]!);

    answer(request.id, hotspot.id);
    revealEvidenceIds(response.revealsEvidenceIds ?? []);
    setLastChoice({
      requestId: request.id,
      hotspotId: hotspot.id,
      correct: isCorrect,
      response,
    });
    setCharacterState(
      response.characterState ?? (isCorrect ? "ivy-nod" : "ivy-thinking"),
    );
  }

  const answeredCount = interaction.requests.filter(
    (r) => sceneState.answers[r.id] === r.correctHotspotId,
  ).length;

  const solvedHotspotIds = new Set(
    interaction.requests
      .filter((r) => sceneState.answers[r.id] === r.correctHotspotId)
      .map((r) => r.correctHotspotId),
  );

  const from = anchorOf(origin, mobile);
  const activeTarget = lastChoice
    ? hotspots.find((h) => h.id === lastChoice.hotspotId)
    : undefined;
  const to = activeTarget ? anchorOf(activeTarget, mobile) : undefined;

  return (
    <div className="@container space-y-4">
      {/* ---------------------------------------------------------- Stage */}
      <div
        className={cn(
          "scene-depth relative isolate w-full overflow-hidden rounded-xl border border-border/50 shadow-[var(--shadow-depth)]",
          "aspect-[3/4] @md:aspect-[16/10] @3xl:aspect-[16/9]",
        )}
        data-complete={complete ? "true" : "false"}
      >
        {environment.backgroundSrc ? (
          <img
            src={environment.backgroundSrc}
            alt=""
            aria-hidden="true"
            className={cn("absolute -inset-1 size-[calc(100%+0.5rem)] object-cover object-[62%_center] transition-[transform,filter] duration-1000 @md:object-center", complete ? "scale-[1.012] brightness-110" : "scale-100")}
          />
        ) : (
          <div aria-hidden="true" className="atmosphere absolute inset-0" />
        )}

        {/* depth scrims */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,transparent_35%,oklch(0.12_0.05_260/0.75))]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background/70 to-transparent"
        />
        <div aria-hidden="true" className="absolute inset-x-[-8%] bottom-[-4%] h-[24%] rounded-[50%] bg-background/55 blur-xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,transparent,var(--color-background)/65)]" />

        {/* distant Cloud Heights promise — brightens on completion */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute top-[18%] left-1/2 h-[16%] w-[26%] -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-1000",
            complete ? "opacity-80" : "opacity-30",
          )}
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 55%, transparent), transparent)",
          }}
        />

        {/* route trace */}
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {to && lastChoice ? (
            <path
              d={routePath(from, to, lastChoice.correct ? 1 : 0.55)}
              fill="none"
              strokeWidth={lastChoice.correct ? 0.9 : 0.7}
              strokeLinecap="round"
              stroke={
                lastChoice.correct ? "var(--color-primary)" : "var(--color-amber)"
              }
              strokeDasharray={lastChoice.correct ? undefined : "2 2"}
              opacity={0.95}
              className="route-draw"
            />
          ) : null}
          {complete
            ? interaction.requests.map((r) => {
                const target = hotspots.find((h) => h.id === r.correctHotspotId);
                if (!target) return null;
                return (
                  <path
                    key={r.id}
                    d={routePath(from, anchorOf(target, mobile))}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={0.5}
                    strokeLinecap="round"
                    opacity={0.5}
                    className="route-draw"
                  />
                );
              })
            : null}
        </svg>

        {/* neighborhood directory sign */}
        <div className={cn("absolute top-3 left-3 max-w-[52%] rounded-sm border border-primary/40 bg-background/85 px-3 py-2 shadow-[var(--shadow-object)] backdrop-blur-sm transition-[box-shadow,transform] duration-300 @md:top-5 @md:left-5", lastChoice && !lastChoice.correct && "translate-y-[-2px] shadow-[var(--shadow-focus-light)]")}>
          <p className="font-display text-[0.7rem] tracking-[0.18em] text-primary uppercase">
            {interaction.sign.title}
          </p>
          {interaction.sign.lines.map((line) => (
            <p key={line} className="font-mono text-[0.7rem] text-foreground @md:text-xs">
              {line}
            </p>
          ))}
        </div>

        {/* Ivy in scene */}
        {character ? (
          <div
            className={cn(
              "absolute z-10 h-[26%] w-[9%] min-w-14 -translate-x-1/2 -translate-y-full",
              "transition-all duration-700 ease-out motion-reduce:transition-none",
              characterState === "ivy-enter" && "opacity-0",
            )}
            style={{ left: `${characterAnchor.x}%`, top: `${characterAnchor.y}%` }}
          >
            <CharacterLayer character={character} state={characterState} variant="figure" />
          </div>
        ) : null}

        {/* environmental hotspots */}
        {hotspots.map((hotspot) => {
          const pos = anchorOf(hotspot, mobile);
          const solved = solvedHotspotIds.has(hotspot.id);
          const isOrigin = hotspot.kind === "origin";
          const chosen = lastChoice?.hotspotId === hotspot.id;
          return (
            <div
              key={hotspot.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_8px_color-mix(in_oklab,var(--background)_70%,transparent)]"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <button
                type="button"
                disabled={isOrigin}
                onClick={() => choose(hotspot)}
                aria-label={
                  isOrigin
                    ? `${hotspot.label}, ${hotspot.address}. Ivy's starting point.`
                    : `Route ${activeRequest.address} to ${hotspot.label}${
                        hotspot.address ? `, ${hotspot.address}` : ""
                      }${hotspot.kind === "gateway" ? ", the neighborhood exit" : ""}`
                }
                className={cn(
                  "tactile-control group flex min-h-11 items-center gap-2 rounded-sm border px-2.5 py-1.5 text-left backdrop-blur-sm",
                  "bg-background/80 hover:border-primary hover:bg-background/95",
                  isOrigin && "cursor-default border-border/70 opacity-90",
                  !isOrigin && "border-primary/40",
                  chosen && !lastChoice?.correct && "border-amber",
                  solved && "border-primary bg-primary/25 shadow-[var(--shadow-focus-light)]",
                  complete && hotspot.kind === "gateway" && "border-evidence bg-evidence/20 shadow-[var(--shadow-focus-light)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-block size-2 shrink-0 rounded-full",
                    solved
                      ? "bg-primary"
                      : hotspot.kind === "gateway"
                        ? "bg-amber"
                        : "bg-muted-foreground",
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-[0.68rem] leading-tight font-medium text-foreground @md:text-xs">
                    {hotspot.label}
                    {solved ? (
                      <span className="ml-1 text-[0.6rem] text-primary">routed</span>
                    ) : null}
                  </span>
                  {hotspot.address ? (
                    <span className="block font-mono text-[0.62rem] leading-tight text-muted-foreground @md:text-[0.7rem]">
                      {hotspot.address}
                    </span>
                  ) : null}
                  {hotspot.signage?.map((line) => (
                    <span
                      key={line}
                      className="block text-[0.62rem] leading-tight text-amber @md:text-[0.68rem]"
                    >
                      {line}
                    </span>
                  ))}
                </span>
              </button>
            </div>
          );
        })}

        {/* Ivy's work order, mounted in-scene */}
        <div className="absolute right-3 bottom-3 left-3 z-20 rotate-[-0.4deg] rounded-sm border border-border/70 bg-background/90 p-3 shadow-[var(--shadow-object)] backdrop-blur-sm @md:left-auto @md:right-5 @md:bottom-5 @md:max-w-xs">
          <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
            Ivy's work order · {answeredCount} of {interaction.requests.length} routed
          </p>
          <p className="mt-1 text-sm leading-snug text-foreground">
            {complete ? interaction.completion.headline : activeRequest.workOrder}
          </p>
          <p className="mt-1 font-mono text-xs text-primary">
            {complete ? "" : activeRequest.address}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------ Below the stage */}
      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div aria-live="polite" className="space-y-3">
          {complete ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
              <p className="font-display text-sm text-foreground">
                {interaction.completion.headline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {interaction.completion.body}
              </p>
            </div>
          ) : lastChoice ? (
            <div
              className={cn(
                "rounded-lg border p-4",
                lastChoice.correct
                  ? "border-primary/40 bg-primary/10"
                  : "border-amber/50 bg-amber/10",
              )}
            >
              <p className="font-display text-sm text-foreground">
                {lastChoice.response.headline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {lastChoice.response.body}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{interaction.instruction}</p>
          )}

          {interaction.scopeNote ? (
            <p className="rounded-lg border border-amber/40 bg-amber/10 p-3 text-sm text-foreground">
              {interaction.scopeNote}
            </p>
          ) : null}
        </div>

        <ol className="space-y-2" aria-label="Destinations on the work order">
          {interaction.requests.map((request) => {
            const chosen = sceneState.answers[request.id];
            const solved = chosen === request.correctHotspotId;
            const active = request.id === activeRequest.id && !complete;
            const chosenHotspot = hotspots.find((h) => h.id === chosen);
            return (
              <li
                key={request.id}
                className={cn(
                  "rounded-md border px-3 py-2",
                  active ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                <p className="font-mono text-sm text-foreground">
                  {request.address}
                  {active ? (
                    <span className="ml-2 font-sans text-[0.65rem] tracking-[0.16em] text-primary uppercase">
                      current
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {solved
                    ? `Routed via ${chosenHotspot?.label}`
                    : chosen
                      ? `Tried ${chosenHotspot?.label} — still open`
                      : "Not routed yet"}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
