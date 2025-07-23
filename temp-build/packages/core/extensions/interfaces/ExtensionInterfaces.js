/**
 * Core Extension Interfaces - Epic 8.4 Story 8.4.2
 * Defines the fundamental interfaces that all extensions must implement
 */
import { z } from 'zod';
// Extension Lifecycle States
export var ExtensionLifecycleState;
(function (ExtensionLifecycleState) {
    ExtensionLifecycleState["UNINITIALIZED"] = "uninitialized";
    ExtensionLifecycleState["INITIALIZING"] = "initializing";
    ExtensionLifecycleState["INITIALIZED"] = "initialized";
    ExtensionLifecycleState["ACTIVATING"] = "activating";
    ExtensionLifecycleState["ACTIVE"] = "active";
    ExtensionLifecycleState["DEACTIVATING"] = "deactivating";
    ExtensionLifecycleState["DEACTIVATED"] = "deactivated";
    ExtensionLifecycleState["ERROR"] = "error";
    ExtensionLifecycleState["DISPOSED"] = "disposed";
})(ExtensionLifecycleState || (ExtensionLifecycleState = {}));
// Extension Error Types
export var ExtensionErrorType;
(function (ExtensionErrorType) {
    ExtensionErrorType["INITIALIZATION_ERROR"] = "initialization_error";
    ExtensionErrorType["ACTIVATION_ERROR"] = "activation_error";
    ExtensionErrorType["RUNTIME_ERROR"] = "runtime_error";
    ExtensionErrorType["CONFIGURATION_ERROR"] = "configuration_error";
    ExtensionErrorType["DEPENDENCY_ERROR"] = "dependency_error";
    ExtensionErrorType["PERMISSION_ERROR"] = "permission_error";
    ExtensionErrorType["VALIDATION_ERROR"] = "validation_error";
})(ExtensionErrorType || (ExtensionErrorType = {}));
// Extension Error
export class ExtensionError extends Error {
    constructor(type, extensionId, message, cause) {
        super(message);
        this.type = type;
        this.extensionId = extensionId;
        this.cause = cause;
        this.name = 'ExtensionError';
    }
}
// Extension Manifest Schema (will be used in Story 8.4.3)
export const ExtensionManifestSchema = z.object({
    id: z.string().regex(/^[a-zA-Z0-9-_.]+$/),
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string().min(1),
    author: z.string().min(1),
    license: z.string().min(1),
    // Engine requirements
    engines: z.object({
        promptSpaghetti: z.string(),
        node: z.string().optional()
    }),
    // Dependencies
    dependencies: z.array(z.string()).optional(),
    optionalDependencies: z.array(z.string()).optional(),
    // Permissions
    permissions: z.array(z.string()).optional(),
    // Entry points
    main: z.string().optional(),
    browser: z.string().optional(),
    // Extension points
    contributes: z.object({
        nodes: z.array(z.string()).optional(),
        commands: z.array(z.string()).optional(),
        menus: z.array(z.string()).optional(),
        themes: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional()
    }).optional(),
    // Metadata
    repository: z.string().optional(),
    homepage: z.string().optional(),
    bugs: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    // Configuration
    configuration: z.object({
        type: z.literal('object'),
        properties: z.record(z.any())
    }).optional()
});
// Re-export specific extension types
export { NodeCategory } from './NodeExtension';
