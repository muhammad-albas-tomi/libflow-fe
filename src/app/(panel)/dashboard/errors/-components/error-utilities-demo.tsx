'use client';
// Penjelasan:
// Komponen/halaman React.

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { isApiError } from '~/lib/errors/utils';

interface UtilityDemo {
  title: string;
  value: unknown;
  description: string;
}

export function ErrorUtilitiesDemo() {
  const [error, setError] = useState<ApiError | null>(null);
  const [separator, setSeparator] = useState('. ');
  const [searchCode, setSearchCode] = useState('required');

  const { mutate: triggerError, isPending } = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      const response = await api.post('/errors/validation');

      return response.data;
    },
    onError: (error) => {
      if (isApiError(error)) {
        setError(error);
      }
    },
    onSuccess: () => {
      setError(null);
    },
  });

  const utilities: UtilityDemo[] = error
    ? [
        {
          title: 'getAllDetails(separator)',
          value: error.getAllDetails(separator),
          description: `Joins all error details with "${separator}"`,
        },
        {
          title: 'getFirstError()',
          value: JSON.stringify(error.getFirstError(), null, 2),
          description: 'Returns the first error object from the errors array',
        },
        {
          title: 'getErrorCodes()',
          value: JSON.stringify(error.getErrorCodes(), null, 2),
          description: 'Returns array of all error codes',
        },
        {
          title: `hasErrorCode('${searchCode}')`,
          value: error.hasErrorCode(searchCode).toString(),
          description: `Checks if error contains the specific code "${searchCode}"`,
        },
        {
          title: 'getFieldErrors()',
          value: JSON.stringify(error.getFieldErrors(), null, 2),
          description:
            'Returns object with field names as keys and error messages as arrays',
        },
        {
          title: "getErrorsByField('email')",
          value: JSON.stringify(error.getErrorsByField('email'), null, 2),
          description: 'Returns all errors for a specific field',
        },
        {
          title: 'Properties',
          value: JSON.stringify(
            {
              type: error.type,
              status: error.status,
              timestamp: error.timestamp,
              message: error.message,
              errorCount: error.errors.length,
            },
            null,
            2,
          ),
          description: 'Core ApiError properties and metadata',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          disabled={isPending}
          onClick={() => triggerError()}
        >
          {isPending ? 'Loading...' : 'Generate Error for Testing'}
        </button>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => setError(null)}
        >
          Clear Error
        </button>
      </div>

      {error && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Separator for getAllDetails()
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., '. ', ' | ', '\\n'"
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Code to Search
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., required, invalid_email"
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {utilities.map((utility, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    <code className="text-purple-600">{utility.title}</code>
                  </h4>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {utility.description}
                </p>

                <div className="bg-gray-50 rounded border p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap wrap-break-word">
                    {typeof utility.value === 'string'
                      ? utility.value
                      : String(utility.value)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!error && (
        <div className="text-center py-8 text-gray-500">
          Click &quot;Generate Error for Testing&quot; to see utility method
          demonstrations
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Complete Utility Reference:
        </h4>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
          {`// Core Methods
error.getAllDetails(separator = '. ')    // Join all error details
error.getFirstError()                    // Get first error object
error.getErrorCodes()                    // Get array of error codes
error.hasErrorCode(code)                 // Check if specific code exists
error.getFieldErrors()                   // Get field-grouped errors
error.getErrorsByField(field)            // Get errors for specific field

// Category Checks
error.isValidationError()                // type === 'validation_error'
error.isAuthenticationError()            // type === 'unauthorized' || status === 401
error.isServerError()                    // status >= 500
error.isNetworkError()                   // type === 'network_error'

// Properties
error.type                               // Error type string
error.status                             // HTTP status code
error.timestamp                          // ISO timestamp
error.message                            // Error message (first detail)
error.errors                             // Raw errors array`}
        </pre>
      </div>
    </div>
  );
}
