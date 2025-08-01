/**
 * Local Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Adapter for locally hosted AI models (Ollama, local inference servers)
 */
import { BaseAIModel,
  AIModelType,
  AIModelProvider,
  AIModelStatus,
  ModelMetadata,
  ModelCapabilities,
  CostEstimate,
  ModelInitializationError,
  ModelProcessingError }
  ModelUnavailableError
 from '../BaseAIModel';


export interface LocalModelConfig { endpoint: string;
  modelName: string;
  timeout?: number;
  maxRetries?: number;
  warmupOnInit?: boolean;
  modelType?: 'ollama' | 'huggingface' | 'custom';
  authToken?: string }



export interface LocalRequestOptions { temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stop?: string;
  stream?: boolean;
  seed?: number;
  repeat_penalty?: number;
  context_length?: number;
  system_prompt?: string }



export interface OllamaMessage { role: 'system' | 'user' | 'assistant' }
  content: string;




export interface LocalModelResponse { model: string;
  created_at: string;
  message?: { }
  role: string;
  content: string;


};
  response?: string;
  done: boolean;
  context?: number;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;

export class LocalModelAdapter extends BaseAIModel { private config: LocalModelConfig;
  private modelInfo: unknown = null;
  constructor(id: string, config: LocalModelConfig) {
    const metadata: ModelMetadata = {,
  name: config.modelName,
      version: '1.0' }
      description: `Local ${config.modelType || 'custom'},},
  model: ${config.modelName}`}
},
  provider: AIModelProvider.LOCAL,
      type: AIModelType.TEXT,
      costPerToken: 0, // Local models have no per-token cost
      averageLatency: 2000, // Generally slower than cloud APIs
      maxConcurrency: 5, // Limited by local hardware
      rateLimit: { ,
  requestsPerMinute: 60,
  tokensPerMinute: 50000 }
},
  tags: ['local', 'open-source', config.modelType || 'custom'],
      lastUpdated: new Date();
  };
    const capabilities: ModelCapabilities = { ,
  inputTypes: ['text', 'json'],
      outputTypes: ['text', 'json'],
      maxInputSize: 32000, // Varies by model
      maxOutputSize: 4096,
      supportsBatch: false,
      supportsStreaming: true,
      supportsAsync: true,
      customParameters: { }
  temperature: { type: 'number', min: 0, max: 2, default: 0.8 },
        max_tokens: { type: 'number', min: 1, max: 4096, default: 1000 },
        top_p: { type: 'number', min: 0, max: 1, default: 0.9 },
        top_k: { type: 'number', min: 1, max: 100, default: 40 },
        repeat_penalty: { type: 'number', min: 0.1, max: 2, default: 1.1 }
    };
    super(id, metadata, capabilities);
    this.config = config;
  async initialize(): Promise<void> { try {
      this._status = AIModelStatus.INITIALIZING;
      // Validate configuration
      if (!this.config.endpoint) {
        throw new Error('Endpoint is required for Local Model adapter');
      if (!this.config.modelName) {
        throw new Error('Model name is required for Local Model adapter');
      // Test connectivity and get model info
      await this._testConnection();
      await this._loadModelInfo();
      // Warm up model if requested
      if (this.config.warmupOnInit) {
        await this._warmupModel();
      this._status = AIModelStatus.READY;
      this._lastActivity = new Date() } catch (error) { this._status = AIModelStatus.ERROR;
  throw new ModelInitializationError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async process(input: unknown, options?: LocalRequestOptions): Promise<unknown> { }
  try { if (this._status !== AIModelStatus.READY) {
  throw new ModelUnavailableError(this._id);
  // Convert input to appropriate format
  const messages = this._convertToMessages(input, options?.system_prompt);
  // Prepare request payload based on model type
  const payload = this._buildPayload(messages, options);
  const endpoint = this._getEndpoint();
  const response = await this._makeRequest(endpoint, payload);
  // Extract and return the generated content
  return this._extractContent(response) } catch (error) { throw new ModelProcessingError(this._id, error instanceof Error ? error.message : 'Unknown error');
  async cleanup(): Promise<void> {
  this._status = AIModelStatus.OFFLINE;
  this._activeRequests.clear();
  this._requestQueue = [];
  async estimate(input: unknown, options?: LocalRequestOptions): Promise<CostEstimate> {
  // Local models have no cost, but we can estimate resource usage
  const messages = this._convertToMessages(input, options?.system_prompt);
  return {
  estimatedCost: 0
  currency: 'USD'
  confidence: 1.0
  breakdown: {
  inputCost: 0
  outputCost: 0
  processingCost: 0 }
};
  // Model management methods
  async pullModel(): Promise<void> {

    if (this.config.modelType !== 'ollama') {
      throw new Error('Model pulling is only supported for Ollama models');
    const response = await fetch(`${this.config.endpoint}/api/pull`, {)}

  method: 'POST'
      headers: { 'Content-Type': 'application/json' }
      body: JSON.stringify({ name: this.config.modelName })
    });
    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);}
  async listAvailableModels(): Promise<string> {

    try {
      const endpoint = this.config.modelType === 'ollama' ? '/api/tags' : '/models';
      const response = await fetch(`${this.config.endpoint}${endpoint}`, {)}

  headers: this._buildHeaders();
  });
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);}
      const data = await response.json();
      if (this.config.modelType === 'ollama') { return data.models?.map((model: any) => model.name) || [];
  return data.models || data || [] } catch (error) {
      console.warn('Failed to list available models:', error);
      return [];
  getModelInfo(): any {
    return this.modelInfo;
  // Private helper methods
  private async _testConnection(): Promise<void> {

    try {
      const healthEndpoint = this.config.modelType === 'ollama' ? '/api/tags' : '/health';
      const response = await fetch(`${this.config.endpoint}${healthEndpoint}`, {)}

  method: 'GET'
        headers: this._buildHeaders()
        signal: AbortSignal.timeout(this.config.timeout || 10000);
  });
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);}
 catch (error) {
      throw new Error(`Failed to connect to local model server: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  private async _loadModelInfo(): Promise<void> {

    try {
      if (this.config.modelType === 'ollama') {
        const response = await fetch(`${this.config.endpoint}/api/show`, {)}

  method: 'POST'
          headers: { 'Content-Type': 'application/json' }
          body: JSON.stringify({ name: this.config.modelName })
        });
        if (response.ok) { this.modelInfo = await response.json();
          // Update capabilities based on model info
          if (this.modelInfo.parameters) {
            this._updateCapabilitiesFromModelInfo(this.modelInfo) } catch (error) {
      console.warn('Failed to load model info:', error);
  private async _warmupModel(): Promise<void> {

    try {
      const warmupPayload = this._buildPayload(;);
        [{ role: 'user', content: 'Hello' }]
        { max_tokens: 1, temperature: 0 }
      );
      await this._makeRequest(this._getEndpoint(), warmupPayload);
 catch (error) { console.warn('Model warmup failed:', error);
  private _buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
  'Content-Type': 'application/json' }
};
    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;}
    return headers;
  private _getEndpoint(): string { switch (this.config.modelType) {
      case 'ollama':
        return '/api/chat';
      case 'huggingface':
        return '/generate';
      default:
        return '/generate';
  private _buildPayload(messages: OllamaMessage, options?: LocalRequestOptions): any {
    const basePayload = {
      model: this.config.modelName
      messages
      stream: false
      options: {
  temperature: options?.temperature ?? 0.8
        top_p: options?.top_p ?? 0.9
        top_k: options?.top_k ?? 40
        repeat_penalty: options?.repeat_penalty ?? 1.1 }
        ...(options?.max_tokens && { num_predict: options.max_tokens })
        ...(options?.stop && { stop: options.stop })
        ...(options?.seed && { seed: options.seed })
    };
    // Adapt payload based on model type
    switch (this.config.modelType) { case 'ollama':
  return basePayload;
  case 'huggingface':
  return {
  inputs: messages.map(m => m.content).join('\n')
  parameters: {
  max_new_tokens: options?.max_tokens || 1000
  temperature: options?.temperature || 0.8
  top_p: options?.top_p || 0.9
  top_k: options?.top_k || 40
  repetition_penalty: options?.repeat_penalty || 1.1 }
};
      default:
        return basePayload;
  private async _makeRequest(endpoint: string, payload: any): Promise<LocalModelResponse> {

    const url = `${this.config.endpoint}${endpoint}`;}
    let lastError: Error | null = null;
    const maxRetries = this.config.maxRetries ?? 3;
    for (let attempt = 0; attempt <= maxRetries; attempt++) { try {
  const response = await fetch(url, {)
  method: 'POST',
  headers: this._buildHeaders(),
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(this.config.timeout || 60000) }
});
        if (!response.ok) {
          const errorData = await response.text().catch(() => '');
          throw new Error(`Local model request failed: ${response.status} ${response.statusText} - ${errorData}`);}
        return response.json();
 catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    throw lastError || new Error('All retry attempts failed');
  private _convertToMessages(input: any, systemPrompt?: string): OllamaMessage {
    const messages: OllamaMessage = [];
    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    if (typeof input === 'string') {
      messages.push({ role: 'user', content: input });
 else if (Array.isArray(input)) {
      messages.push(...input.map(msg => {)
  if (typeof msg === 'string') {
          return { role: 'user', content: msg };
        return { role: msg.role || 'user',
  content: msg.content || JSON.stringify(msg) }
};
      }));
 else if (input && typeof input === 'object' && input.messages) { messages.push(...this._convertToMessages(input.messages)) } else {
      messages.push({ role: 'user', content: JSON.stringify(input) });
    return messages;
  private _extractContent(response: LocalModelResponse): any { let content = '';
    if (response.message?.content) {
      content = response.message.content } else if (response.response) { content = response.response;
  const usage = {
  input_tokens: response.prompt_eval_count || 0,
  output_tokens: response.eval_count || 0,
  total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0) }
};
    return { content,
  usage,
  model: response.model,
  done: response.done,
  performance: {,
  total_duration: response.total_duration,
  load_duration: response.load_duration,
  prompt_eval_duration: response.prompt_eval_duration,
  eval_duration: response.eval_duration }
},
  context: response.context;
  };
  private _estimateTokenCount(messages: OllamaMessage): number {
    const totalText = messages.map(msg => msg.content).join(' ');
    return Math.ceil(totalText.length / 4);
  private _updateCapabilitiesFromModelInfo(modelInfo: any): void {
    if (modelInfo.parameters) {
      const params = modelInfo.parameters;
      // Update context length if available
      if (params.num_ctx) {
        this._capabilities.maxInputSize = params.num_ctx;
      // Update other parameters based on model info
      this.updateMetadata({)
  description: `${this._metadata.description} - ${modelInfo.details?.family || 'Unknown family'}`}
},
  lastUpdated: new Date();
  });
  protected async _performHealthCheck(): Promise<void> {

    await this._testConnection();
  private updateMetadata(updates: Partial<ModelMetadata>): void {
    this._metadata = { ...this._metadata, ...updates };

export default LocalModelAdapter;