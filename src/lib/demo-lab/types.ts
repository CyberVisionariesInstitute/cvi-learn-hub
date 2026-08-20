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

/** Motion assets are optional; a static fallback is always required. */
export interface CharacterAsset {
  /** webm/mp4/webp animated source — optional. */
  motionSrc?: string;
  motionType?: "video/webm" | "video/mp4" | "image/webp";
  /** Always present: used for reduced motion and as a load fallback. */
  staticSrc?: string;
  alt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  accentToken: "signal" | "amber" | "violet" | "evidence";
  /** Optional per-state assets. Missing states fall back to a stylized marker. */
  assets?: Partial<Record<CharacterState, CharacterAsset>>;
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
}

/* ------------------------------------------------------------------ */
/* Interaction engine                                                  */
/* ------------------------------------------------------------------ */

export type InteractionKind =
  | "classify"
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
