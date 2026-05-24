import { cn } from "@/src/lib/utils/cn";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./actionsheet";

export type TOption = {
  value: string;
  label: string;
  icon?: string;
  isDefault?: boolean;
  hideInList?: boolean;
  keywords?: string[];
};

type TSelected<SelectType> = SelectType extends "single" ? TOption : TOption[];

export type TStaticSelectProps<
  TypeofStaticSelect extends "single" | "multiple" = "single" | "multiple",
> = {
  options: TOption[];
  withSearch?: boolean;
  type?: TypeofStaticSelect;
  placeholder?: string;
  label?: string;
  onOptionSelect?: (item: TOption, isDeselected: boolean) => void;
  onChange?: (
    value: TypeofStaticSelect extends "single" ? string : string[],
  ) => void;
  value?: TypeofStaticSelect extends "single" ? string : string[];
  onFilterRemove?: () => void;
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

export default function StaticSelect<
  TypeofStaticSelect extends "single" | "multiple" = "single",
>({
  type = "single" as TypeofStaticSelect,
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
}: TStaticSelectProps<TypeofStaticSelect>) {
  const [state, _setState] = useState<TSelected<typeof type>>(
    (type === "single" ? { value: "", label: "" } : []) as any,
  );

  const setState = (
    input: TSelected<typeof type>,
    triggerOnChange: boolean = true,
  ) => {
    _setState(input as any);
    if (onChange && triggerOnChange) {
      if (type === "single" && !Array.isArray(input)) {
        onChange(input.value || ("" as any));
      } else if (type === "multiple" && Array.isArray(input)) {
        onChange(
          input
            .map((item) => item.value)
            .filter((itx): itx is string => Boolean(itx)) as any,
        );
      }
    }
  };

  const [options, setOptions] = useState<TOption[]>(_options);
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const displayOptions: TOption[] = useMemo(() => {
    const filtered = input
      ? options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(input.toLowerCase()) ||
            opt.keywords?.some((kw) =>
              kw.toLowerCase().includes(input.toLowerCase()),
            ),
        )
      : options;

    return filtered.filter((opt) => !opt.hideInList);
  }, [options, input]);

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

      if (isSelected) {
        if (type === "multiple" && Array.isArray(state)) {
          setState(state.filter((it) => it.value !== option.value) as any);
        } else if (type === "single") {
          setState({ value: "", label: "" } as any);
          setOpen(false);
        }
        if (onOptionSelect) onOptionSelect(option, true);
      } else {
        if (type === "single") {
          setState(option as any);
          setOpen(false);
        } else if (type === "multiple") {
          setState(
            (Array.isArray(state) ? [...state, option] : [option]) as any,
          );
        }
        if (onOptionSelect) onOptionSelect(option, false);
      }

      setInput("");
    },
    [getIsSelected, type, state, onOptionSelect],
  );

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

  useEffect(() => {
    if (!isEqual(options, _options)) {
      setOptions(_options);
    }
  }, [_options]);

  useEffect(() => {
    if (value === undefined) return;

    if (typeof value === "string" && !Array.isArray(state)) {
      if (value === "" && state.value !== "") {
        _setState({ label: "", value: "" } as any);
      } else if (value && value !== state.value) {
        const fromOptions = options.find((item) => item.value === value);
        if (fromOptions) {
          _setState(fromOptions as any);
        } else {
          _setState(((prev: any) =>
            !Array.isArray(prev) && prev.value === value
              ? prev
              : { value, label: "" }) as any);
        }
      }
    } else if (Array.isArray(value) && Array.isArray(state)) {
      const stateIds = state.map((item) => item.value);

      if (value.length === 0 && state.length > 0) {
        _setState([] as any);
      } else if (!isEqual(value, stateIds)) {
        const resolved = value
          .map((id) => options.find((it) => it.value === id))
          .filter((it): it is TOption => Boolean(it));

        if (resolved.length > 0) {
          _setState(resolved as any);
        }
      }
    }
  }, [value, options]);

  const handleClear = useCallback(() => {
    if (type === "single") {
      setState({ value: "", label: "" } as any);
    } else {
      setState([] as any);
    }
    if (onFilterRemove) onFilterRemove();
    setOpen(false);
  }, [type, onFilterRemove]);

  const Trigger = components?.trigger;

  return (
    <View>
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

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[70%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

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

          <FlatList
            data={displayOptions}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
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
            ListEmptyComponent={
              <Text className="text-center text-[#aaa] text-[13px] p-6">
                No results found
              </Text>
            }
          />
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}
