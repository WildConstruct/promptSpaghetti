"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonExecutorClient = exports.PythonExecutorClient = exports.PythonExecutorClientError = void 0;
exports.createPythonExecutorClient = createPythonExecutorClient;
exports.isPythonExecutorAvailable = isPythonExecutorAvailable;
exports.executePythonCode = executePythonCode;
exports.validatePythonCode = validatePythonCode;
class PythonExecutorClientError extends Error {
    constructor(message, code, statusCode, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'PythonExecutorClientError';
    }
}
exports.PythonExecutorClientError = PythonExecutorClientError;
class PythonExecutorClient {
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
            ...config,
        };
    }
    async execute(request) {
        const requestId = this.generateRequestId();
        const executeRequest = {
            ...request,
            timeout: request.timeout || this.config.defaultTimeout,
            memory_limit: request.memory_limit || this.config.defaultMemoryLimit,
            strict_mode: request.strict_mode ?? this.config.defaultStrictMode,
        };
        try {
            const response = await this.makeRequest('/v1/execute', {
                method: 'POST',
                body: JSON.stringify(executeRequest),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
            });
            const result = await response.json();
            if (this.config.enableMetrics) {
                this.logMetrics(requestId, 'execute', result);
            }
            return result;
        }
        catch (error) {
            this.handleError(error, 'execute', requestId);
            throw error;
        }
    }
    async validate(request) {
        const requestId = this.generateRequestId();
        const validateRequest = {
            ...request,
            strict_mode: request.strict_mode ?? this.config.defaultStrictMode,
        };
        try {
            const response = await this.makeRequest('/v1/validate', {
                method: 'POST',
                body: JSON.stringify(validateRequest),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
            });
            const result = await response.json();
            if (this.config.enableMetrics) {
                this.logMetrics(requestId, 'validate', result);
            }
            return result;
        }
        catch (error) {
            this.handleError(error, 'validate', requestId);
            throw error;
        }
    }
    async health() {
        const requestId = this.generateRequestId();
        try {
            const response = await this.makeRequest('/health', {
                method: 'GET',
                headers: {
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
            });
            return await response.json();
        }
        catch (error) {
            this.handleError(error, 'health', requestId);
            throw error;
        }
    }
    async metrics() {
        const requestId = this.generateRequestId();
        try {
            const response = await this.makeRequest('/metrics', {
                method: 'GET',
                headers: {
                    'X-Request-ID': requestId,
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
            });
            return await response.text();
        }
        catch (error) {
            this.handleError(error, 'metrics', requestId);
            throw error;
        }
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    async makeRequest(endpoint, options) {
        const url = `${this.config.baseUrl}${endpoint}`;
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
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
                if (error instanceof PythonExecutorClientError &&
                    (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403)) {
                    throw error;
                }
                if (attempt === this.config.retryAttempts) {
                    throw error;
                }
                await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
            }
        }
        throw lastError;
    }
    generateRequestId() {
        return `req_${Date.now()}_${++this.requestId}`;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    logMetrics(requestId, operation, result) {
        const metrics = {
            requestId,
            operation,
            timestamp: Date.now(),
            success: result.success !== false,
            executionTime: result.execution_time,
            memoryUsed: result.memory_used,
            cacheHit: result.cache_hit,
            securityViolations: result.sandbox_violations,
        };
        console.log('PythonExecutor Metrics:', metrics);
    }
    handleError(error, operation, requestId) {
        const errorInfo = {
            requestId,
            operation,
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack,
        };
        console.error('PythonExecutor Error:', errorInfo);
    }
}
exports.PythonExecutorClient = PythonExecutorClient;
exports.pythonExecutorClient = new PythonExecutorClient({
    baseUrl: process.env.PYTHON_EXECUTOR_URL || 'http://localhost:8001',
    apiKey: process.env.PYTHON_EXECUTOR_API_KEY,
    enableMetrics: process.env.NODE_ENV !== 'production',
});
function createPythonExecutorClient(config) {
    return new PythonExecutorClient(config);
}
async function isPythonExecutorAvailable(baseUrl) {
    try {
        const client = new PythonExecutorClient({ baseUrl });
        await client.health();
        return true;
    }
    catch {
        return false;
    }
}
async function executePythonCode(code, inputData, options = {}) {
    return exports.pythonExecutorClient.execute({
        code,
        input_data: inputData,
        ...options,
    });
}
async function validatePythonCode(code, options = {}) {
    return exports.pythonExecutorClient.validate({
        code,
        ...options,
    });
}
//# sourceMappingURL=python-executor-client.js.map