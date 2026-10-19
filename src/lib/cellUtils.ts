import type { CellPosition } from "@/types";

const CELL_ID = /^([A-Z]+)(\d+)$/;

/** "A" -> 0, "B" -> 1, ... "Z" -> 25, "AA" -> 26 */
export function colLettersToIndex(letters: string): number {
  let index = 0;
  for (let i = 0; i < letters.length; i++) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }
  return index - 1;
}

/** 0 -> "A", 1 -> "B", 25 -> "Z", 26 -> "AA" */
export function colIndexToLetters(index: number): string {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

export function cellIdToPosition(cellId: string): CellPosition {
  const match = CELL_ID.exec(cellId.toUpperCase());
  if (!match) throw new Error(`Invalid cell id: ${cellId}`);
  const [, letters, digits] = match;
  if (!letters || !digits) throw new Error(`Invalid cell id: ${cellId}`);
  return { col: colLettersToIndex(letters), row: parseInt(digits, 10) - 1 };
}

export function positionToCellId(pos: CellPosition): string {
  return `${colIndexToLetters(pos.col)}${pos.row + 1}`;
}

export function isValidCellId(value: string): boolean {
  return CELL_ID.test(value.toUpperCase());
}

/** Expand "A1:A3" into ["A1", "A2", "A3"], reading left-to-right then top-to-bottom. */
export function expandRange(start: string, end: string): string[] {
  const a = cellIdToPosition(start);
  const b = cellIdToPosition(end);
  const minCol = Math.min(a.col, b.col);
  const maxCol = Math.max(a.col, b.col);
  const minRow = Math.min(a.row, b.row);
  const maxRow = Math.max(a.row, b.row);
  const cells: string[] = [];
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      cells.push(positionToCellId({ col, row }));
    }
  }
  return cells;
}

export function buildColumnLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => colIndexToLetters(i));
}
