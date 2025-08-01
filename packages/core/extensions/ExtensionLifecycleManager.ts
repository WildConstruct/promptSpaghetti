/**
 * Extension Lifecycle Manager - Epic 8.4 Story 8.4.2
 * Manages the complete lifecycle of extensions including loading, activation, and disposal
 */
import { BaseExtension, 
  ExtensionContext, 
  ExtensionLifecycleState, 
  ExtensionError, 
  ExtensionErrorType,
  ExtensionValidationResult }
  ExtensionHealthStatus
 from './interfaces/ExtensionInterfaces';

// Extension Lifecycle Manager
export class ExtensionLifecycleManager {
  private static instance: ExtensionLifecycleManager;
  private extensions: Map<string, ExtensionLifecycleEntry> = new Map();
  private contexts: Map<string, ExtensionContext> = new Map();
  private eventEmitter = new EventTarget();
  private initialized = false;
  private constructor() {}
  public static getInstance(): ExtensionLifecycleManager { if (!ExtensionLifecycleManager.instance) {
      ExtensionLifecycleManager.instance = new ExtensionLifecycleManager() }
    return ExtensionLifecycleManager.instance;


  /**
   * Static helper to get active extensions
   */
  public static getActiveExtensions(): BaseExtension { return ExtensionLifecycleManager.getInstance().getExtensionsByState(ExtensionLifecycleState.ACTIVE) }

  /**
   * Initialize the lifecycle manager
   */
  public async initialize(): Promise<void> { if (this.initialized) {
      return }
    this.initialized = true;
    this.emit('manager:initialized');


  /**
   * Register an extension for lifecycle management
   */
  public async registerExtension(extension: BaseExtension): Promise<void> { if (this.extensions.has(extension.id)) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR
        extension.id }
        `Extension ${extension.id} is already registered`
      );

    // Validate extension
    const validationResult = await this.validateExtension(extension);
    if (!validationResult.valid) { throw new ExtensionError(
        ExtensionErrorType.VALIDATION_ERROR
        extension.id }
        `Extension validation failed: ${validationResult.errors.join(', ')}`
      );

    // Create lifecycle entry
    const entry: ExtensionLifecycleEntry = { extension
  state: ExtensionLifecycleState.UNINITIALIZED
  context: this.createExtensionContext(extension)
  registeredAt: new Date()
  lastStateChange: new Date()
  errors: []
  healthStatus: {
  status: 'healthy'
  lastChecked: new Date() }

    };
    this.extensions.set(extension.id, entry);
    this.contexts.set(extension.id, entry.context);
    this.emit('extension:registered', { extension, entry });


  /**
   * Unregister an extension
   */
  public async unregisterExtension(extensionId: string): Promise<void> { const entry = this.extensions.get(extensionId);
    if (!entry) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR
        extensionId }
        `Extension ${extensionId} is not registered`
      );

    // Dispose the extension if active
    if (entry.state === ExtensionLifecycleState.ACTIVE) { await this.deactivateExtension(extensionId) }
    if (entry.state === ExtensionLifecycleState.INITIALIZED) { await this.disposeExtension(extensionId) }
    this.extensions.delete(extensionId);
    this.contexts.delete(extensionId);
    this.emit('extension:unregistered', { extensionId, entry });


  /**
   * Initialize an extension
   */
  public async initializeExtension(extensionId: string): Promise<void> { const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.UNINITIALIZED) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR
        extensionId }
        `Extension ${extensionId} is not in uninitialized state`
      );

    try {
      this.setState(entry, ExtensionLifecycleState.INITIALIZING);
      // Validate dependencies
      await this.validateDependencies(entry.extension);
      // Initialize the extension
      await entry.extension.initialize();
      this.setState(entry, ExtensionLifecycleState.INITIALIZED);
      this.emit('extension:initialized', { extensionId, entry });
 catch (error) { this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR
        extensionId }
        `Failed to initialize extension: ${error.message}`
        error
      );



  /**
   * Activate an extension
   */
  public async activateExtension(extensionId: string): Promise<void> { const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.INITIALIZED) {
      if (entry.state === ExtensionLifecycleState.UNINITIALIZED) {
        await this.initializeExtension(extensionId) } else { throw new ExtensionError(
          ExtensionErrorType.ACTIVATION_ERROR
          extensionId }
          `Extension ${extensionId} is not in initialized state`
        );


    try {
      this.setState(entry, ExtensionLifecycleState.ACTIVATING);
      // Validate permissions
      await this.validatePermissions(entry.extension);
      // Activate the extension
      await entry.extension.activate();
      this.setState(entry, ExtensionLifecycleState.ACTIVE);
      entry.activatedAt = new Date();
      this.emit('extension:activated', { extensionId, entry });
 catch (error) { this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.ACTIVATION_ERROR
        extensionId }
        `Failed to activate extension: ${error.message}`
        error
      );


  /**
   * Deactivate an extension
   */
  public async deactivateExtension(extensionId: string): Promise<void> { const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.ACTIVE) {
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR
        extensionId }
        `Extension ${extensionId} is not in active state`
      );

    try {
      this.setState(entry, ExtensionLifecycleState.DEACTIVATING);
      // Deactivate the extension
      await entry.extension.deactivate();
      this.setState(entry, ExtensionLifecycleState.DEACTIVATED);
      entry.deactivatedAt = new Date();
      this.emit('extension:deactivated', { extensionId, entry });
 catch (error) { this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR
        extensionId }
        `Failed to deactivate extension: ${error.message}`
        error
      );


  /**
   * Dispose an extension
   */
  public async disposeExtension(extensionId: string): Promise<void> { const entry = this.getExtensionEntry(extensionId);
    if (entry.state === ExtensionLifecycleState.ACTIVE) {
      await this.deactivateExtension(extensionId) }
    if (entry.state !== ExtensionLifecycleState.DEACTIVATED && 
        entry.state !== ExtensionLifecycleState.INITIALIZED) { throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR
        extensionId }
        `Extension ${extensionId} cannot be disposed in current state`
      );

    try {
      // Dispose the extension
      await entry.extension.dispose();
      this.setState(entry, ExtensionLifecycleState.DISPOSED);
      entry.disposedAt = new Date();
      this.emit('extension:disposed', { extensionId, entry });
 catch (error) { this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR
        extensionId }
        `Failed to dispose extension: ${error.message}`
        error
      );


  /**
   * Get extension by ID
   */
  public getExtension(extensionId: string): BaseExtension | undefined { return this.extensions.get(extensionId)?.extension }
  /**
   * Get all extensions
   */
  public getAllExtensions(): BaseExtension { return Array.from(this.extensions.values()).map(entry => entry.extension) }
  /**
   * Get extensions by state
   */
  public getExtensionsByState(state: ExtensionLifecycleState): BaseExtension { return Array.from(this.extensions.values())
      .filter(entry => entry.state === state)
      .map(entry => entry.extension) }
  /**
   * Get extension state
   */
  public getExtensionState(extensionId: string): ExtensionLifecycleState { const entry = this.extensions.get(extensionId);
  return entry ? entry.state : ExtensionLifecycleState.UNINITIALIZED }
  /**
   * Get extension context
   */
  public getExtensionContext(extensionId: string): ExtensionContext | undefined { return this.contexts.get(extensionId) }
  /**
  * Get extension health status
  */
  public getExtensionHealth(extensionId: string): ExtensionHealthStatus { const entry = this.extensions.get(extensionId);
  if (!entry) {
  return {
  status: 'error'
  message: 'Extension not found'
  lastChecked: new Date() }
};

    return entry.healthStatus;

  /**
   * Check extension health
   */
  public async checkExtensionHealth(extensionId: string): Promise<ExtensionHealthStatus> { const entry = this.getExtensionEntry(extensionId);
  try {
  const isHealthy = entry.extension.isHealthy();
  const healthStatus = entry.extension.getHealthStatus();
  entry.healthStatus = {
  ...healthStatus
  lastChecked: new Date() }
};
      return entry.healthStatus;
 catch (error) { entry.healthStatus = {
  status: 'error'
  message: error.message
  lastChecked: new Date() }
};
      return entry.healthStatus;


  /**
   * Get extension statistics
   */
  public getExtensionStatistics(): ExtensionStatistics { const stats: ExtensionStatistics = {
  total: this.extensions.size
  byState: {
  uninitialized: 0
  initializing: 0
  initialized: 0
  activating: 0
  active: 0
  deactivating: 0
  deactivated: 0
  error: 0
  disposed: 0 }

      byType: {}
      errors: 0
      healthy: 0;
  };
    // Initialize state counters
    Object.values(ExtensionLifecycleState).forEach(state => { stats.byState[state] = 0 });
    // Count extensions
    Array.from(this.extensions.values()).forEach(entry => { stats.byState[entry.state]++;
      // Count by type (assuming extension has a type property)
      const type = (entry.extension as any).extensionType || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      // Count errors
      if (entry.errors.length > 0) {
        stats.errors++ }
      // Count healthy
      if (entry.healthStatus.status === 'healthy') { stats.healthy++ }
    });
    return stats;

  /**
   * Event handling
   */
  public on(event: string, listener: (data: any) => void): void { this.eventEmitter.addEventListener(event, listener as any) }
  
  public off(event: string, listener: (data: any) => void): void { this.eventEmitter.removeEventListener(event, listener as any) }
  
  private emit(event: string, data?: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));

  /**
   * Private helper methods
   */
  private getExtensionEntry(extensionId: string): ExtensionLifecycleEntry { const entry = this.extensions.get(extensionId);
    if (!entry) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR
        extensionId }
        `Extension ${extensionId} is not registered`
      );

    return entry;

  private setState(entry: ExtensionLifecycleEntry, state: ExtensionLifecycleState): void { entry.state = state;
    entry.lastStateChange = new Date() }
  private addError(entry: ExtensionLifecycleEntry, error: Error): void { entry.errors.push({
  error
  timestamp: new Date() }
});

  private async validateExtension(extension: BaseExtension): Promise<ExtensionValidationResult> { const errors: string = [];
  const warnings: string = [];
  // Basic validation
  if (!extension.id) errors.push('Extension ID is required');
  if (!extension.name) errors.push('Extension name is required');
  if (!extension.version) errors.push('Extension version is required');
  if (!extension.description) errors.push('Extension description is required');
  if (!extension.author) errors.push('Extension author is required');
  // Lifecycle methods validation
  if (typeof extension.initialize !== 'function') {
  errors.push('Extension must implement initialize method') }
    if (typeof extension.activate !== 'function') { errors.push('Extension must implement activate method') }
    if (typeof extension.deactivate !== 'function') { errors.push('Extension must implement deactivate method') }
    if (typeof extension.dispose !== 'function') { errors.push('Extension must implement dispose method') }
    // Version validation
    if (extension.version && !this.isValidVersion(extension.version)) { errors.push('Extension version must follow semantic versioning') }
    // Duplicate ID check
    if (this.extensions.has(extension.id)) {
      errors.push(`Extension ID ${extension.id} is already registered`);

    return { valid: errors.length === 0
  errors }
  warnings
};

  private async validateDependencies(extension: BaseExtension): Promise<void> { if (!extension.dependencies || extension.dependencies.length === 0) {
      return }
    const missingDependencies: string = [];
    for (const dependency of extension.dependencies) { const dependencyEntry = this.extensions.get(dependency);
      if (!dependencyEntry) {
        missingDependencies.push(dependency) } else if (dependencyEntry.state !== ExtensionLifecycleState.ACTIVE) { // Try to activate the dependency
        await this.activateExtension(dependency) }

    if (missingDependencies.length > 0) { throw new ExtensionError(
        ExtensionErrorType.DEPENDENCY_ERROR
        extension.id }
        `Missing dependencies: ${missingDependencies.join(', ')}`
      );


  private async validatePermissions(extension: BaseExtension): Promise<void> { if (!extension.permissions || extension.permissions.length === 0) {
      return }
    // In a real implementation, this would check against a permission system
    // For now, we'll just validate the format
    const invalidPermissions: string = [];
    for (const permission of extension.permissions) { if (!permission || typeof permission !== 'string') {
        invalidPermissions.push(permission) }

    if (invalidPermissions.length > 0) { throw new ExtensionError(
        ExtensionErrorType.PERMISSION_ERROR
        extension.id }
        `Invalid permissions: ${invalidPermissions.join(', ')}`
      );


  private createExtensionContext(extension: BaseExtension): ExtensionContext { return {
  extensionId: extension.id
  systemVersion: '1.0.0', // This would come from the system
  logger: this.createLogger(extension.id)
  storage: this.createStorage(extension.id)
  events: this.createEventEmitter(extension.id)
  runtime: this.createRuntime(extension.id)
  ui: this.createUIContext(extension.id)
  api: this.createAPIContext(extension.id) }
};

  private createLogger(extensionId: string): any {
    return {
      debug: (message: string, ...args: any) => console.debug(`[${extensionId}] ${message}`, ...args)
      info: (message: string, ...args: any) => console.info(`[${extensionId}] ${message}`, ...args)
      warn: (message: string, ...args: any) => console.warn(`[${extensionId}] ${message}`, ...args)
      error: (message: string, ...args: any) => console.error(`[${extensionId}] ${message}`, ...args)
      trace: (message: string, ...args: any) => console.trace(`[${extensionId}] ${message}`, ...args)
    };

  private createStorage(extensionId: string): any {
    // This would be a real storage implementation
    const storage = new Map<string, any>();
    return {
      get: async (key: string) => storage.get(`${extensionId}:${key}`)
      set: async (key: string, value: any) => storage.set(`${extensionId}:${key}`, value)
      delete: async (key: string) => storage.delete(`${extensionId}:${key}`)
      clear: async () => {
        for (const key of storage.keys()) {
          if (key.startsWith(`${extensionId}:`)) { storage.delete(key) }


      keys: async () => {
        return Array.from(storage.keys())
          .filter(key => key.startsWith(`${extensionId}:`))
          .map(key => key.substring(extensionId.length + 1))

      getScoped: (scope: string) => this.createStorage(`${extensionId}:${scope}`)
    };

  private createEventEmitter(extensionId: string): any { // This would be a scoped event emitter
    return this.eventEmitter }
  private createRuntime(extensionId: string): any { return {
  version: '1.0.0'
  environment: 'development'
  getSystemInfo: () => ({
  version: '1.0.0'
  platform: process.platform
  architecture: process.arch
  nodeVersion: process.version
  memoryUsage: process.memoryUsage()
  uptime: process.uptime() }
})
      getPerformanceMetrics: () => ({ 
  executionTime: 0
  memoryUsage: 0
  cpuUsage: 0
  activeNodes: 0
  totalExecutions: 0 }
})
      registerNode: (nodeDefinition: any) => {
        // This would register with the node registry

      unregisterNode: (nodeId: string) => {
        // This would unregister from the node registry

      getRegisteredNodes: () => { // This would return registered nodes
        return [] }
    };

  private createUIContext(extensionId: string): any { return {
  registerComponent: (componentId: string, component: any) => { }
  // This would register with the UI system

      unregisterComponent: (componentId: string) => {
        // This would unregister from the UI system

      registerInspectorEditor: (nodeType: string, editor: any) => {
        // This would register with the inspector system

      unregisterInspectorEditor: (nodeType: string) => {
        // This would unregister from the inspector system

      registerMenuItem: (menuId: string, item: any) => {
        // This would register with the menu system

      unregisterMenuItem: (menuId: string, itemId: string) => {
        // This would unregister from the menu system

      showNotification: (notification: any) => {
        // This would show a notification

      showModal: (modal: any) => {
        // This would show a modal

    };

  private createAPIContext(extensionId: string): any {
    return {
      createHttpClient: () => {
        // This would return an HTTP client
        return {}

      registerEndpoint: (path: string, handler: any) => {
        // This would register an API endpoint

      unregisterEndpoint: (path: string) => {
        // This would unregister an API endpoint

      registerMiddleware: (middleware: any) => {
        // This would register middleware

      unregisterMiddleware: (middlewareId: string) => {
        // This would unregister middleware

    };

  private isValidVersion(version: string): boolean { // Basic semantic version validation
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version) }


// Extension Lifecycle Entry

interface ExtensionLifecycleEntry { extension: BaseExtension;
  state: ExtensionLifecycleState;
  context: ExtensionContext;
  registeredAt: Date;
  lastStateChange: Date;
  activatedAt?: Date;
  deactivatedAt?: Date;
  disposedAt?: Date;
  errors: Array<{ }
  error: Error;
  timestamp: Date;

>;
  healthStatus: ExtensionHealthStatus;


// Extension Statistics

interface ExtensionStatistics { total: number;
  byState: Record<ExtensionLifecycleState, number>;
  byType: Record<string, number>;
  errors: number;
  healthy: number }


// Export singleton instance
export const extensionLifecycleManager = ExtensionLifecycleManager.getInstance();