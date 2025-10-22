/**
 * Utility function to merge class names
 * Simple version for combining conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
