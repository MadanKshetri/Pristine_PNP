import { QueryClient } from '@tanstack/react-query';

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests up to 2 times
      retry: 2,
      // Keep data fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache data for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Refetch on window focus (for web)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
