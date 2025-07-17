// Main entry point for prompt-target-core
export * from './types/index.js';
export * from './adaptors/index.js';
export * from './engine/MappingEngine.js';
export * from './validation/ValidationEngine.js';
export * from './utils/index.js';

// Core classes
export { MappingEngine } from './engine/MappingEngine.js';
export { ValidationEngine } from './validation/ValidationEngine.js';
export { BaseAdaptor } from './adaptors/BaseAdaptor.js';
export { EnhancedBaseAdaptor } from './adaptors/EnhancedBaseAdaptor.js';
export { OpenAIGPTAdaptor } from './adaptors/OpenAIGPTAdaptor.js';
export { MidjourneyAdaptor } from './adaptors/MidjourneyAdaptor.js';
export { DallEAdaptor } from './adaptors/DallEAdaptor.js';

// Text-to-Image Features (Epic 10.3)
export { ParameterMappingSystem, parameterMappingSystem } from './mapping/ParameterMappingSystem.js';
export { PreviewGenerationSystem, previewGenerationSystem } from './preview/PreviewGenerationSystem.js';
export { ResultGallerySystem, resultGallerySystem } from './gallery/ResultGallerySystem.js';
export { MetadataManager, metadataManager } from './metadata/MetadataManager.js';
export { ExportSystem, exportSystem } from './export/ExportSystem.js';

// Examples
export { PromptTargetingExample, createPromptTargetingExample } from './examples/PromptTargetingExample.js';

// Version info
export const VERSION = '0.1.0-alpha';
export const PACKAGE_NAME = '@promptscape/prompt-target-core';