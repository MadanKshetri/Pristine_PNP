// hooks/useActivityFilters.ts
import { useEffect } from "react";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import type { FilterState } from "@/src/types/filter";
import { useFilterStore } from "../lib/store/filter-store";

type TProps = {
  syncWithUrl?: boolean;
};

/**
 * The single hook screens use for filters.
 *
 * On mount: reads URL params → hydrates the Zustand store.
 * Runtime: all reads/writes go through Zustand (fast, no URL churn).
 *
 * For navigation with pre-applied filters, callers use
 * `navigateWithFilters()` instead of pushing manually.
 */
export function useActivityFilters(
  { syncWithUrl }: TProps = { syncWithUrl: false },
) {
  const params = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();

  const filters = useFilterStore((s) => s.filters);
  const hydrateFilters = useFilterStore((s) => s.hydrateFilters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const clearFilter = useFilterStore((s) => s.clearFilter);
  const resetAll = useFilterStore((s) => s.resetAll);
  const activeCount = useFilterStore((s) => s.activeCount);
  const shouldResetOnNavigate = useFilterStore(
    (s) => s.shouldResetFiltersOnNavigate,
  );
  const setShouldResetOnNavigate = useFilterStore(
    (s) => s.setShouldResetFiltersOnNavigate,
  );

  const setIgnoredFilters = useFilterStore((s) => s.setIgnoredFilters);

  // ── Hydrate from URL params once on mount ──────────────────────────────
  useEffect(() => {
    const fromUrl: FilterState = {};

    if (syncWithUrl) {
      // Each URL param is a string. Multi-select values are comma-separated:
      // ?staff=nick,dada  →  ['nick', 'dada']
      Object.entries(params).forEach(([key, raw]) => {
        if (!raw) return;
        // Treat comma-separated strings as multi-select arrays
        fromUrl[key] = raw.includes(",") ? raw.split(",") : raw;
      });

      if (Object.keys(fromUrl).length > 0) {
        hydrateFilters(fromUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once — params won't change after mount for this screen

  // ── Navigate to another screen with pre-applied filters ───────────────
  const navigateWithFilters = (pathname: Href, preApplied: FilterState) => {
    // 1. Write to store so the target screen gets it immediately on mount
    hydrateFilters(preApplied);

    // 2. Also encode in URL so deep links / back-navigation work
    const urlParams: Record<string, string> = {};
    Object.entries(preApplied).forEach(([key, val]) => {
      if (val === null || val === undefined) return;
      urlParams[key] = Array.isArray(val) ? val.join(",") : val;
    });

    router.push(pathname);
  };

  return {
    filters,
    setFilter,
    clearFilter,
    resetAll,
    activeCount: activeCount(),
    navigateWithFilters,
    shouldResetOnNavigate,
    setShouldResetOnNavigate,
    setIgnoredFilters,
  };
}
