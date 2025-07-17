export interface PythonExecutionRequest {
    code: string;
    input_data: any;
    timeout?: number;
    memory_limit?: string;
    allowed_modules?: string[];
    context?: Record<string, any>;
    strict_mode?: boolean;
}
export interface PythonExecutionResult {
    success: boolean;
    result?: any;
    error_type?: string;
    error_message?: string;
    error_code?: string;
    error_line?: number;
    traceback?: string;
    execution_time: number;
    memory_used: string;
    peak_memory: string;
    cpu_usage: number;
    warnings: string[];
    modules_imported: string[];
    cache_hit: boolean;
    security_events: Array<{
        timestamp: number;
        level: string;
        type: string;
        message: string;
        details: Record<string, any>;
    }>;
    sandbox_violations: number;
}
export interface PythonValidationRequest {
    code: string;
    strict_mode?: boolean;
}
export interface PythonValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    complexity_score?: number;
    dangerous_patterns?: string[];
}
export interface PythonExecutorConfig {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    apiKey?: string;
    enableMetrics: boolean;
    defaultMemoryLimit: string;
    defaultTimeout: number;
    defaultStrictMode: boolean;
}
export declare class PythonExecutorClientError extends Error {
    code: string;
    statusCode?: number | undefined;
    details?: any | undefined;
    constructor(message: string, code: string, statusCode?: number | undefined, details?: any | undefined);
}
export declare class PythonExecutorClient {
    private config;
    private requestId;
    constructor(config?: Partial<PythonExecutorConfig>);
    execute(request: PythonExecutionRequest): Promise<PythonExecutionResult>;
    validate(request: PythonValidationRequest): Promise<PythonValidationResult>;
    health(): Promise<{
        status: string;
        version: string;
        uptime: number;
    }>;
    metrics(): Promise<any>;
    updateConfig(config: Partial<PythonExecutorConfig>): void;
    getConfig(): PythonExecutorConfig;
    private makeRequest;
    private generateRequestId;
    private sleep;
    private logMetrics;
    private handleError;
}
export declare const pythonExecutorClient: PythonExecutorClient;
export declare function createPythonExecutorClient(config: Partial<PythonExecutorConfig>): PythonExecutorClient;
export declare function isPythonExecutorAvailable(baseUrl?: string): Promise<boolean>;
export declare function executePythonCode(code: string, inputData: any, options?: Partial<PythonExecutionRequest>): Promise<PythonExecutionResult>;
export declare function validatePythonCode(code: string, options?: Partial<PythonValidationRequest>): Promise<PythonValidationResult>;
//# sourceMappingURL=python-executor-client.d.ts.map