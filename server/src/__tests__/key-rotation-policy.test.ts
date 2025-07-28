// Key Rotation Policy Service Tests
// Comprehensive tests for automated key rotation scheduling and policy management

import { 
  KeyRotationPolicyService,
  KeyRotationPolicyConfig,
  RotationPolicy,
  RotationSchedule,
  PolicyEvaluation
} from '../services/KeyRotationPolicyService';
import { KeyManagementService } from '../services/KeyManagementService';

describe('KeyRotationPolicyService', () => {
  let rotationPolicyService: KeyRotationPolicyService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let mockKeyManagementService: unknown;
  let testConfig: KeyRotationPolicyConfig;

  const testUserId = 'user-123';

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown)
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown as unknown)
    };

    // Mock key management service
    mockKeyManagementService = {
      getMasterKey: jest.fn<unknown[], unknown>(),
      rotateKey: jest.fn<unknown[], unknown>()
    };

    // Test configuration
    testConfig = {
      enableAutomaticRotation: true,
      checkIntervalMinutes: 60,
      rotationWindowHours: 2,
      requireApprovalForCritical: true,
      approvalTimeoutHours: 24,
      notificationDaysBefore: [7, 3, 1],
      escalationDaysBefore: 1,
      maxConcurrentRotations: 3,
      rotationOverlapHours: 2,
      emergencyRotationEnabled: true,
      auditAllRotations: true,
      retainPolicyHistory: true,
      complianceReportingEnabled: true
    };

    rotationPolicyService = new KeyRotationPolicyService(
      mockDb,
      mockRedis,
      mockAuditService,
      mockKeyManagementService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPolicy', () => {
    it('should create policy with interval trigger', async () => {
      const policyData = {
        policyName: 'test_policy',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 30,
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: ['security_admin'],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      };

      const policy = await rotationPolicyService.createPolicy(policyData);

      expect(policy.id).toBeDefined();
      expect(policy.id).toContain('policy_test_policy');
      expect(policy.policyName).toBe('test_policy');
      expect(policy.keyPurpose).toBe('data_encryption');
      expect(policy.rotationIntervalDays).toBe(30);
      expect(policy.autoRotationEnabled).toBe(true);
      expect(policy.requiresApproval).toBe(false);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_rotation_policies'),
        expect.arrayContaining([
          expect.stringContaining('policy_test_policy'),
          'test_policy',
          undefined, // description
          'data_encryption',
          undefined, // security_level
          undefined, // key_pattern
          30, // rotation_interval_days
          undefined, // max_usage_count
          undefined, // rotation_threshold_date
          undefined, // inactivity_days
          undefined, // rotation_schedule
          null, // allowed_rotation_hours
          null, // blackout_dates
          true, // auto_rotation_enabled
          7, // notification_days_before
          2, // overlap_period_hours
          false, // requires_approval
          JSON.stringify(['security_admin']),
          false, // emergency_bypass
          null, // compliance_framework
          undefined, // retention_days
          testUserId,
          true, // is_active
          100 // priority
        ])
      );
    });

    it('should create policy with usage count trigger', async () => {
      const policyData = {
        policyName: 'usage_policy',
        keyPurpose: 'token_signing',
        maxUsageCount: 10000,
        autoRotationEnabled: true,
        notificationDaysBefore: 3,
        overlapPeriodHours: 1,
        requiresApproval: true,
        approvalRoles: ['security_admin', 'key_manager'],
        emergencyBypass: true,
        createdBy: testUserId,
        isActive: true,
        priority: 200
      };

      const policy = await rotationPolicyService.createPolicy(policyData);

      expect(policy.maxUsageCount).toBe(10000);
      expect(policy.requiresApproval).toBe(true);
      expect(policy.emergencyBypass).toBe(true);
      expect(policy.priority).toBe(200);
    });

    it('should create policy with cron schedule', async () => {
      const policyData = {
        policyName: 'scheduled_policy',
        keyPurpose: 'session_encryption',
        rotationSchedule: '0 2 * * 0', // Every Sunday at 2 AM
        allowedRotationHours: [2, 3, 4],
        blackoutDates: [new Date('2024-12-25'), new Date('2024-01-01')],
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 150
      };

      const policy = await rotationPolicyService.createPolicy(policyData);

      expect(policy.rotationSchedule).toBe('0 2 * * 0');
      expect(policy.allowedRotationHours).toEqual([2, 3, 4]);
      expect(policy.blackoutDates).toHaveLength(2);
    });

    it('should validate policy requirements', async () => {
      const invalidPolicy = {
        policyName: '',
        keyPurpose: 'data_encryption',
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      };

      await expect(
        rotationPolicyService.createPolicy(invalidPolicy)
      ).rejects.toThrow('Policy name and key purpose are required');
    });

    it('should validate rotation triggers', async () => {
      const policyWithoutTriggers = {
        policyName: 'invalid_policy',
        keyPurpose: 'data_encryption',
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      };

      await expect(
        rotationPolicyService.createPolicy(policyWithoutTriggers)
      ).rejects.toThrow('At least one rotation trigger must be specified');
    });

    it('should log policy creation', async () => {
      const policyData = {
        policyName: 'audit_policy',
        keyPurpose: 'audit_signing',
        rotationIntervalDays: 90,
        autoRotationEnabled: true,
        notificationDaysBefore: 14,
        overlapPeriodHours: 4,
        requiresApproval: true,
        approvalRoles: ['compliance_officer'],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 300
      };

      await rotationPolicyService.createPolicy(policyData);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_rotation_policy_created',
        details: expect.objectContaining({
          policyName: 'audit_policy',
          keyPurpose: 'audit_signing',
          autoEnabled: true,
          eventType: 'policy_created'
        }),
        severity: 'info'
      });
    });
  });

  describe('evaluateKey', () => {
    const mockKey = {
      keyId: 'test-key-123',
      purpose: 'data_encryption',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      usageCount: 5000,
      lastUsedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      securityLevel: 'standard'
    };

    it('should evaluate key against interval policy', async () => {
      const mockPolicy = {
        id: 'policy-1',
        policyName: 'interval_policy',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 30,
        overlapPeriodHours: 2,
        priority: 100
      };

      mockKeyManagementService.getMasterKey.mockResolvedValue(mockKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: [mockPolicy] } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('test-key-123');

      expect(evaluations).toHaveLength(1);
      expect(evaluations[0].policyId).toBe('policy-1');
      expect(evaluations[0].keyId).toBe('test-key-123');
      expect(evaluations[0].trigger).toBe('rotation_interval_exceeded');
      expect(evaluations[0].urgency).toBe('medium');
      expect(evaluations[0].reasoning).toContain('Key is 35 days old, exceeding 30 day policy');
    });

    it('should evaluate key against usage count policy', async () => {
      const highUsageKey = {
        ...mockKey,
        usageCount: 15000
      };

      const mockPolicy = {
        id: 'policy-2',
        policyName: 'usage_policy',
        keyPurpose: 'data_encryption',
        maxUsageCount: 10000,
        overlapPeriodHours: 1,
        priority: 200
      };

      mockKeyManagementService.getMasterKey.mockResolvedValue(highUsageKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: [mockPolicy] } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('test-key-123');

      expect(evaluations).toHaveLength(1);
      expect(evaluations[0].trigger).toBe('usage_count_exceeded');
      expect(evaluations[0].urgency).toBe('high');
      expect(evaluations[0].recommendedAction).toBe('immediate');
      expect(evaluations[0].reasoning).toContain('Key usage count 15000 exceeds policy limit of 10000');
    });

    it('should evaluate key against threshold date policy', async () => {
      const mockPolicy = {
        id: 'policy-3',
        policyName: 'deadline_policy',
        keyPurpose: 'data_encryption',
        rotationThresholdDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        overlapPeriodHours: 0,
        priority: 300
      };

      mockKeyManagementService.getMasterKey.mockResolvedValue(mockKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: [mockPolicy] } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('test-key-123');

      expect(evaluations).toHaveLength(1);
      expect(evaluations[0].trigger).toBe('threshold_date_reached');
      expect(evaluations[0].urgency).toBe('critical');
      expect(evaluations[0].recommendedAction).toBe('immediate');
    });

    it('should evaluate key against inactivity policy', async () => {
      const inactiveKey = {
        ...mockKey,
        lastUsedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
      };

      const mockPolicy = {
        id: 'policy-4',
        policyName: 'inactivity_policy',
        keyPurpose: 'data_encryption',
        inactivityDays: 90,
        overlapPeriodHours: 2,
        priority: 150
      };

      mockKeyManagementService.getMasterKey.mockResolvedValue(inactiveKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: [mockPolicy] } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('test-key-123');

      expect(evaluations).toHaveLength(1);
      expect(evaluations[0].trigger).toBe('inactivity_threshold');
      expect(evaluations[0].urgency).toBe('medium');
      expect(evaluations[0].reasoning).toContain('Key inactive for 100 days, exceeding 90 day threshold');
    });

    it('should sort evaluations by urgency', async () => {
      const multiTriggerKey = {
        ...mockKey,
        usageCount: 15000, // Exceeds usage limit
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // Exceeds interval
      };

      const mockPolicies = [
        {
          id: 'policy-interval',
          policyName: 'interval_policy',
          keyPurpose: 'data_encryption',
          rotationIntervalDays: 30,
          overlapPeriodHours: 2,
          priority: 100
  }
        {
          id: 'policy-usage',
          policyName: 'usage_policy',
          keyPurpose: 'data_encryption',
          maxUsageCount: 10000,
          overlapPeriodHours: 1,
          priority: 200
        }
      ];

      mockKeyManagementService.getMasterKey.mockResolvedValue(multiTriggerKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: mockPolicies } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('test-key-123');

      expect(evaluations).toHaveLength(2);
      expect(evaluations[0].urgency).toBe('high'); // Usage count (higher priority)
      expect(evaluations[1].urgency).toBe('medium'); // Interval
    });

    it('should return empty array when no rotation needed', async () => {
      const compliantKey = {
        keyId: 'compliant-key',
        purpose: 'data_encryption',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        usageCount: 100,
        lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        securityLevel: 'standard'
      };

      const mockPolicy = {
        id: 'policy-1',
        policyName: 'lenient_policy',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 90, // Key is only 10 days old
        maxUsageCount: 50000, // Key has only 100 uses
        inactivityDays: 30, // Key was used 1 day ago
        overlapPeriodHours: 2,
        priority: 100
      };

      mockKeyManagementService.getMasterKey.mockResolvedValue(compliantKey as unknown as unknown);
      mockDb.query.mockResolvedValue({ rows: [mockPolicy] } as unknown as unknown);

      const evaluations = await rotationPolicyService.evaluateKey('compliant-key');

      expect(evaluations).toEqual([]);
    });

    it('should handle non-existent key', async () => {
      mockKeyManagementService.getMasterKey.mockResolvedValue(null as unknown as unknown);

      await expect(
        rotationPolicyService.evaluateKey('non-existent-key')
      ).rejects.toThrow('Key not found');
    });
  });

  describe('scheduleRotation', () => {
    const mockPolicy = {
      id: 'policy-1',
      policyName: 'test_policy',
      keyPurpose: 'data_encryption',
      rotationIntervalDays: 30,
      requiresApproval: false,
      notificationDaysBefore: 7,
      overlapPeriodHours: 2,
      allowedRotationHours: [2, 3, 4],
      blackoutDates: []
    };

    beforeEach(() => {
      // Mock getPolicy method
      jest.spyOn(rotationPolicyService as any, 'getPolicy')
        .mockResolvedValue(mockPolicy as unknown as unknown);
    });

    it('should schedule rotation without approval', async () => {
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const schedule = await rotationPolicyService.scheduleRotation(
        'test-key-123',
        'policy-1',
        scheduledDate,
        'medium'
      );

      expect(schedule.id).toBeDefined();
      expect(schedule.id).toContain('schedule_');
      expect(schedule.policyId).toBe('policy-1');
      expect(schedule.keyId).toBe('test-key-123');
      expect(schedule.scheduledDate).toEqual(scheduledDate);
      expect(schedule.status).toBe('scheduled');
      expect(schedule.priority).toBe('medium');
      expect(schedule.approvalRequired).toBe(false);
      expect(schedule.rotationWindow).toBeDefined();
      expect(schedule.rotationWindow.startTime).toEqual(scheduledDate);
    });

    it('should schedule rotation with approval required', async () => {
      const approvalPolicy = {
        ...mockPolicy,
        requiresApproval: true
      };

      jest.spyOn(rotationPolicyService as any, 'getPolicy')
        .mockResolvedValue(approvalPolicy as unknown as unknown);

      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const schedule = await rotationPolicyService.scheduleRotation(
        'test-key-123',
        'policy-1',
        scheduledDate,
        'high'
      );

      expect(schedule.status).toBe('pending_approval');
      expect(schedule.approvalRequired).toBe(true);
      expect(schedule.priority).toBe('high');
    });

    it('should calculate rotation window', async () => {
      const scheduledDate = new Date('2024-01-15T10:00:00Z');

      const schedule = await rotationPolicyService.scheduleRotation(
        'test-key-123',
        'policy-1',
        scheduledDate
      );

      expect(schedule.rotationWindow.startTime).toEqual(scheduledDate);
      expect(schedule.rotationWindow.endTime).toEqual(
        new Date(scheduledDate.getTime() + testConfig.rotationWindowHours * 60 * 60 * 1000)
      );
    });

    it('should check for rotation conflicts', async () => {
      // Mock conflict check to return max concurrent rotations
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ count: testConfig.maxConcurrentRotations }] });

      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await expect(
        rotationPolicyService.scheduleRotation('test-key-123', 'policy-1', scheduledDate)
      ).rejects.toThrow('Too many concurrent rotations scheduled for this time window');
    });

    it('should handle non-existent policy', async () => {
      jest.spyOn(rotationPolicyService as any, 'getPolicy')
        .mockResolvedValue(null as unknown as unknown);

      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await expect(
        rotationPolicyService.scheduleRotation('test-key-123', 'non-existent', scheduledDate)
      ).rejects.toThrow('Policy not found');
    });

    it('should log rotation scheduling', async () => {
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await rotationPolicyService.scheduleRotation(
        'test-key-123',
        'policy-1',
        scheduledDate,
        'critical'
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_rotation_rotation_scheduled',
        details: expect.objectContaining({
          policyId: 'policy-1',
          keyId: 'test-key-123',
          priority: 'critical',
          requiresApproval: false,
          eventType: 'rotation_scheduled'
        }),
        severity: 'info'
      });
    });
  });

  describe('executeRotation', () => {
    const mockSchedule = {
      id: 'schedule-123',
      policyId: 'policy-1',
      keyId: 'old-key-123',
      scheduledDate: new Date(),
      status: 'approved' as const,
      rotationWindow: {
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  }
      approvalRequired: false
    };

    beforeEach(() => {
      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(mockSchedule as unknown as unknown);
      jest.spyOn(rotationPolicyService as any, 'canExecuteRotation')
        .mockReturnValue(true as unknown as unknown);
    });

    it('should execute rotation successfully', async () => {
      const newKey = {
        keyId: 'new-key-456',
        purpose: 'data_encryption',
        algorithm: 'aes-256-gcm'
      };

      mockKeyManagementService.rotateKey.mockResolvedValue(newKey as unknown as unknown);

      const result = await rotationPolicyService.executeRotation('schedule-123', testUserId);

      expect(result).toBe(true);
      expect(mockKeyManagementService.rotateKey).toHaveBeenCalledWith(
        'old-key-123',
        expect.objectContaining({
          userId: testUserId,
          operationType: 'rotate',
          sessionId: 'schedule-123',
          additionalContext: {
            scheduled: true,
            policyId: 'policy-1',
            scheduleId: 'schedule-123'
          }
  }
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE rotation_schedules'),
        expect.arrayContaining(['completed', 'old-key-123', 'new-key-456'])
      );
    });

    it('should handle rotation execution failure', async () => {
      mockKeyManagementService.rotateKey.mockRejectedValue(new Error('Rotation failed'));

      const result = await rotationPolicyService.executeRotation('schedule-123', testUserId);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_rotation_rotation_failed',
        details: expect.objectContaining({
          scheduleId: 'schedule-123',
          error: 'Rotation failed',
          eventType: 'rotation_failed'
        }),
        severity: 'error'
      });
    });

    it('should prevent execution outside rotation window', async () => {
      const pastWindowSchedule = {
        ...mockSchedule,
        rotationWindow: {
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          endTime: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      };

      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(pastWindowSchedule as unknown as unknown);
      jest.spyOn(rotationPolicyService as any, 'canExecuteRotation')
        .mockReturnValue(false as unknown as unknown);

      await expect(
        rotationPolicyService.executeRotation('schedule-123', testUserId)
      ).rejects.toThrow('Rotation cannot be executed at this time');
    });

    it('should handle non-existent schedule', async () => {
      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(null as unknown as unknown);

      await expect(
        rotationPolicyService.executeRotation('non-existent', testUserId)
      ).rejects.toThrow('Schedule not found');
    });
  });

  describe('approveRotation', () => {
    const mockSchedule = {
      id: 'schedule-123',
      policyId: 'policy-1',
      keyId: 'test-key-123',
      status: 'pending_approval' as const,
      approvalRequired: true
    };

    beforeEach(() => {
      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(mockSchedule as unknown as unknown);
    });

    it('should approve rotation successfully', async () => {
      const result = await rotationPolicyService.approveRotation(
        'schedule-123',
        'approver-456',
        'Security review completed'
      );

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE rotation_schedules'),
        expect.arrayContaining([
          'approved',
          'approver-456',
          expect.any(Date),
          'Security review completed',
          'schedule-123'
        ])
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_rotation_rotation_approved',
        details: expect.objectContaining({
          scheduleId: 'schedule-123',
          approverId: 'approver-456',
          notes: 'Security review completed',
          eventType: 'rotation_approved'
        }),
        severity: 'info'
      });
    });

    it('should reject approval for schedule not requiring approval', async () => {
      const noApprovalSchedule = {
        ...mockSchedule,
        approvalRequired: false
      };

      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(noApprovalSchedule as unknown as unknown);

      await expect(
        rotationPolicyService.approveRotation('schedule-123', 'approver-456')
      ).rejects.toThrow('Approval not required for this rotation');
    });

    it('should reject approval for non-pending schedule', async () => {
      const approvedSchedule = {
        ...mockSchedule,
        status: 'approved' as const
      };

      jest.spyOn(rotationPolicyService as any, 'getRotationSchedule')
        .mockResolvedValue(approvedSchedule as unknown as unknown);

      await expect(
        rotationPolicyService.approveRotation('schedule-123', 'approver-456')
      ).rejects.toThrow('Rotation is not pending approval');
    });
  });

  describe('getUpcomingRotations', () => {
    it('should return upcoming rotations within timeframe', async () => {
      const mockRotations = [
        {
          id: 'schedule-1',
          policy_id: 'policy-1',
          key_id: 'key-1',
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'scheduled',
          priority: 'medium',
          rotation_window_start: new Date(),
          rotation_window_end: new Date(),
          approval_required: false,
          created_at: new Date(),
          updated_at: new Date()
  }
        {
          id: 'schedule-2',
          policy_id: 'policy-2',
          key_id: 'key-2',
          scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: 'pending_approval',
          priority: 'high',
          rotation_window_start: new Date(),
          rotation_window_end: new Date(),
          approval_required: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockRotations } as unknown as unknown);

      const result = await rotationPolicyService.getUpcomingRotations(7);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('schedule-1');
      expect(result[0].status).toBe('scheduled');
      expect(result[1].id).toBe('schedule-2');
      expect(result[1].status).toBe('pending_approval');
    });

    it('should handle empty results', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown as unknown);

      const result = await rotationPolicyService.getUpcomingRotations(30);

      expect(result).toEqual([]);
    });
  });

  describe('getRotationMetrics', () => {
    it('should calculate rotation metrics for given timeframe', async () => {
      const mockStats = {
        total_rotations: '10',
        successful_rotations: '8',
        failed_rotations: '2',
        avg_rotation_time: '12.5',
        emergency_rotations: '1'
      };

      const mockUpcoming = { upcoming_rotations: '5' };
      const mockOverdue = { overdue_rotations: '2' };

      mockDb.query
        .mockResolvedValueOnce({ rows: [mockStats] })
        .mockResolvedValueOnce({ rows: [mockUpcoming] })
        .mockResolvedValueOnce({ rows: [mockOverdue] });

      const metrics = await rotationPolicyService.getRotationMetrics('week');

      expect(metrics.totalRotations).toBe(10);
      expect(metrics.successfulRotations).toBe(8);
      expect(metrics.failedRotations).toBe(2);
      expect(metrics.averageRotationTime).toBe(12.5);
      expect(metrics.complianceScore).toBe(80); // 8/10 * 100
      expect(metrics.upcomingRotations).toBe(5);
      expect(metrics.overdueRotations).toBe(2);
      expect(metrics.emergencyRotations).toBe(1);
    });

    it('should handle zero rotations', async () => {
      const emptyStats = {
        total_rotations: '0',
        successful_rotations: '0',
        failed_rotations: '0',
        avg_rotation_time: null,
        emergency_rotations: '0'
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [emptyStats] })
        .mockResolvedValueOnce({ rows: [{ upcoming_rotations: '0' }] })
        .mockResolvedValueOnce({ rows: [{ overdue_rotations: '0' }] });

      const metrics = await rotationPolicyService.getRotationMetrics('day');

      expect(metrics.totalRotations).toBe(0);
      expect(metrics.complianceScore).toBe(100); // 100% when no rotations
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        rotationPolicyService.createPolicy({
          policyName: 'test_policy',
          keyPurpose: 'data_encryption',
          rotationIntervalDays: 30,
          autoRotationEnabled: true,
          notificationDaysBefore: 7,
          overlapPeriodHours: 2,
          requiresApproval: false,
          approvalRoles: [],
          emergencyBypass: false,
          createdBy: testUserId,
          isActive: true,
          priority: 100
  }
      ).rejects.toThrow('Failed to create rotation policy');
    });

    it('should handle key management service errors', async () => {
      mockKeyManagementService.getMasterKey.mockRejectedValue(new Error('Key service unavailable'));

      await expect(
        rotationPolicyService.evaluateKey('test-key')
      ).rejects.toThrow('Failed to evaluate key');
    });

    it('should handle audit service failures gracefully', async () => {
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit service down'));

      // Should not throw even if audit fails
      const result = await rotationPolicyService.createPolicy({
        policyName: 'test_policy',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 30,
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      });

      expect(result).toBeDefined();
    });
  });

  describe('security features', () => {
    it('should validate policy names against dangerous patterns', async () => {
      const maliciousPolicy = {
        policyName: '../../etc/passwd',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 30,
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      };

      // Should sanitize policy name in ID generation
      const policy = await rotationPolicyService.createPolicy(maliciousPolicy);
      expect(policy.id).not.toContain('../');
      expect(policy.id).toContain('etc_passwd');
    });

    it('should log all policy operations for audit', async () => {
      await rotationPolicyService.createPolicy({
        policyName: 'audit_test',
        keyPurpose: 'data_encryption',
        rotationIntervalDays: 30,
        autoRotationEnabled: true,
        notificationDaysBefore: 7,
        overlapPeriodHours: 2,
        requiresApproval: false,
        approvalRoles: [],
        emergencyBypass: false,
        createdBy: testUserId,
        isActive: true,
        priority: 100
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'key_rotation_policy_created',
          severity: 'info'
  }
      );
    });

    it('should prevent concurrent rotation conflicts', async () => {
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      jest.spyOn(rotationPolicyService as any, 'getPolicy')
        .mockResolvedValue({
          id: 'policy-1',
          requiresApproval: false,
          overlapPeriodHours: 2
        } as unknown as unknown);

      // Mock too many concurrent rotations
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: testConfig.maxConcurrentRotations }]
      });

      await expect(
        rotationPolicyService.scheduleRotation('test-key', 'policy-1', scheduledDate)
      ).rejects.toThrow('Too many concurrent rotations scheduled for this time window');
    });
  });
});