/**
 * Extension Lifecycle Manager - Epic 8.4 Story 8.4.2
 * Manages the complete lifecycle of extensions including loading, activation, and disposal
 */
import { ExtensionLifecycleState, ExtensionError, ExtensionErrorType } from './interfaces/ExtensionInterfaces';
// Extension Lifecycle Manager
export class ExtensionLifecycleManager {
  constructor() {
    this.extensions = new Map();
    this.contexts = new Map();
    this.eventEmitter = new EventTarget();
    this.initialized = false;
  }
  static getInstance() {
    if (!ExtensionLifecycleManager.instance) {
      ExtensionLifecycleManager.instance = new ExtensionLifecycleManager();
    }
    return ExtensionLifecycleManager.instance;
  }
  /**
   * Static helper to get active extensions
   */
  static getActiveExtensions() {
    return ExtensionLifecycleManager.getInstance().getExtensionsByState(ExtensionLifecycleState.ACTIVE);
  }
  /**
   * Initialize the lifecycle manager
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.emit('manager:initialized');
  }
  /**
   * Register an extension for lifecycle management
   */
  async registerExtension(extension) {
    if (this.extensions.has(extension.id)) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR,
        extension.id,
        `Extension ${extension.id} is already registered`
      );
    }
    // Validate extension
    const validationResult = await this.validateExtension(extension);
    if (!validationResult.valid) {
      throw new ExtensionError(
        ExtensionErrorType.VALIDATION_ERROR,
        extension.id,
        `Extension validation failed: ${validationResult.errors.join(', ')}`
      );
    }
    // Create lifecycle entry
    const entry = {
      extension,
      state: ExtensionLifecycleState.UNINITIALIZED,
      context: this.createExtensionContext(extension),
      registeredAt: new Date(),
      lastStateChange: new Date(),
      errors: [],
      healthStatus: {
        status: 'healthy',
        lastChecked: new Date(),
      },
    };
    this.extensions.set(extension.id, entry);
    this.contexts.set(extension.id, entry.context);
    this.emit('extension:registered', { extension, entry });
  }
  /**
   * Unregister an extension
   */
  async unregisterExtension(extensionId) {
    const entry = this.extensions.get(extensionId);
    if (!entry) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR,
        extensionId,
        `Extension ${extensionId} is not registered`
      );
    }
    // Dispose the extension if active
    if (entry.state === ExtensionLifecycleState.ACTIVE) {
      await this.deactivateExtension(extensionId);
    }
    if (entry.state === ExtensionLifecycleState.INITIALIZED) {
      await this.disposeExtension(extensionId);
    }
    this.extensions.delete(extensionId);
    this.contexts.delete(extensionId);
    this.emit('extension:unregistered', { extensionId, entry });
  }
  /**
   * Initialize an extension
   */
  async initializeExtension(extensionId) {
    const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.UNINITIALIZED) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR,
        extensionId,
        `Extension ${extensionId} is not in uninitialized state`
      );
    }
    try {
      this.setState(entry, ExtensionLifecycleState.INITIALIZING);
      // Validate dependencies
      await this.validateDependencies(entry.extension);
      // Initialize the extension
      await entry.extension.initialize();
      this.setState(entry, ExtensionLifecycleState.INITIALIZED);
      this.emit('extension:initialized', { extensionId, entry });
    } catch (error) {
      this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR,
        extensionId,
        `Failed to initialize extension: ${error.message}`,
        error
      );
    }
  }
  /**
   * Activate an extension
   */
  async activateExtension(extensionId) {
    const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.INITIALIZED) {
      if (entry.state === ExtensionLifecycleState.UNINITIALIZED) {
        await this.initializeExtension(extensionId);
      } else {
        throw new ExtensionError(
          ExtensionErrorType.ACTIVATION_ERROR,
          extensionId,
          `Extension ${extensionId} is not in initialized state`
        );
      }
    }
    try {
      this.setState(entry, ExtensionLifecycleState.ACTIVATING);
      // Validate permissions
      await this.validatePermissions(entry.extension);
      // Activate the extension
      await entry.extension.activate();
      this.setState(entry, ExtensionLifecycleState.ACTIVE);
      entry.activatedAt = new Date();
      this.emit('extension:activated', { extensionId, entry });
    } catch (error) {
      this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.ACTIVATION_ERROR,
        extensionId,
        `Failed to activate extension: ${error.message}`,
        error
      );
    }
  }
  /**
   * Deactivate an extension
   */
  async deactivateExtension(extensionId) {
    const entry = this.getExtensionEntry(extensionId);
    if (entry.state !== ExtensionLifecycleState.ACTIVE) {
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR,
        extensionId,
        `Extension ${extensionId} is not in active state`
      );
    }
    try {
      this.setState(entry, ExtensionLifecycleState.DEACTIVATING);
      // Deactivate the extension
      await entry.extension.deactivate();
      this.setState(entry, ExtensionLifecycleState.DEACTIVATED);
      entry.deactivatedAt = new Date();
      this.emit('extension:deactivated', { extensionId, entry });
    } catch (error) {
      this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR,
        extensionId,
        `Failed to deactivate extension: ${error.message}`,
        error
      );
    }
  }
  /**
   * Dispose an extension
   */
  async disposeExtension(extensionId) {
    const entry = this.getExtensionEntry(extensionId);
    if (entry.state === ExtensionLifecycleState.ACTIVE) {
      await this.deactivateExtension(extensionId);
    }
    if (entry.state !== ExtensionLifecycleState.DEACTIVATED && entry.state !== ExtensionLifecycleState.INITIALIZED) {
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR,
        extensionId,
        `Extension ${extensionId} cannot be disposed in current state`
      );
    }
    try {
      // Dispose the extension
      await entry.extension.dispose();
      this.setState(entry, ExtensionLifecycleState.DISPOSED);
      entry.disposedAt = new Date();
      this.emit('extension:disposed', { extensionId, entry });
    } catch (error) {
      this.setState(entry, ExtensionLifecycleState.ERROR);
      this.addError(entry, error);
      throw new ExtensionError(
        ExtensionErrorType.RUNTIME_ERROR,
        extensionId,
        `Failed to dispose extension: ${error.message}`,
        error
      );
    }
  }
  /**
   * Get extension by ID
   */
  getExtension(extensionId) {
    return this.extensions.get(extensionId)?.extension;
  }
  /**
   * Get all extensions
   */
  getAllExtensions() {
    return Array.from(this.extensions.values()).map(entry => entry.extension);
  }
  /**
   * Get extensions by state
   */
  getExtensionsByState(state) {
    return Array.from(this.extensions.values())
      .filter(entry => entry.state === state)
      .map(entry => entry.extension);
  }
  /**
   * Get extension state
   */
  getExtensionState(extensionId) {
    const entry = this.extensions.get(extensionId);
    return entry ? entry.state : ExtensionLifecycleState.UNINITIALIZED;
  }
  /**
   * Get extension context
   */
  getExtensionContext(extensionId) {
    return this.contexts.get(extensionId);
  }
  /**
   * Get extension health status
   */
  getExtensionHealth(extensionId) {
    const entry = this.extensions.get(extensionId);
    if (!entry) {
      return {
        status: 'error',
        message: 'Extension not found',
        lastChecked: new Date(),
      };
    }
    return entry.healthStatus;
  }
  /**
   * Check extension health
   */
  async checkExtensionHealth(extensionId) {
    const entry = this.getExtensionEntry(extensionId);
    try {
      const isHealthy = entry.extension.isHealthy();
      const healthStatus = entry.extension.getHealthStatus();
      entry.healthStatus = {
        ...healthStatus,
        lastChecked: new Date(),
      };
      return entry.healthStatus;
    } catch (error) {
      entry.healthStatus = {
        status: 'error',
        message: error.message,
        lastChecked: new Date(),
      };
      return entry.healthStatus;
    }
  }
  /**
   * Get extension statistics
   */
  getExtensionStatistics() {
    const stats = {
      total: this.extensions.size,
      byState: {
        uninitialized: 0,
        initializing: 0,
        initialized: 0,
        activating: 0,
        active: 0,
        deactivating: 0,
        deactivated: 0,
        error: 0,
        disposed: 0,
      },
      byType: {},
      errors: 0,
      healthy: 0,
    };
    // Initialize state counters
    Object.values(ExtensionLifecycleState).forEach(state => {
      stats.byState[state] = 0;
    });
    // Count extensions
    Array.from(this.extensions.values()).forEach(entry => {
      stats.byState[entry.state]++;
      // Count by type (assuming extension has a type property)
      const type = entry.extension.extensionType || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      // Count errors
      if (entry.errors.length > 0) {
        stats.errors++;
      }
      // Count healthy
      if (entry.healthStatus.status === 'healthy') {
        stats.healthy++;
      }
    });
    return stats;
  }
  /**
   * Event handling
   */
  on(event, listener) {
    this.eventEmitter.addEventListener(event, listener);
  }
  off(event, listener) {
    this.eventEmitter.removeEventListener(event, listener);
  }
  emit(event, data) {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
  /**
   * Private helper methods
   */
  getExtensionEntry(extensionId) {
    const entry = this.extensions.get(extensionId);
    if (!entry) {
      throw new ExtensionError(
        ExtensionErrorType.INITIALIZATION_ERROR,
        extensionId,
        `Extension ${extensionId} is not registered`
      );
    }
    return entry;
  }
  setState(entry, state) {
    entry.state = state;
    entry.lastStateChange = new Date();
  }
  addError(entry, error) {
    entry.errors.push({
      error,
      timestamp: new Date(),
    });
  }
  async validateExtension(extension) {
    const errors = [];
    const warnings = [];
    // Basic validation
    if (!extension.id) errors.push('Extension ID is required');
    if (!extension.name) errors.push('Extension name is required');
    if (!extension.version) errors.push('Extension version is required');
    if (!extension.description) errors.push('Extension description is required');
    if (!extension.author) errors.push('Extension author is required');
    // Lifecycle methods validation
    if (typeof extension.initialize !== 'function') {
      errors.push('Extension must implement initialize method');
    }
    if (typeof extension.activate !== 'function') {
      errors.push('Extension must implement activate method');
    }
    if (typeof extension.deactivate !== 'function') {
      errors.push('Extension must implement deactivate method');
    }
    if (typeof extension.dispose !== 'function') {
      errors.push('Extension must implement dispose method');
    }
    // Version validation
    if (extension.version && !this.isValidVersion(extension.version)) {
      errors.push('Extension version must follow semantic versioning');
    }
    // Duplicate ID check
    if (this.extensions.has(extension.id)) {
      errors.push(`Extension ID ${extension.id} is already registered`);
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  async validateDependencies(extension) {
    if (!extension.dependencies || extension.dependencies.length === 0) {
      return;
    }
    const missingDependencies = [];
    for (const dependency of extension.dependencies) {
      const dependencyEntry = this.extensions.get(dependency);
      if (!dependencyEntry) {
        missingDependencies.push(dependency);
      } else if (dependencyEntry.state !== ExtensionLifecycleState.ACTIVE) {
        // Try to activate the dependency
        await this.activateExtension(dependency);
      }
    }
    if (missingDependencies.length > 0) {
      throw new ExtensionError(
        ExtensionErrorType.DEPENDENCY_ERROR,
        extension.id,
        `Missing dependencies: ${missingDependencies.join(', ')}`
      );
    }
  }
  async validatePermissions(extension) {
    if (!extension.permissions || extension.permissions.length === 0) {
      return;
    }
    // In a real implementation, this would check against a permission system
    // For now, we'll just validate the format
    const invalidPermissions = [];
    for (const permission of extension.permissions) {
      if (!permission || typeof permission !== 'string') {
        invalidPermissions.push(permission);
      }
    }
    if (invalidPermissions.length > 0) {
      throw new ExtensionError(
        ExtensionErrorType.PERMISSION_ERROR,
        extension.id,
        `Invalid permissions: ${invalidPermissions.join(', ')}`
      );
    }
  }
  createExtensionContext(extension) {
    return {
      extensionId: extension.id,
      systemVersion: '1.0.0', // This would come from the system
      logger: this.createLogger(extension.id),
      storage: this.createStorage(extension.id),
      events: this.createEventEmitter(extension.id),
      runtime: this.createRuntime(extension.id),
      ui: this.createUIContext(extension.id),
      api: this.createAPIContext(extension.id),
    };
  }
  createLogger(extensionId) {
    return {
      debug: (message, ...args) => console.debug(`[${extensionId}] ${message}`, ...args),
      info: (message, ...args) => console.info(`[${extensionId}] ${message}`, ...args),
      warn: (message, ...args) => console.warn(`[${extensionId}] ${message}`, ...args),
      error: (message, ...args) => console.error(`[${extensionId}] ${message}`, ...args),
      trace: (message, ...args) => console.trace(`[${extensionId}] ${message}`, ...args),
    };
  }
  createStorage(extensionId) {
    // This would be a real storage implementation
    const storage = new Map();
    return {
      get: async key => storage.get(`${extensionId}:${key}`),
      set: async (key, value) => storage.set(`${extensionId}:${key}`, value),
      delete: async key => storage.delete(`${extensionId}:${key}`),
      clear: async () => {
        for (const key of storage.keys()) {
          if (key.startsWith(`${extensionId}:`)) {
            storage.delete(key);
          }
        }
      },
      keys: async () => {
        return Array.from(storage.keys())
          .filter(key => key.startsWith(`${extensionId}:`))
          .map(key => key.substring(extensionId.length + 1));
      },
      getScoped: scope => this.createStorage(`${extensionId}:${scope}`),
    };
  }
  createEventEmitter(extensionId) {
    // This would be a scoped event emitter
    return this.eventEmitter;
  }
  createRuntime(extensionId) {
    return {
      version: '1.0.0',
      environment: 'development',
      getSystemInfo: () => ({
        version: '1.0.0',
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      }),
      getPerformanceMetrics: () => ({
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        activeNodes: 0,
        totalExecutions: 0,
      }),
      registerNode: nodeDefinition => {
        // This would register with the node registry
      },
      unregisterNode: nodeId => {
        // This would unregister from the node registry
      },
      getRegisteredNodes: () => {
        // This would return registered nodes
        return [];
      },
    };
  }
  createUIContext(extensionId) {
    return {
      registerComponent: (componentId, component) => {
        // This would register with the UI system
      },
      unregisterComponent: componentId => {
        // This would unregister from the UI system
      },
      registerInspectorEditor: (nodeType, editor) => {
        // This would register with the inspector system
      },
      unregisterInspectorEditor: nodeType => {
        // This would unregister from the inspector system
      },
      registerMenuItem: (menuId, item) => {
        // This would register with the menu system
      },
      unregisterMenuItem: (menuId, itemId) => {
        // This would unregister from the menu system
      },
      showNotification: notification => {
        // This would show a notification
      },
      showModal: modal => {
        // This would show a modal
      },
    };
  }
  createAPIContext(extensionId) {
    return {
      createHttpClient: () => {
        // This would return an HTTP client
        return {};
      },
      registerEndpoint: (path, handler) => {
        // This would register an API endpoint
      },
      unregisterEndpoint: path => {
        // This would unregister an API endpoint
      },
      registerMiddleware: middleware => {
        // This would register middleware
      },
      unregisterMiddleware: middlewareId => {
        // This would unregister middleware
      },
    };
  }
  isValidVersion(version) {
    // Basic semantic version validation
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  }
}
// Export singleton instance
export const extensionLifecycleManager = ExtensionLifecycleManager.getInstance();
