/**
 * DALL-E 3 Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Comprehensive adapter for OpenAI DALL-E 3 image generation
 */
import { BaseAIModel, AIModelStatus, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';
 > ;
;
 > ;
originalPrompt: string;
optimizedPrompt ?  : string;
usage: {
    promptTokens: number;
    totalCost: number;
}
;
generationTime: number;
export class DALLEAdapter extends BaseAIModel {
    config;
    apiEndpoint;
    promptOptimizer;
    constructor(id, config, modelName = 'dall-e-3') {
        const metadata = {
            name: modelName,
            version: '1.0',
            description: `OpenAI ${modelName} image generation model` };
    }
    provider;
    type;
    costPerRequest;
    modelName;
    averageLatency;
    modelName;
    maxConcurrency;
    rateLimit;
}
 === 'dall-e-3' ? 5 : 50,
    tokensPerMinute;
1000,
;
tags: ['image-generation', 'creative', 'artistic'],
    lastUpdated;
new Date();
;
const capabilities = {
    inputTypes: ['text'],
    outputTypes: ['image', 'url', 'base64'],
    maxInputSize: 4000, // Characters in prompt,
    maxOutputSize: 1, // Number of images,
    supportsBatch: false,
    supportsStreaming: false,
    supportsAsync: true,
    customParameters: {
        size: {
            type: 'enum',
            values: modelName === 'dall-e-3', }
            ? ['1024x1024', '1792x1024', '1024x1792']
            : ['256x256', '512x512', '1024x1024'],
        default: '1024x1024',
    },
    quality: {
        type: 'enum',
        values: ['standard', 'hd'],
        default: 'standard',
        available: modelName === 'dall-e-3',
    },
    style: {
        type: 'enum',
        values: ['vivid', 'natural'],
        default: 'vivid',
        available: modelName === 'dall-e-3',
    },
    n: {
        type: 'number',
        min: 1,
        max: modelName === 'dall-e-3' ? 1 : 10,
        default: 1,
    },
    this: .config = config,
    this: .apiEndpoint = config.baseURL || 'https://api.openai.com/v1',
    this: .promptOptimizer = new PromptOptimizer(modelName),
    async initialize() {
        try {
            this._status = AIModelStatus.INITIALIZING;
            if (!this.config.apiKey) {
                throw new Error('OpenAI API key is required for DALL-E');
                // Test connectivity
                await this._testConnection();
                this._status = AIModelStatus.READY;
                this._lastActivity = new Date();
            }
            try { }
            catch (error) {
                this._status = AIModelStatus.ERROR;
                throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
                async;
                process(input, unknown, options ?  : DALLERequestOptions);
                Promise < ImageGenerationResult > {
                    try: {
                        : ._status !== AIModelStatus.READY
                    }
                };
                {
                    throw new ModelUnavailableError(this._id);
                    const startTime = Date.now();
                    // Extract and optimize prompt
                    const prompt = this._extractPrompt(input);
                    const optimization = await this.promptOptimizer.optimizePrompt(prompt, options);
                    // Prepare request payload
                    const payload = {
                        model: options?.model || this._metadata.name,
                        prompt: optimization.optimizedPrompt,
                        size: options?.size || '1024x1024',
                        quality: options?.quality || 'standard',
                        style: options?.style || 'vivid',
                        n: options?.n || 1,
                        response_format: options?.response_format || 'url',
                        ...(options?.user && { user: options.user })
                    };
                    // Validate parameters for model
                    this._validateParameters(payload);
                    const response = await this._makeRequest('/images/generations', payload);
                    const generationTime = Date.now() - startTime;
                    // Process and return results
                    return this._processImageResponse(response, optimization, payload, generationTime);
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
                            const model = options?.model || this._metadata.name;
                            const size = options?.size || '1024x1024';
                            const quality = options?.quality || 'standard';
                            const n = options?.n || 1;
                            let baseCost = this._metadata.costPerRequest || 0;
                            // Adjust cost based on parameters
                            if (model === 'dall-e-3') {
                                if (quality === 'hd') {
                                    baseCost *= 2; // HD costs 2x
                                    if (size === '1792x1024' || size === '1024x1792') {
                                        baseCost *= 2; // Larger sizes cost 2x
                                        const totalCost = baseCost * n;
                                        return {
                                            estimatedCost: totalCost,
                                            currency: 'USD',
                                            confidence: 0.95,
                                            breakdown: {
                                                inputCost: 0,
                                                outputCost: totalCost,
                                                processingCost: 0,
                                            },
                                            // Image-specific methods
                                            async generateVariations(imageUrl, options) {
                                                // Note: Variations are only available for DALL-E 2
                                                if (this._metadata.name === 'dall-e-3') {
                                                    throw new Error('Image variations are not available for DALL-E 3');
                                                    const payload = {
                                                        image: imageUrl,
                                                        n: options?.n || 1,
                                                        size: options?.size || '1024x1024',
                                                        response_format: options?.response_format || 'url',
                                                        ...(options?.user && { user: options.user })
                                                    };
                                                    const response = await this._makeRequest('/images/variations', payload);
                                                    const generationTime = Date.now() - Date.now(); // Placeholder timing;
                                                    return this._processImageResponse(response, {});
                                                    originalPrompt: 'Image variation',
                                                        optimizedPrompt;
                                                    'Image variation',
                                                        optimizations;
                                                    [],
                                                        styleEnhancements;
                                                    [],
                                                        qualityImprovements;
                                                    [],
                                                    ;
                                                }
                                                payload, generationTime;
                                                ;
                                                async;
                                                editImage(imageUrl, string);
                                                maskUrl: string,
                                                    prompt;
                                                string,
                                                    options ?  : Partial;
                                            }
                                        };
                                    }
                                }
                            }
                        } };
                }
            }
        }
        finally {
        }
    } };
Promise < ImageGenerationResult > {
    : ._metadata.name === 'dall-e-3'
};
{
    throw new Error('Image editing is not available for DALL-E 3');
    const optimization = await this.promptOptimizer.optimizePrompt(prompt, options);
    const payload = {
        image: imageUrl,
        mask: maskUrl,
        prompt: optimization.optimizedPrompt,
        n: options?.n || 1,
        size: options?.size || '1024x1024',
        response_format: options?.response_format || 'url',
        ...(options?.user && { user: options.user })
    };
    const response = await this._makeRequest('/images/edits', payload);
    const generationTime = Date.now() - Date.now(); // Placeholder timing;
    return this._processImageResponse(response, optimization, payload, generationTime);
    getModelCostPerRequest(modelName, string);
    number;
    {
        const costs = {
            'dall-e-2': 0.02, // $0.020 per image (1024×1024),
            'dall-e-3': 0.04 // $0.040 per image (1024×1024, standard quality),
        };
        return costs[modelName] || 0.04;
        getModelAverageLatency(modelName, string);
        number;
        {
            const latencies = {
                'dall-e-2': 15000, // ~15 seconds,
                'dall-e-3': 25000 // ~25 seconds,
            };
            return latencies[modelName] || 20000;
            async;
            _testConnection();
            Promise < void  > {
                try: {
                    const: response = await fetch(`${this.apiEndpoint}/models`, {})
                }
            },
                headers;
            {
                'Authorization';
                `Bearer ${this.config.apiKey}`;
            }
        }
        'Content-Type';
        'application/json',
        ;
        (this.config.organization && { 'OpenAI-Organization': this.config.organization });
    }
    ;
    if (!response.ok) {
        throw new Error(`OpenAI API test failed: ${response.status} ${response.statusText}`);
    }
}
try { }
catch (error) {
    throw new Error(`Failed to connect to OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
async;
_makeRequest(endpoint, string, payload, unknown);
Promise < DALLEResponse > {
    const: url = `${this.apiEndpoint}${endpoint}`
};
let lastError = null;
const maxRetries = this.config.maxRetries ?? 3;
for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
        const response = await fetch(url, {});
        method: 'POST',
            headers;
        {
            'Authorization';
            `Bearer ${this.config.apiKey}`;
        }
    }
    finally {
    }
    'Content-Type';
    'application/json',
    ;
    (this.config.organization && { 'OpenAI-Organization': this.config.organization });
}
body: JSON.stringify(payload),
    signal;
AbortSignal.timeout(this.config.timeout || 120000); // 2 minutes default;
;
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`DALL-E API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
}
return response.json();
try { }
catch (error) {
    lastError = error instanceof Error ? error : new Error('Unknown error');
    if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        throw lastError || new Error('All retry attempts failed');
        _extractPrompt(input, any);
        string;
        {
            if (typeof input === 'string') {
                return input;
                if (input && typeof input === 'object') {
                    if (input.prompt)
                        return input.prompt;
                    if (input.description)
                        return input.description;
                    if (input.text)
                        return input.text;
                    return JSON.stringify(input);
                    _validateParameters(payload, any);
                    void {
                        const: model = payload.model,
                        // DALL-E 3 specific validations
                        if(model) { }
                    } === 'dall-e-3';
                    {
                        if (payload.n > 1) {
                            throw new Error('DALL-E 3 can only generate 1 image at a time');
                            const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
                            if (!validSizes.includes(payload.size)) {
                                throw new Error(`Invalid size for DALL-E 3: ${payload.size}. Valid sizes: ${validSizes.join(', ')}`);
                            }
                            // DALL-E 2 specific validations
                            if (model === 'dall-e-2') {
                                if (payload.quality && payload.quality !== 'standard') {
                                    throw new Error('Quality parameter is only available for DALL-E 3');
                                    if (payload.style) {
                                        throw new Error('Style parameter is only available for DALL-E 3');
                                        const validSizes = ['256x256', '512x512', '1024x1024'];
                                        if (!validSizes.includes(payload.size)) {
                                            throw new Error(`Invalid size for DALL-E 2: ${payload.size}. Valid sizes: ${validSizes.join(', ')}`);
                                        }
                                        // General validations
                                        if (payload.prompt.length > 4000) {
                                            throw new Error('Prompt exceeds maximum length of 4000 characters');
                                            _processImageResponse(response, DALLEResponse),
                                                optimization;
                                            ImagePromptOptimization,
                                                payload;
                                            any,
                                                generationTime;
                                            number;
                                            ImageGenerationResult;
                                            {
                                                const images = response.data.map(item => ({}), url, item.url, base64, item.b64_json, revisedPrompt, item.revised_prompt, metadata, {
                                                    size: payload.size,
                                                    quality: payload.quality || 'standard',
                                                    style: payload.style,
                                                    model: payload.model,
                                                });
                                                // Estimate token usage (rough approximation)
                                                const promptTokens = Math.ceil(optimization.optimizedPrompt.length / 4);
                                                return {
                                                    images,
                                                    originalPrompt: optimization.originalPrompt,
                                                    optimizedPrompt: optimization.optimizedPrompt,
                                                    usage: {
                                                        promptTokens,
                                                        totalCost: (this._metadata.costPerRequest || 0) * images.length,
                                                    },
                                                    generationTime
                                                };
                                                async;
                                                _performHealthCheck();
                                                Promise < void  > {
                                                    await, this: ._testConnection(),
                                                    // Prompt optimization helper class
                                                    class: PromptOptimizer
                                                };
                                                {
                                                    modelName: string;
                                                    constructor(modelName, string);
                                                    {
                                                        this.modelName = modelName;
                                                        async;
                                                        optimizePrompt(prompt, string, options ?  : DALLERequestOptions);
                                                        Promise < ImagePromptOptimization > {
                                                            const: originalPrompt = prompt,
                                                            let, optimizedPrompt = prompt,
                                                            const: optimizations, string = [],
                                                            const: styleEnhancements, string = [],
                                                            const: qualityImprovements, string = [],
                                                            // Basic prompt cleaning
                                                            optimizedPrompt = this._cleanPrompt(optimizedPrompt),
                                                            // Add style enhancements based on options
                                                            if(options, style) { } } === 'vivid';
                                                        {
                                                            optimizedPrompt = this._enhanceForVividStyle(optimizedPrompt);
                                                            styleEnhancements.push('Enhanced for vivid style');
                                                        }
                                                        if (options?.style === 'natural') {
                                                            optimizedPrompt = this._enhanceForNaturalStyle(optimizedPrompt);
                                                            styleEnhancements.push('Enhanced for natural style');
                                                            // Add quality improvements for HD
                                                            if (options?.quality === 'hd') {
                                                                optimizedPrompt = this._enhanceForHD(optimizedPrompt);
                                                                qualityImprovements.push('Enhanced for HD quality');
                                                                // Model-specific optimizations
                                                                if (this.modelName === 'dall-e-3') {
                                                                    optimizedPrompt = this._optimizeForDALLE3(optimizedPrompt);
                                                                    optimizations.push('Optimized for DALL-E 3');
                                                                    return {
                                                                        originalPrompt,
                                                                        optimizedPrompt,
                                                                        optimizations,
                                                                        styleEnhancements,
                                                                        qualityImprovements
                                                                    };
                                                                    _cleanPrompt(prompt, string);
                                                                    string;
                                                                    {
                                                                        // Remove excessive whitespace
                                                                        return prompt.trim().replace(/\s+/g, ' ');
                                                                        _enhanceForVividStyle(prompt, string);
                                                                        string;
                                                                        {
                                                                            // Add vivid descriptors if not present
                                                                            const vividKeywords = ['vibrant', 'bold', 'dramatic', 'intense', 'striking'];
                                                                            const hasVividKeywords = vividKeywords.some(keyword => );
                                                                            ;
                                                                            prompt.toLowerCase().includes(keyword);
                                                                            ;
                                                                            if (!hasVividKeywords) {
                                                                                return `${prompt}, vibrant and dramatic`;
                                                                            }
                                                                            return prompt;
                                                                            _enhanceForNaturalStyle(prompt, string);
                                                                            string;
                                                                            {
                                                                                // Add natural descriptors if not present
                                                                                const naturalKeywords = ['realistic', 'natural', 'subtle', 'soft', 'organic'];
                                                                                const hasNaturalKeywords = naturalKeywords.some(keyword => );
                                                                                ;
                                                                                prompt.toLowerCase().includes(keyword);
                                                                                ;
                                                                                if (!hasNaturalKeywords) {
                                                                                    return `${prompt}, natural and realistic`;
                                                                                }
                                                                                return prompt;
                                                                                _enhanceForHD(prompt, string);
                                                                                string;
                                                                                {
                                                                                    // Add quality descriptors for HD
                                                                                    const qualityKeywords = ['high detail', 'sharp', 'crisp', 'high resolution'];
                                                                                    const hasQualityKeywords = qualityKeywords.some(keyword => );
                                                                                    ;
                                                                                    prompt.toLowerCase().includes(keyword);
                                                                                    ;
                                                                                    if (!hasQualityKeywords) {
                                                                                        return `${prompt}, high detail and sharp focus`;
                                                                                    }
                                                                                    return prompt;
                                                                                    _optimizeForDALLE3(prompt, string);
                                                                                    string;
                                                                                    {
                                                                                        // DALL-E 3 specific optimizations
                                                                                        // Add descriptive elements that work well with DALL-E 3
                                                                                        if (prompt.length < 50) {
                                                                                            return `${prompt}, detailed and professionally rendered`;
                                                                                        }
                                                                                        return prompt;
                                                                                        export default DALLEAdapter;
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
                            }
                        }
                    }
                }
            }
        }
    }
}
