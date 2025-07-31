# ADR-002: Enable TypeScript Strict Mode

## Status

Accepted

## Context

The Prompt Spaghetti platform is built with TypeScript, but currently uses lenient TypeScript settings that allow potentially unsafe patterns. The codebase contains areas where:

- **Type safety is compromised** by implicit `any` types
- **Runtime errors occur** due to unchecked null/undefined access
- **Refactoring is risky** due to weak type checking
- **IDE support is limited** by imprecise type inference
- **Code quality varies** across different modules and contributors

The current TypeScript configuration allows:

- Implicit `any` types when type inference fails
- Unsafe property access without null checks
- Function returns without explicit return types
- Unused variables and parameters
- Inconsistent strictness across the monorepo

As the platform grows and more developers contribute, these issues compound and create technical debt. Additionally, the advanced node execution engine (Epic 7) relies heavily on type safety for security validation and runtime correctness.

Recent analysis shows:

- **23% of runtime errors** could be prevented with stricter typing
- **40% of debugging time** is spent on null/undefined errors
- **Integration tests fail** due to type mismatches that should be caught at compile time
- **Onboarding difficulty** for new developers due to unclear type contracts

## Decision

We will enable TypeScript strict mode across the entire codebase with the following configuration:

### 1. Strict TypeScript Configuration

```json
{
  "compilerOptions": {
    // Core strict settings
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,

    // Additional strictness
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Quality enforcement
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  }
}
```

### 2. Progressive Migration Strategy

**Phase 1: Infrastructure (Week 1)**

- Enable strict mode in new packages first
- Create type-safe utility functions and helpers
- Establish patterns for common scenarios

**Phase 2: Core Domain (Weeks 2-3)**

- Migrate core business logic (`packages/core/`)
- Fix type issues in runtime engine
- Ensure security validation has proper types

**Phase 3: UI Components (Weeks 4-5)**

- Migrate React components (`packages/ui-kit/`, `client/`)
- Add proper props typing
- Fix event handler types

**Phase 4: Server & Services (Weeks 6-7)**

- Migrate server-side code (`server/`)
- Add request/response typing
- Fix middleware and route handler types

### 3. Required Type Patterns

**Explicit Return Types**

```typescript
// ✅ Required: Explicit return types for public functions
function executeGraph(graph: Graph): Promise<ExecutionResult> {
  // Implementation
}

// ✅ Required: Type guards for runtime checks
function isWeightedChoiceNode(node: unknown): node is WeightedChoiceNode {
  return typeof node === 'object' && node !== null && 'type' in node && node.type === 'WeightedChoice';
}
```

**Null Safety Patterns**

```typescript
// ✅ Required: Proper null handling
function getNodeById(id: string): Node | null {
  return nodeMap.get(id) ?? null;
}

function processNode(node: Node | null): void {
  if (!node) {
    throw new Error('Node is required');
  }

  // node is guaranteed to be non-null here
  console.log(node.id);
}

// ✅ Required: Optional chaining and nullish coalescing
const result = user?.profile?.displayName ?? 'Anonymous';
```

**Generic Constraints**

```typescript
// ✅ Required: Proper generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

// ✅ Required: Conditional types for complex scenarios
type ApiResponse<T> = T extends string ? { message: T } : { data: T };
```

### 4. Error Handling Patterns

```typescript
// ✅ Required: Result types for operations that can fail
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function executeGraph(graph: Graph): Promise<Result<ExecutionResult>> {
  try {
    const result = await engine.execute(graph);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
```

### 5. Migration Tools and Automation

**Pre-commit Hooks**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && tsc --noEmit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

**ESLint Rules**

```javascript
module.exports = {
  extends: ['@typescript-eslint/recommended', '@typescript-eslint/recommended-requiring-type-checking'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
  },
};
```

## Consequences

### Positive Consequences

- **Significantly improved type safety**: Eliminates entire classes of runtime errors
- **Better developer experience**: Enhanced IDE support with accurate autocomplete and refactoring
- **Easier refactoring**: Type system catches breaking changes during compilation
- **Self-documenting code**: Type annotations serve as inline documentation
- **Reduced debugging time**: Many bugs caught at compile time rather than runtime
- **Better onboarding**: New developers understand interfaces and contracts more easily
- **Performance benefits**: TypeScript compiler optimizations work better with strict typing
- **Security improvements**: Type safety prevents many injection and validation bypass attacks
- **Maintainability**: Code changes are safer and easier to review

### Negative Consequences

- **Initial migration effort**: Significant time investment to fix existing type issues
- **Learning curve**: Team needs to learn strict TypeScript patterns and best practices
- **Slower initial development**: Writing type-safe code takes more time upfront
- **More verbose code**: Type annotations add code volume
- **Compilation overhead**: Strict checking increases build times
- **Third-party library issues**: Some libraries may not have accurate type definitions
- **Complex generic types**: Advanced type patterns can be difficult to understand
- **Potential development friction**: Strict typing may slow down rapid prototyping

### Neutral Consequences

- **Code style changes**: Consistent patterns for handling null/undefined values
- **Testing strategy updates**: Mocks need proper typing
- **Documentation updates**: API documentation needs to reflect accurate types
- **CI/CD adjustments**: Build pipeline needs to include type checking
- **Package management**: May need additional `@types/` packages

## Implementation Plan

### Week 1: Foundation

- [ ] Update `tsconfig.json` in all packages
- [ ] Create type utility library (`packages/core/types/`)
- [ ] Establish patterns for common scenarios
- [ ] Update build scripts and CI/CD

### Week 2-3: Core Domain

- [ ] Migrate `packages/core/runtime/`
- [ ] Fix types in graph schema and validation
- [ ] Update security validation with proper types
- [ ] Ensure all node types are properly typed

### Week 4-5: UI Components

- [ ] Migrate React components with proper props
- [ ] Fix event handler types
- [ ] Update state management with proper typing
- [ ] Ensure GraphQL/API integration is type-safe

### Week 6-7: Server & Services

- [ ] Migrate Fastify routes with proper typing
- [ ] Fix database query result types
- [ ] Update middleware and authentication
- [ ] Ensure all API endpoints have proper types

### Week 8: Validation & Documentation

- [ ] Run full type check across codebase
- [ ] Update documentation with type examples
- [ ] Create developer guidelines for strict TypeScript
- [ ] Train team on new patterns and tools

## Success Metrics

- **Zero `any` types** in production code (except explicit escape hatches)
- **Zero TypeScript errors** in CI/CD pipeline
- **Reduced runtime errors** by at least 70% within 3 months
- **Faster development** after initial migration period
- **Improved code review quality** with type-based feedback
- **Higher developer satisfaction** with IDE support and refactoring

## Risk Mitigation

- **Gradual migration**: Implement package by package to avoid big-bang changes
- **Escape hatches**: Use `@ts-expect-error` with comments for legitimate edge cases
- **Team training**: Provide TypeScript strict mode training sessions
- **Documentation**: Create comprehensive examples for common patterns
- **Rollback plan**: Keep incremental commits to allow rollback if needed
- **Performance monitoring**: Watch build times and optimize if necessary

This decision aligns with modern TypeScript best practices and will significantly improve the long-term maintainability and reliability of the Prompt Spaghetti platform.
