/**
 * Persistence utilities for localStorage with compression and validation
 */

import { compress, decompress } from 'lz-string';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';

// Storage configuration
export const STORAGE_KEY = 'promptgraph:state:v1';
export const STORAGE_VERSION = 1;
export const COMPRESSION_THRESHOLD = 100 * 1024; // 100KB
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Persisted state schema for validation
export const PersistedStateSchema = z.object({
  nodes: z.array(z.any()), // Using any for now, could be more specific
  edges: z.array(z.any()),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number()
  }).optional(),
  lastModified: z.string().optional()
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;

// Storage wrapper with versioning and compression
export interface StorageWrapper {
  state: string; // Compressed or uncompressed JSON
  version: number;
  timestamp: number;
  compressed: boolean;
  size: number;
}

/**
 * Check if localStorage is available and has space
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size for a key
 */
export function getStorageSize(key: string): number {
  const item = localStorage.getItem(key);
  if (!item) return 0;
  return new Blob([item]).size;
}

/**
 * Check if we're approaching storage quota
 */
export function checkStorageQuota(): { used: number; available: boolean; percentage: number } {
  let totalSize = 0;
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    const percentage = (totalSize / MAX_STORAGE_SIZE) * 100;
    
    return {
      used: totalSize,
      available: totalSize < MAX_STORAGE_SIZE * 0.9, // 90% threshold
      percentage
    };
  } catch {
    return { used: 0, available: false, percentage: 100 };
  }
}

/**
 * Compress data if it's above threshold
 */
export function maybeCompress(data: string): { data: string; compressed: boolean } {
  const size = new Blob([data]).size;
  
  if (size > COMPRESSION_THRESHOLD) {
    const compressed = compress(data);
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
export function maybeDecompress(data: string, compressed: boolean): string {
  if (compressed) {
    try {
      return decompress(data) || data;
    } catch {
      console.error('Failed to decompress data');
      return data;
    }
  }
  return data;
}

/**
 * Validate persisted state
 */
export function validatePersistedState(data: unknown): PersistedState | null {
  try {
    return PersistedStateSchema.parse(data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation error for persisted state:', error);
    }
    return null;
  }
}

/**
 * Storage adapter for Zustand persist
 */
export const persistenceStorage = {
  getItem: (name: string): string | null => {
    if (!isStorageAvailable()) return null;
    
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;
      
      const wrapper: StorageWrapper = JSON.parse(item);
      
      // Check version compatibility
      if (wrapper.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch. Expected ${STORAGE_VERSION}, got ${wrapper.version}`);
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
    } catch (error) {
      console.error('Error loading persisted state:', error);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    if (!isStorageAvailable()) return;
    
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
      const wrapper: StorageWrapper = {
        state: data,
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        compressed,
        size: new Blob([data]).size
      };
      
      localStorage.setItem(name, JSON.stringify(wrapper));
    } catch (error) {
      console.error('Error saving state:', error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
            detail: { error: error.message }
          }));
        }
      }
    }
  },
  
  removeItem: (name: string): void => {
    if (!isStorageAvailable()) return;
    localStorage.removeItem(name);
  }
};

/**
 * Clear persisted state
 */
export function clearPersistedState(): void {
  if (isStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get persisted state info (for debugging)
 */
export function getPersistedStateInfo(): {
  exists: boolean;
  size: number;
  compressed: boolean;
  timestamp: number | null;
} | null {
  if (!isStorageAvailable()) return null;
  
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return { exists: false, size: 0, compressed: false, timestamp: null };
    
    const wrapper: StorageWrapper = JSON.parse(item);
    return {
      exists: true,
      size: wrapper.size,
      compressed: wrapper.compressed,
      timestamp: wrapper.timestamp
    };
  } catch {
    return null;
  }
}