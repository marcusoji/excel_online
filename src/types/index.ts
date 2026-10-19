// ---------------------------------------------------------------------------
// Shared types for Excel Magic Academy
// ---------------------------------------------------------------------------

/**
 * Visual "density" the learner has chosen. Both modes now serve the same
 * adult, professional curriculum — they only change how much chrome the
 * workspace shows, not how serious the material is.
 *
 *   focus   → a calm, roomy reading surface: bigger cells, softer palette
 *   analyst → a denser, keyboard-first grid: tighter cells, more visible at once
 */
export type AppMode = "focus" | "analyst";
export type ThemePreference = "light" | "dark" | "system";

/** A single spreadsheet cell as the learner has left it. */
export interface CellData {
  /** Raw input exactly as typed: "12", "=SUM(A1:A3)", "Toys", etc. */
  raw: string;
  /** Optional fill color (hex) applied by the learner or a lesson step. */
  fill?: string;
  bold?: boolean;
}

/** Sparse grid keyed by cell id, e.g. "A1". */
export type GridData = Record<string, CellData>;

export interface CellPosition {
  col: number; // 0-indexed
  row: number; // 0-indexed
}

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

export type LevelId = "level-0" | "level-1" | "level-2" | "level-3" | "level-4";

export interface DemoAction {
  /** Which cell the animated "Show me" cursor should visit. */
  cell: string;
  /** What to type once the cursor lands (omit for a pure "select" beat). */
  type?: string;
  /** Optional fill color to apply as part of the demo. */
  fill?: string;
  /** Pause after this beat, in ms (defaults to 700). */
  pause?: number;
}

export type StepCheck =
  | { type: "auto" }
  | { type: "cell-selected"; cell: string }
  | { type: "non-empty"; cell: string }
  | { type: "value-equals"; cell: string; expected: string | number; caseSensitive?: boolean }
  | { type: "formula-result-equals"; cell: string; expected: number; tolerance?: number }
  | { type: "formula-text-equals"; cell: string; expected: string }
  | { type: "formula-contains"; cell: string; mustInclude: string[] }
  | { type: "fill-equals"; cell: string; expected: string };

export interface SortAction {
  label?: string;
  range: { start: string; end: string };
  sortColumn: string; // column letter within the range, e.g. "B"
  order: "asc" | "desc";
}

export interface AutoSumAction {
  label?: string;
  targetCell: string;
  range: { start: string; end: string };
}

export interface LiveChartConfig {
  title: string;
  rows: { label: string; value: string }[]; // cell ids: one label cell + one value cell per bar
  showFromStepIndex: number;
  color?: string;
}

export interface ConditionalFormatRule {
  range: { start: string; end: string };
  operator: ">=" | ">" | "<=" | "<" | "=";
  threshold: number;
  color: string;
}

export interface LessonStep {
  id: string;
  /** Short instruction shown in the side panel. Keep it one or two sentences. */
  instruction: string;
  /**
   * The specific, checkable skill this step builds, shown as a caption above
   * the instruction. One short noun phrase, e.g. "Aggregate with SUM".
   */
  objective?: string;
  /** Optional extra hint revealed if the learner asks for help. */
  hint?: string;
  /** Cells to highlight/pulse while this step is active. */
  highlightCells?: string[];
  /** A rectangular range to highlight instead of/alongside individual cells. */
  highlightRange?: { start: string; end: string };
  /** The single cell the learner is expected to edit this step, if any. */
  targetCell?: string;
  /**
   * How we validate the step is complete. "auto" steps complete as soon as
   * they're shown (used for pure read/explain beats).
   */
  check: StepCheck;
  /** Sequence of beats the "Show me" button will animate through. */
  demo?: DemoAction[];
  /** Renders a "Sort" button that reorders whole rows in a range by one column. */
  sortAction?: SortAction;
  /** Renders an "AutoSum" button that inserts =SUM(range) into a target cell. */
  autoSumAction?: AutoSumAction;
}

export type CustomPanelConfig =
  | { kind: "pivot"; showFromStepIndex: number; title: string; groupLabel: string; valueLabel: string; rows: { groupCell: string; valueCell: string }[] }
  | { kind: "sparkline"; showFromStepIndex: number; title: string; valueCells: string[] }
  | { kind: "dynamic-array"; showFromStepIndex: number; title: string; sourceCells: string[]; order: "asc" | "desc" };

export interface Lesson {
  id: string;
  levelId: LevelId;
  title: string;
  /** One friendly sentence describing the mission. */
  tagline: string;
  /**
   * The professional scenario this lesson simulates — the "why this matters
   * at work" framing shown on the lesson briefing screen.
   */
  brief: string;
  /** The concrete, professional skills this lesson teaches, as short bullets. */
  objectives: string[];
  /** Emoji used as the lesson's badge icon — keeps the app asset-free. */
  icon: string;
  xp: number;
  estMinutes: number;
  /** Starting contents of the grid when the lesson loads. */
  initialGrid: GridData;
  /** Number of visible columns/rows for this lesson's grid. */
  cols: number;
  rows: number;
  steps: LessonStep[];
  /** Shown on the lesson-complete screen. */
  celebration: string;
  /** Named-range aliases available to formulas in this lesson, e.g. { Sales: "C2:C6" }. */
  namedRanges?: Record<string, string>;
  /** A live bar chart rendered once the learner reaches a given step. */
  liveChart?: LiveChartConfig;
  /** Highlights cells whose computed value crosses a threshold. */
  conditionalFormats?: ConditionalFormatRule[];
  /** Cells restricted to a dropdown of allowed values (Data Validation). */
  validationLists?: Record<string, string[]>;
  /** Applies alternating row banding across a range (an "Excel Table" look). */
  bandedRange?: { start: string; end: string };
  /** When true, every commit/fill/fill-down during this lesson is logged and replayed as pseudo-VBA on completion. */
  isMacroLesson?: boolean;
  /** An optional Pivot/Sparkline/Dynamic-array preview panel, computed live from the grid. */
  customPanel?: CustomPanelConfig[];
}

export interface Level {
  id: LevelId;
  order: number;
  title: string;
  /** Who this level is for professionally, e.g. "New to spreadsheets". */
  audience: string;
  /** Short label for the tooling tier this level unlocks, e.g. "Foundations". */
  tier: string;
  description: string;
  color: "owl" | "sky" | "coral" | "gold";
  lessonIds: string[];
}

// ---------------------------------------------------------------------------
// Progress (persisted in IndexedDB)
// ---------------------------------------------------------------------------

export interface LessonProgress {
  lessonId: string; // primary key
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestStepIndex: number;
  completedAt?: number;
  lastVisitedAt: number;
}

export interface BadgeRecord {
  badgeId: string; // primary key
  earnedAt: number;
}

export interface Preferences {
  id: "singleton";
  mode: AppMode;
  theme: ThemePreference;
  reducedMotion: boolean;
  soundOn: boolean;
  hasOnboarded: boolean;
  displayName: string;
  streakDays: number;
  lastActiveDay?: string; // YYYY-MM-DD
}

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ProgressSummary {
  totalXp: number;
  streakDays: number;
  lastActiveDay?: string; // YYYY-MM-DD
  completedLessonIds: string[];
}
