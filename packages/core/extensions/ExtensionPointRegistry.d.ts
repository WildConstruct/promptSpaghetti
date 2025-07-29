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
    STORAGE = "storage"

export declare enum ExtensionPointLifecycle {
    EXPERIMENTAL = "experimental",
    STABLE = "stable",
    DEPRECATED = "deprecated",
    REMOVED = "removed"

export declare enum ExtensionPointPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"

export declare const ExtensionPointSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodNativeEnum<typeof ExtensionPointCategory>;
    priority: z.ZodNativeEnum<typeof ExtensionPointPriority>;
    lifecycle: z.ZodNativeEnum<typeof ExtensionPointLifecycle>;
    version: z.ZodString;
    location: z.ZodObject<{,
        file: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        function: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    }, {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    }>;
    interfaces: z.ZodArray<z.ZodObject<{,
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodArray<z.ZodObject<{,
            name: z.ZodString;
            type: z.ZodString;
            required: z.ZodBoolean;
            description: z.ZodString;
            defaultValue: z.ZodOptional<z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }, {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }>, "many">;
        returnType: z.ZodString;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters: {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }[];
        returnType: string;
        examples?: string[] | undefined;
    }, {
        name: string;
        description: string;
        parameters: {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }[];
        returnType: string;
        examples?: string[] | undefined;
    }>, "many">;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{,
        name: z.ZodString;
        description: z.ZodString;
        code: z.ZodString;
        language: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        code: string;
        language: string;
    }, {
        name: string;
        description: string;
        code: string;
        language: string;
    }>, "many">>;
    constraints: z.ZodOptional<z.ZodObject<{,
        performance: z.ZodOptional<z.ZodObject<{,
            maxExecutionTime: z.ZodOptional<z.ZodNumber>;
            maxMemoryUsage: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        }, {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        }>>;
        security: z.ZodOptional<z.ZodObject<{,
            permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            sandboxed: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        }, {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        performance?: {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    }, {
        performance?: {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    }>>;
    metadata: z.ZodObject<{,
        addedIn: z.ZodString;
        deprecatedIn: z.ZodOptional<z.ZodString>;
        removedIn: z.ZodOptional<z.ZodString>;
        replacedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    }, {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    priority: ExtensionPointPriority;
    location: {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    };
    category: ExtensionPointCategory;
    version: string;
    metadata: {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    };
    lifecycle: ExtensionPointLifecycle;
    interfaces: {
        name: string;
        description: string;
        parameters: {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }[];
        returnType: string;
        examples?: string[] | undefined;
    }[];
    examples?: {
        name: string;
        description: string;
        code: string;
        language: string;
    }[] | undefined;
    constraints?: {
        performance?: {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
}, {
    id: string;
    name: string;
    description: string;
    priority: ExtensionPointPriority;
    location: {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    };
    category: ExtensionPointCategory;
    version: string;
    metadata: {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    };
    lifecycle: ExtensionPointLifecycle;
    interfaces: {
        name: string;
        description: string;
        parameters: {
            name: string;
            description: string;
            type: string;
            required: boolean;
            defaultValue?: any;
        }[];
        returnType: string;
        examples?: string[] | undefined;
    }[];
    examples?: {
        name: string;
        description: string;
        code: string;
        language: string;
    }[] | undefined;
    constraints?: {
        performance?: {
            maxExecutionTime?: number | undefined;
            maxMemoryUsage?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
}>;
export type ExtensionPoint = z.infer<typeof ExtensionPointSchema>;
/**
 * Extension Point Registry - manages all extension points
 */
export declare class ExtensionPointRegistry {
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
    getAll(): ExtensionPoint[];
    /**
     * Get extension points by category
     */
    getByCategory(category: ExtensionPointCategory): ExtensionPoint[];
    /**
     * Get extension points by priority
     */
    getByPriority(priority: ExtensionPointPriority): ExtensionPoint[];
    /**
     * Get extension points by lifecycle status
     */
    getByLifecycle(lifecycle: ExtensionPointLifecycle): ExtensionPoint[];
    /**
     * Get extension points by file location
     */
    getByLocation(file: string): ExtensionPoint[];
    /**
     * Search extension points
     */
    search(query: string): ExtensionPoint[];
    /**
     * Get extension point statistics
     */
    getStatistics(): {
        total: number;
        byCategory: Record<ExtensionPointCategory, number>;
        byPriority: Record<ExtensionPointPriority, number>;
        byLifecycle: Record<ExtensionPointLifecycle, number>;
    };
    /**
     * Validate extension point compatibility
     */
    validateCompatibility(extensionPointId: string, version: string): {
        compatible: boolean;
        warnings: string[];
        errors: string[];
    };
    /**
     * Initialize the registry with core extension points
     */
    private initializeRegistry;
    /**
     * Compare version strings
     */
    private compareVersions;

export declare const extensionPointRegistry: ExtensionPointRegistry;
//# sourceMappingURL=ExtensionPointRegistry.d.ts.map