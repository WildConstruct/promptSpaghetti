/**
 * Extension Point Registry - Epic 8.4 Story 8.4.1
 * Central registry for all extension points in the Prompt Spaghetti system
 */
import { z } from 'zod';
export declare enum ExtensionPointCategory {
    RUNTIME = "runtime",
    UI = "ui",
    SCHEMA = "schema",
    API = "api",
    STATE = "state",
    VALIDATION = "validation",
    VISUALIZATION = "visualization",
    STORAGE = "storage",
    export,
    enum,
    ExtensionPointLifecycle
}
export type ExtensionPoint = z.infer<typeof ExtensionPointSchema>;
/**
 * Extension Point Registry - manages all extension points
 */
export declare class ExtensionPointRegistry {
    [x: number]: number;
    private static instance;
    private extensionPoints;
    private categoryIndex;
    private locationIndex;
    private constructor();
    static getInstance(): ExtensionPointRegistry;
    /**
     * Register an extension point
     */
    register(extensionPoint: ExtensionPoint): void;
    /**
     * Get extension point by ID
     */
    get(id: string): ExtensionPoint | undefined;
    /**
     * Get all extension points
     */
    getAll(): ExtensionPoint;
    /**
     * Get extension points by category
     */
    getByCategory(category: ExtensionPointCategory): ExtensionPoint;
    /**
     * Get extension points by priority
     */
    getByPriority(priority: ExtensionPointPriority): ExtensionPoint;
    /**
     * Get extension points by lifecycle status
     */
    getByLifecycle(lifecycle: ExtensionPointLifecycle): ExtensionPoint;
    /**
     * Get extension points by file location
     */
    getByLocation(file: string): ExtensionPoint;
    /**
     * Search extension points
     */
    search(query: string): ExtensionPoint;
    /**
     * Get extension point statistics
     */
    getStatistics(): {
        total: number;
        byCategory: Record<ExtensionPointCategory, number>;
        byPriority: Record<ExtensionPointPriority, number>;
        byLifecycle: Record<ExtensionPointLifecycle, number>;
    };
    const stats: {
        total: number;
        byCategory: Record<ExtensionPointCategory, number>;
        byPriority: Record<ExtensionPointPriority, number>;
        byLifecycle: Record<ExtensionPointLifecycle, number>;
    };
    Object: any;
    values(ExtensionPointCategory: any): any;
    forEach(cat: any, {}: {}): any;
    stats: {
        total: number;
        byCategory: Record<ExtensionPointCategory, number>;
        byPriority: Record<ExtensionPointPriority, number>;
        byLifecycle: Record<ExtensionPointLifecycle, number>;
    };
    byCategory: any;
}
//# sourceMappingURL=ExtensionPointRegistry.d.ts.map