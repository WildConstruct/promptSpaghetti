/**
 * Stable Video Diffusion Adapter
 * Epic 35.1.4 - Video Generation Integration
 * 
 * Adapter for Stable Video Diffusion models (SVD and SVD-XT)
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

export interface StableVideoConfig {
  endpoint: string; // API endpoint (local, Stability AI, or custom)
  apiType: 'stability-ai' | 'automatic1111' | 'comfyui' | 'custom';
  apiKey?: string; // For hosted services
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
}

export interface StableVideoRequestOptions {
  // Core parameters
  image: string; // Base64 encoded input image
  
  // Generation parameters
  model?: 'svd' | 'svd-xt' | 'svd-img2vid' | 'svd-xt-1-1';
  motion_bucket_id?: number; // Motion intensity (1-255)
  cond_aug?: number; // Conditioning augmentation (0.0-1.0)
  
  // Video parameters
  num_frames?: number; // Number of frames (14 for SVD, 25 for SVD-XT)
  fps?: number; // Frames per second
  width?: number;
  height?: number;
  
  // Generation settings
  seed?: number;
  steps?: number; // Inference steps
  cfg_scale?: number; // Classifier-free guidance scale
  noise_aug_strength?: number; // Noise augmentation strength
  
  // Advanced parameters
  scheduler?: string; // Sampling scheduler
  decode_chunk_size?: number; // Memory optimization
  
  // Quality settings
  enhance_motion?: boolean;
  temporal_consistency?: boolean;
  interpolate_frames?: boolean;
  
  // Post-processing
  upscale_video?: boolean;
  remove_watermark?: boolean;
  loop_video?: boolean;
}

export interface StableVideoGenerationResult {
  video: {
    frames: string[]; // Base64 encoded frames
    url?: string;
    data?: ArrayBuffer;
    format: string;
    duration: number;
    resolution: {
      width: number;
      height: number;
    };
    fps: number;
    frame_count: number;
    size: number;
  };
  metadata: {
    model: string;
    input_image: string;
    motion_bucket_id: number;
    cond_aug: number;
    seed: number;
    steps: number;
    cfg_scale: number;
    generation_time: number;
    memory_usage?: number;
  };
  usage: {
    compute_units: number;
    estimated_cost: number;
    processing_time: number;
  };
}

export interface SVDModelInfo {
  name: string;
  type: 'svd' | 'svd-xt';
  max_frames: number;
  resolution: string;
  description: string;
  memory_requirements: string;
}

export class StableVideoAdapter extends BaseAIModel {
  private config: StableVideoConfig;
  private availableModels: SVDModelInfo[] = [];

  constructor(id: string, config: StableVideoConfig) {
    const metadata: ModelMetadata = {
      name: config.defaultModel || 'svd-xt',
      version: '1.1',
      description: 'Stable Video Diffusion for image-to-video generation',
      provider: config.apiType === 'stability-ai' ? AIModelProvider.STABILITY_AI : AIModelProvider.LOCAL,
      type: AIModelType.VIDEO,
      costPerRequest: StableVideoAdapter.getEstimatedCost(config.apiType),
      averageLatency: StableVideoAdapter.getEstimatedLatency(config.apiType),
      maxConcurrency: config.apiType === 'stability-ai' ? 5 : 2,
      rateLimit: {
        requestsPerMinute: config.apiType === 'stability-ai' ? 20 : 10,
        tokensPerMinute: 2000
      },
      tags: ['video-generation', 'image-to-video', 'stable-diffusion', 'temporal'],
      lastUpdated: new Date()
    };

    const capabilities: ModelCapabilities = {
      inputTypes: ['image'],
      outputTypes: ['video', 'frames'],
      maxInputSize: 10 * 1024 * 1024, // 10MB image
      maxOutputSize: 25, // Max frames
      supportsBatch: false,
      supportsStreaming: false,
      supportsAsync: true,
      customParameters: {
        motion_bucket_id: { type: 'number', min: 1, max: 255, default: 127 },
        cond_aug: { type: 'number', min: 0, max: 1, default: 0.02 },
        num_frames: { type: 'number', min: 14, max: 25, default: 14 },
        fps: { type: 'number', min: 6, max: 30, default: 6 },
        steps: { type: 'number', min: 10, max: 50, default: 20 },
        cfg_scale: { type: 'number', min: 1, max: 20, default: 2.5 }
      }
    };

    super(id, metadata, capabilities);
    this.config = config;
    this._initializeModels();
  }

  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      
      if (!this.config.endpoint) {
        throw new Error('Stable Video Diffusion endpoint is required');
      }

      // Test connectivity
      await this._testConnection();
      await this._loadAvailableModels();
      
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
      this._status = AIModelStatus.ERROR;
      throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async process(input: any, options?: StableVideoRequestOptions): Promise<StableVideoGenerationResult> {
    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      }

      const startTime = Date.now();
      
      // Extract and validate image input
      const imageData = this._extractImage(input);
      if (!imageData) {
        throw new Error('Input image is required for video generation');
      }

      // Validate image format and size
      await this._validateImage(imageData);
      
      // Process options with defaults
      const processedOptions = this._processOptions(options);
      
      // Generate video frames
      const videoData = await this._generateVideo(imageData, processedOptions);
      const generationTime = Date.now() - startTime;
      
      // Process results
      const result = this._processVideoResult(videoData, imageData, processedOptions, generationTime);
      
      this._lastActivity = new Date();
      return result;

    } catch (error) {
      throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async cleanup(): Promise<void> {
    this._status = AIModelStatus.OFFLINE;
    this._activeRequests.clear();
    this._requestQueue = [];
  }

  async estimate(input: any, options?: StableVideoRequestOptions): Promise<CostEstimate> {
    const numFrames = options?.num_frames || 14;
    const steps = options?.steps || 20;
    const model = options?.model || 'svd-xt';
    
    const computeUnits = this._calculateComputeUnits(model, numFrames, steps);
    const estimatedCost = computeUnits * (this._metadata.costPerRequest || 0.02);
    
    return {
      estimatedCost,
      currency: 'USD',
      confidence: 0.7,
      breakdown: {
        inputCost: 0,
        outputCost: estimatedCost,
        processingCost: 0
      }
    };
  }

  // Stable Video Diffusion specific methods
  async generateImageToVideo(
    imageData: string,
    motionIntensity: number = 127,
    numFrames: number = 14,
    options?: Partial<StableVideoRequestOptions>
  ): Promise<StableVideoGenerationResult> {
    const svdOptions: StableVideoRequestOptions = {
      image: imageData,
      motion_bucket_id: motionIntensity,
      num_frames: numFrames,
      ...options
    };

    return this.process(imageData, svdOptions);
  }

  async generateVideoLoop(
    imageData: string,
    options?: Partial<StableVideoRequestOptions>
  ): Promise<StableVideoGenerationResult> {
    const loopOptions: StableVideoRequestOptions = {
      image: imageData,
      loop_video: true,
      temporal_consistency: true,
      enhance_motion: true,
      ...options
    };

    return this.process(imageData, loopOptions);
  }

  async generateHighQualityVideo(
    imageData: string,
    options?: Partial<StableVideoRequestOptions>
  ): Promise<StableVideoGenerationResult> {
    const hqOptions: StableVideoRequestOptions = {
      image: imageData,
      model: 'svd-xt-1-1',
      num_frames: 25,
      steps: 30,
      cfg_scale: 3.0,
      enhance_motion: true,
      temporal_consistency: true,
      interpolate_frames: true,
      ...options
    };

    return this.process(imageData, hqOptions);
  }

  async getAvailableModels(): Promise<SVDModelInfo[]> {
    return [...this.availableModels];
  }

  async switchModel(modelName: string): Promise<void> {
    if (this.config.apiType === 'automatic1111') {
      await this._makeRequest('/sdapi/v1/options', 'POST', {
        sd_model_checkpoint: modelName
      });
      
      this.updateConfiguration({ name: modelName });
    } else {
      throw new Error(`Model switching not supported for ${this.config.apiType}`);
    }
  }

  async interpolateFrames(frames: string[]): Promise<string[]> {
    // Frame interpolation to increase smoothness
    const interpolatedFrames: string[] = [];
    
    for (let i = 0; i < frames.length - 1; i++) {
      interpolatedFrames.push(frames[i]);
      
      // Generate interpolated frame between current and next
      const interpolatedFrame = await this._interpolateFrame(frames[i], frames[i + 1]);
      interpolatedFrames.push(interpolatedFrame);
    }
    
    interpolatedFrames.push(frames[frames.length - 1]);
    return interpolatedFrames;
  }

  async enhanceVideoQuality(
    frames: string[],
    upscaleFactor: number = 2
  ): Promise<string[]> {
    const enhancedFrames: string[] = [];
    
    for (const frame of frames) {
      try {
        const enhancedFrame = await this._upscaleFrame(frame, upscaleFactor);
        enhancedFrames.push(enhancedFrame);
      } catch (error) {
        console.warn('Failed to enhance frame:', error);
        enhancedFrames.push(frame); // Use original frame on failure
      }
    }
    
    return enhancedFrames;
  }

  // Static helper methods
  static getEstimatedCost(apiType: string): number {
    const costs: Record<string, number> = {
      'stability-ai': 0.04, // Per generation
      'automatic1111': 0.01, // Local hosting cost
      'comfyui': 0.01,
      'custom': 0.02
    };
    return costs[apiType] || 0.02;
  }

  static getEstimatedLatency(apiType: string): number {
    const latencies: Record<string, number> = {
      'stability-ai': 30000, // 30 seconds
      'automatic1111': 60000, // 1 minute for local
      'comfyui': 45000,
      'custom': 45000
    };
    return latencies[apiType] || 60000;
  }

  static getSupportedModels(): SVDModelInfo[] {
    return [
      {
        name: 'svd',
        type: 'svd',
        max_frames: 14,
        resolution: '576x1024',
        description: 'Base Stable Video Diffusion model',
        memory_requirements: '8GB VRAM'
      },
      {
        name: 'svd-xt',
        type: 'svd-xt',
        max_frames: 25,
        resolution: '576x1024',
        description: 'Extended Stable Video Diffusion with longer sequences',
        memory_requirements: '12GB VRAM'
      },
      {
        name: 'svd-img2vid',
        type: 'svd',
        max_frames: 14,
        resolution: '512x512',
        description: 'Optimized for image-to-video conversion',
        memory_requirements: '6GB VRAM'
      },
      {
        name: 'svd-xt-1-1',
        type: 'svd-xt',
        max_frames: 25,
        resolution: '1024x576',
        description: 'High-resolution SVD-XT model',
        memory_requirements: '16GB VRAM'
      }
    ];
  }

  // Private helper methods
  private _initializeModels(): void {
    this.availableModels = StableVideoAdapter.getSupportedModels();
  }

  private async _testConnection(): Promise<void> {
    try {
      let testEndpoint = '/';
      
      switch (this.config.apiType) {
        case 'automatic1111':
          testEndpoint = '/sdapi/v1/options';
          break;
        case 'comfyui':
          testEndpoint = '/system_stats';
          break;
        case 'stability-ai':
          testEndpoint = '/v1/user/account';
          break;
        default:
          testEndpoint = '/health';
      }

      const response = await fetch(`${this.config.endpoint}${testEndpoint}`, {
        headers: this._buildHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok && response.status !== 405) {
        throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to connect to Stable Video API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      if (this.config.apiType === 'stability-ai') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }
    }

    return headers;
  }

  private async _loadAvailableModels(): Promise<void> {
    try {
      if (this.config.apiType === 'automatic1111') {
        const response = await this._makeRequest('/sdapi/v1/sd-models', 'GET');
        if (response.ok) {
          const models = await response.json();
          // Filter for video models
          const videoModels = models.filter((model: any) => 
            model.title.toLowerCase().includes('svd') || 
            model.title.toLowerCase().includes('video')
          );
          
          if (videoModels.length > 0) {
            this.availableModels = videoModels.map((model: any) => ({
              name: model.title,
              type: model.title.includes('xt') ? 'svd-xt' : 'svd',
              max_frames: model.title.includes('xt') ? 25 : 14,
              resolution: '576x1024',
              description: model.model_name || model.title,
              memory_requirements: 'Variable'
            }));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load available models:', error);
    }
  }

  private _extractImage(input: any): string | null {
    if (typeof input === 'string') {
      // Check if it's a base64 image or URL
      if (input.startsWith('data:image/') || input.startsWith('http')) {
        return input;
      }
    }
    
    if (input && typeof input === 'object') {
      if (input.image) return input.image;
      if (input.imageData) return input.imageData;
      if (input.init_image) return input.init_image;
    }
    
    return null;
  }

  private async _validateImage(imageData: string): Promise<void> {
    // Validate base64 image format
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('http')) {
      throw new Error('Image must be a valid base64 data URL or HTTP URL');
    }

    // Estimate image size (rough calculation for base64)
    if (imageData.startsWith('data:image/')) {
      const base64Data = imageData.split(',')[1] || imageData;
      const estimatedSize = (base64Data.length * 3) / 4;
      
      if (estimatedSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image size exceeds 10MB limit');
      }
    }
  }

  private _processOptions(options?: StableVideoRequestOptions): Required<Pick<StableVideoRequestOptions, 'model' | 'motion_bucket_id' | 'cond_aug' | 'num_frames' | 'fps' | 'steps' | 'cfg_scale'>> & Omit<StableVideoRequestOptions, 'image'> {
    const defaults = {
      model: 'svd-xt' as const,
      motion_bucket_id: 127,
      cond_aug: 0.02,
      num_frames: 14,
      fps: 6,
      steps: 20,
      cfg_scale: 2.5,
      width: 576,
      height: 1024,
      scheduler: 'euler',
      decode_chunk_size: 8
    };

    const processed = { ...defaults, ...options };

    // Validate motion_bucket_id
    processed.motion_bucket_id = Math.max(1, Math.min(255, processed.motion_bucket_id));

    // Validate cond_aug
    processed.cond_aug = Math.max(0, Math.min(1, processed.cond_aug));

    // Validate num_frames based on model
    const maxFrames = processed.model.includes('xt') ? 25 : 14;
    processed.num_frames = Math.max(1, Math.min(maxFrames, processed.num_frames));

    // Validate other parameters
    processed.fps = Math.max(1, Math.min(30, processed.fps));
    processed.steps = Math.max(1, Math.min(50, processed.steps));
    processed.cfg_scale = Math.max(1, Math.min(20, processed.cfg_scale));

    return processed;
  }

  private async _generateVideo(imageData: string, options: Omit<StableVideoRequestOptions, 'image'>): Promise<any> {
    let endpoint: string;
    let payload: any;

    switch (this.config.apiType) {
      case 'automatic1111':
        endpoint = '/sdapi/v1/txt2img'; // Placeholder - actual SVD extension needed
        payload = this._buildAutomatic1111Payload(imageData, options);
        break;
        
      case 'stability-ai':
        endpoint = '/v1/generation/image-to-video';
        payload = this._buildStabilityAIPayload(imageData, options);
        break;
        
      default:
        endpoint = '/generate_video';
        payload = this._buildGenericPayload(imageData, options);
    }

    return this._makeRequest(endpoint, 'POST', payload);
  }

  private _buildAutomatic1111Payload(imageData: string, options: Omit<StableVideoRequestOptions, 'image'>): any {
    return {
      init_images: [imageData],
      prompt: 'video generation',
      steps: options.steps || 20,
      cfg_scale: options.cfg_scale || 2.5,
      width: options.width || 576,
      height: options.height || 1024,
      seed: options.seed || -1,
      sampler_name: options.scheduler || 'euler',
      // SVD-specific parameters
      motion_bucket_id: options.motion_bucket_id || 127,
      cond_aug: options.cond_aug || 0.02,
      num_frames: options.num_frames || 14,
      fps: options.fps || 6
    };
  }

  private _buildStabilityAIPayload(imageData: string, options: Omit<StableVideoRequestOptions, 'image'>): any {
    return {
      image: imageData,
      cfg_scale: options.cfg_scale || 2.5,
      motion_bucket_id: options.motion_bucket_id || 127,
      seed: options.seed || -1
    };
  }

  private _buildGenericPayload(imageData: string, options: Omit<StableVideoRequestOptions, 'image'>): any {
    return {
      image: imageData,
      model: options.model || 'svd-xt',
      motion_bucket_id: options.motion_bucket_id || 127,
      cond_aug: options.cond_aug || 0.02,
      num_frames: options.num_frames || 14,
      fps: options.fps || 6,
      steps: options.steps || 20,
      cfg_scale: options.cfg_scale || 2.5,
      seed: options.seed || -1,
      width: options.width || 576,
      height: options.height || 1024
    };
  }

  private _processVideoResult(
    response: any,
    imageData: string,
    options: Omit<StableVideoRequestOptions, 'image'>,
    generationTime: number
  ): StableVideoGenerationResult {
    // Process frames from response
    let frames: string[] = [];
    if (response.frames) {
      frames = response.frames;
    } else if (response.images) {
      frames = response.images;
    } else if (response.output) {
      frames = Array.isArray(response.output) ? response.output : [response.output];
    }

    const computeUnits = this._calculateComputeUnits(
      options.model || 'svd-xt',
      options.num_frames || 14,
      options.steps || 20
    );
    const estimatedCost = computeUnits * (this._metadata.costPerRequest || 0.02);

    return {
      video: {
        frames,
        format: 'frames', // Individual frames
        duration: (options.num_frames || 14) / (options.fps || 6),
        resolution: {
          width: options.width || 576,
          height: options.height || 1024
        },
        fps: options.fps || 6,
        frame_count: frames.length,
        size: this._estimateVideoSize(frames)
      },
      metadata: {
        model: options.model || 'svd-xt',
        input_image: imageData,
        motion_bucket_id: options.motion_bucket_id || 127,
        cond_aug: options.cond_aug || 0.02,
        seed: options.seed || -1,
        steps: options.steps || 20,
        cfg_scale: options.cfg_scale || 2.5,
        generation_time: generationTime
      },
      usage: {
        compute_units: computeUnits,
        estimated_cost: estimatedCost,
        processing_time: generationTime
      }
    };
  }

  private async _makeRequest(endpoint: string, method: 'GET' | 'POST' = 'POST', payload?: any): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this._buildHeaders(),
      signal: AbortSignal.timeout(this.config.timeout || 300000) // 5 minutes for video
    };

    if (method === 'POST' && payload) {
      options.body = JSON.stringify(payload);
    }

    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 2; // Fewer retries for video

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Stable Video API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private _calculateComputeUnits(model: string, numFrames: number, steps: number): number {
    const baseUnits = model.includes('xt') ? 2 : 1;
    return baseUnits * numFrames * (steps / 20);
  }

  private _estimateVideoSize(frames: string[]): number {
    if (frames.length === 0) return 0;
    
    // Estimate size based on base64 frame data
    const avgFrameSize = frames.reduce((sum, frame) => {
      const base64Data = frame.includes(',') ? frame.split(',')[1] : frame;
      return sum + ((base64Data.length * 3) / 4);
    }, 0) / frames.length;
    
    return avgFrameSize * frames.length;
  }

  private async _interpolateFrame(frame1: string, frame2: string): Promise<string> {
    // Placeholder for frame interpolation
    // In a real implementation, this would use interpolation algorithms
    return frame1; // Return first frame for now
  }

  private async _upscaleFrame(frame: string, upscaleFactor: number): Promise<string> {
    // Placeholder for frame upscaling
    // In a real implementation, this would use upscaling models
    return frame; // Return original frame for now
  }

  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();
  }
}

export default StableVideoAdapter;