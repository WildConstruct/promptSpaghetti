/**
 * Enhanced Feature Toggle API Routes (Epic 17 Integration)
 * 
 * Integrates the Enhanced Toggle Evaluation System and Toggle Dependency Integration Service
 * with the existing Epic 17 admin infrastructure for comprehensive toggle management.
 * 
 * Provides API endpoints for:
 * - Advanced toggle evaluation with dependency awareness
 * - Real-time dependency enforcement and impact analysis
 * - Admin dashboard integration with enhanced controls
 * - Audit logging and compliance tracking
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { FeatureToggleService } from '../services/feature-toggle-service';
import { EnhancedToggleEvaluationService } from '../services/EnhancedToggleEvaluationService';
import { ToggleDependencyIntegrationService } from '../services/ToggleDependencyIntegrationService';
import { FeatureToggleDependencyService } from '../../../packages/core/services/FeatureToggleDependencyService';
import { AuditService } from '../auth/services/AuditService';

// Request/Response schemas
const EnhancedEvaluationRequestSchema = z.object({
  toggleKey: z.string(),
  context: z.object({
    userId: z.string().optional(),
    orgId: z.string().optional(),
    userAttributes: z.record(z.any()).optional(),
    claudeContext: z.object({
      modelVersion: z.string().optional(),
      promptType: z.enum(['creative', 'analytical', 'conversational', 'code']).optional(),
      tokensUsed: z.number().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      costImpact: z.enum(['none', 'low', 'medium', 'high']).optional(),
      qualityImpact: z.enum(['none', 'positive', 'neutral', 'negative']).optional()
    }).optional(),
    performanceHints: z.object({
      cacheTTL: z.number().optional(),
      precompileRules: z.boolean().optional(),
      bulkEvaluation: z.boolean().optional(),
      maxEvaluationTime: z.number().optional(),
      priority: z.enum(['low', 'normal', 'high', 'critical']).optional()
    }).optional(),
    dependencyContext: z.object({
      enforceDependencies: z.boolean().optional(),
      cascadeEvaluation: z.boolean().optional(),
      maxDepth: z.number().optional(),
      impactAnalysis: z.boolean().optional(),
      rollbackOnFailure: z.boolean().optional()
    }).optional(),
    evaluationId: z.string().optional(),
    traceEnabled: z.boolean().optional(),
    cacheStrategy: z.enum(['none', 'standard', 'aggressive', 'dependency_aware']).optional()
  }).optional()
});

const BulkEvaluationRequestSchema = z.object({
  toggleKeys: z.array(z.string()),
  context: EnhancedEvaluationRequestSchema.shape.context.optional()
});

const ToggleOperationRequestSchema = z.object({
  operation: z.object({
    type: z.enum(['activate', 'deactivate', 'modify_value', 'modify_config', 'archive', 'restore', 'delete']),
    targetToggleId: z.string(),
    newState: z.boolean().optional(),
    newValue: z.any().optional(),
    reason: z.string(),
    metadata: z.any().optional()
  }),
  context: z.object({
    requestSource: z.enum(
      ['admin_dashboard',
      'api_direct',
      'automated_system',
      'emergency_protocol',
      'scheduled_task',
      'external_system']
    ),
    urgencyLevel: z.enum(['low', 'normal', 'high', 'emergency']),
    approvals: z.array(z.object({
      id: z.string(),
      approverRole: z.string(),
      approverId: z.string(),
      timestamp: z.string(),
      reason: z.string(),
      conditions: z.array(z.string()).optional()
    })).optional(),
    overrides: z.array(z.object({
      id: z.string(),
      overrideType: z.enum(['temporary', 'permanent', 'conditional', 'emergency']),
      dependencyId: z.string(),
      authorizedBy: z.string(),
      validUntil: z.string().optional(),
      reason: z.string(),
      riskAcceptance: z.string()
    })).optional(),
    testingPhase: z.enum(['development', 'staging', 'pre_production', 'canary', 'production']).optional(),
    rolloutStrategy: z.enum(['immediate', 'gradual', 'scheduled', 'canary', 'blue_green']).optional(),
    notifications: z.array(z.object({
      channel: z.enum(['email', 'slack', 'sms', 'webhook', 'dashboard_alert']),
      recipients: z.array(z.string()),
      eventTypes: z.array(
        z.enum(['operation_blocked',
        'cascade_triggered',
        'warning_issued',
        'rollback_initiated',
        'approval_required']
      )),
      urgencyThreshold: z.enum(['low', 'normal', 'high', 'emergency'])
    })).optional()
  })
});

const ImpactPreviewRequestSchema = z.object({
  operation: ToggleOperationRequestSchema.shape.operation,
  context: ToggleOperationRequestSchema.shape.context.optional()
});

/**
 * Enhanced Feature Toggle Routes Plugin
 */
export async function enhancedFeatureToggleRoutes(
  fastify: FastifyInstance,
  options: {
    toggleService: FeatureToggleService;
    enhancedEvaluationService: EnhancedToggleEvaluationService;
    dependencyIntegrationService: ToggleDependencyIntegrationService;
    dependencyService: FeatureToggleDependencyService;
    auditService: AuditService;
  }
) {
  const {
    toggleService,
    enhancedEvaluationService,
    dependencyIntegrationService,
    dependencyService,
    auditService
  } = options;

  // Enhanced evaluation endpoint
  fastify.post('/enhanced-evaluation', {
    schema: {
      body: EnhancedEvaluationRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          result: z.object({
            enabled: z.boolean(),
            value: z.any(),
            reason: z.string(),
            evaluationTime: z.number(),
            cacheHit: z.boolean(),
            ruleName: z.string().optional(),
            dependencyStatus: z.object({
              checked: z.boolean(),
              violations: z.array(z.any()),
              warnings: z.array(z.any()),
              blockers: z.array(z.string()),
              requirements: z.array(z.string()),
              canActivate: z.boolean()
            }).optional(),
            cascadeEffects: z.array(z.any()).optional(),
            riskAssessment: z.object({
              riskScore: z.number(),
              factors: z.array(z.any()),
              mitigation: z.array(z.string()),
              recommendation: z.enum(['proceed', 'caution', 'review', 'block'])
            }).optional(),
            impactScore: z.number().optional(),
            trace: z.any().optional(),
            ruleEvaluations: z.array(z.any()).optional(),
            claudeMetadata: z.object({
              costImpact: z.enum(['none', 'low', 'medium', 'high']),
              qualityImpact: z.enum(['none', 'positive', 'neutral', 'negative']),
              riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
              modelRecommendation: z.string().optional()
            }).optional(),
            metadata: z.any().optional()
          }),
          timestamp: z.string()
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { toggleKey, context } = EnhancedEvaluationRequestSchema.parse(request.body);

      const result = await enhancedEvaluationService.evaluateToggle(toggleKey, context || {});

      await auditService.logAction({
        action: 'enhanced_toggle_evaluation',
        userId: request.user?.id || 'anonymous',
        resourceType: 'feature_toggle',
        resourceId: toggleKey,
        details: {
          toggleKey,
          contextProvided: !!context,
          evaluationTime: result.evaluationTime,
          cacheHit: result.cacheHit,
          result: {
            enabled: result.enabled,
            reason: result.reason,
            riskScore: result.riskAssessment?.riskScore
          }
        },
        severity: 'info'
      });

      return {
        success: true,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Enhanced evaluation error:', error);
      
      await auditService.logAction({
        action: 'enhanced_toggle_evaluation_error',
        userId: request.user?.id || 'anonymous',
        resourceType: 'feature_toggle',
        details: {
          error: error.message,
          stack: error.stack
        },
        severity: 'error'
      });

      return reply.status(500).send({
        error: 'Enhanced evaluation failed'
      });
    }
  });

  // Bulk enhanced evaluation endpoint
  fastify.post('/bulk-enhanced-evaluation', {
    schema: {
      body: BulkEvaluationRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          results: z.record(z.any()),
          evaluationCount: z.number(),
          totalTime: z.number(),
          timestamp: z.string()
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { toggleKeys, context } = BulkEvaluationRequestSchema.parse(request.body);

      if (toggleKeys.length > 100) {
        return reply.status(400).send({
          error: 'Maximum 100 toggles can be evaluated in bulk'
        });
      }

      const startTime = Date.now();
      const results = await enhancedEvaluationService.evaluateToggles(toggleKeys, context || {});
      const totalTime = Date.now() - startTime;

      await auditService.logAction({
        action: 'bulk_enhanced_evaluation',
        userId: request.user?.id || 'anonymous',
        resourceType: 'feature_toggle',
        details: {
          toggleCount: toggleKeys.length,
          totalTime,
          averageTime: totalTime / toggleKeys.length,
          cacheHitRate: Object.values(results).filter(r => r.cacheHit).length / toggleKeys.length
        },
        severity: 'info'
      });

      return {
        success: true,
        results,
        evaluationCount: toggleKeys.length,
        totalTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Bulk evaluation error:', error);
      return reply.status(500).send({
        error: 'Bulk evaluation failed'
      });
    }
  });

  // Dependency enforcement endpoint
  fastify.post('/enforce-operation', {
    schema: {
      body: ToggleOperationRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          enforcement: z.object({
            allowed: z.boolean(),
            blockers: z.array(z.any()),
            warnings: z.array(z.any()),
            cascadeActions: z.array(z.any()),
            impactAssessment: z.any(),
            riskScore: z.number(),
            recommendation: z.any(),
            rollbackPlan: z.any().optional()
          }),
          timestamp: z.string()
        }),
        400: z.object({ error: z.string() }),
        403: z.object({ error: z.string(), enforcement: z.any() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { operation, context } = ToggleOperationRequestSchema.parse(request.body);
      const actorId = request.user?.id || 'anonymous';

      // Validate user permissions
      if (!request.user || !await hasToggleManagementPermission(request.user, operation.type)) {
        return reply.status(403).send({
          error: 'Insufficient permissions for this operation'
        });
      }

      const enforcement = await dependencyIntegrationService.enforceOperation(
        operation,
        context,
        actorId
      );

      const responseStatus = enforcement.allowed ? 200 : 403;

      return reply.status(responseStatus).send({
        success: enforcement.allowed,
        enforcement,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Operation enforcement error:', error);
      return reply.status(500).send({
        error: 'Operation enforcement failed'
      });
    }
  });

  // Execute operation endpoint
  fastify.post('/execute-operation', {
    schema: {
      body: z.object({
        operation: ToggleOperationRequestSchema.shape.operation,
        context: ToggleOperationRequestSchema.shape.context,
        enforcement: z.object({
          allowed: z.boolean(),
          blockers: z.array(z.any()),
          warnings: z.array(z.any()),
          cascadeActions: z.array(z.any()),
          impactAssessment: z.any(),
          riskScore: z.number(),
          recommendation: z.any(),
          rollbackPlan: z.any().optional()
        })
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          execution: z.any(),
          timestamp: z.string()
        }),
        400: z.object({ error: z.string() }),
        403: z.object({ error: z.string() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { operation, context, enforcement } = request.body as any;
      const actorId = request.user?.id || 'anonymous';

      if (!enforcement.allowed) {
        return reply.status(403).send({
          error: 'Operation not allowed by dependency enforcement'
        });
      }

      const execution = await dependencyIntegrationService.executeOperation(
        operation,
        enforcement,
        context,
        actorId
      );

      return {
        success: execution.success,
        execution,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      fastify.log.error('Operation execution error:', error);
      return reply.status(500).send({
        error: 'Operation execution failed'
      });
    }
  });

  // Impact preview endpoint for admin UI
  fastify.post('/impact-preview', {
    schema: {
      body: ImpactPreviewRequestSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          preview: z.object({
            operation: z.any(),
            directImpact: z.array(z.any()),
            indirectImpact: z.array(z.any()),
            cascadePreview: z.array(z.any()),
            riskFactors: z.array(z.any()),
            overallRiskScore: z.number(),
            estimatedAffectedUsers: z.number(),
            estimatedExecutionTime: z.number(),
            recommendedApprovals: z.array(z.string()),
            safetyChecks: z.array(z.string())
          }),
          timestamp: z.string()
        }),
        400: z.object({ error: z.string() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { operation, context } = ImpactPreviewRequestSchema.parse(request.body);

      const preview = await dependencyIntegrationService.getImpactPreview(
        operation,
        context || {
          requestSource: 'admin_dashboard' as const,
          urgencyLevel: 'normal' as const
        }
      );

      return {
        success: true,
        preview,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Impact preview error:', error);
      return reply.status(500).send({
        error: 'Impact preview failed'
      });
    }
  });

  // Dependency graph endpoint for visualization
  fastify.get('/dependency-graph/:toggleId?', {
    schema: {
      params: z.object({
        toggleId: z.string().optional()
      }).optional(),
      querystring: z.object({
        includeToggles: z.string().optional(), // comma-separated toggle IDs
        maxNodes: z.coerce.number().optional(),
        includeMetadata: z.coerce.boolean().optional()
      }).optional(),
      response: {
        200: z.object({
          success: z.boolean(),
          graph: z.object({
            nodes: z.array(z.any()),
            edges: z.array(z.any()),
            clusters: z.array(z.any()),
            criticalPaths: z.array(z.any()),
            conflicts: z.array(z.any()),
            metrics: z.any()
          }),
          timestamp: z.string()
        }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { toggleId } = request.params as any;
      const { includeToggles, maxNodes, includeMetadata } = request.query as any;

      let toggleIds: string[] | undefined;
      if (toggleId) {
        toggleIds = [toggleId];
      } else if (includeToggles) {
        toggleIds = includeToggles.split(',');
      }

      const graph = await dependencyService.generateDependencyGraph(toggleIds);

      // Apply filters if specified
      if (maxNodes && graph.nodes.length > maxNodes) {
        graph.nodes = graph.nodes.slice(0, maxNodes);
        graph.edges = graph.edges.filter(
          edge => graph.nodes.some(n => n.id === edge.source) && 
                  graph.nodes.some(n => n.id === edge.target)
        );
      }

      if (!includeMetadata) {
        graph.nodes.forEach(node => delete node.metadata);
        graph.edges.forEach(edge => delete edge.metadata);
      }

      return {
        success: true,
        graph,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Dependency graph error:', error);
      return reply.status(500).send({
        error: 'Failed to generate dependency graph'
      });
    }
  });

  // Enhanced toggle metrics endpoint
  fastify.get('/metrics/:toggleId', {
    schema: {
      params: z.object({
        toggleId: z.string()
      }),
      querystring: z.object({
        timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
        includePerformance: z.coerce.boolean().optional(),
        includeDependencies: z.coerce.boolean().optional()
      }).optional(),
      response: {
        200: z.object({
          success: z.boolean(),
          metrics: z.object({
            toggleId: z.string(),
            evaluationCount: z.number(),
            averageEvaluationTime: z.number(),
            cacheHitRate: z.number(),
            errorRate: z.number(),
            dependencyViolations: z.number(),
            riskScore: z.number(),
            lastEvaluated: z.string(),
            performanceMetrics: z.array(z.any()).optional(),
            dependencyMetrics: z.any().optional()
          }),
          timestamp: z.string()
        }),
        404: z.object({ error: z.string() }),
        500: z.object({ error: z.string() })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { toggleId } = request.params as any;
      const { timeRange = '24h', includePerformance, includeDependencies } = request.query as any;

      // This would integrate with metrics collection service
      const metrics = await getToggleMetrics(toggleId, timeRange, {
        includePerformance,
        includeDependencies
      });

      if (!metrics) {
        return reply.status(404).send({
          error: 'Toggle not found or no metrics available'
        });
      }

      return {
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Toggle metrics error:', error);
      return reply.status(500).send({
        error: 'Failed to retrieve toggle metrics'
      });
    }
  });

  // Health check endpoint for the enhanced systems
  fastify.get('/health', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          status: z.enum(['healthy', 'degraded', 'unhealthy']),
          services: z.object({
            evaluationService: z.object({
              status: z.enum(['healthy', 'degraded', 'unhealthy']),
              activeEvaluations: z.number(),
              cacheStatus: z.string(),
              averageResponseTime: z.number()
            }),
            dependencyService: z.object({
              status: z.enum(['healthy', 'degraded', 'unhealthy']),
              activeDependencies: z.number(),
              conflictCount: z.number(),
              healthScore: z.number()
            }),
            integrationService: z.object({
              status: z.enum(['healthy', 'degraded', 'unhealthy']),
              activeOperations: z.number(),
              rollbackPlansActive: z.number(),
              cacheSize: z.number()
            })
          }),
          timestamp: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // This would collect health status from all enhanced services
      const health = await collectSystemHealth();

      return {
        success: true,
        status: health.overallStatus,
        services: health.services,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Health check error:', error);
      return {
        success: false,
        status: 'unhealthy' as const,
        services: {
          evaluationService: { status: 'unhealthy' as const, activeEvaluations: 0, cacheStatus: 'error', averageResponseTime: 0 },
          dependencyService: { status: 'unhealthy' as const, activeDependencies: 0, conflictCount: 0, healthScore: 0 },
          integrationService: { status: 'unhealthy' as const, activeOperations: 0, rollbackPlansActive: 0, cacheSize: 0 }
        },
        timestamp: new Date().toISOString()
      };
    }
  });
}

// Helper functions (would be implemented with actual business logic)
async function hasToggleManagementPermission(user: any, operationType: string): Promise<boolean> {
  // Implementation would check user roles and permissions
  return user.roles?.includes('admin') || user.roles?.includes('toggle_manager');
}

async function getToggleMetrics(toggleId: string, timeRange: string, options: any): Promise<any> {
  // Implementation would fetch metrics from metrics collection service
  return {
    toggleId,
    evaluationCount: 1250,
    averageEvaluationTime: 45,
    cacheHitRate: 0.85,
    errorRate: 0.02,
    dependencyViolations: 3,
    riskScore: 0.25,
    lastEvaluated: new Date().toISOString(),
    performanceMetrics: options.includePerformance ? [] : undefined,
    dependencyMetrics: options.includeDependencies ? {} : undefined
  };
}

async function collectSystemHealth(): Promise<any> {
  // Implementation would collect health status from all enhanced services
  return {
    overallStatus: 'healthy' as const,
    services: {
      evaluationService: {
        status: 'healthy' as const,
        activeEvaluations: 15,
        cacheStatus: 'optimal',
        averageResponseTime: 42
      },
      dependencyService: {
        status: 'healthy' as const,
        activeDependencies: 127,
        conflictCount: 2,
        healthScore: 92
      },
      integrationService: {
        status: 'healthy' as const,
        activeOperations: 8,
        rollbackPlansActive: 1,
        cacheSize: 2340
      }
    }
  };
}

export default enhancedFeatureToggleRoutes;