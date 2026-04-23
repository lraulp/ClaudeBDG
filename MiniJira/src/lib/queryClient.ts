import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Do not refetch when window regains focus; polling handles metrics
      refetchOnWindowFocus: false,
      // Retry once on failure before surfacing error
      retry: 1,
      // Data considered fresh for 30 seconds
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
})
