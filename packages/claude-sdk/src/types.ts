/**
 * Claude SDK types
 */

import { GraphDocument } from '@prompt-spaghetti/graph-core';

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface PromptSuggestion {
  text: string;
  confidence: number;
  reasoning?: string;
}

export interface ClaudeResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface GraphContext {
  graph: GraphDocument;
  selectedNodeId?: string;
  userIntent?: string;
}