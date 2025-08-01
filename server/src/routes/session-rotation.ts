// Session Rotation API Routes
// Handles session rotation management and policies

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SessionRotationService, SessionRotationPolicy } from '../auth/services/SessionRotationService';
import { requireAuth } from '../auth/middleware/requireAuth';
import { requirePermission } from '../auth/middleware/requirePermission';



export interface SessionRotationPolicyRequest {
  Body: Partial<SessionRotationPolicy>;







export interface SessionRotationHistoryQuery {
  Querystring: {
    limit?: string;
    offset?: string;



  };




export interface SessionRotationStatsQuery {
  Querystring: {
    startDate?: string;
    endDate?: string;



  };


export async function sessionRotationRoutes(
  server: FastifyInstance,
  sessionRotationService: SessionRotationService
): Promise<void> {

  // Get organization's session rotation policy
  server.get('/auth/session-rotation/policy', {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user!;
        const organizationId = user.organizationId;

        if (!organizationId) {
          return reply.status(400).send({
            error: 'No organization associated with user'
          });


        // Get organization policy from database
        const result = await server.db.query(`
          SELECT * FROM session_rotation_policies
          WHERE organization_id = $1
        `, [organizationId]);

        if (result.rows.length === 0) {
          // Return default policy
          return reply.send({
            rotateOnRoleChange: true,
            rotateOnPermissionChange: true,
            rotateOnOrganizationChange: true,
            rotateOnStatusChange: true,
            preserveCurrentSession: false,
            notifyUser: true,
            graceWindowMinutes: 5,
            isDefault: true
          });


        const policy = result.rows[0];
        return reply.send({
          rotateOnRoleChange: policy.rotate_on_role_change,
          rotateOnPermissionChange: policy.rotate_on_permission_change,
          rotateOnOrganizationChange: policy.rotate_on_organization_change,
          rotateOnStatusChange: policy.rotate_on_status_change,
          preserveCurrentSession: policy.preserve_current_session,
          notifyUser: policy.notify_user,
          graceWindowMinutes: policy.grace_window_minutes,
          isDefault: false
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve session rotation policy'
        });


  });

  // Update organization's session rotation policy
  server.put<{ Body: Partial<SessionRotationPolicy> }>('/auth/session-rotation/policy', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_rotation', action: 'update' })
    ],
    handler: async (request: FastifyRequest<SessionRotationPolicyRequest>, reply: FastifyReply) => {
      try {
        const user = request.user!;
        const organizationId = user.organizationId;
        const updates = request.body;

        if (!organizationId) {
          return reply.status(400).send({
            error: 'No organization associated with user'
          });


        const now = new Date();
        
        // Upsert policy
        await server.db.query(`
          INSERT INTO session_rotation_policies (
            id, organization_id, rotate_on_role_change, rotate_on_permission_change,
            rotate_on_organization_change, rotate_on_status_change, preserve_current_session,
            notify_user, grace_window_minutes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (organization_id) DO UPDATE SET
            rotate_on_role_change = COALESCE($3, EXCLUDED.rotate_on_role_change),
            rotate_on_permission_change = COALESCE($4, EXCLUDED.rotate_on_permission_change),
            rotate_on_organization_change = COALESCE($5, EXCLUDED.rotate_on_organization_change),
            rotate_on_status_change = COALESCE($6, EXCLUDED.rotate_on_status_change),
            preserve_current_session = COALESCE($7, EXCLUDED.preserve_current_session),
            notify_user = COALESCE($8, EXCLUDED.notify_user),
            grace_window_minutes = COALESCE($9, EXCLUDED.grace_window_minutes),
            updated_at = $11
        `, [
          require('crypto').randomUUID(),
          organizationId,
          updates.rotateOnRoleChange,
          updates.rotateOnPermissionChange,
          updates.rotateOnOrganizationChange,
          updates.rotateOnStatusChange,
          updates.preserveCurrentSession,
          updates.notifyUser,
          updates.graceWindowMinutes,
          now,
          now
        ]);

        // Log the update
        await server.auditService.logEvent({
          userId: user.id,
          action: 'session_rotation_policy_updated',
          details: {
            organizationId,
            updates

          sessionId: request.sessionId,
          severity: 'info'
        });

        return reply.send({
          success: true,
          message: 'Session rotation policy updated successfully'
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to update session rotation policy'
        });


  });

  // Get user's session rotation history
  server.get('/auth/session-rotation/history', {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest<SessionRotationHistoryQuery>, reply: FastifyReply) => {
      try {
        const user = request.user!;
        const limit = parseInt(request.query.limit || '50');
        const offset = parseInt(request.query.offset || '0');

        const history = await sessionRotationService.getRotationHistory(user.id, limit);

        // Get total count
        const countResult = await server.db.query(
          'SELECT COUNT(*) as total FROM session_rotation_history WHERE user_id = $1',
          [user.id]
        );

        return reply.send({
          history,
          pagination: {
            limit,
            offset,
            total: parseInt(countResult.rows[0].total)

        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve session rotation history'
        });


  });

  // Get session rotation statistics (admin only)
  server.get('/auth/session-rotation/stats', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_rotation', action: 'read_stats' })
    ],
    handler: async (request: FastifyRequest<SessionRotationStatsQuery>, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = request.query;
        
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const stats = await sessionRotationService.getRotationStats(start, end);

        return reply.send(stats);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve session rotation statistics'
        });


  });

  // Check if session is in grace period
  server.get('/auth/session-rotation/grace-status', {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const sessionId = request.sessionId;
        
        if (!sessionId) {
          return reply.status(400).send({
            error: 'No active session'
          });


        const inGracePeriod = await sessionRotationService.isSessionInGracePeriod(sessionId);
        
        let graceExpiresAt: Date | null = null;
        if (inGracePeriod) {
          const result = await server.db.query(
            'SELECT expires_at FROM session_grace_windows WHERE session_id = $1',
            [sessionId]
          );
          if (result.rows.length > 0) {
            graceExpiresAt = result.rows[0].expires_at;



        return reply.send({
          inGracePeriod,
          graceExpiresAt
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to check grace period status'
        });


  });

  // Manually trigger session rotation for a user (admin only)
  server.post<{ Body: { userId: string; reason: string } }>('/auth/session-rotation/rotate', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_rotation', action: 'force_rotate' })
    ],
    handler: async (request: FastifyRequest<{ Body: { userId: string; reason: string } }>, reply: FastifyReply) => {
      try {
        const { userId, reason } = request.body;
        const performedBy = request.user!.id;

        if (!userId || !reason) {
          return reply.status(400).send({
            error: 'userId and reason are required'
          });


        const result = await sessionRotationService.handlePrivilegeChange({
          userId,
          changeType: 'status_change',
          reason: `Manual rotation: ${reason}`,
          performedBy
        });

        // Log the manual rotation
        await server.auditService.logEvent({
          userId: performedBy,
          action: 'manual_session_rotation',
          details: {
            targetUserId: userId,
            reason,
            result

          sessionId: request.sessionId,
          severity: 'warning'
        });

        return reply.send(result);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to rotate sessions'
        });


  });

  // Clean up expired grace windows (maintenance endpoint)
  server.post('/auth/session-rotation/cleanup', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_rotation', action: 'cleanup' })
    ],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const cleanedCount = await sessionRotationService.cleanupExpiredGraceWindows();

        return reply.send({
          success: true,
          cleanedCount
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to cleanup grace windows'
        });


  });
