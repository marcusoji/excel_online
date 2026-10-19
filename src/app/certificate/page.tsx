"use client";

import { useBadges, usePreferences } from "@/hooks/useProgress";
import { LEVEL_BADGES } from "@/lib/badges";
import { Button } from "@/components/Button";

export default function CertificatePage() {
  const { preferences } = usePreferences();
  const badges = useBadges();
  const earnedLevelBadgeIds = new Set((badges ?? []).map((b) => b.badgeId).filter((id) => id.startsWith("level-")));
  const earnedCertificates = Object.values(LEVEL_BADGES).filter((b) => earnedLevelBadgeIds.has(b.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50 mb-2 no-print">My certificates</h1>
      <p className="text-slate-500 dark:text-slate-300 mb-8 no-print">
        Finish every lesson in a level to earn a certificate here. Each one is yours to print or save as a PDF.
      </p>

      {earnedCertificates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-150 dark:border-slate-750 px-6 py-10 text-center no-print">
          <div className="text-4xl mb-3">🎓</div>
          <p className="text-slate-500 dark:text-slate-300">No certificates yet — complete every lesson in a level to earn your first one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {earnedCertificates.map((cert) => (
            <div key={cert.id} className="break-inside-avoid">
              <div className="rounded-3xl border-4 border-double border-owl-400 bg-white dark:bg-slate-850 px-8 py-10 text-center">
                <div className="text-4xl mb-3" aria-hidden>
                  🏆
                </div>
                <p className="text-xs font-bold tracking-wide text-owl-600 dark:text-owl-300 mb-1">Excel Magic Academy</p>
                <h2 className="font-display text-2xl font-bold text-ink dark:text-slate-50 mb-4">Certificate of Achievement</h2>
                <p className="text-slate-500 dark:text-slate-300">This certifies that</p>
                <p className="font-display text-3xl font-bold text-owl-600 dark:text-owl-300 my-2">{preferences.displayName}</p>
                <p className="text-slate-500 dark:text-slate-300">has successfully completed</p>
                <p className="font-display text-xl font-bold text-ink dark:text-slate-50 mt-1">{cert.name}</p>
              </div>
              <div className="flex justify-center mt-3 no-print">
                <Button variant="secondary" size="md" onClick={() => window.print()}>
                  🖨 Print / Save as PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
