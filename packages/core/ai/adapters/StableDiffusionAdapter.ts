/**
 * Stable Diffusion Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 * 
 * Adapter for Stable Diffusion models (local and hosted)
 */
import { BaseAIModel, AIModelType, AIModelProvider, AIModelStatus, ModelMetadata, ModelCapabilities, CostEstimate, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';

export interface StableDiffusionConfig {
  endpoint: string; // API endpoint (e.g., Automatic1111, ComfyUI, or hosted service),
  apiType: 'automatic1111' | 'comfyui' | 'stability-ai' | 'replicate' | 'custom';
  apiKey?: string; // For hosted services,
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
}
export interface StableDiffusionRequestOptions {
  // Core parameters
  prompt: string;
  negative_prompt?: string;
  // Sampling parameters
  sampler_name?: string;
  scheduler?: string;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  // Image parameters
  width?: number;
  height?: number;
  batch_size?: number;
  n_iter?: number;
  // Model and style
  model?: string;
  style_preset?: string;
  // Advanced parameters
  denoising_strength?: number;
  init_image?: string;
  mask?: string;
  inpaint_full_res?: boolean;
  // LoRA and ControlNet
  lora_models?: Array<{,
  name: string;,
  strength: number;
}>;
  controlnet?: Array<{
  model: string;,
  image: string;
  strength: number;
  guidance_start?: number;
  guidance_end?: number;
}>;
  // Quality and post-processing
  restore_faces?: boolean;
  tiling?: boolean;
  enable_hr?: boolean;
  hr_scale?: number;
  hr_upscaler?: string;
  hr_second_pass_steps?: number;
  hr_resize_x?: number;
  hr_resize_y?: number;
}
export interface StableDiffusionResponse {
  images: string; // Base64 encoded images,
  parameters: Record<string, any>;
  info: string;
}
export interface StableDiffusionGenerationResult {
  images: Array<{,
  base64: string;
  url?: string;
  seed: number;,
  metadata: {,
  model: string;,
  sampler: string;
  steps: number;,
  cfg_scale: number;
  size: string;
};
  }>;
  originalPrompt: string;
  negativePrompt?: string;
  parameters: Record<string, any>;
  generationTime: number;,
  usage: {;
  computeUnits: number;,
  estimatedCost: number;
};
}
export interface ModelInfo {
  name: string;,
  filename: string;
  type: 'checkpoint' | 'lora' | 'controlnet' | 'embedding' | 'vae';
  size?: number;
  description?: string;
  tags?: string;
}
export class StableDiffusionAdapter extends BaseAIModel {
  private config: StableDiffusionConfig;
  private availableModels: ModelInfo = [];
  private availableSamplers: string = [];
  constructor(id: string, config: StableDiffusionConfig) {
    const metadata: ModelMetadata = {,
  name: config.defaultModel || 'stable-diffusion-xl',
      version: '1.0',
      description: `Stable Diffusion via ${config.apiType}`}
},
  provider: config.apiType === 'stability-ai' ? AIModelProvider.STABILITY_AI : AIModelProvider.LOCAL,
      type: AIModelType.IMAGE,
      costPerRequest: StableDiffusionAdapter.getEstimatedCost(config.apiType),
      averageLatency: StableDiffusionAdapter.getEstimatedLatency(config.apiType),
      maxConcurrency: config.apiType === 'stability-ai' ? 10 : 3,
      rateLimit: {,
  requestsPerMinute: config.apiType === 'stability-ai' ? 150 : 30,
  tokensPerMinute: 5000,
},
  tags: ['image-generation', 'stable-diffusion', 'customizable', 'open-source'],
      lastUpdated: new Date();
  };
    const capabilities: ModelCapabilities = {,
  inputTypes: ['text', 'image'],
      outputTypes: ['image', 'base64'],
      maxInputSize: 5000, // Characters in prompt
      maxOutputSize: 8, // Max batch size
      supportsBatch: true,
      supportsStreaming: false,
      supportsAsync: true,
      customParameters: {,
  steps: { type: 'number', min: 1, max: 150, default: 20 },
        cfg_scale: { type: 'number', min: 1, max: 30, default: 7 },
        width: { type: 'number', min: 64, max: 2048, default: 512, step: 64 },
        height: { type: 'number', min: 64, max: 2048, default: 512, step: 64 },
        batch_size: { type: 'number', min: 1, max: 8, default: 1 },
        denoising_strength: { type: 'number', min: 0, max: 1, default: 0.75 }
    };
    super(id, metadata, capabilities);
    this.config = config;
  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      if (!this.config.endpoint) {
        throw new Error('Stable Diffusion endpoint is required');
      // Test connectivity and load available models/samplers
      await this._testConnection();
      await this._loadAvailableModels();
      await this._loadAvailableSamplers();
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
  this._status = AIModelStatus.ERROR;
  throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async process(input: any, options?: StableDiffusionRequestOptions): Promise<StableDiffusionGenerationResult> {,
  try {
  if (this._status !== AIModelStatus.READY) {
  throw new ModelUnavailableError(this._id);
  const startTime = Date.now();
  // Extract and prepare prompt
  const prompt = this._extractPrompt(input);
  const processedOptions = this._processOptions(options, prompt);
  // Generate images based on API type
  const response = await this._generateImages(processedOptions);
  const generationTime = Date.now() - startTime;
  return this._processGenerationResponse(response, prompt, processedOptions, generationTime);
} catch (error) {
  throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async cleanup(): Promise<void> {,
  this._status = AIModelStatus.OFFLINE;
  this._activeRequests.clear();
  this._requestQueue = [];
  async estimate(input: any, options?: StableDiffusionRequestOptions): Promise<CostEstimate> {,
  const steps = options?.steps || 20;
  const batchSize = options?.batch_size || 1;
  const iterations = options?.n_iter || 1;
  const enableHR = options?.enable_hr || false;
  const baseCost = this._metadata.costPerRequest || 0;
  // Calculate cost based on computational complexity
  let computeUnits = steps * batchSize * iterations;
  if (enableHR) computeUnits *= 1.5; // High-res pass increases cost
  const estimatedCost = (computeUnits / 100) * baseCost; // Normalize to reasonable cost;
  return {
  estimatedCost,
  currency: 'USD',
  confidence: 0.7,
  breakdown: {,
  inputCost: 0,
  outputCost: estimatedCost,
  processingCost: 0,
};
  // Stable Diffusion specific methods
  async getAvailableModels(): Promise<ModelInfo> {
  return [...this.availableModels];
  async getAvailableSamplers(): Promise<string> {,
  return [...this.availableSamplers];
  async switchModel(modelName: string): Promise<void> {,
  if (this.config.apiType === 'automatic1111') {
  await this._makeRequest('/sdapi/v1/options', 'POST', {)
  sd_model_checkpoint: modelName,
});
      // Update metadata
      this.updateConfiguration({ name: modelName });
    } else {
      throw new Error(`Model switching not supported for ${this.config.apiType}`);}
  async img2img(initImage: string,)
    prompt: string,
    options?: Partial<StableDiffusionRequestOptions>
  ): Promise<StableDiffusionGenerationResult> {
  const img2imgOptions: StableDiffusionRequestOptions = {,
  prompt,
  init_image: initImage,
  denoising_strength: options?.denoising_strength || 0.75,
  ...options
};
    return this.process(prompt, img2imgOptions);
  async inpaint(initImage: string,)
    mask: string,
    prompt: string,
    options?: Partial<StableDiffusionRequestOptions>
  ): Promise<StableDiffusionGenerationResult> {
  const inpaintOptions: StableDiffusionRequestOptions = {,
  prompt,
  init_image: initImage,
  mask,
  denoising_strength: options?.denoising_strength || 1.0,
  inpaint_full_res: options?.inpaint_full_res || false,
  ...options
};
    return this.process(prompt, inpaintOptions);
  async upscale(image: string,)
    upscaler: string = 'ESRGAN_4x',
    scale: number = 2): Promise<StableDiffusionGenerationResult> {,
  if (this.config.apiType !== 'automatic1111') {
  throw new Error('Upscaling only supported with Automatic1111');
  const payload = {
  resize_mode: 0,
  show_extras_results: true,
  gfpgan_visibility: 0,
  codeformer_visibility: 0,
  codeformer_weight: 0,
  upscaling_resize: scale,
  upscaling_resize_w: 0,
  upscaling_resize_h: 0,
  upscaling_crop: false,
  upscaler_1: upscaler,
  upscaler_2: 'None',
  extras_upscaler_2_visibility: 0,
  upscale_first: false,
  image: image,
};
    const response = await this._makeRequest('/sdapi/v1/extra-single-image', 'POST', payload);
    return {
      images: [{,
  base64: response.image,
        seed: 0,
        metadata: {,
  model: upscaler,
          sampler: 'upscale',
          steps: 0,
          cfg_scale: 0,
          size: `${scale}x upscaled`}
      }],
      originalPrompt: 'Upscale',
      parameters: payload,
      generationTime: 0,
      usage: {,
  computeUnits: scale * 10,
  estimatedCost: 0.01 * scale,
};
  // Static helper methods
  static getEstimatedCost(apiType: string): number {
  const costs: Record<string, number> = {,
  'automatic1111': 0.01, // Local hosting cost,
  'comfyui': 0.01,
  'stability-ai': 0.04,
  'replicate': 0.02,
  'custom': 0.02,
};
    return costs[apiType] || 0.02;
  static getEstimatedLatency(apiType: string): number {
  const latencies: Record<string, number> = {,
  'automatic1111': 15000, // 15 seconds for local,
  'comfyui': 12000,
  'stability-ai': 8000,
  'replicate': 10000,
  'custom': 12000,
};
    return latencies[apiType] || 15000;
  // Private helper methods
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
      const response = await fetch(`${this.config.endpoint}${testEndpoint}`, {)}
  },
  headers: this._buildHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000);
  });
      if (!response.ok && response.status !== 405) { // 405 Method Not Allowed is OK for some endpoints
        throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);}
    } catch (error) {
      throw new Error(`Failed to connect to Stable Diffusion API: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  private _buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {,
  'Content-Type': 'application/json',
};
    if (this.config.apiKey) {
      if (this.config.apiType === 'stability-ai') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;}
      } else {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;}
    return headers;
  private async _makeRequest(endpoint: string, method: 'GET' | 'POST' = 'POST', payload?: any): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`;}
    const options: RequestInit = {
  method,
  headers: this._buildHeaders(),
  signal: AbortSignal.timeout(this.config.timeout || 120000),
};
    if (method === 'POST' && payload) {
      options.body = JSON.stringify(payload);
    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 3;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Stable Diffusion API request failed: ${response.status} ${response.statusText} - ${errorText}`);}
        return response.json();
      } catch (error) {
  lastError = error instanceof Error ? error : new Error('Unknown error');
  if (attempt < maxRetries) {
  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  throw lastError || new Error('All retry attempts failed');
  private async _loadAvailableModels(): Promise<void> {,
  try {
  if (this.config.apiType === 'automatic1111') {
  const response = await this._makeRequest('/sdapi/v1/sd-models', 'GET');
  this.availableModels = response.map((model: any) => ({,)
  name: model.title,
  filename: model.filename,
  type: 'checkpoint' as const,
  description: model.model_name,
}));
      } else if (this.config.apiType === 'stability-ai') {
        // Stability AI has predefined models
        this.availableModels = [
          { name: 'stable-diffusion-xl-1024-v1-0', filename: 'sdxl', type: 'checkpoint' },
          { name: 'stable-diffusion-v1-6', filename: 'sd-1.6', type: 'checkpoint' }
        ];
    } catch (error) {
  console.warn('Failed to load available models:', error);
  private async _loadAvailableSamplers(): Promise<void> {,
  try {
  if (this.config.apiType === 'automatic1111') {
  const response = await this._makeRequest('/sdapi/v1/samplers', 'GET');
  this.availableSamplers = response.map((sampler: any) => sampler.name);
} else {
        // Default samplers for other API types
        this.availableSamplers = [
          'Euler a', 'Euler', 'LMS', 'Heun', 'DPM2', 'DPM2 a',
          'DPM++ 2S a', 'DPM++ 2M', 'DPM++ SDE', 'DPM fast',
          'DPM adaptive', 'LMS Karras', 'DPM2 Karras', 'DPM2 a Karras',
          'DPM++ 2S a Karras', 'DPM++ 2M Karras', 'DPM++ SDE Karras'
        ];
    } catch (error) {
  console.warn('Failed to load available samplers:', error);
  this.availableSamplers = ['Euler a', 'DPM++ 2M Karras'];
  private _extractPrompt(input: any): string {,
  if (typeof input === 'string') {
  return input;
  if (input && typeof input === 'object') {
  if (input.prompt) return input.prompt;
  if (input.description) return input.description;
  if (input.text) return input.text;
  return JSON.stringify(input);
  private _processOptions(options?: StableDiffusionRequestOptions, prompt?: string): StableDiffusionRequestOptions {,
  const defaultOptions: StableDiffusionRequestOptions = {,
  prompt: prompt || '',
  steps: 20,
  cfg_scale: 7,
  width: 512,
  height: 512,
  batch_size: 1,
  n_iter: 1,
  sampler_name: this.availableSamplers[0] || 'Euler a',
  seed: -1 // Random seed,
};
    return { ...defaultOptions, ...options };
  private async _generateImages(options: StableDiffusionRequestOptions): Promise<StableDiffusionResponse> {
  let endpoint: string;
  let payload: any;
  switch (this.config.apiType) {
  case 'automatic1111':,
  endpoint = options.init_image ? '/sdapi/v1/img2img' : '/sdapi/v1/txt2img';
  payload = this._buildAutomatic1111Payload(options);
  break;
  case 'stability-ai':,
  endpoint = '/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
  payload = this._buildStabilityAIPayload(options);
  break;
  default:,
  endpoint = '/generate';
  payload = this._buildGenericPayload(options);
  return this._makeRequest(endpoint, 'POST', payload);
  private _buildAutomatic1111Payload(options: StableDiffusionRequestOptions): any {,
  const payload: any = {,
  prompt: options.prompt,
  negative_prompt: options.negative_prompt || '',
  steps: options.steps,
  cfg_scale: options.cfg_scale,
  width: options.width,
  height: options.height,
  batch_size: options.batch_size,
  n_iter: options.n_iter,
  sampler_name: options.sampler_name,
  seed: options.seed,
  restore_faces: options.restore_faces || false,
  tiling: options.tiling || false,
  enable_hr: options.enable_hr || false,
};
    if (options.init_image) {
  payload.init_images = [options.init_image];
  payload.denoising_strength = options.denoising_strength || 0.75;
  if (options.mask) {
  payload.mask = options.mask;
  payload.inpaint_full_res = options.inpaint_full_res || false;
  if (options.enable_hr) {
  payload.hr_scale = options.hr_scale || 2;
  payload.hr_upscaler = options.hr_upscaler || 'Latent';
  payload.hr_second_pass_steps = options.hr_second_pass_steps || 0;
  return payload;
  private _buildStabilityAIPayload(options: StableDiffusionRequestOptions): any {,
  return {
  text_prompts: [,
  {
  text: options.prompt,
  weight: 1,
}
        ...(options.negative_prompt ? [{)
  text: options.negative_prompt,
  weight: -1,
}] : [])
      ],
      cfg_scale: options.cfg_scale,
      height: options.height,
      width: options.width,
      samples: options.batch_size,
      steps: options.steps,
      seed: options.seed && options.seed >= 0 ? options.seed : undefined;
  };
  private _buildGenericPayload(options: StableDiffusionRequestOptions): any {
  return {
  prompt: options.prompt,
  negative_prompt: options.negative_prompt,
  width: options.width,
  height: options.height,
  steps: options.steps,
  cfg_scale: options.cfg_scale,
  seed: options.seed,
  batch_size: options.batch_size,
};
  private _processGenerationResponse(response: StableDiffusionResponse,)
    prompt: string,
    options: StableDiffusionRequestOptions,
    generationTime: number): StableDiffusionGenerationResult {,
    const images = response.images.map((base64, index) => ({)
  base64,
      seed: this._extractSeedFromResponse(response, index),
      metadata: {,
  model: this.config.defaultModel || 'stable-diffusion',
        sampler: options.sampler_name || 'Unknown',
        steps: options.steps || 20,
        cfg_scale: options.cfg_scale || 7,
        size: `${options.width}x${options.height}`}
    }));
    const computeUnits = (options.steps || 20) * (options.batch_size || 1) * (options.n_iter || 1);
    return {
  images,
  originalPrompt: prompt,
  negativePrompt: options.negative_prompt,
  parameters: response.parameters || options,
  generationTime,
  usage: {,
  computeUnits,
  estimatedCost: (computeUnits / 100) * (this._metadata.costPerRequest || 0.01),
};
  private _extractSeedFromResponse(response: StableDiffusionResponse, index: number): number {
    // Try to extract seed from response info
    try {
      if (response.info) {
        const info = JSON.parse(response.info);
        return info.seed || info.all_seeds?.[index] || -1;
    } catch {
      // Fallback to random seed
    return Math.floor(Math.random() * 2147483647);
  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();

export default StableDiffusionAdapter;