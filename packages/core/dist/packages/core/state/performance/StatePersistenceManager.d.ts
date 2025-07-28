/**
 * State Persistence Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 3: Performance-Optimized State
 *
 * Intelligent persistence strategies per domain with performance optimization
 */
import { EventEmitter } from 'events';
export type PersistenceStrategy = 'IMMEDIATE' | 'DEBOUNCED' | 'SNAPSHOT' | 'APPEND_ONLY' | 'BATCH' | 'MANUAL';
export type StorageBackend = 'LOCAL_STORAGE' | 'INDEXED_DB' | 'MEMORY' | 'SERVER_SYNC' | 'WEB_WORKER' | 'OPFS';
export interface PersistenceRule {
    strategy: PersistenceStrategy;
    storage: StorageBackend;
    debounceMs?: number;
    interval?: string;
    maxSize?: string;
    ttl?: string;
    compression?: boolean;
    encryption?: boolean;
    conflictResolution?: 'operational_transform' | 'last_writer_wins' | 'merge' | 'manual';
    retryAttempts?: number;
    retryDelay?: number;
    auditTrail?: boolean;
    retention?: string;
    batchSize?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    persistOnShutdown?: boolean;
    validateOnLoad?: boolean;
    backup?: {
        enabled: boolean;
        interval?: string;
        maxBackups?: number;
        compression?: boolean;
    };
}
export interface PersistenceTask {
    id: string;
    domain: string;
    data: any;
    timestamp: number;
    strategy: PersistenceStrategy;
    storage: StorageBackend;
    priority: 'low' | 'normal' | 'high' | 'critical';
    retryCount: number;
    maxRetries: number;
    scheduled?: number;
    metadata?: Record<string, any>;
}
export interface StorageAdapter {
    name: StorageBackend;
    isAvailable(): boolean;
    read(key: string): Promise<any>;
    write(key: string, data: any, options?: any): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    size(): Promise<number>;
    keys(): Promise<string>;
    supports(feature: string): boolean;
}
export interface PersistenceMetrics {
    totalWrites: number;
    totalReads: number;
    writeLatency: number;
    readLatency: number;
    failureCount: number;
    retryCount: number;
    compressionRatio: number;
    storageUsage: Map<StorageBackend, number>;
    lastBackup: number;
    dataCorruption: number;
    recoveryTime: number;
}
export interface BackupMetadata {
    timestamp: number;
    domain: string;
    size: number;
    checksum: string;
    version: string;
    compressionRatio?: number;
}
export declare class StatePersistenceManager extends EventEmitter {
    private persistenceRules;
    private storageAdapters;
    private persistenceQueue;
    private isProcessing;
    private metrics;
    private backupStorage;
    private debounceTimers;
    private snapshotIntervals;
    constructor();
    private initializeStorageAdapters;
    private getFallbackAdapter;
    private parseTimeString;
    private compress;
    private decompress;
    private encrypt;
    private decrypt;
    private appendData;
}
//# sourceMappingURL=StatePersistenceManager.d.ts.map