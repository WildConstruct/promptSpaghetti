"use strict";
/**
 * .psg (PromptSpaghetti Graph) File Format Schema - Story 6.1
 *
 * Defines the schema and validation for .psg project files using Zod.
 * Provides versioning support and comprehensive metadata structure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsgFileSchema = exports.CollaborationDataSchema = exports.ProjectSettingsSchema = exports.ProjectMetadataSchema = exports.PSG_FORMAT_VERSION = void 0;
exports.validatePsgFile = validatePsgFile;
exports.isVersionCompatible = isVersionCompatible;
exports.createDefaultMetadata = createDefaultMetadata;
exports.createDefaultSettings = createDefaultSettings;
const zod_1 = require("zod");
const graphSchema_1 = require("../graphSchema");
// Current format version
exports.PSG_FORMAT_VERSION = '1.0.0';
// Project metadata schema
exports.ProjectMetadataSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name is required'),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().default('1.0.0'),
    createdAt: zod_1.z.string().datetime(),
    lastModified: zod_1.z.string().datetime(),
    author: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    fileFormatVersion: zod_1.z.string().default(exports.PSG_FORMAT_VERSION)
});
// Project settings schema
exports.ProjectSettingsSchema = zod_1.z.object({
    autoSave: zod_1.z.boolean().default(true),
    backupInterval: zod_1.z.number().min(1).default(5), // minutes
    maxBackups: zod_1.z.number().min(1).max(50).default(10),
    gridSnapping: zod_1.z.boolean().default(false),
    gridSize: zod_1.z.number().min(5).max(50).default(20),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).default('auto'),
    showMinimap: zod_1.z.boolean().default(true),
    autoLayout: zod_1.z.boolean().default(false)
});
// Collaboration data schema (Epic 8.7 compatibility)
exports.CollaborationDataSchema = zod_1.z.object({
    stickyNotes: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        content: zod_1.z.string(),
        position: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }),
        size: zod_1.z.object({ width: zod_1.z.number(), height: zod_1.z.number() }),
        color: zod_1.z.string(),
        author: zod_1.z.string().optional(),
        timestamp: zod_1.z.string().datetime()
    })).default([]),
    annotations: zod_1.z.object({
        nodeLabels: zod_1.z.record(zod_1.z.string()).default({}),
        regionGroups: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            nodeIds: zod_1.z.array(zod_1.z.string()),
            position: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }),
            size: zod_1.z.object({ width: zod_1.z.number(), height: zod_1.z.number() }),
            color: zod_1.z.string(),
            collapsed: zod_1.z.boolean().default(false)
        })).default([]),
        connectionLabels: zod_1.z.record(zod_1.z.string()).default({})
    }).default({
        nodeLabels: {},
        regionGroups: [],
        connectionLabels: {}
    })
});
// Main .psg file format schema
exports.PsgFileSchema = zod_1.z.object({
    // Format identification and versioning
    fileType: zod_1.z.literal('psg').describe('File type identifier'),
    formatVersion: zod_1.z.string().describe('Format version for compatibility checking'),
    // Core project data
    metadata: exports.ProjectMetadataSchema,
    settings: exports.ProjectSettingsSchema,
    graph: graphSchema_1.GraphSchema,
    // Extended features
    collaboration: exports.CollaborationDataSchema.optional(),
    // Extensibility for future features
    extensions: zod_1.z.record(zod_1.z.unknown()).optional().describe('Extension data for future features'),
    // File integrity
    checksum: zod_1.z.string().optional().describe('File integrity checksum'),
    exportedAt: zod_1.z.string().datetime().describe('Timestamp when file was created')
});
// Validation functions
function validatePsgFile(data: unknown) {
    try {
        const result = exports.PsgFileSchema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        else {
            return {
                success: false,
                error: 'Invalid .psg file format',
                issues: result.error.issues
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown validation error',
            issues: []
        };
    }
}
// Version compatibility checking
function isVersionCompatible(fileVersion: string) {
    const [fileMajor, fileMinor] = fileVersion.split('.').map(Number);
    const [currentMajor, currentMinor] = exports.PSG_FORMAT_VERSION.split('.').map(Number);
    // Same major version is compatible
    if (fileMajor === currentMajor) {
        return {
            compatible: true,
            requiresMigration: fileMinor < currentMinor,
            message: fileMinor < currentMinor ? 'File will be upgraded to current format version' : undefined
        };
    }
    // Future major version is not compatible
    if (fileMajor > currentMajor) {
        return {
            compatible: false,
            requiresMigration: false,
            message: 'This file was created with a newer version of the application. Please update to the latest version.'
        };
    }
    // Older major version requires migration
    return {
        compatible: true,
        requiresMigration: true,
        message: 'This file format is outdated and will be automatically upgraded.'
    };
}
// Helper to create default project metadata
function createDefaultMetadata(name: string, author?: string) {
    const now = new Date().toISOString();
    return {
        name,
        description: '',
        version: '1.0.0',
        createdAt: now,
        lastModified: now,
        author: author || 'Anonymous',
        tags: [],
        fileFormatVersion: exports.PSG_FORMAT_VERSION
    };
}
// Helper to create default project settings
function createDefaultSettings() {
    return {
        autoSave: true,
        backupInterval: 5,
        maxBackups: 10,
        gridSnapping: false,
        gridSize: 20,
        theme: 'auto',
        showMinimap: true,
        autoLayout: false
    };
}
