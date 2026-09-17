// Penjelasan:
// Fungsi fetch default: baca queryKey [['api', endpoint, params]] -> panggil API.
import type { QueryFunction } from '@tanstack/react-query';
import type { AppQueryKey } from './type';

import { api } from '../axios';

export const defaultQueryFn: QueryFunction = async (props) => {
  const { queryKey, signal } = props;

  if (
    Array.isArray(queryKey) &&
    Array.isArray(queryKey[0]) &&
    queryKey.length === 1 &&
    (queryKey[0].length === 3 || queryKey[0].length === 2)
  ) {
    const [instance, context, params] = queryKey[0] as AppQueryKey;

    switch (instance) {
      case 'api': {
        const response = await api.get(context, { params, signal });

        return response.data;
      }

      default: {
        throw new Error(`Unknown query instance: ${instance}`);
      }
    }
  }

  throw new Error(
    `Use a specific query function for queryKey: ${JSON.stringify(queryKey)}`,
  );
};
