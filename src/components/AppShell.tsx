"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db, DEFAULT_PREFERENCES, verifyStorageIsWritable } from "@/lib/db";
import { usePreferences } from "@/hooks/useProgress";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ModeToggle } from "@/components/ModeToggle";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

/** Runs once on first load: makes sure a preferences row exists so every
 *  other hook can assume `preferences` is never truly "missing". */
function useSeedPreferences() {
  useEffect(() => {
    (async () => {
      try {
        const existing = await db.preferences.get("singleton");
        if (!existing) await db.preferences.put(DEFAULT_PREFERENCES);
      } catch (err) {
        console.warn("Could not seed preferences in IndexedDB:", err);
      }
    })();
  }, []);
}

function useAppliedTheme() {
  const { preferences, ready } = usePreferences();

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const prefersDarkSystem = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = preferences.theme === "dark" || (preferences.theme === "system" && prefersDarkSystem);
    root.classList.toggle("dark", shouldBeDark);
  }, [preferences.theme, ready]);
}

/**
 * Detects browsers/modes where IndexedDB silently doesn't work — most
 * commonly Safari Private Browsing, which throws on IndexedDB access
 * entirely rather than degrading gracefully. We can't make storage work
 * in that mode, but we can stop pretending progress is being saved.
 */
function useStorageStatus(): "checking" | "ok" | "unavailable" {
  const [status, setStatus] = useState<"checking" | "ok" | "unavailable">("checking");
  useEffect(() => {
    let cancelled = false;
    verifyStorageIsWritable().then((writable) => {
      if (!cancelled) setStatus(writable ? "ok" : "unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  useSeedPreferences();
  useAppliedTheme();
  const pathname = usePathname();
  const storageStatus = useStorageStatus();
  const isOnboarding = pathname === "/";

  return (
    <>
      <ServiceWorkerRegister />
      {storageStatus === "unavailable" && (
        <div className="no-print bg-coral-400/10 border-b border-coral-400/30 px-4 py-2 text-center text-xs sm:text-sm text-coral-600 dark:text-coral-400">
          This browser is blocking on-device storage right now (common in Private Browsing) — your progress won&rsquo;t be saved this session.
        </div>
      )}
      {!isOnboarding && (
        <header className="no-print sticky top-0 z-40 border-b border-slate-150 dark:border-slate-750 bg-cream/90 dark:bg-slate-925/90 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-5 min-w-0">
              <Link href="/dashboard/" className="font-display text-base font-bold text-ink dark:text-slate-50 whitespace-nowrap">
                Excel Academy
              </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-300">
                <Link href="/dashboard/" className="hover:text-owl-600 dark:hover:text-owl-300">Curriculum</Link>
                <Link href="/practice/" className="hover:text-owl-600 dark:hover:text-owl-300">Practice</Link>
                <Link href="/cheatsheet/" className="hover:text-owl-600 dark:hover:text-owl-300">Reference</Link>
                <Link href="/certificate/" className="hover:text-owl-600 dark:hover:text-owl-300">Certificates</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <OfflineIndicator />
              <ModeToggle />
            </div>
          </div>
        </header>
      )}
      <main>{children}</main>
    </>
  );
}
