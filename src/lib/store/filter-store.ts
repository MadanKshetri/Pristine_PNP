import { FilterState, FilterValue } from "@/src/types/filter";
import { create } from "zustand";

type FilterStore = {
  filters: FilterState;
  ignoredFilters: string[];

  // Set a single filter value
  setFilter: (id: string, value: FilterValue) => void;

  // Bulk-set multiple filters at once (used for URL hydration)
  hydrateFilters: (partial: FilterState) => void;

  setIgnoredFilters: (ids: string[]) => void;

  // Reset one filter
  clearFilter: (id: string) => void;

  // Reset all filters
  resetAll: (resetIgnored?: boolean) => void;

  // Derived — how many filters are actively set
  activeCount: () => number;

  shouldResetFiltersOnNavigate: boolean;

  setShouldResetFiltersOnNavigate: (
    value: boolean,
    ignoredFilters?: string[],
  ) => void;
};

export const useFilterStore = create<FilterStore>()((set, get) => ({
  filters: {},
  shouldResetFiltersOnNavigate: true,
  ignoredFilters: [],

  setFilter: (id, value) =>
    set((state: any) => {
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        const nextFilters = { ...state.filters };
        delete nextFilters[id];
        return { filters: nextFilters };
      }
      return {
        filters: { ...state.filters, [id]: value },
      };
    }),

  hydrateFilters: (partial) =>
    set((state) => ({
      // URL params win over persisted state for the keys they provide
      filters: { ...state.filters, ...partial },
    })),

  setIgnoredFilters: (ids) => set({ ignoredFilters: ids }),

  clearFilter: (id) =>
    set((state) => {
      const next = { ...state.filters };
      delete next[id];
      return { filters: next };
    }),

  resetAll: (resetIgnored?: boolean) => {
    let filters = get().filters;
    const ignored = get().ignoredFilters;

    if (!resetIgnored) {
      filters = Object.fromEntries(
        Object.entries(filters).filter(([key]) => ignored.includes(key)),
      );
    } else {
      filters = {};
    }

    return set({ filters });
  },

  setShouldResetFiltersOnNavigate: (value) =>
    set({ shouldResetFiltersOnNavigate: value }),

  activeCount: () => {
    const { filters } = get();

    return Object.values(filters).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined,
    ).length;
  },
}));
