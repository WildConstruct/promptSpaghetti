import { PluginContext, ValidationResult, PromptGraph, TargetPrompt } from '../types/index.js';

/**
 * Lifecycle hooks for adaptor initialization, validation, and cleanup
 */
export interface AdaptorLifecycle {
  /**
   * Initialize the adaptor with context and configuration
   */
  initialize(context: PluginContext): Promise<void>;

  /**
   * Validate adaptor health and connectivity
   */
  healthCheck(): Promise<AdaptorHealthStatus>;

  /**
   * Pre-processing hook before validation
   */
  beforeValidate?(graph: PromptGraph): Promise<PromptGraph>;

  /**
   * Post-processing hook after validation
   */
  afterValidate?(graph: PromptGraph, results: ValidationResult[]): Promise<ValidationResult[]>;

  /**
   * Pre-processing hook before transformation
   */
  beforeTransform?(graph: PromptGraph): Promise<PromptGraph>;

  /**
   * Post-processing hook after transformation
   */
  afterTransform?(graph: PromptGraph, result: TargetPrompt): Promise<TargetPrompt>;

  /**
   * Cleanup resources and connections
   */
  destroy(): Promise<void>;

  /**
   * Handle configuration changes at runtime
   */
  onConfigurationChange?(newConfig: Record<string, any>): Promise<void>;

  /**
   * Handle capability refresh requests
   */
  onCapabilityRefresh?(): Promise<void>;
}

/**
 * Health status information for an adaptor
 */
export interface AdaptorHealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  details: AdaptorHealthDetails;
  metrics: AdaptorHealthMetrics;
}

export interface AdaptorHealthDetails {
  connectivity: {
    reachable: boolean;
    latency?: number;
    lastSuccessfulConnection?: Date;
    errorMessage?: string;
  };
  capabilities: {
    available: boolean;
    lastUpdated?: Date;
    errorMessage?: string;
  };
  configuration: {
    valid: boolean;
    errorMessage?: string;
  };
  dependencies: AdaptorDependencyStatus[];
}

export interface AdaptorDependencyStatus {
  name: string;
  type: 'api' | 'service' | 'library' | 'configuration';
  status: 'available' | 'unavailable' | 'degraded';
  version?: string;
  errorMessage?: string;
}

export interface AdaptorHealthMetrics {
  uptime: number; // milliseconds
  requestCount: number;
  successRate: number; // 0-1
  averageResponseTime: number; // milliseconds
  errorRate: number; // 0-1
  lastError?: {
    timestamp: Date;
    message: string;
    type: string;
  };
}

/**
 * Pipeline stage interface for modular processing
 */
export interface PipelineStage<TInput, TOutput> {
  readonly name: string;
  readonly order: number;
  readonly required: boolean;

  canHandle(input: TInput): boolean;
  process(input: TInput, context: ProcessingContext): Promise<TOutput>;
  onError?(error: Error, input: TInput, context: ProcessingContext): Promise<TOutput | void>;
}

export interface ProcessingContext {
  adaptorId: string;
  requestId: string;
  startTime: Date;
  metadata: Record<string, any>;
  logger: any;
  metrics: any;
  config: Record<string, any>;
}

/**
 * Validation pipeline stage
 */
export interface ValidationPipelineStage extends PipelineStage<PromptGraph, ValidationResult[]> {
  readonly validationType: 'structural' | 'semantic' | 'platform' | 'performance' | 'security';
}

/**
 * Transformation pipeline stage
 */
export interface TransformationPipelineStage extends PipelineStage<PromptGraph, PartialTargetPrompt> {
  readonly transformationType: 'preprocessing' | 'core' | 'postprocessing' | 'optimization';
}

export interface PartialTargetPrompt {
  content?: string | object;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
  format?: string;
}

/**
 * Enhanced adaptor registry for lifecycle management
 */
export class AdaptorRegistry {
  private adaptors = new Map<string, AdaptorLifecycle>();
  private healthStatuses = new Map<string, AdaptorHealthStatus>();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(
    private logger: any,
    private metrics: any,
    private healthCheckIntervalMs: number = 60000 // 1 minute
  ) {}

  /**
   * Register an adaptor with lifecycle management
   */
  async register(id: string, adaptor: AdaptorLifecycle, context: PluginContext): Promise<void> {
    try {
      await adaptor.initialize(context);
      this.adaptors.set(id, adaptor);

      const health = await adaptor.healthCheck();
      this.healthStatuses.set(id, health);

      this.logger.info('Adaptor registered successfully', {
        adaptorId: id,
        healthy: health.healthy,
      });

      this.metrics.counter('adaptor.registered', 1, { adaptor_id: id });

      // Start health checking if this is the first adaptor
      if (this.adaptors.size === 1) {
        this.startHealthChecking();
      }
    } catch (error) {
      this.logger.error('Failed to register adaptor', {
        adaptorId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Unregister an adaptor and cleanup resources
   */
  async unregister(id: string): Promise<void> {
    const adaptor = this.adaptors.get(id);
    if (adaptor) {
      try {
        await adaptor.destroy();
        this.adaptors.delete(id);
        this.healthStatuses.delete(id);

        this.logger.info('Adaptor unregistered successfully', { adaptorId: id });
        this.metrics.counter('adaptor.unregistered', 1, { adaptor_id: id });

        // Stop health checking if no adaptors remain
        if (this.adaptors.size === 0) {
          this.stopHealthChecking();
        }
      } catch (error) {
        this.logger.error('Error during adaptor cleanup', {
          adaptorId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Get all registered adaptors
   */
  getAdaptors(): Map<string, AdaptorLifecycle> {
    return new Map(this.adaptors);
  }

  /**
   * Get health status for all adaptors
   */
  getHealthStatuses(): Map<string, AdaptorHealthStatus> {
    return new Map(this.healthStatuses);
  }

  /**
   * Get health status for specific adaptor
   */
  getHealthStatus(adaptorId: string): AdaptorHealthStatus | undefined {
    return this.healthStatuses.get(adaptorId);
  }

  /**
   * Force health check for all adaptors
   */
  async checkHealth(): Promise<Map<string, AdaptorHealthStatus>> {
    const results = new Map<string, AdaptorHealthStatus>();

    for (const [id, adaptor] of this.adaptors.entries()) {
      try {
        const health = await adaptor.healthCheck();
        this.healthStatuses.set(id, health);
        results.set(id, health);

        this.metrics.gauge('adaptor.health.status', health.healthy ? 1 : 0, {
          adaptor_id: id,
        });
      } catch (error) {
        const unhealthyStatus: AdaptorHealthStatus = {
          healthy: false,
          status: 'unhealthy',
          lastChecked: new Date(),
          details: {
            connectivity: {
              reachable: false,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
            capabilities: { available: false },
            configuration: { valid: false },
            dependencies: [],
          },
          metrics: {
            uptime: 0,
            requestCount: 0,
            successRate: 0,
            averageResponseTime: 0,
            errorRate: 1,
            lastError: {
              timestamp: new Date(),
              message: error instanceof Error ? error.message : String(error),
              type: error instanceof Error ? error.constructor.name : 'Unknown',
            },
          },
        };

        this.healthStatuses.set(id, unhealthyStatus);
        results.set(id, unhealthyStatus);

        this.logger.error('Health check failed', {
          adaptorId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Start periodic health checking
   */
  private startHealthChecking(): void {
    if (this.healthCheckInterval) {
      return; // Already running
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.checkHealth();
    }, this.healthCheckIntervalMs);

    this.logger.info('Started adaptor health checking', {
      intervalMs: this.healthCheckIntervalMs,
    });
  }

  /**
   * Stop periodic health checking
   */
  private stopHealthChecking(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;

      this.logger.info('Stopped adaptor health checking');
    }
  }

  /**
   * Cleanup all adaptors and stop health checking
   */
  async destroy(): Promise<void> {
    this.stopHealthChecking();

    const cleanupPromises = Array.from(this.adaptors.keys()).map(id => this.unregister(id));

    await Promise.all(cleanupPromises);

    this.logger.info('Adaptor registry destroyed');
  }
}
