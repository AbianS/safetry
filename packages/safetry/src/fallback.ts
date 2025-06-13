import type { Result } from './core';

export function fallback<T>(
  result: Result<T, Error>,
  defaultValue: T | ((error: Error) => T),
): T {
  if (result.ok) {
    return result.value;
  }

  return typeof defaultValue === 'function'
    ? (defaultValue as (error: Error) => T)(
        (result as { ok: false; error: Error }).error,
      )
    : defaultValue;
}

export async function fallbackAsync<T>(
  result: Promise<Result<T, Error>>,
  defaultValue: T | ((error: Error) => T | Promise<T>),
): Promise<T> {
  const awaited = await result;

  if (awaited.ok) {
    return awaited.value;
  }

  return typeof defaultValue === 'function'
    ? await (defaultValue as (error: Error) => Promise<T>)(
        (awaited as { ok: false; error: Error }).error,
      )
    : defaultValue;
}
