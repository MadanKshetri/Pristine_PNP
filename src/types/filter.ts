import { PaginationResponseDto } from "@/fetchers/queriesSchemas";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterType = "single" | "multi" | "daterange";
export type FilterRenderType = "dropdown" | "sheet" | "datepicker";

export type TPaginatedResponse<T> = {
  message: string;
  data: T;
  pagination: PaginationResponseDto;
};

export type TFilterFetcher<
  Fetcher extends (...args: any[]) => any,
  FetcherParameters extends Parameters<Fetcher>[0] = Parameters<Fetcher>[0],
  FetcherResponse extends TPaginatedResponse<
    Awaited<ReturnType<Fetcher>>
  > = Awaited<ReturnType<Fetcher>>,
  Item = FetcherResponse["data"][number],
  SearchQueryKey = FetcherParameters["queryParams"],
> = {
  fn: Fetcher;
  queryKey: string[];
  params?: FetcherParameters;
  withClientSearch?: boolean;
  search?: keyof NonNullable<SearchQueryKey>;
  renderables: {
    getValueFromItem: (item: Item) => string;
    getLabelFromItem: (item: Item) => string;
    getIconFromItem?: (item: Item) => string;
  };
  onItemSelect?: (item: Item, isDeselected: boolean) => void;
};

export type FilterConfig<Fetcher extends (...args: any[]) => any = any> = {
  id: string;
  label: string;
  type: FilterType;
  renderType?: FilterRenderType;
  options?: FilterOption[];
  /**
   * Simple async loader — resolves all options at once.
   * Used by FilterChip when a full paginated fetcher isn't needed.
   */
  loadOptions?: () => Promise<FilterOption[]>;
  /**
   * Paginated API fetcher — for large datasets with server-side search.
   * When provided, the filter chip will use AsyncSelect under the hood.
   */
  fetcher?: TFilterFetcher<Fetcher>;
};

// Serializable — safe for URL params and AsyncStorage
export type FilterValue = string | string[] | null;
export type FilterState = Record<string, FilterValue>;

/**
 * Identity helper that preserves full generic inference for `fetcher`.
 *
 * Without this, passing configs inline to `FilterBar` (which accepts
 * `FilterConfig<any>[]`) erases the fetcher generic and `item` becomes `any`.
 *
 * @example
 * ```ts
 * createFilterConfig({
 *   id: "site",
 *   label: "Site",
 *   type: "single",
 *   fetcher: {
 *     fn: fetchAdminSiteControllerSites,
 *     queryKey: ["sites"],
 *     renderables: {
 *       getValueFromItem: (item) => item.id,    // ← item is typed!
 *       getLabelFromItem: (item) => item.title,  // ← item is typed!
 *     },
 *   },
 * });
 * ```
 */
export function createFilterConfig<F extends (...args: any[]) => any>(
  config: FilterConfig<F>,
): FilterConfig<F> {
  return config;
}
