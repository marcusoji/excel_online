"use client";

import { usePreferences } from "@/hooks/useProgress";

/**
 * Density toggle. The curriculum is the same either way — this only changes
 * how much of the workspace is visible at once.
 */
export function ModeToggle() {
  const { preferences, setMode, setTheme } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full bg-slate-150 dark:bg-slate-750 p-1" role="radiogroup" aria-label="Workspace density">
        {(["focus", "analyst"] as const).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={preferences.mode === m}
            onClick={() => setMode(m)}
            className={[
              "rounded-full px-3 py-1.5 text-sm font-bold transition-colors",
              preferences.mode === m ? "bg-white dark:bg-slate-925 text-owl-600 dark:text-owl-300 shadow-card" : "text-slate-500 dark:text-slate-300",
            ].join(" ")}
          >
            {m === "focus" ? "Focus" : "Analyst"}
          </button>
        ))}
      </div>

      <button
        aria-label={preferences.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(preferences.theme === "dark" ? "light" : "dark")}
        className="h-9 w-9 rounded-full bg-slate-150 dark:bg-slate-750 flex items-center justify-center text-lg"
      >
        {preferences.theme === "dark" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
