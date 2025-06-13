import type { Result } from './core';
import { success, failure } from './core';

export function unwrap<T>(result: Result<T, Error>): T {
  if (result.ok) return result.value;
  throw (result as { ok: false; error: Error }).error;
}

export function tapError<T>(
  result: Result<T, Error>,
  handler: (error: Error) => void,
): Result<T, Error> {
  if (!result.ok) handler((result as { ok: false; error: Error }).error);
  return result;
}

export function mapValue<T, U>(
  result: Result<T, Error>,
  mapper: (value: T) => U,
): Result<U, Error> {
  return result.ok
    ? success(mapper(result.value))
    : failure((result as { ok: false; error: Error }).error);
}

export function mapError<T>(
  result: Result<T, Error>,
  mapper: (error: Error) => Error,
): Result<T, Error> {
  return result.ok
    ? result
    : failure(mapper((result as { ok: false; error: Error }).error));
}

export function isOk<T>(
  result: Result<T, Error>,
): result is { ok: true; value: T } {
  return result.ok;
}

export function isError<T>(
  result: Result<T, Error>,
): result is { ok: false; error: Error } {
  return !result.ok;
}

export function combine<T extends readonly unknown[]>(
  results: readonly [...{ [K in keyof T]: Result<T[K], Error> }],
): Result<T, Error> {
  const values: unknown[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!result.ok) {
      return failure((result as { ok: false; error: Error }).error);
    }
    values[i] = result.value;
  }

  return success(values as unknown as T);
}
