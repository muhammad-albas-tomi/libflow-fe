import type * as z from 'zod';

import { buildZodErrors, delay, randomDelay } from '~/lib/utils';

describe('utils', () => {
  describe('delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified milliseconds', async () => {
      const promise = delay(500);

      jest.advanceTimersByTime(499);
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(1);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
    });

    it('should default to 1000ms when no argument provided', async () => {
      const promise = delay();

      jest.advanceTimersByTime(999);
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(1);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
    });

    it('should resolve with undefined', async () => {
      const promise = delay(100);

      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeUndefined();
    });
  });

  describe('randomDelay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay within the specified range', async () => {
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const promise = randomDelay(100, 200);

      // With Math.random() = 0.5, delay should be: floor(0.5 * 101) + 100 = 150
      jest.advanceTimersByTime(150);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
      mockRandom.mockRestore();
    });

    it('should use minimum delay when Math.random returns 0', async () => {
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

      const promise = randomDelay(100, 200);

      // With Math.random() = 0, delay should be: floor(0 * 101) + 100 = 100
      jest.advanceTimersByTime(100);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
      mockRandom.mockRestore();
    });

    it('should use maximum delay when Math.random returns close to 1', async () => {
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.999);

      const promise = randomDelay(100, 200);

      // With Math.random() = 0.999, delay should be: floor(0.999 * 101) + 100 = 200
      jest.advanceTimersByTime(200);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
      mockRandom.mockRestore();
    });

    it('should use default range (500-1500ms) when no arguments provided', async () => {
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

      const promise = randomDelay();

      // With Math.random() = 0, delay should be 500 (minimum default)
      jest.advanceTimersByTime(500);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
      mockRandom.mockRestore();
    });
  });

  describe('buildZodErrors', () => {
    it('should transform Zod issues to error format', () => {
      const issues = [
        {
          code: 'invalid_type',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ] as unknown as z.core.$ZodIssue[];

      const result = buildZodErrors(issues);

      expect(result).toEqual([
        {
          attr: 'email',
          detail: 'Expected string, received number',
          code: 'invalid_type',
        },
      ]);
    });

    it('should join nested paths with dot notation', () => {
      const issues = [
        {
          code: 'too_small',
          path: ['user', 'address', 'street'],
          message: 'String must contain at least 1 character(s)',
        },
      ] as unknown as z.core.$ZodIssue[];

      const result = buildZodErrors(issues);

      expect(result).toEqual([
        {
          attr: 'user.address.street',
          detail: 'String must contain at least 1 character(s)',
          code: 'too_small',
        },
      ]);
    });

    it('should handle array index in path', () => {
      const issues = [
        {
          code: 'invalid_type',
          path: ['items', 0, 'name'],
          message: 'Required',
        },
      ] as unknown as z.core.$ZodIssue[];

      const result = buildZodErrors(issues);

      expect(result).toEqual([
        {
          attr: 'items.0.name',
          detail: 'Required',
          code: 'invalid_type',
        },
      ]);
    });

    it('should handle empty path', () => {
      const issues = [
        {
          code: 'invalid_type',
          path: [],
          message: 'Expected object, received null',
        },
      ] as unknown as z.core.$ZodIssue[];

      const result = buildZodErrors(issues);

      expect(result).toEqual([
        {
          attr: '',
          detail: 'Expected object, received null',
          code: 'invalid_type',
        },
      ]);
    });

    it('should handle multiple issues', () => {
      const issues = [
        {
          code: 'invalid_type',
          path: ['email'],
          message: 'Required',
        },
        {
          code: 'too_small',
          path: ['password'],
          message: 'String must contain at least 8 character(s)',
        },
      ] as unknown as z.core.$ZodIssue[];

      const result = buildZodErrors(issues);

      expect(result).toEqual([
        {
          attr: 'email',
          detail: 'Required',
          code: 'invalid_type',
        },
        {
          attr: 'password',
          detail: 'String must contain at least 8 character(s)',
          code: 'too_small',
        },
      ]);
    });

    it('should return empty array for empty issues', () => {
      const result = buildZodErrors([]);

      expect(result).toEqual([]);
    });
  });
});
