import { useStaffControllerGetSummary } from "@/fetchers/queriesComponents";
import { HomeScreen } from "@/src/features/home";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useCallback } from "react";

export default function HomeTab() {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "general";

  // 1. Stats Query
  const {
    data: summaryData,
    refetch: refetchSummary,
    isLoading: isLoadingSummary,
    isRefetching: isRefetchingSummary,
  } = useStaffControllerGetSummary({}, { enabled: isStaff });

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
    status: JSON.stringify(["scheduled"]) as any,
  });

  const handleRefresh = useCallback(() => {
    refetchSummary();
    refetchInProgress();
    refetchScheduled();
  }, [refetchSummary, refetchInProgress, refetchScheduled]);

  const isLoading =
    isLoadingSummary || isLoadingInProgress || isLoadingScheduled;
  const isRefetching =
    (isRefetchingSummary || isRefetchingInProgress || isRefetchingScheduled) ??
    false;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <HomeScreen
      summary={summaryData?.data}
      inProgressJobs={inProgressJobs}
      scheduledJobs={scheduledJobs}
      isLoading={isLoading}
      user={user}
      onRefresh={handleRefresh}
      refreshing={isRefetching}
    />
  );
}
