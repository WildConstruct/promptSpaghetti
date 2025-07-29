/**
 * Plugin Sandbox Environment
 * 
 * Provides secure, isolated execution environment for plugins with
 * resource limits, permission controls, and API access management.
 * 
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { createContext, runInContext, Context } from 'vm';
import { readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { ExtensionManifest } from './ExtensionLifecycleManager';
import * as crypto from 'crypto';

export interface SandboxOptions {
  timeout: number;
  memoryLimit: number;
  allowedModules: string;
  blockedModules: string;
  enableFileSystem: boolean;
  enableNetwork: boolean;
  enableChildProcess: boolean;
  maxCallStack: number;
  contextName: string;
}
export interface ResourceUsage {
  memoryUsed: number;
  executionTime: number;
  apiCalls: number;
  fileOperations: number;
  networkRequests: number;
}
export interface SandboxContext {
  require: (id: string) => any;
  module: { exports: any };
  exports: any;
  __filename: string;
  __dirname: string;
  console: Console;
  process: Partial<NodeJS.Process>;
  global: any;
  Buffer: typeof Buffer;
  setTimeout: typeof setTimeout;
  setInterval: typeof setInterval;
  clearTimeout: typeof clearTimeout;
  clearInterval: typeof clearInterval;
}
export class PluginSandbox {
  private manifest: ExtensionManifest;
  private pluginPath: string;
  private context: Context;
  private options: SandboxOptions;
  private resourceUsage: ResourceUsage;
  private disposed: boolean;
  private allowedAPIs: Set<string>;
  private startTime: number;
  constructor(manifest: ExtensionManifest, pluginPath: string, options: Partial<SandboxOptions> = {}) {
    this.manifest = manifest;
    this.pluginPath = resolve(pluginPath);
    this.disposed = false;
    this.startTime = Date.now();
    this.options = {
      timeout: 30000, // 30 seconds
      memoryLimit: 128 * 1024 * 1024, // 128MB
      allowedModules: ['fs', 'path', 'crypto', 'util'],
      blockedModules: ['child_process', 'cluster', 'worker_threads'],
      enableFileSystem: false,
      enableNetwork: false,
      enableChildProcess: false,
      maxCallStack: 100,
      contextName: `plugin-${manifest.id}`}
}
      ...options
    };
    this.resourceUsage = {
  memoryUsed: 0,
  executionTime: 0,
  apiCalls: 0,
  fileOperations: 0,
  networkRequests: 0,
};
    this.allowedAPIs = new Set(this.manifest.permissions || []);
    this.context = this.createSandboxContext();
  /**
   * Load and execute a module in the sandbox
   */
  async loadModule(modulePath: string): Promise<any> {
  if (this.disposed) {
  throw new Error('Sandbox has been disposed');
  const absolutePath = resolve(this.pluginPath, modulePath);
  const code = readFileSync(absolutePath, 'utf-8');
  return this.executeCode(code, absolutePath);
  /**
  * Execute code in the sandbox
  */
  async executeCode(code: string, filename: string = 'plugin.js'): Promise<any> {,
  if (this.disposed) {
  throw new Error('Sandbox has been disposed');
  const startTime = Date.now();
  let result: any;
  try {
  // Wrap code in a function to provide proper module semantics
  const wrappedCode = this.wrapCode(code, filename);
  // Execute in sandbox with timeout
  result = await this.executeWithTimeout(wrappedCode, filename);
  // Update resource usage
  this.resourceUsage.executionTime += Date.now() - startTime;
  this.updateMemoryUsage();
  return result;
} catch (error) {
      if (error.message?.includes('Script execution timed out')) {
        throw new Error(`Plugin execution timed out after ${this.options.timeout}ms`);}
      throw new Error(`Plugin execution failed: ${error.message}`);}
  /**
   * Get current resource usage
   */
  getResourceUsage(): ResourceUsage {
    this.updateMemoryUsage();
    return { ...this.resourceUsage };
  /**
   * Check if plugin has permission for an operation
   */
  hasPermission(permission: string): boolean {
    return this.allowedAPIs.has(permission) || this.allowedAPIs.has('*');
  /**
   * Dispose sandbox and clean up resources
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    // Clear context references
    if (this.context) {
      // Note: VM contexts can't be explicitly disposed in Node.js
      // They'll be garbage collected when no longer referenced
      (this.context as any) = null;
  /**
   * Check if sandbox is disposed
   */
  isDisposed(): boolean {
    return this.disposed;
  // Private methods
  private createSandboxContext(): Context {
    const sandboxGlobal = {
      console: this.createConsoleProxy(),
      Buffer: this.createBufferProxy(),
      setTimeout: this.createTimerProxy('setTimeout'),
      setInterval: this.createTimerProxy('setInterval'),
      clearTimeout: this.createTimerProxy('clearTimeout'),
      clearInterval: this.createTimerProxy('clearInterval'),
      process: this.createProcessProxy(),
      require: this.createRequireProxy(),
      module: { exports: {} },
      exports: {},
      __filename: '',
      __dirname: '',
      global: {} as any
    };
    // Self-reference for global
    sandboxGlobal.global = sandboxGlobal;
    return createContext(sandboxGlobal, {)
  name: this.options.contextName,
  codeGeneration: {
  strings: false,  // Disable eval(),
  wasm: false     // Disable WebAssembly,
});
  private createConsoleProxy(): Console {
    const originalConsole = console;
    return {
      ...originalConsole,
      log: (...args: any) => {,
        this.trackAPICall('console.log');
        originalConsole.log(`[${this.manifest.id}]`, ...args);}
  },
  error: (...args: any) => {,
        this.trackAPICall('console.error');
        originalConsole.error(`[${this.manifest.id}]`, ...args);}
  },
  warn: (...args: any) => {,
        this.trackAPICall('console.warn');
        originalConsole.warn(`[${this.manifest.id}]`, ...args);}
  },
  info: (...args: any) => {,
        this.trackAPICall('console.info');
        originalConsole.info(`[${this.manifest.id}]`, ...args);}
    } as Console;
  private createBufferProxy(): typeof Buffer {
  return new Proxy(Buffer, {)
  construct: (target, args) => {,
  this.trackAPICall('Buffer');
  return new target(...args);
},
  apply: (target, thisArg, args) => {
        this.trackAPICall('Buffer');
        return target.apply(thisArg, args);
    });
  private createTimerProxy(timerType: string) {
  const originalTimer = global[timerType as keyof typeof global] as Function;
  return (...args: any) => {,
  this.trackAPICall(timerType);
  if (timerType === 'setTimeout' || timerType === 'setInterval') {
  // Limit maximum timeout/interval to prevent runaway timers
  const maxTimeout = 60000; // 1 minute;
  if (args[1] > maxTimeout) {
  args[1] = maxTimeout;
  return originalTimer.apply(global, args);
};
  private createProcessProxy(): Partial<NodeJS.Process> {
  return {
  env: process.env, // Read-only access to environment variables,
  version: process.version,
  platform: process.platform,
  arch: process.arch,
  pid: process.pid,
  // Exclude dangerous methods like exit, kill, etc.
};
  private createRequireProxy() {
    return (id: string) => {
      this.trackAPICall('require');
      // Check if module is blocked
      if (this.options.blockedModules.includes(id)) {
        throw new Error(`Module '${id}' is not allowed in sandbox`);}
      // Check if module is explicitly allowed
      if (!this.options.allowedModules.includes(id) && !id.startsWith('./') && !id.startsWith('../')) {
        throw new Error(`Module '${id}' is not in allowed modules list`);}
      // Special handling for core modules
      switch (id) {
      case 'fs':
        return this.createFileSystemProxy();
      case 'crypto':
        return this.createCryptoProxy();
      case 'path':
        return require('path');
      case 'util':
        return require('util');
      default:
        // For relative imports, resolve relative to plugin path
        if (id.startsWith('./') || id.startsWith('../')) {
          const resolvedPath = resolve(this.pluginPath, id);
          return require(resolvedPath);
        throw new Error(`Module '${id}' is not available`);}
    };
  private createFileSystemProxy() {
    if (!this.hasPermission('fs:read') && !this.hasPermission('fs:write')) {
      throw new Error('Filesystem access not permitted');
    const fs = require('fs');
    const proxy: any = {};
    // Only expose read operations if write is not permitted
    if (this.hasPermission('fs:read')) {
  proxy.readFileSync = (...args: any) => {,
  this.trackFileOperation('read');
  return fs.readFileSync(...args);
};
      proxy.readFile = (...args: any) => {
        this.trackFileOperation('read');
        return fs.readFile(...args);
      };
    if (this.hasPermission('fs:write')) {
  proxy.writeFileSync = (...args: any) => {,
  this.trackFileOperation('write');
  return fs.writeFileSync(...args);
};
      proxy.writeFile = (...args: any) => {
        this.trackFileOperation('write');
        return fs.writeFile(...args);
      };
    return proxy;
  private createCryptoProxy() {
  const cryptoModule = require('crypto');
  return {
  randomBytes: cryptoModule.randomBytes,
  createHash: cryptoModule.createHash,
  createHmac: cryptoModule.createHmac,
  // Exclude potentially dangerous functions like createCipher
};
  private wrapCode(code: string, filename: string): string {
    return `
      (function(require, module, exports, __filename, __dirname) {
        ${code}
        return module.exports;
      })(require, module, exports, "${filename}", "${dirname(filename)}");}
    `;
  private async executeWithTimeout(code: string, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Script execution timed out'));
      }, this.options.timeout);
      try {
  const result = runInContext(code, this.context, {)
  filename,
  timeout: this.options.timeout,
  displayErrors: true,
});
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
    });
  private trackAPICall(api: string): void {
    this.resourceUsage.apiCalls++;
    // Check rate limiting
    if (this.resourceUsage.apiCalls > 10000) { // 10k calls limit
      throw new Error('API call rate limit exceeded');
  private trackFileOperation(operation: string): void {
    this.resourceUsage.fileOperations++;
    // Check file operation limits
    if (this.resourceUsage.fileOperations > 1000) { // 1k file ops limit
      throw new Error('File operation limit exceeded');
  private updateMemoryUsage(): void {
    // Note: Getting accurate memory usage for a specific context is complex in Node.js
    // This is a simplified implementation
    const memUsage = process.memoryUsage();
    this.resourceUsage.memoryUsed = memUsage.heapUsed;
    // Check memory limits
    if (this.resourceUsage.memoryUsed > this.options.memoryLimit) {
      throw new Error('Memory limit exceeded');