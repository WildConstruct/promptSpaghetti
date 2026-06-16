"use strict";
/**
 * Persistence utilities for localStorage with compression and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistenceStorage = exports.PersistedStateSchema = exports.MAX_STORAGE_SIZE = exports.COMPRESSION_THRESHOLD = exports.STORAGE_VERSION = exports.STORAGE_KEY = void 0;
exports.isStorageAvailable = isStorageAvailable;
exports.getStorageSize = getStorageSize;
exports.checkStorageQuota = checkStorageQuota;
exports.maybeCompress = maybeCompress;
exports.maybeDecompress = maybeDecompress;
exports.validatePersistedState = validatePersistedState;
exports.clearPersistedState = clearPersistedState;
exports.getPersistedStateInfo = getPersistedStateInfo;
const lz_string_1 = require("lz-string");
const zod_1 = require("zod");
// Storage configuration
exports.STORAGE_KEY = 'promptgraph:state:v1';
exports.STORAGE_VERSION = 1;
exports.COMPRESSION_THRESHOLD = 100 * 1024; // 100KB
exports.MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
// Persisted state schema for validation
exports.PersistedStateSchema = zod_1.z.object({
    nodes: zod_1.z.array(zod_1.z.unknown()),
    edges: zod_1.z.array(zod_1.z.unknown()),
    viewport: zod_1.z
        .object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        zoom: zod_1.z.number()
    })
        .optional(),
    lastModified: zod_1.z.string().optional()
});
/**
 * Check if localStorage is available and has space
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get storage size for a key
 */
function getStorageSize(key) {
    const item = localStorage.getItem(key);
    if (!item) {
        return 0;
    }
    return new Blob([item]).size;
}
/**
 * Check if we're approaching storage quota
 */
function checkStorageQuota() {
    let totalSize = 0;
    try {
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        const percentage = (totalSize / exports.MAX_STORAGE_SIZE) * 100;
        return {
            used: totalSize,
            available: totalSize < exports.MAX_STORAGE_SIZE * 0.9, // 90% threshold
            percentage
        };
    }
    catch {
        return { used: 0, available: false, percentage: 100 };
    }
}
/**
 * Compress data if it's above threshold
 */
function maybeCompress(data) {
    const size = new Blob([data]).size;
    if (size > exports.COMPRESSION_THRESHOLD) {
        const compressed = (0, lz_string_1.compress)(data);
        // Only use compression if it actually reduces size
        const compressedSize = new Blob([compressed]).size;
        if (compressedSize < size * 0.9) {
            return { data: compressed, compressed: true };
        }
    }
    return { data, compressed: false };
}
/**
 * Decompress data if needed
 */
function maybeDecompress(data, compressed) {
    if (compressed) {
        try {
            return (0, lz_string_1.decompress)(data) || data;
        }
        catch {
            console.error('Failed to decompress data');
            return data;
        }
    }
    return data;
}
/**
 * Validate persisted state
 */
function validatePersistedState(data) {
    try {
        return exports.PersistedStateSchema.parse(data);
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Validation error for persisted state:', error);
        }
        return null;
    }
}
/**
 * Storage adapter for Zustand persist
 */
exports.persistenceStorage = {
    getItem: (name) => {
        if (!isStorageAvailable()) {
            return null;
        }
        try {
            const item = localStorage.getItem(name);
            if (!item) {
                return null;
            }
            const wrapper = JSON.parse(item);
            // Check version compatibility
            if (wrapper.version !== exports.STORAGE_VERSION) {
                console.warn(`Storage version mismatch. Expected ${exports.STORAGE_VERSION}, got ${wrapper.version}`);
                // In the future, we could add migration logic here
                return null;
            }
            // Decompress if needed
            const decompressed = maybeDecompress(wrapper.state, wrapper.compressed);
            // Validate the data
            const parsed = JSON.parse(decompressed);
            const validated = validatePersistedState(parsed);
            if (!validated) {
                console.error('Invalid persisted state, falling back to default');
                return null;
            }
            return decompressed;
        }
        catch (error) {
            console.error('Error loading persisted state:', error);
            return null;
        }
    },
    setItem: (name, value) => {
        if (!isStorageAvailable()) {
            return;
        }
        try {
            // Check storage quota
            const quota = checkStorageQuota();
            if (!quota.available) {
                console.error('Storage quota exceeded');
                // Notify user
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
                        detail: { used: quota.used, percentage: quota.percentage }
                    }));
                }
                return;
            }
            // Compress if needed
            const { data, compressed } = maybeCompress(value);
            // Create wrapper
            const wrapper = {
                state: data,
                version: exports.STORAGE_VERSION,
                timestamp: Date.now(),
                compressed,
                size: new Blob([data]).size
            };
            localStorage.setItem(name, JSON.stringify(wrapper));
        }
        catch (error) {
            console.error('Error saving state:', error);
            // Handle quota exceeded error
            if (error instanceof DOMException &&
                error.name === 'QuotaExceededError') {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
                        detail: { error: error.message }
                    }));
                }
            }
        }
    },
    removeItem: (name) => {
        if (!isStorageAvailable()) {
            return;
        }
        localStorage.removeItem(name);
    }
};
/**
 * Clear persisted state
 */
function clearPersistedState() {
    if (isStorageAvailable()) {
        localStorage.removeItem(exports.STORAGE_KEY);
    }
}
/**
 * Get persisted state info (for debugging)
 */
function getPersistedStateInfo() {
    if (!isStorageAvailable()) {
        return null;
    }
    try {
        const item = localStorage.getItem(exports.STORAGE_KEY);
        if (!item) {
            return { exists: false, size: 0, compressed: false, timestamp: null };
        }
        const wrapper = JSON.parse(item);
        return {
            exists: true,
            size: wrapper.size,
            compressed: wrapper.compressed,
            timestamp: wrapper.timestamp
        };
    }
    catch {
        return null;
    }
}
