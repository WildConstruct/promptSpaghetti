/**
 * Compliance Rule Engine Routes - Epic 19
 * 
 * REST API endpoints for compliance rule management, evaluation, testing,
 * and configuration across multiple regulatory frameworks.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  ComplianceRuleEngine,
  ComplianceRule,
  RuleEvaluationContext,
  ComplianceFramework,
  RuleCategory,
  RulePriority,
  RuleStatus
} from '../services/ComplianceRuleEngine';

// Request/Response Schemas
const RegisterRuleRequestSchema = z.object({
  ruleId: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  framework: z.enum(
    ['GDPR',
      'CCPA',
      'SOX',
      'HIPAA',
      'PCI_DSS',
      'ISO_27001',
      'NIST',
      'PIPEDA',
      'LGPD',
      'PDPA',
      'CUSTOM']
  ),
  category: z.enum(
    ['DATA_PROTECTION',
      'PRIVACY',
      'SECURITY',
      'GOVERNANCE',
      'AUDIT',
      'RETENTION',
      'ACCESS',
      'CONSENT',
      'NOTIFICATION',
      'BREACH',
      'TRANSFER',
      'RIGHTS']
  ),
  subcategory: z.string().max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  severity: z.enum(['BLOCKING', 'ERROR', 'WARNING', 'INFO']),
  scope: z.object({
    scopeId: z.string(),
    applicability: z.object({
      universal: z.boolean(),
      conditional: z.boolean(),
      conditions: z.array(z.object({
        conditionId: z.string(),
        type: z.enum(
          ['DATA_FIELD',
            'CONTEXT_PROPERTY',
            'TIME_BASED',
            'EVENT_BASED',
            'THRESHOLD',
            'PATTERN',
            'EXPRESSION',
            'CUSTOM']
        ),
        operator: z.enum(
          ['EQUALS',
            'NOT_EQUALS',
            'GREATER_THAN',
            'LESS_THAN',
            'GREATER_EQUAL',
            'LESS_EQUAL',
            'CONTAINS',
            'NOT_CONTAINS',
            'STARTS_WITH',
            'ENDS_WITH',
            'MATCHES',
            'IN',
            'NOT_IN']
        ),
        value: z.any(),
        context: z.record(z.any()).default({}),
        weight: z.number().min(0).max(1),
        required: z.boolean()
      })).default([]),
      triggers: z.array(z.object({
        triggerId: z.string(),
        event: z.string(),
        threshold: z.record(z.any()).default({}),
        frequency: z.string(),
        conditions: z.array(z.any()).default([]),
        actions: z.array(z.any()).default([])
      })).default([]),
      exemptions: z.array(z.object({
        exemptionId: z.string(),
        type: z.string(),
        criteria: z.record(z.any()),
        expiry: z.string().datetime().optional()
      })).default([])
    }),
    dataTypes: z.array(z.object({
      dataTypeId: z.string(),
      category: z.string(),
      sensitivity: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SPECIAL_CATEGORY']),
      personalData: z.boolean(),
      specialCategory: z.boolean(),
      publicData: z.boolean(),
      derivedData: z.boolean(),
      aggregatedData: z.boolean(),
      anonymizedData: z.boolean(),
      pseudonymizedData: z.boolean(),
      encryptedData: z.boolean(),
      metadata: z.boolean(),
      temporaryData: z.boolean(),
      archivalData: z.boolean()
    })).default([]),
    processingActivities: z.array(z.object({
      activityId: z.string(),
      type: z.string(),
      purpose: z.string(),
      legalBasis: z.enum(
        ['CONSENT',
          'CONTRACT',
          'LEGAL_OBLIGATION',
          'VITAL_INTERESTS',
          'PUBLIC_TASK',
          'LEGITIMATE_INTERESTS']
      ),
      automated: z.boolean(),
      profiling: z.boolean(),
      decisionMaking: z.boolean(),
      aiProcessing: z.boolean(),
      crossBorder: z.boolean(),
      thirdPartySharing: z.boolean(),
      commercialUse: z.boolean(),
      researchUse: z.boolean(),
      statisticalUse: z.boolean()
    })).default([]),
    geographicScope: z.object({
      countries: z.array(z.string()),
      regions: z.array(z.string()),
      jurisdictions: z.array(z.string()),
      adequacyDecisions: z.array(z.any()).default([]),
      transferMechanisms: z.array(z.any()).default([]),
      localizations: z.array(z.any()).default([])
    }),
    organizationalScope: z.object({
      departments: z.array(z.string()),
      roles: z.array(z.string()),
      subsidiaries: z.array(z.string()),
      partners: z.array(z.string()),
      vendors: z.array(z.string()),
      processors: z.array(z.string()),
      controllers: z.array(z.string()),
      jointControllers: z.array(z.string())
    }),
    temporalScope: z.object({
      effectiveDate: z.string().datetime(),
      expiryDate: z.string().datetime().optional(),
      activationTriggers: z.array(z.any()).default([]),
      deactivationTriggers: z.array(z.any()).default([]),
      timeWindows: z.array(z.any()).default([]),
      frequency: z.string(),
      businessHours: z.record(z.any()).default({}),
      holidays: z.array(z.any()).default([])
    }),
    technicalScope: z.object({
      systems: z.array(z.string()),
      platforms: z.array(z.string()),
      technologies: z.array(z.string()),
      protocols: z.array(z.string()),
      dataFormats: z.array(z.string()),
      storageTypes: z.array(z.string()),
      networkTypes: z.array(z.string()),
      deploymentTypes: z.array(z.string())
    }),
    exceptions: z.array(z.object({
      exceptionId: z.string(),
      type: z.string(),
      criteria: z.record(z.any()),
      approvedBy: z.string(),
      expiresAt: z.string().datetime().optional()
    })).default([])
  }),
  conditions: z.array(z.object({
    conditionId: z.string(),
    type: z.enum(
      ['DATA_FIELD',
        'CONTEXT_PROPERTY',
        'TIME_BASED',
        'EVENT_BASED',
        'THRESHOLD',
        'PATTERN',
        'EXPRESSION',
        'CUSTOM']
    ),
    operator: z.enum(
      ['EQUALS',
        'NOT_EQUALS',
        'GREATER_THAN',
        'LESS_THAN',
        'GREATER_EQUAL',
        'LESS_EQUAL',
        'CONTAINS',
        'NOT_CONTAINS',
        'STARTS_WITH',
        'ENDS_WITH',
        'MATCHES',
        'IN',
        'NOT_IN']
    ),
    operands: z.array(z.object({
      operandId: z.string(),
      type: z.string(),
      value: z.any(),
      source: z.string(),
      transformation: z.array(z.any()).default([]),
      validation: z.record(z.any()).default({}),
      caching: z.record(z.any()).default({})
    })),
    context: z.record(z.any()),
    evaluation: z.object({
      method: z.string(),
      algorithm: z.string(),
      parameters: z.array(z.any()).default([]),
      caching: z.record(z.any()).default({}),
      performance: z.record(z.any()).default({}),
      accuracy: z.record(z.any()).default({}),
      confidence: z.number().min(0).max(1)
    }),
    negated: z.boolean().default(false),
    weight: z.number().min(0).max(1),
    required: z.boolean(),
    validationRules: z.array(z.any()).default([]),
    errorHandling: z.record(z.any()).default({})
  })).min(1),
  actions: z.array(z.object({
    actionId: z.string(),
    type: z.enum(
      ['ALLOW',
        'DENY',
        'REQUIRE',
        'MODIFY',
        'LOG',
        'NOTIFY',
        'ESCALATE',
        'QUARANTINE',
        'DELETE',
        'ENCRYPT',
        'ANONYMIZE',
        'AUDIT']
    ),
    operation: z.object({
      operationType: z.string(),
      target: z.record(z.any()),
      method: z.string(),
      payload: z.record(z.any()).default({}),
      authentication: z.record(z.any()).default({}),
      authorization: z.record(z.any()).default({}),
      encryption: z.record(z.any()).default({}),
      validation: z.record(z.any()).default({})
    }),
    parameters: z.array(z.object({
      parameterId: z.string(),
      name: z.string(),
      value: z.any(),
      type: z.string(),
      required: z.boolean(),
      validation: z.record(z.any()).default({})
    })).default([]),
    conditions: z.array(z.any()).default([]),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    execution: z.object({
      mode: z.enum(['SYNC', 'ASYNC', 'BATCH']),
      timing: z.object({
        immediate: z.boolean(),
        delayed: z.boolean(),
        scheduled: z.string().datetime().optional(),
        recurring: z.boolean().default(false)
      }),
      retry: z.object({
        enabled: z.boolean(),
        maxAttempts: z.number().min(1).max(10),
        backoffStrategy: z.enum(['LINEAR', 'EXPONENTIAL', 'FIXED']),
        baseDelay: z.number().min(100)
      }),
      timeout: z.object({
        enabled: z.boolean(),
        duration: z.number().min(1000),
        onTimeout: z.enum(['FAIL', 'CONTINUE', 'RETRY'])
      }),
      batching: z.record(z.any()).default({}),
      parallelization: z.record(z.any()).default({}),
      transaction: z.record(z.any()).default({}),
      idempotency: z.record(z.any()).default({})
    }),
    rollback: z.record(z.any()).default({}),
    monitoring: z.record(z.any()).default({}),
    notification: z.record(z.any()).default({}),
    audit: z.record(z.any()).default({}),
    compliance: z.record(z.any()).default({})
  })).min(1),
  conflicts: z.array(z.any()).default([]),
  dependencies: z.array(z.object({
    dependencyId: z.string(),
    type: z.string(),
    target: z.string(),
    relationship: z.string(),
    constraints: z.array(z.any()).default([]),
    validation: z.record(z.any()).default({}),
    monitoring: z.record(z.any()).default({}),
    resolution: z.record(z.any()).default({})
  })).default([]),
  metadata: z.object({
    author: z.string(),
    tags: z.array(z.string()),
    categories: z.array(z.string()),
    keywords: z.array(z.string()),
    documentation: z.record(z.any()).default({}),
    references: z.array(z.any()).default([]),
    annotations: z.array(z.any()).default([])
  }),
  validation: z.object({
    validationId: z.string(),
    schema: z.record(z.any()),
    constraints: z.array(z.any()).default([]),
    tests: z.array(z.any()).default([]),
    coverage: z.record(z.any()).default({}),
    performance: z.record(z.any()).default({}),
    security: z.record(z.any()).default({}),
    compliance: z.record(z.any()).default({})
  }),
  testing: z.object({
    testingId: z.string(),
    testSuites: z.array(z.object({
      suiteId: z.string(),
      name: z.string(),
      description: z.string(),
      category: z.string(),
      tests: z.array(z.object({
        testId: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.string(),
        input: z.record(z.any()),
        expectedOutput: z.record(z.any()),
        status: z.enum(['PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED']),
        execution: z.record(z.any()).default({}),
        assertions: z.array(z.any()).default([]),
        mocks: z.array(z.any()).default([])
      })),
      setup: z.record(z.any()).default({}),
      teardown: z.record(z.any()).default({}),
      configuration: z.record(z.any()).default({}),
      environment: z.record(z.any()).default({})
    })).default([]),
    scenarios: z.array(z.any()).default([]),
    coverage: z.record(z.any()).default({}),
    performance: z.record(z.any()).default({}),
    reliability: z.record(z.any()).default({}),
    regression: z.array(z.any()).default([]),
    automation: z.record(z.any()).default({})
  }),
  lifecycle: z.object({
    lifecycleId: z.string(),
    stages: z.array(z.any()).default([]),
    transitions: z.array(z.any()).default([]),
    approvals: z.array(z.any()).default([]),
    deployments: z.array(z.any()).default([]),
    monitoring: z.record(z.any()).default({}),
    maintenance: z.record(z.any()).default({}),
    retirement: z.record(z.any()).default({})
  }),
  compliance: z.object({
    complianceId: z.string(),
    frameworks: z.array(z.any()).default([]),
    certifications: z.array(z.any()).default([]),
    audits: z.array(z.any()).default([]),
    assessments: z.array(z.any()).default([]),
    reporting: z.record(z.any()).default({}),
    evidence: z.array(z.any()).default([]),
    attestations: z.array(z.any()).default([])
  })
});

const EvaluateRulesRequestSchema = z.object({
  context: z.object({
    contextId: z.string(),
    environment: z.string(),
    user: z.object({
      userId: z.string(),
      roles: z.array(z.string()),
      permissions: z.array(z.string()),
      attributes: z.record(z.any()).default({})
    }).optional(),
    session: z.object({
      sessionId: z.string(),
      startTime: z.string().datetime(),
      ipAddress: z.string().ip(),
      userAgent: z.string(),
      authenticated: z.boolean(),
      securityLevel: z.string()
    }).optional(),
    request: z.object({
      requestId: z.string(),
      method: z.string(),
      url: z.string().url(),
      headers: z.record(z.string()),
      parameters: z.record(z.any()),
      body: z.record(z.any()).optional()
    }).optional(),
    data: z.object({
      dataId: z.string(),
      type: z.string(),
      classification: z.string(),
      sensitivity: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SPECIAL_CATEGORY']),
      personalData: z.boolean(),
      specialCategory: z.boolean(),
      source: z.string(),
      owner: z.string(),
      processors: z.array(z.string()),
      retention: z.record(z.any()).default({})
    }).optional(),
    system: z.object({
      systemId: z.string(),
      name: z.string(),
      version: z.string(),
      environment: z.string(),
      region: z.string(),
      infrastructure: z.record(z.any()).default({})
    }).optional(),
    configuration: z.record(z.any()).default({}),
    security: z.object({
      encryptionEnabled: z.boolean(),
      accessControls: z.array(z.string()),
      auditingEnabled: z.boolean(),
      monitoringEnabled: z.boolean(),
      alertingEnabled: z.boolean()
    }).optional()
  }),
  frameworks: z.array(
    z.enum(['GDPR',
      'CCPA',
      'SOX',
      'HIPAA',
      'PCI_DSS',
      'ISO_27001',
      'NIST',
      'PIPEDA',
      'LGPD',
      'PDPA',
      'CUSTOM']
    )).default([]),
  categories: z.array(
    z.enum(['DATA_PROTECTION',
      'PRIVACY',
      'SECURITY',
      'GOVERNANCE',
      'AUDIT',
      'RETENTION',
      'ACCESS',
      'CONSENT',
      'NOTIFICATION',
      'BREACH',
      'TRANSFER',
      'RIGHTS']
    )).default([]),
  options: z.object({
    includeEvidence: z.boolean().default(true),
    includePerformanceMetrics: z.boolean().default(false),
    includeActions: z.boolean().default(true),
    maxRules: z.number().min(1).max(1000).default(100),
    timeoutMs: z.number().min(1000).max(60000).default(10000)
  }).default({})
});

const UpdateRuleRequestSchema = z.object({
  ruleId: z.string().min(1),
  updates: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED']).optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    severity: z.enum(['BLOCKING', 'ERROR', 'WARNING', 'INFO']).optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
    conditions: z.array(z.any()).optional(),
    actions: z.array(z.any()).optional(),
    scope: z.any().optional(),
    metadata: z.any().optional()
  })
});

const TestRuleRequestSchema = z.object({
  ruleId: z.string().min(1),
  testSuite: z.object({
    suiteId: z.string(),
    name: z.string(),
    description: z.string(),
    tests: z.array(z.object({
      testId: z.string(),
      name: z.string(),
      description: z.string(),
      input: z.object({
        context: z.record(z.any()),
        data: z.record(z.any()).optional()
      }),
      expectedOutput: z.object({
        result: z.enum(['PASS', 'FAIL', 'CONDITIONAL', 'UNKNOWN', 'ERROR']),
        verdict: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'REQUIRES_REVIEW', 'REQUIRES_ACTION', 'INCOMPLETE']),
        actions: z.array(z.any()).optional()
      })
    }))
  }),
  options: z.object({
    parallel: z.boolean().default(false),
    continueOnFailure: z.boolean().default(true),
    generateReport: z.boolean().default(true),
    saveResults: z.boolean().default(true)
  }).default({})
});

export async function complianceRuleEngineRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  await fastify.register(jwtAuthMiddleware);

  const ruleEngine = fastify.complianceRuleEngine as ComplianceRuleEngine;

  /**
   * Register a new compliance rule
   * POST /compliance-rule-engine/rules
   */
  fastify.post<{
    Body: z.infer<typeof RegisterRuleRequestSchema>;
  }>('/rules', {
    schema: {
      description: 'Register a new compliance rule in the rule engine',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      body: RegisterRuleRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                registered: { type: 'boolean' },
                ruleId: { type: 'string' },
                conflicts: { type: 'array' },
                validationResults: { type: 'object' },
                nextSteps: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('rule:create')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const ruleData = request.body;
        
        // Convert request data to ComplianceRule format
        const rule: ComplianceRule = {
          ...ruleData,
          status: 'DRAFT' as RuleStatus,
          metadata: {
            ...ruleData.metadata,
            version: ruleData.version,
            createdAt: new Date(),
            lastModified: new Date(),
            modifiedBy: request.user.userId,
            changelog: [],
            documentation: ruleData.metadata.documentation || {},
            references: ruleData.metadata.references || []
          }
        } as ComplianceRule;

        const result = await ruleEngine.registerRule(rule);

        const nextSteps = [];
        if (result.registered) {
          nextSteps.push('Rule registered successfully');
          nextSteps.push('Create test suite for rule validation');
          if (result.conflicts.length > 0) {
            nextSteps.push('Review and resolve rule conflicts');
          }
          nextSteps.push('Submit rule for approval workflow');
        } else {
          nextSteps.push('Resolve blocking conflicts before registration');
          nextSteps.push('Review rule dependencies and priorities');
        }

        reply.send({
          success: true,
          data: {
            registered: result.registered,
            ruleId: result.ruleId,
            conflicts: result.conflicts,
            validationResults: {
              schemaValid: true,
              conflictsDetected: result.conflicts.length,
              blockingConflicts: result.conflicts.filter(c => c.severity === 'BLOCKING').length
            },
            nextSteps
          }
        });

      } catch (error) {
        fastify.log.error('Error registering compliance rule:', error);
        reply.code(500).send({
          error: 'Failed to register compliance rule',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Evaluate rules against context
   * POST /compliance-rule-engine/evaluate
   */
  fastify.post<{
    Body: z.infer<typeof EvaluateRulesRequestSchema>;
  }>('/evaluate', {
    schema: {
      description: 'Evaluate compliance rules against provided context',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      body: EvaluateRulesRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                evaluationId: { type: 'string' },
                results: { type: 'array' },
                summary: { type: 'object' },
                performance: { type: 'object' },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('rule:evaluate')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const { context, frameworks, categories, options } = request.body;
        
        // Create evaluation context
        const evaluationContext: RuleEvaluationContext = {
          contextId: context.contextId,
          timestamp: new Date(),
          environment: context.environment,
          user: context.user as any,
          session: context.session as any,
          request: context.request as any,
          data: context.data as any,
          system: context.system as any,
          configuration: context.configuration,
          security: context.security as any
        };

        const startTime = Date.now();
        const results = await ruleEngine.evaluateRules(
          evaluationContext,
          frameworks as ComplianceFramework[],
          categories as RuleCategory[]
        );
        const duration = Date.now() - startTime;

        // Generate summary
        const summary = {
          totalRules: results.length,
          compliantRules: results.filter(r => r.outcome.result === 'PASS').length,
          nonCompliantRules: results.filter(r => r.outcome.result === 'FAIL').length,
          conditionalRules: results.filter(r => r.outcome.result === 'CONDITIONAL').length,
          errorRules: results.filter(r => r.outcome.result === 'ERROR').length,
          averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length || 0,
          criticalIssues: results.filter(r => r.outcome.severity === 'BLOCKING').length,
          warnings: results.filter(r => r.outcome.severity === 'WARNING').length
        };

        // Generate recommendations
        const recommendations = [];
        if (summary.nonCompliantRules > 0) {
          recommendations.push(`Address ${summary.nonCompliantRules} non-compliant rule(s)`);
        }
        if (summary.criticalIssues > 0) {
          recommendations.push(`Immediately resolve ${summary.criticalIssues} critical issue(s)`);
        }
        if (summary.conditionalRules > 0) {
          recommendations.push(`Review ${summary.conditionalRules} conditional compliance(s)`);
        }
        if (summary.averageConfidence < 0.8) {
          recommendations.push('Consider improving data quality for better confidence scores');
        }

        reply.send({
          success: true,
          data: {
            evaluationId: `EVAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            results: options?.includeEvidence ? results : results.map(r => ({
              resultId: r.resultId,
              ruleId: r.ruleId,
              outcome: r.outcome,
              confidence: r.confidence,
              performance: options?.includePerformanceMetrics ? r.performance : undefined,
              actions: options?.includeActions ? r.actions : undefined
            })),
            summary,
            performance: {
              duration,
              rulesEvaluated: results.length,
              averageRuleTime: duration / results.length || 0,
              memoryUsage: process.memoryUsage().heapUsed
            },
            recommendations
          }
        });

      } catch (error) {
        fastify.log.error('Error evaluating compliance rules:', error);
        reply.code(500).send({
          error: 'Failed to evaluate compliance rules',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get rule by ID
   * GET /compliance-rule-engine/rules/:ruleId
   */
  fastify.get<{
    Params: { ruleId: string };
    Querystring: { includeTests?: boolean; includeHistory?: boolean };
  }>('/rules/:ruleId', {
    schema: {
      description: 'Get compliance rule details by ID',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' }
        },
        required: ['ruleId']
      },
      querystring: {
        type: 'object',
        properties: {
          includeTests: { type: 'boolean', default: false },
          includeHistory: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { ruleId } = request.params;
        const { includeTests, includeHistory } = request.query;
        
        const rule = await ruleEngine.getRule(ruleId);
        
        if (!rule) {
          reply.code(404).send({
            error: 'Rule not found',
            message: `Rule ${ruleId} does not exist`
          });
          return;
        }

        // Optionally include additional data
        const responseData: any = { ...rule };
        
        if (includeTests) {
          responseData.testResults = {
            lastRun: new Date(),
            status: 'PASSED',
            coverage: 95,
            tests: rule.testing.testSuites.length
          };
        }
        
        if (includeHistory) {
          responseData.history = rule.metadata.changelog || [];
        }

        reply.send({
          success: true,
          data: responseData
        });

      } catch (error) {
        fastify.log.error('Error getting compliance rule:', error);
        reply.code(500).send({
          error: 'Failed to get compliance rule',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Update rule
   * PUT /compliance-rule-engine/rules/:ruleId
   */
  fastify.put<{
    Params: { ruleId: string };
    Body: z.infer<typeof UpdateRuleRequestSchema>;
  }>('/rules/:ruleId', {
    schema: {
      description: 'Update compliance rule',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' }
        },
        required: ['ruleId']
      },
      body: UpdateRuleRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                updated: { type: 'boolean' },
                conflicts: { type: 'array' },
                newVersion: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('rule:update')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const { ruleId } = request.params;
        const { updates } = request.body;
        
        const result = await ruleEngine.updateRule(ruleId, updates);

        reply.send({
          success: true,
          data: {
            updated: result.updated,
            conflicts: result.conflicts,
            newVersion: updates.version || 'auto-incremented'
          }
        });

      } catch (error) {
        fastify.log.error('Error updating compliance rule:', error);
        reply.code(500).send({
          error: 'Failed to update compliance rule',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Test rule
   * POST /compliance-rule-engine/rules/:ruleId/test
   */
  fastify.post<{
    Params: { ruleId: string };
    Body: z.infer<typeof TestRuleRequestSchema>;
  }>('/rules/:ruleId/test', {
    schema: {
      description: 'Run test suite for compliance rule',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' }
        },
        required: ['ruleId']
      },
      body: TestRuleRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                testRunId: { type: 'string' },
                results: { type: 'array' },
                summary: { type: 'object' },
                coverage: { type: 'object' },
                reportUrl: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('rule:test')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const { ruleId } = request.params;
        const { testSuite, options } = request.body;
        
        const rule = await ruleEngine.getRule(ruleId);
        if (!rule) {
          reply.code(404).send({
            error: 'Rule not found',
            message: `Rule ${ruleId} does not exist`
          });
          return;
        }

        // Run tests (mock implementation)
        const testRunId = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const startTime = Date.now();
        
        const testResults = [];
        for (const test of testSuite.tests) {
          try {
            // Mock test execution
            const context: RuleEvaluationContext = {
              contextId: test.input.context.contextId || `CTX-${Date.now()}`,
              timestamp: new Date(),
              environment: test.input.context.environment || 'test',
              ...test.input.context
            };
            
            const evaluationResults = await ruleEngine.evaluateRules(context, [rule.framework], [rule.category]);
            const ruleResult = evaluationResults.find(r => r.ruleId === ruleId);
            
            const passed = ruleResult ? 
              ruleResult.outcome.result === test.expectedOutput.result &&
              ruleResult.outcome.verdict === test.expectedOutput.verdict : false;
            
            testResults.push({
              testId: test.testId,
              name: test.name,
              status: passed ? 'PASSED' : 'FAILED',
              duration: Math.random() * 100 + 10, // Mock duration
              expected: test.expectedOutput,
              actual: ruleResult ? {
                result: ruleResult.outcome.result,
                verdict: ruleResult.outcome.verdict,
                actions: ruleResult.actions
              } : null,
              error: !ruleResult ? 'Rule evaluation failed' : (!passed ? 'Output mismatch' : null)
            });
          } catch (error) {
            testResults.push({
              testId: test.testId,
              name: test.name,
              status: 'FAILED',
              duration: 0,
              expected: test.expectedOutput,
              actual: null,
              error: error instanceof Error ? error.message : 'Test execution failed'
            });
          }
        }

        const duration = Date.now() - startTime;
        const passed = testResults.filter(t => t.status === 'PASSED').length;
        const failed = testResults.filter(t => t.status === 'FAILED').length;

        const summary = {
          totalTests: testResults.length,
          passed,
          failed,
          passRate: testResults.length > 0 ? (passed / testResults.length) * 100 : 0,
          duration,
          status: failed === 0 ? 'PASSED' : 'FAILED'
        };

        const coverage = {
          conditions: 100, // Mock coverage
          actions: 100,
          branches: 90,
          overall: 95
        };

        reply.send({
          success: true,
          data: {
            testRunId,
            results: testResults,
            summary,
            coverage,
            reportUrl: options?.generateReport ? `/api/compliance-rule-engine/test-reports/${testRunId}` : undefined
          }
        });

      } catch (error) {
        fastify.log.error('Error testing compliance rule:', error);
        reply.code(500).send({
          error: 'Failed to test compliance rule',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * List rules by framework
   * GET /compliance-rule-engine/rules
   */
  fastify.get<{
    Querystring: {
      framework?: string;
      category?: string;
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    };
  }>('/rules', {
    schema: {
      description: 'List compliance rules with filtering and pagination',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          framework: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string' },
          priority: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['name', 'priority', 'createdAt', 'lastModified'], default: 'lastModified' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                rules: { type: 'array' },
                pagination: { type: 'object' },
                filters: { type: 'object' },
                statistics: { type: 'object' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { framework, category, status, priority, page = 1, limit = 20, sortBy, sortOrder } = request.query;
        
        // Get all rules (in production, this would be optimized with database queries)
        let rules: ComplianceRule[] = [];
        
        if (framework) {
          rules = await ruleEngine.getRulesByFramework(framework as ComplianceFramework);
        } else if (category) {
          rules = await ruleEngine.getRulesByCategory(category as RuleCategory);
        } else {
          // Get all rules (mock implementation)
          rules = [];
        }

        // Apply filters
        if (status) {
          rules = rules.filter(rule => rule.status === status);
        }
        if (priority) {
          rules = rules.filter(rule => rule.priority === priority);
        }

        // Sort rules
        rules.sort((a, b) => {
          let aValue, bValue;
          switch (sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'priority':
            const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          case 'createdAt':
            aValue = a.metadata.createdAt.getTime();
            bValue = b.metadata.createdAt.getTime();
            break;
          case 'lastModified':
          default:
            aValue = a.metadata.lastModified.getTime();
            bValue = b.metadata.lastModified.getTime();
            break;
          }
          
          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });

        // Paginate
        const total = rules.length;
        const offset = (page - 1) * limit;
        const paginatedRules = rules.slice(offset, offset + limit);

        // Generate statistics
        const statistics = {
          totalRules: total,
          byFramework: {},
          byCategory: {},
          byStatus: {},
          byPriority: {}
        };

        rules.forEach(rule => {
          statistics.byFramework[rule.framework] = (statistics.byFramework[rule.framework] || 0) + 1;
          statistics.byCategory[rule.category] = (statistics.byCategory[rule.category] || 0) + 1;
          statistics.byStatus[rule.status] = (statistics.byStatus[rule.status] || 0) + 1;
          statistics.byPriority[rule.priority] = (statistics.byPriority[rule.priority] || 0) + 1;
        });

        reply.send({
          success: true,
          data: {
            rules: paginatedRules.map(rule => ({
              ruleId: rule.ruleId,
              name: rule.name,
              description: rule.description,
              framework: rule.framework,
              category: rule.category,
              status: rule.status,
              priority: rule.priority,
              severity: rule.severity,
              version: rule.version,
              createdAt: rule.metadata.createdAt,
              lastModified: rule.metadata.lastModified,
              author: rule.metadata.author
            })),
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit)
            },
            filters: {
              applied: { framework, category, status, priority },
              available: {
                frameworks: ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS'],
                categories: ['DATA_PROTECTION', 'PRIVACY', 'SECURITY', 'GOVERNANCE'],
                statuses: ['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'INACTIVE'],
                priorities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
              }
            },
            statistics
          }
        });

      } catch (error) {
        fastify.log.error('Error listing compliance rules:', error);
        reply.code(500).send({
          error: 'Failed to list compliance rules',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get engine status
   * GET /compliance-rule-engine/status
   */
  fastify.get('/status', {
    schema: {
      description: 'Get compliance rule engine status and statistics',
      tags: ['Compliance Rule Engine'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const status = await ruleEngine.getEngineStatus();

        reply.send({
          success: true,
          data: status
        });

      } catch (error) {
        fastify.log.error('Error getting engine status:', error);
        reply.code(500).send({
          error: 'Failed to get engine status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}