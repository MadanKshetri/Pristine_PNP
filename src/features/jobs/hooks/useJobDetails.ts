import {
  useManagerJobControllerJob,
  useStaffJobControllerJob,
} from "@/fetchers/queriesComponents";
import { useAuthStore } from "@/src/lib/store/authStore";

export const useJobDetailsByRole = (jobId: string) => {
  const user = useAuthStore((state) => state.user);

  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  const {
    data: managerJob,
    isLoading: isLoadingManager,
    error: managerError,
    refetch: refetchManager,
  } = useManagerJobControllerJob(
    {
      pathParams: { id: jobId },
    },
    {
      enabled: isManager,
    },
  );

  const {
    data: cleanerJob,
    isLoading: isLoadingCleaner,
    error: cleanerError,
    refetch: refetchCleaner,
  } = useStaffJobControllerJob(
    {
      pathParams: { id: jobId },
    },
    {
      enabled: !isManager,
    },
  );

  return {
    job: isManager ? managerJob?.data : cleanerJob?.data,
    isLoading: isLoadingManager || isLoadingCleaner,
    error: managerError || cleanerError,
    refetch: isManager ? refetchManager : refetchCleaner,
  };
};
