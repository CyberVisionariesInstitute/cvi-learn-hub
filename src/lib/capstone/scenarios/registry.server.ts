/**
 * Phase 3 released scenario content — SERVER ONLY.
 *
 * The database holds the authoritative registry row (code, version, status,
 * difficulty). The content for a released package is resolved here, keyed by
 * `code@version`, and only the PUBLIC projection is ever returned to a
 * student — and only for the exact version their active assignment pins.
 *
 * Instructor-private event definitions, calibration and answer guidance never
 * leave this module except through instructor-role server functions.
 */

import type {
  CertPool,
  EventEffects,
  InventorySeed,
  ProfileTemplate,
  ScenarioPublic,
  ScenarioZone,
  WorkloadDefinition,
} from "../scenario-types";

export interface PrivateEventDefinition {
  key: string;
  kind: "change" | "discovery" | "incident";
  title: string;
  /** Student-visible once activated. */
  studentBrief: string;
  symptoms: string[];
  effects: EventEffects;
  /** Never student-visible. */
  instructorNotes: string;
  validSolutionFamilies: string[];
  invalidMoves: string[];
}

export interface ScenarioPrivate {
  calibration: { normalizedDifficulty: number; researchBurden: string; evidenceBurden: string };
  answerGuidance: string[];
  events: PrivateEventDefinition[];
}

interface ScenarioRecord {
  public: ScenarioPublic;
  private: ScenarioPrivate;
}

/* ------------------------------------------------------------ helpers */

const RESEARCH_GUIDANCE = [
  "Research is expected: vendor documentation, RFCs and standards are fair game.",
  "There is no single correct topology. Multiple defensible architectures can earn full marks.",
  "Every decision you cannot justify in the defense is a decision you have not made.",
  "Where the brief is intentionally silent, state your assumption and design against it.",
];

function inv(
  id: string,
  label: string,
  poolId: string,
  zoneId: string,
  owner: string,
  ownerState: InventorySeed["ownerState"],
  lifecycle: InventorySeed["lifecycle"],
  status: InventorySeed["status"],
  daysRemaining: number | null,
  origin: InventorySeed["origin"],
  note: string,
): InventorySeed {
  return { id, label, poolId, zoneId, owner, ownerState, lifecycle, status, daysRemaining, origin, note };
}

function prof(
  id: string,
  name: string,
  poolId: string,
  algorithm: string,
  validityDays: number,
  eku: string,
  approval: ProfileTemplate["approval"],
  environment: ProfileTemplate["environment"],
  notes: string,
): ProfileTemplate {
  return { id, name, poolId, algorithm, validityDays, eku, approval, environment, notes };
}

function pool(id: string, name: string, purpose: string): CertPool {
  return { id, name, purpose };
}

function zone(id: string, name: string, note: string): ScenarioZone {
  return { id, name, note };
}

const NODE_CATALOG = [
  { type: "vm", label: "Virtual machine", role: "Hosts a PKI or application service" },
  { type: "service", label: "Service", role: "Application or platform service that consumes certificates" },
  { type: "hsm", label: "HSM", role: "Hardware protection for CA and signing keys" },
  { type: "ca-root", label: "Root CA", role: "Offline trust anchor" },
  { type: "ca-issuing", label: "Issuing CA", role: "Issues end-entity certificates" },
  { type: "publisher", label: "Status publisher", role: "CRL distribution point or OCSP responder" },
  { type: "relying-system", label: "Relying system", role: "Validates certificates presented to it" },
  { type: "appliance", label: "Appliance", role: "Network or security appliance" },
];

/* --------------------------------------------------- 1. Cedar Valley Health */

const cedar: ScenarioRecord = {
  public: {
    code: "cedar-valley-health",
    version: "1.0.0",
    title: "Cedar Valley Health Network",
    organization: "Cedar Valley Health Network",
    industry: "Healthcare",
    role: "PKI Architect",
    durationWeeks: "Weeks 17–24",
    architecturePattern:
      "Regional health network: one hospital campus, one data center, and intermittently connected clinics.",
    clmFocus: "Clinical ownership, renewal reliability, and status distribution.",
    situation:
      "Cedar Valley Health Network runs a hospital campus, a primary data center, and eleven outpatient clinics. Certificates were issued over a decade by three different teams. Nobody can currently answer, for any given certificate, who owns it, when it expires, and whether a relying system would notice if it were revoked.",
    mission:
      "Design, operate and defend a certificate architecture that gives Cedar Valley reliable clinical identity, dependable renewal, and provable revocation status — including for clinics whose WAN links are not always up.",
    definitionOfSuccess:
      "Every certificate in scope has an accountable owner, a governed profile, a renewal path that does not depend on someone remembering, and a status answer a relying system can actually obtain from where it sits.",
    metrics: [
      { label: "Sites", value: "1 hospital, 1 data center, 11 clinics" },
      { label: "Clinical devices", value: "~2,400" },
      { label: "PKI staff", value: "1.5 FTE" },
      { label: "Unplanned cert outages last year", value: "6" },
    ],
    concerns: [
      "Two clinics lose WAN connectivity for hours at a time.",
      "Some clinical devices cannot depend on a live OCSP responder.",
      "Renewals are tracked in a spreadsheet that is three months stale.",
      "At least one production TLS service has no known owner.",
    ],
    constraints: [
      "Clinic 07 and Clinic 02 have intermittent WAN links.",
      "Certain clinical devices cannot make live OCSP calls during patient care.",
      "PKI staffing is 1.5 FTE — unnecessary profile or process proliferation is a real cost.",
      "Existing HSM relationships established in Stage 1 remain authoritative.",
      "Unknown ownership requires investigation; it does not by itself justify revocation.",
    ],
    openQuestions: [
      "Should clinics receive their own issuing authority, or be served centrally?",
      "What is an acceptable status freshness window for a clinical device?",
      "Who becomes accountable for a certificate whose original owner has left?",
    ],
    requiredOutcomes: [
      "A structurally valid hierarchy with defensible key protection.",
      "Certificate pools separated from the profiles that govern them.",
      "A status distribution design that survives loss of central connectivity.",
      "Deterministic workload evidence showing the design works, and what breaks when it does not.",
    ],
    researchGuidance: RESEARCH_GUIDANCE,
    zones: [
      zone("core", "Core data center", "Hosts central PKI and enterprise services."),
      zone("hospital", "Hospital campus", "Clinical systems and workforce endpoints."),
      zone("clinic", "Clinic network", "Intermittently connected outpatient sites."),
      zone("dmz", "External DMZ", "Internet-facing patient services."),
    ],
    pools: [
      pool("internal-tls", "Internal TLS", "Server identity for internal clinical and business services."),
      pool("workforce", "Workforce Authentication", "Staff authentication credentials."),
      pool("endpoint", "Endpoint Identity", "Managed workstation and laptop identity."),
      pool("clinical-device", "Clinical Device Identity", "Identity for patient-care devices."),
      pool("vpn", "VPN", "Site and remote access tunnels."),
      pool("pki-service", "PKI Service Certificates", "OCSP responders, CRL signers, enrollment services."),
      pool("code-signing", "Code Signing (stretch)", "Optional governance-only pool for internal tooling."),
    ],
    profiles: [
      prof("p-tls", "Internal TLS Server", "internal-tls", "ECDSA P-256", 397, "serverAuth", "standard", "internal", "Default internal service identity."),
      prof("p-portal", "External Portal TLS", "internal-tls", "RSA 2048", 397, "serverAuth", "dual", "external", "Patient-facing service identity."),
      prof("p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Staff smart credential."),
      prof("p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device identity."),
      prof("p-device", "Clinical Device Identity", "clinical-device", "ECDSA P-256", 1095, "clientAuth", "dual", "internal", "Long-lived device identity; review required."),
      prof("p-vpn", "Site VPN", "vpn", "RSA 3072", 730, "clientAuth", "dual", "internal", "Clinic tunnel identity."),
      prof("p-ocsp", "OCSP / CRL Signing", "pki-service", "ECDSA P-256", 90, "OCSPSigning", "governed", "internal", "Short-lived PKI service credential."),
    ],
    inventory: [
      inv("cv-a1", "Patient Portal TLS", "internal-tls", "dmz", "Digital Services", "Known", "Active", "Good", 210, "known", "Healthy internet-facing service."),
      inv("cv-a2", "EHR API Gateway TLS", "internal-tls", "core", "Clinical Applications", "Known", "Active", "Good", 178, "known", "Healthy internal API identity."),
      inv("cv-a3", "Workforce Credential — Nursing", "workforce", "hospital", "Identity Services", "Known", "Active", "Good", 240, "known", "Representative workforce credential."),
      inv("cv-a4", "Managed Laptop Identity — Fleet A", "endpoint", "hospital", "End User Computing", "Known", "Active", "Good", 400, "known", "Representative endpoint identity."),
      inv("cv-a5", "Clinic 02 Site VPN", "vpn", "clinic", "Network Engineering", "Known", "Renewal Due", "Good", 18, "known", "Renewal window open: 18 days remaining."),
      inv("cv-a6", "Vitals Monitor Fleet Identity", "clinical-device", "hospital", "Biomedical Engineering", "Known", "Active", "Good", 300, "known", "On a profile that requires review before the next issuance cycle."),
      inv("cv-a7", "Central OCSP Responder", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 62, "known", "PKI service credential."),
      inv("cv-a8", "Lab Results Gateway TLS", "internal-tls", "core", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
      inv("cv-a9", "Legacy Scheduling TLS (replaced)", "internal-tls", "core", "Clinical Applications", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
      inv("cv-a10", "Retired Radiology Gateway TLS", "internal-tls", "core", "Imaging", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
    ],
    workloads: [
      {
        id: "w-portal",
        name: "Patient Portal TLS",
        type: "tls",
        sourceZone: "dmz",
        targetZone: "core",
        requiresPools: ["internal-tls"],
        requiredEku: "serverAuth",
        notes: "Patient-facing service identity and chain validation.",
      },
      {
        id: "w-ehr",
        name: "EHR API service TLS",
        type: "tls",
        sourceZone: "hospital",
        targetZone: "core",
        requiresPools: ["internal-tls"],
        requiredEku: "serverAuth",
        notes: "Clinical application to API gateway.",
      },
      {
        id: "w-device",
        name: "Clinical device mutual TLS",
        type: "mtls",
        sourceZone: "clinic",
        targetZone: "core",
        requiresPools: ["clinical-device", "internal-tls"],
        requiredEku: "clientAuth",
        scenarioRequirement: "offline-tolerant-status",
        notes: "Device presents identity to the clinical gateway; status must be answerable from the clinic.",
      },
      {
        id: "w-vpn",
        name: "Clinic site VPN",
        type: "mtls",
        sourceZone: "clinic",
        targetZone: "core",
        requiresPools: ["vpn"],
        requiredEku: "clientAuth",
        notes: "Site tunnel identity.",
      },
      {
        id: "w-cloud",
        name: "Cloud analytics workload",
        type: "cloud",
        sourceZone: "core",
        targetZone: "dmz",
        requiresPools: ["internal-tls"],
        requiredEku: "serverAuth",
        notes: "Conceptual cloud workload health depends on attachment, trust and renewal.",
      },
    ],
    nodeCatalog: NODE_CATALOG,
    policy: {
      requireOfflineRoot: true,
      requireHsmForRoot: true,
      requireHsmForIssuing: false,
      maxIssuingValidityDays: 3650,
      minIssuingCas: 1,
      prohibitedPaths: [],
      requiredZones: ["core", "clinic"],
      statusChallenge:
        "Clinic sites must obtain a usable status answer even when the link to the data center is down.",
    },
  },
  private: {
    calibration: { normalizedDifficulty: 100, researchBurden: "moderate", evidenceBurden: "standard" },
    answerGuidance: [
      "Local or scheduled CRL distribution for clinic zones is the intended family of answers.",
      "Unknown owner on cv-a8 should trigger investigation, not revocation.",
    ],
    events: [
      {
        key: "CV-01",
        kind: "change",
        title: "Week 23 Clinic Segmentation Change",
        studentBrief:
          "Two clinics have been moved onto a segmented clinical network. The previous path from those clinics to the central OCSP responder is no longer available. A scheduled CRL retrieval over a defined controlled path remains permitted. Re-evaluate status and workload behaviour for the affected sites.",
        symptoms: [
          "Clinic workloads that depended on live central status now fail their status observation check.",
          "Validation evidence captured before the change is marked stale for the current state.",
        ],
        effects: {
          disablePaths: [["clinic", "core"]],
          allowPaths: [],
          staleAllEvidence: true,
          note: "Scheduled CRL retrieval over the controlled path remains allowed.",
        },
        instructorNotes:
          "Do not tell the student which status family to pick. Look for a defensible offline-tolerant answer plus re-test evidence.",
        validSolutionFamilies: [
          "Fresh scheduled CRL retrieval over the controlled path with defined freshness controls",
          "Local or segment-level status distribution",
          "Approved caching / offline validation strategy with stated risk",
          "Justified hybrid of the above",
        ],
        invalidMoves: [
          "Fabricating OCSP reachability that the segmentation removed",
          "Ignoring the segmentation",
          "Confusing trust with connectivity",
          "Deleting history or claiming an old PASS proves current health",
        ],
      },
      {
        key: "CV-02",
        kind: "discovery",
        title: "Unmanaged clinical console certificate discovered",
        studentBrief:
          "A discovery sweep has returned a previously unmanaged certificate: infusion-console-17, a legacy clinical TLS client certificate with no owner of record and 22 days remaining. Treat it as a normal discovery record.",
        symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
        effects: {
          addAssets: [
            inv(
              "cv-hidden-1",
              "infusion-console-17 (legacy clinical TLS client)",
              "clinical-device",
              "hospital",
              "—",
              "Unknown",
              "Active",
              "Good",
              22,
              "discovered",
              "Discovered during a later sweep. No owner of record. 22 days remaining.",
            ),
          ],
        },
        instructorNotes:
          "Before activation this asset must not appear in any payload, export, count or hint. After activation it is an ordinary discovery record.",
        validSolutionFamilies: [
          "Open an ownership investigation, classify, then govern or retire with evidence",
        ],
        invalidMoves: ["Immediate revocation with no impact analysis", "Ignoring the 22-day clock"],
      },
    ],
  },
};

/* ------------------------------------------------ 2. Northstar Cloud Software */

const northstar: ScenarioRecord = {
  public: {
    code: "northstar-cloud",
    version: "1.0.0",
    title: "Northstar Cloud Software",
    organization: "Northstar Cloud Software",
    industry: "SaaS",
    role: "PKI Architect",
    durationWeeks: "Weeks 17–24",
    architecturePattern:
      "Multi-environment SaaS platform with CI/CD pipelines and cloud workloads.",
    clmFocus: "Pipeline approvals, service renewal, and environment ownership.",
    situation:
      "Northstar ships a multi-tenant SaaS platform from a build pipeline that signs and releases several times a day. Development and production signing have drifted together, service certificates renew inconsistently across environments, and no single team can say who owns identity in the staging estate.",
    mission:
      "Design and operate service, workload and signing identity across development and production so that releases are governed, renewals are reliable, and every release can be verified after the fact.",
    definitionOfSuccess:
      "Production releases are signed only under an approved production profile through a governed signing service, service identity renews without human memory, and historical signatures still verify under stated policy.",
    metrics: [
      { label: "Environments", value: "dev, staging, production" },
      { label: "Releases per week", value: "~40" },
      { label: "Cloud services", value: "180+" },
      { label: "Signing incidents last year", value: "2" },
    ],
    concerns: [
      "Development signing certificates have been used to sign production artifacts.",
      "Service identity in staging has no accountable owner.",
      "Timestamping is treated as optional by some pipelines.",
      "Renewal failures are only noticed when a customer reports an outage.",
    ],
    constraints: [
      "Development and production approval paths must remain separated.",
      "Engineering, security and PKI ownership must each be accountable and named.",
      "CA eligibility is driven by profile, not by convenience.",
      "Sensitive production profiles require stronger approval than internal ones.",
    ],
    openQuestions: [
      "Should staging share production trust, or its own?",
      "What is an acceptable release-hold policy when timestamping is unavailable?",
      "Who owns workload identity: the service team or the platform team?",
    ],
    requiredOutcomes: [
      "Separate development and production signing governance.",
      "Deterministic build → sign → timestamp → verify → release evidence.",
      "Renewal automation with visible failure.",
      "Defensible cloud workload trust model.",
    ],
    researchGuidance: RESEARCH_GUIDANCE,
    zones: [
      zone("core", "Platform core", "Central PKI and platform services."),
      zone("prod", "Production cloud", "Customer-facing workloads."),
      zone("dev", "Development / CI", "Build pipelines and pre-production."),
      zone("dmz", "External edge", "Internet-facing API endpoints."),
    ],
    pools: [
      pool("api-tls", "API TLS", "External and internal API service identity."),
      pool("workload", "Workload Identity", "Service-to-service identity."),
      pool("registry", "Registry / Deployment Identity", "Artifact registry and deployment agents."),
      pool("dev-signing", "Development Code Signing", "Development-only signing governance."),
      pool("prod-signing", "Production Code Signing", "Governed production release signing."),
      pool("timestamp", "Timestamping", "Timestamp authority credentials."),
      pool("pki-service", "PKI Service Certificates", "Responders, CRL signers, enrollment."),
    ],
    profiles: [
      prof("p-api-ext", "External API TLS", "api-tls", "ECDSA P-256", 90, "serverAuth", "dual", "external", "Short-lived automated external identity."),
      prof("p-api-int", "Internal service TLS", "api-tls", "ECDSA P-256", 90, "serverAuth", "standard", "internal", "Service mesh server identity."),
      prof("p-workload", "Workload mTLS", "workload", "ECDSA P-256", 30, "clientAuth", "standard", "production", "Service-to-service client identity."),
      prof("p-registry", "Deployment agent", "registry", "ECDSA P-256", 180, "clientAuth", "dual", "production", "Registry and deploy agent identity."),
      prof("p-dev-sign", "Development signing", "dev-signing", "RSA 3072", 365, "codeSigning", "standard", "development", "Development artifacts only."),
      prof("p-prod-sign", "Production release signing", "prod-signing", "RSA 4096", 730, "codeSigning", "governed", "production", "Governed signing service only."),
      prof("p-tsa", "Timestamp authority", "timestamp", "RSA 4096", 1095, "timeStamping", "governed", "production", "TSA credential."),
    ],
    inventory: [
      inv("ns-a1", "api.northstar.io TLS", "api-tls", "dmz", "Platform Engineering", "Known", "Active", "Good", 64, "known", "Healthy external API identity."),
      inv("ns-a2", "billing-svc internal TLS", "api-tls", "prod", "Billing Team", "Known", "Active", "Good", 58, "known", "Healthy internal service identity."),
      inv("ns-a3", "orders-svc workload identity", "workload", "prod", "Orders Team", "Known", "Active", "Good", 21, "known", "Representative workload credential."),
      inv("ns-a4", "deploy-agent-prod", "registry", "prod", "Release Engineering", "Known", "Renewal Due", "Good", 16, "known", "Renewal window open: 16 days remaining."),
      inv("ns-a5", "Production release signing key cert", "prod-signing", "core", "Security Engineering", "Known", "Active", "Good", 420, "known", "On a profile that requires governance review."),
      inv("ns-a6", "Northstar TSA credential", "timestamp", "core", "PKI Operations", "Known", "Active", "Good", 700, "known", "Timestamp authority."),
      inv("ns-a7", "OCSP responder credential", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 70, "known", "PKI service credential."),
      inv("ns-a8", "staging-gateway TLS", "api-tls", "dev", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
      inv("ns-a9", "legacy-api TLS (replaced)", "api-tls", "prod", "Platform Engineering", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
      inv("ns-a10", "compromised-build-signer (revoked)", "dev-signing", "dev", "Release Engineering", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
    ],
    workloads: [
      {
        id: "w-ext-api",
        name: "External API TLS endpoint",
        type: "tls",
        sourceZone: "dmz",
        targetZone: "prod",
        requiresPools: ["api-tls"],
        requiredEku: "serverAuth",
        notes: "Customer-facing endpoint.",
      },
      {
        id: "w-svc-mtls",
        name: "Service-to-service mTLS",
        type: "mtls",
        sourceZone: "prod",
        targetZone: "prod",
        requiresPools: ["workload", "api-tls"],
        requiredEku: "clientAuth",
        notes: "Internal workload identity.",
      },
      {
        id: "w-cicd",
        name: "CI/CD build → sign → timestamp → verify → release",
        type: "cicd",
        sourceZone: "dev",
        targetZone: "prod",
        requiresPools: ["prod-signing", "timestamp"],
        requiredEku: "codeSigning",
        requiresTimestamp: true,
        requiresHsm: true,
        scenarioRequirement: "governed-production-signing",
        notes: "Production release pipeline.",
      },
      {
        id: "w-signing",
        name: "Code signing verification",
        type: "code-signing",
        sourceZone: "core",
        targetZone: "prod",
        requiresPools: ["prod-signing"],
        requiredEku: "codeSigning",
        requiresHsm: true,
        notes: "Verification of a signed artifact.",
      },
      {
        id: "w-tsa",
        name: "Timestamp dependency and historical verification",
        type: "timestamping",
        sourceZone: "core",
        targetZone: "core",
        requiresPools: ["timestamp"],
        requiredEku: "timeStamping",
        requiresTimestamp: true,
        notes: "Historical signature verification under stated policy.",
      },
      {
        id: "w-cloud",
        name: "Cloud workload health",
        type: "cloud",
        sourceZone: "prod",
        targetZone: "dmz",
        requiresPools: ["api-tls"],
        requiredEku: "serverAuth",
        notes: "Health depends on attachment, trust and renewal.",
      },
    ],
    nodeCatalog: NODE_CATALOG,
    policy: {
      requireOfflineRoot: true,
      requireHsmForRoot: true,
      requireHsmForIssuing: true,
      maxIssuingValidityDays: 2555,
      minIssuingCas: 2,
      prohibitedPaths: [["dev", "prod"]],
      requiredZones: ["core", "prod", "dev"],
      statusChallenge:
        "Short-lived cloud identity means renewal reliability and status freshness matter more than long validity.",
    },
  },
  private: {
    calibration: { normalizedDifficulty: 101, researchBurden: "moderate", evidenceBurden: "standard" },
    answerGuidance: [
      "Production signing must move to the governed production profile and signing service.",
      "TSA outage must not be answered by silently releasing unsigned or untimestamped artifacts.",
    ],
    events: [
      {
        key: "NS-01",
        kind: "change",
        title: "Production Signing Policy Change",
        studentBrief:
          "Effective immediately, production releases must use the approved production signing profile through the governed signing service. Development signing certificates are development-only. Re-evaluate your pipeline and signing policy checks.",
        symptoms: [
          "Release pipeline runs fail the policy/governance check when signing under a non-governed profile.",
          "Prior signing evidence is marked stale for the current state.",
        ],
        effects: { requireGovernedSigning: true, staleAllEvidence: true },
        instructorNotes: "Accept any governed transition that blocks non-compliant releases.",
        validSolutionFamilies: [
          "Governed replacement of the signing credential",
          "Pipeline binding correction to the production profile",
          "Approved staged transition with release blocking",
        ],
        invalidMoves: ["Keeping development signing in the production path", "Disabling the policy check"],
      },
      {
        key: "NS-02",
        kind: "incident",
        title: "Timestamp Authority Availability Incident",
        studentBrief:
          "New timestamp requests are failing. The timestamp authority path is unavailable. Timestamps already bound to earlier artifacts remain valid under policy. Decide how releases proceed.",
        symptoms: [
          "Pipeline runs fail the timestamp dependency check.",
          "Historical verification of previously timestamped artifacts still succeeds.",
        ],
        effects: { disableTimestamping: true, staleAllEvidence: true },
        instructorNotes:
          "Deterministic outage. Historical timestamp semantics must be preserved in the student's reasoning.",
        validSolutionFamilies: [
          "Restore the TSA path or service",
          "Approved alternate timestamp authority",
          "Documented release hold or manual control where policy permits",
        ],
        invalidMoves: [
          "Claiming existing signatures are now invalid",
          "Releasing untimestamped artifacts with no policy basis",
        ],
      },
    ],
  },
};

/* ------------------------------------------- generic parity-balanced builder */

interface CompactSpec {
  code: string;
  title: string;
  industry: string;
  difficulty: number;
  architecturePattern: string;
  clmFocus: string;
  situation: string;
  mission: string;
  definitionOfSuccess: string;
  metrics: [string, string][];
  concerns: string[];
  constraints: string[];
  openQuestions: string[];
  requiredOutcomes: string[];
  zones: [string, string, string][];
  pools: [string, string, string][];
  /** [id, name, poolId, algorithm, days, eku, approval, environment, notes] */
  profiles: [string, string, string, string, number, string, ProfileTemplate["approval"], ProfileTemplate["environment"], string][];
  /** 10 seeds: healthy x4, renewal-due, review, pki-service, unknown-owner, expired, revoked */
  inventory: InventorySeed[];
  workloads: WorkloadDefinition[];
  policy: ScenarioPublic["policy"];
  changeEvent: PrivateEventDefinition;
  discoveryEvent: PrivateEventDefinition;
  answerGuidance: string[];
}

function build(spec: CompactSpec): ScenarioRecord {
  return {
    public: {
      code: spec.code,
      version: "1.0.0",
      title: spec.title,
      organization: spec.title,
      industry: spec.industry,
      role: "PKI Architect",
      durationWeeks: "Weeks 17–24",
      architecturePattern: spec.architecturePattern,
      clmFocus: spec.clmFocus,
      situation: spec.situation,
      mission: spec.mission,
      definitionOfSuccess: spec.definitionOfSuccess,
      metrics: spec.metrics.map(([label, value]) => ({ label, value })),
      concerns: spec.concerns,
      constraints: spec.constraints,
      openQuestions: spec.openQuestions,
      requiredOutcomes: spec.requiredOutcomes,
      researchGuidance: RESEARCH_GUIDANCE,
      zones: spec.zones.map(([id, name, note]) => zone(id, name, note)),
      pools: spec.pools.map(([id, name, purpose]) => pool(id, name, purpose)),
      profiles: spec.profiles.map((p) => prof(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8])),
      inventory: spec.inventory,
      workloads: spec.workloads,
      nodeCatalog: NODE_CATALOG,
      policy: spec.policy,
    },
    private: {
      calibration: {
        normalizedDifficulty: spec.difficulty,
        researchBurden: "moderate",
        evidenceBurden: "standard",
      },
      answerGuidance: spec.answerGuidance,
      events: [spec.changeEvent, spec.discoveryEvent],
    },
  };
}

const meridian = build({
  code: "meridian-trust-bank",
  title: "Meridian Trust Bank",
  industry: "Financial Services",
  difficulty: 100,
  architecturePattern: "Bank data center, transaction edge, branches, and remote workforce.",
  clmFocus: "Strict approvals, accountable ownership, and renewal assurance.",
  situation:
    "Meridian Trust Bank processes card and transfer traffic through a transaction edge that must not go down. Approvals for certificate issuance are inconsistent across teams, several branch tunnels renew by hand, and high-availability transaction systems depend on status answers nobody has tested under failure.",
  mission:
    "Deliver a certificate architecture where every issuance is approved by an accountable party, renewal is assured for transaction-critical systems, and status remains answerable when a component fails.",
  definitionOfSuccess:
    "Transaction systems keep serving through renewal and status failures, approvals are provable, and no certificate in scope lacks a named owner.",
  metrics: [
    ["Branches", "84"],
    ["Transactions / day", "1.9M"],
    ["Remote workforce", "2,100"],
    ["Renewal misses last year", "5"],
  ],
  concerns: [
    "Branch links fail over slowly and the transaction edge cannot wait.",
    "Approval records for older certificates cannot be produced.",
    "One transaction-adjacent certificate has no owner of record.",
    "High-availability pairs have never been tested against a revoked credential.",
  ],
  constraints: [
    "Every issuance in the transaction pool requires dual approval.",
    "Branch connectivity is not guaranteed during failover windows.",
    "The external transaction edge is subject to partner requirements.",
    "Renewal accountability must be provable, not assumed.",
  ],
  openQuestions: [
    "Should the transaction edge share an issuing authority with internal services?",
    "What status freshness does a high-availability pair actually require?",
    "Who approves an emergency issuance at 02:00?",
  ],
  requiredOutcomes: [
    "Approval and ownership provable for every certificate in scope.",
    "Renewal assurance for transaction-critical identity.",
    "Status resilience under component failure.",
    "Deterministic evidence covering both the healthy and failed paths.",
  ],
  zones: [
    ["core", "Bank data center", "Central PKI and core banking."],
    ["edge", "Transaction edge", "External transaction processing."],
    ["branch", "Branch network", "Branch systems and tunnels."],
    ["workforce", "Remote workforce", "Remote staff access."],
  ],
  pools: [
    ["txn-tls", "Transaction TLS", "Identity for transaction processing services."],
    ["workforce", "Workforce", "Staff authentication."],
    ["endpoint", "Endpoint", "Managed device identity."],
    ["vpn", "VPN", "Branch and remote tunnels."],
    ["pki-service", "PKI Services", "Responders and CRL signers."],
    ["partner-tls", "Partner TLS", "Partner-facing mutual trust."],
  ],
  profiles: [
    ["p-txn", "Transaction TLS", "txn-tls", "ECDSA P-256", 397, "serverAuth", "dual", "production", "Transaction-critical service identity."],
    ["p-partner", "Partner mutual TLS", "partner-tls", "RSA 3072", 397, "clientAuth", "governed", "external", "Partner boundary identity."],
    ["p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Staff credential."],
    ["p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device."],
    ["p-vpn", "Branch VPN", "vpn", "RSA 3072", 730, "clientAuth", "dual", "internal", "Branch tunnel identity."],
    ["p-ocsp", "OCSP / CRL Signing", "pki-service", "ECDSA P-256", 90, "OCSPSigning", "governed", "internal", "PKI service credential."],
  ],
  inventory: [
    inv("mt-a1", "Card Authorization TLS", "txn-tls", "edge", "Payments Engineering", "Known", "Active", "Good", 190, "known", "Healthy transaction service."),
    inv("mt-a2", "Core Banking API TLS", "txn-tls", "core", "Core Platform", "Known", "Active", "Good", 165, "known", "Healthy internal service."),
    inv("mt-a3", "Workforce Credential — Branch Staff", "workforce", "workforce", "Identity Services", "Known", "Active", "Good", 250, "known", "Representative workforce credential."),
    inv("mt-a4", "Managed Laptop Identity — Fleet B", "endpoint", "workforce", "End User Computing", "Known", "Active", "Good", 380, "known", "Representative endpoint identity."),
    inv("mt-a5", "Branch 41 Site VPN", "vpn", "branch", "Network Engineering", "Known", "Renewal Due", "Good", 19, "known", "Renewal window open: 19 days remaining."),
    inv("mt-a6", "Partner Settlement mTLS", "partner-tls", "edge", "Partner Integration", "Known", "Active", "Good", 280, "known", "On a governed profile requiring review before reissue."),
    inv("mt-a7", "Primary OCSP Responder", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 58, "known", "PKI service credential."),
    inv("mt-a8", "Reconciliation Gateway TLS", "txn-tls", "core", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
    inv("mt-a9", "Legacy Statements TLS (replaced)", "txn-tls", "core", "Digital Channels", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
    inv("mt-a10", "Retired ATM Gateway TLS", "txn-tls", "branch", "ATM Services", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
  ],
  workloads: [
    { id: "w-txn", name: "Transaction edge TLS", type: "tls", sourceZone: "edge", targetZone: "core", requiresPools: ["txn-tls"], requiredEku: "serverAuth", notes: "Transaction processing identity." },
    { id: "w-partner", name: "Partner settlement mTLS", type: "mtls", sourceZone: "edge", targetZone: "core", requiresPools: ["partner-tls", "txn-tls"], requiredEku: "clientAuth", notes: "Partner boundary mutual trust." },
    { id: "w-branch", name: "Branch tunnel identity", type: "mtls", sourceZone: "branch", targetZone: "core", requiresPools: ["vpn"], requiredEku: "clientAuth", scenarioRequirement: "offline-tolerant-status", notes: "Branch tunnel under failover." },
    { id: "w-workforce", name: "Remote workforce access", type: "mtls", sourceZone: "workforce", targetZone: "core", requiresPools: ["workforce"], requiredEku: "clientAuth", notes: "Remote staff authentication." },
    { id: "w-cloud", name: "Cloud reporting workload", type: "cloud", sourceZone: "core", targetZone: "edge", requiresPools: ["txn-tls"], requiredEku: "serverAuth", notes: "Conceptual cloud workload." },
  ],
  policy: {
    requireOfflineRoot: true,
    requireHsmForRoot: true,
    requireHsmForIssuing: true,
    maxIssuingValidityDays: 2555,
    minIssuingCas: 2,
    prohibitedPaths: [["branch", "edge"]],
    requiredZones: ["core", "edge", "branch"],
    statusChallenge:
      "High-availability transaction systems must still obtain an authoritative status answer when the primary responder fails.",
  },
  changeEvent: {
    key: "MT-01",
    kind: "incident",
    title: "Primary status responder failure at the transaction edge",
    studentBrief:
      "The primary status responder is unavailable to the transaction edge and branch network. Transaction systems must keep serving. Re-evaluate status behaviour and workload results.",
    symptoms: [
      "Status observation fails for consumers that depended on the primary responder.",
      "Prior validation evidence is marked stale for the current state.",
    ],
    effects: {
      disablePaths: [
        ["edge", "core"],
        ["branch", "core"],
      ],
      staleAllEvidence: true,
      note: "A controlled scheduled CRL path remains permitted.",
    },
    instructorNotes: "Look for resilience design, not for a specific responder product.",
    validSolutionFamilies: [
      "Redundant status distribution",
      "Scheduled CRL with defined freshness",
      "Stapling or cached validation with stated risk",
    ],
    invalidMoves: ["Assuming the responder is back", "Turning off status checking", "Deleting prior evidence"],
  },
  discoveryEvent: {
    key: "MT-02",
    kind: "discovery",
    title: "Unmanaged treasury certificate discovered",
    studentBrief:
      "A discovery sweep has returned a previously unmanaged certificate: treasury-batch-04, with no owner of record and 24 days remaining. Treat it as a normal discovery record.",
    symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
    effects: {
      addAssets: [
        inv("mt-hidden-1", "treasury-batch-04 (unmanaged transaction client)", "txn-tls", "core", "—", "Unknown", "Active", "Good", 24, "discovered", "Discovered during a later sweep. No owner of record."),
      ],
    },
    instructorNotes: "Absent from every student surface before activation.",
    validSolutionFamilies: ["Investigate ownership, classify, govern or retire with evidence"],
    invalidMoves: ["Immediate revocation with no impact analysis"],
  },
  answerGuidance: ["Redundant or scheduled status distribution is the intended family for MT-01."],
});

const sentinel = build({
  code: "sentinel-federal",
  title: "Sentinel Federal Services",
  industry: "Government Contractor",
  difficulty: 102,
  architecturePattern: "Controlled enclaves, corporate services, and a partner trust boundary.",
  clmFocus: "Separation of duties, exceptions, and controlled trust.",
  situation:
    "Sentinel Federal Services operates controlled enclaves alongside corporate IT and exchanges signed material with partners. Exceptions have been granted verbally, restricted paths are inconsistently enforced, and release signing has drifted outside the controlled process.",
  mission:
    "Establish controlled trust across enclaves and partners with provable separation of duties, documented exceptions, and controlled release signing.",
  definitionOfSuccess:
    "Every exception is approved and recorded, no restricted path is crossed without authorization, and releases can be verified against a controlled signing chain.",
  metrics: [
    ["Controlled enclaves", "3"],
    ["Partner organizations", "9"],
    ["Approved exceptions on file", "0 of 14 claimed"],
    ["Controlled releases / month", "12"],
  ],
  concerns: [
    "Partner credentials have been re-used across enclaves.",
    "Exception approvals exist only in email.",
    "Restricted paths are enforced by convention, not configuration.",
    "One partner credential has no owner of record.",
  ],
  constraints: [
    "Separation of duties between requestor and approver is mandatory.",
    "Enclave-to-corporate paths are restricted and must be explicitly authorized.",
    "Partner trust must be scoped; a partner credential must not be usable enterprise-wide.",
    "Signing releases requires controlled approval.",
  ],
  openQuestions: [
    "Should each enclave hold its own issuing authority?",
    "How long may an approved exception remain open?",
    "What is the minimum evidence a partner must provide to be trusted?",
  ],
  requiredOutcomes: [
    "Enclave-scoped trust with documented exceptions.",
    "Provable separation of duties in approvals.",
    "Controlled release signing evidence.",
    "Deterministic workload evidence across restricted paths.",
  ],
  zones: [
    ["core", "Corporate services", "Central PKI and corporate IT."],
    ["enclave", "Controlled enclave", "Restricted program environment."],
    ["partner", "Partner boundary", "External partner trust."],
    ["workforce", "Workforce", "Staff endpoints."],
  ],
  pools: [
    ["internal-tls", "Internal TLS", "Corporate service identity."],
    ["workforce", "Workforce", "Staff authentication."],
    ["endpoint", "Endpoint", "Managed device identity."],
    ["vpn", "VPN", "Remote and enclave tunnels."],
    ["partner-id", "Partner Identity", "Scoped partner credentials."],
    ["code-signing", "Code Signing", "Controlled release signing."],
  ],
  profiles: [
    ["p-tls", "Internal TLS Server", "internal-tls", "ECDSA P-256", 397, "serverAuth", "standard", "internal", "Corporate service identity."],
    ["p-enclave", "Enclave service TLS", "internal-tls", "RSA 3072", 397, "serverAuth", "governed", "internal", "Enclave-scoped service identity."],
    ["p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Staff credential."],
    ["p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device."],
    ["p-partner", "Partner Identity", "partner-id", "RSA 3072", 365, "clientAuth", "governed", "external", "Scoped partner credential."],
    ["p-sign", "Controlled release signing", "code-signing", "RSA 4096", 730, "codeSigning", "governed", "production", "Controlled signing only."],
  ],
  inventory: [
    inv("sf-a1", "Corporate portal TLS", "internal-tls", "core", "Corporate IT", "Known", "Active", "Good", 200, "known", "Healthy corporate service."),
    inv("sf-a2", "Enclave A service TLS", "internal-tls", "enclave", "Program A", "Known", "Active", "Good", 150, "known", "Healthy enclave service."),
    inv("sf-a3", "Workforce Credential — Cleared Staff", "workforce", "workforce", "Identity Services", "Known", "Active", "Good", 240, "known", "Representative workforce credential."),
    inv("sf-a4", "Managed Workstation Identity", "endpoint", "workforce", "End User Computing", "Known", "Active", "Good", 410, "known", "Representative endpoint identity."),
    inv("sf-a5", "Enclave B VPN identity", "vpn", "enclave", "Network Engineering", "Known", "Renewal Due", "Good", 17, "known", "Renewal window open: 17 days remaining."),
    inv("sf-a6", "Partner 04 identity", "partner-id", "partner", "Partner Integration", "Known", "Active", "Good", 260, "known", "On a governed profile requiring exception review."),
    inv("sf-a7", "Enclave CRL signer", "internal-tls", "core", "PKI Operations", "Known", "Active", "Good", 66, "known", "PKI service credential."),
    inv("sf-a8", "Program archive TLS", "internal-tls", "enclave", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
    inv("sf-a9", "Legacy partner TLS (replaced)", "partner-id", "partner", "Partner Integration", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
    inv("sf-a10", "Retired enclave signer", "code-signing", "core", "Security Engineering", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
  ],
  workloads: [
    { id: "w-corp", name: "Corporate service TLS", type: "tls", sourceZone: "workforce", targetZone: "core", requiresPools: ["internal-tls"], requiredEku: "serverAuth", notes: "Corporate service identity." },
    { id: "w-enclave", name: "Enclave service mTLS", type: "mtls", sourceZone: "enclave", targetZone: "core", requiresPools: ["internal-tls", "endpoint"], requiredEku: "clientAuth", scenarioRequirement: "offline-tolerant-status", notes: "Restricted-path service access." },
    { id: "w-partner", name: "Partner exchange mTLS", type: "mtls", sourceZone: "partner", targetZone: "core", requiresPools: ["partner-id"], requiredEku: "clientAuth", notes: "Scoped partner trust." },
    { id: "w-release", name: "Controlled release signing", type: "code-signing", sourceZone: "core", targetZone: "enclave", requiresPools: ["code-signing"], requiredEku: "codeSigning", requiresHsm: true, scenarioRequirement: "governed-production-signing", notes: "Controlled signing with approval." },
    { id: "w-cloud", name: "Cloud collaboration workload", type: "cloud", sourceZone: "core", targetZone: "partner", requiresPools: ["internal-tls"], requiredEku: "serverAuth", notes: "Conceptual cloud workload." },
  ],
  policy: {
    requireOfflineRoot: true,
    requireHsmForRoot: true,
    requireHsmForIssuing: true,
    maxIssuingValidityDays: 2190,
    minIssuingCas: 2,
    prohibitedPaths: [["enclave", "partner"]],
    requiredZones: ["core", "enclave", "partner"],
    statusChallenge:
      "Enclaves cannot reach external status services; status must be answerable inside the boundary.",
  },
  changeEvent: {
    key: "SF-01",
    kind: "change",
    title: "Restricted path enforcement change",
    studentBrief:
      "Enclave-to-corporate paths are now enforced by configuration. The previous direct route is unavailable; only the approved controlled path remains. Re-evaluate trust, status and workload behaviour inside the enclave.",
    symptoms: [
      "Enclave workloads fail path availability or status observation.",
      "Prior evidence is marked stale for the current state.",
    ],
    effects: { disablePaths: [["enclave", "core"]], staleAllEvidence: true },
    instructorNotes: "Separation of duties and exception documentation are the graded behaviours.",
    validSolutionFamilies: [
      "Enclave-local status distribution",
      "Approved controlled path with documented exception",
      "Scheduled CRL with defined freshness",
    ],
    invalidMoves: ["Restoring the removed path without authorization", "Undocumented exceptions"],
  },
  discoveryEvent: {
    key: "SF-02",
    kind: "discovery",
    title: "Legacy partner credential discovered",
    studentBrief:
      "A discovery sweep has returned a legacy partner credential, partner-legacy-02, with no owner of record and 20 days remaining. Treat it as a normal discovery record.",
    symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
    effects: {
      addAssets: [
        inv("sf-hidden-1", "partner-legacy-02 (legacy partner credential)", "partner-id", "partner", "—", "Unknown", "Active", "Good", 20, "discovered", "Discovered during a later sweep. No owner of record."),
      ],
    },
    instructorNotes: "Absent from every student surface before activation.",
    validSolutionFamilies: ["Investigate ownership, scope or retire with evidence"],
    invalidMoves: ["Extending partner trust without approval"],
  },
  answerGuidance: ["Enclave-local status distribution is the intended family for SF-01."],
});

const ironvale = build({
  code: "ironvale-manufacturing",
  title: "IronVale Manufacturing",
  industry: "Manufacturing",
  difficulty: 99,
  architecturePattern: "Headquarters plus segmented plants with constrained industrial devices.",
  clmFocus: "Fleet ownership, replacement, and renewal under constrained connectivity.",
  situation:
    "IronVale runs four plants on segmented industrial networks. Thousands of controllers hold long-lived certificates that nobody has replaced since installation. Plant links are narrow and sometimes offline, and a certificate failure stops production.",
  mission:
    "Design certificate identity and lifecycle for a constrained plant fleet, with a replacement path that does not require a production stop and a status design that tolerates stale links.",
  definitionOfSuccess:
    "Devices have accountable ownership, fleets can be replaced in waves, and plants can validate identity when the link to headquarters is degraded.",
  metrics: [
    ["Plants", "4"],
    ["Industrial devices", "~6,800"],
    ["Longest certificate validity in use", "10 years"],
    ["Production stoppages from cert failure", "2 last year"],
  ],
  concerns: [
    "Plant links are narrow and intermittently offline.",
    "Some controllers cannot run modern enrollment protocols.",
    "Fleet ownership is recorded per-plant, inconsistently.",
    "One controller certificate has no owner of record.",
  ],
  constraints: [
    "Plants are segmented from each other and from corporate.",
    "Constrained devices cannot depend on live responder access.",
    "Fleet replacement must be staged; a full-fleet reissue is not acceptable.",
    "Production impact must be assessed before any revocation.",
  ],
  openQuestions: [
    "Does each plant need its own issuing authority?",
    "What is an acceptable stale-status window on a plant floor?",
    "Who owns a device fleet purchased by operations but run by IT?",
  ],
  requiredOutcomes: [
    "Device identity strategy with staged replacement.",
    "Status design tolerant of stale or offline links.",
    "Ownership model across plants.",
    "Deterministic evidence covering degraded connectivity.",
  ],
  zones: [
    ["core", "Headquarters data center", "Central PKI and enterprise services."],
    ["plant", "Plant network", "Segmented industrial environment."],
    ["workforce", "Corporate workforce", "Office endpoints."],
    ["dmz", "External DMZ", "Supplier-facing services."],
  ],
  pools: [
    ["plant-tls", "Plant TLS", "Plant service identity."],
    ["device", "Device Identity", "Industrial controller identity."],
    ["endpoint", "Endpoint", "Managed device identity."],
    ["workforce", "Workforce", "Staff authentication."],
    ["vpn", "VPN", "Plant and remote tunnels."],
    ["pki-service", "PKI Services", "Responders and CRL signers."],
  ],
  profiles: [
    ["p-plant", "Plant service TLS", "plant-tls", "ECDSA P-256", 397, "serverAuth", "standard", "internal", "Plant service identity."],
    ["p-device", "Industrial device identity", "device", "RSA 2048", 1825, "clientAuth", "dual", "internal", "Long-lived constrained device identity."],
    ["p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device."],
    ["p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Staff credential."],
    ["p-vpn", "Plant VPN", "vpn", "RSA 3072", 730, "clientAuth", "dual", "internal", "Plant tunnel identity."],
    ["p-ocsp", "OCSP / CRL Signing", "pki-service", "ECDSA P-256", 90, "OCSPSigning", "governed", "internal", "PKI service credential."],
  ],
  inventory: [
    inv("iv-a1", "Plant 2 MES TLS", "plant-tls", "plant", "Manufacturing IT", "Known", "Active", "Good", 195, "known", "Healthy plant service."),
    inv("iv-a2", "Supplier portal TLS", "plant-tls", "dmz", "Supply Chain IT", "Known", "Active", "Good", 172, "known", "Healthy external service."),
    inv("iv-a3", "Workforce Credential — Engineering", "workforce", "workforce", "Identity Services", "Known", "Active", "Good", 235, "known", "Representative workforce credential."),
    inv("iv-a4", "Managed Laptop Identity — Plant Ops", "endpoint", "workforce", "End User Computing", "Known", "Active", "Good", 395, "known", "Representative endpoint identity."),
    inv("iv-a5", "Plant 3 Site VPN", "vpn", "plant", "Network Engineering", "Known", "Renewal Due", "Good", 20, "known", "Renewal window open: 20 days remaining."),
    inv("iv-a6", "Controller Fleet Identity — Line 4", "device", "plant", "Operations Technology", "Known", "Active", "Good", 320, "known", "On a profile requiring review before fleet reissue."),
    inv("iv-a7", "Plant CRL distribution credential", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 64, "known", "PKI service credential."),
    inv("iv-a8", "Line 7 historian TLS", "plant-tls", "plant", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
    inv("iv-a9", "Legacy SCADA TLS (replaced)", "plant-tls", "plant", "Operations Technology", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
    inv("iv-a10", "Retired plant gateway TLS", "plant-tls", "plant", "Manufacturing IT", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
  ],
  workloads: [
    { id: "w-mes", name: "Plant MES TLS", type: "tls", sourceZone: "plant", targetZone: "core", requiresPools: ["plant-tls"], requiredEku: "serverAuth", notes: "Plant service identity." },
    { id: "w-device", name: "Controller mutual TLS", type: "mtls", sourceZone: "plant", targetZone: "core", requiresPools: ["device", "plant-tls"], requiredEku: "clientAuth", scenarioRequirement: "offline-tolerant-status", notes: "Constrained device identity under degraded links." },
    { id: "w-vpn", name: "Plant tunnel identity", type: "mtls", sourceZone: "plant", targetZone: "core", requiresPools: ["vpn"], requiredEku: "clientAuth", notes: "Plant tunnel." },
    { id: "w-supplier", name: "Supplier portal TLS", type: "tls", sourceZone: "dmz", targetZone: "core", requiresPools: ["plant-tls"], requiredEku: "serverAuth", notes: "External supplier access." },
    { id: "w-cloud", name: "Cloud telemetry workload", type: "cloud", sourceZone: "core", targetZone: "dmz", requiresPools: ["plant-tls"], requiredEku: "serverAuth", notes: "Conceptual cloud workload." },
  ],
  policy: {
    requireOfflineRoot: true,
    requireHsmForRoot: true,
    requireHsmForIssuing: false,
    maxIssuingValidityDays: 3650,
    minIssuingCas: 1,
    prohibitedPaths: [["plant", "dmz"]],
    requiredZones: ["core", "plant"],
    statusChallenge:
      "Plant devices routinely observe stale status; the design must state what stale means and when it is acceptable.",
  },
  changeEvent: {
    key: "IV-01",
    kind: "change",
    title: "Plant segmentation change",
    studentBrief:
      "Plants have been moved behind a stricter industrial segmentation boundary. The previous plant-to-headquarters status path is unavailable; a controlled scheduled retrieval path remains permitted. Re-evaluate device workloads.",
    symptoms: [
      "Plant workloads fail path availability or status observation.",
      "Prior evidence is marked stale for the current state.",
    ],
    effects: { disablePaths: [["plant", "core"]], staleAllEvidence: true },
    instructorNotes: "Watch for production impact reasoning, not just technical correctness.",
    validSolutionFamilies: [
      "Plant-local status distribution",
      "Scheduled CRL retrieval with freshness controls",
      "Approved caching strategy with stated risk",
    ],
    invalidMoves: ["Assuming live responder reachability", "Fleet-wide revocation without impact analysis"],
  },
  discoveryEvent: {
    key: "IV-02",
    kind: "discovery",
    title: "Unmanaged controller certificate discovered",
    studentBrief:
      "A discovery sweep has returned an unmanaged controller certificate, controller-l9-22, with no owner of record and 23 days remaining. Treat it as a normal discovery record.",
    symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
    effects: {
      addAssets: [
        inv("iv-hidden-1", "controller-l9-22 (unmanaged controller)", "device", "plant", "—", "Unknown", "Active", "Good", 23, "discovered", "Discovered during a later sweep. No owner of record."),
      ],
    },
    instructorNotes: "Absent from every student surface before activation.",
    validSolutionFamilies: ["Investigate ownership, plan staged replacement with evidence"],
    invalidMoves: ["Revoking a production controller without impact analysis"],
  },
  answerGuidance: ["Plant-local or scheduled status distribution is the intended family for IV-01."],
});

const summit = build({
  code: "summit-state-university",
  title: "Summit State University",
  industry: "Higher Education",
  difficulty: 98,
  architecturePattern: "Central IT with decentralized colleges, teaching labs and research systems.",
  clmFocus: "Federated ownership, discovery, exceptions, and renewal accountability.",
  situation:
    "Summit State runs central IT alongside colleges that operate their own services. Research groups stand up endpoints without telling anyone, maintenance is uneven, and central IT discovers certificates it has never seen when they fail.",
  mission:
    "Build a federated certificate model where colleges keep autonomy, central IT keeps visibility, and every certificate has an accountable owner and a renewal path.",
  definitionOfSuccess:
    "Discovery is continuous, ownership is federated but accountable, exceptions are documented, and no service fails because nobody was watching a clock.",
  metrics: [
    ["Colleges", "7"],
    ["Known services", "1,150"],
    ["Estimated unknown services", "unknown"],
    ["Expiry-caused outages last year", "9"],
  ],
  concerns: [
    "Research endpoints appear and disappear without central knowledge.",
    "Colleges resist central control of their issuance.",
    "Lab certificates outlive the students who created them.",
    "One research service certificate has no owner of record.",
  ],
  constraints: [
    "Colleges retain operational autonomy over their own services.",
    "Research systems have uneven maintenance windows.",
    "Central IT cannot mandate a single enrollment mechanism everywhere.",
    "Exceptions must be recorded and time-bounded.",
  ],
  openQuestions: [
    "Should each college have a delegated issuing authority?",
    "What happens to a certificate when its owning student graduates?",
    "How often must discovery run to be useful?",
  ],
  requiredOutcomes: [
    "Federated ownership model with accountable parties.",
    "Discovery and exception process.",
    "Renewal accountability across decentralized teams.",
    "Deterministic evidence including uneven maintenance conditions.",
  ],
  zones: [
    ["core", "Central IT data center", "Central PKI and enterprise services."],
    ["college", "College networks", "Decentralized college services."],
    ["research", "Research / lab network", "Research systems and teaching labs."],
    ["dmz", "External DMZ", "Public university services."],
  ],
  pools: [
    ["web-tls", "Web TLS", "Public and internal web service identity."],
    ["workforce", "Workforce", "Faculty and staff authentication."],
    ["endpoint", "Endpoint", "Managed device identity."],
    ["research-device", "Research Device", "Lab and research endpoint identity."],
    ["vpn", "VPN", "Remote and lab tunnels."],
    ["pki-service", "PKI Services", "Responders and CRL signers."],
  ],
  profiles: [
    ["p-web", "Web TLS", "web-tls", "ECDSA P-256", 397, "serverAuth", "standard", "external", "Public web identity."],
    ["p-college", "College service TLS", "web-tls", "ECDSA P-256", 397, "serverAuth", "standard", "internal", "Delegated college service identity."],
    ["p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Faculty and staff credential."],
    ["p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device."],
    ["p-research", "Research device identity", "research-device", "ECDSA P-256", 730, "clientAuth", "dual", "internal", "Lab endpoint identity; exception-prone."],
    ["p-ocsp", "OCSP / CRL Signing", "pki-service", "ECDSA P-256", 90, "OCSPSigning", "governed", "internal", "PKI service credential."],
  ],
  inventory: [
    inv("su-a1", "www.summitstate.edu TLS", "web-tls", "dmz", "Central IT Web", "Known", "Active", "Good", 205, "known", "Healthy public service."),
    inv("su-a2", "Registrar service TLS", "web-tls", "core", "Enterprise Applications", "Known", "Active", "Good", 168, "known", "Healthy internal service."),
    inv("su-a3", "Workforce Credential — Faculty", "workforce", "college", "Identity Services", "Known", "Active", "Good", 245, "known", "Representative workforce credential."),
    inv("su-a4", "Managed Laptop Identity — Staff", "endpoint", "core", "End User Computing", "Known", "Active", "Good", 405, "known", "Representative endpoint identity."),
    inv("su-a5", "Engineering College VPN", "vpn", "college", "Network Engineering", "Known", "Renewal Due", "Good", 18, "known", "Renewal window open: 18 days remaining."),
    inv("su-a6", "Genomics instrument identity", "research-device", "research", "Research Computing", "Known", "Active", "Good", 290, "known", "On a profile requiring exception review before reissue."),
    inv("su-a7", "Central OCSP responder", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 60, "known", "PKI service credential."),
    inv("su-a8", "Physics data service TLS", "web-tls", "research", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
    inv("su-a9", "Legacy course tool TLS (replaced)", "web-tls", "college", "Teaching Technology", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
    inv("su-a10", "Retired library proxy TLS", "web-tls", "core", "Library Systems", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
  ],
  workloads: [
    { id: "w-web", name: "Public web TLS", type: "tls", sourceZone: "dmz", targetZone: "core", requiresPools: ["web-tls"], requiredEku: "serverAuth", notes: "Public university service." },
    { id: "w-college", name: "College service TLS", type: "tls", sourceZone: "college", targetZone: "core", requiresPools: ["web-tls"], requiredEku: "serverAuth", notes: "Delegated college service." },
    { id: "w-research", name: "Research instrument mTLS", type: "mtls", sourceZone: "research", targetZone: "core", requiresPools: ["research-device", "web-tls"], requiredEku: "clientAuth", scenarioRequirement: "device-identity-owner", notes: "Research endpoint identity with ownership requirement." },
    { id: "w-vpn", name: "College tunnel identity", type: "mtls", sourceZone: "college", targetZone: "core", requiresPools: ["vpn"], requiredEku: "clientAuth", notes: "College tunnel." },
    { id: "w-cloud", name: "Cloud research workload", type: "cloud", sourceZone: "research", targetZone: "dmz", requiresPools: ["web-tls"], requiredEku: "serverAuth", notes: "Conceptual cloud workload." },
  ],
  policy: {
    requireOfflineRoot: true,
    requireHsmForRoot: true,
    requireHsmForIssuing: false,
    maxIssuingValidityDays: 3650,
    minIssuingCas: 2,
    prohibitedPaths: [["research", "college"]],
    requiredZones: ["core", "college", "research"],
    statusChallenge:
      "Research systems are unevenly maintained; status answers must remain usable when maintenance lapses.",
  },
  changeEvent: {
    key: "SU-01",
    kind: "change",
    title: "Decentralized service transition",
    studentBrief:
      "Three colleges have transitioned services onto a separately administered network. Their previous path to central status services is unavailable; a controlled retrieval path remains permitted. Re-evaluate affected workloads and ownership.",
    symptoms: [
      "College and research workloads fail path availability or status observation.",
      "Prior evidence is marked stale for the current state.",
    ],
    effects: { disablePaths: [["college", "core"]], staleAllEvidence: true },
    instructorNotes: "Federated ownership reasoning is graded alongside the technical answer.",
    validSolutionFamilies: [
      "Delegated status distribution per college",
      "Scheduled CRL with freshness controls",
      "Documented exception with time bound",
    ],
    invalidMoves: ["Assuming central reachability", "Centralizing by decree with no ownership plan"],
  },
  discoveryEvent: {
    key: "SU-02",
    kind: "discovery",
    title: "Unmanaged lab certificate discovered",
    studentBrief:
      "A discovery sweep has returned an unmanaged laboratory certificate, lab-imaging-08, with no owner of record and 21 days remaining. Treat it as a normal discovery record.",
    symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
    effects: {
      addAssets: [
        inv("su-hidden-1", "lab-imaging-08 (unmanaged lab endpoint)", "research-device", "research", "—", "Unknown", "Active", "Good", 21, "discovered", "Discovered during a later sweep. No owner of record."),
      ],
    },
    instructorNotes: "Absent from every student surface before activation.",
    validSolutionFamilies: ["Investigate ownership, govern under exception or retire with evidence"],
    invalidMoves: ["Disabling a live research instrument without impact analysis"],
  },
  answerGuidance: ["Delegated or scheduled status distribution is the intended family for SU-01."],
});

const harborpoint = build({
  code: "harborpoint-retail",
  title: "HarborPoint Retail",
  industry: "Retail / E-commerce",
  difficulty: 100,
  architecturePattern: "Cloud commerce platform, corporate services, distribution centers and distributed stores.",
  clmFocus: "Seasonal scale, vendor ownership, and renewal timing.",
  situation:
    "HarborPoint sells online and through 240 stores. The commerce platform scales hard in peak season, several store systems are owned by vendors, and renewal windows keep landing in the middle of the busiest weeks of the year.",
  mission:
    "Build certificate operations that survive peak season: predictable renewal timing, clear vendor ownership, and store edge availability when the network is not perfect.",
  definitionOfSuccess:
    "No renewal lands inside a change freeze without a plan, every vendor-owned certificate has a named accountable party, and store systems keep serving during edge outages.",
  metrics: [
    ["Stores", "240"],
    ["Peak traffic multiple", "11x"],
    ["Vendor-managed systems", "38%"],
    ["Peak-season cert incidents", "4 last year"],
  ],
  concerns: [
    "Vendors renew on their own schedule, or do not.",
    "Store edge links drop during weather events.",
    "Change freeze collides with renewal windows.",
    "One store system certificate has no owner of record.",
  ],
  constraints: [
    "A change freeze applies during peak season.",
    "Vendor-owned systems cannot be re-enrolled unilaterally.",
    "Store edge devices must keep serving during short outages.",
    "Commerce TLS is customer-visible; failures are immediate revenue loss.",
  ],
  openQuestions: [
    "Should store systems get their own issuing authority?",
    "How early must renewals be pulled forward before a freeze?",
    "What is the escalation path when a vendor misses a renewal?",
  ],
  requiredOutcomes: [
    "Renewal timing strategy compatible with a freeze.",
    "Vendor ownership and escalation model.",
    "Edge-tolerant status design.",
    "Deterministic evidence including peak-season conditions.",
  ],
  zones: [
    ["core", "Corporate data center", "Central PKI and corporate services."],
    ["cloud", "Cloud commerce", "Customer-facing commerce platform."],
    ["store", "Store network", "Distributed store systems."],
    ["dc", "Distribution centers", "Fulfilment systems."],
  ],
  pools: [
    ["commerce-tls", "Commerce TLS", "Customer-facing commerce identity."],
    ["store-device", "Store Device", "Point of sale and store system identity."],
    ["endpoint", "Endpoint", "Managed device identity."],
    ["workforce", "Workforce", "Staff authentication."],
    ["vpn", "VPN", "Store and distribution tunnels."],
    ["pki-service", "PKI Services", "Responders and CRL signers."],
  ],
  profiles: [
    ["p-commerce", "Commerce TLS", "commerce-tls", "ECDSA P-256", 90, "serverAuth", "dual", "external", "Customer-facing identity, short-lived."],
    ["p-store", "Store device identity", "store-device", "ECDSA P-256", 730, "clientAuth", "dual", "internal", "Store system identity, vendor-touched."],
    ["p-endpoint", "Endpoint Identity", "endpoint", "ECDSA P-256", 730, "clientAuth", "standard", "internal", "Managed device."],
    ["p-workforce", "Workforce Authentication", "workforce", "ECDSA P-256", 365, "clientAuth", "standard", "internal", "Staff credential."],
    ["p-vpn", "Store VPN", "vpn", "RSA 3072", 730, "clientAuth", "dual", "internal", "Store tunnel identity."],
    ["p-ocsp", "OCSP / CRL Signing", "pki-service", "ECDSA P-256", 90, "OCSPSigning", "governed", "internal", "PKI service credential."],
  ],
  inventory: [
    inv("hp-a1", "shop.harborpoint.com TLS", "commerce-tls", "cloud", "Digital Commerce", "Known", "Active", "Good", 62, "known", "Healthy customer-facing service."),
    inv("hp-a2", "Order service TLS", "commerce-tls", "cloud", "Commerce Platform", "Known", "Active", "Good", 55, "known", "Healthy internal commerce service."),
    inv("hp-a3", "Workforce Credential — Store Managers", "workforce", "store", "Identity Services", "Known", "Active", "Good", 230, "known", "Representative workforce credential."),
    inv("hp-a4", "Managed Laptop Identity — Corporate", "endpoint", "core", "End User Computing", "Known", "Active", "Good", 390, "known", "Representative endpoint identity."),
    inv("hp-a5", "Store 118 Site VPN", "vpn", "store", "Network Engineering", "Known", "Renewal Due", "Good", 15, "known", "Renewal window open: 15 days remaining, inside the freeze."),
    inv("hp-a6", "POS Fleet Identity — Region East", "store-device", "store", "Vendor: NorthPOS", "Known", "Active", "Good", 275, "known", "Vendor-managed; profile requires review before reissue."),
    inv("hp-a7", "Commerce OCSP responder", "pki-service", "core", "PKI Operations", "Known", "Active", "Good", 59, "known", "PKI service credential."),
    inv("hp-a8", "Returns kiosk service TLS", "store-device", "store", "—", "Unknown", "Active", "Good", 61, "discovered", "Discovered in scanning. No owner of record. Investigation required."),
    inv("hp-a9", "Legacy checkout TLS (replaced)", "commerce-tls", "cloud", "Commerce Platform", "Retired", "Expired", "Not Applicable", 0, "historical", "Historical record; already replaced."),
    inv("hp-a10", "Retired warehouse gateway TLS", "commerce-tls", "dc", "Fulfilment IT", "Retired", "Revoked", "Revoked", null, "historical", "Revoked and published; retained as evidence."),
  ],
  workloads: [
    { id: "w-commerce", name: "Commerce TLS endpoint", type: "tls", sourceZone: "cloud", targetZone: "core", requiresPools: ["commerce-tls"], requiredEku: "serverAuth", notes: "Customer-facing endpoint." },
    { id: "w-store", name: "Store system mutual TLS", type: "mtls", sourceZone: "store", targetZone: "core", requiresPools: ["store-device", "commerce-tls"], requiredEku: "clientAuth", scenarioRequirement: "offline-tolerant-status", notes: "Store edge identity during outages." },
    { id: "w-dc", name: "Distribution center service TLS", type: "tls", sourceZone: "dc", targetZone: "core", requiresPools: ["commerce-tls"], requiredEku: "serverAuth", notes: "Fulfilment service identity." },
    { id: "w-vpn", name: "Store tunnel identity", type: "mtls", sourceZone: "store", targetZone: "core", requiresPools: ["vpn"], requiredEku: "clientAuth", notes: "Store tunnel." },
    { id: "w-cloud", name: "Cloud commerce workload health", type: "cloud", sourceZone: "cloud", targetZone: "core", requiresPools: ["commerce-tls"], requiredEku: "serverAuth", notes: "Conceptual cloud workload." },
  ],
  policy: {
    requireOfflineRoot: true,
    requireHsmForRoot: true,
    requireHsmForIssuing: false,
    maxIssuingValidityDays: 3650,
    minIssuingCas: 2,
    prohibitedPaths: [["store", "cloud"]],
    requiredZones: ["core", "cloud", "store"],
    statusChallenge:
      "Store edges lose connectivity during peak; status must remain answerable at the edge without a live central call.",
  },
  changeEvent: {
    key: "HP-01",
    kind: "incident",
    title: "Peak-season store edge availability event",
    studentBrief:
      "A regional network event has removed the store network's path to central services during peak trading. Stores must keep serving. Re-evaluate status behaviour and workload results for store systems.",
    symptoms: [
      "Store workloads fail path availability or status observation.",
      "Prior evidence is marked stale for the current state.",
    ],
    effects: { disablePaths: [["store", "core"]], staleAllEvidence: true },
    instructorNotes: "Revenue impact reasoning matters; look for a defensible edge strategy.",
    validSolutionFamilies: [
      "Edge-local status distribution",
      "Scheduled CRL with freshness controls",
      "Stapling or cached validation with stated risk",
    ],
    invalidMoves: ["Assuming central reachability", "Turning off validation to keep trading"],
  },
  discoveryEvent: {
    key: "HP-02",
    kind: "discovery",
    title: "Unmanaged store system certificate discovered",
    studentBrief:
      "A discovery sweep has returned an unmanaged store system certificate, store-signage-31, with no owner of record and 19 days remaining. Treat it as a normal discovery record.",
    symptoms: ["A new discovered asset with Unknown owner appears in inventory."],
    effects: {
      addAssets: [
        inv("hp-hidden-1", "store-signage-31 (unmanaged store system)", "store-device", "store", "—", "Unknown", "Active", "Good", 19, "discovered", "Discovered during a later sweep. No owner of record."),
      ],
    },
    instructorNotes: "Absent from every student surface before activation.",
    validSolutionFamilies: ["Investigate vendor ownership, govern or retire with evidence"],
    invalidMoves: ["Revoking a trading system during peak with no impact analysis"],
  },
  answerGuidance: ["Edge-local or scheduled status distribution is the intended family for HP-01."],
});

/* ---------------------------------------------------------------- registry */

const REGISTRY: Record<string, ScenarioRecord> = {
  "cedar-valley-health@1.0.0": cedar,
  "northstar-cloud@1.0.0": northstar,
  "meridian-trust-bank@1.0.0": meridian,
  "sentinel-federal@1.0.0": sentinel,
  "ironvale-manufacturing@1.0.0": ironvale,
  "summit-state-university@1.0.0": summit,
  "harborpoint-retail@1.0.0": harborpoint,
};

export function getScenarioPublic(code: string, version: string): ScenarioPublic | null {
  return REGISTRY[`${code}@${version}`]?.public ?? null;
}

export function getScenarioPrivate(code: string, version: string): ScenarioPrivate | null {
  return REGISTRY[`${code}@${version}`]?.private ?? null;
}

export function releasedScenarioKeys(): string[] {
  return Object.keys(REGISTRY);
}
