/**
 * Base AI Model Interface and Abstract Implementation
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Unified interface for all AI model types with standardized methods
 */
export var AIModelType;
(function (AIModelType) {
    AIModelType["TEXT"] = "text";
    AIModelType["IMAGE"] = "image";
    AIModelType["AUDIO"] = "audio";
    AIModelType["VIDEO"] = "video";
    AIModelType["MULTIMODAL"] = "multimodal";
})(AIModelType || (AIModelType = {}));
export var AIModelProvider;
(function (AIModelProvider) {
    AIModelProvider["OPENAI"] = "openai";
    AIModelProvider["ANTHROPIC"] = "anthropic";
    AIModelProvider["HUGGINGFACE"] = "huggingface";
    AIModelProvider["STABILITY_AI"] = "stability_ai";
    AIModelProvider["ELEVENLABS"] = "elevenlabs";
    AIModelProvider["RUNWAYML"] = "runwayml";
    AIModelProvider["MIDJOURNEY"] = "midjourney";
    AIModelProvider["PIKA_LABS"] = "pika_labs";
    AIModelProvider["SORA"] = "sora";
    AIModelProvider["LOCAL"] = "local";
    AIModelProvider["CUSTOM"] = "custom";
})(AIModelProvider || (AIModelProvider = {}));
export var AIModelStatus;
(function (AIModelStatus) {
    AIModelStatus["INITIALIZING"] = "initializing";
    AIModelStatus["READY"] = "ready";
    AIModelStatus["BUSY"] = "busy";
    AIModelStatus["ERROR"] = "error";
    AIModelStatus["OFFLINE"] = "offline";
    AIModelStatus["MAINTENANCE"] = "maintenance";
})(AIModelStatus || (AIModelStatus = {}));
// Abstract base class for all AI models
export class BaseAIModel {
    _id;
    _metadata;
    _capabilities;
    _status = AIModelStatus.INITIALIZING;
    _healthStats;
    _requestQueue = [];
    _activeRequests = new Set();
    _lastActivity = new Date();
    constructor(id, metadata, capabilities) {
        this._id = id;
        this._metadata = metadata;
        this._capabilities = capabilities;
        this._healthStats = {
            status: AIModelStatus.INITIALIZING,
            uptime: 0,
            lastCheck: new Date(),
            issues: []
        };
    }
    // Public interface
    get id() { return this._id; }
    get metadata() { return { ...this._metadata }; }
    get capabilities() { return { ...this._capabilities }; }
    get status() { return this._status; }
    // Default implementations that can be overridden
    async estimate(input, options) {
        // Default estimation based on metadata
        const baseRequestCost = this._metadata.costPerRequest || 0;
        const tokenCost = this._calculateTokenCost(input, options);
        return {
            estimatedCost: baseRequestCost + tokenCost,
            currency: 'USD',
            confidence: 0.7,
            breakdown: {
                inputCost: tokenCost * 0.3,
                outputCost: tokenCost * 0.7,
                processingCost: baseRequestCost
            }
        };
    }
    async health() {
        const now = new Date();
        this._healthStats.lastCheck = now;
        this._healthStats.uptime = now.getTime() - this._lastActivity.getTime();
        this._healthStats.concurrentRequests = this._activeRequests.size;
        // Perform basic health checks
        try {
            await this._performHealthCheck();
            this._healthStats.status = this._status;
        }
        catch (error) {
            this._healthStats.status = AIModelStatus.ERROR;
            this._healthStats.issues = [`Health check failed: ${error}`];
        }
        return { ...this._healthStats };
    }
    // Request management
    async executeRequest(request) {
        const startTime = Date.now();
        this._activeRequests.add(request.id);
        this._lastActivity = new Date();
        try {
            // Validate request
            await this._validateRequest(request);
            // Update status
            this._status = AIModelStatus.BUSY;
            // Process the request
            const output = await this.process(request.input, request.options);
            // Calculate cost
            const cost = await this.estimate(request.input, request.options);
            const response = {
                id: `${request.id}_response`,
                requestId: request.id,
                output,
                metadata: {
                    processingTime: Date.now() - startTime,
                    cost,
                    modelUsed: this._id,
                    quality: await this._assessOutputQuality(output)
                },
                completedAt: new Date()
            };
            this._status = AIModelStatus.READY;
            return response;
        }
        catch (error) {
            const response = {
                id: `${request.id}_response`,
                requestId: request.id,
                output: null,
                error: {
                    code: 'PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: error
                },
                completedAt: new Date()
            };
            this._status = AIModelStatus.ERROR;
            return response;
        }
        finally {
            this._activeRequests.delete(request.id);
            if (this._activeRequests.size === 0) {
                this._status = AIModelStatus.READY;
            }
        }
    }
    // Batch processing support
    async executeBatch(requests) {
        if (!this._capabilities.supportsBatch) {
            // Execute sequentially if batch not supported
            const responses = [];
            for (const request of requests) {
                responses.push(await this.executeRequest(request));
            }
            return responses;
        }
        // Implement batch processing
        return this._processBatch(requests);
    }
    // Configuration management
    updateConfiguration(config) {
        this._metadata = { ...this._metadata, ...config, lastUpdated: new Date() };
    }
    updateCapabilities(capabilities) {
        this._capabilities = { ...this._capabilities, ...capabilities };
    }
    // Protected helper methods
    async _validateRequest(request) {
        if (!request.input) {
            throw new Error('Request input is required');
        }
        // Validate input size
        if (this._capabilities.maxInputSize) {
            const inputSize = this._calculateInputSize(request.input);
            if (inputSize > this._capabilities.maxInputSize) {
                throw new Error(`Input size ${inputSize} exceeds maximum ${this._capabilities.maxInputSize}`);
            }
        }
        // Validate input type
        if (this._capabilities.inputTypes.length > 0) {
            const inputType = this._detectInputType(request.input);
            if (!this._capabilities.inputTypes.includes(inputType)) {
                throw new Error(`Input type ${inputType} not supported. Supported types: ${this._capabilities.inputTypes.join(', ')}`);
            }
        }
    }
    _calculateInputSize(input) {
        if (typeof input === 'string') {
            return new Blob([input]).size;
        }
        if (input instanceof ArrayBuffer) {
            return input.byteLength;
        }
        return JSON.stringify(input).length;
    }
    _detectInputType(input) {
        if (typeof input === 'string') {
            return 'text';
        }
        if (input instanceof ArrayBuffer || input instanceof Uint8Array) {
            return 'binary';
        }
        if (input && typeof input === 'object') {
            return 'json';
        }
        return 'unknown';
    }
    _calculateTokenCost(input, options) {
        if (!this._metadata.costPerToken) {
            return 0;
        }
        // Rough token estimation (4 characters per token for text)
        let tokenCount = 0;
        if (typeof input === 'string') {
            tokenCount = Math.ceil(input.length / 4);
        }
        else {
            tokenCount = Math.ceil(JSON.stringify(input).length / 4);
        }
        return tokenCount * this._metadata.costPerToken;
    }
    async _assessOutputQuality(output) {
        // Default quality assessment - can be overridden
        if (!output || output === null || output === undefined) {
            return 0;
        }
        if (typeof output === 'string' && output.length === 0) {
            return 0;
        }
        // Basic quality score based on output characteristics
        return 0.8; // Default decent quality
    }
    async _performHealthCheck() {
        // Default health check - can be overridden
        if (this._status === AIModelStatus.ERROR) {
            throw new Error('Model is in error state');
        }
    }
    async _processBatch(requests) {
        // Default batch processing - can be overridden for better efficiency
        const responses = [];
        for (const request of requests) {
            responses.push(await this.executeRequest(request));
        }
        return responses;
    }
}
// Error types
export class ModelInitializationError extends Error {
    constructor(modelId, cause) {
        super(`Failed to initialize model ${modelId}: ${cause}`);
        this.name = 'ModelInitializationError';
    }
}
export class ModelProcessingError extends Error {
    constructor(modelId, cause) {
        super(`Model ${modelId} processing failed: ${cause}`);
        this.name = 'ModelProcessingError';
    }
}
export class ModelUnavailableError extends Error {
    constructor(modelId) {
        super(`Model ${modelId} is currently unavailable`);
        this.name = 'ModelUnavailableError';
    }
}
// Export all types and classes
export { BaseAIModel as default };
