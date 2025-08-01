// Key Management API Routes
// Comprehensive cryptographic key lifecycle management endpoints

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { KeyManagementService, KeyGenerationRequest, KeyOperationContext } from '../services/KeyManagementService';



interface GenerateKeyRequest {
  purpose: 'data_encryption' | 'key_encryption' | 'token_signing' | 'api_signing' | 'session_encryption' | 'backup_encryption' | 'audit_signing';
  algorithm?: string;
  keyLength?: number;
  securityLevel?: 'standard' | 'high' | 'maximum' | 'ultra';
  expiresAt?: string; // ISO date string
  maxUsageCount?: number;
  makePrimary?: boolean;



  complianceTags?: { [key: string]: any };




interface RotateKeyRequest {
  keyId: string;
  reason?: string;







interface DestroyKeyRequest {
  keyId: string;
  reason: string;
  confirmDestruction: boolean;







interface CreateBackupRequest {
  keyId: string;
  backupType: 'full' | 'metadata_only' | 'differential';
  storageLocation?: string;







interface ListKeysQuery {
  purpose?: string;
  isActive?: boolean;
  securityLevel?: string;
  page?: number;
  limit?: number;





export async function keyManagementRoutes(
  fastify: FastifyInstance,
  keyManagementService: KeyManagementService
) {
  
  // Generate new master key
  fastify.post<{
    Body: GenerateKeyRequest;
>('/keys/generate', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: GenerateKeyRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { 
        purpose, algorithm, keyLength, securityLevel, 
        expiresAt, maxUsageCount, makePrimary, complianceTags 
 = request.body;

      // Validate required fields
      if (!purpose) {
        reply.code(400).send({
          error: 'Missing required field: purpose',
          validPurposes: [
            'data_encryption', 'key_encryption', 'token_signing',
            'api_signing', 'session_encryption', 'backup_encryption', 'audit_signing'
          ]
        });
        return;


      // Validate purpose
      const validPurposes = [
        'data_encryption', 'key_encryption', 'token_signing',
        'api_signing', 'session_encryption', 'backup_encryption', 'audit_signing'
      ];
      if (!validPurposes.includes(purpose)) {
        reply.code(400).send({
          error: 'Invalid purpose',
          validPurposes
        });
        return;


      // Validate security level
      if (securityLevel && !['standard', 'high', 'maximum', 'ultra'].includes(securityLevel)) {
        reply.code(400).send({
          error: 'Invalid security level',
          validLevels: ['standard', 'high', 'maximum', 'ultra']
        });
        return;


      // Validate key length
      if (keyLength && ![128, 192, 256, 512].includes(keyLength)) {
        reply.code(400).send({
          error: 'Invalid key length',
          validLengths: [128, 192, 256, 512]
        });
        return;


      const keyRequest: KeyGenerationRequest = {
        purpose,
        algorithm,
        keyLength,
        securityLevel,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        maxUsageCount,
        makePrimary,
        complianceTags
      };

      const masterKey = await keyManagementService.generateMasterKey(keyRequest);

      return {
        success: true,
        key: {
          keyId: masterKey.keyId,
          purpose: masterKey.purpose,
          algorithm: masterKey.algorithm,
          keyLength: masterKey.keyLength,
          securityLevel: masterKey.securityLevel,
          isActive: masterKey.isActive,
          isPrimary: masterKey.isPrimary,
          createdAt: masterKey.createdAt,
          expiresAt: masterKey.expiresAt

        message: 'Master key generated successfully',
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key generation error:', error);
      reply.code(500).send({
        error: 'Failed to generate key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Get key information (without key material)
  fastify.get<{
    Params: { keyId: string };
>('/keys/:keyId', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { keyId } = request.params;

      const context: KeyOperationContext = {
        userId,
        operationType: 'view_metadata',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: (request.user as any)?.sessionId
      };

      const masterKey = await keyManagementService.getMasterKey(keyId, context);

      if (!masterKey) {
        reply.code(404).send({
          error: 'Key not found',
          keyId
        });
        return;


      return {
        key: {
          keyId: masterKey.keyId,
          purpose: masterKey.purpose,
          algorithm: masterKey.algorithm,
          keyLength: masterKey.keyLength,
          keyVersion: masterKey.keyVersion,
          isActive: masterKey.isActive,
          isPrimary: masterKey.isPrimary,
          createdAt: masterKey.createdAt,
          activatedAt: masterKey.activatedAt,
          expiresAt: masterKey.expiresAt,
          rotatedAt: masterKey.rotatedAt,
          usageCount: masterKey.usageCount,
          maxUsageCount: masterKey.maxUsageCount,
          lastUsedAt: masterKey.lastUsedAt,
          securityLevel: masterKey.securityLevel,
          complianceTags: masterKey.complianceTags

        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // List keys with filtering
  fastify.get<{
    Querystring: ListKeysQuery;
>('/keys', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: ListKeysQuery;
>, reply: FastifyReply) => {
    try {
      const { purpose, isActive, securityLevel, page = 1, limit = 50 } = request.query;

      const keys = await keyManagementService.listKeys({
        purpose: purpose as any,
        isActive,
        securityLevel,
        limit,
        offset: (page - 1) * limit
      });

      return {
        keys: keys.map(key => ({
          keyId: key.keyId,
          purpose: key.purpose,
          algorithm: key.algorithm,
          keyLength: key.keyLength,
          keyVersion: key.keyVersion,
          isActive: key.isActive,
          isPrimary: key.isPrimary,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
          usageCount: key.usageCount,
          securityLevel: key.securityLevel
        })),
        pagination: {
          page,
          limit,
          hasMore: keys.length === limit

        filters: { purpose, isActive, securityLevel },
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Keys listing error:', error);
      reply.code(500).send({
        error: 'Failed to list keys',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Rotate key
  fastify.post<{
    Body: RotateKeyRequest;
>('/keys/rotate', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: RotateKeyRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { keyId, reason } = request.body;

      if (!keyId) {
        reply.code(400).send({
          error: 'Missing required field: keyId'
        });
        return;


      const context: KeyOperationContext = {
        userId,
        operationType: 'rotate',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        additionalContext: { reason }
      };

      const newKey = await keyManagementService.rotateKey(keyId, context);

      return {
        success: true,
        rotation: {
          oldKeyId: keyId,
          newKeyId: newKey.keyId,
          reason: reason || 'Manual rotation',
          rotatedAt: new Date().toISOString()

        newKey: {
          keyId: newKey.keyId,
          purpose: newKey.purpose,
          algorithm: newKey.algorithm,
          keyLength: newKey.keyLength,
          securityLevel: newKey.securityLevel,
          isPrimary: newKey.isPrimary,
          createdAt: newKey.createdAt

        message: 'Key rotated successfully',
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key rotation error:', error);
      reply.code(500).send({
        error: 'Failed to rotate key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Destroy key (requires confirmation)
  fastify.post<{
    Body: DestroyKeyRequest;
>('/keys/destroy', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required for key destruction' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: DestroyKeyRequest;
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { keyId, reason, confirmDestruction } = request.body;

      if (!keyId || !reason) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['keyId', 'reason']
        });
        return;


      if (!confirmDestruction) {
        reply.code(400).send({
          error: 'Key destruction must be explicitly confirmed',
          message: 'Set confirmDestruction to true to proceed with key destruction'
        });
        return;


      const context: KeyOperationContext = {
        userId,
        operationType: 'destroy',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        additionalContext: { reason, confirmedDestruction: true }
      };

      const success = await keyManagementService.destroyKey(keyId, context, reason);

      if (success) {
        return {
          success: true,
          keyId,
          reason,
          destroyedAt: new Date().toISOString(),
          destroyedBy: userId,
          message: 'Key destroyed successfully',
          warning: 'This action cannot be undone'
        };
 else {
        reply.code(500).send({
          error: 'Failed to destroy key',
          keyId
        });

 catch (error) {
      request.log.error('Key destruction error:', error);
      reply.code(500).send({
        error: 'Failed to destroy key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Create key backup
  fastify.post<{
    Body: CreateBackupRequest;
>('/keys/backup', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'backup_operator'].includes(role))) {
        reply.code(403).send({ error: 'Backup operator role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Body: CreateBackupRequest;
>, reply: FastifyReply) => {
    try {
      const { keyId, backupType, storageLocation } = request.body;

      if (!keyId || !backupType) {
        reply.code(400).send({
          error: 'Missing required fields',
          required: ['keyId', 'backupType']
        });
        return;


      if (!['full', 'metadata_only', 'differential'].includes(backupType)) {
        reply.code(400).send({
          error: 'Invalid backup type',
          validTypes: ['full', 'metadata_only', 'differential']
        });
        return;


      const backup = await keyManagementService.createKeyBackup(keyId, backupType);

      return {
        success: true,
        backup: {
          backupId: backup.backupId,
          keyId: backup.keyId,
          backupType: backup.backupType,
          createdAt: backup.createdAt,
          expiresAt: backup.expiresAt,
          storageLocation: storageLocation || 'default'

        message: 'Key backup created successfully',
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Key backup error:', error);
      reply.code(500).send({
        error: 'Failed to create key backup',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Check rotation requirements
  fastify.get('/keys/rotation-check', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'key_manager'].includes(role))) {
        reply.code(403).send({ error: 'Key management role required' });
        return;

]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rotationNeeded = await keyManagementService.checkRotationRequirements();

      return {
        rotationRequired: rotationNeeded,
        count: rotationNeeded.length,
        recommendations: [
          'Review keys requiring rotation and plan rotation schedule',
          'Ensure key rotation policies are up to date',
          'Consider automated rotation for non-critical keys',
          'Verify backup and recovery procedures before rotation'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Rotation check error:', error);
      reply.code(500).send({
        error: 'Failed to check rotation requirements',
        message: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // Admin: Key management statistics
  fastify.get<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>('/keys/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;

]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'day' | 'week' | 'month' };
>, reply: FastifyReply) => {
    try {
      const { timeframe = 'week' } = request.query;
      
      const intervals = {
        day: '1 day',
        week: '1 week',
        month: '1 month'
      };

      // Key statistics
      const keyStats = await (keyManagementService as any).db.query(`
        SELECT
          COUNT(*) as total_keys,
          COUNT(*) FILTER (WHERE is_active = true) as active_keys,
          COUNT(*) FILTER (WHERE is_primary = true) as primary_keys,
          COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_keys,
          COUNT(*) FILTER (WHERE destroyed_at IS NOT NULL) as destroyed_keys,
          COUNT(DISTINCT purpose) as unique_purposes,
          AVG(usage_count) as avg_usage_count
        FROM master_keys
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
      `);

      // Purpose distribution
      const purposeStats = await (keyManagementService as any).db.query(`
        SELECT 
          purpose,
          security_level,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE is_active = true) as active_count
        FROM master_keys
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
        GROUP BY purpose, security_level
        ORDER BY count DESC
      `);

      // Access statistics
      const accessStats = await (keyManagementService as any).db.query(`
        SELECT
          access_type,
          access_result,
          COUNT(*) as count
        FROM key_access_log
        WHERE accessed_at >= NOW() - INTERVAL '${intervals[timeframe]}'
        GROUP BY access_type, access_result
        ORDER BY count DESC
      `);

      // Backup statistics
      const backupStats = await (keyManagementService as any).db.query(`
        SELECT
          backup_type,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE verified_at IS NOT NULL) as verified_count
        FROM key_backups
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
        GROUP BY backup_type
      `);

      return {
        timeframe,
        period: intervals[timeframe],
        keys: keyStats.rows[0],
        purposeDistribution: purposeStats.rows,
        accessActivity: accessStats.rows,
        backups: backupStats.rows,
        securityRecommendations: [
          'Regularly review key rotation schedules',
          'Monitor access patterns for anomalies',
          'Ensure backup verification procedures',
          'Audit key access permissions',
          'Review compliance tag accuracy'
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
  fastify.get('/keys/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const activeKeys = await (keyManagementService as any).db.query(`
        SELECT COUNT(*) as count FROM master_keys WHERE is_active = true
      `);

      const recentActivity = await (keyManagementService as any).db.query(`
        SELECT COUNT(*) as count FROM key_access_log WHERE accessed_at >= NOW() - INTERVAL '1 hour'
      `);

      return {
        status: 'healthy',
        service: 'key_management',
        activeKeys: parseInt(activeKeys.rows[0]?.count || '0'),
        recentActivityLastHour: parseInt(recentActivity.rows[0]?.count || '0'),
        supportedAlgorithms: [
          'aes-128-gcm', 'aes-256-gcm', 'chacha20-poly1305',
          'aes-128-cbc', 'aes-256-cbc', 'hmac-sha256'
        ],
        securityLevels: ['standard', 'high', 'maximum', 'ultra'],
        features: [
          'Master key generation and management',
          'Automatic key rotation',
          'Secure key backup and recovery',
          'Fine-grained access control',
          'Comprehensive audit logging',
          'Compliance tracking',
          'Key lifecycle management'
        ],
        timestamp: new Date().toISOString()
      };
 catch (error) {
      request.log.error('Health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'key_management',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });

  // Documentation endpoint
  fastify.get('/keys/docs', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      title: 'Key Management System API Documentation',
      description: 'Comprehensive cryptographic key lifecycle management',
      keyPurposes: [
        'data_encryption - For encrypting user data and sensitive information',
        'key_encryption - For encrypting other keys (Key Encryption Keys)',
        'token_signing - For signing JWT tokens and authentication tokens',
        'api_signing - For signing API requests and responses',
        'session_encryption - For encrypting session data',
        'backup_encryption - For encrypting backup data',
        'audit_signing - For maintaining audit log integrity'
      ],
      securityLevels: [
        { level: 'standard', description: 'Standard security for general use' },
        { level: 'high', description: 'Enhanced security for sensitive data' },
        { level: 'maximum', description: 'Maximum security for critical operations' },
        { level: 'ultra', description: 'Ultra-high security requiring approval' }
      ],
      lifecycle: [
        {
          phase: 'Generation',
          description: 'Create new cryptographic keys with specified properties',
          operations: ['generate', 'activate']

        {
          phase: 'Active Use',
          description: 'Keys are available for cryptographic operations',
          operations: ['encrypt', 'decrypt', 'sign', 'verify']

        {
          phase: 'Rotation',
          description: 'Replace keys based on policies or manual triggers',
          operations: ['rotate', 'overlap', 'deactivate']

        {
          phase: 'Archive/Destroy',
          description: 'Securely retire or destroy keys',
          operations: ['backup', 'destroy', 'audit']

      ],
      endpoints: [
        {
          path: '/keys/generate',
          method: 'POST',
          description: 'Generate new master key',
          auth: 'key_manager role required'

        {
          path: '/keys/:keyId',
          method: 'GET',
          description: 'Get key metadata (no key material)',
          auth: 'authenticated user'

        {
          path: '/keys',
          method: 'GET',
          description: 'List keys with filtering',
          auth: 'authenticated user'

        {
          path: '/keys/rotate',
          method: 'POST',
          description: 'Rotate existing key',
          auth: 'key_manager role required'

        {
          path: '/keys/destroy',
          method: 'POST',
          description: 'Permanently destroy key',
          auth: 'admin role required'

        {
          path: '/keys/backup',
          method: 'POST',
          description: 'Create key backup',
          auth: 'backup_operator role required'

      ],
      compliance: [
        'FIPS 140-2 Level 2 equivalent encryption',
        'PCI DSS key management requirements',
        'HIPAA encryption standards',
        'SOC 2 Type II controls',
        'ISO 27001 key management practices'
      ]
    };
  });
