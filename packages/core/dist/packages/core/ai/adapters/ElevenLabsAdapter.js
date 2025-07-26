/**
 * ElevenLabs Voice Synthesis Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for ElevenLabs AI voice synthesis with custom voice training and cloning
 */
import { BaseAIModel, AIModelType, AIModelProvider, AIModelStatus, ModelInitializationError, ModelProcessingError, ModelUnavailableError } from '../BaseAIModel';
export class ElevenLabsAdapter extends BaseAIModel {
    config;
    availableVoices = [];
    availableModels = [];
    quotaInfo = null;
    constructor(id, config) {
        const metadata = {
            name: 'elevenlabs-multilingual-v2',
            version: '2.0',
            description: 'ElevenLabs AI voice synthesis with custom voice cloning',
            provider: AIModelProvider.ELEVENLABS,
            type: AIModelType.AUDIO,
            costPerRequest: 0.18 / 1000, // $0.18 per 1K characters (Starter tier)
            averageLatency: 2500,
            maxConcurrency: 5,
            rateLimit: {
                requestsPerMinute: 120,
                tokensPerMinute: 20000
            },
            tags: ['text-to-speech', 'voice-cloning', 'custom-voices', 'multilingual'],
            lastUpdated: new Date()
        };
        const capabilities = {
            inputTypes: ['text'],
            outputTypes: ['audio', 'binary'],
            maxInputSize: 5000, // Characters
            maxOutputSize: 20, // Minutes of audio
            supportsBatch: false,
            supportsStreaming: true,
            supportsAsync: true,
            customParameters: {
                voice_id: { type: 'string', description: 'Voice ID from available voices' },
                stability: { type: 'number', min: 0, max: 1, default: 0.5 },
                similarity_boost: { type: 'number', min: 0, max: 1, default: 0.5 },
                style: { type: 'number', min: 0, max: 1, default: 0 },
                use_speaker_boost: { type: 'boolean', default: true },
                output_format: {
                    type: 'string',
                    options: ['mp3_44100_128', 'mp3_22050_32', 'pcm_16000', 'pcm_22050', 'pcm_24000', 'pcm_44100'],
                    default: 'mp3_44100_128'
                }
            }
        };
        super(id, metadata, capabilities);
        this.config = config;
    }
    async initialize() {
        try {
            this._status = AIModelStatus.INITIALIZING;
            if (!this.config.apiKey) {
                throw new Error('ElevenLabs API key is required');
            }
            // Test API connection and load resources
            await this._testConnection();
            await this._loadAvailableVoices();
            await this._loadAvailableModels();
            await this._loadQuotaInfo();
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
                throw new Error('Text input is required for voice synthesis');
            }
            if (text.length > 5000) {
                throw new Error('Text input exceeds maximum length of 5000 characters');
            }
            // Process options with defaults
            const processedOptions = this._processOptions(options, text);
            // Check quota before generation
            await this._checkQuota(text.length);
            // Generate speech
            const audioData = await this._generateSpeech(text, processedOptions);
            const generationTime = Date.now() - startTime;
            // Get voice information
            const voiceInfo = await this._getVoiceInfo(processedOptions.voice_id);
            const result = {
                audio: {
                    data: audioData,
                    format: processedOptions.output_format,
                    duration: this._estimateAudioDuration(text),
                    sample_rate: this._getSampleRate(processedOptions.output_format),
                    channels: 1, // ElevenLabs produces mono audio
                    bit_depth: this._getBitDepth(processedOptions.output_format)
                },
                metadata: {
                    voice_id: processedOptions.voice_id,
                    voice_name: voiceInfo?.name || 'Unknown',
                    model_id: processedOptions.model_id,
                    text_length: text.length,
                    audio_length: this._estimateAudioDuration(text),
                    voice_settings: processedOptions.voice_settings,
                    generation_time: generationTime
                },
                usage: {
                    characters: text.length,
                    cost: this._calculateCost(text.length),
                    quota_remaining: this.quotaInfo?.character_limit - this.quotaInfo?.character_count
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
        const estimatedCost = this._calculateCost(characterCount);
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
    // ElevenLabs-specific methods
    async getAvailableVoices() {
        return [...this.availableVoices];
    }
    async getAvailableModels() {
        return [...this.availableModels];
    }
    async getQuotaInfo() {
        await this._loadQuotaInfo();
        return this.quotaInfo;
    }
    async createCustomVoice(name, audioFiles, description, labels) {
        const formData = new FormData();
        formData.append('name', name);
        if (description) {
            formData.append('description', description);
        }
        if (labels) {
            formData.append('labels', JSON.stringify(labels));
        }
        // Add audio files
        audioFiles.forEach((file, index) => {
            formData.append('files', file, file.name);
        });
        const response = await this._makeRequest('/v1/voices/add', 'POST', formData, {
            'Content-Type': 'multipart/form-data'
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Failed to create custom voice: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
        }
        const newVoice = await response.json();
        // Refresh voice list
        await this._loadAvailableVoices();
        return newVoice;
    }
    async cloneVoice(name, audioSample, description) {
        return this.createCustomVoice(name, [audioSample], description);
    }
    async deleteVoice(voiceId) {
        const response = await this._makeRequest(`/v1/voices/${voiceId}`, 'DELETE');
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Failed to delete voice: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
        }
        // Refresh voice list
        await this._loadAvailableVoices();
    }
    async getVoiceSettings(voiceId) {
        const response = await this._makeRequest(`/v1/voices/${voiceId}/settings`, 'GET');
        if (!response.ok) {
            throw new Error(`Failed to get voice settings: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async updateVoiceSettings(voiceId, settings) {
        const response = await this._makeRequest(`/v1/voices/${voiceId}/settings/edit`, 'POST', settings);
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Failed to update voice settings: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
        }
    }
    async generateWithStream(text, voiceId, options) {
        const processedOptions = this._processOptions({ text, voice_id: voiceId, ...options }, text);
        const payload = {
            text,
            model_id: processedOptions.model_id,
            voice_settings: processedOptions.voice_settings
        };
        const response = await fetch(`${this.config.baseURL || 'https://api.elevenlabs.io'}/v1/text-to-speech/${voiceId}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.config.apiKey
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`ElevenLabs streaming request failed: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
        }
        return response.body;
    }
    // Static helper methods
    static getDefaultVoiceSettings() {
        return {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0,
            use_speaker_boost: true
        };
    }
    static optimizeVoiceSettings(voiceCategory) {
        const optimizations = {
            'premade': { stability: 0.5, similarity_boost: 0.5, style: 0 },
            'cloned': { stability: 0.7, similarity_boost: 0.8, style: 0.2 },
            'generated': { stability: 0.6, similarity_boost: 0.6, style: 0.1 },
            'professional': { stability: 0.4, similarity_boost: 0.9, style: 0.3 }
        };
        return optimizations[voiceCategory] || ElevenLabsAdapter.getDefaultVoiceSettings();
    }
    // Private helper methods
    async _testConnection() {
        try {
            const response = await this._makeRequest('/v1/user', 'GET');
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`ElevenLabs API test failed: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
            }
            const userData = await response.json();
            console.log('ElevenLabs connection successful:', userData.subscription?.tier || 'free');
        }
        catch (error) {
            throw new Error(`Failed to connect to ElevenLabs API: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async _loadAvailableVoices() {
        try {
            const response = await this._makeRequest('/v1/voices', 'GET');
            if (response.ok) {
                const data = await response.json();
                this.availableVoices = data.voices || [];
            }
        }
        catch (error) {
            console.warn('Failed to load available voices:', error);
            this.availableVoices = [];
        }
    }
    async _loadAvailableModels() {
        try {
            const response = await this._makeRequest('/v1/models', 'GET');
            if (response.ok) {
                const models = await response.json();
                this.availableModels = models || [];
            }
        }
        catch (error) {
            console.warn('Failed to load available models:', error);
            this.availableModels = [];
        }
    }
    async _loadQuotaInfo() {
        try {
            const response = await this._makeRequest('/v1/user/subscription', 'GET');
            if (response.ok) {
                this.quotaInfo = await response.json();
            }
        }
        catch (error) {
            console.warn('Failed to load quota information:', error);
        }
    }
    async _checkQuota(characterCount) {
        if (this.quotaInfo) {
            const remaining = this.quotaInfo.character_limit - this.quotaInfo.character_count;
            if (remaining < characterCount) {
                throw new Error(`Insufficient quota. Requested: ${characterCount}, Remaining: ${remaining}`);
            }
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
        // Use first available voice as default, or Rachel if no voices loaded
        const defaultVoiceId = this.availableVoices.length > 0
            ? this.availableVoices[0].voice_id
            : '21m00Tcm4TlvDq8ikWAM'; // Rachel (premade voice)
        // Use first available model as default, or multilingual v2
        const defaultModelId = this.availableModels.length > 0
            ? this.availableModels.find(m => m.can_do_text_to_speech)?.model_id || this.availableModels[0].model_id
            : 'eleven_multilingual_v2';
        const defaults = {
            voice_id: defaultVoiceId,
            model_id: defaultModelId,
            output_format: 'mp3_44100_128',
            voice_settings: ElevenLabsAdapter.getDefaultVoiceSettings()
        };
        const processed = { ...defaults, ...options };
        // Set text if provided, or ensure it exists
        processed.text = text || processed.text || ''; // Ensure text is always a string
        // Validate voice_id exists
        if (this.availableVoices.length > 0) {
            const voiceExists = this.availableVoices.some(v => v.voice_id === processed.voice_id);
            if (!voiceExists) {
                processed.voice_id = defaultVoiceId;
            }
        }
        // Validate model_id exists and supports TTS
        if (this.availableModels.length > 0) {
            const modelExists = this.availableModels.some(m => m.model_id === processed.model_id && m.can_do_text_to_speech);
            if (!modelExists) {
                processed.model_id = defaultModelId;
            }
        }
        // Validate voice settings
        if (processed.voice_settings) {
            processed.voice_settings.stability = Math.max(0, Math.min(1, processed.voice_settings.stability || 0.5));
            processed.voice_settings.similarity_boost = Math.max(0, Math.min(1, processed.voice_settings.similarity_boost || 0.5));
            if (processed.voice_settings.style !== undefined) {
                processed.voice_settings.style = Math.max(0, Math.min(1, processed.voice_settings.style));
            }
        }
        return processed;
    }
    async _generateSpeech(text, options) {
        const payload = {
            text,
            model_id: options.model_id,
            voice_settings: options.voice_settings
        };
        const response = await this._makeRequest(`/v1/text-to-speech/${options.voice_id}`, 'POST', payload, {
            'Accept': `audio/${options.output_format?.includes('mp3') ? 'mpeg' : 'wav'}`
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`ElevenLabs TTS generation failed: ${response.status} ${response.statusText} - ${errorData?.detail?.message || 'Unknown error'}`);
        }
        return response.arrayBuffer();
    }
    async _getVoiceInfo(voiceId) {
        return this.availableVoices.find(v => v.voice_id === voiceId);
    }
    async _makeRequest(endpoint, method = 'GET', payload, additionalHeaders) {
        const url = `${this.config.baseURL || 'https://api.elevenlabs.io'}${endpoint}`;
        const headers = {
            'xi-api-key': this.config.apiKey,
            ...additionalHeaders
        };
        // Don't set Content-Type for FormData (browser will set it with boundary)
        if (payload && !(payload instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        const options = {
            method,
            headers,
            signal: AbortSignal.timeout(this.config.timeout || 60000)
        };
        if (method !== 'GET' && payload) {
            options.body = payload instanceof FormData ? payload : JSON.stringify(payload);
        }
        let lastError = null;
        const maxRetries = this.config.maxRetries ?? 3;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fetch(url, options);
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
    _estimateAudioDuration(text) {
        // Rough estimation: average speaking rate is ~150 words per minute
        const words = text.split(/\s+/).length;
        const baseDurationMinutes = words / 150;
        return baseDurationMinutes * 60; // Convert to seconds
    }
    _getSampleRate(format) {
        const match = format.match(/(\d+)/);
        return match ? parseInt(match[1]) : 44100;
    }
    _getBitDepth(format) {
        if (format.includes('pcm')) {
            return 16; // PCM is typically 16-bit
        }
        return 32; // MP3 uses 32-bit float internally
    }
    _calculateCost(characterCount) {
        // ElevenLabs pricing: $0.18 per 1K characters for Starter tier
        const costPerCharacter = this._metadata.costPerRequest || (0.18 / 1000);
        return characterCount * costPerCharacter;
    }
    async _performHealthCheck() {
        await this._testConnection();
    }
}
export default ElevenLabsAdapter;
