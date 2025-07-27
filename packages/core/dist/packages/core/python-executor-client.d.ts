/**
 * TypeScript client for Python Executor Service
 * Epic 8 Story 8.1.4: Main application integration
 */
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
    statusCode?: number;
    details?: any;
    constructor(message: string, code: string, statusCode?: number, details?: any);
}
export declare class PythonExecutorClient {
    private config;
    private requestId;
    constructor(config?: Partial<PythonExecutorConfig>);
    /**
     * Execute Python code using the executor service
     */
    execute(request: PythonExecutionRequest): Promise<PythonExecutionResult>;
    /**
     * Validate Python code without executing it
     */
    validate(request: PythonValidationRequest): Promise<PythonValidationResult>;
    /**
     * Check if the Python executor service is healthy
     */
    health(): Promise<{
        status: string;
        version: string;
        uptime: number;
    }>;
    /**
     * Get service metrics
     */
    metrics(): Promise<any>;
    /**
     * Update client configuration
     */
    updateConfig(config: Partial<PythonExecutorConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): PythonExecutorConfig;
    /**
     * Make HTTP request with retry logic
     */
    private makeRequest;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Log metrics for monitoring
     */
    private logMetrics;
    /**
     * Handle and log errors
     */
    private handleError;
}
/**
 * Default instance with common configuration
 */
export declare const pythonExecutorClient: PythonExecutorClient;
/**
 * Factory function for creating configured clients
 */
export declare function createPythonExecutorClient(config: Partial<PythonExecutorConfig>): PythonExecutorClient;
/**
 * Utility function to check if the service is available
 */
export declare function isPythonExecutorAvailable(baseUrl?: string): Promise<boolean>;
/**
 * Utility function to execute Python code with default settings
 */
export declare function executePythonCode(code: string, inputData: any, options?: Partial<PythonExecutionRequest>): Promise<PythonExecutionResult>;
/**
 * Utility function to validate Python code
 */
export declare function validatePythonCode(code: string, options?: Partial<PythonValidationRequest>): Promise<PythonValidationResult>;
//# sourceMappingURL=python-executor-client.d.ts.map