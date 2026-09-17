'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { isApiError } from '~/lib/errors/utils';

export function BasicErrorDisplay() {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { mutate: triggerError, isPending } = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      const response = await api.post('/errors/basic');

      return response.data;
    },
    onError: (error) => {
      if (isApiError(error)) {
        setErrorMessage(error.getAllDetails());
      } else {
        setErrorMessage('Unknown error occurred');
      }
    },
    onSuccess: () => {
      setErrorMessage('');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          disabled={isPending}
          onClick={() => triggerError()}
        >
          {isPending ? 'Loading...' : 'Trigger Basic Error'}
        </button>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => setErrorMessage('')}
        >
          Clear Error
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Occurred
              </h3>
              <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Code Example:</h4>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
          {`// Using ApiError.getAllDetails() method
onError: (error) => {
  if (isApiError(error)) {
    setErrorMessage(error.getAllDetails());
  }
}`}
        </pre>
      </div>
    </div>
  );
}
