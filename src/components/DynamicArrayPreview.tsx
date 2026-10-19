"use client";

import { motion } from "framer-motion";

interface DynamicArrayPreviewProps {
  title?: string;
  values: (string | number)[];
}

/**
 * Shows what a dynamic array formula "spills" into neighboring cells.
 * Real spill behavior lives inside actual grid cells in modern Excel; here
 * it's rendered as its own preview strip rather than writing into cells the
 * learner didn't type into, which keeps the distinction between "a formula
 * you wrote" and "cells it filled for you" visually honest.
 */
export function DynamicArrayPreview({ title, values }: DynamicArrayPreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 p-4">
      {title && <h3 className="font-display font-bold text-ink dark:text-slate-50 mb-3 text-sm">{title}</h3>}
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <motion.div
            key={`${v}-${i}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg bg-owl-50 dark:bg-owl-500/10 border border-owl-200 dark:border-owl-500/30 px-3 py-1.5 font-mono text-sm text-owl-700 dark:text-owl-300"
          >
            {v}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-300 mt-3">
        All of these values &ldquo;spilled&rdquo; out of the one formula you typed — that&rsquo;s a Dynamic Array.
      </p>
    </div>
  );
}
