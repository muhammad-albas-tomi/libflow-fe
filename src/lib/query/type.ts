// Penjelasan:
// Tipe untuk query key/instance.
export type AppQueryInstance = 'api';

export type AppQueryKey = [AppQueryInstance, string, object?];

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: [AppQueryKey] | [...ReadonlyArray<unknown>];
  }
}
