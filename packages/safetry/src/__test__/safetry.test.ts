import { describe, it, expect } from 'vitest';
import { safetry } from '../safetry';

describe('safetry', () => {
  describe('with sync functions', () => {
    it('should return success for successful operations', async () => {
      const result = await safetry(() => 'success');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('success');
      }
    });

    it('should return failure for throwing operations', async () => {
      const error = new Error('test error');
      const result = await safetry(() => {
        throw error;
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });

    it('should normalize string errors', async () => {
      const result = await safetry(() => {
        throw 'string error';
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('string error');
      }
    });

    it('should normalize unknown errors', async () => {
      const result = await safetry(() => {
        throw { custom: 'object' };
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('[object Object]');
      }
    });
  });

  describe('with async functions', () => {
    it('should return success for successful async operations', async () => {
      const result = await safetry(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async success';
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('async success');
      }
    });

    it('should return failure for rejecting async operations', async () => {
      const error = new Error('async error');
      const result = await safetry(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw error;
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('with Promise values', () => {
    it('should handle resolved promises', async () => {
      const promise = Promise.resolve('resolved value');
      const result = await safetry(promise);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('resolved value');
      }
    });

    it('should handle rejected promises', async () => {
      const error = new Error('rejection error');
      const promise = Promise.reject(error);
      const result = await safetry(promise);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('with custom error transform', () => {
    it('should use custom error transform', async () => {
      const result = await safetry(
        () => {
          throw 'raw error';
        },
        {
          errorTransform: (raw) => new TypeError(`Custom: ${raw}`),
        },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(TypeError);
        expect(result.error.message).toBe('Custom: raw error');
      }
    });
  });

  describe('with captureStack option', () => {
    it('should capture stack when error has no stack', async () => {
      const errorWithoutStack = new Error('no stack');
      errorWithoutStack.stack = undefined;

      const result = await safetry(
        () => {
          throw errorWithoutStack;
        },
        { captureStack: true },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stack).toBeDefined();
        expect(typeof result.error.stack).toBe('string');
      }
    });

    it('should not override existing stack', async () => {
      const errorWithStack = new Error('has stack');
      const originalStack = errorWithStack.stack;

      const result = await safetry(
        () => {
          throw errorWithStack;
        },
        { captureStack: true },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.stack).toBe(originalStack);
      }
    });
  });
});
