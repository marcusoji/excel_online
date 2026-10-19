"use client";

import Link from "next/link";
import { LEVELS, getAllLessonsInOrder } from "@/lib/curriculum";
import type { LessonProgress } from "@/types";

const LEVEL_ACCENT: Record<string, string> = {
  owl: "border-owl-200 bg-owl-50 dark:bg-owl-500/10 dark:border-owl-500/30",
  sky: "border-sky-400/40 bg-sky-400/10",
  coral: "border-coral-400/40 bg-coral-400/10",
  gold: "border-gold-400/40 bg-gold-400/10",
};

const NODE_SIDE = ["self-start ml-2", "self-center", "self-end mr-2"];

interface ProgressPathProps {
  progressByLessonId: Record<string, LessonProgress>;
}

export function ProgressPath({ progressByLessonId }: ProgressPathProps) {
  const orderedLessons = getAllLessonsInOrder();
  const orderedIds = orderedLessons.map((l) => l.id);

  function isUnlocked(lessonId: string): boolean {
    const idx = orderedIds.indexOf(lessonId);
    if (idx <= 0) return true;
    const prevId = orderedIds[idx - 1];
    return Boolean(prevId && progressByLessonId[prevId]?.completed);
  }

  return (
    <div className="flex flex-col gap-10">
      {LEVELS.map((level) => (
        <section key={level.id}>
          <div className={`rounded-2xl border px-4 py-3 mb-4 ${LEVEL_ACCENT[level.color]}`}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink dark:text-slate-50">
                Level {level.order} · {level.title}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">{level.ageRange}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{level.description}</p>
          </div>

          {level.lessonIds.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-150 dark:border-slate-750 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-300">
              Coming soon — this level is mapped out and on the way.
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-2">
              {level.lessonIds.map((lessonId, i) => {
                const lesson = orderedLessons.find((l) => l.id === lessonId);
                if (!lesson) return null;
                const unlocked = isUnlocked(lessonId);
                const progress = progressByLessonId[lessonId];
                const completed = progress?.completed ?? false;
                const side = NODE_SIDE[i % NODE_SIDE.length];

                const node = (
                  <div
                    className={[
                      "flex flex-col items-center gap-2 w-24",
                      side,
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-16 w-16 rounded-full flex items-center justify-center text-2xl border-4 transition-transform",
                        completed
                          ? "bg-owl-500 border-owl-600 text-white shadow-press shadow-owl-700"
                          : unlocked
                            ? "bg-white dark:bg-slate-850 border-owl-400 text-ink dark:text-slate-50 animate-cell-pulse"
                            : "bg-slate-150 dark:bg-slate-750 border-slate-150 dark:border-slate-750 text-slate-500 grayscale",
                      ].join(" ")}
                    >
                      {completed ? "✓" : unlocked ? lesson.icon : "🔒"}
                    </div>
                    <span className="text-xs font-semibold text-center text-ink dark:text-slate-50 leading-tight">
                      {lesson.title}
                    </span>
                  </div>
                );

                return unlocked ? (
                  <Link
                    key={lessonId}
                    href={`/lessons/${level.id}/${lessonId}/`}
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-2xl"
                    aria-label={`${completed ? "Replay" : "Start"} lesson: ${lesson.title}`}
                  >
                    {node}
                  </Link>
                ) : (
                  <div key={lessonId} aria-disabled className="cursor-not-allowed opacity-90">
                    {node}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
