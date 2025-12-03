import { QueryClient } from "@tanstack/react-query";

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests up to 2 times
      retry: 2,
      // Keep data fresh for 5 minutes
      staleTime: 1000,
      // Cache data for 10 minutes
      gcTime: 1000 * 2,
      // Refetch on window focus (for web)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Don't retry mutations by default to avoid duplicate error logs
      retry: 0,
    },
  },
});
