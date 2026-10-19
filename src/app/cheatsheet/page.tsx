"use client";

import { useMemo, useState } from "react";
import { FORMULA_LIBRARY } from "@/lib/formulaLibrary";

const LEVEL_FILTERS = ["All", "Level 0", "Level 1", "Level 2", "Level 3", "Level 4"] as const;

export default function CheatSheetPage() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<(typeof LEVEL_FILTERS)[number]>("All");
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULA_LIBRARY.filter((entry) => {
      const matchesLevel = levelFilter === "All" || entry.level === levelFilter;
      const matchesQuery =
        q === "" ||
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.syntax.toLowerCase().includes(q) ||
        (entry.useCase?.toLowerCase().includes(q) ?? false);
      return matchesLevel && matchesQuery;
    });
  }, [query, levelFilter]);

  async function copySyntax(syntax: string) {
    try {
      await navigator.clipboard.writeText(syntax);
      setCopied(syntax);
      setTimeout(() => setCopied((c) => (c === syntax ? null : c)), 1500);
    } catch {
      // Clipboard access can be denied; the syntax is still selectable on screen.
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-owl-600 dark:text-owl-300 mb-2">Reference</p>
        <h1 className="font-display text-display sm:text-display-lg text-ink dark:text-slate-50">Formula reference</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-300 max-w-2xl leading-relaxed">
          Every function the curriculum covers — syntax, what it does, and where you&rsquo;d actually use it. Tap any
          syntax to copy it.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-cream/85 dark:bg-slate-925/85 backdrop-blur-md">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SUM, XLOOKUP, reference…"
            aria-label="Search formulas"
            className="w-full rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 pl-11 pr-4 py-3 text-ink dark:text-slate-50 outline-none shadow-card focus:border-owl-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {LEVEL_FILTERS.map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                levelFilter === level
                  ? "bg-owl-500 text-white shadow-card"
                  : "bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-750 text-slate-500 dark:text-slate-300 hover:border-owl-300",
              ].join(" ")}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-4 mb-3 tnum">
        {results.length} {results.length === 1 ? "entry" : "entries"}
        {query ? ` for “${query}”` : ""}
      </p>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-750 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-300">No formulas match that search yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((entry) => (
            <li
              key={entry.name}
              className="flex flex-col rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4 shadow-card transition-all hover:border-owl-300 hover:shadow-raised"
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h2 className="font-display font-bold text-ink dark:text-slate-50">{entry.name}</h2>
                <span className="text-[11px] font-bold uppercase tracking-wide text-owl-600 dark:text-owl-300">
                  {entry.level}
                </span>
              </div>

              <button
                type="button"
                onClick={() => copySyntax(entry.syntax)}
                className="group mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-25 dark:bg-slate-925 border border-slate-150/70 dark:border-slate-800 px-3 py-2 text-left"
                aria-label={`Copy syntax ${entry.syntax}`}
              >
                <code className="font-mono text-sm text-sky-700 dark:text-sky-400 truncate">{entry.syntax}</code>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400 group-hover:text-owl-600">
                  {copied === entry.syntax ? "Copied" : "Copy"}
                </span>
              </button>

              <p className="text-sm text-slate-500 dark:text-slate-300 mt-3 leading-relaxed">{entry.description}</p>
              {entry.useCase && (
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
                  <span className="font-semibold text-ink dark:text-slate-50">Use it for: </span>
                  {entry.useCase}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-3 bg-owl-50/60 dark:bg-owl-500/10 rounded-lg px-2.5 py-2 font-mono">
                {entry.example}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
