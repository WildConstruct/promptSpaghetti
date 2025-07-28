/**
 * OpenAI Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Concrete implementation of BaseAIModel for OpenAI GPT models
 */
import { BaseAIModel, AIModelStatus, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';
 > ;
usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
;
export class OpenAIAdapter extends BaseAIModel {
    config;
    apiEndpoint;
    constructor(id, config, modelName = 'gpt-3.5-turbo') {
        const metadata = {
            name: modelName,
            version: '1.0',
            description: `OpenAI ${modelName} model adapter` };
    }
    provider;
    type;
    costPerToken;
    modelName;
    averageLatency;
    modelName;
    maxConcurrency;
    rateLimit;
    tags;
    lastUpdated;
    ;
}
;
const capabilities = {
    inputTypes: ['text', 'json'],
    outputTypes: ['text', 'json'],
    maxInputSize: OpenAIAdapter.getModelMaxTokens(modelName),
    maxOutputSize: 4096,
    supportsBatch: false,
    supportsStreaming: true,
    supportsAsync: true,
    customParameters: {
        temperature: { type: 'number', min: 0, max: 2, default: 1 },
        max_tokens: { type: 'number', min: 1, max: 4096, default: 1000 },
        top_p: { type: 'number', min: 0, max: 1, default: 1 },
        frequency_penalty: { type: 'number', min: -2, max: 2, default: 0 },
        presence_penalty: { type: 'number', min: -2, max: 2, default: 0 }
    },
    this: .config = config,
    this: .apiEndpoint = config.baseURL || 'https://api.openai.com/v1',
    async initialize() {
        try {
            this._status = AIModelStatus.INITIALIZING;
            // Validate API key
            if (!this.config.apiKey) {
                throw new Error('OpenAI API key is required');
                // Test connectivity with a simple request
                await this._testConnection();
                this._status = AIModelStatus.READY;
                this._lastActivity = new Date();
            }
            try { }
            catch (error) {
                this._status = AIModelStatus.ERROR;
                throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
                async;
                process(input, unknown, options ?  : OpenAIRequestOptions);
                Promise < unknown > {
                    try: {
                        : ._status !== AIModelStatus.READY
                    }
                };
                {
                    throw new ModelUnavailableError(this._id);
                    // Convert input to OpenAI format
                    const messages = this._convertToMessages(input);
                    // Prepare request payload
                    const payload = {
                        model: options?.model || this._metadata.name,
                        messages,
                        temperature: options?.temperature ?? 1,
                        max_tokens: options?.max_tokens ?? 1000,
                        top_p: options?.top_p ?? 1,
                        frequency_penalty: options?.frequency_penalty ?? 0,
                        presence_penalty: options?.presence_penalty ?? 0,
                        ...(options?.stop && { stop: options.stop }),
                        ...(options?.stream && { stream: options.stream }),
                        ...(options?.seed && { seed: options.seed }),
                        ...(options?.response_format && { response_format: options.response_format }),
                        ...(options?.tools && { tools: options.tools }),
                        ...(options?.tool_choice && { tool_choice: options.tool_choice })
                    };
                    const response = await this._makeRequest('/chat/completions', payload);
                    // Extract and return the generated content
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
                            const messages = this._convertToMessages(input);
                            const inputTokens = this._estimateTokenCount(messages);
                            const outputTokens = options?.max_tokens || 1000;
                            const inputCost = inputTokens * (this._metadata.costPerToken || 0);
                            const outputCost = outputTokens * (this._metadata.costPerToken || 0) * 2; // Output tokens typically cost 2x;
                            return {
                                estimatedCost: inputCost + outputCost,
                                currency: 'USD',
                                confidence: 0.9,
                                breakdown: {
                                    inputCost,
                                    outputCost,
                                    processingCost: 0,
                                },
                                // Static helper methods for model configuration
                                static getModelCostPerToken(modelName) {
                                    const costs = {
                                        'gpt-3.5-turbo': 0.0000015, // $1.50 / 1M tokens,
                                        'gpt-3.5-turbo-16k': 0.000003, // $3.00 / 1M tokens,
                                        'gpt-4': 0.00003, // $30.00 / 1M tokens,
                                        'gpt-4-32k': 0.00006, // $60.00 / 1M tokens,
                                        'gpt-4-turbo': 0.00001, // $10.00 / 1M tokens,
                                        'gpt-4o': 0.000005, // $5.00 / 1M tokens,
                                        'gpt-4o-mini': 0.00000015 // $0.15 / 1M tokens,
                                    };
                                    return costs[modelName] || 0.000002;
                                },
                                static getModelMaxTokens(modelName) {
                                    const maxTokens = {
                                        'gpt-3.5-turbo': 4096,
                                        'gpt-3.5-turbo-16k': 16384,
                                        'gpt-4': 8192,
                                        'gpt-4-32k': 32768,
                                        'gpt-4-turbo': 128000,
                                        'gpt-4o': 128000,
                                        'gpt-4o-mini': 128000,
                                    };
                                    return maxTokens[modelName] || 4096;
                                },
                                static getModelAverageLatency(modelName) {
                                    const latencies = {
                                        'gpt-3.5-turbo': 800,
                                        'gpt-3.5-turbo-16k': 1200,
                                        'gpt-4': 2500,
                                        'gpt-4-32k': 4000,
                                        'gpt-4-turbo': 1800,
                                        'gpt-4o': 1000,
                                        'gpt-4o-mini': 600,
                                    };
                                    return latencies[modelName] || 1500;
                                    // Private helper methods
                                }
                                // Private helper methods
                                ,
                                // Private helper methods
                                async _testConnection() {
                                    try {
                                        const response = await fetch(`${this.apiEndpoint}/models`, {});
                                    }
                                    finally {
                                    }
                                },
                                headers: {
                                    'Authorization': `Bearer ${this.config.apiKey}` }
                            };
                            'Content-Type';
                            'application/json',
                            ;
                        },
                        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization }) };
                    ;
                    if (!response.ok) {
                        throw new Error(`OpenAI API test failed: ${response.status} ${response.statusText}`);
                    }
                }
                try { }
                catch (error) {
                    throw new Error(`Failed to connect to OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        finally {
        }
    },
    async _makeRequest(endpoint, payload) {
        const url = `${this.apiEndpoint}${endpoint}`;
    },
    const: response = await fetch(url, {}),
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${this.config.apiKey}` } };
'Content-Type';
'application/json',
;
(this.config.organization && { 'OpenAI-Organization': this.config.organization });
body: JSON.stringify(payload);
;
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
}
return response.json();
_convertToMessages(input, any);
ChatMessage;
{
    if (typeof input === 'string') {
        return [{ role: 'user', content: input }];
        if (Array.isArray(input)) {
            return input.map(msg => { });
            if (typeof msg === 'string') {
                return { role: 'user', content: msg };
                return msg;
            }
            ;
            if (input && typeof input === 'object' && input.messages) {
                return input.messages;
                return [{ role: 'user', content: JSON.stringify(input) }];
                _extractContent(response, OpenAIResponse);
                any;
                {
                    const choice = response.choices[0];
                    if (!choice) {
                        throw new Error('No choices returned from OpenAI API');
                        if (choice.message) {
                            return {
                                content: choice.message.content,
                                role: choice.message.role,
                                finishReason: choice.finish_reason,
                                usage: response.usage,
                                model: response.model,
                                id: response.id,
                            };
                            if (choice.text) {
                                return {
                                    content: choice.text,
                                    finishReason: choice.finish_reason,
                                    usage: response.usage,
                                    model: response.model,
                                    id: response.id,
                                };
                                throw new Error('Invalid response format from OpenAI API');
                                _estimateTokenCount(messages, ChatMessage);
                                number;
                                {
                                    // Rough estimation: 4 characters per token
                                    const totalText = messages.map(msg => );
                                    ;
                                    (msg.content || '') + (msg.role || '') + (msg.name || '');
                                    join(' ');
                                    return Math.ceil(totalText.length / 4);
                                    async;
                                    _performHealthCheck();
                                    Promise < void  > {
                                        await, this: ._testConnection(),
                                        export: , default: OpenAIAdapter
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
