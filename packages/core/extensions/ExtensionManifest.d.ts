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
        name: string;
        url?: string | undefined;
        email?: string | undefined;
    }, {
        name: string;
        url?: string | undefined;
        email?: string | undefined;
    }>;
    extension_type: z.ZodEnum<["node", "ui", "transform", "storage"]>;
    main: z.ZodString;
    dependencies: z.ZodOptional<z.ZodObject<{
        system: z.ZodOptional<z.ZodString>;
        extensions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        npm: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        system?: string | undefined;
        extensions?: Record<string, string> | undefined;
        npm?: Record<string, string> | undefined;
    }, {
        system?: string | undefined;
        extensions?: Record<string, string> | undefined;
        npm?: Record<string, string> | undefined;
    }>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<["file-system-read", "file-system-write", "network", "storage", "ui-components", "runtime-nodes", "system-info", "extensions-api"]>, "many">>;
    capabilities: z.ZodOptional<z.ZodObject<{
        provides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        requires: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        optional: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        provides?: string[] | undefined;
        requires?: string[] | undefined;
        optional?: string[] | undefined;
    }, {
        provides?: string[] | undefined;
        requires?: string[] | undefined;
        optional?: string[] | undefined;
    }>>;
    ui: z.ZodOptional<z.ZodObject<{
        icon: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        themes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        css: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        category?: string | undefined;
        icon?: string | undefined;
        themes?: string[] | undefined;
        css?: string[] | undefined;
        components?: Record<string, string> | undefined;
    }, {
        category?: string | undefined;
        icon?: string | undefined;
        themes?: string[] | undefined;
        css?: string[] | undefined;
        components?: Record<string, string> | undefined;
    }>>;
    runtime: z.ZodOptional<z.ZodObject<{
        node_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        transforms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        storage_providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        background_tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        node_types?: string[] | undefined;
        transforms?: string[] | undefined;
        storage_providers?: string[] | undefined;
        background_tasks?: string[] | undefined;
    }, {
        node_types?: string[] | undefined;
        transforms?: string[] | undefined;
        storage_providers?: string[] | undefined;
        background_tasks?: string[] | undefined;
    }>>;
    build: z.ZodOptional<z.ZodObject<{
        output_dir: z.ZodDefault<z.ZodString>;
        entry_point: z.ZodOptional<z.ZodString>;
        externals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        assets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        output_dir: string;
        entry_point?: string | undefined;
        externals?: string[] | undefined;
        assets?: string[] | undefined;
    }, {
        output_dir?: string | undefined;
        entry_point?: string | undefined;
        externals?: string[] | undefined;
        assets?: string[] | undefined;
    }>>;
    activation_events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    configuration: z.ZodOptional<z.ZodObject<{
        schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        defaults: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        ui_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        schema?: Record<string, any> | undefined;
        defaults?: Record<string, any> | undefined;
        ui_schema?: Record<string, any> | undefined;
    }, {
        schema?: Record<string, any> | undefined;
        defaults?: Record<string, any> | undefined;
        ui_schema?: Record<string, any> | undefined;
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
        license?: string | undefined;
        repository?: string | undefined;
        homepage?: string | undefined;
        bugs?: string | undefined;
        keywords?: string[] | undefined;
        categories?: string[] | undefined;
        changelog?: string | undefined;
        readme?: string | undefined;
    }, {
        license?: string | undefined;
        repository?: string | undefined;
        homepage?: string | undefined;
        bugs?: string | undefined;
        keywords?: string[] | undefined;
        categories?: string[] | undefined;
        changelog?: string | undefined;
        readme?: string | undefined;
    }>>;
    compatibility: z.ZodOptional<z.ZodObject<{
        min_system_version: z.ZodOptional<z.ZodString>;
        max_system_version: z.ZodOptional<z.ZodString>;
        platforms: z.ZodOptional<z.ZodArray<z.ZodEnum<["web", "desktop", "server"]>, "many">>;
        browsers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        min_system_version?: string | undefined;
        max_system_version?: string | undefined;
        platforms?: ("server" | "web" | "desktop")[] | undefined;
        browsers?: Record<string, string> | undefined;
    }, {
        min_system_version?: string | undefined;
        max_system_version?: string | undefined;
        platforms?: ("server" | "web" | "desktop")[] | undefined;
        browsers?: Record<string, string> | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        content_security_policy: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            permissions?: string[] | undefined;
        }, {
            permissions?: string[] | undefined;
            enabled?: boolean | undefined;
        }>>;
        trusted_domains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        content_security_policy?: string | undefined;
        sandbox?: {
            enabled: boolean;
            permissions?: string[] | undefined;
        } | undefined;
        trusted_domains?: string[] | undefined;
    }, {
        content_security_policy?: string | undefined;
        sandbox?: {
            permissions?: string[] | undefined;
            enabled?: boolean | undefined;
        } | undefined;
        trusted_domains?: string[] | undefined;
    }>>;
    publishing: z.ZodOptional<z.ZodObject<{
        private: z.ZodDefault<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodString>;
        access: z.ZodDefault<z.ZodEnum<["public", "private", "restricted"]>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        private: boolean;
        access: "private" | "public" | "restricted";
        tags?: string[] | undefined;
        registry?: string | undefined;
    }, {
        private?: boolean | undefined;
        tags?: string[] | undefined;
        registry?: string | undefined;
        access?: "private" | "public" | "restricted" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    version: string;
    main: string;
    author: {
        name: string;
        url?: string | undefined;
        email?: string | undefined;
    };
    manifest_version: "1.0";
    extension_type: "node" | "transform" | "ui" | "storage";
    metadata?: {
        license?: string | undefined;
        repository?: string | undefined;
        homepage?: string | undefined;
        bugs?: string | undefined;
        keywords?: string[] | undefined;
        categories?: string[] | undefined;
        changelog?: string | undefined;
        readme?: string | undefined;
    } | undefined;
    ui?: {
        category?: string | undefined;
        icon?: string | undefined;
        themes?: string[] | undefined;
        css?: string[] | undefined;
        components?: Record<string, string> | undefined;
    } | undefined;
    runtime?: {
        node_types?: string[] | undefined;
        transforms?: string[] | undefined;
        storage_providers?: string[] | undefined;
        background_tasks?: string[] | undefined;
    } | undefined;
    capabilities?: {
        provides?: string[] | undefined;
        requires?: string[] | undefined;
        optional?: string[] | undefined;
    } | undefined;
    dependencies?: {
        system?: string | undefined;
        extensions?: Record<string, string> | undefined;
        npm?: Record<string, string> | undefined;
    } | undefined;
    permissions?: ("storage" | "file-system-read" | "file-system-write" | "network" | "ui-components" | "runtime-nodes" | "system-info" | "extensions-api")[] | undefined;
    configuration?: {
        schema?: Record<string, any> | undefined;
        defaults?: Record<string, any> | undefined;
        ui_schema?: Record<string, any> | undefined;
    } | undefined;
    compatibility?: {
        min_system_version?: string | undefined;
        max_system_version?: string | undefined;
        platforms?: ("server" | "web" | "desktop")[] | undefined;
        browsers?: Record<string, string> | undefined;
    } | undefined;
    security?: {
        content_security_policy?: string | undefined;
        sandbox?: {
            enabled: boolean;
            permissions?: string[] | undefined;
        } | undefined;
        trusted_domains?: string[] | undefined;
    } | undefined;
    build?: {
        output_dir: string;
        entry_point?: string | undefined;
        externals?: string[] | undefined;
        assets?: string[] | undefined;
    } | undefined;
    activation_events?: string[] | undefined;
    publishing?: {
        private: boolean;
        access: "private" | "public" | "restricted";
        tags?: string[] | undefined;
        registry?: string | undefined;
    } | undefined;
}, {
    id: string;
    name: string;
    description: string;
    version: string;
    main: string;
    author: {
        name: string;
        url?: string | undefined;
        email?: string | undefined;
    };
    manifest_version: "1.0";
    extension_type: "node" | "transform" | "ui" | "storage";
    metadata?: {
        license?: string | undefined;
        repository?: string | undefined;
        homepage?: string | undefined;
        bugs?: string | undefined;
        keywords?: string[] | undefined;
        categories?: string[] | undefined;
        changelog?: string | undefined;
        readme?: string | undefined;
    } | undefined;
    ui?: {
        category?: string | undefined;
        icon?: string | undefined;
        themes?: string[] | undefined;
        css?: string[] | undefined;
        components?: Record<string, string> | undefined;
    } | undefined;
    runtime?: {
        node_types?: string[] | undefined;
        transforms?: string[] | undefined;
        storage_providers?: string[] | undefined;
        background_tasks?: string[] | undefined;
    } | undefined;
    capabilities?: {
        provides?: string[] | undefined;
        requires?: string[] | undefined;
        optional?: string[] | undefined;
    } | undefined;
    dependencies?: {
        system?: string | undefined;
        extensions?: Record<string, string> | undefined;
        npm?: Record<string, string> | undefined;
    } | undefined;
    permissions?: ("storage" | "file-system-read" | "file-system-write" | "network" | "ui-components" | "runtime-nodes" | "system-info" | "extensions-api")[] | undefined;
    configuration?: {
        schema?: Record<string, any> | undefined;
        defaults?: Record<string, any> | undefined;
        ui_schema?: Record<string, any> | undefined;
    } | undefined;
    compatibility?: {
        min_system_version?: string | undefined;
        max_system_version?: string | undefined;
        platforms?: ("server" | "web" | "desktop")[] | undefined;
        browsers?: Record<string, string> | undefined;
    } | undefined;
    security?: {
        content_security_policy?: string | undefined;
        sandbox?: {
            permissions?: string[] | undefined;
            enabled?: boolean | undefined;
        } | undefined;
        trusted_domains?: string[] | undefined;
    } | undefined;
    build?: {
        output_dir?: string | undefined;
        entry_point?: string | undefined;
        externals?: string[] | undefined;
        assets?: string[] | undefined;
    } | undefined;
    activation_events?: string[] | undefined;
    publishing?: {
        private?: boolean | undefined;
        tags?: string[] | undefined;
        registry?: string | undefined;
        access?: "private" | "public" | "restricted" | undefined;
    } | undefined;
}>;
export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;
export declare class ExtensionManifestParser {
    private static instance;
    private cache;
    private constructor();
    static getInstance(): ExtensionManifestParser;
    parseManifest(jsonString: string): ParseResult<ExtensionManifest>;
    parseManifestFromFile(filePath: string): Promise<ParseResult<ExtensionManifest>>;
    validateDependencies(manifest: ExtensionManifest, availableExtensions: Map<string, ExtensionManifest>): ExtensionValidationResult;
    checkCompatibility(manifest: ExtensionManifest, systemVersion: string, platform: string): ExtensionValidationResult;
    generateManifestTemplate(options: ManifestTemplateOptions): ExtensionManifest;
    clearCache(): void;
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
    validateManifest(manifest: ExtensionManifest, context: ValidationContext): ExtensionValidationResult;
    private validatePermissions;
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