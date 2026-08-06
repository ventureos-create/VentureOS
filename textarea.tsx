import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full rounded-lg border border-navy-100 dark:border-white/10 bg-white dark:bg-navy-800/40 px-3.5 py-2.5 text-sm text-navy dark:text-white placeholder:text-navy-300 dark:placeholder:text-navy-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-royal-400 focus:border-transparent disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
