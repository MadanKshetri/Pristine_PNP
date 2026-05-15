import {
  StaffJobControllerJobsQueryParams,
  useAdminJobControllerJobs,
  useStaffJobControllerJobs,
} from "@/fetchers/queriesComponents";
import type { Job } from "@/src/features/jobs/types";
import { useAuthStore } from "@/src/lib/store/authStore";

type JobsHookResult = {
  jobs: Job[];
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  refetch: () => void;
};

/**
 * A custom hook to fetch jobs based on the user's role and apply filters.
 */
export const useJobsByRole = (
  filters?: StaffJobControllerJobsQueryParams,
): JobsHookResult => {
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === "manager";
  const isCleaner = user?.role === "cleaner";
  console.log(
    "User Role:",
    user?.role,
    "isManager:",
    isManager,
    "isCleaner:",
    isCleaner,
  );

  const {
    data: managerJobsData,
    isLoading: isManagerLoading,
    isRefetching: isManagerRefetching,
    error: managerError,
    refetch: refetchManager,
  } = useAdminJobControllerJobs(
    {
      queryParams: {
        ...filters,
        ...(filters?.status && { status: filters.status }),
      },
    },
    { enabled: isManager },
  );

  const {
    data: cleanerJobsData,
    isLoading: isCleanerLoading,
    isRefetching: isCleanerRefetching,
    error: cleanerError,
    refetch: refetchCleaner,
  } = useStaffJobControllerJobs(
    {
      queryParams: {
        ...filters,
      },
    },
    { enabled: isCleaner },
  );

  // --- Unified Results ---
  let jobs: Job[] = [];
  let isLoading = false;
  let isRefetching = false;
  let error: unknown = undefined;
  let refetch = () => {};

  if (isManager) {
    jobs = managerJobsData?.data || [];
    isLoading = isManagerLoading;
    isRefetching = isManagerRefetching;
    error = managerError;
    refetch = refetchManager;
  } else if (isCleaner) {
    jobs = cleanerJobsData?.data || [];
    isLoading = isCleanerLoading;
    isRefetching = isCleanerRefetching;
    error = cleanerError;
    refetch = refetchCleaner;
  }

  return { jobs, isLoading, isRefetching, error, refetch };
};
