/**
 * Persistence utilities for localStorage with compression and validation
 */
import { z } from 'zod';
export declare const STORAGE_KEY = "promptgraph:state:v1";
export declare const STORAGE_VERSION = 1;
export declare const COMPRESSION_THRESHOLD: number;
export declare const MAX_STORAGE_SIZE: number;
export declare const PersistedStateSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodUnknown, "many">;
    edges: z.ZodArray<z.ZodUnknown, "many">;
    viewport: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        zoom: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x?: number;
        y?: number;
        zoom?: number;
    }, {
        x?: number;
        y?: number;
        zoom?: number;
    }>>;
    lastModified: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nodes?: unknown[];
    edges?: unknown[];
    viewport?: {
        x?: number;
        y?: number;
        zoom?: number;
    };
    lastModified?: string;
}, {
    nodes?: unknown[];
    edges?: unknown[];
    viewport?: {
        x?: number;
        y?: number;
        zoom?: number;
    };
    lastModified?: string;
}>;
export type PersistedState = z.infer<typeof PersistedStateSchema>;
export interface StorageWrapper {
    state: string;
    version: number;
    timestamp: number;
    compressed: boolean;
    size: number;
}
/**
 * Check if localStorage is available and has space
 */
export declare function isStorageAvailable(): boolean;
/**
 * Get storage size for a key
 */
export declare function getStorageSize(key: string): number;
/**
 * Check if we're approaching storage quota
 */
export declare function checkStorageQuota(): {
    used: number;
    available: boolean;
    percentage: number;
};
/**
 * Compress data if it's above threshold
 */
export declare function maybeCompress(data: string): {
    data: string;
    compressed: boolean;
};
/**
 * Decompress data if needed
 */
export declare function maybeDecompress(data: string, compressed: boolean): string;
/**
 * Validate persisted state
 */
export declare function validatePersistedState(data: unknown): PersistedState | null;
/**
 * Storage adapter for Zustand persist
 */
export declare const persistenceStorage: {
    getItem: (name: string) => string | null;
    setItem: (name: string, value: string) => void;
    removeItem: (name: string) => void;
};
/**
 * Clear persisted state
 */
export declare function clearPersistedState(): void;
/**
 * Get persisted state info (for debugging)
 */
export declare function getPersistedStateInfo(): {
    exists: boolean;
    size: number;
    compressed: boolean;
    timestamp: number | null;
} | null;
//# sourceMappingURL=persistenceUtils.d.ts.map