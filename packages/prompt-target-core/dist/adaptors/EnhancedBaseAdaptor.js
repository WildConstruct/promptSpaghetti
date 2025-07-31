import { TransformationError, ValidationError } from '../types/index.js';
/**
 * Enhanced base adaptor with lifecycle management and pipeline processing
 */
export class EnhancedBaseAdaptor {
  constructor(id, version, platform, name, description, context) {
    this.id = id;
    this.version = version;
    this.platform = platform;
    this.name = name;
    this.description = description;
    // Lifecycle tracking
    this.initialized = false;
    this.destroyed = false;
    // Pipeline stages
    this.validationPipeline = [];
    this.transformationPipeline = [];
    // Initialize with context or defaults
    this.logger = context?.logger || {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
    this.cache = context?.cache || {
      get: async () => undefined,
      set: async () => {},
      del: async () => {},
      exists: async () => false,
    };
    this.metrics = context?.metrics || {
      counter: () => {},
      gauge: () => {},
      histogram: () => {},
      timer: () => ({ end: () => {} }),
    };
    this.config = context?.config || {};
    this.healthMetrics = {
      uptime: 0,
      requestCount: 0,
      successRate: 1,
      averageResponseTime: 0,
      errorRate: 0,
    };
    this.setupDefaultPipelines();
  }
  // Optional lifecycle hooks with default implementations
  async beforeValidate(graph) {
    return graph;
  }
  async afterValidate(graph, results) {
    return results;
  }
  async beforeTransform(graph) {
    return graph;
  }
  async afterTransform(graph, result) {
    return result;
  }
  /**
   * Initialize the adaptor with context and configuration
   */
  async initialize(context) {
    if (this.initialized) {
      return;
    }
    try {
      this.logger = context.logger;
      this.cache = context.cache;
      this.metrics = context.metrics;
      this.config = context.config;
      this.initializeTime = new Date();
      // Run custom initialization if provided
      if (this.onInitialize) {
        await this.onInitialize();
      }
      this.initialized = true;
      this.logger.info('Adaptor initialized successfully', {
        adaptorId: this.id,
        version: this.version,
        platform: this.platform,
      });
      this.metrics.counter('adaptor.initialize.success', 1, {
        adaptor_id: this.id,
        platform: this.platform,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Adaptor initialization failed', {
        adaptorId: this.id,
        error: errorMessage,
      });
      this.metrics.counter('adaptor.initialize.error', 1, {
        adaptor_id: this.id,
        platform: this.platform,
      });
      throw new TransformationError(`Initialization failed: ${errorMessage}`, undefined, 'initialize');
    }
  }
  /**
   * Validate adaptor health and connectivity
   */
  async healthCheck() {
    const startTime = Date.now();
    this.lastHealthCheck = new Date();
    try {
      // Update uptime
      if (this.initializeTime) {
        this.healthMetrics.uptime = Date.now() - this.initializeTime.getTime();
      }
      // Basic health checks
      const details = {
        connectivity: {
          reachable: this.initialized && !this.destroyed,
          latency: 0,
          lastSuccessfulConnection: this.initializeTime,
        },
        capabilities: {
          available: this.initialized,
          lastUpdated: this.initializeTime,
        },
        configuration: {
          valid: this.validateConfiguration(),
        },
        dependencies: await this.checkDependencies(),
      };
      // Run custom health checks if provided
      if (this.onHealthCheck) {
        const customDetails = await this.onHealthCheck();
        Object.assign(details, customDetails);
      }
      // Test basic functionality
      try {
        await this.capabilities();
        details.capabilities.available = true;
      } catch (error) {
        details.capabilities.available = false;
        details.capabilities.errorMessage = error instanceof Error ? error.message : String(error);
      }
      const healthy = details.connectivity.reachable && details.capabilities.available && details.configuration.valid;
      const status = {
        healthy,
        status: healthy ? 'healthy' : 'degraded',
        lastChecked: this.lastHealthCheck,
        details,
        metrics: { ...this.healthMetrics },
      };
      // Update connectivity latency
      status.details.connectivity.latency = Date.now() - startTime;
      this.metrics.gauge('adaptor.health.latency', status.details.connectivity.latency, {
        adaptor_id: this.id,
      });
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Health check failed', {
        adaptorId: this.id,
        error: errorMessage,
      });
      return {
        healthy: false,
        status: 'unhealthy',
        lastChecked: this.lastHealthCheck,
        details: {
          connectivity: {
            reachable: false,
            errorMessage: errorMessage,
          },
          capabilities: { available: false },
          configuration: { valid: false },
          dependencies: [],
        },
        metrics: { ...this.healthMetrics },
      };
    }
  }
  /**
   * Enhanced validation with pipeline processing
   */
  async validate(graph) {
    if (!this.initialized) {
      throw new ValidationError('Adaptor not initialized', []);
    }
    const timer = this.metrics.timer('adaptor.validate.duration');
    const startTime = Date.now();
    this.healthMetrics.requestCount++;
    try {
      this.logger.debug('Starting validation', {
        adaptorId: this.id,
        graphId: graph.id,
      });
      // Pre-processing hook
      let processedGraph = graph;
      if (this.beforeValidate) {
        processedGraph = await this.beforeValidate(graph);
      }
      // Run validation pipeline
      let allResults = [];
      const context = {
        adaptorId: this.id,
        requestId: `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        metadata: { originalGraphId: graph.id },
        logger: this.logger,
        metrics: this.metrics,
        config: this.config,
      };
      // Execute validation pipeline stages
      for (const stage of this.validationPipeline) {
        if (stage.canHandle(processedGraph)) {
          try {
            const stageResults = await stage.process(processedGraph, context);
            allResults.push(...stageResults);
          } catch (error) {
            if (stage.onError) {
              const typedError = error instanceof Error ? error : new Error(String(error));
              const errorResults = await stage.onError(typedError, processedGraph, context);
              if (errorResults) {
                allResults.push(...errorResults);
              }
            } else {
              allResults.push({
                id: `pipeline-error-${stage.name}`,
                type: 'error',
                severity: 'high',
                message: `Validation stage "${stage.name}" failed`,
                description: error instanceof Error ? error.message : String(error),
                autoFixable: false,
              });
            }
          }
        }
      }
      // Run adaptor-specific validation
      const adaptorResults = await this.doValidate(processedGraph);
      allResults.push(...adaptorResults);
      // Post-processing hook
      // afterValidate hook - override in subclasses if needed
      if ('afterValidate' in this && typeof this.afterValidate === 'function') {
        allResults = await this.afterValidate(processedGraph, allResults);
      }
      // Update metrics
      const duration = Date.now() - startTime;
      this.updateSuccessMetrics(duration);
      this.metrics.counter('adaptor.validate.total', 1, {
        adaptor: this.id,
        platform: this.platform,
      });
      this.metrics.counter('adaptor.validate.issues', allResults.length, {
        adaptor: this.id,
        platform: this.platform,
      });
      this.logger.info('Validation completed', {
        adaptorId: this.id,
        graphId: graph.id,
        issueCount: allResults.length,
        duration,
      });
      return allResults;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.updateErrorMetrics(Date.now() - startTime, typedError);
      this.metrics.counter('adaptor.validate.error', 1, {
        adaptor: this.id,
        platform: this.platform,
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Validation failed', {
        adaptorId: this.id,
        graphId: graph.id,
        error: errorMessage,
      });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Validation failed: ${errorMessage}`, []);
    } finally {
      timer.end();
    }
  }
  /**
   * Enhanced transformation with pipeline processing
   */
  async transform(graph, options) {
    if (!this.initialized) {
      throw new TransformationError('Adaptor not initialized');
    }
    const timer = this.metrics.timer('adaptor.transform.duration');
    const startTime = Date.now();
    this.healthMetrics.requestCount++;
    try {
      this.logger.debug('Starting transformation', {
        adaptorId: this.id,
        graphId: graph.id,
        options,
      });
      // Validate first
      const validationResults = await this.validate(graph);
      const errors = validationResults.filter(r => r.type === 'error');
      if (errors.length > 0) {
        throw new ValidationError('Graph validation failed', validationResults);
      }
      // Pre-processing hook
      let processedGraph = graph;
      // beforeTransform hook - override in subclasses if needed
      if ('beforeTransform' in this && typeof this.beforeTransform === 'function') {
        processedGraph = await this.beforeTransform(graph);
      }
      // Check cache
      const cacheKey = this.generateCacheKey(processedGraph, options);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.metrics.counter('adaptor.transform.cache.hit', 1, {
          adaptor: this.id,
          platform: this.platform,
        });
        this.logger.debug('Cache hit for transformation', {
          adaptorId: this.id,
          graphId: graph.id,
          cacheKey,
        });
        this.updateSuccessMetrics(Date.now() - startTime);
        return cached;
      }
      // Run transformation pipeline
      const context = {
        adaptorId: this.id,
        requestId: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        metadata: { originalGraphId: graph.id, options },
        logger: this.logger,
        metrics: this.metrics,
        config: this.config,
      };
      const partialResult = {};
      // Execute transformation pipeline stages
      for (const stage of this.transformationPipeline) {
        if (stage.canHandle(processedGraph)) {
          try {
            const stageResult = await stage.process(processedGraph, context);
            // Merge stage results
            if (stageResult.content !== undefined) {
              partialResult.content = stageResult.content;
            }
            if (stageResult.parameters) {
              partialResult.parameters = { ...partialResult.parameters, ...stageResult.parameters };
            }
            if (stageResult.metadata) {
              partialResult.metadata = { ...partialResult.metadata, ...stageResult.metadata };
            }
            if (stageResult.format) {
              partialResult.format = stageResult.format;
            }
          } catch (error) {
            if (stage.onError) {
              const typedError = error instanceof Error ? error : new Error(String(error));
              const errorResult = await stage.onError(typedError, processedGraph, context);
              if (errorResult) {
                // Handle error recovery
              }
            }
            if (stage.required) {
              throw new TransformationError(
                `Required transformation stage "${stage.name}" failed: ${error instanceof Error ? error.message : String(error)}`,
                undefined,
                stage.name
              );
            }
          }
        }
      }
      // Run core adaptor transformation
      let result = await this.doTransform(processedGraph, options);
      // Merge pipeline results with core results
      if (partialResult.content !== undefined) {
        result.content = partialResult.content;
      }
      if (partialResult.parameters) {
        result.parameters = { ...result.parameters, ...partialResult.parameters };
      }
      if (partialResult.metadata) {
        result.metadata = { ...result.metadata, ...partialResult.metadata };
      }
      if (partialResult.format) {
        result.format = partialResult.format;
      }
      // Post-processing hook
      // afterTransform hook - override in subclasses if needed
      if ('afterTransform' in this && typeof this.afterTransform === 'function') {
        result = await this.afterTransform(processedGraph, result);
      }
      // Cache the result
      await this.cache.set(cacheKey, result, this.getCacheTTL());
      // Update metrics
      const duration = Date.now() - startTime;
      this.updateSuccessMetrics(duration);
      this.metrics.counter('adaptor.transform.success', 1, {
        adaptor: this.id,
        platform: this.platform,
      });
      this.metrics.counter('adaptor.transform.cache.miss', 1, {
        adaptor: this.id,
        platform: this.platform,
      });
      this.logger.info('Transformation completed', {
        adaptorId: this.id,
        graphId: graph.id,
        quality: result.metadata.quality.overall,
        duration,
      });
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      this.updateErrorMetrics(Date.now() - startTime, typedError);
      this.metrics.counter('adaptor.transform.error', 1, {
        adaptor: this.id,
        platform: this.platform,
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Transformation failed', {
        adaptorId: this.id,
        graphId: graph.id,
        error: errorMessage,
      });
      if (error instanceof ValidationError || error instanceof TransformationError) {
        throw error;
      }
      throw new TransformationError(`Transformation failed: ${errorMessage}`);
    } finally {
      timer.end();
    }
  }
  /**
   * Estimates the quality of transformation for a given graph
   */
  async estimateQuality(graph) {
    try {
      const capabilities = await this.capabilities();
      const validationResults = await this.validate(graph);
      return this.calculateQualityScore(graph, capabilities, validationResults);
    } catch (error) {
      this.logger.warn('Quality estimation failed', {
        adaptorId: this.id,
        graphId: graph.id,
        error: error instanceof Error ? error.message : String(error),
      });
      // Return a low quality score if estimation fails
      return {
        overall: 10,
        fidelity: 10,
        compatibility: 10,
        performance: 10,
        completeness: 10,
        breakdown: {
          nodeTranslation: 10,
          parameterMapping: 10,
          featureSupport: 10,
          semanticPreservation: 10,
          syntaxValidity: 10,
        },
      };
    }
  }
  /**
   * Cleanup resources and connections
   */
  async destroy() {
    if (this.destroyed) {
      return;
    }
    try {
      // Run custom cleanup if provided
      if (this.onDestroy) {
        await this.onDestroy();
      }
      this.destroyed = true;
      this.initialized = false;
      this.logger.info('Adaptor destroyed successfully', {
        adaptorId: this.id,
      });
      this.metrics.counter('adaptor.destroy.success', 1, {
        adaptor_id: this.id,
        platform: this.platform,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Adaptor destruction failed', {
        adaptorId: this.id,
        error: errorMessage,
      });
      this.metrics.counter('adaptor.destroy.error', 1, {
        adaptor_id: this.id,
        platform: this.platform,
      });
      throw error;
    }
  }
  /**
   * Handle configuration changes at runtime
   */
  async onConfigurationChange(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', {
      adaptorId: this.id,
      configKeys: Object.keys(newConfig),
    });
    this.metrics.counter('adaptor.config.change', 1, {
      adaptor_id: this.id,
    });
  }
  /**
   * Setup default validation and transformation pipelines
   */
  setupDefaultPipelines() {
    // Default validation stages can be added here
    // Concrete adaptors can override this method to customize pipelines
  }
  /**
   * Add a validation pipeline stage
   */
  addValidationStage(stage) {
    this.validationPipeline.push(stage);
    this.validationPipeline.sort((a, b) => a.order - b.order);
  }
  /**
   * Add a transformation pipeline stage
   */
  addTransformationStage(stage) {
    this.transformationPipeline.push(stage);
    this.transformationPipeline.sort((a, b) => a.order - b.order);
  }
  /**
   * Validate current configuration
   */
  validateConfiguration() {
    try {
      // Basic validation - can be overridden by concrete adaptors
      return this.config !== null && typeof this.config === 'object';
    } catch {
      return false;
    }
  }
  /**
   * Check adaptor dependencies
   */
  async checkDependencies() {
    // Default implementation - can be overridden by concrete adaptors
    return [];
  }
  /**
   * Update success metrics
   */
  updateSuccessMetrics(duration) {
    const oldCount = this.healthMetrics.requestCount - 1;
    const oldAvg = this.healthMetrics.averageResponseTime;
    this.healthMetrics.averageResponseTime = (oldAvg * oldCount + duration) / this.healthMetrics.requestCount;
    this.healthMetrics.successRate = (this.healthMetrics.successRate * oldCount + 1) / this.healthMetrics.requestCount;
  }
  /**
   * Update error metrics
   */
  updateErrorMetrics(duration, error) {
    this.healthMetrics.lastError = {
      timestamp: new Date(),
      message: error.message,
      type: error.constructor.name,
    };
    const oldCount = this.healthMetrics.requestCount - 1;
    const oldAvg = this.healthMetrics.averageResponseTime;
    const oldSuccessRate = this.healthMetrics.successRate;
    this.healthMetrics.averageResponseTime = (oldAvg * oldCount + duration) / this.healthMetrics.requestCount;
    this.healthMetrics.successRate = (oldSuccessRate * oldCount) / this.healthMetrics.requestCount;
    this.healthMetrics.errorRate = 1 - this.healthMetrics.successRate;
  }
  // Inherit utility methods from BaseAdaptor
  generateCacheKey(graph, options) {
    const graphHash = this.hashObject({
      nodes: graph.nodes,
      edges: graph.edges,
      version: graph.version,
    });
    const optionsHash = options ? this.hashObject(options) : 'none';
    return `${this.id}:${this.version}:${graphHash}:${optionsHash}`;
  }
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
  getCacheTTL() {
    return this.config.cacheTTL || 3600;
  }
  calculateQualityScore(graph, capabilities, validationResults) {
    const errors = validationResults.filter(r => r.type === 'error').length;
    const warnings = validationResults.filter(r => r.type === 'warning').length;
    // Node type support analysis
    const unsupportedNodes = graph.nodes.filter(node => !capabilities.supportedNodeTypes.includes(node.type)).length;
    const nodeSupport = Math.max(0, 100 - (unsupportedNodes / graph.nodes.length) * 100);
    // Error/warning impact
    const errorImpact = Math.max(0, 100 - errors * 25);
    const warningImpact = Math.max(0, 100 - warnings * 10);
    // Feature completeness
    const featureSupport =
      (capabilities.features.filter(f => f.supported).length / Math.max(1, capabilities.features.length)) * 100;
    // Overall calculations
    const fidelity = (nodeSupport + errorImpact) / 2;
    const compatibility = (nodeSupport + featureSupport) / 2;
    const performance = warningImpact;
    const completeness = featureSupport;
    const overall = (fidelity + compatibility + performance + completeness) / 4;
    return {
      overall: Math.round(overall),
      fidelity: Math.round(fidelity),
      compatibility: Math.round(compatibility),
      performance: Math.round(performance),
      completeness: Math.round(completeness),
      breakdown: {
        nodeTranslation: Math.round(nodeSupport),
        parameterMapping: Math.round(featureSupport),
        featureSupport: Math.round(featureSupport),
        semanticPreservation: Math.round(fidelity),
        syntaxValidity: Math.round(errorImpact),
      },
    };
  }
  createValidationResult(id, type, severity, message, options = {}) {
    return {
      id,
      type,
      severity,
      message,
      description: options.description,
      nodeId: options.nodeId,
      edgeId: options.edgeId,
      autoFixable: options.autoFixable || false,
      suggestions: options.suggestions || [],
    };
  }
}
