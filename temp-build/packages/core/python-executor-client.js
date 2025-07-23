/**
 * TypeScript client for Python Executor Service
 * Epic 8 Story 8.1.4: Main application integration
 */
export class PythonExecutorClientError extends Error {
    constructor(message, code, statusCode, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'PythonExecutorClientError';
    }
}
export class PythonExecutorClient {
    constructor(config = {}) {
        this.requestId = 0;
        this.config = {
            baseUrl: config.baseUrl || 'http://localhost:8001',
            timeout: config.timeout || 30000,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 1000,
            apiKey: config.apiKey,
            enableMetrics: config.enableMetrics ?? true,
            defaultMemoryLimit: config.defaultMemoryLimit || '128MB',
            defaultTimeout: config.defaultTimeout || 30,
            defaultStrictMode: config.defaultStrictMode ?? true,
            ...config
        };
    }
    /**
     * Execute Python code using the executor service
     */
    async execute(request) {
        const requestId = this.generateRequestId();
        const executeRequest = {
            ...request,
            timeout: request.timeout || this.config.defaultTimeout,
            memory_limit: request.memory_limit || this.config.defaultMemoryLimit,
            strict_mode: request.strict_mode ?? this.config.defaultStrictMode
        };
        try {
            const response = await this.makeRequest('/v1/execute', {
                method: 'POST',
                body: JSON.stringify(executeRequest),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                }
            });
            const responseData = await response.json();
            const result = responseData || {
                success: false,
                execution_time: 0,
                memory_used: 0,
                peak_memory: 0,
                output: '',
                error: 'No response data',
                request_id: requestId,
                timestamp: new Date().toISOString(),
                python_version: '',
                exit_code: 1
            };
            // Log metrics if enabled
            if (this.config.enableMetrics) {
                this.logMetrics(requestId, 'execute', result);
            }
            return result;
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), 'execute', requestId);
            throw error;
        }
    }
    /**
     * Validate Python code without executing it
     */
    async validate(request) {
        const requestId = this.generateRequestId();
        const validateRequest = {
            ...request,
            strict_mode: request.strict_mode ?? this.config.defaultStrictMode
        };
        try {
            const response = await this.makeRequest('/v1/validate', {
                method: 'POST',
                body: JSON.stringify(validateRequest),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                }
            });
            const result = await response.json() || {
                valid: false,
                errors: ['No response data'],
                warnings: []
            };
            // Log metrics if enabled
            if (this.config.enableMetrics) {
                this.logMetrics(requestId, 'validate', result);
            }
            return result;
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), 'validate', requestId);
            throw error;
        }
    }
    /**
     * Check if the Python executor service is healthy
     */
    async health() {
        const requestId = this.generateRequestId();
        try {
            const response = await this.makeRequest('/health', {
                method: 'GET',
                headers: {
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                }
            });
            const healthData = await response.json();
            return healthData || {
                status: 'unknown',
                version: '0.0.0',
                uptime: 0
            };
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), 'health', requestId);
            throw error;
        }
    }
    /**
     * Get service metrics
     */
    async metrics() {
        const requestId = this.generateRequestId();
        try {
            const response = await this.makeRequest('/metrics', {
                method: 'GET',
                headers: {
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                }
            });
            return await response.text();
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), 'metrics', requestId);
            throw error;
        }
    }
    /**
     * Update client configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(endpoint, options) {
        const url = `${this.config.baseUrl}${endpoint}`;
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    }
                    catch {
                        errorData = { message: errorText };
                    }
                    throw new PythonExecutorClientError(errorData.message || `HTTP ${response.status}: ${response.statusText}`, errorData.code || 'HTTP_ERROR', response.status, errorData);
                }
                return response;
            }
            catch (error) {
                lastError = error;
                // Don't retry on certain errors
                if (error instanceof PythonExecutorClientError &&
                    (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403)) {
                    throw error;
                }
                // Don't retry on the last attempt
                if (attempt === this.config.retryAttempts) {
                    throw error;
                }
                // Wait before retrying
                await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
            }
        }
        throw lastError;
    }
    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${++this.requestId}`;
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Log metrics for monitoring
     */
    logMetrics(requestId, operation, result) {
        const metrics = {
            requestId,
            operation,
            timestamp: Date.now(),
            success: result.success !== false,
            executionTime: result.execution_time,
            memoryUsed: result.memory_used,
            cacheHit: result.cache_hit,
            securityViolations: result.sandbox_violations
        };
        // In a real application, you would send these metrics to a monitoring service
        console.log('PythonExecutor Metrics:', metrics);
    }
    /**
     * Handle and log errors
     */
    handleError(error, operation, requestId) {
        const errorInfo = {
            requestId,
            operation,
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack
        };
        // In a real application, you would send these errors to a monitoring service
        console.error('PythonExecutor Error:', errorInfo);
    }
}
/**
 * Default instance with common configuration
 */
export const pythonExecutorClient = new PythonExecutorClient({
    baseUrl: process.env.PYTHON_EXECUTOR_URL || 'http://localhost:8001',
    apiKey: process.env.PYTHON_EXECUTOR_API_KEY,
    enableMetrics: process.env.NODE_ENV !== 'production'
});
/**
 * Factory function for creating configured clients
 */
export function createPythonExecutorClient(config) {
    return new PythonExecutorClient(config);
}
/**
 * Utility function to check if the service is available
 */
export async function isPythonExecutorAvailable(baseUrl) {
    try {
        const client = new PythonExecutorClient({ baseUrl });
        await client.health();
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Utility function to execute Python code with default settings
 */
export async function executePythonCode(code, inputData, options = {}) {
    return pythonExecutorClient.execute({
        code,
        input_data: inputData,
        ...options
    });
}
/**
 * Utility function to validate Python code
 */
export async function validatePythonCode(code, options = {}) {
    return pythonExecutorClient.validate({
        code,
        ...options
    });
}
