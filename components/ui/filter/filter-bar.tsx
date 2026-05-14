import type { FilterConfig, FilterState } from "@/src/types/filter";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FilterChip } from "./filter-chip";

type Props = {
  configs: FilterConfig<any>[];
  state: FilterState;
  onChange: (id: string, value: FilterState[string]) => void;
  onReset?: () => void;
  activeCount?: number;
};

export function FilterBar({
  configs,
  state,
  onChange,
  onReset,
  activeCount = 0,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {configs.map((config) => (
          <FilterChip
            key={config.id}
            config={config}
            value={state[config.id] ?? null}
            onChange={(val) => onChange(config.id, val)}
          />
        ))}
      </ScrollView>

      {/* Reset button — only shown when something is active */}
      {activeCount > 0 && onReset && (
        <Pressable onPress={onReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#ffffff",
  },
  row: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  resetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  resetText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
});
