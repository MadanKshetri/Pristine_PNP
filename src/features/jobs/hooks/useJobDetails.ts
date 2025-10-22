import { useJobControllerJob } from '@/fetchers/queriesComponents';

export const useJobDetails = (jobId: string) => {
  const { data, isLoading, error, refetch } = useJobControllerJob({
    pathParams: { id: jobId },
  });

  return {
    job: data?.data,
    isLoading,
    error,
    refetch,
  };
};
