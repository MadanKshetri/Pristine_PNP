import { useJobControllerJobs } from '@/fetchers/queriesComponents';
import { useMemo, useState } from 'react';
import type { JobFilters } from '../types';

export const useJobs = () => {
  const [filters, setFilters] = useState<JobFilters>({
    status: 'all',
    page: 1,
    take: 20,
  });

  const queryVariables = useMemo(() => {
    const queryParams: Record<string, any> = {
      page: filters.page || 1,
      take: filters.take || 20,
    };

    if (filters.search) {
      queryParams.search = filters.search;
    }

    return { queryParams };
  }, [filters]);
  console.log(queryVariables)

  const { data, isLoading, error, refetch } = useJobControllerJobs(queryVariables);

  // Check if error is actually a "no data" situation (not a real error)
  const hasRealError = error && !data;
  const isEmpty = !isLoading && !error && (!data?.data || data.data.length === 0);

  // Client-side filtering for status (if backend doesn't support it)
  const filteredJobs = useMemo(() => {
    if (!data?.data) return [];
    
    // For now, we'll show all jobs since the backend doesn't provide status filtering
    // The status filtering will be done on the checklist level inside job details
    return data.data;
  }, [data?.data]);

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      page: 1,
      take: 20,
    });
  };

  return {
    jobs: filteredJobs,
    pagination: data?.pagination,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    error: hasRealError ? error : null,
    isEmpty,
    refetch,
  };
};
