/**
 * Core Database Types
 *
 * This file contains foundational type definitions used across the application
 * for database operations, pagination, and RBAC (Role-Based Access Control).
 */
export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextPage?: number;
        previousPage?: number;
    };
    metadata?: {
        executionTime?: number;
        cacheHit?: boolean;
        query?: string;
        [key: string]: any;
    };
}
export interface Role {
    id: string;
    name: string;
    description?: string;
    scope: 'global' | 'organization' | 'team';
    organizationId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Permission {
    id: string;
    roleId: string;
    resource: string;
    action: string;
    scope: 'global' | 'organization' | 'team' | 'own';
    conditions?: Record<string, unknown>;
    createdAt: Date;
}
export interface UserRole {
    id: string;
    userId: string;
    roleId: string;
    grantedBy?: string;
    grantedAt: Date;
    expiresAt?: Date;
    scopeContext?: Record<string, unknown>;
}
export interface QueryOptions {
    select?: string[];
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: string[];
    distinct?: boolean;
}
export interface QueryResult<T> {
    rows: T[];
    count: number;
    affectedRows?: number;
    insertId?: number;
}
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    poolSize?: number;
    connectionTimeout?: number;
    commandTimeout?: number;
}
export interface TransactionContext {
    id: string;
    startedAt: Date;
    isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
}
export interface AuditableEntity {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    version?: number;
}
export interface SoftDeletableEntity {
    deletedAt?: Date;
    deletedBy?: string;
    isDeleted: boolean;
}
export interface BaseEntity extends AuditableEntity {
    id: string;
}
export interface FullEntity extends BaseEntity, SoftDeletableEntity {
}
export interface SearchOptions {
    query?: string;
    fields?: string[];
    filters?: Record<string, unknown>;
    fuzzy?: boolean;
    caseSensitive?: boolean;
}
export interface FilterOptions {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike' | 'between';
    value: any;
    values?: any[];
}
export interface OperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    errorCode?: string;
    timestamp: Date;
    executionTime?: number;
}
export interface BulkOperationResult<T = unknown> {
    success: boolean;
    successCount: number;
    errorCount: number;
    data?: T[];
    errors?: Array<{
        index: number;
        error: string;
        item?: any;
    }>;
    timestamp: Date;
    executionTime?: number;
}
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
    version?: string;
}
export interface CachedResult<T> {
    data: T;
    cached: boolean;
    cacheKey: string;
    expiresAt?: Date;
    version?: string;
}
export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete';
export interface OperationContext {
    operation: DatabaseOperation;
    entityType: string;
    userId?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export type Primitive = string | number | boolean | Date | null | undefined;
export type DatabaseValue = Primitive | Record<string, unknown> | Array<unknown>;
export type WhereCondition = Record<string, DatabaseValue>;
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export declare function createPaginatedResult<T>(data: T[], totalCount: number, options: PaginationOptions): PaginatedResult<T>;
export declare function createOperationResult<T>(success: boolean, data?: T, error?: string, errorCode?: string, executionTime?: number): OperationResult<T>;
//# sourceMappingURL=types.d.ts.map