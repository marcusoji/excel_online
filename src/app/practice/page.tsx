"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InteractiveSpreadsheet } from "@/components/InteractiveSpreadsheet";
import { usePreferences } from "@/hooks/useProgress";
import { evaluateCell, formatCellValue } from "@/lib/formulaEngine";
import { FORMULA_LIBRARY } from "@/lib/formulaLibrary";
import { cellIdToPosition, positionToCellId, colIndexToLetters } from "@/lib/cellUtils";
import { applyFillDown } from "@/lib/gridActions";
import type { GridData } from "@/types";

const COLS = 8;
const ROWS = 20;

/**
 * A free-form sandbox. Unlike a lesson, nothing here is checked — it's the
 * place to try a formula against your own numbers, the way you would in a
 * scratch sheet before pasting it into a real workbook.
 */
export default function PracticePage() {
  const { preferences } = usePreferences();
  const [grid, setGrid] = useState<GridData>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const selectedValue = useMemo(() => {
    if (!selectedCell) return null;
    return formatCellValue(evaluateCell(selectedCell, grid));
  }, [selectedCell, grid]);

  const filledCells = useMemo(() => Object.values(grid).filter((c) => c.raw.trim() !== "").length, [grid]);

  const selectedPos = selectedCell ? cellIdToPosition(selectedCell) : null;
  const selectedRange = selectedPos
    ? `${colIndexToLetters(selectedPos.col)}2:${colIndexToLetters(selectedPos.col)}6`
    : "A2:A6";

  function handleCommit(cellId: string, raw: string) {
    setGrid((g) => ({ ...g, [cellId]: { ...g[cellId], raw } }));
  }

  function handleFillDown(fromCell: string) {
    setGrid((g) => applyFillDown(g, fromCell, ROWS));
  }

  function clearAll() {
    setGrid({});
    setSelectedCell(null);
  }

  function loadSample() {
    const sample: GridData = {};
    const rows: [string, string][] = [
      ["Region", "Revenue"],
      ["North", "1200"],
      ["South", "950"],
      ["East", "1400"],
      ["West", "1100"],
    ];
    rows.forEach(([a, b], i) => {
      sample[positionToCellId({ col: 0, row: i })] = { raw: a };
      sample[positionToCellId({ col: 1, row: i })] = { raw: b };
    });
    sample["A6"] = { raw: "Total" };
    setGrid(sample);
  }

  const quickRefs = FORMULA_LIBRARY.slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-slate-50">Practice workspace</h1>
          <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
            A free sandbox — try any formula against your own numbers. Nothing here is graded.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-3.5 py-2 text-xs font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
          >
            Load sample data
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-3.5 py-2 text-xs font-semibold text-ink dark:text-slate-50 hover:border-coral-400"
          >
            Clear sheet
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
            <h2 className="font-display font-bold text-ink dark:text-slate-50 mb-2 text-sm">Inspector</h2>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Selected</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50">{selectedCell ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Value</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50 truncate max-w-[10rem] text-right">
                  {selectedValue === null || selectedValue === "" ? "—" : selectedValue}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Cells used</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50">{filledCells}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
            <h2 className="font-display font-bold text-ink dark:text-slate-50 mb-2 text-sm">Try these</h2>
            <ul className="text-xs space-y-2">
              {quickRefs.map((entry) => (
                <li key={entry.name} className="text-slate-500 dark:text-slate-300">
                  <span className="font-semibold text-ink dark:text-slate-50">{entry.name}</span>
                  <code className="block font-mono text-sky-600 dark:text-sky-400 mt-0.5">{entry.example}</code>
                </li>
              ))}
            </ul>
            <Link
              href="/cheatsheet/"
              className="inline-block mt-3 text-xs font-semibold text-owl-600 dark:text-owl-300 hover:underline"
            >
              Full formula reference →
            </Link>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <InteractiveSpreadsheet
            grid={grid}
            cols={COLS}
            rows={ROWS}
            mode={preferences.mode}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            onCommitCellValue={handleCommit}
            onFillDown={handleFillDown}
          />
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-3">
            Tip: enter a formula like <code className="font-mono">=SUM({selectedRange})</code> to aggregate the column
            you&rsquo;re working in, then use ⤓ Fill Down to copy it down a column.
          </p>
        </div>
      </div>
    </div>
  );
}
