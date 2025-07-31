/**
 * Prompt Targeting System - Epic 10
 * Cross-platform prompt translation for AI models
 */

// Core types and interfaces
export * from './src/types';

// Base adaptor implementation
export { BaseAdaptor } from './src/adaptors/BaseAdaptor';
export { AdvancedBaseAdaptor } from './src/adaptors/AdvancedBaseAdaptor';
export type { AdvancedAdaptorConfig, PipelineStage, PipelineStageResult } from './src/adaptors/AdvancedBaseAdaptor';
export { DefaultAdaptorRegistry } from './src/adaptors/AdaptorRegistry';

// Platform adaptors
export { OpenAIAdaptor } from './src/adaptors/OpenAIAdaptor';
export { EnhancedOpenAIAdaptor } from './src/adaptors/EnhancedOpenAIAdaptor';
export { MidjourneyAdaptor } from './src/adaptors/MidjourneyAdaptor';

// Mapping engine
export { DefaultMappingEngine } from './src/engines/MappingEngine';
export type { MappingEngineConfig } from './src/engines/MappingEngine';

// Cache implementation
export { RedisTranslationCache } from './src/engines/RedisTranslationCache';
export type { RedisCacheConfig } from './src/engines/RedisTranslationCache';

// Testing framework
export { AdaptorTestFramework } from './src/testing/AdaptorTestFramework';
export type { AdaptorTestCase, TestSuiteConfig, TestResult, TestSuiteResult } from './src/testing/AdaptorTestFramework';

// Configuration system
export { ConfigurationManager } from './src/config/ConfigurationManager';
export type {
  OpenAIConfig,
  MidjourneyConfig,
  DALLEConfig,
  GlobalConfig,
  ConfigurationPreset,
  ConfigValidationResult,
} from './src/config/ConfigurationManager';

// UI Components (React)
export { ConfigurationPanel } from './src/ui/components/ConfigurationPanel';
// TODO: Implement useConfiguration hooks
// export {
//   useConfiguration,
//   ConfigurationProvider,
//   useConfigurationContext,
//   withConfiguration
// } from './src/ui/hooks/useConfiguration';
// export type {
//   UseConfigurationReturn,
//   UseConfigurationOptions
// } from './src/ui/hooks/useConfiguration';

// Convenience factory functions
export {
  createPromptTargetingSystem,
  createBasicPromptTargetingSystem,
  createProductionPromptTargetingSystem,
} from './src/factory';
