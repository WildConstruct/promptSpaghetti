// Key Exchange API Routes
// Secure ECDH key exchange protocol endpoints

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { KeyExchangeService } from '../services/KeyExchangeService';



interface InitiateKeyExchangeRequest {
  clientId?: string;
  securityLevel?: 'standard' | 'high' | 'maximum';
  requestedKeys?: Array<{
    purpose: 'encryption' | 'authentication' | 'signing' | 'session' | 'api_access';
    keyLength: number;
    expiryHours?: number;
    maxUsage?: number;



>;




interface CompleteKeyExchangeRequest {
  sessionId: string;
  clientPublicKey: string;
  requestedKeys?: Array<{
    purpose: 'encryption' | 'authentication' | 'signing' | 'session' | 'api_access';
    keyLength: number;
    expiryHours?: number;
    maxUsage?: number;



>;




interface RevokeKeyRequest {
  keyId: string;
  reason: string;





export async function keyExchangeRoutes(
  fastify: FastifyInstance,
  keyExchangeService: KeyExchangeService
) {
  // Initiate key exchange
  fastify.post<{
    Body: InitiateKeyExchangeRequest;
>('/key-exchange/initiate', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: InitiateKeyExchangeRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { clientId, securityLevel, requestedKeys } = request.body;

      // Validate security level
      if (securityLevel && !['standard', 'high', 'maximum'].includes(securityLevel)) {
        reply.code(400).send({ 
          error: 'Invalid security level',
          validLevels: ['standard', 'high', 'maximum']
        });
        return;


      // Validate requested keys
      if (requestedKeys) {
        for (const keyReq of requestedKeys) {
          if (!['encryption', 'authentication', 'signing', 'session', 'api_access'].includes(keyReq.purpose)) {
            reply.code(400).send({
              error: 'Invalid key purpose',
              validPurposes: ['encryption', 'authentication', 'signing', 'session', 'api_access']
            });
            return;

          
          if (![16, 24, 32, 48, 64].includes(keyReq.keyLength)) {
            reply.code(400).send({
              error: 'Invalid key length',
              validLengths: [16, 24, 32, 48, 64]
            });
            return;




      const result = await keyExchangeService.initiateKeyExchange(
        userId,
        clientId,
        securityLevel,
        request.ip,
        request.headers['user-agent']
      );

      return {
        success: true,
        keyExchange: result,
        instructions: {
          step: 1,
          description: 'Generate your ECDH key pair using the specified algorithm',
          nextStep: 'POST /key-exchange/complete with your public key',
          algorithm: result.algorithm,
          securityLevel: result.securityLevel

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key exchange initiation error:', error);
      reply.code(500).send({
        error: 'Failed to initiate key exchange',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Complete key exchange
  fastify.post<{
    Body: CompleteKeyExchangeRequest;
>('/key-exchange/complete', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: CompleteKeyExchangeRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { sessionId, clientPublicKey, requestedKeys = [] } = request.body;

      // Validate inputs
      if (!sessionId || !clientPublicKey) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['sessionId', 'clientPublicKey']
        });
        return;


      // Validate public key format (basic check)
      if (!clientPublicKey.includes('BEGIN PUBLIC KEY') || !clientPublicKey.includes('END PUBLIC KEY')) {
        reply.code(400).send({
          error: 'Invalid public key format',
          expected: 'PEM format with BEGIN/END PUBLIC KEY markers'
        });
        return;


      const result = await keyExchangeService.completeKeyExchange(
        sessionId,
        clientPublicKey,
        requestedKeys
      );

      if (!result.success) {
        reply.code(400).send({
          error: 'Key exchange completion failed',
          sessionId,
          warnings: result.securityWarnings,
          timestamp: new Date().toISOString()
        });
        return;


      return {
        success: true,
        sessionId: result.sessionId,
        derivedKeys: result.derivedKeys,
        securityWarnings: result.securityWarnings,
        instructions: {
          step: 2,
          description: 'Key exchange completed successfully',
          usage: 'Use the derived key IDs to access encrypted data or authentication tokens',
          keyManagement: 'Keys will expire according to their individual schedules'

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key exchange completion error:', error);
      reply.code(500).send({
        error: 'Failed to complete key exchange',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get session status
  fastify.get<{
    Params: { sessionId: string };
>('/key-exchange/session/:sessionId', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { sessionId: string };
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { sessionId } = request.params;
      const session = await keyExchangeService.getSessionStatus(sessionId);

      if (!session) {
        reply.code(404).send({
          error: 'Session not found',
          sessionId
        });
        return;


      // Check if user owns this session
      if (session.userId && session.userId !== userId) {
        reply.code(403).send({
          error: 'Access denied',
          message: 'You can only view your own sessions'
        });
        return;


      return {
        session: {
          sessionId: session.sessionId,
          state: session.state,
          algorithm: session.algorithm,
          securityLevel: session.securityLevel,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          clientId: session.clientId,
          hasClientKey: !!session.clientPublicKey

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Session status error:', error);
      reply.code(500).send({
        error: 'Failed to get session status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // List user's active sessions
  fastify.get('/key-exchange/sessions', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const sessions = await keyExchangeService.getActiveSessions(userId);

      return {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          state: session.state,
          algorithm: session.algorithm,
          securityLevel: session.securityLevel,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          clientId: session.clientId,
          isCompleted: session.state === 'completed'
        })),
        count: sessions.length,
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Sessions list error:', error);
      reply.code(500).send({
        error: 'Failed to list sessions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Revoke derived key
  fastify.post<{
    Body: RevokeKeyRequest;
>('/key-exchange/revoke-key', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: RevokeKeyRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;


      const { keyId, reason } = request.body;

      if (!keyId || !reason) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['keyId', 'reason']
        });
        return;


      const success = await keyExchangeService.revokeDerivedKey(keyId, reason);

      if (!success) {
        reply.code(404).send({
          error: 'Key not found or already revoked',
          keyId
        });
        return;


      return {
        success: true,
        keyId,
        reason,
        revokedAt: new Date().toISOString(),
        message: 'Key revoked successfully'
      };
 catch (error) {
      request.log.error('Key revocation error:', error);
      reply.code(500).send({
        error: 'Failed to revoke key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Get all sessions (with pagination)
  fastify.get<{
    Querystring: { page?: number; limit?: number; state?: string };
>('/key-exchange/admin/sessions', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Querystring: { page?: number; limit?: number; state?: string };
>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 50, state } = request.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          session_id, user_id, client_id, state, algorithm, security_level,
          created_at, expires_at, ip_address, user_agent, failure_reason
        FROM key_exchange_sessions
      `;
      
      const params: any[] = [];
      if (state) {
        query += ' WHERE state = $1';
        params.push(state);

      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const sessions = await (keyExchangeService as any).db.query(query, params);

      // Get total count
      const countQuery = state ? 
        'SELECT COUNT(*) as total FROM key_exchange_sessions WHERE state = $1' :
        'SELECT COUNT(*) as total FROM key_exchange_sessions';
      const countParams = state ? [state] : [];
      const countResult = await (keyExchangeService as any).db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        sessions: sessions.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1

        filters: { state },
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Admin sessions error:', error);
      reply.code(500).send({
        error: 'Failed to get sessions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Key exchange statistics
  fastify.get<{
    Querystring: { timeframe?: 'hour' | 'day' | 'week' | 'month' };
>('/key-exchange/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'hour' | 'day' | 'week' | 'month' };
>, reply: FastifyReply) => {
    try {
      const { timeframe = 'day' } = request.query;
      
      const intervals = {
        hour: '1 hour',
        day: '1 day',
        week: '1 week',
        month: '1 month'
      };

      // Session statistics
      const sessionStats = await (keyExchangeService as any).db.query(`
        SELECT
          COUNT(*) as total_sessions,
          COUNT(*) FILTER (WHERE state = 'completed') as completed_sessions,
          COUNT(*) FILTER (WHERE state = 'failed') as failed_sessions,
          COUNT(*) FILTER (WHERE state = 'expired') as expired_sessions,
          COUNT(*) FILTER (WHERE state IN ('initiated', 'server_ready')) as active_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) FILTER (WHERE state = 'completed') as avg_completion_time_seconds
        FROM key_exchange_sessions
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
      `);

      // Algorithm distribution
      const algorithmStats = await (keyExchangeService as any).db.query(`
        SELECT 
          algorithm,
          security_level,
          COUNT(*) as count
        FROM key_exchange_sessions
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
        GROUP BY algorithm, security_level
        ORDER BY count DESC
      `);

      // Key derivation statistics
      const keyStats = await (keyExchangeService as any).db.query(`
        SELECT
          key_purpose,
          key_length,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE revoked_at IS NOT NULL) as revoked_count
        FROM derived_keys dk
        JOIN key_exchange_sessions kes ON kes.id = dk.session_id
        WHERE kes.created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
        GROUP BY key_purpose, key_length
        ORDER BY count DESC
      `);

      // Security events
      const securityEvents = await (keyExchangeService as any).db.query(`
        SELECT
          event_type,
          COUNT(*) as count
        FROM key_exchange_audit
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
          AND event_type IN ('session_failed', 'security_violation', 'key_revoked')
        GROUP BY event_type
        ORDER BY count DESC
      `);

      return {
        timeframe,
        period: intervals[timeframe],
        sessions: sessionStats.rows[0],
        algorithms: algorithmStats.rows,
        derivedKeys: keyStats.rows,
        securityEvents: securityEvents.rows,
        recommendations: [
          'Monitor failed session rates for potential attacks',
          'Review security events for patterns',
          'Ensure proper key rotation schedules',
          'Validate algorithm choices meet security requirements'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Statistics error:', error);
      reply.code(500).send({
        error: 'Failed to get statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Health check
  fastify.get('/key-exchange/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const recentSessions = await (keyExchangeService as any).db.query(`
        SELECT COUNT(*) as count
        FROM key_exchange_sessions
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `);

      const activeSessions = await (keyExchangeService as any).db.query(`
        SELECT COUNT(*) as count
        FROM key_exchange_sessions
        WHERE state IN ('initiated', 'server_ready', 'completed')
      `);

      return {
        status: 'healthy',
        service: 'key_exchange',
        recentSessionsLastHour: parseInt(recentSessions.rows[0]?.count || '0'),
        activeSessions: parseInt(activeSessions.rows[0]?.count || '0'),
        supportedAlgorithms: ['secp256r1', 'secp384r1', 'secp521r1'],
        securityLevels: ['standard', 'high', 'maximum'],
        features: [
          'ECDH key exchange',
          'HKDF key derivation', 
          'Session management',
          'Key revocation',
          'Audit logging'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'key_exchange',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });

  // Documentation endpoint
  fastify.get('/key-exchange/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Secure Key Exchange API Documentation',
      description: 'ECDH-based secure key exchange protocol for cryptographic key derivation',
      protocol: {
        name: 'Elliptic Curve Diffie-Hellman (ECDH)',
        keyDerivation: 'HKDF (HMAC-based Key Derivation Function)',
        standards: ['RFC 5869', 'NIST SP 800-56A', 'RFC 6090']

      security: {
        algorithms: [
          { name: 'secp256r1', description: 'NIST P-256, 256-bit security (standard)' },
          { name: 'secp384r1', description: 'NIST P-384, 384-bit security (high)' },
          { name: 'secp521r1', description: 'NIST P-521, 521-bit security (maximum)' }
        ],
        levels: [
          { level: 'standard', iterations: 100000, algorithm: 'secp256r1' },
          { level: 'high', iterations: 250000, algorithm: 'secp384r1' },
          { level: 'maximum', iterations: 500000, algorithm: 'secp521r1' }
        ]

      workflow: [
        {
          step: 1,
          endpoint: 'POST /key-exchange/initiate',
          description: 'Client initiates key exchange and receives server public key',
          required: ['authentication']

        {
          step: 2,
          description: 'Client generates ECDH key pair using specified algorithm',
          action: 'client-side cryptography'

        {
          step: 3,
          endpoint: 'POST /key-exchange/complete',
          description: 'Client sends public key and completes key exchange',
          required: ['sessionId', 'clientPublicKey']

        {
          step: 4,
          description: 'Both parties derive shared secret and requested keys',
          result: 'derived key IDs for secure operations'

      ],
      keyPurposes: [
        'encryption - For symmetric data encryption',
        'authentication - For message authentication codes (HMAC)',
        'signing - For digital signature generation',
        'session - For session token generation',
        'api_access - For API access token derivation'
      ],
      endpoints: [
        {
          path: '/key-exchange/initiate',
          method: 'POST',
          description: 'Initiate ECDH key exchange',
          auth: 'required'

        {
          path: '/key-exchange/complete',
          method: 'POST', 
          description: 'Complete key exchange with client public key',
          auth: 'required'

        {
          path: '/key-exchange/session/:sessionId',
          method: 'GET',
          description: 'Get key exchange session status',
          auth: 'required'

        {
          path: '/key-exchange/sessions',
          method: 'GET',
          description: 'List user\'s key exchange sessions',
          auth: 'required'

        {
          path: '/key-exchange/revoke-key',
          method: 'POST',
          description: 'Revoke a derived key',
          auth: 'required'

      ]
    };
  });
