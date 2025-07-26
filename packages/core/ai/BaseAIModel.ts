/**
 * Base AI Model Interface and Abstract Implementation
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Unified interface for all AI model types with standardized methods
 */

export enum AIModelType {
  TEXT = 'text',
  IMAGE = 'image', 
  AUDIO = 'audio',
  VIDEO = 'video',
  MULTIMODAL = 'multimodal'
}

export enum AIModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  HUGGINGFACE = 'huggingface',
  STABILITY_AI = 'stability_ai',
  ELEVENLABS = 'elevenlabs',
  RUNWAYML = 'runwayml',
  MIDJOURNEY = 'midjourney',
  PIKA_LABS = 'pika_labs',
  SORA = 'sora',
  LOCAL = 'local',
  CUSTOM = 'custom'
}

export enum AIModelStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

// Core interfaces
export interface ModelCapabilities {
  inputTypes: string[];
  outputTypes: string[];
  maxInputSize?: number;
  maxOutputSize?: number;
  supportsBatch?: boolean;
  supportsStreaming?: boolean;
  supportsAsync?: boolean;
  customParameters?: Record<string, any>;
}

export interface ModelMetadata {
  name: string;
  version: string;
  description: string;
  provider: AIModelProvider;
  type: AIModelType;
  costPerRequest?: number;
  costPerToken?: number;
  averageLatency?: number;
  maxConcurrency?: number;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute?: number;
  };
  tags?: string[];
  lastUpdated: Date;
}

export interface CostEstimate {
  estimatedCost: number;
  currency: string;
  breakdown?: {
    inputCost: number;
    outputCost: number;
    processingCost: number;
  };
  confidence: number; // 0-1
}

export interface HealthStatus {
  status: AIModelStatus;
  uptime: number;
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
  concurrentRequests?: number;
  details?: {
    memoryUsage?: number;
    cpuUsage?: number;
    diskSpace?: number;
    networkLatency?: number;
  };
  issues?: string[];
}

export interface AIRequest {
  id: string;
  input: any;
  options?: Record<string, any>;
  metadata?: {
    userId?: string;
    sessionId?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    timeout?: number;
    retryCount?: number;
  };
  createdAt: Date;
}

export interface AIResponse {
  id: string;
  requestId: string;
  output: any;
  metadata?: {
    processingTime: number;
    cost?: CostEstimate;
    modelUsed: string;
    tokensUsed?: {
      input: number;
      output: number;
    };
    quality?: number; // 0-1 quality score
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  completedAt: Date;
}

// Abstract base class for all AI models
export abstract class BaseAIModel {
  protected _id: string;
  protected _metadata: ModelMetadata;
  protected _capabilities: ModelCapabilities;
  protected _status: AIModelStatus = AIModelStatus.INITIALIZING;
  protected _healthStats: HealthStatus;
  protected _requestQueue: AIRequest[] = [];
  protected _activeRequests: Set<string> = new Set();
  protected _lastActivity: Date = new Date();

  constructor(id: string, metadata: ModelMetadata, capabilities: ModelCapabilities) {
    this._id = id;
    this._metadata = metadata;
    this._capabilities = capabilities;
    this._healthStats = {
      status: AIModelStatus.INITIALIZING,
      uptime: 0,
      lastCheck: new Date(),
      issues: []
    };
  }

  // Public interface
  get id(): string { return this._id; }
  get metadata(): ModelMetadata { return { ...this._metadata }; }
  get capabilities(): ModelCapabilities { return { ...this._capabilities }; }
  get status(): AIModelStatus { return this._status; }

  // Abstract methods that must be implemented by concrete models
  abstract initialize(): Promise<void>;
  abstract process(input: any, options?: any): Promise<any>;
  abstract cleanup(): Promise<void>;

  // Default implementations that can be overridden
  async estimate(input: any, options?: any): Promise<CostEstimate> {
    // Default estimation based on metadata
    const baseRequestCost = this._metadata.costPerRequest || 0;
    const tokenCost = this._calculateTokenCost(input, options);
    
    return {
      estimatedCost: baseRequestCost + tokenCost,
      currency: 'USD',
      confidence: 0.7,
      breakdown: {
        inputCost: tokenCost * 0.3,
        outputCost: tokenCost * 0.7,
        processingCost: baseRequestCost
      }
    };
  }

  async health(): Promise<HealthStatus> {
    const now = new Date();
    this._healthStats.lastCheck = now;
    this._healthStats.uptime = now.getTime() - this._lastActivity.getTime();
    this._healthStats.concurrentRequests = this._activeRequests.size;
    
    // Perform basic health checks
    try {
      await this._performHealthCheck();
      this._healthStats.status = this._status;
    } catch (error) {
      this._healthStats.status = AIModelStatus.ERROR;
      this._healthStats.issues = [`Health check failed: ${error}`];
    }
    
    return { ...this._healthStats };
  }

  // Request management
  async executeRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this._activeRequests.add(request.id);
    this._lastActivity = new Date();

    try {
      // Validate request
      await this._validateRequest(request);
      
      // Update status
      this._status = AIModelStatus.BUSY;
      
      // Process the request
      const output = await this.process(request.input, request.options);
      
      // Calculate cost
      const cost = await this.estimate(request.input, request.options);
      
      const response: AIResponse = {
        id: `${request.id}_response`,
        requestId: request.id,
        output,
        metadata: {
          processingTime: Date.now() - startTime,
          cost,
          modelUsed: this._id,
          quality: await this._assessOutputQuality(output)
        },
        completedAt: new Date()
      };

      this._status = AIModelStatus.READY;
      return response;

    } catch (error) {
      const response: AIResponse = {
        id: `${request.id}_response`,
        requestId: request.id,
        output: null,
        error: {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        completedAt: new Date()
      };

      this._status = AIModelStatus.ERROR;
      return response;

    } finally {
      this._activeRequests.delete(request.id);
      if (this._activeRequests.size === 0) {
        this._status = AIModelStatus.READY;
      }
    }
  }

  // Batch processing support
  async executeBatch(requests: AIRequest[]): Promise<AIResponse[]> {
    if (!this._capabilities.supportsBatch) {
      // Execute sequentially if batch not supported
      const responses: AIResponse[] = [];
      for (const request of requests) {
        responses.push(await this.executeRequest(request));
      }
      return responses;
    }

    // Implement batch processing
    return this._processBatch(requests);
  }

  // Configuration management
  updateConfiguration(config: Partial<ModelMetadata>): void {
    this._metadata = { ...this._metadata, ...config, lastUpdated: new Date() };
  }

  updateCapabilities(capabilities: Partial<ModelCapabilities>): void {
    this._capabilities = { ...this._capabilities, ...capabilities };
  }

  // Protected helper methods
  protected async _validateRequest(request: AIRequest): Promise<void> {
    if (!request.input) {
      throw new Error('Request input is required');
    }

    // Validate input size
    if (this._capabilities.maxInputSize) {
      const inputSize = this._calculateInputSize(request.input);
      if (inputSize > this._capabilities.maxInputSize) {
        throw new Error(`Input size ${inputSize} exceeds maximum ${this._capabilities.maxInputSize}`);
      }
    }

    // Validate input type
    if (this._capabilities.inputTypes.length > 0) {
      const inputType = this._detectInputType(request.input);
      if (!this._capabilities.inputTypes.includes(inputType)) {
        throw new Error(
          `Input type ${inputType} not supported. Supported types: ${this._capabilities.inputTypes.join(',
          '
        )}`);
      }
    }
  }

  protected _calculateInputSize(input: any): number {
    if (typeof input === 'string') {
      return new Blob([input]).size;
    }
    if (input instanceof ArrayBuffer) {
      return input.byteLength;
    }
    return JSON.stringify(input).length;
  }

  protected _detectInputType(input: any): string {
    if (typeof input === 'string') {
      return 'text';
    }
    if (input instanceof ArrayBuffer || input instanceof Uint8Array) {
      return 'binary';
    }
    if (input && typeof input === 'object') {
      return 'json';
    }
    return 'unknown';
  }

  protected _calculateTokenCost(input: any, options?: any): number {
    if (!this._metadata.costPerToken) {
      return 0;
    }

    // Rough token estimation (4 characters per token for text)
    let tokenCount = 0;
    if (typeof input === 'string') {
      tokenCount = Math.ceil(input.length / 4);
    } else {
      tokenCount = Math.ceil(JSON.stringify(input).length / 4);
    }

    return tokenCount * this._metadata.costPerToken;
  }

  protected async _assessOutputQuality(output: any): Promise<number> {
    // Default quality assessment - can be overridden
    if (!output || output === null || output === undefined) {
      return 0;
    }
    
    if (typeof output === 'string' && output.length === 0) {
      return 0;
    }
    
    // Basic quality score based on output characteristics
    return 0.8; // Default decent quality
  }

  protected async _performHealthCheck(): Promise<void> {
    // Default health check - can be overridden
    if (this._status === AIModelStatus.ERROR) {
      throw new Error('Model is in error state');
    }
  }

  protected async _processBatch(requests: AIRequest[]): Promise<AIResponse[]> {
    // Default batch processing - can be overridden for better efficiency
    const responses: AIResponse[] = [];
    for (const request of requests) {
      responses.push(await this.executeRequest(request));
    }
    return responses;
  }
}

// Factory interface for creating model instances
export interface AIModelFactory {
  createModel(config: ModelConfiguration): Promise<BaseAIModel>;
  getSupportedTypes(): AIModelType[];
  getDefaultConfiguration(type: AIModelType): ModelConfiguration;
}

// Configuration interface for model creation
export interface ModelConfiguration {
  id: string;
  type: AIModelType;
  provider: AIModelProvider;
  endpoint?: string;
  apiKey?: string;
  modelName?: string;
  parameters?: Record<string, any>;
  capabilities?: Partial<ModelCapabilities>;
  metadata?: Partial<ModelMetadata>;
}

// Error types
export class ModelInitializationError extends Error {
  constructor(modelId: string, cause: string) {
    super(`Failed to initialize model ${modelId}: ${cause}`);
    this.name = 'ModelInitializationError';
  }
}

export class ModelProcessingError extends Error {
  constructor(modelId: string, cause: string) {
    super(`Model ${modelId} processing failed: ${cause}`);
    this.name = 'ModelProcessingError';
  }
}

export class ModelUnavailableError extends Error {
  constructor(modelId: string) {
    super(`Model ${modelId} is currently unavailable`);
    this.name = 'ModelUnavailableError';
  }
}

// Export the default class
export { BaseAIModel as default };