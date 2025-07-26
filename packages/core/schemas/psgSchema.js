/**
 * .psg (PromptSpaghetti Graph) File Format Schema - Story 6.1
 *
 * Defines the schema and validation for .psg project files using Zod.
 * Provides versioning support and comprehensive metadata structure.
 */
import { z } from 'zod';
import { GraphSchema } from '../graphSchema';
// Current format version
export const PSG_FORMAT_VERSION = '1.0.0';
// Project metadata schema
export const ProjectMetadataSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    version: z.string().default('1.0.0'),
    createdAt: z.string().datetime(),
    lastModified: z.string().datetime(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    fileFormatVersion: z.string().default(PSG_FORMAT_VERSION)
});
// Project settings schema
export const ProjectSettingsSchema = z.object({
    autoSave: z.boolean().default(true),
    backupInterval: z.number().min(1).default(5), // minutes
    maxBackups: z.number().min(1).max(50).default(10),
    gridSnapping: z.boolean().default(false),
    gridSize: z.number().min(5).max(50).default(20),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    showMinimap: z.boolean().default(true),
    autoLayout: z.boolean().default(false)
});
// Collaboration data schema (Epic 8.7 compatibility)
export const CollaborationDataSchema = z.object({
    stickyNotes: z.array(z.object({
        id: z.string(),
        content: z.string(),
        position: z.object({ x: z.number(), y: z.number() }),
        size: z.object({ width: z.number(), height: z.number() }),
        color: z.string(),
        author: z.string().optional(),
        timestamp: z.string().datetime()
    })).default([]),
    annotations: z.object({
        nodeLabels: z.record(z.string()).default({}),
        regionGroups: z.array(z.object({
            id: z.string(),
            name: z.string(),
            nodeIds: z.array(z.string()),
            position: z.object({ x: z.number(), y: z.number() }),
            size: z.object({ width: z.number(), height: z.number() }),
            color: z.string(),
            collapsed: z.boolean().default(false)
        })).default([]),
        connectionLabels: z.record(z.string()).default({})
    }).default({
        nodeLabels: {},
        regionGroups: [],
        connectionLabels: {}
    })
});
// Main .psg file format schema
export const PsgFileSchema = z.object({
    // Format identification and versioning
    fileType: z.literal('psg').describe('File type identifier'),
    formatVersion: z.string().describe('Format version for compatibility checking'),
    // Core project data
    metadata: ProjectMetadataSchema,
    settings: ProjectSettingsSchema,
    graph: GraphSchema,
    // Extended features
    collaboration: CollaborationDataSchema.optional(),
    // Extensibility for future features
    extensions: z.record(z.unknown()).optional().describe('Extension data for future features'),
    // File integrity
    checksum: z.string().optional().describe('File integrity checksum'),
    exportedAt: z.string().datetime().describe('Timestamp when file was created')
});
// Validation functions
export function validatePsgFile(data) {
    try {
        const result = PsgFileSchema.safeParse(data);
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
export function isVersionCompatible(fileVersion) {
    const [fileMajor, fileMinor] = fileVersion.split('.').map(Number);
    const [currentMajor, currentMinor] = PSG_FORMAT_VERSION.split('.').map(Number);
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
export function createDefaultMetadata(name, author) {
    const now = new Date().toISOString();
    return {
        name,
        description: '',
        version: '1.0.0',
        createdAt: now,
        lastModified: now,
        author: author || 'Anonymous',
        tags: [],
        fileFormatVersion: PSG_FORMAT_VERSION
    };
}
// Helper to create default project settings
export function createDefaultSettings() {
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
