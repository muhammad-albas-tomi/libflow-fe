import type { AxiosError } from 'axios';

import { ApiError } from '~/lib/errors/api-error';
import {
  isApiError,
  extractApiError,
  isAxiosError,
  getErrorMessage,
} from '~/lib/errors/utils';
import type { ErrorResponse } from '~/types/response';

describe('Error Utils', () => {
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

  const createAxiosErrorObj = (
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

  describe('isApiError', () => {
    it('should return true for ApiError instance', () => {
      const errorResponse = createErrorResponse();
      const apiError = new ApiError(errorResponse, 400);

      expect(isApiError(apiError)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');

      expect(isApiError(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for plain object', () => {
      expect(isApiError({ message: 'error' })).toBe(false);
    });

    it('should return false for string', () => {
      expect(isApiError('error message')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isApiError(404)).toBe(false);
    });

    it('should return false for AxiosError (not converted)', () => {
      const axiosError = createAxiosErrorObj();

      expect(isApiError(axiosError)).toBe(false);
    });
  });

  describe('isAxiosError', () => {
    it('should return true for AxiosError-like object with config and response', () => {
      const axiosError = createAxiosErrorObj();

      expect(isAxiosError(axiosError)).toBe(true);
    });

    it('should return true for object with config and response properties', () => {
      const axiosLike = {
        config: {},
        response: { data: {}, status: 200 },
      };

      expect(isAxiosError(axiosLike)).toBe(true);
    });

    it('should return true even when response is undefined but present', () => {
      const axiosError = createAxiosErrorObj();

      axiosError.response = undefined;

      expect(isAxiosError(axiosError)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isAxiosError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAxiosError(undefined)).toBe(false);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');

      expect(isAxiosError(error)).toBe(false);
    });

    it('should return false for object without config', () => {
      const obj = { response: { data: {} } };

      expect(isAxiosError(obj)).toBe(false);
    });

    it('should return false for object without response property', () => {
      const obj = { config: {} };

      expect(isAxiosError(obj)).toBe(false);
    });

    it('should return false for ApiError', () => {
      const apiError = new ApiError(createErrorResponse());

      expect(isAxiosError(apiError)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isAxiosError('error')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isAxiosError(500)).toBe(false);
    });
  });

  describe('extractApiError', () => {
    it('should return same ApiError when passed ApiError', () => {
      const errorResponse = createErrorResponse();
      const apiError = new ApiError(errorResponse, 400);

      const result = extractApiError(apiError);

      expect(result).toBe(apiError);
    });

    it('should convert AxiosError to ApiError with valid ErrorResponse', () => {
      const errorResponse = createErrorResponse();
      const axiosError = createAxiosErrorObj(errorResponse, 422);

      const result = extractApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result?.type).toBe('validation_error');
      expect(result?.status).toBe(422);
    });

    it('should convert AxiosError to ApiError with fallback when no ErrorResponse', () => {
      const axiosError = createAxiosErrorObj({ message: 'Server error' }, 500);

      const result = extractApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result?.type).toBe('network_error');
      expect(result?.status).toBe(500);
    });

    it('should convert AxiosError without response', () => {
      const axiosError = createAxiosErrorObj();

      axiosError.response = undefined;

      const result = extractApiError(axiosError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result?.type).toBe('network_error');
    });

    it('should return null for regular Error', () => {
      const error = new Error('Regular error');

      expect(extractApiError(error)).toBeNull();
    });

    it('should return null for null', () => {
      expect(extractApiError(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(extractApiError(undefined)).toBeNull();
    });

    it('should return null for plain object', () => {
      expect(extractApiError({ message: 'error' })).toBeNull();
    });

    it('should return null for string', () => {
      expect(extractApiError('error message')).toBeNull();
    });

    it('should return null for number', () => {
      expect(extractApiError(404)).toBeNull();
    });
  });

  describe('getErrorMessage', () => {
    describe('with ApiError', () => {
      it('should return ApiError message', () => {
        const errorResponse = createErrorResponse({
          errors: [
            { attr: 'email', detail: 'Email is invalid', code: 'invalid' },
          ],
        });
        const apiError = new ApiError(errorResponse);

        expect(getErrorMessage(apiError)).toBe('Email is invalid');
      });
    });

    describe('with AxiosError', () => {
      it('should extract and return message from AxiosError with ErrorResponse', () => {
        const errorResponse = createErrorResponse({
          errors: [
            {
              attr: 'password',
              detail: 'Password is too short',
              code: 'min_length',
            },
          ],
        });
        const axiosError = createAxiosErrorObj(errorResponse, 400);

        expect(getErrorMessage(axiosError)).toBe('Password is too short');
      });

      it('should return fallback message from AxiosError without ErrorResponse', () => {
        const axiosError = createAxiosErrorObj(
          { message: 'Server error' },
          500,
        );

        expect(getErrorMessage(axiosError)).toBe('Request failed');
      });
    });

    describe('with regular Error', () => {
      it('should return Error message', () => {
        const error = new Error('Something went wrong');

        expect(getErrorMessage(error)).toBe('Something went wrong');
      });

      it('should return Error message for custom Error classes', () => {
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'CustomError';
          }
        }
        const error = new CustomError('Custom error occurred');

        expect(getErrorMessage(error)).toBe('Custom error occurred');
      });
    });

    describe('with string', () => {
      it('should return the string itself', () => {
        expect(getErrorMessage('Something went wrong')).toBe(
          'Something went wrong',
        );
      });

      it('should return empty string as-is', () => {
        expect(getErrorMessage('')).toBe('');
      });
    });

    describe('with fallback', () => {
      it('should return default fallback for unknown types', () => {
        expect(getErrorMessage(null)).toBe('An unknown error occurred');
        expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
        expect(getErrorMessage(123)).toBe('An unknown error occurred');
        expect(getErrorMessage({})).toBe('An unknown error occurred');
        expect(getErrorMessage([])).toBe('An unknown error occurred');
        expect(getErrorMessage(true)).toBe('An unknown error occurred');
      });

      it('should return custom fallback message', () => {
        expect(getErrorMessage(null, 'Custom fallback')).toBe(
          'Custom fallback',
        );
        expect(getErrorMessage(undefined, 'Oops!')).toBe('Oops!');
        expect(getErrorMessage({}, 'Unknown issue')).toBe('Unknown issue');
      });
    });

    describe('priority order', () => {
      it('should prioritize ApiError over string fallback', () => {
        const errorResponse = createErrorResponse({
          errors: [{ attr: 'field', detail: 'ApiError message', code: 'err' }],
        });
        const apiError = new ApiError(errorResponse);

        expect(getErrorMessage(apiError, 'Fallback')).toBe('ApiError message');
      });

      it('should prioritize Error message over string fallback', () => {
        const error = new Error('Error message');

        expect(getErrorMessage(error, 'Fallback')).toBe('Error message');
      });
    });
  });
});
