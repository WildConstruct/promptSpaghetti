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
}
export declare enum ExtensionPointLifecycle {
    EXPERIMENTAL = "experimental",
    STABLE = "stable",
    DEPRECATED = "deprecated",
    REMOVED = "removed"
}
export declare enum ExtensionPointPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare const ExtensionPointSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodNativeEnum<typeof ExtensionPointCategory>;
    priority: z.ZodNativeEnum<typeof ExtensionPointPriority>;
    lifecycle: z.ZodNativeEnum<typeof ExtensionPointLifecycle>;
    version: z.ZodString;
    location: z.ZodObject<{
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
    interfaces: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodString;
            required: z.ZodBoolean;
            description: z.ZodString;
            defaultValue: z.ZodOptional<z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }, {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }>, "many">;
        returnType: z.ZodString;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        parameters: {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }[];
        description: string;
        returnType: string;
        examples?: string[] | undefined;
    }, {
        name: string;
        parameters: {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }[];
        description: string;
        returnType: string;
        examples?: string[] | undefined;
    }>, "many">;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        code: z.ZodString;
        language: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        name: string;
        description: string;
        language: string;
    }, {
        code: string;
        name: string;
        description: string;
        language: string;
    }>, "many">>;
    constraints: z.ZodOptional<z.ZodObject<{
        performance: z.ZodOptional<z.ZodObject<{
            maxExecutionTime: z.ZodOptional<z.ZodNumber>;
            maxMemoryUsage: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        }, {
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        }>>;
        security: z.ZodOptional<z.ZodObject<{
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
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    }, {
        performance?: {
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    }>>;
    metadata: z.ZodObject<{
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
    metadata: {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    };
    category: ExtensionPointCategory;
    version: string;
    priority: ExtensionPointPriority;
    location: {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    };
    lifecycle: ExtensionPointLifecycle;
    interfaces: {
        name: string;
        parameters: {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }[];
        description: string;
        returnType: string;
        examples?: string[] | undefined;
    }[];
    constraints?: {
        performance?: {
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
    examples?: {
        code: string;
        name: string;
        description: string;
        language: string;
    }[] | undefined;
}, {
    id: string;
    name: string;
    description: string;
    metadata: {
        addedIn: string;
        deprecatedIn?: string | undefined;
        removedIn?: string | undefined;
        replacedBy?: string | undefined;
    };
    category: ExtensionPointCategory;
    version: string;
    priority: ExtensionPointPriority;
    location: {
        file: string;
        function?: string | undefined;
        line?: number | undefined;
    };
    lifecycle: ExtensionPointLifecycle;
    interfaces: {
        name: string;
        parameters: {
            type: string;
            name: string;
            required: boolean;
            description: string;
            defaultValue?: any;
        }[];
        description: string;
        returnType: string;
        examples?: string[] | undefined;
    }[];
    constraints?: {
        performance?: {
            maxMemoryUsage?: number | undefined;
            maxExecutionTime?: number | undefined;
        } | undefined;
        security?: {
            permissions?: string[] | undefined;
            sandboxed?: boolean | undefined;
        } | undefined;
    } | undefined;
    dependencies?: string[] | undefined;
    examples?: {
        code: string;
        name: string;
        description: string;
        language: string;
    }[] | undefined;
}>;
export type ExtensionPoint = z.infer<typeof ExtensionPointSchema>;
export declare class ExtensionPointRegistry {
    private static instance;
    private extensionPoints;
    private categoryIndex;
    private locationIndex;
    private constructor();
    static getInstance(): ExtensionPointRegistry;
    register(extensionPoint: ExtensionPoint): void;
    get(id: string): ExtensionPoint | undefined;
    getAll(): ExtensionPoint[];
    getByCategory(category: ExtensionPointCategory): ExtensionPoint[];
    getByPriority(priority: ExtensionPointPriority): ExtensionPoint[];
    getByLifecycle(lifecycle: ExtensionPointLifecycle): ExtensionPoint[];
    getByLocation(file: string): ExtensionPoint[];
    search(query: string): ExtensionPoint[];
    getStatistics(): {
        total: number;
        byCategory: Record<ExtensionPointCategory, number>;
        byPriority: Record<ExtensionPointPriority, number>;
        byLifecycle: Record<ExtensionPointLifecycle, number>;
    };
    validateCompatibility(extensionPointId: string, version: string): {
        compatible: boolean;
        warnings: string[];
        errors: string[];
    };
    private initializeRegistry;
    private compareVersions;
}
export declare const extensionPointRegistry: ExtensionPointRegistry;
//# sourceMappingURL=ExtensionPointRegistry.d.ts.map