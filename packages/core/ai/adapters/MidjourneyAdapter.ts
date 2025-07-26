/**
 * Midjourney Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 * 
 * Adapter for Midjourney image generation via unofficial API
 */

import { 
  BaseAIModel,
  AIModelType,
  AIModelProvider,
  AIModelStatus,
  ModelMetadata,
  ModelCapabilities,
  CostEstimate,
  ModelInitializationError,
  ModelProcessingError,
  ModelUnavailableError
} from '../BaseAIModel';

export interface MidjourneyConfig {
  apiKey?: string;
  serverUrl: string; // Midjourney API proxy server
  timeout?: number;
  maxRetries?: number;
  pollInterval?: number;
  maxPollAttempts?: number;
}

export interface MidjourneyRequestOptions {
  version?: 'v5' | 'v5.1' | 'v5.2' | 'v6';
  aspectRatio?: '1:1' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '16:9';
  stylize?: number; // 0-1000
  chaos?: number; // 0-100
  quality?: number; // 0.25, 0.5, 1, 2
  seed?: number;
  style?: 'raw' | 'default';
  model?: 'midjourney' | 'niji';
  noText?: boolean;
  tile?: boolean;
  weird?: number; // 0-3000
  stop?: number; // 10-100
}

export interface MidjourneyJobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  imageUrl?: string;
  thumbnailUrl?: string;
  prompt: string;
  originalPrompt: string;
  revisedPrompt?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    version: string;
    aspectRatio: string;
    stylize: number;
    chaos: number;
    quality: number;
    seed?: number;
  };
}

export interface MidjourneyResponse {
  success: boolean;
  jobId: string;
  status: 'submitted' | 'in-progress' | 'completed' | 'failed';
  message?: string;
  result?: {
    imageUrl: string;
    thumbnailUrl?: string;
    upscaledImages?: string[];
    variations?: string[];
    prompt: string;
    seed?: number;
  };
  error?: string;
}

export interface MidjourneyGenerationResult {
  jobId: string;
  status: 'completed' | 'failed';
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    type: 'main' | 'upscaled' | 'variation';
    index?: number;
  }>;
  originalPrompt: string;
  processedPrompt: string;
  metadata: {
    version: string;
    aspectRatio: string;
    stylize: number;
    chaos: number;
    quality: number;
    seed?: number;
    generationTime: number;
  };
  usage: {
    credits: number;
    estimatedCost: number;
  };
}

export class MidjourneyAdapter extends BaseAIModel {
  private config: MidjourneyConfig;
  private promptTemplater: MidjourneyPromptTemplater;
  private activeJobs: Map<string, MidjourneyJobStatus> = new Map();

  constructor(id: string, config: MidjourneyConfig) {
    const metadata: ModelMetadata = {
      name: 'midjourney-v6',
      version: '6.0',
      description: 'Midjourney AI image generation via API proxy',
      provider: AIModelProvider.MIDJOURNEY,
      type: AIModelType.IMAGE,
      costPerRequest: 0.10, // Estimated cost per generation
      averageLatency: 60000, // ~60 seconds average
      maxConcurrency: 3, // Limited concurrent jobs
      rateLimit: {
        requestsPerMinute: 10,
        tokensPerMinute: 1000
      },
      tags: ['image-generation', 'artistic', 'creative', 'high-quality'],
      lastUpdated: new Date()
    };

    const capabilities: ModelCapabilities = {
      inputTypes: ['text'],
      outputTypes: ['image', 'url'],
      maxInputSize: 4000, // Characters in prompt
      maxOutputSize: 4, // Number of variations
      supportsBatch: false,
      supportsStreaming: false,
      supportsAsync: true,
      customParameters: {
        version: { 
          type: 'enum', 
          values: ['v5', 'v5.1', 'v5.2', 'v6'], 
          default: 'v6' 
        },
        aspectRatio: { 
          type: 'enum', 
          values: ['1:1', '2:3', '3:2', '4:5', '5:4', '9:16', '16:9'], 
          default: '1:1' 
        },
        stylize: { 
          type: 'number', 
          min: 0, 
          max: 1000, 
          default: 100 
        },
        chaos: { 
          type: 'number', 
          min: 0, 
          max: 100, 
          default: 0 
        },
        quality: { 
          type: 'enum', 
          values: [0.25, 0.5, 1, 2], 
          default: 1 
        }
      }
    };

    super(id, metadata, capabilities);
    this.config = {
      pollInterval: 5000, // 5 seconds
      maxPollAttempts: 120, // 10 minutes max wait
      ...config
    };
    this.promptTemplater = new MidjourneyPromptTemplater();
  }

  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      
      if (!this.config.serverUrl) {
        throw new Error('Midjourney server URL is required');
      }

      // Test connectivity to Midjourney API proxy
      await this._testConnection();
      
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
      this._status = AIModelStatus.ERROR;
      throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async process(input: unknown, options?: MidjourneyRequestOptions): Promise<MidjourneyGenerationResult> {
    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      }

      const startTime = Date.now();
      
      // Extract and process prompt
      const originalPrompt = this._extractPrompt(input);
      const processedPrompt = this.promptTemplater.buildPrompt(originalPrompt, options);
      
      // Submit job to Midjourney
      const jobResponse = await this._submitJob(processedPrompt, options);
      
      if (!jobResponse.success) {
        throw new Error(`Failed to submit Midjourney job: ${jobResponse.error || 'Unknown error'}`);
      }
      
      // Poll for completion
      const result = await this._pollJobCompletion(jobResponse.jobId);
      const generationTime = Date.now() - startTime;
      
      return this._processJobResult(result, originalPrompt, processedPrompt, options, generationTime);

    } catch (error) {
      throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async cleanup(): Promise<void> {
    this._status = AIModelStatus.OFFLINE;
    this._activeRequests.clear();
    this._requestQueue = [];
    this.activeJobs.clear();
  }

  async estimate(input: unknown, options?: MidjourneyRequestOptions): Promise<CostEstimate> {
    const quality = options?.quality || 1;
    const baseCost = this._metadata.costPerRequest || 0.10;
    
    // Adjust cost based on quality
    let costMultiplier = 1;
    if (quality === 2) costMultiplier = 2;
    else if (quality === 0.5) costMultiplier = 0.5;
    else if (quality === 0.25) costMultiplier = 0.25;
    
    const estimatedCost = baseCost * costMultiplier;
    
    return {
      estimatedCost,
      currency: 'USD',
      confidence: 0.8,
      breakdown: {
        inputCost: 0,
        outputCost: estimatedCost,
        processingCost: 0
      }
    };
  }

  // Midjourney-specific methods
  async getJobStatus(jobId: string): Promise<MidjourneyJobStatus | null> {
    try {
      const response = await this._makeRequest(`/job/${jobId}/status`, 'GET');
      return this._parseJobStatus(response);
    } catch (error) {
      console.warn(`Failed to get job status for ${jobId}:`, error);
      return null;
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const response = await this._makeRequest(`/job/${jobId}/cancel`, 'POST');
      this.activeJobs.delete(jobId);
      return response.success || false;
    } catch (error) {
      console.warn(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  async upscaleImage(jobId: string, imageIndex: number): Promise<MidjourneyGenerationResult> {
    try {
      const payload = {
        jobId,
        action: 'upscale',
        index: imageIndex
      };

      const response = await this._makeRequest('/job/action', 'POST', payload);
      
      if (!response.success) {
        throw new Error(`Failed to upscale image: ${response.error}`);
      }
      
      const result = await this._pollJobCompletion(response.jobId);
      
      return this._processJobResult(result, 'Upscale', 'Upscale', {}, Date.now());
    } catch (error) {
      throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async createVariation(jobId: string, imageIndex: number): Promise<MidjourneyGenerationResult> {
    try {
      const payload = {
        jobId,
        action: 'variation',
        index: imageIndex
      };

      const response = await this._makeRequest('/job/action', 'POST', payload);
      
      if (!response.success) {
        throw new Error(`Failed to create variation: ${response.error}`);
      }
      
      const result = await this._pollJobCompletion(response.jobId);
      
      return this._processJobResult(result, 'Variation', 'Variation', {}, Date.now());
    } catch (error) {
      throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  getActiveJobs(): MidjourneyJobStatus[] {
    return Array.from(this.activeJobs.values());
  }

  // Private helper methods
  private async _testConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.config.serverUrl}/health`, {
        headers: this._buildHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`Midjourney API health check failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to connect to Midjourney API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private async _makeRequest(endpoint: string, method: 'GET' | 'POST' = 'POST', payload?: unknown): Promise<unknown> {
    const url = `${this.config.serverUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this._buildHeaders(),
      signal: AbortSignal.timeout(this.config.timeout || 30000)
    };

    if (method === 'POST' && payload) {
      options.body = JSON.stringify(payload);
    }

    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.text().catch(() => '');
          throw new Error(`Midjourney API request failed: ${response.status} ${response.statusText} - ${errorData}`);
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private async _submitJob(prompt: string, options?: MidjourneyRequestOptions): Promise<MidjourneyResponse> {
    const payload = {
      prompt,
      version: options?.version || 'v6',
      aspectRatio: options?.aspectRatio || '1:1',
      stylize: options?.stylize || 100,
      chaos: options?.chaos || 0,
      quality: options?.quality || 1,
      ...(options?.seed && { seed: options.seed }),
      ...(options?.style && { style: options.style }),
      ...(options?.model && { model: options.model }),
      ...(options?.noText && { noText: options.noText }),
      ...(options?.tile && { tile: options.tile }),
      ...(options?.weird && { weird: options.weird }),
      ...(options?.stop && { stop: options.stop })
    };

    return this._makeRequest('/generate', 'POST', payload);
  }

  private async _pollJobCompletion(jobId: string): Promise<MidjourneyJobStatus> {
    const pollInterval = this.config.pollInterval || 5000;
    const maxAttempts = this.config.maxPollAttempts || 120;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getJobStatus(jobId);
      
      if (!status) {
        throw new Error(`Failed to get status for job ${jobId}`);
      }
      
      this.activeJobs.set(jobId, status);
      
      if (status.status === 'completed') {
        this.activeJobs.delete(jobId);
        return status;
      }
      
      if (status.status === 'failed') {
        this.activeJobs.delete(jobId);
        throw new Error(`Midjourney job failed: ${status.error || 'Unknown error'}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Midjourney job ${jobId} timed out after ${maxAttempts} attempts`);
  }

  private _parseJobStatus(response: any): MidjourneyJobStatus {
    return {
      id: response.jobId || response.id,
      status: response.status,
      progress: response.progress || 0,
      imageUrl: response.imageUrl,
      thumbnailUrl: response.thumbnailUrl,
      prompt: response.prompt || '',
      originalPrompt: response.originalPrompt || response.prompt || '',
      revisedPrompt: response.revisedPrompt,
      createdAt: new Date(response.createdAt || Date.now()),
      completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
      error: response.error,
      metadata: response.metadata
    };
  }

  private _processJobResult(
    status: MidjourneyJobStatus,
    originalPrompt: string,
    processedPrompt: string,
    options?: MidjourneyRequestOptions,
    generationTime: number = 0
  ): MidjourneyGenerationResult {
    const images = [];
    
    if (status.imageUrl) {
      images.push({
        url: status.imageUrl,
        thumbnailUrl: status.thumbnailUrl,
        type: 'main' as const,
        index: 0
      });
    }

    return {
      jobId: status.id,
      status: status.status as 'completed' | 'failed',
      images,
      originalPrompt,
      processedPrompt,
      metadata: {
        version: options?.version || 'v6',
        aspectRatio: options?.aspectRatio || '1:1',
        stylize: options?.stylize || 100,
        chaos: options?.chaos || 0,
        quality: options?.quality || 1,
        seed: options?.seed,
        generationTime
      },
      usage: {
        credits: 1,
        estimatedCost: this._metadata.costPerRequest || 0.10
      }
    };
  }

  private _extractPrompt(input: any): string {
    if (typeof input === 'string') {
      return input;
    }
    
    if (input && typeof input === 'object') {
      if (input.prompt) return input.prompt;
      if (input.description) return input.description;
      if (input.text) return input.text;
    }
    
    return JSON.stringify(input);
  }

  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();
  }
}

// Midjourney prompt templating helper
class MidjourneyPromptTemplater {
  buildPrompt(basePrompt: string, options?: MidjourneyRequestOptions): string {
    let prompt = basePrompt.trim();
    
    // Add version parameter
    if (options?.version && options.version !== 'v6') {
      prompt += ` --v ${options.version}`;
    }
    
    // Add aspect ratio
    if (options?.aspectRatio && options.aspectRatio !== '1:1') {
      prompt += ` --ar ${options.aspectRatio}`;
    }
    
    // Add stylize parameter
    if (options?.stylize !== undefined && options.stylize !== 100) {
      prompt += ` --s ${options.stylize}`;
    }
    
    // Add chaos parameter
    if (options?.chaos !== undefined && options.chaos !== 0) {
      prompt += ` --c ${options.chaos}`;
    }
    
    // Add quality parameter
    if (options?.quality !== undefined && options.quality !== 1) {
      prompt += ` --q ${options.quality}`;
    }
    
    // Add seed
    if (options?.seed !== undefined) {
      prompt += ` --seed ${options.seed}`;
    }
    
    // Add style
    if (options?.style === 'raw') {
      prompt += ` --style raw`;
    }
    
    // Add model
    if (options?.model === 'niji') {
      prompt += ` --niji`;
    }
    
    // Add no text flag
    if (options?.noText) {
      prompt += ` --no text`;
    }
    
    // Add tile flag
    if (options?.tile) {
      prompt += ` --tile`;
    }
    
    // Add weird parameter
    if (options?.weird !== undefined && options.weird > 0) {
      prompt += ` --weird ${options.weird}`;
    }
    
    // Add stop parameter
    if (options?.stop !== undefined && options.stop !== 100) {
      prompt += ` --stop ${options.stop}`;
    }
    
    return prompt;
  }

  parsePromptParameters(prompt: string): {
    cleanPrompt: string;
    parameters: Partial<MidjourneyRequestOptions>;
  } {
    const parameters: Partial<MidjourneyRequestOptions> = {};
    let cleanPrompt = prompt;
    
    // Parse version
    const versionMatch = prompt.match(/--v(?:ersion)?\s+(v?[0-9.]+)/i);
    if (versionMatch) {
      parameters.version = versionMatch[1].replace('v', '') as any;
      cleanPrompt = cleanPrompt.replace(versionMatch[0], '').trim();
    }
    
    // Parse aspect ratio
    const arMatch = prompt.match(/--ar\s+(\d+:\d+)/i);
    if (arMatch) {
      parameters.aspectRatio = arMatch[1] as any;
      cleanPrompt = cleanPrompt.replace(arMatch[0], '').trim();
    }
    
    // Parse stylize
    const stylizeMatch = prompt.match(/--s(?:tylize)?\s+(\d+)/i);
    if (stylizeMatch) {
      parameters.stylize = parseInt(stylizeMatch[1]);
      cleanPrompt = cleanPrompt.replace(stylizeMatch[0], '').trim();
    }
    
    // Parse chaos
    const chaosMatch = prompt.match(/--c(?:haos)?\s+(\d+)/i);
    if (chaosMatch) {
      parameters.chaos = parseInt(chaosMatch[1]);
      cleanPrompt = cleanPrompt.replace(chaosMatch[0], '').trim();
    }
    
    // Parse quality
    const qualityMatch = prompt.match(/--q(?:uality)?\s+([\d.]+)/i);
    if (qualityMatch) {
      parameters.quality = parseFloat(qualityMatch[1]) as any;
      cleanPrompt = cleanPrompt.replace(qualityMatch[0], '').trim();
    }
    
    return { cleanPrompt, parameters };
  }
}

export default MidjourneyAdapter;