/**
 * OpenAI Text-to-Speech (TTS) Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 * 
 * Adapter for OpenAI's TTS models with voice selection and SSML support
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

export interface OpenAITTSConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  organization?: string;
}

export interface TTSRequestOptions {
  // Core parameters
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  
  // Audio parameters
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number; // 0.25 to 4.0
  
  // Advanced options
  voice_settings?: {
    stability?: number; // 0-1
    similarity_boost?: number; // 0-1
    style?: number; // 0-1
    use_speaker_boost?: boolean;
  };
  
  // SSML support
  use_ssml?: boolean;
  pronunciation_dictionary?: Record<string, string>;
  
  // Output options
  chunk_length_s?: number;
  normalize_audio?: boolean;
}

export interface TTSGenerationResult {
  audio: {
    data: ArrayBuffer | string; // Audio data (binary or base64)
    format: string;
    duration: number; // Duration in seconds
    sample_rate: number;
    channels: number;
    bitrate?: number;
  };
  metadata: {
    voice: string;
    model: string;
    text_length: number;
    audio_length: number;
    speed: number;
    response_format: string;
    generation_time: number;
  };
  usage: {
    characters: number;
    cost: number;
  };
}

export interface VoiceInfo {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  age?: 'young' | 'middle' | 'old';
  style?: string[];
  preview_url?: string;
}

export class OpenAITTSAdapter extends BaseAIModel {
  private config: OpenAITTSConfig;
  private availableVoices: VoiceInfo[] = [];

  constructor(id: string, config: OpenAITTSConfig, model: string = 'tts-1') {
    const metadata: ModelMetadata = {
      name: model,
      version: '1.0',
      description: 'OpenAI Text-to-Speech model with natural voice synthesis',
      provider: AIModelProvider.OPENAI,
      type: AIModelType.AUDIO,
      costPerRequest: OpenAITTSAdapter.getModelCostPerCharacter(model),
      averageLatency: 3000,
      maxConcurrency: 10,
      rateLimit: {
        requestsPerMinute: 50,
        tokensPerMinute: 50000 // Character limit
      },
      tags: ['text-to-speech', 'voice-synthesis', 'audio-generation', 'openai'],
      lastUpdated: new Date()
    };

    const capabilities: ModelCapabilities = {
      inputTypes: ['text', 'ssml'],
      outputTypes: ['audio', 'binary'],
      maxInputSize: 4096, // Characters
      maxOutputSize: 15, // Minutes of audio
      supportsBatch: false,
      supportsStreaming: true,
      supportsAsync: true,
      customParameters: {
        voice: { 
          type: 'string', 
          options: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
          default: 'alloy'
        },
        speed: { type: 'number', min: 0.25, max: 4.0, default: 1.0 },
        response_format: {
          type: 'string',
          options: ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'],
          default: 'mp3'
        }
      }
    };

    super(id, metadata, capabilities);
    this.config = config;
    this._initializeVoices();
  }

  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key is required for TTS');
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

  async process(input: any, options?: TTSRequestOptions): Promise<TTSGenerationResult> {
    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      }

      const startTime = Date.now();
      
      // Extract and validate text input
      const text = this._extractText(input);
      if (!text) {
        throw new Error('Text input is required for TTS generation');
      }

      if (text.length > 4096) {
        throw new Error('Text input exceeds maximum length of 4096 characters');
      }

      // Process options with defaults
      const processedOptions = this._processOptions(options, text);
      
      // Generate speech
      const audioData = await this._generateSpeech(text, processedOptions);
      const generationTime = Date.now() - startTime;
      
      // Process and analyze audio data
            
      const result: TTSGenerationResult = {
        audio: {
          data: audioData,
          format: processedOptions.response_format!,
          duration: this._estimateAudioDuration(text, processedOptions.speed!),
          sample_rate: this._getSampleRate(processedOptions.response_format!),
          channels: 1, // OpenAI TTS is mono
          bitrate: this._getBitrate(processedOptions.response_format!)
        },
        metadata: {
          voice: processedOptions.voice!,
          model: processedOptions.model!,
          text_length: text.length,
          audio_length: this._estimateAudioDuration(text, processedOptions.speed!),
          speed: processedOptions.speed!,
          response_format: processedOptions.response_format!,
          generation_time: generationTime
        },
        usage: {
          characters: text.length,
          cost: this._calculateCost(text.length, processedOptions.model!)
        }
      };

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

  async estimate(input: any, options?: TTSRequestOptions): Promise<CostEstimate> {
    const text = this._extractText(input);
    const characterCount = text?.length || 0;
    const model = options?.model || 'tts-1';
    
    const estimatedCost = this._calculateCost(characterCount, model);
    
    return {
      estimatedCost,
      currency: 'USD',
      confidence: 0.95,
      breakdown: {
        inputCost: estimatedCost,
        outputCost: 0,
        processingCost: 0
      }
    };
  }

  // TTS-specific methods
  async getAvailableVoices(): Promise<VoiceInfo[]> {
    return [...this.availableVoices];
  }

  async generateWithCustomVoice(
    text: string,
    voiceId: string,
    options?: Partial<TTSRequestOptions>
  ): Promise<TTSGenerationResult> {
    const ttsOptions: TTSRequestOptions = {
      text,
      voice: voiceId as any,
      ...options
    };

    return this.process(text, ttsOptions);
  }

  async generateSSML(
    ssmlText: string,
    voice?: string,
    options?: Partial<TTSRequestOptions>
  ): Promise<TTSGenerationResult> {
    const ttsOptions: TTSRequestOptions = {
      text: ssmlText,
      voice: voice as any,
      use_ssml: true,
      ...options
    };

    return this.process(ssmlText, ttsOptions);
  }

  async batchGenerate(
    texts: string[],
    options?: TTSRequestOptions
  ): Promise<TTSGenerationResult[]> {
    const results: TTSGenerationResult[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.process(text, options);
        results.push(result);
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to generate TTS for text: ${text.substring(0, 50)}...`, error);
        throw error;
      }
    }
    
    return results;
  }

  // Static helper methods
  static getModelCostPerCharacter(model: string): number {
    const costs: Record<string, number> = {
      'tts-1': 0.015 / 1000, // $0.015 per 1K characters
      'tts-1-hd': 0.030 / 1000 // $0.030 per 1K characters
    };
    return costs[model] || costs['tts-1'];
  }

  static getVoiceCharacteristics(voice: string): Partial<VoiceInfo> {
    const voices: Record<string, Partial<VoiceInfo>> = {
      'alloy': { gender: 'neutral', description: 'Balanced and versatile voice' },
      'echo': { gender: 'male', description: 'Deep and resonant male voice' },
      'fable': { gender: 'female', description: 'Warm and expressive female voice' },
      'onyx': { gender: 'male', description: 'Strong and confident male voice' },
      'nova': { gender: 'female', description: 'Clear and professional female voice' },
      'shimmer': { gender: 'female', description: 'Gentle and soothing female voice' }
    };
    return voices[voice] || {};
  }

  // Private helper methods
  private _initializeVoices(): void {
    this.availableVoices = [
      {
        id: 'alloy',
        name: 'Alloy',
        description: 'Balanced and versatile voice suitable for most content',
        gender: 'neutral',
        style: ['neutral', 'professional']
      },
      {
        id: 'echo',
        name: 'Echo',
        description: 'Deep and resonant male voice with authoritative tone',
        gender: 'male',
        age: 'middle',
        style: ['authoritative', 'deep']
      },
      {
        id: 'fable',
        name: 'Fable',
        description: 'Warm and expressive female voice perfect for storytelling',
        gender: 'female',
        age: 'young',
        style: ['warm', 'expressive', 'storytelling']
      },
      {
        id: 'onyx',
        name: 'Onyx',
        description: 'Strong and confident male voice with clear articulation',
        gender: 'male',
        age: 'middle',
        style: ['confident', 'clear', 'professional']
      },
      {
        id: 'nova',
        name: 'Nova',
        description: 'Clear and professional female voice ideal for presentations',
        gender: 'female',
        age: 'young',
        style: ['clear', 'professional', 'articulate']
      },
      {
        id: 'shimmer',
        name: 'Shimmer',
        description: 'Gentle and soothing female voice with calming qualities',
        gender: 'female',
        age: 'young',
        style: ['gentle', 'soothing', 'calm']
      }
    ];
  }

  private async _testConnection(): Promise<void> {
    try {
      // Test with a minimal TTS request
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: 'Test',
          voice: 'alloy',
          response_format: 'mp3'
        }),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`OpenAI TTS API test failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      // Don't need to process the audio, just verify the API works
      await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Failed to connect to OpenAI TTS API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _extractText(input: any): string {
    if (typeof input === 'string') {
      return input;
    }
    
    if (input && typeof input === 'object') {
      if (input.text) return input.text;
      if (input.content) return input.content;
      if (input.message) return input.message;
    }
    
    return JSON.stringify(input);
  }

  private _processOptions(
    options?: TTSRequestOptions,
    text?: string
  ): Required<Pick<TTSRequestOptions, 'voice' | 'model' | 'response_format' | 'speed' | 'text'>> & Omit<TTSRequestOptions, 'text'> & { text: string } {
    const defaults = {
      voice: 'alloy' as const,
      model: 'tts-1' as const,
      response_format: 'mp3' as const,
      speed: 1.0
    };

    const processed = { ...defaults, ...options };

    // Set text if provided, or ensure it exists
    processed.text = text || processed.text || ''; // Ensure text is always a string

    // Validate voice
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(processed.voice)) {
      processed.voice = 'alloy';
    }

    // Validate model
    const validModels = ['tts-1', 'tts-1-hd'];
    if (!validModels.includes(processed.model)) {
      processed.model = 'tts-1';
    }

    // Validate speed
    processed.speed = Math.max(0.25, Math.min(4.0, processed.speed));

    return processed as Required<Pick<TTSRequestOptions, 'voice' | 'model' | 'response_format' | 'speed' | 'text'>> & Omit<TTSRequestOptions, 'text'> & { text: string };
  }

  private async _generateSpeech(text: string, options: TTSRequestOptions): Promise<ArrayBuffer> {
    const url = `${this.config.baseURL || 'https://api.openai.com'}/v1/audio/speech`;
    
    const payload = {
      model: options.model,
      input: text,
      voice: options.voice,
      response_format: options.response_format,
      speed: options.speed
    };

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };

    if (this.config.organization) {
      headers['OpenAI-Organization'] = this.config.organization;
    }

    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.config.timeout || 60000)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`OpenAI TTS API request failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
        }

        return response.arrayBuffer();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private async _analyzeAudioData(audioData: ArrayBuffer, format: string): Promise<any> {
    // Basic audio analysis - in a real implementation, this could use audio analysis libraries
    return {
      size: audioData.byteLength,
      format,
      estimated_duration: this._estimateAudioDuration('', 1.0) // Would be calculated from actual audio
    };
  }

  private _estimateAudioDuration(text: string, speed: number): number {
    // Rough estimation: average speaking rate is ~150 words per minute
    const words = text.split(/\s+/).length;
    const baseDurationMinutes = words / 150;
    const baseDurationSeconds = baseDurationMinutes * 60;
    
    // Adjust for speed
    return baseDurationSeconds / speed;
  }

  private _getSampleRate(format: string): number {
    const sampleRates: Record<string, number> = {
      'mp3': 24000,
      'opus': 24000,
      'aac': 24000,
      'flac': 24000,
      'wav': 24000,
      'pcm': 24000
    };
    return sampleRates[format] || 24000;
  }

  private _getBitrate(format: string): number | undefined {
    const bitrates: Record<string, number> = {
      'mp3': 64000, // 64 kbps
      'opus': 64000,
      'aac': 64000
    };
    return bitrates[format];
  }

  private _calculateCost(characterCount: number, model: string): number {
    const costPerCharacter = OpenAITTSAdapter.getModelCostPerCharacter(model);
    return characterCount * costPerCharacter;
  }

  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();
  }
}

export default OpenAITTSAdapter;