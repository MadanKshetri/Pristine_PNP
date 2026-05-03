import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type FlatListProps,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";

export type InfiniteScrollListProps<TItem> = {
  data: TItem[];
  renderItem: ListRenderItem<TItem>;
  keyExtractor: (item: TItem, index: number) => string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  ListHeaderComponent?: FlatListProps<TItem>["ListHeaderComponent"];
  contentContainerStyle?: StyleProp<ViewStyle>;
} & Omit<
  FlatListProps<TItem>,
  | "data"
  | "renderItem"
  | "keyExtractor"
  | "onEndReached"
  | "onRefresh"
  | "refreshing"
  | "ListHeaderComponent"
  | "contentContainerStyle"
>;

export function InfiniteScrollList<TItem>({
  data,
  renderItem,
  keyExtractor,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  emptyTitle = "No items found",
  emptyMessage = "There is nothing to display right now.",
  ListHeaderComponent,
  contentContainerStyle,
  ...rest
}: InfiniteScrollListProps<TItem>) {
  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    onEndReached?.();
  }, [hasNextPage, isFetchingNextPage, onEndReached]);

  if (isLoading && data.length === 0) {
    return (
      <View style={styles.initialLoader}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.35}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
      contentContainerStyle={[
        styles.contentContainer,
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  initialLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
