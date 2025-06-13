// Core types and constructors
export type { Result } from './core';
export { success, failure } from './core';

// Main safetry function
export { safetry } from './safetry';

// Utility functions
export {
  unwrap,
  tapError,
  mapValue,
  mapError,
  isOk,
  isError,
  combine,
} from './utilities';

// Fallback functions
export { fallback, fallbackAsync } from './fallback';
