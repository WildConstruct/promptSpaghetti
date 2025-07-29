/**
 * .psg (PromptScape Graph) File Format
 *
 * Defines the structure and validation for native project files
 * that can be saved, loaded, and shared between users.
 */
import { z } from 'zod';
import { Node } from 'reactflow';
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
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    author?: string;
    fileFormatVersion?: string;
    created?: string;
    modified?: string;
}, {
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    author?: string;
    fileFormatVersion?: string;
    created?: string;
    modified?: string;
}>;
export declare const GraphContentSchema: z.ZodOptional<z.ZodObject<{
    nodes: z.ZodArray<z.ZodUnknown, "many">;
    edges: z.ZodArray<z.ZodUnknown, "many">;
    seed: z.ZodOptional<z.ZodNumber>;
    viewport: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    x: z.ZodNumber;
    y: z.ZodNumber;
    zoom: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x?: number;
    y?: number;
    nodes?: unknown[];
    seed?: number;
    edges?: unknown[];
    zoom?: number;
    viewport?: {};
}, {
    x?: number;
    y?: number;
    nodes?: unknown[];
    seed?: number;
    edges?: unknown[];
    zoom?: number;
    viewport?: {};
}>>;
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
    autoSave?: boolean;
    theme?: "light" | "dark";
    gridVisible?: boolean;
    autoSaveInterval?: number;
    snapToGrid?: boolean;
    miniMapVisible?: boolean;
    showNodeIcons?: boolean;
    showConnectionLabels?: boolean;
}, {
    autoSave?: boolean;
    theme?: "light" | "dark";
    gridVisible?: boolean;
    autoSaveInterval?: number;
    snapToGrid?: boolean;
    miniMapVisible?: boolean;
    showNodeIcons?: boolean;
    showConnectionLabels?: boolean;
}>;
export declare const ExportMetadataSchema: z.ZodOptional<z.ZodObject<{
    exportedBy: z.ZodDefault<z.ZodString>;
    exportDate: z.ZodString;
    exportVersion: z.ZodDefault<z.ZodString>;
    format: z.ZodLiteral<"psg">;
    compatibility: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    minVersion: z.ZodDefault<z.ZodString>;
    maxVersion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    format?: "psg";
    compatibility?: {};
    exportedBy?: string;
    exportDate?: string;
    exportVersion?: string;
    minVersion?: string;
    maxVersion?: string;
}, {
    format?: "psg";
    compatibility?: {};
    exportedBy?: string;
    exportDate?: string;
    exportVersion?: string;
    minVersion?: string;
    maxVersion?: string;
}>>;
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
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        author?: string;
        fileFormatVersion?: string;
        created?: string;
        modified?: string;
    }, {
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        author?: string;
        fileFormatVersion?: string;
        created?: string;
        modified?: string;
    }>;
    graph: z.ZodOptional<z.ZodObject<{
        nodes: z.ZodArray<z.ZodUnknown, "many">;
        edges: z.ZodArray<z.ZodUnknown, "many">;
        seed: z.ZodOptional<z.ZodNumber>;
        viewport: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        zoom: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x?: number;
        y?: number;
        nodes?: unknown[];
        seed?: number;
        edges?: unknown[];
        zoom?: number;
        viewport?: {};
    }, {
        x?: number;
        y?: number;
        nodes?: unknown[];
        seed?: number;
        edges?: unknown[];
        zoom?: number;
        viewport?: {};
    }>>;
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
        autoSave?: boolean;
        theme?: "light" | "dark";
        gridVisible?: boolean;
        autoSaveInterval?: number;
        snapToGrid?: boolean;
        miniMapVisible?: boolean;
        showNodeIcons?: boolean;
        showConnectionLabels?: boolean;
    }, {
        autoSave?: boolean;
        theme?: "light" | "dark";
        gridVisible?: boolean;
        autoSaveInterval?: number;
        snapToGrid?: boolean;
        miniMapVisible?: boolean;
        showNodeIcons?: boolean;
        showConnectionLabels?: boolean;
    }>>;
    exportMetadata: z.ZodOptional<z.ZodObject<{
        exportedBy: z.ZodDefault<z.ZodString>;
        exportDate: z.ZodString;
        exportVersion: z.ZodDefault<z.ZodString>;
        format: z.ZodLiteral<"psg">;
        compatibility: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        minVersion: z.ZodDefault<z.ZodString>;
        maxVersion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        format?: "psg";
        compatibility?: {};
        exportedBy?: string;
        exportDate?: string;
        exportVersion?: string;
        minVersion?: string;
        maxVersion?: string;
    }, {
        format?: "psg";
        compatibility?: {};
        exportedBy?: string;
        exportDate?: string;
        exportVersion?: string;
        minVersion?: string;
        maxVersion?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        author?: string;
        fileFormatVersion?: string;
        created?: string;
        modified?: string;
    };
    settings?: {
        autoSave?: boolean;
        theme?: "light" | "dark";
        gridVisible?: boolean;
        autoSaveInterval?: number;
        snapToGrid?: boolean;
        miniMapVisible?: boolean;
        showNodeIcons?: boolean;
        showConnectionLabels?: boolean;
    };
    graph?: {
        x?: number;
        y?: number;
        nodes?: unknown[];
        seed?: number;
        edges?: unknown[];
        zoom?: number;
        viewport?: {};
    };
    exportMetadata?: {
        format?: "psg";
        compatibility?: {};
        exportedBy?: string;
        exportDate?: string;
        exportVersion?: string;
        minVersion?: string;
        maxVersion?: string;
    };
}, {
    metadata?: {
        name?: string;
        description?: string;
        tags?: string[];
        version?: string;
        author?: string;
        fileFormatVersion?: string;
        created?: string;
        modified?: string;
    };
    settings?: {
        autoSave?: boolean;
        theme?: "light" | "dark";
        gridVisible?: boolean;
        autoSaveInterval?: number;
        snapToGrid?: boolean;
        miniMapVisible?: boolean;
        showNodeIcons?: boolean;
        showConnectionLabels?: boolean;
    };
    graph?: {
        x?: number;
        y?: number;
        nodes?: unknown[];
        seed?: number;
        edges?: unknown[];
        zoom?: number;
        viewport?: {};
    };
    exportMetadata?: {
        format?: "psg";
        compatibility?: {};
        exportedBy?: string;
        exportDate?: string;
        exportVersion?: string;
        minVersion?: string;
        maxVersion?: string;
    };
}>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type GraphContent = z.infer<typeof GraphContentSchema>;
export type EditorSettings = z.infer<typeof EditorSettingsSchema>;
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;
export type PSGFile = z.infer<typeof PSGFileSchema>;
/**
 * Creates a new .psg file from graph data
 */
export declare function createPSGFile(nodes: Node): any;
//# sourceMappingURL=psg.d.ts.map