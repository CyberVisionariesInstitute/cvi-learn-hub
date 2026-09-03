/**
 * Phase 3 — GitHub-ready Portfolio Package builder (server-only).
 *
 * This produces a SANITIZED, public-safe representation of a student's own
 * capstone work. It is deliberately NOT the signed backup/restore export:
 * nothing produced here can be imported back into the capstone.
 *
 * Privacy contract enforced in this module:
 *  - no database identifiers (project / assignment / owner / revision ids)
 *  - no signatures, HMACs, tokens, URLs, secrets or audit metadata
 *  - no email addresses (display name only, and only if it is not an email)
 *  - no instructor-private scenario content, calibration, difficulty,
 *    answer guidance, hidden or unactivated Stage 4 events
 *  - every emitted file passes a final scrub for UUID / email / key patterns
 */

import type { Phase3State, ArchNode, CertAsset } from "./project-state";
import type { ScenarioPublic } from "./scenario-types";
import { STAGES } from "./model";

export interface PortfolioEvidence {
  stage: string;
  week: number | null;
  title: string;
  body: string | null;
}

export interface PortfolioEvent {
  title: string;
  studentBrief: string;
}

export interface PortfolioInput {
  displayName: string | null;
  scenario: ScenarioPublic;
  state: Phase3State;
  evidence: PortfolioEvidence[];
  /** ACTIVATED, student-visible Stage 4 briefs only. */
  activatedEvents: PortfolioEvent[];
  submitted: boolean;
  generatedAt: string;
}

export type PortfolioFiles = Record<string, string>;

/* ------------------------------------------------------------- sanitizing */

const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
const HEX64_RE = /\b[0-9a-f]{40,}\b/gi;
const SECRETish_RE = /\b(sb_secret_[\w-]+|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{5,})\b/g;

/** Final safety net applied to every generated file. */
export function scrub(text: string): string {
  return text
    .replace(UUID_RE, "[identifier removed]")
    .replace(SECRETish_RE, "[removed]")
    .replace(HEX64_RE, "[removed]")
    .replace(EMAIL_RE, "[contact removed]");
}

function safeName(displayName: string | null): string | null {
  if (!displayName) return null;
  const trimmed = displayName.trim();
  if (!trimmed || trimmed.includes("@")) return null;
  return trimmed;
}

/* --------------------------------------------------------------- helpers */

function md(lines: (string | null | undefined)[]): string {
  return lines.filter((l) => l !== null && l !== undefined).join("\n") + "\n";
}

function bullets(items: string[]): string[] {
  return items.length ? items.map((i) => `- ${i}`) : ["_None recorded._"];
}

function section(title: string, body: string[]): string[] {
  return [`## ${title}`, "", ...body, ""];
}

function table(headers: string[], rows: string[][]): string[] {
  if (!rows.length) return ["_None recorded._"];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map((c) => (c || "—").replace(/\|/g, "\\|")).join(" | ")} |`),
  ];
}

function mermaidId(name: string, index: number): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return `${slug || "node"}${index}`;
}

/* ------------------------------------------------------------ generators */

function architectureDoc(input: PortfolioInput): string {
  const { state, scenario } = input;
  const nodes = state.architecture.nodes;
  const edges = state.architecture.edges;
  const zoneName = (id: string) =>
    scenario.zones.find((z) => z.id === id)?.name ?? "Unzoned";
  const nodeName = (id: string | undefined) =>
    nodes.find((n) => n.id === id)?.name ?? "—";

  if (!nodes.length) {
    return md([
      "# Architecture",
      "",
      "_No architecture has been recorded in this snapshot yet._",
    ]);
  }

  const ids = new Map<string, string>();
  nodes.forEach((n, i) => ids.set(n.id, mermaidId(n.name, i + 1)));

  const zones = [...new Set(nodes.map((n) => n.zoneId))];
  const diagram: string[] = ["```mermaid", "graph TD"];
  zones.forEach((z, zi) => {
    diagram.push(`  subgraph Z${zi}["${zoneName(z)}"]`);
    nodes
      .filter((n) => n.zoneId === z)
      .forEach((n) => diagram.push(`    ${ids.get(n.id)}["${n.name}<br/>${n.kind}"]`));
    diagram.push("  end");
  });
  for (const e of edges) {
    const from = ids.get(e.fromId);
    const to = ids.get(e.toId);
    if (from && to) diagram.push(`  ${from} -- ${e.kind}${e.label ? `: ${e.label}` : ""} --> ${to}`);
  }
  for (const n of nodes) {
    if (n.parentId && ids.get(n.parentId)) {
      diagram.push(`  ${ids.get(n.parentId)} -. signs .-> ${ids.get(n.id)}`);
    }
  }
  diagram.push("```");

  const componentRows = nodes.map((n: ArchNode) => [
    n.name,
    n.kind,
    zoneName(n.zoneId),
    n.role,
    n.offline ? "Offline" : "Online",
  ]);

  const trustRows = nodes
    .filter((n) => n.parentId || n.hsmId)
    .map((n) => [
      n.name,
      n.parentId ? nodeName(n.parentId) : "Trust anchor",
      n.hsmId ? nodeName(n.hsmId) : "Not HSM-protected",
      n.hsmRationale ?? "",
      n.validityDays ? `${n.validityDays} days` : "",
    ]);

  const relRows = edges.map((e) => [
    nodeName(e.fromId),
    nodeName(e.toId),
    e.kind,
    e.label ?? "",
  ]);

  return md([
    "# Architecture",
    "",
    `Trust architecture designed for **${scenario.organization}** (${scenario.industry}).`,
    "",
    ...section("Diagram", diagram),
    ...section("Zones", bullets(
      zones.map((z) => {
        const zone = scenario.zones.find((s) => s.id === z);
        return `**${zoneName(z)}** — ${zone?.note ?? "student-defined zone"}`;
      }),
    )),
    ...section("Components", table(["Component", "Type", "Zone", "Role", "Posture"], componentRows)),
    ...section(
      "Certificate authority hierarchy & key protection",
      table(["Authority", "Signed by", "Key protection", "Rationale", "Validity"], trustRows),
    ),
    ...section("Network & trust relationships", table(["From", "To", "Kind", "Detail"], relRows)),
    ...section(
      "Design rationale",
      bullets(
        nodes
          .filter((n) => n.notes && n.notes.trim())
          .map((n) => `**${n.name}** — ${n.notes!.trim()}`),
      ),
    ),
    ...(state.notes["design"]
      ? section("Architect's notes", [state.notes["design"]])
      : []),
    ...section(
      "Findings dispositions",
      table(
        ["Disposition", "Rationale"],
        state.architecture.dispositions.map((d) => [d.disposition, d.rationale]),
      ),
    ),
  ]);
}

function certificateDoc(input: PortfolioInput): string {
  const { state, scenario } = input;
  const poolName = (id: string) => scenario.pools.find((p) => p.id === id)?.name ?? id;
  const profileName = (id: string | undefined) =>
    state.operations.profiles.find((p) => p.id === id)?.name ?? "—";

  const profiles = state.operations.profiles;
  const assets = state.operations.assets;

  return md([
    "# Certificate Strategy & Ownership",
    "",
    profiles.length || assets.length
      ? "Certificate pools, issuance profiles and ownership decisions recorded for this capstone."
      : "_No certificate strategy work has been recorded in this snapshot yet._",
    "",
    ...(scenario.pools.length
      ? section(
          "Certificate pools (scenario scope)",
          table(
            ["Pool", "Purpose"],
            scenario.pools.map((p) => [p.name, p.purpose]),
          ),
        )
      : []),
    ...(profiles.length
      ? section(
          "Issuance profiles — student decisions",
          table(
            ["Profile", "Pool", "Algorithm", "Validity", "EKU", "Enrollment", "Approval", "Status method", "Rationale"],
            profiles.map((p) => [
              p.name,
              poolName(p.poolId),
              p.algorithm,
              `${p.validityDays} days`,
              p.eku,
              p.enrollment,
              p.approval,
              p.statusMethod,
              p.rationale,
            ]),
          ),
        )
      : []),
    ...(assets.length
      ? section(
          "Certificate inventory & ownership",
          table(
            ["Certificate", "Pool", "Profile", "Owner", "Ownership state", "Lifecycle", "Status", "Origin"],
            assets.map((a: CertAsset) => [
              a.label,
              poolName(a.poolId),
              profileName(a.profileId),
              a.owner,
              a.ownerState,
              a.lifecycle,
              a.status,
              a.origin === "student" ? "student-created" : `${a.origin} (system-provided)`,
            ]),
          ),
        )
      : []),
    ...(state.operations.approvals.length
      ? section(
          "Approvals",
          table(
            ["Requested by", "Approved by", "Mode", "Note"],
            state.operations.approvals.map((a) => [a.requestedBy, a.approvedBy, a.mode, a.note]),
          ),
        )
      : []),
    ...(state.notes["operate"] ? section("Operator's notes", [state.notes["operate"]]) : []),
  ]);
}

function lifecycleDoc(input: PortfolioInput): string {
  const { state } = input;
  const assetName = (id: string) =>
    state.operations.assets.find((a) => a.id === id)?.label ?? "certificate";

  const lifecycle = state.operations.lifecycle;
  const pubs = state.operations.publications;

  return md([
    "# Lifecycle, Automation & Status",
    "",
    lifecycle.length || pubs.length
      ? "How certificates are issued, renewed, replaced and revoked, and how revocation status reaches relying parties."
      : "_No lifecycle or status work has been recorded in this snapshot yet._",
    "",
    ...(lifecycle.length
      ? section(
          "Lifecycle actions",
          table(
            ["Certificate", "Action", "From", "To", "Actor", "Detail"],
            lifecycle
              .slice(-200)
              .map((e) => [
                assetName(e.assetId),
                e.action,
                e.from ?? "",
                e.to ?? "",
                e.actor === "student" ? "student decision" : e.actor,
                e.detail,
              ]),
          ),
        )
      : []),
    ...(state.operations.discovery.length
      ? section(
          "Discovery",
          bullets(
            state.operations.discovery.map(
              (d) => `Scope **${d.scope}** — ${d.foundAssetIds.length} certificate(s) discovered`,
            ),
          ),
        )
      : []),
    ...(pubs.length
      ? section(
          "Status distribution (CRL / OCSP)",
          table(
            ["Method", "Publisher", "Consumer zone", "Freshness", "Reachable", "Note"],
            pubs.map((p) => [
              p.method,
              state.architecture.nodes.find((n) => n.id === p.publisherNodeId)?.name ?? "publisher",
              p.consumerZoneId,
              `${p.freshnessHours}h`,
              p.reachable ? "Yes" : "No",
              p.note,
            ]),
          ),
        )
      : []),
    ...(state.notes["automate"] ? section("Automation notes", [state.notes["automate"]]) : []),
  ]);
}

function workloadDoc(input: PortfolioInput): string {
  const { state, scenario } = input;
  const runs = state.workloads.runs;
  const instanceName = (id: string) =>
    state.workloads.instances.find((i) => i.id === id)?.name ?? "workload";
  const defType = (id: string) => scenario.workloads.find((w) => w.id === id)?.type ?? "workload";

  if (!runs.length && !state.workloads.instances.length) {
    return md([
      "# Workload Integration & Diagnosis",
      "",
      "_No workload integration or testing has been recorded in this snapshot yet._",
    ]);
  }

  const byInstance = new Map<string, typeof runs>();
  for (const r of runs) {
    const list = byInstance.get(r.workloadInstanceId) ?? [];
    list.push(r);
    byInstance.set(r.workloadInstanceId, list);
  }

  const history: string[] = [];
  for (const [instanceId, list] of byInstance) {
    const last = list[list.length - 1]!;
    history.push(`### ${instanceName(instanceId)} (${defType(last.definitionId)})`, "");
    history.push(
      `Attempts: **${list.length}** · Final result: **${last.result}**`,
      "",
    );
    const failed = list.filter((r) => r.result === "FAIL");
    if (failed.length) {
      history.push(`Failures encountered and diagnosed: **${failed.length}**`, "");
      const issues = new Map<string, string>();
      for (const r of failed) {
        for (const c of r.checks) {
          if (c.result === "fail") issues.set(c.label, c.consequence ?? c.observed);
        }
      }
      history.push(
        ...table(
          ["Failed check", "Impact observed"],
          [...issues.entries()].map(([k, v]) => [k, v]),
        ),
        "",
      );
    }
    if (last.result === "PASS" && failed.length) {
      history.push("Remediated: the final run passes after the issues above were corrected.", "");
    }
  }

  return md([
    "# Workload Integration & Diagnosis",
    "",
    "Real workloads were bound to issued certificates and executed. Failures are retained deliberately — diagnosis and remediation are part of the work.",
    "",
    ...section(
      "Workloads attempted",
      table(
        ["Workload", "Type", "Runs", "Final result"],
        [...byInstance.entries()].map(([id, list]) => [
          instanceName(id),
          defType(list[list.length - 1]!.definitionId),
          String(list.length),
          list[list.length - 1]!.result,
        ]),
      ),
    ),
    ...(history.length ? ["## Run history & diagnosis", "", ...history] : []),
    ...(state.notes["workloads"] ? section("Diagnosis notes", [state.notes["workloads"]]) : []),
  ]);
}

function changeDoc(input: PortfolioInput): string {
  const { state, activatedEvents } = input;
  if (!activatedEvents.length) {
    return md([
      "# Change & Incident Response",
      "",
      "Stage 4 change/incident work has not yet been completed in this portfolio snapshot.",
    ]);
  }
  return md([
    "# Change & Incident Response",
    "",
    ...section(
      "Released changes and incidents",
      activatedEvents.flatMap((e) => [`### ${e.title}`, "", e.studentBrief, ""]),
    ),
    ...(state.change.timeline.length
      ? section(
          "Response timeline",
          table(
            ["Type", "Entry", "Detail"],
            state.change.timeline.map((t) => [t.kind, t.title, t.detail]),
          ),
        )
      : []),
    ...(state.change.baselines.length
      ? section(
          "Baselines captured before responding",
          bullets(
            state.change.baselines.map(
              (b) =>
                `Baseline with ${b.runSummary.length} workload result(s) and ${b.findingCount} finding(s)`,
            ),
          ),
        )
      : []),
    ...(state.notes["adapt"] ? section("Adaptation notes", [state.notes["adapt"]]) : []),
  ]);
}

function defenseDoc(input: PortfolioInput): string {
  const { state, submitted } = input;
  const checkpoints = state.change.checkpoints;
  const notes = checkpoints.filter((c) => c.studentNote && c.studentNote.trim());
  return md([
    "# Final Defense Summary",
    "",
    submitted
      ? "This capstone has been submitted for final defense."
      : "This is an in-progress portfolio snapshot; the final defense has not been completed yet.",
    "",
    ...(notes.length
      ? section(
          "Checkpoint statements",
          notes.flatMap((c) => [`### ${c.type}`, "", c.studentNote.trim(), ""]),
        )
      : []),
    ...(state.notes["defend"] ? section("Defense notes", [state.notes["defend"]]) : []),
    ...(!notes.length && !state.notes["defend"]
      ? ["_No defense material has been written in this snapshot yet._"]
      : []),
  ]);
}

function evidenceDoc(input: PortfolioInput): string {
  const { evidence } = input;
  if (!evidence.length) {
    return md(["# Evidence Index", "", "_No evidence has been captured in this snapshot yet._"]);
  }
  const stageLabel = (key: string) => STAGES.find((s) => s.key === key)?.label ?? key;
  return md([
    "# Evidence Index",
    "",
    "Each item below records what was observed and what it proves. Raw attachments are intentionally not included in this portfolio package.",
    "",
    ...table(
      ["Stage", "Week", "Evidence", "What it shows"],
      evidence.map((e) => [
        stageLabel(e.stage),
        e.week ? `Week ${e.week}` : "",
        e.title,
        (e.body ?? "").replace(/\s*\n\s*/g, " "),
      ]),
    ),
  ]);
}

function githubInstructions(): string {
  return md([
    "# Publishing this portfolio to GitHub",
    "",
    "1. Create a new GitHub repository (public or private, your choice).",
    "2. Unzip this portfolio package on your computer.",
    "3. Review every file and remove anything you do not want to be public.",
    "4. Upload or commit the contents to the repository.",
    "5. Add a repository description and topics (for example `pki`, `security-architecture`, `capstone`).",
    "",
    "This package is generated locally for you — nothing is published to GitHub automatically.",
  ]);
}

function projectSummaryJson(input: PortfolioInput): string {
  const { state, scenario } = input;
  const runs = state.workloads.runs;
  const summary = {
    artifact: "cvi-phase3-portfolio-summary",
    artifactVersion: 1,
    note: "Public-safe portfolio summary. This file is NOT a capstone backup and cannot be imported into the capstone workspace.",
    project: {
      title: "PKI Architect Capstone",
      role: "PKI Architect",
      organization: scenario.organization,
      industry: scenario.industry,
      status: input.submitted ? "submitted" : "in-progress snapshot",
      generatedAt: input.generatedAt,
    },
    ...(safeName(input.displayName) ? { author: safeName(input.displayName) } : {}),
    counts: {
      requirements: state.analysis.filter((a) => a.kind === "requirement").length,
      analysisItems: state.analysis.length,
      architectureComponents: state.architecture.nodes.length,
      architectureRelationships: state.architecture.edges.length,
      certificateProfiles: state.operations.profiles.length,
      certificates: state.operations.assets.length,
      lifecycleActions: state.operations.lifecycle.length,
      statusPublications: state.operations.publications.length,
      workloadInstances: state.workloads.instances.length,
      workloadRuns: runs.length,
      workloadRunsPassed: runs.filter((r) => r.result === "PASS").length,
      workloadRunsFailed: runs.filter((r) => r.result === "FAIL").length,
      evidenceItems: input.evidence.length,
      activatedChangeEvents: input.activatedEvents.length,
    },
    zonesDesigned: [
      ...new Set(
        state.architecture.nodes.map(
          (n) => scenario.zones.find((z) => z.id === n.zoneId)?.name ?? "Unzoned",
        ),
      ),
    ],
    workloadTypesAttempted: [
      ...new Set(
        state.workloads.instances
          .map((i) => scenario.workloads.find((w) => w.id === i.definitionId)?.type)
          .filter(Boolean),
      ),
    ],
  };
  return JSON.stringify(summary, null, 2) + "\n";
}

function skillsDemonstrated(input: PortfolioInput): string[] {
  const { state } = input;
  const skills: string[] = [];
  if (state.analysis.length) skills.push("Requirements analysis and traceability from a business brief");
  if (state.architecture.nodes.length) skills.push("PKI trust hierarchy and zone architecture design");
  if (state.architecture.nodes.some((n) => n.hsmId)) skills.push("HSM-backed key protection design");
  if (state.operations.profiles.length) skills.push("Certificate profile and issuance policy design");
  if (state.operations.assets.length) skills.push("Certificate inventory and ownership management");
  if (state.operations.lifecycle.length) skills.push("Certificate lifecycle operations (issuance, renewal, revocation)");
  if (state.operations.publications.length) skills.push("Revocation status distribution (CRL / OCSP) design");
  if (state.workloads.runs.length) skills.push("Workload integration testing against a live trust chain");
  if (state.workloads.runs.some((r) => r.result === "FAIL")) skills.push("Failure diagnosis and remediation");
  if (input.activatedEvents.length) skills.push("Change and incident response with revalidation");
  if (input.evidence.length) skills.push("Evidence-based technical documentation");
  return skills.length ? skills : ["_No demonstrable work has been recorded in this snapshot yet._"];
}

function readme(input: PortfolioInput): string {
  const { scenario, state } = input;
  const author = safeName(input.displayName);
  const runs = state.workloads.runs;
  const lessons = state.notes["defend"] ?? state.notes["adapt"] ?? null;

  return md([
    "# PKI Architect Capstone",
    "",
    input.submitted
      ? "**Final portfolio artifact**"
      : "**In-progress portfolio snapshot** — this project is still under active development.",
    "",
    ...(author ? [`**Architect:** ${author}`, ""] : []),
    `**Role:** PKI Architect`,
    `**Organization (scenario):** ${scenario.organization}`,
    `**Industry:** ${scenario.industry}`,
    `**Engagement length:** ${scenario.durationWeeks}`,
    "",
    ...section("Project overview", [scenario.mission]),
    ...section("Business & security problem", [scenario.situation]),
    ...(scenario.constraints.length
      ? section("Constraints the design had to satisfy", bullets(scenario.constraints))
      : []),
    ...(scenario.requiredOutcomes.length
      ? section("Required outcomes", bullets(scenario.requiredOutcomes))
      : []),
    ...(state.architecture.nodes.length
      ? section("Architecture summary", [
          `The design places **${state.architecture.nodes.length}** components across **${
            new Set(state.architecture.nodes.map((n) => n.zoneId)).size
          }** trust zones with **${state.architecture.edges.length}** documented relationships. Full detail, including a diagram, is in [docs/architecture.md](docs/architecture.md).`,
        ])
      : []),
    ...(state.architecture.nodes.filter((n) => n.notes?.trim()).length
      ? section(
          "Major design decisions and tradeoffs",
          bullets(
            state.architecture.nodes
              .filter((n) => n.notes?.trim())
              .slice(0, 12)
              .map((n) => `**${n.name}** — ${n.notes!.trim()}`),
          ),
        )
      : []),
    ...(state.operations.profiles.length || state.operations.assets.length
      ? section("Certificate strategy & ownership", [
          `**${state.operations.profiles.length}** issuance profile(s) and **${state.operations.assets.length}** certificate(s) are governed with explicit owners and approval modes. See [docs/certificate-strategy.md](docs/certificate-strategy.md).`,
        ])
      : []),
    ...(state.operations.lifecycle.length || state.operations.publications.length
      ? section("Lifecycle, automation & status", [
          `**${state.operations.lifecycle.length}** lifecycle action(s) and **${state.operations.publications.length}** status publication path(s) are documented in [docs/lifecycle-and-status.md](docs/lifecycle-and-status.md).`,
        ])
      : []),
    ...(runs.length
      ? section("Workload testing & diagnosis", [
          `**${runs.length}** workload execution(s): ${runs.filter((r) => r.result === "PASS").length} passing, ${runs.filter((r) => r.result === "FAIL").length} failing runs diagnosed. See [docs/workload-testing.md](docs/workload-testing.md).`,
        ])
      : []),
    ...section(
      "Change & incident response",
      input.activatedEvents.length
        ? [
            `**${input.activatedEvents.length}** change/incident brief(s) were released and responded to. See [docs/change-and-incident-response.md](docs/change-and-incident-response.md).`,
          ]
        : ["Stage 4 change/incident work has not yet been completed in this portfolio snapshot."],
    ),
    ...(lessons ? section("Lessons learned", [lessons]) : []),
    ...section("Skills demonstrated", bullets(skillsDemonstrated(input))),
    ...section("Repository contents", [
      "```",
      "README.md                                  this overview",
      "GITHUB-INSTRUCTIONS.md                     how to publish this package",
      "docs/architecture.md                       zones, components, CA hierarchy, key protection",
      "docs/certificate-strategy.md               pools, profiles, ownership, approvals",
      "docs/lifecycle-and-status.md               issuance, renewal, revocation, CRL/OCSP",
      "docs/workload-testing.md                   workload runs, failures, diagnosis",
      "docs/change-and-incident-response.md       Stage 4 response (when completed)",
      "docs/final-defense-summary.md              checkpoint and defense statements",
      "evidence/evidence-summary.md               evidence index",
      "data/project-summary.json                  public-safe summary data",
      "```",
    ]),
    ...section("About this package", [
      "This portfolio artifact is a sanitized representation of a CyberVisionaries Institute PKI Architect Capstone project.",
      "",
      "It contains no account identifiers, no assignment or project identifiers, no signatures, and no instructor-only material. It is **not** the signed backup file used to restore capstone work, and it cannot be imported into the capstone workspace.",
      "",
      `Snapshot generated ${new Date(input.generatedAt).toISOString().slice(0, 10)}.`,
    ]),
  ]);
}

/* ------------------------------------------------------------------ build */

export function buildPortfolioFiles(input: PortfolioInput): PortfolioFiles {
  const files: PortfolioFiles = {
    "README.md": readme(input),
    "GITHUB-INSTRUCTIONS.md": githubInstructions(),
    "docs/architecture.md": architectureDoc(input),
    "docs/certificate-strategy.md": certificateDoc(input),
    "docs/lifecycle-and-status.md": lifecycleDoc(input),
    "docs/workload-testing.md": workloadDoc(input),
    "docs/change-and-incident-response.md": changeDoc(input),
    "docs/final-defense-summary.md": defenseDoc(input),
    "evidence/evidence-summary.md": evidenceDoc(input),
    "data/project-summary.json": projectSummaryJson(input),
  };
  for (const key of Object.keys(files)) files[key] = scrub(files[key]!);
  return files;
}
