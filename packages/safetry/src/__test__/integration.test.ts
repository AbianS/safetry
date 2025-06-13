import { describe, it, expect } from 'vitest';
import { safetry, fallback, mapValue, tapError, unwrap } from '../index';

describe('integration', () => {
  it('should work with a complete error handling flow', async () => {
    const processValue = async (input: string) => {
      if (input === 'fail') {
        throw new Error('Processing failed');
      }
      return input.toUpperCase();
    };

    const result = await safetry(() => processValue('hello'));
    const transformed = mapValue(result, (value) => `Processed: ${value}`);
    const withFallback = fallback(transformed, 'Default processed value');

    expect(withFallback).toBe('Processed: HELLO');
  });

  it('should handle error flow with fallback', async () => {
    const processValue = async (input: string) => {
      if (input === 'fail') {
        throw new Error('Processing failed');
      }
      return input.toUpperCase();
    };

    const result = await safetry(() => processValue('fail'));
    const transformed = mapValue(result, (value) => `Processed: ${value}`);
    const withFallback = fallback(
      transformed,
      (error) => `Error handled: ${error.message}`,
    );

    expect(withFallback).toBe('Error handled: Processing failed');
  });

  it('should demonstrate error logging with tapError', async () => {
    const logs: string[] = [];
    const logger = (error: Error) => logs.push(`Logged: ${error.message}`);

    const result = await safetry(() => {
      throw new Error('Something went wrong');
    });

    const tapped = tapError(result, logger);
    const fallbackValue = fallback(tapped, 'Recovered');

    expect(logs).toEqual(['Logged: Something went wrong']);
    expect(fallbackValue).toBe('Recovered');
  });

  it('should demonstrate unwrap with successful result', async () => {
    const result = await safetry(() => 'success');
    const value = unwrap(result);

    expect(value).toBe('success');
  });

  it('should demonstrate unwrap throwing on failure', async () => {
    const result = await safetry(() => {
      throw new Error('Failed operation');
    });

    expect(() => unwrap(result)).toThrow('Failed operation');
  });

  it('should chain multiple operations safely', async () => {
    const fetchData = async (id: string) => {
      if (id === 'invalid') {
        throw new Error('Invalid ID');
      }
      return { id, name: `User ${id}` };
    };

    const processUser = (user: { id: string; name: string }) => {
      return `${user.name} (${user.id})`;
    };

    // Success path
    const successResult = await safetry(() => fetchData('123'));
    const processed = mapValue(successResult, processUser);
    const final = fallback(processed, 'Unknown user');

    expect(final).toBe('User 123 (123)');

    // Error path
    const errorResult = await safetry(() => fetchData('invalid'));
    const processedError = mapValue(errorResult, processUser);
    const finalError = fallback(
      processedError,
      (error) => `Error: ${error.message}`,
    );

    expect(finalError).toBe('Error: Invalid ID');
  });

  it('should work with complex async operations', async () => {
    const complexAsyncOperation = async (steps: number) => {
      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        if (i === 2) {
          throw new Error(`Failed at step ${i + 1}`);
        }
      }
      return `Completed ${steps} steps`;
    };

    // Should succeed
    const successResult = await safetry(() => complexAsyncOperation(2));
    expect(fallback(successResult, 'Failed')).toBe('Completed 2 steps');

    // Should fail
    const errorResult = await safetry(() => complexAsyncOperation(5));
    expect(fallback(errorResult, 'Operation failed')).toBe('Operation failed');
  });
});
