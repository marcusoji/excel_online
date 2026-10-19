"use client";

import Link from "next/link";
import { ProgressPath } from "@/components/ProgressPath";
import { usePreferences, useAllLessonProgress, useTotalXp, useBadges } from "@/hooks/useProgress";
import type { LessonProgress } from "@/types";

export default function DashboardPage() {
  const { preferences } = usePreferences();
  const allProgress = useAllLessonProgress();
  const totalXp = useTotalXp();
  const badges = useBadges();

  const progressByLessonId: Record<string, LessonProgress> = {};
  for (const p of allProgress ?? []) progressByLessonId[p.lessonId] = p;

  const completedCount = (allProgress ?? []).filter((p) => p.completed).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50">
            {preferences.mode === "kid" ? `Welcome back, ${preferences.displayName}!` : "Your learning path"}
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-1">
            {completedCount === 0 ? "Ready for your first lesson?" : `${completedCount} lesson${completedCount === 1 ? "" : "s"} complete so far.`}
          </p>
        </div>
        <div className="flex gap-3">
          <StatPill icon="⭐" label="XP" value={totalXp} />
          <StatPill icon="🔥" label="streak" value={preferences.streakDays} />
          <StatPill icon="🏅" label="badges" value={(badges ?? []).length} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/cheatsheet/"
          className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
        >
          📚 Formula cheat sheet
        </Link>
        <Link
          href="/certificate/"
          className="rounded-full border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-2 text-sm font-semibold text-ink dark:text-slate-50 hover:border-owl-300"
        >
          🎓 My certificates
        </Link>
      </div>

      <ProgressPath progressByLessonId={progressByLessonId} />
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-750 px-3 py-1.5">
      <span aria-hidden>{icon}</span>
      <span className="font-bold text-ink dark:text-slate-50 text-sm">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-300 hidden sm:inline">{label}</span>
    </div>
  );
}
