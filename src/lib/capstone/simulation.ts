/**
 * Phase 3 Stage 3 — deterministic workload simulation engine.
 *
 * Same project state + scenario package + rule version + project clock
 * produces the same ExecutionRun. There is no randomness anywhere in here.
 */

import type {
  EventEffects,
  ScenarioPublic,
  WorkloadDefinition,
} from "./scenario-types";
import type {
  DependencyCheck,
  ExecutionRun,
  FailureCategory,
  Phase3State,
  WorkloadInstance,
} from "./project-state";

export const SIM_RULE_VERSION = "sim-1.0.0";

export interface SimulationInput {
  state: Phase3State;
  scenario: ScenarioPublic;
  instance: WorkloadInstance;
  definition: WorkloadDefinition;
  effects: EventEffects[];
  activeEventKeys: string[];
  clockDay: number;
  at: string;
  runId: string;
}

interface Ctx {
  checks: DependencyCheck[];
  order: number;
  failed: boolean;
}

function record(
  ctx: Ctx,
  key: string,
  label: string,
  ok: boolean,
  expected: string,
  observed: string,
  fail?: { category: FailureCategory; code: string; consequence: string; objectRef?: string },
) {
  ctx.order += 1;
  if (ctx.failed) {
    ctx.checks.push({
      order: ctx.order,
      key,
      label,
      result: "skipped",
      expected,
      observed: "Not evaluated — an earlier dependency failed.",
    });
    return false;
  }
  ctx.checks.push({
    order: ctx.order,
    key,
    label,
    result: ok ? "pass" : "fail",
    expected,
    observed,
    ...(ok ? {} : fail ?? {}),
  });
  if (!ok) ctx.failed = true;
  return ok;
}

function mergeEffects(effects: EventEffects[]) {
  const disabled: [string, string][] = [];
  const allowed: [string, string][] = [];
  const statusOverrides: Record<string, string> = {};
  let disableTimestamping = false;
  let requireGovernedSigning = false;
  for (const e of effects) {
    disabled.push(...(e.disablePaths ?? []));
    allowed.push(...(e.allowPaths ?? []));
    Object.assign(statusOverrides, e.statusOverrides ?? {});
    disableTimestamping ||= !!e.disableTimestamping;
    requireGovernedSigning ||= !!e.requireGovernedSigning;
  }
  return { disabled, allowed, statusOverrides, disableTimestamping, requireGovernedSigning };
}

function pathAvailable(
  state: Phase3State,
  fromZone: string,
  toZone: string,
  scenario: ScenarioPublic,
  merged: ReturnType<typeof mergeEffects>,
) {
  if (fromZone === toZone) return { ok: true, reason: "same zone" };
  const blockedByScenario = scenario.policy.prohibitedPaths.some(
    ([a, b]) => (a === fromZone && b === toZone) || (a === toZone && b === fromZone),
  );
  const explicitlyAllowed = merged.allowed.some(
    ([a, b]) => (a === fromZone && b === toZone) || (a === toZone && b === fromZone),
  );
  const blockedByEvent = merged.disabled.some(
    ([a, b]) => (a === fromZone && b === toZone) || (a === toZone && b === fromZone),
  );
  if ((blockedByScenario || blockedByEvent) && !explicitlyAllowed)
    return { ok: false, reason: "the path between these zones is not available in the current scenario state" };

  const hasEdge = state.architecture.edges.some((e) => {
    if (e.kind !== "network") return false;
    const a = state.architecture.nodes.find((n) => n.id === e.fromId);
    const b = state.architecture.nodes.find((n) => n.id === e.toId);
    if (!a || !b) return false;
    return (
      (a.zoneId === fromZone && b.zoneId === toZone) ||
      (a.zoneId === toZone && b.zoneId === fromZone)
    );
  });
  return hasEdge
    ? { ok: true, reason: "network relationship present" }
    : { ok: false, reason: "no network relationship connects these zones" };
}

export function executeWorkload(input: SimulationInput): ExecutionRun {
  const { state, scenario, instance, definition, clockDay } = input;
  const merged = mergeEffects(input.effects);
  const ctx: Ctx = { checks: [], order: 0, failed: false };
  const assets = state.operations.assets;
  const bind = (role: string) => assets.find((a) => a.id === instance.bindings[role]);
  const primaryRole = definition.type === "mtls" ? "server" : definition.type === "code-signing" || definition.type === "cicd" ? "signing" : definition.type === "timestamping" ? "tsa" : "server";
  const primary = bind(primaryRole);
  const client = bind("client");
  const tsa = bind("tsa");

  // 1 config / schema / workload support
  record(
    ctx,
    "config",
    "Workload configuration and supported type",
    !!definition && !!instance.name,
    `A supported workload type (${definition?.type ?? "?"}) with a named instance`,
    definition ? `Instance "${instance.name}" of type ${definition.type}` : "Unknown workload definition",
    { category: "Configuration", code: "CFG-001", consequence: "The run cannot be constructed." },
  );

  // 2 binding to project / scenario / version
  record(
    ctx,
    "binding",
    "Workload bound to this project's scenario and version",
    scenario.workloads.some((w) => w.id === instance.definitionId),
    `Workload defined by ${scenario.code}@${scenario.version}`,
    scenario.workloads.some((w) => w.id === instance.definitionId)
      ? `Bound to ${scenario.code}@${scenario.version}`
      : "Workload definition does not belong to the assigned scenario version",
    { category: "Configuration", code: "CFG-002", consequence: "Results would not be comparable to the assigned scenario." },
  );

  // 3 source / target existence and type
  const source = state.architecture.nodes.find((n) => n.id === instance.sourceNodeId);
  const target = state.architecture.nodes.find((n) => n.id === instance.targetNodeId);
  record(
    ctx,
    "endpoints",
    "Source and target components exist",
    !!source && !!target,
    "Both endpoints resolve to components in your architecture",
    `source=${source?.name ?? "missing"}, target=${target?.name ?? "missing"}`,
    {
      category: "Configuration",
      code: "CFG-010",
      consequence: "There is nothing to execute between.",
      objectRef: instance.name,
    },
  );

  // 4 network path / dependency availability
  const path =
    source && target
      ? pathAvailable(state, source.zoneId, target.zoneId, scenario, merged)
      : { ok: false, reason: "endpoints unresolved" };
  record(
    ctx,
    "path",
    "Network path and dependency availability",
    path.ok,
    `A permitted path from ${definition.sourceZone} to ${definition.targetZone}`,
    path.ok ? `Reachable: ${path.reason}` : `Unreachable: ${path.reason}`,
    {
      category: "Connectivity",
      code: "NET-001",
      consequence: "The workload cannot reach its dependency, regardless of trust.",
      objectRef: `${source?.name ?? "?"} → ${target?.name ?? "?"}`,
    },
  );

  // 5 certificate role bindings
  const needsClient = definition.type === "mtls";
  const bindingsOk = !!primary && (!needsClient || !!client);
  record(
    ctx,
    "bindings",
    "Certificate bindings for every required role",
    bindingsOk,
    needsClient ? "A server certificate and a client/device certificate" : `A ${primaryRole} certificate`,
    bindingsOk
      ? [primary?.label, needsClient ? client?.label : null].filter(Boolean).join(" + ")
      : "One or more required certificate roles are unbound",
    {
      category: "Configuration",
      code: "CFG-020",
      consequence: "No credential is presented for the required role.",
      objectRef: instance.name,
    },
  );

  // 6 identity / SAN
  const profile = state.operations.profiles.find((p) => p.id === primary?.profileId);
  const identityOk =
    !!primary &&
    (!profile ||
      !profile.san.trim() ||
      !target ||
      profile.san.toLowerCase().includes(target.name.toLowerCase().split(" ")[0] ?? "") ||
      profile.san.includes("*"));
  record(
    ctx,
    "identity",
    "Identity / SAN matches the target",
    identityOk,
    `Subject or SAN that covers ${target?.name ?? "the target"}`,
    identityOk
      ? `SAN "${profile?.san || "not constrained"}" accepted for ${target?.name ?? "target"}`
      : `SAN "${profile?.san}" does not cover ${target?.name}`,
    {
      category: "Certificate",
      code: "CRT-010",
      consequence: "The relying party rejects the presented identity.",
      objectRef: primary?.label,
    },
  );

  // 7 lifecycle / activation
  const lifecycleOk =
    !!primary &&
    ["Issued", "Active", "Renewal Due", "Renewal Pending"].includes(primary.lifecycle) &&
    (!client || ["Issued", "Active", "Renewal Due", "Renewal Pending"].includes(client.lifecycle));
  record(
    ctx,
    "lifecycle",
    "Certificate lifecycle state permits use",
    lifecycleOk,
    "Bound certificates are Issued or Active (renewal states still serve)",
    lifecycleOk
      ? `${primary?.label}: ${primary?.lifecycle}`
      : `${primary?.label ?? "certificate"}: ${primary?.lifecycle ?? "unbound"}${client ? `, ${client.label}: ${client.lifecycle}` : ""}`,
    {
      category: "Certificate",
      code: "CRT-020",
      consequence: "A certificate in this state is not usable by the workload.",
      objectRef: primary?.label,
    },
  );

  // 8 validity at project clock
  const remaining = (primary?.daysRemaining ?? null) === null ? null : (primary!.daysRemaining as number) - clockDay;
  const validityOk = remaining === null ? true : remaining > 0;
  record(
    ctx,
    "validity",
    "Validity at the current project clock",
    validityOk,
    `Not expired at project day ${clockDay}`,
    remaining === null
      ? "No expiry modelled for this certificate"
      : `${remaining} day(s) remaining at project day ${clockDay}`,
    {
      category: "Certificate",
      code: "CRT-030",
      consequence: "An expired credential is rejected at handshake time.",
      objectRef: primary?.label,
    },
  );

  // 9 authoritative revocation
  const revoked = primary?.lifecycle === "Revoked" || client?.lifecycle === "Revoked";
  record(
    ctx,
    "revocation",
    "Authoritative revocation state",
    !revoked,
    "No bound certificate is revoked in the authoritative record",
    revoked ? "A bound certificate is revoked by the issuing authority" : "No revocation recorded",
    {
      category: "Certificate",
      code: "CRT-040",
      consequence: "The credential is authoritatively invalid even if consumers have not noticed.",
      objectRef: primary?.label,
    },
  );

  // 10 consumer status observation / policy
  const overriddenStatus = primary ? merged.statusOverrides[primary.id] : undefined;
  const observedStatus = (overriddenStatus ?? primary?.status ?? "Unknown") as string;
  const publication = state.operations.publications.find(
    (p) => p.consumerZoneId === (source?.zoneId ?? ""),
  );
  const statusReachable = publication ? publication.reachable : false;
  const statusOk =
    observedStatus === "Good" ||
    observedStatus === "Not Applicable" ||
    (observedStatus === "Stale" && !!publication && publication.freshnessHours <= 168 && statusReachable);
  record(
    ctx,
    "status-observation",
    "Consumer status observation",
    statusOk,
    "The relying party can observe a current, authoritative status answer",
    publication
      ? `Observed "${observedStatus}" via ${publication.method}, ${publication.freshnessHours}h old, ${statusReachable ? "reachable" : "unreachable"}`
      : `Observed "${observedStatus}" with no status distribution configured for ${source?.zoneId || "the consumer zone"}`,
    {
      category: "Status",
      code: "STAT-010",
      consequence: "The relying party cannot prove the certificate's current standing.",
      objectRef: primary?.label,
    },
  );

  // 11 chain / trust anchor
  const ca = state.architecture.nodes.find((n) => n.id === primary?.caNodeId);
  let anchor = ca;
  const seen = new Set<string>();
  while (anchor?.parentId && !seen.has(anchor.id)) {
    seen.add(anchor.id);
    anchor = state.architecture.nodes.find((n) => n.id === anchor!.parentId);
  }
  const chainOk = !!ca && anchor?.kind === "ca-root";
  record(
    ctx,
    "chain",
    "Chain builds to a trusted anchor",
    chainOk,
    "The bound certificate chains to a root the relying party trusts",
    chainOk
      ? `${ca?.name} → ${anchor?.name}`
      : ca
        ? `${ca.name} does not chain to a root authority`
        : "No issuing authority recorded for the bound certificate",
    {
      category: "Trust",
      code: "TRU-010",
      consequence: "Path building fails; the peer is untrusted.",
      objectRef: primary?.label,
    },
  );

  // 12 EKU / key usage / profile / approval / scenario policy
  const ekuOk = !profile || !definition.requiredEku || profile.eku.toLowerCase().includes(definition.requiredEku.toLowerCase());
  const approvalOk =
    !merged.requireGovernedSigning ||
    definition.type === "tls" ||
    definition.type === "mtls" ||
    profile?.approval === "governed";
  record(
    ctx,
    "policy",
    "Key usage, profile and approval policy",
    ekuOk && approvalOk,
    `${definition.requiredEku || "Any"} key usage under an approved profile`,
    !ekuOk
      ? `Profile EKU "${profile?.eku}" does not include ${definition.requiredEku}`
      : !approvalOk
        ? `Profile approval mode "${profile?.approval ?? "none"}" is not the governed mode this operation now requires`
        : `EKU ${profile?.eku ?? "unconstrained"}, approval ${profile?.approval ?? "n/a"}`,
    {
      category: "Policy/Governance",
      code: "POL-010",
      consequence: "The operation is refused by policy even though the certificate is technically valid.",
      objectRef: profile?.name ?? primary?.label,
    },
  );

  // 13 HSM / signing / TSA dependencies
  if (definition.type === "code-signing" || definition.type === "cicd" || definition.type === "timestamping") {
    const hsmOk = !definition.requiresHsm || !!ca?.hsmId;
    record(
      ctx,
      "signing-deps",
      "Signing key protection and signing service",
      hsmOk,
      definition.requiresHsm ? "Signing key protected by an HSM" : "Signing service available",
      hsmOk ? `Signing authority ${ca?.name ?? "n/a"}${ca?.hsmId ? " (HSM-protected)" : ""}` : `Signing key for ${ca?.name} is not HSM-protected`,
      {
        category: "Signing",
        code: "SIG-010",
        consequence: "The release cannot be signed under the governing policy.",
        objectRef: ca?.name,
      },
    );
    if (definition.requiresTimestamp) {
      const tsOk = !merged.disableTimestamping && !!tsa;
      record(
        ctx,
        "timestamp",
        "Timestamp authority availability",
        tsOk,
        "A trusted timestamp can be obtained for the artifact",
        merged.disableTimestamping
          ? "Timestamp requests are failing — the timestamp authority path is unavailable"
          : tsa
            ? `Timestamping via ${tsa.label}`
            : "No timestamp authority certificate is bound",
        {
          category: "Timestamp",
          code: "TSA-010",
          consequence: "New releases cannot obtain a trusted timestamp; previously timestamped artifacts keep their historical validity.",
          objectRef: tsa?.label ?? "timestamp authority",
        },
      );
    }
  } else {
    ctx.order += 1;
    ctx.checks.push({
      order: ctx.order,
      key: "signing-deps",
      label: "Signing / timestamp dependencies",
      result: "skipped",
      expected: "Not applicable to this workload type",
      observed: "Skipped",
    });
  }

  // 14 scenario-specific requirement
  const scenarioReq = definition.scenarioRequirement;
  let scenarioOk = true;
  let scenarioObserved = "No scenario-specific requirement for this workload";
  if (scenarioReq === "offline-tolerant-status") {
    const pub = state.operations.publications.find((p) => p.consumerZoneId === source?.zoneId);
    scenarioOk = !!pub && (pub.method === "Scheduled CRL" || pub.method === "CRL");
    scenarioObserved = pub
      ? `Consumer zone uses ${pub.method}`
      : "Consumer zone has no status distribution that survives loss of live responder access";
  } else if (scenarioReq === "governed-production-signing") {
    scenarioOk = profile?.environment === "production" && profile.approval === "governed";
    scenarioObserved = profile
      ? `Profile environment ${profile.environment}, approval ${profile.approval}`
      : "No profile bound";
  } else if (scenarioReq === "device-identity-owner") {
    scenarioOk = !!primary && primary.ownerState !== "Unknown";
    scenarioObserved = primary ? `Owner state: ${primary.ownerState}` : "No certificate bound";
  }
  record(
    ctx,
    "scenario",
    "Scenario-specific requirement",
    scenarioOk,
    scenarioReq ? `Scenario rule: ${scenarioReq}` : "No additional scenario rule",
    scenarioObserved,
    {
      category: "Policy/Governance",
      code: "SCN-010",
      consequence: "The workload does not meet a requirement this organization stated.",
      objectRef: definition.name,
    },
  );

  const result: "PASS" | "FAIL" = ctx.checks.some((c) => c.result === "fail") ? "FAIL" : "PASS";

  // 15 final result
  ctx.order += 1;
  ctx.checks.push({
    order: ctx.order,
    key: "result",
    label: "Final result",
    result: result === "PASS" ? "pass" : "fail",
    expected: "All applicable dependency checks pass",
    observed:
      result === "PASS"
        ? "Every applicable dependency check passed"
        : `First failure: ${ctx.checks.find((c) => c.result === "fail")?.label}`,
  });

  const priorRunIds = state.workloads.runs
    .filter((r) => r.workloadInstanceId === instance.id)
    .map((r) => r.id);

  const artifacts =
    definition.type === "cicd" || definition.type === "code-signing"
      ? [
          {
            id: `${input.runId}-art`,
            kind: "release-artifact",
            label: `${instance.name} build`,
            detail: result === "PASS" ? "Signed and verified" : "Not released",
          },
        ]
      : [];

  const timestamps =
    definition.requiresTimestamp && artifacts.length > 0
      ? [
          {
            id: `${input.runId}-ts`,
            artifactId: artifacts[0]!.id,
            at: input.at,
            valid: !merged.disableTimestamping && result === "PASS",
            note: merged.disableTimestamping
              ? "No new trusted timestamp could be obtained. Timestamps already bound to earlier artifacts remain valid."
              : "Timestamp binds artifact and signature at signing time.",
          },
        ]
      : [];

  return {
    id: input.runId,
    workloadInstanceId: instance.id,
    definitionId: definition.id,
    at: input.at,
    clockDay,
    scenarioVersion: scenario.version,
    ruleVersion: SIM_RULE_VERSION,
    result,
    checks: ctx.checks,
    artifacts,
    timestamps,
    priorRunIds,
    activeEventKeys: input.activeEventKeys,
  };
}
