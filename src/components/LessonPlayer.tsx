"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GridData, Lesson } from "@/types";
import { InteractiveSpreadsheet } from "@/components/InteractiveSpreadsheet";
import { Button } from "@/components/Button";
import { MiniBarChart } from "@/components/MiniBarChart";
import { PivotPreview } from "@/components/PivotPreview";
import { Sparkline } from "@/components/Sparkline";
import { DynamicArrayPreview } from "@/components/DynamicArrayPreview";
import { MacroLog } from "@/components/MacroLog";
import { evaluateCell } from "@/lib/formulaEngine";
import { checkStepPasses, rebuildGridUpTo, selectedCellForStep } from "@/lib/lessonRunner";
import { getNextLesson, getLevel, getAllLessonsInOrder } from "@/lib/curriculum";
import { downloadLessonWorkbook } from "@/lib/xlsxExport";
import { completeLesson, recordStepProgress, touchLessonVisit, useLessonProgress, usePreferences } from "@/hooks/useProgress";
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

interface LessonPlayerProps {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const { preferences } = usePreferences();
  const savedProgress = useLessonProgress(lesson.id);
  const level = getLevel(lesson.levelId);
  const nextLesson = getNextLesson(lesson.id);
  const lessonNumber = getAllLessonsInOrder().findIndex((l) => l.id === lesson.id) + 1;

  const [grid, setGrid] = useState<GridData>(() => structuredClone(lesson.initialGrid));
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"brief" | "playing">("brief");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "success" | "retry">("idle");
  const [showHint, setShowHint] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [macroLog, setMacroLog] = useState<string[]>([]);
  const [resumeFrom, setResumeFrom] = useState(0);

  const currentStep = lesson.steps[stepIndex];
  const readOnlyCells = useMemo(() => {
    const targetCells = new Set(lesson.steps.map((s) => s.targetCell).filter((c): c is string => Boolean(c)));
    return Object.keys(lesson.initialGrid).filter((cellId) => !targetCells.has(cellId));
  }, [lesson]);

  useEffect(() => {
    void touchLessonVisit(lesson.id);
  }, [lesson.id]);

  // Offer a resume when a part-finished lesson is reopened. The grid starts
  // from its initial state, so a resume rewinds to the earliest unfinished
  // step and the learner replays from there with the sheet reset.
  useEffect(() => {
    if (!savedProgress || savedProgress.completed) return;
    const best = savedProgress.bestStepIndex ?? 0;
    if (best > 0 && best < lesson.steps.length) setResumeFrom(best);
  }, [savedProgress, lesson.steps.length]);

  const resetLesson = useCallback(() => {
    setGrid(structuredClone(lesson.initialGrid));
    setSelectedCell(null);
    setStepIndex(0);
    setFeedback("idle");
    setShowHint(false);
    setMacroLog([]);
    setResumeFrom(0);
    setPhase("brief");
  }, [lesson]);

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

  const handleConfirm = useCallback(async () => {
    if (!currentStep) return;
    const passed = checkStepPasses(currentStep, grid, selectedCell, lesson.namedRanges);
    if (!passed) {
      setFeedback("retry");
      setTimeout(() => setFeedback("idle"), 1200);
      return;
    }
    setFeedback("success");
    await sleep(500);
    setFeedback("idle");
    setShowHint(false);

    if (stepIndex + 1 < lesson.steps.length) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setSelectedCell(null);
      void recordStepProgress(lesson.id, nextIndex);
    } else {
      await completeLesson(lesson.id);
      setLessonComplete(true);
    }
  }, [currentStep, grid, selectedCell, lesson.namedRanges, lesson.steps.length, lesson.id, stepIndex]);

  /** Keyboard shortcuts: Enter checks the step, "h" reveals the hint, "d" demos. */
  useEffect(() => {
    if (phase !== "playing" || lessonComplete) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA");
      if (typing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        void handleConfirm();
      } else if (e.key.toLowerCase() === "h" && currentStep?.hint) {
        setShowHint(true);
      } else if (e.key.toLowerCase() === "d" && currentStep?.demo) {
        void playDemo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lessonComplete, handleConfirm, currentStep]);

  const liveChartData = useMemo(() => {
    if (!lesson.liveChart) return null;
    return lesson.liveChart.rows.map((r) => {
      const labelValue = grid[r.label]?.raw ?? r.label;
      const numeric = evaluateCell(r.value, grid, lesson.namedRanges);
      return { label: labelValue, value: typeof numeric === "number" ? numeric : 0 };
    });
  }, [lesson.liveChart, lesson.namedRanges, grid]);

  const readyCustomPanels = useMemo(() => (lesson.customPanel ?? []).filter((p) => stepIndex >= p.showFromStepIndex), [lesson.customPanel, stepIndex]);

  // ---- Completion screen -------------------------------------------------
  if (lessonComplete) {
    const nextNumber = lessonNumber + 1;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-owl-500 text-white shadow-lifted mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-2">Lesson complete</p>
          <h1 className="font-display text-display text-ink dark:text-slate-50 mb-3">{lesson.title}</h1>
          <p className="text-slate-500 dark:text-slate-300 max-w-md mx-auto leading-relaxed">{lesson.celebration}</p>
        </motion.div>

        <div className="mt-8 rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-5 shadow-card">
          <h2 className="font-display text-lg text-ink dark:text-slate-50 mb-3">What you practised</h2>
          <ul className="flex flex-col gap-2.5">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="flex items-start gap-2.5 text-sm text-ink dark:text-slate-50">
                <span aria-hidden className="text-owl-600 dark:text-owl-300 shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {lesson.isMacroLesson && (
          <div className="mt-6 text-left">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-2">
              The macro Excel would have recorded from what you just did:
            </p>
            <MacroLog lines={macroLog} />
          </div>
        )}

        <div className="flex flex-col gap-3 mt-8">
          {nextLesson && level && (
            <Link href={`/lessons/${nextLesson.levelId}/${nextLesson.id}/`}>
              <Button variant="primary" size="lg" fullWidth>
                Next: {nextLesson.title} →
              </Button>
            </Link>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" size="md" fullWidth onClick={() => downloadLessonWorkbook(lesson, grid)}>
              Download practice .xlsx
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={resetLesson}>
              Replay this lesson
            </Button>
          </div>
          <Link href="/dashboard/" className="text-center text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-owl-600 py-1">
            Back to learning path
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-400 mt-6 tnum">
          Lesson {lessonNumber} of {getAllLessonsInOrder().length}
          {nextLesson ? ` · next is lesson ${nextNumber}` : " · that was the final lesson"}
        </p>
      </div>
    );
  }

  // ---- Briefing screen ---------------------------------------------------
  if (phase === "brief") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard/" className="text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-owl-600">
          ← Learning path
        </Link>

        <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-owl-600 dark:text-owl-300">
          <span>{level ? `Level ${level.order} · ${level.title}` : "Lesson"}</span>
          <span className="text-slate-300" aria-hidden>•</span>
          <span className="tnum">{lesson.estMinutes} min</span>
        </div>
        <h1 className="font-display text-display sm:text-display-lg text-ink dark:text-slate-50 mt-2">{lesson.title}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-300 mt-2">{lesson.tagline}</p>

        <section className="mt-8 rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-400 mb-2">The scenario</h2>
          <p className="text-ink dark:text-slate-50 leading-relaxed">{lesson.brief}</p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-400 mb-3">What you&rsquo;ll practise</h2>
          <ul className="flex flex-col gap-2.5">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="flex items-start gap-2.5 text-sm text-ink dark:text-slate-50">
                <span aria-hidden className="text-owl-600 dark:text-owl-300 shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>

        {resumeFrom > 0 ? (
          <>
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-owl-200 dark:border-owl-500/30 bg-owl-50 dark:bg-owl-500/10 px-4 py-3">
              <span aria-hidden className="text-owl-600 dark:text-owl-300 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v4h4" />
                </svg>
              </span>
              <p className="text-sm text-ink dark:text-slate-50">
                You were partway through — resume at step {resumeFrom + 1} of {lesson.steps.length}.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
              onClick={() => {
                setGrid(rebuildGridUpTo(lesson, resumeFrom));
                setSelectedCell(selectedCellForStep(lesson, resumeFrom));
                setStepIndex(resumeFrom);
                setPhase("playing");
              }}
            >
              Resume at step {resumeFrom + 1} →
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              className="mt-2"
              onClick={() => {
                setStepIndex(0);
                setPhase("playing");
              }}
            >
              Start from the beginning
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="lg" fullWidth className="mt-7" onClick={() => setPhase("playing")}>
              Start the walkthrough →
            </Button>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-3 text-center tnum">
              {lesson.steps.length} steps · about {lesson.estMinutes} minutes. You can restart any time.
            </p>
          </>
        )}
      </div>
    );
  }

  // ---- Playing screen ----------------------------------------------------
  if (!currentStep) return null;
  const progressPct = Math.round(((stepIndex + 1) / lesson.steps.length) * 100);
  const isAutoStep = currentStep.check.type === "auto";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 lg:pb-8">
      {/* Lesson header: breadcrumb, progress, restart. */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <Link
          href="/dashboard/"
          className="text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-owl-600 whitespace-nowrap"
        >
          ← <span className="hidden sm:inline">Learning </span>path
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-slate-150 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-owl-500 to-owl-400 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 whitespace-nowrap tnum">
            {stepIndex + 1} / {lesson.steps.length}
          </span>
        </div>
        <button
          type="button"
          onClick={resetLesson}
          className="text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-coral-600 whitespace-nowrap"
        >
          ↺ Restart
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-ink dark:text-slate-50 truncate">{lesson.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5 truncate">
            {level ? `Level ${level.order} · ` : ""}
            {lesson.tagline}
          </p>
        </div>
        <span className="hidden sm:block shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-400 tnum">
          Lesson {lessonNumber} of {getAllLessonsInOrder().length}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Side panel: step roadmap + the active instruction. */}
        <div className="lg:w-[22rem] shrink-0 flex flex-col gap-4">
          <ol className="flex flex-col gap-1.5 rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-3 shadow-card">
            {lesson.steps.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <li key={step.id} className="flex items-center gap-3">
                  <span
                    className={[
                      "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors tnum",
                      done
                        ? "bg-owl-500 border-owl-500 text-white"
                        : active
                          ? "border-owl-400 text-owl-700 dark:text-owl-300 bg-owl-50 dark:bg-owl-500/10"
                          : "border-slate-200 dark:border-slate-750 text-slate-400",
                    ].join(" ")}
                  >
                    {done ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={[
                      "text-sm truncate",
                      active
                        ? "font-semibold text-ink dark:text-slate-50"
                        : done
                          ? "text-slate-400 dark:text-slate-400 line-through decoration-slate-300"
                          : "text-slate-400 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {step.objective ?? step.instruction}
                  </span>
                </li>
              );
            })}
          </ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={[
                "rounded-2xl border-2 p-5 shadow-card",
                feedback === "retry"
                  ? "border-coral-500 bg-coral-50 dark:bg-coral-500/10"
                  : feedback === "success"
                    ? "border-owl-500 bg-owl-50 dark:bg-owl-500/10"
                    : "border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850",
              ].join(" ")}
            >
              {currentStep.objective && (
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-owl-700 dark:text-owl-300 mb-2">
                  {currentStep.objective}
                </p>
              )}
              <p className="font-body text-base font-semibold text-ink dark:text-slate-50 leading-snug">{currentStep.instruction}</p>

              {showHint && currentStep.hint && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300 bg-slate-25 dark:bg-slate-925 rounded-xl px-3 py-2">
                  {currentStep.hint}
                </p>
              )}

              {feedback === "retry" && (
                <p className="mt-3 text-sm font-semibold text-coral-600">
                  Not quite — check the formula and try again.
                </p>
              )}
              {feedback === "success" && (
                <p className="mt-3 text-sm font-semibold text-owl-600 dark:text-owl-300">Nice — that&rsquo;s it.</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {currentStep.demo && (
                  <Button variant="secondary" size="sm" onClick={playDemo} disabled={isPlayingDemo}>
                    ▶ Show me
                  </Button>
                )}
                {currentStep.sortAction && (
                  <Button variant="secondary" size="sm" onClick={() => handleSort(currentStep.sortAction!)} disabled={isPlayingDemo}>
                    {currentStep.sortAction.label ?? "Sort"}
                  </Button>
                )}
                {currentStep.autoSumAction && (
                  <Button variant="secondary" size="sm" onClick={() => handleAutoSum(currentStep.autoSumAction!)} disabled={isPlayingDemo}>
                    {currentStep.autoSumAction.label ?? "AutoSum"}
                  </Button>
                )}
                {currentStep.hint && !showHint && (
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
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
                {isAutoStep ? "Got it →" : feedback === "success" ? "Correct" : "Check my answer"}
              </Button>

              <p className="hidden lg:block text-[11px] text-slate-400 dark:text-slate-400 mt-3 text-center">
                Press <kbd className="font-mono">Enter</kbd> to check
                {currentStep.hint ? <> · <kbd className="font-mono">H</kbd> for a hint</> : null}
                {currentStep.demo ? <> · <kbd className="font-mono">D</kbd> to demo</> : null}
              </p>
            </motion.div>
          </AnimatePresence>

          {lesson.liveChart && stepIndex >= lesson.liveChart.showFromStepIndex && liveChartData && (
            <MiniBarChart title={lesson.liveChart.title} data={liveChartData} color={lesson.liveChart.color} />
          )}

          {readyCustomPanels.map((panelConfig, i) => (
            <CustomPanel key={i} config={panelConfig} grid={grid} namedRanges={lesson.namedRanges} />
          ))}
        </div>

        {/* The grid. */}
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

      {/* Sticky action bar on small screens, where the side panel is below the grid. */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-150 dark:border-slate-750 bg-cream/95 dark:bg-slate-925/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleConfirm}
          disabled={isPlayingDemo}
        >
          {isAutoStep ? "Got it →" : feedback === "success" ? "Correct" : "Check my answer"}
        </Button>
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
      <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card">
        <h3 className="font-display text-sm text-ink dark:text-slate-50 mb-3">{config.title}</h3>
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
