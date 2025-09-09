# ADR-001: Use Repository Pattern for Data Access

## Status

Accepted

## Context

The Prompt Spaghetti platform needs to access data from multiple sources including SQLite databases, file systems, Redis cache, and potentially external APIs. Currently, data access logic is scattered throughout service classes, leading to:

- **Tight coupling** between business logic and data storage implementations
- **Difficulty testing** services due to direct database dependencies
- **Code duplication** in data access patterns
- **Hard-to-maintain** database queries scattered across multiple files
- **Inconsistent error handling** for data access operations
- **Limited flexibility** when switching between storage mechanisms (file-based vs database-backed)

The system needs to support both file-based storage (for local development and single-user scenarios) and database storage (for multi-user and server deployments). Additionally, different parts of the system have different data access patterns:

- **Graph storage**: Large JSON documents that may be stored as files or database BLOBs
- **User data**: Relational data best suited for SQL databases
- **Session data**: Key-value data appropriate for Redis
- **Analytics data**: Time-series data that may need specialized storage

## Decision

We will implement the Repository pattern for all data access operations, with the following key principles:

### 1. Repository Interface Definition

Each domain entity will have a corresponding repository interface that abstracts data access operations:

```typescript
interface GraphRepository {
  save(graph: Graph): Promise<GraphId>;
  findById(id: GraphId): Promise<Graph | null>;
  findByUser(userId: UserId): Promise<Graph[]>;
  delete(id: GraphId): Promise<boolean>;
  exists(id: GraphId): Promise<boolean>;
}

interface UserRepository {
  create(user: CreateUserRequest): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: UserId, updates: Partial<User>): Promise<User>;
  delete(id: UserId): Promise<boolean>;
}
```

### 2. Multiple Implementations

Each repository interface will have multiple implementations to support different storage backends:

```typescript
// File-based implementation for local development
class FileSystemGraphRepository implements GraphRepository {
  constructor(private basePath: string) {}

  async save(graph: Graph): Promise<GraphId> {
    const filePath = path.join(this.basePath, `${graph.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(graph, null, 2));
    return graph.id;
  }

  // ... other methods
}

// Database implementation for server deployments
class DatabaseGraphRepository implements GraphRepository {
  constructor(private db: Database) {}

  async save(graph: Graph): Promise<GraphId> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO graphs (id, user_id, name, data, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      graph.id,
      graph.userId,
      graph.name,
      JSON.stringify(graph),
      Date.now()
    );
    return graph.id;
  }

  // ... other methods
}
```

### 3. Dependency Injection

Services will receive repository instances through constructor injection:

```typescript
class GraphService {
  constructor(
    private graphRepository: GraphRepository,
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async createGraph(
    userId: UserId,
    request: CreateGraphRequest
  ): Promise<Graph> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create graph
    const graph = Graph.create(userId, request);

    // Save graph
    await this.graphRepository.save(graph);

    return graph;
  }
}
```

### 4. Repository Factory Pattern

A factory will create appropriate repository implementations based on configuration:

```typescript
interface RepositoryFactory {
  createGraphRepository(): GraphRepository;
  createUserRepository(): UserRepository;
  createSessionRepository(): SessionRepository;
}

class ProductionRepositoryFactory implements RepositoryFactory {
  constructor(
    private db: Database,
    private redis: Redis,
    private config: StorageConfig
  ) {}

  createGraphRepository(): GraphRepository {
    if (this.config.storage === 'file') {
      return new FileSystemGraphRepository(this.config.dataPath);
    } else {
      return new DatabaseGraphRepository(this.db);
    }
  }

  // ... other repository factories
}
```

### 5. Transaction Support

Repositories will support transactions for operations that span multiple entities:

```typescript
interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

interface GraphRepository {
  // ... existing methods
  saveWithTransaction(graph: Graph, tx: TransactionContext): Promise<GraphId>;
}

class GraphService {
  async moveGraphToUser(graphId: GraphId, newUserId: UserId): Promise<void> {
    const tx = await this.repositoryFactory.createTransaction();

    try {
      const graph = await this.graphRepository.findById(graphId);
      if (!graph) throw new NotFoundError('Graph not found');

      graph.userId = newUserId;
      await this.graphRepository.saveWithTransaction(graph, tx);

      // Update user's graph count
      await this.userRepository.updateGraphCountWithTransaction(
        newUserId,
        +1,
        tx
      );

      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
}
```

## Consequences

### Positive Consequences

- **Improved testability**: Services can be easily unit tested by injecting mock repository implementations
- **Flexibility**: Storage implementations can be swapped without changing business logic
- **Consistency**: All data access operations follow the same patterns and error handling
- **Separation of concerns**: Business logic is cleanly separated from data persistence concerns
- **Code reuse**: Common data access patterns can be implemented once in base repository classes
- **Better error handling**: Repository layer can provide consistent error handling and retry logic
- **Performance optimization**: Repository implementations can include caching, connection pooling, and query optimization
- **Multi-tenancy support**: Repository layer can handle tenant isolation transparently

### Negative Consequences

- **Additional abstraction**: Adds another layer between services and data storage, increasing complexity
- **Initial development overhead**: Setting up repository interfaces and implementations requires more upfront work
- **Learning curve**: Team members need to understand the repository pattern and dependency injection
- **Potential over-abstraction**: Simple CRUD operations may become unnecessarily complex
- **Interface maintenance**: Repository interfaces need to be updated when new data access patterns are needed
- **Performance overhead**: Additional indirection may have minor performance impact
- **Mock complexity**: Creating realistic mocks for complex repository operations can be challenging

### Neutral Consequences

- **Code organization**: Repository pattern encourages organizing code around domain entities rather than technical layers
- **Configuration complexity**: Need to configure dependency injection container and repository factories
- **Documentation needs**: Repository interfaces and implementations need to be well-documented
- **Migration effort**: Existing data access code needs to be refactored to use repository pattern

## Implementation Notes

### Phase 1: Core Repositories

- `GraphRepository` - Graph CRUD operations
- `UserRepository` - User management
- `SessionRepository` - User session handling

### Phase 2: Extended Repositories

- `AnalyticsRepository` - Event and metrics storage
- `AuditRepository` - Audit log persistence
- `CacheRepository` - Caching abstraction

### Phase 3: Advanced Features

- Transaction support across repositories
- Repository middleware (logging, metrics, caching)
- Query builder integration for complex queries
- Connection pooling and optimization

### Testing Strategy

- Unit tests for each repository implementation
- Integration tests with real databases
- Performance tests comparing different implementations
- Mock repositories for service unit tests

This decision supports the platform's needs for flexibility, testability, and maintainability while providing clear separation between business logic and data access concerns.
