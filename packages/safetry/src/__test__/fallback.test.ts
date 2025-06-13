import { describe, it, expect } from 'vitest';
import { fallback, fallbackAsync } from '../fallback';
import { success, failure } from '../core';

describe('fallback', () => {
  describe('fallback (sync)', () => {
    it('should return the value for success results', () => {
      const result = success('success value');
      const value = fallback(result, 'default');

      expect(value).toBe('success value');
    });

    it('should return the default value for failure results', () => {
      const result = failure(new Error('test error'));
      const value = fallback(result, 'default value');

      expect(value).toBe('default value');
    });

    it('should call the default function with the error for failure results', () => {
      const error = new Error('test error');
      const result = failure(error);
      const defaultFn = (err: Error) => `Error: ${err.message}`;

      const value = fallback(result, defaultFn);

      expect(value).toBe('Error: test error');
    });

    it('should work with different value types', () => {
      const numberResult = success(42);
      const failedNumberResult = failure(new Error('failed'));

      expect(fallback(numberResult, 0)).toBe(42);
      expect(fallback(failedNumberResult, 99)).toBe(99);
    });

    it('should work with complex default functions', () => {
      const result = failure(new TypeError('validation failed'));
      const defaultFn = (err: Error) => ({
        errorType: err.constructor.name,
        message: err.message,
        fallbackValue: 'recovered',
      });

      const value = fallback(result, defaultFn);

      expect(value).toEqual({
        errorType: 'TypeError',
        message: 'validation failed',
        fallbackValue: 'recovered',
      });
    });
  });

  describe('fallbackAsync', () => {
    it('should return the value for success results', async () => {
      const result = Promise.resolve(success('async success'));
      const value = await fallbackAsync(result, 'default');

      expect(value).toBe('async success');
    });

    it('should return the default value for failure results', async () => {
      const result = Promise.resolve(failure(new Error('async error')));
      const value = await fallbackAsync(result, 'async default');

      expect(value).toBe('async default');
    });

    it('should call the default function with the error for failure results', async () => {
      const error = new Error('async test error');
      const result = Promise.resolve(failure(error));
      const defaultFn = (err: Error) => `Async Error: ${err.message}`;

      const value = await fallbackAsync(result, defaultFn);

      expect(value).toBe('Async Error: async test error');
    });

    it('should handle async default functions', async () => {
      const error = new Error('async error');
      const result = Promise.resolve(failure(error));
      const asyncDefaultFn = async (err: Error) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return `Recovered from: ${err.message}`;
      };

      const value = await fallbackAsync(result, asyncDefaultFn);

      expect(value).toBe('Recovered from: async error');
    });

    it('should work with Promise-returning default functions', async () => {
      const result = Promise.resolve(failure(new Error('failed')));
      const promiseDefaultFn = (err: Error) =>
        Promise.resolve(`Promise: ${err.message}`);

      const value = await fallbackAsync(result, promiseDefaultFn);

      expect(value).toBe('Promise: failed');
    });

    it('should handle mixed sync/async default functions', async () => {
      const failedResult = Promise.resolve(failure(new Error('test')));

      const syncDefault = await fallbackAsync(failedResult, 'sync default');
      expect(syncDefault).toBe('sync default');

      const asyncDefault = await fallbackAsync(
        Promise.resolve(failure(new Error('test2'))),
        async () => 'async default',
      );
      expect(asyncDefault).toBe('async default');
    });
  });
});
