import {
  Platform,
  TranslationRequest,
  TranslationResponse,
  ModelAdaptor,
  Logger,
  CacheInterface,
  MetricsInterface,
} from '../types/index.js';
/**
 * Core mapping engine that orchestrates prompt translations
 */
export declare class MappingEngine {
  private adaptors;
  private logger;
  private cache;
  private metrics;
  constructor(logger: Logger, cache: CacheInterface, metrics: MetricsInterface);
  /**
   * Register an adaptor for a specific platform
   */
  registerAdaptor(platform: Platform, adaptor: ModelAdaptor): void;
  /**
   * Unregister an adaptor for a platform
   */
  unregisterAdaptor(platform: Platform): void;
  /**
   * Get all registered platforms
   */
  getRegisteredPlatforms(): Platform[];
  /**
   * Get adaptor for a specific platform
   */
  getAdaptor(platform: Platform): ModelAdaptor | undefined;
  /**
   * Check if a platform is supported
   */
  isPlatformSupported(platform: Platform): boolean;
  /**
   * Translate a prompt graph to target platform
   */
  translate(request: TranslationRequest): Promise<TranslationResponse>;
  /**
   * Validate translation request
   */
  private validateRequest;
  /**
   * Generate cache key for translation request
   */
  private generateCacheKey;
  /**
   * Check cache for existing translation
   */
  private checkCache;
  /**
   * Cache translation result
   */
  private cacheResult;
  /**
   * Check if cached result is still valid
   */
  private isCacheValid;
  /**
   * Generate unique request ID
   */
  private generateRequestId;
  /**
   * Simple object hashing
   */
  private hashObject;
  /**
   * Get engine statistics
   */
  getStats(): {
    registeredAdaptors: number;
    supportedPlatforms: Platform[];
    adaptorInfo: Array<{
      platform: Platform;
      id: string;
      version: string;
      name: string;
    }>;
  };
}
