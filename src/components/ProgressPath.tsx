"use client";

import Link from "next/link";
import { LEVELS, getAllLessonsInOrder, isLessonUnlocked } from "@/lib/curriculum";
import type { LessonProgress } from "@/types";

const LEVEL_ACCENT: Record<string, string> = {
  owl: "border-owl-200 bg-owl-50 dark:bg-owl-500/10 dark:border-owl-500/30",
  sky: "border-sky-400/40 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-500/30",
  coral: "border-coral-400/40 bg-coral-50 dark:bg-coral-500/10 dark:border-coral-500/30",
  gold: "border-gold-400/50 bg-gold-50 dark:bg-gold-500/10 dark:border-gold-500/30",
};

const LEVEL_DOT: Record<string, string> = {
  owl: "bg-owl-500",
  sky: "bg-sky-500",
  coral: "bg-coral-500",
  gold: "bg-gold-500",
};

interface ProgressPathProps {
  progressByLessonId: Record<string, LessonProgress>;
}

export function ProgressPath({ progressByLessonId }: ProgressPathProps) {
  const orderedLessons = getAllLessonsInOrder();
  const orderedIds = orderedLessons.map((l) => l.id);
  const completed = new Set(
    Object.values(progressByLessonId)
      .filter((p) => p.completed)
      .map((p) => p.lessonId)
  );

  function isUnlocked(lessonId: string): boolean {
    return isLessonUnlocked(lessonId, completed);
  }

  return (
    <div className="flex flex-col gap-8">
      {LEVELS.map((level) => {
        const done = level.lessonIds.filter((id) => completed.has(id)).length;
        const levelDone = level.lessonIds.length > 0 && done === level.lessonIds.length;
        return (
          <section key={level.id}>
            <div className={`rounded-2xl border px-4 py-3.5 mb-4 ${LEVEL_ACCENT[level.color]}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg text-ink dark:text-slate-50 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[level.color]}`} aria-hidden />
                  Level {level.order} · {level.title}
                </h2>
                <span
                  className={[
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tnum",
                    levelDone
                      ? "bg-owl-500 text-white"
                      : "bg-white/70 text-slate-500 dark:bg-slate-925/60 dark:text-slate-300",
                  ].join(" ")}
                >
                  {levelDone ? "Complete" : `${done}/${level.lessonIds.length}`}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1.5">{level.description}</p>
            </div>

            <ul className="flex flex-col gap-2">
              {level.lessonIds.map((lessonId) => {
                const lesson = orderedLessons.find((l) => l.id === lessonId);
                if (!lesson) return null;
                const unlocked = isUnlocked(lessonId);
                const isCompleted = completed.has(lessonId);
                const globalIndex = orderedIds.indexOf(lessonId);

                const inner = (
                  <div
                    className={[
                      "group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all",
                      unlocked
                        ? "border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-owl-300 hover:shadow-raised"
                        : "border-slate-150/70 dark:border-slate-800 bg-slate-25/60 dark:bg-slate-925/50 opacity-70",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className={[
                        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border-2 tnum",
                        isCompleted
                          ? "bg-owl-500 border-owl-500 text-white"
                          : unlocked
                            ? "border-owl-300 text-owl-700 dark:text-owl-300 bg-owl-50/60 dark:bg-owl-500/10"
                            : "border-slate-150 dark:border-slate-750 text-slate-400",
                      ].join(" ")}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : unlocked ? (
                        globalIndex + 1
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
                          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink dark:text-slate-50 truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 truncate mt-0.5">{lesson.tagline}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-300 flex items-center gap-2">
                      {isCompleted ? "Completed" : unlocked ? `${lesson.estMinutes} min` : "Locked"}
                      {unlocked && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-owl-500"
                          aria-hidden
                        >
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      )}
                    </span>
                  </div>
                );

                return (
                  <li key={lessonId}>
                    {unlocked ? (
                      <Link
                        href={`/lessons/${level.id}/${lessonId}/`}
                        className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                        aria-label={`${isCompleted ? "Replay" : "Start"} lesson: ${lesson.title}`}
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
          </section>
        );
      })}
    </div>
  );
}
