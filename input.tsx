import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border border-navy-100 dark:border-white/10 bg-white dark:bg-navy-800/40 px-3.5 text-sm text-navy dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
