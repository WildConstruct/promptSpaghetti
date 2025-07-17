/**
 * Prompt Targeting System - Epic 10
 * Cross-platform prompt translation for AI models
 */

// Core types and interfaces
export * from './src/types';

// Base adaptor implementation
export { BaseAdaptor } from './src/adaptors/BaseAdaptor';
export { DefaultAdaptorRegistry } from './src/adaptors/AdaptorRegistry';

// Mapping engine
export { DefaultMappingEngine } from './src/engines/MappingEngine';
export type { MappingEngineConfig } from './src/engines/MappingEngine';

// Cache implementation
export { RedisTranslationCache } from './src/engines/RedisTranslationCache';
export type { RedisCacheConfig } from './src/engines/RedisTranslationCache';

// Convenience factory function
export { createPromptTargetingSystem } from './src/factory';