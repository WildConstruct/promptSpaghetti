/**
 * Multimodal AI Adapter
 * Epic 35.1.5 - Cross-Modal Intelligence
 * 
 * Unified adapter for multimodal AI models that can process and understand multiple content types
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

export interface MultimodalConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface MultimodalInput {
  type: 'text' | 'image' | 'audio' | 'video';
  content: string | ArrayBuffer | File | Blob;
  metadata?: {
    role?: 'user' | 'assistant' | 'system';
    mime_type?: string;
    duration?: number;
    resolution?: { width: number; height: number };
    description?: string;
  };
}

export interface MultimodalRequestOptions {
  // Core parameters
  inputs: MultimodalInput[];
  task?: 'understand' | 'describe' | 'analyze' | 'transform' | 'generate' | 'compare' | 'summarize';
  
  // Generation parameters
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  
  // Multimodal specific
  vision_detail?: 'low' | 'high' | 'auto';
  audio_format?: 'transcript' | 'description' | 'analysis';
  video_sampling?: 'uniform' | 'keyframes' | 'motion_based';
  frames_per_second?: number;
  
  // Cross-modal options
  cross_reference?: boolean; // Reference between modalities
  context_fusion?: boolean; // Fuse context across inputs
  output_modality?: 'text' | 'structured' | 'multimodal';
  
  // Analysis options
  extract_entities?: boolean;
  detect_emotions?: boolean;
  identify_objects?: boolean;
  transcribe_speech?: boolean;
  analyze_sentiment?: boolean;
}

export interface MultimodalAnalysis {
  content_type: string;
  confidence: number;
  detected_elements: Array<{
    type: 'text' | 'object' | 'person' | 'scene' | 'emotion' | 'concept';
    value: string;
    confidence: number;
    bounding_box?: { x: number; y: number; width: number; height: number };
    timestamp?: { start: number; end: number };
  }>;
  relationships: Array<{
    source: string;
    target: string;
    relationship: string;
    confidence: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface MultimodalUnderstandingResult {
  understanding: {
    summary: string;
    key_insights: string[];
    content_analysis: MultimodalAnalysis[];
    cross_modal_connections: Array<{
      modalities: string[];
      connection_type: 'temporal' | 'semantic' | 'causal' | 'spatial';
      description: string;
      confidence: number;
    }>;
  };
  extracted_data: {
    text_content?: string[];
    transcriptions?: Array<{ text: string; language: string; confidence: number }>;
    visual_descriptions?: string[];
    audio_descriptions?: string[];
    entities?: Array<{ name: string; type: string; confidence: number }>;
    emotions?: Array<{ emotion: string; intensity: number; source: string }>;
    topics?: Array<{ topic: string; relevance: number }>;
  };
  metadata: {
    model: string;
    processing_time: number;
    input_count: number;
    modalities_processed: string[];
    total_tokens: number;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_cost: number;
    processing_cost: number;
  };
}

export class MultimodalAdapter extends BaseAIModel {
  private config: MultimodalConfig;
  private supportedModalities = ['text', 'image', 'audio', 'video'];

  constructor(id: string, config: MultimodalConfig) {
    const metadata: ModelMetadata = {
      name: config.model || 'gpt-4-vision-preview',
      version: '1.0',
      description: 'Multimodal AI model for cross-modal understanding and analysis',
      provider: MultimodalAdapter._getProviderEnumStatic(config.provider),
      type: AIModelType.MULTIMODAL,
      costPerRequest: MultimodalAdapter._getProviderCostsStatic(config.provider),
      averageLatency: 8000,
      maxConcurrency: 5,
      rateLimit: {
        requestsPerMinute: 30,
        tokensPerMinute: 40000
      },
      tags: ['multimodal', 'vision', 'audio', 'cross-modal', 'understanding'],
      lastUpdated: new Date()
    };

    const capabilities: ModelCapabilities = {
      inputTypes: ['text', 'image', 'audio', 'video', 'multimodal'],
      outputTypes: ['text', 'json', 'structured'],
      maxInputSize: 20 * 1024 * 1024, // 20MB total input
      maxOutputSize: 16384, // Max output tokens
      supportsBatch: true,
      supportsStreaming: true,
      supportsAsync: true,
      customParameters: {
        task: {
          type: 'string',
          options: ['understand', 'describe', 'analyze', 'transform', 'generate', 'compare', 'summarize'],
          default: 'understand'
        },
        vision_detail: {
          type: 'string',
          options: ['low', 'high', 'auto'],
          default: 'auto'
        },
        cross_reference: { type: 'boolean', default: true },
        context_fusion: { type: 'boolean', default: true },
        max_tokens: { type: 'number', min: 1, max: 16384, default: 4096 }
      }
    };

    super(id, metadata, capabilities);
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      
      if (!this.config.apiKey) {
        throw new Error('API key is required for multimodal processing');
      }

      // Test the API connection
      await this._testConnection();
      
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
      this._status = AIModelStatus.ERROR;
      throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async process(input: MultimodalInput[], options?: MultimodalRequestOptions): Promise<MultimodalUnderstandingResult> {
    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      }

      const startTime = Date.now();
      
      // Extract and validate multimodal inputs
      const inputs = this._extractMultimodalInputs(input);
      if (!inputs || inputs.length === 0) {
        throw new Error('At least one input is required for multimodal processing');
      }

      // Validate inputs
      await this._validateInputs(inputs);
      
      // Process options with defaults
      const processedOptions = this._processOptions(options);
      
      // Process multimodal content
      const result = await this._processMultimodalContent(inputs, processedOptions);
      const processingTime = Date.now() - startTime;
      
      // Enhance result with metadata
      result.metadata.processing_time = processingTime;
      result.metadata.input_count = inputs.length;
      result.metadata.modalities_processed = [...new Set(inputs.map(i => i.type))];
      
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

  async estimate(input: MultimodalInput[], options?: MultimodalRequestOptions): Promise<CostEstimate> {
    const inputs = this._extractMultimodalInputs(input);
    const inputTokens = await this._estimateInputTokens(inputs || []);
    const outputTokens = options?.max_tokens || 1000;
    
    const estimatedCost = this._calculateCost(inputTokens, outputTokens);
    
    return {
      estimatedCost,
      currency: 'USD',
      confidence: 0.85,
      breakdown: {
        inputCost: inputTokens * this._getInputTokenCost(),
        outputCost: outputTokens * this._getOutputTokenCost(),
        processingCost: 0
      }
    };
  }

  // Multimodal-specific methods
  async understandContent(
    inputs: MultimodalInput[],
    options?: Partial<MultimodalRequestOptions>
  ): Promise<MultimodalUnderstandingResult> {
    const multimodalOptions: MultimodalRequestOptions = {
      inputs,
      task: 'understand',
      cross_reference: true,
      context_fusion: true,
      extract_entities: true,
      detect_emotions: true,
      analyze_sentiment: true,
      ...options
    };

    return this.process(inputs, multimodalOptions);
  }

  async compareContent(
    inputs: MultimodalInput[],
    comparisonAspects: string[] = ['content', 'style', 'emotion', 'quality'],
    options?: Partial<MultimodalRequestOptions>
  ): Promise<MultimodalUnderstandingResult> {
    const multimodalOptions: MultimodalRequestOptions = {
      inputs,
      task: 'compare',
      cross_reference: true,
      context_fusion: true,
      output_modality: 'structured',
      ...options
    };

    return this.process(inputs, multimodalOptions);
  }

  async describeMultimodal(
    inputs: MultimodalInput[],
    detailLevel: 'brief' | 'detailed' | 'comprehensive' = 'detailed',
    options?: Partial<MultimodalRequestOptions>
  ): Promise<MultimodalUnderstandingResult> {
    const multimodalOptions: MultimodalRequestOptions = {
      inputs,
      task: 'describe',
      vision_detail: detailLevel === 'comprehensive' ? 'high' : 'auto',
      cross_reference: true,
      identify_objects: true,
      transcribe_speech: true,
      ...options
    };

    return this.process(inputs, multimodalOptions);
  }

  async analyzeContent(
    inputs: MultimodalInput[],
    analysisTypes: string[] = ['entities', 'emotions', 'sentiment', 'topics'],
    options?: Partial<MultimodalRequestOptions>
  ): Promise<MultimodalUnderstandingResult> {
    const multimodalOptions: MultimodalRequestOptions = {
      inputs,
      task: 'analyze',
      extract_entities: analysisTypes.includes('entities'),
      detect_emotions: analysisTypes.includes('emotions'),
      analyze_sentiment: analysisTypes.includes('sentiment'),
      cross_reference: true,
      context_fusion: true,
      output_modality: 'structured',
      ...options
    };

    return this.process(inputs, multimodalOptions);
  }

  async summarizeMultimodal(
    inputs: MultimodalInput[],
    summaryLength: 'short' | 'medium' | 'long' = 'medium',
    options?: Partial<MultimodalRequestOptions>
  ): Promise<MultimodalUnderstandingResult> {
    const tokenLimits = { short: 150, medium: 500, long: 1000 };
    
    const multimodalOptions: MultimodalRequestOptions = {
      inputs,
      task: 'summarize',
      max_tokens: tokenLimits[summaryLength],
      cross_reference: true,
      context_fusion: true,
      ...options
    };

    return this.process(inputs, multimodalOptions);
  }

  async extractInformation(
    inputs: MultimodalInput[],
    extractionTargets: string[] = ['text', 'entities', 'objects', 'emotions'],
    options?: Partial<MultimodalRequestOptions>
  ): Promise<Record<string, unknown>> {
    const result = await this.analyzeContent(inputs, extractionTargets, options);
    
    return {
      text_content: result.extracted_data.text_content || [],
      transcriptions: result.extracted_data.transcriptions || [],
      entities: result.extracted_data.entities || [],
      emotions: result.extracted_data.emotions || [],
      topics: result.extracted_data.topics || [],
      visual_descriptions: result.extracted_data.visual_descriptions || [],
      audio_descriptions: result.extracted_data.audio_descriptions || []
    };
  }

  // Static helper methods
  static getSupportedModalities(): string[] {
    return ['text', 'image', 'audio', 'video'];
  }

  static getTaskTypes(): string[] {
    return ['understand', 'describe', 'analyze', 'transform', 'generate', 'compare', 'summarize'];
  }

  static createTextInput(content: string, role: 'user' | 'assistant' | 'system' = 'user'): MultimodalInput {
    return {
      type: 'text',
      content,
      metadata: { role }
    };
  }

  static createImageInput(imageData: string | File | Blob, description?: string): MultimodalInput {
    return {
      type: 'image',
      content: imageData,
      metadata: {
        mime_type: typeof imageData === 'string' ? 'image/base64' : (imageData as File).type,
        description
      }
    };
  }

  static createAudioInput(audioData: File | Blob | ArrayBuffer, description?: string): MultimodalInput {
    return {
      type: 'audio',
      content: audioData,
      metadata: {
        mime_type: audioData instanceof File ? audioData.type : 'audio/wav',
        description
      }
    };
  }

  static createVideoInput(videoData: File | Blob | ArrayBuffer, description?: string): MultimodalInput {
    return {
      type: 'video',
      content: videoData,
      metadata: {
        mime_type: videoData instanceof File ? videoData.type : 'video/mp4',
        description
      }
    };
  }

  // Private helper methods
  private _getProviderEnum(provider: string): AIModelProvider {
    return MultimodalAdapter._getProviderEnumStatic(provider);
  }

  private _getProviderCosts(provider: string): number {
    return MultimodalAdapter._getProviderCostsStatic(provider);
  }

  private static _getProviderEnumStatic(provider: string): AIModelProvider {
    const providerMap: Record<string, AIModelProvider> = {
      'openai': AIModelProvider.OPENAI,
      'anthropic': AIModelProvider.ANTHROPIC,
      'google': AIModelProvider.CUSTOM, // Gemini
      'custom': AIModelProvider.CUSTOM
    };
    return providerMap[provider] || AIModelProvider.CUSTOM;
  }

  private static _getProviderCostsStatic(provider: string): number {
    const costs: Record<string, number> = {
      'openai': 0.01, // GPT-4V pricing
      'anthropic': 0.015, // Claude 3 pricing
      'google': 0.0025, // Gemini Pro Vision
      'custom': 0.01
    };
    return costs[provider] || 0.01;
  }

  private async _testConnection(): Promise<void> {
    try {
      // Create a minimal test request based on provider
      const testInput = MultimodalAdapter.createTextInput('Test connection');
      
      let endpoint = '/v1/chat/completions';
      const payload = this._buildProviderPayload([testInput], {
        task: 'understand',
        max_tokens: 10
      });

      if (this.config.provider === 'anthropic') {
        endpoint = '/v1/messages';
      } else if (this.config.provider === 'google') {
        endpoint = '/v1/models/gemini-pro-vision:generateContent';
      }

      const response = await fetch(`${this.config.baseURL || this._getDefaultBaseURL()}${endpoint}`, {
        method: 'POST',
        headers: this._buildHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Multimodal API test failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      // Don't need to process the response, just verify the API works
      await response.json();
    } catch (error) {
      throw new Error(`Failed to connect to multimodal API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _getDefaultBaseURL(): string {
    const urls: Record<string, string> = {
      'openai': 'https://api.openai.com',
      'anthropic': 'https://api.anthropic.com',
      'google': 'https://generativelanguage.googleapis.com',
      'custom': ''
    };
    return urls[this.config.provider] || urls['openai'];
  }

  private _buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (this.config.provider) {
      case 'openai':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = this.config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'google':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      default:
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private _extractMultimodalInputs(input: MultimodalInput[] | unknown): MultimodalInput[] | null {
    if (Array.isArray(input)) {
      return input.filter(item => item && typeof item === 'object' && item.type && item.content);
    }
    
    if (input && typeof input === 'object') {
      const inputObj = input as any;
      if (inputObj.inputs && Array.isArray(inputObj.inputs)) {
        return inputObj.inputs;
      }
      
      if (inputObj.type && inputObj.content) {
        return [inputObj as MultimodalInput];
      }
    }
    
    if (typeof input === 'string') {
      return [MultimodalAdapter.createTextInput(input)];
    }
    
    return null;
  }

  private async _validateInputs(inputs: MultimodalInput[]): Promise<void> {
    for (const input of inputs) {
      if (!this.supportedModalities.includes(input.type)) {
        throw new Error(`Unsupported modality: ${input.type}`);
      }

      // Validate content based on type
      if (input.type === 'text') {
        if (typeof input.content !== 'string') {
          throw new Error('Text input content must be a string');
        }
      } else if (['image', 'audio', 'video'].includes(input.type)) {
        if (!(input.content instanceof File || input.content instanceof Blob || 
              input.content instanceof ArrayBuffer || typeof input.content === 'string')) {
          throw new Error(`${input.type} input content must be File, Blob, ArrayBuffer, or base64 string`);
        }
      }
    }

    // Validate total input size
    const totalSize = await this._calculateTotalInputSize(inputs);
    if (totalSize > (this._capabilities.maxInputSize || 20 * 1024 * 1024)) {
      throw new Error('Total input size exceeds maximum limit');
    }
  }

  private async _calculateTotalInputSize(inputs: MultimodalInput[]): Promise<number> {
    let totalSize = 0;
    
    for (const input of inputs) {
      if (typeof input.content === 'string') {
        totalSize += new Blob([input.content]).size;
      } else if (input.content instanceof ArrayBuffer) {
        totalSize += input.content.byteLength;
      } else if (input.content instanceof File || input.content instanceof Blob) {
        totalSize += input.content.size;
      }
    }
    
    return totalSize;
  }

  private _processOptions(options?: MultimodalRequestOptions): Required<Pick<MultimodalRequestOptions, 'task' | 'max_tokens' | 'cross_reference' | 'context_fusion' | 'vision_detail'>> & Omit<MultimodalRequestOptions, 'inputs'> {
    const defaults = {
      task: 'understand' as const,
      max_tokens: 4096,
      temperature: 0.1,
      cross_reference: true,
      context_fusion: true,
      vision_detail: 'auto' as const,
      output_modality: 'text' as const,
      extract_entities: false,
      detect_emotions: false,
      analyze_sentiment: false
    };

    return { ...defaults, ...options };
  }

  private async _processMultimodalContent(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Promise<MultimodalUnderstandingResult> {
    const payload = this._buildProviderPayload(inputs, options);
    const endpoint = this._getProviderEndpoint();
    
    const response = await this._makeRequest(endpoint, payload);
    
    return this._processProviderResponse(response, inputs, options);
  }

  private _buildProviderPayload(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Record<string, unknown> {
    switch (this.config.provider) {
      case 'openai':
        return this._buildOpenAIPayload(inputs, options);
      case 'anthropic':
        return this._buildAnthropicPayload(inputs, options);
      case 'google':
        return this._buildGooglePayload(inputs, options);
      default:
        return this._buildGenericPayload(inputs, options);
    }
  }

  private _buildOpenAIPayload(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Record<string, unknown> {
    const messages = inputs.map(input => {
      const role = input.metadata?.role || 'user';
      
      if (input.type === 'text') {
        return {
          role,
          content: input.content
        };
      } else if (input.type === 'image') {
        return {
          role,
          content: [
            {
              type: 'text',
              text: `Analyze this ${input.type}` + (input.metadata?.description ? `: ${input.metadata.description}` : '')
            },
            {
              type: 'image_url',
              image_url: {
                url: typeof input.content === 'string' ? input.content : 'data:image/jpeg;base64,placeholder',
                detail: options.vision_detail
              }
            }
          ]
        };
      } else {
        return {
          role,
          content: `Process this ${input.type} content` + (input.metadata?.description ? `: ${input.metadata.description}` : '')
        };
      }
    });

    return {
      model: this.config.model || 'gpt-4-vision-preview',
      messages,
      max_tokens: options.max_tokens,
      temperature: options.temperature
    };
  }

  private _buildAnthropicPayload(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Record<string, unknown> {
    // Anthropic Claude 3 format
    const content = inputs.map(input => {
      if (input.type === 'text') {
        return {
          type: 'text',
          text: input.content
        };
      } else if (input.type === 'image') {
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: typeof input.content === 'string' ? input.content.replace(
              /^data:image\/[^;]+;base64,
              /,
              ''
            ) : 'placeholder'
          }
        };
      } else {
        return {
          type: 'text',
          text: `Process this ${input.type} content` + (input.metadata?.description ? `: ${input.metadata.description}` : '')
        };
      }
    });

    return {
      model: this.config.model || 'claude-3-sonnet-20240229',
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      messages: [{
        role: 'user',
        content
      }]
    };
  }

  private _buildGooglePayload(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Record<string, unknown> {
    // Google Gemini format
    const parts = inputs.map(input => {
      if (input.type === 'text') {
        return { text: input.content };
      } else if (input.type === 'image') {
        return {
          inline_data: {
            mime_type: 'image/jpeg',
            data: typeof input.content === 'string' ? input.content.replace(
              /^data:image\/[^;]+;base64,
              /,
              ''
            ) : 'placeholder'
          }
        };
      } else {
        return { text: `Process this ${input.type} content` + (input.metadata?.description ? `: ${input.metadata.description}` : '') };
      }
    });

    return {
      contents: [{
        parts
      }],
      generationConfig: {
        maxOutputTokens: options.max_tokens,
        temperature: options.temperature
      }
    };
  }

  private _buildGenericPayload(
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): Record<string, unknown> {
    return {
      inputs: inputs.map(input => ({
        type: input.type,
        content: input.content,
        metadata: input.metadata
      })),
      options
    };
  }

  private _getProviderEndpoint(): string {
    const endpoints: Record<string, string> = {
      'openai': '/v1/chat/completions',
      'anthropic': '/v1/messages',
      'google': '/v1/models/gemini-pro-vision:generateContent',
      'custom': '/multimodal/process'
    };
    return endpoints[this.config.provider] || endpoints['openai'];
  }

  private async _makeRequest(endpoint: string, payload: any): Promise<any> {
    const url = `${this.config.baseURL || this._getDefaultBaseURL()}${endpoint}`;
    
    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: this._buildHeaders(),
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.config.timeout || 60000)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Multimodal API request failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
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

  private _processProviderResponse(
    response: any,
    inputs: MultimodalInput[],
    options: Omit<MultimodalRequestOptions,
    'inputs'>
  ): MultimodalUnderstandingResult {
    // Process response based on provider format
    let content = '';
    let totalTokens = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    switch (this.config.provider) {
      case 'openai':
        content = response.choices?.[0]?.message?.content || '';
        totalTokens = response.usage?.total_tokens || 0;
        inputTokens = response.usage?.prompt_tokens || 0;
        outputTokens = response.usage?.completion_tokens || 0;
        break;
      case 'anthropic':
        content = response.content?.[0]?.text || '';
        totalTokens = response.usage?.input_tokens + response.usage?.output_tokens || 0;
        inputTokens = response.usage?.input_tokens || 0;
        outputTokens = response.usage?.output_tokens || 0;
        break;
      case 'google':
        content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Google doesn't provide detailed token usage
        totalTokens = Math.ceil(content.length / 4); // Rough estimate
        break;
      default:
        content = response.content || response.text || '';
        totalTokens = response.tokens || 0;
    }

    // Parse the response to extract structured information
    const analysis = this._parseMultimodalResponse(content, inputs);
    
    return {
      understanding: {
        summary: analysis.summary,
        key_insights: analysis.insights,
        content_analysis: analysis.content_analysis,
        cross_modal_connections: analysis.connections
      },
      extracted_data: analysis.extracted_data,
      metadata: {
        model: this.config.model || 'multimodal',
        processing_time: 0, // Will be set by caller
        input_count: inputs.length,
        modalities_processed: [...new Set(inputs.map(i => i.type))],
        total_tokens: totalTokens
      },
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_cost: this._calculateCost(inputTokens, outputTokens),
        processing_cost: 0
      }
    };
  }

  private _parseMultimodalResponse(content: string, inputs: MultimodalInput[]): any {
    // Advanced parsing of multimodal response
    // This would typically use NLP techniques or structured prompting
    
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      summary: lines[0] || content.substring(0, 200),
      insights: this._extractInsights(content),
      content_analysis: inputs.map((input, index) => ({
        content_type: input.type,
        confidence: 0.85,
        detected_elements: this._extractElements(content, input.type),
        relationships: [],
        metadata: { input_index: index }
      })),
      connections: this._extractConnections(content, inputs),
      extracted_data: {
        text_content: this._extractTextContent(content),
        entities: this._extractEntities(content),
        emotions: this._extractEmotions(content),
        topics: this._extractTopics(content)
      }
    };
  }

  private _extractInsights(content: string): string[] {
    // Extract key insights from the content
    const insights: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for insight indicators
    const insightPatterns = [
      /key insight/i,
      /important/i,
      /notably/i,
      /significantly/i,
      /reveals/i,
      /suggests/i
    ];
    
    sentences.forEach(sentence => {
      if (insightPatterns.some(pattern => pattern.test(sentence))) {
        insights.push(sentence.trim());
      }
    });
    
    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private _extractElements(content: string, contentType: string): any[] {
    const elements: any[] = [];
    
    // Simple pattern-based extraction (would be enhanced with NLP)
    const patterns: Record<string, RegExp[]> = {
      'text': [/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g], // Proper nouns
      'image': [/\b(person|object|scene|building|animal|vehicle)\b/gi],
      'audio': [/\b(voice|music|sound|noise|speech)\b/gi],
      'video': [/\b(motion|action|scene|transition|frame)\b/gi]
    };
    
    const contentPatterns = patterns[contentType] || patterns['text'];
    
    contentPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        elements.push({
          type: 'concept',
          value: match[1] || match[0],
          confidence: 0.7,
          timestamp: contentType === 'audio' || contentType === 'video' ? { start: 0, end: 1 } : undefined
        });
      }
    });
    
    return elements.slice(0, 10); // Limit results
  }

  private _extractConnections(content: string, inputs: MultimodalInput[]): any[] {
    const connections: any[] = [];
    
    if (inputs.length > 1) {
      const modalities = [...new Set(inputs.map(i => i.type))];
      
      // Look for connection indicators in the content
      const connectionPatterns = [
        /connects?\s+to|relates?\s+to|corresponds?\s+to/i,
        /similar|different|contrasts?/i,
        /reinforces?|supports?|contradicts?/i
      ];
      
      if (connectionPatterns.some(pattern => pattern.test(content))) {
        connections.push({
          modalities,
          connection_type: 'semantic',
          description: 'Content elements show thematic connections',
          confidence: 0.75
        });
      }
    }
    
    return connections;
  }

  private _extractTextContent(content: string): string[] {
    return content.split('\n').filter(line => line.trim().length > 10);
  }

  private _extractEntities(content: string): any[] {
    const entities: any[] = [];
    
    // Simple entity extraction (would use NER in production)
    const patterns = {
      'PERSON': /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g,
      'ORGANIZATION': /\b[A-Z][A-Z\s]+(?:Inc|Corp|LLC|Ltd)\b/g,
      'LOCATION': /\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    };
    
    Object.entries(patterns).forEach(([type, pattern]) => {
      let match;
      while ((match = pattern.exec(content)) !== null && entities.length < 20) {
        entities.push({
          name: match[1] || match[0],
          type: type.toLowerCase(),
          confidence: 0.7
        });
      }
    });
    
    return entities;
  }

  private _extractEmotions(content: string): any[] {
    const emotions: any[] = [];
    const emotionWords: Record<string, number> = {
      'happy': 0.8, 'sad': 0.8, 'angry': 0.9, 'excited': 0.8,
      'calm': 0.6, 'nervous': 0.7, 'confident': 0.7, 'worried': 0.8,
      'joyful': 0.9, 'melancholy': 0.8, 'enthusiastic': 0.8
    };
    
    Object.entries(emotionWords).forEach(([emotion, intensity]) => {
      if (new RegExp(`\\b${emotion}\\b`, 'i').test(content)) {
        emotions.push({
          emotion,
          intensity,
          source: 'text_analysis'
        });
      }
    });
    
    return emotions;
  }

  private _extractTopics(content: string): any[] {
    const topics: any[] = [];
    const topicKeywords: Record<string, string[]> = {
      'technology': ['software', 'computer', 'digital', 'AI', 'algorithm'],
      'business': ['market', 'company', 'revenue', 'strategy', 'customer'],
      'science': ['research', 'study', 'analysis', 'data', 'experiment'],
      'art': ['creative', 'design', 'aesthetic', 'visual', 'artistic']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(content)
      );
      
      if (matches.length > 0) {
        topics.push({
          topic,
          relevance: matches.length / keywords.length
        });
      }
    });
    
    return topics.sort((a, b) => b.relevance - a.relevance);
  }

  private async _estimateInputTokens(inputs: MultimodalInput[]): Promise<number> {
    let totalTokens = 0;
    
    for (const input of inputs) {
      switch (input.type) {
        case 'text':
          totalTokens += Math.ceil((input.content as string).length / 4);
          break;
        case 'image':
          totalTokens += 85; // Standard tokens for image processing
          break;
        case 'audio':
          totalTokens += 100; // Estimated tokens for audio analysis
          break;
        case 'video':
          totalTokens += 150; // Estimated tokens for video analysis
          break;
      }
    }
    
    return totalTokens;
  }

  private _getInputTokenCost(): number {
    const costs: Record<string, number> = {
      'openai': 0.01 / 1000, // GPT-4V input cost
      'anthropic': 0.015 / 1000, // Claude 3 input cost
      'google': 0.000125 / 1000, // Gemini Pro input cost
      'custom': 0.01 / 1000
    };
    return costs[this.config.provider] || costs['openai'];
  }

  private _getOutputTokenCost(): number {
    const costs: Record<string, number> = {
      'openai': 0.03 / 1000, // GPT-4V output cost
      'anthropic': 0.075 / 1000, // Claude 3 output cost
      'google': 0.000375 / 1000, // Gemini Pro output cost
      'custom': 0.03 / 1000
    };
    return costs[this.config.provider] || costs['openai'];
  }

  private _calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = inputTokens * this._getInputTokenCost();
    const outputCost = outputTokens * this._getOutputTokenCost();
    return inputCost + outputCost;
  }

  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();
  }
}

export default MultimodalAdapter;