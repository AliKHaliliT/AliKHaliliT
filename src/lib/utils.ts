import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for new content items.
 */
export function generateId(items: Array<{ id?: string | number }>): number {
  const ids = items.map((i) => Number(i.id)).filter((n) => !isNaN(n));
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

/**
 * Format a date string for HTML input (YYYY-MM-DD).
 */
export function formatDateForInput(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}
