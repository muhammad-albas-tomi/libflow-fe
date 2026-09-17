'use client';

import { useMutation } from '@tanstack/react-query';

import { api } from '~/lib/axios';

export function NewUserButton() {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.post('/users', {
        name: 'New User',
      });

      return response.data;
    },
  });

  return (
    <button
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      disabled={isPending}
      onClick={() => mutate()}
    >
      {isPending ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          Creating...
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Add User
        </>
      )}
    </button>
  );
}
