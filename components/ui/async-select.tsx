import { PaginationResponseDto } from "@/fetchers/queriesSchemas";
import { parseInfiniteQueryData } from "@/fetchers/queriesUtils";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils/cn";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
  disabled?: boolean;
  className?: {
    trigger?: string;
    triggerActive?: string;
  };
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
  disabled = false,
  className,
  components,
}: TAsyncSelectProps<T>) {
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

  const handleClear = useCallback(() => {
    if (type === "single") {
      setState({ value: "", label: "" });
    } else {
      setState([]);
    }
    if (onFilterRemove) onFilterRemove();
    setOpen(false);
  }, [type, onFilterRemove]);

  const Trigger = components?.trigger;

  return (
    <View>
      {/* Trigger */}
      {Trigger ? (
        <Trigger
          selected={state}
          label={displayLabel}
          onPress={() => !disabled && setOpen(true)}
        />
      ) : (
        <Pressable
          onPress={() => !disabled && setOpen(true)}
          disabled={disabled}
          className={cn(
            "flex-row items-center gap-1 px-3 py-[7px] rounded-[20px] border border-[#E0E0E0] bg-[#FAFAFA]",
            className?.trigger,
            isActive &&
              cn("border-[#E84A4A] bg-[#FFF1F1]", className?.triggerActive),
            disabled && "opacity-50",
          )}
        >
          <Text
            className={cn(
              "text-[13px] text-[#444] max-w-[160px]",
              isActive && "font-medium",
            )}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
          <Text className={cn("text-[8px] text-[#999]")}>
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
          <View className="flex-row justify-between items-center px-4 pt-2 pb-[10px] w-full">
            <Text className="text-base font-semibold text-[#222]">
              {titleLabel || placeholder || "Select"}
            </Text>
            {isActive && (
              <Pressable onPress={handleClear}>
                <Text className="text-[13px] text-[#E84A4A] font-medium">
                  Clear
                </Text>
              </Pressable>
            )}
          </View>

          {/* Search input */}
          {withSearch && (
            <View className="px-4 pb-2 w-full">
              <TextInput
                className="px-[14px] py-[10px] bg-[#F5F5F5] rounded-[10px] text-sm text-[#222] border border-[#EBEBEB]"
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
            <ActivityIndicator className="my-8" color="#E84A4A" />
          ) : (
            <FlatList
              data={displayOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              className="w-full"
              renderItem={({ item: option }) => {
                const selected = getIsSelected(option.value);
                return (
                  <Pressable
                    onPress={() => handleSelect(option)}
                    className={cn(
                      "flex-row justify-between items-center px-4 py-[13px] border-b-[0.5px] border-[#F0F0F0]",
                      selected && "bg-[#FFF1F1]",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm text-[#333] flex-1",
                        selected && "text-[#C93333] font-medium",
                      )}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {selected && (
                      <Text className="text-sm text-[#C93333] ml-2">✓</Text>
                    )}
                  </Pressable>
                );
              }}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator className="my-3" color="#E84A4A" />
                ) : null
              }
              ListEmptyComponent={
                <Text className="text-center text-[#aaa] text-[13px] p-6">
                  No results found
                </Text>
              }
            />
          )}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}
