/**
 * OpenAI Text-to-Speech (TTS) Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for OpenAI's TTS models with voice selection and SSML support
 */
import { BaseAIModel, AIModelType, AIModelProvider, AIModelStatus, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel.js';
export class OpenAITTSAdapter extends BaseAIModel {
    config;
    availableVoices = [];
    constructor(id, config, model = 'tts-1') {
        const metadata = {
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
        const capabilities = {
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
    async initialize() {
        try {
            this._status = AIModelStatus.INITIALIZING;
            if (!this.config.apiKey) {
                throw new Error('OpenAI API key is required for TTS');
            }
            // Test the API connection
            await this._testConnection();
            this._status = AIModelStatus.READY;
            this._lastActivity = new Date();
        }
        catch (error) {
            this._status = AIModelStatus.ERROR;
            throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async process(input, options) {
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
            const audioMetadata = await this._analyzeAudioData(audioData, processedOptions.response_format);
            const result = {
                audio: {
                    data: audioData,
                    format: processedOptions.response_format,
                    duration: this._estimateAudioDuration(text, processedOptions.speed),
                    sample_rate: this._getSampleRate(processedOptions.response_format),
                    channels: 1, // OpenAI TTS is mono
                    bitrate: this._getBitrate(processedOptions.response_format)
                },
                metadata: {
                    voice: processedOptions.voice,
                    model: processedOptions.model,
                    text_length: text.length,
                    audio_length: this._estimateAudioDuration(text, processedOptions.speed),
                    speed: processedOptions.speed,
                    response_format: processedOptions.response_format,
                    generation_time: generationTime
                },
                usage: {
                    characters: text.length,
                    cost: this._calculateCost(text.length, processedOptions.model)
                }
            };
            this._lastActivity = new Date();
            return result;
        }
        catch (error) {
            throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async cleanup() {
        this._status = AIModelStatus.OFFLINE;
        this._activeRequests.clear();
        this._requestQueue = [];
    }
    async estimate(input, options) {
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
    async getAvailableVoices() {
        return [...this.availableVoices];
    }
    async generateWithCustomVoice(text, voiceId, options) {
        const ttsOptions = {
            text,
            voice: voiceId,
            ...options
        };
        return this.process(text, ttsOptions);
    }
    async generateSSML(ssmlText, voice, options) {
        const ttsOptions = {
            text: ssmlText,
            voice: voice,
            use_ssml: true,
            ...options
        };
        return this.process(ssmlText, ttsOptions);
    }
    async batchGenerate(texts, options) {
        const results = [];
        for (const text of texts) {
            try {
                const result = await this.process(text, options);
                results.push(result);
                // Add small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            catch (error) {
                console.warn(`Failed to generate TTS for text: ${text.substring(0, 50)}...`, error);
                throw error;
            }
        }
        return results;
    }
    // Static helper methods
    static getModelCostPerCharacter(model) {
        const costs = {
            'tts-1': 0.015 / 1000, // $0.015 per 1K characters
            'tts-1-hd': 0.030 / 1000 // $0.030 per 1K characters
        };
        return costs[model] || costs['tts-1'];
    }
    static getVoiceCharacteristics(voice) {
        const voices = {
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
    _initializeVoices() {
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
    async _testConnection() {
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
        }
        catch (error) {
            throw new Error(`Failed to connect to OpenAI TTS API: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    _extractText(input) {
        if (typeof input === 'string') {
            return input;
        }
        if (input && typeof input === 'object') {
            if (input.text)
                return input.text;
            if (input.content)
                return input.content;
            if (input.message)
                return input.message;
        }
        return JSON.stringify(input);
    }
    _processOptions(options, text) {
        const defaults = {
            voice: 'alloy',
            model: 'tts-1',
            response_format: 'mp3',
            speed: 1.0
        };
        const processed = { ...defaults, ...options };
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
        return processed;
    }
    async _generateSpeech(text, options) {
        const url = `${this.config.baseURL || 'https://api.openai.com'}/v1/audio/speech`;
        const payload = {
            model: options.model,
            input: text,
            voice: options.voice,
            response_format: options.response_format,
            speed: options.speed
        };
        const headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
        };
        if (this.config.organization) {
            headers['OpenAI-Organization'] = this.config.organization;
        }
        let lastError = null;
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
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw lastError || new Error('All retry attempts failed');
    }
    async _analyzeAudioData(audioData, format) {
        // Basic audio analysis - in a real implementation, this could use audio analysis libraries
        return {
            size: audioData.byteLength,
            format,
            estimated_duration: this._estimateAudioDuration('', 1.0) // Would be calculated from actual audio
        };
    }
    _estimateAudioDuration(text, speed) {
        // Rough estimation: average speaking rate is ~150 words per minute
        const words = text.split(/\s+/).length;
        const baseDurationMinutes = words / 150;
        const baseDurationSeconds = baseDurationMinutes * 60;
        // Adjust for speed
        return baseDurationSeconds / speed;
    }
    _getSampleRate(format) {
        const sampleRates = {
            'mp3': 24000,
            'opus': 24000,
            'aac': 24000,
            'flac': 24000,
            'wav': 24000,
            'pcm': 24000
        };
        return sampleRates[format] || 24000;
    }
    _getBitrate(format) {
        const bitrates = {
            'mp3': 64000, // 64 kbps
            'opus': 64000,
            'aac': 64000
        };
        return bitrates[format];
    }
    _calculateCost(characterCount, model) {
        const costPerCharacter = OpenAITTSAdapter.getModelCostPerCharacter(model);
        return characterCount * costPerCharacter;
    }
    async _performHealthCheck() {
        await this._testConnection();
    }
}
export default OpenAITTSAdapter;
