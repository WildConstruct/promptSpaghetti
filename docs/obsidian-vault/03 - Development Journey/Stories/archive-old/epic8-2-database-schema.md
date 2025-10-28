# Epic 8.2 - Corrections Manager Database Schema Design

## Overview

This document outlines the database schema design for the Corrections Manager General Availability implementation, transitioning from localStorage to a proper persistent storage solution.

## Database Technology Selection

### Recommended: SQLite with Server-Side Storage

- **Rationale**: Simple deployment, ACID compliance, excellent performance for the use case
- **Benefits**: No external dependencies, built-in WAL mode, full-text search support
- **Scalability**: Suitable for single-server deployments up to moderate usage
- **Alternative**: PostgreSQL for high-concurrency multi-user scenarios

## Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSON DEFAULT '{}'
);
```

### 2. Projects Table

```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Correction Rules Table

```sql
CREATE TABLE correction_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,  -- For external reference
    name VARCHAR(255) NOT NULL,
    description TEXT,
    find_pattern TEXT NOT NULL,
    replace_with TEXT NOT NULL,
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    -- Ownership and scope
    user_id INTEGER NOT NULL,
    project_id INTEGER,  -- NULL = global rule
    scope ENUM('global', 'project', 'private') DEFAULT 'private',

    -- Versioning
    version INTEGER DEFAULT 1,
    parent_rule_id INTEGER,  -- For versioning chain

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER NOT NULL,

    -- Performance and validation
    validation_status ENUM('valid', 'invalid', 'warning') DEFAULT 'valid',
    validation_message TEXT,
    last_used_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_rule_id) REFERENCES correction_rules(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### 4. Correction Rule History Table

```sql
CREATE TABLE correction_rule_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    rule_uuid VARCHAR(36) NOT NULL,

    -- Snapshot of rule at this point in time
    name VARCHAR(255) NOT NULL,
    description TEXT,
    find_pattern TEXT NOT NULL,
    replace_with TEXT NOT NULL,
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    -- Change metadata
    change_type ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL,
    change_summary TEXT,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Performance tracking
    performance_impact DECIMAL(5,2),  -- Milliseconds

    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

### 5. Correction Statistics Table

```sql
CREATE TABLE correction_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    rule_uuid VARCHAR(36) NOT NULL,

    -- Usage metrics
    application_count INTEGER DEFAULT 0,
    character_count_before INTEGER DEFAULT 0,
    character_count_after INTEGER DEFAULT 0,
    execution_time_ms DECIMAL(8,3) DEFAULT 0,

    -- Effectiveness metrics
    success_rate DECIMAL(5,2) DEFAULT 100.0,
    error_count INTEGER DEFAULT 0,
    last_error_message TEXT,

    -- Time-based aggregation
    date_bucket DATE NOT NULL,  -- Daily aggregation
    hour_bucket INTEGER DEFAULT 0,  -- 0-23 for hourly breakdowns

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    UNIQUE(rule_id, date_bucket, hour_bucket)
);
```

### 6. Correction Sets Table (for Import/Export)

```sql
CREATE TABLE correction_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',

    -- Ownership
    created_by INTEGER NOT NULL,

    -- Export/Import metadata
    export_format ENUM('json', 'yaml', 'csv') DEFAULT 'json',
    export_data JSON,
    checksum VARCHAR(64),  -- For integrity verification

    -- Sharing and collaboration
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 7. Correction Set Rules Junction Table

```sql
CREATE TABLE correction_set_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    rule_id INTEGER NOT NULL,

    -- Rule configuration within set
    order_index INTEGER DEFAULT 0,
    is_included BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (set_id) REFERENCES correction_sets(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES correction_rules(id) ON DELETE CASCADE,
    UNIQUE(set_id, rule_id)
);
```

### 8. User Preferences Table

```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    -- UI preferences
    corrections_enabled BOOLEAN DEFAULT TRUE,
    auto_apply_corrections BOOLEAN DEFAULT FALSE,
    show_correction_preview BOOLEAN DEFAULT TRUE,

    -- Performance preferences
    max_rules_per_execution INTEGER DEFAULT 50,
    timeout_ms INTEGER DEFAULT 5000,

    -- Notification preferences
    notify_on_rule_conflicts BOOLEAN DEFAULT TRUE,
    notify_on_performance_issues BOOLEAN DEFAULT TRUE,

    -- Advanced settings
    advanced_settings JSON DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);
```

## Indexes for Performance

```sql
-- Primary performance indexes
CREATE INDEX idx_correction_rules_user_active ON correction_rules(user_id, is_active);
CREATE INDEX idx_correction_rules_priority ON correction_rules(priority, is_active);
CREATE INDEX idx_correction_rules_project ON correction_rules(project_id, is_active);
CREATE INDEX idx_correction_rules_scope ON correction_rules(scope, is_active);
CREATE INDEX idx_correction_rules_uuid ON correction_rules(uuid);

-- Full-text search indexes
CREATE INDEX idx_correction_rules_name_fts ON correction_rules(name);
CREATE INDEX idx_correction_rules_description_fts ON correction_rules(description);
CREATE INDEX idx_correction_rules_pattern_fts ON correction_rules(find_pattern);

-- Statistics indexes
CREATE INDEX idx_correction_statistics_rule_date ON correction_statistics(rule_id, date_bucket);
CREATE INDEX idx_correction_statistics_date_hour ON correction_statistics(date_bucket, hour_bucket);

-- History indexes
CREATE INDEX idx_correction_rule_history_rule_time ON correction_rule_history(rule_id, changed_at);
CREATE INDEX idx_correction_rule_history_type ON correction_rule_history(change_type, changed_at);
```

## Data Migration Strategy

### Phase 1: Schema Creation

1. Create new database schema
2. Set up indexes and constraints
3. Create migration utilities

### Phase 2: Data Migration from localStorage

1. Read existing localStorage data
2. Convert to new schema format
3. Handle data validation and cleanup
4. Create default user accounts

### Phase 3: Gradual Cutover

1. Dual-write to both localStorage and database
2. Validate data consistency
3. Switch reads to database
4. Remove localStorage persistence

## Performance Considerations

### Query Optimization

- Use prepared statements for all database operations
- Implement connection pooling
- Add query result caching for frequently accessed data
- Use database triggers for automatic timestamp updates

### Scaling Strategies

- Implement read replicas for high-query scenarios
- Use database sharding for multi-tenant scenarios
- Add Redis caching layer for frequently accessed rules
- Implement asynchronous statistics collection

## Security Considerations

### Data Protection

- Encrypt sensitive correction patterns
- Implement row-level security for multi-user scenarios
- Use parameterized queries to prevent SQL injection
- Regular database backups with encryption

### Access Control

- User-based access control for private rules
- Project-based permissions for shared rules
- Admin-level access for system-wide rules
- API key authentication for external integrations

## Backup and Recovery

### Backup Strategy

- Daily full database backups
- Hourly incremental backups
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Procedures

- Automated backup verification
- Disaster recovery testing
- Data integrity checks
- Rollback procedures for failed migrations

## Monitoring and Alerting

### Database Monitoring

- Query performance monitoring
- Database size and growth tracking
- Connection pool utilization
- Slow query identification

### Application Monitoring

- Correction rule execution performance
- Error rate tracking
- User activity patterns
- Resource utilization alerts

## Implementation Notes

### Database Libraries

- **SQLite**: `better-sqlite3` for Node.js
- **PostgreSQL**: `pg` with `@types/pg`
- **Migration**: `knex.js` for schema migrations
- **ORM**: Consider `Prisma` or `TypeORM` for type safety

### API Design

- RESTful API for CRUD operations
- GraphQL endpoint for complex queries
- WebSocket for real-time updates
- Rate limiting for API endpoints

### Development Workflow

- Database schema versioning
- Seed data for development
- Test data fixtures
- Local development with SQLite, production with PostgreSQL

This schema design provides a solid foundation for the Corrections Manager General Availability implementation, supporting all planned features while maintaining good performance and scalability characteristics.
