/**
 * Policy Versioning API Routes - E17-1753114397372-E7CDD1
 *
 * RESTful API endpoints for policy versioning system.
 * Handles policy and version management operations.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PolicyVersionService } from '../services/PolicyVersionService';
import { PolicyVersionDAO } from '../database/policy-version-dao';
import { getDatabase } from '../database/connection';
import {
  CreatePolicyRequest,
  CreatePolicyVersionRequest,
  UpdatePolicyVersionRequest,
  PublishPolicyVersionRequest,
  PolicyVersionSearchQuery,
} from '../../../packages/core/types/PolicyVersionTypes';

// Initialize service with database connection
const db = getDatabase();
const policyVersionDAO = new PolicyVersionDAO(db);
const policyVersionService = new PolicyVersionService(policyVersionDAO);

// ============================================================================
// Policy Management Endpoints
// ============================================================================

/**
 * Create a new policy
 * POST /api/policies
 */
export async function createPolicy(request: FastifyRequest<{ Body: CreatePolicyRequest }>, reply: FastifyReply) {
  try {
    const { body } = request;
    const userId = 'current-user-id'; // TODO: Extract from JWT token

    // Validate required fields
    if (!body.policyKey || !body.name || !body.category) {
      return reply.status(400).send({
        error: 'Validation failed',
        message: 'policyKey, name, and category are required',
      });
    }

    const policy = await policyVersionService.createPolicy(body, userId);

    reply.status(201).send({
      success: true,
      data: policy,
      message: 'Policy created successfully',
    });
  } catch (error) {
    console.error('Error creating policy:', error);

    if (error.message.includes('already exists')) {
      return reply.status(409).send({
        error: 'Conflict',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to create policy',
    });
  }
}

/**
 * Get policy by ID
 * GET /api/policies/:policyId
 */
export async function getPolicy(request: FastifyRequest<{ Params: { policyId: string } }>, reply: FastifyReply) {
  try {
    const { policyId } = request.params;

    const policy = await policyVersionService.getPolicy(policyId);

    reply.send({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error('Error getting policy:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve policy',
    });
  }
}

/**
 * Get policy by key
 * GET /api/policies/by-key/:policyKey
 */
export async function getPolicyByKey(request: FastifyRequest<{ Params: { policyKey: string } }>, reply: FastifyReply) {
  try {
    const { policyKey } = request.params;

    const policy = await policyVersionService.getPolicyByKey(policyKey);

    reply.send({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error('Error getting policy by key:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve policy',
    });
  }
}

// ============================================================================
// Policy Version Management Endpoints
// ============================================================================

/**
 * Create a new policy version
 * POST /api/policies/:policyId/versions
 */
export async function createPolicyVersion(
  request: FastifyRequest<{
    Params: { policyId: string };
    Body: CreatePolicyVersionRequest;
  }>,
  reply: FastifyReply
) {
  try {
    const { policyId } = request.params;
    const { body } = request;
    const userId = 'current-user-id'; // TODO: Extract from JWT token

    // Validate required fields
    if (!body.title || !body.content) {
      return reply.status(400).send({
        error: 'Validation failed',
        message: 'title and content are required',
      });
    }

    const version = await policyVersionService.createPolicyVersion(policyId, body, userId);

    reply.status(201).send({
      success: true,
      data: version,
      message: 'Policy version created successfully',
    });
  } catch (error) {
    console.error('Error creating policy version:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('Validation failed')) {
      return reply.status(400).send({
        error: 'Validation failed',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to create policy version',
    });
  }
}

/**
 * Get policy version by ID
 * GET /api/policies/versions/:versionId
 */
export async function getPolicyVersion(
  request: FastifyRequest<{ Params: { versionId: string } }>,
  reply: FastifyReply
) {
  try {
    const { versionId } = request.params;

    const version = await policyVersionService.getPolicyVersion(versionId);

    reply.send({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error('Error getting policy version:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve policy version',
    });
  }
}

/**
 * Get policy version by number
 * GET /api/policies/:policyId/versions/:versionNumber
 */
export async function getPolicyVersionByNumber(
  request: FastifyRequest<{
    Params: { policyId: string; versionNumber: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { policyId, versionNumber } = request.params;

    const version = await policyVersionService.getPolicyVersionByNumber(policyId, versionNumber);

    reply.send({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error('Error getting policy version by number:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve policy version',
    });
  }
}

/**
 * Update policy version
 * PATCH /api/policies/versions/:versionId
 */
export async function updatePolicyVersion(
  request: FastifyRequest<{
    Params: { versionId: string };
    Body: UpdatePolicyVersionRequest;
  }>,
  reply: FastifyReply
) {
  try {
    const { versionId } = request.params;
    const { body } = request;
    const userId = 'current-user-id'; // TODO: Extract from JWT token

    const version = await policyVersionService.updatePolicyVersion(versionId, body, userId);

    reply.send({
      success: true,
      data: version,
      message: 'Policy version updated successfully',
    });
  } catch (error) {
    console.error('Error updating policy version:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('Cannot modify') || error.message.includes('Validation failed')) {
      return reply.status(400).send({
        error: 'Bad request',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to update policy version',
    });
  }
}

/**
 * Delete policy version
 * DELETE /api/policies/versions/:versionId
 */
export async function deletePolicyVersion(
  request: FastifyRequest<{ Params: { versionId: string } }>,
  reply: FastifyReply
) {
  try {
    const { versionId } = request.params;
    const userId = 'current-user-id'; // TODO: Extract from JWT token

    await policyVersionService.deletePolicyVersion(versionId, userId);

    reply.send({
      success: true,
      message: 'Policy version deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting policy version:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('Only draft versions')) {
      return reply.status(400).send({
        error: 'Bad request',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to delete policy version',
    });
  }
}

// ============================================================================
// Policy Version Listing and Search
// ============================================================================

/**
 * List policy versions
 * GET /api/policies/:policyId/versions
 */
export async function listPolicyVersions(
  request: FastifyRequest<{
    Params: { policyId: string };
    Querystring: PolicyVersionSearchQuery;
  }>,
  reply: FastifyReply
) {
  try {
    const { policyId } = request.params;
    const searchQuery = request.query;

    const result = await policyVersionService.listPolicyVersions(policyId, searchQuery);

    reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error listing policy versions:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to list policy versions',
    });
  }
}

/**
 * Get current policy version
 * GET /api/policies/:policyId/versions/current
 */
export async function getCurrentPolicyVersion(
  request: FastifyRequest<{ Params: { policyId: string } }>,
  reply: FastifyReply
) {
  try {
    const { policyId } = request.params;

    const currentVersion = await policyVersionService.getCurrentVersion(policyId);

    if (!currentVersion) {
      return reply.status(404).send({
        error: 'Not found',
        message: 'No published version found for this policy',
      });
    }

    reply.send({
      success: true,
      data: currentVersion,
    });
  } catch (error) {
    console.error('Error getting current policy version:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve current policy version',
    });
  }
}

/**
 * Get policy version history
 * GET /api/policies/:policyId/versions/history
 */
export async function getPolicyVersionHistory(
  request: FastifyRequest<{ Params: { policyId: string } }>,
  reply: FastifyReply
) {
  try {
    const { policyId } = request.params;

    const history = await policyVersionService.getVersionHistory(policyId);

    reply.send({
      success: true,
      data: {
        policyId,
        versions: history,
        totalVersions: history.length,
      },
    });
  } catch (error) {
    console.error('Error getting policy version history:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve policy version history',
    });
  }
}

// ============================================================================
// Version Comparison
// ============================================================================

/**
 * Compare policy versions
 * POST /api/policies/versions/compare
 */
export async function comparePolicyVersions(
  request: FastifyRequest<{
    Body: { fromVersionId: string; toVersionId: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { fromVersionId, toVersionId } = request.body;

    if (!fromVersionId || !toVersionId) {
      return reply.status(400).send({
        error: 'Bad request',
        message: 'fromVersionId and toVersionId are required',
      });
    }

    const comparison = await policyVersionService.comparePolicyVersions(fromVersionId, toVersionId);

    reply.send({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('Error comparing policy versions:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('Cannot compare')) {
      return reply.status(400).send({
        error: 'Bad request',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to compare policy versions',
    });
  }
}

// ============================================================================
// Workflow and Status Management
// ============================================================================

/**
 * Publish policy version
 * POST /api/policies/versions/:versionId/publish
 */
export async function publishPolicyVersion(
  request: FastifyRequest<{
    Params: { versionId: string };
    Body: PublishPolicyVersionRequest;
  }>,
  reply: FastifyReply
) {
  try {
    const { versionId } = request.params;
    const { body } = request;
    const userId = 'current-user-id'; // TODO: Extract from JWT token

    const publishedVersion = await policyVersionService.publishPolicyVersion(versionId, body, userId);

    reply.send({
      success: true,
      data: publishedVersion,
      message: 'Policy version published successfully',
    });
  } catch (error) {
    console.error('Error publishing policy version:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    if (error.message.includes('Cannot publish')) {
      return reply.status(400).send({
        error: 'Bad request',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to publish policy version',
    });
  }
}

/**
 * Get policy version workflow state
 * GET /api/policies/versions/:versionId/workflow
 */
export async function getPolicyVersionWorkflow(
  request: FastifyRequest<{ Params: { versionId: string } }>,
  reply: FastifyReply
) {
  try {
    const { versionId } = request.params;

    const workflowState = await policyVersionService.getWorkflowState(versionId);

    reply.send({
      success: true,
      data: workflowState,
    });
  } catch (error) {
    console.error('Error getting policy version workflow:', error);

    if (error.message.includes('not found')) {
      return reply.status(404).send({
        error: 'Not found',
        message: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve workflow state',
    });
  }
}

// ============================================================================
// Route Registration
// ============================================================================

export function registerPolicyVersioningRoutes(fastify: any) {
  // Policy management routes
  fastify.post('/api/policies', createPolicy);
  fastify.get('/api/policies/:policyId', getPolicy);
  fastify.get('/api/policies/by-key/:policyKey', getPolicyByKey);

  // Policy version management routes
  fastify.post('/api/policies/:policyId/versions', createPolicyVersion);
  fastify.get('/api/policies/versions/:versionId', getPolicyVersion);
  fastify.get('/api/policies/:policyId/versions/:versionNumber', getPolicyVersionByNumber);
  fastify.patch('/api/policies/versions/:versionId', updatePolicyVersion);
  fastify.delete('/api/policies/versions/:versionId', deletePolicyVersion);

  // Policy version listing and search routes
  fastify.get('/api/policies/:policyId/versions', listPolicyVersions);
  fastify.get('/api/policies/:policyId/versions/current', getCurrentPolicyVersion);
  fastify.get('/api/policies/:policyId/versions/history', getPolicyVersionHistory);

  // Version comparison routes
  fastify.post('/api/policies/versions/compare', comparePolicyVersions);

  // Workflow and status management routes
  fastify.post('/api/policies/versions/:versionId/publish', publishPolicyVersion);
  fastify.get('/api/policies/versions/:versionId/workflow', getPolicyVersionWorkflow);
}
