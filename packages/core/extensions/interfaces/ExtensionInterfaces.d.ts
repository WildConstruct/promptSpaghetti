/**
 * Core Extension Interfaces - Epic 8.4 Story 8.4.2
 * Defines the fundamental interfaces that all extensions must implement
 */
import { z } from 'zod';
export interface BaseExtension {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly description: string;
    readonly author: string;
    readonly dependencies: string[];
    readonly permissions: string[];
    readonly extensionType: string;
    initialize(): Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    dispose(): Promise<void>;
    getConfiguration(): Record<string, any>;
    setConfiguration(config: Record<string, any>): void;
    isHealthy(): boolean;
    getHealthStatus(): ExtensionHealthStatus;
}
export interface ExtensionHealthStatus {
    status: 'healthy' | 'warning' | 'error';
    message?: string;
    lastChecked: Date;
    details?: Record<string, any>;
}
export interface ExtensionContext {
    readonly extensionId: string;
    readonly systemVersion: string;
    readonly logger: ExtensionLogger;
    readonly storage: ExtensionStorage;
    readonly events: ExtensionEventEmitter;
    readonly runtime: ExtensionRuntime;
    readonly ui: ExtensionUIContext;
    readonly api: ExtensionAPIContext;
}
export interface ExtensionLogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    trace(message: string, ...args: any[]): void;
}
export interface ExtensionStorage {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    getScoped(scope: string): ExtensionStorage;
}
export interface ExtensionEventEmitter {
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    once(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
}
export interface ExtensionRuntime {
    readonly version: string;
    readonly environment: 'development' | 'production' | 'test';
    getSystemInfo(): SystemInfo;
    getPerformanceMetrics(): PerformanceMetrics;
    registerNode(nodeDefinition: NodeDefinition): void;
    unregisterNode(nodeId: string): void;
    getRegisteredNodes(): NodeDefinition[];
}
export interface ExtensionUIContext {
    registerComponent(componentId: string, component: React.ComponentType<any>): void;
    unregisterComponent(componentId: string): void;
    registerInspectorEditor(nodeType: string, editor: React.ComponentType<any>): void;
    unregisterInspectorEditor(nodeType: string): void;
    registerMenuItem(menuId: string, item: MenuItem): void;
    unregisterMenuItem(menuId: string, itemId: string): void;
    showNotification(notification: Notification): void;
    showModal(modal: ModalDefinition): void;
}
export interface ExtensionAPIContext {
    createHttpClient(): HttpClient;
    registerEndpoint(path: string, handler: APIHandler): void;
    unregisterEndpoint(path: string): void;
    registerMiddleware(middleware: APIMiddleware): void;
    unregisterMiddleware(middlewareId: string): void;
}
export interface SystemInfo {
    version: string;
    platform: string;
    architecture: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
}
export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeNodes: number;
    totalExecutions: number;
}
export interface NodeDefinition {
    id: string;
    name: string;
    category: string;
    description: string;
    version: string;
    nodeClass: new (id: string, config: any) => any;
    editorComponent?: React.ComponentType<any>;
    icon?: string;
    color?: string;
    schema: z.ZodSchema<any>;
    metadata: {
        author: string;
        license: string;
        repository?: string;
        documentation?: string;
    };
}
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    action: () => void;
    disabled?: boolean;
    submenu?: MenuItem[];
}
export interface Notification {
    id?: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    duration?: number;
    actions?: NotificationAction[];
}
export interface NotificationAction {
    label: string;
    action: () => void;
    primary?: boolean;
}
export interface ModalDefinition {
    id: string;
    title: string;
    content: React.ComponentType<any>;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closable?: boolean;
    onClose?: () => void;
}
export interface HttpClient {
    get<T>(url: string, options?: RequestOptions): Promise<T>;
    post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    put<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    delete<T>(url: string, options?: RequestOptions): Promise<T>;
}
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    validateStatus?: (status: number) => boolean;
}
export interface APIHandler {
    (request: APIRequest, response: APIResponse): Promise<void> | void;
}
export interface APIRequest {
    method: string;
    url: string;
    path: string;
    query: Record<string, any>;
    params: Record<string, any>;
    headers: Record<string, string>;
    body: any;
    user?: any;
}
export interface APIResponse {
    status(code: number): APIResponse;
    json(data: any): APIResponse;
    send(data: any): APIResponse;
    header(name: string, value: string): APIResponse;
    redirect(url: string): APIResponse;
}
export interface APIMiddleware {
    id: string;
    priority: number;
    handler: (request: APIRequest, response: APIResponse, next: () => void) => Promise<void> | void;
}
export declare enum ExtensionLifecycleState {
    UNINITIALIZED = "uninitialized",
    INITIALIZING = "initializing",
    INITIALIZED = "initialized",
    ACTIVATING = "activating",
    ACTIVE = "active",
    DEACTIVATING = "deactivating",
    DEACTIVATED = "deactivated",
    ERROR = "error",
    DISPOSED = "disposed"
}
export declare enum ExtensionErrorType {
    INITIALIZATION_ERROR = "initialization_error",
    ACTIVATION_ERROR = "activation_error",
    RUNTIME_ERROR = "runtime_error",
    CONFIGURATION_ERROR = "configuration_error",
    DEPENDENCY_ERROR = "dependency_error",
    PERMISSION_ERROR = "permission_error",
    VALIDATION_ERROR = "validation_error"
}
export declare class ExtensionError extends Error {
    readonly type: ExtensionErrorType;
    readonly extensionId: string;
    readonly cause?: Error | undefined;
    constructor(type: ExtensionErrorType, extensionId: string, message: string, cause?: Error | undefined);
}
export interface ExtensionValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare const ExtensionManifestSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    author: z.ZodString;
    license: z.ZodString;
    engines: z.ZodObject<{
        promptSpaghetti: z.ZodString;
        node: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        promptSpaghetti: string;
        node?: string | undefined;
    }, {
        promptSpaghetti: string;
        node?: string | undefined;
    }>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    optionalDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    main: z.ZodOptional<z.ZodString>;
    browser: z.ZodOptional<z.ZodString>;
    contributes: z.ZodOptional<z.ZodObject<{
        nodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        commands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        menus: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        themes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        nodes?: string[] | undefined;
        commands?: string[] | undefined;
        menus?: string[] | undefined;
        themes?: string[] | undefined;
        languages?: string[] | undefined;
    }, {
        nodes?: string[] | undefined;
        commands?: string[] | undefined;
        menus?: string[] | undefined;
        themes?: string[] | undefined;
        languages?: string[] | undefined;
    }>>;
    repository: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    bugs: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    configuration: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        type: "object";
        properties: Record<string, any>;
    }, {
        type: "object";
        properties: Record<string, any>;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    license: string;
    engines: {
        promptSpaghetti: string;
        node?: string | undefined;
    };
    main?: string | undefined;
    configuration?: {
        type: "object";
        properties: Record<string, any>;
    } | undefined;
    keywords?: string[] | undefined;
    permissions?: string[] | undefined;
    dependencies?: string[] | undefined;
    optionalDependencies?: string[] | undefined;
    browser?: string | undefined;
    contributes?: {
        nodes?: string[] | undefined;
        commands?: string[] | undefined;
        menus?: string[] | undefined;
        themes?: string[] | undefined;
        languages?: string[] | undefined;
    } | undefined;
    repository?: string | undefined;
    homepage?: string | undefined;
    bugs?: string | undefined;
}, {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    license: string;
    engines: {
        promptSpaghetti: string;
        node?: string | undefined;
    };
    main?: string | undefined;
    configuration?: {
        type: "object";
        properties: Record<string, any>;
    } | undefined;
    keywords?: string[] | undefined;
    permissions?: string[] | undefined;
    dependencies?: string[] | undefined;
    optionalDependencies?: string[] | undefined;
    browser?: string | undefined;
    contributes?: {
        nodes?: string[] | undefined;
        commands?: string[] | undefined;
        menus?: string[] | undefined;
        themes?: string[] | undefined;
        languages?: string[] | undefined;
    } | undefined;
    repository?: string | undefined;
    homepage?: string | undefined;
    bugs?: string | undefined;
}>;
export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;
export { NodeExtension, NodeDefinition as NodeExtensionDefinition, NodeCategory } from './NodeExtension';
export { UIExtension } from './UIExtension';
export { TransformExtension } from './TransformExtension';
export { StorageExtension } from './StorageExtension';
//# sourceMappingURL=ExtensionInterfaces.d.ts.map