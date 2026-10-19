import { colIndexToLetters, colLettersToIndex } from "@/lib/cellUtils";

// Matches an optional column-lock $, column letters, an optional row-lock $, and row digits.
// This runs directly on the raw formula text (which still contains any "$" the learner typed —
// the formula engine's tokenizer strips them only internally, never mutating storage), so it's
// the one place absolute vs. relative references actually matter in this app: not during
// evaluation (a value doesn't care), but during "copy this formula elsewhere."
const CELL_REF_PATTERN = /(\$?)([A-Z]{1,3})(\$?)(\d{1,7})/g;

/**
 * Shifts every relative cell reference in a formula by (rowOffset, colOffset),
 * leaving any $-locked row or column exactly where it is. Mirrors what Excel's
 * fill handle does when you drag a formula to adjacent cells.
 */
export function shiftFormulaRefs(raw: string, rowOffset: number, colOffset: number): string {
  if (!raw.trim().startsWith("=")) return raw;
  const body = raw.slice(1);
  const shiftedBody = body.replace(CELL_REF_PATTERN, (match, colLock: string, colLetters: string, rowLock: string, rowDigits: string) => {
    const newColLetters = colLock ? colLetters : colIndexToLetters(colLettersToIndex(colLetters) + colOffset);
    const newRowDigits = rowLock ? rowDigits : String(Math.max(1, parseInt(rowDigits, 10) + rowOffset));
    return `${colLock}${newColLetters}${rowLock}${newRowDigits}`;
  });
  return "=" + shiftedBody;
}
