// Enhanced Prompt Parser Service with LLM Mode Toggle
// Story 2.6 Implementation

import { z } from 'zod';
import { LLMService } from './llm/LLMService';
import { LLMRequest } from './llm/types';
import { promptParser as standardParser } from '../runtime/nodes/epic1/PromptParser';
import { PromptAnalysis } from '../runtime/nodes/epic1/PromptParser';
import { ParserSecurity } from './ParserSecurity';
import { ParserFallback } from './ParserFallback';
import { LLMResponseProcessor } from './LLMResponseProcessor';
import { CacheManager } from './llm/CacheManager';
import { Node, Edge } from 'reactflow';

// Parser options interface
export interface ParserOptions {
  mode: 'standard' | 'llm-enhanced';
  preserveVariables: boolean;
  autoConnect: boolean;
  allowInferredVariables?: boolean;
}

// Parse result interface
export interface ParseResult {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    parserMode?: string;
    fallbackReason?: string;
    parseTime?: number;
    cacheHit?: boolean;
    [key: string]: any;
  };
}

// LLM response schema with strict validation
export const LLMResponseSchema = z.object({
  version: z.literal('psg-parse-v1'),
  nodes: z.array(z.object({
    type: z.enum(['Variable', 'WeightedChoice', 'TextBlock', 'Sequential']),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
    variables: z.array(z.string()).optional()
  })),
  edges: z.array(z.object({
    source: z.number(),
    target: z.number(),
    label: z.string().optional()
  }))
}).strict();

export type LLMParseResponse = z.infer<typeof LLMResponseSchema>;

export class PromptParser {
  private llmService: LLMService | null = null;
  private security: ParserSecurity;
  private fallback: ParserFallback;
  private responseProcessor: LLMResponseProcessor;
  private cacheManager: CacheManager;
  private retryCount = 2;
  private retryDelays = [300, 800]; // Exponential backoff in ms

  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
    this.security = new ParserSecurity();
    this.fallback = new ParserFallback();
    this.responseProcessor = new LLMResponseProcessor();
    this.cacheManager = new CacheManager();
  }

  async parse(
    prompt: string,
    options: ParserOptions = {
      mode: 'standard',
      preserveVariables: true,
      autoConnect: true
    }
  ): Promise<ParseResult> {
    const startTime = Date.now();

    // Sanitize prompt for security
    const sanitizedPrompt = this.security.sanitizePrompt(prompt);

    if (options.mode === 'llm-enhanced') {
      try {
        // Check cache first
        const cacheKey = this.getCacheKey(sanitizedPrompt, options);
        const cached = this.cacheManager.get({ prompt: cacheKey } as any, 'parser');
        
        if (cached) {
          return {
            ...cached,
            metadata: {
              ...cached.metadata,
              cacheHit: true,
              parseTime: Date.now() - startTime
            }
          };
        }

        // Try LLM parsing with retries
        const result = await this.llmEnhancedParse(sanitizedPrompt, prompt, options);
        
        // Cache successful result
        this.cacheManager.set({ prompt: cacheKey } as any, 'parser', result);
        
        return {
          ...result,
          metadata: {
            ...result.metadata,
            parseTime: Date.now() - startTime,
            cacheHit: false
          }
        };
      } catch (error) {
        console.warn('LLM parse failed, falling back to standard', error);
        return await this.fallback.handleLLMFailure(prompt, error as Error, options);
      }
    }

    // Standard parsing mode
    return this.standardParse(prompt, options);
  }

  private async llmEnhancedParse(
    sanitizedPrompt: string,
    originalPrompt: string,
    options: ParserOptions
  ): Promise<ParseResult> {
    if (!this.llmService) {
      throw new Error('LLM service not configured');
    }

    // Prepare the system prompt with instructions
    const systemPrompt = this.buildSystemPrompt();
    
    // Track variable integrity
    const originalVariables = this.extractVariables(originalPrompt);

    let lastError: Error | null = null;
    
    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        // Add retry delay if not first attempt
        if (attempt > 0) {
          await this.delay(this.retryDelays[attempt - 1]);
        }

        // Call LLM with timeout
        const response = await this.callLLMWithTimeout(
          systemPrompt,
          sanitizedPrompt,
          3000 // 3 second timeout
        );

        if (!response || !response.content) {
          throw new Error('Empty LLM response');
        }

        // Parse and validate response
        let parsedResponse: any;
        try {
          parsedResponse = JSON.parse(response.content);
        } catch (e) {
          throw new Error('Invalid JSON response from LLM');
        }

        // Validate with Zod schema
        const validated = LLMResponseSchema.parse(parsedResponse);

        // Process response into nodes and edges
        const result = await this.responseProcessor.processResponse(
          validated,
          originalPrompt,
          options,
          originalVariables
        );

        // Security check on output
        if (!this.security.validateOutputSafety(result)) {
          throw new Error('Security validation failed on LLM output');
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`LLM parse attempt ${attempt + 1} failed:`, error);
        
        if (attempt === this.retryCount) {
          // All retries exhausted
          throw lastError;
        }
      }
    }

    throw lastError || new Error('LLM parsing failed after all retries');
  }

  private async callLLMWithTimeout(
    systemPrompt: string,
    userContent: string,
    timeoutMs: number
  ): Promise<{ content: string } | null> {
    if (!this.llmService) {
      return null;
    }

    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('LLM request timeout')), timeoutMs);
    });

    const llmPromise = this.llmService.complete({
      prompt: systemPrompt,
      context: userContent,
      maxTokens: 800,
      temperature: 0.3,
      responseFormat: 'json',
      taskType: 'general'
    } as LLMRequest);

    try {
      const result = await Promise.race([llmPromise, timeoutPromise]);
      return result;
    } catch (error) {
      if ((error as Error).message === 'LLM request timeout') {
        console.warn('LLM request timed out');
      }
      throw error;
    }
  }

  private standardParse(prompt: string, options: ParserOptions): ParseResult {
    // Use existing standard parser
    const analysis = standardParser.parse(prompt);
    
    // Convert to React Flow format
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Convert nodes from analysis
    analysis.nodes.forEach((genNode, index) => {
      const serialized = genNode.node.serialize();
      nodes.push({
        id: serialized.id,
        type: this.mapNodeType(serialized.type),
        position: genNode.position || { x: index * 200, y: 100 },
        data: {
          ...serialized.data,
          label: serialized.data?.text || serialized.data?.content || ''
        }
      });
    });

    // Create edges based on sequential layout
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'default'
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        parserMode: 'standard',
        segmentCount: analysis.segments.length
      }
    };
  }

  private buildSystemPrompt(): string {
    return `You are a prompt parsing expert. Analyze the given prompt and create a node graph structure.

CRITICAL: Return ONLY valid JSON matching this exact schema:
{
  "version": "psg-parse-v1",
  "nodes": [
    {
      "type": "Variable" | "WeightedChoice" | "TextBlock" | "Sequential",
      "content": "string",
      "metadata": { ... } // optional
      "variables": ["string", ...] // optional, ONLY if variables detected
    }
  ],
  "edges": [
    {
      "source": number, // node index
      "target": number, // node index
      "label": "string" // optional
    }
  ]
}

Node Type Guidelines:
- Variable: For character names, parameters, or {variable} syntax
- WeightedChoice: For lists of alternatives or options
- TextBlock: For descriptive text, scenes, or narratives
- Sequential: For temporal sequences (first, then, finally)

Rules:
1. Preserve ALL {variable} syntax exactly as written
2. Create edges to show logical flow (no cycles)
3. If uncertain about node type, use TextBlock with metadata.reason:"uncertain"
4. Detect multilingual content and add metadata.lang
5. For code blocks, create TextBlock with metadata.opaque:true
6. Extract semantic meaning, not just sentence boundaries

Example Input: "A brave {hero_name} ventures into the dark forest, then fights the dragon."
Example Output:
{
  "version": "psg-parse-v1",
  "nodes": [
    {"type": "TextBlock", "content": "A brave", "metadata": {"role": "descriptor"}},
    {"type": "Variable", "content": "{hero_name}", "metadata": {"role": "character"}},
    {"type": "Sequential", "content": "ventures into the dark forest", "metadata": {"action": "movement"}},
    {"type": "Sequential", "content": "fights the dragon", "metadata": {"action": "combat"}}
  ],
  "edges": [
    {"source": 0, "target": 1},
    {"source": 1, "target": 2},
    {"source": 2, "target": 3}
  ]
}`;
  }

  private extractVariables(text: string): Set<string> {
    const variables = new Set<string>();
    const pattern = /\{([^}]+)\}/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      variables.add(match[1]);
    }
    
    return variables;
  }

  private mapNodeType(epicType: string): string {
    // Map Epic1 node types to React Flow types
    const typeMap: Record<string, string> = {
      'TextBlock': 'textBlock',
      'WeightedChoice': 'weightedChoice',
      'Variable': 'variable',
      'Sequential': 'sequential',
      'Output': 'output',
      'Concat': 'concat'
    };
    
    return typeMap[epicType] || 'textBlock';
  }

  private getCacheKey(prompt: string, options: ParserOptions): string {
    return `${prompt}_${options.mode}_${options.preserveVariables}_${options.autoConnect}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}