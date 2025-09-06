// LLM Service Type Definitions

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  costPerMillion: number; // Cost per million tokens
  maxTokens: number;
  isFree: boolean;
  priority: number; // Lower number = higher priority
}

export interface LLMRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'json' | 'text';
  skipCache?: boolean;
  taskType?: 'suggestion' | 'metadata' | 'refinement' | 'general';
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  cached: boolean;
  error?: string;
}

export interface TokenUsage {
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  timestamp: number;
}

export interface UserQuota {
  dailyLimit: number;
  dailyUsed: number;
  costLimit: number;
  costUsed: number;
  resetTime: number;
}

export interface CacheEntry {
  key: string;
  response: LLMResponse;
  timestamp: number;
  ttl: number;
}

export interface StructuredOutputSchema {
  type: 'suggestion' | 'metadata' | 'refinement';
  schema: object;
}

// Structured response types
export interface SuggestionResponse {
  choices: Array<{
    text: string;
    weight: number;
  }>;
}

export interface MetadataResponse {
  tags: string[];
  subject: string;
  intensity: number;
}

export interface RefinementResponse {
  original: string;
  refined: string;
  changes: string[];
}

export interface LLMServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  mode: 'development' | 'production';
  cacheEnabled: boolean;
  dailyLimit: number;
  costLimit: number;
  proxyUrl?: string;
}

export interface LLMMetrics {
  timestamp: number;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  cacheHit: boolean;
  success: boolean;
  userId?: string;
  consentVerified: boolean;
  error?: string;
}