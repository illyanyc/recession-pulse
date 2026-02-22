import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-pulse-text mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "input-field",
            error && "border-pulse-red focus:ring-pulse-red/50 focus:border-pulse-red/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-pulse-red">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
