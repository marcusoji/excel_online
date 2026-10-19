"use client";

import { motion } from "framer-motion";

interface MiniBarChartProps {
  title?: string;
  data: { label: string; value: number }[];
  color?: string;
}

/**
 * A small, live bar chart — genuinely recomputed from the grid on every
 * render, not a static illustration. This is what makes a lesson's "now
 * watch the chart update itself" moment actually true.
 */
export function MiniBarChart({ title, data, color = "#2E9E5B" }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => Math.max(0, d.value)));

  return (
    <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
      {title && <h3 className="font-display font-bold text-ink dark:text-slate-50 mb-3 text-sm">{title}</h3>}
      <div className="flex items-end gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="w-full h-24 flex items-end">
              <motion.div
                className="w-full rounded-t-lg"
                style={{ backgroundColor: color }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(0, Math.min(100, (d.value / max) * 100))}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 truncate w-full text-center">{d.label}</span>
            <span className="text-xs font-bold text-ink dark:text-slate-50">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
