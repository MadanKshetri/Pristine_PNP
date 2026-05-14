import type {
  FilterConfig,
  FilterOption,
  FilterValue,
} from "@/src/types/filter";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncSelect from "../async-select";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";

type Props = {
  config: FilterConfig;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

export function FilterChip({ config, value, onChange }: Props) {
  // ── When config has a paginated fetcher, delegate to AsyncSelect ───────
  if (config.fetcher) {
    return (
      <AsyncSelectFilterChip
        config={config}
        value={value}
        onChange={onChange}
      />
    );
  }

  // ── Otherwise use the inline dropdown (static / loadOptions) ──────────
  return <InlineFilterChip config={config} value={value} onChange={onChange} />;
}

// ── AsyncSelect-backed chip (for paginated API fetchers) ──────────────────

function AsyncSelectFilterChip({ config, value, onChange }: Props) {
  const selectType = config.type === "multi" ? "multiple" : "single";

  const { filters } = useActivityFilters();

  const handleChange = (val: string | string[]) => {
    if (typeof val === "string") {
      onChange(val || null);
    } else {
      onChange(val.length > 0 ? val : null);
    }
  };

  // Convert FilterValue → AsyncSelect's value prop
  const selectValue =
    selectType === "single"
      ? ((value as string) ?? "")
      : ((value as string[]) ?? []);

  const selectedLabel = filters[config.id + "_name"];

  return (
    <AsyncSelect
      type={selectType}
      label={config.label}
      placeholder={config.label}
      fetcher={config.fetcher}
      options={
        config.options?.map((o) => ({
          value: o.value,
          label: o.label,
        })) ?? []
      }
      value={selectValue}
      onChange={handleChange as any}
      onFilterRemove={() => onChange(null)}
      withSearch
      components={{
        trigger: ({ label, onPress }) => {
          const isActive =
            value !== null &&
            value !== undefined &&
            (!Array.isArray(value) || value.length > 0);
          return (
            <Pressable
              onPress={onPress}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${config.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {isActive ? selectedLabel || label : config.label}
              </Text>
              <Text style={[styles.chevron, isActive && styles.chevronActive]}>
                ▼
              </Text>
            </Pressable>
          );
        },
      }}
    />
  );
}

// ── Inline chip (for static options or simple loadOptions) ────────────────

function InlineFilterChip({ config, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<FilterOption[]>(config.options ?? []);
  const [loading, setLoading] = useState(false);
  const optionsCache = useRef<FilterOption[] | null>(null);

  // ── Load async options once when chip opens ────────────────────────────
  useEffect(() => {
    if (!open || !config.loadOptions) return;
    if (optionsCache.current) {
      setOptions(optionsCache.current);
      return;
    }
    setLoading(true);
    config.loadOptions().then((loaded) => {
      optionsCache.current = loaded;
      setOptions(loaded);
      setLoading(false);
    });
  }, [open]);

  // ── Derived display label ──────────────────────────────────────────────
  const displayLabel = (() => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return config.label;
    }
    if (Array.isArray(value)) {
      return value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${config.label} (${value.length})`;
    }
    return options.find((o) => o.value === value)?.label ?? value;
  })();

  const isActive =
    value !== null &&
    value !== undefined &&
    (!Array.isArray(value) || value.length > 0);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Handle option selection ────────────────────────────────────────────
  const handleSelect = (option: FilterOption) => {
    if (config.type === "multi") {
      const current = (value as string[]) ?? [];
      const next = current.includes(option.value)
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      onChange(next.length ? next : null);
    } else {
      // Toggle off if same value tapped again
      onChange(value === option.value ? null : option.value);
      setOpen(false);
    }
  };

  const isSelected = (option: FilterOption) =>
    Array.isArray(value)
      ? value.includes(option.value)
      : value === option.value;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.chip, isActive && styles.chipActive]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${config.label}`}
        accessibilityState={{ selected: isActive }}
      >
        <Text
          style={[styles.label, isActive && styles.labelActive]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Text style={[styles.chevron, isActive && styles.chevronActive]}>
          {open ? "▲" : "▼"}
        </Text>
      </Pressable>

      {/* 
        In production: replace Modal with @gorhom/bottom-sheet.
        The internals (FlatList, search) stay identical.
      */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.dropdown}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{config.label}</Text>
              {isActive && (
                <Pressable
                  onPress={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              )}
            </View>

            {/* Search input */}
            <TextInput
              style={styles.search}
              placeholder="Search options..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />

            {/* Options list */}
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(o) => o.value}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const selected = isSelected(item);
                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No results</Text>
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  chipActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  label: {
    fontSize: 13,
    color: "#374151",
    maxWidth: 160,
  },
  labelActive: {
    color: "#2563EB",
    fontWeight: "500",
  },
  chevron: {
    fontSize: 8,
    color: "#9CA3AF",
  },
  chevronActive: {
    color: "#2563EB",
  },

  // Modal backdrop
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 100, // adjust to sit below your filter bar
    paddingLeft: 16,
  },

  // Dropdown panel
  dropdown: {
    width: 280,
    maxHeight: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  clearText: {
    fontSize: 13,
    color: "#E84A4A",
  },
  search: {
    marginHorizontal: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    fontSize: 13,
    color: "#222",
  },
  loader: {
    margin: 24,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  optionSelected: {
    backgroundColor: "#FFF1F1",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  optionTextSelected: {
    color: "#C93333",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 13,
    color: "#C93333",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
    padding: 20,
  },
});
