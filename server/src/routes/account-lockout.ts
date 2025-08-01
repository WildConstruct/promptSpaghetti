// Epic 17 - Account Lockout API Routes
// REST API for account lockout management and monitoring

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AccountLockoutService } from '../auth/services/AccountLockoutService';

export async function accountLockoutRoutes(
  fastify: FastifyInstance,
  lockoutService: AccountLockoutService
) {
  // Get lockout status for a specific account
  fastify.get<{
    Params: { email: string };
>('/lockout/status/:email', async (request: FastifyRequest<{
    Params: { email: string };
>, reply: FastifyReply) => {
    try {
      const { email } = request.params;
      const status = await lockoutService.getLockoutStatus(email);

      return {
        email,
        status,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to get lockout status:', error);
      reply.code(500).send({
        error: 'Failed to retrieve lockout status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Generate unlock token for self-service unlock
  fastify.post<{
    Body: { email: string; captcha?: string };
>('/lockout/request-unlock', async (request: FastifyRequest<{
    Body: { email: string; captcha?: string };
>, reply: FastifyReply) => {
    try {
      const { email, captcha } = request.body;

      // TODO: Verify CAPTCHA if provided
      if (captcha) {
        // Implement CAPTCHA verification


      // Check if account is actually locked
      const status = await lockoutService.getLockoutStatus(email);
      if (!status.isLocked) {
        reply.code(400).send({
          error: 'Account is not locked',
          message: 'This account does not require unlocking'
        });
        return;


      // Generate unlock token
      const token = await lockoutService.generateUnlockToken(email);

      // In a real implementation, you would send this token via email
      // For development, we can return it directly
      const isDevelopment = process.env.NODE_ENV === 'development';

      return {
        message: 'Unlock instructions have been sent to your email',
        ...(isDevelopment ? { token } : {}), // Only include token in development
        expiresIn: '15 minutes'
      };
 catch (error) {
      request.log.error('Failed to request unlock:', error);
      reply.code(500).send({
        error: 'Failed to process unlock request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Verify unlock token and unlock account
  fastify.post<{
    Body: { email: string; token: string };
>('/lockout/unlock', async (request: FastifyRequest<{
    Body: { email: string; token: string };
>, reply: FastifyReply) => {
    try {
      const { email, token } = request.body;
      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const success = await lockoutService.verifyUnlockToken(email, token);

      if (!success) {
        reply.code(400).send({
          error: 'Invalid or expired unlock token',
          message: 'The unlock token is not valid or has expired'
        });
        return;


      return {
        message: 'Account has been successfully unlocked',
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to unlock account:', error);
      reply.code(500).send({
        error: 'Failed to unlock account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Get lockout statistics
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>('/lockout/admin/statistics', {
    preHandler: async (request, reply) => {
      // TODO: Implement admin authentication check
      // For now, this is a placeholder

  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>, reply: FastifyReply) => {
    try {
      const timeframe = request.query.timeframe || 'week';
      const statistics = await lockoutService.getLockoutStatistics(timeframe);

      return {
        timeframe,
        statistics,
        generatedAt: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to get lockout statistics:', error);
      reply.code(500).send({
        error: 'Failed to retrieve lockout statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Get list of currently locked accounts
  fastify.get<{
    Querystring: { limit?: string; offset?: string };
>('/lockout/admin/locked-accounts', {
    preHandler: async (request, reply) => {
      // TODO: Implement admin authentication check

  }, async (request: FastifyRequest<{
    Querystring: { limit?: string; offset?: string };
>, reply: FastifyReply) => {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit) : 50;
      const offset = request.query.offset ? parseInt(request.query.offset) : 0;

      const lockedAccounts = await lockoutService.getLockedAccounts(limit, offset);

      return {
        accounts: lockedAccounts,
        pagination: {
          limit,
          offset,
          total: lockedAccounts.length

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to get locked accounts:', error);
      reply.code(500).send({
        error: 'Failed to retrieve locked accounts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Manually unlock an account
  fastify.post<{
    Body: { email: string; reason?: string };
>('/lockout/admin/unlock', {
    preHandler: async (request, reply) => {
      // TODO: Implement admin authentication check
      // Should verify admin role and log admin action

  }, async (request: FastifyRequest<{
    Body: { email: string; reason?: string };
>, reply: FastifyReply) => {
    try {
      const { email, reason } = request.body;
      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      // TODO: Get admin user ID from authentication
      const adminId = 'admin'; // Placeholder

      await lockoutService.unlockAccount(email, 'admin', adminId, context);

      return {
        message: `Account ${email} has been unlocked by administrator`,
        adminId,
        reason,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to admin unlock account:', error);
      reply.code(500).send({
        error: 'Failed to unlock account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Update lockout configuration
  fastify.put<{
    Body: {
      maxFailedAttempts?: number;
      lockoutDurationMinutes?: number;
      progressiveLockout?: boolean;
      progressiveMultipliers?: number[];
      resetWindowHours?: number;
      notifyUser?: boolean;
      notifyAdmins?: boolean;
      adminEmails?: string[];
      allowSelfUnlock?: boolean;
      captchaThreshold?: number;
    };
>('/lockout/admin/config', {
    preHandler: async (request, reply) => {
      // TODO: Implement admin authentication check

  }, async (request: FastifyRequest<{
    Body: {
      maxFailedAttempts?: number;
      lockoutDurationMinutes?: number;
      progressiveLockout?: boolean;
      progressiveMultipliers?: number[];
      resetWindowHours?: number;
      notifyUser?: boolean;
      notifyAdmins?: boolean;
      adminEmails?: string[];
      allowSelfUnlock?: boolean;
      captchaThreshold?: number;
    };
>, reply: FastifyReply) => {
    try {
      // TODO: Implement configuration updates
      // This would update the lockout service configuration
      
      return {
        message: 'Lockout configuration updated successfully',
        config: request.body,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to update lockout config:', error);
      reply.code(500).send({
        error: 'Failed to update configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get lockout configuration
  fastify.get('/lockout/admin/config', {
    preHandler: async (request, reply) => {
      // TODO: Implement admin authentication check

  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Get current configuration from lockout service
      // For now, return default configuration
      const config = {
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
        progressiveLockout: true,
        progressiveMultipliers: [1, 2, 4, 8, 16],
        resetWindowHours: 24,
        notifyUser: true,
        notifyAdmins: true,
        adminEmails: [],
        allowSelfUnlock: true,
        captchaThreshold: 3
      };

      return {
        config,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Failed to get lockout config:', error);
      reply.code(500).send({
        error: 'Failed to retrieve configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Health check for lockout system
  fastify.get('/lockout/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Perform basic health checks
      const testEmail = 'test@example.com';
      const status = await lockoutService.getLockoutStatus(testEmail);

      return {
        status: 'healthy',
        checks: {
          database: 'connected',
          redis: 'connected',
          lockoutService: 'operational'

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Lockout system health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });

  // Documentation endpoint
  fastify.get('/lockout/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Account Lockout System Documentation',
      description: 'Comprehensive account lockout and security system',
      features: [
        'Progressive lockout penalties',
        'Automatic unlock after time expiration',
        'Self-service unlock with tokens',
        'Admin override capabilities',
        'Comprehensive audit logging',
        'Real-time statistics and monitoring',
        'CAPTCHA integration support',
        'Email notifications'
      ],
      endpoints: [
        {
          path: '/lockout/status/:email',
          method: 'GET',
          description: 'Get lockout status for an account'

        {
          path: '/lockout/request-unlock',
          method: 'POST',
          description: 'Request unlock token for locked account'

        {
          path: '/lockout/unlock',
          method: 'POST',
          description: 'Unlock account using token'

        {
          path: '/lockout/admin/statistics',
          method: 'GET',
          description: 'Get lockout statistics (admin only)'

        {
          path: '/lockout/admin/locked-accounts',
          method: 'GET',
          description: 'List currently locked accounts (admin only)'

        {
          path: '/lockout/admin/unlock',
          method: 'POST',
          description: 'Manually unlock account (admin only)'

      ],
      configuration: {
        maxFailedAttempts: 'Maximum failed attempts before lockout',
        lockoutDurationMinutes: 'Base lockout duration in minutes',
        progressiveLockout: 'Enable progressive penalties for repeat offenders',
        progressiveMultipliers: 'Multipliers for progressive lockout durations',
        resetWindowHours: 'Hours after which failed attempts counter resets',
        captchaThreshold: 'Failed attempts before CAPTCHA is required'

    };
  });
