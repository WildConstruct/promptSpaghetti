// Epic 16 Marketplace - Claude Preview Service with IP Protection
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { MarketplaceDAO } from './dao';
import { PreviewRequest, PreviewResponse } from './types';
import * as crypto from 'crypto';

}
}
interface ClaudeAPIResponse {
  content: Array<{
    type: string;
    text: string;
}
}
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

}
}
interface CachedPreview {
  output: string;
  cost_estimate: number;
  quality_score: number;
  token_usage: {
    input_tokens: number;
    output_tokens: number;
}
}
  };
  cached_at: Date;
}

@Injectable()
export class ClaudePreviewService {
  private dao: MarketplaceDAO;
  private redis: any; // Redis client for caching
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly PREVIEW_RATE_LIMIT = 15; // 15 previews per minute per user

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
    this.initializeRedis();
  }

  /**
   * Generate a protected preview of a template
   */
  async generatePreview(userId: string, request: PreviewRequest): Promise<PreviewResponse> {

    // Rate limiting check
    await this.checkRateLimit(userId);

    // Get template and version
    const template = await this.dao.getTemplate(request.template_id);
    if (!template) {
      throw new Error('Template not found');
    }

    const version = await this.dao.getVersion(request.version_id || template.current_version_id);
    if (!version) {
      throw new Error('Template version not found');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.getCachedPreview(cacheKey);
    if (cached) {
      await this.recordPreviewEvent(userId, request.template_id, request.version_id, true);
      return {
        ...cached,
        cached: true
      };
    }

    // Check if user owns the template
    const userOwnsTemplate = await this.checkTemplateOwnership(userId, request.template_id);
    
    // Generate protected prompt
    const protectedPrompt = this.createProtectedPrompt(version, userOwnsTemplate, request.user_input);
    
    // Call Claude API
    const claudeResponse = await this.callClaudeAPI(
      protectedPrompt,
      request.claude_model_override || version.claude_model
    );

    // Process response
    const previewResponse = this.processClaudeResponse(claudeResponse, version, userOwnsTemplate);

    // Cache the result
    await this.cachePreview(cacheKey, previewResponse);

    // Record preview event
    await this.recordPreviewEvent(userId, request.template_id, request.version_id, false);

    return {
      ...previewResponse,
      cached: false
    };
  }

  /**
   * Get template preview metadata without generating
   */
  async getPreviewMetadata(templateId: string, versionId?: string): Promise<any> {

    const template = await this.dao.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const version = await this.dao.getVersion(versionId || template.current_version_id);
    if (!version) {
      throw new Error('Template version not found');
    }

    return {
      template_id: template.id,
      version_id: version.id,
      claude_model: version.claude_model,
      estimated_tokens: version.token_per_run_estimate,
      estimated_cost: this.calculateEstimatedCost(version.token_per_run_estimate),
      safety_score: version.safety_score,
      can_preview: template.status === 'listed',
      preview_limitations: this.getPreviewLimitations(template.price_cents > 0)
    };
  }

  /**
   * Create a protected prompt that masks sensitive IP
   */
  private createProtectedPrompt(
    version: any, 
    userOwnsTemplate: boolean, 
    userInput?: any
  ): string {
    let prompt = '';
    
    try {
      // Parse the graph JSON to extract prompt structure
      const graph = version.graph_json;
      
      if (userOwnsTemplate) {
        // User owns template, show full prompt
        prompt = this.buildFullPrompt(graph, userInput);
      } else {
        // User doesn't own template, create protected version
        prompt = this.buildProtectedPrompt(graph, userInput);
      }
    } catch (error) {
      console.error('Error building prompt:', error);
      // Fallback to simple protected prompt
      prompt = this.buildSimpleProtectedPrompt(userInput);
    }

    return prompt;
  }

  /**
   * Build full prompt for template owners
   */
  private buildFullPrompt(graph: any, userInput?: any): string {
    // This would integrate with the existing graph execution engine
    // For now, we'll create a simplified version
    
    const nodes = graph.nodes || [];
    const outputNodes = nodes.filter((node: any) => node.type === 'output');
    
    if (outputNodes.length === 0) {
      return 'This template generates creative content based on your input.';
    }

    // Extract the main prompt from output nodes
    const mainPrompt = outputNodes[0]?.data?.text || 'Generate creative content';
    
    // Inject user input if provided
    if (userInput && typeof userInput === 'object') {
      let finalPrompt = mainPrompt;
      Object.entries(userInput).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });
      return finalPrompt;
    }
    
    return mainPrompt;
  }

  /**
   * Build protected prompt that masks proprietary content
   */
  private buildProtectedPrompt(graph: any, userInput?: any): string {
    const nodes = graph.nodes || [];
    const outputNodes = nodes.filter((node: any) => node.type === 'output');
    
    if (outputNodes.length === 0) {
      return this.buildSimpleProtectedPrompt(userInput);
    }

    // Create a simplified version of the prompt
    const originalPrompt = outputNodes[0]?.data?.text || '';
    
    // Replace sensitive patterns with placeholders
    let protectedPrompt = originalPrompt
      .replace(/\[SYSTEM:\s*([^\]]+)\]/gi, '[PROTECTED_SYSTEM_INSTRUCTION]')
      .replace(/\[CONTEXT:\s*([^\]]+)\]/gi, '[PROTECTED_CONTEXT]')
      .replace(/\[INSTRUCTIONS:\s*([^\]]+)\]/gi, '[PROTECTED_INSTRUCTIONS]')
      .replace(/\[EXAMPLES?:\s*([^\]]+)\]/gi, '[PROTECTED_EXAMPLES]')
      .replace(/You are a[^.]+\./gi, 'You are a specialized AI assistant.')
      .replace(/Your role is to[^.]+\./gi, 'Your role is to assist the user.')
      .replace(/Follow these specific guidelines:[^.]+\./gi, 'Follow the provided guidelines.');

    // Limit length to prevent full prompt exposure
    if (protectedPrompt.length > 200) {
      protectedPrompt = protectedPrompt.substring(0, 200) + '... [CONTENT_PROTECTED]';
    }

    // Add preview disclaimer
    const disclaimer = '\n\n[PREVIEW MODE: This is a limited preview. Purchase the template to access the full prompt and capabilities.]';
    
    // Inject user input if provided
    if (userInput && typeof userInput === 'object') {
      Object.entries(userInput).forEach(([key, value]) => {
        protectedPrompt = protectedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });
    }
    
    return protectedPrompt + disclaimer;
  }

  /**
   * Build simple protected prompt as fallback
   */
  private buildSimpleProtectedPrompt(userInput?: any): string {
    let prompt = 'This is a premium template that generates high-quality content. ';
    
    if (userInput && typeof userInput === 'object') {
      const inputKeys = Object.keys(userInput);
      if (inputKeys.length > 0) {
        prompt += `Based on your input: ${inputKeys.map(key => `${key}: ${userInput[key]}`).join(', ')}. `;
      }
    }
    
    prompt += 'Purchase this template to access the full prompt and generate complete outputs.';
    return prompt;
  }

  /**
   * Call Claude API with the prepared prompt
   */
  private async callClaudeAPI(prompt: string, model: string): Promise<ClaudeAPIResponse> {

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
  }
        body: JSON.stringify({
          model: model,
          max_tokens: 1000, // Limit tokens for previews
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
  }
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Claude API call failed:', error);
      
      // Return mock response for development/fallback
      return {
        content: [
          {
            type: 'text',
            text: 'This is a preview of the template output. The actual output would be generated by Claude AI based on the full template prompt. Purchase the template to see the complete AI-generated response.'
          }
        ],
        usage: {
          input_tokens: prompt.length / 4, // Rough estimation
          output_tokens: 50
        }
      };
    }
  }

  /**
   * Process Claude API response into preview format
   */
  private processClaudeResponse(
    claudeResponse: ClaudeAPIResponse, 
    version: any, 
    userOwnsTemplate: boolean
  ): Omit<PreviewResponse, 'cached'> {
    const output = claudeResponse.content
      .filter(content => content.type === 'text')
      .map(content => content.text)
      .join('\n');

    const tokenUsage = claudeResponse.usage;
    const costEstimate = this.calculateCost(tokenUsage.input_tokens, tokenUsage.output_tokens);
    const qualityScore = this.calculateQualityScore(output, version.safety_score);

    let processedOutput = output;
    const redactedSections: string[] = [];

    // Add watermark for non-owners
    if (!userOwnsTemplate) {
      processedOutput += '\n\n---\n🔒 This is a preview. Purchase the template for the complete output and access to the full prompt.';
      redactedSections.push('full_prompt_access', 'complete_output');
    }

    return {
      output: processedOutput,
      cost_estimate: costEstimate,
      quality_score: qualityScore,
      token_usage: tokenUsage,
      redacted_sections: redactedSections
    };
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude pricing (approximate, should be updated with actual rates)
    const INPUT_COST_PER_1K = 0.008; // $0.008 per 1K input tokens
    const OUTPUT_COST_PER_1K = 0.024; // $0.024 per 1K output tokens
    
    const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
    const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;
    
    return inputCost + outputCost;
  }

  /**
   * Calculate estimated cost for token count
   */
  private calculateEstimatedCost(estimatedTokens: number): number {
    return this.calculateCost(estimatedTokens * 0.7, estimatedTokens * 0.3);
  }

  /**
   * Calculate quality score based on output and safety
   */
  private calculateQualityScore(output: string, safetyScore: number): number {
    let score = safetyScore * 2; // Base score from safety (0-2)
    
    // Add points for output quality indicators
    if (output.length > 100) score += 1;
    if (output.includes('\n')) score += 0.5; // Structured output
    if (!/\[PROTECTED|PREVIEW MODE\]/.test(output)) score += 1;
    
    // Normalize to 0-5 scale
    return Math.min(5, Math.max(0, score));
  }

  /**
   * Check if user owns the template
   */
  private async checkTemplateOwnership(userId: string, templateId: string): Promise<boolean> {

    const query = `
      SELECT 1 FROM marketplace_purchases 
      WHERE buyer_id = $1 AND template_id = $2 AND status = 'succeeded'
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [userId, templateId]);
    return result.rows.length > 0;
  }

  /**
   * Generate cache key for preview
   */
  private generateCacheKey(request: PreviewRequest): string {
    const inputHash = request.user_input 
      ? crypto.createHash('md5').update(JSON.stringify(request.user_input)).digest('hex')
      : 'no-input';
    
    return `preview:${request.template_id}:${request.version_id}:${inputHash}`;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(userId: string): Promise<void> {

    if (!this.redis) return;

    const key = `rate_limit:preview:${userId}`;
    const current = await this.redis.get(key);
    
    if (current && parseInt(current) >= this.PREVIEW_RATE_LIMIT) {
      throw new Error('Rate limit exceeded. Please wait before requesting another preview.');
    }
    
    await this.redis.incr(key);
    await this.redis.expire(key, 60); // 1 minute window
  }

  /**
   * Cache preview result
   */
  private async cachePreview(key: string, preview: Omit<PreviewResponse, 'cached'>): Promise<void> {

    if (!this.redis) return;

    const cached: CachedPreview = {
      ...preview,
      cached_at: new Date()
    };

    await this.redis.setex(key, this.CACHE_TTL, JSON.stringify(cached));
  }

  /**
   * Get cached preview
   */
  private async getCachedPreview(key: string): Promise<CachedPreview | null> {

    if (!this.redis) return null;

    const cached = await this.redis.get(key);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached preview:', error);
      return null;
    }
  }

  /**
   * Record preview event for analytics
   */
  private async recordPreviewEvent(
    userId: string, 
    templateId: string, 
    versionId?: string,
    cached: boolean = false
  ): Promise<void> {

    await this.dao.recordEvent({
      event_type: 'preview',
      user_id: userId,
      template_id: templateId,
      version_id: versionId,
      metadata: { cached }
    });
  }

  /**
   * Get preview limitations for UI display
   */
  private getPreviewLimitations(isPaid: boolean): string[] {
    const limitations = [
      'Limited to 1000 tokens output',
      'Preview watermark included',
      'Basic prompt structure only'
    ];

    if (isPaid) {
      limitations.push('Full prompt protected until purchase');
    }

    return limitations;
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    try {
      // Initialize Redis client here
      // For now, we'll mock it
      this.redis = null;
      console.log('Redis not configured, preview caching disabled');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }
}