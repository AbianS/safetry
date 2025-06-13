import { describe, it, expect } from 'vitest';
import type { Result } from '../core';
import { success, failure } from '../core';

describe('core', () => {
  describe('success', () => {
    it('should create a success result with the given value', () => {
      const result = success('test value');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('test value');
      }
    });

    it('should work with different types', () => {
      const numberResult = success(42);
      const objectResult = success({ key: 'value' });
      const arrayResult = success([1, 2, 3]);

      expect(numberResult.ok).toBe(true);
      expect(objectResult.ok).toBe(true);
      expect(arrayResult.ok).toBe(true);

      if (numberResult.ok) expect(numberResult.value).toBe(42);
      if (objectResult.ok) expect(objectResult.value).toEqual({ key: 'value' });
      if (arrayResult.ok) expect(arrayResult.value).toEqual([1, 2, 3]);
    });
  });

  describe('failure', () => {
    it('should create a failure result with the given error', () => {
      const error = new Error('test error');
      const result = failure(error);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });

    it('should work with different error types', () => {
      const stringError = failure('string error');
      const customError = failure(new TypeError('type error'));

      expect(stringError.ok).toBe(false);
      expect(customError.ok).toBe(false);

      if (!stringError.ok) expect(stringError.error).toBe('string error');
      if (!customError.ok) expect(customError.error).toBeInstanceOf(TypeError);
    });
  });

  describe('Result type compatibility', () => {
    it('should work with type guards', () => {
      const successResult: Result<string, Error> = success('test');
      const errorResult: Result<string, Error> = failure(new Error('test'));

      if (successResult.ok) {
        expect(successResult.value).toBe('test');
      }

      if (!errorResult.ok) {
        expect(errorResult.error).toBeInstanceOf(Error);
      }
    });
  });
});
