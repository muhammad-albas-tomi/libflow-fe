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
        refetchOnWindowFocus: false,
        // Refetch saat komponen mount supaya data (stok, dll) tidak basi
        // setelah peminjaman/pengembalian.
        refetchOnMount: true,
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
