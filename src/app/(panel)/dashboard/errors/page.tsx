import Link from 'next/link';

import { BasicErrorDisplay } from './-components/basic-error-display';
import { ErrorCategorization } from './-components/error-categorization';
import { ErrorUtilitiesDemo } from './-components/error-utilities-demo';
import { FieldSpecificErrors } from './-components/field-specific-errors';
import { MockErrorTriggers } from './-components/mock-error-triggers';

export default function ErrorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link className="hover:text-gray-700" href="/dashboard">
            Dashboard
          </Link>
          <span>/</span>
          <span>Error Handling Examples</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error Handling Examples
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">
            About Error Handling
          </h2>
          <p className="text-blue-800 text-sm">
            This page demonstrates the comprehensive error handling system built
            into this boilerplate. The system provides type-safe error
            processing, standardized error responses, and convenient utility
            methods for handling different error scenarios.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Error Display
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Demonstrates simple error message display using the{' '}
            <code className="bg-gray-100 px-1 rounded">getAllDetails()</code>{' '}
            method.
          </p>
          <BasicErrorDisplay />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Field-Specific Error Handling
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Shows how to display validation errors for specific form fields
            using{' '}
            <code className="bg-gray-100 px-1 rounded">getErrorsByField()</code>{' '}
            and{' '}
            <code className="bg-gray-100 px-1 rounded">getFieldErrors()</code>.
          </p>
          <FieldSpecificErrors />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error Categorization
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Demonstrates different error types and how to handle them using
            categorization methods like{' '}
            <code className="bg-gray-100 px-1 rounded">
              isValidationError()
            </code>
            ,{' '}
            <code className="bg-gray-100 px-1 rounded">
              isAuthenticationError()
            </code>
            , etc.
          </p>
          <ErrorCategorization />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error Utilities
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Showcases utility functions for error code checking, custom
            separators, and error analysis.
          </p>
          <ErrorUtilitiesDemo />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mock Error Testing
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Interactive buttons to trigger different mock API errors for testing
            the error handling system.
          </p>
          <MockErrorTriggers />
        </section>
      </div>
    </div>
  );
}
