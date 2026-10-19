"use client";

import { usePreferences, useAllLessonProgress } from "@/hooks/useProgress";
import { LEVELS } from "@/lib/curriculum";
import { Button } from "@/components/Button";

export default function CertificatePage() {
  const { preferences } = usePreferences();
  const allProgress = useAllLessonProgress();
  const completed = new Set((allProgress ?? []).filter((p) => p.completed).map((p) => p.lessonId));

  const earnedLevels = LEVELS.filter((level) => level.lessonIds.length > 0 && level.lessonIds.every((id) => completed.has(id)));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50 mb-2 no-print">Certificates</h1>
      <p className="text-slate-500 dark:text-slate-300 mb-8 no-print">
        Complete every lesson in a level to earn a certificate. Each one is yours to print or save as a PDF — useful for
        a learning log or a professional development record.
      </p>

      {earnedLevels.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-150 dark:border-slate-750 px-6 py-10 text-center no-print">
          <p className="text-slate-500 dark:text-slate-300">
            No certificates yet — complete every lesson in a level to earn your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {earnedLevels.map((level) => (
            <div key={level.id} className="break-inside-avoid">
              <div className="rounded-2xl border-2 border-owl-400 bg-white dark:bg-slate-850 px-8 py-10 text-center">
                <p className="text-xs font-bold tracking-wide text-owl-600 dark:text-owl-300 mb-1">Excel Academy</p>
                <h2 className="font-display text-2xl font-bold text-ink dark:text-slate-50 mb-4">Certificate of Completion</h2>
                <p className="text-slate-500 dark:text-slate-300">This certifies that</p>
                <p className="font-display text-3xl font-bold text-owl-600 dark:text-owl-300 my-2">{preferences.displayName}</p>
                <p className="text-slate-500 dark:text-slate-300">has successfully completed every lesson in</p>
                <p className="font-display text-xl font-bold text-ink dark:text-slate-50 mt-1">
                  Level {level.order} · {level.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-4">
                  {level.lessonIds.length} lessons · {level.description}
                </p>
              </div>
              <div className="flex justify-center mt-3 no-print">
                <Button variant="secondary" size="md" onClick={() => window.print()}>
                  Print / Save as PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
