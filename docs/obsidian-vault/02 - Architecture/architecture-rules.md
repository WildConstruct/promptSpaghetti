# Architecture Rules and Guidelines

This document defines the architectural rules, design patterns, and coding standards for the Prompt Spaghetti platform. These rules ensure consistency, maintainability, and scalability across the entire codebase.

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Code Organization Standards](#2-code-organization-standards)
3. [Design Pattern Guidelines](#3-design-pattern-guidelines)
4. [Naming Conventions](#4-naming-conventions)
5. [Dependency Management Rules](#5-dependency-management-rules)
6. [Security Architecture Rules](#6-security-architecture-rules)
7. [Performance Guidelines](#7-performance-guidelines)
8. [Testing Architecture](#8-testing-architecture)
9. [Type System Rules](#9-type-system-rules)
10. [API Design Standards](#10-api-design-standards)

## 1. Core Principles

### 1.1 Architectural Principles

**Modularity First**

- All code must be organized into well-defined, single-responsibility modules
- Dependencies between modules must be explicit and minimal
- Circular dependencies are strictly prohibited

**Type Safety**

- All code must use TypeScript with strict mode enabled
- No `any` types without explicit documentation explaining why
- All public APIs must have complete type definitions

**Immutability by Default**

- Data structures should be immutable where possible
- Use readonly types and interfaces for data that shouldn't change
- State mutations must be controlled through established patterns

**Fail-Fast Principle**

- Validate inputs at boundaries (API endpoints, function entry points)
- Use strict TypeScript settings to catch errors at compile time
- Throw meaningful errors with clear messages and context

### 1.2 Design Philosophy

```typescript
// ✅ Good: Clear separation of concerns
interface NodeExecutor {
  execute(context: ExecutionContext): Promise<NodeResult>;
  validate(config: NodeConfig): ValidationResult;
}

// ❌ Bad: Mixed responsibilities
class NodeManager {
  execute() {
    /* execution logic */
  }
  save() {
    /* persistence logic */
  }
  render() {
    /* UI logic */
  }
}
```

## 2. Code Organization Standards

### 2.1 Directory Structure Rules

**Package Structure**

```
packages/
├── core/                    # Core business logic (no UI dependencies)
│   ├── runtime/            # Execution engine
│   ├── types/              # Shared type definitions
│   ├── validation/         # Validation logic
│   └── utils/              # Pure utility functions
├── ui-kit/                 # Reusable UI components
├── graph-core/             # Graph data structures and algorithms
└── [feature-specific]/     # Feature-specific packages
```

**File Organization Rules**

```
src/
├── index.ts               # Package entry point (barrel exports only)
├── types/                 # Type definitions
├── services/              # Business logic services
├── utils/                 # Pure functions and utilities
├── __tests__/            # Co-located tests
└── internal/             # Internal implementation details
```

**Import Organization**

```typescript
// ✅ Required order for all imports:
// 1. Node.js built-in modules
import { promises as fs } from 'fs';
import path from 'path';

// 2. Third-party dependencies
import React from 'react';
import { z } from 'zod';

// 3. Internal packages (workspace dependencies)
import { GraphExecutor } from '@prompt-spaghetti/graph-core';

// 4. Relative imports (grouped by depth)
import { SecurityValidator } from '../validation/security';
import { NodeType } from './types';
```

### 2.2 Module Boundaries

**Dependency Rules**

- Core packages cannot depend on UI packages
- Business logic cannot depend on framework-specific code
- Services layer cannot directly access persistence layer

```typescript
// ✅ Good: Clear layer separation
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

class UserService {
  constructor(private repository: UserRepository) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    // Business logic here
    return this.repository.save(user);
  }
}

// ❌ Bad: Direct database access from service
class UserService {
  async createUser(data: CreateUserRequest): Promise<User> {
    // Direct SQL queries violate layer separation
    const result = await db.query('INSERT INTO users...');
  }
}
```

## 3. Design Pattern Guidelines

### 3.1 Required Patterns

**Factory Pattern for Node Creation**

```typescript
// ✅ Required: Node factory for type safety
interface NodeFactory {
  createNode<T extends NodeType>(
    type: T,
    config: NodeConfigFor<T>
  ): RuntimeNodeFor<T>;
}

class DefaultNodeFactory implements NodeFactory {
  createNode<T extends NodeType>(type: T, config: NodeConfigFor<T>) {
    switch (type) {
      case 'WeightedChoice':
        return new WeightedChoiceNode(config as WeightedChoiceConfig);
      case 'Conditional':
        return new ConditionalNode(config as ConditionalConfig);
      default:
        throw new Error(`Unsupported node type: ${type}`);
    }
  }
}
```

**Repository Pattern for Data Access**

```typescript
// ✅ Required: Repository abstraction
interface GraphRepository {
  save(graph: Graph): Promise<GraphId>;
  findById(id: GraphId): Promise<Graph | null>;
  findByUser(userId: UserId): Promise<Graph[]>;
}

// Implementation can be swapped (file system, database, etc.)
class FileSystemGraphRepository implements GraphRepository {
  async save(graph: Graph): Promise<GraphId> {
    // File system implementation
  }
}
```

**Observer Pattern for Events**

```typescript
// ✅ Required: Type-safe event system
interface ExecutionEvents {
  'node:start': { nodeId: string; context: ExecutionContext };
  'node:complete': { nodeId: string; result: any; duration: number };
  'node:error': { nodeId: string; error: Error };
}

class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}
```

### 3.2 Discouraged/Prohibited Patterns

**Singleton Pattern** (Use dependency injection instead)

```typescript
// ❌ Prohibited: Singleton makes testing difficult
class DatabaseConnection {
  private static instance: DatabaseConnection;

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

// ✅ Preferred: Dependency injection
class UserService {
  constructor(
    private db: DatabaseConnection,
    private logger: Logger
  ) {}
}
```

**God Objects** (Violate single responsibility)

```typescript
// ❌ Prohibited: Too many responsibilities
class GraphManager {
  executeGraph() {
    /* execution logic */
  }
  validateGraph() {
    /* validation logic */
  }
  renderGraph() {
    /* UI logic */
  }
  saveGraph() {
    /* persistence logic */
  }
  optimizeGraph() {
    /* optimization logic */
  }
}

// ✅ Preferred: Separate concerns
class GraphExecutor {
  execute(graph: Graph): Promise<Result>;
}
class GraphValidator {
  validate(graph: Graph): ValidationResult;
}
class GraphRenderer {
  render(graph: Graph): JSX.Element;
}
```

## 4. Naming Conventions

### 4.1 File Naming

**TypeScript Files**

```
// Services (business logic)
UserService.ts
GraphExecutionService.ts

// Types and interfaces
NodeTypes.ts
ExecutionContext.ts

// Utilities (pure functions)
nodeUtils.ts
validationHelpers.ts

// React components
GraphEditor.tsx
NodePalette.tsx

// Test files
UserService.test.ts
graphUtils.integration.test.ts
```

**Directory Naming**

```
// kebab-case for directories
graph-editor/
node-types/
execution-engine/

// Exception: Well-known directories
__tests__/
__mocks__/
types/
```

### 4.2 Code Naming Conventions

**Interfaces and Types**

```typescript
// ✅ Required: PascalCase, descriptive names
interface ExecutionContext {
  variables: Record<string, any>;
  seed: number;
}

type NodeType = 'WeightedChoice' | 'Conditional' | 'Output';

// Generic type parameters
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
}

// ❌ Avoid: Prefixing interfaces with 'I'
interface IUserService {} // Don't do this
```

**Classes**

```typescript
// ✅ Required: PascalCase, noun phrases
class GraphExecutor {
  execute(graph: Graph): Promise<ExecutionResult>;
}

class WeightedChoiceNode extends RuntimeNode {
  // Implementation
}

// Abstract base classes
abstract class RuntimeNode {
  abstract execute(context: ExecutionContext): Promise<any>;
}
```

**Functions and Variables**

```typescript
// ✅ Required: camelCase, verb phrases for functions
function executeGraph(graph: Graph): Promise<ExecutionResult> {}
const calculateWeight = (options: WeightOption[]) => {};

// Boolean variables: is/has/can prefix
const isValid = validator.validate(input);
const hasPermission = checkUserPermission(user, resource);
const canExecute = node.isExecutable();

// Constants: SCREAMING_SNAKE_CASE for module-level constants
const MAX_EXECUTION_TIME_MS = 30000;
const DEFAULT_NODE_TIMEOUT = 5000;

// ❌ Avoid: Unclear abbreviations
const usrSvc = new UserService(); // Bad
const userService = new UserService(); // Good
```

### 4.3 Event and Message Naming

```typescript
// ✅ Required: Domain:Action pattern
interface SystemEvents {
  'execution:started': ExecutionStartedEvent;
  'execution:completed': ExecutionCompletedEvent;
  'execution:failed': ExecutionFailedEvent;

  'node:created': NodeCreatedEvent;
  'node:updated': NodeUpdatedEvent;
  'node:deleted': NodeDeletedEvent;

  'user:authenticated': UserAuthenticatedEvent;
  'user:permission-denied': PermissionDeniedEvent;
}
```

## 5. Dependency Management Rules

### 5.1 Dependency Injection

**Required Pattern**

```typescript
// ✅ Required: Constructor injection
class GraphExecutionService {
  constructor(
    private nodeFactory: NodeFactory,
    private validator: GraphValidator,
    private metrics: MetricsCollector,
    private logger: Logger
  ) {}

  async executeGraph(graph: Graph): Promise<ExecutionResult> {
    // Use injected dependencies
  }
}

// ✅ Required: Interface segregation
interface Validator<T> {
  validate(item: T): ValidationResult;
}

interface Executor<T, R> {
  execute(input: T): Promise<R>;
}
```

**Service Registration**

```typescript
// ✅ Required: Centralized service configuration
interface ServiceContainer {
  register<T>(token: string, implementation: T): void;
  resolve<T>(token: string): T;
}

// Configuration in single place
function configureServices(container: ServiceContainer) {
  container.register('NodeFactory', new DefaultNodeFactory());
  container.register('GraphValidator', new ZodGraphValidator());
  container.register('MetricsCollector', new AnalyticsMetricsCollector());
}
```

### 5.2 Package Dependencies

**Allowed Dependencies by Package**

```typescript
// packages/core - Core business logic
// ✅ Allowed: Pure utility libraries
'zod'; // Schema validation
'uuid'; // ID generation
'seedrandom'; // Deterministic randomness

// ❌ Prohibited: UI or framework dependencies
'react'; // UI framework
'express'; // Server framework
'@mui/material'; // UI component library

// packages/ui-kit - UI components
// ✅ Allowed: React ecosystem
'react';
'@mui/material';
'@emotion/react';

// Must use core packages through interfaces
'@prompt-spaghetti/core'; // Business logic

// server - Backend services
// ✅ Allowed: Server-side libraries
'fastify'; // Web framework
'sqlite3'; // Database
'redis'; // Caching

// Must use core packages
'@prompt-spaghetti/core';
```

**Dependency Version Rules**

```json
// ✅ Required: Exact versions for critical dependencies
{
  "dependencies": {
    "zod": "3.22.4", // Exact version for schema validation
    "fastify": "4.24.3" // Exact version for server framework
  },
  "devDependencies": {
    "typescript": "~5.2.0", // Patch updates only
    "@types/node": "^20.0.0" // Minor updates allowed for types
  }
}
```

## 6. Security Architecture Rules

### 6.1 Input Validation

**Required at All Boundaries**

```typescript
// ✅ Required: Validate at API boundaries
export async function createNode(req: FastifyRequest, reply: FastifyReply) {
  // 1. Schema validation
  const createNodeSchema = z.object({
    type: z.enum(['WeightedChoice', 'Conditional', 'Output']),
    config: z.record(z.any()),
    metadata: z.object({
      label: SecureValidation.safeString(100),
      description: SecureValidation.safeString(500)
    })
  });

  // 2. Parse and validate
  const validatedInput = createNodeSchema.parse(req.body);

  // 3. Additional security validation
  const securityResult = SecurityValidator.validateNodeConfig(
    validatedInput.config
  );
  if (!securityResult.isValid) {
    throw new SecurityError('Invalid node configuration');
  }

  // 4. Business logic
  const node = await nodeService.createNode(validatedInput);
  return reply.send(node);
}
```

**Security Validation Rules**

```typescript
// ✅ Required: Use security validation framework
import { SecureValidation } from '@prompt-spaghetti/core/validation/security';

// All user inputs must be validated
const userInput = SecureValidation.safeString(request.body.content);
const variableName = SecureValidation.variableName(request.body.name);
const expression = SecureValidation.safeExpression(request.body.condition);

// ❌ Prohibited: Direct user input usage
const dangerousInput = request.body.content; // No validation
const query = `SELECT * FROM users WHERE name = '${dangerousInput}'`; // SQL injection risk
```

### 6.2 Authentication and Authorization

**Required JWT Pattern**

```typescript
// ✅ Required: Middleware-based auth
export const jwtAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = extractTokenFromHeader(request.headers.authorization);

  try {
    const payload = await tokenService.verifyAccessToken(token);
    request.user = await userService.getUserById(payload.sub);

    if (!request.user) {
      throw new AuthenticationError('User not found');
    }
  } catch (error) {
    reply.code(401).send({ error: 'Authentication required' });
  }
};

// ✅ Required: Permission checks
export const requirePermission = (permission: Permission) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.hasPermission(permission)) {
      reply.code(403).send({ error: 'Insufficient permissions' });
    }
  };
};
```

## 7. Performance Guidelines

### 7.1 Async/Await Patterns

**Required Patterns**

```typescript
// ✅ Required: Proper error handling
async function executeGraph(graph: Graph): Promise<ExecutionResult> {
  try {
    const validationResult = await validateGraph(graph);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    const result = await executeNodes(graph.nodes);
    return result;
  } catch (error) {
    // Log error with context
    logger.error('Graph execution failed', {
      graphId: graph.id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// ✅ Required: Parallel execution where possible
async function executeNodes(nodes: Node[]): Promise<NodeResult[]> {
  // Execute independent nodes in parallel
  const independentNodes = nodes.filter(node => !node.dependencies);
  const independentResults = await Promise.all(
    independentNodes.map(node => executeNode(node))
  );

  // Execute dependent nodes sequentially
  const dependentNodes = nodes.filter(node => node.dependencies);
  const dependentResults = [];
  for (const node of dependentNodes) {
    const result = await executeNode(node);
    dependentResults.push(result);
  }

  return [...independentResults, ...dependentResults];
}
```

### 7.2 Memory Management

**Required Patterns**

```typescript
// ✅ Required: Resource cleanup
class ResourceManager {
  private resources: Set<Disposable> = new Set();

  register<T extends Disposable>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  async dispose(): Promise<void> {
    const disposalPromises = Array.from(this.resources).map(resource =>
      resource.dispose()
    );

    await Promise.allSettled(disposalPromises);
    this.resources.clear();
  }
}

// ✅ Required: Use weak references for caches
class NodeCache {
  private cache = new WeakMap<Node, CachedResult>();

  get(node: Node): CachedResult | undefined {
    return this.cache.get(node);
  }

  set(node: Node, result: CachedResult): void {
    this.cache.set(node, result);
  }
}
```

### 7.3 Database Query Optimization

```typescript
// ✅ Required: Use prepared statements
class GraphRepository {
  private findByUserStmt = this.db.prepare(`
    SELECT id, name, data, created_at 
    FROM graphs 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `);

  async findByUser(userId: string, limit: number = 10): Promise<Graph[]> {
    const rows = this.findByUserStmt.all(userId, limit);
    return rows.map(row => this.mapRowToGraph(row));
  }
}

// ✅ Required: Pagination for large datasets
interface PaginatedQuery {
  limit: number;
  offset: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

## 8. Testing Architecture

### 8.1 Test Structure Rules

**Required Test Organization**

```typescript
// ✅ Required: Arrange-Act-Assert pattern
describe('GraphExecutor', () => {
  describe('executeGraph', () => {
    it('should execute simple weighted choice graph', async () => {
      // Arrange
      const graph = createTestGraph({
        nodes: [createWeightedChoiceNode(['option1', 'option2'])]
      });
      const executor = new GraphExecutor(mockNodeFactory, mockValidator);

      // Act
      const result = await executor.executeGraph(graph);

      // Assert
      expect(result).toBeDefined();
      expect(result.outputs).toHaveLength(1);
      expect(['option1', 'option2']).toContain(result.outputs[0]);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidGraph = createTestGraph({ nodes: [] });
      const executor = new GraphExecutor(mockNodeFactory, mockValidator);
      mockValidator.validate.mockReturnValue({
        isValid: false,
        errors: ['Graph must contain at least one node']
      });

      // Act & Assert
      await expect(executor.executeGraph(invalidGraph)).rejects.toThrow(
        'Graph must contain at least one node'
      );
    });
  });
});
```

**Required Test Categories**

```
__tests__/
├── unit/                   # Isolated unit tests
├── integration/           # Component integration tests
├── e2e/                  # End-to-end tests
└── performance/          # Performance regression tests
```

### 8.2 Mock and Stub Rules

```typescript
// ✅ Required: Interface-based mocking
interface MockUserRepository extends UserRepository {
  save: jest.MockedFunction<UserRepository['save']>;
  findById: jest.MockedFunction<UserRepository['findById']>;
}

const createMockUserRepository = (): MockUserRepository => ({
  save: jest.fn(),
  findById: jest.fn()
});

// ✅ Required: Test data builders
class GraphBuilder {
  private graph: Partial<Graph> = {};

  withId(id: string): GraphBuilder {
    this.graph.id = id;
    return this;
  }

  withNodes(nodes: Node[]): GraphBuilder {
    this.graph.nodes = nodes;
    return this;
  }

  build(): Graph {
    return {
      id: this.graph.id || 'test-graph',
      nodes: this.graph.nodes || [],
      edges: this.graph.edges || [],
      seed: this.graph.seed || 42
    };
  }
}

// Usage
const testGraph = new GraphBuilder()
  .withId('test-graph-123')
  .withNodes([createWeightedChoiceNode(['A', 'B'])])
  .build();
```

## 9. Type System Rules

### 9.1 TypeScript Configuration

**Required tsconfig.json Settings**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

### 9.2 Type Definition Rules

**Discriminated Unions**

```typescript
// ✅ Required: Type-safe discriminated unions
interface WeightedChoiceNode {
  type: 'WeightedChoice';
  choices: Array<{ value: string; weight: number }>;
}

interface ConditionalNode {
  type: 'Conditional';
  branches: Array<{ condition: string; output: string }>;
  defaultOutput: string;
}

type RuntimeNode = WeightedChoiceNode | ConditionalNode;

// ✅ Required: Type guards
function isWeightedChoiceNode(node: RuntimeNode): node is WeightedChoiceNode {
  return node.type === 'WeightedChoice';
}

// ✅ Required: Exhaustive matching
function executeNode(node: RuntimeNode): Promise<string> {
  switch (node.type) {
    case 'WeightedChoice':
      return executeWeightedChoice(node);
    case 'Conditional':
      return executeConditional(node);
    default:
      // This will cause a TypeScript error if we miss a case
      const exhaustiveCheck: never = node;
      throw new Error(`Unhandled node type`);
  }
}
```

**Generic Constraints**

```typescript
// ✅ Required: Proper generic constraints
interface Repository<T extends { id: string }> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
}

// ✅ Required: Conditional types for complex scenarios
type NodeConfigFor<T extends NodeType> = T extends 'WeightedChoice'
  ? WeightedChoiceConfig
  : T extends 'Conditional'
    ? ConditionalConfig
    : never;

type RuntimeNodeFor<T extends NodeType> = T extends 'WeightedChoice'
  ? WeightedChoiceNode
  : T extends 'Conditional'
    ? ConditionalNode
    : never;
```

## 10. API Design Standards

### 10.1 REST API Rules

**Required URL Structure**

```
/api/v1/graphs              # GET (list), POST (create)
/api/v1/graphs/{id}         # GET (read), PUT (update), DELETE (delete)
/api/v1/graphs/{id}/execute # POST (execute graph)
/api/v1/nodes/{type}/schema # GET (get node schema)

# Nested resources
/api/v1/users/{userId}/graphs              # User's graphs
/api/v1/organizations/{orgId}/graphs       # Organization graphs
```

**Required Response Format**

```typescript
// ✅ Success responses
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timing?: { duration: number };
  };
}

// ✅ Error responses
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// Example implementation
export async function getGraph(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = req.params as { id: string };
    const graph = await graphService.findById(id);

    if (!graph) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with id ${id} not found`,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });
    }

    reply.send({
      success: true,
      data: graph
    });
  } catch (error) {
    reply.code(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
  }
}
```

### 10.2 Event-Driven Architecture

**Required Event Schema**

```typescript
// ✅ Required: Structured event format
interface DomainEvent<T = any> {
  id: string;
  type: string;
  version: number;
  timestamp: Date;
  source: string;
  subject: string;
  data: T;
  metadata: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    sessionId?: string;
  };
}

// ✅ Required: Event versioning
interface GraphExecutionStartedEventV1
  extends DomainEvent<{
    graphId: string;
    nodeCount: number;
    executionContext: ExecutionContext;
  }> {
  type: 'graph.execution.started';
  version: 1;
}

interface GraphExecutionStartedEventV2
  extends DomainEvent<{
    graphId: string;
    nodeCount: number;
    executionContext: ExecutionContext;
    estimatedDuration: number; // New field in v2
  }> {
  type: 'graph.execution.started';
  version: 2;
}
```

## Enforcement and Validation

### Automated Rule Enforcement

**ESLint Configuration**

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    // Architecture rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'import/no-cycle': 'error',

    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'interface', format: ['PascalCase'] },
      { selector: 'typeAlias', format: ['PascalCase'] },
      { selector: 'class', format: ['PascalCase'] },
      { selector: 'function', format: ['camelCase'] },
      { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] }
    ]
  }
};
```

**Husky Pre-commit Hooks**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run typecheck && npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Architecture Decision Records (ADRs)

All significant architectural decisions must be documented in ADR format:

```markdown
# ADR-001: Use Repository Pattern for Data Access

## Status

Accepted

## Context

We need a consistent way to access data across different storage mechanisms (files, databases, APIs).

## Decision

Implement the Repository pattern with dependency injection.

## Consequences

- Positive: Testable, swappable implementations
- Positive: Clear separation between business logic and data access
- Negative: Additional abstraction layer
- Negative: More initial setup time
```

This architecture rules document provides the foundation for maintaining consistency, quality, and scalability across the Prompt Spaghetti platform. All developers must follow these rules, and they should be enforced through automated tooling where possible.
