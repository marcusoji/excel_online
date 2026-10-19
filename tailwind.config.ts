import type { Config } from "tailwindcss";

/**
 * Design tokens — Excel Magic Academy
 *
 * Kid Mode:  warm, tactile, Duolingo-adjacent. Owl-green primary, chunky
 *            "pressed button" shadows, generous rounding.
 * Pro Mode:  calm, Notion-adjacent reading surface. Same green family,
 *            desaturated, tighter rounding, hairline borders.
 *
 * Both modes share one hue family so progress (XP, streaks, the green
 * checkmark) reads the same everywhere — only the surrounding chrome shifts.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core owl-green progress color, full ramp so both modes can pick
        // the right step (kid mode = punchier 500/600, pro mode = quieter 600/700).
        owl: {
          50: "#EFFBF1",
          100: "#D8F3DD",
          200: "#B0E6BE",
          300: "#7FD59B",
          400: "#4FB477",
          500: "#2E9E5B", // primary CTA
          600: "#237E48", // pressed / bottom-shadow
          700: "#1C6339",
          800: "#164E2E",
          900: "#123F26",
        },
        coral: {
          400: "#FF9F6B",
          500: "#FF7A45",
          600: "#E85F2C",
        },
        sky: {
          400: "#6CC3F5",
          500: "#3FA9EA",
          600: "#2A8FCC",
        },
        gold: {
          300: "#FFE59A",
          400: "#FFD24C",
          500: "#F5B800",
        },
        cream: "#FFFBF2",
        ink: "#2B2A26",
        paper: "#FFFFFF",
        // Pro-mode reading surface (Notion-like)
        slate: {
          25: "#FAFAF9",
          50: "#F5F5F4",
          150: "#EDECE9",
          750: "#2A2A28",
          850: "#1E1E1C",
          925: "#151513",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        chunky: "1.25rem",
        cell: "0.375rem",
      },
      boxShadow: {
        // Duolingo-style tactile "3D" button: a solid offset shadow, not a blur.
        press: "0 4px 0 0 var(--tw-shadow-color)",
        "press-sm": "0 3px 0 0 var(--tw-shadow-color)",
        card: "0 1px 2px rgba(43, 42, 38, 0.06), 0 1px 1px rgba(43, 42, 38, 0.04)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "cell-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(46, 158, 91, 0.45)" },
          "50%": { boxShadow: "0 0 0 6px rgba(46, 158, 91, 0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 180ms cubic-bezier(0.2, 0.8, 0.3, 1.2)",
        "cell-pulse": "cell-pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
