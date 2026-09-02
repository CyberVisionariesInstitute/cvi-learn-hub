/**
 * Phase 3 Stage 1 — deterministic architecture validation.
 * Same project state + scenario package + rule version = same findings.
 * Findings never prescribe an exact topology or remediation.
 */

import type { ScenarioPublic } from "./scenario-types";
import type { ArchNode, Phase3State } from "./project-state";

export const ARCH_RULE_VERSION = "arch-1.0.0";

export type Severity = "Critical" | "Warning" | "Advisory";

export interface Finding {
  id: string;
  severity: Severity;
  ruleId: string;
  ruleVersion: string;
  title: string;
  trigger: string;
  objectRef: string;
  relatedConstraint: string;
  reconsider: string;
}

function zoneName(scenario: ScenarioPublic, id: string) {
  return scenario.zones.find((z) => z.id === id)?.name ?? id || "unzoned";
}

export function validateArchitecture(
  state: Phase3State,
  scenario: ScenarioPublic,
  disabledPaths: [string, string][] = [],
): Finding[] {
  const out: Finding[] = [];
  const nodes = state.architecture.nodes;
  const edges = state.architecture.edges;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const roots = nodes.filter((n) => n.kind === "ca-root");
  const issuing = nodes.filter((n) => n.kind === "ca-issuing");
  const hsms = nodes.filter((n) => n.kind === "hsm");
  const push = (f: Omit<Finding, "ruleVersion">) => out.push({ ...f, ruleVersion: ARCH_RULE_VERSION });

  if (roots.length === 0) {
    push({
      id: "arch-no-root",
      severity: "Critical",
      ruleId: "CA-001",
      title: "No root certification authority is defined",
      trigger: "The architecture contains no node of type Root CA.",
      objectRef: "architecture",
      relatedConstraint: "A trust hierarchy must have an authoritative trust anchor.",
      reconsider: "Which authority anchors trust for this organization, and where does it live?",
    });
  }
  if (roots.length > 1) {
    push({
      id: "arch-multi-root",
      severity: "Advisory",
      ruleId: "CA-002",
      title: `${roots.length} root authorities are defined`,
      trigger: "More than one root CA is present.",
      objectRef: roots.map((r) => r.name).join(", "),
      relatedConstraint: scenario.clmFocus,
      reconsider: "Can you defend multiple trust anchors for this organization's relying parties?",
    });
  }

  for (const root of roots) {
    if (scenario.policy.requireOfflineRoot && !root.offline) {
      push({
        id: `arch-root-online-${root.id}`,
        severity: "Critical",
        ruleId: "CA-010",
        title: `Root "${root.name}" is not offline`,
        trigger: "Scenario policy requires the root authority to remain offline.",
        objectRef: root.name,
        relatedConstraint: "Offline root requirement",
        reconsider: "How is the root protected between signing ceremonies?",
      });
    }
    if (scenario.policy.requireHsmForRoot && !root.hsmId) {
      push({
        id: `arch-root-nohsm-${root.id}`,
        severity: "Critical",
        ruleId: "KEY-001",
        title: `Root "${root.name}" key is not protected by an HSM`,
        trigger: "Scenario policy mandates hardware protection for the root key.",
        objectRef: root.name,
        relatedConstraint: "Mandatory key protection",
        reconsider: "Where does this private key live, and who could reach it?",
      });
    }
    if (root.parentId) {
      push({
        id: `arch-root-parent-${root.id}`,
        severity: "Critical",
        ruleId: "CA-011",
        title: `Root "${root.name}" is signed by another authority`,
        trigger: "A root node cannot have a signing parent.",
        objectRef: root.name,
        relatedConstraint: "Structural hierarchy validity",
        reconsider: "Is this really a root, or an intermediate/issuing authority?",
      });
    }
  }

  if (issuing.length < scenario.policy.minIssuingCas) {
    push({
      id: "arch-issuing-count",
      severity: "Critical",
      ruleId: "CA-020",
      title: "Not enough issuing authorities for the certificate pools in scope",
      trigger: `Scenario expects at least ${scenario.policy.minIssuingCas} issuing CA(s); found ${issuing.length}.`,
      objectRef: "architecture",
      relatedConstraint: scenario.policy.statusChallenge,
      reconsider: "Which use cases must be separated at the issuing layer, and why?",
    });
  }

  for (const ca of issuing) {
    const parent = ca.parentId ? byId.get(ca.parentId) : undefined;
    if (!parent) {
      push({
        id: `arch-issuing-orphan-${ca.id}`,
        severity: "Critical",
        ruleId: "CA-021",
        title: `Issuing CA "${ca.name}" has no signing parent`,
        trigger: "The issuing authority is not chained to a higher authority.",
        objectRef: ca.name,
        relatedConstraint: "Structural hierarchy validity",
        reconsider: "Which authority signs this CA's certificate?",
      });
    } else if (parent.kind !== "ca-root" && parent.kind !== "ca-issuing") {
      push({
        id: `arch-issuing-badparent-${ca.id}`,
        severity: "Critical",
        ruleId: "CA-022",
        title: `Issuing CA "${ca.name}" is signed by a non-CA node`,
        trigger: `Signing parent "${parent.name}" is not a certification authority.`,
        objectRef: ca.name,
        relatedConstraint: "Structural hierarchy validity",
        reconsider: "Only a CA can sign another CA. What is the intended chain?",
      });
    } else if (parent.id === ca.id) {
      push({
        id: `arch-issuing-self-${ca.id}`,
        severity: "Critical",
        ruleId: "CA-023",
        title: `Issuing CA "${ca.name}" signs itself`,
        trigger: "Self-signing on an issuing authority creates an invalid chain.",
        objectRef: ca.name,
        relatedConstraint: "Structural hierarchy validity",
        reconsider: "Where should this authority sit in the chain?",
      });
    }
    if (scenario.policy.requireHsmForIssuing && !ca.hsmId) {
      push({
        id: `arch-issuing-nohsm-${ca.id}`,
        severity: "Critical",
        ruleId: "KEY-002",
        title: `Issuing CA "${ca.name}" key is not protected by an HSM`,
        trigger: "Scenario policy mandates hardware protection for issuing keys.",
        objectRef: ca.name,
        relatedConstraint: "Mandatory key protection",
        reconsider: "What compensating control protects this signing key today?",
      });
    }
    if (ca.validityDays && ca.validityDays > scenario.policy.maxIssuingValidityDays) {
      push({
        id: `arch-issuing-validity-${ca.id}`,
        severity: "Warning",
        ruleId: "CA-030",
        title: `Issuing CA "${ca.name}" validity exceeds the scenario ceiling`,
        trigger: `${ca.validityDays} days configured; scenario ceiling is ${scenario.policy.maxIssuingValidityDays}.`,
        objectRef: ca.name,
        relatedConstraint: "Maintainability and key rotation",
        reconsider: "How often can this organization realistically re-key this authority?",
      });
    }
    if (ca.hsmId && !ca.hsmRationale?.trim()) {
      push({
        id: `arch-hsm-rationale-${ca.id}`,
        severity: "Advisory",
        ruleId: "KEY-010",
        title: `No rationale recorded for HSM protection of "${ca.name}"`,
        trigger: "An HSM attachment exists without recorded reasoning.",
        objectRef: ca.name,
        relatedConstraint: "Decision rationale",
        reconsider: "What did this protection decision cost, and what does it buy?",
      });
    }
  }

  for (const node of nodes) {
    if (node.hsmId && !hsms.some((h) => h.id === node.hsmId)) {
      push({
        id: `arch-hsm-missing-${node.id}`,
        severity: "Critical",
        ruleId: "KEY-003",
        title: `"${node.name}" references an HSM that does not exist`,
        trigger: "Broken reference between signing node and HSM.",
        objectRef: node.name,
        relatedConstraint: "Structural integrity",
        reconsider: "Which hardware module actually holds this key?",
      });
    }
    if (!node.zoneId) {
      push({
        id: `arch-unzoned-${node.id}`,
        severity: "Warning",
        ruleId: "NET-001",
        title: `"${node.name}" is not placed in a network or trust zone`,
        trigger: "Node has no zone assignment.",
        objectRef: node.name,
        relatedConstraint: "Segmentation",
        reconsider: "Which segment owns this component, and who can reach it?",
      });
    }
  }

  const prohibited = [...scenario.policy.prohibitedPaths, ...disabledPaths];
  for (const edge of edges) {
    if (edge.kind !== "network") continue;
    const a = byId.get(edge.fromId);
    const b = byId.get(edge.toId);
    if (!a || !b) {
      push({
        id: `arch-edge-broken-${edge.id}`,
        severity: "Critical",
        ruleId: "NET-002",
        title: "A connection references a component that no longer exists",
        trigger: "Dangling relationship in the architecture graph.",
        objectRef: edge.id,
        relatedConstraint: "Structural integrity",
        reconsider: "Should this path be re-drawn or removed?",
      });
      continue;
    }
    const hit = prohibited.find(
      ([x, y]) =>
        (a.zoneId === x && b.zoneId === y) || (a.zoneId === y && b.zoneId === x),
    );
    if (hit) {
      push({
        id: `arch-path-prohibited-${edge.id}`,
        severity: "Critical",
        ruleId: "NET-010",
        title: `Path "${a.name} → ${b.name}" crosses a boundary that is not available`,
        trigger: `${zoneName(scenario, a.zoneId)} to ${zoneName(scenario, b.zoneId)} is prohibited or unavailable in the current scenario state.`,
        objectRef: edge.label || edge.id,
        relatedConstraint: "Segmentation / controlled paths",
        reconsider: "What other route can carry this dependency within the rules?",
      });
    }
  }

  for (const zoneId of scenario.policy.requiredZones) {
    if (!nodes.some((n) => n.zoneId === zoneId)) {
      push({
        id: `arch-zone-empty-${zoneId}`,
        severity: "Warning",
        ruleId: "NET-020",
        title: `No component placed in ${zoneName(scenario, zoneId)}`,
        trigger: "A zone the scenario depends on has no infrastructure.",
        objectRef: zoneId,
        relatedConstraint: "Scenario coverage",
        reconsider: "How is this part of the organization served today?",
      });
    }
  }

  const publishers = nodes.filter((n) => n.kind === "publisher");
  if (issuing.length > 0 && publishers.length === 0) {
    push({
      id: "arch-no-publisher",
      severity: "Warning",
      ruleId: "STAT-001",
      title: "No status publication component exists",
      trigger: "Issuing authorities are present but nothing publishes revocation status.",
      objectRef: "architecture",
      relatedConstraint: scenario.policy.statusChallenge,
      reconsider: "How does a relying party learn a certificate was revoked?",
    });
  }

  const requirements = state.analysis.filter((a) => a.kind === "requirement");
  const unresolved = requirements.filter((r) => r.status !== "addressed");
  if (requirements.length > 0 && unresolved.length > 0) {
    push({
      id: "arch-requirements-open",
      severity: "Advisory",
      ruleId: "REQ-001",
      title: `${unresolved.length} requirement(s) are not marked addressed`,
      trigger: "Requirements workspace still shows unresolved or partial items.",
      objectRef: "analysis",
      relatedConstraint: "Requirements traceability",
      reconsider: "Which architecture decision answers each open requirement?",
    });
  }

  return out.sort((a, b) => rank(a.severity) - rank(b.severity) || a.id.localeCompare(b.id));
}

function rank(s: Severity) {
  return s === "Critical" ? 0 : s === "Warning" ? 1 : 2;
}

export function nodeLabel(node: ArchNode) {
  const map: Record<string, string> = {
    vm: "VM",
    service: "Service",
    hsm: "HSM",
    "ca-root": "Root CA",
    "ca-issuing": "Issuing CA",
    publisher: "Status publisher",
    "relying-system": "Relying system",
    appliance: "Appliance",
  };
  return map[node.kind] ?? node.kind;
}
