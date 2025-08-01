// SessionRotationService Unit Tests

import { SessionRotationService, PrivilegeChangeEvent, SessionRotationPolicy } from '../SessionRotationService';
import { DatabaseService } from '../../database/DatabaseService';
import { SessionService } from '../SessionService';
import { AuditService } from '../AuditService';
import { RBACService } from '../RBACService';
import { TokenService } from '../TokenService';
import { AuthConfig } from '../../types';

// Mock dependencies
jest.mock('../../database/DatabaseService');
jest.mock('../SessionService');
jest.mock('../AuditService');
jest.mock('../RBACService');
jest.mock('../TokenService');

describe('SessionRotationService', () => {
  let service: SessionRotationService;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRbacService: jest.Mocked<RBACService>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockConfig: AuthConfig;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockDbService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockSessionService = new SessionService({} as any, {} as any, {} as any, {} as any, {} as any) as jest.Mocked<SessionService>;
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockRbacService = new RBACService({} as any, {} as any, {} as any) as jest.Mocked<RBACService>;
    mockTokenService = new TokenService({} as any, {} as any, {} as any) as jest.Mocked<TokenService>;

    mockConfig = {
      sessionExpiration: 86400,
      refreshTokenExpiration: 604800,
      otpExpiration: 300,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      passwordResetExpiration: 3600,
      totpWindow: 1,
      totpSecretLength: 32,
      domain: 'example.com',
      secure: true,
      sameSite: 'strict',
      httpOnly: true
    };

    // Create service instance
    service = new SessionRotationService(
      mockConfig,
      mockDbService,
      mockSessionService,
      mockAuditService,
      mockRbacService,
      mockTokenService
    );

    // Setup default mock implementations
    mockDbService.query = jest.fn().mockResolvedValue({ rows: [] });
    mockAuditService.logEvent = jest.fn().mockResolvedValue(undefined);
  });

  describe('handlePrivilegeChange', () => {
    const mockUserId = 'user-123';
    const mockSessionId = 'session-123';
    const mockActiveSessions = [
      { id: 'session-1', deviceInfo: {}, location: {}, lastAccessedAt: new Date(), createdAt: new Date() },
      { id: 'session-2', deviceInfo: {}, location: {}, lastAccessedAt: new Date(), createdAt: new Date() }
    ];

    it('should rotate sessions when role is added', async () => {
      const event: PrivilegeChangeEvent = {
        userId: mockUserId,
        changeType: 'role_added',
        oldValue: ['role-1'],
        newValue: ['role-1', 'role-2'],
        reason: 'Admin role granted',
        performedBy: 'admin-user'
      };

      mockSessionService.getUserActiveSessions.mockResolvedValue(mockActiveSessions);
      mockSessionService.revokeSession.mockResolvedValue(undefined);
      mockDbService.query.mockResolvedValue({ rows: [] });

      const result = await service.handlePrivilegeChange(event);

      expect(result.success).toBe(true);
      expect(result.rotatedSessions).toBe(2);
      expect(mockSessionService.revokeSession).toHaveBeenCalledTimes(2);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          action: 'privilege_change',
          details: expect.objectContaining({
            changeType: 'role_added',
            sessionRotationRequired: true

  }
      );
    });

    it('should preserve current session when policy specifies', async () => {
      const event: PrivilegeChangeEvent = {
        userId: mockUserId,
        changeType: 'role_added',
        newValue: ['role-2'],
        performedBy: 'admin-user'
      };

      const customPolicy: Partial<SessionRotationPolicy> = {
        preserveCurrentSession: true
      };

      mockSessionService.getUserActiveSessions.mockResolvedValue([
        ...mockActiveSessions,
        { id: mockSessionId, deviceInfo: {}, location: {}, lastAccessedAt: new Date(), createdAt: new Date() }
      ]);
      mockSessionService.revokeSession.mockResolvedValue(undefined);

      const result = await service.handlePrivilegeChange(event, mockSessionId, customPolicy);

      expect(result.success).toBe(true);
      expect(result.rotatedSessions).toBe(2); // Should not rotate current session
      expect(mockSessionService.revokeSession).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(mockSessionId)
      );
    });

    it('should create grace windows when configured', async () => {
      const event: PrivilegeChangeEvent = {
        userId: mockUserId,
        changeType: 'permission_removed',
        oldValue: ['perm-1', 'perm-2'],
        newValue: ['perm-1'],
        performedBy: 'admin-user'
      };

      const customPolicy: Partial<SessionRotationPolicy> = {
        graceWindowMinutes: 10
      };

      mockSessionService.getUserActiveSessions.mockResolvedValue(mockActiveSessions);
      mockSessionService.revokeSession.mockResolvedValue(undefined);

      const result = await service.handlePrivilegeChange(event, undefined, customPolicy);

      expect(result.success).toBe(true);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO session_grace_windows'),
        expect.arrayContaining([
          expect.any(String), // id
          expect.any(String), // session_id
          expect.any(Date),   // expires_at
          expect.any(Date)    // created_at
        ])
      );
    });

    it('should handle errors gracefully', async () => {
      const event: PrivilegeChangeEvent = {
        userId: mockUserId,
        changeType: 'organization_change',
        oldValue: 'org-1',
        newValue: 'org-2',
        performedBy: 'admin-user'
      };

      mockSessionService.getUserActiveSessions.mockResolvedValue(mockActiveSessions);
      mockSessionService.revokeSession.mockRejectedValueOnce(new Error('Revoke failed'));

      const result = await service.handlePrivilegeChange(event);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to rotate session session-1: Revoke failed');
      expect(result.rotatedSessions).toBe(1); // One succeeded
    });

    it('should skip rotation based on policy', async () => {
      const event: PrivilegeChangeEvent = {
        userId: mockUserId,
        changeType: 'status_change',
        oldValue: 'active',
        newValue: 'suspended',
        performedBy: 'admin-user'
      };

      const customPolicy: Partial<SessionRotationPolicy> = {
        rotateOnStatusChange: false
      };

      const result = await service.handlePrivilegeChange(event, undefined, customPolicy);

      expect(result.success).toBe(true);
      expect(result.rotatedSessions).toBe(0);
      expect(mockSessionService.getUserActiveSessions).not.toHaveBeenCalled();
    });
  });

  describe('isSessionInGracePeriod', () => {
    it('should return true when session has active grace window', async () => {
      const sessionId = 'session-123';
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      mockDbService.query.mockResolvedValue({
        rows: [{ expires_at: futureDate }]
      });

      const result = await service.isSessionInGracePeriod(sessionId);

      expect(result).toBe(true);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT expires_at FROM session_grace_windows'),
        [sessionId]
      );
    });

    it('should return false when no grace window exists', async () => {
      const sessionId = 'session-123';

      mockDbService.query.mockResolvedValue({ rows: [] });

      const result = await service.isSessionInGracePeriod(sessionId);

      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredGraceWindows', () => {
    it('should delete expired grace windows and log the action', async () => {
      const deletedIds = ['grace-1', 'grace-2', 'grace-3'];
      
      mockDbService.query.mockResolvedValue({
        rows: deletedIds.map(id => ({ id }))
      });

      const result = await service.cleanupExpiredGraceWindows();

      expect(result).toBe(3);
      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM session_grace_windows'),
        expect.any(Array)
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        action: 'grace_windows_cleanup',
        details: { cleanedCount: 3 },
        severity: 'info'
      });
    });

    it('should handle no expired windows', async () => {
      mockDbService.query.mockResolvedValue({ rows: [] });

      const result = await service.cleanupExpiredGraceWindows();

      expect(result).toBe(0);
      expect(mockAuditService.logEvent).not.toHaveBeenCalled();
    });
  });

  describe('getRotationHistory', () => {
    it('should retrieve and format rotation history', async () => {
      const userId = 'user-123';
      const mockHistory = [
        {
          id: 'history-1',
          session_id: 'session-1',
          user_id: userId,
          change_type: 'role_added',
          old_value: '["role-1"]',
          new_value: '["role-1","role-2"]',
          reason: 'Admin role granted',
          performed_by: 'admin-user',
          rotated_at: new Date()

      ];

      mockDbService.query.mockResolvedValue({ rows: mockHistory });

      const result = await service.getRotationHistory(userId, 50);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        change_type: 'role_added',
        old_value: ['role-1'],
        new_value: ['role-1', 'role-2']
      });
    });
  });

  describe('getRotationStats', () => {
    it('should calculate rotation statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Mock total rotations
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ count: '42' }] })
        // Mock by change type
        .mockResolvedValueOnce({ 
          rows: [
            { change_type: 'role_added', count: '15' },
            { change_type: 'role_removed', count: '10' },
            { change_type: 'permission_added', count: '17' }
          ]

        // Mock top users
        .mockResolvedValueOnce({
          rows: [
            { user_id: 'user-1', rotation_count: '8' },
            { user_id: 'user-2', rotation_count: '5' }
          ]
        });

      const result = await service.getRotationStats(startDate, endDate);

      expect(result).toEqual({
        totalRotations: 42,
        byChangeType: {
          role_added: 15,
          role_removed: 10,
          permission_added: 17

        topUsers: [
          { userId: 'user-1', rotationCount: 8 },
          { userId: 'user-2', rotationCount: 5 }
        ]
      });
    });
  });

  describe('notification generation', () => {
    it('should generate appropriate notification body', async () => {
      const event: PrivilegeChangeEvent = {
        userId: 'user-123',
        changeType: 'role_added',
        oldValue: ['user'],
        newValue: ['user', 'admin'],
        reason: 'Promoted to administrator',
        performedBy: 'super-admin'
      };

      // Mock user email lookup
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ email: 'user@example.com' }] })
        .mockResolvedValueOnce({ rows: [] }); // For notification insert

      mockSessionService.getUserActiveSessions.mockResolvedValue([
        { id: 'session-1', deviceInfo: {}, location: {}, lastAccessedAt: new Date(), createdAt: new Date() }
      ]);
      mockSessionService.revokeSession.mockResolvedValue(undefined);

      await service.handlePrivilegeChange(event);

      expect(mockDbService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        expect.arrayContaining([
          expect.any(String), // id
          'user-123',         // user_id
          'session_rotation', // type
          'Security: Sessions Rotated Due to Privilege Change',
          expect.stringContaining('New role(s) were added to your account'),
          expect.any(String), // metadata
          expect.any(Date)    // created_at
        ])
      );
    });
  });
});