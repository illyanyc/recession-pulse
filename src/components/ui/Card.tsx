import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "green" | "red" | "none";
}

export function Card({ className, hover, glow = "none", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-pulse-card border border-pulse-border rounded-xl p-6",
        hover && "hover:border-pulse-green/30 transition-all duration-300 cursor-pointer",
        glow === "green" && "glow-green",
        glow === "red" && "glow-red",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
