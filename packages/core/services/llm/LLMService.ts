// Core LLM Service with OpenRouter Integration
// Conditional import for Node.js environment
import 'openai/shims/node';
import OpenAI from 'openai';
import {
  LLMRequest,
  LLMResponse,
  LLMServiceConfig,
  LLMMetrics,
  SuggestionResponse,
  MetadataResponse,
  RefinementResponse
} from './types';
import { ModelSelector } from './ModelSelector';
import { CacheManager } from './CacheManager';
import { TokenTracker } from './TokenTracker';
import { PrivacyFilter } from './PrivacyFilter';

export class LLMService {
  private client: OpenAI | null = null;
  private modelSelector: ModelSelector;
  private cacheManager: CacheManager;
  private tokenTracker: TokenTracker;
  private privacyFilter: PrivacyFilter;
  private config: LLMServiceConfig;
  private userId: string = 'default';
  private metrics: LLMMetrics[] = [];

  constructor(config: LLMServiceConfig) {
    this.config = config;
    this.modelSelector = new ModelSelector();
    this.cacheManager = new CacheManager();
    this.tokenTracker = new TokenTracker(config.dailyLimit, config.costLimit);
    this.privacyFilter = new PrivacyFilter();

    // Initialize OpenAI client for OpenRouter
    console.log('[LLMService] Constructor called with config:', {
      hasApiKey: !!config.apiKey,
      apiKeyPrefix: config.apiKey
        ? config.apiKey.substring(0, 10) + '...'
        : 'none',
      mode: config.mode,
      baseUrl: config.baseUrl
    });

    if (config.apiKey) {
      console.log('[LLMService] Creating OpenAI client with API key');
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl || 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Prompt Spaghetti'
        },
        dangerouslyAllowBrowser: config.mode === 'development'
      });
      console.log('[LLMService] OpenAI client created successfully');
    } else {
      console.warn('[LLMService] No API key provided - client not initialized');
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse | null> {
    // Check quota first
    if (this.tokenTracker.isQuotaExceeded(this.userId)) {
      return {
        content: '',
        model: '',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'Daily quota exceeded'
      };
    }

    // Warn if approaching limit
    if (this.tokenTracker.shouldWarn(this.userId)) {
      console.warn('Approaching daily quota limit');
    }

    // Get models for task
    const models = this.modelSelector.getModelsForTask(request.taskType);

    if (models.length === 0) {
      return {
        content: '',
        model: '',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'No available models'
      };
    }

    // Try each model in the fallback chain
    for (const model of models) {
      // Check cache first
      const cachedResponse = this.cacheManager.get(request, model.id);
      if (cachedResponse) {
        this.logMetrics({
          timestamp: Date.now(),
          model: model.id,
          tokensIn: 0,
          tokensOut: 0,
          latencyMs: 0,
          cacheHit: true,
          success: true,
          userId: this.userId,
          consentVerified: true
        });
        return cachedResponse;
      }

      try {
        const response = await this.callModel(model.id, request);

        // Cache successful response
        this.cacheManager.set(request, model.id, response);

        // Track usage
        this.tokenTracker.trackUsage(
          this.userId,
          model.id,
          response.tokensIn,
          response.tokensOut,
          response.cost
        );

        return response;
      } catch (error) {
        console.error(`Model ${model.id} failed:`, error);
        this.modelSelector.markModelFailed(model.id);
        continue; // Try next model
      }
    }

    // All models failed
    return null;
  }

  private async callModel(
    modelId: string,
    request: LLMRequest
  ): Promise<LLMResponse> {
    if (!this.client) {
      console.error(
        '[LLMService] Client not initialized - no API key provided'
      );
      throw new Error('LLM client not initialized - no API key configured');
    }

    const startTime = Date.now();

    // Prepare prompt with compression
    const prompt = this.compressPrompt(request.prompt, request.context);

    // Estimate tokens
    const tokensIn = this.tokenTracker.estimateTokens(prompt);

    // Enforce token limits
    const maxTokens = Math.min(request.maxTokens || 200, 200);

    try {
      // Create completion with timeout and retry logic
      const completion = await this.callWithRetry(
        () =>
          this.createCompletion(
            modelId,
            prompt,
            maxTokens,
            request.temperature,
            request.responseFormat === 'json'
          ),
        3, // max retries
        3000 // 3 second timeout
      );

      const content = completion.choices[0]?.message?.content || '';
      const tokensOut = this.tokenTracker.estimateTokens(content);

      // Validate JSON if required
      if (request.responseFormat === 'json') {
        this.validateJsonResponse(content, request.taskType);
      }

      const model = this.modelSelector.getModelById(modelId);
      const cost = model
        ? this.modelSelector.calculateCost(modelId, tokensIn, tokensOut)
        : 0;

      const latencyMs = Date.now() - startTime;

      // Log metrics
      this.logMetrics({
        timestamp: Date.now(),
        model: modelId,
        tokensIn,
        tokensOut,
        latencyMs,
        cacheHit: false,
        success: true,
        userId: this.userId,
        consentVerified: true
      });

      return {
        content,
        model: modelId,
        tokensIn,
        tokensOut,
        cost,
        cached: false
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;

      // Log error metrics
      this.logMetrics({
        timestamp: Date.now(),
        model: modelId,
        tokensIn,
        tokensOut: 0,
        latencyMs,
        cacheHit: false,
        success: false,
        userId: this.userId,
        consentVerified: true,
        error: error.message
      });

      throw error;
    }
  }

  private async callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    timeout: number = 3000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Create promise with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        // Race between actual call and timeout
        const result = await Promise.race([fn(), timeoutPromise]);
        return result;
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        if (error.status === 429 || error.message?.includes('rate')) {
          // Exponential backoff: 1s, 2s, 4s
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`Rate limited, retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        } else if (error.message === 'Request timeout') {
          console.log(
            `Request timed out after ${timeout}ms, attempt ${attempt + 1}/${maxRetries}`
          );
          // Don't wait for timeout errors, try immediately
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private async createCompletion(
    model: string,
    prompt: string,
    maxTokens: number,
    temperature?: number,
    jsonMode?: boolean
  ): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: jsonMode
          ? 'You are a helpful assistant that always responds with valid JSON. Be factual and avoid speculation.'
          : 'You are a helpful assistant. Be factual and avoid speculation.'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const completionParams: any = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature: temperature || 0.7
    };

    // Add response format for JSON mode if supported
    if (jsonMode) {
      completionParams.response_format = { type: 'json_object' };
    }

    return await this.client!.chat.completions.create(completionParams);
  }

  private compressPrompt(prompt: string, context?: string): string {
    // Sanitize prompt first
    const { sanitized, warnings } = this.privacyFilter.sanitizePrompt(prompt);

    if (warnings.length > 0) {
      console.warn('Privacy filter warnings:', warnings);
    }

    let compressed = sanitized.trim().replace(/\s+/g, ' ');

    if (context) {
      const { sanitized: sanitizedContext } =
        this.privacyFilter.sanitizePrompt(context);
      compressed = `Context: ${sanitizedContext.trim().replace(/\s+/g, ' ')}\n\n${compressed}`;
    }

    // Truncate if too long (500 token limit ≈ 2000 characters)
    if (compressed.length > 2000) {
      compressed = compressed.slice(0, 2000) + '...';
    }

    return compressed;
  }

  private validateJsonResponse(content: string, taskType?: string): void {
    try {
      const parsed = JSON.parse(content);

      // Validate based on task type
      switch (taskType) {
        case 'suggestion':
          this.validateSuggestionResponse(parsed);
          break;
        case 'metadata':
          this.validateMetadataResponse(parsed);
          break;
        case 'refinement':
          this.validateRefinementResponse(parsed);
          break;
      }
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error}`);
    }
  }

  private validateSuggestionResponse(data: any): void {
    if (!Array.isArray(data.choices)) {
      throw new Error('Suggestion response must have choices array');
    }

    for (const choice of data.choices) {
      if (
        typeof choice.text !== 'string' ||
        typeof choice.weight !== 'number'
      ) {
        throw new Error('Each choice must have text and weight');
      }
    }
  }

  private validateMetadataResponse(data: any): void {
    if (
      !Array.isArray(data.tags) ||
      typeof data.subject !== 'string' ||
      typeof data.intensity !== 'number'
    ) {
      throw new Error(
        'Metadata response must have tags, subject, and intensity'
      );
    }
  }

  private validateRefinementResponse(data: any): void {
    if (
      typeof data.original !== 'string' ||
      typeof data.refined !== 'string' ||
      !Array.isArray(data.changes)
    ) {
      throw new Error(
        'Refinement response must have original, refined, and changes'
      );
    }
  }

  private logMetrics(metrics: LLMMetrics): void {
    this.metrics.push(metrics);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log to console in development
    if (this.config.mode === 'development') {
      console.log('LLM Metrics:', metrics);
    }
  }

  // Parallel execution for multiple independent calls
  async completeBatch(requests: LLMRequest[]): Promise<(LLMResponse | null)[]> {
    const promises = requests.map(request => this.complete(request));
    return Promise.all(promises);
  }

  // Helper methods for specific use cases
  async populateChoices(
    context: string,
    section: string,
    count: number = 5
  ): Promise<SuggestionResponse | null> {
    const prompt = `Given this context: "${context}"
    
    Generate ${count} creative text variations for this section: "${section}"
    
    Return JSON with format: {"choices": [{"text": "...", "weight": 0-100}]}`;

    const response = await this.complete({
      prompt,
      taskType: 'suggestion',
      responseFormat: 'json',
      maxTokens: 200
    });

    if (response && response.content) {
      try {
        return JSON.parse(response.content);
      } catch {
        return null;
      }
    }

    return null;
  }

  async extractMetadata(text: string): Promise<MetadataResponse | null> {
    const prompt = `Extract metadata from this text: "${text}"
    
    Return JSON with format: {"tags": [...], "subject": "...", "intensity": 0-10}`;

    const response = await this.complete({
      prompt,
      taskType: 'metadata',
      responseFormat: 'json',
      maxTokens: 150
    });

    if (response && response.content) {
      try {
        return JSON.parse(response.content);
      } catch {
        return null;
      }
    }

    return null;
  }

  async refineText(
    text: string,
    style?: string
  ): Promise<RefinementResponse | null> {
    const prompt = `Refine this text${style ? ` in ${style} style` : ''}: "${text}"
    
    Return JSON with format: {"original": "...", "refined": "...", "changes": [...]}`;

    const response = await this.complete({
      prompt,
      taskType: 'refinement',
      responseFormat: 'json',
      maxTokens: 200
    });

    if (response && response.content) {
      try {
        return JSON.parse(response.content);
      } catch {
        return null;
      }
    }

    return null;
  }

  // Administrative methods
  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUsageStats(hours: number = 24) {
    return this.tokenTracker.getUsageStats(hours);
  }

  getUserQuota(userId?: string) {
    return this.tokenTracker.getUserQuota(userId || this.userId);
  }

  getCacheStats() {
    return this.cacheManager.getStats();
  }

  clearCache(): void {
    this.cacheManager.clear();
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  getCostProjection(days: number = 7): number {
    return this.tokenTracker.projectCost(days);
  }
}
