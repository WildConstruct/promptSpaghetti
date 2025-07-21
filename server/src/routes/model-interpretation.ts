/**
 * Model Interpretation API Routes - Token Influence Analysis (LIME/SALIENCY)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import TokenInfluenceAnalyzer from '../analytics/TokenInfluenceAnalyzer';
import PromptAnalyzer from '../analytics/PromptAnalyzer';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { ErrorFactory } from '../types/errors';
import { logger } from '../utils/logger';

// Request/Response schemas
const TokenAnalysisRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  method: z.enum(['LIME', 'SALIENCY', 'BOTH']).default('LIME'),
  options: z.object({
    // LIME options
    numSamples: z.number().int().min(10).max(2000).optional(),
    perturbationStrategy: z.enum(['mask', 'replace', 'reorder']).optional(),
    maxFeatures: z.number().int().min(1).max(50).optional(),
    // Saliency options
    gradientMethod: z.enum(['vanilla', 'integrated', 'smoothgrad']).optional(),
    baselineStrategy: z.enum(['zero', 'random', 'mask']).optional(),
    numSteps: z.number().int().min(10).max(200).optional(),
  }).optional(),
  modelConfig: z.object({
    modelId: z.string().optional(),
    endpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
  }).optional(),
});

const PromptAnalysisRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
  includeInfluence: z.boolean().default(true),
  includeOptimizations: z.boolean().default(true),
  modelConfig: z.object({
    modelId: z.string().optional(),
    endpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
  }).optional(),
});

const ComparisonRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  methods: z.array(z.enum(['LIME', 'SALIENCY'])).min(2).max(2),
  modelConfig: z.object({
    modelId: z.string().optional(),
    endpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
  }).optional(),
});

type TokenAnalysisRequest = z.infer<typeof TokenAnalysisRequestSchema>;
type PromptAnalysisRequest = z.infer<typeof PromptAnalysisRequestSchema>;
type ComparisonRequest = z.infer<typeof ComparisonRequestSchema>;

interface ModelInterpretationServices {
  tokenAnalyzer: TokenInfluenceAnalyzer;
  promptAnalyzer: PromptAnalyzer;
  analyticsCollector: AnalyticsCollector;
}

export async function modelInterpretationRoutes(
  fastify: FastifyInstance,
  services: ModelInterpretationServices
) {
  const { tokenAnalyzer, promptAnalyzer, analyticsCollector } = services;

  // Token influence analysis endpoint
  fastify.post<{ Body: TokenAnalysisRequest }>(
    '/model-interpretation/token-influence',
    {
      schema: {
        body: TokenAnalysisRequestSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              metadata: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: TokenAnalysisRequest }>, reply: FastifyReply) => {
      const { prompt, method, options = {}, modelConfig } = request.body;

      logger.info('Token influence analysis requested', {
        promptLength: prompt.length,
        method,
        modelId: modelConfig?.modelId,
      });

      try {
        // Create prediction function (mock implementation)
        const predictionFunction = createPredictionFunction(modelConfig);
        
        let result: any;

        switch (method) {
          case 'LIME':
            result = await tokenAnalyzer.analyzeLIME(prompt, predictionFunction, options);
            break;
            
          case 'SALIENCY':
            // For saliency, we need a gradient function - mock implementation
            const gradientFunction = createGradientFunction(modelConfig);
            result = await tokenAnalyzer.analyzeSaliency(prompt, gradientFunction, options);
            break;
            
          case 'BOTH':
            const gradientFn = createGradientFunction(modelConfig);
            const comparison = await tokenAnalyzer.compareAnalysisMethods(
              prompt,
              predictionFunction,
              gradientFn
            );
            result = comparison;
            break;
            
          default:
            throw ErrorFactory.validation('Invalid analysis method');
        }

        // Track usage analytics
        analyticsCollector.trackEvent({
          type: 'token_influence_analysis',
          timestamp: Date.now(),
          metadata: {
            method,
            promptLength: prompt.length,
            tokenCount: result.tokens?.length || 0,
            analysisTime: result.metadata?.analysisTime || 0,
          },
        });

        reply.send({
          success: true,
          data: result,
          metadata: {
            timestamp: Date.now(),
            method,
            analysisVersion: '1.0.0',
          },
        });
      } catch (error) {
        logger.error('Token influence analysis failed', {
          error: error instanceof Error ? error.message : String(error),
          promptLength: prompt.length,
          method,
        });

        if (error instanceof z.ZodError) {
          throw ErrorFactory.validation('Invalid request parameters', error.errors.map(e => ({
            field: e.path.join('.'),
            code: e.code,
            message: e.message,
          })));
        }

        throw error;
      }
    }
  );

  // Comprehensive prompt analysis endpoint
  fastify.post<{ Body: PromptAnalysisRequest }>(
    '/model-interpretation/prompt-analysis',
    {
      schema: {
        body: PromptAnalysisRequestSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              metadata: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PromptAnalysisRequest }>, reply: FastifyReply) => {
      const { prompt, analysisDepth, includeInfluence, includeOptimizations, modelConfig } = request.body;

      logger.info('Prompt analysis requested', {
        promptLength: prompt.length,
        analysisDepth,
        includeInfluence,
        includeOptimizations,
      });

      try {
        const predictionFunction = createPredictionFunction(modelConfig);
        
        const result = await promptAnalyzer.analyzePrompt(prompt, predictionFunction, {
          includeInfluence,
          includeOptimizations,
          analysisDepth,
        });

        // Track usage analytics
        analyticsCollector.trackEvent({
          type: 'prompt_analysis',
          timestamp: Date.now(),
          metadata: {
            promptLength: prompt.length,
            analysisDepth,
            overallScore: result.summary.overallScore,
            analysisTime: result.metadata.analysisTime,
            strengthsCount: result.summary.strengths.length,
            weaknessesCount: result.summary.weaknesses.length,
          },
        });

        reply.send({
          success: true,
          data: result,
          metadata: {
            timestamp: Date.now(),
            analysisDepth,
            version: result.metadata.version,
          },
        });
      } catch (error) {
        logger.error('Prompt analysis failed', {
          error: error instanceof Error ? error.message : String(error),
          promptLength: prompt.length,
          analysisDepth,
        });

        throw error;
      }
    }
  );

  // Method comparison endpoint
  fastify.post<{ Body: ComparisonRequest }>(
    '/model-interpretation/compare-methods',
    {
      schema: {
        body: ComparisonRequestSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              metadata: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ComparisonRequest }>, reply: FastifyReply) => {
      const { prompt, methods, modelConfig } = request.body;

      logger.info('Method comparison requested', {
        promptLength: prompt.length,
        methods: methods.join(', '),
      });

      try {
        const predictionFunction = createPredictionFunction(modelConfig);
        const gradientFunction = createGradientFunction(modelConfig);
        
        const comparison = await tokenAnalyzer.compareAnalysisMethods(
          prompt,
          predictionFunction,
          gradientFunction
        );

        // Track comparison analytics
        analyticsCollector.trackEvent({
          type: 'method_comparison',
          timestamp: Date.now(),
          metadata: {
            promptLength: prompt.length,
            methods: methods.join(','),
            correlation: comparison.comparison.correlation,
            agreement: comparison.comparison.agreement,
            divergentTokens: comparison.comparison.divergentTokens.length,
          },
        });

        reply.send({
          success: true,
          data: comparison,
          metadata: {
            timestamp: Date.now(),
            methods,
            comparisonVersion: '1.0.0',
          },
        });
      } catch (error) {
        logger.error('Method comparison failed', {
          error: error instanceof Error ? error.message : String(error),
          promptLength: prompt.length,
        });

        throw error;
      }
    }
  );

  // Batch analysis endpoint for multiple prompts
  fastify.post<{ Body: { prompts: string[]; method: 'LIME' | 'SALIENCY'; options?: any } }>(
    '/model-interpretation/batch-analysis',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            prompts: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 10,
            },
            method: { type: 'string', enum: ['LIME', 'SALIENCY'] },
            options: { type: 'object' },
            modelConfig: { type: 'object' },
          },
          required: ['prompts', 'method'],
        },
      },
    },
    async (request, reply) => {
      const { prompts, method, options = {}, modelConfig } = request.body as any;

      logger.info('Batch analysis requested', {
        promptCount: prompts.length,
        method,
      });

      try {
        const predictionFunction = createPredictionFunction(modelConfig);
        const gradientFunction = createGradientFunction(modelConfig);
        
        const results = await Promise.all(
          prompts.map(async (prompt: string, index: number) => {
            try {
              let result;
              if (method === 'LIME') {
                result = await tokenAnalyzer.analyzeLIME(prompt, predictionFunction, options);
              } else {
                result = await tokenAnalyzer.analyzeSaliency(prompt, gradientFunction, options);
              }
              return { index, success: true, result };
            } catch (error) {
              logger.warn(`Batch analysis failed for prompt ${index}`, {
                error: error instanceof Error ? error.message : String(error),
              });
              return { 
                index, 
                success: false, 
                error: error instanceof Error ? error.message : String(error) 
              };
            }
          })
        );

        const successfulResults = results.filter(r => r.success);
        
        // Track batch analytics
        analyticsCollector.trackEvent({
          type: 'batch_analysis',
          timestamp: Date.now(),
          metadata: {
            totalPrompts: prompts.length,
            successfulAnalyses: successfulResults.length,
            method,
            averagePromptLength: prompts.reduce((sum, p) => sum + p.length, 0) / prompts.length,
          },
        });

        reply.send({
          success: true,
          data: {
            results,
            summary: {
              total: prompts.length,
              successful: successfulResults.length,
              failed: prompts.length - successfulResults.length,
            },
          },
          metadata: {
            timestamp: Date.now(),
            method,
            batchSize: prompts.length,
          },
        });
      } catch (error) {
        logger.error('Batch analysis failed', {
          error: error instanceof Error ? error.message : String(error),
          promptCount: prompts.length,
        });

        throw error;
      }
    }
  );

  // Analysis history endpoint
  fastify.get('/model-interpretation/history', async (request, reply) => {
    // In a real implementation, this would fetch from a database
    const mockHistory = {
      recentAnalyses: [],
      totalAnalyses: 0,
      methodUsage: {
        LIME: 0,
        SALIENCY: 0,
        BOTH: 0,
      },
      averageAnalysisTime: 0,
    };

    reply.send({
      success: true,
      data: mockHistory,
      metadata: {
        timestamp: Date.now(),
      },
    });
  });

  // Health check for interpretation services
  fastify.get('/model-interpretation/health', async (request, reply) => {
    const health = {
      status: 'healthy',
      services: {
        tokenAnalyzer: 'operational',
        promptAnalyzer: 'operational',
        analytics: 'operational',
      },
      capabilities: {
        lime: true,
        saliency: true,
        promptAnalysis: true,
        batchProcessing: true,
        methodComparison: true,
      },
      timestamp: Date.now(),
    };

    reply.send(health);
  });
}

// Helper functions for creating mock prediction and gradient functions
function createPredictionFunction(modelConfig?: any) {
  return async (prompt: string): Promise<any> => {
    // Mock implementation - in production this would call actual ML models
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate model prediction with confidence
    const score = 0.3 + Math.random() * 0.7; // Random score between 0.3-1.0
    const confidence = 0.5 + Math.random() * 0.5; // Random confidence 0.5-1.0
    
    return {
      score,
      confidence,
      prediction: score > 0.5 ? 'positive' : 'negative',
      modelId: modelConfig?.modelId || 'mock-model-v1',
      processingTime: 100 + Math.random() * 200,
    };
  };
}

function createGradientFunction(modelConfig?: any) {
  return async (prompt: string): Promise<number[]> => {
    // Mock gradient implementation - in production this would compute actual gradients
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    const tokens = prompt.split(/\s+/).filter(token => token.length > 0);
    
    // Generate mock gradients with some structure
    return tokens.map((token, index) => {
      // Give higher gradients to action words, lower to stop words
      const actionWords = ['create', 'generate', 'write', 'analyze', 'develop'];
      const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
      
      if (actionWords.some(word => token.toLowerCase().includes(word))) {
        return 0.7 + Math.random() * 0.3; // High gradient
      } else if (stopWords.includes(token.toLowerCase())) {
        return Math.random() * 0.2; // Low gradient
      } else {
        return 0.2 + Math.random() * 0.6; // Medium gradient
      }
    });
  };
}

export default modelInterpretationRoutes;