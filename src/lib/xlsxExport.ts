import type { GridData, Lesson } from "@/types";
import { cellIdToPosition } from "@/lib/cellUtils";

function substituteNamedRangesForExport(raw: string, namedRanges?: Record<string, string>): string {
  if (!namedRanges) return raw;
  let result = raw;
  for (const [name, range] of Object.entries(namedRanges)) {
    result = result.replace(new RegExp(`\\b${name}\\b`, "gi"), range);
  }
  return result;
}

/**
 * Builds a real, downloadable .xlsx practice file from a lesson's starting
 * grid, so a learner can keep practicing in the desktop Excel app too.
 *
 * We only ever feed this our own curriculum data (never arbitrary user
 * input), which keeps the known SheetJS advisories (prototype pollution via
 * crafted workbook input, ReDoS on crafted formula strings) out of scope —
 * we're always the ones writing the workbook, never parsing an untrusted one.
 */
export async function downloadLessonWorkbook(lesson: Lesson, grid: GridData): Promise<void> {
  const XLSX = await import("xlsx");
  const worksheet: Record<string, unknown> = {};
  let maxCol = 0;
  let maxRow = 0;

  for (const [cellId, cell] of Object.entries(grid)) {
    if (!cell.raw) continue;
    const pos = cellIdToPosition(cellId);
    maxCol = Math.max(maxCol, pos.col);
    maxRow = Math.max(maxRow, pos.row);
    const isFormula = cell.raw.startsWith("=");
    const raw = isFormula ? substituteNamedRangesForExport(cell.raw, lesson.namedRanges) : cell.raw;
    worksheet[cellId] = isFormula ? { f: raw.slice(1), t: "n" } : { v: raw, t: isNaN(Number(raw)) ? "s" : "n" };
  }

  const cols = Math.max(maxCol + 1, lesson.cols);
  const rows = Math.max(maxRow + 1, lesson.rows);
  worksheet["!ref"] = `A1:${XLSX.utils.encode_col(cols - 1)}${rows}`;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, lesson.title.slice(0, 28) || "Practice");
  XLSX.writeFile(workbook, `${lesson.id}-practice.xlsx`);
}
