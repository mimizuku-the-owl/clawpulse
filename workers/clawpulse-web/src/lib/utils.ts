import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDollars(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export function formatTokens(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function providerColor(provider: string): string {
  switch (provider.toLowerCase()) {
    case "anthropic":
      return "#d97706"; // amber-600
    case "openai":
      return "#10b981"; // emerald-500
    case "google":
      return "#3b82f6"; // blue-500
    case "mistral":
      return "#ef4444"; // red-500 (orange-red)
    default:
      return "#a855f7"; // purple-500
  }
}

export function providerBg(provider: string): string {
  switch (provider.toLowerCase()) {
    case "anthropic":
      return "bg-amber-900/30 text-amber-400 border-amber-700/50";
    case "openai":
      return "bg-emerald-900/30 text-emerald-400 border-emerald-700/50";
    case "google":
      return "bg-blue-900/30 text-blue-400 border-blue-700/50";
    case "mistral":
      return "bg-red-900/30 text-orange-400 border-red-700/50";
    default:
      return "bg-purple-900/30 text-purple-400 border-purple-700/50";
  }
}
