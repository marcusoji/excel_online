"use client";

import { useMemo, useState } from "react";
import { FORMULA_LIBRARY } from "@/lib/formulaLibrary";

const LEVEL_FILTERS = ["All", "Level 0", "Level 1", "Level 2", "Level 3", "Level 4"] as const;

export default function CheatSheetPage() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<(typeof LEVEL_FILTERS)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULA_LIBRARY.filter((entry) => {
      const matchesLevel = levelFilter === "All" || entry.level === levelFilter;
      const matchesQuery =
        q === "" ||
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.syntax.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [query, levelFilter]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-ink dark:text-slate-50 mb-2">Formula cheat sheet</h1>
      <p className="text-slate-500 dark:text-slate-300 mb-6">Search any function you&rsquo;ve learned — or peek ahead at what&rsquo;s coming.</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search SUM, IF, lookup…"
        aria-label="Search formulas"
        className="w-full rounded-2xl border-2 border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 px-4 py-3 text-ink dark:text-slate-50 outline-none focus:border-owl-400 mb-3"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {LEVEL_FILTERS.map((level) => (
          <button
            key={level}
            onClick={() => setLevelFilter(level)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              levelFilter === level
                ? "bg-owl-500 text-white"
                : "bg-slate-150 dark:bg-slate-750 text-slate-500 dark:text-slate-300",
            ].join(" ")}
          >
            {level}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">No formulas match that search yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((entry) => (
            <li key={entry.name} className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h2 className="font-display font-bold text-ink dark:text-slate-50">{entry.name}</h2>
                <span className="text-xs font-semibold text-owl-600 dark:text-owl-300">{entry.level}</span>
              </div>
              <code className="block mt-1 font-mono text-sm text-sky-600 dark:text-sky-400">{entry.syntax}</code>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">{entry.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-2 bg-slate-25 dark:bg-slate-925 rounded-lg px-2 py-1.5 font-mono">
                {entry.example}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
