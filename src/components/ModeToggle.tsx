"use client";

import { usePreferences } from "@/hooks/useProgress";

/**
 * Density + theme controls. Density is a *spacing* choice — the curriculum
 * is identical either way — so it lives next to the theme switch rather than
 * being framed as a persona.
 */
export function ModeToggle() {
  const { preferences, setMode, setTheme } = usePreferences();

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex rounded-full bg-slate-150/80 dark:bg-slate-800 p-0.5"
        role="radiogroup"
        aria-label="Workspace density"
      >
        {(["focus", "analyst"] as const).map((m) => {
          const active = preferences.mode === m;
          return (
            <button
              key={m}
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m)}
              className={[
                "rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-colors",
                active
                  ? "bg-white text-owl-700 shadow-card dark:bg-slate-925 dark:text-owl-300"
                  : "text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-slate-50",
              ].join(" ")}
            >
              {m === "focus" ? "Focus" : "Analyst"}
            </button>
          );
        })}
      </div>

      <button
        aria-label={preferences.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(preferences.theme === "dark" ? "light" : "dark")}
        className="h-9 w-9 rounded-full bg-slate-150/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors"
      >
        {preferences.theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
