"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonExecutorConfig = exports.PythonExecutorConfigManager = void 0;
exports.getPythonExecutorConfig = getPythonExecutorConfig;
exports.updatePythonExecutorConfig = updatePythonExecutorConfig;
exports.isPythonExecutorConfigured = isPythonExecutorConfigured;
exports.getClientSafeConfig = getClientSafeConfig;
const DEFAULT_CONFIG = {
    serviceUrl: process.env.PYTHON_EXECUTOR_URL || 'http://localhost:8001',
    apiKey: process.env.PYTHON_EXECUTOR_API_KEY,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    defaultMemoryLimit: '128MB',
    defaultTimeout: 30,
    maxMemoryLimit: '1GB',
    maxTimeout: 300,
    strictMode: true,
    enableCaching: true,
    allowedModules: [
        'json', 'math', 'datetime', 'random', 'string', 'itertools',
        'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib',
        're', 'base64'
    ],
    fallbackBehavior: 'error',
    defaultOutput: '',
    enableMetrics: process.env.NODE_ENV !== 'production',
    enableTracing: process.env.NODE_ENV !== 'production',
    enableAuditLogs: true,
    enableDebugLogs: process.env.NODE_ENV === 'development',
    enableValidation: true,
};
class PythonExecutorConfigManager {
    constructor(initialConfig) {
        this.listeners = [];
        this.config = {
            ...DEFAULT_CONFIG,
            ...this.loadFromEnvironment(),
            ...initialConfig,
        };
    }
    get() {
        return { ...this.config };
    }
    update(updates) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...updates };
        this.validateConfig();
        this.notifyListeners();
        console.log('Python executor configuration updated:', {
            changed: this.getChangedFields(oldConfig, this.config),
            config: this.config,
        });
    }
    reset() {
        this.config = { ...DEFAULT_CONFIG };
        this.notifyListeners();
    }
    loadFromEnvironment() {
        const envConfig = {};
        if (process.env.PYTHON_EXECUTOR_URL) {
            envConfig.serviceUrl = process.env.PYTHON_EXECUTOR_URL;
        }
        if (process.env.PYTHON_EXECUTOR_API_KEY) {
            envConfig.apiKey = process.env.PYTHON_EXECUTOR_API_KEY;
        }
        if (process.env.PYTHON_EXECUTOR_TIMEOUT) {
            envConfig.timeout = parseInt(process.env.PYTHON_EXECUTOR_TIMEOUT, 10);
        }
        if (process.env.PYTHON_EXECUTOR_RETRY_ATTEMPTS) {
            envConfig.retryAttempts = parseInt(process.env.PYTHON_EXECUTOR_RETRY_ATTEMPTS, 10);
        }
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
        if (process.env.PYTHON_EXECUTOR_STRICT_MODE) {
            envConfig.strictMode = process.env.PYTHON_EXECUTOR_STRICT_MODE === 'true';
        }
        if (process.env.PYTHON_EXECUTOR_ENABLE_CACHING) {
            envConfig.enableCaching = process.env.PYTHON_EXECUTOR_ENABLE_CACHING === 'true';
        }
        if (process.env.PYTHON_EXECUTOR_ALLOWED_MODULES) {
            envConfig.allowedModules = process.env.PYTHON_EXECUTOR_ALLOWED_MODULES.split(',');
        }
        if (process.env.PYTHON_EXECUTOR_FALLBACK_BEHAVIOR) {
            envConfig.fallbackBehavior = process.env.PYTHON_EXECUTOR_FALLBACK_BEHAVIOR;
        }
        if (process.env.PYTHON_EXECUTOR_DEFAULT_OUTPUT) {
            envConfig.defaultOutput = process.env.PYTHON_EXECUTOR_DEFAULT_OUTPUT;
        }
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
    validateConfig() {
        const { config } = this;
        if (!config.serviceUrl) {
            throw new Error('Python executor service URL is required');
        }
        try {
            new URL(config.serviceUrl);
        }
        catch {
            throw new Error('Python executor service URL must be a valid URL');
        }
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
        if (config.retryAttempts < 0) {
            throw new Error('Retry attempts cannot be negative');
        }
        if (config.retryAttempts > 10) {
            throw new Error('Retry attempts should not exceed 10');
        }
        if (!this.isValidMemoryLimit(config.defaultMemoryLimit)) {
            throw new Error('Default memory limit must be a valid size (e.g., 128MB, 1GB)');
        }
        if (!this.isValidMemoryLimit(config.maxMemoryLimit)) {
            throw new Error('Max memory limit must be a valid size (e.g., 128MB, 1GB)');
        }
        if (!Array.isArray(config.allowedModules)) {
            throw new Error('Allowed modules must be an array');
        }
        if (!['error', 'skip', 'default'].includes(config.fallbackBehavior)) {
            throw new Error('Fallback behavior must be one of: error, skip, default');
        }
    }
    isValidMemoryLimit(limit) {
        return /^\d+(?:B|KB|MB|GB)$/.test(limit);
    }
    getChangedFields(oldConfig, newConfig) {
        const changed = [];
        for (const key in newConfig) {
            if (newConfig[key] !== oldConfig[key]) {
                changed.push(key);
            }
        }
        return changed;
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
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
    getEnvironmentConfig(environment) {
        switch (environment) {
            case 'development':
                return {
                    enableDebugLogs: true,
                    enableMetrics: true,
                    enableTracing: true,
                    strictMode: false,
                    timeout: 60000,
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
    applyEnvironmentConfig(environment) {
        const envConfig = this.getEnvironmentConfig(environment);
        this.update(envConfig);
    }
    toJSON() {
        return JSON.stringify(this.config, null, 2);
    }
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
exports.PythonExecutorConfigManager = PythonExecutorConfigManager;
exports.pythonExecutorConfig = new PythonExecutorConfigManager();
function getPythonExecutorConfig() {
    return exports.pythonExecutorConfig.get();
}
function updatePythonExecutorConfig(updates) {
    exports.pythonExecutorConfig.update(updates);
}
function isPythonExecutorConfigured() {
    const config = exports.pythonExecutorConfig.get();
    return !!(config.serviceUrl && config.serviceUrl !== 'http://localhost:8001');
}
function getClientSafeConfig() {
    const config = exports.pythonExecutorConfig.get();
    const { apiKey, ...clientSafeConfig } = config;
    return clientSafeConfig;
}
//# sourceMappingURL=python-executor.js.map