'use client';
// Penjelasan:
// Komponen/halaman React.

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { isApiError } from '~/lib/errors/utils';

interface ErrorInfo {
  error: ApiError | null;
  category: string;
  description: string;
}

export function ErrorCategorization() {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const { mutate: triggerValidationError, isPending: isValidationPending } =
    useMutation<unknown, ApiError>({
      mutationFn: async () => {
        const response = await api.post('/errors/validation');

        return response.data;
      },
      onError: (error) => {
        if (isApiError(error)) {
          setErrorInfo({
            error,
            category: 'Validation Error',
            description: 'Form validation failed with multiple field errors',
          });
        }
      },
    });

  const { mutate: triggerAuthError, isPending: isAuthPending } = useMutation<
    unknown,
    ApiError
  >({
    mutationFn: async () => {
      const response = await api.post('/errors/unauthorized');

      return response.data;
    },
    onError: (error) => {
      if (isApiError(error)) {
        setErrorInfo({
          error,
          category: 'Authentication Error',
          description: 'Access denied or token expired',
        });
      }
    },
  });

  const { mutate: triggerServerError, isPending: isServerPending } =
    useMutation<unknown, ApiError>({
      mutationFn: async () => {
        const response = await api.post('/errors/server-error');

        return response.data;
      },
      onError: (error) => {
        if (isApiError(error)) {
          setErrorInfo({
            error,
            category: 'Server Error',
            description: 'Internal server error occurred',
          });
        }
      },
    });

  const { mutate: triggerNetworkError, isPending: isNetworkPending } =
    useMutation<unknown, ApiError>({
      mutationFn: async () => {
        // Simulate network error by calling non-existent endpoint
        const response = await api.post('/non-existent-endpoint');

        return response.data;
      },
      onError: (error) => {
        if (isApiError(error)) {
          setErrorInfo({
            error,
            category: 'Network Error',
            description: 'Network request failed or timed out',
          });
        }
      },
    });

  const getErrorTypeIcon = (error: ApiError) => {
    if (error.isValidationError()) {
      return (
        <svg
          className="h-5 w-5 text-orange-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            fillRule="evenodd"
          />
        </svg>
      );
    }

    if (error.isAuthenticationError()) {
      return (
        <svg
          className="h-5 w-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            fillRule="evenodd"
          />
        </svg>
      );
    }

    if (error.isServerError()) {
      return (
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
      );
    }

    if (error.isNetworkError()) {
      return (
        <svg
          className="h-5 w-5 text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-.707-.293L5 9.414V5zm2 10a1 1 0 001 1h10a1 1 0 001-1v-1a1 1 0 00-1-1H6a1 1 0 00-1 1v1z"
            fillRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-5 w-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          clipRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          fillRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          disabled={isValidationPending}
          onClick={() => triggerValidationError()}
        >
          {isValidationPending ? 'Loading...' : 'Validation Error'}
        </button>

        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          disabled={isAuthPending}
          onClick={() => triggerAuthError()}
        >
          {isAuthPending ? 'Loading...' : 'Auth Error'}
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          disabled={isServerPending}
          onClick={() => triggerServerError()}
        >
          {isServerPending ? 'Loading...' : 'Server Error'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isNetworkPending}
          onClick={() => triggerNetworkError()}
        >
          {isNetworkPending ? 'Loading...' : 'Network Error'}
        </button>
      </div>

      <button
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        onClick={() => setErrorInfo(null)}
      >
        Clear Error
      </button>

      {errorInfo?.error && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            {getErrorTypeIcon(errorInfo.error)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {errorInfo.category}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {errorInfo.description}
              </p>

              <div className="mt-3 space-y-2">
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Error Type:</span>
                  <span className="ml-2 text-gray-600">
                    {errorInfo.error.type}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="font-medium text-gray-700">
                    Status Code:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {errorInfo.error.status || 'N/A'}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="font-medium text-gray-700">Checks:</span>
                  <div className="ml-2 space-x-4 text-gray-600">
                    <span>
                      Validation:{' '}
                      {errorInfo.error.isValidationError() ? '✓' : '✗'}
                    </span>
                    <span>
                      Auth:{' '}
                      {errorInfo.error.isAuthenticationError() ? '✓' : '✗'}
                    </span>
                    <span>
                      Server: {errorInfo.error.isServerError() ? '✓' : '✗'}
                    </span>
                    <span>
                      Network: {errorInfo.error.isNetworkError() ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-medium text-gray-700">Message:</span>
                  <span className="ml-2 text-gray-600">
                    {errorInfo.error.getAllDetails()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Code Example:</h4>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
          {`// Using error categorization methods
if (error.isValidationError()) {
  // Handle form validation errors
  showFieldErrors(error.getFieldErrors());
} else if (error.isAuthenticationError()) {
  // Redirect to login or refresh token
  redirectToLogin();
} else if (error.isServerError()) {
  // Show generic server error message
  showServerErrorDialog();
} else if (error.isNetworkError()) {
  // Show network connectivity message
  showNetworkErrorNotification();
}`}
        </pre>
      </div>
    </div>
  );
}
