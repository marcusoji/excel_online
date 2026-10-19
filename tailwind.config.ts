import type { Config } from "tailwindcss";

/**
 * Design tokens — Excel Academy
 *
 * A single, professional system rather than two visual personalities. The
 * palette is a deep "ink" neutral ramp with one confident green accent, so
 * progress and primary actions read the same everywhere. Depth comes from a
 * small, consistent elevation scale (cards float on a warm canvas) rather
 * than from loud borders.
 *
 * Density is a *spacing* choice (`focus` vs `analyst`), not a colour one:
 * both modes share every token below.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary green. 500 is the CTA, 600 the pressed/hover step.
        owl: {
          50: "#ECFAF1",
          100: "#D2F2DE",
          200: "#A6E5BE",
          300: "#6FD39B",
          400: "#3FBA78",
          500: "#2E9E5B",
          600: "#237E48",
          700: "#1C6339",
          800: "#164E2E",
          900: "#123F26",
          950: "#0A2417",
        },
        coral: {
          50: "#FFF2EC",
          400: "#FF9F6B",
          500: "#FF7A45",
          600: "#E85F2C",
          700: "#C24A1D",
        },
        sky: {
          50: "#EDF7FE",
          400: "#6CC3F5",
          500: "#3FA9EA",
          600: "#2A8FCC",
          700: "#1F6E9E",
        },
        gold: {
          50: "#FFF9E6",
          300: "#FFE59A",
          400: "#FFD24C",
          500: "#F5B800",
          600: "#C79400",
        },
        // Warm "paper" canvas the app sits on.
        cream: "#FBF7EF",
        ink: "#1F1E1B",
        paper: "#FFFFFF",
        // Neutral ramp — used for both surfaces and text. Kept under `slate`
        // so existing utility names continue to resolve.
        slate: {
          25: "#FBFAF8",
          50: "#F5F4F1",
          100: "#EEEDE9",
          150: "#E4E2DC",
          200: "#D8D6CE",
          300: "#B6B3A9",
          400: "#8E8B81",
          500: "#6B6862",
          600: "#514F49",
          700: "#3D3B36",
          750: "#33322E",
          800: "#26251F",
          850: "#1E1D19",
          925: "#141311",
          950: "#0C0B0A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Editorial display sizes with tight leading for headlines.
        "display-sm": ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        display: ["2.25rem", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        "display-lg": ["3rem", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        chunky: "1.25rem",
        cell: "0.375rem",
      },
      boxShadow: {
        // Tactile button press — a solid offset, not a blur.
        press: "0 4px 0 0 var(--tw-shadow-color)",
        "press-sm": "0 3px 0 0 var(--tw-shadow-color)",
        // A single, consistent elevation scale for surfaces.
        card: "0 1px 2px rgba(31, 30, 27, 0.05), 0 1px 1px rgba(31, 30, 27, 0.03)",
        raised: "0 4px 12px -2px rgba(31, 30, 27, 0.09), 0 2px 4px -2px rgba(31, 30, 27, 0.05)",
        lifted: "0 18px 40px -12px rgba(31, 30, 27, 0.22), 0 6px 14px -8px rgba(31, 30, 27, 0.12)",
        ring: "0 0 0 1px rgba(31, 30, 27, 0.06)",
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
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 180ms cubic-bezier(0.2, 0.8, 0.3, 1.2)",
        "cell-pulse": "cell-pulse 1.4s ease-in-out infinite",
        "fade-up": "fade-up 380ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
