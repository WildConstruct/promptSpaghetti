/**
 * OpenAI GPT adaptor implementation
 * Epic 10.1.3 - Mapping Strategy Development
 */
import { BaseAdaptor } from './BaseAdaptor';
/**
 * OpenAI adaptor for text-to-text generation
 */
export class OpenAIAdaptor extends BaseAdaptor {
    id = 'openai-gpt';
    version = '1.0.0';
    name = 'OpenAI GPT';
    description = 'OpenAI GPT models for text generation';
    platforms = ['openai', 'chatgpt', 'gpt'];
    openaiConfig = {};
    /**
     * Initialize with OpenAI-specific configuration
     */
    async onInitialize() {
        this.openaiConfig = {
            model: 'gpt-3.5-turbo',
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORGANIZATION,
            baseURL: process.env.OPENAI_BASE_URL,
            ...(this.config.openai || {})
        };
        if (!this.openaiConfig.apiKey) {
            throw new Error('OpenAI API key is required');
        }
    }
    /**
     * Get platform capabilities
     */
    async capabilities() {
        const model = this.openaiConfig.model || 'gpt-3.5-turbo';
        // Model-specific capabilities
        const modelCapabilities = this.getModelCapabilities(model);
        return {
            platform: 'openai',
            version: this.version,
            maxTokens: modelCapabilities.maxTokens,
            parameterRanges: {
                temperature: [0.0, 2.0],
                top_p: [0.0, 1.0],
                frequency_penalty: [-2.0, 2.0],
                presence_penalty: [-2.0, 2.0],
                max_tokens: [1, modelCapabilities.maxTokens]
            },
            features: [
                'text-generation',
                'chat-completion',
                'system-messages',
                'function-calling',
                'json-mode',
                'streaming',
                'temperature-control',
                'top-p-sampling',
                'frequency-penalty',
                'presence-penalty',
                'stop-sequences'
            ],
            styleSupport: false,
            negativePromptSupport: false,
            customParameters: {
                model: model,
                supportsChatFormat: true,
                supportsSystemMessages: true,
                supportsFunctionCalling: model.includes('gpt-4') || model.includes('gpt-3.5-turbo')
            }
        };
    }
    /**
     * Get text generation specific capabilities
     */
    async textCapabilities() {
        const model = this.openaiConfig.model || 'gpt-3.5-turbo';
        const modelCapabilities = this.getModelCapabilities(model);
        return {
            maxContextLength: modelCapabilities.maxTokens,
            supportsChatFormat: true,
            supportsSystemMessages: true,
            supportsFunctionCalling: model.includes('gpt-4') || model.includes('gpt-3.5-turbo'),
            temperatureRange: [0.0, 2.0],
            topPRange: [0.0, 1.0]
        };
    }
    /**
     * Platform-specific validation
     */
    async performPlatformValidation(graph, config) {
        const errors = [];
        const warnings = [];
        // Extract text content from graph
        const textContent = this.extractTextContent(graph);
        // Check content length
        const model = this.openaiConfig.model || 'gpt-3.5-turbo';
        const modelCapabilities = this.getModelCapabilities(model);
        const estimatedTokens = this.estimateTokenCount(textContent);
        if (estimatedTokens > modelCapabilities.maxTokens * 0.8) {
            warnings.push({
                code: 'CONTENT_TOO_LONG',
                message: `Content may exceed model context limit (estimated: ${estimatedTokens} tokens, limit: ${modelCapabilities.maxTokens})`,
                optimization: 'Consider breaking content into smaller chunks'
            });
        }
        // Check for image-specific content that won't translate well
        const hasImageContent = this.detectImageContent(graph);
        if (hasImageContent) {
            warnings.push({
                code: 'IMAGE_CONTENT_DETECTED',
                message: 'Graph contains image-related content that may not translate well to text generation',
                optimization: 'Remove image-specific nodes or use a text-to-image adaptor instead'
            });
        }
        // Check for unsupported features
        const unsupportedFeatures = this.detectUnsupportedFeatures(graph);
        for (const feature of unsupportedFeatures) {
            warnings.push({
                code: 'UNSUPPORTED_FEATURE',
                message: `Feature '${feature}' is not supported by OpenAI models`,
                optimization: 'Remove or replace unsupported features'
            });
        }
        // Calculate compatibility score
        const totalIssues = errors.length + warnings.length;
        const compatibilityScore = Math.max(0, 1 - (totalIssues * 0.1));
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            compatibilityScore
        };
    }
    /**
     * Transform graph to OpenAI format
     */
    async performTransformation(graph, config) {
        // Extract content and build OpenAI prompt
        const { prompt, systemMessage } = this.buildOpenAIPrompt(graph, config);
        // Build parameters
        const parameters = this.buildOpenAIParameters(graph, config);
        return {
            platform: 'openai',
            prompt,
            parameters: {
                ...parameters,
                ...(systemMessage && { system: systemMessage })
            }
        };
    }
    /**
     * Build OpenAI-specific prompt from graph
     */
    buildOpenAIPrompt(graph, config) {
        let systemMessage;
        const userContent = [];
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            return { prompt: '' };
        }
        // Process nodes in execution order
        for (const node of graph.nodes) {
            if (!node.data)
                continue;
            switch (node.type) {
                case 'system':
                    systemMessage = node.data.text || node.data.content;
                    break;
                case 'user':
                case 'output':
                case 'text':
                    if (node.data.text || node.data.content) {
                        userContent.push(node.data.text || node.data.content);
                    }
                    break;
                case 'concat':
                    if (node.data.template) {
                        userContent.push(node.data.template);
                    }
                    break;
                case 'weightedChoice':
                    // For weighted choice, pick the first option for now
                    // In a real implementation, this would be handled by the graph executor
                    if (node.data.choices && node.data.choices.length > 0) {
                        userContent.push(node.data.choices[0].text);
                    }
                    break;
                case 'setVariable':
                case 'getVariable':
                    // Variables would be resolved by the graph executor
                    if (node.data.defaultValue) {
                        userContent.push(String(node.data.defaultValue));
                    }
                    break;
            }
        }
        // Join content with appropriate spacing
        const prompt = userContent.filter(Boolean).join('\n\n').trim();
        return { prompt, systemMessage };
    }
    /**
     * Build OpenAI API parameters
     */
    buildOpenAIParameters(graph, config) {
        const parameters = {
            model: this.openaiConfig.model || 'gpt-3.5-turbo'
        };
        // Apply configuration preferences
        if (config?.qualityPreference !== undefined) {
            // Higher quality = lower temperature for more focused responses
            parameters.temperature = this.normalizeParameter(1 - config.qualityPreference, [0, 1], [0.0, 1.0]);
        }
        else {
            parameters.temperature = 0.7; // Default
        }
        // Add other parameters from platform overrides
        if (config?.platformOverrides?.openai) {
            const overrides = config.platformOverrides.openai;
            Object.assign(parameters, overrides);
        }
        // Ensure parameters are within valid ranges
        const capabilities = this.getModelCapabilities(parameters.model);
        if (typeof parameters.temperature === 'number') {
            parameters.temperature = Math.max(0.0, Math.min(2.0, parameters.temperature));
        }
        if (typeof parameters.max_tokens === 'number') {
            parameters.max_tokens = Math.max(1, Math.min(capabilities.maxTokens, parameters.max_tokens));
        }
        return parameters;
    }
    /**
     * Get model-specific capabilities
     */
    getModelCapabilities(model) {
        const modelCapabilities = {
            'gpt-4': { maxTokens: 8192 },
            'gpt-4-32k': { maxTokens: 32768 },
            'gpt-4-turbo': { maxTokens: 128000 },
            'gpt-4-turbo-preview': { maxTokens: 128000 },
            'gpt-3.5-turbo': { maxTokens: 4096 },
            'gpt-3.5-turbo-16k': { maxTokens: 16384 },
            'text-davinci-003': { maxTokens: 4097 },
            'text-curie-001': { maxTokens: 2049 }
        };
        return modelCapabilities[model] || { maxTokens: 4096 };
    }
    /**
     * Estimate token count for text (rough approximation)
     */
    estimateTokenCount(text) {
        // Rough estimate: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }
    /**
     * Detect image-related content in graph
     */
    detectImageContent(graph) {
        if (!graph.nodes)
            return false;
        const imageKeywords = [
            'image', 'photo', 'picture', 'visual', 'artwork', 'painting',
            'drawing', 'illustration', 'style:', '--ar', 'aspect ratio'
        ];
        return graph.nodes.some((node) => {
            const text = (node.data?.text || node.data?.content || '').toLowerCase();
            return imageKeywords.some(keyword => text.includes(keyword));
        });
    }
    /**
     * Detect features not supported by OpenAI models
     */
    detectUnsupportedFeatures(graph) {
        const unsupported = [];
        if (!graph.nodes)
            return unsupported;
        for (const node of graph.nodes) {
            switch (node.type) {
                case 'image':
                case 'style':
                case 'negativePrompt':
                    unsupported.push(node.type);
                    break;
            }
        }
        return [...new Set(unsupported)]; // Remove duplicates
    }
    /**
     * Get platform-specific optimizations
     */
    async getPlatformOptimizations(graph, config) {
        const optimizations = [];
        // Check for system message optimization
        const hasSystemContent = graph.nodes?.some((node) => node.type === 'system' || node.data?.role === 'system');
        if (hasSystemContent) {
            optimizations.push('system-message-extraction');
        }
        // Check for conversation format optimization
        const hasMultipleRoles = graph.nodes?.some((node) => node.data?.role && ['user', 'assistant', 'system'].includes(node.data.role));
        if (hasMultipleRoles) {
            optimizations.push('chat-format-optimization');
        }
        // Temperature optimization based on content type
        const textContent = this.extractTextContent(graph);
        if (textContent.includes('creative') || textContent.includes('story')) {
            optimizations.push('creative-temperature-boost');
        }
        else if (textContent.includes('analysis') || textContent.includes('factual')) {
            optimizations.push('analytical-temperature-reduction');
        }
        return optimizations;
    }
}
//# sourceMappingURL=OpenAIAdaptor.js.map