"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pulse-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg",
          {
            "bg-pulse-green text-pulse-darker hover:bg-pulse-green/90 focus:ring-pulse-green/50": variant === "primary",
            "border border-pulse-border text-pulse-text hover:bg-pulse-card hover:border-pulse-green/30 focus:ring-pulse-green/50": variant === "secondary",
            "text-pulse-text hover:bg-pulse-card focus:ring-pulse-green/50": variant === "ghost",
            "bg-pulse-red text-white hover:bg-pulse-red/90 focus:ring-pulse-red/50": variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3.5 text-base": size === "lg",
          },
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
