import { QueryClient } from "@tanstack/react-query";

// one cache for the whole app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // data is "fresh" for 30s -> no new request in this time
      gcTime: 5 * 60 * 1000, // unused data is removed from memory after 5 min
      refetchOnWindowFocus: true, // stale data is revalidated when the tab is opened again
      // 404 will not change on retry, other (random) server errors get one more try
      retry: (failureCount, error) => error?.status !== 404 && failureCount < 1,
    },
  },
});
