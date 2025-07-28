/**
 * Policy Management API Routes - Epic 17
 * 
 * REST API endpoints for comprehensive policy management, including
 * CRUD operations, versioning, deployment, evaluation, and analytics.
 * 
 * Task: E17-1753114397365-A62FA8 - Create policy data model
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { 
  PolicyDataService,
  Policy,
  PolicyType,
  PolicyStatus,
  PolicyEvaluationContext,
  PolicyBuilder
} from '../services/trust/PolicyDataModel';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { requireAuth, requireAdmin } from '../middleware/auth';

}
interface PolicyRoutes {
  '/policies': {
    GET: {
      Querystring: {
        type?: PolicyType;
        status?: PolicyStatus;
        category?: string;
        tags?: string;
        limit?: number;
        offset?: number;
}
      };
    };
    POST: {
      Body: Policy;
    };
  };
  '/policies/:policyId': {
    GET: {
      Params: { policyId: string };
    };
    PUT: {
      Params: { policyId: string };
      Body: Partial<Policy>;
    };
    DELETE: {
      Params: { policyId: string };
    };
  };
  '/policies/:policyId/evaluate': {
    POST: {
      Params: { policyId: string };
      Body: {
        entity_type: 'user' | 'template' | 'transaction' | 'system';
        entity_id: string;
        entity_data: any;
        context_data?: any;
      };
    };
  };
  '/policies/:policyId/versions': {
    GET: {
      Params: { policyId: string };
    };
    POST: {
      Params: { policyId: string };
      Body: {
        change_summary: string;
      };
    };
  };
  '/policies/:policyId/metrics': {
    GET: {
      Params: { policyId: string };
      Querystring: {
        start_date: string;
        end_date: string;
        granularity?: 'hour' | 'day' | 'week' | 'month';
      };
    };
  };
  '/policies/:policyId/deploy': {
    POST: {
      Params: { policyId: string };
      Body: {
        environment: 'development' | 'staging' | 'production';
        rollout_strategy?: any;
      };
    };
  };
  '/policy-templates': {
    GET: {
      Querystring: {
        category?: string;
        type?: PolicyType;
        is_public?: boolean;
        limit?: number;
        offset?: number;
      };
    };
    POST: {
      Body: {
        template_id: string;
        name: string;
        description: string;
        category: string;
        type: PolicyType;
        template_data: any;
        parameters: any[];
        is_public?: boolean;
      };
    };
  };
  '/policy-templates/:templateId/instantiate': {
    POST: {
      Params: { templateId: string };
      Body: {
        policy_name: string;
        parameters: Record<string, any>;
      };
    };
  };
}

export default async function policyManagementRoutes(fastify: FastifyInstance) {
  // Initialize services
  const db = new DatabaseService(process.env.DATABASE_URL!);
  const auditService = new AuditService(db);
  const policyService = new PolicyDataService(db);

  // Authentication middleware
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/policies') || request.url.startsWith('/policy-templates')) {
      await requireAuth(request, reply);
      
      // Write operations require admin access
      if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        await requireAdmin(request, reply);
      }
    }
  });

  /**
   * Get policies with filtering
   * GET /policies
   */
  fastify.get<PolicyRoutes['/policies']['GET']>(
    '/policies',
    {
      schema: {
        description: 'Get policies with filtering and pagination',
        tags: ['policies'],
        querystring: {
          type: 'object',
          properties: {
            type: { 
              type: 'string', 
              enum: ['enforcement', 'content_moderation', 'compliance', 'security', 'operational', 'community', 'commerce', 'verification', 'privacy', 'accessibility']
  }
            status: { 
              type: 'string', 
              enum: ['draft', 'active', 'inactive', 'deprecated', 'archived'] 
  }
            category: { type: 'string' },
            tags: { type: 'string', description: 'Comma-separated tags' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
  }
        response: {
          200: {
            type: 'object',
            properties: {
              policies: { type: 'array', items: { type: 'object' } },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' }
            }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const filters = {
          type: request.query.type,
          status: request.query.status,
          category: request.query.category,
          limit: request.query.limit || 20,
          offset: request.query.offset || 0
        };

        // Handle tag filtering (would need to be implemented in PolicyDataService)
        const result = await policyService.listPolicies(filters);

        reply.send({
          policies: result.policies,
          total: result.total,
          limit: filters.limit,
          offset: filters.offset
        });

      } catch (error) {
        fastify.log.error('Error fetching policies:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Create new policy
   * POST /policies
   */
  fastify.post<PolicyRoutes['/policies']['POST']>(
    '/policies',
    {
      schema: {
        description: 'Create a new policy',
        tags: ['policies'],
        body: {
          type: 'object',
          required: ['metadata', 'scope', 'rules', 'configuration'],
          properties: {
            metadata: {
              type: 'object',
              required: ['id', 'name', 'type', 'created_by', 'effective_date'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                created_by: { type: 'string' },
                effective_date: { type: 'string', format: 'date-time' }
              }
  }
            scope: { type: 'object' },
            rules: { type: 'array' },
            configuration: { type: 'object' }
          }
  }
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              policy_id: { type: 'string' }
            }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const policy = request.body;
        const userId = (request as any).user.id;

        // Set creation metadata
        policy.metadata.created_at = new Date();
        policy.metadata.updated_at = new Date();
        policy.metadata.status = policy.metadata.status || 'draft';
        policy.metadata.version = policy.metadata.version || '1.0.0';

        const policyId = await policyService.createPolicy(policy);

        // Log policy creation
        await auditService.logEvent({
          userId,
          action: 'policy_created',
          details: {
            policy_id: policyId,
            policy_name: policy.metadata.name,
            policy_type: policy.metadata.type
  }
          severity: 'info'
        });

        reply.status(201).send({
          message: 'Policy created successfully',
          policy_id: policyId
        });

      } catch (error) {
        if (error.code === '23505') { // Unique violation
          reply.status(409).send({ error: 'Policy ID already exists' });
        } else {
          fastify.log.error('Error creating policy:', error);
          reply.status(500).send({ error: 'Internal server error' });
        }
      }
    }
  );

  /**
   * Get specific policy
   * GET /policies/:policyId
   */
  fastify.get<PolicyRoutes['/policies/:policyId']['GET']>(
    '/policies/:policyId',
    {
      schema: {
        description: 'Get a specific policy by ID',
        tags: ['policies'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        
        const policy = await policyService.getPolicy(policyId);
        if (!policy) {
          reply.status(404).send({ error: 'Policy not found' });
          return;
        }

        reply.send({ policy });

      } catch (error) {
        fastify.log.error('Error fetching policy:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Update policy
   * PUT /policies/:policyId
   */
  fastify.put<PolicyRoutes['/policies/:policyId']['PUT']>(
    '/policies/:policyId',
    {
      schema: {
        description: 'Update an existing policy',
        tags: ['policies'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
  }
        body: {
          type: 'object',
          properties: {
            metadata: { type: 'object' },
            scope: { type: 'object' },
            rules: { type: 'array' },
            configuration: { type: 'object' },
            dependencies: { type: 'object' },
            compliance: { type: 'object' },
            testing: { type: 'object' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const updates = request.body;
        const userId = (request as any).user.id;

        // Check if policy exists
        const existingPolicy = await policyService.getPolicy(policyId);
        if (!existingPolicy) {
          reply.status(404).send({ error: 'Policy not found' });
          return;
        }

        await policyService.updatePolicy(policyId, updates, userId);

        // Log policy update
        await auditService.logEvent({
          userId,
          action: 'policy_updated',
          details: {
            policy_id: policyId,
            updated_fields: Object.keys(updates)
  }
          severity: 'info'
        });

        reply.send({ message: 'Policy updated successfully' });

      } catch (error) {
        fastify.log.error('Error updating policy:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Delete policy
   * DELETE /policies/:policyId
   */
  fastify.delete<PolicyRoutes['/policies/:policyId']['DELETE']>(
    '/policies/:policyId',
    {
      schema: {
        description: 'Delete a policy',
        tags: ['policies'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const userId = (request as any).user.id;

        // Check if policy exists
        const existingPolicy = await policyService.getPolicy(policyId);
        if (!existingPolicy) {
          reply.status(404).send({ error: 'Policy not found' });
          return;
        }

        await policyService.deletePolicy(policyId);

        // Log policy deletion
        await auditService.logEvent({
          userId,
          action: 'policy_deleted',
          details: {
            policy_id: policyId,
            policy_name: existingPolicy.metadata.name
  }
          severity: 'warning'
        });

        reply.send({ message: 'Policy deleted successfully' });

      } catch (error) {
        fastify.log.error('Error deleting policy:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Evaluate policy against entity
   * POST /policies/:policyId/evaluate
   */
  fastify.post<PolicyRoutes['/policies/:policyId/evaluate']['POST']>(
    '/policies/:policyId/evaluate',
    {
      schema: {
        description: 'Evaluate a policy against an entity',
        tags: ['policies'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
  }
        body: {
          type: 'object',
          required: ['entity_type', 'entity_id', 'entity_data'],
          properties: {
            entity_type: { 
              type: 'string', 
              enum: ['user', 'template', 'transaction', 'system'] 
  }
            entity_id: { type: 'string' },
            entity_data: { type: 'object' },
            context_data: { type: 'object' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const { entity_type, entity_id, entity_data, context_data } = request.body;
        const userId = (request as any).user.id;

        const evaluationContext: PolicyEvaluationContext = {
          timestamp: new Date(),
          entity_type,
          entity_id,
          entity_data,
          trigger_event: 'manual_evaluation',
          session_info: {
            user_id: userId,
            ip_address: request.ip,
            user_agent: request.headers['user-agent']
  }
          environment: {
            region: 'us-east-1', // Default
            platform: 'web',
            version: '1.0.0'
  }
          context_data: context_data || {}
        };

        const result = await policyService.evaluatePolicy(policyId, evaluationContext);

        // Log the evaluation
        await auditService.logEvent({
          userId,
          action: 'policy_evaluated',
          details: {
            policy_id: policyId,
            entity_type,
            entity_id,
            result: result.overall_result,
            execution_time: result.execution_time
  }
          severity: result.overall_result === 'error' ? 'error' : 'info'
        });

        reply.send({
          evaluation_result: result
        });

      } catch (error) {
        fastify.log.error('Error evaluating policy:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Get policy metrics
   * GET /policies/:policyId/metrics
   */
  fastify.get<PolicyRoutes['/policies/:policyId/metrics']['GET']>(
    '/policies/:policyId/metrics',
    {
      schema: {
        description: 'Get performance metrics for a policy',
        tags: ['policies'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
  }
        querystring: {
          type: 'object',
          required: ['start_date', 'end_date'],
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            granularity: { 
              type: 'string', 
              enum: ['hour', 'day', 'week', 'month'],
              default: 'day'
            }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const { start_date, end_date, granularity = 'day' } = request.query;

        const timeRange = {
          start: new Date(start_date),
          end: new Date(end_date)
        };

        const metrics = await policyService.getPolicyMetrics(policyId, timeRange);

        reply.send({
          metrics,
          granularity
        });

      } catch (error) {
        fastify.log.error('Error fetching policy metrics:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Get policy templates
   * GET /policy-templates
   */
  fastify.get<PolicyRoutes['/policy-templates']['GET']>(
    '/policy-templates',
    {
      schema: {
        description: 'Get available policy templates',
        tags: ['policy-templates'],
        querystring: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            type: { type: 'string' },
            is_public: { type: 'boolean' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { category, type, is_public, limit = 20, offset = 0 } = request.query;

        let whereClause = '';
        const params: any[] = [];
        const conditions: string[] = [];

        if (category) {
          conditions.push(`category = $${params.length + 1}`);
          params.push(category);
        }

        if (type) {
          conditions.push(`type = $${params.length + 1}`);
          params.push(type);
        }

        if (is_public !== undefined) {
          conditions.push(`is_public = $${params.length + 1}`);
          params.push(is_public);
        }

        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const result = await db.query(`
          SELECT *, COUNT(*) OVER() AS total_count
          FROM policy_templates
          ${whereClause}
          ORDER BY usage_count DESC, created_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        const templates = result.rows.map(row => ({
          template_id: row.template_id,
          name: row.name,
          description: row.description,
          category: row.category,
          type: row.type,
          version: row.version,
          template_data: row.template_data,
          parameters: row.parameters,
          examples: row.examples,
          documentation: row.documentation,
          usage_count: row.usage_count,
          is_public: row.is_public,
          created_at: row.created_at
        }));

        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

        reply.send({
          templates,
          total,
          limit,
          offset
        });

      } catch (error) {
        fastify.log.error('Error fetching policy templates:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Instantiate policy from template
   * POST /policy-templates/:templateId/instantiate
   */
  fastify.post<PolicyRoutes['/policy-templates/:templateId/instantiate']['POST']>(
    '/policy-templates/:templateId/instantiate',
    {
      schema: {
        description: 'Create a policy from a template',
        tags: ['policy-templates'],
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string' }
          }
  }
        body: {
          type: 'object',
          required: ['policy_name', 'parameters'],
          properties: {
            policy_name: { type: 'string' },
            parameters: { type: 'object' }
          }
        }
      }
  }
    async (request, reply) => {
      try {
        const { templateId } = request.params;
        const { policy_name, parameters } = request.body;
        const userId = (request as any).user.id;

        // Get template
        const templateResult = await db.query(
          'SELECT * FROM policy_templates WHERE template_id = $1',
          [templateId]
        );

        if (templateResult.rows.length === 0) {
          reply.status(404).send({ error: 'Template not found' });
          return;
        }

        const template = templateResult.rows[0];

        // Create policy from template using PolicyBuilder
        const policyBuilder = new PolicyBuilder()
          .setMetadata({
            id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: policy_name,
            description: `Policy created from template: ${template.name}`,
            type: template.type,
            status: 'draft',
            version: '1.0.0',
            created_by: userId,
            created_at: new Date(),
            updated_at: new Date(),
            effective_date: new Date(),
            tags: ['template-generated', template.category]
          });

        // Apply template data with parameter substitution
        let templateData = JSON.stringify(template.template_data);
        
        // Replace template parameters
        Object.entries(parameters).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          templateData = templateData.replace(new RegExp(placeholder, 'g'), JSON.stringify(value));
        });

        const instantiatedTemplate = JSON.parse(templateData);
        
        if (instantiatedTemplate.scope) {
          policyBuilder.setScope(instantiatedTemplate.scope);
        }
        
        if (instantiatedTemplate.rules) {
          instantiatedTemplate.rules.forEach(rule => policyBuilder.addRule(rule));
        }
        
        if (instantiatedTemplate.configuration) {
          policyBuilder.setConfiguration(instantiatedTemplate.configuration);
        }

        const policy = policyBuilder.build();
        const policyId = await policyService.createPolicy(policy);

        // Update template usage count
        await db.query(
          'UPDATE policy_templates SET usage_count = usage_count + 1 WHERE template_id = $1',
          [templateId]
        );

        // Log policy creation from template
        await auditService.logEvent({
          userId,
          action: 'policy_created_from_template',
          details: {
            policy_id: policyId,
            template_id: templateId,
            policy_name,
            parameters
  }
          severity: 'info'
        });

        reply.status(201).send({
          message: 'Policy created from template successfully',
          policy_id: policyId
        });

      } catch (error) {
        fastify.log.error('Error instantiating policy from template:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}