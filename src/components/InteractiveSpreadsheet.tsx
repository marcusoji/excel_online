"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { AppMode, ConditionalFormatRule, GridData } from "@/types";
import { buildColumnLabels, cellIdToPosition, expandRange } from "@/lib/cellUtils";
import { evaluateCell, formatCellValue, isFormula } from "@/lib/formulaEngine";
import { PALETTE_COLORS } from "@/lib/curriculum";

interface InteractiveSpreadsheetProps {
  grid: GridData;
  cols: number;
  rows: number;
  mode: AppMode;
  selectedCell: string | null;
  onSelectCell: (cellId: string) => void;
  onCommitCellValue: (cellId: string, raw: string) => void;
  onApplyFill?: (cellId: string, color: string) => void;
  onFillDown?: (fromCell: string) => void;
  highlightCells?: string[];
  highlightRange?: { start: string; end: string };
  readOnlyCells?: string[];
  showPalette?: boolean;
  disabled?: boolean;
  /** Formula-level named ranges available in this lesson, e.g. { Sales: "C2:C6" }. */
  namedRanges?: Record<string, string>;
  /** Restricts a cell to a dropdown of allowed values (Data Validation). */
  validationLists?: Record<string, string[]>;
  /** Tints cells whose computed value crosses a threshold (Conditional Formatting). */
  conditionalFormats?: ConditionalFormatRule[];
  /** Alternates row background across a range for an "Excel Table" look. */
  bandedRange?: { start: string; end: string };
}

function ruleMatches(rule: ConditionalFormatRule, value: number): boolean {
  switch (rule.operator) {
    case ">=":
      return value >= rule.threshold;
    case ">":
      return value > rule.threshold;
    case "<=":
      return value <= rule.threshold;
    case "<":
      return value < rule.threshold;
    case "=":
      return value === rule.threshold;
  }
}

export function InteractiveSpreadsheet({
  grid,
  cols,
  rows,
  mode,
  selectedCell,
  onSelectCell,
  onCommitCellValue,
  onApplyFill,
  onFillDown,
  highlightCells,
  highlightRange,
  readOnlyCells,
  showPalette = false,
  disabled = false,
  namedRanges,
  validationLists,
  conditionalFormats,
  bandedRange,
}: InteractiveSpreadsheetProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const columnLabels = useMemo(() => buildColumnLabels(cols), [cols]);
  const rowNumbers = useMemo(() => Array.from({ length: rows }, (_, i) => i + 1), [rows]);

  const highlighted = useMemo(() => {
    const set = new Set<string>(highlightCells ?? []);
    if (highlightRange) for (const c of expandRange(highlightRange.start, highlightRange.end)) set.add(c);
    return set;
  }, [highlightCells, highlightRange]);

  const readOnlySet = useMemo(() => new Set(readOnlyCells ?? []), [readOnlyCells]);

  const bandedRows = useMemo(() => {
    if (!bandedRange) return null;
    const start = cellIdToPosition(bandedRange.start);
    const end = cellIdToPosition(bandedRange.end);
    return { minRow: Math.min(start.row, end.row), maxRow: Math.max(start.row, end.row) };
  }, [bandedRange]);

  const isRoomy = mode === "focus";
  const cellSizeClass = isRoomy ? "min-w-[84px] h-10 text-[14px]" : "min-w-[92px] h-9 text-[13px]";
  const rowHeaderWidth = isRoomy ? "w-9" : "w-8";

  function commit(cellId: string) {
    if (draft !== null) {
      onCommitCellValue(cellId, draft);
    }
    setDraft(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, cellId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(cellId);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setDraft(null);
      inputRef.current?.blur();
    }
  }

  const selectedRaw = selectedCell ? (grid[selectedCell]?.raw ?? "") : "";
  const formulaBarValue = draft ?? selectedRaw;
  const selectedIsFormula = isFormula(selectedRaw);
  const canFillDown = Boolean(selectedCell && selectedIsFormula && onFillDown && !readOnlySet.has(selectedCell));

  return (
    <div className="flex flex-col gap-3">
      {/* Formula bar — mirrors real Excel, and is the easiest place for
          analyst-mode users to see/edit an exact formula string. */}
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-150 bg-white px-3 py-2 shadow-card dark:bg-slate-850 dark:border-slate-750">
        <span className="font-mono text-xs font-bold text-owl-700 dark:text-owl-300 rounded-md bg-owl-50 dark:bg-owl-500/10 px-2 py-1 min-w-[2.75rem] text-center">
          {selectedCell ?? "—"}
        </span>
        <span className="text-slate-300 dark:text-slate-700" aria-hidden>
          fx
        </span>
        <input
          aria-label={selectedCell ? `Formula for cell ${selectedCell}` : "Select a cell to edit it"}
          className="flex-1 min-w-0 bg-transparent font-mono text-sm text-ink outline-none disabled:cursor-not-allowed dark:text-slate-50"
          value={formulaBarValue}
          disabled={disabled || !selectedCell || (selectedCell ? readOnlySet.has(selectedCell) : true)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => selectedCell && commit(selectedCell)}
          onKeyDown={(e) => selectedCell && handleKeyDown(e, selectedCell)}
          placeholder={selectedCell ? "Type a value or =FORMULA" : ""}
        />
        {canFillDown && (
          <button
            type="button"
            onClick={() => selectedCell && onFillDown?.(selectedCell)}
            disabled={disabled}
            className="shrink-0 rounded-full bg-owl-50 dark:bg-owl-500/10 text-owl-700 dark:text-owl-300 text-xs font-bold px-3 py-1.5 hover:bg-owl-100 dark:hover:bg-owl-500/20 transition-colors"
            title="Copy this formula to the cell below, shifting relative references"
          >
            Fill Down
          </button>
        )}
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-150 dark:border-slate-750 max-h-[60vh]">
        <div
          className="grid w-max"
          style={{ gridTemplateColumns: `${isRoomy ? "2.25rem" : "2rem"} repeat(${cols}, minmax(0, auto))` }}
        >
          {/* Corner + column headers stay put while scrolling — this is exactly
              what "Freeze Panes" does in real Excel, just always on here. */}
          <div
            className={`${rowHeaderWidth} h-9 bg-slate-50 dark:bg-slate-925 border-b border-r border-slate-150 dark:border-slate-750 sticky top-0 left-0 z-30`}
          />
          {columnLabels.map((label) => (
            <div
              key={label}
              className={`${cellSizeClass} h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-925 border-b border-r border-slate-150 dark:border-slate-750 font-mono text-xs font-semibold text-slate-500 dark:text-slate-300 sticky top-0 z-20`}
            >
              {label}
            </div>
          ))}

          {rowNumbers.map((rowNum) => (
            <RowFragment key={rowNum}>
              <div
                className={`${rowHeaderWidth} ${cellSizeClass} flex items-center justify-center bg-slate-50 dark:bg-slate-925 border-b border-r border-slate-150 dark:border-slate-750 font-mono text-xs font-semibold text-slate-500 dark:text-slate-300 sticky left-0 z-20`}
              >
                {rowNum}
              </div>
              {columnLabels.map((label) => {
                const cellId = `${label}${rowNum}`;
                const cellData = grid[cellId];
                const isSelected = selectedCell === cellId;
                const isHighlighted = highlighted.has(cellId);
                const isReadOnly = readOnlySet.has(cellId);
                const value = evaluateCell(cellId, grid, namedRanges);
                const displayValue = formatCellValue(value);
                const isErrorValue = typeof displayValue === "string" && displayValue.startsWith("#");
                const validationOptions = validationLists?.[cellId];

                let conditionalColor: string | undefined;
                if (conditionalFormats && typeof value === "number") {
                  const pos = cellIdToPosition(cellId);
                  for (const rule of conditionalFormats) {
                    const start = cellIdToPosition(rule.range.start);
                    const end = cellIdToPosition(rule.range.end);
                    const withinRange =
                      pos.col >= Math.min(start.col, end.col) &&
                      pos.col <= Math.max(start.col, end.col) &&
                      pos.row >= Math.min(start.row, end.row) &&
                      pos.row <= Math.max(start.row, end.row);
                    if (withinRange && ruleMatches(rule, value)) {
                      conditionalColor = rule.color;
                      break;
                    }
                  }
                }

                const rowPos = cellIdToPosition(cellId).row;
                const isBanded = Boolean(
                  bandedRows && rowPos >= bandedRows.minRow && rowPos <= bandedRows.maxRow && (rowPos - bandedRows.minRow) % 2 === 1
                );

                let backgroundStyle: React.CSSProperties | undefined;
                if (cellData?.fill) backgroundStyle = { backgroundColor: cellData.fill, color: "#fff" };
                else if (conditionalColor) backgroundStyle = { backgroundColor: conditionalColor };

                return (
                  <button
                    type="button"
                    key={cellId}
                    onClick={() => {
                      if (disabled) return;
                      if (selectedCell && selectedCell !== cellId) commit(selectedCell);
                      onSelectCell(cellId);
                    }}
                    className={[
                      cellSizeClass,
                      "relative border-b border-r border-slate-150 dark:border-slate-750 px-2 flex items-center text-left font-body transition-colors",
                      isReadOnly ? "text-slate-500 dark:text-slate-300 font-semibold" : "text-ink dark:text-slate-50",
                      isSelected ? "ring-2 ring-sky-500 ring-inset z-10 bg-sky-50 dark:bg-sky-500/10" : "",
                      !isSelected && isHighlighted ? "bg-owl-50 dark:bg-owl-500/10 animate-cell-pulse ring-1 ring-inset ring-owl-300" : "",
                      !isSelected && !isHighlighted && !backgroundStyle && isBanded ? "bg-slate-25 dark:bg-slate-925/60" : "",
                      !isSelected && !isHighlighted && !backgroundStyle && !isBanded ? "bg-white dark:bg-slate-850 hover:bg-slate-25 dark:hover:bg-slate-750/60" : "",
                      isErrorValue ? "text-coral-600" : "",
                    ].join(" ")}
                    style={backgroundStyle}
                    aria-pressed={isSelected}
                  >
                    {isSelected && !isReadOnly && validationOptions ? (
                      <select
                        aria-label={`Choose a value for cell ${cellId}`}
                        autoFocus
                        className="absolute inset-0 w-full h-full bg-transparent px-1 outline-none"
                        value={grid[cellId]?.raw ?? ""}
                        onChange={(e) => onCommitCellValue(cellId, e.target.value)}
                      >
                        <option value="" disabled>
                          Choose…
                        </option>
                        {validationOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : isSelected && !isReadOnly ? (
                      <input
                        ref={inputRef}
                        autoFocus
                        aria-label={`Edit cell ${cellId}`}
                        className="absolute inset-0 w-full h-full bg-transparent px-2 outline-none font-mono"
                        value={formulaBarValue}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commit(cellId)}
                        onKeyDown={(e) => handleKeyDown(e, cellId)}
                      />
                    ) : (
                      <span className="truncate">{displayValue}</span>
                    )}
                  </button>
                );
              })}
            </RowFragment>
          ))}
        </div>
      </div>

      {showPalette && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-25 dark:bg-slate-925 px-3 py-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 mr-1">Paint:</span>
          {PALETTE_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              aria-label={`Fill selected cell with ${color.name}`}
              disabled={!selectedCell || disabled}
              onClick={() => selectedCell && onApplyFill?.(selectedCell, color.value)}
              className="h-9 w-9 rounded-full border-2 border-white shadow-card disabled:opacity-40 disabled:pointer-events-none transition-transform active:scale-90"
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-300">
        {selectedIsFormula ? "This cell holds a formula — it recalculates automatically." : "Tap any cell to select it, then type to edit."}
      </p>
    </div>
  );
}

/** Thin wrapper so each grid row is real DOM siblings inside the CSS grid (no <tr>/<td> needed). */
function RowFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
