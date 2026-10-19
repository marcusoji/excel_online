"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InteractiveSpreadsheet } from "@/components/InteractiveSpreadsheet";
import { Button } from "@/components/Button";
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
  const [copied, setCopied] = useState<string | null>(null);

  const selectedValue = useMemo(() => {
    if (!selectedCell) return null;
    return formatCellValue(evaluateCell(selectedCell, grid));
  }, [selectedCell, grid]);

  const filledCells = useMemo(() => Object.values(grid).filter((c) => c.raw.trim() !== "").length, [grid]);

  const selectedPos = selectedCell ? cellIdToPosition(selectedCell) : null;
  const selectedRange = selectedPos
    ? `${colIndexToLetters(selectedPos.col)}2:${colIndexToLetters(selectedPos.col)}6`
    : "A2:A6";
  const columnLetter = selectedPos ? colIndexToLetters(selectedPos.col) : "A";

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

  async function copyFormula(formula: string) {
    try {
      await navigator.clipboard.writeText(formula);
      setCopied(formula);
      setTimeout(() => setCopied((c) => (c === formula ? null : c)), 1500);
    } catch {
      // Clipboard can be blocked; the formula is still readable on screen.
    }
  }

  const quickRefs = FORMULA_LIBRARY.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-2">Sandbox</p>
          <h1 className="font-display text-display text-ink dark:text-slate-50">Practice workspace</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300 leading-relaxed">
            A free grid with no grading. Type your own numbers, try any formula, and see the result the instant you
            press Enter.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={loadSample}>
            Load sample data
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear sheet
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0 flex flex-col gap-4">
          {/* Inspector — answers "what is this cell actually holding". */}
          <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card">
            <h2 className="font-display text-sm text-ink dark:text-slate-50 mb-3">Inspector</h2>
            <dl className="text-sm space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Selected</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50">{selectedCell ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Value</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50 truncate max-w-[11rem] text-right">
                  {selectedValue === null || selectedValue === "" ? "—" : selectedValue}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-slate-300">Cells used</dt>
                <dd className="font-mono font-semibold text-ink dark:text-slate-50 tnum">{filledCells}</dd>
              </div>
            </dl>

            {/* Contextual snippet for the selected column — a nudge, not a lesson. */}
            <div className="mt-4 pt-4 border-t border-slate-150/70 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400 mb-1.5">
                Try on column {columnLetter}
              </p>
              <button
                type="button"
                onClick={() => copyFormula(`=SUM(${selectedRange})`)}
                className="group flex w-full items-center justify-between gap-2 rounded-xl bg-slate-25 dark:bg-slate-925 border border-slate-150/70 dark:border-slate-800 px-3 py-2 text-left"
              >
                <code className="font-mono text-xs text-sky-700 dark:text-sky-400 truncate">=SUM({selectedRange})</code>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400 group-hover:text-owl-600">
                  {copied === `=SUM(${selectedRange})` ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card">
            <h2 className="font-display text-sm text-ink dark:text-slate-50 mb-3">Try these</h2>
            <ul className="text-xs space-y-2.5">
              {quickRefs.map((entry) => (
                <li key={entry.name}>
                  <span className="font-semibold text-ink dark:text-slate-50">{entry.name}</span>
                  <button
                    type="button"
                    onClick={() => copyFormula(entry.syntax)}
                    className="group flex w-full items-center justify-between gap-2 mt-0.5 text-left"
                  >
                    <code className="font-mono text-sky-600 dark:text-sky-400 truncate">{entry.syntax}</code>
                    <span className="shrink-0 text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copied === entry.syntax ? "Copied" : "Copy"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/cheatsheet/"
              className="inline-block mt-3.5 text-xs font-semibold text-owl-600 dark:text-owl-300 hover:underline"
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
            you&rsquo;re working in, then use Fill Down to copy it down a column.
          </p>
        </div>
      </div>
    </div>
  );
}
