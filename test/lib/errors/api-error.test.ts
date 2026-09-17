import type { AxiosError } from 'axios';

import { ApiError } from '~/lib/errors/api-error';
import type { ErrorResponse } from '~/types/response';

describe('ApiError', () => {
  const createErrorResponse = (
    overrides: Partial<ErrorResponse> = {},
  ): ErrorResponse => ({
    type: 'validation_error',
    errors: [
      {
        attr: 'email',
        detail: 'Invalid email format',
        code: 'invalid_email',
      },
    ],
    timestamp: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  const createAxiosError = (
    responseData?: unknown,
    status?: number,
  ): AxiosError => {
    const error = new Error('Request failed') as AxiosError;

    error.config = {} as AxiosError['config'];
    error.response = responseData
      ? ({
          data: responseData,
          status: status || 400,
          statusText: 'Bad Request',
          headers: {},
          config: {},
        } as AxiosError['response'])
      : undefined;
    error.code = 'ERR_BAD_REQUEST';
    error.message = 'Request failed';

    return error;
  };

  describe('constructor', () => {
    it('should create an ApiError with all properties', () => {
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse, 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.type).toBe('validation_error');
      expect(error.errors).toEqual(errorResponse.errors);
      expect(error.timestamp).toBe('2024-01-01T00:00:00.000Z');
      expect(error.status).toBe(400);
      expect(error.message).toBe('Invalid email format');
    });

    it('should use first error detail as message', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'First error', code: 'err1' },
          { attr: 'field2', detail: 'Second error', code: 'err2' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.message).toBe('First error');
    });

    it('should use fallback message when no errors exist', () => {
      const errorResponse = createErrorResponse({ errors: [] });
      const error = new ApiError(errorResponse);

      expect(error.message).toBe('An unknown error occurred');
    });

    it('should use fallback message when detail is null', () => {
      const errorResponse = createErrorResponse({
        errors: [{ attr: 'field', detail: null, code: 'err' }],
      });
      const error = new ApiError(errorResponse);

      expect(error.message).toBe('An unknown error occurred');
    });

    it('should store originalError when provided', () => {
      const axiosError = createAxiosError();
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse, 400, axiosError);

      expect(error.originalError).toBe(axiosError);
    });

    it('should work without status', () => {
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse);

      expect(error.status).toBeUndefined();
    });
  });

  describe('fromAxiosError', () => {
    it('should create ApiError from AxiosError with valid ErrorResponse', () => {
      const errorResponse = createErrorResponse();
      const axiosError = createAxiosError(errorResponse, 422);

      const apiError = ApiError.fromAxiosError(axiosError);

      expect(apiError.type).toBe('validation_error');
      expect(apiError.errors).toEqual(errorResponse.errors);
      expect(apiError.status).toBe(422);
      expect(apiError.originalError).toBe(axiosError);
    });

    it('should create fallback ApiError when response data is not ErrorResponse', () => {
      const axiosError = createAxiosError(
        { message: 'Something went wrong' },
        500,
      );

      const apiError = ApiError.fromAxiosError(axiosError);

      expect(apiError.type).toBe('network_error');
      expect(apiError.errors[0].detail).toBe('Request failed');
      expect(apiError.errors[0].code).toBe('ERR_BAD_REQUEST');
      expect(apiError.status).toBe(500);
    });

    it('should create fallback ApiError when no response exists', () => {
      const axiosError = createAxiosError();

      axiosError.response = undefined;

      const apiError = ApiError.fromAxiosError(axiosError);

      expect(apiError.type).toBe('network_error');
      expect(apiError.errors[0].detail).toBe('Request failed');
      expect(apiError.status).toBeUndefined();
    });

    it('should use fallback message when axios error message is empty', () => {
      const axiosError = createAxiosError();

      axiosError.response = undefined;
      axiosError.message = '';
      axiosError.code = undefined;

      const apiError = ApiError.fromAxiosError(axiosError);

      expect(apiError.errors[0].detail).toBe('Network request failed');
      expect(apiError.errors[0].code).toBe('UNKNOWN');
    });

    it('should generate valid timestamp for fallback error', () => {
      const axiosError = createAxiosError();

      axiosError.response = undefined;

      const apiError = ApiError.fromAxiosError(axiosError);

      expect(new Date(apiError.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('isErrorResponse', () => {
    it('should return true for valid ErrorResponse', () => {
      const errorResponse = createErrorResponse();

      expect(ApiError.isErrorResponse(errorResponse)).toBe(true);
    });

    it('should return false for null', () => {
      expect(ApiError.isErrorResponse(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(ApiError.isErrorResponse(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(ApiError.isErrorResponse('string')).toBe(false);
      expect(ApiError.isErrorResponse(123)).toBe(false);
      expect(ApiError.isErrorResponse(true)).toBe(false);
    });

    it('should return false when type is missing', () => {
      expect(
        ApiError.isErrorResponse({
          errors: [],
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      ).toBe(false);
    });

    it('should return false when errors is missing', () => {
      expect(
        ApiError.isErrorResponse({
          type: 'validation_error',
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      ).toBe(false);
    });

    it('should return false when timestamp is missing', () => {
      expect(
        ApiError.isErrorResponse({
          type: 'validation_error',
          errors: [],
        }),
      ).toBe(false);
    });

    it('should return false when type is not a string', () => {
      expect(
        ApiError.isErrorResponse({
          type: 123,
          errors: [],
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      ).toBe(false);
    });

    it('should return false when errors is not an array', () => {
      expect(
        ApiError.isErrorResponse({
          type: 'validation_error',
          errors: {},
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      ).toBe(false);
    });

    it('should return false when timestamp is not a string', () => {
      expect(
        ApiError.isErrorResponse({
          type: 'validation_error',
          errors: [],
          timestamp: 123,
        }),
      ).toBe(false);
    });
  });

  describe('getFirstError', () => {
    it('should return the first error', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'First', code: 'err1' },
          { attr: 'field2', detail: 'Second', code: 'err2' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getFirstError()).toEqual({
        attr: 'field1',
        detail: 'First',
        code: 'err1',
      });
    });

    it('should return null when no errors exist', () => {
      const errorResponse = createErrorResponse({ errors: [] });
      const error = new ApiError(errorResponse);

      expect(error.getFirstError()).toBeNull();
    });
  });

  describe('getErrorsByField', () => {
    it('should return errors for specified field', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'email', detail: 'Invalid format', code: 'invalid' },
          { attr: 'email', detail: 'Already exists', code: 'duplicate' },
          { attr: 'password', detail: 'Too short', code: 'min_length' },
        ],
      });
      const error = new ApiError(errorResponse);

      const emailErrors = error.getErrorsByField('email');

      expect(emailErrors).toHaveLength(2);
      expect(emailErrors[0].detail).toBe('Invalid format');
      expect(emailErrors[1].detail).toBe('Already exists');
    });

    it('should return empty array when field has no errors', () => {
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse);

      expect(error.getErrorsByField('nonexistent')).toEqual([]);
    });
  });

  describe('getErrorCodes', () => {
    it('should return all error codes', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'Error 1', code: 'code1' },
          { attr: 'field2', detail: 'Error 2', code: 'code2' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getErrorCodes()).toEqual(['code1', 'code2']);
    });

    it('should filter out null codes', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'Error 1', code: 'code1' },
          { attr: 'field2', detail: 'Error 2', code: null },
          { attr: 'field3', detail: 'Error 3', code: 'code3' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getErrorCodes()).toEqual(['code1', 'code3']);
    });

    it('should return empty array when no errors have codes', () => {
      const errorResponse = createErrorResponse({
        errors: [{ attr: 'field', detail: 'Error', code: null }],
      });
      const error = new ApiError(errorResponse);

      expect(error.getErrorCodes()).toEqual([]);
    });
  });

  describe('hasErrorCode', () => {
    it('should return true when error code exists', () => {
      const errorResponse = createErrorResponse({
        errors: [{ attr: 'email', detail: 'Invalid', code: 'invalid_email' }],
      });
      const error = new ApiError(errorResponse);

      expect(error.hasErrorCode('invalid_email')).toBe(true);
    });

    it('should return false when error code does not exist', () => {
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse);

      expect(error.hasErrorCode('nonexistent_code')).toBe(false);
    });
  });

  describe('getFieldErrors', () => {
    it('should return field errors grouped by field name', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'email', detail: 'Invalid format', code: 'invalid' },
          { attr: 'email', detail: 'Already exists', code: 'duplicate' },
          { attr: 'password', detail: 'Too short', code: 'min_length' },
        ],
      });
      const error = new ApiError(errorResponse);

      const fieldErrors = error.getFieldErrors();

      expect(fieldErrors).toEqual({
        email: ['Invalid format', 'Already exists'],
        password: ['Too short'],
      });
    });

    it('should skip errors without attr', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: null, detail: 'General error', code: 'general' },
          { attr: 'email', detail: 'Invalid', code: 'invalid' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getFieldErrors()).toEqual({
        email: ['Invalid'],
      });
    });

    it('should skip errors without detail', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'email', detail: null, code: 'invalid' },
          { attr: 'password', detail: 'Too short', code: 'min_length' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getFieldErrors()).toEqual({
        password: ['Too short'],
      });
    });

    it('should return empty object when no field errors', () => {
      const errorResponse = createErrorResponse({ errors: [] });
      const error = new ApiError(errorResponse);

      expect(error.getFieldErrors()).toEqual({});
    });
  });

  describe('getAllDetails', () => {
    it('should return all details joined with default separator', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'First error', code: 'err1' },
          { attr: 'field2', detail: 'Second error', code: 'err2' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getAllDetails()).toBe('First error. Second error');
    });

    it('should return all details joined with custom separator', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'First error', code: 'err1' },
          { attr: 'field2', detail: 'Second error', code: 'err2' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getAllDetails(', ')).toBe('First error, Second error');
    });

    it('should filter out null details', () => {
      const errorResponse = createErrorResponse({
        errors: [
          { attr: 'field1', detail: 'First error', code: 'err1' },
          { attr: 'field2', detail: null, code: 'err2' },
          { attr: 'field3', detail: 'Third error', code: 'err3' },
        ],
      });
      const error = new ApiError(errorResponse);

      expect(error.getAllDetails()).toBe('First error. Third error');
    });

    it('should return empty string when no details exist', () => {
      const errorResponse = createErrorResponse({
        errors: [{ attr: 'field', detail: null, code: 'err' }],
      });
      const error = new ApiError(errorResponse);

      expect(error.getAllDetails()).toBe('');
    });
  });

  describe('isValidationError', () => {
    it('should return true for validation_error type', () => {
      const errorResponse = createErrorResponse({ type: 'validation_error' });
      const error = new ApiError(errorResponse);

      expect(error.isValidationError()).toBe(true);
    });

    it('should return false for other error types', () => {
      const errorResponse = createErrorResponse({ type: 'server_error' });
      const error = new ApiError(errorResponse);

      expect(error.isValidationError()).toBe(false);
    });
  });

  describe('isAuthenticationError', () => {
    it('should return true for unauthorized type', () => {
      const errorResponse = createErrorResponse({ type: 'unauthorized' });
      const error = new ApiError(errorResponse);

      expect(error.isAuthenticationError()).toBe(true);
    });

    it('should return true for 401 status', () => {
      const errorResponse = createErrorResponse({ type: 'some_error' });
      const error = new ApiError(errorResponse, 401);

      expect(error.isAuthenticationError()).toBe(true);
    });

    it('should return false for other errors', () => {
      const errorResponse = createErrorResponse({ type: 'validation_error' });
      const error = new ApiError(errorResponse, 400);

      expect(error.isAuthenticationError()).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for status >= 500', () => {
      const errorResponse = createErrorResponse();
      const error500 = new ApiError(errorResponse, 500);
      const error502 = new ApiError(errorResponse, 502);
      const error503 = new ApiError(errorResponse, 503);

      expect(error500.isServerError()).toBe(true);
      expect(error502.isServerError()).toBe(true);
      expect(error503.isServerError()).toBe(true);
    });

    it('should return false for status < 500', () => {
      const errorResponse = createErrorResponse();
      const error400 = new ApiError(errorResponse, 400);
      const error404 = new ApiError(errorResponse, 404);
      const error422 = new ApiError(errorResponse, 422);

      expect(error400.isServerError()).toBe(false);
      expect(error404.isServerError()).toBe(false);
      expect(error422.isServerError()).toBe(false);
    });

    it('should return false when status is undefined', () => {
      const errorResponse = createErrorResponse();
      const error = new ApiError(errorResponse);

      expect(error.isServerError()).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network_error type', () => {
      const errorResponse = createErrorResponse({ type: 'network_error' });
      const error = new ApiError(errorResponse);

      expect(error.isNetworkError()).toBe(true);
    });

    it('should return false for other error types', () => {
      const errorResponse = createErrorResponse({ type: 'validation_error' });
      const error = new ApiError(errorResponse);

      expect(error.isNetworkError()).toBe(false);
    });
  });
});
