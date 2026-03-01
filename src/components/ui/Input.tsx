import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = externalId || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-pulse-text mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            "input-field",
            error && "border-pulse-red focus:ring-pulse-red/50 focus:border-pulse-red/50",
            className
          )}
          {...props}
        />
        {error && <p id={errorId} className="mt-1 text-xs text-pulse-red">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
