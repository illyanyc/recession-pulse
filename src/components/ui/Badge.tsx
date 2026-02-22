import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "safe" | "watch" | "warning" | "danger";
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export function Badge({ status, children, className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        {
          "text-pulse-green bg-pulse-green/10 border-pulse-green/20": status === "safe",
          "text-pulse-yellow bg-pulse-yellow/10 border-pulse-yellow/20": status === "watch",
          "text-pulse-red bg-pulse-red/10 border-pulse-red/20": status === "warning",
          "text-red-400 bg-red-500/10 border-red-500/20": status === "danger",
        },
        pulse && "animate-pulse",
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-pulse-green": status === "safe",
          "bg-pulse-yellow": status === "watch",
          "bg-pulse-red": status === "warning",
          "bg-red-400": status === "danger",
        })}
      />
      {children}
    </span>
  );
}
