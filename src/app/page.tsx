"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { usePreferences } from "@/hooks/useProgress";
import { getAllLessonsInOrder, LEVELS } from "@/lib/curriculum";
import type { AppMode } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return { canInstall: Boolean(deferredPrompt), promptInstall };
}

const MODE_CARDS: { mode: AppMode; title: string; description: string }[] = [
  {
    mode: "focus",
    title: "Focus",
    description: "A roomier, calmer workspace with larger cells — good for reading and working step by step.",
  },
  {
    mode: "analyst",
    title: "Analyst",
    description: "A denser, keyboard-first grid that fits more rows and columns on screen at once.",
  },
];

const OUTCOMES = [
  "15 guided lessons, each with a live spreadsheet",
  "XLOOKUP, dynamic arrays, and your first macro",
  "A formula reference you can search mid-task",
  "Downloadable .xlsx practice files",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, ready, completeOnboarding } = usePreferences();
  const [name, setName] = useState("");
  const [selectedMode, setSelectedMode] = useState<AppMode>("focus");
  const { canInstall, promptInstall } = useInstallPrompt();

  // Returning learners skip straight to the curriculum.
  useEffect(() => {
    if (ready && preferences.hasOnboarded) {
      router.replace("/dashboard/");
    }
  }, [ready, preferences.hasOnboarded, router]);

  const lessonCount = getAllLessonsInOrder().length;
  const levelCount = LEVELS.length;

  function handleStart() {
    const trimmed = name.trim();
    void completeOnboarding(selectedMode, trimmed || preferences.displayName || "there");
    router.push("/dashboard/");
  }

  return (
    <div className="min-h-dvh flex flex-col app-canvas">
      <header className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-display text-lg font-semibold text-ink dark:text-slate-50">Excel Academy</span>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 pb-16 flex flex-col lg:flex-row gap-12 lg:gap-16 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 max-w-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-3">
            A working knowledge of Excel
          </p>
          <h1 className="font-display text-display-lg sm:text-display-xl text-ink dark:text-slate-50">
            Excel skills you can actually use at work.
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-300 leading-relaxed">
            {levelCount} levels, {lessonCount} hands-on lessons. Every one puts you in a real spreadsheet with real
            numbers, and checks your work as you go.
          </p>

          <ul className="mt-7 flex flex-col gap-3">
            {OUTCOMES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[15px] text-ink dark:text-slate-50">
                <span aria-hidden className="text-owl-600 dark:text-owl-300 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full lg:w-[26rem] shrink-0"
        >
          <div className="rounded-3xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-6 shadow-lifted">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                What should we call you?
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="mt-2 w-full rounded-2xl border border-slate-150 dark:border-slate-750 bg-slate-25 dark:bg-slate-925 px-4 py-3 text-ink dark:text-slate-50 outline-none focus:border-owl-400 transition-colors"
              />
            </label>

            <fieldset className="mt-6">
              <legend className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400 mb-2">
                Choose a workspace density
              </legend>
              <div className="flex flex-col gap-2.5">
                {MODE_CARDS.map((card) => {
                  const active = selectedMode === card.mode;
                  return (
                    <button
                      key={card.mode}
                      type="button"
                      onClick={() => setSelectedMode(card.mode)}
                      aria-pressed={active}
                      className={[
                        "text-left rounded-2xl border-2 px-4 py-3 transition-all",
                        active
                          ? "border-owl-400 bg-owl-50 dark:bg-owl-500/10 dark:border-owl-500/50"
                          : "border-slate-150 dark:border-slate-750 hover:border-owl-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink dark:text-slate-50">{card.title}</span>
                        <span
                          className={[
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            active ? "border-owl-500 bg-owl-500" : "border-slate-300",
                          ].join(" ")}
                          aria-hidden
                        >
                          {active && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={handleStart}>
              Start learning →
            </Button>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-3 text-center">
              No account needed. Progress is stored on this device only.
            </p>

            {canInstall && (
              <button
                type="button"
                onClick={promptInstall}
                className="mt-3 w-full text-xs font-semibold text-owl-600 dark:text-owl-300 hover:underline"
              >
                Install as an app
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-400 mt-4 text-center">
            You can change your name and density later from the header.
          </p>
        </motion.div>
      </div>

      <footer className="px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-400">
        Works offline · Nothing to install
      </footer>
    </div>
  );
}
