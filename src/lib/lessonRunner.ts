import type { GridData, Lesson, LessonStep } from "@/types";
import { evaluateCell } from "@/lib/formulaEngine";
import { applyAutoSum, applyFillDown, applySort } from "@/lib/gridActions";
import { cellIdToPosition, positionToCellId } from "@/lib/cellUtils";

/**
 * The single source of truth for "did the learner get this step right". Shared
 * by the lesson player and the offline curriculum verifier so the two can never
 * disagree about what passing means.
 */
export function checkStepPasses(
  step: LessonStep,
  grid: GridData,
  selectedCell: string | null,
  namedRanges?: Record<string, string>
): boolean {
  const check = step.check;
  switch (check.type) {
    case "auto":
      return true;
    case "cell-selected":
      return selectedCell === check.cell;
    case "non-empty":
      return (grid[check.cell]?.raw ?? "").trim() !== "";
    case "value-equals": {
      const raw = (grid[check.cell]?.raw ?? "").trim();
      if (typeof check.expected === "number") return Number(raw) === check.expected && raw !== "";
      return check.caseSensitive ? raw === check.expected : raw.toLowerCase() === check.expected.toLowerCase();
    }
    case "formula-result-equals": {
      const result = evaluateCell(check.cell, grid, namedRanges);
      if (typeof result !== "number") return false;
      const tolerance = check.tolerance ?? 0.01;
      return Math.abs(result - check.expected) <= tolerance;
    }
    case "formula-text-equals": {
      const result = evaluateCell(check.cell, grid, namedRanges);
      return String(result).trim().toLowerCase() === check.expected.trim().toLowerCase();
    }
    case "formula-contains": {
      const raw = (grid[check.cell]?.raw ?? "").toUpperCase().replace(/\s+/g, "");
      return check.mustInclude.every((s) => raw.includes(s.toUpperCase().replace(/\s+/g, "")));
    }
    case "fill-equals":
      return (grid[check.cell]?.fill ?? "").toLowerCase() === check.expected.toLowerCase();
  }
}

/**
 * Replays the deterministic effect of a single step's demo (or the built-in
 * Sort / AutoSum / Fill-Down actions) onto a grid. Returns a new grid plus the
 * cell the step would leave selected, or null if the step has no deterministic
 * effect (a pure explain beat).
 */
function applyStepEffect(
  grid: GridData,
  step: LessonStep,
  rows: number
): { grid: GridData; selectedCell: string | null } | null {
  if (step.demo && step.demo.length > 0) {
    let next = grid;
    let selectedCell: string | null = null;
    for (const beat of step.demo) {
      selectedCell = beat.cell;
      if (beat.fill) next = { ...next, [beat.cell]: { raw: next[beat.cell]?.raw ?? "", ...next[beat.cell], fill: beat.fill } };
      if (beat.type !== undefined) next = { ...next, [beat.cell]: { ...next[beat.cell], raw: beat.type } };
    }
    return { grid: next, selectedCell };
  }
  if (step.sortAction) return { grid: applySort(grid, step.sortAction), selectedCell: null };
  if (step.autoSumAction) return { grid: applyAutoSum(grid, step.autoSumAction), selectedCell: null };
  if (step.check.type === "auto") return { grid, selectedCell: null };
  if (step.highlightCells && step.highlightCells.length >= 2) {
    const [fromCell] = step.highlightCells;
    return { grid: applyFillDown(grid, fromCell!, rows), selectedCell: fromCell! };
  }
  return null;
}

/**
 * Reconstructs the sheet as it would stand just before `stepIndex`, by
 * replaying every earlier step's deterministic effect. Used to resume a
 * part-finished lesson: the learner lands on the right step with the inputs
 * that step depends on already in place.
 */
export function rebuildGridUpTo(lesson: Lesson, stepIndex: number): GridData {
  let grid: GridData = structuredClone(lesson.initialGrid);
  for (let i = 0; i < stepIndex && i < lesson.steps.length; i++) {
    const effect = applyStepEffect(grid, lesson.steps[i]!, lesson.rows);
    if (effect) grid = effect.grid;
  }
  return grid;
}

/** The cell a step would leave selected when its deterministic effect runs. */
export function selectedCellForStep(lesson: Lesson, stepIndex: number): string | null {
  const step = lesson.steps[stepIndex];
  if (!step) return null;
  const effect = applyStepEffect(structuredClone(lesson.initialGrid), step, lesson.rows);
  return effect?.selectedCell ?? null;
}
