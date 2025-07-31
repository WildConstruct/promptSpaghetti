# Prompt Spaghetti Testing Strategy

## Overview

This document outlines the testing strategy for the Prompt Spaghetti application, focusing on maintaining robust, maintainable, and type-safe tests. The application uses React, TypeScript, and React Flow for interactive graph visualization, requiring specialized testing approaches.

## Test Categories

### 1. Unit Tests

- **Purpose**: Test individual components and functions in isolation
- **Tools**: Jest, React Testing Library
- **Coverage Target**: 80%+ statement coverage
- **Location**: Co-located with components (`__tests__` directories)
- **Naming Convention**: `ComponentName.test.tsx`

### 2. Integration Tests

- **Purpose**: Test interactions between components
- **Tools**: Jest, React Testing Library
- **Coverage Target**: Key user workflows covered
- **Location**: `client/src/__tests__/` or `packages/core/__tests__/`
- **Naming Convention**: `ComponentName.integration.test.tsx`

### 3. User Interaction Tests

- **Purpose**: Simulate real user workflows and interactions
- **Tools**: Jest with mocked React Flow components
- **Location**: `client/src/__tests__/UserInteraction.test.tsx`
- **Focus**: End-to-end workflows like node creation, edge connection

## Testing Best Practices

### React Flow Component Testing

1. **Mock External Components**: Always mock React Flow components fully
2. **Component Structure**:
   ```typescript
   jest.mock('react-flow-renderer', () => {
     const originalModule = jest.requireActual('react-flow-renderer');
     return {
       ...originalModule,
       // Mock components and hooks
       ReactFlow: ({ children, ...props }) => <div data-testid="react-flow" {...props}>{children}</div>,
       // Additional mocks...
     };
   });
   ```

### State Management Testing

1. **useState Mock Pattern**:

   ```typescript
   // Define types for better TypeScript support
   let mockSetNodes: jest.Mock<any, any>;
   let mockSetEdges: jest.Mock<any, any>;
   let originalReactUseState: typeof React.useState;

   beforeEach(() => {
     // Set up mocks
     mockSetNodes = jest.fn();
     originalReactUseState = React.useState;

     // Type-safe useState mock
     (jest.spyOn(React, 'useState') as any).mockImplementation(function mockUseState<T>(
       initialValue: T
     ): [T, React.Dispatch<React.SetStateAction<T>>] {
       // Implementation...
     });
   });

   afterEach(() => {
     // Restore original
     jest.spyOn(React, 'useState').mockRestore();
   });
   ```

2. **Direct State Manipulation**: Prefer direct handler calls over fragile DOM event simulations

   ```typescript
   // AVOID:
   fireEvent.click(element);

   // PREFER:
   act(() => {
     mockSetNodes((prev: Node[]) => [...prev, newNode]);
   });
   ```

### Maintaining Type Safety

1. **Explicit Type Annotations**:

   ```typescript
   mockSetNodes((prev: Node[]) => [...prev, node]);
   ```

2. **Type Casting with Care**:
   ```typescript
   // Use careful type casting when necessary
   return [[] as unknown as T, mockSetNodes as unknown as React.Dispatch<React.SetStateAction<T>>];
   ```

### Testing Complex Interactions

1. **Test Helper Functions Directly**: Extract and test complex logic
2. **Validate Final State**: Check the impact of operations on state
3. **Verify Side Effects**: Test error messages and style changes

## Current Coverage Gaps

- `App.tsx`: Lines 71-72, 81-86 (event handlers)
- `GraphEditor.tsx`: Multiple sections including 192-193, 214-233, etc.
- `usePreviewSeeds.ts`: Lines 37, 61-65

## Coverage Improvement Plan

1. Add tests for remaining uncovered App.tsx handlers
2. Increase branch coverage in usePreviewSeeds.ts
3. Add integration tests for GraphEditor complex scenarios
4. Improve mock quality for third-party components

## Maintenance Guidelines

1. Run `npm test` before committing changes
2. Maintain 80%+ overall coverage
3. Focus on critical user paths
4. Update mocks when upgrading dependencies
5. Document complex test setups with comments

## Mock Strategy for External Libraries

- **React Flow**: Full component and hook mocking
- **DOM APIs**: Mock minimal required functionality
- **Browser APIs**: Use controlled mocks for APIs like localStorage

## QA Process Integration

1. **Regular Test Reviews**: Scheduled with QA team (Quinn)
2. **Coverage Reports**: Generated as part of CI pipeline
3. **Test-First Approach**: Write tests before implementing new features
4. **Regression Testing**: Full test suite runs before releases
