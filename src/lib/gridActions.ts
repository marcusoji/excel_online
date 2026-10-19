import type { AutoSumAction, GridData, SortAction } from "@/types";
import { cellIdToPosition, colLettersToIndex, positionToCellId } from "@/lib/cellUtils";
import { shiftFormulaRefs } from "@/lib/formulaShift";

/**
 * Pure grid-transform functions behind the Fill Down / Sort / AutoSum
 * buttons. Kept separate from LessonPlayer (which owns React state and
 * macro logging) so the exact same logic can be exercised by an automated
 * "play through every lesson" check without needing a browser.
 */

export function applyFillDown(grid: GridData, fromCell: string, maxRows: number): GridData {
  const raw = grid[fromCell]?.raw ?? "";
  if (!raw.startsWith("=")) return grid;
  const pos = cellIdToPosition(fromCell);
  const targetRow = pos.row + 1;
  if (targetRow >= maxRows) return grid;
  const targetId = positionToCellId({ col: pos.col, row: targetRow });
  const shifted = shiftFormulaRefs(raw, 1, 0);
  return { ...grid, [targetId]: { ...grid[targetId], raw: shifted } };
}

export function applySort(grid: GridData, action: SortAction): GridData {
  const { range, sortColumn, order } = action;
  const startPos = cellIdToPosition(range.start);
  const endPos = cellIdToPosition(range.end);
  const numRows = endPos.row - startPos.row + 1;
  const cols: number[] = [];
  for (let c = Math.min(startPos.col, endPos.col); c <= Math.max(startPos.col, endPos.col); c++) cols.push(c);
  const sortColAbsIndex = colLettersToIndex(sortColumn);
  const sortColRelIndex = cols.indexOf(sortColAbsIndex);

  const rows = Array.from({ length: numRows }, (_, r) =>
    cols.map((c) => grid[positionToCellId({ col: c, row: startPos.row + r })] ?? { raw: "" })
  );
  const sorted = [...rows].sort((a, b) => {
    const av = Number(a[sortColRelIndex]?.raw ?? 0) || 0;
    const bv = Number(b[sortColRelIndex]?.raw ?? 0) || 0;
    return order === "desc" ? bv - av : av - bv;
  });

  const next = { ...grid };
  sorted.forEach((rowData, r) => {
    cols.forEach((c, ci) => {
      const cellId = positionToCellId({ col: c, row: startPos.row + r });
      next[cellId] = rowData[ci] ?? { raw: "" };
    });
  });
  return next;
}

export function applyAutoSum(grid: GridData, action: AutoSumAction): GridData {
  const formula = `=SUM(${action.range.start}:${action.range.end})`;
  return { ...grid, [action.targetCell]: { ...grid[action.targetCell], raw: formula } };
}
