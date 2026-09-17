'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { isApiError } from '~/lib/errors/utils';

interface ErrorTest {
  endpoint: string;
  label: string;
  description: string;
  expectedStatus: number;
  expectedType: string;
  color: string;
}

const errorTests: ErrorTest[] = [
  {
    endpoint: '/errors/basic',
    label: 'Basic Error',
    description: 'Simple error with single message',
    expectedStatus: 400,
    expectedType: 'client_error',
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    endpoint: '/errors/validation',
    label: 'Validation Error',
    description: 'Multiple field validation errors',
    expectedStatus: 400,
    expectedType: 'validation_error',
    color: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    endpoint: '/errors/unauthorized',
    label: 'Unauthorized',
    description: 'Authentication/authorization error',
    expectedStatus: 401,
    expectedType: 'unauthorized',
    color: 'bg-yellow-600 hover:bg-yellow-700',
  },
  {
    endpoint: '/errors/server-error',
    label: 'Server Error',
    description: 'Internal server error',
    expectedStatus: 500,
    expectedType: 'server_error',
    color: 'bg-red-700 hover:bg-red-800',
  },
  {
    endpoint: '/nonexistent',
    label: 'Network Error',
    description: 'Simulated network/404 error',
    expectedStatus: 404,
    expectedType: 'network_error',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
];

export function MockErrorTriggers() {
  const [lastError, setLastError] = useState<ApiError | null>(null);
  const [lastTest, setLastTest] = useState<ErrorTest | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const { mutate: triggerError, isPending } = useMutation<
    unknown,
    ApiError,
    ErrorTest
  >({
    mutationFn: async (test: ErrorTest) => {
      const response = await api.post(test.endpoint);

      return response.data;
    },
    onError: (error, test) => {
      if (isApiError(error)) {
        setLastError(error);
        setLastTest(test);

        // Test if the error matches expectations
        const isCorrectStatus = error.status === test.expectedStatus;
        const isCorrectType = error.type === test.expectedType;

        setTestResults((prev) => ({
          ...prev,
          [test.endpoint]: isCorrectStatus && isCorrectType,
        }));
      }
    },
    onSuccess: (_, test) => {
      // This shouldn't happen for error endpoints
      setTestResults((prev) => ({
        ...prev,
        [test.endpoint]: false,
      }));
    },
  });

  const runAllTests = async () => {
    setTestResults({});

    for (const test of errorTests) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      triggerError(test);
    }
  };

  const getTestResultIcon = (endpoint: string) => {
    const result = testResults[endpoint];

    if (result === undefined) return null;

    return result ? (
      <span className="text-green-600 font-bold ml-2">✓</span>
    ) : (
      <span className="text-red-600 font-bold ml-2">✗</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          disabled={isPending}
          onClick={runAllTests}
        >
          {isPending ? 'Testing...' : 'Run All Error Tests'}
        </button>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => {
            setLastError(null);
            setLastTest(null);
            setTestResults({});
          }}
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {errorTests.map((test, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{test.label}</h4>
              {getTestResultIcon(test.endpoint)}
            </div>

            <p className="text-sm text-gray-600 mb-3">{test.description}</p>

            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <div>Expected Status: {test.expectedStatus}</div>
              <div>Expected Type: {test.expectedType}</div>
            </div>

            <button
              className={`w-full px-3 py-2 text-white rounded-md disabled:opacity-50 ${test.color}`}
              disabled={isPending}
              onClick={() => triggerError(test)}
            >
              Test {test.label}
            </button>
          </div>
        ))}
      </div>

      {lastError && lastTest && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Last Test: {lastTest.label}
            </h3>
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                testResults[lastTest.endpoint]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {testResults[lastTest.endpoint] ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Expected</h4>
              <div className="text-sm space-y-1">
                <div>Status: {lastTest.expectedStatus}</div>
                <div>Type: {lastTest.expectedType}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Actual</h4>
              <div className="text-sm space-y-1">
                <div>Status: {lastError.status || 'N/A'}</div>
                <div>Type: {lastError.type}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-700 mb-2">Error Details</h4>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Message:</strong> {lastError.message}
                </div>
                <div>
                  <strong>All Details:</strong> {lastError.getAllDetails()}
                </div>
                <div>
                  <strong>Error Codes:</strong>{' '}
                  {lastError.getErrorCodes().join(', ') || 'None'}
                </div>
                <div>
                  <strong>Timestamp:</strong> {lastError.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Testing Framework:</h4>
        <p className="text-sm text-gray-600 mb-2">
          This component tests the error handling system by triggering various
          mock API endpoints and verifying that the returned errors match
          expected patterns.
        </p>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
          {`// Error testing pattern
const { mutate } = useMutation<unknown, ApiError>({
  onError: (error) => {
    if (isApiError(error)) {
      // Verify error properties
      const statusMatch = error.status === expectedStatus;
      const typeMatch = error.type === expectedType;
      // Process test results
    }
  }
});`}
        </pre>
      </div>
    </div>
  );
}
