/**
 * CVI Demo Lab — content model.
 *
 * Content/configuration is fully separated from presentation and from
 * interaction state. Adding a new program, week or experience means adding
 * data here (or in a content module), never a new page implementation.
 */

export type ProgramId = "cyberfoundations" | "pki";

export type ExperienceType =
  | "live-mission"
  | "mini-demo"
  | "interactive-scenario"
  | "replay";

export type ExperienceStatus = "available" | "in-development" | "planned";

/** Character motion states. Assets may be attached later per state. */
export type CharacterState =
  | "ivy-idle"
  | "ivy-enter"
  | "ivy-walk-left"
  | "ivy-walk-right"
  | "ivy-working"
  | "ivy-type"
  | "ivy-read-screen"
  | "ivy-point"
  | "ivy-whiteboard"
  | "ivy-thinking"
  | "ivy-react"
  | "ivy-nod"
  | "ivy-briefing";

/**
 * Per-state character media.
 *
 * Asset convention (see src/assets/characters/ivy/README.md):
 *   src/assets/characters/ivy/ivy-idle.webp        static / reduced-motion
 *   src/assets/characters/ivy/ivy-enter.webm       transparent motion
 *   src/assets/characters/ivy/ivy-enter.mp4        fallback motion
 *
 * A state with no media falls back to the neutral placeholder figure. The
 * player never depends on media being present.
 */
export type CharacterMediaType =
  | "video/webm"
  | "video/mp4"
  | "image/webp"
  | "image/png";

export interface CharacterAsset {
  /** Ordered motion sources; first playable one wins (webm → mp4). */
  motionSources?: Array<{ src: string; type: CharacterMediaType }>;
  /** Animated WebP, used when no video source is available. */
  animatedSrc?: string;
  /** Always used for reduced motion, poster, and load fallback. */
  staticSrc?: string;
  alt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  accentToken: "signal" | "amber" | "violet" | "evidence";
  /** Optional per-state assets. Missing states fall back to a neutral figure. */
  assets?: Partial<Record<CharacterState, CharacterAsset>>;
  /** Square headshot used by the dialogue portrait variant. */
  portraitSrc?: string;
  /** Documented production asset slots that are not yet filled. */
  plannedAssets?: Partial<Record<CharacterState, string[]>>;
}


export type EnvironmentId =
  | "grid-neighborhood"
  | "ivy-workstation"
  | "troubleshooting-room"
  | "cloud-heights-campus"
  | "secure-lobby"
  | "noc"
  | "remote-access-workstation"
  | "incident-response-room"
  | "briefing-room"
  | "pki-operations-center"
  | "pki-ca-workspace"
  | "pki-hsm-room"
  | "pki-trust-architecture-room"
  | "pki-incident-room"
  | "pki-briefing-room";

export interface Environment {
  id: EnvironmentId;
  name: string;
  /** Short description used for screen readers and instructor notes. */
  description: string;
  /** Surface where interactive UI is mounted inside the environment. */
  surface: "monitor" | "wall-display" | "whiteboard" | "evidence-board" | "terminal";
  /** Optional background art. Absent = generated CSS environment. */
  backgroundSrc?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  /** Character state to hold while this line is shown. */
  characterState?: CharacterState;
}

export interface EvidenceItem {
  id: string;
  label: string;
  value: string;
  /** Neutral by default; status is always paired with a text label. */
  status?: "healthy" | "degraded" | "no-response" | "unknown";
  note?: string;
  /**
   * Declarative: the item stays out of the evidence panel until the learner's
   * own actions reveal it (or the instructor reveals everything). Replaces the
   * former hard-coded id check in SceneRenderer.
   */
  hiddenUntilRevealed?: boolean;
}


/* ------------------------------------------------------------------ */
/* Interaction engine                                                  */
/* ------------------------------------------------------------------ */

export type InteractionKind =
  | "classify"
  | "route-choice"
  | "select-object"
  | "terminal"
  | "tool-terminal"
  | "sequence"
  | "evidence-select"
  | "investigation"
  | "three-state"
  | "evidence-sort"
  | "briefing";


export interface ClassifyOption {
  id: string;
  label: string;
  description?: string;
}

export interface ClassifyItem {
  id: string;
  label: string;
  detail?: string;
  correctOptionId: string;
  /** Response shown for each option — never a bare "wrong". */
  responses: Record<
    string,
    {
      headline: string;
      body: string;
      revealsEvidenceIds?: string[];
    }
  >;
}

export interface ClassifyInteraction {
  id: string;
  kind: "classify";
  prompt: string;
  /** Persistent instruction kept on screen. */
  instruction: string;
  options: ClassifyOption[];
  items: ClassifyItem[];
  /** Framing text, e.g. "For this /24 example…". */
  scopeNote?: string;
}

/* ------------------------------------------------------------------ */
/* route-choice: the environment itself is the interaction surface.    */
/* ------------------------------------------------------------------ */

export interface HotspotAnchor {
  /** Percentage coordinates on the environment stage (0–100). */
  x: number;
  y: number;
  /** Optional re-framed coordinates for the mobile crop of the stage. */
  mobileX?: number;
  mobileY?: number;
}

export interface EnvironmentHotspot extends HotspotAnchor {
  id: string;
  /** origin = where the character starts; gateway = the way out of the block. */
  kind: "origin" | "location" | "gateway";
  /** Plain-language place name, e.g. "Archive Office". */
  label: string;
  /** Address plaque text mounted on the place, e.g. "10.20.5.20". */
  address?: string;
  /** Extra signage, e.g. "10.20.7 District →". */
  signage?: string[];
  detail?: string;
}

export interface RouteResponse {
  headline: string;
  body: string;
  revealsEvidenceIds?: string[];
  /** Character state to hold after this response. */
  characterState?: CharacterState;
}

export interface RouteRequest {
  id: string;
  /** Destination address on Ivy's work order. */
  address: string;
  /** How Ivy asks for it, in-world. */
  workOrder: string;
  /** Whether this destination physically exists inside the neighborhood. */
  presentInEnvironment: boolean;
  correctHotspotId: string;
  correct: RouteResponse;
  /** Keyed by chosen hotspot id; "*" is the fallback. */
  incorrect: Record<string, RouteResponse>;
}

export interface RouteChoiceInteraction {
  id: string;
  kind: "route-choice";
  prompt: string;
  instruction: string;
  scopeNote?: string;
  /** Neighborhood directory sign rendered inside the scene. */
  sign: { title: string; lines: string[] };
  hotspots: EnvironmentHotspot[];
  requests: RouteRequest[];
  completion: { headline: string; body: string };
  /** Character positions on the stage, per state. */
  characterAnchors?: Partial<Record<CharacterState, HotspotAnchor>>;
}

export interface SelectObjectInteraction {

  id: string;
  kind: "select-object";
  prompt: string;
  instruction: string;
  objects: Array<{ id: string; label: string; detail?: string; result: string }>;
}

export interface TerminalInteraction {
  id: string;
  kind: "terminal";
  prompt: string;
  instruction: string;
  commands: Array<{ id: string; command: string; output: string[] }>;
}

/* ------------------------------------------------------------------ */
/* tool-terminal: map a question to a tool, run it, read the evidence. */
/* ------------------------------------------------------------------ */

export interface ToolDefinition {
  id: string;
  /** Command as typed, e.g. "ip addr". */
  command: string;
  /** Short human label shown on the utility strip. */
  label: string;
  /** What the tool is actually for. */
  purpose: string;
}

export interface ToolRun {
  /** Full command line echoed into the simulated terminal. */
  command: string;
  output: string[];
  /** What this run does — or does not — establish. Never says "wrong". */
  verdict: string;
}

export interface ToolTicket {
  id: string;
  /** Ticket reference shown on the ticket monitor, e.g. "CF-1042". */
  ref: string;
  /** The actual question, shown before any tool is chosen. */
  question: string;
  /** In-world ticket body. */
  body: string;
  correctToolId: string;
  /** Authored output for every tool, correct or not. */
  runs: Record<string, ToolRun>;
  /** Follow-up: what did the result tell us? */
  followUp: {
    prompt: string;
    options: Array<{ id: string; label: string; correct: boolean; response: string }>;
  };
  /** Row added to the QUESTION → TOOL → EVIDENCE summary. */
  summaryRow: { question: string; tool: string; evidence: string };
}

export interface ToolTerminalInteraction {
  id: string;
  kind: "tool-terminal";
  prompt: string;
  instruction: string;
  tools: ToolDefinition[];
  tickets: ToolTicket[];
  completion: { headline: string; body: string };
}

/* ------------------------------------------------------------------ */
/* sequence: whiteboard ordering                                       */
/* ------------------------------------------------------------------ */

export interface SequenceInteraction {
  id: string;
  kind: "sequence";
  prompt: string;
  instruction: string;
  boardTitle: string;
  steps: Array<{ id: string; label: string; detail: string }>;
  /** Ordered list of step ids. */
  correctOrder: string[];
  /**
   * Ivy's challenge for the first questionable transition, keyed by the step
   * id placed earlier than it should be. "*" is the fallback.
   */
  challenges: Record<string, string>;
  completion: { headline: string; body: string };
  /** In-world message that arrives once the ladder is correct. */
  transitionMessage?: { from: string; subject: string; body: string };
}

/* ------------------------------------------------------------------ */
/* evidence-select: what has already been proven?                      */
/* ------------------------------------------------------------------ */

export interface EvidenceSelectInteraction {
  id: string;
  kind: "evidence-select";
  prompt: string;
  instruction: string;
  /** Terminal proof shown above the interaction. */
  terminal?: { lines: string[] };
  /** Access chain illuminated as supported evidence is selected. */
  chain: Array<{ id: string; label: string }>;
  options: Array<{
    id: string;
    label: string;
    supported: boolean;
    /** Chain node this evidence illuminates. */
    chainId?: string;
    response: string;
  }>;
  completion: { headline: string; body: string };
}

/* ------------------------------------------------------------------ */
/* investigation: stepped reasoning with a live topology               */
/* ------------------------------------------------------------------ */

export type TopologyStatus =
  | "unknown"
  | "healthy"
  | "no-response"
  | "degraded";

export interface TopologyNode {
  id: string;
  label: string;
  /** Status before any evidence is gathered. */
  initialStatus: TopologyStatus;
  /** Reading shown next to the node before evidence changes it. */
  initialReading: string;
}

export interface InvestigationChoiceStep {
  id: string;
  kind: "choice";
  prompt: string;
  instruction?: string;
  options: Array<{
    id: string;
    label: string;
    correct: boolean;
    /** Flagged in the UI as an unproven assumption rather than an error. */
    assumption?: boolean;
    response: string;
  }>;
}

export interface InvestigationDiagnosticStep {
  id: string;
  kind: "diagnostic";
  prompt: string;
  instruction?: string;
  commands: Array<{
    id: string;
    command: string;
    output: string[];
    proves: string;
    topologyUpdate?: { nodeId: string; status: TopologyStatus; reading: string };
  }>;
}

export type InvestigationStep = InvestigationChoiceStep | InvestigationDiagnosticStep;

export interface InvestigationInteraction {
  id: string;
  kind: "investigation";
  prompt: string;
  instruction: string;
  /** The event that opens the scene. */
  opening: { command: string; output: string[]; caption: string };
  topology: TopologyNode[];
  steps: InvestigationStep[];
  completion: { headline: string; body: string };
}

/* ------------------------------------------------------------------ */
/* three-state: two diagnostic dimensions, three states each           */
/* ------------------------------------------------------------------ */

export interface ThreeStateInteraction {
  id: string;
  kind: "three-state";
  prompt: string;
  instruction: string;
  monitorTitle: string;
  dimensions: Array<{ id: string; label: string; question: string }>;
  states: Array<{ id: string; label: string; glyph: string }>;
  scenarios: Array<{
    id: string;
    /** The literal terminal message. */
    output: string;
    /** dimensionId -> stateId */
    correct: Record<string, string>;
    /** dimensionId -> explanation shown after a wrong classification. */
    hints: Record<string, string>;
    /** Shown once both dimensions are right. */
    explanation: string;
  }>;
  completion: { headline: string; body: string; shell: string[] };
}

/* ------------------------------------------------------------------ */
/* evidence-sort: incident board columns                               */
/* ------------------------------------------------------------------ */

export interface EvidenceSortInteraction {
  id: string;
  kind: "evidence-sort";
  prompt: string;
  instruction: string;
  /** The report that opened the incident. */
  report?: { from: string; text: string };
  buckets: Array<{ id: string; label: string; description: string }>;
  items: Array<{
    id: string;
    label: string;
    correctBucketId: string;
    /** Ivy's question when placed in the wrong bucket. */
    challenge?: Record<string, string>;
    explanation: string;
  }>;
  completion: { headline: string; body: string };
}

/* ------------------------------------------------------------------ */
/* briefing: assemble a defensible statement from placed evidence      */
/* ------------------------------------------------------------------ */

export interface BriefingInteraction {
  id: string;
  kind: "briefing";
  prompt: string;
  instruction: string;
  sections: Array<{ id: string; label: string; description: string }>;
  items: Array<{
    id: string;
    label: string;
    correctSectionId: string;
    /** Sentence fragment this item contributes to the assembled statement. */
    statementFragment: string;
    explanation: string;
  }>;
  confirm: { prompt: string; action: string };
  completion: { headline: string; body: string; finalLine: string; banner: string };
}

/** Extend this union to add new interaction patterns. */
export type Interaction =
  | ClassifyInteraction
  | RouteChoiceInteraction
  | SelectObjectInteraction
  | TerminalInteraction
  | ToolTerminalInteraction
  | SequenceInteraction
  | EvidenceSelectInteraction
  | InvestigationInteraction
  | ThreeStateInteraction
  | EvidenceSortInteraction
  | BriefingInteraction;



/* ------------------------------------------------------------------ */
/* Scenes and experiences                                              */
/* ------------------------------------------------------------------ */

export interface Scene {
  id: string;
  title: string;
  objective: string;
  environmentId: EnvironmentId;
  characterState: CharacterState;
  /**
   * Scene-specific staging for the in-scene figure. Optional: when absent the
   * environment's surface default is used. Keeps coordinates in content, not
   * in CharacterLayer.
   */
  characterStaging?: CharacterStaging;
  /**
   * Interaction owns the room surface directly (whiteboard wall, incident
   * board, briefing display) — the generic panel chrome is dropped.
   */
  bareSurface?: boolean;

  intro: DialogueLine[];
  interaction?: Interaction;
  evidence?: EvidenceItem[];
  /** Shown after the completion criteria are met. */
  successSummary?: string;
  /** Shown when a learner asks to work through the scene again. */
  retryPrompt?: string;
  /** Explanation revealed on demand (student) or by the instructor. */
  explanation?: string;
  instructorNotes?: string[];
  continueLabel?: string;
}

export interface Experience {
  id: string;
  slug: string;
  programId: ProgramId;
  moduleId: string;
  weekId: string;
  type: ExperienceType;
  status: ExperienceStatus;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  estimatedMinutes: number;
  characterIds: string[];
  environmentIds: EnvironmentId[];
  scenes: Scene[];
  replayAvailable: boolean;
  instructorNotes?: string[];
  /** Route to launch the experience. */
  route: string;
}

export interface Week {
  id: string;
  label: string;
  title: string;
  summary: string;
  experienceIds: string[];
  status: ExperienceStatus;
}

export interface ProgramModule {
  id: string;
  label: string;
  title: string;
  summary: string;
  weeks: Week[];
}

export interface Program {
  id: ProgramId;
  name: string;
  tagline: string;
  description: string;
  /** Scope class that carries the program's visual identity. */
  themeClass: string;
  route: string;
  modules: ProgramModule[];
  environments: Environment[];
  characters: Character[];
}
