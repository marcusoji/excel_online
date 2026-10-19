"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-owl-500 text-white shadow-press shadow-owl-700 hover:brightness-105 active:translate-y-1 active:shadow-none " +
    "dark:bg-owl-400 dark:shadow-owl-800",
  secondary:
    "bg-white text-owl-700 border-2 border-owl-200 shadow-press-sm shadow-owl-100 hover:bg-owl-50 active:translate-y-1 active:shadow-none " +
    "dark:bg-slate-750 dark:text-owl-200 dark:border-slate-750 dark:shadow-slate-925",
  ghost: "bg-transparent text-ink hover:bg-slate-150 active:bg-slate-150 dark:text-slate-50 dark:hover:bg-slate-750",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "text-[15px] px-5 py-3 rounded-2xl gap-2",
  lg: "text-lg px-7 py-4 rounded-chunky gap-3",
};

/**
 * The signature "pressable" button: a solid offset shadow that collapses
 * when tapped, rather than a soft blurred drop-shadow. Reads as tactile at
 * any size, which matters for small touch targets on phones.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, fullWidth, className = "", children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-body font-bold transition-all duration-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
        "disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});
