/**
 * AI Multi-Model Integration Framework
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Unified exports for all AI model components
 */
export * from './BaseAIModel';
export { default as OpenAIAdapter } from './adapters/OpenAIAdapter';
export type { OpenAIConfig, OpenAIRequestOptions, ChatMessage, OpenAIResponse } from './adapters/OpenAIAdapter';
export { default as AnthropicAdapter } from './adapters/AnthropicAdapter';
export type { AnthropicConfig, AnthropicRequestOptions, ClaudeMessage, AnthropicResponse } from './adapters/AnthropicAdapter';
export { default as GenericHTTPAdapter } from './adapters/GenericHTTPAdapter';
export type { HTTPConfig, HTTPRequestOptions, HTTPRequestMapping, GenericHTTPResponse } from './adapters/GenericHTTPAdapter';
export { default as LocalModelAdapter } from './adapters/LocalModelAdapter';
export type { LocalModelConfig, LocalRequestOptions, OllamaMessage, LocalModelResponse } from './adapters/LocalModelAdapter';
export { default as DALLEAdapter } from './adapters/DALLEAdapter';
export type { DALLEConfig, DALLERequestOptions, ImageGenerationResult, ImagePromptOptimization } from './adapters/DALLEAdapter';
export { default as MidjourneyAdapter } from './adapters/MidjourneyAdapter';
export type { MidjourneyConfig, MidjourneyRequestOptions, MidjourneyJobStatus, MidjourneyGenerationResult } from './adapters/MidjourneyAdapter';
export { default as StableDiffusionAdapter } from './adapters/StableDiffusionAdapter';
export type { StableDiffusionConfig, StableDiffusionRequestOptions, StableDiffusionGenerationResult, ModelInfo } from './adapters/StableDiffusionAdapter';
export { default as OpenAITTSAdapter } from './adapters/OpenAITTSAdapter';
export type { OpenAITTSConfig, TTSRequestOptions, TTSGenerationResult, VoiceInfo } from './adapters/OpenAITTSAdapter';
export { default as ElevenLabsAdapter } from './adapters/ElevenLabsAdapter';
export type { ElevenLabsConfig, ElevenLabsRequestOptions, ElevenLabsGenerationResult, ElevenLabsVoice, ElevenLabsModel } from './adapters/ElevenLabsAdapter';
export { default as WhisperAdapter } from './adapters/WhisperAdapter';
export type { WhisperConfig, WhisperRequestOptions, WhisperTranscriptionResult, AudioFileInfo } from './adapters/WhisperAdapter';
export { default as RunwayMLAdapter } from './adapters/RunwayMLAdapter';
export type { RunwayMLConfig, RunwayMLRequestOptions, RunwayMLGenerationResult, RunwayMLTask } from './adapters/RunwayMLAdapter';
export { default as StableVideoAdapter } from './adapters/StableVideoAdapter';
export type { StableVideoConfig, StableVideoRequestOptions, StableVideoGenerationResult, SVDModelInfo } from './adapters/StableVideoAdapter';
export { default as MultimodalAdapter } from './adapters/MultimodalAdapter';
export type { MultimodalConfig, MultimodalInput, MultimodalRequestOptions, MultimodalUnderstandingResult } from './adapters/MultimodalAdapter';
export { default as AIModelFactory } from './AIModelFactory';
export type { FactoryConfig, ModelRegistration } from './AIModelFactory';
export { default as ModelManager } from './ModelManager';
export type { CacheConfig, LoadBalancingConfig, ModelPool, ModelPerformanceMetrics, WarmupStrategy, ModelCache, LoadBalancer, HealthMonitor } from './ModelManager';
export { default as ConfigurationManager } from './ConfigurationManager';
export type { EnvironmentConfig, ConfigurationSchema, ValidationRule, ValidationResult, ConfigurationUpdate, ConfigurationHistory, ConfigurationValidator } from './ConfigurationManager';
export { default as ImageProcessor } from './utils/ImageProcessor';
export type { ImageMetadata, ImageProcessingOptions, ImageVariationOptions, ImageBatchProcessingOptions } from './utils/ImageProcessor';
export type { AIModelType, AIModelProvider, AIModelStatus, ModelCapabilities, ModelMetadata, CostEstimate, HealthStatus, AIRequest, AIResponse, ModelConfiguration, AIModelFactory as IAIModelFactory } from './BaseAIModel';
export * from './performance';
//# sourceMappingURL=index.d.ts.map