"use client";

import Link from "next/link";
import { ProgressPath } from "@/components/ProgressPath";
import { usePreferences, useAllLessonProgress } from "@/hooks/useProgress";
import { LEVELS, getAllLessonsInOrder } from "@/lib/curriculum";
import type { LessonProgress } from "@/types";

export default function DashboardPage() {
  const { preferences } = usePreferences();
  const allProgress = useAllLessonProgress();

  const progressByLessonId: Record<string, LessonProgress> = {};
  for (const p of allProgress ?? []) progressByLessonId[p.lessonId] = p;

  const totalLessons = getAllLessonsInOrder().length;
  const completedCount = (allProgress ?? []).filter((p) => p.completed).length;
  const pctComplete = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50">
          {completedCount === 0 ? "Excel curriculum" : `Welcome back, ${preferences.displayName}`}
        </h1>
        <p className="text-slate-500 dark:text-slate-300 mt-1">
          A professional Excel curriculum, from the grid to automation. {completedCount} of {totalLessons} lessons complete
          {pctComplete > 0 ? ` (${pctComplete}%)` : ""}.
        </p>
        <div className="mt-4 h-2 rounded-full bg-slate-150 dark:bg-slate-750 overflow-hidden" role="progressbar" aria-valuenow={pctComplete} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-owl-500 rounded-full transition-all" style={{ width: `${pctComplete}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/practice/"
          className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
        >
          Practice workspace
        </Link>
        <Link
          href="/cheatsheet/"
          className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
        >
          Formula reference
        </Link>
        <Link
          href="/certificate/"
          className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
        >
          Certificates
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-5 mb-8">
        <h2 className="font-display font-bold text-ink dark:text-slate-50 mb-3">Curriculum at a glance</h2>
        <ol className="space-y-2.5">
          {LEVELS.map((level) => {
            const done = level.lessonIds.filter((id) => progressByLessonId[id]?.completed).length;
            const total = level.lessonIds.length;
            const levelDone = total > 0 && done === total;
            return (
              <li key={level.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-semibold text-ink dark:text-slate-50">
                    Level {level.order} · {level.title}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-300 mt-0.5">{level.description}</span>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                    levelDone
                      ? "bg-owl-50 text-owl-700 dark:bg-owl-500/10 dark:text-owl-300"
                      : "bg-slate-150 text-slate-500 dark:bg-slate-750 dark:text-slate-300",
                  ].join(" ")}
                >
                  {levelDone ? "Complete" : `${done}/${total}`}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <ProgressPath progressByLessonId={progressByLessonId} />
    </div>
  );
}
