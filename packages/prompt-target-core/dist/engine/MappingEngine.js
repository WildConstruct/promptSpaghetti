import { TranslationError, ValidationError, PromptTargetingError } from '../types/index.js';
/**
 * Core mapping engine that orchestrates prompt translations
 */
export class MappingEngine {
  constructor(logger, cache, metrics) {
    this.adaptors = new Map();
    this.logger = logger;
    this.cache = cache;
    this.metrics = metrics;
  }
  /**
   * Register an adaptor for a specific platform
   */
  registerAdaptor(platform, adaptor) {
    this.adaptors.set(platform, adaptor);
    this.logger.info('Adaptor registered', {
      platform,
      adaptorId: adaptor.id,
      version: adaptor.version,
    });
    this.metrics.counter('mapping_engine.adaptor.registered', 1, {
      platform,
      adaptor_id: adaptor.id,
    });
  }
  /**
   * Unregister an adaptor for a platform
   */
  unregisterAdaptor(platform) {
    const adaptor = this.adaptors.get(platform);
    if (adaptor) {
      this.adaptors.delete(platform);
      this.logger.info('Adaptor unregistered', {
        platform,
        adaptorId: adaptor.id,
      });
      this.metrics.counter('mapping_engine.adaptor.unregistered', 1, {
        platform,
        adaptor_id: adaptor.id,
      });
    }
  }
  /**
   * Get all registered platforms
   */
  getRegisteredPlatforms() {
    return Array.from(this.adaptors.keys());
  }
  /**
   * Get adaptor for a specific platform
   */
  getAdaptor(platform) {
    return this.adaptors.get(platform);
  }
  /**
   * Check if a platform is supported
   */
  isPlatformSupported(platform) {
    return this.adaptors.has(platform);
  }
  /**
   * Translate a prompt graph to target platform
   */
  async translate(request) {
    const startTime = Date.now();
    const requestId = request.requestId || this.generateRequestId();
    this.logger.info('Translation started', {
      requestId,
      graphId: request.graph.id,
      targetPlatform: request.targetPlatform,
    });
    this.metrics.counter('mapping_engine.translation.started', 1, {
      platform: request.targetPlatform,
    });
    try {
      // Validate request
      this.validateRequest(request);
      // Get adaptor
      const adaptor = this.getAdaptor(request.targetPlatform);
      if (!adaptor) {
        throw new TranslationError(
          `No adaptor registered for platform: ${request.targetPlatform}`,
          'ADAPTOR_NOT_FOUND',
          { platform: request.targetPlatform },
          false
        );
      }
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.checkCache(cacheKey);
      if (cached) {
        this.metrics.counter('mapping_engine.translation.cache_hit', 1, {
          platform: request.targetPlatform,
        });
        return {
          requestId,
          success: true,
          targetPrompt: cached.targetPrompt,
          quality: cached.quality,
          validationResults: cached.validationResults,
          timing: {
            total: Date.now() - startTime,
            validation: 0,
            transformation: 0,
            postProcessing: 0,
          },
        };
      }
      // Perform translation
      const validationStart = Date.now();
      const validationResults = await adaptor.validate(request.graph);
      const validationTime = Date.now() - validationStart;
      // Check for critical errors
      const criticalErrors = validationResults.filter(r => r.type === 'error' && r.severity === 'critical');
      if (criticalErrors.length > 0) {
        throw new ValidationError('Critical validation errors prevent translation', criticalErrors);
      }
      // Transform
      const transformStart = Date.now();
      const targetPrompt = await adaptor.transform(request.graph, request.options);
      const transformTime = Date.now() - transformStart;
      // Post-processing
      const postProcessStart = Date.now();
      const quality = await adaptor.estimateQuality(request.graph);
      const postProcessTime = Date.now() - postProcessStart;
      // Cache result
      await this.cacheResult(cacheKey, {
        targetPrompt,
        quality,
        validationResults,
      });
      const totalTime = Date.now() - startTime;
      this.logger.info('Translation completed', {
        requestId,
        graphId: request.graph.id,
        targetPlatform: request.targetPlatform,
        quality: quality.overall,
        duration: totalTime,
      });
      this.metrics.counter('mapping_engine.translation.success', 1, {
        platform: request.targetPlatform,
      });
      this.metrics.histogram('mapping_engine.translation.duration', totalTime, {
        platform: request.targetPlatform,
      });
      return {
        requestId,
        success: true,
        targetPrompt,
        quality,
        validationResults,
        timing: {
          total: totalTime,
          validation: validationTime,
          transformation: transformTime,
          postProcessing: postProcessTime,
        },
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
      this.logger.error('Translation failed', {
        requestId,
        graphId: request.graph.id,
        targetPlatform: request.targetPlatform,
        error: errorMessage,
        duration: totalTime,
      });
      this.metrics.counter('mapping_engine.translation.error', 1, {
        platform: request.targetPlatform,
        error_type: errorType,
      });
      if (error instanceof PromptTargetingError) {
        return {
          requestId,
          success: false,
          validationResults: [],
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            recoverable: error.recoverable,
            name: error.name,
          },
          timing: {
            total: totalTime,
            validation: 0,
            transformation: 0,
            postProcessing: 0,
          },
        };
      }
      // Unexpected error
      return {
        requestId,
        success: false,
        validationResults: [],
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during translation',
          details: { originalError: errorMessage },
          recoverable: true,
          name: 'UnexpectedError',
        },
        timing: {
          total: totalTime,
          validation: 0,
          transformation: 0,
          postProcessing: 0,
        },
      };
    }
  }
  /**
   * Validate translation request
   */
  validateRequest(request) {
    if (!request.graph) {
      throw new TranslationError('Graph is required', 'INVALID_REQUEST', {}, false);
    }
    if (!request.targetPlatform) {
      throw new TranslationError('Target platform is required', 'INVALID_REQUEST', {}, false);
    }
    if (!request.graph.nodes || request.graph.nodes.length === 0) {
      throw new TranslationError('Graph must contain at least one node', 'INVALID_GRAPH', {}, false);
    }
    // Validate graph structure
    const nodeIds = new Set(request.graph.nodes.map(n => n.id));
    for (const edge of request.graph.edges || []) {
      if (!nodeIds.has(edge.source)) {
        throw new TranslationError(
          `Edge references invalid source node: ${edge.source}`,
          'INVALID_GRAPH',
          { edgeId: edge.id, sourceId: edge.source },
          false
        );
      }
      if (!nodeIds.has(edge.target)) {
        throw new TranslationError(
          `Edge references invalid target node: ${edge.target}`,
          'INVALID_GRAPH',
          { edgeId: edge.id, targetId: edge.target },
          false
        );
      }
    }
  }
  /**
   * Generate cache key for translation request
   */
  generateCacheKey(request) {
    const adaptor = this.getAdaptor(request.targetPlatform);
    const adaptorVersion = adaptor?.version || 'unknown';
    const graphHash = this.hashObject({
      nodes: request.graph.nodes,
      edges: request.graph.edges,
      version: request.graph.version,
    });
    const optionsHash = request.options ? this.hashObject(request.options) : 'none';
    return `translation:${request.targetPlatform}:${adaptorVersion}:${graphHash}:${optionsHash}`;
  }
  /**
   * Check cache for existing translation
   */
  async checkCache(cacheKey) {
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        this.logger.debug('Cache hit', { cacheKey });
        return cached;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('Cache lookup failed', {
        cacheKey,
        error: errorMessage,
      });
    }
    return null;
  }
  /**
   * Cache translation result
   */
  async cacheResult(cacheKey, result) {
    try {
      const cacheEntry = {
        ...result,
        timestamp: new Date(),
        version: '1.0',
      };
      await this.cache.set(cacheKey, cacheEntry, 3600); // 1 hour TTL
      this.logger.debug('Result cached', { cacheKey });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('Cache storage failed', {
        cacheKey,
        error: errorMessage,
      });
    }
  }
  /**
   * Check if cached result is still valid
   */
  isCacheValid(cached) {
    if (!cached.timestamp) return false;
    const age = Date.now() - new Date(cached.timestamp).getTime();
    const maxAge = 3600 * 1000; // 1 hour in milliseconds
    return age < maxAge;
  }
  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Simple object hashing
   */
  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  /**
   * Get engine statistics
   */
  getStats() {
    const adaptorInfo = Array.from(this.adaptors.entries()).map(([platform, adaptor]) => ({
      platform,
      id: adaptor.id,
      version: adaptor.version,
      name: adaptor.name,
    }));
    return {
      registeredAdaptors: this.adaptors.size,
      supportedPlatforms: Array.from(this.adaptors.keys()),
      adaptorInfo,
    };
  }
}
