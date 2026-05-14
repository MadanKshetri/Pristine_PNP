import { useEffect, useState } from "react";

/**
 * Debounce a value by the given delay (ms).
 * Returns the debounced value — it only updates after the caller
 * stops changing `value` for `delay` milliseconds.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
