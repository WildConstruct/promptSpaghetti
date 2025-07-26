/**
 * Extension Manifest - Epic 8.4 Story 8.4.3
 * Standardized manifest format for extensions with validation and parsing
 */
import { z } from 'zod';
import { ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
export declare const ExtensionManifestSchema: z.ZodObject<{
    manifest_version: z.ZodLiteral<"1.0">;
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        email?: string;
        url?: string;
    }, {
        name?: string;
        email?: string;
        url?: string;
    }>;
    extension_type: z.ZodEnum<["node", "ui", "transform", "storage"]>;
    main: z.ZodString;
    dependencies: z.ZodOptional<z.ZodObject<{
        system: z.ZodOptional<z.ZodString>;
        extensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        npm: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        extensions?: Record<string, string>;
        system?: string;
        npm?: Record<string, string>;
    }, {
        extensions?: Record<string, string>;
        system?: string;
        npm?: Record<string, string>;
    }>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<["file-system-read", "file-system-write", "network", "storage", "ui-components", "runtime-nodes", "system-info", "extensions-api"]>, "many">>;
    capabilities: z.ZodOptional<z.ZodObject<{
        provides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        requires: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        optional: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        optional?: string[];
        provides?: string[];
        requires?: string[];
    }, {
        optional?: string[];
        provides?: string[];
        requires?: string[];
    }>>;
    ui: z.ZodOptional<z.ZodObject<{
        icon: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        themes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        css: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        category?: string;
        icon?: string;
        themes?: string[];
        css?: string[];
        components?: Record<string, string>;
    }, {
        category?: string;
        icon?: string;
        themes?: string[];
        css?: string[];
        components?: Record<string, string>;
    }>>;
    runtime: z.ZodOptional<z.ZodObject<{
        node_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        transforms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        storage_providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        background_tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        node_types?: string[];
        transforms?: string[];
        storage_providers?: string[];
        background_tasks?: string[];
    }, {
        node_types?: string[];
        transforms?: string[];
        storage_providers?: string[];
        background_tasks?: string[];
    }>>;
    build: z.ZodOptional<z.ZodObject<{
        output_dir: z.ZodDefault<z.ZodString>;
        entry_point: z.ZodOptional<z.ZodString>;
        externals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        assets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        output_dir?: string;
        entry_point?: string;
        externals?: string[];
        assets?: string[];
    }, {
        output_dir?: string;
        entry_point?: string;
        externals?: string[];
        assets?: string[];
    }>>;
    activation_events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    configuration: z.ZodOptional<z.ZodObject<{
        schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        defaults: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        ui_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        schema?: Record<string, any>;
        defaults?: Record<string, any>;
        ui_schema?: Record<string, any>;
    }, {
        schema?: Record<string, any>;
        defaults?: Record<string, any>;
        ui_schema?: Record<string, any>;
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        license: z.ZodOptional<z.ZodString>;
        repository: z.ZodOptional<z.ZodString>;
        homepage: z.ZodOptional<z.ZodString>;
        bugs: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        changelog: z.ZodOptional<z.ZodString>;
        readme: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        categories?: string[];
        license?: string;
        repository?: string;
        homepage?: string;
        bugs?: string;
        keywords?: string[];
        changelog?: string;
        readme?: string;
    }, {
        categories?: string[];
        license?: string;
        repository?: string;
        homepage?: string;
        bugs?: string;
        keywords?: string[];
        changelog?: string;
        readme?: string;
    }>>;
    compatibility: z.ZodOptional<z.ZodObject<{
        min_system_version: z.ZodOptional<z.ZodString>;
        max_system_version: z.ZodOptional<z.ZodString>;
        platforms: z.ZodOptional<z.ZodArray<z.ZodEnum<["web", "desktop", "server"]>, "many">>;
        browsers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        min_system_version?: string;
        max_system_version?: string;
        platforms?: ("web" | "desktop" | "server")[];
        browsers?: Record<string, string>;
    }, {
        min_system_version?: string;
        max_system_version?: string;
        platforms?: ("web" | "desktop" | "server")[];
        browsers?: Record<string, string>;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        content_security_policy: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled?: boolean;
            permissions?: string[];
        }, {
            enabled?: boolean;
            permissions?: string[];
        }>>;
        trusted_domains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        content_security_policy?: string;
        sandbox?: {
            enabled?: boolean;
            permissions?: string[];
        };
        trusted_domains?: string[];
    }, {
        content_security_policy?: string;
        sandbox?: {
            enabled?: boolean;
            permissions?: string[];
        };
        trusted_domains?: string[];
    }>>;
    publishing: z.ZodOptional<z.ZodObject<{
        private: z.ZodDefault<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodString>;
        access: z.ZodDefault<z.ZodEnum<["public", "private", "restricted"]>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[];
        private?: boolean;
        registry?: string;
        access?: "private" | "public" | "restricted";
    }, {
        tags?: string[];
        private?: boolean;
        registry?: string;
        access?: "private" | "public" | "restricted";
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    version?: string;
    author?: {
        name?: string;
        email?: string;
        url?: string;
    };
    metadata?: {
        categories?: string[];
        license?: string;
        repository?: string;
        homepage?: string;
        bugs?: string;
        keywords?: string[];
        changelog?: string;
        readme?: string;
    };
    main?: string;
    compatibility?: {
        min_system_version?: string;
        max_system_version?: string;
        platforms?: ("web" | "desktop" | "server")[];
        browsers?: Record<string, string>;
    };
    configuration?: {
        schema?: Record<string, any>;
        defaults?: Record<string, any>;
        ui_schema?: Record<string, any>;
    };
    security?: {
        content_security_policy?: string;
        sandbox?: {
            enabled?: boolean;
            permissions?: string[];
        };
        trusted_domains?: string[];
    };
    permissions?: ("storage" | "file-system-read" | "file-system-write" | "network" | "ui-components" | "runtime-nodes" | "system-info" | "extensions-api")[];
    ui?: {
        category?: string;
        icon?: string;
        themes?: string[];
        css?: string[];
        components?: Record<string, string>;
    };
    runtime?: {
        node_types?: string[];
        transforms?: string[];
        storage_providers?: string[];
        background_tasks?: string[];
    };
    capabilities?: {
        optional?: string[];
        provides?: string[];
        requires?: string[];
    };
    dependencies?: {
        extensions?: Record<string, string>;
        system?: string;
        npm?: Record<string, string>;
    };
    manifest_version?: "1.0";
    extension_type?: "transform" | "node" | "storage" | "ui";
    build?: {
        output_dir?: string;
        entry_point?: string;
        externals?: string[];
        assets?: string[];
    };
    activation_events?: string[];
    publishing?: {
        tags?: string[];
        private?: boolean;
        registry?: string;
        access?: "private" | "public" | "restricted";
    };
}, {
    id?: string;
    name?: string;
    description?: string;
    version?: string;
    author?: {
        name?: string;
        email?: string;
        url?: string;
    };
    metadata?: {
        categories?: string[];
        license?: string;
        repository?: string;
        homepage?: string;
        bugs?: string;
        keywords?: string[];
        changelog?: string;
        readme?: string;
    };
    main?: string;
    compatibility?: {
        min_system_version?: string;
        max_system_version?: string;
        platforms?: ("web" | "desktop" | "server")[];
        browsers?: Record<string, string>;
    };
    configuration?: {
        schema?: Record<string, any>;
        defaults?: Record<string, any>;
        ui_schema?: Record<string, any>;
    };
    security?: {
        content_security_policy?: string;
        sandbox?: {
            enabled?: boolean;
            permissions?: string[];
        };
        trusted_domains?: string[];
    };
    permissions?: ("storage" | "file-system-read" | "file-system-write" | "network" | "ui-components" | "runtime-nodes" | "system-info" | "extensions-api")[];
    ui?: {
        category?: string;
        icon?: string;
        themes?: string[];
        css?: string[];
        components?: Record<string, string>;
    };
    runtime?: {
        node_types?: string[];
        transforms?: string[];
        storage_providers?: string[];
        background_tasks?: string[];
    };
    capabilities?: {
        optional?: string[];
        provides?: string[];
        requires?: string[];
    };
    dependencies?: {
        extensions?: Record<string, string>;
        system?: string;
        npm?: Record<string, string>;
    };
    manifest_version?: "1.0";
    extension_type?: "transform" | "node" | "storage" | "ui";
    build?: {
        output_dir?: string;
        entry_point?: string;
        externals?: string[];
        assets?: string[];
    };
    activation_events?: string[];
    publishing?: {
        tags?: string[];
        private?: boolean;
        registry?: string;
        access?: "private" | "public" | "restricted";
    };
}>;
export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;
export declare class ExtensionManifestParser {
    private static instance;
    private cache;
    private constructor();
    static getInstance(): ExtensionManifestParser;
    /**
     * Parse manifest from JSON string
     */
    parseManifest(jsonString: string): ParseResult<ExtensionManifest>;
    /**
     * Parse manifest from file path
     */
    parseManifestFromFile(filePath: string): Promise<ParseResult<ExtensionManifest>>;
    /**
     * Validate manifest dependencies
     */
    validateDependencies(
      manifest: ExtensionManifest,
      availableExtensions: Map<string,
      ExtensionManifest>
    ): ExtensionValidationResult;
    /**
     * Check compatibility with system
     */
    checkCompatibility(manifest: ExtensionManifest, systemVersion: string, platform: string): ExtensionValidationResult;
    /**
     * Generate manifest template
     */
    generateManifestTemplate(options: ManifestTemplateOptions): ExtensionManifest;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Private helper methods
     */
    private validateManifestLogic;
    private satisfiesVersionRange;
    private compareVersions;
    private readFile;
}
export declare class ExtensionManifestValidator {
    private static instance;
    private parser;
    private constructor();
    static getInstance(): ExtensionManifestValidator;
    /**
     * Comprehensive manifest validation
     */
    validateManifest(manifest: ExtensionManifest, context: ValidationContext): ExtensionValidationResult;
    /**
     * Validate manifest permissions
     */
    private validatePermissions;
    /**
     * Validate manifest security settings
     */
    private validateSecurity;
    private isValidCSP;
}
interface ParseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: Array<{
        path: string;
        message: string;
        code: string;
    }>;
}
interface ManifestTemplateOptions {
    id: string;
    name: string;
    version?: string;
    description?: string;
    author?: string;
    authorEmail?: string;
    authorUrl?: string;
    extensionType: 'node' | 'ui' | 'transform' | 'storage';
    main?: string;
    systemVersion?: string;
    permissions?: string[];
    provides?: string[];
    requires?: string[];
    license?: string;
    keywords?: string[];
    categories?: string[];
    minSystemVersion?: string;
    platforms?: string[];
    nodeTypes?: string[];
    uiCategory?: string;
    uiComponents?: Record<string, string>;
    transforms?: string[];
    storageProviders?: string[];
}
interface ValidationContext {
    systemVersion: string;
    platform: string;
    availableExtensions: Map<string, ExtensionManifest>;
    grantedPermissions: string[];
}
export declare const extensionManifestParser: ExtensionManifestParser;
export declare const extensionManifestValidator: ExtensionManifestValidator;
export {};
//# sourceMappingURL=ExtensionManifest.d.ts.map