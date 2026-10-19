"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import { usePreferences } from "@/hooks/useProgress";
import type { AppMode } from "@/types";

function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const iPhoneLike = /iPhone|iPad|iPod/i.test(ua);
    const iPadOS13Plus = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setIsIOS(iPhoneLike || iPadOS13Plus);
  }, []);
  return isIOS;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const promptInstall = async () => {
    const evt = deferredPrompt as (Event & { prompt?: () => Promise<void> }) | null;
    if (evt?.prompt) {
      await evt.prompt();
      setDeferredPrompt(null);
    }
  };
  return { canInstall: Boolean(deferredPrompt), promptInstall };
}

const MODE_CARDS: { mode: AppMode; title: string; description: string; emoji: string }[] = [
  {
    mode: "kid",
    title: "Young Explorer",
    description: "Bright colors, toy-box examples, and confetti every time you level up.",
    emoji: "🌟",
  },
  {
    mode: "pro",
    title: "Office Toolkit",
    description: "A calmer, denser workspace built for real formulas and real work.",
    emoji: "💼",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, ready, completeOnboarding } = usePreferences();
  const [selectedMode, setSelectedMode] = useState<AppMode>("kid");
  const [name, setName] = useState("");
  const isIOS = useIsIOS();
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (ready && preferences.hasOnboarded) {
      router.replace("/dashboard/");
    }
  }, [ready, preferences.hasOnboarded, router]);

  async function handleStart() {
    await completeOnboarding(selectedMode, name.trim() || "Explorer");
    router.push("/dashboard/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-5xl mb-4" aria-hidden>
            🪄
          </div>
          <h1 className="font-display text-4xl font-bold text-ink dark:text-slate-50 leading-tight">
            Turn spreadsheets into your favorite subject.
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-300">
            Excel Magic Academy teaches real spreadsheet skills through playful, hands-on lessons — colorful enough
            for a six-year-old, sharp enough for the office. Everything happens right here, even offline.
          </p>
        </motion.div>

        <div>
          <h2 className="font-display text-lg font-bold text-ink dark:text-slate-50 mb-3">Choose how it looks for you</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MODE_CARDS.map((card) => (
              <button
                key={card.mode}
                onClick={() => setSelectedMode(card.mode)}
                className={[
                  "text-left rounded-2xl border-2 p-4 transition-all",
                  selectedMode === card.mode
                    ? "border-owl-500 bg-owl-50 dark:bg-owl-500/10 shadow-card"
                    : "border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 hover:border-owl-200",
                ].join(" ")}
                aria-pressed={selectedMode === card.mode}
              >
                <div className="text-2xl mb-2">{card.emoji}</div>
                <div className="font-display font-bold text-ink dark:text-slate-50">{card.title}</div>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{card.description}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">You can switch modes anytime from the top bar.</p>
        </div>

        {selectedMode === "kid" && (
          <div>
            <label htmlFor="explorer-name" className="block font-display font-bold text-ink dark:text-slate-50 mb-2">
              What should we call you?
            </label>
            <input
              id="explorer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Explorer"
              className="w-full rounded-2xl border-2 border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-3 text-ink dark:text-slate-50 outline-none focus:border-owl-400"
              maxLength={24}
            />
          </div>
        )}

        <Button variant="primary" size="lg" onClick={handleStart}>
          Start my Excel adventure →
        </Button>

        <section className="rounded-2xl bg-slate-25 dark:bg-slate-925 border border-slate-150 dark:border-slate-750 p-5">
          <h2 className="font-display font-bold text-ink dark:text-slate-50 mb-2">📲 Add it to your Home Screen</h2>
          {isIOS ? (
            <ol className="text-sm text-slate-500 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>
                Tap the <strong className="text-ink dark:text-slate-50">Share</strong> icon in Safari&rsquo;s toolbar.
              </li>
              <li>
                Scroll down and tap <strong className="text-ink dark:text-slate-50">Add to Home Screen</strong>.
              </li>
              <li>Tap Add — it now opens full-screen, just like a regular app, and works offline.</li>
            </ol>
          ) : canInstall ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-300">Install it for a full-screen, offline-ready app.</p>
              <Button variant="secondary" size="md" onClick={promptInstall}>
                Install
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Look for an install icon in your browser&rsquo;s address bar, or use your browser&rsquo;s menu → &ldquo;Install app&rdquo;
              / &ldquo;Add to Home Screen&rdquo;.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
