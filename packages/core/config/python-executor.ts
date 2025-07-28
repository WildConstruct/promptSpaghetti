/**
 * Configuration for Python Executor Integration
 * Epic 8 Story 8.1.4: Configuration management for Python executor
 */

export interface PythonExecutorConfig {
  // Service connection
  serviceUrl: string;
  apiKey?: string;
  // Request settings
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  // Resource limits
  defaultMemoryLimit: string;
  defaultTimeout: number;
  maxMemoryLimit: string;
  maxTimeout: number;
  // Security settings
  strictMode: boolean;
  enableCaching: boolean;
  allowedModules: string[];
  // Fallback behavior
  fallbackBehavior: 'error' | 'skip' | 'default';
  defaultOutput: string;
  // Monitoring
  enableMetrics: boolean;
  enableTracing: boolean;
  enableAuditLogs: boolean;
  // Development
  enableDebugLogs: boolean;
  enableValidation: boolean;
}
const DEFAULT_CONFIG: PythonExecutorConfig = {
  // Service connection
  serviceUrl: process.env.PYTHON_EXECUTOR_URL || 'http://localhost:8001',
  apiKey: process.env.PYTHON_EXECUTOR_API_KEY,
  // Request settings
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  // Resource limits
  defaultMemoryLimit: '128MB',
  defaultTimeout: 30,
  maxMemoryLimit: '1GB',
  maxTimeout: 300,
  // Security settings
  strictMode: true,
  enableCaching: true,
  allowedModules: [,
    'json', 'math', 'datetime', 'random', 'string', 'itertools',
    'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib',
    're', 'base64'
  ],
  // Fallback behavior
  fallbackBehavior: 'error',
  defaultOutput: '',
  // Monitoring
  enableMetrics: process.env.NODE_ENV !== 'production',
  enableTracing: process.env.NODE_ENV !== 'production',
  enableAuditLogs: true,
  // Development
  enableDebugLogs: process.env.NODE_ENV === 'development',
  enableValidation: true,
};
/**
 * Configuration manager for Python executor
 */
export class PythonExecutorConfigManager {
  private config: PythonExecutorConfig;
  private listeners: ((config: PythonExecutorConfig) => void)[] = [];
  constructor(initialConfig?: Partial<PythonExecutorConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...this.loadFromEnvironment(),
      ...initialConfig
    };
  }
  /**
   * Get current configuration
   */
  get(): PythonExecutorConfig {
    return { ...this.config };
  }
  /**
   * Update configuration
   */
  update(updates: Partial<PythonExecutorConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };
    // Validate configuration
    this.validateConfig();
    // Notify listeners
    this.notifyListeners();
    console.log('Python executor configuration updated:', {)
      changed: this.getChangedFields(oldConfig, this.config),
      config: this.config,
    });
  }
  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.notifyListeners();
  }
  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): Partial<PythonExecutorConfig> {
    const envConfig: Partial<PythonExecutorConfig> = {};
    // Service connection
    if (process.env.PYTHON_EXECUTOR_URL) {
      envConfig.serviceUrl = process.env.PYTHON_EXECUTOR_URL;
    }
    if (process.env.PYTHON_EXECUTOR_API_KEY) {
      envConfig.apiKey = process.env.PYTHON_EXECUTOR_API_KEY;
    }
    // Request settings
    if (process.env.PYTHON_EXECUTOR_TIMEOUT) {
      envConfig.timeout = parseInt(process.env.PYTHON_EXECUTOR_TIMEOUT, 10);
    }
    if (process.env.PYTHON_EXECUTOR_RETRY_ATTEMPTS) {
      envConfig.retryAttempts = parseInt(process.env.PYTHON_EXECUTOR_RETRY_ATTEMPTS, 10);
    }
    // Resource limits
    if (process.env.PYTHON_EXECUTOR_DEFAULT_MEMORY_LIMIT) {
      envConfig.defaultMemoryLimit = process.env.PYTHON_EXECUTOR_DEFAULT_MEMORY_LIMIT;
    }
    if (process.env.PYTHON_EXECUTOR_DEFAULT_TIMEOUT) {
      envConfig.defaultTimeout = parseInt(process.env.PYTHON_EXECUTOR_DEFAULT_TIMEOUT, 10);
    }
    if (process.env.PYTHON_EXECUTOR_MAX_MEMORY_LIMIT) {
      envConfig.maxMemoryLimit = process.env.PYTHON_EXECUTOR_MAX_MEMORY_LIMIT;
    }
    if (process.env.PYTHON_EXECUTOR_MAX_TIMEOUT) {
      envConfig.maxTimeout = parseInt(process.env.PYTHON_EXECUTOR_MAX_TIMEOUT, 10);
    }
    // Security settings
    if (process.env.PYTHON_EXECUTOR_STRICT_MODE) {
      envConfig.strictMode = process.env.PYTHON_EXECUTOR_STRICT_MODE === 'true';
    }
    if (process.env.PYTHON_EXECUTOR_ENABLE_CACHING) {
      envConfig.enableCaching = process.env.PYTHON_EXECUTOR_ENABLE_CACHING === 'true';
    }
    if (process.env.PYTHON_EXECUTOR_ALLOWED_MODULES) {
      envConfig.allowedModules = process.env.PYTHON_EXECUTOR_ALLOWED_MODULES.split(',');
    }
    // Fallback behavior
    if (process.env.PYTHON_EXECUTOR_FALLBACK_BEHAVIOR) {
      envConfig.fallbackBehavior = process.env.PYTHON_EXECUTOR_FALLBACK_BEHAVIOR as 'error' | 'skip' | 'default';
    }
    if (process.env.PYTHON_EXECUTOR_DEFAULT_OUTPUT) {
      envConfig.defaultOutput = process.env.PYTHON_EXECUTOR_DEFAULT_OUTPUT;
    }
    // Monitoring
    if (process.env.PYTHON_EXECUTOR_ENABLE_METRICS) {
      envConfig.enableMetrics = process.env.PYTHON_EXECUTOR_ENABLE_METRICS === 'true';
    }
    if (process.env.PYTHON_EXECUTOR_ENABLE_TRACING) {
      envConfig.enableTracing = process.env.PYTHON_EXECUTOR_ENABLE_TRACING === 'true';
    }
    if (process.env.PYTHON_EXECUTOR_ENABLE_AUDIT_LOGS) {
      envConfig.enableAuditLogs = process.env.PYTHON_EXECUTOR_ENABLE_AUDIT_LOGS === 'true';
    }
    return envConfig;
  }
  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const { config } = this;
    // Validate service URL
    if (!config.serviceUrl) {
      throw new Error('Python executor service URL is required');
    }
    try {
      new URL(config.serviceUrl);
    } catch {
      throw new Error('Python executor service URL must be a valid URL');
    }
    // Validate timeouts
    if (config.timeout <= 0) {
      throw new Error('Timeout must be positive');
    }
    if (config.defaultTimeout <= 0) {
      throw new Error('Default timeout must be positive');
    }
    if (config.maxTimeout <= 0) {
      throw new Error('Max timeout must be positive');
    }
    if (config.defaultTimeout > config.maxTimeout) {
      throw new Error('Default timeout cannot exceed max timeout');
    }
    // Validate retry attempts
    if (config.retryAttempts < 0) {
      throw new Error('Retry attempts cannot be negative');
    }
    if (config.retryAttempts > 10) {
      throw new Error('Retry attempts should not exceed 10');
    }
    // Validate memory limits
    if (!this.isValidMemoryLimit(config.defaultMemoryLimit)) {
      throw new Error('Default memory limit must be a valid size (e.g., 128MB, 1GB)');
    }
    if (!this.isValidMemoryLimit(config.maxMemoryLimit)) {
      throw new Error('Max memory limit must be a valid size (e.g., 128MB, 1GB)');
    }
    // Validate allowed modules
    if (!Array.isArray(config.allowedModules)) {
      throw new Error('Allowed modules must be an array');
    }
    // Validate fallback behavior
    if (!['error', 'skip', 'default'].includes(config.fallbackBehavior)) {
      throw new Error('Fallback behavior must be one of: error, skip, default');
    }
  }
  /**
   * Check if memory limit is valid
   */
  private isValidMemoryLimit(limit: string): boolean {
    return /^\d+(?:B|KB|MB|GB)$/.test(limit);
  }
  /**
   * Get changed fields between two configurations
   */
  private getChangedFields(oldConfig: PythonExecutorConfig, newConfig: PythonExecutorConfig): string[] {
    const changed: string[] = [];
    for (const key in newConfig) {
      if (newConfig[key as keyof PythonExecutorConfig] !== oldConfig[key as keyof PythonExecutorConfig]) {
        changed.push(key);
      }
    }
    return changed;
  }
  /**
   * Add configuration change listener
   */
  addListener(listener: (config: PythonExecutorConfig) => void): void {
    this.listeners.push(listener);
  }
  /**
   * Remove configuration change listener
   */
  removeListener(listener: (config: PythonExecutorConfig) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in Python executor config listener:', error);
      }
    }
  }
  /**
   * Get configuration for a specific environment
   */
  getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<PythonExecutorConfig> {
    switch (environment) {
    case 'development':
      return {
        enableDebugLogs: true,
        enableMetrics: true,
        enableTracing: true,
        strictMode: false,
        timeout: 60000 // Longer timeout for development
      };
    case 'staging':
      return {
        enableDebugLogs: false,
        enableMetrics: true,
        enableTracing: true,
        strictMode: true,
        timeout: 45000,
      };
    case 'production':
      return {
        enableDebugLogs: false,
        enableMetrics: false,
        enableTracing: false,
        strictMode: true,
        timeout: 30000,
      };
    default:
      return {};
    }
  }
  /**
   * Apply environment-specific configuration
   */
  applyEnvironmentConfig(environment: 'development' | 'staging' | 'production'): void {
    const envConfig = this.getEnvironmentConfig(environment);
    this.update(envConfig);
  }
  /**
   * Export configuration as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }
  /**
   * Import configuration from JSON
   */
  fromJSON(json: string): void {
    try {
      const config = JSON.parse(json);
      this.update(config);
    } catch (error) {
      throw new Error(`Invalid configuration JSON: ${error.message}`);}
    }
  }
}
/**
 * Global configuration manager instance
 */
export const pythonExecutorConfig = new PythonExecutorConfigManager();
/**
 * Utility function to get current configuration
 */
export function getPythonExecutorConfig(): PythonExecutorConfig {
  return pythonExecutorConfig.get();
}
/**
 * Utility function to update configuration
 */
export function updatePythonExecutorConfig(updates: Partial<PythonExecutorConfig>): void {
  pythonExecutorConfig.update(updates);
}
/**
 * Utility function to check if Python executor is configured
 */
export function isPythonExecutorConfigured(): boolean {
  const config = pythonExecutorConfig.get();
  return !!(config.serviceUrl && config.serviceUrl !== 'http://localhost:8001');
}
/**
 * Utility function to get safe configuration for client-side
 */
export function getClientSafeConfig(): Omit<PythonExecutorConfig, 'apiKey'> {
  const config = pythonExecutorConfig.get();
  const { apiKey, ...clientSafeConfig } = config;
  return clientSafeConfig;
}