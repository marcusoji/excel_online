"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db, DEFAULT_PREFERENCES, verifyStorageIsWritable } from "@/lib/db";
import { usePreferences } from "@/hooks/useProgress";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ModeToggle } from "@/components/ModeToggle";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { BrandMark } from "@/components/BrandMark";

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

const NAV = [
  { href: "/dashboard/", label: "Curriculum" },
  { href: "/practice/", label: "Practice" },
  { href: "/cheatsheet/", label: "Reference" },
  { href: "/certificate/", label: "Certificates" },
];

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
        <div className="no-print bg-coral-50 border-b border-coral-400/30 px-4 py-2 text-center text-xs sm:text-sm text-coral-700 dark:bg-coral-500/10 dark:text-coral-400">
          This browser is blocking on-device storage right now (common in Private Browsing) — your progress won&rsquo;t be saved this session.
        </div>
      )}
      {!isOnboarding && (
        <header className="no-print sticky top-0 z-40 border-b border-slate-150/80 dark:border-slate-800 bg-cream/85 dark:bg-slate-925/85 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-6 min-w-0">
              <Link
                href="/dashboard/"
                className="flex items-center gap-2.5 font-display text-[17px] font-semibold text-ink dark:text-slate-50 whitespace-nowrap"
              >
                <BrandMark size={26} />
                Excel Academy
              </Link>
              <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "rounded-full px-3 py-1.5 transition-colors",
                        active
                          ? "bg-owl-50 text-owl-700 dark:bg-owl-500/15 dark:text-owl-300"
                          : "text-slate-500 hover:bg-slate-150/70 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <OfflineIndicator />
              </div>
              <ModeToggle />
            </div>
          </div>
        </header>
      )}
      <main className="app-canvas min-h-[calc(100dvh-4rem)]">{children}</main>
    </>
  );
}
