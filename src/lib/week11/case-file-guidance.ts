import type { Finding, Learner } from "./types";

// Presentation only. These checks describe writing presence, not readiness or correctness.
export const findingFields = ["title", "refs", "observation", "hypothesis", "conclusion", "uncertainty", "nextAction", "priority", "rationale"] as const;
export function findingPresence(finding: Finding): boolean[] {
  return findingFields.map((field) => field === "refs" ? finding.refs.length > 0 : finding[field].trim().length > 0);
}

export const sectionGuidance = [
  { part: 1, help: "Briefly describe what you investigated, which simulated systems you used, and the boundaries of the work.", avoid: "Save the full investigation limitations and unknowns for the dedicated Limitations step later in the Case File.", starter: "This investigation examined…" },
  { part: 1, help: "Explain how people, identities, accounts, groups, roles and permissions connect across the directory contexts.", avoid: "Do not replace your own examples with definitions alone.", starter: "In this environment, the relationship between…" },
  { part: 1, help: "Use your recorded tests to explain the difference between signing in and accessing a resource.", avoid: "Do not treat a successful sign-in as proof of resource access.", starter: "The sign-in and access records show…" },
  { part: 2, help: "Describe the directory changes, approvals and identity checks you performed.", avoid: "Do not describe an intended change as completed without a supporting record.", starter: "During directory administration, I…" },
  { part: 2, help: "Describe the job-role configurations, their scopes and business reasons. Explain least privilege.", avoid: "Do not assume a job title alone proves permission.", starter: "The role configuration was scoped to…" },
  { part: 2, help: "Summarize your access tests. Reference the records of temporary grants and their removal.", avoid: "Do not mix a completed test with its security decision.", starter: "I tested access by…" },
  { part: 2, help: "Describe current-policy and what-if tests. Explain what each recorded result shows.", avoid: "Do not describe a what-if prediction as a saved policy change.", starter: "The current-policy test showed…" },
  { part: 3, help: "Describe your joiner, mover, leaver and reset-request decisions, and the evidence you checked.", avoid: "Do not claim approval or identity verification without a supporting record.", starter: "For the lifecycle requests, I checked…" },
  { part: 3, help: "Refer to your historical findings and the event IDs you selected for each one.", avoid: "Do not add unsupported conclusions or substitute live activity for historical records.", starter: "My historical findings are supported by…" },
  { part: 3, help: "Explain relevant links between records and include your benign or ambiguous comparison.", avoid: "Do not treat a shared correlation ID as proof of cause or unusual activity as proof of compromise.", starter: "The selected records are linked by…" },
  { part: 4, help: "Describe next checks or actions, their priority and what remains uncertain.", avoid: "Do not present an unconfirmed hypothesis as an established fact.", starter: "The next action I recommend checking is…" },
  { part: 4, help: "List the evidence keys or event IDs your Case File relies on and explain where each is used.", avoid: "Do not list records that your writing does not rely on.", starter: "This Case File references…" },
] as const;

export const caseFileParts = ["Set the context", "Explain what you did", "Explain lifecycle & investigation", "Close the case"] as const;

export function caseFilePresence(learner: Learner, historicalIds: readonly string[], liveIds: readonly string[]) {
  const findings = (learner.findings ?? []).slice(0, 2);
  const all = (check: (finding: Finding) => boolean) => findings.length > 0 && findings.every(check);
  const liveText = learner.report?.liveChain ?? "";
  const mentions = (id: string) => liveText.split(/[^A-Za-z0-9_-]+/).includes(id);
  return {
    twoFindings: findings.length >= 2,
    findingEvidence: all((f) => f.refs.length > 0),
    observationsAndConclusions: all((f) => Boolean(f.observation.trim() && f.conclusion.trim())),
    uncertaintyAndLimitations: all((f) => Boolean(f.uncertainty.trim())) && Boolean(learner.report?.limitations?.trim()),
    nextActions: all((f) => Boolean(f.nextAction.trim())),
    historicalSelections: all((f) => f.refs.length > 0 && f.refs.every((id) => historicalIds.includes(id))) && Boolean(learner.comparison?.refs.length) && (learner.comparison?.refs ?? []).every((id) => historicalIds.includes(id)),
    liveSource: liveIds.some(mentions) && !historicalIds.some(mentions),
    sections: sectionGuidance.every((_, i) => Boolean(learner.report?.sections?.[String(i + 1)]?.trim())),
  };
}