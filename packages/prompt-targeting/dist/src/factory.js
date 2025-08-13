/**
 * Factory functions for creating prompt targeting system components
 * Epic 10.1.2 - Common Interface Definition
 */
import { DefaultAdaptorRegistry } from './adaptors/AdaptorRegistry';
import { DefaultMappingEngine } from './engines/MappingEngine';
import { RedisTranslationCache } from './engines/RedisTranslationCache';
/**
 * Create a complete prompt targeting system with all components
 */
export async function createPromptTargetingSystem(config = {}) {
    const logger = console;
    // Create registry
    const registry = new DefaultAdaptorRegistry();
    // Create cache if enabled
    let cache;
    if (config.cache?.enabled !== false) {
        if (config.cache?.type === 'redis' || !config.cache?.type) {
            cache = new RedisTranslationCache(config.cache?.config);
            // Connect to Redis
            try {
                await cache.connect();
                if (config.enableLogging) {
                    logger.log('✓ Redis cache connected');
                }
            }
            catch (error) {
                if (config.enableLogging) {
                    logger.warn('Failed to connect to Redis cache, proceeding without cache:', error);
                }
                cache = undefined;
            }
        }
        // TODO: Add memory cache implementation
    }
    // Create mapping engine
    const engine = new DefaultMappingEngine(registry, cache, {
        enableLogging: config.enableLogging,
        ...config.mapping,
    });
    if (config.enableLogging) {
        logger.log('✓ Prompt targeting system created');
        logger.log(`  Registry: ${registry.constructor.name}`);
        logger.log(`  Engine: ${engine.constructor.name}`);
        logger.log(`  Cache: ${cache ? cache.constructor.name : 'disabled'}`);
    }
    return {
        registry,
        engine,
        cache,
    };
}
/**
 * Create a basic prompt targeting system for development/testing
 */
export function createBasicPromptTargetingSystem() {
    const registry = new DefaultAdaptorRegistry();
    const engine = new DefaultMappingEngine(registry, undefined, {
        enableCaching: false,
        enableLogging: true,
    });
    return {
        registry,
        engine,
    };
}
/**
 * Create a production-ready prompt targeting system
 */
export async function createProductionPromptTargetingSystem(redisConfig, mappingConfig) {
    return createPromptTargetingSystem({
        cache: {
            enabled: true,
            type: 'redis',
            config: redisConfig,
        },
        mapping: {
            enableCaching: true,
            maxConcurrency: 20,
            translationTimeout: 30000,
            enableLogging: true,
            ...mappingConfig,
        },
        enableLogging: true,
    });
}
//# sourceMappingURL=factory.js.map