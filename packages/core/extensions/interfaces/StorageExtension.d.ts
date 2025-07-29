/**
 * Storage Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the storage and persistence system
 */
import { z } from 'zod';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';

export interface StorageExtension extends BaseExtension {
    readonly extensionType: 'storage';
    getStorageProviders(): StorageProviderDefinition[];
    createStorageProvider(providerId: string, config: any): StorageProvider;
    validateStorageConfig(providerId: string, config: any): ExtensionValidationResult;
    getStorageSchema(providerId: string): z.ZodSchema<any>;
    onStorageCreated?(provider: StorageProvider): void;
    onStorageConnected?(provider: StorageProvider): void;
    onStorageDisconnected?(provider: StorageProvider): void;
    onStorageError?(provider: StorageProvider, error: Error): void;
    supportsMigration(): boolean;
    createMigration?(from: StorageProvider, to: StorageProvider): StorageMigration;

export interface StorageProvider {
    readonly id: string;
    readonly name: string;
    readonly type: StorageType;
    readonly version: string;
    connect(config: any): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, options?: StorageSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    clear(): Promise<void>;
    getMany<T>(keys: string[]): Promise<Array<T | undefined>>;
    setMany<T>(entries: Array<{)
        key: string;
        value: T;
        options?: StorageSetOptions;
    }>): Promise<void>;
    deleteMany(keys: string[]): Promise<void>;
    keys(pattern?: string): Promise<string[]>;
    count(pattern?: string): Promise<number>;
    increment(key: string, amount?: number): Promise<number>;
    decrement(key: string, amount?: number): Promise<number>;
    expire(key: string, ttl: number): Promise<void>;
    ttl(key: string): Promise<number>;
    supportsCollections(): boolean;
    createCollection?(name: string, schema?: any): Promise<StorageCollection>;
    getCollection?(name: string): Promise<StorageCollection | undefined>;
    deleteCollection?(name: string): Promise<void>;
    listCollections?(): Promise<string[]>;
    supportsTransactions(): boolean;
    beginTransaction?(): Promise<StorageTransaction>;
    supportsQueries(): boolean;
    query?<T>(query: StorageQuery): Promise<T[]>;
    supportsStreaming(): boolean;
    stream?<T>(pattern?: string): AsyncIterableIterator<{
        key: string;
        value: T;
    }>;
    backup?(destination: string): Promise<void>;
    restore?(source: string): Promise<void>;
    getStats(): Promise<StorageStats>;
    healthCheck(): Promise<StorageHealthStatus>;
    getConfiguration(): any;
    setConfiguration(config: any): void;
    getMetadata(): StorageProviderMetadata;
    initialize(context: ExtensionContext): Promise<void>;
    dispose(): Promise<void>;

export declare enum StorageType {
    MEMORY = "memory",
    FILE = "file",
    DATABASE = "database",
    CACHE = "cache",
    OBJECT_STORE = "object_store",
    KEY_VALUE = "key_value",
    DOCUMENT = "document",
    GRAPH = "graph",
    TIME_SERIES = "time_series",
    SEARCH = "search",
    CUSTOM = "custom"

export interface StorageSetOptions {
    ttl?: number;
    compress?: boolean;
    encrypt?: boolean;
    metadata?: Record<string, any>;

export interface StorageProviderDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    type: StorageType;
    providerClass: new (id: string, config: any) => StorageProvider;
    configSchema: z.ZodSchema<any>;
    ui: StorageUIConfiguration;
    runtime: StorageRuntimeConfiguration;
    capabilities: StorageCapabilities;
    metadata: StorageProviderMetadata;

export interface StorageUIConfiguration {
    icon?: string;
    color?: string;
    category?: string;
    editor?: StorageEditorConfiguration;
    wizard?: StorageWizardConfiguration;
    dashboard?: StorageDashboardConfiguration;

export interface StorageEditorConfiguration {
    component?: React.ComponentType<StorageEditorProps>;
    autoGenerateForm?: boolean;
    formLayout?: 'vertical' | 'horizontal' | 'grid';
    fields?: Record<string, StorageFieldConfiguration>;
    validation?: StorageEditorValidation;
    testConnection?: boolean;

export interface StorageEditorProps {
    provider: StorageProvider;
    config: any;
    onChange: (config: any) => void;
    onTest?: (config: any) => Promise<boolean>;
    context: ExtensionContext;

export interface StorageFieldConfiguration {
    type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'url' | 'file' | 'custom';
    label?: string;
    placeholder?: string;
    helpText?: string;
    validation?: z.ZodSchema<any>;
    options?: Array<{
        value: any;
        label: string;
    }>;
    component?: React.ComponentType<any>;
    sensitive?: boolean;
    masked?: boolean;
    multiline?: boolean;
    fileFilter?: string;
    urlProtocols?: string[];

export interface StorageEditorValidation {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrors?: boolean;
    customValidation?: (config: any) => ExtensionValidationResult;

export interface StorageWizardConfiguration {
    enabled?: boolean;
    steps?: StorageWizardStep[];
    skipCondition?: (config: any) => boolean;

export interface StorageWizardStep {
    id: string;
    title: string;
    description?: string;
    component?: React.ComponentType<any>;
    fields?: string[];
    validation?: (config: any) => ExtensionValidationResult;
    canSkip?: boolean;

export interface StorageDashboardConfiguration {
    enabled?: boolean;
    refreshInterval?: number;
    metrics?: string[];
    charts?: StorageDashboardChart[];

export interface StorageDashboardChart {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie' | 'gauge' | 'counter';
    metric: string;
    options?: any;

export interface StorageRuntimeConfiguration {
    connection?: StorageConnectionConfiguration;
    performance?: StoragePerformanceConfiguration;
    security?: StorageSecurityConfiguration;
    backup?: StorageBackupConfiguration;
    monitoring?: StorageMonitoringConfiguration;

export interface StorageConnectionConfiguration {
    pooling?: {
        enabled?: boolean;
        minConnections?: number;
        maxConnections?: number;
        acquireTimeout?: number;
        idleTimeout?: number;
    };
    retry?: {
        enabled?: boolean;
        maxRetries?: number;
        retryDelay?: number;
        backoffStrategy?: 'fixed' | 'exponential' | 'linear'
  };
    timeout?: {
        connection?: number;
        query?: number;
        idle?: number;
    };
    ssl?: {
        enabled?: boolean;
        certificatePath?: string;
        keyPath?: string;
        caPath?: string;
        rejectUnauthorized?: boolean;
    };

export interface StoragePerformanceConfiguration {
    cache?: {
        enabled?: boolean;
        size?: number;
        ttl?: number;
        strategy?: 'lru' | 'lfu' | 'fifo'
  };
    compression?: {
        enabled?: boolean;
        algorithm?: 'gzip' | 'deflate' | 'brotli';
        level?: number;
    };
    batching?: {
        enabled?: boolean;
        size?: number;
        timeout?: number;
    };
    optimization?: {
        indexing?: boolean;
        prefetching?: boolean;
        lazy?: boolean;
    };

export interface StorageSecurityConfiguration {
    encryption?: {
        enabled?: boolean;
        algorithm?: string;
        keyRotation?: boolean;
        keyRotationInterval?: number;
    };
    accessControl?: {
        enabled?: boolean;
        users?: StorageUser[];
        roles?: StorageRole[];
    };
    audit?: {
        enabled?: boolean;
        events?: string[];
        destination?: string;
    };
    masking?: {
        enabled?: boolean;
        patterns?: string[];
        maskingChar?: string;
    };

export interface StorageUser {
    id: string;
    name: string;
    roles: string[];
    permissions: string[];

export interface StorageRole {
    id: string;
    name: string;
    permissions: string[];

export interface StorageBackupConfiguration {
    enabled?: boolean;
    schedule?: string;
    destination?: string;
    compression?: boolean;
    encryption?: boolean;
    retention?: number;
    incremental?: boolean;

export interface StorageMonitoringConfiguration {
    enabled?: boolean;
    metrics?: string[];
    alerts?: StorageAlert[];
    healthChecks?: StorageHealthCheck[];

export interface StorageAlert {
    id: string;
    name: string;
    metric: string;
    threshold: number;
    condition: 'gt' | 'lt' | 'eq' | 'ne';
    action: 'log' | 'email' | 'webhook' | 'custom';
    actionConfig?: any;

export interface StorageHealthCheck {
    id: string;
    name: string;
    interval: number;
    timeout: number;
    check: (provider: StorageProvider) => Promise<boolean>;

export interface StorageCapabilities {
    get: boolean;
    set: boolean;
    delete: boolean;
    exists: boolean;
    clear: boolean;
    batchGet: boolean;
    batchSet: boolean;
    batchDelete: boolean;
    keys: boolean;
    count: boolean;
    pattern: boolean;
    increment: boolean;
    decrement: boolean;
    expire: boolean;
    ttl: boolean;
    collections: boolean;
    transactions: boolean;
    queries: boolean;
    streaming: boolean;
    backup: boolean;
    restore: boolean;
    custom?: Record<string, boolean>;

export interface StorageProviderMetadata {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
    examples?: StorageExample[];
    performance?: {
        throughput: 'low' | 'medium' | 'high';
        latency: 'low' | 'medium' | 'high';
        scalability: 'single' | 'cluster' | 'distributed'
  };
    compatibility?: {
        minVersion: string;
        maxVersion?: string;
        platforms?: string[];
        dependencies?: string[];
    };
    categories?: string[];
    tags?: string[];
    keywords?: string[];

export interface StorageExample {
    name: string;
    description: string;
    config: any;
    operations: StorageOperation[];

export interface StorageOperation {
    operation: string;
    parameters: any;
    expectedResult?: any;
    description?: string;

export interface StorageCollection {
    readonly name: string;
    readonly schema?: any;
    insert<T>(document: T): Promise<string>;
    update<T>(id: string, document: Partial<T>): Promise<void>;
    upsert<T>(id: string, document: T): Promise<void>;
    find<T>(id: string): Promise<T | undefined>;
    findMany<T>(query: any): Promise<T[]>;
    delete(id: string): Promise<void>;
    deleteMany(query: any): Promise<number>;
    count(query?: any): Promise<number>;
    exists(id: string): Promise<boolean>;
    clear(): Promise<void>;
    createIndex(fields: string[], options?: any): Promise<void>;
    deleteIndex(name: string): Promise<void>;
    listIndexes(): Promise<string[]>;
    aggregate<T>(pipeline: any[]): Promise<T[]>;
    stream<T>(query?: any): AsyncIterableIterator<T>;

export interface StorageTransaction {
    readonly id: string;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, options?: StorageSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): boolean;
    isCommitted(): boolean;
    isRolledBack(): boolean;

export interface StorageQuery {
    type: 'select' | 'insert' | 'update' | 'delete' | 'aggregate';
    where?: StorageQueryCondition;
    limit?: number;
    offset?: number;
    orderBy?: Array<{
        field: string;
        direction: 'asc' | 'desc'
  }>;
    select?: string[];
    groupBy?: string[];
    having?: StorageQueryCondition;
    joins?: StorageQueryJoin[];

export interface StorageQueryCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
    value: any;
    and?: StorageQueryCondition[];
    or?: StorageQueryCondition[];
    not?: StorageQueryCondition;

export interface StorageQueryJoin {
    collection: string;
    on: {
        left: string;
        right: string;
    };
    type: 'inner' | 'left' | 'right' | 'full';

export interface StorageStats {
    connections: {
        total: number;
        active: number;
        idle: number;
    };
    operations: {
        total: number;
        reads: number;
        writes: number;
        deletes: number;
        errors: number;
    };
    performance: {
        averageLatency: number;
        throughput: number;
        errorRate: number;
        cacheHitRate?: number;
    };
    storage: {
        totalSize: number;
        usedSize: number;
        availableSize: number;
        keyCount: number;
        collectionCount?: number;
    };
    memory: {
        used: number;
        available: number;
        cached: number;
    };

export interface StorageHealthStatus {
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    message?: string;
    details?: {
        connection: boolean;
        performance: boolean;
        storage: boolean;
        memory: boolean;
    };
    lastChecked: Date;

export interface StorageMigration {
    readonly id: string;
    readonly from: StorageProvider;
    readonly to: StorageProvider;
    migrate(options?: StorageMigrationOptions): Promise<StorageMigrationResult>;
    validate(): Promise<ExtensionValidationResult>;
    getProgress(): StorageMigrationProgress;
    pause(): Promise<void>;
    resume(): Promise<void>;
    cancel(): Promise<void>;

export interface StorageMigrationOptions {
    batchSize?: number;
    parallelism?: number;
    validation?: boolean;
    backup?: boolean;
    dryRun?: boolean;
    filter?: (key: string, value: any) => boolean;
    transform?: (key: string, value: any) => {
        key: string;
        value: any;
    };

export interface StorageMigrationResult {
    success: boolean;
    totalKeys: number;
    migratedKeys: number;
    failedKeys: number;
    duration: number;
    errors: Error[];

export interface StorageMigrationProgress {
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    totalKeys: number;
    processedKeys: number;
    percentage: number;
    estimatedTimeRemaining: number;
    currentKey?: string;

export declare namespace StorageExtensionHelpers {
    function createStorageProvider(config: Partial<StorageProviderDefinition>): StorageProviderDefinition;

//# sourceMappingURL=StorageExtension.d.ts.map