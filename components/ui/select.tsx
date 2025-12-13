import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="select"
      className={cn(
        "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white",
        "placeholder:text-slate-400 shadow-sm outline-none",
        "transition-colors motion-safe:duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Select.displayName = "Select";

export { Select };
