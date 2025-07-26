/**
 * .psg (PromptScape Graph) File Format
 *
 * Defines the structure and validation for native project files
 * that can be saved, loaded, and shared between users.
 */
import { z } from 'zod';
import { Node, Edge } from 'reactflow';
export declare const ProjectMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    created: z.ZodOptional<z.ZodString>;
    modified: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    fileFormatVersion: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    fileFormatVersion: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    author?: string | undefined;
    created?: string | undefined;
    modified?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    version?: string | undefined;
    author?: string | undefined;
    fileFormatVersion?: string | undefined;
    created?: string | undefined;
    modified?: string | undefined;
}>;
export declare const GraphContentSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodAny, "many">;
    edges: z.ZodArray<z.ZodAny, "many">;
    seed: z.ZodOptional<z.ZodNumber>;
    viewport: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        zoom: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        zoom: number;
    }, {
        x: number;
        y: number;
        zoom: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    nodes: any[];
    edges: any[];
    seed?: number | undefined;
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    } | undefined;
}, {
    nodes: any[];
    edges: any[];
    seed?: number | undefined;
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    } | undefined;
}>;
export declare const EditorSettingsSchema: z.ZodObject<{
    autoSave: z.ZodDefault<z.ZodBoolean>;
    autoSaveInterval: z.ZodDefault<z.ZodNumber>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark"]>>;
    gridVisible: z.ZodDefault<z.ZodBoolean>;
    snapToGrid: z.ZodDefault<z.ZodBoolean>;
    miniMapVisible: z.ZodDefault<z.ZodBoolean>;
    showNodeIcons: z.ZodDefault<z.ZodBoolean>;
    showConnectionLabels: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    autoSave: boolean;
    theme: "light" | "dark";
    showNodeIcons: boolean;
    snapToGrid: boolean;
    autoSaveInterval: number;
    gridVisible: boolean;
    miniMapVisible: boolean;
    showConnectionLabels: boolean;
}, {
    autoSave?: boolean | undefined;
    theme?: "light" | "dark" | undefined;
    showNodeIcons?: boolean | undefined;
    snapToGrid?: boolean | undefined;
    autoSaveInterval?: number | undefined;
    gridVisible?: boolean | undefined;
    miniMapVisible?: boolean | undefined;
    showConnectionLabels?: boolean | undefined;
}>;
export declare const ExportMetadataSchema: z.ZodObject<{
    exportedBy: z.ZodDefault<z.ZodString>;
    exportDate: z.ZodString;
    exportVersion: z.ZodDefault<z.ZodString>;
    format: z.ZodLiteral<"psg">;
    compatibility: z.ZodOptional<z.ZodObject<{
        minVersion: z.ZodDefault<z.ZodString>;
        maxVersion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        minVersion: string;
        maxVersion?: string | undefined;
    }, {
        minVersion?: string | undefined;
        maxVersion?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    format: "psg";
    exportedBy: string;
    exportDate: string;
    exportVersion: string;
    compatibility?: {
        minVersion: string;
        maxVersion?: string | undefined;
    } | undefined;
}, {
    format: "psg";
    exportDate: string;
    compatibility?: {
        minVersion?: string | undefined;
        maxVersion?: string | undefined;
    } | undefined;
    exportedBy?: string | undefined;
    exportVersion?: string | undefined;
}>;
export declare const PSGFileSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        created: z.ZodOptional<z.ZodString>;
        modified: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        fileFormatVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        fileFormatVersion: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        author?: string | undefined;
        created?: string | undefined;
        modified?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        author?: string | undefined;
        fileFormatVersion?: string | undefined;
        created?: string | undefined;
        modified?: string | undefined;
    }>;
    graph: z.ZodObject<{
        nodes: z.ZodArray<z.ZodAny, "many">;
        edges: z.ZodArray<z.ZodAny, "many">;
        seed: z.ZodOptional<z.ZodNumber>;
        viewport: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            zoom: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            zoom: number;
        }, {
            x: number;
            y: number;
            zoom: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        nodes: any[];
        edges: any[];
        seed?: number | undefined;
        viewport?: {
            x: number;
            y: number;
            zoom: number;
        } | undefined;
    }, {
        nodes: any[];
        edges: any[];
        seed?: number | undefined;
        viewport?: {
            x: number;
            y: number;
            zoom: number;
        } | undefined;
    }>;
    settings: z.ZodDefault<z.ZodObject<{
        autoSave: z.ZodDefault<z.ZodBoolean>;
        autoSaveInterval: z.ZodDefault<z.ZodNumber>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark"]>>;
        gridVisible: z.ZodDefault<z.ZodBoolean>;
        snapToGrid: z.ZodDefault<z.ZodBoolean>;
        miniMapVisible: z.ZodDefault<z.ZodBoolean>;
        showNodeIcons: z.ZodDefault<z.ZodBoolean>;
        showConnectionLabels: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        autoSave: boolean;
        theme: "light" | "dark";
        showNodeIcons: boolean;
        snapToGrid: boolean;
        autoSaveInterval: number;
        gridVisible: boolean;
        miniMapVisible: boolean;
        showConnectionLabels: boolean;
    }, {
        autoSave?: boolean | undefined;
        theme?: "light" | "dark" | undefined;
        showNodeIcons?: boolean | undefined;
        snapToGrid?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        gridVisible?: boolean | undefined;
        miniMapVisible?: boolean | undefined;
        showConnectionLabels?: boolean | undefined;
    }>>;
    exportMetadata: z.ZodObject<{
        exportedBy: z.ZodDefault<z.ZodString>;
        exportDate: z.ZodString;
        exportVersion: z.ZodDefault<z.ZodString>;
        format: z.ZodLiteral<"psg">;
        compatibility: z.ZodOptional<z.ZodObject<{
            minVersion: z.ZodDefault<z.ZodString>;
            maxVersion: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            minVersion: string;
            maxVersion?: string | undefined;
        }, {
            minVersion?: string | undefined;
            maxVersion?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        format: "psg";
        exportedBy: string;
        exportDate: string;
        exportVersion: string;
        compatibility?: {
            minVersion: string;
            maxVersion?: string | undefined;
        } | undefined;
    }, {
        format: "psg";
        exportDate: string;
        compatibility?: {
            minVersion?: string | undefined;
            maxVersion?: string | undefined;
        } | undefined;
        exportedBy?: string | undefined;
        exportVersion?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        name: string;
        version: string;
        fileFormatVersion: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        author?: string | undefined;
        created?: string | undefined;
        modified?: string | undefined;
    };
    settings: {
        autoSave: boolean;
        theme: "light" | "dark";
        showNodeIcons: boolean;
        snapToGrid: boolean;
        autoSaveInterval: number;
        gridVisible: boolean;
        miniMapVisible: boolean;
        showConnectionLabels: boolean;
    };
    graph: {
        nodes: any[];
        edges: any[];
        seed?: number | undefined;
        viewport?: {
            x: number;
            y: number;
            zoom: number;
        } | undefined;
    };
    exportMetadata: {
        format: "psg";
        exportedBy: string;
        exportDate: string;
        exportVersion: string;
        compatibility?: {
            minVersion: string;
            maxVersion?: string | undefined;
        } | undefined;
    };
}, {
    metadata: {
        name: string;
        description?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        author?: string | undefined;
        fileFormatVersion?: string | undefined;
        created?: string | undefined;
        modified?: string | undefined;
    };
    graph: {
        nodes: any[];
        edges: any[];
        seed?: number | undefined;
        viewport?: {
            x: number;
            y: number;
            zoom: number;
        } | undefined;
    };
    exportMetadata: {
        format: "psg";
        exportDate: string;
        compatibility?: {
            minVersion?: string | undefined;
            maxVersion?: string | undefined;
        } | undefined;
        exportedBy?: string | undefined;
        exportVersion?: string | undefined;
    };
    settings?: {
        autoSave?: boolean | undefined;
        theme?: "light" | "dark" | undefined;
        showNodeIcons?: boolean | undefined;
        snapToGrid?: boolean | undefined;
        autoSaveInterval?: number | undefined;
        gridVisible?: boolean | undefined;
        miniMapVisible?: boolean | undefined;
        showConnectionLabels?: boolean | undefined;
    } | undefined;
}>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type GraphContent = z.infer<typeof GraphContentSchema>;
export type EditorSettings = z.infer<typeof EditorSettingsSchema>;
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;
export type PSGFile = z.infer<typeof PSGFileSchema>;
/**
 * Creates a new .psg file from graph data
 */
export declare function createPSGFile(nodes: Node[], edges: Edge[], metadata: Partial<ProjectMetadata>, settings?: Partial<EditorSettings>, seed?: number, viewport?: {
    x: number;
    y: number;
    zoom: number;
}): PSGFile;
/**
 * Validates a .psg file structure
 */
export declare function validatePSGFile(data: unknown): PSGFile;
/**
 * Enhanced error types for better error handling
 */
export declare enum PSGErrorType {
    INVALID_JSON = "INVALID_JSON",
    INVALID_SCHEMA = "INVALID_SCHEMA",
    CORRUPTED_DATA = "CORRUPTED_DATA",
    VERSION_INCOMPATIBLE = "VERSION_INCOMPATIBLE",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS",
    INVALID_NODE_DATA = "INVALID_NODE_DATA",
    INVALID_EDGE_DATA = "INVALID_EDGE_DATA",
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
}
export interface PSGError {
    type: PSGErrorType;
    message: string;
    details?: any;
    suggestions?: string[];
}
/**
 * Safely parses a .psg file with comprehensive error handling
 */
export declare function parsePSGFile(jsonString: string, options?: {
    maxFileSize?: number;
    strictValidation?: boolean;
    allowLegacyFormat?: boolean;
}): {
    success: true;
    data: PSGFile;
    warnings?: string[];
} | {
    success: false;
    error: PSGError;
};
/**
 * Updates the modified timestamp and increments version if needed
 */
export declare function updatePSGFileMetadata(psgFile: PSGFile, changes?: Partial<ProjectMetadata>): PSGFile;
/**
 * Extracts a lightweight summary of a .psg file for listing purposes
 */
export declare function extractPSGFileSummary(psgFile: PSGFile): {
    id: string;
    name: string;
    description?: string;
    author?: string;
    tags: string[];
    created: string;
    modified: string;
    nodeCount: number;
    edgeCount: number;
    fileSize: number;
};
/**
 * File extension and MIME type constants
 */
export declare export declare export declare /**
 * Version compatibility checker
 */
export declare function checkPSGCompatibility(psgFile: PSGFile, currentVersion?: string): {
    compatible: boolean;
    warnings: string[];
    requiresUpgrade: boolean;
};
/**
 * Enhanced serialization with validation and error handling
 */
export declare function serializePSGFile(psgFile: PSGFile, options?: {
    pretty?: boolean;
    validate?: boolean;
}): {
    success: true;
    data: string;
    warnings?: string[];
} | {
    success: false;
    error: PSGError;
};
//# sourceMappingURL=psg.d.ts.map