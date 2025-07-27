/**
 * State Persistence Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 3: Performance-Optimized State
 *
 * Intelligent persistence strategies per domain with performance optimization
 */
import { EventEmitter } from 'events';
// Main persistence manager
export class StatePersistenceManager extends EventEmitter {
    persistenceRules = new Map();
    storageAdapters = new Map();
    persistenceQueue = [];
    isProcessing = false;
    metrics;
    backupStorage = new Map();
    debounceTimers = new Map();
    snapshotIntervals = new Map();
    constructor() {
        super();
        this.metrics = {
            totalWrites: 0,
            totalReads: 0,
            writeLatency: [],
            readLatency: [],
            failureCount: 0,
            retryCount: 0,
            compressionRatio: 0,
            storageUsage: new Map(),
            lastBackup: 0,
            dataCorruption: 0,
            recoveryTime: []
        };
        this.initializeStorageAdapters();
        this.configureDomainPersistence();
        this.setupCleanupRoutines();
    }
    // Domain persistence configuration
    configureDomainPersistence() {
        // Graph Editor: Immediate persistence for data integrity
        this.persistenceRules.set('graph-editor', {
            strategy: 'IMMEDIATE',
            storage: 'INDEXED_DB',
            compression: true,
            encryption: false,
            conflictResolution: 'operational_transform',
            retryAttempts: 3,
            retryDelay: 1000,
            auditTrail: true,
            validateOnLoad: true,
            backup: {
                enabled: true,
                interval: '1h',
                maxBackups: 24,
                compression: true
            }
        });
        // Admin Dashboard: Debounced updates for performance
        this.persistenceRules.set('admin-dashboard', {
            strategy: 'DEBOUNCED',
            debounceMs: 1000,
            storage: 'LOCAL_STORAGE',
            ttl: '24h',
            maxSize: '10MB',
            compression: true,
            encryption: false,
            retryAttempts: 2,
            validateOnLoad: true,
            backup: {
                enabled: true,
                interval: '6h',
                maxBackups: 4
            }
        });
        // Security: Append-only with server sync
        this.persistenceRules.set('security', {
            strategy: 'APPEND_ONLY',
            storage: 'SERVER_SYNC',
            encryption: true,
            auditTrail: true,
            retention: '7_years',
            retryAttempts: 5,
            retryDelay: 2000,
            priority: 'critical',
            conflictResolution: 'manual',
            backup: {
                enabled: true,
                interval: '1h',
                maxBackups: 168, // 1 week of hourly backups
                compression: true
            }
        });
        // Runtime: In-memory with periodic snapshots
        this.persistenceRules.set('runtime', {
            strategy: 'SNAPSHOT',
            interval: '5_minutes',
            storage: 'MEMORY',
            persistOnShutdown: true,
            compression: false,
            retryAttempts: 1,
            backup: {
                enabled: false
            }
        });
        // Performance: Batch updates for analytics
        this.persistenceRules.set('performance', {
            strategy: 'BATCH',
            batchSize: 100,
            debounceMs: 5000,
            storage: 'INDEXED_DB',
            compression: true,
            ttl: '30d',
            backup: {
                enabled: true,
                interval: '24h',
                maxBackups: 7
            }
        });
    }
    // Persistence operations
    async persist(domain, data, options = {}) {
        const rule = this.persistenceRules.get(domain);
        if (!rule) {
            throw new Error(`No persistence rule configured for domain: ${domain}`);
        }
        const { key = domain, immediate = false, metadata = {} } = options;
        // Handle immediate override
        const strategy = immediate ? 'IMMEDIATE' : rule.strategy;
        const task = {
            id: this.generateTaskId(),
            domain,
            data,
            timestamp: Date.now(),
            strategy,
            storage: rule.storage,
            priority: rule.priority || 'normal',
            retryCount: 0,
            maxRetries: rule.retryAttempts || 3,
            metadata: { ...metadata, key }
        };
        await this.enqueuePersistenceTask(task);
    }
    async load(domain, key) {
        const rule = this.persistenceRules.get(domain);
        if (!rule) {
            throw new Error(`No persistence rule configured for domain: ${domain}`);
        }
        const adapter = this.storageAdapters.get(rule.storage);
        if (!adapter) {
            throw new Error(`Storage adapter not available: ${rule.storage}`);
        }
        const storageKey = key || domain;
        const startTime = performance.now();
        try {
            let data = await adapter.read(storageKey);
            // Decompress if needed
            if (rule.compression && data) {
                data = await this.decompress(data);
            }
            // Decrypt if needed
            if (rule.encryption && data) {
                data = await this.decrypt(data);
            }
            // Validate if configured
            if (rule.validateOnLoad && data) {
                await this.validateData(domain, data);
            }
            this.metrics.totalReads++;
            const latency = performance.now() - startTime;
            this.metrics.readLatency.push(latency);
            this.emit('dataLoaded', { domain, key: storageKey, size: JSON.stringify(data).length });
            return data;
        }
        catch (error) {
            this.metrics.failureCount++;
            // Try to recover from backup
            if (rule.backup?.enabled) {
                const backupData = await this.loadFromBackup(domain, key);
                if (backupData) {
                    this.emit('dataRecovered', { domain, key: storageKey, source: 'backup' });
                    return backupData;
                }
            }
            throw new Error(`Failed to load data for ${domain}: ${error.message}`);
        }
    }
    async clear(domain, key) {
        const rule = this.persistenceRules.get(domain);
        if (!rule) {
            throw new Error(`No persistence rule configured for domain: ${domain}`);
        }
        const adapter = this.storageAdapters.get(rule.storage);
        if (!adapter) {
            throw new Error(`Storage adapter not available: ${rule.storage}`);
        }
        const storageKey = key || domain;
        await adapter.delete(storageKey);
        this.emit('dataCleared', { domain, key: storageKey });
    }
    // Task queue management
    async enqueuePersistenceTask(task) {
        switch (task.strategy) {
            case 'IMMEDIATE':
                await this.executeTask(task);
                break;
            case 'DEBOUNCED':
                this.scheduleDebouncedTask(task);
                break;
            case 'BATCH':
                this.enqueueBatchTask(task);
                break;
            case 'SNAPSHOT':
                this.scheduleSnapshotTask(task);
                break;
            case 'APPEND_ONLY':
                task.metadata = { ...task.metadata, append: true };
                await this.executeTask(task);
                break;
            case 'MANUAL':
                this.persistenceQueue.push(task);
                break;
            default:
                throw new Error(`Unknown persistence strategy: ${task.strategy}`);
        }
    }
    scheduleDebouncedTask(task) {
        const rule = this.persistenceRules.get(task.domain);
        const debounceKey = `${task.domain}-${task.metadata?.key || task.domain}`;
        // Clear existing timer
        if (this.debounceTimers.has(debounceKey)) {
            clearTimeout(this.debounceTimers.get(debounceKey));
        }
        // Schedule new timer
        const timer = setTimeout(async () => {
            await this.executeTask(task);
            this.debounceTimers.delete(debounceKey);
        }, rule.debounceMs || 1000);
        this.debounceTimers.set(debounceKey, timer);
    }
    enqueueBatchTask(task) {
        this.persistenceQueue.push(task);
        this.scheduleProcessing();
    }
    scheduleSnapshotTask(task) {
        const rule = this.persistenceRules.get(task.domain);
        const intervalMs = this.parseTimeString(rule.interval || '5m');
        const snapshotKey = task.domain;
        if (!this.snapshotIntervals.has(snapshotKey)) {
            const interval = setInterval(async () => {
                // Get current state for snapshot
                const currentData = await this.getCurrentDomainState(task.domain);
                if (currentData) {
                    const snapshotTask = { ...task, data: currentData, timestamp: Date.now() };
                    await this.executeTask(snapshotTask);
                }
            }, intervalMs);
            this.snapshotIntervals.set(snapshotKey, interval);
        }
    }
    scheduleProcessing() {
        if (this.isProcessing)
            return;
        // Process batches based on strategy
        setTimeout(async () => {
            await this.processBatchQueue();
        }, 100);
    }
    async processBatchQueue() {
        if (this.isProcessing || this.persistenceQueue.length === 0)
            return;
        this.isProcessing = true;
        try {
            // Group tasks by domain and batch strategy
            const batchGroups = this.groupTasksByDomain(this.persistenceQueue);
            for (const [domain, tasks] of batchGroups) {
                const rule = this.persistenceRules.get(domain);
                if (!rule)
                    continue;
                if (rule.strategy === 'BATCH') {
                    const batchSize = rule.batchSize || 100;
                    for (let i = 0; i < tasks.length; i += batchSize) {
                        const batch = tasks.slice(i, i + batchSize);
                        await this.executeBatch(domain, batch);
                    }
                }
                else {
                    // Execute individually
                    for (const task of tasks) {
                        await this.executeTask(task);
                    }
                }
            }
            this.persistenceQueue = [];
        }
        finally {
            this.isProcessing = false;
        }
    }
    groupTasksByDomain(tasks) {
        const groups = new Map();
        tasks.forEach(task => {
            if (!groups.has(task.domain)) {
                groups.set(task.domain, []);
            }
            groups.get(task.domain).push(task);
        });
        return groups;
    }
    async executeBatch(domain, tasks) {
        const rule = this.persistenceRules.get(domain);
        const adapter = this.storageAdapters.get(rule.storage);
        if (!adapter) {
            throw new Error(`Storage adapter not available: ${rule.storage}`);
        }
        // Combine batch data
        const batchData = {
            batch: true,
            timestamp: Date.now(),
            items: tasks.map(task => ({
                key: task.metadata?.key || task.domain,
                data: task.data,
                timestamp: task.timestamp,
                metadata: task.metadata
            }))
        };
        const batchTask = {
            id: this.generateTaskId(),
            domain,
            data: batchData,
            timestamp: Date.now(),
            strategy: 'BATCH',
            storage: rule.storage,
            priority: 'normal',
            retryCount: 0,
            maxRetries: rule.retryAttempts || 3,
            metadata: { batch: true, count: tasks.length }
        };
        await this.executeTask(batchTask);
    }
    // Task execution
    async executeTask(task) {
        const rule = this.persistenceRules.get(task.domain);
        const adapter = this.storageAdapters.get(task.storage);
        if (!adapter || !adapter.isAvailable()) {
            // Try fallback storage
            const fallbackAdapter = this.getFallbackAdapter(task.storage);
            if (!fallbackAdapter) {
                throw new Error(`No available storage adapter for: ${task.storage}`);
            }
            await this.executeTaskWithAdapter(task, rule, fallbackAdapter);
            return;
        }
        await this.executeTaskWithAdapter(task, rule, adapter);
    }
    async executeTaskWithAdapter(task, rule, adapter) {
        const startTime = performance.now();
        const storageKey = task.metadata?.key || task.domain;
        try {
            let data = task.data;
            // Compress if configured
            if (rule.compression) {
                data = await this.compress(data);
                this.updateCompressionMetrics(task.data, data);
            }
            // Encrypt if configured
            if (rule.encryption) {
                data = await this.encrypt(data);
            }
            // Handle append-only strategy
            if (task.metadata?.append) {
                const existing = await adapter.read(storageKey).catch(() => null);
                if (existing) {
                    data = this.appendData(existing, data);
                }
            }
            // Write to storage
            await adapter.write(storageKey, data, {
                ttl: rule.ttl ? this.parseTimeString(rule.ttl) : undefined,
                priority: task.priority
            });
            // Create backup if configured
            if (rule.backup?.enabled) {
                await this.createBackup(task.domain, storageKey, data);
            }
            // Update metrics
            this.metrics.totalWrites++;
            const latency = performance.now() - startTime;
            this.metrics.writeLatency.push(latency);
            // Update storage usage
            const dataSize = JSON.stringify(data).length;
            const currentUsage = this.metrics.storageUsage.get(task.storage) || 0;
            this.metrics.storageUsage.set(task.storage, currentUsage + dataSize);
            this.emit('dataPersisted', {
                domain: task.domain,
                key: storageKey,
                size: dataSize,
                latency,
                storage: task.storage
            });
        }
        catch (error) {
            this.metrics.failureCount++;
            // Retry if configured
            if (task.retryCount < task.maxRetries) {
                task.retryCount++;
                this.metrics.retryCount++;
                const delay = rule.retryDelay || 1000;
                setTimeout(() => {
                    this.executeTask(task);
                }, delay * Math.pow(2, task.retryCount - 1)); // Exponential backoff
                return;
            }
            this.emit('persistenceError', {
                domain: task.domain,
                error: error.message,
                task: task.id
            });
            throw error;
        }
    }
    // Storage adapters
    initializeStorageAdapters() {
        // Local Storage adapter
        this.storageAdapters.set('LOCAL_STORAGE', {
            name: 'LOCAL_STORAGE',
            isAvailable: () => typeof localStorage !== 'undefined',
            read: async (key) => {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            },
            write: async (key, data) => {
                localStorage.setItem(key, JSON.stringify(data));
            },
            delete: async (key) => {
                localStorage.removeItem(key);
            },
            clear: async () => {
                localStorage.clear();
            },
            size: async () => {
                return JSON.stringify(localStorage).length;
            },
            keys: async () => {
                return Object.keys(localStorage);
            },
            supports: (feature) => {
                return ['compression', 'ttl'].includes(feature);
            }
        });
        // IndexedDB adapter
        this.storageAdapters.set('INDEXED_DB', {
            name: 'INDEXED_DB',
            isAvailable: () => typeof indexedDB !== 'undefined',
            read: async (key) => {
                // Simplified IndexedDB implementation
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('StateDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        const db = request.result;
                        const transaction = db.transaction(['state'], 'readonly');
                        const store = transaction.objectStore('state');
                        const getRequest = store.get(key);
                        getRequest.onsuccess = () => resolve(getRequest.result?.data || null);
                        getRequest.onerror = () => reject(getRequest.error);
                    };
                    request.onupgradeneeded = () => {
                        const db = request.result;
                        if (!db.objectStoreNames.contains('state')) {
                            db.createObjectStore('state', { keyPath: 'key' });
                        }
                    };
                });
            },
            write: async (key, data) => {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('StateDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        const db = request.result;
                        const transaction = db.transaction(['state'], 'readwrite');
                        const store = transaction.objectStore('state');
                        const putRequest = store.put({ key, data, timestamp: Date.now() });
                        putRequest.onsuccess = () => resolve();
                        putRequest.onerror = () => reject(putRequest.error);
                    };
                });
            },
            delete: async (key) => {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('StateDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        const db = request.result;
                        const transaction = db.transaction(['state'], 'readwrite');
                        const store = transaction.objectStore('state');
                        const deleteRequest = store.delete(key);
                        deleteRequest.onsuccess = () => resolve();
                        deleteRequest.onerror = () => reject(deleteRequest.error);
                    };
                });
            },
            clear: async () => {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('StateDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        const db = request.result;
                        const transaction = db.transaction(['state'], 'readwrite');
                        const store = transaction.objectStore('state');
                        const clearRequest = store.clear();
                        clearRequest.onsuccess = () => resolve();
                        clearRequest.onerror = () => reject(clearRequest.error);
                    };
                });
            },
            size: async () => {
                // Approximate size calculation
                return 0;
            },
            keys: async () => {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('StateDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        const db = request.result;
                        const transaction = db.transaction(['state'], 'readonly');
                        const store = transaction.objectStore('state');
                        const getAllKeysRequest = store.getAllKeys();
                        getAllKeysRequest.onsuccess = () => resolve(getAllKeysRequest.result);
                        getAllKeysRequest.onerror = () => reject(getAllKeysRequest.error);
                    };
                });
            },
            supports: (feature) => {
                return ['compression', 'encryption', 'large_data'].includes(feature);
            }
        });
        // Memory adapter
        const memoryStorage = new Map();
        this.storageAdapters.set('MEMORY', {
            name: 'MEMORY',
            isAvailable: () => true,
            read: async (key) => {
                return memoryStorage.get(key) || null;
            },
            write: async (key, data) => {
                memoryStorage.set(key, data);
            },
            delete: async (key) => {
                memoryStorage.delete(key);
            },
            clear: async () => {
                memoryStorage.clear();
            },
            size: async () => {
                return JSON.stringify(Array.from(memoryStorage.entries())).length;
            },
            keys: async () => {
                return Array.from(memoryStorage.keys());
            },
            supports: (feature) => {
                return ['fast_access'].includes(feature);
            }
        });
    }
    // Utility methods
    getFallbackAdapter(primary) {
        const fallbacks = {
            'INDEXED_DB': ['LOCAL_STORAGE', 'MEMORY'],
            'LOCAL_STORAGE': ['MEMORY'],
            'SERVER_SYNC': ['INDEXED_DB', 'LOCAL_STORAGE', 'MEMORY'],
            'WEB_WORKER': ['INDEXED_DB', 'LOCAL_STORAGE', 'MEMORY'],
            'OPFS': ['INDEXED_DB', 'LOCAL_STORAGE', 'MEMORY'],
            'MEMORY': []
        };
        for (const fallback of fallbacks[primary] || []) {
            const adapter = this.storageAdapters.get(fallback);
            if (adapter && adapter.isAvailable()) {
                return adapter;
            }
        }
        return null;
    }
    parseTimeString(timeStr) {
        const units = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000,
            'w': 7 * 24 * 60 * 60 * 1000,
            'y': 365 * 24 * 60 * 60 * 1000
        };
        const match = timeStr.match(/^(\d+)([smhdwy])$/);
        if (!match) {
            throw new Error(`Invalid time string: ${timeStr}`);
        }
        const [, amount, unit] = match;
        return parseInt(amount) * units[unit];
    }
    async compress(data) {
        // Simple compression (could use better algorithm)
        const json = JSON.stringify(data);
        if (typeof CompressionStream !== 'undefined') {
            // Use native compression if available
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            writer.write(new TextEncoder().encode(json));
            writer.close();
            const chunks = [];
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value)
                    chunks.push(value);
            }
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            return btoa(String.fromCharCode(...compressed));
        }
        else {
            // Fallback to simple compression
            return json.replace(/\s+/g, ' ').replace(/"/g, "'");
        }
    }
    async decompress(data) {
        try {
            if (typeof DecompressionStream !== 'undefined') {
                // Use native decompression if available
                const compressed = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                const stream = new DecompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                writer.write(compressed);
                writer.close();
                const chunks = [];
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value)
                        chunks.push(value);
                }
                const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    decompressed.set(chunk, offset);
                    offset += chunk.length;
                }
                const json = new TextDecoder().decode(decompressed);
                return JSON.parse(json);
            }
            else {
                // Fallback - assume simple compression
                const json = data.replace(/'/g, '"');
                return JSON.parse(json);
            }
        }
        catch (error) {
            // If decompression fails, try parsing as uncompressed
            return JSON.parse(data);
        }
    }
    async encrypt(data) {
        // Simplified encryption (in production, use proper crypto)
        const json = JSON.stringify(data);
        return btoa(json);
    }
    async decrypt(data) {
        // Simplified decryption (in production, use proper crypto)
        const json = atob(data);
        return JSON.parse(json);
    }
    appendData(existing, newData) {
        if (Array.isArray(existing)) {
            return [...existing, newData];
        }
        else if (typeof existing === 'object') {
            return {
                ...existing,
                [`entry_${Date.now()}`]: newData
            };
        }
        else {
            return [existing, newData];
        }
    }
    async validateData(domain, data) {
        // Basic validation - could be enhanced with schema validation
        if (data === null || data === undefined) {
            throw new Error(`Invalid data for domain ${domain}: null or undefined`);
        }
        // Check for data corruption
        try {
            JSON.stringify(data);
        }
        catch (error) {
            this.metrics.dataCorruption++;
            throw new Error(`Data corruption detected for domain ${domain}: ${error.message}`);
        }
    }
    async getCurrentDomainState(domain) {
        // This would integrate with the state containers to get current state
        // For now, return null as placeholder
        return null;
    }
    async createBackup(domain, key, data) {
        const rule = this.persistenceRules.get(domain);
        if (!rule.backup?.enabled)
            return;
        const backupKey = `${key}_backup_${Date.now()}`;
        const metadata = {
            timestamp: Date.now(),
            domain,
            size: JSON.stringify(data).length,
            checksum: this.generateChecksum(data),
            version: '1.0'
        };
        // Store backup metadata
        if (!this.backupStorage.has(domain)) {
            this.backupStorage.set(domain, []);
        }
        const backups = this.backupStorage.get(domain);
        backups.push(metadata);
        // Limit number of backups
        const maxBackups = rule.backup.maxBackups || 10;
        if (backups.length > maxBackups) {
            backups.splice(0, backups.length - maxBackups);
        }
        this.metrics.lastBackup = Date.now();
    }
    async loadFromBackup(domain, key) {
        const backups = this.backupStorage.get(domain);
        if (!backups || backups.length === 0)
            return null;
        // Get most recent backup
        const latestBackup = backups[backups.length - 1];
        const backupKey = `${key || domain}_backup_${latestBackup.timestamp}`;
        try {
            return await this.load(domain, backupKey);
        }
        catch (error) {
            return null;
        }
    }
    updateCompressionMetrics(original, compressed) {
        const originalSize = JSON.stringify(original).length;
        const compressedSize = typeof compressed === 'string' ? compressed.length : JSON.stringify(compressed).length;
        this.metrics.compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;
    }
    generateChecksum(data) {
        const json = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < json.length; i++) {
            const char = json.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setupCleanupRoutines() {
        // Clean up old data and metrics
        setInterval(() => {
            this.cleanupOldData();
            this.cleanupMetrics();
        }, 60000); // Every minute
        // Handle shutdown cleanup
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.handleShutdown();
            });
        }
    }
    cleanupOldData() {
        // Clean up expired data based on TTL rules
        for (const [domain, rule] of this.persistenceRules) {
            if (rule.ttl) {
                const maxAge = this.parseTimeString(rule.ttl);
                // Would clean up expired data from storage
            }
        }
    }
    cleanupMetrics() {
        // Keep only recent metrics
        if (this.metrics.writeLatency.length > 1000) {
            this.metrics.writeLatency = this.metrics.writeLatency.slice(-500);
        }
        if (this.metrics.readLatency.length > 1000) {
            this.metrics.readLatency = this.metrics.readLatency.slice(-500);
        }
    }
    handleShutdown() {
        // Persist data configured for shutdown persistence
        for (const [domain, rule] of this.persistenceRules) {
            if (rule.persistOnShutdown) {
                // Trigger immediate persistence
                const currentData = this.getCurrentDomainState(domain);
                if (currentData) {
                    this.persist(domain, currentData, { immediate: true });
                }
            }
        }
        // Clear intervals
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.snapshotIntervals.forEach(interval => clearInterval(interval));
    }
    // Public API methods
    getMetrics() {
        return {
            ...this.metrics,
            writeLatency: [...this.metrics.writeLatency],
            readLatency: [...this.metrics.readLatency],
            storageUsage: new Map(this.metrics.storageUsage)
        };
    }
    getDomainRules() {
        return new Map(this.persistenceRules);
    }
    getStorageStatus() {
        const status = new Map();
        for (const [backend, adapter] of this.storageAdapters) {
            status.set(backend, adapter.isAvailable());
        }
        return status;
    }
    async getStorageUsage() {
        const usage = new Map();
        for (const [backend, adapter] of this.storageAdapters) {
            if (adapter.isAvailable()) {
                try {
                    const size = await adapter.size();
                    usage.set(backend, size);
                }
                catch (error) {
                    usage.set(backend, 0);
                }
            }
        }
        return usage;
    }
    // Manual persistence control
    async flushDomain(domain) {
        const tasksToFlush = this.persistenceQueue.filter(task => task.domain === domain);
        for (const task of tasksToFlush) {
            await this.executeTask(task);
        }
        this.persistenceQueue = this.persistenceQueue.filter(task => task.domain !== domain);
    }
    async flushAll() {
        await this.processBatchQueue();
    }
    // Configuration updates
    updateDomainRule(domain, rule) {
        const existing = this.persistenceRules.get(domain) || {};
        this.persistenceRules.set(domain, { ...existing, ...rule });
    }
    removeDomainRule(domain) {
        this.persistenceRules.delete(domain);
        // Clear any pending timers
        this.debounceTimers.forEach((timer, key) => {
            if (key.startsWith(domain)) {
                clearTimeout(timer);
                this.debounceTimers.delete(key);
            }
        });
        this.snapshotIntervals.forEach((interval, key) => {
            if (key === domain) {
                clearInterval(interval);
                this.snapshotIntervals.delete(key);
            }
        });
    }
}
// Global persistence manager instance
export const globalPersistenceManager = new StatePersistenceManager();
