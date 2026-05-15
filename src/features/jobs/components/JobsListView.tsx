import { InfiniteScrollList } from "@/src/components/ui";
import { JobListCard } from "@/src/features/jobs/components/JobListCard";
import { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useInfiniteJobsByRole } from "../hooks/useInfiniteJobsByRole";
import { StaffJobControllerJobsQueryParams } from "@/fetchers/queriesComponents";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";
import { useRouter } from "expo-router";

type JobItem = {
  id: string;
  startAt?: string | null;
  createdAt: string;
};

export function JobsListView() {
  const router = useRouter();

  const { filters } = useActivityFilters();

  const listJobsFilters: StaffJobControllerJobsQueryParams = useMemo(
    () => ({ take: 20, ...filters }),
    [filters],
  );

  const {
    jobs,
    error,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteJobsByRole(listJobsFilters);

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/job/${jobId}`);
    },
    [router],
  );

  const renderListItem = useCallback(
    ({ item }: { item: JobItem }) => (
      <JobListCard job={item as any} onPress={handleJobPress} />
    ),
    [handleJobPress],
  );

  const sortedAllJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aDate = new Date(a.startAt || a.createdAt).getTime();
      const bDate = new Date(b.startAt || b.createdAt).getTime();
      return bDate - aDate;
    });
  }, [jobs]);

  if (error && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Jobs</Text>
        <Text style={styles.errorText}>
          {(error as any)?.payload || "Something went wrong. Please try again."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <InfiniteScrollList
      data={sortedAllJobs as any[]}
      renderItem={renderListItem}
      keyExtractor={(item: JobItem) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      refreshing={isRefetching}
      onRefresh={refetch}
      onEndReached={fetchNextPage}
      emptyTitle="No jobs found"
      emptyMessage="You do not have any jobs yet."
      contentContainerStyle={styles.listContentContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
