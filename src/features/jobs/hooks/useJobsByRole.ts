// useJobsByRole.ts
import {
  CustomerJobControllerJobsQueryParams,
  JobControllerJobsQueryParams,
  useCustomerJobControllerJobs,
  useJobControllerJobs
} from '@/fetchers/queriesComponents';
import type { Job } from '@/src/features/jobs/types';
import { useAuthStore } from '@/src/lib/store/authStore';

// Define a common type for your API query parameters
type CommonQueryParams = Omit<CustomerJobControllerJobsQueryParams, 'customerId' | 'staffId'>;

type JobsHookResult = {
  jobs: Job[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

/**
 * A custom hook to fetch jobs based on the user's role and apply filters.
 */
export const useJobsByRole = (filters?: CustomerJobControllerJobsQueryParams| JobControllerJobsQueryParams): JobsHookResult => {
  const user = useAuthStore((state) => state.user);
  const isManager = !!user?.customerId && user?.role === 'manager'; // Assuming managers have customerId
  const isCleaner = user?.role === 'general';
  console.log('User Role:', user?.role, 'isManager:', isManager, 'isCleaner:', isCleaner);
  
  // Base query parameters including pagination and search filter
  
  // --- 1. Fetch for Manager (using customerId) ---
  const {
    data: managerJobsData,
    isLoading: isManagerLoading,
    error: managerError,
    refetch: refetchManager,
  } = useCustomerJobControllerJobs(
    { 
      queryParams: { 
        ...filters,
        customerId: user?.customerId || '', 
      } 
    },
    { enabled: isManager } 
  );

  // --- 2. Fetch for Cleaner (using staffId/id) ---
  const { 
    data: cleanerJobsData, 
    isLoading: isCleanerLoading,
    error: cleanerError,
    refetch: refetchCleaner,
  } = useJobControllerJobs(
    { 
      queryParams: { 
        ...filters,
        staffId: user?.id,
      } 
    },
    { enabled: isCleaner }
  );

  // --- Unified Results ---
  let jobs: Job[] = [];
  let isLoading = false;
  let error: unknown = undefined;
  let refetch = () => {};

  if (isManager) {
    jobs = managerJobsData?.data || [];
    isLoading = isManagerLoading;
    error = managerError;
    refetch = refetchManager;
  } else if (isCleaner) {
    jobs = cleanerJobsData?.data || [];
    isLoading = isCleanerLoading;
    error = cleanerError;
    refetch = refetchCleaner;
  }

  return { jobs, isLoading, error, refetch };
};