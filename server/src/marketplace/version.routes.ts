// Epic 16.2.2 Enhanced Version Management Routes
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VersionService } from './version.service';
import { 
  VersionStatus, 
  VersionVisibility, 
  CompatibilityLevel,
  CreateVersionSchema,
  UpdateVersionSchema,
  VersionDeploymentSchema,
  VersionRollbackSchema,
  VersionComparisonSchema
} from './version.types';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export async function versionRoutes(fastify: FastifyInstance) {
  const versionService = new VersionService(fastify.pg);

  // Authentication middleware
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  };

  // Create new version
  fastify.post('/templates/:templateId/versions', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        },
        required: ['templateId']
      },
      body: {
        type: 'object',
        required: ['version_number', 'graph_json', 'release_notes', 'compatibility_level'],
        properties: {
          version_number: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$' },
          status: { type: 'string', enum: ['draft', 'published', 'deprecated', 'archived'] },
          visibility: { type: 'string', enum: ['public', 'private', 'beta'] },
          claude_model: { type: 'string' },
          graph_json: { type: 'object' },
          prompt_yaml: { type: 'string' },
          release_notes: { type: 'string', minLength: 1, maxLength: 5000 },
          compatibility_level: { type: 'string', enum: ['breaking', 'major', 'minor', 'patch'] },
          migration_guide: { type: 'string' },
          deprecated_features: { type: 'array', items: { type: 'string' } },
          new_features: { type: 'array', items: { type: 'string' } },
          breaking_changes: { type: 'array', items: { type: 'string' } },
          bug_fixes: { type: 'array', items: { type: 'string' } },
          known_issues: { type: 'array', items: { type: 'string' } },
          min_claude_version: { type: 'string' },
          max_claude_version: { type: 'string' },
          required_features: { type: 'array', items: { type: 'string' } },
          optional_features: { type: 'array', items: { type: 'string' } },
          token_per_run_estimate: { type: 'integer', minimum: 0 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { templateId: string };
    Body: any;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const version = await versionService.createVersion(
        request.params.templateId, 
        userId, 
        { template_id: request.params.templateId, ...request.body }
      );
      
      reply.code(201).send(version);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to create version' });
    }
  });

  // Get version by ID
  fastify.get('/versions/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const version = await versionService.getVersion(request.params.id, userId);
      
      if (!version) {
        return reply.code(404).send({ error: 'Version not found' });
      }
      
      reply.send(version);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get version' });
    }
  });

  // Get all versions for a template
  fastify.get('/templates/:templateId/versions', {
    schema: {
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        },
        required: ['templateId']
      },
      querystring: {
        type: 'object',
        properties: {
          include_private: { type: 'boolean', default: false },
          status: { type: 'string', enum: ['draft', 'published', 'deprecated', 'archived'] },
          visibility: { type: 'string', enum: ['public', 'private', 'beta'] }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { templateId: string };
    Querystring: { include_private?: boolean; status?: string; visibility?: string };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const versions = await versionService.getTemplateVersions(
        request.params.templateId, 
        userId, 
        request.query.include_private
      );
      
      // Apply additional filters
      let filteredVersions = versions;
      if (request.query.status) {
        filteredVersions = filteredVersions.filter(v => v.status === request.query.status);
      }
      if (request.query.visibility) {
        filteredVersions = filteredVersions.filter(v => v.visibility === request.query.visibility);
      }
      
      reply.send(filteredVersions);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get versions' });
    }
  });

  // Update version
  fastify.put('/versions/:id', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['draft', 'published', 'deprecated', 'archived'] },
          visibility: { type: 'string', enum: ['public', 'private', 'beta'] },
          release_notes: { type: 'string', minLength: 1, maxLength: 5000 },
          migration_guide: { type: 'string' },
          deprecated_features: { type: 'array', items: { type: 'string' } },
          new_features: { type: 'array', items: { type: 'string' } },
          breaking_changes: { type: 'array', items: { type: 'string' } },
          bug_fixes: { type: 'array', items: { type: 'string' } },
          known_issues: { type: 'array', items: { type: 'string' } },
          min_claude_version: { type: 'string' },
          max_claude_version: { type: 'string' },
          required_features: { type: 'array', items: { type: 'string' } },
          optional_features: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: any;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const version = await versionService.updateVersion(request.params.id, userId, request.body);
      
      reply.send(version);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to update version' });
    }
  });

  // Compare versions
  fastify.post('/versions/compare', {
    preHandler: authenticate,
    schema: {
      body: {
        type: 'object',
        required: ['from_version_id', 'to_version_id'],
        properties: {
          from_version_id: { type: 'string', format: 'uuid' },
          to_version_id: { type: 'string', format: 'uuid' },
          include_content_diff: { type: 'boolean', default: true },
          include_metadata_diff: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Body: {
      from_version_id: string;
      to_version_id: string;
      include_content_diff?: boolean;
      include_metadata_diff?: boolean;
    };
  }>, reply: FastifyReply) => {
    try {
      const comparison = await versionService.compareVersions(
        request.body.from_version_id,
        request.body.to_version_id,
        request.body
      );
      
      reply.send(comparison);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to compare versions' });
    }
  });

  // Deploy version
  fastify.post('/versions/:id/deploy', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          deployment_type: { type: 'string', enum: ['rollout', 'canary', 'blue_green', 'immediate'], default: 'immediate' },
          rollout_percentage: { type: 'integer', minimum: 0, maximum: 100, default: 100 },
          target_audience: { type: 'array', items: { type: 'string' }, default: [] },
          deployment_config: { type: 'object', default: {} }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: {
      deployment_type?: 'rollout' | 'canary' | 'blue_green' | 'immediate';
      rollout_percentage?: number;
      target_audience?: string[];
      deployment_config?: Record<string, any>;
    };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const deployment = await versionService.deployVersion(
        request.params.id,
        userId,
        { version_id: request.params.id, ...request.body }
      );
      
      reply.code(201).send(deployment);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to deploy version' });
    }
  });

  // Rollback template to previous version
  fastify.post('/templates/:templateId/rollback', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        },
        required: ['templateId']
      },
      body: {
        type: 'object',
        required: ['to_version_id', 'rollback_reason', 'rollback_type', 'impact_assessment', 'rollback_plan', 'verification_steps'],
        properties: {
          to_version_id: { type: 'string', format: 'uuid' },
          rollback_reason: { type: 'string', minLength: 1, maxLength: 1000 },
          rollback_type: { type: 'string', enum: ['emergency', 'planned', 'issue_resolution'] },
          impact_assessment: { type: 'string', minLength: 1, maxLength: 2000 },
          rollback_plan: { type: 'string', minLength: 1, maxLength: 2000 },
          verification_steps: { type: 'array', items: { type: 'string' }, minItems: 1 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { templateId: string };
    Body: {
      to_version_id: string;
      rollback_reason: string;
      rollback_type: 'emergency' | 'planned' | 'issue_resolution';
      impact_assessment: string;
      rollback_plan: string;
      verification_steps: string[];
    };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const rollback = await versionService.rollbackVersion(
        request.params.templateId,
        userId,
        request.body
      );
      
      reply.code(201).send(rollback);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to rollback version' });
    }
  });

  // Get version analytics
  fastify.get('/versions/:id/analytics', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          period_days: { type: 'integer', minimum: 1, maximum: 365, default: 30 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Querystring: { period_days?: number };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const analytics = await versionService.getVersionAnalytics(
        request.params.id,
        userId,
        request.query.period_days || 30
      );
      
      reply.send(analytics);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get analytics' });
    }
  });

  // Get version by semantic version number
  fastify.get('/templates/:templateId/versions/:versionNumber', {
    schema: {
      params: {
        type: 'object',
        properties: {
          templateId: { type: 'string', format: 'uuid' },
          versionNumber: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$' }
        },
        required: ['templateId', 'versionNumber']
      }
    }
  }, async (request: FastifyRequest<{
    Params: { templateId: string; versionNumber: string }
  }>, reply: FastifyReply) => {
    try {
      const version = await versionService.getVersionByNumber(
        request.params.templateId,
        request.params.versionNumber
      );
      
      if (!version) {
        return reply.code(404).send({ error: 'Version not found' });
      }
      
      reply.send(version);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get version' });
    }
  });

  // Get version statistics
  fastify.get('/versions/:id/statistics', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          days_back: { type: 'integer', minimum: 1, maximum: 365, default: 30 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Querystring: { days_back?: number };
  }>, reply: FastifyReply) => {
    try {
      const daysBack = request.query.days_back || 30;
      
      const result = await fastify.pg.query(`
        SELECT * FROM get_version_statistics($1, $2)
      `, [request.params.id, daysBack]);
      
      reply.send(result.rows[0] || {
        total_downloads: 0,
        active_users: 0,
        avg_executions_per_user: 0,
        error_rate_percentage: 0,
        avg_execution_time_ms: 0,
        adoption_trend: 'new'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: 'Failed to get version statistics' });
    }
  });

  // Check version compatibility
  fastify.get('/versions/:fromId/compatibility/:toId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          fromId: { type: 'string', format: 'uuid' },
          toId: { type: 'string', format: 'uuid' }
        },
        required: ['fromId', 'toId']
      }
    }
  }, async (request: FastifyRequest<{
    Params: { fromId: string; toId: string }
  }>, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.query(`
        SELECT * FROM check_version_compatibility($1, $2)
      `, [request.params.fromId, request.params.toId]);
      
      reply.send(result.rows[0] || {
        is_compatible: false,
        compatibility_level: 'unknown',
        breaking_changes_count: 0,
        migration_required: true
      });
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: 'Failed to check compatibility' });
    }
  });

  // Get version overview (admin endpoint)
  fastify.get('/admin/versions/overview', {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['draft', 'published', 'deprecated', 'archived'] },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      template_id?: string;
      status?: string;
      limit?: number;
      offset?: number;
    };
  }>, reply: FastifyReply) => {
    try {
      // Check if user is admin
      const userId = (request.user as any).id;
      const userResult = await fastify.pg.query(`
        SELECT role FROM users WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (request.query.template_id) {
        conditions.push(`template_id = $${paramIndex++}`);
        params.push(request.query.template_id);
      }

      if (request.query.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(request.query.status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(request.query.limit || 50);
      params.push(request.query.offset || 0);

      const result = await fastify.pg.query(`
        SELECT * FROM version_overview
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `, params);

      reply.send(result.rows);
    } catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: 'Failed to get version overview' });
    }
  });
}