/**
 * Storage Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the storage and persistence system
 */
import { z } from 'zod';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';

// Storage Extension Interface
export interface StorageExtension extends BaseExtension {
  readonly extensionType: 'storage';
  // Storage provider registration
  getStorageProviders(): StorageProviderDefinition[];
  createStorageProvider(providerId: string, config: any): StorageProvider;
  // Storage validation
  validateStorageConfig(providerId: string, config: any): ExtensionValidationResult;
  getStorageSchema(providerId: string): z.ZodSchema<any>;
  // Storage lifecycle hooks
  onStorageCreated?(provider: StorageProvider): void;
  onStorageConnected?(provider: StorageProvider): void;
  onStorageDisconnected?(provider: StorageProvider): void;
  onStorageError?(provider: StorageProvider, error: Error): void;
  // Migration support
  supportsMigration(): boolean;
  createMigration?(from: StorageProvider, to: StorageProvider): StorageMigration;
}

// Storage Provider Interface
export interface StorageProvider {
  readonly id: string;
  readonly name: string;
  readonly type: StorageType;
  readonly version: string;
  // Connection management
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  // Basic operations
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: StorageSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  // Batch operations
  getMany<T>(keys: string[]): Promise<Array<T | undefined>>;
  setMany<T>(entries: Array<{ key: string; value: T; options?: StorageSetOptions }>): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
  // Key operations
  keys(pattern?: string): Promise<string[]>;
  count(pattern?: string): Promise<number>;
  // Advanced operations
  increment(key: string, amount?: number): Promise<number>;
  decrement(key: string, amount?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
  ttl(key: string): Promise<number>;
  // Collection operations (if supported)
  supportsCollections(): boolean;
  createCollection?(name: string, schema?: any): Promise<StorageCollection>;
  getCollection?(name: string): Promise<StorageCollection | undefined>;
  deleteCollection?(name: string): Promise<void>;
  listCollections?(): Promise<string[]>;
  // Transaction support (if supported)
  supportsTransactions(): boolean;
  beginTransaction?(): Promise<StorageTransaction>;
  // Query support (if supported)
  supportsQueries(): boolean;
  query?<T>(query: StorageQuery): Promise<T[]>;
  // Streaming support (if supported)
  supportsStreaming(): boolean;
  stream?<T>(pattern?: string): AsyncIterableIterator<{ key: string; value: T }>;
  // Backup and restore
  backup?(destination: string): Promise<void>;
  restore?(source: string): Promise<void>;
  // Statistics
  getStats(): Promise<StorageStats>;
  // Health checking
  healthCheck(): Promise<StorageHealthStatus>;
  // Configuration
  getConfiguration(): any;
  setConfiguration(config: any): void;
  // Metadata
  getMetadata(): StorageProviderMetadata;
  // Lifecycle
  initialize(context: ExtensionContext): Promise<void>;
  dispose(): Promise<void>;
}

// Storage Types
export enum StorageType {
  MEMORY = 'memory',
  FILE = 'file',
  DATABASE = 'database',
  CACHE = 'cache',
  OBJECT_STORE = 'object_store',
  KEY_VALUE = 'key_value',
  DOCUMENT = 'document',
  GRAPH = 'graph',
  TIME_SERIES = 'time_series',
  SEARCH = 'search',
  CUSTOM = 'custom'
}

// Storage Set Options
export interface StorageSetOptions {
  ttl?: number;
  compress?: boolean;
  encrypt?: boolean;
  metadata?: Record<string, any>;
}

// Storage Provider Definition
export interface StorageProviderDefinition {
  // Basic metadata
  id: string;
  name: string;
  description: string;
  version: string;
  type: StorageType;
  // Provider class
  providerClass: new (id: string, config: any) => StorageProvider;
  // Configuration schema
  configSchema: z.ZodSchema<any>;
  // UI configuration
  ui: StorageUIConfiguration;
  // Runtime configuration
  runtime: StorageRuntimeConfiguration;
  // Capabilities
  capabilities: StorageCapabilities;
  // Metadata
  metadata: StorageProviderMetadata;
}

// Storage UI Configuration
export interface StorageUIConfiguration {
  // Visual representation
  icon?: string;
  color?: string;
  category?: string;
  // Configuration editor
  editor?: StorageEditorConfiguration;
  // Connection wizard
  wizard?: StorageWizardConfiguration;
  // Monitoring dashboard
  dashboard?: StorageDashboardConfiguration;
}

// Storage Editor Configuration
export interface StorageEditorConfiguration {
  // Custom editor component
  component?: React.ComponentType<StorageEditorProps>;
  // Form generation
  autoGenerateForm?: boolean;
  formLayout?: 'vertical' | 'horizontal' | 'grid';
  // Field customization
  fields?: Record<string, StorageFieldConfiguration>;
  // Validation
  validation?: StorageEditorValidation;
  // Connection testing
  testConnection?: boolean;
}

// Storage Editor Props
export interface StorageEditorProps {
  provider: StorageProvider;
  config: any;
  onChange: (config: any) => void;
  onTest?: (config: any) => Promise<boolean>;
  context: ExtensionContext;
}

// Storage Field Configuration
export interface StorageFieldConfiguration {
  type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'url' | 'file' | 'custom';
  label?: string;
  placeholder?: string;
  helpText?: string;
  validation?: z.ZodSchema<any>;
  options?: Array<{ value: any; label: string }>;
  component?: React.ComponentType<any>;
  // Security
  sensitive?: boolean;
  masked?: boolean;
  // Advanced options
  multiline?: boolean;
  fileFilter?: string;
  urlProtocols?: string[];
}

// Storage Editor Validation
export interface StorageEditorValidation {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrors?: boolean;
  customValidation?: (config: any) => ExtensionValidationResult;
}

// Storage Wizard Configuration
export interface StorageWizardConfiguration {
  enabled?: boolean;
  steps?: StorageWizardStep[];
  skipCondition?: (config: any) => boolean;
}

// Storage Wizard Step
export interface StorageWizardStep {
  id: string;
  title: string;
  description?: string;
  component?: React.ComponentType<any>;
  fields?: string[];
  validation?: (config: any) => ExtensionValidationResult;
  canSkip?: boolean;
}

// Storage Dashboard Configuration
export interface StorageDashboardConfiguration {
  enabled?: boolean;
  refreshInterval?: number;
  metrics?: string[];
  charts?: StorageDashboardChart[];
}

// Storage Dashboard Chart
export interface StorageDashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'counter';
  metric: string;
  options?: any;
}

// Storage Runtime Configuration
export interface StorageRuntimeConfiguration {
  // Connection settings
  connection?: StorageConnectionConfiguration;
  // Performance settings
  performance?: StoragePerformanceConfiguration;
  // Security settings
  security?: StorageSecurityConfiguration;
  // Backup settings
  backup?: StorageBackupConfiguration;
  // Monitoring settings
  monitoring?: StorageMonitoringConfiguration;
}

// Storage Connection Configuration
export interface StorageConnectionConfiguration {
  // Connection pooling
  pooling?: {
    enabled?: boolean;
    minConnections?: number;
    maxConnections?: number;
    acquireTimeout?: number;
    idleTimeout?: number;
  };
  // Retry configuration
  retry?: {
    enabled?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    backoffStrategy?: 'fixed' | 'exponential' | 'linear';
  };
  // Timeout configuration
  timeout?: {
    connection?: number;
    query?: number;
    idle?: number;
  };
  // SSL/TLS configuration
  ssl?: {
    enabled?: boolean;
    certificatePath?: string;
    keyPath?: string;
    caPath?: string;
    rejectUnauthorized?: boolean;
  };
}

// Storage Performance Configuration
export interface StoragePerformanceConfiguration {
  // Caching
  cache?: {
    enabled?: boolean;
    size?: number;
    ttl?: number;
    strategy?: 'lru' | 'lfu' | 'fifo';
  };
  // Compression
  compression?: {
    enabled?: boolean;
    algorithm?: 'gzip' | 'deflate' | 'brotli';
    level?: number;
  };
  // Batching
  batching?: {
    enabled?: boolean;
    size?: number;
    timeout?: number;
  };
  // Optimization
  optimization?: {
    indexing?: boolean;
    prefetching?: boolean;
    lazy?: boolean;
  };
}

// Storage Security Configuration
export interface StorageSecurityConfiguration {
  // Encryption
  encryption?: {
    enabled?: boolean;
    algorithm?: string;
    keyRotation?: boolean;
    keyRotationInterval?: number;
  };
  // Access control
  accessControl?: {
    enabled?: boolean;
    users?: StorageUser[];
    roles?: StorageRole[];
  };
  // Audit logging
  audit?: {
    enabled?: boolean;
    events?: string[];
    destination?: string;
  };
  // Data masking
  masking?: {
    enabled?: boolean;
    patterns?: string[];
    maskingChar?: string;
  };
}

// Storage User
export interface StorageUser {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

// Storage Role
export interface StorageRole {
  id: string;
  name: string;
  permissions: string[];
}

// Storage Backup Configuration
export interface StorageBackupConfiguration {
  enabled?: boolean;
  schedule?: string; // Cron expression
  destination?: string;
  compression?: boolean;
  encryption?: boolean;
  retention?: number; // Days
  incremental?: boolean;
}

// Storage Monitoring Configuration
export interface StorageMonitoringConfiguration {
  enabled?: boolean;
  metrics?: string[];
  alerts?: StorageAlert[];
  healthChecks?: StorageHealthCheck[];
}

// Storage Alert
export interface StorageAlert {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  condition: 'gt' | 'lt' | 'eq' | 'ne';
  action: 'log' | 'email' | 'webhook' | 'custom';
  actionConfig?: any;
}

// Storage Health Check
export interface StorageHealthCheck {
  id: string;
  name: string;
  interval: number;
  timeout: number;
  check: (provider: StorageProvider) => Promise<boolean>;
}

// Storage Capabilities
export interface StorageCapabilities {
  // Basic operations
  get: boolean;
  set: boolean;
  delete: boolean;
  exists: boolean;
  clear: boolean;
  // Batch operations
  batchGet: boolean;
  batchSet: boolean;
  batchDelete: boolean;
  // Key operations
  keys: boolean;
  count: boolean;
  pattern: boolean;
  // Advanced operations
  increment: boolean;
  decrement: boolean;
  expire: boolean;
  ttl: boolean;
  // Collections
  collections: boolean;
  // Transactions
  transactions: boolean;
  // Queries
  queries: boolean;
  // Streaming
  streaming: boolean;
  // Backup/Restore
  backup: boolean;
  restore: boolean;
  // Custom capabilities
  custom?: Record<string, boolean>;
}

// Storage Provider Metadata
export interface StorageProviderMetadata {
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  examples?: StorageExample[];
  // Performance characteristics
  performance?: {
    throughput: 'low' | 'medium' | 'high';
    latency: 'low' | 'medium' | 'high';
    scalability: 'single' | 'cluster' | 'distributed';
  };
  // Compatibility
  compatibility?: {
    minVersion: string;
    maxVersion?: string;
    platforms?: string[];
    dependencies?: string[];
  };
  // Categories and tags
  categories?: string[];
  tags?: string[];
  keywords?: string[];
}

// Storage Example
export interface StorageExample {
  name: string;
  description: string;
  config: any;
  operations: StorageOperation[];
}

// Storage Operation
export interface StorageOperation {
  operation: string;
  parameters: any;
  expectedResult?: any;
  description?: string;
}

// Storage Collection Interface
export interface StorageCollection {
  readonly name: string;
  readonly schema?: any;
  // Document operations
  insert<T>(document: T): Promise<string>;
  update<T>(id: string, document: Partial<T>): Promise<void>;
  upsert<T>(id: string, document: T): Promise<void>;
  find<T>(id: string): Promise<T | undefined>;
  findMany<T>(query: any): Promise<T[]>;
  delete(id: string): Promise<void>;
  deleteMany(query: any): Promise<number>;
  // Collection operations
  count(query?: any): Promise<number>;
  exists(id: string): Promise<boolean>;
  clear(): Promise<void>;
  // Indexing
  createIndex(fields: string[], options?: any): Promise<void>;
  deleteIndex(name: string): Promise<void>;
  listIndexes(): Promise<string[]>;
  // Aggregation
  aggregate<T>(pipeline: any[]): Promise<T[]>;
  // Streaming
  stream<T>(query?: any): AsyncIterableIterator<T>;
}

// Storage Transaction Interface
export interface StorageTransaction {
  readonly id: string;
  // Transaction operations
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: StorageSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
  // Transaction control
  commit(): Promise<void>;
  rollback(): Promise<void>;
  // Transaction status
  isActive(): boolean;
  isCommitted(): boolean;
  isRolledBack(): boolean;
}

// Storage Query Interface
export interface StorageQuery {
  // Query type
  type: 'select' | 'insert' | 'update' | 'delete' | 'aggregate';
  // Query conditions
  where?: StorageQueryCondition;
  // Query options
  limit?: number;
  offset?: number;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  // Projection
  select?: string[];
  // Aggregation
  groupBy?: string[];
  having?: StorageQueryCondition;
  // Joins (if supported)
  joins?: StorageQueryJoin[];
}

// Storage Query Condition
export interface StorageQueryCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
  // Logical operators
  and?: StorageQueryCondition[];
  or?: StorageQueryCondition[];
  not?: StorageQueryCondition;
}

// Storage Query Join
export interface StorageQueryJoin {
  collection: string;
  on: { left: string; right: string };
  type: 'inner' | 'left' | 'right' | 'full';
}

// Storage Stats
export interface StorageStats {
  // Connection stats
  connections: {,
    total: number;
    active: number;
    idle: number;
  };
  // Operation stats
  operations: {,
    total: number;
    reads: number;
    writes: number;
    deletes: number;
    errors: number;
  };
  // Performance stats
  performance: {,
    averageLatency: number;
    throughput: number;
    errorRate: number;
    cacheHitRate?: number;
  };
  // Storage stats
  storage: {,
    totalSize: number;
    usedSize: number;
    availableSize: number;
    keyCount: number;
    collectionCount?: number;
  };
  // Memory stats
  memory: {,
    used: number;
    available: number;
    cached: number;
  };
}

// Storage Health Status
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
}

// Storage Migration Interface
export interface StorageMigration {
  readonly id: string;
  readonly from: StorageProvider;
  readonly to: StorageProvider;
  // Migration execution
  migrate(options?: StorageMigrationOptions): Promise<StorageMigrationResult>;
  // Migration validation
  validate(): Promise<ExtensionValidationResult>;
  // Migration progress
  getProgress(): StorageMigrationProgress;
  // Migration control
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}

// Storage Migration Options
export interface StorageMigrationOptions {
  batchSize?: number;
  parallelism?: number;
  validation?: boolean;
  backup?: boolean;
  dryRun?: boolean;
  filter?: (key: string, value: any) => boolean;
  transform?: (key: string, value: any) => { key: string; value: any };
}

// Storage Migration Result
export interface StorageMigrationResult {
  success: boolean;
  totalKeys: number;
  migratedKeys: number;
  failedKeys: number;
  duration: number;
  errors: Error[];
}

// Storage Migration Progress
export interface StorageMigrationProgress {
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalKeys: number;
  processedKeys: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentKey?: string;
}

// Storage Extension Helper Functions
export namespace StorageExtensionHelpers {
  export function createStorageProvider(config: Partial<StorageProviderDefinition>): StorageProviderDefinition {
    return {
      id: config.id || 'custom-storage',
      name: config.name || 'Custom Storage',
      description: config.description || 'A custom storage provider',
      version: config.version || '1.0.0',
      type: config.type || StorageType.CUSTOM,
      providerClass: config.providerClass || class implements StorageProvider {
        id = config.id || 'custom-storage';
        name = config.name || 'Custom Storage';
        type = config.type || StorageType.CUSTOM;
        version = config.version || '1.0.0';
        async connect() {}
        async disconnect() {}
        isConnected() { return true; }
        async get() { return undefined; }
        async set() {}
        async delete() {}
        async exists() { return false; }
        async clear() {}
        async getMany() { return []; }
        async setMany() {}
        async deleteMany() {}
        async keys() { return []; }
        async count() { return 0; }
        async increment() { return 0; }
        async decrement() { return 0; }
        async expire() {}
        async ttl() { return -1; }
        supportsCollections() { return false; }
        supportsTransactions() { return false; }
        supportsQueries() { return false; }
        supportsStreaming() { return false; }
        async getStats() { return {} as StorageStats; }
        async healthCheck() { return { status: 'healthy' as const, lastChecked: new Date() }; }
        getConfiguration() { return {}; }
        setConfiguration() {}
        getMetadata() { return { author: 'Unknown', license: 'MIT' }; }
        async initialize() {}
        async dispose() {}
      },
      configSchema: config.configSchema || z.object({}),
      ui: config.ui || {},
      runtime: config.runtime || {},
      capabilities: config.capabilities || {
        get: true,
        set: true,
        delete: true,
        exists: true,
        clear: true,
        batchGet: false,
        batchSet: false,
        batchDelete: false,
        keys: true,
        count: true,
        pattern: false,
        increment: false,
        decrement: false,
        expire: false,
        ttl: false,
        collections: false,
        transactions: false,
        queries: false,
        streaming: false,
        backup: false,
        restore: false,
      },
      metadata: config.metadata || {
        author: 'Unknown',
        license: 'MIT',
      }
    };
  }
}