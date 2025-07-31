/**
 * Anthropic Claude Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Concrete implementation of BaseAIModel for Anthropic Claude models
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
export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}
}
}
export interface AnthropicRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string;
  stream?: boolean;
  system?: string;
  tools?: unknown;
}
  tool_choice?: { type: 'auto' | 'any' | 'tool', name?: string };
}
}
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
  type: 'text' | 'image';
  text?: string;
  source?: {
  type: 'base64';
  media_type: string;
  data: string;
}
};
  }>;
}
}
export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
  type: 'text';
  text: string;
}
}>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
  stop_sequence?: string;
  usage: {
  input_tokens: number;
  output_tokens: number;
};
}
export class AnthropicAdapter extends BaseAIModel {
  private config: AnthropicConfig;
  private apiEndpoint: string;
  constructor(id: string, config: AnthropicConfig, modelName: string = 'claude-3-sonnet-20240229') {
    const metadata: ModelMetadata = {,
  name: modelName,
      version: '1.0',
      description: `Anthropic ${modelName} model adapter`}
},
  provider: AIModelProvider.ANTHROPIC,
      type: AIModelType.TEXT,
      costPerToken: AnthropicAdapter.getModelCostPerToken(modelName),
      averageLatency: AnthropicAdapter.getModelAverageLatency(modelName),
      maxConcurrency: 20,
      rateLimit: {
  requestsPerMinute: 1000,
  tokensPerMinute: 80000,
},
  tags: ['chat', 'reasoning', 'analysis', 'multimodal'],
      lastUpdated: new Date();
  };
    const capabilities: ModelCapabilities = {,
  inputTypes: ['text', 'json', 'image'],
      outputTypes: ['text', 'json'],
      maxInputSize: AnthropicAdapter.getModelMaxTokens(modelName),
      maxOutputSize: 4096,
      supportsBatch: false,
      supportsStreaming: true,
      supportsAsync: true,
      customParameters: {
  temperature: { type: 'number', min: 0, max: 1, default: 1 },
        max_tokens: { type: 'number', min: 1, max: 4096, default: 1000 },
        top_p: { type: 'number', min: 0, max: 1, default: 1 },
        top_k: { type: 'number', min: 0, max: 500, default: 5 }
    };
    super(id, metadata, capabilities);
    this.config = config;
    this.apiEndpoint = config.baseURL || 'https://api.anthropic.com';
  async initialize(): Promise<void> {

    try {
      this._status = AIModelStatus.INITIALIZING;
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('Anthropic API key is required');
      // Test connectivity
      await this._testConnection();
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date();
    } catch (error) {
      this._status = AIModelStatus.ERROR;
      throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async process(input: unknown, options?: AnthropicRequestOptions): Promise<unknown> {

    try {
      if (this._status !== AIModelStatus.READY) {
        throw new ModelUnavailableError(this._id);
      // Convert input to Anthropic format
      const messages = this._convertToMessages(input);
      // Prepare request payload
      const payload = {
        model: options?.model || this._metadata.name,
        messages,
        max_tokens: options?.max_tokens ?? 1000,
        temperature: options?.temperature ?? 1,
        top_p: options?.top_p ?? 1,
        top_k: options?.top_k ?? 5,
        ...(options?.stop_sequences && { stop_sequences: options.stop_sequences }),
        ...(options?.stream && { stream: options.stream }),
        ...(options?.system && { system: options.system }),
        ...(options?.tools && { tools: options.tools }),
        ...(options?.tool_choice && { tool_choice: options.tool_choice })
      };
      const response = await this._makeRequest('/v1/messages', payload);
      // Extract and return the generated content
      return this._extractContent(response);
    } catch (error) {
  throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async cleanup(): Promise<void> {,
  this._status = AIModelStatus.OFFLINE;
  this._activeRequests.clear();
  this._requestQueue = [];
  async estimate(input: unknown, options?: AnthropicRequestOptions): Promise<CostEstimate> {,
  const messages = this._convertToMessages(input);
  const inputTokens = this._estimateTokenCount(messages);
  const outputTokens = options?.max_tokens || 1000;
  const inputCost = inputTokens * (this._metadata.costPerToken || 0);
  const outputCost = outputTokens * (this._metadata.costPerToken || 0) * 3; // Output tokens cost 3x for Claude;
  return {
  estimatedCost: inputCost + outputCost,
  currency: 'USD',
  confidence: 0.85,
  breakdown: {
  inputCost,
  outputCost,
  processingCost: 0,
};
  // Static helper methods for model configuration
  static getModelCostPerToken(modelName: string): number {
  const costs: Record<string, number> = {,
  'claude-3-haiku-20240307': 0.00000025, // $0.25 / 1M tokens input,
  'claude-3-sonnet-20240229': 0.000003, // $3.00 / 1M tokens input,
  'claude-3-opus-20240229': 0.000015, // $15.00 / 1M tokens input,
  'claude-3-5-sonnet-20241022': 0.000003, // $3.00 / 1M tokens input,
  'claude-3-5-haiku-20241022': 0.000001 // $1.00 / 1M tokens input,
};
    return costs[modelName] || 0.000003;
  static getModelMaxTokens(modelName: string): number {
  const maxTokens: Record<string, number> = {,
  'claude-3-haiku-20240307': 200000,
  'claude-3-sonnet-20240229': 200000,
  'claude-3-opus-20240229': 200000,
  'claude-3-5-sonnet-20241022': 200000,
  'claude-3-5-haiku-20241022': 200000,
};
    return maxTokens[modelName] || 200000;
  static getModelAverageLatency(modelName: string): number {
  const latencies: Record<string, number> = {,
  'claude-3-haiku-20240307': 600,
  'claude-3-sonnet-20240229': 1200,
  'claude-3-opus-20240229': 3000,
  'claude-3-5-sonnet-20241022': 1000,
  'claude-3-5-haiku-20241022': 500,
};
    return latencies[modelName] || 1200;
  // Private helper methods
  private async _testConnection(): Promise<void> {

    try {
      // Anthropic doesn't have a public models endpoint, so we test with a minimal message
      const testPayload = {
        model: this._metadata.name,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      };
      const response = await fetch(`${this.apiEndpoint}/v1/messages`, {)}
  },
  method: 'POST',
        headers: {
  'x-api-key': this.config.apiKey,
  'content-type': 'application/json',
  'anthropic-version': '2023-06-01',
},
  body: JSON.stringify(testPayload);
  });
      if (!response.ok) {
        throw new Error(`Anthropic API test failed: ${response.status} ${response.statusText}`);}
    } catch (error) {
      throw new Error(`Failed to connect to Anthropic API: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  private async _makeRequest(endpoint: string, payload: unknown): Promise<AnthropicResponse> {

    const url = `${this.apiEndpoint}${endpoint}`;}
    const response = await fetch(url, {)
  method: 'POST',
  headers: {
  'x-api-key': this.config.apiKey,
  'content-type': 'application/json',
  'anthropic-version': '2023-06-01',
},
  body: JSON.stringify(payload);
  });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);}
    return response.json();
  private _convertToMessages(input: unknown): ClaudeMessage {
    if (typeof input === 'string') {
      return [{ role: 'user', content: input }];
    if (Array.isArray(input)) {
      return input.map(msg => {)
  if (typeof msg === 'string') {
          return { role: 'user', content: msg };
        // Convert OpenAI format to Claude format
        if (msg.role === 'system') {
          // System messages need to be handled separately in Claude
          return { role: 'user', content: `System: ${msg.content}` };}
        return {
  role: msg.role === 'assistant' ? 'assistant' : 'user',
  content: msg.content,
};
      });
    if (input && typeof input === 'object' && input.messages) {
      return this._convertToMessages(input.messages);
    return [{ role: 'user', content: JSON.stringify(input) }];
  private _extractContent(response: AnthropicResponse): unknown {
  const textContent = response.content;
  .filter(item => item.type === 'text')
  .map(item => item.text)
  .join('');
  return {
  content: textContent,
  role: 'assistant',
  stopReason: response.stop_reason,
  usage: response.usage,
  model: response.model,
  id: response.id,
};
  private _estimateTokenCount(messages: ClaudeMessage): number {
  // Rough estimation: 4 characters per token for Claude,
  const totalText = messages.map(msg => {)
  if (typeof msg.content === 'string') {
  return msg.content;
  return msg.content
  .filter(item => item.type === 'text')
  .map(item => item.text || '')
  .join('');
}).join(' ');
    return Math.ceil(totalText.length / 4);
  protected async _performHealthCheck(): Promise<void> {

    await this._testConnection();

export default AnthropicAdapter;