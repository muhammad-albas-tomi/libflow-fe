import type { AxiosError } from 'axios';

import type { ErrorResponse } from '~/types/response';

/**
 * Custom error class for handling API errors in a structured way.
 * Extends the built-in Error class with additional properties for error details.
 *
 * @example
 * ```ts
 * // Create from error response
 * const error = new ApiError(errorResponse, 400, axiosError);
 * console.log(error.type); // 'validation_error'
 * console.log(error.getFieldErrors()); // { email: ['Invalid email'] }
 * ```
 */
export class ApiError extends Error {
  /** Error type identifier (e.g., 'validation_error', 'unauthorized', 'network_error') */
  public readonly type: string;
  /** Array of error objects with attribute, detail, and code information */
  public readonly errors: Array<{
    /** The field/attribute that caused the error, or null for general errors */
    attr: string | null;
    /** Human-readable error description */
    detail: string | null;
    /** Machine-readable error code */
    code: string | null;
  }>;
  /** ISO timestamp of when the error occurred */
  public readonly timestamp: string;
  /** HTTP status code (if available) */
  public readonly status?: number;
  /** The original Axios error for reference */
  public readonly originalError?: AxiosError;

  /**
   * Creates a new ApiError instance.
   *
   * @param errorResponse - The structured error response from the API
   * @param status - Optional HTTP status code
   * @param originalError - Optional original Axios error for debugging
   */
  constructor(
    errorResponse: ErrorResponse,
    status?: number,
    originalError?: AxiosError,
  ) {
    const firstError = errorResponse.errors[0];
    const message = firstError?.detail || 'An unknown error occurred';

    super(message);

    this.name = 'ApiError';
    this.type = errorResponse.type;
    this.errors = errorResponse.errors;
    this.timestamp = errorResponse.timestamp;
    this.status = status;
    this.originalError = originalError;
  }

  /**
   * Creates an ApiError from an Axios error.
   * Attempts to extract structured error data from the response, falling back to a network error.
   *
   * @param error - The Axios error to convert
   * @returns A new ApiError instance
   *
   * @example
   * ```ts
   * try {
   *   await apiCall();
   * } catch (error) {
   *   if (axios.isAxiosError(error)) {
   *     const apiError = ApiError.fromAxiosError(error);
   *     console.log(apiError.type);
   *   }
   * }
   * ```
   */
  static fromAxiosError(error: AxiosError): ApiError {
    if (error.response?.data && ApiError.isErrorResponse(error.response.data)) {
      return new ApiError(error.response.data, error.response.status, error);
    }

    // Adaptasi format error backend LibFlow: { code, message, stack? }
    const beError = ApiError.toErrorResponse(error.response?.data);
    if (beError) {
      return new ApiError(beError, error.response?.status, error);
    }

    const fallbackErrorResponse: ErrorResponse = {
      type: 'network_error',
      errors: [
        {
          attr: null,
          detail: error.message || 'Network request failed',
          code: error.code || 'UNKNOWN',
        },
      ],
      timestamp: new Date().toISOString(),
    };

    return new ApiError(fallbackErrorResponse, error.response?.status, error);
  }

  /**
   * Type guard to check if an unknown value is a valid ErrorResponse.
   *
   * @param data - The value to check
   * @returns True if the value matches the ErrorResponse structure
   *
   * @example
   * ```ts
   * if (ApiError.isErrorResponse(data)) {
   *   console.log(data.type); // TypeScript knows this is a string
   * }
   * ```
   */
  /**
   * Mengubah format error backend LibFlow ({ code, message, stack? })
   * menjadi ErrorResponse standar FE. Mengembalikan null jika tidak cocok.
   */
  static toErrorResponse(data: unknown): ErrorResponse | null {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('message' in data) ||
      typeof (data as { message: unknown }).message !== 'string'
    ) {
      return null;
    }

    const be = data as { code?: number; message: string; stack?: string };
    const errors: ErrorResponse['errors'] = [];

    // Detail validasi Zod dari backend disimpan sebagai JSON di `stack`
    if (be.message === 'Validation failed' && typeof be.stack === 'string') {
      try {
        const parsed = JSON.parse(be.stack) as Array<{
          path: string;
          message: string;
        }>;

        if (Array.isArray(parsed)) {
          for (const issue of parsed) {
            errors.push({
              attr: issue.path?.split('.').pop() ?? null,
              detail: issue.message ?? be.message,
              code: be.code ? String(be.code) : null,
            });
          }
        }
      } catch {
        // abaikan, pakai pesan utama di bawah
      }
    }

    if (errors.length === 0) {
      errors.push({
        attr: null,
        detail: be.message,
        code: be.code ? String(be.code) : null,
      });
    }

    return {
      type: 'api_error',
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static isErrorResponse(data: unknown): data is ErrorResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      'errors' in data &&
      'timestamp' in data &&
      typeof (data as ErrorResponse).type === 'string' &&
      Array.isArray((data as ErrorResponse).errors) &&
      typeof (data as ErrorResponse).timestamp === 'string'
    );
  }

  /**
   * Returns the first error object from the errors array, or null if no errors exist.
   *
   * @returns The first error object or null
   *
   * @example
   * ```ts
   * const firstError = apiError.getFirstError();
   * if (firstError) {
   *   console.log(firstError.detail);
   * }
   * ```
   */
  getFirstError() {
    return this.errors[0] || null;
  }

  /**
   * Returns all errors associated with a specific field.
   *
   * @param field - The field name to filter errors by
   * @returns Array of errors for the specified field
   *
   * @example
   * ```ts
   * const emailErrors = apiError.getErrorsByField('email');
   * emailErrors.forEach(err => console.log(err.detail));
   * ```
   */
  getErrorsByField(field: string) {
    return this.errors.filter((error) => error.attr === field);
  }

  /**
   * Extracts all error codes from the errors array.
   *
   * @returns Array of error codes (excluding null values)
   *
   * @example
   * ```ts
   * const codes = apiError.getErrorCodes();
   * // ['INVALID_EMAIL', 'WEAK_PASSWORD']
   * ```
   */
  getErrorCodes() {
    return this.errors.map((error) => error.code).filter(Boolean);
  }

  /**
   * Checks if a specific error code exists in the errors array.
   *
   * @param code - The error code to search for
   * @returns True if the error code exists
   *
   * @example
   * ```ts
   * if (apiError.hasErrorCode('TOKEN_EXPIRED')) {
   *   // Handle token expiration
   * }
   * ```
   */
  hasErrorCode(code: string) {
    return this.getErrorCodes().includes(code);
  }

  /**
   * Returns a record mapping field names to arrays of error messages.
   * Useful for displaying form validation errors.
   *
   * @returns Object with field names as keys and error message arrays as values
   *
   * @example
   * ```ts
   * const fieldErrors = apiError.getFieldErrors();
   * // { email: ['Invalid email format'], password: ['Too short'] }
   *
   * // Display in a form
   * Object.entries(fieldErrors).forEach(([field, messages]) => {
   *   console.log(`${field}: ${messages.join(', ')}`);
   * });
   * ```
   */
  getFieldErrors() {
    const fieldErrors: Record<string, string[]> = {};

    this.errors.forEach((error) => {
      if (error.attr && error.detail) {
        if (!fieldErrors[error.attr]) {
          fieldErrors[error.attr] = [];
        }
        fieldErrors[error.attr].push(error.detail);
      }
    });

    return fieldErrors;
  }

  /**
   * Concatenates all error detail messages into a single string.
   *
   * @param separator - The string to use as a separator between messages (default: '. ')
   * @returns All error details joined by the separator
   *
   * @example
   * ```ts
   * const message = apiError.getAllDetails('\n');
   * // "Invalid email format\nPassword is too short"
   * ```
   */
  getAllDetails(separator: string = '. ') {
    return this.errors
      .map((error) => error.detail)
      .filter(Boolean)
      .join(separator);
  }

  /**
   * Checks if this is a validation error.
   *
   * @returns True if the error type is 'validation_error'
   */
  isValidationError() {
    return this.type === 'validation_error';
  }

  /**
   * Checks if this is an authentication error.
   *
   * @returns True if the error type is 'unauthorized' or status is 401
   */
  isAuthenticationError() {
    return this.type === 'unauthorized' || this.status === 401;
  }

  /**
   * Checks if this is a server error (5xx status code).
   *
   * @returns True if the status code is 500 or higher
   */
  isServerError() {
    return this.status ? this.status >= 500 : false;
  }

  /**
   * Checks if this is a network error.
   *
   * @returns True if the error type is 'network_error'
   */
  isNetworkError() {
    return this.type === 'network_error';
  }
}
