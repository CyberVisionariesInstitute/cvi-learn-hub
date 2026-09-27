/** SERVER-ONLY Week 11 instructor answer key (spec Section 12). Never import from client code. */
export const week11InstructorKey = {
  missions: [
    { mission: "M01", expected: "One person can have independent directory accounts; the AD OU organizes; membership and assignments determine shown access. Junior-Analysts grants only the landing page via RL-LAND; Case-Readers grants case read via RL-READ.", feedback: "Ask the learner to point to the actual account/group/scope, not only a definition." },
    { mission: "M02", expected: "Blair authenticates; GC-JUN only grants the landing page; approved Case-Readers (GC-READ) membership grants case read, not update. Matched path GC-READ→RL-READ→R-CASE.", feedback: "A password reset does not repair an absent permission; broad access (GC-PRIV) is excessive." },
    { mission: "M03", expected: "ad-jamie created once in OU-SUP; GA-ALL + GA-SUP; T302 verified (CH-008 + CB-302); reset v1→v2, must-change; enable; challenge → v3; handbook read; disable revokes sessions; re-enable requires fresh sign-in.", feedback: "Moving into Disabled Accounts is not disabling; enabling does not revive old sessions." },
    { mission: "M04", expected: "Blair: GC-JUN + GC-READ only. Casey: add GC-RESP, remove GC-PRIV (RL-PRIV stays in catalog). Emi: add GC-AUD. Nine tests match scope; temporary GC-AUD revoke only works once all alternative grants are removed. ABAC: managed+Response+Internal allow; unmanaged, Audit dept, Confidential each deny.", feedback: "Capture corrected final state plus reason; no penalty for a corrected exploratory mistake." },
    { mission: "M05", expected: "Jamie cl-jamie linked to P08 with GC-JUN + GC-READ, MFA enrolled, credential changed. Alex: DEP-AUD everywhere, OU-AUD, GA-ALL kept, GA-RESP/GC-RESP removed, GA-AUD/GC-AUD added. Finley: both disabled, sessions revoked, all memberships removed, OU-DIS, P06 departed. T504: verification failed, reset refused, escalated. T505: GC-AZ + RL-AZREAD @ RG-LAB; VM1 metadata allow, stop deny; VM2 deny.", feedback: "One-directory offboarding is incomplete; a role definition without an assignment does nothing." },
    { mission: "M06", expected: "Two distinct supported findings: the S004–S009 cluster (five failures then success from unknown-device, no MFA challenge recorded) and the A002 self-granted Privileged-Operators membership with no approval. C009 supports linkage; VPN (S010–S011) and typo (S002–S003) comparisons prevent overclaim. Deliverable 4 is the technical case file only — the polished Technical Incident Report and Executive Summary are Week 12.", feedback: "Don't call two failed rows two findings; don't equate an unfamiliar location or absent MFA detail with proof of compromise." },
  ],
  historical: [
    ["S001", "Normal baseline."],
    ["S002–S003", "Documented typo, then success."],
    ["S004–S009", "Warrants investigation of possible credential misuse."],
    ["A002", "Separately warrants approval/privilege review; correlation C009 is not proof of the attacker's identity or cause."],
    ["S010–S011", "VPN ambiguity (Remote-C egress)."],
    ["S012", "Attempted but blocked former-worker sign-in."],
    ["A001 / A003", "Approved changes (CHG-1101, CHG-1102)."],
    ["A004", "Appropriate refusal (incomplete verification)."],
  ],
  acceptAlternatives: "Accept other findings when the exact records and stated uncertainty support them. Grade reasoning, not identical wording.",
  rubric: [
    { id: "directory", label: "Directory concepts", points: 15 },
    { id: "authn", label: "Authentication / authorization", points: 15 },
    { id: "leastPriv", label: "Three-role least privilege / access tests", points: 25 },
    { id: "lifecycle", label: "Lifecycle / verification and architecture comparison", points: 20 },
    { id: "logs", label: "Log findings / correlation", points: 15 },
    { id: "report", label: "Case file / evidence quality", points: 10 },
  ],
  misconceptions: [
    ["OU grants access", "OU placement organizes; in this model only group ACLs/role assignments grant."],
    ["Group name implies permission", "Junior-Analysts sounds like case access but only grants the landing page."],
    ["Enabled = authorized", "Blair was enabled and signed in, yet had no matching grant."],
    ["Password reset fixes access", "Credential changes don't create grants."],
    ["Removing one group revokes", "Union of paths: GC-PRIV can still grant after GC-AUD removal."],
    ["Disabled Accounts OU disables", "Status must change explicitly."],
    ["Correlation proves cause", "C009 links records; it doesn't identify who acted."],
  ],
};
export type Week11InstructorKey = typeof week11InstructorKey;
