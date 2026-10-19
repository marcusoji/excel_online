"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#2E9E5B", "#FF7A45", "#3FA9EA", "#F5B800", "#7FD59B"];

interface ConfettiProps {
  reducedMotion?: boolean;
}

/**
 * A single celebratory burst. Mount it when a lesson completes and unmount
 * it a couple seconds later — it doesn't manage its own lifecycle.
 *
 * When reducedMotion is set, we skip the animated burst entirely rather than
 * offering a "gentler" motion version: WCAG 2.2's reduced-motion guidance is
 * about avoiding the effect, not softening it.
 */
export function Confetti({ reducedMotion = false }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.3,
        duration: 1.1 + Math.random() * 0.6,
        rotate: Math.random() > 0.5 ? 360 : -360,
        drift: (Math.random() - 0.5) * 80,
        size: 6 + Math.random() * 6,
      })),
    []
  );

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: "100vh", x: p.drift, opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
