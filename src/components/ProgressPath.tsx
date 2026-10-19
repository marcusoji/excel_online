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
      {LEVELS.map((level) => {
        const done = level.lessonIds.filter((id) => progressByLessonId[id]?.completed).length;
        return (
          <section key={level.id}>
            <div className={`rounded-2xl border px-4 py-3 mb-4 ${LEVEL_ACCENT[level.color]}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-ink dark:text-slate-50">
                  Level {level.order} · {level.title}
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{level.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1.5">
                {done}/{level.lessonIds.length} complete
              </p>
            </div>

            {level.lessonIds.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-150 dark:border-slate-750 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-300">
                Coming soon.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {level.lessonIds.map((lessonId, lessonIndex) => {
                  const lesson = orderedLessons.find((l) => l.id === lessonId);
                  if (!lesson) return null;
                  const unlocked = isUnlocked(lessonId);
                  const completed = progressByLessonId[lessonId]?.completed ?? false;

                  const inner = (
                    <div
                      className={[
                        "flex items-center gap-4 rounded-2xl border px-4 py-3 transition-colors",
                        unlocked
                          ? "border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-owl-300"
                          : "border-slate-150 dark:border-slate-750 bg-slate-25 dark:bg-slate-925 opacity-70",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden
                        className={[
                          "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border-2",
                          completed
                            ? "bg-owl-500 border-owl-500 text-white"
                            : unlocked
                              ? "border-owl-400 text-owl-700 dark:text-owl-300"
                              : "border-slate-150 dark:border-slate-750 text-slate-400",
                        ].join(" ")}
                      >
                        {completed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : unlocked ? (
                          lessonIndex + 1
                        ) : (
                          "—"
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink dark:text-slate-50 truncate">{lesson.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{lesson.tagline}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-300">
                        {completed ? "Completed" : unlocked ? `${lesson.estMinutes} min` : "Locked"}
                      </span>
                    </div>
                  );

                  return (
                    <li key={lessonId}>
                      {unlocked ? (
                        <Link
                          href={`/lessons/${level.id}/${lessonId}/`}
                          className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                          aria-label={`${completed ? "Replay" : "Start"} lesson: ${lesson.title}`}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div aria-disabled className="cursor-not-allowed">
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
