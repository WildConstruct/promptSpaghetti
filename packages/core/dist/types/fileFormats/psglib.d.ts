/**
 * PSGLib File Format Implementation
 * Version 1.0.0 with PM requirements for analytics and future-proofing
 */
import { z } from 'zod';
export declare const PSGLibMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    author: z.ZodString;
    version: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    nodeTypes: z.ZodArray<z.ZodString, "many">;
    thumbnail: z.ZodOptional<z.ZodString>;
    lastModified: z.ZodString;
    license: z.ZodDefault<z.ZodEnum<["MIT", "CC-BY", "CC-BY-SA", "CC0", "proprietary", "custom"]>>;
    usageStats: z.ZodDefault<z.ZodObject<{
        timesUsed: z.ZodDefault<z.ZodNumber>;
        lastUsed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        popularity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timesUsed?: number;
        lastUsed?: string;
        popularity?: number;
    }, {
        timesUsed?: number;
        lastUsed?: string;
        popularity?: number;
    }>>;
    marketplace: z.ZodOptional<z.ZodObject<{
        price: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
        rating: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
        downloads: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        price?: number;
        rating?: number;
        downloads?: number;
    }, {
        price?: number;
        rating?: number;
        downloads?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    id?: string;
    version?: string;
    description?: string;
    tags?: string[];
    author?: string;
    lastModified?: string;
    nodeTypes?: string[];
    thumbnail?: string;
    license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
    usageStats?: {
        timesUsed?: number;
        lastUsed?: string;
        popularity?: number;
    };
    marketplace?: {
        price?: number;
        rating?: number;
        downloads?: number;
    };
}, {
    name?: string;
    id?: string;
    version?: string;
    description?: string;
    tags?: string[];
    author?: string;
    lastModified?: string;
    nodeTypes?: string[];
    thumbnail?: string;
    license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
    usageStats?: {
        timesUsed?: number;
        lastUsed?: string;
        popularity?: number;
    };
    marketplace?: {
        price?: number;
        rating?: number;
        downloads?: number;
    };
}>;
export declare const PSGLibNodeSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x?: number;
        y?: number;
    }, {
        x?: number;
        y?: number;
    }>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    size: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width?: number;
        height?: number;
    }, {
        width?: number;
        height?: number;
    }>>;
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    label: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    data?: Record<string, any>;
    id?: string;
    type?: string;
    label?: string;
    description?: string;
    tags?: string[];
    position?: {
        x?: number;
        y?: number;
    };
    size?: {
        width?: number;
        height?: number;
    };
    style?: Record<string, any>;
}, {
    data?: Record<string, any>;
    id?: string;
    type?: string;
    label?: string;
    description?: string;
    tags?: string[];
    position?: {
        x?: number;
        y?: number;
    };
    size?: {
        width?: number;
        height?: number;
    };
    style?: Record<string, any>;
}>;
export declare const PSGLibEdgeSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    target: z.ZodString;
    sourceHandle: z.ZodOptional<z.ZodString>;
    targetHandle: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    data?: Record<string, any>;
    id?: string;
    type?: string;
    source?: string;
    target?: string;
    sourceHandle?: string;
    targetHandle?: string;
}, {
    data?: Record<string, any>;
    id?: string;
    type?: string;
    source?: string;
    target?: string;
    sourceHandle?: string;
    targetHandle?: string;
}>;
export declare const PSGLibFileSchema: z.ZodObject<{
    fileType: z.ZodLiteral<"psglib">;
    formatVersion: z.ZodString;
    metadata: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        author: z.ZodString;
        version: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        nodeTypes: z.ZodArray<z.ZodString, "many">;
        thumbnail: z.ZodOptional<z.ZodString>;
        lastModified: z.ZodString;
        license: z.ZodDefault<z.ZodEnum<["MIT", "CC-BY", "CC-BY-SA", "CC0", "proprietary", "custom"]>>;
        usageStats: z.ZodDefault<z.ZodObject<{
            timesUsed: z.ZodDefault<z.ZodNumber>;
            lastUsed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
            popularity: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        }, {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        }>>;
        marketplace: z.ZodOptional<z.ZodObject<{
            price: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            rating: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
            downloads: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            price?: number;
            rating?: number;
            downloads?: number;
        }, {
            price?: number;
            rating?: number;
            downloads?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        id?: string;
        version?: string;
        description?: string;
        tags?: string[];
        author?: string;
        lastModified?: string;
        nodeTypes?: string[];
        thumbnail?: string;
        license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
        usageStats?: {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        };
        marketplace?: {
            price?: number;
            rating?: number;
            downloads?: number;
        };
    }, {
        name?: string;
        id?: string;
        version?: string;
        description?: string;
        tags?: string[];
        author?: string;
        lastModified?: string;
        nodeTypes?: string[];
        thumbnail?: string;
        license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
        usageStats?: {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        };
        marketplace?: {
            price?: number;
            rating?: number;
            downloads?: number;
        };
    }>;
    graph: z.ZodObject<{
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x?: number;
                y?: number;
            }, {
                x?: number;
                y?: number;
            }>;
            data: z.ZodRecord<z.ZodString, z.ZodAny>;
            size: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            label: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }, {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }>, "many">;
        edges: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
            target: z.ZodString;
            sourceHandle: z.ZodOptional<z.ZodString>;
            targetHandle: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }, {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }>, "many">;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        nodes?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }[];
        edges?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }[];
        settings?: Record<string, any>;
    }, {
        nodes?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }[];
        edges?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }[];
        settings?: Record<string, any>;
    }>;
}, "strip", z.ZodTypeAny, {
    graph?: {
        nodes?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }[];
        edges?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }[];
        settings?: Record<string, any>;
    };
    fileType?: "psglib";
    formatVersion?: string;
    metadata?: {
        name?: string;
        id?: string;
        version?: string;
        description?: string;
        tags?: string[];
        author?: string;
        lastModified?: string;
        nodeTypes?: string[];
        thumbnail?: string;
        license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
        usageStats?: {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        };
        marketplace?: {
            price?: number;
            rating?: number;
            downloads?: number;
        };
    };
}, {
    graph?: {
        nodes?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            label?: string;
            description?: string;
            tags?: string[];
            position?: {
                x?: number;
                y?: number;
            };
            size?: {
                width?: number;
                height?: number;
            };
            style?: Record<string, any>;
        }[];
        edges?: {
            data?: Record<string, any>;
            id?: string;
            type?: string;
            source?: string;
            target?: string;
            sourceHandle?: string;
            targetHandle?: string;
        }[];
        settings?: Record<string, any>;
    };
    fileType?: "psglib";
    formatVersion?: string;
    metadata?: {
        name?: string;
        id?: string;
        version?: string;
        description?: string;
        tags?: string[];
        author?: string;
        lastModified?: string;
        nodeTypes?: string[];
        thumbnail?: string;
        license?: "custom" | "MIT" | "CC-BY" | "CC-BY-SA" | "CC0" | "proprietary";
        usageStats?: {
            timesUsed?: number;
            lastUsed?: string;
            popularity?: number;
        };
        marketplace?: {
            price?: number;
            rating?: number;
            downloads?: number;
        };
    };
}>;
export type PSGLibFile = z.infer<typeof PSGLibFileSchema>;
export type PSGLibMetadata = z.infer<typeof PSGLibMetadataSchema>;
export type PSGLibNode = z.infer<typeof PSGLibNodeSchema>;
export type PSGLibEdge = z.infer<typeof PSGLibEdgeSchema>;
export declare enum PSGLibErrorType {
    INVALID_JSON = "INVALID_JSON",
    INVALID_SCHEMA = "INVALID_SCHEMA",
    VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE",
    CORRUPTED_DATA = "CORRUPTED_DATA",
    CIRCULAR_DEPENDENCY = "CIRCULAR_DEPENDENCY"
}
export declare class PSGLibError extends Error {
    type: PSGLibErrorType;
    details?: any;
    constructor(type: PSGLibErrorType, message: string, details?: any);
}
/**
 * Parse a PSGLib file from JSON string
 */
export declare function parsePSGLib(jsonString: string): PSGLibFile;
/**
 * Serialize a PSGLib file to JSON string
 */
export declare function serializePSGLib(psglib: PSGLibFile, pretty?: boolean): string;
/**
 * Create a new PSGLib file from nodes and edges
 */
export declare function createPSGLib(nodes: PSGLibNode[], edges: PSGLibEdge[], metadata: Partial<PSGLibMetadata>): PSGLibFile;
/**
 * Track preset usage for analytics (PM requirement)
 */
export declare function trackPresetUsage(preset: PSGLibFile, action: 'import' | 'export' | 'use'): void;
/**
 * Regenerate node IDs to avoid conflicts on import
 */
export declare function regenerateNodeIds(nodes: PSGLibNode[], edges: PSGLibEdge[]): {
    nodes: PSGLibNode[];
    edges: PSGLibEdge[];
};
//# sourceMappingURL=psglib.d.ts.map