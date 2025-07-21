/**
 * Factory functions for creating prompt targeting system components
 * Epic 10.1.2 - Common Interface Definition
 */
import { AdaptorRegistry, MappingEngine, TranslationCache } from './types';
import { MappingEngineConfig } from './engines/MappingEngine';
import { RedisCacheConfig } from './engines/RedisTranslationCache';
/**
 * Configuration for the prompt targeting system
 */
export interface PromptTargetingSystemConfig {
    /** Cache configuration */
    cache?: {
        enabled?: boolean;
        type?: 'redis' | 'memory';
        config?: RedisCacheConfig;
    };
    /** Mapping engine configuration */
    mapping?: MappingEngineConfig;
    /** Enable detailed logging */
    enableLogging?: boolean;
}
/**
 * Complete prompt targeting system
 */
export interface PromptTargetingSystem {
    registry: AdaptorRegistry;
    engine: MappingEngine;
    cache?: TranslationCache;
}
/**
 * Create a complete prompt targeting system with all components
 */
export declare function createPromptTargetingSystem(config?: PromptTargetingSystemConfig): Promise<PromptTargetingSystem>;
/**
 * Create a basic prompt targeting system for development/testing
 */
export declare function createBasicPromptTargetingSystem(): PromptTargetingSystem;
/**
 * Create a production-ready prompt targeting system
 */
export declare function createProductionPromptTargetingSystem(
  redisConfig?: RedisCacheConfig,
  mappingConfig?: MappingEngineConfig
): Promise<PromptTargetingSystem>;
//# sourceMappingURL=factory.d.ts.map