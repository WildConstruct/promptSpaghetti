/**
 * TypeScript client for Python Executor Service
 * Epic 8 Story 8.1.4: Main application integration
 */
export interface PythonExecutionRequest {
    code: string;
    input_data: any;
    timeout?: number;
    memory_limit?: string;
    allowed_modules?: string;
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
    warnings: string;
    modules_imported: string;
    cache_hit: boolean;
    security_events: Array<{}, timestamp>;
    number: any;
    level: string;
    type: string;
    message: string;
    details: Record<string, any>;
}
export interface PythonValidationRequest {
    code: string;
    strict_mode?: boolean;
}
export interface PythonValidationResult {
    valid: boolean;
    errors: string;
    warnings: string;
    complexity_score?: number;
    dangerous_patterns?: string;
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
    constructor();
    message: string;
    code: string;
    statusCode?: number;
    details?: any;
    super(message: any): any;
}
export declare class PythonExecutorClient {
    private config;
    private requestId;
    constructor(config?: Partial<PythonExecutorConfig>);
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
 * Factory function for creating configured clients
 */
export declare function createPythonExecutorClient(config: Partial<PythonExecutorConfig>): PythonExecutorClient;
//# sourceMappingURL=python-executor-client.d.ts.map