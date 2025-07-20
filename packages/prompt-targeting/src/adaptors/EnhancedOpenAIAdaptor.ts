/**
 * Enhanced OpenAI adaptor with advanced pipeline features
 * Epic 10.2.1 - Enhanced ModelAdaptor Base Class
 */

import {
  TextToTextAdaptor,
  PlatformCapabilities,
  ValidationResult,
  PlatformPrompt,
  TranslationContext
} from '../types';
import { AdvancedBaseAdaptor, AdvancedAdaptorConfig } from './AdvancedBaseAdaptor';

/**
 * Enhanced OpenAI adaptor with full pipeline features
 */
export class EnhancedOpenAIAdaptor extends AdvancedBaseAdaptor implements TextToTextAdaptor {
  public readonly id = 'enhanced-openai-gpt';
  public readonly version = '2.0.0';
  public readonly name = 'Enhanced OpenAI GPT';
  public readonly description = 'Advanced OpenAI GPT adaptor with comprehensive pipeline';
  public readonly platforms = ['openai', 'chatgpt', 'gpt'];

  private openaiConfig: any = {};

  /**
   * Initialize with enhanced configuration
   */
  protected async onInitialize(): Promise<void> {
    this.openaiConfig = {
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
      baseURL: process.env.OPENAI_BASE_URL,
      ...this.config.openai
    };

    if (!this.openaiConfig.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Setup event listeners for monitoring
    this.setupEventListeners();
  }

  /**
   * Get enhanced platform capabilities
   */
  public async capabilities(): Promise<PlatformCapabilities> {
    const model = this.openaiConfig.model || 'gpt-4';
    const modelCapabilities = this.getModelCapabilities(model);

    return {
      platform: 'openai',
      version: this.version,
      maxTokens: modelCapabilities.maxTokens,
      parameterRanges: {
        temperature: [0.0, 2.0],
        top_p: [0.0, 1.0],
        frequency_penalty: [-2.0, 2.0],
        presence_penalty: [-2.0, 2.0],
        max_tokens: [1, modelCapabilities.maxTokens]
      },
      features: [
        'text-generation',
        'chat-completion',
        'system-messages',
        'function-calling',
        'json-mode',
        'streaming',
        'temperature-control',
        'top-p-sampling',
        'frequency-penalty',
        'presence-penalty',
        'stop-sequences',
        'advanced-pipeline',
        'content-optimization',
        'conversation-flow',
        'context-management'
      ],
      styleSupport: false,
      negativePromptSupport: false,
      customParameters: {
        model: model,
        supportsChatFormat: true,
        supportsSystemMessages: true,
        supportsFunctionCalling: this.supportsFunctionCalling(model),
        supportsJsonMode: this.supportsJsonMode(model),
        supportsAdvancedFeatures: true
      }
    };
  }

  /**
   * Get text generation specific capabilities
   */
  public async textCapabilities() {
    const model = this.openaiConfig.model || 'gpt-4';
    const modelCapabilities = this.getModelCapabilities(model);

    return {
      maxContextLength: modelCapabilities.maxTokens,
      supportsChatFormat: true,
      supportsSystemMessages: true,
      supportsFunctionCalling: this.supportsFunctionCalling(model),
      temperatureRange: [0.0, 2.0] as [number, number],
      topPRange: [0.0, 1.0] as [number, number]
    };
  }

  /**
   * Enhanced platform-specific validation
   */
  protected async performPlatformValidation(
    graph: any,
    config?: AdvancedAdaptorConfig
  ): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Enhanced content analysis
    const analysis = this.analyzeGraphContent(graph);
    
    // Token estimation with context awareness
    const tokenEstimate = this.estimateTokensWithContext(analysis);
    const model = this.openaiConfig.model || 'gpt-4';
    const modelCapabilities = this.getModelCapabilities(model);

    if (tokenEstimate.total > modelCapabilities.maxTokens * 0.9) {
      errors.push({
        code: 'CONTENT_EXCEEDS_LIMIT',
        message: `Content exceeds model limit (${tokenEstimate.total}/${modelCapabilities.maxTokens} tokens)`,
        severity: 'error',
        suggestion: 'Reduce content length or use a model with larger context window'
      });
    } else if (tokenEstimate.total > modelCapabilities.maxTokens * 0.7) {
      warnings.push({
        code: 'CONTENT_NEAR_LIMIT',
        message: `Content approaching model limit (${tokenEstimate.total}/${modelCapabilities.maxTokens} tokens)`,
        optimization: 'Consider optimizing content for better performance'
      });
    }

    // Advanced content type detection
    if (analysis.hasImageContent && !analysis.hasTextContent) {
      warnings.push({
        code: 'IMAGE_ONLY_CONTENT',
        message: 'Content is image-focused but targeting text model',
        optimization: 'Add descriptive text or consider image-to-text preprocessing'
      });
    }

    // Conversation flow validation
    if (analysis.conversationNodes > 1 && !analysis.hasSystemMessage) {
      warnings.push({
        code: 'MISSING_SYSTEM_MESSAGE',
        message: 'Multi-turn conversation without system context',
        optimization: 'Add system message for better conversation flow'
      });
    }

    // Function calling validation
    if (analysis.hasFunctionCalls && !this.supportsFunctionCalling(model)) {
      errors.push({
        code: 'UNSUPPORTED_FUNCTION_CALLING',
        message: `Model ${model} does not support function calling`,
        severity: 'error',
        suggestion: 'Use gpt-3.5-turbo or gpt-4 for function calling'
      });
    }

    // JSON mode validation
    if (analysis.requestsJsonOutput && !this.supportsJsonMode(model)) {
      warnings.push({
        code: 'JSON_MODE_UNAVAILABLE',
        message: `Model ${model} may not support JSON mode reliably`,
        optimization: 'Use explicit JSON formatting instructions'
      });
    }

    // Calculate enhanced compatibility score
    const baseScore = 1.0;
    const errorPenalty = errors.length * 0.3;
    const warningPenalty = warnings.length * 0.1;
    const contentQuality = this.assessContentQuality(analysis);
    
    const compatibilityScore = Math.max(0, baseScore - errorPenalty - warningPenalty + contentQuality * 0.2);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      compatibilityScore
    };
  }

  /**
   * Enhanced transformation with conversation handling
   */
  protected async performTransformation(
    graph: any,
    config?: AdvancedAdaptorConfig
  ): Promise<Omit<PlatformPrompt, 'metadata'>> {
    const analysis = this.analyzeGraphContent(graph);
    
    // Build enhanced prompt structure
    const promptStructure = this.buildEnhancedPromptStructure(graph, analysis, config);
    
    // Apply conversation optimization
    const optimizedStructure = this.optimizeConversationFlow(promptStructure, analysis);
    
    // Build parameters with advanced configuration
    const parameters = this.buildAdvancedParameters(graph, analysis, config);

    // Format final prompt
    const finalPrompt = this.formatPromptForOpenAI(optimizedStructure);

    return {
      platform: 'openai',
      prompt: finalPrompt.content,
      parameters: {
        ...parameters,
        ...finalPrompt.parameters
      }
    };
  }

  /**
   * Analyze graph content comprehensively
   */
  private analyzeGraphContent(graph: any): {
    hasTextContent: boolean;
    hasImageContent: boolean;
    conversationNodes: number;
    hasSystemMessage: boolean;
    hasFunctionCalls: boolean;
    requestsJsonOutput: boolean;
    contentComplexity: number;
    primaryIntent: string;
    topics: string[];
    sentiment: string;
  } {
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      return {
        hasTextContent: false,
        hasImageContent: false,
        conversationNodes: 0,
        hasSystemMessage: false,
        hasFunctionCalls: false,
        requestsJsonOutput: false,
        contentComplexity: 0,
        primaryIntent: 'unknown',
        topics: [],
        sentiment: 'neutral'
      };
    }

    let hasTextContent = false;
    let hasImageContent = false;
    let conversationNodes = 0;
    let hasSystemMessage = false;
    let hasFunctionCalls = false;
    let requestsJsonOutput = false;
    const allText = this.extractTextContent(graph);

    // Analyze nodes
    graph.nodes.forEach((node: any) => {
      if (node.data?.text || node.data?.content) {
        hasTextContent = true;
      }

      if (node.type === 'system' || node.data?.role === 'system') {
        hasSystemMessage = true;
      }

      if (['user', 'assistant', 'system'].includes(node.data?.role)) {
        conversationNodes++;
      }

      if (node.type === 'function' || node.data?.functionCall) {
        hasFunctionCalls = true;
      }

      // Image content detection
      const nodeText = (node.data?.text || '').toLowerCase();
      if (nodeText.includes('image') || nodeText.includes('picture') || nodeText.includes('visual')) {
        hasImageContent = true;
      }

      // JSON output detection
      if (nodeText.includes('json') || nodeText.includes('format') || node.data?.outputFormat === 'json') {
        requestsJsonOutput = true;
      }
    });

    // Analyze primary intent
    const primaryIntent = this.detectPrimaryIntent(allText);
    
    // Extract topics
    const topics = this.extractTopics(allText);
    
    // Assess sentiment
    const sentiment = this.assessSentiment(allText);
    
    // Calculate complexity
    const contentComplexity = this.calculateContentComplexity(graph, allText);

    return {
      hasTextContent,
      hasImageContent,
      conversationNodes,
      hasSystemMessage,
      hasFunctionCalls,
      requestsJsonOutput,
      contentComplexity,
      primaryIntent,
      topics,
      sentiment
    };
  }

  /**
   * Estimate tokens with enhanced context awareness
   */
  private estimateTokensWithContext(analysis: any): {
    content: number;
    system: number;
    conversation: number;
    functions: number;
    total: number;
  } {
    // More sophisticated token estimation
    const contentTokens = Math.ceil(analysis.contentComplexity * 1.2); // Account for complexity
    const systemTokens = analysis.hasSystemMessage ? 50 : 0;
    const conversationTokens = analysis.conversationNodes * 30;
    const functionTokens = analysis.hasFunctionCalls ? 100 : 0;

    return {
      content: contentTokens,
      system: systemTokens,
      conversation: conversationTokens,
      functions: functionTokens,
      total: contentTokens + systemTokens + conversationTokens + functionTokens
    };
  }

  /**
   * Build enhanced prompt structure
   */
  private buildEnhancedPromptStructure(graph: any, analysis: any, config?: AdvancedAdaptorConfig): any {
    const structure = {
      system: null as string | null,
      messages: [] as any[],
      functions: [] as any[],
      context: {} as any
    };

    if (!graph.nodes) return structure;

    // Process nodes in dependency order
    const processedNodes = this.topologicalSort(graph);
    
    for (const node of processedNodes) {
      switch (node.type) {
      case 'system':
        structure.system = this.enhanceSystemMessage(node.data?.text || node.data?.content, analysis);
        break;
          
      case 'user':
      case 'assistant':
        structure.messages.push({
          role: node.type,
          content: node.data?.text || node.data?.content,
          metadata: { nodeId: node.id, ...node.data?.metadata }
        });
        break;
          
      case 'function':
        structure.functions.push({
          name: node.data?.name,
          description: node.data?.description,
          parameters: node.data?.parameters
        });
        break;
          
      default:
        // Handle other node types as context
        if (node.data?.text || node.data?.content) {
          structure.context[node.type] = node.data.text || node.data.content;
        }
      }
    }

    return structure;
  }

  /**
   * Optimize conversation flow
   */
  private optimizeConversationFlow(structure: any, analysis: any): any {
    // Ensure proper conversation structure
    if (structure.messages.length > 0) {
      // Add system message if missing but beneficial
      if (!structure.system && analysis.conversationNodes > 1) {
        structure.system = this.generateContextualSystemMessage(analysis);
      }
      
      // Optimize message ordering
      structure.messages = this.optimizeMessageOrder(structure.messages);
      
      // Merge context into appropriate messages
      structure.messages = this.mergeContextIntoMessages(structure.messages, structure.context);
    } else if (Object.keys(structure.context).length > 0) {
      // Convert context to single message
      const contextContent = Object.values(structure.context).join('\n\n');
      structure.messages.push({
        role: 'user',
        content: contextContent
      });
    }

    return structure;
  }

  /**
   * Build advanced parameters
   */
  private buildAdvancedParameters(graph: any, analysis: any, config?: AdvancedAdaptorConfig): Record<string, unknown> {
    const parameters: Record<string, unknown> = {
      model: this.openaiConfig.model || 'gpt-4'
    };

    // Intent-based parameter optimization
    switch (analysis.primaryIntent) {
    case 'creative':
      parameters.temperature = 0.8;
      parameters.top_p = 0.9;
      break;
    case 'analytical':
      parameters.temperature = 0.2;
      parameters.top_p = 0.8;
      break;
    case 'conversational':
      parameters.temperature = 0.6;
      parameters.presence_penalty = 0.3;
      break;
    default:
      parameters.temperature = 0.7;
    }

    // Quality preference override
    if (config?.qualityPreference !== undefined) {
      parameters.temperature = this.normalizeParameter(
        1 - config.qualityPreference,
        [0, 1],
        [0.1, 1.2]
      );
    }

    // JSON mode if requested
    if (analysis.requestsJsonOutput && this.supportsJsonMode(parameters.model as string)) {
      parameters.response_format = { type: 'json_object' };
    }

    // Function calling setup
    if (analysis.hasFunctionCalls) {
      parameters.function_call = 'auto';
    }

    // Apply platform overrides
    if (config?.platformOverrides?.openai) {
      Object.assign(parameters, config.platformOverrides.openai);
    }

    return parameters;
  }

  /**
   * Format prompt for OpenAI API
   */
  private formatPromptForOpenAI(structure: any): { content: string; parameters: Record<string, unknown> } {
    const parameters: Record<string, unknown> = {};
    
    if (structure.system) {
      parameters.system = structure.system;
    }

    if (structure.functions && structure.functions.length > 0) {
      parameters.functions = structure.functions;
    }

    // Handle conversation vs single prompt
    if (structure.messages.length > 1 || structure.system) {
      // Chat completion format
      const messages = [];
      
      if (structure.system) {
        messages.push({ role: 'system', content: structure.system });
      }
      
      messages.push(...structure.messages);
      
      parameters.messages = messages;
      return { content: '', parameters };
    } else if (structure.messages.length === 1) {
      // Single completion
      return { content: structure.messages[0].content, parameters };
    } else {
      // Fallback
      return { content: Object.values(structure.context).join('\n\n'), parameters };
    }
  }

  // Abstract method implementations
  protected isValidGraphStructure(graph: any): boolean {
    return graph && typeof graph === 'object' && Array.isArray(graph.nodes) && Array.isArray(graph.edges);
  }

  protected hasCycles(graph: any): boolean {
    // Simple cycle detection - can be enhanced
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const edges = graph.edges?.filter((e: any) => e.source === nodeId) || [];
      for (const edge of edges) {
        if (dfs(edge.target)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };

    return graph.nodes?.some((node: any) => dfs(node.id)) || false;
  }

  protected hasIncoherentContent(content: string): boolean {
    // Basic coherence check - can be enhanced with NLP
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return false;
    
    // Check for contradictory words
    const contradictions = [
      ['yes', 'no'], ['good', 'bad'], ['hot', 'cold'], ['fast', 'slow']
    ];
    
    const lowerContent = content.toLowerCase();
    return contradictions.some(([word1, word2]) => 
      lowerContent.includes(word1) && lowerContent.includes(word2)
    );
  }

  protected estimateComplexity(graph: any): number {
    if (!graph.nodes) return 0;
    
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges?.length || 0;
    const textLength = this.extractTextContent(graph).length;
    
    return nodeCount * 2 + edgeCount + Math.floor(textLength / 100);
  }

  protected normalizeGraphStructure(graph: any): any {
    // Ensure consistent node structure
    const normalizedNodes = graph.nodes?.map((node: any) => ({
      id: node.id,
      type: node.type || 'unknown',
      data: {
        text: node.data?.text || node.data?.content || '',
        ...node.data
      }
    })) || [];

    return {
      ...graph,
      nodes: normalizedNodes,
      edges: graph.edges || []
    };
  }

  protected async applyPreprocessingOptimizations(graph: any, context: TranslationContext): Promise<any> {
    // Content deduplication
    const deduplicated = this.deduplicateContent(graph);
    
    // Node merging for efficiency
    const merged = this.mergeCompatibleNodes(deduplicated);
    
    return merged;
  }

  protected canOptimizeContent(graph: any): boolean {
    const content = this.extractTextContent(graph);
    return content.length > 500 || (graph.nodes?.length || 0) > 10;
  }

  protected canOptimizeStructure(graph: any): boolean {
    return (graph.nodes?.length || 0) > 5 && (graph.edges?.length || 0) > 5;
  }

  protected applyPostprocessingFilters(result: any, context: TranslationContext): any {
    // Remove sensitive content markers
    if (result.prompt) {
      result.prompt = this.sanitizeContent(result.prompt);
    }
    
    // Optimize parameter values
    result.parameters = this.optimizeParameters(result.parameters);
    
    return result;
  }

  protected validateFinalResult(result: any): boolean {
    return !!(result.prompt || result.parameters?.messages) && result.parameters && result.platform;
  }

  // Helper methods
  private setupEventListeners(): void {
    this.on('pipeline:stage', (stage: string, result: any) => {
      if (this.config.monitoring?.enableTiming) {
        this.logger.log(`Stage ${stage} completed in ${result.duration}ms`);
      }
    });
  }

  private getModelCapabilities(model: string): { maxTokens: number } {
    const capabilities: Record<string, { maxTokens: number }> = {
      'gpt-4': { maxTokens: 8192 },
      'gpt-4-32k': { maxTokens: 32768 },
      'gpt-4-turbo': { maxTokens: 128000 },
      'gpt-4-turbo-preview': { maxTokens: 128000 },
      'gpt-3.5-turbo': { maxTokens: 4096 },
      'gpt-3.5-turbo-16k': { maxTokens: 16384 }
    };
    
    return capabilities[model] || { maxTokens: 4096 };
  }

  private supportsFunctionCalling(model: string): boolean {
    return model.includes('gpt-4') || model.includes('gpt-3.5-turbo');
  }

  private supportsJsonMode(model: string): boolean {
    return model.includes('gpt-4') || model.includes('gpt-3.5-turbo');
  }

  private detectPrimaryIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('creative') || lowerText.includes('story') || lowerText.includes('imagine')) {
      return 'creative';
    }
    if (lowerText.includes('analyze') || lowerText.includes('explain') || lowerText.includes('calculate')) {
      return 'analytical';
    }
    if (lowerText.includes('chat') || lowerText.includes('conversation') || lowerText.includes('discuss')) {
      return 'conversational';
    }
    
    return 'general';
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - can be enhanced with NLP
    const topics = [];
    const topicKeywords = [
      'technology', 'science', 'business', 'education', 'health', 'politics',
      'entertainment', 'sports', 'travel', 'food', 'art', 'music'
    ];
    
    const lowerText = text.toLowerCase();
    for (const topic of topicKeywords) {
      if (lowerText.includes(topic)) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  private assessSentiment(text: string): string {
    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'wrong'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateContentComplexity(graph: any, text: string): number {
    const baseComplexity = text.length / 4; // Rough token estimate
    const nodeComplexity = (graph.nodes?.length || 0) * 10;
    const edgeComplexity = (graph.edges?.length || 0) * 5;
    
    return Math.floor(baseComplexity + nodeComplexity + edgeComplexity);
  }

  private assessContentQuality(analysis: any): number {
    let quality = 0.5; // Base quality
    
    if (analysis.hasTextContent) quality += 0.2;
    if (analysis.hasSystemMessage && analysis.conversationNodes > 1) quality += 0.1;
    if (analysis.topics.length > 0) quality += 0.1;
    if (analysis.primaryIntent !== 'unknown') quality += 0.1;
    
    return Math.min(1.0, quality);
  }

  private enhanceSystemMessage(original: string, analysis: any): string {
    if (!original) return this.generateContextualSystemMessage(analysis);
    
    // Enhance existing system message based on analysis
    let enhanced = original;
    
    if (analysis.sentiment === 'positive' && !enhanced.includes('helpful')) {
      enhanced += ' Be helpful and encouraging.';
    }
    
    if (analysis.primaryIntent === 'creative' && !enhanced.includes('creative')) {
      enhanced += ' Use creativity and imagination.';
    }
    
    return enhanced;
  }

  private generateContextualSystemMessage(analysis: any): string {
    const intents: Record<string, string> = {
      creative: 'You are a creative assistant. Use imagination and provide engaging, original responses.',
      analytical: 'You are an analytical assistant. Provide thorough, logical, and well-reasoned responses.',
      conversational: 'You are a conversational assistant. Be natural, engaging, and maintain context.',
      general: 'You are a helpful assistant.'
    };
    
    return intents[analysis.primaryIntent] || intents.general;
  }

  private topologicalSort(graph: any): any[] {
    // Simple topological sort for processing order
    const nodes = [...(graph.nodes || [])];
    const edges = graph.edges || [];
    
    // For now, return nodes as-is. Can be enhanced for proper topological ordering
    return nodes;
  }

  private optimizeMessageOrder(messages: any[]): any[] {
    // Ensure proper conversation flow
    return messages.sort((a, b) => {
      const roleOrder = { system: 0, user: 1, assistant: 2 };
      return (roleOrder[a.role as keyof typeof roleOrder] || 3) - (roleOrder[b.role as keyof typeof roleOrder] || 3);
    });
  }

  private mergeContextIntoMessages(messages: any[], context: any): any[] {
    if (Object.keys(context).length === 0) return messages;
    
    // Add context as first user message if no user messages exist
    if (!messages.some(m => m.role === 'user')) {
      const contextContent = Object.values(context).join('\n\n');
      messages.unshift({ role: 'user', content: contextContent });
    }
    
    return messages;
  }

  private deduplicateContent(graph: any): any {
    // Remove duplicate nodes with same content
    const seen = new Set();
    const uniqueNodes = (graph.nodes || []).filter((node: any) => {
      const content = node.data?.text || node.data?.content || '';
      if (seen.has(content)) return false;
      seen.add(content);
      return true;
    });
    
    return { ...graph, nodes: uniqueNodes };
  }

  private mergeCompatibleNodes(graph: any): any {
    // Merge nodes of same type with similar content
    // For now, return as-is. Can be enhanced with actual merging logic
    return graph;
  }

  private sanitizeContent(content: string): string {
    // Remove potential sensitive markers
    return content.replace(/\[SENSITIVE\]/g, '').replace(/\[REDACTED\]/g, '');
  }

  private optimizeParameters(parameters: Record<string, unknown>): Record<string, unknown> {
    // Ensure parameters are within valid ranges
    const optimized = { ...parameters };
    
    if (typeof optimized.temperature === 'number') {
      optimized.temperature = Math.max(0.0, Math.min(2.0, optimized.temperature));
    }
    
    if (typeof optimized.top_p === 'number') {
      optimized.top_p = Math.max(0.0, Math.min(1.0, optimized.top_p));
    }
    
    return optimized;
  }
}