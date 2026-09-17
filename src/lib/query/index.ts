// Penjelasan:
// Setup QueryClient (TanStack Query): aturan caching default.
import { QueryClient } from '@tanstack/react-query';

import { defaultQueryFn } from './default-query-fn';

let queryClient: QueryClient | null = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime 0: data dianggap usang setelah dipakai, jadi tiap buka
        // halaman (mis. Katalog/Kelola Buku) selalu ambil stok terbaru.
        staleTime: 0,
        // Selalu ambil data terbaru saat halaman dibuka (stok tidak basi)
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
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
