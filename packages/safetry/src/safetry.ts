import type { Result } from './core';
import { success, failure } from './core';

export async function safetry<T>(
  operation: Promise<T> | (() => T | Promise<T>),
  config?: {
    captureStack?: boolean;
    errorTransform?: (raw: unknown) => Error;
  },
): Promise<Result<T, Error>> {
  try {
    const result = typeof operation === 'function' ? operation() : operation;

    const value = result instanceof Promise ? await result : result;

    return success(value);
  } catch (rawError) {
    const error =
      config?.errorTransform?.(rawError) || normalizeError(rawError);

    if (config?.captureStack && error.stack === undefined) {
      error.stack = new Error().stack;
    }

    return failure(error);
  }
}

const normalizeError = (raw: unknown): Error => {
  if (raw instanceof Error) return raw;
  if (typeof raw === 'string') return new Error(raw);
  return new Error(String(raw));
};
