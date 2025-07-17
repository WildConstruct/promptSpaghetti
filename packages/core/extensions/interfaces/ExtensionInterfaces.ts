/**
 * Core Extension Interfaces - Epic 8.4 Story 8.4.2
 * Defines the fundamental interfaces that all extensions must implement
 */

import { z } from 'zod';

// Base Extension Interface
export interface BaseExtension {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly dependencies: string[];
  readonly permissions: string[];
  readonly extensionType: string; // Extension type identifier (e.g., 'node', 'ui', 'transform', 'storage')
  
  // Lifecycle methods
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;
  
  // Configuration
  getConfiguration(): Record<string, any>;
  setConfiguration(config: Record<string, any>): void;
  
  // Health checking
  isHealthy(): boolean;
  getHealthStatus(): ExtensionHealthStatus;
}

// Extension Health Status
export interface ExtensionHealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message?: string;
  lastChecked: Date;
  details?: Record<string, any>;
}

// Extension Context - provides access to system resources
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

// Extension Logger
export interface ExtensionLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
}

// Extension Storage
export interface ExtensionStorage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  
  // Scoped storage
  getScoped(scope: string): ExtensionStorage;
}

// Extension Event Emitter
export interface ExtensionEventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, listener: (...args: any[]) => void): void;
  removeAllListeners(event?: string): void;
}

// Extension Runtime Context
export interface ExtensionRuntime {
  readonly version: string;
  readonly environment: 'development' | 'production' | 'test';
  
  // System access
  getSystemInfo(): SystemInfo;
  getPerformanceMetrics(): PerformanceMetrics;
  
  // Node registry access
  registerNode(nodeDefinition: NodeDefinition): void;
  unregisterNode(nodeId: string): void;
  getRegisteredNodes(): NodeDefinition[];
}

// Extension UI Context
export interface ExtensionUIContext {
  // Component registration
  registerComponent(componentId: string, component: React.ComponentType<any>): void;
  unregisterComponent(componentId: string): void;
  
  // Inspector extensions
  registerInspectorEditor(nodeType: string, editor: React.ComponentType<any>): void;
  unregisterInspectorEditor(nodeType: string): void;
  
  // Menu and toolbar extensions
  registerMenuItem(menuId: string, item: MenuItem): void;
  unregisterMenuItem(menuId: string, itemId: string): void;
  
  // Notification system
  showNotification(notification: Notification): void;
  showModal(modal: ModalDefinition): void;
}

// Extension API Context
export interface ExtensionAPIContext {
  // HTTP client
  createHttpClient(): HttpClient;
  
  // API endpoint registration
  registerEndpoint(path: string, handler: APIHandler): void;
  unregisterEndpoint(path: string): void;
  
  // Middleware registration
  registerMiddleware(middleware: APIMiddleware): void;
  unregisterMiddleware(middlewareId: string): void;
}

// System Information
export interface SystemInfo {
  version: string;
  platform: string;
  architecture: string;
  nodeVersion: string;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeNodes: number;
  totalExecutions: number;
}

// Node Definition Interface
export interface NodeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  
  // Node class constructor
  nodeClass: new (id: string, config: any) => any;
  
  // UI configuration
  editorComponent?: React.ComponentType<any>;
  icon?: string;
  color?: string;
  
  // Schema definition
  schema: z.ZodSchema<any>;
  
  // Metadata
  metadata: {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
  };
}

// Menu Item Interface
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  submenu?: MenuItem[];
}

// Notification Interface
export interface Notification {
  id?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

// Notification Action
export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

// Modal Definition
export interface ModalDefinition {
  id: string;
  title: string;
  content: React.ComponentType<any>;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  onClose?: () => void;
}

// HTTP Client Interface
export interface HttpClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  put<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
}

// Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

// API Handler
export interface APIHandler {
  (request: APIRequest, response: APIResponse): Promise<void> | void;
}

// API Request
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

// API Response
export interface APIResponse {
  status(code: number): APIResponse;
  json(data: any): APIResponse;
  send(data: any): APIResponse;
  header(name: string, value: string): APIResponse;
  redirect(url: string): APIResponse;
}

// API Middleware
export interface APIMiddleware {
  id: string;
  priority: number;
  handler: (request: APIRequest, response: APIResponse, next: () => void) => Promise<void> | void;
}

// Extension Lifecycle States
export enum ExtensionLifecycleState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  DEACTIVATED = 'deactivated',
  ERROR = 'error',
  DISPOSED = 'disposed'
}

// Extension Error Types
export enum ExtensionErrorType {
  INITIALIZATION_ERROR = 'initialization_error',
  ACTIVATION_ERROR = 'activation_error',
  RUNTIME_ERROR = 'runtime_error',
  CONFIGURATION_ERROR = 'configuration_error',
  DEPENDENCY_ERROR = 'dependency_error',
  PERMISSION_ERROR = 'permission_error',
  VALIDATION_ERROR = 'validation_error'
}

// Extension Error
export class ExtensionError extends Error {
  constructor(
    public readonly type: ExtensionErrorType,
    public readonly extensionId: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

// Extension Validation Result
export interface ExtensionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
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

export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;

// Re-export specific extension types
export { NodeExtension, NodeDefinition, NodeCategory } from './NodeExtension';
export { UIExtension } from './UIExtension';
export { TransformExtension } from './TransformExtension';
export { StorageExtension } from './StorageExtension';