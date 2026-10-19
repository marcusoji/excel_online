"use client";

import { usePreferences, useAllLessonProgress } from "@/hooks/useProgress";
import { LEVELS } from "@/lib/curriculum";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";

export default function CertificatePage() {
  const { preferences } = usePreferences();
  const allProgress = useAllLessonProgress();
  const completed = new Set((allProgress ?? []).filter((p) => p.completed).map((p) => p.lessonId));

  const earnedLevels = LEVELS.filter((level) => level.lessonIds.length > 0 && level.lessonIds.every((id) => completed.has(id)));
  const totalEarnable = LEVELS.length;
  const earned = earnedLevels.length;
  const pct = Math.round((earned / totalEarnable) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <header className="mb-8 no-print">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-2">Records</p>
        <h1 className="font-display text-display text-ink dark:text-slate-50">Certificates</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-300 max-w-2xl leading-relaxed">
          Finish every lesson in a level and a certificate is issued below. Print it or save it as a PDF for a
          professional development record.
        </p>

        <div className="mt-5 rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card">
          <div className="flex items-center justify-between text-sm font-semibold text-ink dark:text-slate-50 mb-2">
            <span>{earned} of {totalEarnable} certificates earned</span>
            <span className="tnum">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-150 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-owl-500 to-owl-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {earnedLevels.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-750 px-6 py-14 text-center no-print">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="9" r="5" />
              <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
            </svg>
          </div>
          <p className="font-semibold text-ink dark:text-slate-50">No certificates yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Complete every lesson in a level to earn your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {earnedLevels.map((level) => (
            <div key={level.id} className="break-inside-avoid">
              {/* The certificate itself — deliberately formal, chrome-free. */}
              <div className="relative overflow-hidden rounded-3xl border border-owl-300 dark:border-owl-500/40 bg-white dark:bg-slate-850 px-8 py-11 text-center shadow-raised">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  aria-hidden
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #2E9E5B 0 1px, transparent 1px 14px)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <BrandMark size={24} />
                    <span className="font-display text-sm font-semibold text-owl-700 dark:text-owl-300 tracking-wide">
                      Excel Academy
                    </span>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
                    Certificate of Completion
                  </p>

                  <p className="text-slate-500 dark:text-slate-300 mt-5 text-sm">This certifies that</p>
                  <p className="font-display text-display-sm sm:text-display text-ink dark:text-slate-50 my-2">
                    {preferences.displayName}
                  </p>
                  <p className="text-slate-500 dark:text-slate-300 text-sm">
                    has successfully completed all {level.lessonIds.length} lessons of
                  </p>
                  <p className="font-display text-xl text-owl-700 dark:text-owl-300 mt-2">
                    Level {level.order} · {level.title}
                  </p>

                  <div className="mt-7 mx-auto h-px w-40 bg-slate-200 dark:bg-slate-700" aria-hidden />
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-3">{level.description}</p>
                </div>
              </div>
              <div className="flex justify-center mt-4 no-print">
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
