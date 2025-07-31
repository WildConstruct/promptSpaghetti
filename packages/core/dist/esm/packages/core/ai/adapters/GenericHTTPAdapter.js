/**
 * Generic HTTP API Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Flexible adapter for custom AI model endpoints following REST conventions
 */
import { BaseAIModel, AIModelType, AIModelProvider, AIModelStatus, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';
;
export class GenericHTTPAdapter extends BaseAIModel {
    config;
    requestMapping;
    defaultEndpoint;
    id;
    config;
    metadata;
    capabilities;
    requestMapping;
    defaultEndpoint = '/generate';
    fullMetadata = {
        name: metadata.name || 'Generic HTTP Model',
        version: metadata.version || '1.0',
        description: metadata.description || 'Generic HTTP API model adapter',
        provider: AIModelProvider.CUSTOM,
        type: metadata.type || AIModelType.TEXT,
        costPerToken: metadata.costPerToken || 0,
        averageLatency: metadata.averageLatency || 2000,
        maxConcurrency: metadata.maxConcurrency || 10,
        rateLimit: metadata.rateLimit || {
            requestsPerMinute: 100,
            tokensPerMinute: 10000,
        },
        tags: metadata.tags || ['custom', 'http'],
        lastUpdated: new Date()
    };
    fullCapabilities = {
        inputTypes: capabilities.inputTypes || ['text', 'json'],
        outputTypes: capabilities.outputTypes || ['text', 'json'],
        maxInputSize: capabilities.maxInputSize || 100000,
        maxOutputSize: capabilities.maxOutputSize || 10000,
        supportsBatch: capabilities.supportsBatch || false,
        supportsStreaming: capabilities.supportsStreaming || false,
        supportsAsync: capabilities.supportsAsync || true,
        customParameters: capabilities.customParameters || {}
    };
}
this.config = config;
this.requestMapping = requestMapping;
this.defaultEndpoint = defaultEndpoint;
async;
initialize();
Promise < void  > {
    try: {
        this: ._status = AIModelStatus.INITIALIZING,
        : .config.baseURL
    }
};
{
    throw new Error('Base URL is required for Generic HTTP adapter');
    // Test connectivity if health endpoint is provided
    if (this.config.healthEndpoint) {
        await this._testConnection();
        this._status = AIModelStatus.READY;
        this._lastActivity = new Date();
    }
    try { }
    catch (error) {
        this._status = AIModelStatus.ERROR;
        throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
        async;
        process(input, unknown, options ?  : HTTPRequestOptions);
        Promise < unknown > {
            try: {
                : ._status !== AIModelStatus.READY
            } };
        {
            throw new ModelUnavailableError(this._id);
            // Build request payload using mapping
            const payload = this._buildRequestPayload(input, options);
            // Determine endpoint
            const endpoint = options?.endpoint || this.defaultEndpoint;
            // Make HTTP request
            const response = await this._makeRequest(endpoint, payload, options);
            // Extract content using mapping
            return this._extractContent(response);
        }
        try { }
        catch (error) {
            throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
            async;
            cleanup();
            Promise < void  > {
                this: ._status = AIModelStatus.OFFLINE,
                this: ._activeRequests.clear(),
                this: ._requestQueue = [],
                async estimate(input, options) {
                    // Basic estimation based on input size for generic adapters
                    const inputSize = this._calculateInputSize(input);
                    const estimatedTokens = Math.ceil(inputSize / 4); // Rough token estimation;
                    const cost = estimatedTokens * (this._metadata.costPerToken || 0);
                    return {
                        estimatedCost: cost,
                        currency: 'USD',
                        confidence: 0.5, // Lower confidence for generic adapters,
                        breakdown: {
                            inputCost: cost * 0.4,
                            outputCost: cost * 0.6,
                            processingCost: 0,
                        },
                        // Configuration methods
                        updateRequestMapping(mapping) {
                            this.requestMapping = { ...this.requestMapping, ...mapping };
                            updateHTTPConfig(config, (Partial));
                            void {
                                this: .config = { ...this.config, ...config },
                                // Private helper methods
                                async _testConnection() {
                                    try {
                                        const url = `${this.config.baseURL}${this.config.healthEndpoint}`;
                                    }
                                    finally {
                                    }
                                    const response = await fetch(url, {});
                                    method: 'GET',
                                        headers;
                                    this._buildHeaders(),
                                        signal;
                                    AbortSignal.timeout(this.config.timeout || 10000),
                                    ;
                                },
                                if(, response) { }, : .ok
                            };
                            {
                                throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
                            }
                        }, catch(error) {
                            throw new Error(`Failed to connect to HTTP API: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        },
                        payload: any,
                        options: HTTPRequestOptions,
                        Promise() {
                            const url = `${this.config.baseURL}${endpoint}`;
                        },
                        const: method = options?.method || 'POST',
                        const: fetchOptions, RequestInit = {
                            method,
                            headers: {
                                ...this._buildHeaders(),
                                ...options?.headers
                            },
                            signal: AbortSignal.timeout(options?.timeout || this.config.timeout || 30000)
                        },
                        if(method) { }
                    } !== 'GET' && payload;
                    {
                        fetchOptions.body = JSON.stringify(payload);
                        let lastError = null;
                        const maxRetries = options?.retries ?? this.config.maxRetries ?? 3;
                        for (let attempt = 0; attempt <= maxRetries; attempt++) {
                            try {
                                const response = await fetch(url, fetchOptions);
                                const data = await response.json().catch(() => ({}));
                                if (!response.ok) {
                                    throw new Error(`HTTP request failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
                                }
                                return {
                                    status: response.status,
                                    data,
                                    headers: Object.fromEntries(response.headers.entries()),
                                    usage: this._extractUsage(data),
                                };
                            }
                            catch (error) {
                                lastError = error instanceof Error ? error : new Error('Unknown error');
                                if (attempt < maxRetries) {
                                    // Exponential backoff
                                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                                    throw lastError || new Error('All retry attempts failed');
                                }
                            }
                        }
                    }
                },
                _buildHeaders() {
                    const headers = {
                        'Content-Type': 'application/json',
                        ...this.config.headers
                    };
                    // Add authentication headers
                    if (this.config.apiKey) {
                        switch (this.config.authType) {
                            case 'bearer':
                                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
                        }
                        break;
                    }
                },
                case: 'api-key',
                headers, ['X-API-Key']:  = this.config.apiKey,
                break: ,
                default: headers['Authorization'] = `Bearer ${this.config.apiKey}` };
            return headers;
            _buildRequestPayload(input, any, options ?  : HTTPRequestOptions);
            any;
            {
                const payload = {};
                // Set input using JSONPath
                this._setValueByPath(payload, this.requestMapping.inputPath, input);
                // Set parameters using JSONPath
                if (options?.parameters && this.requestMapping.parametersPath) {
                    this._setValueByPath(payload, this.requestMapping.parametersPath, options.parameters);
                    return payload;
                    _extractContent(response, GenericHTTPResponse);
                    any;
                    {
                        // Extract main output using JSONPath
                        const content = this._getValueByPath(response.data, this.requestMapping.outputPath);
                        // Extract additional information
                        const usage = response.usage || this._extractUsage(response.data);
                        const status = this.requestMapping.statusPath ?  : ;
                        this._getValueByPath(response.data, this.requestMapping.statusPath);
                        'completed';
                        return {
                            content,
                            usage,
                            status,
                            rawResponse: response.data,
                            headers: response.headers,
                        };
                        _extractUsage(data, any);
                        any;
                        {
                            if (!this.requestMapping.usagePath) {
                                return undefined;
                                return this._getValueByPath(data, this.requestMapping.usagePath);
                                _setValueByPath(obj, any, path, string, value, any);
                                void {
                                    const: keys = path.split('.'),
                                    let, current = obj,
                                    for(let, i = 0, i, , keys) { }, : .length - 1, i
                                }++;
                                {
                                    const key = keys[i];
                                    if (!(key in current)) {
                                        current[key] = {};
                                        current = current[key];
                                        current[keys[keys.length - 1]] = value;
                                        _getValueByPath(obj, any, path, string);
                                        any;
                                        {
                                            const keys = path.split('.');
                                            let current = obj;
                                            for (const key of keys) {
                                                if (current === null || current === undefined || !(key in current)) {
                                                    return undefined;
                                                    current = current[key];
                                                    return current;
                                                    async;
                                                    _performHealthCheck();
                                                    Promise < void  > {
                                                        : .config.healthEndpoint
                                                    };
                                                    {
                                                        await this._testConnection();
                                                        export default GenericHTTPAdapter;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
