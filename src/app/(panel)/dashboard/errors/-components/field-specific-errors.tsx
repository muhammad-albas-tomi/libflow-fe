'use client';
// Penjelasan:
// Komponen/halaman React.

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { isApiError } from '~/lib/errors/utils';

interface FormData {
  name: string;
  email: string;
  age: string;
}

export function FieldSpecificErrors() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { mutate: submitForm, isPending } = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      const response = await api.post('/errors/validation', formData);

      return response.data;
    },
    onError: (error) => {
      if (isApiError(error)) {
        setFieldErrors(error.getFieldErrors());
      }
    },
    onSuccess: () => {
      setFieldErrors({});
    },
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const getFieldErrorClass = (field: string) => {
    return fieldErrors[field]?.length > 0
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className="space-y-6">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitForm();
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldErrorClass('name')}`}
            placeholder="Enter your name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          {fieldErrors.name?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldErrorClass('email')}`}
            placeholder="Enter your email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {fieldErrors.email?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldErrorClass('age')}`}
            placeholder="Enter your age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
          />
          {fieldErrors.age?.map((error, index) => (
            <p key={index} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Submitting...' : 'Submit Form (Trigger Validation)'}
          </button>

          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            type="button"
            onClick={() => setFieldErrors({})}
          >
            Clear Errors
          </button>
        </div>
      </form>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Code Example:</h4>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
          {`// Using ApiError.getFieldErrors() method
onError: (error) => {
  if (isApiError(error)) {
    const fieldErrors = error.getFieldErrors();
    // Returns: { name: ['Required field'], email: ['Invalid email format'] }
    setFieldErrors(fieldErrors);
  }
}

// Or get errors for specific field
const nameErrors = error.getErrorsByField('name');`}
        </pre>
      </div>
    </div>
  );
}
