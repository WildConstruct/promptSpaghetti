# Testing Guidelines

## Overview

This document outlines testing best practices for the Prompt Spaghetti project.

## Test Structure

### Directory Organization

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
      Button.stories.tsx
  __tests__/
    integration/
    e2e/
```

### Test File Naming

- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature.integration.test.ts`
- E2E tests: `workflow.e2e.test.ts`

## Testing Principles

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.isOpen).toBe(true);

// ✅ Good - Testing behavior
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

### 2. Use Testing Library Best Practices

```typescript
// ❌ Bad - Using test IDs unnecessarily
const button = getByTestId('submit-button');

// ✅ Good - Using accessible queries
const button = getByRole('button', { name: /submit/i });
```

### 3. Mock External Dependencies

```typescript
// Mock API calls
jest.mock('../api/client', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));

// Mock timers
jest.useFakeTimers();
```

## Test Categories

### Unit Tests

- Test individual components/functions in isolation
- Mock all external dependencies
- Focus on edge cases and error handling
- Aim for 80%+ coverage

### Integration Tests

- Test component interactions
- Test API integrations with mocked backends
- Test state management flows
- Use MSW for API mocking

### E2E Tests

- Test complete user workflows
- Run against real backend (staging)
- Focus on critical paths
- Keep minimal and fast

## Common Patterns

### Testing Async Code

```typescript
// Using waitFor
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Testing loading states
expect(screen.getByText('Loading...')).toBeInTheDocument();
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
```

### Testing User Interactions

```typescript
// Simulating user events
await userEvent.click(button);
await userEvent.type(input, 'test value');
await userEvent.selectOptions(select, 'option1');
```

### Testing Error States

```typescript
// Mock error response
server.use(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
  })
);

// Verify error handling
await waitFor(() => {
  expect(screen.getByText('Error: Server error')).toBeInTheDocument();
});
```

## Performance Testing

### Bundle Size Monitoring

```json
{
  "bundlesize": [
    {
      "path": "./dist/main.*.js",
      "maxSize": "300 kB"
    },
    {
      "path": "./dist/vendor.*.js",
      "maxSize": "150 kB"
    }
  ]
}
```

### Rendering Performance

```typescript
test('renders large list efficiently', () => {
  const { rerender } = render(<LargeList items={generateItems(1000)} />);

  const startTime = performance.now();
  rerender(<LargeList items={generateItems(2000)} />);
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(100); // ms
});
```

## Security Testing

### XSS Prevention

```typescript
test('sanitizes user input', () => {
  const maliciousInput = '<script>alert("XSS")</script>';
  render(<Comment text={maliciousInput} />);

  expect(screen.queryByText('alert')).not.toBeInTheDocument();
  expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
});
```

### Authentication Tests

```typescript
test('requires authentication for protected routes', async () => {
  // No auth token
  localStorage.removeItem('authToken');

  render(<ProtectedRoute />);

  expect(await screen.findByText('Please log in')).toBeInTheDocument();
});
```

## Debugging Tests

### Common Issues

1. **Async Timing Issues**
   - Use `waitFor` instead of `setTimeout`
   - Increase timeout for slow operations
   - Check for multiple elements being rendered

2. **Module Resolution**
   - Check Jest transform configuration
   - Verify module mocks are properly set up
   - Use `moduleNameMapper` for aliases

3. **DOM Testing Issues**
   - Ensure proper cleanup between tests
   - Mock window properties (matchMedia, etc.)
   - Use `jest-dom` matchers

### Debug Utilities

```typescript
// Print current DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Use prettyDOM for better output
import { prettyDOM } from '@testing-library/react';
console.log(prettyDOM(container));
```

## CI/CD Integration

### GitHub Actions

- Run tests on every PR
- Fail builds if coverage drops below 80%
- Run security audits
- Generate test reports

### Pre-commit Hooks

- Run related tests for changed files
- Check test coverage
- Lint test files
- Prevent commits with failing tests

## Test Data Management

### Fixtures

```typescript
// fixtures/user.ts
export const mockUser = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
};

// Usage
import { mockUser } from './fixtures/user';
```

### Factories

```typescript
// factories/graph.ts
export const createGraph = (overrides = {}) => ({
  id: generateId(),
  nodes: [],
  edges: [],
  ...overrides,
});
```

## Continuous Improvement

### Metrics to Track

- Test coverage percentage
- Test execution time
- Flaky test frequency
- Time to fix failing tests

### Regular Reviews

- Monthly test suite health check
- Quarterly test strategy review
- Remove obsolete tests
- Update test patterns

## Resources

- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Testing JavaScript](https://testingjavascript.com/)
