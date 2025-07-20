/**
 * Core mapping engine for prompt transformation
 * Epic 10.1.3 - Mapping Strategy Development
 */

import {
  MappingEngine,
  PlatformPrompt,
  AdaptorConfig,
  ValidationResult,
  AdaptorRegistry,
  TranslationError,
  ValidationError,
  TranslationCache
} from '../types';
import { createHash } from 'crypto';

/**
 * Configuration for the mapping engine
 */
export interface MappingEngineConfig {
  /** Enable caching of translation results */
  enableCaching?: boolean;
  /** Cache TTL in seconds */
  cacheTTL?: number;
  /** Maximum concurrent translations */
  maxConcurrency?: number;
  /** Timeout for individual translations (ms) */
  translationTimeout?: number;
  /** Enable detailed logging */
  enableLogging?: boolean;
}

/**
 * Implementation of the core mapping engine
 */
export class DefaultMappingEngine implements MappingEngine {
  private registry: AdaptorRegistry;
  private cache?: TranslationCache;
  private config: Required<MappingEngineConfig>;
  private logger: Console = console;
  private activeTranslations = new Map<string, Promise<PlatformPrompt>>();

  constructor(
    registry: AdaptorRegistry,
    cache?: TranslationCache,
    config: MappingEngineConfig = {}
  ) {
    this.registry = registry;
    this.cache = cache;
    this.config = {
      enableCaching: true,
      cacheTTL: 3600, // 1 hour
      maxConcurrency: 10,
      translationTimeout: 30000, // 30 seconds
      enableLogging: true,
      ...config
    };
  }

  /**
   * Execute translation pipeline for a single platform
   */
  public async translate(
    graph: any,
    targetPlatform: string,
    config?: AdaptorConfig
  ): Promise<PlatformPrompt> {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(graph, targetPlatform, config);

      // Check cache first
      if (this.config.enableCaching && this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          this.logPerformance('translate (cached)', startTime, { platform: targetPlatform });
          return cached;
        }
      }

      // Check for existing translation in progress
      if (this.activeTranslations.has(cacheKey)) {
        this.log(`Waiting for in-progress translation: ${targetPlatform}`);
        return await this.activeTranslations.get(cacheKey)!;
      }

      // Start new translation
      const translationPromise = this.executeTranslation(graph, targetPlatform, config);
      this.activeTranslations.set(cacheKey, translationPromise);

      try {
        const result = await translationPromise;

        // Cache the result
        if (this.config.enableCaching && this.cache) {
          await this.cache.set(cacheKey, result, this.config.cacheTTL);
        }

        this.logPerformance('translate', startTime, { 
          platform: targetPlatform,
          qualityScore: result.metadata.qualityScore 
        });

        return result;
      } finally {
        this.activeTranslations.delete(cacheKey);
      }
    } catch (error) {
      this.logError('Translation failed', error, { platform: targetPlatform });
      throw error;
    }
  }

  /**
   * Batch translate to multiple platforms
   */
  public async translateBatch(
    graph: any,
    targetPlatforms: string[],
    config?: AdaptorConfig
  ): Promise<Record<string, PlatformPrompt>> {
    const startTime = Date.now();
    
    try {
      // Limit concurrency
      const results: Record<string, PlatformPrompt> = {};
      const chunks = this.chunkArray(targetPlatforms, this.config.maxConcurrency);

      for (const chunk of chunks) {
        const promises = chunk.map(async platform => {
          try {
            const result = await this.translate(graph, platform, config);
            return { platform, result, error: null };
          } catch (error) {
            return { platform, result: null, error };
          }
        });

        const chunkResults = await Promise.all(promises);
        
        for (const { platform, result, error } of chunkResults) {
          if (result) {
            results[platform] = result;
          } else {
            this.logError(`Batch translation failed for ${platform}`, error);
            // Continue with other platforms rather than failing the entire batch
          }
        }
      }

      this.logPerformance('translateBatch', startTime, { 
        platformCount: targetPlatforms.length,
        successCount: Object.keys(results).length 
      });

      return results;
    } catch (error) {
      this.logError('Batch translation failed', error);
      throw error;
    }
  }

  /**
   * Validate translation without executing
   */
  public async validateTranslation(
    graph: any,
    targetPlatform: string,
    config?: AdaptorConfig
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Find adaptor for platform
      const adaptor = this.findBestAdaptor(targetPlatform);
      if (!adaptor) {
        return {
          valid: false,
          errors: [{
            code: 'NO_ADAPTOR_FOUND',
            message: `No adaptor found for platform: ${targetPlatform}`,
            severity: 'error'
          }],
          warnings: [],
          compatibilityScore: 0
        };
      }

      // Perform validation
      const result = await this.withTimeout(
        adaptor.validate(graph, config),
        this.config.translationTimeout,
        `Validation timeout for ${targetPlatform}`
      );

      this.logPerformance('validateTranslation', startTime, { 
        platform: targetPlatform,
        valid: result.valid,
        compatibilityScore: result.compatibilityScore 
      });

      return result;
    } catch (error) {
      this.logError('Validation failed', error, { platform: targetPlatform });
      throw error;
    }
  }

  /**
   * Execute the actual translation with timeout and error handling
   */
  private async executeTranslation(
    graph: any,
    targetPlatform: string,
    config?: AdaptorConfig
  ): Promise<PlatformPrompt> {
    // Find best adaptor for the platform
    const adaptor = this.findBestAdaptor(targetPlatform);
    if (!adaptor) {
      throw new TranslationError(
        `No adaptor found for platform: ${targetPlatform}`,
        targetPlatform,
        'NO_ADAPTOR_FOUND'
      );
    }

    this.log(`Starting translation to ${targetPlatform} using adaptor ${adaptor.id} v${adaptor.version}`);

    // Execute transformation with timeout
    try {
      const result = await this.withTimeout(
        adaptor.transform(graph, config),
        this.config.translationTimeout,
        `Translation timeout for ${targetPlatform}`
      );

      // Validate result
      this.validateTranslationResult(result, targetPlatform);

      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new TranslationError(
        `Translation failed for ${targetPlatform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        targetPlatform,
        'TRANSLATION_EXECUTION_FAILED',
        { adaptorId: adaptor.id, error }
      );
    }
  }

  /**
   * Find the best adaptor for a given platform
   */
  private findBestAdaptor(platform: string) {
    const adaptors = this.registry.findByPlatform(platform);
    
    if (adaptors.length === 0) {
      return undefined;
    }

    // For now, return the first adaptor
    // TODO: Implement more sophisticated selection logic
    return adaptors[0];
  }

  /**
   * Generate cache key for translation result
   */
  private generateCacheKey(graph: any, platform: string, config?: AdaptorConfig): string {
    const graphString = JSON.stringify(graph, Object.keys(graph).sort());
    const configString = JSON.stringify(config || {}, Object.keys(config || {}).sort());
    const combined = `${graphString}:${platform}:${configString}`;
    
    return createHash('sha256').update(combined).digest('hex').substring(0, 32);
  }

  /**
   * Validate translation result format
   */
  private validateTranslationResult(result: PlatformPrompt, platform: string): void {
    if (!result.platform) {
      throw new TranslationError(
        'Translation result missing platform identifier',
        platform,
        'INVALID_RESULT_FORMAT'
      );
    }

    if (!result.prompt) {
      throw new TranslationError(
        'Translation result missing prompt text',
        platform,
        'INVALID_RESULT_FORMAT'
      );
    }

    if (!result.metadata) {
      throw new TranslationError(
        'Translation result missing metadata',
        platform,
        'INVALID_RESULT_FORMAT'
      );
    }

    if (!result.metadata.sourceHash) {
      throw new TranslationError(
        'Translation result missing source hash',
        platform,
        'INVALID_RESULT_FORMAT'
      );
    }
  }

  /**
   * Execute a promise with timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Split array into chunks of specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, metadata?: Record<string, unknown>): void {
    if (this.config.enableLogging) {
      this.logger.log(`[MappingEngine] ${message}`, metadata);
    }
  }

  /**
   * Log error if logging is enabled
   */
  private logError(message: string, error: unknown, metadata?: Record<string, unknown>): void {
    if (this.config.enableLogging) {
      this.logger.error(`[MappingEngine] ${message}`, error, metadata);
    }
  }

  /**
   * Log performance metrics
   */
  private logPerformance(operation: string, startTime: number, metadata?: Record<string, unknown>): void {
    if (this.config.enableLogging) {
      const duration = Date.now() - startTime;
      this.log(`${operation} completed in ${duration}ms`, { duration, ...metadata });
    }
  }

  /**
   * Get engine statistics
   */
  public getStatistics(): {
    activeTranslations: number;
    cacheEnabled: boolean;
    cacheStats?: any;
    configuration: MappingEngineConfig;
    } {
    return {
      activeTranslations: this.activeTranslations.size,
      cacheEnabled: this.config.enableCaching && !!this.cache,
      cacheStats: this.cache ? undefined : undefined, // TODO: Implement cache.stats()
      configuration: this.config
    };
  }

  /**
   * Update engine configuration
   */
  public updateConfiguration(newConfig: Partial<MappingEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated', newConfig);
  }
}