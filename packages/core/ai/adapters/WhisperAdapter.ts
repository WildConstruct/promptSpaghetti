/**
 * OpenAI Whisper Speech-to-Text Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 * 
 * Adapter for OpenAI Whisper models for audio transcription and translation
 */

import { BaseAIModel, AIModelType, AIModelProvider, AIModelStatus, ModelMetadata, ModelCapabilities, CostEstimate, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';

export interface WhisperConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  organization?: string;
}

export interface WhisperRequestOptions {
  // Core parameters
  file: File | Blob | ArrayBuffer;
  model?: 'whisper-1';
  
  // Transcription parameters
  language?: string; // ISO-639-1 language code
  prompt?: string; // Optional context to guide the model
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1
  
  // Advanced options
  timestamp_granularities?: ('word' | 'segment')[];
  
  // Processing options
  task?: 'transcribe' | 'translate'; // translate converts to English
}

export interface WhisperTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    words?: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  metadata: {
    model: string;
    task: string;
    language: string;
    duration: number;
    processing_time: number;
    confidence_score?: number;
  };
  usage: {
    audio_duration: number; // Duration in seconds
    cost: number;
  };
}

export interface AudioFileInfo {
  name: string;
  size: number;
  type: string;
  duration?: number;
  sample_rate?: number;
  channels?: number;
  format: string;
}

export class WhisperAdapter extends BaseAIModel {
  private config: WhisperConfig;
  private supportedFormats = [
    'audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg',
    'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'
  ];

  constructor(id: string, config: WhisperConfig) {
    const metadata: ModelMetadata = {
      name: 'whisper-1',
      version: '1.0',
      description: 'OpenAI Whisper automatic speech recognition with multilingual support',
      provider: AIModelProvider.OPENAI,
      type: AIModelType.AUDIO,
      costPerRequest: 0.006 / 60, // $0.006 per minute
      averageLatency: 5000,
      maxConcurrency: 10,
      rateLimit: {
        requestsPerMinute: 50,
        tokensPerMinute: 10000
      },
      tags: ['speech-to-text', 'transcription', 'multilingual', 'whisper'],
      lastUpdated: new Date()
    };

    const capabilities: ModelCapabilities = {
      inputTypes: ['audio', 'video'],
      outputTypes: ['text', 'json'],
      maxInputSize: 25 * 1024 * 1024, // 25MB file size limit
      maxOutputSize: Infinity, // No specific output limit
      supportsBatch: false,
      supportsStreaming: false,
      supportsAsync: true,
      customParameters: {
        language: { 
          type: 'string', 
          description: 'ISO-639-1 language code (auto-detected if not specified)' 
        },
        temperature: { type: 'number', min: 0, max: 1, default: 0 },
        response_format: {
          type: 'string',
          options: ['json', 'text', 'srt', 'verbose_json', 'vtt'],
          default: 'verbose_json'
        },
        task: {
          type: 'string',
          options: ['transcribe', 'translate'],
          default: 'transcribe'
        }
      }
    };

    super(id, metadata, capabilities);
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this._status = AIModelStatus.INITIALIZING;
      
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key is required for Whisper');
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

  async process(input: any, options?: WhisperRequestOptions): Promise<WhisperTranscriptionResult> {
    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      }

      const startTime = Date.now();
      
      // Extract and validate audio file
      const audioFile = this._extractAudioFile(input);
      if (!audioFile) {
        throw new Error('Audio file is required for transcription');
      }

      // Validate file format and size
      await this._validateAudioFile(audioFile);
      
      // Process options with defaults
      const processedOptions = this._processOptions(options);
      
      // Perform transcription
      const transcriptionData = await this._transcribeAudio(audioFile, processedOptions);
      const processingTime = Date.now() - startTime;
      
      // Get audio duration for cost calculation
      const audioDuration = await this._getAudioDuration(audioFile);
      
      const result: WhisperTranscriptionResult = {
        text: transcriptionData.text,
        language: transcriptionData.language,
        duration: transcriptionData.duration,
        segments: transcriptionData.segments,
        words: transcriptionData.words,
        metadata: {
          model: processedOptions.model!,
          task: processedOptions.task!,
          language: transcriptionData.language || 'auto',
          duration: audioDuration,
          processing_time: processingTime,
          confidence_score: this._calculateConfidenceScore(transcriptionData)
        },
        usage: {
          audio_duration: audioDuration,
          cost: this._calculateCost(audioDuration)
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

  async estimate(input: any, options?: WhisperRequestOptions): Promise<CostEstimate> {
    const audioFile = this._extractAudioFile(input);
    let audioDuration = 0;
    
    if (audioFile) {
      try {
        audioDuration = await this._getAudioDuration(audioFile);
      } catch (error) {
        // Fallback estimation based on file size
        audioDuration = this._estimateDurationFromSize(audioFile);
      }
    }
    
    const estimatedCost = this._calculateCost(audioDuration);
    
    return {
      estimatedCost,
      currency: 'USD',
      confidence: 0.9,
      breakdown: {
        inputCost: estimatedCost,
        outputCost: 0,
        processingCost: 0
      }
    };
  }

  // Whisper-specific methods
  async transcribeFile(
    file: File,
    language?: string,
    options?: Partial<WhisperRequestOptions>
  ): Promise<WhisperTranscriptionResult> {
    const whisperOptions: WhisperRequestOptions = {
      file,
      language,
      task: 'transcribe',
      ...options
    };

    return this.process(file, whisperOptions);
  }

  async translateToEnglish(
    file: File,
    options?: Partial<WhisperRequestOptions>
  ): Promise<WhisperTranscriptionResult> {
    const whisperOptions: WhisperRequestOptions = {
      file,
      task: 'translate',
      ...options
    };

    return this.process(file, whisperOptions);
  }

  async transcribeWithTimestamps(
    file: File,
    granularity: 'word' | 'segment' | 'both' = 'segment',
    options?: Partial<WhisperRequestOptions>
  ): Promise<WhisperTranscriptionResult> {
    const timestamp_granularities: ('word' | 'segment')[] = 
      granularity === 'both' ? ['word', 'segment'] : [granularity];

    const whisperOptions: WhisperRequestOptions = {
      file,
      response_format: 'verbose_json',
      timestamp_granularities,
      ...options
    };

    return this.process(file, whisperOptions);
  }

  async batchTranscribe(
    files: File[],
    options?: WhisperRequestOptions
  ): Promise<WhisperTranscriptionResult[]> {
    const results: WhisperTranscriptionResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.process(file, options);
        results.push(result);
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`Failed to transcribe file: ${file.name}`, error);
        throw error;
      }
    }
    
    return results;
  }

  async getSupportedLanguages(): Promise<string[]> {
    // Whisper supports 99 languages - this is a subset of the most common ones
    return [
      'af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da',
      'nl', 'en', 'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi', 'hu', 'is',
      'id', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'mr', 'mi',
      'ne', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sw',
      'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur', 'vi', 'cy'
    ];
  }

  async getAudioInfo(file: File | Blob): Promise<AudioFileInfo> {
    const info: AudioFileInfo = {
      name: file instanceof File ? file.name : 'unknown',
      size: file.size,
      type: file.type,
      format: this._getFormatFromMimeType(file.type)
    };

    try {
      info.duration = await this._getAudioDuration(file);
    } catch (error) {
      console.warn('Could not determine audio duration:', error);
    }

    return info;
  }

  // Static helper methods
  static getSupportedFormats(): string[] {
    return [
      'flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'
    ];
  }

  static getMaxFileSize(): number {
    return 25 * 1024 * 1024; // 25MB
  }

  static getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
      'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
      'zh': 'Chinese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi',
      'nl': 'Dutch', 'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian',
      'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'he': 'Hebrew'
    };
    return languages[code] || code.toUpperCase();
  }

  // Private helper methods
  private async _testConnection(): Promise<void> {
    try {
      // Create a minimal test audio file (1 second of silence)
      const testAudioBlob = this._createTestAudioBlob();
      
      const formData = new FormData();
      formData.append('file', testAudioBlob, 'test.wav');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const response = await fetch(`${this.config.baseURL || 'https://api.openai.com'}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
        },
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Whisper API test failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      // Don't need to process the response, just verify the API works
      await response.json();
    } catch (error) {
      throw new Error(`Failed to connect to Whisper API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _createTestAudioBlob(): Blob {
    // Create a minimal WAV file with 1 second of silence
    const sampleRate = 16000;
    const duration = 1; // 1 second
    const samples = sampleRate * duration;
    
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Silent audio data (all zeros)
    for (let i = 0; i < samples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  private _extractAudioFile(input: any): File | Blob | ArrayBuffer | null {
    if (input instanceof File || input instanceof Blob || input instanceof ArrayBuffer) {
      return input;
    }
    
    if (input && typeof input === 'object') {
      if (input.file) return input.file;
      if (input.audio) return input.audio;
      if (input.data) return input.data;
    }
    
    return null;
  }

  private async _validateAudioFile(file: File | Blob | ArrayBuffer): Promise<void> {
    // Check file size
    const size = file instanceof ArrayBuffer ? file.byteLength : file.size;
    if (size > WhisperAdapter.getMaxFileSize()) {
      throw new Error(`File size exceeds maximum limit of ${WhisperAdapter.getMaxFileSize() / 1024 / 1024}MB`);
    }

    if (size === 0) {
      throw new Error('Audio file is empty');
    }

    // Check file type if it's a File or Blob
    if ((file instanceof File || file instanceof Blob) && file.type) {
      if (!this.supportedFormats.includes(file.type)) {
        throw new Error(`Unsupported audio format: ${file.type}. Supported formats: ${this.supportedFormats.join(', ')}`);
      }
    }
  }

  private _processOptions(options?: WhisperRequestOptions): Required<Pick<WhisperRequestOptions, 'model' | 'response_format' | 'task' | 'temperature'>> & WhisperRequestOptions {
    const defaults = {
      model: 'whisper-1' as const,
      response_format: 'verbose_json' as const,
      task: 'transcribe' as const,
      temperature: 0
    };

    const processed = { ...defaults, ...options };

    // Validate temperature
    processed.temperature = Math.max(0, Math.min(1, processed.temperature));

    return processed;
  }

  private async _transcribeAudio(file: File | Blob | ArrayBuffer, options: WhisperRequestOptions): Promise<any> {
    const formData = new FormData();
    
    // Convert ArrayBuffer to Blob if necessary
    let fileToUpload: File | Blob;
    if (file instanceof ArrayBuffer) {
      fileToUpload = new Blob([file], { type: 'audio/wav' });
    } else {
      fileToUpload = file;
    }
    
    const fileName = fileToUpload instanceof File ? fileToUpload.name : 'audio.wav';
    formData.append('file', fileToUpload, fileName);
    formData.append('model', options.model!);
    formData.append('response_format', options.response_format!);
    
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    if (options.temperature !== undefined && options.temperature !== 0) {
      formData.append('temperature', options.temperature.toString());
    }
    
    if (options.timestamp_granularities) {
      options.timestamp_granularities.forEach(granularity => {
        formData.append('timestamp_granularities[]', granularity);
      });
    }

    const endpoint = options.task === 'translate' ? '/v1/audio/translations' : '/v1/audio/transcriptions';
    const url = `${this.config.baseURL || 'https://api.openai.com'}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`
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
          body: formData,
          signal: AbortSignal.timeout(this.config.timeout || 300000) // 5 minutes for large files
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Whisper API request failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
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

  private async _getAudioDuration(file: File | Blob | ArrayBuffer): Promise<number> {
    return new Promise((resolve, reject) => {
      if (file instanceof ArrayBuffer) {
        // For ArrayBuffer, we'll estimate based on size (very rough)
        resolve(this._estimateDurationFromSize(file));
        return;
      }

      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load audio file to determine duration'));
      };
      
      audio.src = url;
    });
  }

  private _estimateDurationFromSize(file: File | Blob | ArrayBuffer): number {
    const size = file instanceof ArrayBuffer ? file.byteLength : file.size;
    // Very rough estimation: assuming ~1MB per minute for compressed audio
    return (size / 1024 / 1024) * 60;
  }

  private _getFormatFromMimeType(mimeType: string): string {
    const formatMap: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/flac': 'flac',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/m4a': 'm4a',
      'audio/mp4': 'mp4',
      'video/mp4': 'mp4',
      'video/webm': 'webm'
    };
    
    return formatMap[mimeType] || 'unknown';
  }

  private _calculateConfidenceScore(transcriptionData: any): number {
    if (transcriptionData.segments && transcriptionData.segments.length > 0) {
      // Calculate average confidence from segments
      const avgLogprob = transcriptionData.segments.reduce((sum: number, segment: any) => 
        sum + (segment.avg_logprob || 0), 0) / transcriptionData.segments.length;
      
      // Convert log probability to confidence score (0-1)
      return Math.max(0, Math.min(1, Math.exp(avgLogprob)));
    }
    
    return 0.5; // Default confidence if no segment data
  }

  private _calculateCost(durationInSeconds: number): number {
    const costPerMinute = this._metadata.costPerRequest || (0.006 / 60);
    const durationInMinutes = durationInSeconds / 60;
    return Math.max(0.006, durationInMinutes * 60 * costPerMinute); // Minimum charge is for 1 minute
  }

  protected async _performHealthCheck(): Promise<void> {
    await this._testConnection();
  }
}

export default WhisperAdapter;