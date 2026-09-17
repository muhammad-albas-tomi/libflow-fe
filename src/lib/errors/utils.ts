// Penjelasan:
// Helper error: ambil pesan error yang enak dibaca untuk ditampilkan.
import type { AxiosError } from 'axios';

import { ApiError } from './api-error';

/**
 * Type guard to check if an unknown value is an ApiError instance.
 *
 * @param error - The value to check
 * @returns True if the value is an instance of ApiError
 *
 * @example
 * ```ts
 * try {
 *   await apiCall();
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.log(error.type); // TypeScript knows this is ApiError
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extracts an ApiError from an unknown error value.
 * Handles both ApiError instances and AxiosErrors, converting them to ApiError.
 *
 * @param error - The error to extract (ApiError, AxiosError, or unknown)
 * @returns An ApiError instance if the input is ApiError or AxiosError, null otherwise
 *
 * @example
 * ```ts
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const apiError = extractApiError(error);
 *   if (apiError) {
 *     console.log(apiError.message);
 *   }
 * }
 * ```
 */
export function extractApiError(error: unknown): ApiError | null {
  if (isApiError(error)) {
    return error;
  }

  if (isAxiosError(error)) {
    return ApiError.fromAxiosError(error);
  }

  return null;
}

/**
 * Type guard to check if an unknown value is an AxiosError.
 * This is useful when you don't want to import axios directly.
 *
 * @param error - The value to check
 * @returns True if the value has the structure of an AxiosError
 *
 * @example
 * ```ts
 * try {
 *   await apiCall();
 * } catch (error) {
 *   if (isAxiosError(error)) {
 *     console.log(error.response?.status);
 *   }
 * }
 * ```
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'config' in error &&
    'response' in error
  );
}

/**
 * Extracts a human-readable error message from various error types.
 * Handles ApiError, generic Error, strings, and unknown types with a fallback.
 *
 * @param error - The error to extract a message from
 * @param fallback - The fallback message if no error message can be extracted (default: 'An unknown error occurred')
 * @returns A string error message suitable for display to users
 *
 * @example
 * ```ts
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const message = getErrorMessage(error, 'Operation failed');
 *   showToast({ message, type: 'error' });
 * }
 * ```
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = 'An unknown error occurred',
): string {
  const apiError = extractApiError(error);

  if (apiError) {
    return apiError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}
