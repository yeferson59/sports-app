"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean;
};

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required = false, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        "block text-sm font-medium text-slate-300 mb-1 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {required ? (
          <span
            aria-hidden="true"
            className="text-rose-400 ml-0.5 select-none text-sm"
          >
            *
          </span>
        ) : null}
      </span>
    </LabelPrimitive.Root>
  );
});

Label.displayName = "Label";

export { Label };
