/**
 * Storage Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the storage and persistence system
 */
import { z } from 'zod';
setMany(entries, (Array));
Promise;
deleteMany(keys, string);
Promise;
// Key operations
keys(pattern ?  : string);
Promise;
count(pattern ?  : string);
Promise;
// Advanced operations
increment(key, string, amount ?  : number);
Promise;
decrement(key, string, amount ?  : number);
Promise;
expire(key, string, ttl, number);
Promise;
ttl(key, string);
Promise;
// Collection operations (if supported)
supportsCollections();
boolean;
createCollection ? (name, schema) =>  : ;
getCollection ? (name) =>  : ;
deleteCollection ? (name) =>  : ;
listCollections ? () =>  : ;
// Transaction support (if supported)
supportsTransactions();
boolean;
beginTransaction ? () =>  : ;
// Query support (if supported)
supportsQueries();
boolean;
query ? (query) : StorageQuery;
Promise;
// Streaming support (if supported)
supportsStreaming();
boolean;
stream ? (pattern ?  : string) : AsyncIterableIterator;
// Backup and restore
backup ? (destination) =>  : ;
restore ? (source) =>  : ;
// Statistics
getStats();
Promise;
// Health checking
healthCheck();
Promise;
// Configuration
getConfiguration();
any;
setConfiguration(config, any);
void ;
// Metadata
getMetadata();
StorageProviderMetadata;
// Lifecycle
initialize(context, ExtensionContext);
Promise;
dispose();
Promise;
export var StorageType;
(function (StorageType) {
    StorageType["MEMORY"] = "memory";
    StorageType["FILE"] = "file";
    StorageType["DATABASE"] = "database";
    StorageType["CACHE"] = "cache";
    StorageType["OBJECT_STORE"] = "object_store";
    StorageType["KEY_VALUE"] = "key_value";
    StorageType["DOCUMENT"] = "document";
    StorageType["GRAPH"] = "graph";
    StorageType["TIME_SERIES"] = "time_series";
    StorageType["SEARCH"] = "search";
    StorageType["CUSTOM"] = "custom";
})(StorageType || (StorageType = {}));
options ?  : Array;
component ?  : React.ComponentType;
// Security
sensitive ?  : boolean;
masked ?  : boolean;
// Advanced options
multiline ?  : boolean;
fileFilter ?  : string;
urlProtocols ?  : string;
;
// Retry configuration
retry ?  : {
    enabled: boolean,
    maxRetries: number,
    retryDelay: number,
    backoffStrategy: 'fixed' | 'exponential' | 'linear'
};
// Timeout configuration
timeout ?  : {
    connection: number,
    query: number,
    idle: number
};
// SSL/TLS configuration
ssl ?  : {
    enabled: boolean,
    certificatePath: string,
    keyPath: string,
    caPath: string,
    rejectUnauthorized: boolean
};
;
// Compression
compression ?  : {
    enabled: boolean,
    algorithm: 'gzip' | 'deflate' | 'brotli',
    level: number
};
// Batching
batching ?  : {
    enabled: boolean,
    size: number,
    timeout: number
};
// Optimization
optimization ?  : {
    indexing: boolean,
    prefetching: boolean,
    lazy: boolean
};
;
// Access control
accessControl ?  : {
    enabled: boolean,
    users: StorageUser,
    roles: StorageRole
};
// Audit logging
audit ?  : {
    enabled: boolean,
    events: string,
    destination: string
};
// Data masking
masking ?  : {
    enabled: boolean,
    patterns: string,
    maskingChar: string
};
;
// Compatibility
compatibility ?  : {
    minVersion: string,
    maxVersion: string,
    platforms: string,
    dependencies: string
};
// Categories and tags
categories ?  : string;
tags ?  : string;
keywords ?  : string;
orderBy ?  : Array;
// Projection
select ?  : string;
// Aggregation
groupBy ?  : string;
having ?  : StorageQueryCondition;
// Joins (if supported)
joins ?  : StorageQueryJoin;
on: {
    left: string;
    right: string;
}
;
type: 'inner' | 'left' | 'right' | 'full';
;
// Operation stats
operations: {
    total: number;
    reads: number;
    writes: number;
    deletes: number;
    errors: number;
}
;
// Performance stats
performance: {
    averageLatency: number;
    throughput: number;
    errorRate: number;
    cacheHitRate ?  : number;
}
;
// Storage stats
storage: {
    totalSize: number;
    usedSize: number;
    availableSize: number;
    keyCount: number;
    collectionCount ?  : number;
}
;
// Memory stats
memory: {
    used: number;
    available: number;
    cached: number;
}
;
;
lastChecked: Date;
transform ?  : (key, value) => { key: string; value: any; };
export var StorageExtensionHelpers;
(function (StorageExtensionHelpers) {
    function createStorageProvider(config) {
        return {
            id: config.id || 'custom-storage',
            name: config.name || 'Custom Storage',
            description: config.description || 'A custom storage provider',
            version: config.version || '1.0.0',
            type: config.type || StorageType.CUSTOM,
            providerClass: config.providerClass || class {
                id = config.id || 'custom-storage';
                name = config.name || 'Custom Storage';
                type = config.type || StorageType.CUSTOM;
                version = config.version || '1.0.0';
                async connect() { }
                async disconnect() { }
                isConnected() { return true; }
                async get() { return undefined; }
                async set() { }
                async delete() { }
                async exists() { return false; }
                async clear() { }
                async getMany() { return []; }
                async setMany() { }
                async deleteMany() { }
                async keys() { return []; }
                async count() { return 0; }
                async increment() { return 0; }
                async decrement() { return 0; }
                async expire() { }
                async ttl() { return -1; }
                supportsCollections() { return false; }
                supportsTransactions() { return false; }
                supportsQueries() { return false; }
                supportsStreaming() { return false; }
                async getStats() { return {}; }
                async healthCheck() { return { status: 'healthy', lastChecked: new Date() }; }
                getConfiguration() { return {}; }
                setConfiguration() { }
                getMetadata() { return { author: 'Unknown', license: 'MIT' }; }
                async initialize() { }
                async dispose() { }
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
                license: 'MIT'
            }
        };
    }
    StorageExtensionHelpers.createStorageProvider = createStorageProvider;
})(StorageExtensionHelpers || (StorageExtensionHelpers = {}));
