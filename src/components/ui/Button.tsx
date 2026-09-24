import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-white shadow-[0_3px_12px_rgba(166,71,104,0.16)] hover:bg-crimson-hover focus-visible:ring-primary-container",
        secondary:
          "bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 hover:bg-surface-container dark:hover:bg-slate-700 border border-border-muted dark:border-slate-700",
        outline:
          "border border-border-muted dark:border-slate-700 bg-white dark:bg-slate-900 text-on-surface dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white",
        ghost:
          "text-on-surface dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        link:
          "text-primary-container underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm min-h-[44px]", // Standar touch target 44px
        lg: "h-12 px-6 py-3 text-base min-h-[48px]", // Tombol utama 48px
        sm: "h-11 rounded-lg px-3.5 text-sm min-h-[44px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0", // Ikon tombol tetap min-touch 44px
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/** Tautan berpenampilan tombol tetap dirender sebagai satu elemen navigasi. */
export function ButtonLink({ className, variant, size, ...props }: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
