import { QueryClient } from '@tanstack/react-query';

import { defaultQueryFn } from './default-query-fn';

let queryClient: QueryClient | null = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        queryFn: defaultQueryFn,
      },
    },
  });
}

export function getQueryClient() {
  if (!queryClient) {
    queryClient = makeQueryClient();
  }

  return queryClient;
}
