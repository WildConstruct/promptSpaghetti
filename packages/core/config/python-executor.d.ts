/**
 * Configuration for Python Executor Integration
 * Epic 8 Story 8.1.4: Configuration management for Python executor
 */

}
}
export interface PythonExecutorConfig {
    serviceUrl: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    defaultMemoryLimit: string;
    defaultTimeout: number;
    maxMemoryLimit: string;
    maxTimeout: number;
    strictMode: boolean;
    enableCaching: boolean;
    allowedModules: string[];
    fallbackBehavior: 'error' | 'skip' | 'default';
    defaultOutput: string;
    enableMetrics: boolean;
    enableTracing: boolean;
    enableAuditLogs: boolean;
    enableDebugLogs: boolean;
    enableValidation: boolean;


/**
 * Configuration manager for Python executor
 */
export declare class PythonExecutorConfigManager {
    private config;
    private listeners;
    constructor(initialConfig?: Partial<PythonExecutorConfig>);
    /**
     * Get current configuration
     */
    get(): PythonExecutorConfig;
    /**
     * Update configuration
     */
    update(updates: Partial<PythonExecutorConfig>): void;
    /**
     * Reset configuration to defaults
     */
    reset(): void;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Check if memory limit is valid
     */
    private isValidMemoryLimit;
    /**
     * Get changed fields between two configurations
     */
    private getChangedFields;
    /**
     * Add configuration change listener
     */
    addListener(listener: (config: PythonExecutorConfig) => void): void;
    /**
     * Remove configuration change listener
     */
    removeListener(listener: (config: PythonExecutorConfig) => void): void;
    /**
     * Notify all listeners of configuration changes
     */
    private notifyListeners;
    /**
     * Get configuration for a specific environment
     */
    getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<PythonExecutorConfig>;
    /**
     * Apply environment-specific configuration
     */
    applyEnvironmentConfig(environment: 'development' | 'staging' | 'production'): void;
    /**
     * Export configuration as JSON
     */
    toJSON(): string;
    /**
     * Import configuration from JSON
     */
    fromJSON(json: string): void;

/**
 * Global configuration manager instance
 */
export declare const pythonExecutorConfig: PythonExecutorConfigManager;
/**
 * Utility function to get current configuration
 */
export declare function getPythonExecutorConfig(): PythonExecutorConfig;
/**
 * Utility function to update configuration
 */
export declare function updatePythonExecutorConfig(updates: Partial<PythonExecutorConfig>): void;
/**
 * Utility function to check if Python executor is configured
 */
export declare function isPythonExecutorConfigured(): boolean;
/**
 * Utility function to get safe configuration for client-side
 */
export declare function getClientSafeConfig(): Omit<PythonExecutorConfig, 'apiKey'>;
//# sourceMappingURL=python-executor.d.ts.map
}
}