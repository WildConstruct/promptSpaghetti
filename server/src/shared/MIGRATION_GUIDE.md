# BaseService Migration Guide

## Overview
This guide helps you migrate existing services to use the new BaseService pattern, eliminating duplicate imports and providing consistent functionality across all services.

## Benefits
- **Eliminates 190+ duplicate imports** across the codebase
- **Provides common functionality** (caching, transactions, audit logging)
- **Consistent error handling** and logging
- **Built-in singleton pattern** support
- **Automatic dependency injection**

## Migration Steps

### 1. Update Service Class

**Before:**
```typescript
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from './AuditService';

export class MyService {
  private dbService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;

  constructor() {
    this.dbService = new DatabaseService();
    this.redisService = new RedisService();
    this.auditService = new AuditService();
  }
}
```

**After:**
```typescript
import { BaseService, Singleton } from '../../shared';

@Singleton
export class MyService extends BaseService {
  constructor() {
    super();
    // Services are now available as this.db, this.redis, this.audit
  }
}
```

### 2. Update Database Operations

**Before:**
```typescript
async createUser(data: UserData) {
  const trx = await this.dbService.transaction();
  try {
    const user = await trx('users').insert(data);
    await trx.commit();
    return user;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

**After:**
```typescript
async createUser(data: UserData) {
  return this.withTransaction(async (trx) => {
    const user = await trx('users').insert(data);
    return user;
  });
}
```

### 3. Update Caching

**Before:**
```typescript
async getUser(id: string) {
  const cached = await this.redisService.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const user = await this.dbService.query('users').where('id', id).first();
  await this.redisService.set(`user:${id}`, JSON.stringify(user));
  return user;
}
```

**After:**
```typescript
async getUser(id: string) {
  const cached = await this.cacheGet<User>(`user:${id}`);
  if (cached) {
    return cached;
  }
  
  const user = await this.db.query('users').where('id', id).first();
  await this.cacheSet(`user:${id}`, user);
  return user;
}
```

### 4. Update Audit Logging

**Before:**
```typescript
await this.auditService.log({
  service: 'MyService',
  action: 'user.created',
  userId: userId,
  details: { email: user.email },
  timestamp: new Date()
});
```

**After:**
```typescript
await this.logAudit('user.created', userId, { email: user.email });
```

### 5. Update Error Handling

**Before:**
```typescript
try {
  // operation
} catch (error) {
  console.error('Error in MyService:', error);
  throw error;
}
```

**After:**
```typescript
try {
  // operation
} catch (error) {
  this.handleError(error as Error, 'operationName');
  throw error;
}
```

## Common Patterns

### Singleton Services
```typescript
// Getting singleton instance
const myService = MyService.getInstance();

// Or with dependency injection
ServiceRegistry.register('MyService', MyService.getInstance());
const service = ServiceRegistry.get<MyService>('MyService');
```

### Event Emission
```typescript
// BaseService extends EventEmitter
this.emit('user:created', userData);

// Listen to events
myService.on('user:created', (data) => {
  console.log('User created:', data);
});
```

### Cache Invalidation
```typescript
// Invalidate all cache entries for a pattern
await this.cacheInvalidate('user:*');
```

## Migration Checklist

- [ ] Extend BaseService instead of creating service instances
- [ ] Remove duplicate imports (DatabaseService, RedisService, AuditService)
- [ ] Replace direct database operations with `withTransaction`
- [ ] Replace manual caching with `cacheGet`/`cacheSet`
- [ ] Replace audit logging with `logAudit`
- [ ] Update error handling to use `handleError`
- [ ] Add @Singleton decorator if service should be singleton
- [ ] Update tests to use getInstance() for singleton services
- [ ] Remove manual logger creation (provided by BaseService)

## Testing

After migration, ensure:
1. All tests pass
2. Service initialization works correctly
3. Transactions commit/rollback properly
4. Caching works as expected
5. Audit logs are created
6. Error handling is consistent

## Next Steps

1. Start with services that have the most duplicate imports
2. Migrate one service at a time
3. Run tests after each migration
4. Update dependent services to use getInstance() where applicable
5. Remove old service files once migration is verified