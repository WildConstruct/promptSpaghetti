/**
 * RunwayML Video Generation Adapter
 * Epic 35.1.4 - Video Generation Integration
 * 
 * Adapter for RunwayML Gen-2 and Gen-3 video generation models
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

}
export interface RunwayMLConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}
}
}
export interface RunwayMLRequestOptions {
  // Core parameters
  text_prompt: string;
  image_prompt?: string; // Base64 encoded image,
  // Generation parameters
  model?: 'gen2' | 'gen3' | 'gen3-turbo';
  duration?: number; // Duration in seconds (4, 10, or 16),
  resolution?: '1280x768' | '768x1280' | '1024x576' | '576x1024' | '960x640' | '640x960';
  motion?: number; // Motion intensity (1-10),
  // Advanced options
  seed?: number;
  interpolate?: boolean;
  upscale?: boolean;
  watermark?: boolean;
  // Generation modes
  mode?: 'text_to_video' | 'image_to_video' | 'video_to_video';
  // Video-to-video specific
  init_video?: string; // Base64 encoded video for video-to-video,
  motion_vector?: string; // Motion guidance,
  // Style and control
  style_preset?: 'cinematic' | 'anime' | 'photorealistic' | 'abstract' | 'documentary';
  camera_motion?: 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'dolly_forward' | 'dolly_backward';
  // Post-processing
  enhance_prompt?: boolean;
  negative_prompt?: string;
}
}
}
export interface RunwayMLGenerationResult {
  video: {
  url?: string;
  data?: ArrayBuffer;
  format: string;
  duration: number;
  resolution: {
  width: number;
  height: number;
}
};
    fps: number;
  size: number;
  };
  metadata: {
  model: string;
  prompt: string;
  negative_prompt?: string;
  generation_id: string;
  seed?: number;
  motion: number;
  camera_motion?: string;
  style_preset?: string;
  generation_time: number;
  status: 'completed' | 'processing' | 'failed'
  };
  usage: {
  credits_consumed: number;
  cost: number;
  processing_time: number;
};
}
}
export interface RunwayMLTask {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  progress?: number;
  failure_code?: string;
  failure_reason?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  output?: string;
}
}
export class RunwayMLAdapter extends BaseAIModel {
  private config: RunwayMLConfig;
  private availableModels: string = ['gen2', 'gen3', 'gen3-turbo'];
  constructor(id: string, config: RunwayMLConfig) {,
  const metadata: ModelMetadata = {,
  name: 'gen3',
  version: '3.0',
  description: 'RunwayML video generation with text-to-video and image-to-video capabilities',
  provider: AIModelProvider.RUNWAYML,
  type: AIModelType.VIDEO,
  costPerRequest: 10, // Credits per generation (varies by model),
  averageLatency: 120000, // 2 minutes average,
  maxConcurrency: 3,
  rateLimit: {
  requestsPerMinute: 10,
  tokensPerMinute: 5000,
},
  tags: ['video-generation', 'text-to-video', 'image-to-video', 'ai-video'],
      lastUpdated: new Date();
  };
    const capabilities: ModelCapabilities = {,
  inputTypes: ['text', 'image', 'video'],
      outputTypes: ['video', 'mp4'],
      maxInputSize: 5000, // Characters for prompt
      maxOutputSize: 16, // Seconds of video
      supportsBatch: false,
      supportsStreaming: false,
      supportsAsync: true,
      customParameters: {
  duration: { type: 'number', options: [4, 10, 16], default: 4 },
        motion: { type: 'number', min: 1, max: 10, default: 5 },
        resolution: {
  type: 'string',
  options: ['1280x768', '768x1280', '1024x576', '576x1024', '960x640', '640x960'],
  default: '1280x768',
},
  model: {
  type: 'string',
  options: ['gen2', 'gen3', 'gen3-turbo'],
  default: 'gen3',
},
  style_preset: {
  type: 'string',
  options: ['cinematic', 'anime', 'photorealistic', 'abstract', 'documentary'],
  default: 'cinematic',
};
    super(id, metadata, capabilities);
    this.config = config;
  async initialize(): Promise<void> {

    try {
      this._status = AIModelStatus.INITIALIZING;
      if (!this.config.apiKey) {
        throw new Error('RunwayML API key is required');
      // Test API connection
      await this._testConnection();
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
  this._status = AIModelStatus.ERROR;
  throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async process(input: any, options?: RunwayMLRequestOptions): Promise<RunwayMLGenerationResult> {,
  try {
  if (this._status !== AIModelStatus.READY) {
  throw new ModelUnavailableError(this._id);
  const startTime = Date.now();
  // Extract and validate prompt
  const prompt = this._extractPrompt(input);
  if (!prompt) {
  throw new Error('Text prompt is required for video generation');
  // Process options with defaults
  const processedOptions = this._processOptions(options, prompt);
  // Create generation task
  const task = await this._createGenerationTask(prompt, processedOptions);
  // Poll for completion
  const completedTask = await this._pollTaskCompletion(task.id);
  const generationTime = Date.now() - startTime;
  // Process results
  const result = await this._processGenerationResult(completedTask, prompt, processedOptions, generationTime);
  this._lastActivity = new Date();
  return result;
} catch (error) {
  throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async cleanup(): Promise<void> {,
  this._status = AIModelStatus.OFFLINE;
  this._activeRequests.clear();
  this._requestQueue = [];
  async estimate(input: any, options?: RunwayMLRequestOptions): Promise<CostEstimate> {,
  const prompt = this._extractPrompt(input);
  const duration = options?.duration || 4;
  const model = options?.model || 'gen3';
  const credits = this._calculateCredits(model, duration);
  const estimatedCost = credits * 0.005; // Approximate $0.005 per credit;
  return {
  estimatedCost,
  currency: 'USD',
  confidence: 0.8,
  breakdown: {
  inputCost: 0,
  outputCost: estimatedCost,
  processingCost: 0,
};
  // RunwayML-specific methods
  async generateTextToVideo(prompt: string)
    duration: number = 4,
    options?: Partial<RunwayMLRequestOptions>
  ): Promise<RunwayMLGenerationResult> {

  const runwayOptions: RunwayMLRequestOptions = {,
  text_prompt: prompt,
  duration,
  mode: 'text_to_video',
  ...options
};
    return this.process(prompt, runwayOptions);
  async generateImageToVideo(prompt: string)
    imageData: string,
    duration: number = 4,
    options?: Partial<RunwayMLRequestOptions>
  ): Promise<RunwayMLGenerationResult> {

  const runwayOptions: RunwayMLRequestOptions = {,
  text_prompt: prompt,
  image_prompt: imageData,
  duration,
  mode: 'image_to_video',
  ...options
};
    return this.process(prompt, runwayOptions);
  async generateVideoToVideo(prompt: string)
    videoData: string,
    options?: Partial<RunwayMLRequestOptions>
  ): Promise<RunwayMLGenerationResult> {

  const runwayOptions: RunwayMLRequestOptions = {,
  text_prompt: prompt,
  init_video: videoData,
  mode: 'video_to_video',
  ...options
};
    return this.process(prompt, runwayOptions);
  async getTaskStatus(taskId: string): Promise<RunwayMLTask> {

    const response = await this._makeRequest(`/v1/tasks/${taskId}`, 'GET');}
    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.status} ${response.statusText}`);}
    return response.json();
  async cancelTask(taskId: string): Promise<void> {

    const response = await this._makeRequest(`/v1/tasks/${taskId}/cancel`, 'POST');}
    if (!response.ok) {
      throw new Error(`Failed to cancel task: ${response.status} ${response.statusText}`);}
  async getAvailableModels(): Promise<string> {

    return [...this.availableModels];
  // Static helper methods
  static getModelCredits(model: string, duration: number): number {
    const creditRates: Record<string, Record<number, number>> = {
      'gen2': { 4: 5, 10: 10, 16: 15 },
      'gen3': { 4: 10, 10: 25, 16: 40 },
      'gen3-turbo': { 4: 5, 10: 12, 16: 20 }
    };
    return creditRates[model]?.[duration] || 10;
  static getSupportedResolutions(): string {
    return ['1280x768', '768x1280', '1024x576', '576x1024', '960x640', '640x960'];
  static getSupportedDurations(): number {
    return [4, 10, 16];
  // Private helper methods
  private async _testConnection(): Promise<void> {

    try {
      const response = await this._makeRequest('/v1/account', 'GET');
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`RunwayML API test failed: ${response.status} ${response.statusText} - ${errorData?.error || 'Unknown error'}`);}
      const accountData = await response.json();
      console.log('RunwayML connection successful:', accountData.credits_remaining || 'unknown credits');
    } catch (error) {
      throw new Error(`Failed to connect to RunwayML API: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  private _extractPrompt(input: any): string {
    if (typeof input === 'string') {
      return input;
    if (input && typeof input === 'object') {
      if (input.prompt) return input.prompt;
      if (input.text_prompt) return input.text_prompt;
      if (input.description) return input.description;
      if (input.text) return input.text;
    return JSON.stringify(input);
  private _processOptions(options?: RunwayMLRequestOptions)
    prompt?: string
  ): Required<Pick<RunwayMLRequestOptions, 'model' | 'duration' | 'resolution' | 'motion' | 'mode' | 'text_prompt'>> & Omit<RunwayMLRequestOptions, 'text_prompt'> & { text_prompt: string } {
  const defaults = {
  model: 'gen3' as const,
  duration: 4,
  resolution: '1280x768' as const,
  motion: 5,
  mode: 'text_to_video' as const,
  watermark: true,
  enhance_prompt: true,
};
    const processed = { ...defaults, ...options };
    // Set text_prompt if provided, or ensure it exists
    processed.text_prompt = prompt || processed.text_prompt || ''; // Ensure text_prompt is always a string
    // Validate model
    if (!this.availableModels.includes(processed.model)) {
      processed.model = 'gen3';
    // Validate duration
    const validDurations = [4, 10, 16];
    if (!validDurations.includes(processed.duration)) {
      processed.duration = 4;
    // Validate motion
    processed.motion = Math.max(1, Math.min(10, processed.motion));
    // Validate resolution
    const validResolutions = RunwayMLAdapter.getSupportedResolutions();
    if (!validResolutions.includes(processed.resolution)) {
      processed.resolution = '1280x768';
    return processed as Required<Pick<RunwayMLRequestOptions, 'model' | 'duration' | 'resolution' | 'motion' | 'mode' | 'text_prompt'>> & Omit<RunwayMLRequestOptions, 'text_prompt'> & { text_prompt: string };
  private async _createGenerationTask(prompt: string, options: RunwayMLRequestOptions): Promise<RunwayMLTask> {

    const payload = {
      taskType: 'gen2' === options.model ? 'gen2' : 'gen3',
      internal: false,
      options: {
  text_prompt: prompt,
        duration: options.duration,
        resolution: options.resolution,
        motion: options.motion,
        seed: options.seed,
        watermark: options.watermark,
        enhance_prompt: options.enhance_prompt,
        model_version: options.model,
        ...(options.image_prompt && { image_prompt: options.image_prompt }),
        ...(options.init_video && { init_video: options.init_video }),
        ...(options.negative_prompt && { negative_prompt: options.negative_prompt }),
        ...(options.style_preset && { style_preset: options.style_preset }),
        ...(options.camera_motion && { camera_motion: options.camera_motion })
    };
    const response = await this._makeRequest('/v1/tasks', 'POST', payload);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to create generation task: ${response.status} ${response.statusText} - ${errorData?.error || 'Unknown error'}`);}
    return response.json();
  private async _pollTaskCompletion(taskId: string): Promise<RunwayMLTask> {

    const maxPollTime = this.config.timeout || 600000; // 10 minutes default;
    const pollInterval = 5000; // 5 seconds;
    const startTime = Date.now();
    while (Date.now() - startTime < maxPollTime) {
      const task = await this.getTaskStatus(taskId);
      if (task.status === 'SUCCEEDED') {
        return task;
      if (task.status === 'FAILED') {
        throw new Error(`Video generation failed: ${task.failure_reason || 'Unknown error'}`);}
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    throw new Error('Video generation timed out');
  private async _processGenerationResult(task: RunwayMLTask)
    prompt: string,
    options: RunwayMLRequestOptions,
    generationTime: number): Promise<RunwayMLGenerationResult> {,
  if (!task.output || task.output.length === 0) {
  throw new Error('No video output received from generation task');
  const videoUrl = task.output[0];
  const [width, height] = (options.resolution || '1280x768').split('x').map(Number);
  // Download video data if needed
  let videoData: ArrayBuffer | undefined;
  try {
  const videoResponse = await fetch(videoUrl);
  if (videoResponse.ok) {
  videoData = await videoResponse.arrayBuffer();
} catch (error) {
      console.warn('Failed to download video data:', error);
    const credits = this._calculateCredits(options.model || 'gen3', options.duration || 4);
    return {
      video: {
  url: videoUrl,
        data: videoData,
        format: 'mp4',
        duration: options.duration || 4,
        resolution: { width, height },
        fps: 24, // Standard FPS for RunwayML
        size: videoData?.byteLength || 0;
  },
  metadata: {
  model: options.model || 'gen3',
  prompt,
  negative_prompt: options.negative_prompt,
  generation_id: task.id,
  seed: options.seed,
  motion: options.motion || 5,
  camera_motion: options.camera_motion,
  style_preset: options.style_preset,
  generation_time: generationTime,
  status: 'completed',
},
  usage: {
  credits_consumed: credits,
  cost: credits * 0.005,
  processing_time: generationTime,
};
  private async _makeRequest(endpoint: string, )
    method: 'GET' | 'POST' = 'GET', 
    payload?: any
  ): Promise<Response> {

    const url = `${this.config.baseURL || 'https://api.runwayml.com'}${endpoint}`;}
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`}
}
      'Content-Type': 'application/json'
    };
    const options: RequestInit = {
  method,
  headers,
  signal: AbortSignal.timeout(this.config.timeout || 60000),
};
    if (method === 'POST' && payload) {
  options.body = JSON.stringify(payload);
  let lastError: Error | null = null;
  const maxRetries = this.config.maxRetries ?? 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
  return await fetch(url, options);
} catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    throw lastError || new Error('All retry attempts failed');
  private _calculateCredits(model: string, duration: number): number {
    return RunwayMLAdapter.getModelCredits(model, duration);
  protected async _performHealthCheck(): Promise<void> {

    await this._testConnection();

export default RunwayMLAdapter;