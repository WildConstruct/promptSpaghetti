/**
 * Configuration for Python Executor Integration
 * Epic 8 Story 8.1.4: Configuration management for Python executor
 */
const DEFAULT_CONFIG = {
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
    allowedModules: [
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
    enableValidation: true
};
/**
 * Configuration manager for Python executor
 */
export class PythonExecutorConfigManager {
    config;
    listeners = [];
    constructor(initialConfig) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...this.loadFromEnvironment(),
            ...initialConfig
        };
    }
    /**
     * Get current configuration
     */
    get() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    update(updates) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...updates };
        // Validate configuration
        this.validateConfig();
        // Notify listeners
        this.notifyListeners();
        console.log('Python executor configuration updated:', {
            changed: this.getChangedFields(oldConfig, this.config),
            config: this.config
        });
    }
    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = { ...DEFAULT_CONFIG };
        this.notifyListeners();
    }
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment() {
        const envConfig = {};
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
            envConfig.fallbackBehavior = process.env.PYTHON_EXECUTOR_FALLBACK_BEHAVIOR;
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
    validateConfig() {
        const { config } = this;
        // Validate service URL
        if (!config.serviceUrl) {
            throw new Error('Python executor service URL is required');
        }
        try {
            new URL(config.serviceUrl);
        }
        catch {
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
    isValidMemoryLimit(limit) {
        return /^\d+(?:B|KB|MB|GB)$/.test(limit);
    }
    /**
     * Get changed fields between two configurations
     */
    getChangedFields(oldConfig, newConfig) {
        const changed = [];
        for (const key in newConfig) {
            if (newConfig[key] !== oldConfig[key]) {
                changed.push(key);
            }
        }
        return changed;
    }
    /**
     * Add configuration change listener
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    /**
     * Remove configuration change listener
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
    /**
     * Notify all listeners of configuration changes
     */
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.config);
            }
            catch (error) {
                console.error('Error in Python executor config listener:', error);
            }
        }
    }
    /**
     * Get configuration for a specific environment
     */
    getEnvironmentConfig(environment) {
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
                    timeout: 45000
                };
            case 'production':
                return {
                    enableDebugLogs: false,
                    enableMetrics: false,
                    enableTracing: false,
                    strictMode: true,
                    timeout: 30000
                };
            default:
                return {};
        }
    }
    /**
     * Apply environment-specific configuration
     */
    applyEnvironmentConfig(environment) {
        const envConfig = this.getEnvironmentConfig(environment);
        this.update(envConfig);
    }
    /**
     * Export configuration as JSON
     */
    toJSON() {
        return JSON.stringify(this.config, null, 2);
    }
    /**
     * Import configuration from JSON
     */
    fromJSON(json) {
        try {
            const config = JSON.parse(json);
            this.update(config);
        }
        catch (error) {
            throw new Error(`Invalid configuration JSON: ${error.message}`);
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
export function getPythonExecutorConfig() {
    return pythonExecutorConfig.get();
}
/**
 * Utility function to update configuration
 */
export function updatePythonExecutorConfig(updates) {
    pythonExecutorConfig.update(updates);
}
/**
 * Utility function to check if Python executor is configured
 */
export function isPythonExecutorConfigured() {
    const config = pythonExecutorConfig.get();
    return !!(config.serviceUrl && config.serviceUrl !== 'http://localhost:8001');
}
/**
 * Utility function to get safe configuration for client-side
 */
export function getClientSafeConfig() {
    const config = pythonExecutorConfig.get();
    const { apiKey, ...clientSafeConfig } = config;
    return clientSafeConfig;
}
