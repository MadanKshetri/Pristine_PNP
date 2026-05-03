import {
  AdminJobControllerJobsQueryParams,
  StaffJobControllerJobsQueryParams,
  fetchAdminJobControllerJobs,
  fetchStaffJobControllerJobs,
} from "@/fetchers/queriesComponents";
import type { Job } from "@/src/features/jobs/types";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useInfiniteQuery } from "@tanstack/react-query";

type CommonQueryParams = Omit<AdminJobControllerJobsQueryParams, "staffId">;

type UseInfiniteJobsByRoleResult = {
  jobs: Job[];
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

const DEFAULT_TAKE = 20;

export const useInfiniteJobsByRole = (
  filters?: StaffJobControllerJobsQueryParams,
): UseInfiniteJobsByRoleResult => {
  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";
  const isCleaner = user?.role === "cleaner";

  const take = filters?.take ?? DEFAULT_TAKE;

  const adminQuery = useInfiniteQuery({
    queryKey: ["jobs", "admin", { ...filters, take }],
    initialPageParam: 0,
    enabled: isManager,
    queryFn: async ({ pageParam }) => {
      return fetchAdminJobControllerJobs({
        queryParams: {
          ...(filters as CommonQueryParams),
          take,
          page: pageParam,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.nextPage ?? undefined;
    },
  });

  const staffQuery = useInfiniteQuery({
    queryKey: ["jobs", "staff", { ...filters, take }],
    initialPageParam: 0,
    enabled: isCleaner,
    queryFn: async ({ pageParam }) => {
      return fetchStaffJobControllerJobs({
        queryParams: {
          ...filters,
          take,
          page: pageParam,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.nextPage ?? undefined;
    },
  });

  const activeQuery = isManager ? adminQuery : staffQuery;

  const jobs =
    activeQuery.data?.pages.flatMap((page) => page.data ?? []) ?? ([] as Job[]);

  return {
    jobs,
    isLoading: activeQuery.isLoading,
    isRefetching: activeQuery.isRefetching,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    fetchNextPage: activeQuery.fetchNextPage,
    hasNextPage: Boolean(activeQuery.hasNextPage),
    isFetchingNextPage: activeQuery.isFetchingNextPage,
  };
};
