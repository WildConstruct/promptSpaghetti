/**
 * AI Model Factory
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Factory for creating and managing AI model adapters
 */
import { BaseAIModel, AIModelType, AIModelProvider, ModelConfiguration } from './BaseAIModel';
export class AIModelFactory {
    factoryConfig;
    registeredModels = new Map();
    modelInstances = new Map();
    constructor(config = {}) {
        this.factoryConfig = {
            defaultTimeout: 30000,
            defaultRetries: 3,
            enableLogging: true,
            logLevel: 'info',
            ...config
        };
        async;
        createModel(config, ModelConfiguration);
        Promise < BaseAIModel > {
            try: {
                this: ._log('info', `Creating model: ${config.id} (${config.provider})`)
            },
            let, model: BaseAIModel,
            switch(config) { }, : .provider
        };
        {
            AIModelProvider.OPENAI;
            model = await this._createOpenAIModel(config);
            break;
            AIModelProvider.ANTHROPIC;
            model = await this._createAnthropicModel(config);
            break;
            AIModelProvider.LOCAL;
            model = await this._createLocalModel(config);
            break;
            AIModelProvider.CUSTOM;
            model = await this._createCustomHTTPModel(config);
            break;
        }
    }
    default;
}
new Error(`Unsupported provider: ${config.provider}`);
// Initialize the model
await model.initialize();
// Cache the instance
this.modelInstances.set(config.id, model);
this._log('info', `Model created successfully: ${config.id}`);
return model;
try { }
catch (error) {
    this._log('error', `Failed to create model ${config.id}:`, error);
}
throw error;
getSupportedTypes();
AIModelType;
{
    return [
        AIModelType.TEXT,
        AIModelType.IMAGE,
        AIModelType.AUDIO,
        AIModelType.VIDEO,
        AIModelType.MULTIMODAL
    ];
    getDefaultConfiguration(type, AIModelType);
    ModelConfiguration;
    {
        const baseConfig = {
            id: `default-${type}-model` };
    }
    type,
        provider;
    AIModelProvider.OPENAI,
        parameters;
    { }
}
;
switch (type) {
    case AIModelType.TEXT:
        return {
            ...baseConfig,
            provider: AIModelProvider.OPENAI,
            modelName: 'gpt-3.5-turbo',
            parameters: {
                temperature: 1,
                max_tokens: 1000,
            },
            case: AIModelType.IMAGE,
            return: {
                ...baseConfig,
                provider: AIModelProvider.OPENAI,
                modelName: 'dall-e-3',
                parameters: {
                    size: '1024x1024',
                    quality: 'standard',
                },
                case: AIModelType.AUDIO,
                return: {
                    ...baseConfig,
                    provider: AIModelProvider.OPENAI,
                    modelName: 'tts-1',
                    parameters: {
                        voice: 'alloy',
                        speed: 1,
                    },
                    case: AIModelType.MULTIMODAL,
                    return: {
                        ...baseConfig,
                        provider: AIModelProvider.OPENAI,
                        modelName: 'gpt-4-vision-preview',
                        parameters: {
                            temperature: 0.7,
                            max_tokens: 1000,
                        },
                        default: ,
                        return: baseConfig,
                        // Model registration and management
                        registerModel(registration) {
                            this.registeredModels.set(registration.id, registration);
                            this._log('info', `Registered model: ${registration.id}`);
                        },
                        unregisterModel(modelId) {
                            this.registeredModels.delete(modelId);
                            this._log('info', `Unregistered model: ${modelId}`);
                        },
                        getRegisteredModels() {
                            return Array.from(this.registeredModels.values());
                            async;
                            getModel(modelId, string);
                            Promise < BaseAIModel | null > {
                                : .modelInstances.has(modelId) };
                            {
                                return this.modelInstances.get(modelId);
                                // Try to create from registration
                                const registration = this.registeredModels.get(modelId);
                                if (registration) {
                                    const config = {
                                        id: registration.id,
                                        type: registration.metadata?.type || AIModelType.TEXT,
                                        provider: registration.provider,
                                        modelName: registration.modelName,
                                        parameters: registration.config,
                                        metadata: registration.metadata,
                                        capabilities: registration.capabilities,
                                    };
                                    return this.createModel(config);
                                    return null;
                                    async;
                                    destroyModel(modelId, string);
                                    Promise < void  > {
                                        const: model = this.modelInstances.get(modelId),
                                        if(model) {
                                            await model.cleanup();
                                            this.modelInstances.delete(modelId);
                                            this._log('info', `Destroyed model: ${modelId}`);
                                        },
                                        async destroyAllModels() {
                                            const destroyPromises = Array.from(this.modelInstances.keys()).map(id => );
                                            ;
                                            this.destroyModel(id);
                                            ;
                                            await Promise.all(destroyPromises);
                                            this._log('info', 'Destroyed all model instances');
                                            // Provider-specific factory methods
                                        }
                                        // Provider-specific factory methods
                                        ,
                                        // Provider-specific factory methods
                                        async _createOpenAIModel(config) {
                                            const openaiConfig = {
                                                apiKey: config.apiKey || '',
                                                baseURL: config.endpoint,
                                                timeout: this.factoryConfig.defaultTimeout,
                                                maxRetries: this.factoryConfig.defaultRetries,
                                                ...config.parameters
                                            };
                                            return new OpenAIAdapter(config.id, openaiConfig, config.modelName);
                                        },
                                        async _createAnthropicModel(config) {
                                            const anthropicConfig = {
                                                apiKey: config.apiKey || '',
                                                baseURL: config.endpoint,
                                                timeout: this.factoryConfig.defaultTimeout,
                                                maxRetries: this.factoryConfig.defaultRetries,
                                                ...config.parameters
                                            };
                                            return new AnthropicAdapter(config.id, anthropicConfig, config.modelName);
                                        },
                                        async _createLocalModel(config) {
                                            const localConfig = {
                                                endpoint: config.endpoint || 'http://localhost:11434',
                                                modelName: config.modelName || 'llama2',
                                                timeout: this.factoryConfig.defaultTimeout,
                                                maxRetries: this.factoryConfig.defaultRetries,
                                                modelType: 'ollama',
                                                ...config.parameters
                                            };
                                            return new LocalModelAdapter(config.id, localConfig);
                                        },
                                        async _createCustomHTTPModel(config) {
                                            const httpConfig = {
                                                baseURL: config.endpoint || '',
                                                apiKey: config.apiKey,
                                                timeout: this.factoryConfig.defaultTimeout,
                                                maxRetries: this.factoryConfig.defaultRetries,
                                                ...config.parameters
                                            };
                                            // Default request mapping for custom models
                                            const defaultMapping = {
                                                inputPath: 'input',
                                                outputPath: 'output',
                                                parametersPath: 'parameters',
                                                usagePath: 'usage',
                                                errorPath: 'error',
                                            };
                                            // Use registration mapping if available
                                            const registration = this.registeredModels.get(config.id);
                                            const requestMapping = registration?.requestMapping || defaultMapping;
                                            return new GenericHTTPAdapter();
                                            config.id,
                                                httpConfig,
                                                config.metadata || {},
                                                config.capabilities || {},
                                                requestMapping;
                                            ;
                                            // Utility methods
                                            async;
                                            testModel(modelId, string);
                                            Promise < boolean > {
                                                try: {
                                                    const: model = await this.getModel(modelId),
                                                    if(, model) {
                                                        return false;
                                                        const health = await model.health();
                                                        return health.status === 'ready';
                                                    }, catch(error) {
                                                        this._log('error', `Model test failed for ${modelId}:`, error);
                                                    },
                                                    return: false,
                                                    async getModelHealth(modelId) {
                                                        const model = await this.getModel(modelId);
                                                        if (!model) {
                                                            throw new Error(`Model not found: ${modelId}`);
                                                        }
                                                        return model.health();
                                                        getModelMetadata(modelId, string);
                                                        ModelMetadata | null;
                                                        {
                                                            const model = this.modelInstances.get(modelId);
                                                            if (model) {
                                                                return model.metadata;
                                                                const registration = this.registeredModels.get(modelId);
                                                                if (registration?.metadata) {
                                                                    return registration.metadata;
                                                                    return null;
                                                                    // Batch operations
                                                                    async;
                                                                    createModels(configs, ModelConfiguration);
                                                                    Promise < BaseAIModel > {
                                                                        const: createPromises = configs.map(config => this.createModel(config)),
                                                                        return: Promise.all(createPromises),
                                                                        async testAllModels() {
                                                                            const results = {};
                                                                            const testPromises = Array.from(this.modelInstances.keys()).map(async (modelId) => {
                                                                                results[modelId] = await this.testModel(modelId);
                                                                            });
                                                                            await Promise.all(testPromises);
                                                                            return results;
                                                                            // Configuration management
                                                                            updateFactoryConfig(config, (Partial));
                                                                            void {
                                                                                this: .factoryConfig = { ...this.factoryConfig, ...config },
                                                                                this: ._log('info', 'Factory configuration updated'),
                                                                                getFactoryConfig() {
                                                                                    return { ...this.factoryConfig };
                                                                                    // Statistics and monitoring
                                                                                    getStatistics();
                                                                                    unknown;
                                                                                    {
                                                                                        const totalModels = this.modelInstances.size;
                                                                                        const totalRegistrations = this.registeredModels.size;
                                                                                        const providerCounts = {};
                                                                                        Array.from(this.modelInstances.values()).forEach(model => { });
                                                                                        const provider = model.metadata.provider;
                                                                                        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
                                                                                    }
                                                                                    ;
                                                                                    return {
                                                                                        totalModels,
                                                                                        totalRegistrations,
                                                                                        providerCounts,
                                                                                        factoryConfig: this.factoryConfig,
                                                                                    };
                                                                                    // Private utility methods
                                                                                }
                                                                                // Private utility methods
                                                                                ,
                                                                                // Private utility methods
                                                                                _log(level, message, ...args) {
                                                                                    if (!this.factoryConfig.enableLogging) {
                                                                                        return;
                                                                                        const levels = ['debug', 'info', 'warn', 'error'];
                                                                                        const currentLevelIndex = levels.indexOf(this.factoryConfig.logLevel || 'info');
                                                                                        const messageLevelIndex = levels.indexOf(level);
                                                                                        if (messageLevelIndex >= currentLevelIndex) {
                                                                                            const timestamp = new Date().toISOString();
                                                                                            console[level](`[${timestamp}] [AIModelFactory] ${message}`, ...args);
                                                                                        }
                                                                                        export default AIModelFactory;
                                                                                    }
                                                                                }
                                                                            };
                                                                        }
                                                                    };
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            };
                                        }
                                    };
                                }
                            }
                        }
                    }
                }
            }
        };
}
