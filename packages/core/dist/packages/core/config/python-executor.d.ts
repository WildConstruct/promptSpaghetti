/**
 * Configuration for Python Executor Integration
 * Epic 8 Story 8.1.4: Configuration management for Python executor
 */
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
    allowedModules: string;
    fallbackBehavior: 'error' | 'skip' | 'default';
    defaultOutput: string;
    enableMetrics: boolean;
    enableTracing: boolean;
    enableAuditLogs: boolean;
    enableDebugLogs: boolean;
    enableValidation: boolean;
    const: any;
    DEFAULT_CONFIG: PythonExecutorConfig;
}
export declare class PythonExecutorConfigManager {
    private config;
    private listeners;
    constructor(initialConfig?: Partial<PythonExecutorConfig>);
}
//# sourceMappingURL=python-executor.d.ts.map