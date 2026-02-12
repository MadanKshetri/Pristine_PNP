import { useStaffControllerGetSummary } from "@/fetchers/queriesComponents";
import { LoadingSpinner } from "@/src/components/ui";
import { HomeScreen } from "@/src/features/home";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import React, { useCallback } from "react";
import { View } from "react-native";

export default function HomeTab() {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "cleaner";
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  // 1. Stats Query
  const {
    data: summaryData,
    refetch: refetchSummary,
    isLoading: isLoadingSummary,
    isRefetching: isRefetchingSummary,
  } = useStaffControllerGetSummary({}, { enabled: isStaff });

  const refetchManagerSummary = () => {};
  const isLoadingManagerSummary = false;

  // 2. In Progress Jobs Query
  const {
    jobs: inProgressJobs,
    isLoading: isLoadingInProgress,
    isRefetching: isRefetchingInProgress,
    refetch: refetchInProgress,
  } = useJobsByRole({
    page: 0,
    take: 3,
    status: JSON.stringify(["In Progress"]) as any,
  });

  // 3. Scheduled Jobs Query
  const {
    jobs: scheduledJobs,
    isLoading: isLoadingScheduled,
    isRefetching: isRefetchingScheduled,
    refetch: refetchScheduled,
  } = useJobsByRole({
    page: 0,
    take: 3,
    status: JSON.stringify(["Scheduled"]) as any,
  });

  const handleRefresh = useCallback(() => {
    isStaff && refetchSummary();
    refetchInProgress();
    refetchScheduled();
  }, [isStaff, refetchSummary, refetchInProgress, refetchScheduled]);

  const isLoading =
    (isStaff && isLoadingSummary) ||
    isLoadingInProgress ||
    isLoadingScheduled;
  const isRefetching =
    (isRefetchingSummary || isRefetchingInProgress || isRefetchingScheduled) ??
    false;

  if (!user) {
    return (
      <View>
        <LoadingSpinner />;
      </View>
    );
  }

  const managerSummaryFallback = {
    pending: 0,
    completed: 0,
    upcomming: 0,
    cancelled: 0,
  };

  return (
    <HomeScreen
      summary={isStaff ? summaryData?.data : managerSummaryFallback}
      inProgressJobs={inProgressJobs}
      scheduledJobs={scheduledJobs}
      isLoading={isLoading}
      user={user}
      onRefresh={handleRefresh}
      refreshing={isRefetching}
    />
  );
}
