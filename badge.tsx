import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "gold" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-royal-50 text-royal-700 dark:bg-royal-900/40 dark:text-royal-200",
        variant === "gold" && "bg-gold-50 text-gold-700 dark:bg-gold-900/40 dark:text-gold-200",
        variant === "outline" && "border border-navy-100 dark:border-white/10 text-navy-400 dark:text-navy-100",
        className
      )}
      {...props}
    />
  );
}
