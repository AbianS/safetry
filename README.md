# safetry

A TypeScript library for safe error handling using Result types, inspired by functional programming.

## 🚀 Features

- **Result Type**: Explicit error handling without exceptions
- **TypeScript First**: Fully typed with excellent type inference
- **Functional**: API inspired by functional programming
- **Zero Dependencies**: Lightweight library with no external dependencies
- **Async/Await**: Full support for asynchronous operations

## 📦 Installation

```bash
npm install safetry
```

## 🔧 Basic Usage

### `safetry` Function

Converts operations that can fail into a `Result` type:

```typescript
import { safetry } from 'safetry';

// Synchronous operation
const result = await safetry(() => {
  return JSON.parse('{"valid": "json"}');
});

if (result.ok) {
  console.log(result.value); // { valid: "json" }
} else {
  console.error(result.error); // Parsing error
}

// Asynchronous operation
const asyncResult = await safetry(async () => {
  const response = await fetch('/api/data');
  return await response.json();
});
```

### Utility Functions

#### `fallback` - Default Values

```typescript
import { safetry, fallback } from 'safetry';

const result = await safetry(() => riskyOperation());

// With static value
const value = fallback(result, 'default value');

// With function that receives the error
const valueWithError = fallback(result, (error) => {
  console.error('Operation failed:', error.message);
  return 'recovered value';
});
```

#### `mapValue` - Value Transformation

```typescript
import { safetry, mapValue } from 'safetry';

const result = await safetry(() => getUserId());
const upperCased = mapValue(result, id => id.toUpperCase());
```

#### `tapError` - Error Logging

```typescript
import { safetry, tapError } from 'safetry';

const result = await safetry(() => dangerousOperation());
const logged = tapError(result, (error) => {
  console.error('Error occurred:', error.message);
  // Send to logging service
});
```

#### `unwrap` - Extract Value or Throw Exception

```typescript
import { safetry, unwrap } from 'safetry';

const result = await safetry(() => operation());

try {
  const value = unwrap(result); // Throws if result.ok === false
  console.log('Success:', value);
} catch (error) {
  console.error('Failed:', error.message);
}
```

## 🔗 Operation Chaining

```typescript
import { safetry, mapValue, tapError, fallback } from 'safetry';

const processUser = async (userId: string) => {
  const result = await safetry(() => fetchUser(userId));
  
  return result
    |> tapError(#, error => logger.error('Fetch failed', error))
    |> mapValue(#, user => ({ ...user, processed: true }))
    |> fallback(#, { id: 'unknown', name: 'Anonymous', processed: false });
};

// Or without pipeline operator:
const processUserTraditional = async (userId: string) => {
  const result = await safetry(() => fetchUser(userId));
  const logged = tapError(result, error => logger.error('Fetch failed', error));
  const mapped = mapValue(logged, user => ({ ...user, processed: true }));
  return fallback(mapped, { id: 'unknown', name: 'Anonymous', processed: false });
};
```

## 🔄 Asynchronous Operations

### `fallbackAsync`

```typescript
import { safetry, fallbackAsync } from 'safetry';

const result = safetry(async () => {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Network error');
  return await response.json();
});

// Asynchronous fallback
const data = await fallbackAsync(result, async (error) => {
  // Try local cache
  return await getCachedData();
});

// Synchronous fallback
const dataSync = await fallbackAsync(result, 'default data');
```

## 🛠️ Advanced Configuration

### Error Transformation

```typescript
import { safetry } from 'safetry';

const result = await safetry(
  () => riskyOperation(),
  {
    errorTransform: (raw) => {
      if (typeof raw === 'string') {
        return new ValidationError(raw);
      }
      return raw instanceof Error ? raw : new Error(String(raw));
    }
  }
);
```

### Stack Trace Capture

```typescript
import { safetry } from 'safetry';

const result = await safetry(
  () => operation(),
  { captureStack: true }
);
```

## 📚 Advanced Examples

### API with Error Handling

```typescript
import { safetry, mapValue, tapError, fallback } from 'safetry';

class UserService {
  async getUser(id: string) {
    const result = await safetry(async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    });

    return result
      |> tapError(#, error => this.logger.error('User fetch failed', { id, error }))
      |> mapValue(#, user => new User(user))
      |> fallback(#, () => User.anonymous());
  }

  async updateUser(id: string, data: Partial<UserData>) {
    const fetchResult = await this.getUser(id);
    
    if (!fetchResult.ok) {
      return fetchResult; // Propagate the error
    }

    return await safetry(async () => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      return await response.json();
    });
  }
}
```

### Form Validation

```typescript
import { safetry, mapValue, fallback } from 'safetry';

interface FormData {
  email: string;
  age: number;
}

const validateForm = (data: unknown): FormData => {
  const emailResult = safetry(() => validateEmail(data.email));
  const ageResult = safetry(() => validateAge(data.age));

  const email = fallback(emailResult, '');
  const age = fallback(ageResult, 0);

  if (!emailResult.ok || !ageResult.ok) {
    throw new ValidationError('Form validation failed');
  }

  return { email, age };
};

const processForm = async (formData: unknown) => {
  const result = await safetry(() => validateForm(formData));
  
  return mapValue(result, validData => ({
    ...validData,
    timestamp: Date.now()
  }));
};
```

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or have found a bug, please open an issue or submit a pull request.

1. **Fork the repository**
2. **Create a new branch:** git checkout -b feature/your-feature-name
3. **Make your changes** and commit them: git commit -m 'Add some feature'
4. **Push to the branch:** git push origin feature/your-feature-name
5. **Open a pull request**

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

If you find this project useful, please consider giving it a ⭐ on GitHub. If you have any questions or need support, feel free to open an issue or contact me.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://github.com/AbianS" target="_blank">AbianS</a></p>