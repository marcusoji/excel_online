/**
 * Automated regression check: plays through every lesson in the curriculum
 * using the SAME functions the app uses (formula engine, fill-down/sort/
 * AutoSum, and the step-check logic), and asserts every step's check
 * actually passes given the actions a learner (or the "Show me" demo)
 * would take. This is not a UI test — no browser involved — but it
 * exercises the real evaluation logic end to end for all 15 lessons.
 *
 * Run with: npx tsx scripts/verify-curriculum.ts
 */
import { LEVELS, LESSONS } from "../src/lib/curriculum";
import { evaluateCell } from "../src/lib/formulaEngine";
import { applyFillDown, applySort, applyAutoSum } from "../src/lib/gridActions";
import { cellIdToPosition, positionToCellId, isValidCellId } from "../src/lib/cellUtils";
import type { GridData, Lesson, LessonStep } from "../src/types";

let failures = 0;
let stepsChecked = 0;

function fail(message: string) {
  failures++;
  console.error(`  ❌ ${message}`);
}

function checkStepPasses(step: LessonStep, grid: GridData, selectedCell: string | null, namedRanges?: Record<string, string>): boolean {
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

/** Every cell id referenced anywhere in a lesson must fit inside its own cols x rows grid. */
function validateCellIsInBounds(lesson: Lesson, cellId: string, where: string) {
  if (!isValidCellId(cellId)) {
    fail(`${lesson.id}: "${cellId}" (${where}) is not a valid cell id`);
    return;
  }
  const pos = cellIdToPosition(cellId);
  if (pos.col < 0 || pos.col >= lesson.cols) fail(`${lesson.id}: ${cellId} (${where}) column is out of bounds (grid has ${lesson.cols} cols)`);
  if (pos.row < 0 || pos.row >= lesson.rows) fail(`${lesson.id}: ${cellId} (${where}) row is out of bounds (grid has ${lesson.rows} rows)`);
}

function collectReferencedCells(lesson: Lesson): { cellId: string; where: string }[] {
  const refs: { cellId: string; where: string }[] = [];
  for (const cellId of Object.keys(lesson.initialGrid)) refs.push({ cellId, where: "initialGrid" });
  for (const step of lesson.steps) {
    if (step.targetCell) refs.push({ cellId: step.targetCell, where: `step ${step.id} targetCell` });
    for (const c of step.highlightCells ?? []) refs.push({ cellId: c, where: `step ${step.id} highlightCells` });
    if (step.highlightRange) {
      refs.push({ cellId: step.highlightRange.start, where: `step ${step.id} highlightRange.start` });
      refs.push({ cellId: step.highlightRange.end, where: `step ${step.id} highlightRange.end` });
    }
    if (step.check.type !== "auto") refs.push({ cellId: step.check.cell, where: `step ${step.id} check.cell` });
    if (step.sortAction) {
      refs.push({ cellId: step.sortAction.range.start, where: `step ${step.id} sortAction.range.start` });
      refs.push({ cellId: step.sortAction.range.end, where: `step ${step.id} sortAction.range.end` });
    }
    if (step.autoSumAction) {
      refs.push({ cellId: step.autoSumAction.targetCell, where: `step ${step.id} autoSumAction.targetCell` });
      refs.push({ cellId: step.autoSumAction.range.start, where: `step ${step.id} autoSumAction.range.start` });
      refs.push({ cellId: step.autoSumAction.range.end, where: `step ${step.id} autoSumAction.range.end` });
    }
    for (const beat of step.demo ?? []) refs.push({ cellId: beat.cell, where: `step ${step.id} demo` });
  }
  if (lesson.validationLists) for (const cellId of Object.keys(lesson.validationLists)) refs.push({ cellId, where: "validationLists" });
  if (lesson.conditionalFormats) {
    for (const rule of lesson.conditionalFormats) {
      refs.push({ cellId: rule.range.start, where: "conditionalFormats.range.start" });
      refs.push({ cellId: rule.range.end, where: "conditionalFormats.range.end" });
    }
  }
  if (lesson.bandedRange) {
    refs.push({ cellId: lesson.bandedRange.start, where: "bandedRange.start" });
    refs.push({ cellId: lesson.bandedRange.end, where: "bandedRange.end" });
  }
  if (lesson.liveChart) for (const r of lesson.liveChart.rows) refs.push({ cellId: r.label, where: "liveChart" }, { cellId: r.value, where: "liveChart" });
  if (lesson.customPanel) {
    for (const panel of lesson.customPanel) {
      if (panel.kind === "pivot") for (const r of panel.rows) refs.push({ cellId: r.groupCell, where: "customPanel.pivot" }, { cellId: r.valueCell, where: "customPanel.pivot" });
      if (panel.kind === "sparkline") for (const c of panel.valueCells) refs.push({ cellId: c, where: "customPanel.sparkline" });
      if (panel.kind === "dynamic-array") for (const c of panel.sourceCells) refs.push({ cellId: c, where: "customPanel.dynamic-array" });
    }
  }
  return refs;
}

console.log(`Checking ${Object.keys(LESSONS).length} lessons across ${LEVELS.length} levels...\n`);

// 1) Every level must reference real, existing lessons, and vice versa.
const lessonIdsInLevels = new Set(LEVELS.flatMap((l) => l.lessonIds));
for (const lessonId of Object.keys(LESSONS)) {
  if (!lessonIdsInLevels.has(lessonId)) fail(`Lesson "${lessonId}" is defined but not listed in any level's lessonIds`);
}
for (const level of LEVELS) {
  for (const lessonId of level.lessonIds) {
    if (!LESSONS[lessonId]) fail(`Level "${level.id}" lists lesson "${lessonId}" which does not exist in LESSONS`);
  }
  if (level.lessonIds.length === 0) fail(`Level "${level.id}" has no lessons at all`);
}

// 2) Structural + gameplay check for every lesson.
for (const lesson of Object.values(LESSONS)) {
  console.log(`▶ ${lesson.id} — "${lesson.title}" (${lesson.steps.length} steps)`);

  // 2a. Every referenced cell must be inside the declared grid bounds.
  for (const { cellId, where } of collectReferencedCells(lesson)) {
    validateCellIsInBounds(lesson, cellId, where);
  }

  // 2a-bis. showFromStepIndex values must land on a real step, or the panel silently never (or always) shows.
  const maxStepIndex = lesson.steps.length - 1;
  if (lesson.liveChart && (lesson.liveChart.showFromStepIndex < 0 || lesson.liveChart.showFromStepIndex > maxStepIndex)) {
    fail(`${lesson.id}: liveChart.showFromStepIndex (${lesson.liveChart.showFromStepIndex}) is out of range (0..${maxStepIndex})`);
  }
  for (const panel of lesson.customPanel ?? []) {
    if (panel.showFromStepIndex < 0 || panel.showFromStepIndex > maxStepIndex) {
      fail(`${lesson.id}: customPanel(${panel.kind}).showFromStepIndex (${panel.showFromStepIndex}) is out of range (0..${maxStepIndex})`);
    }
  }

  // 2b. Play through the lesson exactly as the UI would drive it.
  let grid: GridData = structuredClone(lesson.initialGrid);
  let selectedCell: string | null = null;

  for (let i = 0; i < lesson.steps.length; i++) {
    const step = lesson.steps[i]!;
    stepsChecked++;

    if (step.demo && step.demo.length > 0) {
      for (const beat of step.demo) {
        selectedCell = beat.cell;
        if (beat.fill) grid = { ...grid, [beat.cell]: { raw: grid[beat.cell]?.raw ?? "", ...grid[beat.cell], fill: beat.fill } };
        if (beat.type !== undefined) grid = { ...grid, [beat.cell]: { ...grid[beat.cell], raw: beat.type } };
      }
    } else if (step.sortAction) {
      grid = applySort(grid, step.sortAction);
    } else if (step.autoSumAction) {
      grid = applyAutoSum(grid, step.autoSumAction);
    } else if (step.check.type === "auto") {
      // Nothing to do — a pure explain/reveal beat.
    } else if (step.highlightCells && step.highlightCells.length >= 2) {
      // A Fill-Down step: by curriculum convention, highlightCells is
      // [sourceCell, destinationCell] and the destination is exactly one
      // row below the source, in the same column.
      const [fromCell, toCell] = step.highlightCells;
      selectedCell = fromCell!;
      const before = grid;
      grid = applyFillDown(grid, fromCell!, lesson.rows);
      const expectedTarget = positionToCellId({ col: cellIdToPosition(fromCell!).col, row: cellIdToPosition(fromCell!).row + 1 });
      if (expectedTarget !== toCell) {
        fail(`${lesson.id} step ${step.id}: highlightCells suggests fill-down from ${fromCell} to ${toCell}, but the next row down is ${expectedTarget}`);
      }
      if (grid === before) {
        fail(`${lesson.id} step ${step.id}: Fill Down from ${fromCell} had no effect (is it a formula cell?)`);
      }
    } else {
      fail(`${lesson.id} step ${step.id}: no demo/sortAction/autoSumAction and check isn't "auto" — don't know how to simulate this step`);
    }

    const passed = checkStepPasses(step, grid, selectedCell, lesson.namedRanges);
    if (!passed) {
      const check = step.check;
      const actual = check.type !== "auto" ? evaluateCell(check.cell, grid, lesson.namedRanges) : undefined;
      fail(
        `${lesson.id} step "${step.id}" (index ${i}): check failed — ${JSON.stringify(check)}` +
          (actual !== undefined ? ` — actual value: ${JSON.stringify(actual)}` : "")
      );
    }
  }
}

// 3) Formula engine sanity: a handful of direct spot-checks independent of curriculum.
function assertEval(raw: string, expected: number | string, label: string) {
  const result = evaluateCell("Z1", { Z1: { raw } });
  const pass = typeof expected === "number" ? Math.abs(Number(result) - expected) < 0.001 : String(result) === expected;
  if (!pass) fail(`formula engine spot-check "${label}" failed: ${raw} => ${JSON.stringify(result)}, expected ${JSON.stringify(expected)}`);
  stepsChecked++;
}
console.log(`\n▶ formula engine spot-checks`);
assertEval("=SUM(1,2,3)", 6, "SUM literal list");
assertEval('=IF(1>0,"yes","no")', "yes", "IF true branch");
assertEval('=PROPER(TRIM("  bob dylan  "))', "Bob Dylan", "PROPER+TRIM");
assertEval("=ROUND(3.14159,2)", 3.14, "ROUND");
assertEval("=5/0", "#DIV/0!", "division by zero");
assertEval("=UNKNOWNFN(1)", "#NAME?", "unknown function");
assertEval("=LEFT(\"hello\",2)", "he", "LEFT");
assertEval("=RIGHT(\"hello\",2)", "lo", "RIGHT");
assertEval("=CONCAT(\"a\",\"b\",\"c\")", "abc", "CONCAT");

console.log(`\n${failures === 0 ? "✅" : "❌"} ${stepsChecked} checks run, ${failures} failure(s).`);
if (failures > 0) process.exit(1);
