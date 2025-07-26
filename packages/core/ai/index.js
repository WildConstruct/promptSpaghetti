/**
 * AI Multi-Model Integration Framework
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Unified exports for all AI model components
 */
// Base classes and interfaces
export * from './BaseAIModel';
// Concrete adapters
export { default as OpenAIAdapter } from './adapters/OpenAIAdapter';
export { default as AnthropicAdapter } from './adapters/AnthropicAdapter';
export { default as GenericHTTPAdapter } from './adapters/GenericHTTPAdapter';
export { default as LocalModelAdapter } from './adapters/LocalModelAdapter';
// Image generation adapters
export { default as DALLEAdapter } from './adapters/DALLEAdapter';
export { default as MidjourneyAdapter } from './adapters/MidjourneyAdapter';
export { default as StableDiffusionAdapter } from './adapters/StableDiffusionAdapter';
// Audio generation and processing adapters
export { default as OpenAITTSAdapter } from './adapters/OpenAITTSAdapter';
export { default as ElevenLabsAdapter } from './adapters/ElevenLabsAdapter';
export { default as WhisperAdapter } from './adapters/WhisperAdapter';
// Video generation and processing adapters
export { default as RunwayMLAdapter } from './adapters/RunwayMLAdapter';
export { default as StableVideoAdapter } from './adapters/StableVideoAdapter';
// Multimodal and cross-modal intelligence adapters
export { default as MultimodalAdapter } from './adapters/MultimodalAdapter';
// Factory and management
export { default as AIModelFactory } from './AIModelFactory';
export { default as ModelManager } from './ModelManager';
export { default as ConfigurationManager } from './ConfigurationManager';
// Image processing utilities
export { default as ImageProcessor } from './utils/ImageProcessor';
// Import AIModelFactory for local use
import { AIModelFactory } from './AIModelFactory';
// Performance optimization exports
export * from './performance';
// Utility functions and helpers
export const createOpenAIModel = async (id, apiKey, modelName = 'gpt-3.5-turbo') => {
    const factory = new AIModelFactory();
    return factory.createModel({
        id,
        type: 'text',
        provider: 'openai',
        modelName,
        apiKey
    });
};
export const createAnthropicModel = async (id, apiKey, modelName = 'claude-3-sonnet-20240229') => {
    const factory = new AIModelFactory();
    return factory.createModel({
        id,
        type: 'text',
        provider: 'anthropic',
        modelName,
        apiKey
    });
};
export const createLocalModel = async (id, endpoint, modelName) => {
    const factory = new AIModelFactory();
    return factory.createModel({
        id,
        type: 'text',
        provider: 'local',
        modelName,
        endpoint
    });
};
export const createCustomHTTPModel = async (id, endpoint, requestMapping, apiKey) => {
    const factory = new AIModelFactory();
    const registration = {
        id,
        provider: 'custom',
        modelName: 'custom-model',
        config: { baseURL: endpoint, apiKey },
        requestMapping
    };
    factory.registerModel(registration);
    return factory.createModel({
        id,
        type: 'text',
        provider: 'custom',
        endpoint,
        apiKey
    });
};
