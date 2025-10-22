import type { QueriesContext } from '@/fetchers/queriesContext';
import { useAuthStore } from '@/src/lib/store/authStore';

/**
 * Custom hook to inject authentication token into all API requests
 * Uses Zustand auth store to get the current token
 */
export function useAuthenticatedContext(): QueriesContext {
  const token = useAuthStore((state) => state.token);

  return {
    fetcherOptions: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      queryParams: {},
    },
    queryOptions: {},
  };
}
