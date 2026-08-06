import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-400 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-royal text-white hover:bg-royal-600 shadow-premium active:scale-[0.98]",
        gold:
          "bg-gold-gradient text-navy-900 font-semibold hover:brightness-105 shadow-gold active:scale-[0.98]",
        outline:
          "border border-navy-100 dark:border-navy-300/30 bg-transparent hover:bg-navy-50 dark:hover:bg-white/5 text-navy dark:text-white",
        ghost: "hover:bg-navy-50 dark:hover:bg-white/5 text-navy dark:text-white",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-royal underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
