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
  | "sequence"
  | "terminal"
  | "evidence-board"
  | "branching"
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

/** Extend this union to add new interaction patterns. */
export type Interaction =
  | ClassifyInteraction
  | RouteChoiceInteraction
  | SelectObjectInteraction
  | TerminalInteraction;


/* ------------------------------------------------------------------ */
/* Scenes and experiences                                              */
/* ------------------------------------------------------------------ */

export interface Scene {
  id: string;
  title: string;
  objective: string;
  environmentId: EnvironmentId;
  characterState: CharacterState;
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
