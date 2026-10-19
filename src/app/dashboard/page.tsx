"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProgressPath } from "@/components/ProgressPath";
import { Button } from "@/components/Button";
import { usePreferences, useAllLessonProgress } from "@/hooks/useProgress";
import { LEVELS, getAllLessonsInOrder, getRecommendedLesson, getLevel } from "@/lib/curriculum";
import type { LessonProgress } from "@/types";

export default function DashboardPage() {
  const { preferences } = usePreferences();
  const allProgress = useAllLessonProgress();

  const progressByLessonId: Record<string, LessonProgress> = {};
  for (const p of allProgress ?? []) progressByLessonId[p.lessonId] = p;

  const completedIds = useMemo(
    () => new Set((allProgress ?? []).filter((p) => p.completed).map((p) => p.lessonId)),
    [allProgress]
  );

  const totalLessons = getAllLessonsInOrder().length;
  const completedCount = completedIds.size;
  const pctComplete = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
  const levelsComplete = LEVELS.filter(
    (level) => level.lessonIds.length > 0 && level.lessonIds.every((id) => completedIds.has(id))
  ).length;

  const recommended = useMemo(() => getRecommendedLesson(completedIds), [completedIds]);
  const recommendedLevel = recommended ? getLevel(recommended.levelId) : undefined;
  const recommendedIndex = recommended ? getAllLessonsInOrder().findIndex((l) => l.id === recommended.id) : -1;
  const isFreshStart = completedCount === 0;

  const recommendedProgress = recommended ? progressByLessonId[recommended.id] : undefined;
  const recommendedStep =
    recommendedProgress && !recommendedProgress.completed && recommendedProgress.bestStepIndex > 0
      ? recommendedProgress.bestStepIndex
      : 0;
  const isResuming = recommendedStep > 0 && recommended ? recommendedStep < recommended.steps.length : false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Hero — the "where am I" answer, stated once and confidently. */}
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-2">
            {isFreshStart ? "Start here" : `Welcome back, ${preferences.displayName}`}
          </p>
          <h1 className="font-display text-display sm:text-display-lg text-ink dark:text-slate-50">
            {isFreshStart ? "Learn Excel the way it\u2019s actually used at work." : "Your Excel curriculum"}
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-300 text-[15px] leading-relaxed">
            Fifteen guided lessons across five levels — a live spreadsheet in every one, from cell references to
            XLOOKUP, dynamic arrays, and your first macro.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <QuickLink href="/practice/" label="Practice workspace" />
          <QuickLink href="/cheatsheet/" label="Formula reference" />
          <QuickLink href="/certificate/" label="Certificates" />
        </div>
      </header>

      {/* Stat row — three numbers that answer "how far along am I". */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Lessons complete" value={`${completedCount}/${totalLessons}`} />
        <StatCard label="Levels earned" value={`${levelsComplete}/${LEVELS.length}`} />
        <StatCard label="Overall progress" value={`${pctComplete}%`} />
        <StatCard label="Study mode" value={preferences.mode === "focus" ? "Focus" : "Analyst"} />
      </section>

      {/* Progress bar, tied to the numbers above. */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2">
          <span>Curriculum progress</span>
          <span className="tnum">{pctComplete}%</span>
        </div>
        <div
          className="h-2.5 rounded-full bg-slate-150 dark:bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={pctComplete}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-owl-500 to-owl-400 rounded-full transition-all duration-500"
            style={{ width: `${pctComplete}%` }}
          />
        </div>
      </div>

      {/* Resume card — the single most useful action on the page. */}
      {recommended && (
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl border border-owl-200 dark:border-owl-500/30 bg-white dark:bg-slate-850 shadow-raised">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-owl-400 to-owl-600" aria-hidden />
            <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-owl-600 dark:text-owl-300 mb-2">
                  {isResuming ? "Pick up where you left off" : isFreshStart ? "Your first lesson" : "Next up"}
                </p>
                <h2 className="font-display text-display-sm text-ink dark:text-slate-50 truncate">{recommended.title}</h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-300">{recommended.tagline}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-400">
                  {recommendedLevel ? `Level ${recommendedLevel.order} · ` : ""}
                  Lesson {recommendedIndex + 1} of {totalLessons}
                  {isResuming ? ` · step ${recommendedStep + 1} of ${recommended.steps.length}` : ` · ${recommended.estMinutes} min`}
                </p>
              </div>
              <Link
                href={`/lessons/${recommended.levelId}/${recommended.id}/`}
                className="shrink-0"
              >
                <Button variant="primary" size="lg">
                  {isResuming ? "Resume lesson" : isFreshStart ? "Begin lesson 1" : "Continue lesson"} →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="font-display text-2xl text-ink dark:text-slate-50">The curriculum</h2>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">5 levels · 15 lessons</span>
      </div>

      <ProgressPath progressByLessonId={progressByLessonId} />
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-slate-150 dark:border-slate-750 bg-white/80 dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 shadow-card hover:border-owl-300 hover:shadow-raised transition-all"
    >
      {label}
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card">
      <p className="font-display text-2xl text-ink dark:text-slate-50 tnum">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-0.5">{label}</p>
    </div>
  );
}
