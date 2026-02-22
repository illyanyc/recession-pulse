import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return formatCurrency(value);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "safe": return "text-pulse-green";
    case "watch": return "text-pulse-yellow";
    case "warning": return "text-pulse-red";
    case "danger": return "text-red-500";
    default: return "text-pulse-muted";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "safe": return "bg-pulse-green/10 border-pulse-green/20";
    case "watch": return "bg-pulse-yellow/10 border-pulse-yellow/20";
    case "warning": return "bg-pulse-red/10 border-pulse-red/20";
    case "danger": return "bg-red-500/10 border-red-500/20";
    default: return "bg-pulse-card border-pulse-border";
  }
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
