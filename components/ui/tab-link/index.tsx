import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type TabItem = {
  key: string;
  title: string;
  render: () => React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeKey: controlledKey,
  onChange,
}) => {
  const isControlled = controlledKey !== undefined;

  const [internalKey, setInternalKey] = useState(controlledKey || tabs[0]?.key);

  const activeKey = isControlled ? controlledKey : internalKey;

  const [visited, setVisited] = useState<Record<string, boolean>>({
    [activeKey!]: true,
  });

  const [layouts, setLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const activeIndex = useMemo(
    () => tabs.findIndex((t) => t.key === activeKey),
    [tabs, activeKey],
  );

  const setActive = (key: string) => {
    if (!isControlled) setInternalKey(key);
    onChange?.(key);
    setVisited((prev) => ({ ...prev, [key]: true }));
  };

  // Animate indicator when active changes
  useEffect(() => {
    const layout = layouts[activeKey!];
    if (layout) {
      indicatorX.value = withTiming(layout.x, { duration: 250 });
      indicatorWidth.value = withTiming(layout.width, { duration: 250 });
    }
  }, [activeKey, layouts, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const onTabLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  const pagerRef = useRef<any>(null);

  useEffect(() => {
    if (pagerRef.current && activeIndex >= 0) {
      // Keep pager in sync when active tab changes (e.g., tab press)
      try {
        pagerRef.current.setPage(activeIndex);
      } catch {
        // ignore if method not available in some environments
      }
    }
  }, [activeIndex]);

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Tab Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActive(tab.key)}
                onLayout={onTabLayout(tab.key)}
                style={styles.tabItem}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 🔹 Animated Indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>

      {/* 🔹 Pager (Swipeable Content) */}
      <PagerView
        style={{ flex: 1 }}
        ref={pagerRef}
        initialPage={activeIndex}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          const key = tabs[index].key;
          setActive(key);
        }}
      >
        {tabs.map((tab) => (
          <View key={tab.key} style={{ flex: 1, paddingTop: 8 }}>
            {visited[tab.key] ? tab.render() : null}
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabText: {
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "#007AFF",
  },
});
