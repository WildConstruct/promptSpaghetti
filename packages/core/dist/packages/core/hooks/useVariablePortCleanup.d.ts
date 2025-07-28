import { Edge } from 'reactflow';
interface VariablePortCleanupOptions {
    /**
     * Whether to enable automatic cleanup of orphaned edges
     * @default true
     */
    enabled?: boolean;
    /**
     * Debounce time in milliseconds before performing cleanup
     * @default 100
     */
    debounceMs?: number;
    /**
     * Whether to attempt connection migration when variable names are similar
     * @default false
     */
    enableMigration?: boolean;
    /**
     * Minimum similarity score for connection migration (0-1)
     * @default 0.8
     */
    migrationThreshold?: number;
    /**
     * Custom callback when edges are cleaned up
     */
    onEdgesCleanedUp?: (cleanedEdges: Edge) => void;
}
/**
 * Hook for managing orphaned edge cleanup when variable ports change dynamically
 */
export declare const useVariablePortCleanup: (options?: VariablePortCleanupOptions) => number;
export {};
//# sourceMappingURL=useVariablePortCleanup.d.ts.map