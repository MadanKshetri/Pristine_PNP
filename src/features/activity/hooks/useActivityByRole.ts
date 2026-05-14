import {
  AdminActivityControllerActivitiesQueryParams,
  useAdminActivityControllerActivities,
  useStaffActivityControllerActivities,
} from "@/fetchers/queriesComponents";
import type { ListActivityDto } from "@/fetchers/queriesSchemas";
import { useAuthStore } from "@/src/lib/store/authStore";

type CommonQueryParams = Omit<
  AdminActivityControllerActivitiesQueryParams,
  "customerId" | "siteId" | "jobId" | "userId"
>;

type ActivityHookResult = {
  activities: ListActivityDto[];
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  refetch: () => void;
  hasNextPage: boolean;
  total: number;
};

/**
 * Role-based activity hook.
 * - Manager / Customer Manager -> admin activity endpoint
 * - Cleaner -> staff activity endpoint
 */
export const useActivityByRole = (
  filters?: CommonQueryParams,
): ActivityHookResult => {
  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";
  const isCleaner = user?.role === "cleaner";

  // Admin activity
  const {
    data: adminData,
    isLoading: isAdminLoading,
    isRefetching: isAdminRefetching,
    error: adminError,
    refetch: refetchAdmin,
  } = useAdminActivityControllerActivities(
    { queryParams: { ...filters } },
    { enabled: isManager },
  );

  // Staff activity
  const {
    data: staffData,
    isLoading: isStaffLoading,
    isRefetching: isStaffRefetching,
    error: staffError,
    refetch: refetchStaff,
  } = useStaffActivityControllerActivities(
    { queryParams: { ...filters } },
    { enabled: isCleaner },
  );

  if (isManager) {
    const pagination = adminData?.pagination;
    return {
      activities: adminData?.data || [],
      isLoading: isAdminLoading,
      isRefetching: isAdminRefetching,
      error: adminError,
      refetch: refetchAdmin,
      hasNextPage: pagination?.nextPage != null,
      total: pagination?.total ?? 0,
    };
  }

  const pagination = staffData?.pagination;
  return {
    activities: staffData?.data || [],
    isLoading: isStaffLoading,
    isRefetching: isStaffRefetching,
    error: staffError,
    refetch: refetchStaff,
    hasNextPage: pagination?.nextPage != null,
    total: pagination?.total ?? 0,
  };
};
