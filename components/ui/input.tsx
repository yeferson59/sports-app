import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Styled Input component that adapts styling depending on the input `type`.
 * - text-like inputs (text, email, password, tel, etc.) get a full-width, rounded style.
 * - checkbox / radio inputs get compact control styles and accessibility focus rings.
 *
 * This keeps visual consistency with the app theme (dark/light) while making
 * form controls look correct in the register/login pages.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    // Base class shared across types
    const base = "outline-none transition-colors motion-safe:duration-150";

    // Styles for textual inputs
    const textStyles = cn(
      "min-w-0 w-full rounded-md text-sm px-3 py-2",
      // visual & theme-aware
      "bg-white/5 border border-white/10 text-white placeholder:text-slate-400 shadow-sm",
      // focus
      "focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2",
    );

    // Styles for checkbox inputs
    const checkboxStyles = cn(
      "inline-block align-middle",
      "h-4 w-4 rounded-sm",
      "border-white/20 bg-white/3",
      // accent color for supported browsers
      "accent-emerald-400",
      "focus-visible:ring-2 focus-visible:ring-emerald-300",
    );

    // Styles for radio inputs
    const radioStyles = cn(
      "inline-block align-middle",
      "h-4 w-4 rounded-full",
      "border-white/20 bg-white/3",
      "accent-emerald-400",
      "focus-visible:ring-2 focus-visible:ring-emerald-300",
    );

    const computedClass =
      type === "checkbox"
        ? cn(base, checkboxStyles, className)
        : type === "radio"
          ? cn(base, radioStyles, className)
          : cn(base, textStyles, className);

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={computedClass}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
