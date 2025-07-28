/**
 * Core Extension Interfaces - Epic 8.4 Story 8.4.2
 * Defines the fundamental interfaces that all extensions must implement
 */
import { z } from 'zod';
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
    // Extension Error Types
    ExtensionLifecycleState[ExtensionLifecycleState["export"] = void 0] = "export";
    ExtensionLifecycleState[ExtensionLifecycleState["enum"] = void 0] = "enum";
    ExtensionLifecycleState[ExtensionLifecycleState["ExtensionErrorType"] = void 0] = "ExtensionErrorType";
})(ExtensionLifecycleState || (ExtensionLifecycleState = {}));
{
    INITIALIZATION_ERROR = 'initialization_error',
        ACTIVATION_ERROR = 'activation_error',
        RUNTIME_ERROR = 'runtime_error',
        CONFIGURATION_ERROR = 'configuration_error',
        DEPENDENCY_ERROR = 'dependency_error',
        PERMISSION_ERROR = 'permission_error',
        VALIDATION_ERROR = 'validation_error';
    // Extension Error
    export class ExtensionError extends Error {
        type;
        extensionId;
        message;
        cause;
    }
    this.name = 'ExtensionError';
    export const ExtensionManifestSchema = z.object({});
    id: z.string().regex(/^[a-zA-Z0-9-_.]+$/),
        name;
    z.string().min(1),
        version;
    z.string().regex(/^\d+\.\d+\.\d+$/),
        description;
    z.string().min(1),
        author;
    z.string().min(1),
        license;
    z.string().min(1),
        // Engine requirements
        engines;
    z.object({});
    promptSpaghetti: z.string(),
        node;
    z.string().optional(),
    ;
}
// Dependencies
dependencies: z.array(z.string()).optional(),
    optionalDependencies;
z.array(z.string()).optional(),
    // Permissions
    permissions;
z.array(z.string()).optional(),
    // Entry points
    main;
z.string().optional(),
    browser;
z.string().optional(),
    // Extension points
    contributes;
z.object({});
nodes: z.array(z.string()).optional(),
    commands;
z.array(z.string()).optional(),
    menus;
z.array(z.string()).optional(),
    themes;
z.array(z.string()).optional(),
    languages;
z.array(z.string()).optional(),
;
optional(),
    // Metadata
    repository;
z.string().optional(),
    homepage;
z.string().optional(),
    bugs;
z.string().optional(),
    keywords;
z.array(z.string()).optional(),
    // Configuration
    configuration;
z.object({});
type: z.literal('object'),
    properties;
z.record(z.any()),
;
optional();
;
// Re-export specific extension types
export { NodeCategory } from './NodeExtension';
