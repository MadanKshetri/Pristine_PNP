import { PaginationResponseDto } from "@/fetchers/queriesSchemas";
import { parseInfiniteQueryData } from "@/fetchers/queriesUtils";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./actionsheet";

// ── Shared types ────────────────────────────────────────────────────────────

export type TPaginatedResponse<T> = {
  message: string;
  data: T;
  pagination: PaginationResponseDto;
};

export type TOption = {
  value: string;
  label: string;
  icon?: string;
  isDefault?: boolean;
  hideInList?: boolean;
  keywords?: string[];
};

type TFetcher<
  Fetcher extends (...args: any[]) => any,
  FetcherParameters extends Parameters<Fetcher>[0] = Parameters<Fetcher>[0],
  FetcherResponse extends TPaginatedResponse<
    Awaited<ReturnType<Fetcher>>
  > = Awaited<ReturnType<Fetcher>>,
  Item = FetcherResponse["data"][number],
  SearchQueryKey = FetcherParameters["queryParams"],
> = {
  /**
   * Please only pass paginated fetch functions here.
   */
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

type TSelected<SelectType> = SelectType extends "single" ? TOption : TOption[];

type TAsyncSelectProps<
  Fetcher extends (...args: any[]) => any,
  FetcherResponse extends TPaginatedResponse<
    Awaited<ReturnType<Fetcher>>
  > = Awaited<ReturnType<Fetcher>>,
  Item = FetcherResponse["data"][number],
  TypeofAsyncSelect extends "single" | "multiple" = "single" | "multiple",
> = {
  withSearch?: boolean;
  fetcher?: TFetcher<Fetcher>;
  type?: TypeofAsyncSelect;
  placeholder?: string;
  label?: string;
  onOptionSelect?: (item: TOption, isDeselected: boolean) => void;
  onChange?: (
    value: TypeofAsyncSelect extends "single" ? string : string[],
  ) => void;
  value?: TypeofAsyncSelect extends "single" ? string : string[];
  onFilterRemove?: () => void;
  options?: TOption[];
  maxLabelCount?: number;
  components?: {
    trigger?: (props: {
      selected: TOption | TOption[];
      label: string;
      onPress: () => void;
    }) => React.ReactNode;
  };
};

// ── Null-object fetcher for when no API is provided ─────────────────────────

const NULL_FETCHER: TFetcher<any> = {
  fn: async () => ({
    message: "No fetcher provided",
    data: [],
    pagination: {
      count: 0,
      total: 0,
    } satisfies PaginationResponseDto,
  }),
  queryKey: [],
  renderables: {
    getLabelFromItem: () => "",
    getValueFromItem: () => "",
  },
};

const TAKE = 10;

// ── Component ───────────────────────────────────────────────────────────────

export default function AsyncSelect<
  T extends (...args: any[]) => any,
  FetcherResponse extends TPaginatedResponse<Awaited<ReturnType<T>>> = Awaited<
    ReturnType<T>
  >,
  Item = FetcherResponse["data"][number],
>({
  type = "single",
  fetcher,
  withSearch = true,
  options: _options = [],
  value,
  placeholder,
  label: titleLabel,
  onOptionSelect,
  maxLabelCount,
  onChange,
  onFilterRemove,
  components,
}: TAsyncSelectProps<T>) {
  // ── Internal state ──────────────────────────────────────────────────────

  const [state, _setState] = useState<TSelected<typeof type>>(
    type === "single" ? { value: "", label: "" } : [],
  );

  const setState = (
    input: TSelected<typeof type>,
    triggerOnChange: boolean = true,
  ) => {
    _setState(input);
    if (onChange && triggerOnChange) {
      if (type === "single" && !Array.isArray(input)) {
        onChange(input.value || "");
      } else if (type === "multiple" && Array.isArray(input)) {
        onChange(
          input
            .map((item) => item.value)
            .filter((itx): itx is string => Boolean(itx)),
        );
      }
    }
  };

  const [options, setOptions] = useState<TOption[]>(_options);
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const search = useDebounce(input, 300);

  // ── Fetcher / infinite query ────────────────────────────────────────────

  const queryable: NonNullable<typeof fetcher> = useMemo(
    () => fetcher || NULL_FETCHER,
    [fetcher],
  );

  const {
    data: results,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryable.queryKey, queryable.search && search ? search : ""],
    queryFn: ({ pageParam }) =>
      queryable.fn({
        queryParams: {
          ...(queryable.search && search ? { [queryable.search]: search } : {}),
          ...queryable.params?.queryParams,
          page: pageParam.toString(),
          take: TAKE.toString(),
        },
        pathParams: queryable.params?.pathParams,
      }),
    getNextPageParam: (data: FetcherResponse) => {
      if (!data || !data.pagination || !("nextPage" in data.pagination))
        return undefined;
      return data.pagination.nextPage;
    },
    initialPageParam: 0,
    enabled: open && !!fetcher,
  });

  const data = useMemo(
    () => (fetcher ? parseInfiniteQueryData<Item>(results) : {}),
    [results, fetcher],
  );

  // ── Convert fetcher items → TOption[] for unified rendering ─────────────

  const fetchedOptions: TOption[] = useMemo(() => {
    if (!fetcher || !data.data) return [];
    return data.data.map((item: Item) => ({
      value: fetcher.renderables.getValueFromItem(item),
      label: fetcher.renderables.getLabelFromItem(item),
      icon: fetcher.renderables.getIconFromItem?.(item),
    }));
  }, [data.data, fetcher]);

  // The list we actually render: fetcher results + static options
  // For client-side search, filter static options by the input text
  const displayOptions: TOption[] = useMemo(() => {
    const clientFiltered =
      input && !fetcher
        ? options.filter(
            (opt) =>
              opt.label.toLowerCase().includes(input.toLowerCase()) ||
              opt.keywords?.some((kw) =>
                kw.toLowerCase().includes(input.toLowerCase()),
              ),
          )
        : options;

    // Hide options marked as hideInList
    const visible = [...fetchedOptions, ...clientFiltered].filter(
      (opt) => !opt.hideInList,
    );

    return visible;
  }, [fetchedOptions, options, input, fetcher]);

  // ── Selection helpers ───────────────────────────────────────────────────

  const getIsSelected = useCallback(
    (id: string) => {
      if (type === "multiple" && Array.isArray(state)) {
        return !!state.find((item) => item.value === id);
      } else if (type === "single" && !Array.isArray(state)) {
        return state.value === id;
      }
      return false;
    },
    [state, type],
  );

  const handleSelect = useCallback(
    (option: TOption) => {
      const isSelected = getIsSelected(option.value);

      // Find the raw fetcher item if we need to notify
      const rawItem =
        fetcher && data.data
          ? data.data.find(
              (it: Item) =>
                fetcher.renderables.getValueFromItem(it) === option.value,
            )
          : undefined;

      if (isSelected) {
        // Deselect
        if (type === "multiple" && Array.isArray(state)) {
          setState(state.filter((it) => it.value !== option.value));
        } else if (type === "single") {
          setState({ value: "", label: "" });
          setOpen(false);
        }
        if (rawItem && fetcher?.onItemSelect)
          fetcher.onItemSelect(rawItem, true);
        if (onOptionSelect) onOptionSelect(option, true);
      } else {
        // Select
        if (type === "single") {
          setState(option);
          setOpen(false);
        } else if (type === "multiple") {
          setState(Array.isArray(state) ? [...state, option] : [option]);
        }
        if (rawItem && fetcher?.onItemSelect)
          fetcher.onItemSelect(rawItem, false);
        if (onOptionSelect) onOptionSelect(option, false);
      }

      setInput("");
    },
    [getIsSelected, type, state, fetcher, data.data, onOptionSelect],
  );

  // ── Infinite scroll handler ─────────────────────────────────────────────

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Display label for the trigger ───────────────────────────────────────

  const displayLabel = useMemo(() => {
    if (type === "single" && !Array.isArray(state)) {
      return (
        state.label ||
        options.find((opt) => opt.value === state.value)?.label ||
        placeholder ||
        "Select an option"
      );
    }
    if (type === "multiple" && Array.isArray(state) && state.length) {
      const labels = state.map((item) => item.label);
      if (maxLabelCount) {
        const extra = labels.length - maxLabelCount;
        const postpend = extra > 0 ? ` + ${extra} more` : "";
        return `${labels.slice(0, maxLabelCount).join(", ")}` + postpend;
      }
      return labels.join(", ");
    }
    return placeholder || "Select an option";
  }, [state, type, options, placeholder, maxLabelCount]);

  const isActive =
    (!Array.isArray(state) && !!state?.value) ||
    (Array.isArray(state) && state.length > 0);

  // ── Sync options prop ───────────────────────────────────────────────────

  useEffect(() => {
    if (!isEqual(options, _options)) {
      setOptions(_options);
    }
  }, [_options]);

  // ── Sync controlled value → internal state ──────────────────────────────

  useEffect(() => {
    if (value === undefined) return;

    if (typeof value === "string" && !Array.isArray(state)) {
      if (value === "" && state.value !== "") {
        _setState({ label: "", value: "" });
      } else if (value && value !== state.value) {
        // Try to resolve label from static options first
        const fromOptions = options.find((item) => item.value === value);
        if (fromOptions) {
          _setState(fromOptions);
        } else {
          // From fetched data
          const fromFetched = fetchedOptions.find(
            (item) => item.value === value,
          );
          if (fromFetched) {
            _setState(fromFetched);
          } else {
            // Set value without label — label will resolve when data loads
            _setState((prev) =>
              !Array.isArray(prev) && prev.value === value
                ? prev
                : { value, label: "" },
            );
          }
        }
      }
    } else if (Array.isArray(value) && Array.isArray(state)) {
      const stateIds = state.map((item) => item.value);

      if (value.length === 0 && state.length > 0) {
        _setState([]);
      } else if (!isEqual(value, stateIds)) {
        const allKnown = [...options, ...fetchedOptions];
        const resolved = value
          .map((id) => allKnown.find((it) => it.value === id))
          .filter((it): it is TOption => Boolean(it));

        if (resolved.length > 0) {
          _setState(resolved);
        }
      }
    }
  }, [value, options, fetchedOptions]);

  // ── Clear handler ───────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    if (type === "single") {
      setState({ value: "", label: "" });
    } else {
      setState([]);
    }
    if (onFilterRemove) onFilterRemove();
    setOpen(false);
  }, [type, onFilterRemove]);

  // ── Render ──────────────────────────────────────────────────────────────

  const Trigger = components?.trigger;

  return (
    <View>
      {/* Trigger */}
      {Trigger ? (
        <Trigger
          selected={state}
          label={displayLabel}
          onPress={() => setOpen(true)}
        />
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          style={[styles.trigger, isActive && styles.triggerActive]}
        >
          <Text
            style={[styles.triggerText, isActive && styles.triggerTextActive]}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
          <Text style={[styles.chevron, isActive && styles.chevronActive]}>
            {open ? "▲" : "▼"}
          </Text>
        </Pressable>
      )}

      {/* Actionsheet dropdown */}
      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[70%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {titleLabel || placeholder || "Select"}
            </Text>
            {isActive && (
              <Pressable onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            )}
          </View>

          {/* Search input */}
          {withSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Options list */}
          {isLoading && !data.data ? (
            <ActivityIndicator style={styles.loader} color="#E84A4A" />
          ) : (
            <FlatList
              data={displayOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              style={styles.list}
              renderItem={({ item: option }) => {
                const selected = getIsSelected(option.value);
                return (
                  <Pressable
                    onPress={() => handleSelect(option)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              }}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator
                    style={styles.footerLoader}
                    color="#E84A4A"
                  />
                ) : null
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found</Text>
              }
            />
          )}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Trigger button
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  triggerActive: {
    borderColor: "#E84A4A",
    backgroundColor: "#FFF1F1",
  },
  triggerText: {
    fontSize: 13,
    color: "#444",
    maxWidth: 160,
  },
  triggerTextActive: {
    color: "#C93333",
    fontWeight: "500",
  },
  chevron: {
    fontSize: 8,
    color: "#999",
  },
  chevronActive: {
    color: "#C93333",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    width: "100%",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  clearText: {
    fontSize: 13,
    color: "#E84A4A",
    fontWeight: "500",
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    width: "100%",
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    fontSize: 14,
    color: "#222",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  // List
  list: {
    width: "100%",
  },

  // Option row
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  optionSelected: {
    backgroundColor: "#FFF1F1",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#C93333",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 14,
    color: "#C93333",
    marginLeft: 8,
  },

  // States
  loader: {
    marginVertical: 32,
  },
  footerLoader: {
    marginVertical: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
    padding: 24,
  },
});
