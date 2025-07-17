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
}
export declare class PythonExecutorConfigManager {
    private config;
    private listeners;
    constructor(initialConfig?: Partial<PythonExecutorConfig>);
    get(): PythonExecutorConfig;
    update(updates: Partial<PythonExecutorConfig>): void;
    reset(): void;
    private loadFromEnvironment;
    private validateConfig;
    private isValidMemoryLimit;
    private getChangedFields;
    addListener(listener: (config: PythonExecutorConfig) => void): void;
    removeListener(listener: (config: PythonExecutorConfig) => void): void;
    private notifyListeners;
    getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<PythonExecutorConfig>;
    applyEnvironmentConfig(environment: 'development' | 'staging' | 'production'): void;
    toJSON(): string;
    fromJSON(json: string): void;
}
export declare const pythonExecutorConfig: PythonExecutorConfigManager;
export declare function getPythonExecutorConfig(): PythonExecutorConfig;
export declare function updatePythonExecutorConfig(updates: Partial<PythonExecutorConfig>): void;
export declare function isPythonExecutorConfigured(): boolean;
export declare function getClientSafeConfig(): Omit<PythonExecutorConfig, 'apiKey'>;
//# sourceMappingURL=python-executor.d.ts.map