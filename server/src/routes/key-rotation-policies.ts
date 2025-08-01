// Key Rotation Policy API Routes
// Comprehensive rotation scheduling, approval workflows, and compliance management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { KeyRotationPolicyService } from '../services/KeyRotationPolicyService';



interface CreatePolicyRequest {
  policyName: string;
  description?: string;
  keyPurpose: string;
  securityLevel?: string;
  keyPattern?: string;
  
  // Rotation triggers
  rotationIntervalDays?: number;
  maxUsageCount?: number;
  rotationThresholdDate?: string; // ISO date
  inactivityDays?: number;
  
  // Schedule
  rotationSchedule?: string; // Cron expression
  allowedRotationHours?: number[];
  blackoutDates?: string[]; // ISO dates
  
  // Behavior
  autoRotationEnabled: boolean;
  notificationDaysBefore: number;
  overlapPeriodHours: number;
  
  // Approval
  requiresApproval: boolean;
  approvalRoles: string[];
  emergencyBypass?: boolean;
  
  // Compliance
  complianceFramework?: string[];
  retentionDays?: number;
  priority?: number;







interface ScheduleRotationRequest {
  keyId: string;
  policyId: string;
  scheduledDate: string; // ISO date
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  reason?: string;







interface ApproveRotationRequest {
  scheduleId: string;
  notes?: string;







interface ExecuteRotationRequest {
  scheduleId: string;
  force?: boolean;





export async function keyRotationPolicyRoutes(
  fastify: FastifyInstance,
  rotationPolicyService: KeyRotationPolicyService
) {

  // Create rotation policy
  fastify.post<{
    Body: CreatePolicyRequest;
>('/rotation-policies', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: CreatePolicyRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const {
        policyName,
        description,
        keyPurpose,
        securityLevel,
        keyPattern,
        rotationIntervalDays,
        maxUsageCount,
        rotationThresholdDate,
        inactivityDays,
        rotationSchedule,
        allowedRotationHours,
        blackoutDates,
        autoRotationEnabled,
        notificationDaysBefore,
        overlapPeriodHours,
        requiresApproval,
        approvalRoles,
        emergencyBypass,
        complianceFramework,
        retentionDays,
        priority
 = request.body;

      // Validate required fields
      if (!policyName || !keyPurpose) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['policyName', 'keyPurpose']
        });
        return;


      // Validate at least one rotation trigger
      if (!rotationIntervalDays && !maxUsageCount && !rotationThresholdDate) {
        reply.code(400).send({
          error: 'At least one rotation trigger must be specified',
          triggers: ['rotationIntervalDays', 'maxUsageCount', 'rotationThresholdDate']
        });
        return;


      // Validate cron expression if provided
      if (rotationSchedule) {
        // Simple validation - would use cron-parser in production
        if (!rotationSchedule.match(/^(\*|[0-5]?\d)\s+(\*|[01]?\d|2[0-3])\s+(\*|[0-2]?\d|3[01])\s+(\*|[0]?\d|1[0-2])\s+(\*|[0-6])$/)) {
          reply.code(400).send({
            error: 'Invalid cron expression',
            example: '0 2 * * 0 (every Sunday at 2 AM)'
          });
          return;



      const policy = await rotationPolicyService.createPolicy({
        policyName,
        description,
        keyPurpose,
        securityLevel,
        keyPattern,
        rotationIntervalDays,
        maxUsageCount,
        rotationThresholdDate: rotationThresholdDate ? new Date(rotationThresholdDate) : undefined,
        inactivityDays,
        rotationSchedule,
        allowedRotationHours,
        blackoutDates: blackoutDates?.map(d => new Date(d)),
        autoRotationEnabled,
        notificationDaysBefore,
        overlapPeriodHours,
        requiresApproval,
        approvalRoles,
        emergencyBypass: emergencyBypass || false,
        complianceFramework,
        retentionDays,
        priority: priority || 100,
        createdBy: userId,
        isActive: true
      });

      return {
        success: true,
        policy: {
          id: policy.id,
          policyName: policy.policyName,
          description: policy.description,
          keyPurpose: policy.keyPurpose,
          securityLevel: policy.securityLevel,
          autoRotationEnabled: policy.autoRotationEnabled,
          requiresApproval: policy.requiresApproval,
          priority: policy.priority,
          createdAt: policy.createdAt

        message: 'Rotation policy created successfully',
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Policy creation error:', error);
      reply.code(500).send({
        error: 'Failed to create rotation policy',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Evaluate key against policies
  fastify.post<{
    Body: { keyId: string };
>('/rotation-policies/evaluate', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: { keyId: string };
>, reply: FastifyReply) => {
    try {
      const { keyId } = request.body;

      if (!keyId) {
        reply.code(400).send({
          error: 'Missing required field: keyId'
        });
        return;


      const evaluations = await rotationPolicyService.evaluateKey(keyId);

      return {
        keyId,
        evaluations,
        totalPolicies: evaluations.length,
        highPriorityCount: evaluations.filter(e => e.urgency === 'high' || e.urgency === 'critical').length,
        recommendations: evaluations.length > 0 ? [
          'Review rotation requirements and schedule accordingly',
          'Consider immediate rotation for critical urgency items',
          'Ensure proper approval workflows are followed'
        ] : ['Key is compliant with all rotation policies'],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key evaluation error:', error);
      reply.code(500).send({
        error: 'Failed to evaluate key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Schedule rotation
  fastify.post<{
    Body: ScheduleRotationRequest;
>('/rotation-policies/schedule', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: ScheduleRotationRequest;
>, reply: FastifyReply) => {
    try {
      const { keyId, policyId, scheduledDate, priority, reason } = request.body;

      // Validate required fields
      if (!keyId || !policyId || !scheduledDate) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['keyId', 'policyId', 'scheduledDate']
        });
        return;


      // Validate date
      const scheduleDate = new Date(scheduledDate);
      if (isNaN(scheduleDate.getTime())) {
        reply.code(400).send({
          error: 'Invalid scheduled date format',
          example: '2024-12-31T10:00:00Z'
        });
        return;


      // Check if date is in the future
      if (scheduleDate <= new Date()) {
        reply.code(400).send({
          error: 'Scheduled date must be in the future'
        });
        return;


      const schedule = await rotationPolicyService.scheduleRotation(
        keyId,
        policyId,
        scheduleDate,
        priority || 'medium'
      );

      return {
        success: true,
        schedule: {
          id: schedule.id,
          keyId: schedule.keyId,
          policyId: schedule.policyId,
          scheduledDate: schedule.scheduledDate,
          status: schedule.status,
          priority: schedule.priority,
          rotationWindow: schedule.rotationWindow,
          approvalRequired: schedule.approvalRequired

        message: 'Rotation scheduled successfully',
        nextSteps: schedule.approvalRequired ? 
          ['Rotation requires approval before execution'] : 
          ['Rotation will execute automatically at scheduled time'],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Rotation scheduling error:', error);
      reply.code(500).send({
        error: 'Failed to schedule rotation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Approve rotation
  fastify.post<{
    Body: ApproveRotationRequest;
>('/rotation-policies/approve', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'security_admin'].includes(role))) {
        reply.code(403).send({ error: 'Security admin role required for approvals' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: ApproveRotationRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { scheduleId, notes } = request.body;

      if (!scheduleId) {
        reply.code(400).send({
          error: 'Missing required field: scheduleId'
        });
        return;


      const success = await rotationPolicyService.approveRotation(scheduleId, userId, notes);

      if (success) {
        return {
          success: true,
          scheduleId,
          approvedBy: userId,
          approvedAt: new Date().toISOString(),
          notes,
          message: 'Rotation approved successfully',
          nextSteps: ['Rotation will execute at scheduled time']
        };
 else {
        reply.code(400).send({
          error: 'Failed to approve rotation',
          scheduleId
        });

 catch (error) {
      request.log.error('Rotation approval error:', error);
      reply.code(500).send({
        error: 'Failed to approve rotation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Execute rotation
  fastify.post<{
    Body: ExecuteRotationRequest;
>('/rotation-policies/execute', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: ExecuteRotationRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { scheduleId, force } = request.body;

      if (!scheduleId) {
        reply.code(400).send({
          error: 'Missing required field: scheduleId'
        });
        return;


      const success = await rotationPolicyService.executeRotation(scheduleId, userId);

      if (success) {
        return {
          success: true,
          scheduleId,
          executedBy: userId,
          executedAt: new Date().toISOString(),
          message: 'Rotation executed successfully'
        };
 else {
        reply.code(400).send({
          error: 'Failed to execute rotation',
          scheduleId,
          message: 'Check rotation logs for details'
        });

 catch (error) {
      request.log.error('Rotation execution error:', error);
      reply.code(500).send({
        error: 'Failed to execute rotation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get upcoming rotations
  fastify.get<{
    Querystring: { days?: number; status?: string };
>('/rotation-policies/upcoming', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { days?: number; status?: string };
>, reply: FastifyReply) => {
    try {
      const { days = 30, status } = request.query;

      const upcomingRotations = await rotationPolicyService.getUpcomingRotations(days);

      // Filter by status if provided
      const filteredRotations = status ? 
        upcomingRotations.filter(r => r.status === status) :
        upcomingRotations;

      return {
        rotations: filteredRotations.map(rotation => ({
          id: rotation.id,
          keyId: rotation.keyId,
          policyId: rotation.policyId,
          scheduledDate: rotation.scheduledDate,
          status: rotation.status,
          priority: rotation.priority,
          approvalRequired: rotation.approvalRequired,
          rotationWindow: rotation.rotationWindow
        })),
        totalCount: filteredRotations.length,
        timeframe: `${days} days`,
        statusFilter: status,
        summary: {
          scheduled: filteredRotations.filter(r => r.status === 'scheduled').length,
          pendingApproval: filteredRotations.filter(r => r.status === 'pending_approval').length,
          approved: filteredRotations.filter(r => r.status === 'approved').length,
          highPriority: filteredRotations.filter(r => r.priority === 'high' || r.priority === 'critical').length

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Upcoming rotations error:', error);
      reply.code(500).send({
        error: 'Failed to get upcoming rotations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get rotation metrics
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>('/rotation-policies/metrics', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;

      const metrics = await rotationPolicyService.getRotationMetrics(timeframe);

      return {
        timeframe,
        metrics,
        insights: {
          successRate: metrics.totalRotations > 0 ? 
            Math.round((metrics.successfulRotations / metrics.totalRotations) * 100) : 100,
          averageRotationTimeFormatted: `${Math.round(metrics.averageRotationTime)} minutes`,
          complianceStatus: metrics.complianceScore >= 95 ? 'excellent' : 
            metrics.complianceScore >= 90 ? 'good' : 
              metrics.complianceScore >= 80 ? 'fair' : 'poor',
          actionRequired: metrics.overdueRotations > 0 || metrics.emergencyRotations > 0

        recommendations: [
          metrics.overdueRotations > 0 ? 'Address overdue rotations immediately' : null,
          metrics.complianceScore < 90 ? 'Review and improve rotation processes' : null,
          metrics.averageRotationTime > 30 ? 'Optimize rotation procedures for better performance' : null,
          'Regularly review rotation policies for effectiveness'
        ].filter(Boolean),
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Rotation metrics error:', error);
      reply.code(500).send({
        error: 'Failed to get rotation metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Get rotation readiness
  fastify.get('/rotation-policies/admin/readiness', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const readinessData = await (rotationPolicyService as any).db.query(`
        SELECT * FROM get_rotation_readiness()
      `);

      const rotations = readinessData.rows;

      return {
        rotations: rotations.map((r: any) => ({
          scheduleId: r.schedule_id,
          keyId: r.key_id,
          scheduledDate: r.scheduled_date,
          status: r.status,
          readyToExecute: r.ready_to_execute,
          blockingReason: r.blocking_reason
        })),
        summary: {
          totalRotations: rotations.length,
          readyToExecute: rotations.filter((r: any) => r.ready_to_execute).length,
          blockedRotations: rotations.filter((r: any) => !r.ready_to_execute).length,
          pendingApproval: rotations.filter((r: any) => r.blocking_reason?.includes('approval')).length

        recommendations: [
          'Review blocked rotations and resolve issues',
          'Ensure approvers are available for pending rotations',
          'Monitor rotation windows for optimal execution timing'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Rotation readiness error:', error);
      reply.code(500).send({
        error: 'Failed to get rotation readiness',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Health check
  fastify.get('/rotation-policies/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const activePolicies = await (rotationPolicyService as any).db.query(`
        SELECT COUNT(*) as count FROM key_rotation_policies WHERE is_active = true
      `);

      const upcomingRotations = await (rotationPolicyService as any).db.query(`
        SELECT COUNT(*) as count FROM rotation_schedules 
        WHERE scheduled_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
          AND status IN ('scheduled', 'approved')
      `);

      return {
        status: 'healthy',
        service: 'key_rotation_policies',
        activePolicies: parseInt(activePolicies.rows[0]?.count || '0'),
        upcomingRotationsNextWeek: parseInt(upcomingRotations.rows[0]?.count || '0'),
        features: [
          'Automated rotation scheduling',
          'Policy-based rotation triggers',
          'Approval workflow management',
          'Compliance tracking and reporting',
          'Rotation execution monitoring',
          'Emergency rotation capabilities'
        ],
        supportedTriggers: [
          'Time interval (days)',
          'Usage count threshold',
          'Specific threshold dates',
          'Inactivity periods',
          'Cron-based scheduling'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'key_rotation_policies',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });

  // Documentation endpoint
  fastify.get('/rotation-policies/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Key Rotation Policy System API Documentation',
      description: 'Comprehensive automated key rotation scheduling and compliance management',
      policyTriggers: [
        {
          trigger: 'rotationIntervalDays',
          description: 'Rotate key every N days from creation/last rotation',
          example: 'rotationIntervalDays: 30'

        {
          trigger: 'maxUsageCount',
          description: 'Rotate key after N cryptographic operations',
          example: 'maxUsageCount: 10000'

        {
          trigger: 'rotationThresholdDate',
          description: 'Rotate key by specific date',
          example: 'rotationThresholdDate: "2024-12-31T23:59:59Z"'

        {
          trigger: 'inactivityDays',
          description: 'Rotate key if inactive for N days',
          example: 'inactivityDays: 90'

      ],
      approvalWorkflow: [
        {
          step: 1,
          description: 'Policy evaluation identifies rotation requirement',
          automatic: true

        {
          step: 2,
          description: 'Rotation scheduled with approval if required',
          userAction: 'Schedule via API or automatic trigger'

        {
          step: 3,
          description: 'Approval request sent to designated roles',
          automatic: true,
          condition: 'If requiresApproval: true'

        {
          step: 4,
          description: 'Security admin approves rotation',
          userAction: 'POST /rotation-policies/approve'

        {
          step: 5,
          description: 'Rotation executes during scheduled window',
          automatic: true

      ],
      complianceFeatures: [
        'Automated compliance score calculation',
        'Policy violation tracking and reporting',
        'Audit trail for all rotation activities',
        'Retention period management',
        'Regulatory framework tagging (PCI, HIPAA, SOX)',
        'Executive reporting dashboards'
      ],
      endpoints: [
        {
          path: '/rotation-policies',
          method: 'POST',
          description: 'Create new rotation policy',
          auth: 'key_manager role required'

        {
          path: '/rotation-policies/evaluate',
          method: 'POST',
          description: 'Evaluate key against rotation policies',
          auth: 'authenticated user'

        {
          path: '/rotation-policies/schedule',
          method: 'POST',
          description: 'Schedule key rotation',
          auth: 'key_manager role required'

        {
          path: '/rotation-policies/approve',
          method: 'POST',
          description: 'Approve pending rotation',
          auth: 'security_admin role required'

        {
          path: '/rotation-policies/execute',
          method: 'POST',
          description: 'Execute scheduled rotation',
          auth: 'key_manager role required'

        {
          path: '/rotation-policies/upcoming',
          method: 'GET',
          description: 'Get upcoming rotations',
          auth: 'authenticated user'

        {
          path: '/rotation-policies/metrics',
          method: 'GET',
          description: 'Get rotation performance metrics',
          auth: 'authenticated user'

      ]
    };
  });
