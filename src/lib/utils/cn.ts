import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
/**
 * Utility function to merge class names
 * Simple version for combining conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(...classes));
}
