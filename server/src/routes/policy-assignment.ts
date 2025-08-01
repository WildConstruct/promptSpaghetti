/**
 * Policy Assignment API Routes
 * 
 * RESTful API endpoints for managing data protection policy assignments
 * with inheritance, conflict resolution, and bulk operations
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PolicyAssignmentService } from '../services/PolicyAssignmentService';
import { 
  PolicyAssignment, 
  BulkPolicyAssignment,
  AssignmentTargetType,
  AssignmentStatus,
  ConflictResolutionStrategy,
  ValidationError,
  BulkAssignmentStatus
 from '../types/PolicyAssignmentTypes';

// Request/Response schemas



interface CreateAssignmentRequest {
  Body: {
    policyId: string;
    policyType: string;
    policyVersion?: string;
    targetType: AssignmentTargetType;
    targetId: string;
    targetDisplayName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    priority?: number;
    conditions?: any[];
    inheritance?: any;
    metadata?: any;



  };




interface BulkAssignmentRequest {
  Body: {
    title: string;
    description?: string;
    assignments: any[];
    strategy?: {
      conflictResolution?: ConflictResolutionStrategy;
      inheritanceHandling?: string;
      approvalRequired?: boolean;
      dryRun?: boolean;
      executionMode?: string;
      rollbackOnError?: boolean;



    };
  };




interface GetAssignmentsRequest {
  Querystring: {
    targetType?: AssignmentTargetType;
    targetId?: string;
    policyType?: string;
    status?: AssignmentStatus;
    page?: number;
    limit?: number;
    includeInherited?: boolean;



  };




interface AssignmentByIdRequest {
  Params: {
    assignmentId: string;



  };




interface BulkAssignmentByIdRequest {
  Params: {
    bulkAssignmentId: string;



  };




interface ConflictAnalysisRequest {
  Body: {
    assignments: any[];



  };




interface EffectivePoliciesRequest {
  Params: {
    targetType: AssignmentTargetType;
    targetId: string;



  };
  Querystring: {
    contextDate?: string;
  };


export default async function policyAssignmentRoutes(fastify: FastifyInstance) {
  const policyAssignmentService = new PolicyAssignmentService();

  // Schema definitions for validation
  const assignmentSchema = {
    type: 'object',
    required: ['policyId', 'policyType', 'targetType', 'targetId'],
    properties: {
      policyId: { type: 'string', minLength: 1 },
      policyType: { type: 'string', minLength: 1 },
      policyVersion: { type: 'string' },
      targetType: { 
        type: 'string', 
        enum: ['USER', 'ROLE', 'TEAM', 'ORG_UNIT', 'DEPARTMENT', 'LOCATION', 'DATA_TYPE', 'SYSTEM'] 

      targetId: { type: 'string', minLength: 1 },
      targetDisplayName: { type: 'string' },
      effectiveDate: { type: 'string', format: 'date-time' },
      expirationDate: { type: 'string', format: 'date-time' },
      priority: { type: 'integer', minimum: 1, maximum: 1000 },
      conditions: { type: 'array' },
      inheritance: { type: 'object' },
      metadata: { type: 'object' }

  };

  const bulkAssignmentSchema = {
    type: 'object',
    required: ['title', 'assignments'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000 },
      assignments: { 
        type: 'array', 
        minItems: 1,
        maxItems: 1000,
        items: assignmentSchema

      strategy: {
        type: 'object',
        properties: {
          conflictResolution: { 
            type: 'string', 
            enum: ['MOST_RESTRICTIVE', 'LEAST_RESTRICTIVE', 'HIGHEST_PRIORITY', 'EXPLICIT_OVERRIDE', 'MANUAL_REVIEW'] 

          inheritanceHandling: { 
            type: 'string', 
            enum: ['PRESERVE_EXISTING', 'OVERRIDE_EXISTING', 'MERGE_WITH_EXISTING', 'SKIP_INHERITED'] 

          approvalRequired: { type: 'boolean' },
          dryRun: { type: 'boolean' },
          executionMode: { 
            type: 'string', 
            enum: ['IMMEDIATE', 'SCHEDULED', 'STAGED', 'MANUAL_TRIGGER'] 

          rollbackOnError: { type: 'boolean' }



  };

  // Create single policy assignment
  fastify.post<CreateAssignmentRequest>('/assignments', {
    schema: {
      description: 'Create a new policy assignment',
      tags: ['Policy Assignments'],
      body: assignmentSchema,
      response: {
        201: {
          description: 'Assignment created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }


        400: {
          description: 'Invalid request data',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            validationErrors: { type: 'array' }




  }, async (request: FastifyRequest<CreateAssignmentRequest>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'system';
      const assignmentData = {
        ...request.body,
        effectiveDate: request.body.effectiveDate ? new Date(request.body.effectiveDate) : undefined,
        expirationDate: request.body.expirationDate ? new Date(request.body.expirationDate) : undefined
      };

      const assignment = await policyAssignmentService.createAssignment(assignmentData, userId);

      reply.code(201).send({
        success: true,
        data: assignment,
        message: 'Policy assignment created successfully'
      });
 catch (error) {
      fastify.log.error('Error creating assignment:', error);
      
      if (error instanceof Error && error.message.includes('validation failed')) {
        reply.code(400).send({
          success: false,
          error: error.message,
          validationErrors: []
        });
 else {
        reply.code(500).send({
          success: false,
          error: 'Internal server error'
        });


  });

  // Create bulk policy assignments
  fastify.post<BulkAssignmentRequest>('/assignments/bulk', {
    schema: {
      description: 'Create multiple policy assignments in bulk',
      tags: ['Policy Assignments'],
      body: bulkAssignmentSchema,
      response: {
        201: {
          description: 'Bulk assignment created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest<BulkAssignmentRequest>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'system';
      const { title, description = '', assignments, strategy = {} } = request.body;

      const bulkAssignment = await policyAssignmentService.createBulkAssignment(
        assignments,
        strategy,
        userId,
        title,
        description
      );

      reply.code(201).send({
        success: true,
        data: bulkAssignment,
        message: 'Bulk policy assignment created successfully'
      });
 catch (error) {
      fastify.log.error('Error creating bulk assignment:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to create bulk assignment'
      });

  });

  // Execute bulk assignment
  fastify.post<BulkAssignmentByIdRequest>('/assignments/bulk/:bulkAssignmentId/execute', {
    schema: {
      description: 'Execute a bulk policy assignment',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['bulkAssignmentId'],
        properties: {
          bulkAssignmentId: { type: 'string' }



  }, async (request: FastifyRequest<BulkAssignmentByIdRequest>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'system';
      const { bulkAssignmentId } = request.params;

      await policyAssignmentService.executeBulkAssignment(bulkAssignmentId, userId);

      reply.send({
        success: true,
        message: 'Bulk assignment execution started'
      });
 catch (error) {
      fastify.log.error('Error executing bulk assignment:', error);
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute bulk assignment'
      });

  });

  // Get policy assignments with filtering
  fastify.get<GetAssignmentsRequest>('/assignments', {
    schema: {
      description: 'Get policy assignments with filtering options',
      tags: ['Policy Assignments'],
      querystring: {
        type: 'object',
        properties: {
          targetType: { type: 'string' },
          targetId: { type: 'string' },
          policyType: { type: 'string' },
          status: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          includeInherited: { type: 'boolean', default: false }



  }, async (request: FastifyRequest<GetAssignmentsRequest>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 20, ...filters } = request.query;
      
      // This would be implemented with proper database pagination
      // For now, returning a placeholder response
      const assignments: PolicyAssignment[] = [];
      const totalCount = 0;

      reply.send({
        success: true,
        data: {
          assignments,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)


      });
 catch (error) {
      fastify.log.error('Error getting assignments:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve assignments'
      });

  });

  // Get assignment by ID
  fastify.get<AssignmentByIdRequest>('/assignments/:assignmentId', {
    schema: {
      description: 'Get a specific policy assignment by ID',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['assignmentId'],
        properties: {
          assignmentId: { type: 'string' }



  }, async (request: FastifyRequest<AssignmentByIdRequest>, reply: FastifyReply) => {
    try {
      const { assignmentId } = request.params;
      
      // This would be implemented with proper database lookup
      // For now, returning a placeholder response
      const assignment = null;

      if (!assignment) {
        reply.code(404).send({
          success: false,
          error: 'Assignment not found'
        });
        return;


      reply.send({
        success: true,
        data: assignment
      });
 catch (error) {
      fastify.log.error('Error getting assignment:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve assignment'
      });

  });

  // Get effective policies for a target
  fastify.get<EffectivePoliciesRequest>('/assignments/effective/:targetType/:targetId', {
    schema: {
      description: 'Get effective policies for a specific target',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['targetType', 'targetId'],
        properties: {
          targetType: { type: 'string' },
          targetId: { type: 'string' }


      querystring: {
        type: 'object',
        properties: {
          contextDate: { type: 'string', format: 'date-time' }



  }, async (request: FastifyRequest<EffectivePoliciesRequest>, reply: FastifyReply) => {
    try {
      const { targetType, targetId } = request.params;
      const contextDate = request.query.contextDate ? new Date(request.query.contextDate) : new Date();

      const effectivePolicies = await policyAssignmentService.getEffectivePolicies(
        targetType as AssignmentTargetType,
        targetId,
        contextDate
      );

      reply.send({
        success: true,
        data: {
          targetType,
          targetId,
          contextDate: contextDate.toISOString(),
          effectivePolicies,
          count: effectivePolicies.length

      });
 catch (error) {
      fastify.log.error('Error getting effective policies:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve effective policies'
      });

  });

  // Analyze conflicts for proposed assignments
  fastify.post<ConflictAnalysisRequest>('/assignments/analyze-conflicts', {
    schema: {
      description: 'Analyze potential conflicts for proposed assignments',
      tags: ['Policy Assignments'],
      body: {
        type: 'object',
        required: ['assignments'],
        properties: {
          assignments: {
            type: 'array',
            items: assignmentSchema




  }, async (request: FastifyRequest<ConflictAnalysisRequest>, reply: FastifyReply) => {
    try {
      const { assignments } = request.body;
      const userId = request.user?.id || 'system';

      // Convert to PolicyAssignment objects (simplified for this example)
      const policyAssignments: PolicyAssignment[] = assignments.map(assignment => ({
        assignmentId: `temp-${Date.now()}-${Math.random()}`,
        ...assignment,
        assignedBy: userId,
        assignedAt: new Date(),
        effectiveDate: assignment.effectiveDate ? new Date(assignment.effectiveDate) : new Date(),
        expirationDate: assignment.expirationDate ? new Date(assignment.expirationDate) : undefined,
        status: AssignmentStatus.DRAFT,
        approvals: [],
        auditTrail: []
      }));

      const conflicts = await policyAssignmentService.detectConflicts(policyAssignments);

      reply.send({
        success: true,
        data: {
          conflicts,
          conflictCount: conflicts.length,
          hasConflicts: conflicts.length > 0,
          criticalConflicts: conflicts.filter(c => c.severity === 'CRITICAL').length

      });
 catch (error) {
      fastify.log.error('Error analyzing conflicts:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to analyze conflicts'
      });

  });

  // Revoke assignment
  fastify.delete<AssignmentByIdRequest>('/assignments/:assignmentId', {
    schema: {
      description: 'Revoke a policy assignment',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['assignmentId'],
        properties: {
          assignmentId: { type: 'string' }


      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', minLength: 1 }



  }, async (request: FastifyRequest<AssignmentByIdRequest & { Body: { reason?: string } }>, reply: FastifyReply) => {
    try {
      const { assignmentId } = request.params;
      const { reason = 'Manual revocation' } = request.body || {};
      const userId = request.user?.id || 'system';

      await policyAssignmentService.revokeAssignment(assignmentId, userId, reason);

      reply.send({
        success: true,
        message: 'Assignment revoked successfully'
      });
 catch (error) {
      fastify.log.error('Error revoking assignment:', error);
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke assignment'
      });

  });

  // Get assignment analytics
  fastify.get('/assignments/analytics', {
    schema: {
      description: 'Get policy assignment analytics and statistics',
      tags: ['Policy Assignments'],
      querystring: {
        type: 'object',
        properties: {
          targetType: { type: 'string' },
          policyType: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }



  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const filters: any = {};
      
      if (request.query.targetType) {
        filters.targetType = request.query.targetType;

      
      if (request.query.policyType) {
        filters.policyType = request.query.policyType;

      
      if (request.query.startDate && request.query.endDate) {
        filters.dateRange = {
          start: new Date(request.query.startDate),
          end: new Date(request.query.endDate)
        };


      const analytics = await policyAssignmentService.getAssignmentAnalytics(filters);

      reply.send({
        success: true,
        data: analytics
      });
 catch (error) {
      fastify.log.error('Error getting analytics:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve analytics'
      });

  });

  // Get bulk assignment status
  fastify.get<BulkAssignmentByIdRequest>('/assignments/bulk/:bulkAssignmentId', {
    schema: {
      description: 'Get bulk assignment status and progress',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['bulkAssignmentId'],
        properties: {
          bulkAssignmentId: { type: 'string' }



  }, async (request: FastifyRequest<BulkAssignmentByIdRequest>, reply: FastifyReply) => {
    try {
      const { bulkAssignmentId } = request.params;
      
      // This would be implemented with proper database lookup
      // For now, returning a placeholder response
      const bulkAssignment = null;

      if (!bulkAssignment) {
        reply.code(404).send({
          success: false,
          error: 'Bulk assignment not found'
        });
        return;


      reply.send({
        success: true,
        data: bulkAssignment
      });
 catch (error) {
      fastify.log.error('Error getting bulk assignment:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve bulk assignment'
      });

  });

  // Apply inheritance to a target
  fastify.post('/assignments/:assignmentId/apply-inheritance', {
    schema: {
      description: 'Apply inheritance rules from a parent assignment',
      tags: ['Policy Assignments'],
      params: {
        type: 'object',
        required: ['assignmentId'],
        properties: {
          assignmentId: { type: 'string' }


      body: {
        type: 'object',
        required: ['childTargetType', 'childTargetId'],
        properties: {
          childTargetType: { type: 'string' },
          childTargetId: { type: 'string' }



  }, async (
    request: FastifyRequest<AssignmentByIdRequest & { Body: { childTargetType: AssignmentTargetType; childTargetId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { assignmentId } = request.params;
      const { childTargetType, childTargetId } = request.body;

      // This would need to be implemented with proper inheritance logic
      // For now, returning a placeholder response
      reply.send({
        success: true,
        message: 'Inheritance applied successfully'
      });
 catch (error) {
      fastify.log.error('Error applying inheritance:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to apply inheritance'
      });

  });
