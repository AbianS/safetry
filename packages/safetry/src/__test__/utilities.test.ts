import { describe, it, expect, vi } from 'vitest';
import {
  unwrap,
  tapError,
  mapValue,
  mapError,
  isOk,
  isError,
  combine,
} from '../utilities';
import { success, failure } from '../core';

describe('utilities', () => {
  describe('unwrap', () => {
    it('should return the value for success results', () => {
      const result = success('test value');
      const value = unwrap(result);

      expect(value).toBe('test value');
    });

    it('should throw the error for failure results', () => {
      const error = new Error('test error');
      const result = failure(error);

      expect(() => unwrap(result)).toThrow(error);
    });

    it('should work with different value types', () => {
      const numberResult = success(42);
      const objectResult = success({ key: 'value' });
      const arrayResult = success([1, 2, 3]);

      expect(unwrap(numberResult)).toBe(42);
      expect(unwrap(objectResult)).toEqual({ key: 'value' });
      expect(unwrap(arrayResult)).toEqual([1, 2, 3]);
    });
  });

  describe('tapError', () => {
    it('should call handler for failure results', () => {
      const error = new Error('test error');
      const result = failure(error);
      const handler = vi.fn();

      const returnedResult = tapError(result, handler);

      expect(handler).toHaveBeenCalledWith(error);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(returnedResult).toBe(result);
    });

    it('should not call handler for success results', () => {
      const result = success('test value');
      const handler = vi.fn();

      const returnedResult = tapError(result, handler);

      expect(handler).not.toHaveBeenCalled();
      expect(returnedResult).toBe(result);
    });

    it('should return the same result instance', () => {
      const successResult = success('test');
      const failureResult = failure(new Error('test'));
      const handler = vi.fn();

      expect(tapError(successResult, handler)).toBe(successResult);
      expect(tapError(failureResult, handler)).toBe(failureResult);
    });
  });

  describe('mapValue', () => {
    it('should transform the value for success results', () => {
      const result = success(5);
      const mapper = (x: number) => x * 2;

      const mappedResult = mapValue(result, mapper);

      expect(mappedResult.ok).toBe(true);
      if (mappedResult.ok) {
        expect(mappedResult.value).toBe(10);
      }
    });

    it('should not transform for failure results', () => {
      const error = new Error('test error');
      const result = failure(error);
      const mapper = vi.fn((x: string) => x.toUpperCase());

      const mappedResult = mapValue(result, mapper);

      expect(mapper).not.toHaveBeenCalled();
      expect(mappedResult.ok).toBe(false);
      if (!mappedResult.ok) {
        expect(mappedResult.error).toBe(error);
      }
    });

    it('should work with different transformation types', () => {
      const stringResult = success('hello');
      const numberResult = success(42);

      const upperCased = mapValue(stringResult, (s) => s.toUpperCase());
      const doubled = mapValue(numberResult, (n) => n * 2);
      const stringified = mapValue(numberResult, (n) => n.toString());

      expect(upperCased.ok).toBe(true);
      if (upperCased.ok) expect(upperCased.value).toBe('HELLO');

      expect(doubled.ok).toBe(true);
      if (doubled.ok) expect(doubled.value).toBe(84);

      expect(stringified.ok).toBe(true);
      if (stringified.ok) expect(stringified.value).toBe('42');
    });

    it('should preserve error type for failure results', () => {
      const customError = new TypeError('type error');
      const result = failure(customError);
      const mapper = (x: string) => x.length;

      const mappedResult = mapValue(result, mapper);

      expect(mappedResult.ok).toBe(false);
      if (!mappedResult.ok) {
        expect(mappedResult.error).toBe(customError);
        expect(mappedResult.error).toBeInstanceOf(TypeError);
      }
    });
  });

  describe('mapError', () => {
    it('should transform error for failure results', () => {
      const originalError = new Error('original error');
      const result = failure(originalError);
      const mapper = (error: Error) =>
        new TypeError(`Transformed: ${error.message}`);

      const mappedResult = mapError(result, mapper);

      expect(mappedResult.ok).toBe(false);
      if (!mappedResult.ok) {
        expect(mappedResult.error).toBeInstanceOf(TypeError);
        expect(mappedResult.error.message).toBe('Transformed: original error');
      }
    });

    it('should not transform error for success results', () => {
      const result = success('test value');
      const mapper = vi.fn((error: Error) => new TypeError(error.message));

      const mappedResult = mapError(result, mapper);

      expect(mapper).not.toHaveBeenCalled();
      expect(mappedResult).toBe(result);
    });
  });

  describe('isOk', () => {
    it('should return true for success results', () => {
      const result = success('test');
      expect(isOk(result)).toBe(true);
    });

    it('should return false for failure results', () => {
      const result = failure(new Error('test'));
      expect(isOk(result)).toBe(false);
    });

    it('should work as type guard', () => {
      const result = success(42);
      if (isOk(result)) {
        expect(result.value).toBe(42); // TypeScript should know this is safe
      }
    });
  });

  describe('isError', () => {
    it('should return false for success results', () => {
      const result = success('test');
      expect(isError(result)).toBe(false);
    });

    it('should return true for failure results', () => {
      const result = failure(new Error('test'));
      expect(isError(result)).toBe(true);
    });

    it('should work as type guard', () => {
      const result = failure(new Error('test error'));
      if (isError(result)) {
        expect(result.error.message).toBe('test error'); // TypeScript should know this is safe
      }
    });
  });

  describe('combine', () => {
    it('should combine all success results', () => {
      const result1 = success('first');
      const result2 = success(42);
      const result3 = success(true);

      const combined = combine([result1, result2, result3] as const);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual(['first', 42, true]);
      }
    });

    it('should return first error if any result fails', () => {
      const result1 = success('first');
      const error = new Error('second failed');
      const result2 = failure(error);
      const result3 = success(true);

      const combined = combine([result1, result2, result3] as const);

      expect(combined.ok).toBe(false);
      if (!combined.ok) {
        expect(combined.error).toBe(error);
      }
    });

    it('should work with empty array', () => {
      const combined = combine([] as const);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([]);
      }
    });

    it('should work with single result', () => {
      const result = success('single');
      const combined = combine([result] as const);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual(['single']);
      }
    });

    it('should preserve types properly', () => {
      const stringResult = success('string');
      const numberResult = success(123);
      const booleanResult = success(false);

      const combined = combine([
        stringResult,
        numberResult,
        booleanResult,
      ] as const);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        const [str, num, bool] = combined.value;
        expect(typeof str).toBe('string');
        expect(typeof num).toBe('number');
        expect(typeof bool).toBe('boolean');
      }
    });
  });
});
