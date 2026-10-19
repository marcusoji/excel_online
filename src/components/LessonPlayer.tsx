"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GridData, Lesson, BadgeDefinition } from "@/types";
import { InteractiveSpreadsheet } from "@/components/InteractiveSpreadsheet";
import { Confetti } from "@/components/Confetti";
import { Button } from "@/components/Button";
import { MiniBarChart } from "@/components/MiniBarChart";
import { PivotPreview } from "@/components/PivotPreview";
import { Sparkline } from "@/components/Sparkline";
import { DynamicArrayPreview } from "@/components/DynamicArrayPreview";
import { MacroLog } from "@/components/MacroLog";
import { evaluateCell } from "@/lib/formulaEngine";
import { getNextLesson, getLevel } from "@/lib/curriculum";
import { downloadLessonWorkbook } from "@/lib/xlsxExport";
import { completeLesson, touchLessonVisit, usePreferences } from "@/hooks/useProgress";
import { cellIdToPosition, positionToCellId } from "@/lib/cellUtils";
import { applyAutoSum, applyFillDown, applySort } from "@/lib/gridActions";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hexToRgbComment(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `RGB(${r},${g},${b})`;
}

function checkStepPasses(step: Lesson["steps"][number], grid: GridData, selectedCell: string | null, namedRanges?: Record<string, string>): boolean {
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

interface LessonPlayerProps {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const { preferences } = usePreferences();
  const level = getLevel(lesson.levelId);
  const nextLesson = getNextLesson(lesson.id);

  const [grid, setGrid] = useState<GridData>(() => structuredClone(lesson.initialGrid));
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "success" | "retry">("idle");
  const [showHint, setShowHint] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeDefinition[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [macroLog, setMacroLog] = useState<string[]>([]);

  const currentStep = lesson.steps[stepIndex];
  const readOnlyCells = useMemo(() => {
    const targetCells = new Set(lesson.steps.map((s) => s.targetCell).filter((c): c is string => Boolean(c)));
    return Object.keys(lesson.initialGrid).filter((cellId) => !targetCells.has(cellId));
  }, [lesson]);

  useEffect(() => {
    void touchLessonVisit(lesson.id);
  }, [lesson.id]);

  function logMacro(line: string) {
    if (lesson.isMacroLesson) setMacroLog((log) => [...log, line]);
  }

  async function playDemo() {
    if (!currentStep?.demo || isPlayingDemo) return;
    setIsPlayingDemo(true);
    setShowHint(false);
    for (const beat of currentStep.demo) {
      setSelectedCell(beat.cell);
      await sleep(350);
      if (beat.fill) {
        setGrid((g) => ({ ...g, [beat.cell]: { raw: g[beat.cell]?.raw ?? "", ...g[beat.cell], fill: beat.fill } }));
      }
      if (beat.type !== undefined) {
        setGrid((g) => ({ ...g, [beat.cell]: { ...g[beat.cell], raw: beat.type as string } }));
      }
      await sleep(beat.pause ?? 700);
    }
    setIsPlayingDemo(false);
  }

  function handleCommit(cellId: string, raw: string) {
    setGrid((g) => ({ ...g, [cellId]: { ...g[cellId], raw } }));
    logMacro(`Range("${cellId}").Value = "${raw}"`);
  }

  function handleApplyFill(cellId: string, color: string) {
    setGrid((g) => ({ ...g, [cellId]: { raw: g[cellId]?.raw ?? "", ...g[cellId], fill: color } }));
    logMacro(`Range("${cellId}").Interior.Color = ${hexToRgbComment(color)}`);
  }

  function handleFillDown(fromCell: string) {
    const raw = grid[fromCell]?.raw ?? "";
    if (!raw.startsWith("=")) return;
    const pos = cellIdToPosition(fromCell);
    const targetId = positionToCellId({ col: pos.col, row: pos.row + 1 });
    setGrid((g) => applyFillDown(g, fromCell, lesson.rows));
    logMacro(`Range("${fromCell}").AutoFill Destination:=Range("${targetId}")`);
  }

  function handleSort(action: NonNullable<Lesson["steps"][number]["sortAction"]>) {
    setGrid((g) => applySort(g, action));
    const startPos = cellIdToPosition(action.range.start);
    logMacro(
      `Range("${action.range.start}:${action.range.end}").Sort Key1:=Range("${action.sortColumn}${startPos.row + 1}"), Order1:=xl${action.order === "desc" ? "Descending" : "Ascending"}`
    );
  }

  function handleAutoSum(action: NonNullable<Lesson["steps"][number]["autoSumAction"]>) {
    const formula = `=SUM(${action.range.start}:${action.range.end})`;
    setGrid((g) => applyAutoSum(g, action));
    logMacro(`Range("${action.targetCell}").Formula = "${formula}"`);
  }

  async function handleConfirm() {
    if (!currentStep) return;
    const passed = checkStepPasses(currentStep, grid, selectedCell, lesson.namedRanges);
    if (!passed) {
      setFeedback("retry");
      setTimeout(() => setFeedback("idle"), 900);
      return;
    }
    setFeedback("success");
    await sleep(500);
    setFeedback("idle");
    setShowHint(false);

    if (stepIndex + 1 < lesson.steps.length) {
      setStepIndex((i) => i + 1);
      setSelectedCell(null);
    } else {
      const badges = await completeLesson(lesson.id, lesson.xp);
      setEarnedBadges(badges);
      setLessonComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
  }

  const liveChartData = useMemo(() => {
    if (!lesson.liveChart) return null;
    return lesson.liveChart.rows.map((r) => {
      const labelValue = grid[r.label]?.raw ?? r.label;
      const numeric = evaluateCell(r.value, grid, lesson.namedRanges);
      return { label: labelValue, value: typeof numeric === "number" ? numeric : 0 };
    });
  }, [lesson.liveChart, lesson.namedRanges, grid]);

  const readyCustomPanels = useMemo(() => (lesson.customPanel ?? []).filter((p) => stepIndex >= p.showFromStepIndex), [lesson.customPanel, stepIndex]);

  if (lessonComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        {showConfetti && <Confetti reducedMotion={preferences.reducedMotion} />}
        <div className="text-6xl mb-4">{lesson.icon}</div>
        <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50 mb-2">Lesson complete!</h1>
        <p className="text-slate-500 dark:text-slate-300 mb-6">{lesson.celebration}</p>

        <div className="inline-flex items-center gap-2 rounded-full bg-gold-300/40 dark:bg-gold-500/20 px-4 py-2 font-bold text-ink dark:text-gold-300 mb-6">
          ⭐ +{lesson.xp} XP
        </div>

        {lesson.isMacroLesson && (
          <div className="mb-8 text-left">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-2">
              📼 Here&rsquo;s the macro Excel would have recorded from what you just did:
            </p>
            <MacroLog lines={macroLog} />
          </div>
        )}

        {earnedBadges.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-3">New badge{earnedBadges.length > 1 ? "s" : ""} earned</p>
            <div className="flex flex-wrap justify-center gap-3">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-1 w-24">
                  <div className="h-14 w-14 rounded-full bg-owl-50 dark:bg-owl-500/10 border-2 border-owl-300 flex items-center justify-center text-2xl">
                    {badge.icon}
                  </div>
                  <span className="text-xs font-semibold text-ink dark:text-slate-50 text-center leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {nextLesson && level && (
            <Link href={`/lessons/${nextLesson.levelId}/${nextLesson.id}/`}>
              <Button variant="primary" size="lg" fullWidth>
                Next lesson: {nextLesson.title} →
              </Button>
            </Link>
          )}
          <Button variant="secondary" size="md" fullWidth onClick={() => downloadLessonWorkbook(lesson, grid)}>
            ⬇ Download practice .xlsx
          </Button>
          <Link href="/dashboard/">
            <Button variant="ghost" size="md" fullWidth>
              Back to learning path
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  const progressPct = Math.round((stepIndex / lesson.steps.length) * 100);
  const isAutoStep = currentStep.check.type === "auto";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href="/dashboard/" className="text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-owl-600">
          ← Path
        </Link>
        <div className="flex-1 h-2 rounded-full bg-slate-150 dark:bg-slate-750 overflow-hidden">
          <motion.div className="h-full bg-owl-500 rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 whitespace-nowrap">
          {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>

      <h1 className="font-display text-2xl font-bold text-ink dark:text-slate-50 mb-1">
        {lesson.icon} {lesson.title}
      </h1>
      <p className="text-slate-500 dark:text-slate-300 mb-6">{lesson.tagline}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-96 shrink-0 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={[
                "rounded-2xl border-2 p-5",
                feedback === "retry" ? "border-coral-500 bg-coral-400/5" : "border-owl-200 bg-owl-50 dark:bg-owl-500/10 dark:border-owl-500/30",
              ].join(" ")}
            >
              <p className="font-body text-base font-semibold text-ink dark:text-slate-50 leading-snug">{currentStep.instruction}</p>

              {showHint && currentStep.hint && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300 bg-white/60 dark:bg-slate-925/60 rounded-xl px-3 py-2">
                  💡 {currentStep.hint}
                </p>
              )}

              {feedback === "retry" && <p className="mt-3 text-sm font-semibold text-coral-600">Not quite — give it another try!</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {currentStep.demo && (
                  <Button variant="secondary" size="md" onClick={playDemo} disabled={isPlayingDemo}>
                    ▶ Show me
                  </Button>
                )}
                {currentStep.sortAction && (
                  <Button variant="secondary" size="md" onClick={() => handleSort(currentStep.sortAction!)} disabled={isPlayingDemo}>
                    {currentStep.sortAction.label ?? "⇅ Sort"}
                  </Button>
                )}
                {currentStep.autoSumAction && (
                  <Button variant="secondary" size="md" onClick={() => handleAutoSum(currentStep.autoSumAction!)} disabled={isPlayingDemo}>
                    {currentStep.autoSumAction.label ?? "∑ AutoSum"}
                  </Button>
                )}
                {currentStep.hint && !showHint && (
                  <Button variant="ghost" size="md" onClick={() => setShowHint(true)}>
                    Need a hint?
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className={`mt-4 ${feedback === "success" ? "animate-pop-in" : ""}`}
                onClick={handleConfirm}
                disabled={isPlayingDemo}
              >
                {isAutoStep ? "Got it! →" : feedback === "success" ? "Nailed it! ✓" : "I did it! ✓"}
              </Button>
            </motion.div>
          </AnimatePresence>

          {lesson.liveChart && stepIndex >= lesson.liveChart.showFromStepIndex && liveChartData && (
            <MiniBarChart title={lesson.liveChart.title} data={liveChartData} color={lesson.liveChart.color} />
          )}

          {readyCustomPanels.map((panelConfig, i) => (
            <CustomPanel key={i} config={panelConfig} grid={grid} namedRanges={lesson.namedRanges} />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <InteractiveSpreadsheet
            grid={grid}
            cols={lesson.cols}
            rows={lesson.rows}
            mode={preferences.mode}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            onCommitCellValue={handleCommit}
            onApplyFill={handleApplyFill}
            onFillDown={handleFillDown}
            highlightCells={currentStep.highlightCells}
            highlightRange={currentStep.highlightRange}
            readOnlyCells={readOnlyCells}
            showPalette={currentStep.check.type === "fill-equals"}
            disabled={isPlayingDemo}
            namedRanges={lesson.namedRanges}
            validationLists={lesson.validationLists}
            conditionalFormats={lesson.conditionalFormats}
            bandedRange={lesson.bandedRange}
          />
        </div>
      </div>
    </div>
  );
}

function CustomPanel({
  config,
  grid,
  namedRanges,
}: {
  config: NonNullable<Lesson["customPanel"]>[number];
  grid: GridData;
  namedRanges?: Record<string, string>;
}) {
  if (config.kind === "pivot") {
    const rows = config.rows.map((r) => ({
      group: String(grid[r.groupCell]?.raw ?? ""),
      value: (() => {
        const v = evaluateCell(r.valueCell, grid, namedRanges);
        return typeof v === "number" ? v : 0;
      })(),
    }));
    return <PivotPreview title={config.title} groupLabel="Group" valueLabel="Amount" rows={rows} />;
  }
  if (config.kind === "sparkline") {
    const values = config.valueCells.map((cellId) => {
      const v = evaluateCell(cellId, grid, namedRanges);
      return typeof v === "number" ? v : 0;
    });
    return (
      <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
        <h3 className="font-display font-bold text-ink dark:text-slate-50 mb-3 text-sm">{config.title}</h3>
        <Sparkline values={values} />
      </div>
    );
  }
  // dynamic-array
  const values = config.sourceCells
    .map((cellId) => grid[cellId]?.raw ?? "")
    .filter((v) => v !== "")
    .sort((a, b) => (config.order === "desc" ? Number(b) - Number(a) : Number(a) - Number(b)));
  return <DynamicArrayPreview title={config.title} values={values} />;
}
