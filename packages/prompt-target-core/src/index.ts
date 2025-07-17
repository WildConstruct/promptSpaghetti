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
export { OpenAIGPTAdaptor } from './adaptors/OpenAIGPTAdaptor.js';
export { MidjourneyAdaptor } from './adaptors/MidjourneyAdaptor.js';

// Examples
export { PromptTargetingExample, createPromptTargetingExample } from './examples/PromptTargetingExample.js';

// Version info
export const VERSION = '0.1.0-alpha';
export const PACKAGE_NAME = '@promptscape/prompt-target-core';